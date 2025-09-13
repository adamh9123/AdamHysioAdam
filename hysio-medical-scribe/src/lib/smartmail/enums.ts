// SmartMail enum definitions for healthcare communication
// Centralized enums for recipient categories, formality levels, and communication objectives

/**
 * Healthcare recipient categories for targeted communication
 */
export enum RecipientCategory {
  COLLEAGUE = 'colleague',
  HUISARTS = 'huisarts',
  PATIENT = 'patient',
  FAMILY = 'family',
  REFERRING_PHYSICIAN = 'referring_physician',
  SUPPORT_STAFF = 'support_staff'
}

/**
 * Communication formality levels for appropriate tone
 */
export enum FormalityLevel {
  FORMAL = 'formal',
  PROFESSIONAL = 'professional',
  FRIENDLY = 'friendly',
  EMPATHETIC = 'empathetic'
}

/**
 * Primary communication objectives for healthcare contexts
 */
export enum CommunicationObjective {
  REFERRAL = 'referral',
  FOLLOW_UP = 'follow_up',
  CONSULTATION_REQUEST = 'consultation_request',
  PATIENT_EDUCATION = 'patient_education',
  TREATMENT_UPDATE = 'treatment_update',
  DIAGNOSTIC_REQUEST = 'diagnostic_request',
  DISCHARGE_SUMMARY = 'discharge_summary',
  COLLEAGUE_INQUIRY = 'colleague_inquiry',
  RED_FLAG_NOTIFICATION = 'red_flag_notification'
}

/**
 * Supported languages (following Hysio patterns)
 */
export enum SupportedLanguage {
  DUTCH = 'nl',
  ENGLISH = 'en'
}

/**
 * Patient gender options (following existing Hysio patterns)
 */
export enum PatientGender {
  MALE = 'man',
  FEMALE = 'vrouw'
}

/**
 * Urgency levels for healthcare communication
 */
