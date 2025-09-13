// Validation schemas and utilities for SmartMail user inputs
// Healthcare-specific validation rules and type guards

import type {
  RecipientCategory,
  FormalityLevel, 
  CommunicationObjective,
  SupportedLanguage,
  RecipientType,
  CommunicationContext,
  EmailGenerationRequest,
  DocumentContext,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '@/lib/types/smartmail';

// Validation constants
export const VALIDATION_LIMITS = {
  SUBJECT_MIN_LENGTH: 3,
  SUBJECT_MAX_LENGTH: 200,
  BACKGROUND_MIN_LENGTH: 10,
  BACKGROUND_MAX_LENGTH: 5000,
  ADDITIONAL_INSTRUCTIONS_MAX_LENGTH: 1000,
  DOCUMENT_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  PATIENT_AGE_MIN: 0,
  PATIENT_AGE_MAX: 150,
  SPECIALTY_MAX_LENGTH: 100,
  RELATIONSHIP_MAX_LENGTH: 50,
  TITLE_MAX_LENGTH: 50
} as const;

// Valid enum values
export const VALID_RECIPIENT_CATEGORIES: RecipientCategory[] = [
  'colleague',
  'specialist', 
  'patient',
  'family',
  'referring_physician',
  'support_staff'
];

export const VALID_FORMALITY_LEVELS: FormalityLevel[] = [
  'formal',
  'professional',
  'friendly',
  'empathetic'
];

export const VALID_COMMUNICATION_OBJECTIVES: CommunicationObjective[] = [
  'referral',
  'follow_up',
  'consultation_request',
  'patient_education',
  'treatment_update',
  'diagnostic_request',
  'discharge_summary',
  'colleague_inquiry',
  'red_flag_notification'
];

export const VALID_LANGUAGES: SupportedLanguage[] = ['nl', 'en'];

export const VALID_GENDERS = ['man', 'vrouw'] as const;

export const VALID_URGENCY_LEVELS = ['low', 'normal', 'high', 'urgent'] as const;

export const VALID_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/rtf'
] as const;

// Type guard functions
export function isValidRecipientCategory(value: any): value is RecipientCategory {
  return typeof value === 'string' && VALID_RECIPIENT_CATEGORIES.includes(value as RecipientCategory);
}

export function isValidFormalityLevel(value: any): value is FormalityLevel {
  return typeof value === 'string' && VALID_FORMALITY_LEVELS.includes(value as FormalityLevel);
}

export function isValidCommunicationObjective(value: any): value is CommunicationObjective {
  return typeof value === 'string' && VALID_COMMUNICATION_OBJECTIVES.includes(value as CommunicationObjective);
}

export function isValidLanguage(value: any): value is SupportedLanguage {
  return typeof value === 'string' && VALID_LANGUAGES.includes(value as SupportedLanguage);
}

