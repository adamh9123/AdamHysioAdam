// Comprehensive error handling and fallback mechanisms for SmartMail AI generation
// Provides robust error recovery with graceful degradation and user-friendly messaging

import type {
  EmailGenerationRequest,
  EmailTemplate,
  EmailGenerationResponse,
  RecipientType,
  CommunicationContext,
  EmailSuggestion
} from '@/lib/types/smartmail';
import { TemplateCache } from '@/lib/smartmail/caching';
import { generateEmailFromTemplate } from '@/lib/smartmail/email-templates';
import { validatePrivacyContent } from '@/lib/smartmail/validation';

// Error classification for appropriate handling
export type SmartMailErrorType = 
  | 'ai_service_unavailable'
  | 'rate_limit_exceeded'
  | 'invalid_api_key'
  | 'content_policy_violation'
  | 'context_length_exceeded'
  | 'network_timeout'
  | 'validation_error'
  | 'privacy_violation'
  | 'unknown_error';

// Fallback strategy types
export type FallbackStrategy = 
  | 'cached_template'
  | 'simplified_template'
  | 'basic_template'
  | 'manual_guidance'
  | 'error_notification';

// Error details with context and recovery options
export interface SmartMailError {
  type: SmartMailErrorType;
  message: string;
  originalError?: Error;
  context?: {
    recipient?: RecipientType;
    objective?: string;
    language?: string;
    retryAttempt?: number;
  };
  fallbackStrategy: FallbackStrategy;
  recoveryOptions: ErrorRecoveryOption[];
  userFriendlyMessage: string;
  technicalDetails?: string;
}

// Recovery option for error scenarios
export interface ErrorRecoveryOption {
  id: string;
  label: string;
  description: string;
  action: 'retry' | 'fallback' | 'manual' | 'contact_support';
  estimatedTime?: string;
  requiresUserInput?: boolean;
}

// Retry configuration for different error types
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // milliseconds
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: SmartMailErrorType[];
}

// Fallback template configuration
interface FallbackTemplateConfig {
  recipient: RecipientType;
  context: CommunicationContext;
  strategy: FallbackStrategy;
}

/**
 * Comprehensive error handling system for SmartMail
 */
