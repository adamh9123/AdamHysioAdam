'use client';

import { useScribeStore } from '@/lib/state/scribe-store';
import { StepValidator } from './step-validation';
import type { WorkflowType, PatientInfo } from '@/types/api';

export interface WorkflowInterruption {
  workflowType: WorkflowType;
  currentStep: string;
  lastActiveStep: string;
  interruptedAt: string;
  partialData: Record<string, any>;
  sessionId: string;
  patientId?: string;
  interruptionReason: 'navigation' | 'browser_close' | 'connection_loss' | 'timeout' | 'unknown';
}

export interface ResumptionOptions {
  validateSteps: boolean;
  clearIncompleteData: boolean;
  resumeFromLastValid: boolean;
  preservePartialInput: boolean;
  skipValidationWarnings: boolean;
}

export interface ResumptionResult {
  canResume: boolean;
  recommendedStep: string;
  availableSteps: string[];
  dataIntegrity: 'complete' | 'partial' | 'corrupted';
  requiredActions: string[];
  warnings: string[];
  partialDataRecovered: Record<string, any>;
}

const DEFAULT_RESUMPTION_OPTIONS: ResumptionOptions = {
  validateSteps: true,
  clearIncompleteData: false,
  resumeFromLastValid: true,
  preservePartialInput: true,
  skipValidationWarnings: false
};

export class WorkflowResumption {
  private static readonly STORAGE_KEY = 'hysio-workflow-interruption';
  private static readonly SESSION_TIMEOUT_MS = 4 * 60 * 60 * 1000; // 4 hours

