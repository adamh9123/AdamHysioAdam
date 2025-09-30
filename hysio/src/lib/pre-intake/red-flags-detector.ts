/**
 * Red Flags Detection System
 *
 * Rule-based detection of red flags (warning signs) following DTF
 * (Directe Toegang Fysiotherapie) guidelines and clinical best practices.
 *
 * Identifies emergency, urgent, and referral-level concerns from questionnaire data.
 *
 * @module lib/pre-intake/red-flags-detector
 */

import type {
  PreIntakeQuestionnaireData,
  RedFlag,
  RedFlagSeverity,
  BodyRegion,
} from '@/types/pre-intake';
import { BASE_RED_FLAGS, REGION_SPECIFIC_RED_FLAGS, AGE_RED_FLAG_THRESHOLD } from './constants';

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
 * Create a red flag object
 */
function createRedFlag(
  type: string,
  severity: RedFlagSeverity,
  description: string,
  triggeredBy: string,
  recommendation?: string
): RedFlag {
  return {
    type,
    severity,
    description,
    triggeredBy,
    recommendation,
  };
}

// ============================================================================
// BASE RED FLAGS DETECTION
// ============================================================================

/**
 * Detect base (always-asked) red flags
 */
function detectBaseRedFlags(data: PreIntakeQuestionnaireData): RedFlag[] {
  const flags: RedFlag[] = [];
  const { redFlags: redFlagsData, personalia } = data;

  // Check each base red flag
  BASE_RED_FLAGS.forEach((flagDef) => {
    const key = flagDef.key as keyof typeof redFlagsData;
    const isPositive = redFlagsData[key] === true;

    if (isPositive) {
      let severity = flagDef.severity;

      // Age-based severity modification
      const age = calculateAge(personalia.birthDate);
      if (age > AGE_RED_FLAG_THRESHOLD && flagDef.key === 'unexplainedWeightLoss') {
        // Unexplained weight loss in older patients is more concerning
        severity = 'emergency';
      }

      flags.push(
        createRedFlag(
          flagDef.type,
          severity,
          flagDef.question.replace('?', '') + ' (Ja)',
          `red_flags.${flagDef.key}`,
          flagDef.recommendation
        )
      );
    }
  });

  return flags;
}

// ============================================================================
// REGION-SPECIFIC RED FLAGS DETECTION
// ============================================================================

/**
 * Detect region-specific red flags based on complaint location
 */
function detectRegionSpecificRedFlags(data: PreIntakeQuestionnaireData): RedFlag[] {
  const flags: RedFlag[] = [];
  const { complaint, redFlags: redFlagsData } = data;

  // Check each selected body region
  complaint.locations.forEach((location: BodyRegion) => {
    // Find region group (e.g., 'chest', 'head', 'lower-back')
    let regionKey: string = location;

    // Map specific locations to region groups
    if (location === 'lower-back') {
      regionKey = 'lower-back';
    } else if (location === 'head') {
      regionKey = 'head';
    } else if (location === 'chest') {
      regionKey = 'chest';
    }

    // Get region-specific flags for this location
    const regionFlags = REGION_SPECIFIC_RED_FLAGS[regionKey];

    if (regionFlags && redFlagsData.regionSpecific) {
      regionFlags.forEach((flagDef) => {
        const isPositive = redFlagsData.regionSpecific?.[flagDef.key] === true;

        if (isPositive) {
          flags.push(
            createRedFlag(
              flagDef.type,
              flagDef.severity,
              flagDef.question.replace('?', '') + ' (Ja)',
              `red_flags.regionSpecific.${flagDef.key}`,
              flagDef.recommendation
            )
          );
        }
      });
    }
  });

  return flags;
}

// ============================================================================
// COMBINATION RED FLAGS (Multiple Indicators)
// ============================================================================

/**
 * Detect red flags based on combinations of answers
 */
function detectCombinationRedFlags(data: PreIntakeQuestionnaireData): RedFlag[] {
  const flags: RedFlag[] = [];
  const { complaint, redFlags: redFlagsData, personalia } = data;

  const age = calculateAge(personalia.birthDate);

  // Age > 50 + unexplained weight loss = High concern
  if (age > AGE_RED_FLAG_THRESHOLD && redFlagsData.unexplainedWeightLoss) {
    flags.push(
      createRedFlag(
        'age_weight_loss_combo',
        'emergency',
        `Patiënt ouder dan ${AGE_RED_FLAG_THRESHOLD} jaar met onverklaarbaar gewichtsverlies`,
        'combination: age + weight_loss',
        'Directe doorverwijzing naar huisarts voor nader onderzoek (mogelijke maligniteit)'
      )
    );
  }

  // Night pain + fever = Infection concern
  if (redFlagsData.nightSweatsOrFever && complaint.frequency === 'constant') {
    flags.push(
      createRedFlag(
        'night_symptoms_infection',
        'urgent',
        'Nachtelijke symptomen (zweten/koorts) in combinatie met constante pijn',
        'combination: night_sweats + constant_pain',
        'Overleg met huisarts binnen 24 uur (mogelijke infectie)'
      )
    );
  }

  // Pain not decreasing with rest + high intensity = Serious pathology
  if (redFlagsData.painNotDecreasingWithRest && complaint.intensity >= 7) {
    flags.push(
      createRedFlag(
        'unrelenting_severe_pain',
        'urgent',
        'Pijn vermindert niet bij rust en is zeer intens (7+/10)',
        'combination: unrelenting_pain + high_intensity',
        'Medische evaluatie adviseren binnen 48 uur'
      )
    );
  }

  // Bladder/bowel problems + lower back pain = Cauda equina syndrome
  if (
    redFlagsData.bladderBowelProblems &&
    (complaint.locations.includes('lower-back') || complaint.locations.includes('hip-left') || complaint.locations.includes('hip-right'))
  ) {
    flags.push(
      createRedFlag(
        'cauda_equina_syndrome',
        'emergency',
        'Blaas-/darmprobleem in combinatie met lage rugpijn (Cauda Equina Syndroom)',
        'combination: bladder_bowel + lower_back',
        'DIRECTE doorverwijzing naar spoedeisende hulp (mogelijke Cauda Equina)'
      )
    );
  }

  return flags;
}

