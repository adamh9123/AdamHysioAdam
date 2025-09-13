// Healthcare email template structures and formatting utilities
// Specialized templates for different healthcare communication scenarios

import type { 
  RecipientCategory, 
  CommunicationObjective, 
  FormalityLevel, 
  SupportedLanguage,
  EmailTemplate 
} from '@/lib/types/smartmail';

// Base template structure for healthcare communications
export interface HealthcareEmailTemplate {
  id: string;
  name: string;
  recipientCategory: RecipientCategory;
  objective: CommunicationObjective;
  language: SupportedLanguage;
  formality: FormalityLevel;
  structure: {
    greeting: string;
    introduction: string;
    bodyTemplate: string;
    conclusion: string;
    signature: string;
    disclaimer?: string;
  };
  placeholders: TemplatePlaceholder[];
  requiredContext: string[];
  optionalContext: string[];
}

// Template placeholder definitions
export interface TemplatePlaceholder {
  key: string;
  description: string;
  required: boolean;
  type: 'text' | 'number' | 'date' | 'medical_term' | 'patient_info';
  validation?: {
    maxLength?: number;
    pattern?: string;
    allowedValues?: string[];
  };
}

// Medical disclaimer templates
export const MEDICAL_DISCLAIMERS = {
  nl: {
    patient_education: "Deze informatie is bedoeld als algemene voorlichting en vervangt geen professioneel medisch advies. Neem bij vragen of zorgen contact op met uw behandelaar.",
    clinical_advice: "Dit bericht bevat medische informatie en is bedoeld voor de geadresseerde zorgverlener. Behandel deze informatie vertrouwelijk conform de geldende privacy-wetgeving.",
    referral: "Deze verwijzing is gebaseerd op de huidige klinische bevindingen. De definitieve diagnose en behandeling vallen onder de verantwoordelijkheid van de behandelend specialist.",
    general: "Deze communicatie valt onder het medisch beroepsgeheim en is bedoeld voor de geadresseerde. Ongeoorloofde verspreiding is niet toegestaan."
  },
  en: {
    patient_education: "This information is intended as general education and does not replace professional medical advice. Please contact your healthcare provider with any questions or concerns.",
    clinical_advice: "This message contains medical information and is intended for the addressed healthcare provider. Please handle this information confidentially in accordance with applicable privacy legislation.",
    referral: "This referral is based on current clinical findings. Final diagnosis and treatment are the responsibility of the treating specialist.",
    general: "This communication is subject to medical confidentiality and is intended for the addressee. Unauthorized distribution is not permitted."
  }
} as const;

// Professional signatures for different healthcare roles
export const PROFESSIONAL_SIGNATURES = {
  nl: {
    physiotherapist: "Met vriendelijke groet,\n\n[NAAM]\nFysiotherapeut\n[PRAKTIJK_NAAM]\n[CONTACT_GEGEVENS]",
    specialist: "Hoogachtend,\n\n[NAAM]\n[SPECIALISATIE]\n[INSTELLING]\n[CONTACT_GEGEVENS]",
    general_practitioner: "Met vriendelijke groet,\n\n[NAAM]\nHuisarts\n[PRAKTIJK_NAAM]\n[CONTACT_GEGEVENS]"
  },
  en: {
    physiotherapist: "Kind regards,\n\n[NAME]\nPhysiotherapist\n[PRACTICE_NAME]\n[CONTACT_DETAILS]",
    specialist: "Sincerely,\n\n[NAME]\n[SPECIALIZATION]\n[INSTITUTION]\n[CONTACT_DETAILS]",
    general_practitioner: "Kind regards,\n\n[NAME]\nGeneral Practitioner\n[PRACTICE_NAME]\n[CONTACT_DETAILS]"
  }
} as const;

