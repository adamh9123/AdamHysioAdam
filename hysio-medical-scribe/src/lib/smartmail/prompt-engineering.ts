// Specialized healthcare communication prompts for SmartMail
// Context-aware prompt engineering for different recipient types and communication objectives

import type {
  RecipientCategory,
  CommunicationObjective,
  FormalityLevel,
  SupportedLanguage,
  RecipientType,
  CommunicationContext
} from '@/lib/types/smartmail';

// Base system prompt for healthcare communication
const BASE_HEALTHCARE_PROMPT = {
  nl: `Je bent een ervaren fysiotherapeut en expert in professionele zorgcommunicatie. Je taak is het genereren van accurate, empathische en professionele emails voor de Nederlandse gezondheidszorg.

Belangrijke principes:
- Gebruik altijd correcte medische terminologie
- Respecteer patiëntprivacy en vermijd onnodige persoonlijke details
- Pas de toon aan op de ontvanger (collega, specialist, patiënt, familie)
- Volg Nederlandse zorgstandaarden en richtlijnen
- Gebruik duidelijke, begrijpelijke taal zonder jargon waar mogelijk
- Zorg voor een warme maar professionele toon`,

  en: `You are an experienced physiotherapist and expert in professional healthcare communication. Your task is to generate accurate, empathetic, and professional emails for healthcare professionals.

Important principles:
- Always use correct medical terminology
- Respect patient privacy and avoid unnecessary personal details
- Adapt tone to the recipient (colleague, specialist, patient, family)
- Follow healthcare standards and guidelines
- Use clear, understandable language without jargon where possible
- Ensure a warm but professional tone`
} as const;

// Recipient-specific prompt modifiers
const RECIPIENT_PROMPTS = {
  colleague: {
    nl: `De ontvanger is een collega-fysiotherapeut. Gebruik:
- Professionele maar toegankelijke toon
- Medische terminologie waar relevant
- Collegiale aanpak met ruimte voor discussie
- Nederlandse fysiotherapie-standaarden
- Praktische, actionable adviezen`,

    en: `The recipient is a fellow physiotherapist. Use:
- Professional but approachable tone
- Medical terminology where relevant
- Collegial approach with room for discussion
- Professional physiotherapy standards
- Practical, actionable advice`
  },

  specialist: {
    nl: `De ontvanger is een medisch specialist. Gebruik:
- Formele, respectvolle toon
- Accurate medische terminologie
- Gestructureerde presentatie van bevindingen
- Duidelijke vraagstelling of verwijsreden
- Evidence-based informatie`,

    en: `The recipient is a medical specialist. Use:
- Formal, respectful tone
- Accurate medical terminology
- Structured presentation of findings
- Clear question or referral reason
- Evidence-based information`
  },

  patient: {
    nl: `De ontvanger is een patiënt. Gebruik:
- Empathische, begripvolle toon
- Simpele, begrijpelijke taal zonder medisch jargon
- Geruststellende en bemoedigende benadering
- Praktische uitleg en instructies
- Ruimte voor vragen en ondersteuning`,

    en: `The recipient is a patient. Use:
- Empathetic, understanding tone
- Simple, understandable language without medical jargon
- Reassuring and encouraging approach
- Practical explanations and instructions
- Room for questions and support`
  },

  family: {
    nl: `De ontvanger is familie/mantelzorger van de patiënt. Gebruik:
- Empathische, ondersteunende toon
- Begrijpelijke uitleg van de situatie
- Erkenning van hun zorgen en betrokkenheid
- Praktische tips voor ondersteuning
- Duidelijke communicatie over vervolgstappen`,

    en: `The recipient is family/caregiver of the patient. Use:
- Empathetic, supportive tone
- Understandable explanation of the situation
- Recognition of their concerns and involvement
- Practical tips for support
- Clear communication about next steps`
  },

  referring_physician: {
    nl: `De ontvanger is een verwijzend huisarts. Gebruik:
- Professionele, formele toon
- Medische terminologie en standaarden
- Gestructureerde rapportage van bevindingen
- Duidelijke aanbevelingen en vervolgacties
- Respectvolle collegiale communicatie`,

    en: `The recipient is a referring physician. Use:
- Professional, formal tone
- Medical terminology and standards
- Structured reporting of findings
- Clear recommendations and follow-up actions
- Respectful collegial communication`
  },

  support_staff: {
    nl: `De ontvanger is ondersteunend zorgpersoneel. Gebruik:
- Duidelijke, praktische instructies
- Respectvolle maar directe toon
- Specifieke actiepoints en tijdslijnen
- Relevante context voor hun rol
- Vraag om bevestiging of feedback`,

    en: `The recipient is support healthcare staff. Use:
- Clear, practical instructions
- Respectful but direct tone
- Specific action points and timelines
- Relevant context for their role
- Request for confirmation or feedback`
  }
} as const;

