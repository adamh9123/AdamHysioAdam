// Error handling and validation for DCSPH operations

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AI_ERROR = 'AI_ERROR',
  KNOWLEDGE_BASE_ERROR = 'KNOWLEDGE_BASE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface DCSPHError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  suggestions?: string[];
}

export class DCSPHErrorHandler {

  /**
   * Create a standardized error object
   */
  static createError(
    type: ErrorType,
    message: string,
    options: {
      code?: string;
      details?: any;
      recoverable?: boolean;
      suggestions?: string[];
    } = {}
  ): DCSPHError {
    return {
      type,
      message,
      code: options.code,
      details: options.details,
      timestamp: new Date(),
      recoverable: options.recoverable ?? false,
      suggestions: options.suggestions
    };
  }

  /**
   * Handle validation errors for DCSPH codes
   */
  static handleValidationError(code: string, reason: string): DCSPHError {
    const suggestions = this.generateValidationSuggestions(code, reason);

    return this.createError(
      ErrorType.VALIDATION_ERROR,
      `Ongeldige DCSPH code: ${reason}`,
      {
        code,
        recoverable: true,
        suggestions
      }
    );
  }

  /**
   * Handle AI processing errors
   */
  static handleAIError(query: string, error: any): DCSPHError {
    let message = 'Er is een fout opgetreden bij het verwerken van uw vraag.';
    let recoverable = true;
    const suggestions = [
      'Probeer uw vraag anders te formuleren',
      'Gebruik meer specifieke medische termen',
      'Geef meer details over de klacht'
    ];

    // Categorize different AI errors
    if (error.status === 429) {
      message = 'Te veel verzoeken. Probeer het over een moment opnieuw.';
      return this.createError(ErrorType.RATE_LIMIT_ERROR, message, {
        recoverable: true,
        suggestions: ['Wacht 1 minuut en probeer opnieuw']
      });
    }

    if (error.status >= 500) {
      message = 'Tijdelijke serverfout. Probeer het over een moment opnieuw.';
      recoverable = true;
    }

    if (error.message?.includes('timeout')) {
      message = 'Verzoek duurde te lang. Probeer een kortere vraag.';
      suggestions.unshift('Maak uw vraag korter en specifieker');
    }

    return this.createError(
      ErrorType.AI_ERROR,
      message,
      {
        details: error,
        recoverable,
        suggestions
      }
    );
  }

  /**
   * Handle knowledge base errors
   */
  static handleKnowledgeBaseError(operation: string, error: any): DCSPHError {
    return this.createError(
      ErrorType.KNOWLEDGE_BASE_ERROR,
      `Fout in kennis database bij ${operation}`,
      {
        details: error,
        recoverable: false,
        suggestions: [
          'Contacteer de systeembeheerder',
          'Probeer handmatig zoeken in DCSPH tabellen'
        ]
      }
    );
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): DCSPHError {
    let message = 'Netwerkfout. Controleer uw internetverbinding.';
    const suggestions = [
      'Controleer uw internetverbinding',
      'Probeer de pagina te verversen',
      'Probeer het over enkele minuten opnieuw'
    ];

    if (error.code === 'NETWORK_ERROR') {
      message = 'Geen internetverbinding. Controleer uw netwerk.';
    } else if (error.status === 0) {
      message = 'Server niet bereikbaar. Probeer het later opnieuw.';
    }

    return this.createError(
      ErrorType.NETWORK_ERROR,
      message,
      {
        details: error,
        recoverable: true,
        suggestions
      }
    );
  }

  /**
   * Generate suggestions for validation errors
   */
  private static generateValidationSuggestions(code: string, reason: string): string[] {
    const suggestions: string[] = [];

    if (reason.includes('4 cijfers')) {
      suggestions.push('DCSPH codes bestaan uit exact 4 cijfers');
      suggestions.push('Voorbeeld: 7920 (79=locatie, 20=pathologie)');
    }

    if (reason.includes('cijfers bevatten')) {
      suggestions.push('Gebruik alleen cijfers (0-9)');
      suggestions.push('Geen letters, spaties of speciale tekens');
    }

    if (reason.includes('Locatiecode')) {
      suggestions.push('Controleer de eerste 2 cijfers (locatiecode)');
      suggestions.push('Raadpleeg DCSPH Tabel A voor geldige locatiecodes');
    }

    if (reason.includes('Pathologiecode')) {
      suggestions.push('Controleer de laatste 2 cijfers (pathologiecode)');
      suggestions.push('Raadpleeg DCSPH Tabel B voor geldige pathologiecodes');
    }

    // If no specific suggestions, provide general ones
    if (suggestions.length === 0) {
      suggestions.push('Controleer de DCSPH code format');
      suggestions.push('Gebruik de AI zoekfunctie voor hulp');
    }

    return suggestions;
  }

