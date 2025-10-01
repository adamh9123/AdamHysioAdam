/**
 * Enhanced HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) Generation System
 *
 * This module provides comprehensive HHSB Anamnesekaart generation with detailed
 * prompts, robust parsing, and quality validation for physiotherapy intake documentation.
 */

export interface EnhancedHHSBStructure {
  hulpvraag: {
    primaryConcern: string;
    patientGoals: string[];
    functionalLimitations: string[];
    qualityOfLifeImpact: string;
    expectations: string;
  };
  historie: {
    onsetDescription: string;
    symptomProgression: string;
    previousTreatments: PreviousTreatment[];
    relevantMedicalHistory: string[];
    currentMedications: string[];
    traumaHistory?: string;
    workRelatedFactors?: string;
  };
  stoornissen: {
    painDescription: PainDescription;
    movementImpairments: MovementImpairment[];
    strengthDeficits: string[];
    sensoryChanges: string[];
    coordinationIssues: string[];
    otherSymptoms: string[];
  };
  beperkingen: {
    activitiesOfDailyLiving: ActivityLimitation[];
    workLimitations: string[];
    sportRecreationLimitations: string[];
    socialParticipationImpact: string[];
    sleepImpact?: string;
    moodCognitivelmpact?: string;
  };
  anamneseSummary: {
    keyFindings: string[];
    clinicalImpression: string;
    priorityAreas: string[];
    redFlagsNoted: string[];
  };
}

export interface PainDescription {
  location: string[];
  character: string[];
  intensity: {
    current: number; // 0-10 NRS
    worst: number;
    best: number;
    average: number;
  };
  pattern: string; // constant, intermittent, activity-related, etc.
  aggravatingFactors: string[];
  relievingFactors: string[];
  timePattern: string; // morning stiffness, evening pain, etc.
}

export interface MovementImpairment {
  joint: string;
  movement: string;
  limitation: string;
  severity: 'mild' | 'moderate' | 'severe';
  compensations?: string;
}

export interface ActivityLimitation {
  activity: string;
  limitation: string;
  severity: 'mild' | 'moderate' | 'severe';
  frequency: string;
  adaptations?: string;
}

export interface PreviousTreatment {
  type: string;
  provider: string;
  duration: string;
  effectiveness: 'zeer effectief' | 'effectief' | 'matig effectief' | 'niet effectief';
  reason_stopped?: string;
}

/**
 * Generate enhanced system prompt for comprehensive HHSB analysis
 */