// Referral email templates
export const REFERRAL_TEMPLATES: HealthcareEmailTemplate[] = [
  {
    id: 'referral_specialist_nl_formal',
    name: 'Verwijzing naar Specialist (Formeel)',
    recipientCategory: 'specialist',
    objective: 'referral',
    language: 'nl',
    formality: 'formal',
    structure: {
      greeting: "Geachte collega [SPECIALIST_NAAM],",
      introduction: "Hierbij verwijs ik u patiënt [PATIENT_INITIALEN] voor [REDEN_VERWIJZING].",
      bodyTemplate: `**Patiëntgegevens:**
- Initialen: [PATIENT_INITIALEN]
- Leeftijd: [LEEFTIJD] jaar
- Geslacht: [GESLACHT]

**Hoofdklacht:**
[HOOFDKLACHT]

**Anamnese:**
[ANAMNESE_BEVINDINGEN]

**Lichamelijk onderzoek:**
[ONDERZOEK_BEVINDINGEN]

**Vraagstelling:**
[VRAAGSTELLING]

**Urgentie:**
[URGENTIE_NIVEAU]`,
      conclusion: "Ik verneem graag uw bevindingen en behandeladvies.",
      signature: PROFESSIONAL_SIGNATURES.nl.physiotherapist,
      disclaimer: MEDICAL_DISCLAIMERS.nl.referral
    },
    placeholders: [
      { key: 'SPECIALIST_NAAM', description: 'Naam van de specialist', required: false, type: 'text' },
      { key: 'PATIENT_INITIALEN', description: 'Patiënt initialen', required: true, type: 'text' },
      { key: 'REDEN_VERWIJZING', description: 'Reden voor verwijzing', required: true, type: 'text' },
      { key: 'LEEFTIJD', description: 'Leeftijd van patiënt', required: true, type: 'number' },
      { key: 'GESLACHT', description: 'Geslacht van patiënt', required: true, type: 'text' },
      { key: 'HOOFDKLACHT', description: 'Hoofdklacht van patiënt', required: true, type: 'text' },
      { key: 'ANAMNESE_BEVINDINGEN', description: 'Anamnese bevindingen', required: true, type: 'text' },
      { key: 'ONDERZOEK_BEVINDINGEN', description: 'Lichamelijk onderzoek bevindingen', required: false, type: 'text' },
      { key: 'VRAAGSTELLING', description: 'Specifieke vraag aan specialist', required: true, type: 'text' },
      { key: 'URGENTIE_NIVEAU', description: 'Urgentie van verwijzing', required: false, type: 'text' }
    ],
    requiredContext: ['patientAge', 'patientGender', 'chiefComplaint', 'background'],
    optionalContext: ['urgency', 'additionalInstructions']
  }
];

// Follow-up email templates
export const FOLLOWUP_TEMPLATES: HealthcareEmailTemplate[] = [
  {
    id: 'followup_colleague_nl_professional',
    name: 'Follow-up naar Collega',
    recipientCategory: 'colleague',
    objective: 'follow_up',
    language: 'nl',
    formality: 'professional',
    structure: {
      greeting: "Beste [COLLEGA_NAAM],",
      introduction: "Ik wil je een update geven over patiënt [PATIENT_INITIALEN].",
      bodyTemplate: `**Behandelvoortgang:**
[VOORTGANG_BESCHRIJVING]

**Huidige bevindingen:**
[HUIDIGE_BEVINDINGEN]

**Aangepaste behandeling:**
[BEHANDEL_AANPASSINGEN]

**Vervolgstappen:**
[VERVOLGSTAPPEN]`,
      conclusion: "Mocht je vragen hebben, hoor ik het graag.",
      signature: PROFESSIONAL_SIGNATURES.nl.physiotherapist
    },
    placeholders: [
      { key: 'COLLEGA_NAAM', description: 'Naam van collega', required: false, type: 'text' },
      { key: 'PATIENT_INITIALEN', description: 'Patiënt initialen', required: true, type: 'text' },
      { key: 'VOORTGANG_BESCHRIJVING', description: 'Beschrijving van voortgang', required: true, type: 'text' },
      { key: 'HUIDIGE_BEVINDINGEN', description: 'Huidige bevindingen', required: true, type: 'text' },
      { key: 'BEHANDEL_AANPASSINGEN', description: 'Aangepaste behandeling', required: false, type: 'text' },
      { key: 'VERVOLGSTAPPEN', description: 'Geplande vervolgstappen', required: true, type: 'text' }
    ],
    requiredContext: ['background', 'subject'],
    optionalContext: ['followUpRequired']
  }
];

