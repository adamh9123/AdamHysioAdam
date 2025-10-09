/**
 * TypeScript Type Definitions for Hysio Pre-intake Module
 *
 * This module provides comprehensive type safety for the pre-intake questionnaire,
 * HHSB data structuring, red flags detection, and consent management.
 *
 * @module types/pre-intake
 */

import type { PatientInfo, HHSBStructure } from './api';

// ============================================================================
// QUESTIONNAIRE DATA TYPES (Patient Input)
// ============================================================================

/**
 * Personal information section (Personalia)
 */
export interface PersonaliaData {
  /** Patient's full name */
  fullName: string;
  /** Patient's gender */
  gender: 'man' | 'vrouw';
  /** Date of birth in ISO 8601 format (YYYY-MM-DD) */
  birthDate: string;
  /** Contact phone number */
  phone: string;
  /** Email address */
  email: string;
  /** Insurance provider name (optional) */
  insurance?: string;
  /** Optional insurance number */
  insuranceNumber?: string;
}

/**
 * Body region selection for pain location
 */
export type BodyRegion =
  | 'head'
  | 'neck'
  | 'shoulder-left'
  | 'shoulder-right'
  | 'arm-left'
  | 'arm-right'
  | 'elbow-left'
  | 'elbow-right'
  | 'hand-left'
  | 'hand-right'
  | 'upper-back'
  | 'lower-back'
  | 'chest'
  | 'abdomen'
  | 'hip-left'
  | 'hip-right'
  | 'leg-left'
  | 'leg-right'
  | 'knee-left'
  | 'knee-right'
  | 'ankle-left'
  | 'ankle-right'
  | 'foot-left'
  | 'foot-right';

/**
 * Complaint section following LOFTIG framework
 * L - Locatie (Location)
 * O - Ontstaan (Onset)
 * F - Frequentie (Frequency)
 * T - Tijdsduur (Duration)
 * I - Intensiteit (Intensity)
 * G - Geschiedenis (History)
 */
export interface ComplaintData {
  /** L - Selected body regions where pain/complaint is located */
  locations: BodyRegion[];
  /** O - Main complaint description (can include voice transcription) */
  mainComplaint: string;
  /** F - How often the complaint occurs */
  frequency: 'constant' | 'daily' | 'weekly' | 'occasionally';
  /** T - How long the complaint has been present */
  duration: '<1week' | '1-4weeks' | '1-3months' | '>3months';
  /** I - Pain intensity on VAS scale (0-10) */
  intensity: number;
  /** G - Whether this complaint has occurred before */
  hasOccurredBefore: boolean;
  /** G - Details about previous occurrences (if applicable) */
  previousOccurrenceDetails?: string;
}

/**
 * Red flags screening following DTF (Directe Toegang Fysiotherapie) guidelines
 */
export interface RedFlagsData {
  /** Unexplained weight loss */
  unexplainedWeightLoss: boolean;
  /** Night sweats or fever */
  nightSweatsOrFever: boolean;
  /** Bladder or bowel problems */
  bladderBowelProblems: boolean;
  /** Feeling very ill or weak */
  feelingVeryIll: boolean;
  /** Pain that doesn't decrease with rest */
  painNotDecreasingWithRest: boolean;
  /** Region-specific red flags (dynamically added based on body location) */
  regionSpecific?: Record<string, boolean>;
}

/**
 * Medical history section
 */
export interface MedicalHistoryData {
  /** Recent surgeries */
  hasRecentSurgeries: boolean;
  /** Surgery details */
  surgeryDetails?: string;
  /** Currently taking medication */
  takesMedication: boolean;
  /** List of medications */
  medications?: string[];
  /** Other medical conditions */
  otherConditions?: string;
  /** Smoking status */
  smokingStatus: 'yes' | 'no' | 'stopped';
  /** Alcohol consumption */
  alcoholConsumption: 'never' | 'sometimes' | 'regularly';
}

/**
 * Goals section following SCEGS framework
 * S - Somatisch (Somatic)
 * C - Cognitief (Cognitive)
 * E - Emotioneel (Emotional)
 * G - Gedragsmatig (Behavioral)
 * S - Sociaal (Social)
 */