export enum UrgencyLevel {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Document source types for context tracking
 */
export enum DocumentSource {
  UPLOAD = 'upload',
  SCRIBE_SESSION = 'scribe_session',
  MANUAL_INPUT = 'manual_input'
}

/**
 * Export format options for generated emails
 */
export enum ExportFormat {
  PLAIN_TEXT = 'plain_text',
  HTML = 'html',
  STRUCTURED_DATA = 'structured_data',
  PDF = 'pdf'
}

/**
 * Validation error codes for consistent error handling
 */
export enum ValidationErrorCode {
  REQUIRED = 'REQUIRED',
  INVALID_VALUE = 'INVALID_VALUE',
  INVALID_TYPE = 'INVALID_TYPE',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE'
}

/**
 * Validation warning codes for user guidance
 */
export enum ValidationWarningCode {
  MISSING_CONTEXT = 'MISSING_CONTEXT',
  URGENCY_MISMATCH = 'URGENCY_MISMATCH',
  POTENTIAL_PHI = 'POTENTIAL_PHI',
  POTENTIAL_NAME = 'POTENTIAL_NAME',
  LARGE_CONTENT = 'LARGE_CONTENT'
}

/**
 * Email suggestion types for contextual guidance
 */
export enum EmailSuggestionType {
  PRIVACY_WARNING = 'privacy_warning',
  MISSING_CONTEXT = 'missing_context',
  FORMALITY_ADJUSTMENT = 'formality_adjustment',
  MEDICAL_ACCURACY = 'medical_accuracy',
  FOLLOW_UP_ACTION = 'follow_up_action'
}

/**
 * Smart suggestion types for intelligent composition
 */
export enum SmartSuggestionType {
  TEMPLATE = 'template',
  RECIPIENT = 'recipient',
  CONTEXT = 'context',
  FOLLOW_UP = 'follow_up'
}

/**
 * Medical Scribe session phases for context integration
 */
export enum ScribeSessionPhase {
  PREPARATION = 'preparation',
  ANAMNESIS = 'anamnesis',
  EXAMINATION = 'examination',
  CONCLUSION = 'conclusion',
  COMPLETED = 'completed'
}

/**
 * Audit log action types for compliance tracking
 */
export enum AuditLogAction {
  EMAIL_GENERATED = 'email_generated',
  EMAIL_EXPORTED = 'email_exported',
  EMAIL_REVISED = 'email_revised',
  SETTINGS_CHANGED = 'settings_changed'
}

/**
 * Template revision types for email modification
 */
export enum EmailRevisionType {
  SHORTER = 'shorter',
  LONGER = 'longer',
  MORE_FORMAL = 'more_formal',
  LESS_FORMAL = 'less_formal',
  MORE_EMPATHETIC = 'more_empathetic',
  MORE_TECHNICAL = 'more_technical'
}

/**
 * Medical disclaimer types for appropriate compliance
 */
export enum DisclaimerType {
  PATIENT_EDUCATION = 'patient_education',
  CLINICAL_ADVICE = 'clinical_advice',
  REFERRAL = 'referral',
  GENERAL = 'general'
}

/**
 * Healthcare professional roles for signature generation
 */
export enum HealthcareRole {
  PHYSIOTHERAPIST = 'physiotherapist',
  HUISARTS = 'huisarts',
  GENERAL_PRACTITIONER = 'general_practitioner'
}

// Utility functions for enum operations

/**
 * Get all values from an enum as an array
 */
export function getEnumValues<T extends Record<string, string | number>>(enumObject: T): T[keyof T][] {
  return Object.values(enumObject);
}

/**
 * Check if a value is a valid enum member
 */
export function isValidEnumValue<T extends Record<string, string | number>>(
  enumObject: T,
  value: any
): value is T[keyof T] {
  return Object.values(enumObject).includes(value);
}

/**
 * Get enum key from value
 */
export function getEnumKey<T extends Record<string, string | number>>(
  enumObject: T,
  value: T[keyof T]
): keyof T | undefined {
  return Object.keys(enumObject).find(key => enumObject[key as keyof T] === value) as keyof T;
}

/**
 * Convert enum to options array for UI components
 */
export function enumToOptions<T extends Record<string, string | number>>(
  enumObject: T,
  labelMap?: Partial<Record<T[keyof T], string>>
): Array<{ value: T[keyof T]; label: string }> {
  return Object.values(enumObject).map(value => ({
    value,
    label: labelMap?.[value] || String(value)
  }));
}

// Dutch translations for UI display
export const DUTCH_LABELS = {
  // Recipient Categories
  [RecipientCategory.COLLEAGUE]: 'Collega',
  [RecipientCategory.HUISARTS]: 'Huisarts',
  [RecipientCategory.PATIENT]: 'Patiënt',
  [RecipientCategory.FAMILY]: 'Familie/Mantelzorger',
  [RecipientCategory.REFERRING_PHYSICIAN]: 'Verwijzend Arts',
  [RecipientCategory.SUPPORT_STAFF]: 'Ondersteunend Personeel',

  // Formality Levels
  [FormalityLevel.FORMAL]: 'Formeel',
  [FormalityLevel.PROFESSIONAL]: 'Professioneel',
  [FormalityLevel.FRIENDLY]: 'Vriendelijk',
  [FormalityLevel.EMPATHETIC]: 'Empathisch',

  // Communication Objectives
  [CommunicationObjective.REFERRAL]: 'Verwijzing',
  [CommunicationObjective.FOLLOW_UP]: 'Follow-up',
  [CommunicationObjective.CONSULTATION_REQUEST]: 'Consultatie Verzoek',
  [CommunicationObjective.PATIENT_EDUCATION]: 'Patiënt Educatie',
  [CommunicationObjective.TREATMENT_UPDATE]: 'Behandelupdate',
  [CommunicationObjective.DIAGNOSTIC_REQUEST]: 'Diagnostiek Aanvraag',
  [CommunicationObjective.DISCHARGE_SUMMARY]: 'Ontslagbrief',
  [CommunicationObjective.COLLEAGUE_INQUIRY]: 'Collega Vraag',
  [CommunicationObjective.RED_FLAG_NOTIFICATION]: 'Rode Vlag Melding',

  // Urgency Levels
  [UrgencyLevel.LOW]: 'Laag',
  [UrgencyLevel.NORMAL]: 'Normaal',
  [UrgencyLevel.HIGH]: 'Hoog',
  [UrgencyLevel.URGENT]: 'Urgent',

  // Export Formats
  [ExportFormat.PLAIN_TEXT]: 'Platte Tekst',
  [ExportFormat.HTML]: 'HTML',
  [ExportFormat.STRUCTURED_DATA]: 'Gestructureerde Data',
  [ExportFormat.PDF]: 'PDF'
} as const;

// English translations for UI display
export const ENGLISH_LABELS = {
  // Recipient Categories
  [RecipientCategory.COLLEAGUE]: 'Colleague',
  [RecipientCategory.HUISARTS]: 'General Practitioner',
  [RecipientCategory.PATIENT]: 'Patient',
  [RecipientCategory.FAMILY]: 'Family/Caregiver',
  [RecipientCategory.REFERRING_PHYSICIAN]: 'Referring Physician',
  [RecipientCategory.SUPPORT_STAFF]: 'Support Staff',

  // Formality Levels
  [FormalityLevel.FORMAL]: 'Formal',
  [FormalityLevel.PROFESSIONAL]: 'Professional',
  [FormalityLevel.FRIENDLY]: 'Friendly',
  [FormalityLevel.EMPATHETIC]: 'Empathetic',

  // Communication Objectives
  [CommunicationObjective.REFERRAL]: 'Referral',
  [CommunicationObjective.FOLLOW_UP]: 'Follow-up',
  [CommunicationObjective.CONSULTATION_REQUEST]: 'Consultation Request',
  [CommunicationObjective.PATIENT_EDUCATION]: 'Patient Education',
  [CommunicationObjective.TREATMENT_UPDATE]: 'Treatment Update',
  [CommunicationObjective.DIAGNOSTIC_REQUEST]: 'Diagnostic Request',
  [CommunicationObjective.DISCHARGE_SUMMARY]: 'Discharge Summary',
  [CommunicationObjective.COLLEAGUE_INQUIRY]: 'Colleague Inquiry',
  [CommunicationObjective.RED_FLAG_NOTIFICATION]: 'Red Flag Notification',

  // Urgency Levels
  [UrgencyLevel.LOW]: 'Low',
  [UrgencyLevel.NORMAL]: 'Normal',
  [UrgencyLevel.HIGH]: 'High',
  [UrgencyLevel.URGENT]: 'Urgent',

  // Export Formats
  [ExportFormat.PLAIN_TEXT]: 'Plain Text',
  [ExportFormat.HTML]: 'HTML',
  [ExportFormat.STRUCTURED_DATA]: 'Structured Data',
  [ExportFormat.PDF]: 'PDF'
} as const;