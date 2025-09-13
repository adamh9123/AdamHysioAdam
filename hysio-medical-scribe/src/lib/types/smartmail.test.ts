// Comprehensive unit tests for SmartMail type definitions and validation functions
// Tests cover all interfaces, validation, and type guards

import {
  RecipientCategory,
  FormalityLevel,
  CommunicationObjective,
  SupportedLanguage,
  RecipientType,
  CommunicationContext,
  EmailGenerationRequest,
  DocumentContext,
  EmailTemplate,
  ValidationResult
} from './smartmail';

import {
  validateRecipientType,
  validateCommunicationContext,
  validateDocumentContext,
  validateEmailGenerationRequest,
  validatePrivacyContent,
  validateSmartMailInput,
  isValidRecipientCategory,
  isValidFormalityLevel,
  isValidCommunicationObjective,
  isValidLanguage,
  VALIDATION_LIMITS
} from '../smartmail/validation';

import {
  getEnumValues,
  isValidEnumValue,
  getEnumKey,
  enumToOptions,
  RecipientCategory as EnumRecipientCategory,
  FormalityLevel as EnumFormalityLevel,
  CommunicationObjective as EnumCommunicationObjective
} from '../smartmail/enums';

describe('SmartMail Type Guards', () => {
  describe('isValidRecipientCategory', () => {
    test('should return true for valid recipient categories', () => {
      expect(isValidRecipientCategory('colleague')).toBe(true);
      expect(isValidRecipientCategory('specialist')).toBe(true);
      expect(isValidRecipientCategory('patient')).toBe(true);
      expect(isValidRecipientCategory('family')).toBe(true);
      expect(isValidRecipientCategory('referring_physician')).toBe(true);
      expect(isValidRecipientCategory('support_staff')).toBe(true);
    });

    test('should return false for invalid recipient categories', () => {
      expect(isValidRecipientCategory('invalid')).toBe(false);
      expect(isValidRecipientCategory('')).toBe(false);
      expect(isValidRecipientCategory(null)).toBe(false);
      expect(isValidRecipientCategory(undefined)).toBe(false);
      expect(isValidRecipientCategory(123)).toBe(false);
    });
  });

  describe('isValidFormalityLevel', () => {
    test('should return true for valid formality levels', () => {
      expect(isValidFormalityLevel('formal')).toBe(true);
      expect(isValidFormalityLevel('professional')).toBe(true);
      expect(isValidFormalityLevel('friendly')).toBe(true);
      expect(isValidFormalityLevel('empathetic')).toBe(true);
    });

    test('should return false for invalid formality levels', () => {
      expect(isValidFormalityLevel('invalid')).toBe(false);
      expect(isValidFormalityLevel('')).toBe(false);
      expect(isValidFormalityLevel(null)).toBe(false);
    });
  });

  describe('isValidCommunicationObjective', () => {
    test('should return true for valid communication objectives', () => {
      expect(isValidCommunicationObjective('referral')).toBe(true);
      expect(isValidCommunicationObjective('follow_up')).toBe(true);
      expect(isValidCommunicationObjective('patient_education')).toBe(true);
      expect(isValidCommunicationObjective('red_flag_notification')).toBe(true);
    });

    test('should return false for invalid communication objectives', () => {
      expect(isValidCommunicationObjective('invalid')).toBe(false);
      expect(isValidCommunicationObjective('')).toBe(false);
      expect(isValidCommunicationObjective(null)).toBe(false);
    });
  });

  describe('isValidLanguage', () => {
    test('should return true for valid languages', () => {
      expect(isValidLanguage('nl')).toBe(true);
      expect(isValidLanguage('en')).toBe(true);
    });

    test('should return false for invalid languages', () => {
      expect(isValidLanguage('fr')).toBe(false);
      expect(isValidLanguage('de')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage(null)).toBe(false);
    });
  });
});

