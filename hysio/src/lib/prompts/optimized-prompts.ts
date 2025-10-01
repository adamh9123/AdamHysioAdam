// Optimized AI prompt templates for better token efficiency and performance

import type { PatientInfo, WorkflowType } from '@/types/api';

// Import the new v7.0 system prompts
import {
  // Consult workflow prompts
  CONSULT_VOORBEREIDING_PROMPT,
  CONSULT_VERWERKING_SOEP_PROMPT,

  // Intake Automatisch workflow prompts
  INTAKE_AUTOMATISCH_VOORBEREIDING_PROMPT,
  INTAKE_AUTOMATISCH_VERWERKING_CONCLUSIE_PROMPT,
  INTAKE_AUTOMATISCH_VERWERKING_ZORGPLAN_PROMPT,

  // Intake Stapsgewijs workflow prompts
  INTAKE_STAPSGEWIJS_VOORBEREIDING_ANAMNESE_PROMPT,
  INTAKE_STAPSGEWIJS_VERWERKING_HHSB_PROMPT,
  INTAKE_STAPSGEWIJS_VOORBEREIDING_ONDERZOEK_PROMPT,
  INTAKE_STAPSGEWIJS_VERWERKING_ONDERZOEKSBEVINDINGEN_PROMPT,
  INTAKE_STAPSGEWIJS_VERWERKING_KLINISCHE_CONCLUSIE_PROMPT,
  INTAKE_STAPSGEWIJS_VERWERKING_ZORGPLAN_PROMPT
} from './index';

// ========== NEW v7.0 PROMPT TEMPLATES ==========
// Using the upgraded system prompts from our prompt library

// Optimized prompt templates using v7.0 system prompts
export const PROMPT_TEMPLATES = {
  'intake-automatisch': {
    system: INTAKE_AUTOMATISCH_VOORBEREIDING_PROMPT,
    user: (patient: PatientInfo, contextDocument?: string) => {
      return createUserPrompt(patient, {
        contextDocument,
        instruction: 'Genereer een strategische intake voorbereiding volgens de beschreven methodiek.'
      });
    }
  },

  'intake-stapsgewijs-anamnese': {
    system: INTAKE_STAPSGEWIJS_VOORBEREIDING_ANAMNESE_PROMPT,
    user: (patient: PatientInfo) => {
      return createUserPrompt(patient, {
        instruction: 'Genereer een strategische anamnese voorbereiding volgens de HHSB-methodiek.'
      });
    }
  },

  'intake-stapsgewijs-onderzoek': {
    system: INTAKE_STAPSGEWIJS_VOORBEREIDING_ONDERZOEK_PROMPT,
    user: (patient: PatientInfo, hhsbAnamneseKaart?: string) => {
      return createUserPrompt(patient, {
        additionalData: hhsbAnamneseKaart ? `\n\nHHSB Anamnesekaart:\n${truncateText(hhsbAnamneseKaart, 1000)}` : '',
        instruction: 'Genereer een evidence-based onderzoeksvoorstel volgens de beschreven methodiek.'
      });
    }
  },

  'intake-stapsgewijs-conclusie': {
    system: INTAKE_STAPSGEWIJS_VERWERKING_KLINISCHE_CONCLUSIE_PROMPT,
    user: (patient: PatientInfo, diagnostischVerslag?: string, hhsbAnamneseKaart?: string) => {
      return createUserPrompt(patient, {
        additionalData: (diagnostischVerslag ? `\nDiagnostisch Verslag:\n${truncateText(diagnostischVerslag, 800)}` : '') +
                       (hhsbAnamneseKaart ? `\n\nHHSB Anamnesekaart:\n${truncateText(hhsbAnamneseKaart, 500)}` : ''),
        instruction: 'Synthetiseer alle data tot een complete klinische conclusie volgens de beschreven methodiek.'
      });
    }
  },

  'intake-stapsgewijs-zorgplan': {
    system: INTAKE_STAPSGEWIJS_VERWERKING_ZORGPLAN_PROMPT,
    user: (patient: PatientInfo, klinischeConclusie?: string, hhsbAnamneseKaart?: string, onderzoeksbevindingen?: string) => {
      return createUserPrompt(patient, {
        additionalData: (klinischeConclusie ? `\nKlinische Conclusie:\n${truncateText(klinischeConclusie, 600)}` : '') +
                       (hhsbAnamneseKaart ? `\n\nHHSB Anamnesekaart:\n${truncateText(hhsbAnamneseKaart, 400)}` : '') +
                       (onderzoeksbevindingen ? `\n\nOnderzoeksbevindingen:\n${truncateText(onderzoeksbevindingen, 400)}` : ''),
        instruction: 'Genereer een volledig, actiegericht zorgplan volgens de beschreven methodiek.'
      });
    }
  },

  'consult': {
    system: CONSULT_VOORBEREIDING_PROMPT,
    user: (patient: PatientInfo, contextDocument?: string) => {
      return createUserPrompt(patient, {
        contextDocument,
        instruction: 'Genereer een strategische voorbereiding voor een fysiotherapeutisch vervolgconsult volgens de beschreven methodiek.'
      });
    }
  }
};