export function createEnhancedHHSBPrompt(): string {
  return `Je bent een ervaren fysiotherapeut die een gestructureerde HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) anamnese uitvoert volgens de Nederlandse fysiotherapie richtlijnen.

HHSB is de kern van de fysiotherapeutische anamnese en moet volledig en systematisch ingevuld worden:

**H - HULPVRAAG:**
- Wat wil de patiënt concreet bereiken? (functionele doelen)
- Welke activiteiten wil de patiënt weer kunnen uitvoeren?
- Wat zijn de verwachtingen van de behandeling?
- Hoe ervaart de patiënt de impact op kwaliteit van leven?

**H - HISTORIE:**
- Wanneer en hoe zijn de klachten ontstaan? (trauma, geleidelijk, acuut)
- Hoe zijn de klachten verlopen? (progressief, stabiel, fluctuerend)
- Welke behandelingen zijn al geprobeerd en met welk resultaat?
- Relevante medische voorgeschiedenis en medicatie
- Werk-gerelateerde factoren en ergonomie

**S - STOORNISSEN:**
- Pijnkenmerken: lokatie, karakter, intensiteit (NRS 0-10), patroon
- Bewegingsbeperkingen: welke bewegingen, in welke richting, hoeveel beperking
- Krachtsverlies: welke spieren, functionele impact
- Gevoelsstoornissen: locatie, type (tintelingen, doofheid, etc.)
- Coördinatieproblemen en andere symptomen

**B - BEPERKINGEN:**
- ADL beperkingen: concrete activiteiten die moeilijk gaan
- Werk beperkingen: specifieke taken die problematisch zijn
- Sport/recreatie: welke activiteiten niet meer mogelijk
- Sociale participatie: impact op sociale contacten en rollen
- Slaap, concentratie en emotionele impact

**SAMENVATTING:**
- Kernbevindingen uit de anamnese
- Klinische indruk op basis van het verhaal
- Prioriteitsgebieden voor behandeling
- Eventuele rode vlaggen

FORMAT JE ANTWOORD EXACT ALS VOLGT:

### HHSB ANAMNESEKAART ###

**HULPVRAAG:**
• Primaire zorg: [hoofdklacht in eigen woorden patiënt]
• Functionele doelen: [wat wil patiënt bereiken - concrete activiteiten]
• Beperkingen ervaring: [hoe ervaart patiënt de beperkingen]
• Kwaliteit van leven impact: [impact op dagelijks functioneren]
• Verwachtingen: [wat verwacht patiënt van behandeling]

**HISTORIE:**
• Ontstaan: [hoe en wanneer ontstonden klachten - trauma/geleidelijk]
• Verloop: [progressie van symptomen - beter/slechter/stabiel]
• Eerdere behandelingen: [wat geprobeerd, door wie, met welk resultaat]
• Medische geschiedenis: [relevante aandoeningen, operaties, medicatie]
• Context factoren: [werk, sport, ergonomie, leefstijl]

**STOORNISSEN:**
• Pijn: [lokatie, karakter, intensiteit NRS 0-10, patroon dag/nacht]
• Bewegingsbeperking: [welke bewegingen, welke richting, mate beperking]
• Kracht: [welke spieren/bewegingen verzwakt, functionele impact]
• Gevoel: [gevoelsstoornissen, lokatie, karakter]
• Coördinatie: [evenwicht, proprioceptie, motorische controle problemen]
• Overige symptomen: [zwelling, stijfheid, vermoeidheid, etc.]

**BEPERKINGEN:**
• ADL: [concrete dagelijkse activiteiten die moeilijk gaan]
• Werk: [specifieke werktaken die problematisch zijn]
• Sport/recreatie: [welke activiteiten niet meer mogelijk of beperkt]
• Sociale participatie: [impact op sociale rollen en contacten]
• Overige: [slaap, concentratie, stemming, sexualiteit indien relevant]

**SAMENVATTING ANAMNESE:**
Schrijf een samenvattende paragraaf van 10-15 volledige zinnen die de complete anamnese samenvat. Baseer de samenvatting volledig op de informatie uit het gesprek. Begin met de hoofdklacht en ontstaansgeschiedenis. Beschrijf vervolgens de huidige klachten, pijn, beperkingen in dagelijkse activiteiten, werk en sport. Vermeld relevante voorgeschiedenis, eerdere behandelingen en hun effecten. Concludeer met de impact op het dagelijks functioneren en de hulpvraag van de patiënt. Gebruik doorlopende tekst, geen bulletpoints. Zorg dat de samenvatting logisch en chronologisch opgebouwd is en alle belangrijke aspecten uit het gesprek bevat.

Zorg ervoor dat elke sectie volledig ingevuld wordt op basis van de transcriptie. Als informatie ontbreekt, vermeld dat expliciet.`;
}

/**
 * Generate enhanced user prompt with patient context
 */
export function createEnhancedHHSBUserPrompt(
  patientInfo: { initials: string; age: number; gender: string; chiefComplaint: string },
  preparation: string | null,
  transcript: string
): string {
  const { initials, age, gender, chiefComplaint } = patientInfo;
  const genderText = gender === 'male' ? 'man' : 'vrouw';

  return `PATIËNT INFORMATIE:
• Initialen: ${initials}
• Leeftijd: ${age} jaar
• Geslacht: ${genderText}
• Hoofdklacht: ${chiefComplaint}

${preparation ? `VOORBEREIDING ANAMNESE:\n${preparation}\n\n` : ''}

TRANSCRIPTIE ANAMNESEGESPREK:
${transcript}

Voer een volledige HHSB analyse uit van deze anamnese. Gebruik de transcriptie om elke sectie systematisch in te vullen. Let specifiek op:
- Functionele doelen en verwachtingen van de patiënt
- Exacte pijnkenmerken (lokatie, karakter, NRS scores)
- Concrete bewegingsbeperkingen en hun impact
- Specifieke ADL, werk en sport beperkingen
- Eerdere behandelingen en hun effectiviteit

Als bepaalde informatie niet in de transcriptie staat, vermeld dit expliciet als "Niet besproken in anamnese" of "Aanvullende informatie nodig".`;
}

