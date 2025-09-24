// Optimized AI prompt templates for better token efficiency and performance

import type { PatientInfo, WorkflowType } from '@/types/api';

// Base system prompt - optimized for token efficiency
const BASE_SYSTEM_PROMPT = `Expert fysiotherapeut. Genereer gestructureerde voorbereiding voor consultaties.

Richtlijnen:
- Nederlandse medische terminologie
- Specifiek en actionable
- Evidence-based practice
- ICF classificatie waar relevant`;

// Optimized prompt templates
export const PROMPT_TEMPLATES = {
  'intake-automatisch': {
    system: `${BASE_SYSTEM_PROMPT}

Automatische intake:
- Uitgebreide voorbereiding volledige intake
- HHSB methodiek (Hulpvraag, Historie, Stoornissen, Beperkingen)
- Specifieke tests en metingen
- Rode vlagen`,

    user: (patient: PatientInfo) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${patient.additionalInfo ? `\nExtra: ${patient.additionalInfo}` : ''}

Genereer uitgebreide intake voorbereiding met specifieke vragen, onderzoek suggesties, en assessment tools.`
  },

  'intake-stapsgewijs-anamnese': {
    system: `${BASE_SYSTEM_PROMPT}

Stapsgewijze intake - Anamnese:
- Focus anamnese vragen
- HHSB gestructureerde vraagstelling
- Doorvragen en verdieping
- Psychosociale factoren`,

    user: (patient: PatientInfo) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${patient.additionalInfo ? `\nExtra: ${patient.additionalInfo}` : ''}

Genereer gerichte anamnese voorbereiding. Focus specifieke vragen HHSB methodiek.`
  },

  'intake-stapsgewijs-onderzoek': {
    system: `${BASE_SYSTEM_PROMPT}

Stapsgewijze intake - Onderzoek:
- Fysiek onderzoek gebaseerd op anamnese
- Specifieke tests en metingen
- Inspectie, palpatie, bewegingsonderzoek
- Functietesten`,

    user: (patient: PatientInfo, anamneseData?: string) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${anamneseData ? `\nAnamnese: ${truncateText(anamneseData, 200)}` : ''}

Genereer onderzoeksvoorstel gebaseerd op anamnese bevindingen.`
  },

  'intake-stapsgewijs-conclusie': {
    system: `${BASE_SYSTEM_PROMPT}

Stapsgewijze intake - Klinische Conclusie:
- Diagnose formulering
- Behandeldoelen en interventies
- Vervolgafspraken
- Prognose`,

    user: (patient: PatientInfo, anamneseData?: string, onderzoekData?: string) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${anamneseData ? `\nAnamnese: ${truncateText(anamneseData, 150)}` : ''}${onderzoekData ? `\nOnderzoek: ${truncateText(onderzoekData, 150)}` : ''}

Formuleer diagnose, behandelplan en vervolgafspraken.`
  },

  'consult': {
    system: `${BASE_SYSTEM_PROMPT}

Follow-up consult:
- SOEP methodiek (Subjectief, Objectief, Evaluatie, Plan)
- Voortgang evaluatie
- Reassessment en metingen
- Behandelplan aanpassingen`,

    user: (patient: PatientInfo) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${patient.additionalInfo ? `\nExtra: ${patient.additionalInfo}` : ''}

Genereer follow-up consult voorbereiding. Focus SOEP methodiek, voortgang evaluatie.`
  }
};

// Processing prompts for HHSB and SOEP analysis
export const PROCESSING_PROMPTS = {
  hhsb: {
    system: `Expert fysiotherapeut. Analyseer intake volgens HHSB methodiek.

HHSB:
- H: Hulpvraag (motivatie, doelen, verwachtingen)
- H: Historie (ontstaansmoment, verloop, eerdere behandeling)
- S: Stoornissen (pijn, mobiliteit, kracht, stabiliteit)
- B: Beperkingen (ADL, werk, sport)

Output: Gestructureerd volgens HHSB, Nederlandse terminologie, evidence-based.`,

    user: (patient: PatientInfo, transcript: string, preparation?: string) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${preparation ? `\nVoorbereiding: ${truncateText(preparation, 200)}` : ''}

Transcript: ${truncateText(transcript, 1000)}

Analyseer volgens HHSB:
**H - Hulpvraag:** [motivatie en doelen]
**H - Historie:** [ontstaansmoment, verloop, behandelingen]
**S - Stoornissen:** [pijn, mobiliteit, kracht, stabiliteit]
**B - Beperkingen:** [ADL, werk, sport]
**Samenvatting Anamnese:** [klinische samenvatting]`
  },

  soep: {
    system: `Expert fysiotherapeut. Analyseer follow-up consult volgens SOEP methodiek.

SOEP:
- S: Subjectief (klachten, ervaring patiënt)
- O: Objectief (meetbare bevindingen, tests, observaties)
- E: Evaluatie (interpretatie, analyse, klinische redenering)
- P: Plan (behandelplan, doelen, vervolgafspraken)

Output: Gestructureerd volgens SOEP, continuïteit van zorg.`,

    user: (patient: PatientInfo, transcript: string, preparation?: string) =>
      `Patiënt: ${patient.initials}, ${getAge(patient.birthYear)}j, ${getGenderText(patient.gender)}
Hoofdklacht: ${patient.chiefComplaint}${preparation ? `\nVoorbereiding: ${truncateText(preparation, 200)}` : ''}

Transcript: ${truncateText(transcript, 1000)}

Analyseer volgens SOEP:
**S - Subjectief:** [klachten, ervaringen]
**O - Objectief:** [bevindingen, tests, observaties]
**E - Evaluatie:** [interpretatie, analyse]
**P - Plan:** [behandelplan, doelen, vervolgafspraken]
**Samenvatting Consult:** [consult samenvatting]`
  }
};

// Utility functions
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

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Function to get optimized prompt for preparation
export function getOptimizedPreparationPrompt(
  workflowType: WorkflowType,
  step: string | undefined,
  patientInfo: PatientInfo,
  previousStepData?: { anamneseResult?: any; onderzoekResult?: any; }
) {
  let templateKey = workflowType;

  if (workflowType === 'intake-stapsgewijs' && step) {
    templateKey = `intake-stapsgewijs-${step}` as keyof typeof PROMPT_TEMPLATES;
  }

  const template = PROMPT_TEMPLATES[templateKey as keyof typeof PROMPT_TEMPLATES];

  if (!template) {
    throw new Error(`No template found for ${templateKey}`);
  }

  let userPrompt;
  if (templateKey === 'intake-stapsgewijs-onderzoek') {
    userPrompt = template.user(patientInfo, previousStepData?.anamneseResult);
  } else if (templateKey === 'intake-stapsgewijs-conclusie') {
    userPrompt = template.user(patientInfo, previousStepData?.anamneseResult, previousStepData?.onderzoekResult);
  } else {
    userPrompt = template.user(patientInfo);
  }

  return {
    system: template.system,
    user: userPrompt
  };
}

// Function to get optimized processing prompt
export function getOptimizedProcessingPrompt(
  type: 'hhsb' | 'soep',
  patientInfo: PatientInfo,
  transcript: string,
  preparation?: string
) {
  const template = PROCESSING_PROMPTS[type];

  return {
    system: template.system,
    user: template.user(patientInfo, transcript, preparation)
  };
}