describe('SmartMail Validation Functions', () => {
  describe('validateRecipientType', () => {
    test('should validate valid recipient type', () => {
      const validRecipient: RecipientType = {
        category: 'specialist',
        formality: 'formal',
        language: 'nl',
        specialty: 'orthopedic',
        title: 'Dr.'
      };

      const result = validateRecipientType(validRecipient);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject recipient type with missing required fields', () => {
      const invalidRecipient = {
        category: 'specialist'
        // missing formality and language
      };

      const result = validateRecipientType(invalidRecipient);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].code).toBe('REQUIRED');
      expect(result.errors[1].code).toBe('REQUIRED');
    });

    test('should reject recipient type with invalid category', () => {
      const invalidRecipient = {
        category: 'invalid_category',
        formality: 'formal',
        language: 'nl'
      };

      const result = validateRecipientType(invalidRecipient);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_VALUE');
      expect(result.errors[0].field).toBe('recipient.category');
    });

    test('should provide warnings for missing context', () => {
      const recipient = {
        category: 'specialist',
        formality: 'formal',
        language: 'nl'
        // missing specialty for specialist
      };

      const result = validateRecipientType(recipient);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('MISSING_CONTEXT');
    });

    test('should validate field length limits', () => {
      const recipient = {
        category: 'specialist',
        formality: 'formal',
        language: 'nl',
        specialty: 'a'.repeat(VALIDATION_LIMITS.SPECIALTY_MAX_LENGTH + 1)
      };

      const result = validateRecipientType(recipient);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MAX_LENGTH');
    });
  });

  describe('validateCommunicationContext', () => {
    test('should validate valid communication context', () => {
      const validContext: CommunicationContext = {
        objective: 'referral',
        subject: 'Patient referral for knee pain',
        background: 'Patient presents with chronic knee pain affecting daily activities.',
        patientAge: 45,
        patientGender: 'vrouw',
        urgency: 'normal'
      };

      const result = validateCommunicationContext(validContext);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject context with missing required fields', () => {
      const invalidContext = {
        objective: 'referral'
        // missing subject and background
      };

      const result = validateCommunicationContext(invalidContext);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate subject length limits', () => {
      const context = {
        objective: 'referral',
        subject: 'ab', // too short
        background: 'Valid background information here.'
      };

      const result = validateCommunicationContext(context);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('MIN_LENGTH');
    });

    test('should validate patient age range', () => {
      const context = {
        objective: 'referral',
        subject: 'Valid subject',
        background: 'Valid background information here.',
        patientAge: 200 // invalid age
      };

      const result = validateCommunicationContext(context);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('OUT_OF_RANGE');
    });

    test('should provide urgency warning for red flag notifications', () => {
      const context = {
        objective: 'red_flag_notification',
        subject: 'Red flag notification',
        background: 'Patient showing concerning symptoms.',
        urgency: 'normal' // should be urgent for red flags
      };

      const result = validateCommunicationContext(context);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('URGENCY_MISMATCH');
    });
  });

  describe('validateDocumentContext', () => {
    test('should validate valid document context', () => {
      const validDocument: DocumentContext = {
        filename: 'medical_report.pdf',
        type: 'application/pdf',
        content: 'Medical report content here...',
        source: 'upload',
        timestamp: new Date().toISOString(),
        size: 1024
      };

      const result = validateDocumentContext(validDocument);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject document with missing required fields', () => {
      const invalidDocument = {
        filename: 'test.pdf'
        // missing type, content, source
      };

      const result = validateDocumentContext(invalidDocument);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject unsupported document type', () => {
      const invalidDocument = {
        filename: 'test.exe',
        type: 'application/exe',
        content: 'content',
        source: 'upload',
        timestamp: new Date().toISOString()
      };

      const result = validateDocumentContext(invalidDocument);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_TYPE');
    });

    test('should reject oversized documents', () => {
      const largeDocument = {
        filename: 'large.pdf',
        type: 'application/pdf',
        content: 'content',
        source: 'upload',
        timestamp: new Date().toISOString(),
        size: VALIDATION_LIMITS.DOCUMENT_MAX_SIZE + 1
      };

      const result = validateDocumentContext(largeDocument);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('FILE_TOO_LARGE');
    });

    test('should warn about large content', () => {
      const documentWithLargeContent = {
        filename: 'test.pdf',
        type: 'application/pdf',
        content: 'a'.repeat(15000), // large content
        source: 'upload',
        timestamp: new Date().toISOString()
      };

      const result = validateDocumentContext(documentWithLargeContent);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('LARGE_CONTENT');
    });
  });

  describe('validatePrivacyContent', () => {
    test('should detect potential BSN-like numbers', () => {
      const contentWithBSN = 'Patient BSN: 123456789 for referral';
      const result = validatePrivacyContent(contentWithBSN);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'POTENTIAL_PHI')).toBe(true);
    });

    test('should detect potential email addresses', () => {
      const contentWithEmail = 'Contact patient at john.doe@example.com';
      const result = validatePrivacyContent(contentWithEmail);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'POTENTIAL_PHI')).toBe(true);
    });

    test('should detect potential phone numbers', () => {
      const contentWithPhone = 'Patient phone: 06-12345678';
      const result = validatePrivacyContent(contentWithPhone);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'POTENTIAL_PHI')).toBe(true);
    });

    test('should detect potential names', () => {
      const contentWithName = 'Patient Jan de Jong has knee pain';
      const result = validatePrivacyContent(contentWithName);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.code === 'POTENTIAL_NAME')).toBe(true);
    });

    test('should pass content without PHI', () => {
      const cleanContent = 'Patient presents with chronic knee pain affecting activities of daily living.';
      const result = validatePrivacyContent(cleanContent);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateEmailGenerationRequest', () => {
    test('should validate complete valid request', () => {
      const validRequest: EmailGenerationRequest = {
        recipient: {
          category: 'specialist',
          formality: 'formal',
          language: 'nl'
        },
        context: {
          objective: 'referral',
          subject: 'Patient referral',
          background: 'Patient with chronic knee pain requiring specialist evaluation.'
        },
        documents: [],
        userId: 'user123',
        timestamp: new Date().toISOString(),
        requestId: 'req123'
      };

      const result = validateEmailGenerationRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate request with documents', () => {
      const requestWithDocs: EmailGenerationRequest = {
        recipient: {
          category: 'specialist',
          formality: 'formal',
          language: 'nl'
        },
        context: {
          objective: 'referral',
          subject: 'Patient referral',
          background: 'Patient with chronic knee pain requiring specialist evaluation.'
        },
        documents: [{
          filename: 'test.pdf',
          type: 'application/pdf',
          content: 'Medical report content',
          source: 'upload',
          timestamp: new Date().toISOString()
        }],
        userId: 'user123',
        timestamp: new Date().toISOString(),
        requestId: 'req123'
      };

      const result = validateEmailGenerationRequest(requestWithDocs);
      expect(result.isValid).toBe(true);
    });

    test('should reject request with missing required fields', () => {
      const invalidRequest = {
        recipient: {
          category: 'specialist',
          formality: 'formal',
          language: 'nl'
        }
        // missing context, userId, requestId, timestamp
      };

      const result = validateEmailGenerationRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should propagate nested validation errors', () => {
      const requestWithInvalidRecipient = {
        recipient: {
          category: 'invalid_category',
          formality: 'formal',
          language: 'nl'
        },
        context: {
          objective: 'referral',
          subject: 'Valid subject',
          background: 'Valid background'
        },
        userId: 'user123',
        timestamp: new Date().toISOString(),
        requestId: 'req123'
      };

      const result = validateEmailGenerationRequest(requestWithInvalidRecipient);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'recipient.category')).toBe(true);
    });
  });
});