// Patient education email templates
export const PATIENT_EDUCATION_TEMPLATES: HealthcareEmailTemplate[] = [
  {
    id: 'education_patient_nl_empathetic',
    name: 'Patiënt Educatie (Empathisch)',
    recipientCategory: 'patient',
    objective: 'patient_education',
    language: 'nl',
    formality: 'empathetic',
    structure: {
      greeting: "Beste [PATIENT_NAAM],",
      introduction: "Na ons gesprek van vandaag wil ik u graag wat aanvullende informatie geven over [ONDERWERP].",
      bodyTemplate: `**Wat hebben we besproken:**
[GESPREK_SAMENVATTING]

**Uw klacht:**
[KLACHT_UITLEG]

**Wat kunt u zelf doen:**
[ZELFZORG_ADVIES]

**Oefeningen:**
[OEFENINGEN_BESCHRIJVING]

**Waar moet u op letten:**
[WAARSCHUWINGSSIGNALEN]

**Vervolgafspraak:**
[VERVOLGAFSPRAAK_INFO]`,
      conclusion: "Heeft u nog vragen na het lezen van deze informatie? Neem dan gerust contact met ons op.",
      signature: PROFESSIONAL_SIGNATURES.nl.physiotherapist,
      disclaimer: MEDICAL_DISCLAIMERS.nl.patient_education
    },
    placeholders: [
      { key: 'PATIENT_NAAM', description: 'Naam van patiënt', required: false, type: 'text' },
      { key: 'ONDERWERP', description: 'Onderwerp van educatie', required: true, type: 'text' },
      { key: 'GESPREK_SAMENVATTING', description: 'Samenvatting van het gesprek', required: true, type: 'text' },
      { key: 'KLACHT_UITLEG', description: 'Uitleg over de klacht', required: true, type: 'text' },
      { key: 'ZELFZORG_ADVIES', description: 'Zelfzorg adviezen', required: true, type: 'text' },
      { key: 'OEFENINGEN_BESCHRIJVING', description: 'Beschrijving van oefeningen', required: false, type: 'text' },
      { key: 'WAARSCHUWINGSSIGNALEN', description: 'Alarmsignalen om op te letten', required: false, type: 'text' },
      { key: 'VERVOLGAFSPRAAK_INFO', description: 'Informatie over vervolgafspraak', required: false, type: 'text' }
    ],
    requiredContext: ['subject', 'background'],
    optionalContext: ['followUpRequired', 'additionalInstructions']
  }
];