// Communication objective specific prompts
const OBJECTIVE_PROMPTS = {
  referral: {
    nl: `Dit is een verwijzing naar een specialist. Zorg voor:
- Duidelijke beschrijving van de huidige situatie
- Relevante anamnese en bevindingen
- Specifieke vraagstelling aan de specialist
- Urgentie-indicatie indien relevant
- Professionele verwijsformat`,

    en: `This is a referral to a specialist. Ensure:
- Clear description of current situation
- Relevant history and findings
- Specific question to the specialist
- Urgency indication if relevant
- Professional referral format`
  },

  follow_up: {
    nl: `Dit is een follow-up communicatie. Focus op:
- Voortgang sinds laatste contact
- Huidige status en bevindingen
- Aanpassingen in behandelplan
- Vervolgstappen en planning
- Evaluatie van resultaten`,

    en: `This is a follow-up communication. Focus on:
- Progress since last contact
- Current status and findings
- Adjustments to treatment plan
- Next steps and planning
- Evaluation of results`
  },

  consultation_request: {
    nl: `Dit is een verzoek om consultatie. Includeer:
- Duidelijke casuspresentatie
- Specifieke vraag of dilemma
- Eigen overwegingen en gedachten
- Gewenste vorm van consultatie
- Dankbaarheid voor tijd en expertise`,

    en: `This is a consultation request. Include:
- Clear case presentation
- Specific question or dilemma
- Own considerations and thoughts
- Desired form of consultation
- Gratitude for time and expertise`
  },

  patient_education: {
    nl: `Dit is patiënteducatie. Zorg voor:
- Begrijpelijke uitleg van de conditie
- Praktische adviezen en instructies
- Motiverende en bemoedigende toon
- Waarschuwingssignalen om op te letten
- Contactmogelijkheden bij vragen`,

    en: `This is patient education. Ensure:
- Understandable explanation of condition
- Practical advice and instructions
- Motivating and encouraging tone
- Warning signs to watch for
- Contact options for questions`
  },

  treatment_update: {
    nl: `Dit is een behandelupdate. Communiceer:
- Huidige behandelstatus
- Behaalde resultaten en voortgang
- Eventuele aanpassingen in therapie
- Verwachtingen voor vervolgtraject
- Betrokkenheid van de ontvanger`,

    en: `This is a treatment update. Communicate:
- Current treatment status
- Achieved results and progress
- Any adjustments to therapy
- Expectations for continued care
- Recipient's involvement`
  },

  diagnostic_request: {
    nl: `Dit is een verzoek om aanvullende diagnostiek. Specificeer:
- Huidige bevindingen en hypothese
- Gewenste onderzoeken en rationale
- Urgentie en planning
- Verwachte meerwaarde van diagnostiek
- Follow-up na resultaten`,

    en: `This is a diagnostic request. Specify:
- Current findings and hypothesis
- Desired investigations and rationale
- Urgency and planning
- Expected value of diagnostics
- Follow-up after results`
  },

  discharge_summary: {
    nl: `Dit is een ontslagbrief. Documenteer:
- Behandeltraject en uitgevoerde therapieën
- Behaalde resultaten en resterende beperkingen
- Thuisadviezen en oefenprogramma
- Follow-up planning en controles
- Contactgegevens voor nazorg`,

    en: `This is a discharge summary. Document:
- Treatment course and therapies performed
- Achieved results and remaining limitations
- Home advice and exercise program
- Follow-up planning and check-ups
- Contact details for aftercare`
  },

  colleague_inquiry: {
    nl: `Dit is een vraag aan een collega. Structureer:
- Heldere probleemstelling
- Relevante context en achtergrond
- Specifieke vraag of hulpvraag
- Eigen gedachten en twijfels
- Waardering voor input en tijd`,

    en: `This is an inquiry to a colleague. Structure:
- Clear problem statement
- Relevant context and background
- Specific question or request for help
- Own thoughts and doubts
- Appreciation for input and time`
  },

  red_flag_notification: {
    nl: `Dit is een URGENT rode vlag melding. Communiceer:
- Duidelijke alarmsignalen en bevindingen
- Directe actiebehoefte en urgentie
- Relevante achtergrondsinformatie
- Aanbevelingen voor vervolgactie
- Contactgegevens voor overleg`,

    en: `This is an URGENT red flag notification. Communicate:
- Clear warning signs and findings
- Immediate need for action and urgency
- Relevant background information
- Recommendations for follow-up action
- Contact details for consultation`
  }
} as const;

