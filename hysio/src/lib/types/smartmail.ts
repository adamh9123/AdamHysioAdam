// SmartMail type definitions for healthcare email composition
// Follows Hysio design patterns for healthcare communication

// Core recipient categories for healthcare communication
export type RecipientCategory =
  | 'colleague'
  | 'specialist'
  | 'huisarts'
  | 'patient'
  | 'family'
  | 'referring_physician'
  | 'support_staff';

// Communication formality levels
export type FormalityLevel = 'formal' | 'professional' | 'friendly' | 'empathetic';

// Primary communication objectives
export type CommunicationObjective = 
  | 'referral'
  | 'follow_up'
  | 'consultation_request'
  | 'patient_education'
  | 'treatment_update'
  | 'diagnostic_request'
  | 'discharge_summary'
  | 'colleague_inquiry'
  | 'red_flag_notification';

// Language support (following existing Hysio patterns)
export type SupportedLanguage = 'nl' | 'en';

// Recipient type with context-specific information
export interface RecipientType {
  category: RecipientCategory;
  formality: FormalityLevel;
  language: SupportedLanguage;
  specialty?: string; // For specialists (e.g., "orthopedic", "neurological")
  relationship?: string; // For family members (e.g., "spouse", "parent")
  title?: string; // Professional title (e.g., "Dr.", "Drs.", "Fysiotherapeut")
}

// Context information for email generation
export interface CommunicationContext {
  objective: CommunicationObjective;
  subject: string;
  background: string;
  patientAge?: number;
  patientGender?: 'man' | 'vrouw';
  chiefComplaint?: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  followUpRequired?: boolean;
  includeMedicalDisclaimer?: boolean;
  additionalInstructions?: string;
}

// Document context for uploaded files
export interface DocumentContext {
  filename: string;
  type: string;
  content: string;
  source: 'upload' | 'scribe_session' | 'manual_input';
  timestamp: string;
  size?: number;
}

// Core email generation request
export interface EmailGenerationRequest {
  recipient: RecipientType;
  context: CommunicationContext;
  documents?: DocumentContext[];
  scribeSessionId?: string; // For integration with Medical Scribe
  userId: string;
  timestamp: string;
  requestId: string;
}

// Generated email template structure
export interface EmailTemplate {
  id: string;
  subject: string;
  content: string;
  formattedContent: {
    html: string;
    plainText: string;
  };
  metadata: {
    recipientCategory: RecipientCategory;
    objective: CommunicationObjective;
    language: SupportedLanguage;
    wordCount: number;
    estimatedReadingTime: number; // in minutes
    formalityLevel: FormalityLevel;
    includedDisclaimer: boolean;
  };
  generatedAt: string;
  userId: string;
  requestId: string;
}

// Revision request for generated emails
export interface EmailRevisionRequest {
  templateId: string;
  revisionType: 'shorter' | 'longer' | 'more_formal' | 'less_formal' | 'more_empathetic' | 'more_technical';
  specificInstructions?: string;
  userId: string;
  timestamp: string;
}

// Email generation response from API
export interface EmailGenerationResponse {
  success: boolean;
  template?: EmailTemplate;
  error?: string;
  warnings?: string[]; // For PHI detection, missing context, etc.
  suggestions?: EmailSuggestion[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    processingTime: number; // in milliseconds
  };
}

// Contextual suggestions for improving email content
export interface EmailSuggestion {
  type: 'privacy_warning' | 'missing_context' | 'formality_adjustment' | 'medical_accuracy' | 'follow_up_action' | 'document_processing' | 'error_recovery';
  message: string;
  severity: 'info' | 'warning' | 'error';
  actionable: boolean;
  suggestedAction?: string;
}

// Email history entry (without PHI storage)
export interface EmailHistoryEntry {
  id: string;
  timestamp: string;
  recipientCategory: RecipientCategory;
  objective: CommunicationObjective;
  subject: string;
  language: SupportedLanguage;
  wordCount: number;
  userId: string;
  wasExported: boolean;
  exportFormats?: ExportFormat[];
  // Note: No patient data or sensitive content stored
}

// Export format options
export type ExportFormat = 'plain_text' | 'html' | 'structured_data' | 'pdf';

// Export request structure
export interface EmailExportRequest {
  templateId: string;
  format: ExportFormat;
  includeMetadata: boolean;
  userId: string;
  timestamp: string;
}

// Email export response
export interface EmailExportResponse {
  success: boolean;
  content?: string | Blob;
  filename?: string;
  mimeType?: string;
  error?: string;
  size?: number; // in bytes
}

// Validation result for email generation requests
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Validation error details
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

// Validation warning details
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

// Smart suggestions for email composition
export interface SmartSuggestion {
  id: string;
  type: 'template' | 'recipient' | 'context' | 'follow_up';
  title: string;
  description: string;
  confidence: number; // 0-1 confidence score
  metadata: {
    basedOn: 'scribe_session' | 'user_history' | 'healthcare_guidelines';
    relevanceScore: number;
    timesSuggested: number;
    timesAccepted: number;
  };
}

// Medical Scribe integration context
export interface ScribeSessionContext {
  sessionId: string;
  sessionType: 'intake' | 'followup';
  patientInfo: {
    initials: string;
    age: number;
    gender: 'man' | 'vrouw';
    chiefComplaint: string;
  };
  clinicalData: {
    diagnosis?: string;
    findings?: string[];
    redFlags?: string[];
    treatmentPlan?: string;
    recommendations?: string[];
  };
  sessionPhase: 'preparation' | 'anamnesis' | 'examination' | 'conclusion' | 'completed';
  relevantContext: string; // Filtered, non-sensitive context for email generation
}

// Configuration for SmartMail preferences
export interface SmartMailConfig {
  defaultLanguage: SupportedLanguage;
  defaultFormality: FormalityLevel;
  autoIncludeDisclaimer: boolean;
  enablePHIWarnings: boolean;
  maxDocumentSize: number; // in MB
  enableScribeIntegration: boolean;
  preferredExportFormat: ExportFormat;
  retentionPeriod: number; // in days for non-sensitive history
}

// Audit log entry (compliance and monitoring)
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: 'email_generated' | 'email_exported' | 'email_revised' | 'settings_changed';
  details: {
    recipientCategory?: RecipientCategory;
    objective?: CommunicationObjective;
    language?: SupportedLanguage;
    documentsProcessed?: number;
    exportFormat?: ExportFormat;
    // No PHI or sensitive content logged
  };
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  };
}