// Validation schema functions
export function validateRecipientType(recipient: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields validation
  if (!recipient?.category) {
    errors.push({
      field: 'recipient.category',
      code: 'REQUIRED',
      message: 'Recipient category is required',
      severity: 'error'
    });
  } else if (!isValidRecipientCategory(recipient.category)) {
    errors.push({
      field: 'recipient.category',
      code: 'INVALID_VALUE',
      message: `Invalid recipient category. Must be one of: ${VALID_RECIPIENT_CATEGORIES.join(', ')}`,
      severity: 'error'
    });
  }

  if (!recipient?.formality) {
    errors.push({
      field: 'recipient.formality',
      code: 'REQUIRED',
      message: 'Formality level is required',
      severity: 'error'
    });
  } else if (!isValidFormalityLevel(recipient.formality)) {
    errors.push({
      field: 'recipient.formality',
      code: 'INVALID_VALUE',
      message: `Invalid formality level. Must be one of: ${VALID_FORMALITY_LEVELS.join(', ')}`,
      severity: 'error'
    });
  }

  if (!recipient?.language) {
    errors.push({
      field: 'recipient.language',
      code: 'REQUIRED',
      message: 'Language is required',
      severity: 'error'
    });
  } else if (!isValidLanguage(recipient.language)) {
    errors.push({
      field: 'recipient.language',
      code: 'INVALID_VALUE',
      message: `Invalid language. Must be one of: ${VALID_LANGUAGES.join(', ')}`,
      severity: 'error'
    });
  }

  // Optional field validation
  if (recipient?.specialty && typeof recipient.specialty === 'string') {
    if (recipient.specialty.length > VALIDATION_LIMITS.SPECIALTY_MAX_LENGTH) {
      errors.push({
        field: 'recipient.specialty',
        code: 'MAX_LENGTH',
        message: `Specialty must be no longer than ${VALIDATION_LIMITS.SPECIALTY_MAX_LENGTH} characters`,
        severity: 'error'
      });
    }
  }

  if (recipient?.relationship && typeof recipient.relationship === 'string') {
    if (recipient.relationship.length > VALIDATION_LIMITS.RELATIONSHIP_MAX_LENGTH) {
      errors.push({
        field: 'recipient.relationship',
        code: 'MAX_LENGTH',
        message: `Relationship must be no longer than ${VALIDATION_LIMITS.RELATIONSHIP_MAX_LENGTH} characters`,
        severity: 'error'
      });
    }
  }

  if (recipient?.title && typeof recipient.title === 'string') {
    if (recipient.title.length > VALIDATION_LIMITS.TITLE_MAX_LENGTH) {
      errors.push({
        field: 'recipient.title',
        code: 'MAX_LENGTH',
        message: `Title must be no longer than ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters`,
        severity: 'error'
      });
    }
  }

  // Context-specific warnings
  if (recipient?.category === 'specialist' && !recipient?.specialty) {
    warnings.push({
      field: 'recipient.specialty',
      code: 'MISSING_CONTEXT',
      message: 'Specialist category would benefit from specifying the specialty area',
      suggestion: 'Consider adding the medical specialty (e.g., "orthopedic", "neurological")'
    });
  }

  if (recipient?.category === 'family' && !recipient?.relationship) {
    warnings.push({
      field: 'recipient.relationship',
      code: 'MISSING_CONTEXT',
      message: 'Family category would benefit from specifying the relationship',
      suggestion: 'Consider adding the relationship (e.g., "spouse", "parent", "child")'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateCommunicationContext(context: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields validation
  if (!context?.objective) {
    errors.push({
      field: 'context.objective',
      code: 'REQUIRED',
      message: 'Communication objective is required',
      severity: 'error'
    });
  } else if (!isValidCommunicationObjective(context.objective)) {
    errors.push({
      field: 'context.objective',
      code: 'INVALID_VALUE',
      message: `Invalid communication objective. Must be one of: ${VALID_COMMUNICATION_OBJECTIVES.join(', ')}`,
      severity: 'error'
    });
  }

  if (!context?.subject || typeof context.subject !== 'string') {
    errors.push({
      field: 'context.subject',
      code: 'REQUIRED',
      message: 'Subject is required',
      severity: 'error'
    });
  } else {
    if (context.subject.length < VALIDATION_LIMITS.SUBJECT_MIN_LENGTH) {
      errors.push({
        field: 'context.subject',
        code: 'MIN_LENGTH',
        message: `Subject must be at least ${VALIDATION_LIMITS.SUBJECT_MIN_LENGTH} characters`,
        severity: 'error'
      });
    }
    if (context.subject.length > VALIDATION_LIMITS.SUBJECT_MAX_LENGTH) {
      errors.push({
        field: 'context.subject',
        code: 'MAX_LENGTH',
        message: `Subject must be no longer than ${VALIDATION_LIMITS.SUBJECT_MAX_LENGTH} characters`,
        severity: 'error'
      });
    }
  }

  if (!context?.background || typeof context.background !== 'string') {
    errors.push({
      field: 'context.background',
      code: 'REQUIRED',
      message: 'Background information is required',
      severity: 'error'
    });
  } else {
    if (context.background.length < VALIDATION_LIMITS.BACKGROUND_MIN_LENGTH) {
      errors.push({
        field: 'context.background',
        code: 'MIN_LENGTH',
        message: `Background must be at least ${VALIDATION_LIMITS.BACKGROUND_MIN_LENGTH} characters`,
        severity: 'error'
      });
    }
    if (context.background.length > VALIDATION_LIMITS.BACKGROUND_MAX_LENGTH) {
      errors.push({
        field: 'context.background',
        code: 'MAX_LENGTH',
        message: `Background must be no longer than ${VALIDATION_LIMITS.BACKGROUND_MAX_LENGTH} characters`,
        severity: 'error'
      });
    }
  }

  // Optional field validation
  if (context?.patientAge !== undefined) {
    if (typeof context.patientAge !== 'number' || !Number.isInteger(context.patientAge)) {
      errors.push({
        field: 'context.patientAge',
        code: 'INVALID_TYPE',
        message: 'Patient age must be a valid integer',
        severity: 'error'
      });
    } else if (context.patientAge < VALIDATION_LIMITS.PATIENT_AGE_MIN || context.patientAge > VALIDATION_LIMITS.PATIENT_AGE_MAX) {
      errors.push({
        field: 'context.patientAge',
        code: 'OUT_OF_RANGE',
        message: `Patient age must be between ${VALIDATION_LIMITS.PATIENT_AGE_MIN} and ${VALIDATION_LIMITS.PATIENT_AGE_MAX}`,
        severity: 'error'
      });
    }
  }

  if (context?.patientGender && !VALID_GENDERS.includes(context.patientGender)) {
    errors.push({
      field: 'context.patientGender',
      code: 'INVALID_VALUE',
      message: `Invalid patient gender. Must be one of: ${VALID_GENDERS.join(', ')}`,
      severity: 'error'
    });
  }

  if (context?.urgency && !VALID_URGENCY_LEVELS.includes(context.urgency)) {
    errors.push({
      field: 'context.urgency',
      code: 'INVALID_VALUE',
      message: `Invalid urgency level. Must be one of: ${VALID_URGENCY_LEVELS.join(', ')}`,
      severity: 'error'
    });
  }

  if (context?.additionalInstructions && typeof context.additionalInstructions === 'string') {
    if (context.additionalInstructions.length > VALIDATION_LIMITS.ADDITIONAL_INSTRUCTIONS_MAX_LENGTH) {
      errors.push({
        field: 'context.additionalInstructions',
        code: 'MAX_LENGTH',
        message: `Additional instructions must be no longer than ${VALIDATION_LIMITS.ADDITIONAL_INSTRUCTIONS_MAX_LENGTH} characters`,
        severity: 'error'
      });
    }
  }

  // Context-specific warnings
  if (['referral', 'red_flag_notification'].includes(context?.objective) && !context?.patientAge) {
    warnings.push({
      field: 'context.patientAge',
      code: 'MISSING_CONTEXT',
      message: 'Patient age is highly recommended for referrals and red flag notifications',
      suggestion: 'Consider adding patient age for better clinical context'
    });
  }

  if (context?.objective === 'red_flag_notification' && context?.urgency !== 'urgent') {
    warnings.push({
      field: 'context.urgency',
      code: 'URGENCY_MISMATCH',
      message: 'Red flag notifications typically require urgent priority',
      suggestion: 'Consider setting urgency to "urgent" for red flag notifications'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateDocumentContext(document: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields validation
  if (!document?.filename || typeof document.filename !== 'string') {
    errors.push({
      field: 'document.filename',
      code: 'REQUIRED',
      message: 'Document filename is required',
      severity: 'error'
    });
  }

  if (!document?.type || typeof document.type !== 'string') {
    errors.push({
      field: 'document.type',
      code: 'REQUIRED',
      message: 'Document type is required',
      severity: 'error'
    });
  } else if (!VALID_DOCUMENT_TYPES.includes(document.type)) {
    errors.push({
      field: 'document.type',
      code: 'INVALID_TYPE',
      message: `Unsupported document type. Supported types: ${VALID_DOCUMENT_TYPES.join(', ')}`,
      severity: 'error'
    });
  }

  if (!document?.content || typeof document.content !== 'string') {
    errors.push({
      field: 'document.content',
      code: 'REQUIRED',
      message: 'Document content is required',
      severity: 'error'
    });
  }

  if (!document?.source) {
    errors.push({
      field: 'document.source',
      code: 'REQUIRED',
      message: 'Document source is required',
      severity: 'error'
    });
  } else if (!['upload', 'scribe_session', 'manual_input'].includes(document.source)) {
    errors.push({
      field: 'document.source',
      code: 'INVALID_VALUE',
      message: 'Invalid document source. Must be one of: upload, scribe_session, manual_input',
      severity: 'error'
    });
  }

  // Size validation
  if (document?.size && typeof document.size === 'number') {
    if (document.size > VALIDATION_LIMITS.DOCUMENT_MAX_SIZE) {
      errors.push({
        field: 'document.size',
        code: 'FILE_TOO_LARGE',
        message: `Document size exceeds maximum limit of ${VALIDATION_LIMITS.DOCUMENT_MAX_SIZE / (1024 * 1024)}MB`,
        severity: 'error'
      });
    }
  }

  // Content length warning
  if (document?.content && document.content.length > 10000) {
    warnings.push({
      field: 'document.content',
      code: 'LARGE_CONTENT',
      message: 'Large documents may result in longer processing times',
      suggestion: 'Consider summarizing key points if the document is very lengthy'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateEmailGenerationRequest(request: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields validation
  if (!request?.userId || typeof request.userId !== 'string') {
    errors.push({
      field: 'userId',
      code: 'REQUIRED',
      message: 'User ID is required',
      severity: 'error'
    });
  }

  if (!request?.requestId || typeof request.requestId !== 'string') {
    errors.push({
      field: 'requestId',
      code: 'REQUIRED',
      message: 'Request ID is required',
      severity: 'error'
    });
  }

  if (!request?.timestamp || typeof request.timestamp !== 'string') {
    errors.push({
      field: 'timestamp',
      code: 'REQUIRED',
      message: 'Timestamp is required',
      severity: 'error'
    });
  }

  // Validate nested objects
  if (!request?.recipient) {
    errors.push({
      field: 'recipient',
      code: 'REQUIRED',
      message: 'Recipient information is required',
      severity: 'error'
    });
  } else {
    const recipientValidation = validateRecipientType(request.recipient);
    errors.push(...recipientValidation.errors);
    warnings.push(...recipientValidation.warnings);
  }

  if (!request?.context) {
    errors.push({
      field: 'context',
      code: 'REQUIRED',
      message: 'Communication context is required',
      severity: 'error'
    });
  } else {
    const contextValidation = validateCommunicationContext(request.context);
    errors.push(...contextValidation.errors);
    warnings.push(...contextValidation.warnings);
  }

  // Validate documents array
  if (request?.documents) {
    if (!Array.isArray(request.documents)) {
      errors.push({
        field: 'documents',
        code: 'INVALID_TYPE',
        message: 'Documents must be an array',
        severity: 'error'
      });
    } else {
      request.documents.forEach((doc: any, index: number) => {
        const docValidation = validateDocumentContext(doc);
        // Add index to error field paths
        docValidation.errors.forEach(error => {
          error.field = `documents[${index}].${error.field}`;
        });
        docValidation.warnings.forEach(warning => {
          warning.field = `documents[${index}].${warning.field}`;
        });
        errors.push(...docValidation.errors);
        warnings.push(...docValidation.warnings);
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Privacy validation - check for potential PHI in text content
export function validatePrivacyContent(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Patterns that might indicate PHI
  const phiPatterns = [
    { pattern: /\b\d{9}\b/, name: 'BSN-like number' },
    { pattern: /\b\d{4}\s*[A-Z]{2}\b/, name: 'Postal code' },
    { pattern: /\b[A-Za-z]+\s+\d{1,3}\b/, name: 'Street address' },
    { pattern: /\b0\d{1,2}[-\s]?\d{7,8}\b/, name: 'Phone number' },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, name: 'Email address' },
    { pattern: /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/, name: 'Date format' }
  ];

  phiPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      warnings.push({
        field: 'content',
        code: 'POTENTIAL_PHI',
        message: `Potential personal information detected: ${name}`,
        suggestion: 'Please review and remove or replace with generic placeholders'
      });
    }
  });

  // Check for common Dutch names (basic list)
  const commonNames = [
    'jan', 'peter', 'maria', 'anna', 'de jong', 'jansen', 'de vries', 'van den berg',
    'van dijk', 'bakker', 'visser', 'smit', 'meijer', 'de boer'
  ];

  const contentLower = content.toLowerCase();
  commonNames.forEach(name => {
    if (contentLower.includes(name)) {
      warnings.push({
        field: 'content',
        code: 'POTENTIAL_NAME',
        message: `Potential name detected: "${name}"`,
        suggestion: 'Consider using initials or generic placeholders instead of full names'
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Utility function to check if object has all required properties
export function hasRequiredProperties<T>(obj: any, requiredProps: (keyof T)[]): obj is T {
  return requiredProps.every(prop => obj?.[prop] !== undefined);
}

// Comprehensive validation function combining all validations
export function validateSmartMailInput(request: any): ValidationResult {
  const requestValidation = validateEmailGenerationRequest(request);
  
  // Additional privacy validation on content fields
  const privacyFields = [
    request?.context?.subject,
    request?.context?.background,
    request?.context?.chiefComplaint,
    request?.context?.additionalInstructions
  ].filter(Boolean);

  const privacyValidations = privacyFields.map(content => validatePrivacyContent(content));
  
  const allPrivacyErrors = privacyValidations.flatMap(v => v.errors);
  const allPrivacyWarnings = privacyValidations.flatMap(v => v.warnings);

  return {
    isValid: requestValidation.isValid && allPrivacyErrors.length === 0,
    errors: [...requestValidation.errors, ...allPrivacyErrors],
    warnings: [...requestValidation.warnings, ...allPrivacyWarnings]
  };
}