export interface GoalsData {
  /** What the patient hopes to achieve with physiotherapy */
  treatmentGoals: string;
  /** Patient's thoughts about the cause of their complaint */
  thoughtsOnCause: string;
  /** How the complaint affects their mood */
  moodImpact: 'not' | 'little' | 'moderate' | 'much';
  /** Activities the patient can no longer do */
  limitedActivities: string;
}

/**
 * Functional limitations section (Participation)
 */
export interface FunctionalLimitationsData {
  /** Selected activity categories that are limited */
  limitedActivityCategories: Array<
    'work' | 'sports' | 'household' | 'driving' | 'sleeping' | 'hobbies' | 'social' | 'other'
  >;
  /** Custom activity description (if 'other' is selected) - LEGACY, kept for backwards compatibility */
  customActivity?: string;
  /** Multiple custom activities (new approach supporting multiple "other" entries) */
  customActivities?: Record<string, string>; // key: unique ID, value: activity name
  /** Severity of limitation for each selected activity (0-10 scale) */
  severityScores: Record<string, number>;
}

/**
 * Complete questionnaire data structure
 */
export interface PreIntakeQuestionnaireData {
  personalia: PersonaliaData;
  complaint: ComplaintData;
  redFlags: RedFlagsData;
  medicalHistory: MedicalHistoryData;
  goals: GoalsData;
  functionalLimitations: FunctionalLimitationsData;
}

// ============================================================================
// HHSB STRUCTURED DATA TYPES (Therapist View)
// ============================================================================

/**
 * HHSB-structured anamnesis data for therapist consumption
 * Extends the base HHSBStructure from api.ts
 */
export interface PreIntakeHHSBData extends HHSBStructure {
  /** Source questionnaire data reference */
  sourceData: PreIntakeQuestionnaireData;
  /** Detected red flags with severity */
  detectedRedFlags: RedFlag[];
  /** Timestamp of data structuring */
  structuredAt: string;
}

// ============================================================================
// RED FLAGS TYPES
// ============================================================================

/**
 * Red flag severity levels following clinical guidelines
 */
export type RedFlagSeverity = 'emergency' | 'urgent' | 'referral';

/**
 * Individual red flag detection result
 */
export interface RedFlag {
  /** Type/category of red flag */
  type: string;
  /** Severity level */
  severity: RedFlagSeverity;
  /** Human-readable description */
  description: string;
  /** Specific question/field that triggered this flag */
  triggeredBy: string;
  /** Recommended action */
  recommendation?: string;
}

// ============================================================================
// SUBMISSION AND METADATA TYPES
// ============================================================================

/**
 * Submission status enum
 */
export type PreIntakeStatus = 'draft' | 'submitted' | 'reviewed' | 'imported';

/**
 * Detected red flag summary for UI display
 */
export interface DetectedRedFlag {
  type: string;
  severity: RedFlagSeverity;
  recommendation?: string;
}

/**
 * Complete pre-intake submission with metadata
 */
export interface PreIntakeSubmission {
  /** Unique submission ID (UUID) */
  id: string;
  /** Session ID for draft tracking (UUID) */
  sessionId: string;
  /** Patient ID reference */
  patientId: string;
  /** Assigned therapist ID */
  therapistId: string;
  /** Raw questionnaire data */
  questionnaireData: PreIntakeQuestionnaireData;
  /** Processed HHSB structured data */
  hhsbStructuredData: PreIntakeHHSBData;
  /** Detected red flags */
  redFlags: RedFlag[];
  /** Summary of detected red flags for quick display */
  redFlagsSummary: DetectedRedFlag[];
  /** Whether this submission has been processed to HHSB */
  isProcessed: boolean;
  /** Current status */
  status: PreIntakeStatus;
  /** Whether consent was given */
  consentGiven: boolean;
  /** Timestamp of submission (ISO 8601) */
  submittedAt: string;
  /** Timestamp of creation (ISO 8601) */
  createdAt: string;
  /** Timestamp of last update (ISO 8601) */
  updatedAt: string;
  /** Timestamp when imported to Scribe (if applicable) */
  importedAt?: string;
}

/**
 * Draft pre-intake data (auto-saved progress)
 */