describe('SmartMail Enum Utilities', () => {
  describe('getEnumValues', () => {
    test('should return all enum values as array', () => {
      const values = getEnumValues(EnumRecipientCategory);
      expect(values).toContain('colleague');
      expect(values).toContain('specialist');
      expect(values).toContain('patient');
      expect(values.length).toBeGreaterThan(0);
    });
  });

  describe('isValidEnumValue', () => {
    test('should validate enum values correctly', () => {
      expect(isValidEnumValue(EnumRecipientCategory, 'colleague')).toBe(true);
      expect(isValidEnumValue(EnumRecipientCategory, 'invalid')).toBe(false);
    });
  });

  describe('getEnumKey', () => {
    test('should return correct enum key for value', () => {
      const key = getEnumKey(EnumRecipientCategory, 'colleague');
      expect(key).toBe('COLLEAGUE');
    });

    test('should return undefined for invalid value', () => {
      const key = getEnumKey(EnumRecipientCategory, 'invalid' as any);
      expect(key).toBeUndefined();
    });
  });

  describe('enumToOptions', () => {
    test('should convert enum to options array', () => {
      const options = enumToOptions(EnumFormalityLevel);
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
    });

    test('should use label map when provided', () => {
      const labelMap = {
        [EnumFormalityLevel.FORMAL]: 'Formeel'
      };
      const options = enumToOptions(EnumFormalityLevel, labelMap);
      expect(options.find(o => o.value === 'formal')?.label).toBe('Formeel');
    });
  });
});

