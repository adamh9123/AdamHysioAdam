// Section Templates for Hysio EduPack Module
// Comprehensive templates for 7 standard patient education sections

import type { SectionTemplate, EduPackSectionType } from '@/lib/types/edupack';

// Default section configurations
export const EDUPACK_SECTION_TEMPLATES: Record<EduPackSectionType, SectionTemplate> = {
  introduction: {
    type: 'introduction',
    title: 'Welkom',
    description: 'Persoonlijke introductie en welkomst voor de patiënt',
    icon: '📄',
    defaultEnabled: true,
    aiPromptTemplate: `
Schrijf een warme, persoonlijke introductie voor deze patiënt.

STRUCTUUR:
1. Welkom en dank voor het bezoek
2. Datum en type afspraak benoemen
3. Doel van deze samenvatting uitleggen

TOON: Professioneel maar toegankelijk, persoonlijk
LENGTE: 2-3 korte alinea's, maximaal 150 woorden

VOORBEELD OPENING:
"Beste [naam/meneer/mevrouw], hartelijk dank voor uw bezoek aan onze praktijk vandaag..."
    `,
    requiredFields: ['sessionDate', 'sessionType'],
    maxLength: 150,
    order: 1
  },

  session_summary: {
    type: 'session_summary',
    title: 'Samenvatting van ons gesprek',
    description: 'Overzicht van wat er tijdens de sessie is besproken',
    icon: '📋',
    defaultEnabled: true,
    aiPromptTemplate: `
Vat samen wat er tijdens het gesprek is besproken, vanuit het perspectief van de patiënt.

INHOUD:
- Hoofdklachten zoals de patiënt ze heeft omschreven
- Belangrijkste symptomen en beperkingen
- Wanneer klachten begonnen / hoe ze zijn ontstaan
- Wat de patiënt al heeft geprobeerd
- Belangrijkste bevindingen uit onderzoek

STRUCTUUR:
- Gebruik puntjes of korte alinea's
- Begin met de hoofdklacht
- Chronologische volgorde waar mogelijk
- Maximaal 200 woorden

VERMIJD:
- Interne notities of codes
- Technische medische termen zonder uitleg
- Persoonlijke opmerkingen van de therapeut

TOON: Bevestigend ("U vertelde dat..."), begrijpvol
    `,
    requiredFields: ['sessionData', 'patientComplaints'],
    maxLength: 200,
    order: 2
  },

  diagnosis: {
    type: 'diagnosis',
    title: 'Wat er aan de hand is',
    description: 'Uitleg van de diagnose of bevindingen in begrijpelijke taal',
    icon: '💡',
    defaultEnabled: true,
    aiPromptTemplate: `
Leg de diagnose of bevindingen uit in voor de patiënt begrijpelijke taal.

STRUCTUUR:
1. Hoofdboodschap: wat er aan de hand is (in gewone woorden)
2. Waarom dit gebeurt: oorzaken in begrijpelijke taal
3. Wat dit betekent: gevolgen en vooruitzichten
4. Geruststelling: wat het NIET is (indien van toepassing)

TAALGEBRUIK:
- Vervang medische termen door dagelijkse woorden
- Gebruik vergelijkingen uit het dagelijks leven
- Leg uit HOE iets werkt in het lichaam
- Vermijd angst opwekkende taal

VOORBEELDEN:
- "Peesontsteking" → "ontstoken pees"
- "Contractuur" → "stijf geworden spier"
- "Degeneratie" → "slijtage"

TOON: Geruststellend maar eerlijk, informatief, begrijpvol
LENGTE: Maximaal 250 woorden
    `,
    requiredFields: ['diagnosis', 'findings'],
    maxLength: 250,
    order: 3
  },

  treatment_plan: {
    type: 'treatment_plan',
    title: 'Uw behandelplan',
    description: 'Beschrijving van het behandelplan en doelstellingen',
    icon: '🩺',
    defaultEnabled: true,
    aiPromptTemplate: `
Beschrijf het behandelplan helder en motiverend voor de patiënt.

STRUCTUUR:
1. Hoofddoel van de behandeling (wat willen we bereiken?)
2. Behandelmethoden die we gaan gebruiken
3. Tijdlijn: hoe lang duurt het, hoe vaak
4. Rol van de patiënt: hoe kunnen zij meehelpen
5. Wat kunnen ze verwachten: verbetering, tijdlijn

BEHANDELMETHODEN UITLEGGEN:
- Manuele therapie → "behandeling met de handen"
- Oefentherapie → "gerichte oefeningen"
- Electrotherapie → "behandeling met stroom"
- Massage → blijft massage

MOTIVERENDE ELEMENTEN:
- Positieve vooruitzichten benadrukken
- Concrete doelen stellen
- Samenwerking benadrukken
- Realistische verwachtingen scheppen

STRUCTUUR: Logische stappen, genummerd of met bullets
TOON: Optimistisch, motiverend, samenwerkend
LENGTE: Maximaal 300 woorden
    `,
    requiredFields: ['treatmentPlan', 'goals', 'timeline'],
    maxLength: 300,
    order: 4
  },

  self_care: {
    type: 'self_care',
    title: 'Wat kunt u zelf doen',
    description: 'Praktische zelfzorginstructies en oefeningen',
    icon: '🧘',
    defaultEnabled: true,
    aiPromptTemplate: `
Geef praktische, begrijpelijke zelfzorginstructies die de patiënt thuis kan uitvoeren.

CATEGORIEËN:
1. Oefeningen (als besproken)
   - Stap-voor-stap uitleg
   - Hoe vaak, hoe lang
   - Wanneer te doen

2. Leefstijladviezen
   - Houding en ergonomie
   - Activiteiten aanpassen
   - Wat wel/niet doen

3. Pijnmanagement
   - Warmte/koude
   - Rust vs beweging
   - Wanneer pijnstillers

4. Algemene tips
   - Dagelijkse routine
   - Werk/sport aanpassingen

INSTRUCTIEFORMAT:
- Gebruik genummerde stappen
- Concrete, praktische aanwijzingen
- "Doe dit..." in plaats van "U zou kunnen..."
- Vermeld frequentie en duur

BELANGRIJK:
- Alleen adviezen geven die expliciet zijn besproken
- Geen nieuwe oefeningen toevoegen
- Bij twijfel: verwijs naar therapeut

TOON: Bemoedigend, praktisch, ondersteunend
LENGTE: Maximaal 400 woorden
    `,
    requiredFields: ['selfCareInstructions', 'exercises'],
    maxLength: 400,
    order: 5
  },

  warning_signs: {
    type: 'warning_signs',
    title: 'Wanneer contact opnemen',
    description: 'Waarschuwingssignalen en wanneer contact op te nemen',
    icon: '⚠️',
    defaultEnabled: true,
    aiPromptTemplate: `
Beschrijf duidelijk wanneer de patiënt contact moet opnemen, zonder angst te wekken.

STRUCTUUR:
1. Normale verwachtingen eerst
   - "Het is normaal dat..."
   - "U kunt verwachten..."

2. Signalen voor contact
   - Concrete symptomen
   - Wanneer bellen vs wanneer meteen komen
   - Hoe urgent verschillende situaties zijn

3. Contactinformatie
   - Telefoonnummer praktijk
   - Tijden waarop bereikbaar
   - Wat te doen buiten kantooruren

SIGNALEN BESCHRIJVEN:
- Specifiek en herkenbaar
- "Als u..." constructies gebruiken
- Onderscheid tussen urgent en minder urgent
- Concrete voorbeelden geven

VOORBEELDEN:
- "Als de pijn plotseling veel erger wordt..."
- "Bij koorts boven 38,5 graden..."
- "Als u niet meer kunt bewegen..."

TOON:
- Kalm en informatief
- Niet beangstigend
- Ondersteunend
- Duidelijk wat normaal is

LENGTE: Maximaal 150 woorden, puntige lijst
    `,
    requiredFields: ['warningSignals', 'contactInfo'],
    maxLength: 150,
    order: 6
  },

  follow_up: {
    type: 'follow_up',
    title: 'Vervolgafspraken',
    description: 'Informatie over vervolgafspraken en planning',
    icon: '📅',
    defaultEnabled: true,
    aiPromptTemplate: `
Geef heldere informatie over vervolgafspraken en wat er dan gebeurt.

INHOUD:
1. Wanneer is de volgende afspraak
   - Concrete datum/tijd (als al bekend)
   - Of termijn waarin afspraak moet worden gemaakt

2. Waarom deze afspraak nodig is
   - Voortgang controleren
   - Behandeling aanpassen
   - Nieuwe oefeningen leren

3. Wat gaan we dan doen
   - Evalueren van vooruitgang
   - Aanpassingen in behandeling
   - Nieuwe doelen stellen

4. Praktische informatie
   - Hoe afspraak maken/wijzigen
   - Wat mee te nemen
   - Voorbereidingen

PLANNING UITLEGGEN:
- "Over 2 weken zien we u weer..."
- "In de volgende afspraak gaan we..."
- "Let op de vooruitgang tot dan..."

PRAKTISCHE ELEMENTEN:
- Afspraken maken via receptie/app
- Wijzigingen tijdig doorgeven
- Eventueel huiswerk/oefeningen meenemen

TOON: Vooruitkijkend, samenwerkend, praktisch
LENGTE: Maximaal 150 woorden
    `,
    requiredFields: ['nextAppointment', 'followUpPlan'],
    maxLength: 150,
    order: 7
  }
};

