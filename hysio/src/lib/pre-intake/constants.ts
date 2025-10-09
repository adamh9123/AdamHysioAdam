/**
 * Constants and Configuration for Hysio Pre-intake Module
 *
 * Centralized definitions for questionnaire content, body regions,
 * red flags criteria, and framework mappings (LOFTIG, SCEGS, DTF).
 *
 * @module lib/pre-intake/constants
 */

import type { BodyRegion, QuestionnaireStep, RedFlagSeverity } from '@/types/pre-intake';

// ============================================================================
// QUESTIONNAIRE CONFIGURATION
// ============================================================================

/**
 * Ordered list of questionnaire steps for flow navigation
 */
export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  'welcome',
  'personalia',
  'complaint',
  'redFlags',
  'medicalHistory',
  'goals',
  'functionalLimitations',
  'review',
  'consent',
  'export',
];

/**
 * Step labels in Dutch (B1 language level)
 */
export const STEP_LABELS: Record<QuestionnaireStep, string> = {
  welcome: 'Welkom',
  personalia: 'Persoonlijke Gegevens',
  complaint: 'Uw Klacht',
  redFlags: 'Screeningsvragen',
  medicalHistory: 'Medische Achtergrond',
  goals: 'Uw Doelen',
  functionalLimitations: 'Patiënt Specifieke Klachtenlijst (PSK)',
  review: 'Controleren',
  consent: 'Toestemming',
  export: 'Verzenden & Exporteren',
};

/**
 * Total number of steps (for progress calculation)
 */
export const TOTAL_STEPS = QUESTIONNAIRE_STEPS.length;

// ============================================================================
// BODY MAP REGIONS
// ============================================================================

/**
 * All available body regions for pain location selection
 */
export const BODY_REGIONS: BodyRegion[] = [
  'head',
  'neck',
  'shoulder-left',
  'shoulder-right',
  'arm-left',
  'arm-right',
  'elbow-left',
  'elbow-right',
  'hand-left',
  'hand-right',
  'upper-back',
  'lower-back',
  'chest',
  'abdomen',
  'hip-left',
  'hip-right',
  'leg-left',
  'leg-right',
  'knee-left',
  'knee-right',
  'ankle-left',
  'ankle-right',
  'foot-left',
  'foot-right',
];

/**
 * Body region labels in Dutch
 */
export const BODY_REGION_LABELS: Record<BodyRegion, string> = {
  head: 'Hoofd',
  neck: 'Nek',
  'shoulder-left': 'Schouder Links',
  'shoulder-right': 'Schouder Rechts',
  'arm-left': 'Arm Links',
  'arm-right': 'Arm Rechts',
  'elbow-left': 'Elleboog Links',
  'elbow-right': 'Elleboog Rechts',
  'hand-left': 'Hand Links',
  'hand-right': 'Hand Rechts',
  'upper-back': 'Bovenrug',
  'lower-back': 'Onderrug',
  chest: 'Borst',
  abdomen: 'Buik',
  'hip-left': 'Heup Links',
  'hip-right': 'Heup Rechts',
  'leg-left': 'Been Links',
  'leg-right': 'Been Rechts',
  'knee-left': 'Knie Links',
  'knee-right': 'Knie Rechts',
  'ankle-left': 'Enkel Links',
  'ankle-right': 'Enkel Rechts',
  'foot-left': 'Voet Links',
  'foot-right': 'Voet Rechts',
};

// ============================================================================
// LOFTIG FRAMEWORK
// ============================================================================

/**
 * Frequency options (F in LOFTIG)
 */
export const FREQUENCY_OPTIONS = [
  { value: 'constant', label: 'Constant' },
  { value: 'daily', label: 'Dagelijks' },
  { value: 'weekly', label: 'Wekelijks' },
  { value: 'occasionally', label: 'Af en toe' },
] as const;

/**
 * Duration options (T in LOFTIG)
 */
export const DURATION_OPTIONS = [
  { value: '<1week', label: 'Minder dan 1 week' },
  { value: '1-4weeks', label: '1 tot 4 weken' },
  { value: '1-3months', label: '1 tot 3 maanden' },
  { value: '>3months', label: 'Meer dan 3 maanden' },
] as const;