// Processing prompts for HHSB and SOEP analysis using v7.0 prompts
export const PROCESSING_PROMPTS = {
  hhsb: {
    system: INTAKE_STAPSGEWIJS_VERWERKING_HHSB_PROMPT,
    user: (patient: PatientInfo, transcript: string, preparation?: string) => {
      return createProcessingUserPrompt(patient, transcript, {
        preparation,
        instruction: 'Transformeer deze anamnesegesprek transcriptie naar een perfect gestructureerde HHSB-Anamnesekaart volgens de beschreven methodiek.'
      });
    }
  },

  'hhsb-intake-automatisch': {
    system: INTAKE_AUTOMATISCH_VERWERKING_CONCLUSIE_PROMPT,
    user: (patient: PatientInfo, transcript: string, preparation?: string) => {
      return createProcessingUserPrompt(patient, transcript, {
        preparation,
        instruction: 'Transformeer deze volledige intakegesprek transcriptie naar een compleet, driedelig klinisch dossier volgens de beschreven methodiek.'
      });
    }
  },

  'onderzoeksbevindingen': {
    system: INTAKE_STAPSGEWIJS_VERWERKING_ONDERZOEKSBEVINDINGEN_PROMPT,
    user: (patient: PatientInfo, onderzoekTranscript: string, hhsbAnamneseKaart?: string, onderzoeksvoorstel?: string) => {
      return createProcessingUserPrompt(patient, onderzoekTranscript, {
        additionalData: (hhsbAnamneseKaart ? `\n\nHHSB Anamnesekaart (context):\n${truncateText(hhsbAnamneseKaart, 800)}` : '') +
                       (onderzoeksvoorstel ? `\n\nOnderzoeksvoorstel (context):\n${truncateText(onderzoeksvoorstel, 600)}` : ''),
        instruction: 'Construeer een volledig en logisch opgebouwd onderzoeksverslag volgens de beschreven methodiek.'
      });
    }
  },

  'zorgplan-automatisch': {
    system: INTAKE_AUTOMATISCH_VERWERKING_ZORGPLAN_PROMPT,
    user: (patient: PatientInfo, volledigIntakeverslag: string) => {
      return createProcessingUserPrompt(patient, '', {
        additionalData: `\n\nVolledig Intakeverslag:\n${truncateText(volledigIntakeverslag, 1500)}`,
        instruction: 'Genereer een actiegericht Zorgplan op basis van het volledige intakeverslag volgens de beschreven methodiek.'
      });
    }
  },

  'zorgplan-stapsgewijs': {
    system: INTAKE_STAPSGEWIJS_VERWERKING_ZORGPLAN_PROMPT,
    user: (patient: PatientInfo, klinischeConclusie: string, hhsbAnamneseKaart?: string, onderzoeksbevindingen?: string) => {
      return createProcessingUserPrompt(patient, '', {
        additionalData: `\n\nKlinische Conclusie:\n${truncateText(klinischeConclusie, 800)}` +
                       (hhsbAnamneseKaart ? `\n\nHHSB Anamnesekaart:\n${truncateText(hhsbAnamneseKaart, 600)}` : '') +
                       (onderzoeksbevindingen ? `\n\nOnderzoeksbevindingen:\n${truncateText(onderzoeksbevindingen, 600)}` : ''),
        instruction: 'Genereer een volledig, actiegericht Zorgplan volgens de beschreven methodiek.'
      });
    }
  },

  soep: {
    system: CONSULT_VERWERKING_SOEP_PROMPT,
    user: (patient: PatientInfo, transcript: string, preparation?: string, contextDocument?: string) => {
      return createProcessingUserPrompt(patient, transcript, {
        preparation,
        contextDocument,
        instruction: 'Transformeer deze vervolgconsult transcriptie naar een superieur SOEP-verslag volgens de beschreven methodiek.'
      });
    }
  }
};

// ========== UTILITY FUNCTIONS ==========