// Formality level modifiers
const FORMALITY_MODIFIERS = {
  formal: {
    nl: `Gebruik een zeer formele stijl:
- Gebruikt u-vorm consequent
- Volledige, grammaticaal correcte zinnen
- Officiële begroeting en afsluiting
- Afstandelijke maar respectvolle toon`,

    en: `Use a very formal style:
- Use formal pronouns consistently
- Complete, grammatically correct sentences
- Official greeting and closing
- Distant but respectful tone`
  },

  professional: {
    nl: `Gebruik een professionele stijl:
- Balans tussen formeel en toegankelijk
- Duidelijke, directe communicatie
- Professionele begroeting en afsluiting
- Zakelijke maar warme toon`,

    en: `Use a professional style:
- Balance between formal and approachable
- Clear, direct communication
- Professional greeting and closing
- Business-like but warm tone`
  },

  friendly: {
    nl: `Gebruik een vriendelijke stijl:
- Toegankelijke, warme toon
- Persoonlijke aanpak waar gepast
- Informele maar respectvolle begroeting
- Open en uitnodigende communicatie`,

    en: `Use a friendly style:
- Approachable, warm tone
- Personal approach where appropriate
- Informal but respectful greeting
- Open and inviting communication`
  },

  empathetic: {
    nl: `Gebruik een empathische stijl:
- Warme, begripvolle toon
- Erkenning van emoties en zorgen
- Ondersteunende en bemoedigende woorden
- Persoonlijke aandacht en zorg`,

    en: `Use an empathetic style:
- Warm, understanding tone
- Recognition of emotions and concerns
- Supportive and encouraging words
- Personal attention and care`
  }
} as const;

// Email structure templates
const EMAIL_STRUCTURE_PROMPTS = {
  nl: `Structureer de email als volgt:

**Onderwerp:** [Genereer een duidelijk, professioneel onderwerp]

**Begroeting:** [Gepaste begroeting voor de ontvanger]

**Inleiding:** [Korte context en doel van de email]

**Hoofdinhoud:** [Gestructureerde presentatie van informatie]

**Conclusie:** [Samenvatting en vervolgstappen]

**Afsluiting:** [Professionele afsluiting met contactinformatie]

**Disclaimer:** [Indien van toepassing, medische disclaimer]`,

  en: `Structure the email as follows:

**Subject:** [Generate a clear, professional subject]

**Greeting:** [Appropriate greeting for recipient]

**Introduction:** [Brief context and purpose of email]

**Main content:** [Structured presentation of information]

**Conclusion:** [Summary and next steps]

**Closing:** [Professional closing with contact information]

**Disclaimer:** [If applicable, medical disclaimer]`
} as const;

