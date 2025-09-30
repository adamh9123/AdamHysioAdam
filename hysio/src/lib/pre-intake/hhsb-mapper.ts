/**
 * HHSB Mapper - Transform Pre-intake Questionnaire Data to HHSB Structure
 *
 * Maps patient questionnaire responses following LOFTIG and SCEGS frameworks
 * into therapist-ready HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) format.
 *
 * @module lib/pre-intake/hhsb-mapper
 */

import type {
  PreIntakeQuestionnaireData,
  PreIntakeHHSBData,
  BodyRegion,
} from '@/types/pre-intake';
import type { HHSBStructure } from '@/types/api';
import { BODY_REGION_LABELS, FREQUENCY_OPTIONS, DURATION_OPTIONS, MOOD_IMPACT_OPTIONS } from './constants';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format body locations into readable Dutch text
 */
function formatBodyLocations(locations: BodyRegion[]): string {
  if (!locations || locations.length === 0) {
    return 'Niet ingevuld';
  }

  const labels = locations.map((loc) => BODY_REGION_LABELS[loc]);

  if (labels.length === 1) {
    return labels[0];
  } else if (labels.length === 2) {
    return `${labels[0]} en ${labels[1]}`;
  } else {
    return `${labels.slice(0, -1).join(', ')} en ${labels[labels.length - 1]}`;
  }
}

/**
 * Get frequency label
 */
function getFrequencyLabel(frequency: string): string {
  const option = FREQUENCY_OPTIONS.find((opt) => opt.value === frequency);
  return option ? option.label : frequency;
}

/**
 * Get duration label
 */
function getDurationLabel(duration: string): string {
  const option = DURATION_OPTIONS.find((opt) => opt.value === duration);
  return option ? option.label : duration;
}

/**
 * Get mood impact label
 */
function getMoodImpactLabel(impact: string): string {
  const option = MOOD_IMPACT_OPTIONS.find((opt) => opt.value === impact);
  return option ? option.label : impact;
}

/**
 * Safe text extraction with fallback
 */
function safeText(text: string | undefined | null, fallback: string = 'Niet ingevuld'): string {
  return text && text.trim() !== '' ? text.trim() : fallback;
}

// ============================================================================
// SECTION MAPPERS
// ============================================================================

/**
 * Map to HHSB Hulpvraag (Help Question) - Based on SCEGS Goals Data
 */
function mapToHulpvraag(data: PreIntakeQuestionnaireData): string {
  const { goals } = data;

  let hulpvraag = '**Hulpvraag van de Patiënt**\n\n';

  // S - Somatisch: Treatment goals
  hulpvraag += `**Behandeldoelen:**\n${safeText(goals.treatmentGoals)}\n\n`;

  // C - Cognitief: Thoughts on cause
  hulpvraag += `**Gedachten over de oorzaak:**\n${safeText(goals.thoughtsOnCause)}\n\n`;

  // E - Emotioneel: Mood impact
  hulpvraag += `**Invloed op stemming:**\n${getMoodImpactLabel(goals.moodImpact)}\n\n`;

  // G/S - Gedragsmatig/Sociaal: Limited activities
  hulpvraag += `**Activiteiten die niet meer mogelijk zijn:**\n${safeText(goals.limitedActivities)}`;

  return hulpvraag;
}

/**
 * Map to HHSB Historie (History) - Based on LOFTIG and Medical History
 */