// Colleague consultation templates
export const CONSULTATION_TEMPLATES: HealthcareEmailTemplate[] = [
  {
    id: 'consultation_colleague_nl_professional',
    name: 'Consultatie Verzoek aan Collega',
    recipientCategory: 'colleague',
    objective: 'consultation_request',
    language: 'nl',
    formality: 'professional',
    structure: {
      greeting: "Beste [COLLEGA_NAAM],",
      introduction: "Ik zou graag jouw mening willen vragen over een casus.",
      bodyTemplate: `**Casus beschrijving:**
[CASUS_BESCHRIJVING]

**Specifieke vraag:**
[SPECIFIEKE_VRAAG]

**Mijn overwegingen:**
[EIGEN_OVERWEGINGEN]

**Urgentie:**
[URGENTIE_NIVEAU]`,
      conclusion: "Ik hoor graag jouw gedachten hierover. Alvast bedankt voor je tijd!",
      signature: PROFESSIONAL_SIGNATURES.nl.physiotherapist
    },
    placeholders: [
      { key: 'COLLEGA_NAAM', description: 'Naam van collega', required: false, type: 'text' },
      { key: 'CASUS_BESCHRIJVING', description: 'Beschrijving van de casus', required: true, type: 'text' },
      { key: 'SPECIFIEKE_VRAAG', description: 'Specifieke vraag aan collega', required: true, type: 'text' },
      { key: 'EIGEN_OVERWEGINGEN', description: 'Eigen overwegingen en gedachten', required: false, type: 'text' },
      { key: 'URGENTIE_NIVEAU', description: 'Urgentie van de consultatie', required: false, type: 'text' }
    ],
    requiredContext: ['subject', 'background'],
    optionalContext: ['urgency']
  }
];

// Red flag notification templates
export const RED_FLAG_TEMPLATES: HealthcareEmailTemplate[] = [
  {
    id: 'red_flag_physician_nl_urgent',
    name: 'Rode Vlag Melding aan Huisarts',
    recipientCategory: 'referring_physician',
    objective: 'red_flag_notification',
    language: 'nl',
    formality: 'formal',
    structure: {
      greeting: "Geachte collega,",
      introduction: "Tijdens het fysiotherapeutisch consult bij patiënt [PATIENT_INITIALEN] zijn alarmsignalen geconstateerd die uw aandacht vereisen.",
      bodyTemplate: `**URGENT - Rode Vlag Signalen**

**Patiëntgegevens:**
- Initialen: [PATIENT_INITIALEN]
- Leeftijd: [LEEFTIJD] jaar
- Geslacht: [GESLACHT]

**Geconstateerde alarmsignalen:**
[RODE_VLAGGEN]

**Context:**
[CONTEXT_BESCHRIJVING]

**Aanbeveling:**
[AANBEVELING]

**Urgentie:**
[URGENTIE_NIVEAU]`,
      conclusion: "Ik adviseer spoedige medische evaluatie. Bij vragen ben ik telefonisch bereikbaar.",
      signature: PROFESSIONAL_SIGNATURES.nl.physiotherapist,
      disclaimer: MEDICAL_DISCLAIMERS.nl.clinical_advice
    },
    placeholders: [
      { key: 'PATIENT_INITIALEN', description: 'Patiënt initialen', required: true, type: 'text' },
      { key: 'LEEFTIJD', description: 'Leeftijd van patiënt', required: true, type: 'number' },
      { key: 'GESLACHT', description: 'Geslacht van patiënt', required: true, type: 'text' },
      { key: 'RODE_VLAGGEN', description: 'Geconstateerde rode vlaggen', required: true, type: 'text' },
      { key: 'CONTEXT_BESCHRIJVING', description: 'Context waarin signalen werden waargenomen', required: true, type: 'text' },
      { key: 'AANBEVELING', description: 'Aanbeveling voor vervolgactie', required: true, type: 'text' },
      { key: 'URGENTIE_NIVEAU', description: 'Urgentie niveau', required: true, type: 'text' }
    ],
    requiredContext: ['patientAge', 'patientGender', 'background', 'urgency'],
    optionalContext: ['additionalInstructions']
  }
];

// Comprehensive template registry
export const HEALTHCARE_EMAIL_TEMPLATES = {
  referral: REFERRAL_TEMPLATES,
  follow_up: FOLLOWUP_TEMPLATES,
  patient_education: PATIENT_EDUCATION_TEMPLATES,
  consultation_request: CONSULTATION_TEMPLATES,
  red_flag_notification: RED_FLAG_TEMPLATES
} as const;

