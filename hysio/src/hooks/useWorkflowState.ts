'use client';

import { useState, useCallback, useEffect } from 'react';
import { PatientInfo, IntakeData, FollowupData, SOEPStructure } from '@/lib/types';

export interface WorkflowData {
  // Patient information
  patientInfo: PatientInfo | null;

  // Workflow configuration
  currentWorkflow: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult' | null;
  currentStep: string | null;

  // Session data for different workflow types
  intakeData: IntakeData | null;
  followupData: FollowupData | null;
  soepData: SOEPStructure | null;

  // Step-specific data for step-by-step workflows
  anamneseData: {
    preparation?: string;
    recording?: File | null;
    transcript?: string;
    result?: any;
    completed?: boolean;
  } | null;

  onderzoekData: {
    preparation?: string;
    recording?: File | null;
    transcript?: string;
    result?: any;
    completed?: boolean;
  } | null;

  klinischeConclusieData: {
    preparation?: string;
    recording?: File | null;
    transcript?: string;
    result?: any;
    completed?: boolean;
  } | null;

  // Automated workflow data
  automatedIntakeData: {
    preparation?: string;
    recording?: File | null;
    transcript?: string;
    result?: any;
    completed?: boolean;
  } | null;

  // Consultation workflow data
  consultData: {
    preparation?: string;
    recording?: File | null;
    transcript?: string;
    soepResult?: SOEPStructure;
    completed?: boolean;
  } | null;

  // Metadata
  sessionId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isComplete: boolean;
}

const STORAGE_KEY = 'hysio-workflow-state';
const STORAGE_VERSION = '1.0';

interface StoredWorkflowData extends WorkflowData {
  version: string;
}

export interface UseWorkflowStateReturn {
  // Current workflow data
  workflowData: WorkflowData;

  // Patient info management
  setPatientInfo: (info: PatientInfo | null) => void;
  getPatientInfo: () => PatientInfo | null;

  // Workflow management
  setCurrentWorkflow: (workflow: WorkflowData['currentWorkflow']) => void;
  setCurrentStep: (step: string | null) => void;
  getCurrentWorkflow: () => WorkflowData['currentWorkflow'];
  getCurrentStep: () => string | null;

  // Session data management
  setIntakeData: (data: IntakeData | null) => void;
  setFollowupData: (data: FollowupData | null) => void;
  setSOEPData: (data: SOEPStructure | null) => void;

  // Step-specific data management
  setAnamneseData: (data: Partial<NonNullable<WorkflowData['anamneseData']>>) => void;
  setOnderzoekData: (data: Partial<NonNullable<WorkflowData['onderzoekData']>>) => void;
  setKlinischeConclusieData: (data: Partial<NonNullable<WorkflowData['klinischeConclusieData']>>) => void;
  setAutomatedIntakeData: (data: Partial<NonNullable<WorkflowData['automatedIntakeData']>>) => void;
  setConsultData: (data: Partial<NonNullable<WorkflowData['consultData']>>) => void;

  // Utility functions
  markStepComplete: (step: string) => void;
  isStepComplete: (step: string) => boolean;
  resetWorkflow: () => void;
  resetCurrentWorkflow: () => void;
  exportWorkflowData: () => StoredWorkflowData;
  importWorkflowData: (data: Partial<WorkflowData>) => void;

  // Progress tracking
  getWorkflowProgress: () => {
    totalSteps: number;
    completedSteps: number;
    percentage: number;
    currentStepIndex: number;
  };

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
  hasStoredData: () => boolean;
}

const getInitialWorkflowData = (): WorkflowData => ({
  patientInfo: null,
  currentWorkflow: null,
  currentStep: null,
  intakeData: null,
  followupData: null,
  soepData: null,
  anamneseData: null,
  onderzoekData: null,
  klinischeConclusieData: null,
  automatedIntakeData: null,
  consultData: null,
  sessionId: null,
  createdAt: null,
  updatedAt: null,
  isComplete: false,
});