/**
 * Parse enhanced HHSB analysis with robust error handling and fallback parsing
 */
export function parseEnhancedHHSBAnalysis(analysisText: string): EnhancedHHSBStructure {
  const result: EnhancedHHSBStructure = {
    hulpvraag: {
      primaryConcern: '',
      patientGoals: [],
      functionalLimitations: [],
      qualityOfLifeImpact: '',
      expectations: ''
    },
    historie: {
      onsetDescription: '',
      symptomProgression: '',
      previousTreatments: [],
      relevantMedicalHistory: [],
      currentMedications: [],
    },
    stoornissen: {
      painDescription: {
        location: [],
        character: [],
        intensity: { current: 0, worst: 0, best: 0, average: 0 },
        pattern: '',
        aggravatingFactors: [],
        relievingFactors: [],
        timePattern: ''
      },
      movementImpairments: [],
      strengthDeficits: [],
      sensoryChanges: [],
      coordinationIssues: [],
      otherSymptoms: []
    },
    beperkingen: {
      activitiesOfDailyLiving: [],
      workLimitations: [],
      sportRecreationLimitations: [],
      socialParticipationImpact: []
    },
    anamneseSummary: {
      keyFindings: [],
      clinicalImpression: '',
      priorityAreas: [],
      redFlagsNoted: []
    }
  };

  try {
    // Parse HULPVRAAG section with fallback parsing
    const hulpvraagSection = extractSection(analysisText, 'HULPVRAAG');
    if (hulpvraagSection) {
      result.hulpvraag.primaryConcern = extractBulletPoint(hulpvraagSection, 'Primaire zorg') ||
                                       extractBulletPoint(hulpvraagSection, 'Hoofdklacht') ||
                                       extractBulletPoint(hulpvraagSection, 'Primaire klacht') ||
                                       extractFirstLine(hulpvraagSection) || '';
      result.hulpvraag.patientGoals = extractList(extractBulletPoint(hulpvraagSection, 'Functionele doelen') ||
                                                  extractBulletPoint(hulpvraagSection, 'Doelen') || '');
      result.hulpvraag.functionalLimitations = extractList(extractBulletPoint(hulpvraagSection, 'Beperkingen ervaring') ||
                                                           extractBulletPoint(hulpvraagSection, 'Beperkingen') || '');
      result.hulpvraag.qualityOfLifeImpact = extractBulletPoint(hulpvraagSection, 'Kwaliteit van leven impact') ||
                                            extractBulletPoint(hulpvraagSection, 'Impact') || '';
      result.hulpvraag.expectations = extractBulletPoint(hulpvraagSection, 'Verwachtingen') || '';
    } else {
      // Fallback: Try to extract from any HULPVRAAG content in the text
      const fallbackHulpvraag = extractFallbackContent(analysisText, ['hulpvraag', 'hoofdklacht', 'primaire zorg']);
      if (fallbackHulpvraag) {
        result.hulpvraag.primaryConcern = fallbackHulpvraag;
      }
    }

    // Parse HISTORIE section
    const historieSection = extractSection(analysisText, 'HISTORIE');
    if (historieSection) {
      result.historie.onsetDescription = extractBulletPoint(historieSection, 'Ontstaan') || '';
      result.historie.symptomProgression = extractBulletPoint(historieSection, 'Verloop') || '';

      const treatmentText = extractBulletPoint(historieSection, 'Eerdere behandelingen') || '';
      if (treatmentText && treatmentText !== 'Niet besproken in anamnese') {
        result.historie.previousTreatments = parsePreviousTreatments(treatmentText);
      }

      result.historie.relevantMedicalHistory = extractList(extractBulletPoint(historieSection, 'Medische geschiedenis') || '');
    }

    // Parse STOORNISSEN section
    const stoornissenSection = extractSection(analysisText, 'STOORNISSEN');
    if (stoornissenSection) {
      // Parse pain description
      const painText = extractBulletPoint(stoornissenSection, 'Pijn') || '';
      if (painText) {
        result.stoornissen.painDescription = parsePainDescription(painText);
      }

      // Parse movement impairments
      const movementText = extractBulletPoint(stoornissenSection, 'Bewegingsbeperking') || '';
      if (movementText) {
        result.stoornissen.movementImpairments = parseMovementImpairments(movementText);
      }

      result.stoornissen.strengthDeficits = extractList(extractBulletPoint(stoornissenSection, 'Kracht') || '');
      result.stoornissen.sensoryChanges = extractList(extractBulletPoint(stoornissenSection, 'Gevoel') || '');
      result.stoornissen.coordinationIssues = extractList(extractBulletPoint(stoornissenSection, 'Coördinatie') || '');
      result.stoornissen.otherSymptoms = extractList(extractBulletPoint(stoornissenSection, 'Overige symptomen') || '');
    }

    // Parse BEPERKINGEN section
    const beperkingenSection = extractSection(analysisText, 'BEPERKINGEN');
    if (beperkingenSection) {
      const adlText = extractBulletPoint(beperkingenSection, 'ADL') || '';
      if (adlText) {
        result.beperkingen.activitiesOfDailyLiving = parseActivityLimitations(adlText);
      }

      result.beperkingen.workLimitations = extractList(extractBulletPoint(beperkingenSection, 'Werk') || '');
      result.beperkingen.sportRecreationLimitations = extractList(extractBulletPoint(beperkingenSection, 'Sport/recreatie') || '');
      result.beperkingen.socialParticipationImpact = extractList(extractBulletPoint(beperkingenSection, 'Sociale participatie') || '');
    }

    // Parse SAMENVATTING section - now as continuous text instead of bullet points
    const summarySection = extractSection(analysisText, 'SAMENVATTING ANAMNESE');
    if (summarySection) {
      // Store the entire summary as clinical impression since it's now continuous text
      result.anamneseSummary.clinicalImpression = summarySection.trim();
      // Clear the structured fields since we now have narrative summary
      result.anamneseSummary.keyFindings = [];
      result.anamneseSummary.priorityAreas = [];
      result.anamneseSummary.redFlagsNoted = [];
    }

  } catch (error) {
    console.error('Error parsing enhanced HHSB analysis:', error);
  }

  return result;
}

