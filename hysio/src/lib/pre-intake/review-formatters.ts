/**
 * Review Data Formatters
 *
 * Utilities for formatting questionnaire data for display in review screens
 * and export documents. Handles localization, date formatting, and data presentation.
 *
 * @module lib/pre-intake/review-formatters
 */

import type {
  PreIntakeQuestionnaireData,
  PersonaliaData,
  ComplaintData,
  RedFlagsData,
  MedicalHistoryData,
  GoalsData,
  FunctionalLimitationsData,
  BodyRegion,
} from '@/types/pre-intake';
import { ACTIVITY_CATEGORIES, BASE_RED_FLAGS } from './constants';

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date to Dutch locale (DD-MM-YYYY)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// ============================================================================
// BODY REGION FORMATTING
// ============================================================================

const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Hoofd',
  neck: 'Nek',
  'shoulder-left': 'Schouder links',
  'shoulder-right': 'Schouder rechts',
  'arm-left': 'Arm links',
  'arm-right': 'Arm rechts',
  'elbow-left': 'Elleboog links',
  'elbow-right': 'Elleboog rechts',
  'hand-left': 'Hand links',
  'hand-right': 'Hand rechts',
  'upper-back': 'Bovenrug',
  'lower-back': 'Onderrug',
  chest: 'Borst',
  abdomen: 'Buik',
  'hip-left': 'Heup links',
  'hip-right': 'Heup rechts',
  'leg-left': 'Been links',
  'leg-right': 'Been rechts',
  'knee-left': 'Knie links',
  'knee-right': 'Knie rechts',
  'ankle-left': 'Enkel links',
  'ankle-right': 'Enkel rechts',
  'foot-left': 'Voet links',
  'foot-right': 'Voet rechts',
};

export function formatBodyRegion(region: BodyRegion): string {
  return BODY_REGION_LABELS[region] || region;
}

export function formatBodyRegions(regions: BodyRegion[]): string {
  if (!regions || regions.length === 0) return 'Geen locaties geselecteerd';
  return regions.map((r) => formatBodyRegion(r)).join(', ');
}

// ============================================================================
// PERSONALIA FORMATTING
// ============================================================================

export interface FormattedPersonalia {
  fullName: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  insurance?: string;
  insuranceNumber?: string;
}

export function formatPersonalia(data: PersonaliaData): FormattedPersonalia {
  return {
    fullName: data.fullName || '-',
    gender: data.gender === 'man' ? 'Man' : data.gender === 'vrouw' ? 'Vrouw' : '-',
    birthDate: formatDate(data.birthDate),
    phone: data.phone || '-',
    email: data.email || '-',
    insurance: data.insurance || undefined,
    insuranceNumber: data.insuranceNumber || undefined,
  };
}

// ============================================================================
// RED FLAGS FORMATTING
// ============================================================================

export interface FormattedRedFlag {
  question: string;
  answer: 'Ja' | 'Nee';
  positive: boolean;
}

export function formatRedFlags(data: RedFlagsData): {
  baseFlags: FormattedRedFlag[];
  regionFlags: FormattedRedFlag[];
  hasPositiveFlags: boolean;
} {
  const baseFlags: FormattedRedFlag[] = BASE_RED_FLAGS.map((flag) => ({
    question: flag.question,
    answer: (data as any)[flag.key] === true ? 'Ja' : 'Nee',
    positive: (data as any)[flag.key] === true,
  }));

  const regionFlags: FormattedRedFlag[] = [];
  if (data.regionSpecific) {
    Object.entries(data.regionSpecific).forEach(([key, value]) => {
      // Find the question text from constants if available
      const question = key.replace(/_/g, ' ');
      regionFlags.push({
        question,
        answer: value ? 'Ja' : 'Nee',
        positive: value,
      });
    });
  }

  const hasPositiveFlags =
    baseFlags.some((f) => f.positive) || regionFlags.some((f) => f.positive);

  return { baseFlags, regionFlags, hasPositiveFlags };
}

// ============================================================================
// MEDICAL HISTORY FORMATTING
// ============================================================================

export interface FormattedMedicalHistory {
  hasRecentSurgeries: string;
  surgeryDetails?: string;
  takesMedication: string;
  medications?: string[];
  otherConditions?: string;
  smokingStatus: string;
  alcoholConsumption: string;
}

export function formatMedicalHistory(data: MedicalHistoryData): FormattedMedicalHistory {
  const smokingLabels = {
    yes: 'Ja',
    no: 'Nee',
    stopped: 'Gestopt',
  };

  const alcoholLabels = {
    never: 'Nooit',
    sometimes: 'Soms',
    regularly: 'Regelmatig',
  };

  return {
    hasRecentSurgeries: data.hasRecentSurgeries ? 'Ja' : 'Nee',
    surgeryDetails: data.surgeryDetails || undefined,
    takesMedication: data.takesMedication ? 'Ja' : 'Nee',
    medications:
      data.medications && data.medications.length > 0 ? data.medications : undefined,
    otherConditions: data.otherConditions || undefined,
    smokingStatus: smokingLabels[data.smokingStatus] || data.smokingStatus,
    alcoholConsumption: alcoholLabels[data.alcoholConsumption] || data.alcoholConsumption,
  };
}