export const useWorkflowState = (): UseWorkflowStateReturn => {
  const [workflowData, setWorkflowData] = useState<WorkflowData>(getInitialWorkflowData);

  // Generate session ID when workflow starts
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Update workflow data with automatic timestamping
  const updateWorkflowData = useCallback((updates: Partial<WorkflowData>) => {
    setWorkflowData(prev => {
      const updated = {
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Generate session ID if this is the first update
      if (!updated.sessionId && updates.patientInfo) {
        updated.sessionId = generateSessionId();
        updated.createdAt = new Date().toISOString();
      }

      return updated;
    });
  }, [generateSessionId]);

  // Patient info management
  const setPatientInfo = useCallback((info: PatientInfo | null) => {
    updateWorkflowData({ patientInfo: info });
  }, [updateWorkflowData]);

  const getPatientInfo = useCallback(() => {
    return workflowData.patientInfo;
  }, [workflowData.patientInfo]);

  // Workflow management
  const setCurrentWorkflow = useCallback((workflow: WorkflowData['currentWorkflow']) => {
    updateWorkflowData({ currentWorkflow: workflow });
  }, [updateWorkflowData]);

  const setCurrentStep = useCallback((step: string | null) => {
    updateWorkflowData({ currentStep: step });
  }, [updateWorkflowData]);

  const getCurrentWorkflow = useCallback(() => {
    return workflowData.currentWorkflow;
  }, [workflowData.currentWorkflow]);

  const getCurrentStep = useCallback(() => {
    return workflowData.currentStep;
  }, [workflowData.currentStep]);

  // Session data management
  const setIntakeData = useCallback((data: IntakeData | null) => {
    updateWorkflowData({ intakeData: data });
  }, [updateWorkflowData]);

  const setFollowupData = useCallback((data: FollowupData | null) => {
    updateWorkflowData({ followupData: data });
  }, [updateWorkflowData]);

  const setSOEPData = useCallback((data: SOEPStructure | null) => {
    updateWorkflowData({ soepData: data });
  }, [updateWorkflowData]);

  // Step-specific data management
  const setAnamneseData = useCallback((data: Partial<NonNullable<WorkflowData['anamneseData']>>) => {
    updateWorkflowData({
      anamneseData: { ...workflowData.anamneseData, ...data }
    });
  }, [updateWorkflowData, workflowData.anamneseData]);

  const setOnderzoekData = useCallback((data: Partial<NonNullable<WorkflowData['onderzoekData']>>) => {
    updateWorkflowData({
      onderzoekData: { ...workflowData.onderzoekData, ...data }
    });
  }, [updateWorkflowData, workflowData.onderzoekData]);

  const setKlinischeConclusieData = useCallback((data: Partial<NonNullable<WorkflowData['klinischeConclusieData']>>) => {
    updateWorkflowData({
      klinischeConclusieData: { ...workflowData.klinischeConclusieData, ...data }
    });
  }, [updateWorkflowData, workflowData.klinischeConclusieData]);

  const setAutomatedIntakeData = useCallback((data: Partial<NonNullable<WorkflowData['automatedIntakeData']>>) => {
    updateWorkflowData({
      automatedIntakeData: { ...workflowData.automatedIntakeData, ...data }
    });
  }, [updateWorkflowData, workflowData.automatedIntakeData]);

  const setConsultData = useCallback((data: Partial<NonNullable<WorkflowData['consultData']>>) => {
    updateWorkflowData({
      consultData: { ...workflowData.consultData, ...data }
    });
  }, [updateWorkflowData, workflowData.consultData]);

  // Utility functions
  const markStepComplete = useCallback((step: string) => {
    switch (step) {
      case 'anamnese':
        setAnamneseData({ completed: true });
        break;
      case 'onderzoek':
        setOnderzoekData({ completed: true });
        break;
      case 'klinische-conclusie':
        setKlinischeConclusieData({ completed: true });
        break;
      case 'automated-intake':
        setAutomatedIntakeData({ completed: true });
        break;
      case 'consult':
        setConsultData({ completed: true });
        break;
    }
  }, [setAnamneseData, setOnderzoekData, setKlinischeConclusieData, setAutomatedIntakeData, setConsultData]);

  const isStepComplete = useCallback((step: string): boolean => {
    switch (step) {
      case 'anamnese':
        return workflowData.anamneseData?.completed ?? false;
      case 'onderzoek':
        return workflowData.onderzoekData?.completed ?? false;
      case 'klinische-conclusie':
        return workflowData.klinischeConclusieData?.completed ?? false;
      case 'automated-intake':
        return workflowData.automatedIntakeData?.completed ?? false;
      case 'consult':
        return workflowData.consultData?.completed ?? false;
      default:
        return false;
    }
  }, [workflowData]);

  const resetWorkflow = useCallback(() => {
    setWorkflowData(getInitialWorkflowData());
  }, []);

  const resetCurrentWorkflow = useCallback(() => {
    const { patientInfo } = workflowData;
    const newData = getInitialWorkflowData();
    newData.patientInfo = patientInfo; // Keep patient info
    setWorkflowData(newData);
  }, [workflowData]);

  const exportWorkflowData = useCallback((): StoredWorkflowData => {
    return {
      ...workflowData,
      version: STORAGE_VERSION,
    };
  }, [workflowData]);

  const importWorkflowData = useCallback((data: Partial<WorkflowData>) => {
    updateWorkflowData(data);
  }, [updateWorkflowData]);

  // Progress tracking
  const getWorkflowProgress = useCallback(() => {
    const { currentWorkflow } = workflowData;

    let steps: string[] = [];
    let currentStepIndex = 0;

    switch (currentWorkflow) {
      case 'intake-stapsgewijs':
        steps = ['anamnese', 'onderzoek', 'klinische-conclusie'];
        currentStepIndex = steps.indexOf(workflowData.currentStep || '');
        break;
      case 'intake-automatisch':
        steps = ['automated-intake'];
        currentStepIndex = workflowData.automatedIntakeData?.completed ? 0 : -1;
        break;
      case 'consult':
        steps = ['consult'];
        currentStepIndex = workflowData.consultData?.completed ? 0 : -1;
        break;
    }

    const completedSteps = steps.filter(step => isStepComplete(step)).length;
    const percentage = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

    return {
      totalSteps: steps.length,
      completedSteps,
      percentage,
      currentStepIndex: Math.max(0, currentStepIndex),
    };
  }, [workflowData, isStepComplete]);

  // Persistence functions
  const saveToStorage = useCallback(() => {
    try {
      const dataToStore = exportWorkflowData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Failed to save workflow data to storage:', error);
    }
  }, [exportWorkflowData]);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredWorkflowData = JSON.parse(stored);

        // Version check - reset if version mismatch
        if (data.version !== STORAGE_VERSION) {
          clearStorage();
          return;
        }

        // Remove version before importing
        const { version, ...workflowData } = data;
        importWorkflowData(workflowData);
      }
    } catch (error) {
      console.error('Failed to load workflow data from storage:', error);
      clearStorage();
    }
  }, [importWorkflowData]);

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear workflow storage:', error);
    }
  }, []);

  const hasStoredData = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return !!stored;
    } catch (error) {
      return false;
    }
  }, []);

  // Auto-save to localStorage on data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (workflowData.patientInfo || workflowData.sessionId) {
        saveToStorage();
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [workflowData, saveToStorage]);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    // Current workflow data
    workflowData,

    // Patient info management
    setPatientInfo,
    getPatientInfo,

    // Workflow management
    setCurrentWorkflow,
    setCurrentStep,
    getCurrentWorkflow,
    getCurrentStep,

    // Session data management
    setIntakeData,
    setFollowupData,
    setSOEPData,

    // Step-specific data management
    setAnamneseData,
    setOnderzoekData,
    setKlinischeConclusieData,
    setAutomatedIntakeData,
    setConsultData,

    // Utility functions
    markStepComplete,
    isStepComplete,
    resetWorkflow,
    resetCurrentWorkflow,
    exportWorkflowData,
    importWorkflowData,

    // Progress tracking
    getWorkflowProgress,

    // Persistence
    saveToStorage,
    loadFromStorage,
    clearStorage,
    hasStoredData,
  };
};