function mapToHistorie(data: PreIntakeQuestionnaireData): string {
  const { complaint, medicalHistory, personalia } = data;

  let historie = '**Anamnese en Historie**\n\n';

  // Patient demographics
  const age = calculateAge(personalia.birthDate);
  historie += `**Patiënt:** ${age} jaar oud\n\n`;

  // L - Locatie (Location)
  historie += `**Locatie van de klacht:**\n${formatBodyLocations(complaint.locations)}\n\n`;

  // O - Ontstaan (Onset)
  historie += `**Hoe de klacht is ontstaan:**\n${safeText(complaint.onset)}\n\n`;

  // F - Frequentie (Frequency)
  historie += `**Frequentie:**\n${getFrequencyLabel(complaint.frequency)}\n\n`;

  // T - Tijdsduur (Duration)
  historie += `**Duur van de klacht:**\n${getDurationLabel(complaint.duration)}\n\n`;

  // G - Geschiedenis (History)
  if (complaint.hasOccurredBefore) {
    historie += `**Eerdere voorvallen:**\nJa. ${safeText(complaint.previousOccurrenceDetails, 'Geen details verstrekt.')}\n\n`;
  } else {
    historie += `**Eerdere voorvallen:**\nNee, dit is de eerste keer.\n\n`;
  }

  // Medical history
  historie += `**Medische Voorgeschiedenis:**\n`;

  if (medicalHistory.hasRecentSurgeries) {
    historie += `- Recente operaties: ${safeText(medicalHistory.surgeryDetails, 'Niet gespecificeerd')}\n`;
  }

  if (medicalHistory.takesMedication && medicalHistory.medications && medicalHistory.medications.length > 0) {
    historie += `- Medicatie: ${medicalHistory.medications.join(', ')}\n`;
  }

  if (medicalHistory.otherConditions && medicalHistory.otherConditions.trim() !== '') {
    historie += `- Andere aandoeningen: ${medicalHistory.otherConditions.trim()}\n`;
  }

  historie += `- Roken: ${medicalHistory.smokingStatus === 'yes' ? 'Ja' : medicalHistory.smokingStatus === 'stopped' ? 'Gestopt' : 'Nee'}\n`;
  historie += `- Alcohol: ${medicalHistory.alcoholConsumption === 'never' ? 'Nooit' : medicalHistory.alcoholConsumption === 'regularly' ? 'Regelmatig' : 'Soms'}`;

  return historie;
}

/**
 * Map to HHSB Stoornissen (Impairments) - Based on Complaint Intensity and Description
 */
function mapToStoornissen(data: PreIntakeQuestionnaireData): string {
  const { complaint } = data;

  let stoornissen = '**Stoornissen (Impairments)**\n\n';

  // I - Intensiteit (Intensity) from LOFTIG
  stoornissen += `**Pijnintensiteit (VAS):**\n${complaint.intensity}/10`;

  // Pain description
  if (complaint.intensity >= 7) {
    stoornissen += ' (Ernstige pijn)';
  } else if (complaint.intensity >= 4) {
    stoornissen += ' (Matige pijn)';
  } else if (complaint.intensity > 0) {
    stoornissen += ' (Lichte pijn)';
  } else {
    stoornissen += ' (Geen pijn)';
  }

  stoornissen += '\n\n';

  // Location-specific impairments
  stoornissen += `**Aangedane regio's:**\n${formatBodyLocations(complaint.locations)}\n\n`;

  // Frequency as impairment indicator
  stoornissen += `**Frequentie van symptomen:**\n${getFrequencyLabel(complaint.frequency)}`;

  return stoornissen;
}

/**
 * Map to HHSB Beperkingen (Limitations) - Based on Functional Limitations
 */
function mapToBeperkingen(data: PreIntakeQuestionnaireData): string {
  const { functionalLimitations } = data;

  let beperkingen = '**Beperkingen (Limitations)**\n\n';

  if (!functionalLimitations.limitedActivityCategories || functionalLimitations.limitedActivityCategories.length === 0) {
    beperkingen += 'Geen specifieke beperkingen aangegeven.';
    return beperkingen;
  }

  beperkingen += '**Beperkte activiteiten:**\n';

  functionalLimitations.limitedActivityCategories.forEach((activity) => {
    const severity = functionalLimitations.severityScores?.[activity] ?? 0;
    const activityLabel = activity === 'other' && functionalLimitations.customActivity
      ? functionalLimitations.customActivity
      : activity.charAt(0).toUpperCase() + activity.slice(1);

    beperkingen += `- ${activityLabel}: Beperking ${severity}/10`;

    if (severity >= 7) {
      beperkingen += ' (Ernstig beperkt)';
    } else if (severity >= 4) {
      beperkingen += ' (Matig beperkt)';
    } else if (severity > 0) {
      beperkingen += ' (Licht beperkt)';
    }

    beperkingen += '\n';
  });

  return beperkingen;
}