export class SmartMailErrorHandler {
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      'ai_service_unavailable',
      'rate_limit_exceeded',
      'network_timeout'
    ]
  };

  private errorMessages: Record<SmartMailErrorType, {
    user: string;
    technical: string;
    fallbackStrategy: FallbackStrategy;
  }> = {
    ai_service_unavailable: {
      user: 'De AI-service is tijdelijk niet beschikbaar. We proberen een alternatieve oplossing.',
      technical: 'OpenAI API service unavailable or experiencing downtime',
      fallbackStrategy: 'cached_template'
    },
    rate_limit_exceeded: {
      user: 'We hebben te veel verzoeken ontvangen. Even wachten en opnieuw proberen.',
      technical: 'API rate limit exceeded for current billing period',
      fallbackStrategy: 'cached_template'
    },
    invalid_api_key: {
      user: 'Er is een configuratieprobleem. Contacteer de systeembeheerder.',
      technical: 'OpenAI API key is invalid or expired',
      fallbackStrategy: 'basic_template'
    },
    content_policy_violation: {
      user: 'De inhoud voldoet niet aan de veiligheidsnormen. Pas de tekst aan.',
      technical: 'Generated content violates OpenAI content policy',
      fallbackStrategy: 'manual_guidance'
    },
    context_length_exceeded: {
      user: 'De context is te lang. Probeer kortere tekst of minder documenten.',
      technical: 'Input context exceeds maximum token limit for model',
      fallbackStrategy: 'simplified_template'
    },
    network_timeout: {
      user: 'Netwerkverbinding time-out. Controleer je internetverbinding.',
      technical: 'Network request timed out or connection lost',
      fallbackStrategy: 'cached_template'
    },
    validation_error: {
      user: 'De ingevoerde gegevens zijn niet volledig. Controleer alle velden.',
      technical: 'Input validation failed for required fields',
      fallbackStrategy: 'manual_guidance'
    },
    privacy_violation: {
      user: 'Mogelijk privacy-gevoelige informatie gedetecteerd. Controleer de inhoud.',
      technical: 'Potential PHI or sensitive information detected in input',
      fallbackStrategy: 'manual_guidance'
    },
    unknown_error: {
      user: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.',
      technical: 'Unhandled error occurred during processing',
      fallbackStrategy: 'basic_template'
    }
  };

  /**
   * Classify error type based on error message and context
   */
  classifyError(error: Error | string, context?: any): SmartMailErrorType {
    const errorMessage = typeof error === 'string' ? error : error.message.toLowerCase();
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return 'rate_limit_exceeded';
    }
    
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401') || errorMessage.includes('api key')) {
      return 'invalid_api_key';
    }
    
    if (errorMessage.includes('service unavailable') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return 'ai_service_unavailable';
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return 'network_timeout';
    }
    
    if (errorMessage.includes('content policy') || errorMessage.includes('safety')) {
      return 'content_policy_violation';
    }
    
    if (errorMessage.includes('context length') || errorMessage.includes('token limit')) {
      return 'context_length_exceeded';
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('required field')) {
      return 'validation_error';
    }
    
    if (errorMessage.includes('privacy') || errorMessage.includes('phi')) {
      return 'privacy_violation';
    }
    
    return 'unknown_error';
  }

  /**
   * Create comprehensive error object with recovery options
   */
  createSmartMailError(
    error: Error | string,
    context?: {
      recipient?: RecipientType;
      objective?: string;
      language?: string;
      retryAttempt?: number;
    }
  ): SmartMailError {
    const originalError = typeof error === 'string' ? new Error(error) : error;
    const errorType = this.classifyError(originalError, context);
    const errorConfig = this.errorMessages[errorType];
    
    const recoveryOptions = this.generateRecoveryOptions(errorType, context);
    
    return {
      type: errorType,
      message: originalError.message,
      originalError,
      context,
      fallbackStrategy: errorConfig.fallbackStrategy,
      recoveryOptions,
      userFriendlyMessage: errorConfig.user,
      technicalDetails: errorConfig.technical
    };
  }

  /**
   * Generate context-appropriate recovery options
   */
  private generateRecoveryOptions(
    errorType: SmartMailErrorType,
    context?: any
  ): ErrorRecoveryOption[] {
    const baseOptions: ErrorRecoveryOption[] = [];
    
    // Always offer retry for retryable errors
    if (this.retryConfig.retryableErrors.includes(errorType)) {
      baseOptions.push({
        id: 'retry',
        label: 'Opnieuw proberen',
        description: 'Probeer de email opnieuw te genereren',
        action: 'retry',
        estimatedTime: '30 seconden'
      });
    }
    
    // Fallback to cached template if available
    if (['ai_service_unavailable', 'rate_limit_exceeded', 'network_timeout'].includes(errorType)) {
      baseOptions.push({
        id: 'use_cached',
        label: 'Gebruik sjabloon',
        description: 'Gebruik een vergelijkbare email uit de cache',
        action: 'fallback',
        estimatedTime: '5 seconden'
      });
    }
    
    // Simplify context for token limit errors
    if (errorType === 'context_length_exceeded') {
      baseOptions.push({
        id: 'simplify_context',
        label: 'Vereenvoudig context',
        description: 'Genereer email met minder gedetailleerde context',
        action: 'fallback',
        estimatedTime: '30 seconden',
        requiresUserInput: true
      });
      
      baseOptions.push({
        id: 'remove_documents',
        label: 'Verwijder documenten',
        description: 'Genereer email zonder bijgevoegde documenten',
        action: 'fallback',
        estimatedTime: '30 seconden'
      });
    }
    
    // Manual composition for policy violations
    if (['content_policy_violation', 'privacy_violation', 'validation_error'].includes(errorType)) {
      baseOptions.push({
        id: 'manual_compose',
        label: 'Handmatig opstellen',
        description: 'Krijg begeleiding voor het handmatig opstellen van de email',
        action: 'manual',
        estimatedTime: '10 minuten',
        requiresUserInput: true
      });
    }
    
    // Basic template fallback
    baseOptions.push({
      id: 'basic_template',
      label: 'Basis sjabloon',
      description: 'Gebruik een eenvoudige standaard email sjabloon',
      action: 'fallback',
      estimatedTime: '10 seconden'
    });
    
    // Contact support for persistent issues
    if (context?.retryAttempt && context.retryAttempt >= 2) {
      baseOptions.push({
        id: 'contact_support',
        label: 'Contact support',
        description: 'Neem contact op met technische ondersteuning',
        action: 'contact_support',
        requiresUserInput: true
      });
    }
    
    return baseOptions;
  }

  /**
   * Attempt automatic recovery using fallback strategies
   */
  async attemptRecovery(
    request: EmailGenerationRequest,
    error: SmartMailError
  ): Promise<EmailGenerationResponse> {
    const { fallbackStrategy } = error;
    
    try {
      switch (fallbackStrategy) {
        case 'cached_template':
          return await this.tryGetCachedTemplate(request, error);
          
        case 'simplified_template':
          return await this.trySimplifiedTemplate(request, error);
          
        case 'basic_template':
          return await this.tryBasicTemplate(request, error);
          
        case 'manual_guidance':
          return this.provideManualGuidance(request, error);
          
        case 'error_notification':
        default:
          return this.createErrorResponse(error);
      }
    } catch (fallbackError) {
      // If fallback also fails, provide basic error response
      const secondaryError = this.createSmartMailError(
        fallbackError instanceof Error ? fallbackError : 'Fallback strategy failed',
        { ...error.context, retryAttempt: (error.context?.retryAttempt || 0) + 1 }
      );
      
      return this.createErrorResponse(secondaryError);
    }
  }

  /**
   * Try to get similar template from cache
   */
  private async tryGetCachedTemplate(
    request: EmailGenerationRequest,
    error: SmartMailError
  ): Promise<EmailGenerationResponse> {
    const cachedTemplate = TemplateCache.getCachedTemplate(request);
    
    if (cachedTemplate) {
      return {
        success: true,
        template: {
          ...cachedTemplate,
          id: `fallback_${Date.now()}`,
          generatedAt: new Date().toISOString()
        },
        warnings: ['Email werd gegenereerd op basis van een vergelijkbare cached sjabloon'],
        suggestions: [{
          type: 'fallback_used',
          message: 'Cached sjabloon gebruikt vanwege AI service problemen',
          severity: 'info',
          actionable: false
        }],
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          processingTime: 50
        }
      };
    }
    
    // No cached template available, try simplified approach
    return this.trySimplifiedTemplate(request, error);
  }

  /**
   * Generate simplified template with reduced context
   */
  private async trySimplifiedTemplate(
    request: EmailGenerationRequest,
    error: SmartMailError
  ): Promise<EmailGenerationResponse> {
    // Create simplified request without documents and complex context
    const simplifiedContext: CommunicationContext = {
      objective: request.context.objective,
      subject: request.context.subject,
      background: request.context.background,
      language: request.context.language || request.recipient.language
    };
    
    const template = generateEmailFromTemplate(
      request.recipient.category,
      simplifiedContext.objective,
      {
        patientName: 'de patiënt',
        subject: simplifiedContext.subject,
        reason: simplifiedContext.background || 'Follow-up nodig',
        practitionerName: 'Dr. [Naam]',
        practiceInfo: {
          name: '[Praktijk naam]',
          phone: '[Telefoonnummer]',
          email: '[Email adres]'
        }
      },
      request.recipient.language
    );
    
    return {
      success: true,
      template: {
        id: `simplified_${Date.now()}`,
        subject: template.subject,
        content: template.content,
        formattedContent: {
          html: template.content.replace(/\n/g, '<br>'),
          plainText: template.content
        },
        metadata: {
          recipientCategory: request.recipient.category,
          objective: request.context.objective,
          language: request.recipient.language,
          wordCount: template.content.split(/\s+/).length,
          estimatedReadingTime: Math.ceil(template.content.split(/\s+/).length / 200),
          formalityLevel: request.recipient.formality,
          includedDisclaimer: false
        },
        generatedAt: new Date().toISOString(),
        userId: request.userId,
        requestId: request.requestId
      },
      warnings: ['Vereenvoudigde email gegenereerd vanwege technische beperkingen'],
      suggestions: [{
        type: 'fallback_used',
        message: 'Basis sjabloon gebruikt - pas aan waar nodig',
        severity: 'info',
        actionable: true,
        suggestedAction: 'Controleer en personaliseer de email inhoud'
      }],
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        processingTime: 100
      }
    };
  }

  /**
   * Generate basic template with minimal context
   */
  private async tryBasicTemplate(
    request: EmailGenerationRequest,
    error: SmartMailError
  ): Promise<EmailGenerationResponse> {
    const language = request.recipient.language;
    const isdutch = language === 'nl';
    
    // Very basic template structure
    const basicContent = isdutch 
      ? `Beste [Naam],

Hierbij de gevraagde informatie betreffende: ${request.context.subject}

${request.context.background || 'Meer informatie volgt.'}

Met vriendelijke groet,
Dr. [Uw naam]
[Praktijk naam]
[Contactgegevens]`
      : `Dear [Name],

Please find the requested information regarding: ${request.context.subject}

${request.context.background || 'More information to follow.'}

Kind regards,
Dr. [Your name]
[Practice name]
[Contact details]`;

    return {
      success: true,
      template: {
        id: `basic_${Date.now()}`,
        subject: request.context.subject,
        content: basicContent,
        formattedContent: {
          html: basicContent.replace(/\n/g, '<br>'),
          plainText: basicContent
        },
        metadata: {
          recipientCategory: request.recipient.category,
          objective: request.context.objective,
          language: request.recipient.language,
          wordCount: basicContent.split(/\s+/).length,
          estimatedReadingTime: 1,
          formalityLevel: request.recipient.formality,
          includedDisclaimer: false
        },
        generatedAt: new Date().toISOString(),
        userId: request.userId,
        requestId: request.requestId
      },
      warnings: ['Basis email sjabloon gegenereerd - uitgebreide personalisatie vereist'],
      suggestions: [
        {
          type: 'manual_edit_required',
          message: 'Vervang placeholders met actuele informatie',
          severity: 'warning',
          actionable: true,
          suggestedAction: 'Personaliseer naam, praktijk info en specifieke details'
        },
        {
          type: 'content_review',
          message: 'Controleer medische nauwkeurigheid van de inhoud',
          severity: 'warning',
          actionable: true,
          suggestedAction: 'Voeg specifieke medische details toe waar nodig'
        }
      ],
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        processingTime: 50
      }
    };
  }

  /**
   * Provide manual composition guidance
   */
  private provideManualGuidance(
    request: EmailGenerationRequest,
    error: SmartMailError
  ): EmailGenerationResponse {
    const language = request.recipient.language;
    const isdutch = language === 'nl';
    
    const guidanceContent = isdutch
      ? this.getManualGuidanceDutch(request)
      : this.getManualGuidanceEnglish(request);
    
    const suggestions: EmailSuggestion[] = [
      {
        type: 'manual_guidance',
        message: isdutch ? 'Handmatige samenstelling vereist' : 'Manual composition required',
        severity: 'info',
        actionable: true,
        suggestedAction: isdutch 
          ? 'Volg de onderstaande richtlijnen voor email compositie'
          : 'Follow the guidelines below for email composition'
      }
    ];
    
    // Add specific guidance based on error type
    if (error.type === 'privacy_violation') {
      suggestions.push({
        type: 'privacy_warning',
        message: isdutch ? 'Zorg ervoor dat geen patiënt-identificeerbare informatie wordt gebruikt' : 'Ensure no patient-identifiable information is used',
        severity: 'warning',
        actionable: true,
        suggestedAction: isdutch ? 'Gebruik alleen initialen of algemene beschrijvingen' : 'Use only initials or general descriptions'
      });
    }
    
    return {
      success: false,
      error: error.userFriendlyMessage,
      template: {
        id: `guidance_${Date.now()}`,
        subject: isdutch ? `Re: ${request.context.subject}` : `Re: ${request.context.subject}`,
        content: guidanceContent,
        formattedContent: {
          html: guidanceContent.replace(/\n/g, '<br>'),
          plainText: guidanceContent
        },
        metadata: {
          recipientCategory: request.recipient.category,
          objective: request.context.objective,
          language: request.recipient.language,
          wordCount: guidanceContent.split(/\s+/).length,
          estimatedReadingTime: Math.ceil(guidanceContent.split(/\s+/).length / 200),
          formalityLevel: request.recipient.formality,
          includedDisclaimer: false
        },
        generatedAt: new Date().toISOString(),
        userId: request.userId,
        requestId: request.requestId
      },
      suggestions
    };
  }

  /**
   * Dutch manual guidance content
   */
  private getManualGuidanceDutch(request: EmailGenerationRequest): string {
    const recipient = request.recipient.category;
    const objective = request.context.objective;
    
    return `
HANDLEIDING VOOR HANDMATIGE EMAIL COMPOSITIE

Ontvanger: ${recipient}
Doel: ${objective}

STRUCTUUR:
1. Aanhef: Kies passende begroeting
   - Patiënt: "Beste [naam]" of "Geachte heer/mevrouw [achternaam]"
   - Collega: "Beste collega" of "Beste [voornaam]"
   - Specialist: "Geachte collega" of "Beste dr. [achternaam]"

2. Inleiding: Verwijs naar eerdere contact of reden van schrijven
   - "Naar aanleiding van..."
   - "Betreffende patiënt..."
   - "Na ons gesprek van..."

3. Hoofdtekst: Kernboodschap duidelijk en gestructureerd
   - Gebruik korte, heldere zinnen
   - Vermijd medisch jargon bij patiëntencommunicatie
   - Gebruik professionele terminologie bij collegacommunicatie

4. Actie/Vervolgstappen: Wat er nu moet gebeuren
   - "Graag zie ik u op..."
   - "Kunt u contact opnemen..."
   - "Ik verwacht uw bevindingen..."

5. Afsluiting: Passende groet
   - "Met vriendelijke groet"
   - "Hoogachtend"
   - "Met collegiale groet"

6. Handtekening: Naam, titel, praktijkgegevens

BELANGRIJKE PUNTEN:
- Geen patiëntgegevens in onderwerp
- Privacy respecteren (gebruik initialen)
- Professionele toon handhaven
- Duidelijke call-to-action
- Contactgegevens vermelden

Let op: Controleer altijd medische nauwkeurigheid en privacy compliance.
`;
  }

  /**
   * English manual guidance content
   */
  private getManualGuidanceEnglish(request: EmailGenerationRequest): string {
    const recipient = request.recipient.category;
    const objective = request.context.objective;
    
    return `
MANUAL EMAIL COMPOSITION GUIDE

Recipient: ${recipient}
Objective: ${objective}

STRUCTURE:
1. Salutation: Choose appropriate greeting
   - Patient: "Dear [name]" or "Dear Mr./Ms. [surname]"
   - Colleague: "Dear colleague" or "Dear [first name]"
   - Specialist: "Dear colleague" or "Dear Dr. [surname]"

2. Introduction: Reference previous contact or reason for writing
   - "Following our..."
   - "Regarding patient..."
   - "After our discussion on..."

3. Main content: Core message clearly and structured
   - Use short, clear sentences
   - Avoid medical jargon for patient communication
   - Use professional terminology for colleague communication

4. Action/Next steps: What needs to happen now
   - "I look forward to seeing you on..."
   - "Please contact..."
   - "I await your findings..."

5. Closing: Appropriate farewell
   - "Kind regards"
   - "Sincerely"
   - "With collegial regards"

6. Signature: Name, title, practice details

IMPORTANT POINTS:
- No patient data in subject line
- Respect privacy (use initials)
- Maintain professional tone
- Clear call-to-action
- Include contact information

Note: Always verify medical accuracy and privacy compliance.
`;
  }

  /**
   * Create error response when all fallbacks fail
   */
  private createErrorResponse(error: SmartMailError): EmailGenerationResponse {
    return {
      success: false,
      error: error.userFriendlyMessage,
      suggestions: error.recoveryOptions.map(option => ({
        type: 'error_recovery',
        message: option.label,
        severity: 'error',
        actionable: option.action !== 'contact_support',
        suggestedAction: option.description
      }))
    };
  }

  /**
   * Implement retry logic with exponential backoff
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context?: any
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorType = this.classifyError(lastError, context);
        
        // Don't retry non-retryable errors
        if (!this.retryConfig.retryableErrors.includes(errorType)) {
          throw lastError;
        }
        
        // Don't wait after last attempt
        if (attempt === this.retryConfig.maxAttempts) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
          this.retryConfig.maxDelay
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Health check for error handler
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    retryConfig: RetryConfig;
    availableFallbacks: FallbackStrategy[];
    lastErrorCount: number;
  } {
    return {
      status: 'healthy',
      retryConfig: this.retryConfig,
      availableFallbacks: [
        'cached_template',
        'simplified_template',
        'basic_template',
        'manual_guidance',
        'error_notification'
      ],
      lastErrorCount: 0 // Would track recent errors in production
    };
  }
}

// Global error handler instance
let globalErrorHandler: SmartMailErrorHandler | null = null;

/**
 * Get global SmartMail error handler instance
 */