  /**
   * Detect and save workflow interruption
   */
  static saveInterruption(
    workflowType: WorkflowType,
    currentStep: string,
    reason: WorkflowInterruption['interruptionReason'] = 'unknown'
  ): void {
    const store = useScribeStore.getState();
    const { patientInfo, workflowData } = store;

    const interruption: WorkflowInterruption = {
      workflowType,
      currentStep,
      lastActiveStep: this.findLastActiveStep(workflowType),
      interruptedAt: new Date().toISOString(),
      partialData: this.capturePartialData(workflowData),
      sessionId: this.generateSessionId(),
      patientId: patientInfo?.patientId || patientInfo?.initials || undefined,
      interruptionReason: reason
    };

    // Save to localStorage for persistence across browser sessions
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(interruption));
      console.log('Workflow interruption saved:', {
        workflow: workflowType,
        step: currentStep,
        reason,
        timestamp: interruption.interruptedAt
      });
    } catch (error) {
      console.error('Failed to save workflow interruption:', error);
    }
  }

  /**
   * Check if there's an interrupted workflow that can be resumed
   */
  static checkForInterruption(): WorkflowInterruption | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const interruption: WorkflowInterruption = JSON.parse(stored);

      // Check if interruption is still valid (not expired)
      const interruptedAt = new Date(interruption.interruptedAt);
      const now = new Date();
      const timeSinceInterruption = now.getTime() - interruptedAt.getTime();

      if (timeSinceInterruption > this.SESSION_TIMEOUT_MS) {
        this.clearInterruption();
        return null;
      }

      return interruption;
    } catch (error) {
      console.error('Failed to check for workflow interruption:', error);
      this.clearInterruption();
      return null;
    }
  }

  /**
   * Analyze interrupted workflow and determine resumption strategy
   */
  static analyzeResumption(
    interruption: WorkflowInterruption,
    options: Partial<ResumptionOptions> = {}
  ): ResumptionResult {
    const opts = { ...DEFAULT_RESUMPTION_OPTIONS, ...options };
    const store = useScribeStore.getState();

    const result: ResumptionResult = {
      canResume: false,
      recommendedStep: interruption.currentStep,
      availableSteps: [],
      dataIntegrity: 'corrupted',
      requiredActions: [],
      warnings: [],
      partialDataRecovered: {}
    };

    // Validate current state against interruption data
    const currentData = this.capturePartialData(store.workflowData);
    const dataComparison = this.compareWorkflowData(
      interruption.partialData,
      currentData
    );

    // Determine data integrity
    if (dataComparison.isIdentical) {
      result.dataIntegrity = 'complete';
    } else if (dataComparison.hasPartialMatch) {
      result.dataIntegrity = 'partial';
      result.warnings.push('Sommige data is gewijzigd sinds de onderbreking');
    } else {
      result.dataIntegrity = 'corrupted';
      result.warnings.push('Workflow data komt niet overeen met onderbroken sessie');
    }

    // Determine available steps based on workflow progress
    const workflowSteps = this.getWorkflowSteps(interruption.workflowType);
    const completedSteps = store.workflowData.completedSteps;

    result.availableSteps = workflowSteps.filter(step => {
      const dependencies = store.validateStepDependencies(step);
      return dependencies.isValid;
    });

    // Validate each step if requested
    if (opts.validateSteps && store.patientInfo) {
      for (const step of workflowSteps) {
        const stepData = store.getStepData(step);
        if (stepData) {
          const validation = StepValidator.validateStep(step, stepData, store.patientInfo);
          if (!validation.isValid) {
            result.warnings.push(`Stap '${step}' heeft validatiefouten: ${validation.errors.join(', ')}`);
          }
        }
      }
    }

    // Determine recommended resumption step
    if (opts.resumeFromLastValid) {
      // Find the last completed valid step
      const lastValidStep = this.findLastValidStep(interruption.workflowType, completedSteps);
      if (lastValidStep) {
        const nextStep = this.getNextStep(interruption.workflowType, lastValidStep);
        result.recommendedStep = nextStep || lastValidStep;
      }
    }

    // Check if resumption is possible
    result.canResume = result.availableSteps.length > 0 && (
      result.dataIntegrity === 'complete' ||
      result.dataIntegrity === 'partial'
    );

    // Generate required actions
    if (!result.canResume) {
      if (result.dataIntegrity === 'corrupted') {
        result.requiredActions.push('Herstart de workflow vanuit het begin');
      }
      if (result.availableSteps.length === 0) {
        result.requiredActions.push('Controleer patiëntgegevens en vorige stappen');
      }
    } else {
      if (result.dataIntegrity === 'partial') {
        result.requiredActions.push('Controleer en bevestig gedeeltelijke data');
      }
      result.requiredActions.push(`Ga door met stap: ${result.recommendedStep}`);
    }

    // Recover partial data
    if (opts.preservePartialInput) {
      result.partialDataRecovered = this.mergePartialData(
        interruption.partialData,
        currentData,
        dataComparison
      );
    }

    return result;
  }

  /**
   * Execute workflow resumption
   */
  static async executeResumption(
    interruption: WorkflowInterruption,
    resumptionResult: ResumptionResult,
    options: Partial<ResumptionOptions> = {}
  ): Promise<boolean> {
    const opts = { ...DEFAULT_RESUMPTION_OPTIONS, ...options };
    const store = useScribeStore.getState();

    if (!resumptionResult.canResume) {
      console.warn('Cannot resume workflow:', resumptionResult.requiredActions);
      return false;
    }

    try {
      // Restore partial data if available
      if (opts.preservePartialInput && Object.keys(resumptionResult.partialDataRecovered).length > 0) {
        await this.restorePartialData(resumptionResult.partialDataRecovered);
      }

      // Clear incomplete data if requested
      if (opts.clearIncompleteData) {
        const incompleteSteps = this.findIncompleteSteps(
          interruption.workflowType,
          store.workflowData.completedSteps
        );

        for (const step of incompleteSteps) {
          store.clearStepData(step);
        }
      }

      // Set current workflow
      store.setCurrentWorkflow(interruption.workflowType);

      console.log('Workflow resumption executed successfully:', {
        workflow: interruption.workflowType,
        resumedStep: resumptionResult.recommendedStep,
        recoveredData: Object.keys(resumptionResult.partialDataRecovered).length > 0
      });

      return true;
    } catch (error) {
      console.error('Failed to execute workflow resumption:', error);
      return false;
    }
  }

  /**
   * Clear stored interruption
   */
  static clearInterruption(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear workflow interruption:', error);
    }
  }

  /**
   * Get workflow resumption summary for UI display
   */
  static getResumptionSummary(interruption: WorkflowInterruption): {
    title: string;
    description: string;
    timeAgo: string;
    riskLevel: 'low' | 'medium' | 'high';
  } {
    const interruptedAt = new Date(interruption.interruptedAt);
    const now = new Date();
    const timeAgo = this.formatTimeAgo(now.getTime() - interruptedAt.getTime());

    const workflowTitles = {
      'intake-stapsgewijs': 'Stapsgewijze Intake',
      'intake-automatisch': 'Automatische Intake',
      'consult': 'Vervolgconsult'
    };

    const riskLevel = this.calculateRiskLevel(interruption);

    return {
      title: `${workflowTitles[interruption.workflowType]} onderbroken`,
      description: `Workflow werd onderbroken bij stap '${interruption.currentStep}' vanwege ${this.translateInterruptionReason(interruption.interruptionReason)}`,
      timeAgo,
      riskLevel
    };
  }

  // Private helper methods

  private static findLastActiveStep(workflowType: WorkflowType): string {
    const store = useScribeStore.getState();
    const workflowSteps = this.getWorkflowSteps(workflowType);
    const completedSteps = store.workflowData.completedSteps;

    for (let i = workflowSteps.length - 1; i >= 0; i--) {
      if (completedSteps.includes(workflowSteps[i])) {
        return workflowSteps[i];
      }
    }

    return workflowSteps[0] || 'unknown';
  }

  private static capturePartialData(workflowData: any): Record<string, any> {
    return {
      anamneseData: workflowData.anamneseData,
      onderzoekData: workflowData.onderzoekData,
      klinischeConclusieData: workflowData.klinischeConclusieData,
      automatedIntakeData: workflowData.automatedIntakeData,
      consultData: workflowData.consultData,
      completedSteps: workflowData.completedSteps,
      timestamp: new Date().toISOString()
    };
  }

  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static compareWorkflowData(
    interruptedData: Record<string, any>,
    currentData: Record<string, any>
  ): { isIdentical: boolean; hasPartialMatch: boolean; differences: string[] } {
    const differences: string[] = [];
    let hasPartialMatch = false;

    // Compare each data section
    const sections = ['anamneseData', 'onderzoekData', 'klinischeConclusieData', 'automatedIntakeData', 'consultData'];

    for (const section of sections) {
      const interruptedSection = interruptedData[section];
      const currentSection = currentData[section];

      if (interruptedSection && currentSection) {
        if (JSON.stringify(interruptedSection) !== JSON.stringify(currentSection)) {
          differences.push(section);
        } else {
          hasPartialMatch = true;
        }
      } else if (interruptedSection && !currentSection) {
        differences.push(`${section} (missing in current)`);
      } else if (!interruptedSection && currentSection) {
        differences.push(`${section} (added in current)`);
      }
    }

    // Compare completed steps
    const interruptedSteps = interruptedData.completedSteps || [];
    const currentSteps = currentData.completedSteps || [];

    if (JSON.stringify(interruptedSteps.sort()) !== JSON.stringify(currentSteps.sort())) {
      differences.push('completedSteps');
    }

    return {
      isIdentical: differences.length === 0,
      hasPartialMatch,
      differences
    };
  }

  private static mergePartialData(
    interruptedData: Record<string, any>,
    currentData: Record<string, any>,
    comparison: { isIdentical: boolean; hasPartialMatch: boolean; differences: string[] }
  ): Record<string, any> {
    if (comparison.isIdentical) return currentData;

    // Merge logic: prefer current data, but preserve interrupted data for missing sections
    const merged = { ...currentData };

    const sections = ['anamneseData', 'onderzoekData', 'klinischeConclusieData', 'automatedIntakeData', 'consultData'];

    for (const section of sections) {
      if (interruptedData[section] && !currentData[section]) {
        merged[section] = interruptedData[section];
      }
    }

    return merged;
  }

  private static async restorePartialData(partialData: Record<string, any>): Promise<void> {
    const store = useScribeStore.getState();

    // Restore each data section
    if (partialData.anamneseData) {
      store.setAnamneseData(partialData.anamneseData);
    }
    if (partialData.onderzoekData) {
      store.setOnderzoekData(partialData.onderzoekData);
    }
    if (partialData.klinischeConclusieData) {
      store.setKlinischeConclusieData(partialData.klinischeConclusieData);
    }
    if (partialData.automatedIntakeData) {
      store.setAutomatedIntakeData(partialData.automatedIntakeData);
    }
    if (partialData.consultData) {
      store.setConsultData(partialData.consultData);
    }
  }

  private static getWorkflowSteps(workflowType: WorkflowType): string[] {
    const workflowSteps: Record<WorkflowType, string[]> = {
      'intake-stapsgewijs': ['anamnese', 'onderzoek', 'klinische-conclusie'],
      'intake-automatisch': ['intake'],
      'consult': ['consult']
    };

    return workflowSteps[workflowType] || [];
  }

  private static findLastValidStep(workflowType: WorkflowType, completedSteps: string[]): string | null {
    const workflowSteps = this.getWorkflowSteps(workflowType);

    for (let i = workflowSteps.length - 1; i >= 0; i--) {
      if (completedSteps.includes(workflowSteps[i])) {
        return workflowSteps[i];
      }
    }

    return null;
  }

  private static getNextStep(workflowType: WorkflowType, currentStep: string): string | null {
    const workflowSteps = this.getWorkflowSteps(workflowType);
    const currentIndex = workflowSteps.indexOf(currentStep);

    if (currentIndex !== -1 && currentIndex < workflowSteps.length - 1) {
      return workflowSteps[currentIndex + 1];
    }

    return null;
  }

  private static findIncompleteSteps(workflowType: WorkflowType, completedSteps: string[]): string[] {
    const workflowSteps = this.getWorkflowSteps(workflowType);
    return workflowSteps.filter(step => !completedSteps.includes(step));
  }

  private static formatTimeAgo(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} dag${days > 1 ? 'en' : ''} geleden`;
    if (hours > 0) return `${hours} uur geleden`;
    if (minutes > 0) return `${minutes} minuten geleden`;
    return 'Zojuist';
  }

  private static calculateRiskLevel(interruption: WorkflowInterruption): 'low' | 'medium' | 'high' {
    const timeSinceInterruption = Date.now() - new Date(interruption.interruptedAt).getTime();
    const hoursAgo = timeSinceInterruption / (1000 * 60 * 60);

    if (interruption.interruptionReason === 'connection_loss' && hoursAgo < 1) {
      return 'low';
    }
    if (hoursAgo < 4) {
      return 'low';
    }
    if (hoursAgo < 24) {
      return 'medium';
    }
    return 'high';
  }

  private static translateInterruptionReason(reason: WorkflowInterruption['interruptionReason']): string {
    const translations = {
      'navigation': 'navigatie naar andere pagina',
      'browser_close': 'sluiten van browser',
      'connection_loss': 'verbindingsverlies',
      'timeout': 'time-out',
      'unknown': 'onbekende reden'
    };

    return translations[reason] || reason;
  }
}

// React hook for easy integration
export function useWorkflowResumption() {
  const checkForInterruption = () => WorkflowResumption.checkForInterruption();

  const analyzeResumption = (interruption: WorkflowInterruption, options?: Partial<ResumptionOptions>) =>
    WorkflowResumption.analyzeResumption(interruption, options);

  const executeResumption = (interruption: WorkflowInterruption, result: ResumptionResult, options?: Partial<ResumptionOptions>) =>
    WorkflowResumption.executeResumption(interruption, result, options);

  const saveInterruption = (workflowType: WorkflowType, currentStep: string, reason?: WorkflowInterruption['interruptionReason']) =>
    WorkflowResumption.saveInterruption(workflowType, currentStep, reason);

  const clearInterruption = () => WorkflowResumption.clearInterruption();

  const getResumptionSummary = (interruption: WorkflowInterruption) =>
    WorkflowResumption.getResumptionSummary(interruption);

  return {
    checkForInterruption,
    analyzeResumption,
    executeResumption,
    saveInterruption,
    clearInterruption,
    getResumptionSummary
  };
}