describe('SmartMail Type Interface Compliance', () => {
  test('EmailTemplate should have required properties', () => {
    const template: EmailTemplate = {
      id: 'test-123',
      subject: 'Test Subject',
      content: 'Test content',
      formattedContent: {
        html: '<p>Test content</p>',
        plainText: 'Test content'
      },
      metadata: {
        recipientCategory: 'patient',
        objective: 'patient_education',
        language: 'nl',
        wordCount: 10,
        estimatedReadingTime: 1,
        formalityLevel: 'empathetic',
        includedDisclaimer: true
      },
      generatedAt: new Date().toISOString(),
      userId: 'user123',
      requestId: 'req123'
    };

    expect(template.id).toBeDefined();
    expect(template.subject).toBeDefined();
    expect(template.content).toBeDefined();
    expect(template.formattedContent.html).toBeDefined();
    expect(template.formattedContent.plainText).toBeDefined();
    expect(template.metadata.recipientCategory).toBeDefined();
    expect(template.metadata.objective).toBeDefined();
  });

  test('RecipientType should accept all valid configurations', () => {
    const colleagueRecipient: RecipientType = {
      category: 'colleague',
      formality: 'professional',
      language: 'nl'
    };

    const specialistRecipient: RecipientType = {
      category: 'specialist',
      formality: 'formal',
      language: 'en',
      specialty: 'orthopedic',
      title: 'Dr.'
    };

    const familyRecipient: RecipientType = {
      category: 'family',
      formality: 'empathetic',
      language: 'nl',
      relationship: 'spouse'
    };

    expect(colleagueRecipient.category).toBe('colleague');
    expect(specialistRecipient.specialty).toBe('orthopedic');
    expect(familyRecipient.relationship).toBe('spouse');
  });

  test('CommunicationContext should support all required scenarios', () => {
    const referralContext: CommunicationContext = {
      objective: 'referral',
      subject: 'Referral for knee specialist',
      background: 'Patient with chronic knee pain',
      patientAge: 45,
      patientGender: 'vrouw',
      urgency: 'high'
    };

    const educationContext: CommunicationContext = {
      objective: 'patient_education',
      subject: 'Exercise instructions',
      background: 'Post-treatment exercise guidance',
      followUpRequired: true,
      includeMedicalDisclaimer: true
    };

    expect(referralContext.objective).toBe('referral');
    expect(referralContext.patientAge).toBe(45);
    expect(educationContext.followUpRequired).toBe(true);
  });
});

describe('ValidationResult Type Compliance', () => {
  test('ValidationResult should properly structure errors and warnings', () => {
    const result: ValidationResult = {
      isValid: false,
      errors: [{
        field: 'test.field',
        code: 'REQUIRED',
        message: 'Test field is required',
        severity: 'error'
      }],
      warnings: [{
        field: 'test.optional',
        code: 'MISSING_CONTEXT',
        message: 'Optional context missing',
        suggestion: 'Consider adding more context'
      }]
    };

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.errors[0].code).toBe('REQUIRED');
    expect(result.warnings[0].suggestion).toBeDefined();
  });
});