export function getSmartMailErrorHandler(): SmartMailErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new SmartMailErrorHandler();
  }
  return globalErrorHandler;
}

/**
 * Utility functions for error handling
 */
export const ErrorHandlerUtils = {
  /**
   * Wrap AI generation with comprehensive error handling
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    request: EmailGenerationRequest,
    context?: any
  ): Promise<T | EmailGenerationResponse> {
    const errorHandler = getSmartMailErrorHandler();
    
    try {
      return await errorHandler.retryWithBackoff(operation, context);
    } catch (error) {
      const smartMailError = errorHandler.createSmartMailError(
        error instanceof Error ? error : String(error),
        {
          recipient: request.recipient,
          objective: request.context.objective,
          language: request.recipient.language,
          ...context
        }
      );
      
      return await errorHandler.attemptRecovery(request, smartMailError);
    }
  },

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: Error | string): boolean {
    const errorHandler = getSmartMailErrorHandler();
    const errorType = errorHandler.classifyError(error);
    return errorHandler['retryConfig'].retryableErrors.includes(errorType);
  },

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error: Error | string, language: 'nl' | 'en' = 'nl'): string {
    const errorHandler = getSmartMailErrorHandler();
    const errorType = errorHandler.classifyError(error);
    const errorConfig = errorHandler['errorMessages'][errorType];
    
    // For now, return Dutch message. Could extend for English.
    return errorConfig.user;
  }
};