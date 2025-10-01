import { useScribeStore } from '@/lib/state/scribe-store';
import type {
  PatientInfo,
  AnamneseResult,
  OnderzoekResult,
  KlinischeConclusieResult,
  WorkflowType
} from '@/types/api';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
  missingRequirements: string[];
}

export interface StepValidationConfig {
  requiredFields: string[];
  minDataSize?: number;
  maxDataSize?: number;
  requiredPatientFields?: (keyof PatientInfo)[];
  customValidators?: ((data: any) => ValidationResult)[];
}

const STEP_VALIDATION_CONFIGS: Record<string, StepValidationConfig> = {
  'anamnese': {
    requiredFields: ['result', 'completed'],
    requiredPatientFields: ['initials', 'birthYear', 'gender', 'chiefComplaint'],
    minDataSize: 100, // Minimum characters in result
    customValidators: [
      (data) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (data.result) {
          // Check HHSB structure
          const hhsb = data.result.hhsbAnamneseCard || data.result;
          if (typeof hhsb === 'object') {
            const requiredHHSBFields = ['hulpvraag', 'historie', 'stoornissen', 'beperkingen'];
            requiredHHSBFields.forEach(field => {
              if (!hhsb[field] || (typeof hhsb[field] === 'string' && hhsb[field].trim().length === 0)) {
                errors.push(`HHSB veld '${field}' is verplicht en mag niet leeg zijn`);
              }
            });
          }

          // Check for red flags
          if (data.result.redFlags && Array.isArray(data.result.redFlags) && data.result.redFlags.length > 0) {
            warnings.push(`${data.result.redFlags.length} red flag(s) gedetecteerd in anamnese`);
          }

          // Check transcript presence
          if (!data.transcript || data.transcript.trim().length < 50) {
            warnings.push('Transcript is erg kort, controleer of alle informatie is vastgelegd');
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          canProceed: errors.length === 0,
          missingRequirements: errors
        };
      }
    ]
  },

  'onderzoek': {
    requiredFields: ['result', 'completed'],
    minDataSize: 50,
    customValidators: [
      (data) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (data.result) {
          const findings = data.result.examinationFindings || data.result;
          if (typeof findings === 'object') {
            const requiredFindings = ['physicalTests', 'movements', 'palpation'];
            requiredFindings.forEach(field => {
              if (!findings[field] || (typeof findings[field] === 'string' && findings[field].trim().length === 0)) {
                warnings.push(`Onderzoeksbevinding '${field}' ontbreekt of is leeg`);
              }
            });

            // Check for red flags in examination
            if (findings.redFlags && Array.isArray(findings.redFlags) && findings.redFlags.length > 0) {
              warnings.push(`${findings.redFlags.length} red flag(s) gedetecteerd in onderzoek`);
            }
          }

          // Validate input method was used
          if (!data.transcript && !data.recording) {
            errors.push('Geen transcript of opname gevonden voor onderzoek');
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          canProceed: errors.length === 0,
          missingRequirements: errors
        };
      }
    ]
  },

  'klinische-conclusie': {
    requiredFields: ['result', 'completed'],
    minDataSize: 30,
    customValidators: [
      (data) => {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (data.result) {
          const conclusion = data.result;

          // Check if conclusion contains key elements
          if (typeof conclusion === 'object') {
            if (!conclusion.diagnosis && !conclusion.clinicalConclusion) {
              errors.push('Geen diagnose of klinische conclusie gevonden');
            }

            if (!conclusion.treatmentPlan && !conclusion.recommendations) {
              warnings.push('Geen behandelplan of aanbevelingen gevonden');
            }

            if (!conclusion.followUp) {
              warnings.push('Geen vervolgafspraken of follow-up gedefinieerd');
            }
          }

          // Validate input was provided
          if (!data.transcript && !data.recording) {
            errors.push('Geen transcript of opname gevonden voor klinische conclusie');
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
          canProceed: errors.length === 0,
          missingRequirements: errors
        };
      }
    ]
  }
};

export class StepValidator {
  /**
   * Validate a specific workflow step
   */
  static validateStep(step: string, data: any, patientInfo?: PatientInfo): ValidationResult {
    const config = STEP_VALIDATION_CONFIGS[step];
    if (!config) {
      return {
        isValid: false,
        errors: [`No validation configuration found for step: ${step}`],
        warnings: [],
        canProceed: false,
        missingRequirements: [`Validation config for ${step}`]
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequirements: string[] = [];

    // Validate required fields
    config.requiredFields.forEach(field => {
      if (!data || data[field] === undefined || data[field] === null) {
        errors.push(`Verplicht veld '${field}' ontbreekt`);
        missingRequirements.push(field);
      }
    });

    // Validate patient info fields
    if (config.requiredPatientFields && patientInfo) {
      config.requiredPatientFields.forEach(field => {
        if (!patientInfo[field] || (typeof patientInfo[field] === 'string' && patientInfo[field].trim().length === 0)) {
          errors.push(`Verplicht patiëntgegeven '${field}' ontbreekt`);
          missingRequirements.push(`patient.${String(field)}`);
        }
      });
    }

    // Validate data size if result exists
    if (data?.result && config.minDataSize) {
      const resultString = typeof data.result === 'string' ? data.result : JSON.stringify(data.result);
      if (resultString.length < config.minDataSize) {
        warnings.push(`Resultaat lijkt erg kort (${resultString.length} karakters, minimum ${config.minDataSize})`);
      }
    }

    // Run custom validators
    if (config.customValidators) {
      config.customValidators.forEach(validator => {
        const customResult = validator(data);
        errors.push(...customResult.errors);
        warnings.push(...customResult.warnings);
        missingRequirements.push(...customResult.missingRequirements);
      });
    }

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)], // Remove duplicates
      warnings: [...new Set(warnings)],
      canProceed: errors.length === 0,
      missingRequirements: [...new Set(missingRequirements)]
    };
  }

  /**
   * Validate workflow dependencies
   */
  static validateWorkflowDependencies(workflow: WorkflowType, targetStep: string): ValidationResult {
    const store = useScribeStore.getState();
    const validation = store.validateStepDependencies(targetStep);

    return {
      isValid: validation.isValid,
      errors: validation.missingSteps.map(step => `Vorige stap '${step}' moet eerst worden voltooid`),
      warnings: [],
      canProceed: validation.isValid,
      missingRequirements: validation.missingSteps
    };
  }

  /**
   * Comprehensive workflow validation
   */
  static validateCompleteWorkflow(workflow: WorkflowType): ValidationResult {
    const store = useScribeStore.getState();
    const { workflowData, patientInfo } = store;

    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequirements: string[] = [];

    // Validate patient info
    if (!patientInfo) {
      errors.push('Patiëntgegevens ontbreken');
      missingRequirements.push('patientInfo');
      return {
        isValid: false,
        errors,
        warnings,
        canProceed: false,
        missingRequirements
      };
    }

    // Workflow-specific validation
    switch (workflow) {
      case 'intake-stapsgewijs':
        // Validate anamnese
        if (workflowData.anamneseData) {
          const anamneseValidation = this.validateStep('anamnese', workflowData.anamneseData, patientInfo);
          errors.push(...anamneseValidation.errors);
          warnings.push(...anamneseValidation.warnings);
          missingRequirements.push(...anamneseValidation.missingRequirements);
        } else {
          errors.push('Anamnese stap is niet voltooid');
          missingRequirements.push('anamneseData');
        }

        // Validate onderzoek
        if (workflowData.onderzoekData) {
          const onderzoekValidation = this.validateStep('onderzoek', workflowData.onderzoekData, patientInfo);
          errors.push(...onderzoekValidation.errors);
          warnings.push(...onderzoekValidation.warnings);
          missingRequirements.push(...onderzoekValidation.missingRequirements);
        } else {
          errors.push('Onderzoek stap is niet voltooid');
          missingRequirements.push('onderzoekData');
        }

        // Validate klinische conclusie
        if (workflowData.klinischeConclusieData) {
          const conclusieValidation = this.validateStep('klinische-conclusie', workflowData.klinischeConclusieData, patientInfo);
          errors.push(...conclusieValidation.errors);
          warnings.push(...conclusieValidation.warnings);
          missingRequirements.push(...conclusieValidation.missingRequirements);
        } else {
          errors.push('Klinische conclusie stap is niet voltooid');
          missingRequirements.push('klinischeConclusieData');
        }
        break;

      case 'intake-automatisch':
        if (!workflowData.automatedIntakeData?.completed) {
          errors.push('Automatische intake is niet voltooid');
          missingRequirements.push('automatedIntakeData');
        }
        break;

      case 'consult':
        if (!workflowData.consultData?.completed) {
          errors.push('Consult is niet voltooid');
          missingRequirements.push('consultData');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors: [...new Set(errors)],
      warnings: [...new Set(warnings)],
      canProceed: errors.length === 0,
      missingRequirements: [...new Set(missingRequirements)]
    };
  }

  /**
   * Get validation summary for UI display
   */
  static getValidationSummary(workflow: WorkflowType): {
    overallStatus: 'complete' | 'incomplete' | 'invalid';
    completedSteps: number;
    totalSteps: number;
    nextStep?: string;
    issues: { type: 'error' | 'warning'; message: string }[];
  } {
    const store = useScribeStore.getState();
    const progress = store.getWorkflowProgress(workflow);
    const validation = this.validateCompleteWorkflow(workflow);

    // Determine next step
    let nextStep: string | undefined;
    const workflowSteps = {
      'intake-stapsgewijs': ['anamnese', 'onderzoek', 'klinische-conclusie'],
      'intake-automatisch': ['intake'],
      'consult': ['consult']
    };

    const steps = workflowSteps[workflow] || [];
    const completedSteps = steps.filter(step => store.isStepCompleted(step));
    const nextIncompleteStep = steps.find(step => !store.isStepCompleted(step));

    if (nextIncompleteStep && store.canProceedToStep(nextIncompleteStep)) {
      nextStep = nextIncompleteStep;
    }

    // Combine errors and warnings into issues array
    const issues: { type: 'error' | 'warning'; message: string }[] = [
      ...validation.errors.map(error => ({ type: 'error' as const, message: error })),
      ...validation.warnings.map(warning => ({ type: 'warning' as const, message: warning }))
    ];

    return {
      overallStatus: validation.errors.length > 0 ? 'invalid' :
                    progress.percentage === 100 ? 'complete' : 'incomplete',
      completedSteps: progress.completed,
      totalSteps: progress.total,
      nextStep,
      issues
    };
  }

  /**
   * Quick validation check for step completion
   */
  static canCompleteStep(step: string, data: any, patientInfo?: PatientInfo): boolean {
    const validation = this.validateStep(step, data, patientInfo);
    return validation.canProceed;
  }

  /**
   * Get step completion requirements
   */
  static getStepRequirements(step: string): string[] {
    const config = STEP_VALIDATION_CONFIGS[step];
    if (!config) return [`Configuratie voor stap '${step}'`];

    const requirements = [...config.requiredFields];

    if (config.requiredPatientFields) {
      requirements.push(...config.requiredPatientFields.map(field => `patient.${String(field)}`));
    }

    if (config.minDataSize) {
      requirements.push(`Minimaal ${config.minDataSize} karakters aan data`);
    }

    return requirements;
  }
}