// Context integration prompts
const CONTEXT_INTEGRATION_PROMPTS = {
  nl: `Integreer de volgende context natuurlijk in de email:
- Gebruik patiëntinformatie (leeftijd, geslacht, hoofdklacht) om relevantie toe te voegen
- Verwijs naar documenten of eerdere bevindingen waar relevant
- Pas de urgentie aan op basis van de klinische situatie
- Gebruik achtergrondsinformatie om context te bieden
- Zorg dat alle relevante details worden genoemd zonder overbodige informatie`,

  en: `Integrate the following context naturally into the email:
- Use patient information (age, gender, chief complaint) to add relevance
- Reference documents or previous findings where relevant
- Adjust urgency based on clinical situation
- Use background information to provide context
- Ensure all relevant details are mentioned without unnecessary information`
} as const;

/**
 * Generate a complete system prompt for SmartMail email generation
 */
export function generateSystemPrompt(
  recipient: RecipientType,
  context: CommunicationContext,
  includeDocuments: boolean = false
): string {
  const language = recipient.language;
  
  // Start with base healthcare prompt
  let systemPrompt = BASE_HEALTHCARE_PROMPT[language];
  
  // Add recipient-specific guidance
  systemPrompt += '\n\n' + RECIPIENT_PROMPTS[recipient.category][language];
  
  // Add objective-specific guidance
  systemPrompt += '\n\n' + OBJECTIVE_PROMPTS[context.objective][language];
  
  // Add formality modifier
  systemPrompt += '\n\n' + FORMALITY_MODIFIERS[recipient.formality][language];
  
  // Add email structure guidance
  systemPrompt += '\n\n' + EMAIL_STRUCTURE_PROMPTS[language];
  
  // Add context integration guidance
  systemPrompt += '\n\n' + CONTEXT_INTEGRATION_PROMPTS[language];
  
  // Add document integration guidance if applicable
  if (includeDocuments) {
    const documentGuidance = language === 'nl' 
      ? '\n\nDocumentintegratie: Gebruik de bijgeleverde documenten om de email te verrijken met specifieke details, bevindingen, of context. Verwijs alleen naar informatie die daadwerkelijk in de documenten staat.'
      : '\n\nDocument integration: Use the provided documents to enrich the email with specific details, findings, or context. Only reference information that is actually in the documents.';
    
    systemPrompt += documentGuidance;
  }
  
  // Add medical disclaimer guidance
  if (context.includeMedicalDisclaimer) {
    const disclaimerGuidance = language === 'nl'
      ? '\n\nVoeg een passende medische disclaimer toe aan het einde van de email, aangepast aan het type communicatie en de ontvanger.'
      : '\n\nAdd an appropriate medical disclaimer at the end of the email, adapted to the type of communication and recipient.';
    
    systemPrompt += disclaimerGuidance;
  }
  
  // Add urgency guidance
  if (context.urgency && context.urgency !== 'normal') {
    const urgencyGuidance = language === 'nl'
      ? `\n\nUrgentie: Deze communicatie heeft ${context.urgency} prioriteit. Pas de toon en het onderwerp daarop aan.`
      : `\n\nUrgency: This communication has ${context.urgency} priority. Adjust tone and subject accordingly.`;
    
    systemPrompt += urgencyGuidance;
  }
  
  return systemPrompt;
}

/**
 * Generate user prompt with context and requirements
 */