// Utility function to get appropriate template based on criteria
export function getTemplateBycriteria(
  objective: CommunicationObjective,
  recipientCategory: RecipientCategory,
  language: SupportedLanguage = 'nl',
  formality: FormalityLevel = 'professional'
): HealthcareEmailTemplate | null {
  const templates = HEALTHCARE_EMAIL_TEMPLATES[objective];
  if (!templates) return null;

  return templates.find(template => 
    template.recipientCategory === recipientCategory &&
    template.language === language &&
    template.formality === formality
  ) || templates[0] || null;
}

// Subject line generation patterns
export const SUBJECT_PATTERNS = {
  nl: {
    referral: "Verwijzing patiënt [PATIENT_INITIALEN] - [REDEN]",
    follow_up: "Update behandeling [PATIENT_INITIALEN] - [ONDERWERP]",
    consultation_request: "Consultatie verzoek - [ONDERWERP]",
    patient_education: "Informatie over uw behandeling - [ONDERWERP]",
    red_flag_notification: "URGENT: Rode vlag signalen patiënt [PATIENT_INITIALEN]",
    treatment_update: "Behandelupdate [PATIENT_INITIALEN] - [DATUM]",
    diagnostic_request: "Aanvraag diagnostiek [PATIENT_INITIALEN] - [ONDERZOEK]",
    discharge_summary: "Ontslagbrief [PATIENT_INITIALEN] - [DIAGNOSE]"
  },
  en: {
    referral: "Referral patient [PATIENT_INITIALS] - [REASON]",
    follow_up: "Treatment update [PATIENT_INITIALS] - [SUBJECT]",
    consultation_request: "Consultation request - [SUBJECT]",
    patient_education: "Information about your treatment - [SUBJECT]",
    red_flag_notification: "URGENT: Red flag signs patient [PATIENT_INITIALS]",
    treatment_update: "Treatment update [PATIENT_INITIALS] - [DATE]",
    diagnostic_request: "Diagnostic request [PATIENT_INITIALS] - [INVESTIGATION]",
    discharge_summary: "Discharge summary [PATIENT_INITIALS] - [DIAGNOSIS]"
  }
} as const;

// Template validation utility
export function validateTemplate(template: HealthcareEmailTemplate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.id) errors.push('Template ID is required');
  if (!template.name) errors.push('Template name is required');
  if (!template.structure.greeting) errors.push('Greeting structure is required');
  if (!template.structure.bodyTemplate) errors.push('Body template is required');
  if (!template.structure.signature) errors.push('Signature structure is required');
  
  // Validate placeholders match template content
  const templateContent = `${template.structure.greeting} ${template.structure.introduction} ${template.structure.bodyTemplate} ${template.structure.conclusion}`;
  const placeholderKeys = template.placeholders.map(p => p.key);
  const missingPlaceholders = placeholderKeys.filter(key => !templateContent.includes(`[${key}]`));
  
  if (missingPlaceholders.length > 0) {
    errors.push(`Template content missing placeholders: ${missingPlaceholders.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate formatted email from template
export function generateEmailFromTemplate(
  template: HealthcareEmailTemplate,
  placeholderValues: Record<string, string>
): { content: string; missingRequired: string[] } {
  const missingRequired: string[] = [];
  let content = '';

  // Check for missing required placeholders
  template.placeholders.forEach(placeholder => {
    if (placeholder.required && !placeholderValues[placeholder.key]) {
      missingRequired.push(placeholder.key);
    }
  });

  if (missingRequired.length > 0) {
    return { content: '', missingRequired };
  }

  // Build email content
  content = [
    template.structure.greeting,
    '',
    template.structure.introduction,
    '',
    template.structure.bodyTemplate,
    '',
    template.structure.conclusion,
    '',
    template.structure.signature
  ].join('\n');

  if (template.structure.disclaimer) {
    content += '\n\n---\n' + template.structure.disclaimer;
  }

  // Replace placeholders
  Object.entries(placeholderValues).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    content = content.replace(regex, value);
  });

  return { content, missingRequired: [] };
}