// Helper functions for template management
export function getSectionTemplate(sectionType: EduPackSectionType): SectionTemplate {
  return EDUPACK_SECTION_TEMPLATES[sectionType];
}

export function getDefaultEnabledSections(): EduPackSectionType[] {
  return Object.values(EDUPACK_SECTION_TEMPLATES)
    .filter(template => template.defaultEnabled)
    .sort((a, b) => a.order - b.order)
    .map(template => template.type);
}

export function getOrderedSections(): EduPackSectionType[] {
  return Object.values(EDUPACK_SECTION_TEMPLATES)
    .sort((a, b) => a.order - b.order)
    .map(template => template.type);
}

export function getSectionsBySessionType(sessionType: 'intake' | 'followup'): EduPackSectionType[] {
  const baseSections: EduPackSectionType[] = [
    'introduction',
    'session_summary',
    'treatment_plan',
    'self_care',
    'warning_signs',
    'follow_up'
  ];

  // Add diagnosis section only for intake sessions
  if (sessionType === 'intake') {
    return [
      'introduction',
      'session_summary',
      'diagnosis',
      'treatment_plan',
      'self_care',
      'warning_signs',
      'follow_up'
    ];
  }

  return baseSections;
}

// Template customization functions
export function customizeTemplateForPatient(
  template: SectionTemplate,
  patientAge?: number,
  condition?: string
): SectionTemplate {
  let customizedPrompt = template.aiPromptTemplate;

  // Age-specific customizations
  if (patientAge) {
    if (patientAge < 30) {
      customizedPrompt += '\n\nANGEPAST VOOR JONGE VOLWASSENE: Gebruik energieke, motiverende taal. Focus op snel herstel en sportactiviteiten.';
    } else if (patientAge > 65) {
      customizedPrompt += '\n\nANGEPAST VOOR OUDERE VOLWASSENE: Gebruik rustige, respectvolle taal. Focus op behoud van functie en veiligheid.';
    }
  }

  // Condition-specific customizations
  if (condition) {
    if (condition.toLowerCase().includes('rug')) {
      customizedPrompt += '\n\nRUGKLACHTEN: Extra aandacht voor houding, tillen, zitten en ergonomie.';
    } else if (condition.toLowerCase().includes('nek')) {
      customizedPrompt += '\n\nNEKKLACHTEN: Focus op houdingscorrectie, werkplek ergonomie en stress.';
    } else if (condition.toLowerCase().includes('knie')) {
      customizedPrompt += '\n\nKNIEKLACHTEN: Aandacht voor belasting, gewicht, trap lopen en sport.';
    }
  }

  return {
    ...template,
    aiPromptTemplate: customizedPrompt
  };
}

// Validation helpers
export function validateSectionContent(content: string, template: SectionTemplate): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Length validation
  if (content.length > template.maxLength * 1.2) {
    errors.push(`Inhoud is te lang (${content.length} tekens, max ${template.maxLength})`);
  } else if (content.length > template.maxLength) {
    warnings.push(`Inhoud nadert maximum lengte (${content.length}/${template.maxLength} tekens)`);
  }

  // Minimum content check
  if (content.length < 50) {
    errors.push('Inhoud is te kort voor betekenisvolle patiëntinformatie');
  }

  // Required elements check (basic)
  if (template.type === 'warning_signs' && !content.includes('contact')) {
    errors.push('Waarschuwingssignalen sectie moet contactinformatie bevatten');
  }

  if (template.type === 'follow_up' && !content.includes('afspraak')) {
    warnings.push('Vervolgafspraken sectie zou afspraakinformatie moeten bevatten');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Export all templates as array for iteration
export const ALL_SECTION_TEMPLATES = Object.values(EDUPACK_SECTION_TEMPLATES);