// ============================================================================
// DURATION-BASED RED FLAGS
// ============================================================================

/**
 * Detect red flags based on duration and lack of improvement
 */
function detectDurationRedFlags(data: PreIntakeQuestionnaireData): RedFlag[] {
  const flags: RedFlag[] = [];
  const { complaint } = data;

  // Long duration (>3 months) with high intensity and no improvement = Chronic concern
  if (complaint.duration === '>3months' && complaint.intensity >= 7 && complaint.frequency === 'constant') {
    flags.push(
      createRedFlag(
        'chronic_severe_pain',
        'referral',
        'Chronische ernstige pijn (>3 maanden, 7+/10, constant)',
        'duration: >3months + high_intensity + constant',
        'Overweeg multidisciplinaire pijnbehandeling of doorverwijzing naar pijnspecialist'
      )
    );
  }

  return flags;
}

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detect all red flags from questionnaire data
 *
 * @param questionnaireData - Complete pre-intake questionnaire data
 * @returns Array of detected red flags sorted by severity (emergency first)
 */
export function detectRedFlags(questionnaireData: PreIntakeQuestionnaireData): RedFlag[] {
  // Validate input
  if (!questionnaireData) {
    throw new Error('Questionnaire data is required for red flags detection');
  }

  const allFlags: RedFlag[] = [];

  // Run all detection functions
  allFlags.push(...detectBaseRedFlags(questionnaireData));
  allFlags.push(...detectRegionSpecificRedFlags(questionnaireData));
  allFlags.push(...detectCombinationRedFlags(questionnaireData));
  allFlags.push(...detectDurationRedFlags(questionnaireData));

  // Remove duplicates based on type
  const uniqueFlags = allFlags.filter(
    (flag, index, self) => index === self.findIndex((f) => f.type === flag.type)
  );

  // Sort by severity: emergency > urgent > referral
  const severityOrder: Record<RedFlagSeverity, number> = {
    emergency: 0,
    urgent: 1,
    referral: 2,
  };

  uniqueFlags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return uniqueFlags;
}

/**
 * Check if any emergency-level red flags are present
 *
 * @param redFlags - Array of detected red flags
 * @returns True if any emergency flags exist
 */
export function hasEmergencyFlags(redFlags: RedFlag[]): boolean {
  return redFlags.some((flag) => flag.severity === 'emergency');
}

/**
 * Check if any urgent-level red flags are present
 *
 * @param redFlags - Array of detected red flags
 * @returns True if any urgent flags exist
 */
export function hasUrgentFlags(redFlags: RedFlag[]): boolean {
  return redFlags.some((flag) => flag.severity === 'urgent');
}

/**
 * Get count of red flags by severity
 *
 * @param redFlags - Array of detected red flags
 * @returns Object with counts for each severity level
 */
export function getRedFlagCounts(redFlags: RedFlag[]): Record<RedFlagSeverity, number> {
  return {
    emergency: redFlags.filter((f) => f.severity === 'emergency').length,
    urgent: redFlags.filter((f) => f.severity === 'urgent').length,
    referral: redFlags.filter((f) => f.severity === 'referral').length,
  };
}

/**
 * Format red flags for therapist display
 *
 * @param redFlags - Array of detected red flags
 * @returns Formatted string for display
 */
export function formatRedFlagsForDisplay(redFlags: RedFlag[]): string {
  if (redFlags.length === 0) {
    return 'Geen rode vlaggen gedetecteerd.';
  }

  let output = '';

  const emergencyFlags = redFlags.filter((f) => f.severity === 'emergency');
  const urgentFlags = redFlags.filter((f) => f.severity === 'urgent');
  const referralFlags = redFlags.filter((f) => f.severity === 'referral');

  if (emergencyFlags.length > 0) {
    output += '🚨 **SPOED (Emergency):**\n';
    emergencyFlags.forEach((flag) => {
      output += `- ${flag.description}\n`;
      if (flag.recommendation) {
        output += `  ↳ ${flag.recommendation}\n`;
      }
    });
    output += '\n';
  }

  if (urgentFlags.length > 0) {
    output += '⚠️ **Dringend (Urgent):**\n';
    urgentFlags.forEach((flag) => {
      output += `- ${flag.description}\n`;
      if (flag.recommendation) {
        output += `  ↳ ${flag.recommendation}\n`;
      }
    });
    output += '\n';
  }

  if (referralFlags.length > 0) {
    output += '📋 **Doorverwijzing Overwegen (Referral):**\n';
    referralFlags.forEach((flag) => {
      output += `- ${flag.description}\n`;
      if (flag.recommendation) {
        output += `  ↳ ${flag.recommendation}\n`;
      }
    });
  }

  return output.trim();
}