// Helper function to create user prompts for preparation workflows
function createUserPrompt(
  patient: PatientInfo,
  options: {
    contextDocument?: string;
    additionalData?: string;
    instruction: string;
  }
): string {
  const age = getAge(patient.birthYear);
  const genderText = getGenderText(patient.gender);

  let prompt = `voorletters: ${patient.initials}
geboortejaar: ${patient.birthYear}
geslacht: ${patient.gender}
hoofdklacht: ${patient.chiefComplaint}`;

  if (options.contextDocument) {
    prompt += `\n\ncontextDocument: ${truncateText(options.contextDocument, 1500)}`;
  }

  if (options.additionalData) {
    prompt += options.additionalData;
  }

  prompt += `\n\n${options.instruction}`;

  return prompt;
}

// Helper function to create user prompts for processing workflows
function createProcessingUserPrompt(
  patient: PatientInfo,
  transcript: string,
  options: {
    preparation?: string;
    contextDocument?: string;
    additionalData?: string;
    instruction: string;
  }
): string {
  const age = getAge(patient.birthYear);
  const genderText = getGenderText(patient.gender);

  let prompt = `patientInfo:
- voorletters: ${patient.initials}
- geboortejaar: ${patient.birthYear}
- geslacht: ${patient.gender}
- hoofdklacht: ${patient.chiefComplaint}`;

  if (transcript) {
    // CRITICAL FIX: DO NOT TRUNCATE TRANSCRIPT FOR SOEP GENERATION
    // Full consultation transcripts are typically 10,000-20,000 characters
    // Previous truncation to 2000 chars caused catastrophic loss of O, E, P sections
    // GPT-4 Turbo supports 128k tokens (~400k characters) - no truncation needed
    prompt += `\n\ntranscript: ${transcript}`;
  }

  if (options.preparation) {
    prompt += `\n\npreparation: ${truncateText(options.preparation, 800)}`;
  }

  if (options.contextDocument) {
    prompt += `\n\ncontextDocument: ${truncateText(options.contextDocument, 1200)}`;
  }

  if (options.additionalData) {
    prompt += options.additionalData;
  }

  prompt += `\n\n${options.instruction}`;

  return prompt;
}

// Basic utility functions
function getAge(birthYear: string): number {
  return new Date().getFullYear() - parseInt(birthYear);
}

function getGenderText(gender: string): string {
  switch (gender) {
    case 'male': return 'man';
    case 'female': return 'vrouw';
    default: return 'persoon';
  }
}