export interface PreIntakeDraft {
  /** Unique draft ID (UUID) */
  id: string;
  /** Session ID (UUID) */
  sessionId: string;
  /** Partial questionnaire data */
  questionnaireData: Partial<PreIntakeQuestionnaireData>;
  /** Current step in the questionnaire */
  currentStep: number;
  /** Timestamp of last save (ISO 8601) */
  lastSavedAt: string;
  /** Expiration timestamp (ISO 8601, 30 days after creation) */
  expiresAt: string;
}

// ============================================================================
// CONSENT MANAGEMENT TYPES
// ============================================================================

/**
 * Consent log entry for audit trail
 */
export interface ConsentLogEntry {
  /** Unique consent log ID (UUID) */
  id: string;
  /** Associated pre-intake submission ID */
  preIntakeId: string;
  /** Patient ID */
  patientId: string;
  /** Timestamp when consent was given (ISO 8601) */
  consentGivenAt: string;
  /** IP address of patient (for security audit) */
  ipAddress: string;
  /** User agent string (browser/device info) */
  userAgent: string;
  /** Exact consent text shown to patient (immutable) */
  consentText: string;
  /** SHA-256 hash of consent event for immutability verification */
  auditHash: string;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Request body for saving draft
 */
export interface SaveDraftRequest {
  sessionId: string;
  questionnaireData: Partial<PreIntakeQuestionnaireData>;
  currentStep: number;
}

/**
 * Response for save draft API
 */
export interface SaveDraftResponse {
  success: boolean;
  lastSavedAt: string;
  error?: string;
}

/**
 * Request body for final submission
 */
export interface SubmitPreIntakeRequest {
  sessionId: string;
  questionnaireData: PreIntakeQuestionnaireData;
  consentGiven: boolean;
}

/**
 * Response for submission API
 */
export interface SubmitPreIntakeResponse {
  success: boolean;
  submissionId: string;
  redirectUrl: string;
  error?: string;
}

/**
 * Request body for HHSB processing
 */
export interface ProcessHHSBRequest {
  submissionId: string;
}

/**
 * Response for HHSB processing API
 */
export interface ProcessHHSBResponse {
  success: boolean;
  hhsbData: PreIntakeHHSBData;
  redFlags: RedFlag[];
  error?: string;
}

/**
 * Request body for importing to Scribe
 */
export interface ImportPreIntakeRequest {
  preIntakeId: string;
}

/**
 * Response for import API
 */
export interface ImportPreIntakeResponse {
  success: boolean;
  patientInfo: PatientInfo;
  hhsbData: PreIntakeHHSBData;
  redFlags: RedFlag[];
  submittedAt: string;
  error?: string;
}

// ============================================================================
// UI STATE TYPES (for Zustand store)
// ============================================================================

/**
 * Questionnaire step names
 */
export type QuestionnaireStep =
  | 'welcome'
  | 'personalia'
  | 'complaint'
  | 'redFlags'
  | 'medicalHistory'
  | 'goals'
  | 'functionalLimitations'
  | 'review'
  | 'consent'
  | 'export';

/**
 * Pre-intake store state
 */
export interface PreIntakeStoreState {
  /** Current step in the questionnaire */
  currentStep: QuestionnaireStep;
  /** Questionnaire data */
  questionnaireData: Partial<PreIntakeQuestionnaireData>;
  /** Session ID */
  sessionId: string | null;
  /** Whether data has been modified since last save */
  isDirty: boolean;
  /** Timestamp of last save */
  lastSavedAt: string | null;
  /** Validation errors by field */
  errors: Record<string, string>;
  /** Whether currently saving */
  isSaving: boolean;
  /** Whether currently submitting */
  isSubmitting: boolean;
}

/**
 * Pre-intake store actions
 */
export interface PreIntakeStoreActions {
  setCurrentStep: (step: QuestionnaireStep) => void;
  updateQuestionData: (section: keyof PreIntakeQuestionnaireData, data: any) => void;
  saveProgress: () => Promise<void>;
  loadDraft: (sessionId: string) => Promise<void>;
  submitQuestionnaire: () => Promise<string>; // Returns submission ID
  resetQuestionnaire: () => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * Pre-intake export format options
 */
export type PreIntakeExportFormat = 'pdf' | 'docx' | 'html' | 'txt' | 'json';

/**
 * Pre-intake export options
 */
export interface PreIntakeExportOptions {
  format: PreIntakeExportFormat;
  includeRawResponses?: boolean;
  includeRedFlags?: boolean;
  includeTimestamps?: boolean;
}