// Privacy, security, and compliance features for SmartMail
import type { EmailTemplate, EmailGenerationRequest } from '@/lib/types/smartmail';

// PHI detection patterns
const PHI_PATTERNS = [
  /\b\d{9}\b/g, // BSN numbers
  /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/g, // Birth dates
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Full names
  /\b\d{4}\s?[A-Z]{2}\b/g, // Postal codes
];

// Audit logging without storing PHI
export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: 'email_generated' | 'email_exported' | 'template_reused';
  recipientCategory: string;
  objective: string;
  language: string;
  success: boolean;
  errorType?: string;
  sessionId?: string;
}

export class PrivacySecurity {
  /**
   * Detect and mask PHI in content
   */
  static detectAndMaskPHI(content: string): { maskedContent: string; warnings: string[] } {
    let maskedContent = content;
    const warnings: string[] = [];

    PHI_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        maskedContent = maskedContent.replace(pattern, '[GEMASKEERD]');
        warnings.push(`Mogelijk privacy-gevoelige informatie gedetecteerd (type ${index + 1})`);
      }
    });

    return { maskedContent, warnings };
  }

  /**
   * Create audit log entry without PHI
   */
  static createAuditLog(
    request: EmailGenerationRequest,
    success: boolean,
    errorType?: string
  ): AuditLogEntry {
    return {
      timestamp: new Date().toISOString(),
      userId: request.userId,
      action: 'email_generated',
      recipientCategory: request.recipient.category,
      objective: request.context.objective,
      language: request.recipient.language,
      success,
      errorType,
      sessionId: request.scribeSessionId
    };
  }

  /**
   * Validate medical disclaimer requirements
   */
  static requiresMedicalDisclaimer(
    recipientCategory: string,
    objective: string
  ): boolean {
    const disclaimerRequired = [
      'patient_education',
      'treatment_update',
      'diagnostic_request'
    ];
    
    return recipientCategory === 'patient' && disclaimerRequired.includes(objective);
  }

  /**
   * Generate appropriate medical disclaimer
   */
  static generateMedicalDisclaimer(language: 'nl' | 'en' = 'nl'): string {
    if (language === 'nl') {
      return '\n\nMedische disclaimer: Deze informatie is bedoeld voor educatieve doeleinden en vervangt geen professioneel medisch advies. Neem altijd contact op met uw zorgverlener voor specifieke medische vragen.';
    }
    
    return '\n\nMedical disclaimer: This information is intended for educational purposes and does not replace professional medical advice. Always contact your healthcare provider for specific medical questions.';
  }
}