  /**
   * Check if error is recoverable and suggest retry
   */
  static shouldRetry(error: DCSPHError): boolean {
    return error.recoverable && (
      error.type === ErrorType.NETWORK_ERROR ||
      error.type === ErrorType.AI_ERROR ||
      error.type === ErrorType.RATE_LIMIT_ERROR
    );
  }

  /**
   * Get user-friendly error message in Dutch
   */
  static getUserMessage(error: DCSPHError): string {
    switch (error.type) {
      case ErrorType.VALIDATION_ERROR:
        return `Code validatie fout: ${error.message}`;

      case ErrorType.NETWORK_ERROR:
        return 'Verbindingsprobleem. Controleer uw internet en probeer opnieuw.';

      case ErrorType.AI_ERROR:
        return 'Er ging iets mis bij het verwerken. Probeer uw vraag anders te stellen.';

      case ErrorType.RATE_LIMIT_ERROR:
        return 'Te veel verzoeken. Wacht even en probeer opnieuw.';

      case ErrorType.KNOWLEDGE_BASE_ERROR:
        return 'Systeemfout. Contacteer support als dit blijft gebeuren.';

      default:
        return 'Er is een onbekende fout opgetreden. Probeer opnieuw.';
    }
  }

  /**
   * Log error for monitoring and debugging
   */
  static logError(error: DCSPHError, context?: any): void {
    const logEntry = {
      timestamp: error.timestamp.toISOString(),
      type: error.type,
      message: error.message,
      code: error.code,
      recoverable: error.recoverable,
      context,
      details: error.details
    };

    // In production, this would go to a logging service
    if (process.env.NODE_ENV === 'development') {
      console.error('DCSPH Error:', logEntry);
    }

    // Could integrate with monitoring services like Sentry
    // Sentry.captureException(logEntry);
  }

  /**
   * Create safe error response for API
   */
  static createErrorResponse(error: DCSPHError) {
    return {
      success: false,
      error: {
        type: error.type,
        message: this.getUserMessage(error),
        suggestions: error.suggestions,
        recoverable: error.recoverable,
        timestamp: error.timestamp.toISOString()
      }
    };
  }

  /**
   * Validate query input
   */
  static validateQuery(query: string): DCSPHError | null {
    if (!query || typeof query !== 'string') {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'Vraag is vereist en moet tekst bevatten',
        {
          recoverable: true,
          suggestions: ['Typ uw vraag in het tekstveld']
        }
      );
    }

    if (query.trim().length < 3) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'Vraag is te kort. Gebruik minimaal 3 karakters',
        {
          recoverable: true,
          suggestions: [
            'Beschrijf de klacht in meer detail',
            'Geef aan waar de klachten zich bevinden'
          ]
        }
      );
    }

    if (query.length > 1000) {
      return this.createError(
        ErrorType.VALIDATION_ERROR,
        'Vraag is te lang. Gebruik maximaal 1000 karakters',
        {
          recoverable: true,
          suggestions: [
            'Maak uw vraag korter en bondiger',
            'Focus op de hoofdklacht'
          ]
        }
      );
    }

    // Check for suspicious content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /<iframe/i,
      /eval\(/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(query)) {
        return this.createError(
          ErrorType.VALIDATION_ERROR,
          'Ongeldige karakters in vraag',
          {
            recoverable: true,
            suggestions: ['Gebruik alleen normale tekst zonder code']
          }
        );
      }
    }

    return null;
  }
}

/**
 * Global error boundary for DCSPH operations
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context: string
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result.catch((error) => {
          const dcsphError = DCSPHErrorHandler.handleAIError(context, error);
          DCSPHErrorHandler.logError(dcsphError, { args });
          throw dcsphError;
        });
      }

      return result;
    } catch (error) {
      const dcsphError = DCSPHErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        `Fout in ${context}`,
        {
          details: error,
          recoverable: false
        }
      );
      DCSPHErrorHandler.logError(dcsphError, { args });
      throw dcsphError;
    }
  }) as T;
}