// Helper parsing functions with enhanced robustness
function extractSection(text: string, sectionName: string): string | null {
  // First try robust extraction
  const robustResult = extractSectionRobust(text, sectionName);
  if (robustResult) return robustResult;

  // Original fallback
  const regex = new RegExp(`\\*\\*${sectionName}:?\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractBulletPoint(text: string, bulletName: string): string | null {
  const regex = new RegExp(`•\\s*${bulletName}[:\\s]*([^•\\n]*(?:\\n(?!•)[^\\n]*)*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractList(text: string): string[] {
  if (!text || text.includes('Niet besproken') || text.includes('niet genoemd')) {
    return [];
  }

  // Split on common delimiters and clean up
  return text.split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .filter(item => !item.includes('Niet besproken'));
}

function parsePainDescription(painText: string): PainDescription {
  const result: PainDescription = {
    location: [],
    character: [],
    intensity: { current: 0, worst: 0, best: 0, average: 0 },
    pattern: '',
    aggravatingFactors: [],
    relievingFactors: [],
    timePattern: ''
  };

  // Extract NRS scores
  const nrsMatches = painText.match(/NRS\s*(\d+)(?:-(\d+))?/gi);
  if (nrsMatches) {
    const numbers = nrsMatches.flatMap(match => match.match(/\d+/g) || []).map(Number);
    if (numbers.length > 0) {
      result.intensity.current = numbers[0];
      result.intensity.average = numbers[0];
      result.intensity.worst = Math.max(...numbers);
      result.intensity.best = Math.min(...numbers);
    }
  }

  // Extract locations, characters, patterns from text
  result.location = extractList(painText.split('karakter')[0] || '');

  const characterMatch = painText.match(/karakter[:\s]*([^,\n]*)/i);
  if (characterMatch) {
    result.character = extractList(characterMatch[1]);
  }

  return result;
}

function parseMovementImpairments(movementText: string): MovementImpairment[] {
  const impairments: MovementImpairment[] = [];

  // Simple parsing - can be enhanced based on common patterns
  const movements = extractList(movementText);
  movements.forEach(movement => {
    if (movement.length > 0) {
      impairments.push({
        joint: 'Niet gespecificeerd',
        movement: movement,
        limitation: 'Beperking aanwezig',
        severity: 'moderate' // Default
      });
    }
  });

  return impairments;
}

function parseActivityLimitations(adlText: string): ActivityLimitation[] {
  const limitations: ActivityLimitation[] = [];

  const activities = extractList(adlText);
  activities.forEach(activity => {
    if (activity.length > 0) {
      limitations.push({
        activity: activity,
        limitation: 'Beperking gerapporteerd',
        severity: 'moderate', // Default
        frequency: 'Niet gespecificeerd'
      });
    }
  });

  return limitations;
}

function parsePreviousTreatments(treatmentText: string): PreviousTreatment[] {
  const treatments: PreviousTreatment[] = [];

  // Simple parsing - can be enhanced for more sophisticated extraction
  const treatmentList = extractList(treatmentText);
  treatmentList.forEach(treatment => {
    if (treatment.length > 0) {
      treatments.push({
        type: treatment,
        provider: 'Niet gespecificeerd',
        duration: 'Niet gespecificeerd',
        effectiveness: 'matig effectief' // Default
      });
    }
  });

  return treatments;
}

/**
 * Validate HHSB completeness and quality
 */
export function validateHHSBCompleteness(hhsb: EnhancedHHSBStructure): {
  isComplete: boolean;
  missingFields: string[];
  qualityScore: number;
  recommendations: string[];
} {
  const missingFields: string[] = [];
  const recommendations: string[] = [];
  let qualityScore = 100;

  // Check required fields
  if (!hhsb.hulpvraag.primaryConcern) {
    missingFields.push('Primaire zorg patiënt');
    qualityScore -= 15;
  }

  if (hhsb.hulpvraag.patientGoals.length === 0) {
    missingFields.push('Functionele doelen');
    qualityScore -= 15;
  }

  if (!hhsb.historie.onsetDescription) {
    missingFields.push('Ontstaan klachten');
    qualityScore -= 10;
  }

  if (hhsb.stoornissen.painDescription.intensity.current === 0) {
    missingFields.push('Pijn intensiteit (NRS)');
    qualityScore -= 10;
  }

  if (hhsb.beperkingen.activitiesOfDailyLiving.length === 0) {
    missingFields.push('ADL beperkingen');
    qualityScore -= 15;
  }

  if (hhsb.anamneseSummary.keyFindings.length === 0) {
    missingFields.push('Kernbevindingen samenvatting');
    qualityScore -= 10;
  }

  // Quality recommendations
  if (hhsb.hulpvraag.expectations === '') {
    recommendations.push('Verwachtingen patiënt uitvragen');
  }

  if (hhsb.historie.previousTreatments.length === 0) {
    recommendations.push('Eerdere behandelingen systematisch inventariseren');
  }

  if (hhsb.stoornissen.painDescription.location.length === 0) {
    recommendations.push('Pijnlokatie specifieker beschrijven');
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    qualityScore: Math.max(0, qualityScore),
    recommendations
  };
}

// Additional helper functions for robust parsing
function extractFirstLine(text: string): string {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  return lines.length > 0 ? lines[0].trim().replace(/^[•\-\*]\s*/, '') : '';
}

function extractFallbackContent(text: string, keywords: string[]): string {
  for (const keyword of keywords) {
    const regex = new RegExp(`${keyword}[:\\s]*([^\\n]*(?:\\n(?!\\*\\*)[^\\n]*)*)`, 'i');
    const match = text.match(regex);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }
  return '';
}

// Enhanced section extraction with multiple patterns
function extractSectionRobust(text: string, sectionName: string): string | null {
  const patterns = [
    `\\*\\*${sectionName}:?\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|###|$)`,
    `### ${sectionName} ###([\\s\\S]*?)(?=###|\\*\\*|$)`,
    `${sectionName}:([\\s\\S]*?)(?=\\n\\w+:|$)`
  ];

  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i');
    const match = text.match(regex);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }

  return null;
}