export function generateUserPrompt(
  context: CommunicationContext,
  recipient: RecipientType,
  documentContent?: string[],
  scribeContext?: string
): string {
  const language = recipient.language;
  
  let userPrompt = language === 'nl' 
    ? 'Genereer een professionele email met de volgende informatie:\n\n'
    : 'Generate a professional email with the following information:\n\n';
  
  // Add communication objective and subject
  userPrompt += `**${language === 'nl' ? 'Doel' : 'Objective'}:** ${context.objective}\n`;
  userPrompt += `**${language === 'nl' ? 'Onderwerp' : 'Subject'}:** ${context.subject}\n\n`;
  
  // Add recipient information
  userPrompt += `**${language === 'nl' ? 'Ontvanger' : 'Recipient'}:**\n`;
  userPrompt += `- ${language === 'nl' ? 'Type' : 'Type'}: ${recipient.category}\n`;
  if (recipient.specialty) {
    userPrompt += `- ${language === 'nl' ? 'Specialisatie' : 'Specialty'}: ${recipient.specialty}\n`;
  }
  if (recipient.title) {
    userPrompt += `- ${language === 'nl' ? 'Titel' : 'Title'}: ${recipient.title}\n`;
  }
  userPrompt += `- ${language === 'nl' ? 'Formaliteit' : 'Formality'}: ${recipient.formality}\n\n`;
  
  // Add patient context if available
  if (context.patientAge || context.patientGender || context.chiefComplaint) {
    userPrompt += `**${language === 'nl' ? 'Patiëntcontext' : 'Patient Context'}:**\n`;
    if (context.patientAge) {
      userPrompt += `- ${language === 'nl' ? 'Leeftijd' : 'Age'}: ${context.patientAge} ${language === 'nl' ? 'jaar' : 'years'}\n`;
    }
    if (context.patientGender) {
      userPrompt += `- ${language === 'nl' ? 'Geslacht' : 'Gender'}: ${context.patientGender}\n`;
    }
    if (context.chiefComplaint) {
      userPrompt += `- ${language === 'nl' ? 'Hoofdklacht' : 'Chief Complaint'}: ${context.chiefComplaint}\n`;
    }
    userPrompt += '\n';
  }
  
  // Add background information
  userPrompt += `**${language === 'nl' ? 'Achtergrond' : 'Background'}:**\n${context.background}\n\n`;
  
  // Add urgency if specified
  if (context.urgency && context.urgency !== 'normal') {
    userPrompt += `**${language === 'nl' ? 'Urgentie' : 'Urgency'}:** ${context.urgency}\n\n`;
  }
  
  // Add document content if provided
  if (documentContent && documentContent.length > 0) {
    userPrompt += `**${language === 'nl' ? 'Bijgeleverde documenten' : 'Provided documents'}:**\n`;
    documentContent.forEach((content, index) => {
      userPrompt += `${language === 'nl' ? 'Document' : 'Document'} ${index + 1}:\n${content}\n\n`;
    });
  }
  
  // Add Medical Scribe context if provided
  if (scribeContext) {
    userPrompt += `**${language === 'nl' ? 'Klinische context uit consultatie' : 'Clinical context from consultation'}:**\n${scribeContext}\n\n`;
  }
  
  // Add additional instructions if provided
  if (context.additionalInstructions) {
    userPrompt += `**${language === 'nl' ? 'Aanvullende instructies' : 'Additional instructions'}:**\n${context.additionalInstructions}\n\n`;
  }
  
  // Add follow-up requirements if specified
  if (context.followUpRequired) {
    userPrompt += `**${language === 'nl' ? 'Opmerking' : 'Note'}:** ${language === 'nl' ? 'Deze email vereist een follow-up actie.' : 'This email requires follow-up action.'}\n\n`;
  }
  
  return userPrompt;
}

/**
 * Generate revision prompt for email modifications
 */