// ============================================================================
// RED FLAGS (DTF - Directe Toegang Fysiotherapie)
// ============================================================================

/**
 * Base red flags questions (always asked)
 */
export const BASE_RED_FLAGS = [
  {
    key: 'unexplainedWeightLoss',
    question: 'Heeft u onverklaarbaar gewichtsverlies?',
    severity: 'emergency' as RedFlagSeverity,
    type: 'unexplained_weight_loss',
    recommendation: 'Doorverwijzing naar huisarts voor nader onderzoek',
  },
  {
    key: 'nightSweatsOrFever',
    question: 'Heeft u last van nachtelijk zweten of koorts?',
    severity: 'urgent' as RedFlagSeverity,
    type: 'systemic_symptoms',
    recommendation: 'Overleg met huisarts binnen 24 uur',
  },
  {
    key: 'bladderBowelProblems',
    question: 'Heeft u problemen met plassen of ontlasting?',
    severity: 'emergency' as RedFlagSeverity,
    type: 'cauda_equina',
    recommendation: 'Directe doorverwijzing naar spoedeisende hulp',
  },
  {
    key: 'feelingVeryIll',
    question: 'Voelt u zich zeer ziek of zwak?',
    severity: 'urgent' as RedFlagSeverity,
    type: 'general_malaise',
    recommendation: 'Overleg met huisarts',
  },
  {
    key: 'painNotDecreasingWithRest',
    question: 'Heeft u pijn die niet vermindert bij rust?',
    severity: 'referral' as RedFlagSeverity,
    type: 'unrelenting_pain',
    recommendation: 'Medische evaluatie adviseren',
  },
] as const;

/**
 * Region-specific red flags (conditional based on body region selection)
 */
export const REGION_SPECIFIC_RED_FLAGS: Record<
  string,
  Array<{
    key: string;
    question: string;
    severity: RedFlagSeverity;
    type: string;
    recommendation: string;
  }>
> = {
  chest: [
    {
      key: 'chestPainWithShortness',
      question: 'Heeft u pijn op de borst samen met kortademigheid?',
      severity: 'emergency',
      type: 'cardiac_respiratory',
      recommendation: 'Directe doorverwijzing naar spoedeisende hulp',
    },
  ],
  head: [
    {
      key: 'suddenSevereHeadache',
      question: 'Heeft u plotselinge, ernstige hoofdpijn?',
      severity: 'emergency',
      type: 'neurological',
      recommendation: 'Directe medische evaluatie vereist',
    },
  ],
  'lower-back': [
    {
      key: 'saddleAnesthesia',
      question: 'Heeft u gevoelsverlies in het zitvlak of genstreek?',
      severity: 'emergency',
      type: 'cauda_equina',
      recommendation: 'Directe doorverwijzing naar spoedeisende hulp',
    },
  ],
};

/**
 * Age-based red flag modifiers
 */
export const AGE_RED_FLAG_THRESHOLD = 50; // Age above which certain red flags become more severe

// ============================================================================
// SCEGS FRAMEWORK (Goals)
// ============================================================================

/**
 * Mood impact options (E in SCEGS)
 */
export const MOOD_IMPACT_OPTIONS = [
  { value: 'not', label: 'Niet' },
  { value: 'little', label: 'Weinig' },
  { value: 'moderate', label: 'Matig' },
  { value: 'much', label: 'Veel' },
] as const;

// ============================================================================
// FUNCTIONAL LIMITATIONS
// ============================================================================

/**
 * Activity categories for functional limitations
 */
export const ACTIVITY_CATEGORIES = [
  { value: 'work', label: 'Werk' },
  { value: 'sports', label: 'Sport' },
  { value: 'household', label: 'Huishouden' },
  { value: 'driving', label: 'Autorijden' },
  { value: 'sleeping', label: 'Slapen' },
  { value: 'hobbies', label: "Hobby's" },
  { value: 'social', label: 'Sociale activiteiten' },
  { value: 'other', label: 'Anders' },
] as const;

// ============================================================================
// MEDICAL HISTORY
// ============================================================================

/**
 * Smoking status options
 */
export const SMOKING_OPTIONS = [
  { value: 'yes', label: 'Ja' },
  { value: 'no', label: 'Nee' },
  { value: 'stopped', label: 'Gestopt' },
] as const;

