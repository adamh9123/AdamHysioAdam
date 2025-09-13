// Medical Scribe integration utilities for SmartMail context extraction
import type { 
  EmailGenerationRequest, 
  CommunicationContext, 
  CommunicationObjective,
  RecipientCategory 
} from '@/lib/types/smartmail';

// Scribe session data interfaces (would match existing types)
interface ScribeSessionData {
  sessionId: string;
  sessionType: 'intake' | 'followup';
  patientInfo: {
    initials: string;
    age?: number;
    gender?: string;
  };
  chiefComplaint?: string;
  diagnosis?: string[];
  recommendations?: string[];
  redFlags?: string[];
  followUpRequired?: boolean;
  nextSteps?: string[];
}

// Context extraction utilities
export class ScribeIntegration {
  /**
   * Extract SmartMail context from Scribe session data
   */
  static extractContext(sessionData: ScribeSessionData): Partial<CommunicationContext> {
    const context: Partial<CommunicationContext> = {
      patientAge: sessionData.patientInfo.age,
      chiefComplaint: sessionData.chiefComplaint,
      followUpRequired: sessionData.followUpRequired
    };

    // Add diagnosis information if available
    if (sessionData.diagnosis && sessionData.diagnosis.length > 0) {
      context.background = `Diagnose: ${sessionData.diagnosis.join(', ')}`;
    }

    return context;
  }

  /**
   * Suggest appropriate communication objectives based on session content
   */
  static suggestObjectives(sessionData: ScribeSessionData): CommunicationObjective[] {
    const suggestions: CommunicationObjective[] = [];

    // Red flags suggest urgent referral
    if (sessionData.redFlags && sessionData.redFlags.length > 0) {
      suggestions.push('red_flag_notification', 'referral');
    }

    // Follow-up required
    if (sessionData.followUpRequired) {
      suggestions.push('follow_up', 'patient_education');
    }

    // New diagnosis suggests patient education
    if (sessionData.diagnosis && sessionData.diagnosis.length > 0) {
      suggestions.push('patient_education', 'treatment_update');
    }

    return suggestions;
  }

  /**
   * Suggest appropriate recipients based on session content
   */
  static suggestRecipients(sessionData: ScribeSessionData): RecipientCategory[] {
    const suggestions: RecipientCategory[] = [];

    // Always suggest patient communication
    suggestions.push('patient');

    // Red flags suggest specialist referral
    if (sessionData.redFlags && sessionData.redFlags.length > 0) {
      suggestions.push('specialist', 'referring_physician');
    }

    // Complex cases suggest colleague consultation
    if (sessionData.diagnosis && sessionData.diagnosis.length > 1) {
      suggestions.push('colleague');
    }

    return suggestions;
  }

  /**
   * Generate email request from scribe session
   */
  static generateEmailRequest(
    sessionData: ScribeSessionData,
    recipient: RecipientCategory,
    objective: CommunicationObjective,
    additionalContext?: string
  ): Partial<EmailGenerationRequest> {
    const context = this.extractContext(sessionData);
    
    return {
      context: {
        ...context,
        objective,
        subject: this.generateSubject(objective, sessionData),
        background: additionalContext || context.background || sessionData.chiefComplaint || '',
        language: 'nl'
      },
      scribeSessionId: sessionData.sessionId
    };
  }

  /**
   * Generate appropriate subject line based on objective and session data
   */
  private static generateSubject(
    objective: CommunicationObjective,
    sessionData: ScribeSessionData
  ): string {
    const initials = sessionData.patientInfo.initials;
    
    switch (objective) {
      case 'referral':
        return `Verwijzing patiënt ${initials}`;
      case 'follow_up':
        return `Follow-up ${initials}`;
      case 'patient_education':
        return `Behandelinformatie`;
      case 'red_flag_notification':
        return `URGENT: ${initials} - Red flag`;
      case 'treatment_update':
        return `Behandeling update ${initials}`;
      default:
        return `Betreffende patiënt ${initials}`;
    }
  }
}