export function generateRevisionPrompt(
  originalEmail: string,
  revisionType: 'shorter' | 'longer' | 'more_formal' | 'less_formal' | 'more_empathetic' | 'more_technical',
  language: SupportedLanguage = 'nl',
  specificInstructions?: string
): string {
  const revisionPrompts = {
    nl: {
      shorter: 'Maak deze email korter en beknopter terwijl je alle essentiële informatie behoudt.',
      longer: 'Breid deze email uit met meer details, context, en toelichtingen.',
      more_formal: 'Maak deze email formeler door gebruik van officiële begroetingen, u-vorm, en professionele taal.',
      less_formal: 'Maak deze email minder formeel en toegankelijker, maar behoud de professionaliteit.',
      more_empathetic: 'Maak deze email empathischer met meer aandacht voor emoties en persoonlijke benadering.',
      more_technical: 'Voeg meer medische details en technische termen toe, geschikt voor een professionele zorgverlener.'
    },
    en: {
      shorter: 'Make this email shorter and more concise while retaining all essential information.',
      longer: 'Expand this email with more details, context, and explanations.',
      more_formal: 'Make this email more formal using official greetings, formal pronouns, and professional language.',
      less_formal: 'Make this email less formal and more approachable, but maintain professionalism.',
      more_empathetic: 'Make this email more empathetic with more attention to emotions and personal approach.',
      more_technical: 'Add more medical details and technical terms, suitable for a professional healthcare provider.'
    }
  };
  
  let prompt = `${revisionPrompts[language][revisionType]}\n\n`;
  
  if (specificInstructions) {
    prompt += `${language === 'nl' ? 'Specifieke instructies' : 'Specific instructions'}: ${specificInstructions}\n\n`;
  }
  
  prompt += `${language === 'nl' ? 'Originele email' : 'Original email'}:\n\n${originalEmail}`;
  
  return prompt;
}

/**
 * Get prompt suggestions based on recipient and objective combination
 */
export function getPromptSuggestions(
  recipient: RecipientCategory,
  objective: CommunicationObjective,
  language: SupportedLanguage = 'nl'
): string[] {
  const suggestions = {
    nl: {
      colleague_referral: [
        'Denk aan het delen van je klinische redenering',
        'Specificeer welke input je van de specialist verwacht',
        'Vermeld relevante onderzoeksbevindingen'
      ],
      specialist_referral: [
        'Gebruik gestructureerde SOEP-indeling',
        'Vermeld specifieke vraagstelling',
        'Geef duidelijke urgentie-indicatie'
      ],
      patient_education: [
        'Gebruik begrijpelijke taal zonder jargon',
        'Geef praktische, uitvoerbare adviezen',
        'Moedig positief zelfmanagement aan'
      ],
      family_consultation: [
        'Erken hun bezorgdheid en betrokkenheid',
        'Leg de situatie begrijpelijk uit',
        'Geef concrete ondersteuningsadviezen'
      ]
    },
    en: {
      colleague_referral: [
        'Consider sharing your clinical reasoning',
        'Specify what input you expect from the specialist',
        'Mention relevant examination findings'
      ],
      specialist_referral: [
        'Use structured SOAP format',
        'Mention specific question',
        'Provide clear urgency indication'
      ],
      patient_education: [
        'Use understandable language without jargon',
        'Provide practical, actionable advice',
        'Encourage positive self-management'
      ],
      family_consultation: [
        'Acknowledge their concern and involvement',
        'Explain the situation understandably',
        'Provide concrete support advice'
      ]
    }
  };
  
  const key = `${recipient}_${objective}` as keyof typeof suggestions[typeof language];
  return suggestions[language][key] || [];
}

/**
 * Validate prompt parameters for completeness
 */
export function validatePromptParameters(
  recipient: RecipientType,
  context: CommunicationContext
): { isValid: boolean; missingElements: string[] } {
  const missingElements: string[] = [];
  
  // Check recipient requirements
  if (recipient.category === 'specialist' && !recipient.specialty) {
    missingElements.push('specialist specialty');
  }
  
  if (recipient.category === 'family' && !recipient.relationship) {
    missingElements.push('family relationship');
  }
  
  // Check context requirements based on objective
  if (['referral', 'red_flag_notification'].includes(context.objective)) {
    if (!context.patientAge) missingElements.push('patient age');
    if (!context.chiefComplaint) missingElements.push('chief complaint');
  }
  
  if (context.objective === 'red_flag_notification' && context.urgency !== 'urgent') {
    missingElements.push('urgent priority for red flag');
  }
  
  return {
    isValid: missingElements.length === 0,
    missingElements
  };
}