// ============================================================================
// COMPLAINT FORMATTING
// ============================================================================

const FREQUENCY_LABELS = {
  constant: 'Constant',
  daily: 'Dagelijks',
  weekly: 'Wekelijks',
  occasionally: 'Af en toe',
};

const DURATION_LABELS = {
  '<1week': 'Minder dan 1 week',
  '1-4weeks': '1-4 weken',
  '1-3months': '1-3 maanden',
  '>3months': 'Meer dan 3 maanden',
};

export interface FormattedComplaint {
  locations: string;
  mainComplaint: string;
  frequency: string;
  duration: string;
  intensity: string;
  hasOccurredBefore: string;
  previousOccurrenceDetails?: string;
}

export function formatComplaint(data: ComplaintData): FormattedComplaint {
  return {
    locations: formatBodyRegions(data.locations),
    mainComplaint: data.mainComplaint || '-',
    frequency: FREQUENCY_LABELS[data.frequency] || data.frequency,
    duration: DURATION_LABELS[data.duration] || data.duration,
    intensity: `${data.intensity}/10`,
    hasOccurredBefore: data.hasOccurredBefore ? 'Ja' : 'Nee',
    previousOccurrenceDetails: data.previousOccurrenceDetails || undefined,
  };
}

// ============================================================================
// GOALS FORMATTING
// ============================================================================

const MOOD_LABELS = {
  not: 'Niet',
  little: 'Een beetje',
  moderate: 'Matig',
  much: 'Veel',
};

export interface FormattedGoals {
  treatmentGoals: string;
  thoughtsOnCause: string;
  moodImpact: string;
  limitedActivities: string;
}

export function formatGoals(data: GoalsData): FormattedGoals {
  return {
    treatmentGoals: data.treatmentGoals || '-',
    thoughtsOnCause: data.thoughtsOnCause || '-',
    moodImpact: MOOD_LABELS[data.moodImpact as keyof typeof MOOD_LABELS] || data.moodImpact,
    limitedActivities: data.limitedActivities || '-',
  };
}

// ============================================================================
// FUNCTIONAL LIMITATIONS (PSK) FORMATTING
// ============================================================================

export interface FormattedLimitation {
  activity: string;
  severity: number;
  severityLabel: string;
}

export function formatFunctionalLimitations(
  data: FunctionalLimitationsData
): FormattedLimitation[] {
  if (!data.limitedActivityCategories || data.limitedActivityCategories.length === 0) {
    return [];
  }

  return data.limitedActivityCategories.map((category) => {
    const activityLabel =
      category === 'other' && data.customActivity
        ? data.customActivity
        : ACTIVITY_CATEGORIES.find((a) => a.value === category)?.label || category;

    const severity = data.severityScores?.[category] || 0;

    let severityLabel = 'Niet beperkt';
    if (severity > 0 && severity <= 3) severityLabel = 'Licht beperkt';
    else if (severity > 3 && severity <= 6) severityLabel = 'Matig beperkt';
    else if (severity > 6 && severity <= 9) severityLabel = 'Ernstig beperkt';
    else if (severity === 10) severityLabel = 'Volledig beperkt';

    return {
      activity: activityLabel,
      severity,
      severityLabel,
    };
  });
}

// ============================================================================
// COMPLETE FORMATTING
// ============================================================================

export interface FormattedPreIntakeData {
  personalia: FormattedPersonalia;
  redFlags: ReturnType<typeof formatRedFlags>;
  medicalHistory: FormattedMedicalHistory;
  complaint: FormattedComplaint;
  goals: FormattedGoals;
  functionalLimitations: FormattedLimitation[];
}

export function formatPreIntakeData(
  data: Partial<PreIntakeQuestionnaireData>
): Partial<FormattedPreIntakeData> {
  const formatted: Partial<FormattedPreIntakeData> = {};

  if (data.personalia) {
    formatted.personalia = formatPersonalia(data.personalia);
  }

  if (data.redFlags) {
    formatted.redFlags = formatRedFlags(data.redFlags);
  }

  if (data.medicalHistory) {
    formatted.medicalHistory = formatMedicalHistory(data.medicalHistory);
  }

  if (data.complaint) {
    formatted.complaint = formatComplaint(data.complaint);
  }

  if (data.goals) {
    formatted.goals = formatGoals(data.goals);
  }

  if (data.functionalLimitations) {
    formatted.functionalLimitations = formatFunctionalLimitations(data.functionalLimitations);
  }

  return formatted;
}