/**
 * Generate anamnese summary (concise overview)
 */
function generateAnamneseSummary(data: PreIntakeQuestionnaireData): string {
  const age = calculateAge(data.personalia.birthDate);
  const locations = formatBodyLocations(data.complaint.locations);
  const duration = getDurationLabel(data.complaint.duration);
  const intensity = data.complaint.intensity;

  return `${age}-jarige patiënt met klachten ter hoogte van ${locations}, bestaande sinds ${duration.toLowerCase()}, met een pijnintensiteit van ${intensity}/10.`;
}

/**
 * Generate full structured text (complete HHSB document)
 */
function generateFullStructuredText(hhsb: HHSBStructure): string {
  return `
${hhsb.hulpvraag}

---

${hhsb.historie}

---

${hhsb.stoornissen}

---

${hhsb.beperkingen}
  `.trim();
}

// ============================================================================
// MAIN MAPPER FUNCTION
// ============================================================================

/**
 * Map questionnaire data to HHSB structure
 *
 * @param questionnaireData - Complete pre-intake questionnaire data
 * @returns HHSB-structured anamnesis data
 */
export function mapToHHSB(
  questionnaireData: PreIntakeQuestionnaireData
): Omit<PreIntakeHHSBData, 'sourceData' | 'detectedRedFlags' | 'structuredAt'> {
  // Validate input
  if (!questionnaireData) {
    throw new Error('Questionnaire data is required for HHSB mapping');
  }

  // Map each HHSB section
  const hulpvraag = mapToHulpvraag(questionnaireData);
  const historie = mapToHistorie(questionnaireData);
  const stoornissen = mapToStoornissen(questionnaireData);
  const beperkingen = mapToBeperkingen(questionnaireData);

  // Generate summary and full text
  const anamneseSummary = generateAnamneseSummary(questionnaireData);

  const hhsbStructure: HHSBStructure = {
    hulpvraag,
    historie,
    stoornissen,
    beperkingen,
    anamneseSummary,
    redFlags: [], // Will be populated by red flags detector
    fullStructuredText: '', // Will be populated below
  };

  hhsbStructure.fullStructuredText = generateFullStructuredText(hhsbStructure);

  return hhsbStructure;
}

/**
 * Map questionnaire data to HHSB with metadata
 *
 * @param questionnaireData - Complete pre-intake questionnaire data
 * @param redFlags - Detected red flags
 * @returns Complete PreIntakeHHSBData with source and metadata
 */
export function mapToHHSBWithMetadata(
  questionnaireData: PreIntakeQuestionnaireData,
  redFlags: any[] = []
): Omit<PreIntakeHHSBData, 'detectedRedFlags'> & { detectedRedFlags: any[] } {
  const hhsbStructure = mapToHHSB(questionnaireData);

  return {
    ...hhsbStructure,
    sourceData: questionnaireData,
    detectedRedFlags: redFlags,
    structuredAt: new Date().toISOString(),
  };
}

/**
 * Extract key information for therapist summary card
 *
 * @param questionnaireData - Complete pre-intake questionnaire data
 * @returns Extracted key information for quick preview
 */
export function extractKeySummary(questionnaireData: PreIntakeQuestionnaireData) {
  const age = calculateAge(questionnaireData.personalia.birthDate);
  const primaryLocation = questionnaireData.complaint.locations[0]
    ? BODY_REGION_LABELS[questionnaireData.complaint.locations[0]]
    : 'Niet ingevuld';
  const painScore = questionnaireData.complaint.intensity;
  const duration = getDurationLabel(questionnaireData.complaint.duration);

  return {
    age,
    primaryLocation,
    painScore,
    duration,
    hasMultipleLocations: questionnaireData.complaint.locations.length > 1,
    locationCount: questionnaireData.complaint.locations.length,
  };
}