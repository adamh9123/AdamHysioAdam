/**
 * Workflow Error Handling Utilities
 *
 * Centralized error handling for workflow operations
 * with user-friendly messages and recovery suggestions.
 */

import { toast } from 'sonner';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface WorkflowError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  userMessage: string;
  suggestions?: string[];
  recoverable: boolean;
  timestamp: string;
}

export class WorkflowErrorHandler {
  private static errors: WorkflowError[] = [];

  /**
   * Handle workflow errors with toast notifications
   */
  static handle(error: unknown, context: string): WorkflowError {
    const workflowError = this.createWorkflowError(error, context);
    this.errors.push(workflowError);

    // Show toast notification based on severity
    this.showToast(workflowError);

    // Log to console for debugging
    console.error(`[${context}]`, error);

    return workflowError;
  }

  /**
   * Create a structured workflow error
   */
  private static createWorkflowError(error: unknown, context: string): WorkflowError {
    if (error instanceof Error) {
      return {
        code: `WORKFLOW_${context.toUpperCase()}_ERROR`,
        message: error.message,
        severity: 'error',
        userMessage: this.getUserMessage(error, context),
        suggestions: this.getSuggestions(error, context),
        recoverable: this.isRecoverable(error),
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      severity: 'error',
      userMessage: 'Er is een onverwachte fout opgetreden',
      suggestions: ['Probeer het opnieuw', 'Herlaad de pagina als het probleem aanhoudt'],
      recoverable: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user-friendly error message
   */
  private static getUserMessage(error: Error, context: string): string {
    const errorMessages: Record<string, string> = {
      transcription: 'Audio transcriptie is mislukt',
      processing: 'Verwerking van gegevens is mislukt',
      api: 'Communicatie met de server is mislukt',
      validation: 'De invoer is niet geldig',
      export: 'Exporteren van gegevens is mislukt',
      audio: 'Audio opname is mislukt',
      document: 'Document verwerking is mislukt',
    };

    return errorMessages[context.toLowerCase()] || 'Er is een fout opgetreden';
  }

  /**
   * Get recovery suggestions
   */
  private static getSuggestions(error: Error, context: string): string[] {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return [
        'Controleer uw internetverbinding',
        'Probeer het over een paar seconden opnieuw',
      ];
    }

    // Audio errors
    if (context === 'audio' || message.includes('microphone')) {
      return [
        'Controleer of uw microfoon toegang heeft',
        'Probeer een andere browser',
        'Upload een bestaand audiobestand',
      ];
    }

    // Validation errors
    if (context === 'validation') {
      return [
        'Controleer de ingevoerde gegevens',
        'Zorg dat alle vereiste velden zijn ingevuld',
      ];
    }

    // API errors
    if (context === 'api' || message.includes('api')) {
      return [
        'De server reageert niet',
        'Probeer het over een paar seconden opnieuw',
        'Neem contact op met support als het probleem aanhoudt',
      ];
    }

    // Default suggestions
    return [
      'Probeer het opnieuw',
      'Herlaad de pagina als het probleem aanhoudt',
    ];
  }

  /**
   * Check if error is recoverable
   */
  private static isRecoverable(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Unrecoverable errors
    const unrecoverablePatterns = [
      'authentication',
      'authorization',
      'permission denied',
      'not found',
      'invalid token',
    ];

    return !unrecoverablePatterns.some(pattern => message.includes(pattern));
  }

  /**
   * Show toast notification
   */
  private static showToast(error: WorkflowError): void {
    const toastOptions = {
      description: error.suggestions?.[0] || 'Probeer het opnieuw',
      duration: error.severity === 'critical' ? 10000 : 5000,
    };

    switch (error.severity) {
      case 'critical':
      case 'error':
        toast.error(error.userMessage, toastOptions);
        break;
      case 'warning':
        toast.warning(error.userMessage, toastOptions);
        break;
      case 'info':
        toast.info(error.userMessage, toastOptions);
        break;
    }
  }

  /**
   * Get error history
   */
  static getErrorHistory(): WorkflowError[] {
    return [...this.errors];
  }

  /**
   * Clear error history
   */
  static clearErrorHistory(): void {
    this.errors = [];
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(count = 5): WorkflowError[] {
    return this.errors.slice(-count);
  }
}

/**
 * Common workflow error handlers
 */
export const handleTranscriptionError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'transcription');
};

export const handleProcessingError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'processing');
};

export const handleApiError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'api');
};

export const handleValidationError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'validation');
};

export const handleAudioError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'audio');
};

export const handleDocumentError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'document');
};

export const handleExportError = (error: unknown) => {
  return WorkflowErrorHandler.handle(error, 'export');
};

/**
 * Async error wrapper with automatic error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string,
  onError?: (error: WorkflowError) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const workflowError = WorkflowErrorHandler.handle(error, context);
    onError?.(workflowError);
    return null;
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    context?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    context = 'operation',
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));

        toast.info(
          `Poging ${attempt + 1} van ${maxRetries} mislukt`,
          { description: `Opnieuw proberen over ${delay / 1000} seconden...` }
        );
      }
    }
  }

  throw WorkflowErrorHandler.handle(lastError, context);
}