function truncateText(text: string | null | undefined | any, maxLength: number): string {
  // Robust type checking and conversion
  if (!text || typeof text !== 'string') {
    if (text === null || text === undefined) return '';
    // Try to convert to string if it's an object
    if (typeof text === 'object') {
      text = JSON.stringify(text);
    } else {
      text = String(text);
    }
  }

  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Function to get optimized prompt for preparation (updated for v7.0)
export function getOptimizedPreparationPrompt(
  workflowType: WorkflowType,
  step: string | undefined,
  patientInfo: PatientInfo,
  previousStepData?: string | {
    anamneseResult?: any;
    onderzoekResult?: any;
    diagnostischVerslag?: any;
    klinischeConclusie?: any;
    hhsbAnamneseKaart?: any;
    onderzoeksbevindingen?: any;
  }
) {
  let templateKey = workflowType;

  // Handle step-specific templates for intake-stapsgewijs
  if (workflowType === 'intake-stapsgewijs' && step) {
    templateKey = `intake-stapsgewijs-${step}` as keyof typeof PROMPT_TEMPLATES;
  }

  const template = PROMPT_TEMPLATES[templateKey as keyof typeof PROMPT_TEMPLATES];

  if (!template) {
    throw new Error(`No template found for ${templateKey}. Available templates: ${Object.keys(PROMPT_TEMPLATES).join(', ')}`);
  }

  let userPrompt;

  // Handle different template types with their specific parameters
  switch (templateKey) {
    case 'intake-automatisch':
      // Context document for intake automatisch (consultation context)
      const contextDoc = typeof previousStepData === 'string' ? previousStepData : undefined;
      userPrompt = template.user(patientInfo, contextDoc);
      break;

    case 'intake-stapsgewijs-anamnese':
      // Simple anamnese preparation (no previous data needed)
      userPrompt = template.user(patientInfo);
      break;

    case 'intake-stapsgewijs-onderzoek':
      // Onderzoek preparation based on HHSB anamnese card
      let hhsbData: string | undefined = undefined;

      if (typeof previousStepData === 'object' && previousStepData) {
        // Try to extract HHSB data from the result
        const anamneseResult = previousStepData.anamneseResult;

        if (anamneseResult?.hhsbStructure) {
          // Format HHSB structure into readable text
          const hhsb = anamneseResult.hhsbStructure;
          hhsbData = [
            hhsb.hulpvraag && `Hulpvraag: ${hhsb.hulpvraag}`,
            hhsb.historie && `Historie: ${hhsb.historie}`,
            hhsb.stoornissen && `Stoornissen: ${hhsb.stoornissen}`,
            hhsb.beperkingen && `Beperkingen: ${hhsb.beperkingen}`,
            hhsb.anamneseSummary && `Samenvatting: ${hhsb.anamneseSummary}`
          ].filter(Boolean).join('\n\n');
        } else if (typeof anamneseResult === 'string') {
          hhsbData = anamneseResult;
        } else if (previousStepData.hhsbAnamneseKaart) {
          hhsbData = previousStepData.hhsbAnamneseKaart;
        }
      }

      userPrompt = template.user(patientInfo, hhsbData);
      break;

    case 'intake-stapsgewijs-conclusie':
      // Conclusie based on diagnostisch verslag and HHSB
      if (typeof previousStepData === 'object') {
        const diagnostischVerslag = previousStepData?.diagnostischVerslag || previousStepData?.onderzoekResult;
        const hhsbKaart = previousStepData?.hhsbAnamneseKaart || previousStepData?.anamneseResult;
        userPrompt = template.user(patientInfo, diagnostischVerslag, hhsbKaart);
      } else {
        userPrompt = template.user(patientInfo);
      }
      break;

    case 'intake-stapsgewijs-zorgplan':
      // Zorgplan based on klinische conclusie and previous data
      if (typeof previousStepData === 'object') {
        const klinischeConclusie = previousStepData?.klinischeConclusie;
        const hhsbKaart = previousStepData?.hhsbAnamneseKaart;
        const onderzoeksbevindingen = previousStepData?.onderzoeksbevindingen;
        userPrompt = template.user(patientInfo, klinischeConclusie, hhsbKaart, onderzoeksbevindingen);
      } else {
        userPrompt = template.user(patientInfo);
      }
      break;

    case 'consult':
      // Consult preparation with optional context document
      const consultContext = typeof previousStepData === 'string' ? previousStepData : undefined;
      userPrompt = template.user(patientInfo, consultContext);
      break;

    default:
      // Fallback for any other templates
      userPrompt = template.user(patientInfo);
      break;
  }

  return {
    system: template.system,
    user: userPrompt
  };
}

// Function to get optimized processing prompt (updated for v7.0)
export function getOptimizedProcessingPrompt(
  type: 'hhsb' | 'soep' | 'hhsb-intake-automatisch' | 'onderzoeksbevindingen' | 'zorgplan-automatisch' | 'zorgplan-stapsgewijs',
  patientInfo: PatientInfo,
  transcript: string,
  options?: {
    preparation?: string;
    contextDocument?: string;
    hhsbAnamneseKaart?: string;
    onderzoeksvoorstel?: string;
    volledigIntakeverslag?: string;
    klinischeConclusie?: string;
    onderzoeksbevindingen?: string;
  }
) {
  const template = PROCESSING_PROMPTS[type];

  if (!template) {
    throw new Error(`No processing template found for type: ${type}. Available types: ${Object.keys(PROCESSING_PROMPTS).join(', ')}`);
  }

  let userPrompt;

  // Handle different processing types with their specific parameters
  switch (type) {
    case 'hhsb':
      // Standard HHSB processing for intake stapsgewijs
      userPrompt = template.user(patientInfo, transcript, options?.preparation);
      break;

    case 'hhsb-intake-automatisch':
      // Complete intake processing for automatisch workflow
      userPrompt = template.user(patientInfo, transcript, options?.preparation);
      break;

    case 'onderzoeksbevindingen':
      // Onderzoek processing with anamnese context
      userPrompt = template.user(
        patientInfo,
        transcript,
        options?.hhsbAnamneseKaart,
        options?.onderzoeksvoorstel
      );
      break;

    case 'zorgplan-automatisch':
      // Zorgplan generation based on complete intake verslag
      if (!options?.volledigIntakeverslag) {
        throw new Error('volledigIntakeverslag is required for zorgplan-automatisch processing');
      }
      userPrompt = template.user(patientInfo, options.volledigIntakeverslag);
      break;

    case 'zorgplan-stapsgewijs':
      // Zorgplan generation based on step-by-step data
      if (!options?.klinischeConclusie) {
        throw new Error('klinischeConclusie is required for zorgplan-stapsgewijs processing');
      }
      userPrompt = template.user(
        patientInfo,
        options.klinischeConclusie,
        options?.hhsbAnamneseKaart,
        options?.onderzoeksbevindingen
      );
      break;

    case 'soep':
      // SOEP processing for consult workflow
      userPrompt = template.user(
        patientInfo,
        transcript,
        options?.preparation,
        options?.contextDocument
      );
      break;

    default:
      // Fallback to default user prompt for backwards compatibility
      userPrompt = template.user(patientInfo, transcript, options?.preparation);
      break;
  }

  return {
    system: template.system,
    user: userPrompt
  };
}