/**
 * Alcohol consumption options
 */
export const ALCOHOL_OPTIONS = [
  { value: 'never', label: 'Nooit' },
  { value: 'sometimes', label: 'Soms' },
  { value: 'regularly', label: 'Regelmatig' },
] as const;

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum character lengths for text inputs
 */
export const MAX_LENGTHS = {
  shortText: 300,
  mediumText: 500,
  longText: 1000,
  email: 255,
  phone: 20,
  name: 100,
} as const;

/**
 * VAS pain scale range
 */
export const VAS_SCALE = {
  min: 0,
  max: 10,
  labels: {
    0: 'Geen pijn',
    5: 'Matige pijn',
    10: 'Ondraaglijke pijn',
  },
} as const;

// ============================================================================
// AUTO-SAVE CONFIGURATION
// ============================================================================

/**
 * Auto-save delay in milliseconds (30 seconds)
 */
export const AUTO_SAVE_DELAY_MS = 30000;

/**
 * Draft expiration time (30 days in milliseconds)
 */
export const DRAFT_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  draftSave: {
    requests: 10,
    windowMs: 60000, // 1 minute
  },
  submission: {
    requests: 3,
    windowMs: 3600000, // 1 hour
  },
} as const;

/**
 * API timeout in milliseconds
 */
export const API_TIMEOUT_MS = 30000; // 30 seconds

// ============================================================================
// CONSENT TEXT
// ============================================================================

/**
 * Standard consent text (B1 Dutch language level)
 */
export const CONSENT_TEXT = `
Ik geef toestemming om de ingevulde gegevens te delen met mijn fysiotherapeut.

Ik begrijp dat:
- Mijn gegevens veilig worden opgeslagen volgens AVG-richtlijnen
- Alleen mijn fysiotherapeut toegang heeft tot deze informatie
- Ik mijn toestemming op elk moment kan intrekken
- De gegevens worden gebruikt voor mijn behandeling

Voor meer informatie, zie ons privacybeleid.
`.trim();

// ============================================================================
// UI TEXT (B1 Dutch Language Level)
// ============================================================================

/**
 * Common UI messages
 */
export const UI_MESSAGES = {
  autoSaved: 'Automatisch opgeslagen',
  saving: 'Bezig met opslaan...',
  saveFailed: 'Opslaan mislukt. Probeer het opnieuw.',
  submitting: 'Bezig met verzenden...',
  submitSuccess: 'Uw gegevens zijn verzonden!',
  submitFailed: 'Verzenden mislukt. Probeer het opnieuw.',
  loadingDraft: 'Bezig met laden...',
  draftExpired: 'Uw concept is verlopen. Begin opnieuw.',
  unsavedChanges: 'U heeft niet-opgeslagen wijzigingen. Weet u zeker dat u wilt stoppen?',
  requiredField: 'Dit veld is verplicht',
  invalidEmail: 'Voer een geldig e-mailadres in',
  invalidPhone: 'Voer een geldig telefoonnummer in',
  invalidDate: 'Voer een geldige datum in',
  maxLengthExceeded: (max: number) => `Maximaal ${max} tekens toegestaan`,
  minSelectionRequired: (min: number) => `Selecteer minimaal ${min} optie(s)`,
} as const;

/**
 * Welcome screen text
 */
export const WELCOME_TEXT = {
  title: 'Welkom bij Hysio pre-intake',
  intro: 'Om u zo efficiënt en persoonlijk mogelijk te helpen, vragen we u deze intake alvast in te vullen. Zo hebben we tijdens uw eerste afspraak alle tijd voor u en uw klacht.',
  duration: 'De vragenlijst duurt ongeveer 10-15 minuten. U kunt de vragenlijst op elk moment opslaan en later verder gaan.',
  privacyNotice: 'Uw gegevens worden veilig opgeslagen en alleen gedeeld met uw fysiotherapeut.',
  startButton: 'Begin met de vragenlijst',
} as const;

/**
 * Red flags reassurance message
 */
export const RED_FLAGS_REASSURANCE = `
We bespreken dit tijdens uw afspraak. Het is belangrijk dat we alle informatie hebben om u goed te kunnen helpen.
`.trim();