// AI Integration and Response Validation for DCSPH Code Finding

import {
  AI_MODEL_CONFIG,
  buildConversationContext,
  validateAIResponse,
  generateFallbackResponse,
  determineClarifyingQuestion
} from './ai-prompts';

import { DCSPHKnowledgeBase, KnowledgeBaseQuery, KnowledgeBaseResponse } from './dcsph-knowledge-base';
import { validateDCSPHCode } from './code-validator';
import { MedicalPatternMatcher } from './pattern-matcher';
import { RationaleGenerator } from './rationale-generator';
import { DCSPHErrorHandler, ErrorType } from './error-handling';
import { conversationManager } from './conversation-manager';

export interface AIRequest {
  query: string;
  conversationId?: string;
  context?: {
    previousQuestions?: string[];
    previousAnswers?: string[];
  };
}

export interface AIResponse {
  success: boolean;
  suggestions: Array<{
    code: string;
    name: string;
    rationale: string;
    confidence: number;
  }>;
  needsClarification: boolean;
  clarifyingQuestion?: string;
  conversationId: string;
  error?: any;
}

export interface ValidationResult {
  isValid: boolean;
  validatedSuggestions: Array<{
    code: string;
    name: string;
    rationale: string;
    confidence: number;
    validationScore: number;
  }>;
  invalidCodes: string[];
  warnings: string[];
}

export class AIIntegration {
  private static readonly MAX_RETRIES = 2;
  private static readonly FALLBACK_THRESHOLD = 0.3;

  /**
   * Main entry point for AI-powered DCSPH code finding
   */
  static async processQuery(request: AIRequest): Promise<AIResponse> {
    try {
      // Validate input
      const inputError = DCSPHErrorHandler.validateQuery(request.query);
      if (inputError) {
        throw inputError;
      }

      // Get or create conversation
      const conversationId = request.conversationId ||
        conversationManager.startConversation(request.query);

      // Add user message if continuing conversation
      if (request.conversationId) {
        conversationManager.addMessage(conversationId, 'user', request.query, 'query');
      }

      // Try AI processing first
      let aiResponse: AIResponse | null = null;
      let attemptCount = 0;

      while (attemptCount < this.MAX_RETRIES && !aiResponse) {
        attemptCount++;

        try {
          aiResponse = await this.callAIService(request, conversationId);

          // Validate AI response
          const validation = this.validateAIResponse(aiResponse);

          if (validation.isValid) {
            // Enhance with detailed rationales
            aiResponse = await this.enhanceWithRationales(aiResponse, request);
            break;
          } else {
            DCSPHErrorHandler.logError(
              DCSPHErrorHandler.createError(
                ErrorType.AI_ERROR,
                `AI response validation failed: ${validation.warnings.join(', ')}`,
                { details: validation }
              )
            );
            aiResponse = null;
          }
        } catch (error: any) {
          if (attemptCount >= this.MAX_RETRIES) {
            throw error;
          }

          // Wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
        }
      }

      // Fall back to pattern matching if AI fails
      if (!aiResponse) {
        aiResponse = await this.fallbackToPatternMatching(request, conversationId);
      }

      // Update conversation
      if (aiResponse.needsClarification) {
        conversationManager.addClarifyingQuestion(conversationId, aiResponse.clarifyingQuestion!);
      } else {
        conversationManager.completeConversation(conversationId, aiResponse.suggestions);
      }

      return aiResponse;

    } catch (error: any) {
      const dcsphError = DCSPHErrorHandler.handleAIError(request.query, error);
      DCSPHErrorHandler.logError(dcsphError);

      return {
        success: false,
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: 'Er is een fout opgetreden. Kunt u uw vraag opnieuw stellen?',
        conversationId: request.conversationId || '',
        error: DCSPHErrorHandler.createErrorResponse(dcsphError)
      };
    }
  }

  /**
   * Call AI service (OpenAI/GPT-5-mini)
   */
  private static async callAIService(request: AIRequest, conversationId: string): Promise<AIResponse> {
    // Build conversation context
    const conversationHistory = conversationManager.getConversationHistory(conversationId);
    const messages = [
      { role: 'system' as const, content: AI_MODEL_CONFIG.systemPrompt },
      ...conversationHistory,
    ];

    // Mock AI call - in real implementation, this would call OpenAI API
    const aiResponseText = await this.mockAICall(messages);

    // Parse AI response
    const parseResult = validateAIResponse(aiResponseText);

    if (!parseResult.isValid) {
      throw new Error(`AI response parsing failed: ${parseResult.error}`);
    }

    const parsedResponse = parseResult.parsedResponse!;

    return {
      success: true,
      suggestions: parsedResponse.suggestions.map(s => ({
        ...s,
        confidence: 0.8 // Default confidence, will be adjusted later
      })),
      needsClarification: parsedResponse.needsClarification,
      clarifyingQuestion: parsedResponse.clarifyingQuestion,
      conversationId
    };
  }

  /**
   * Mock AI call - replace with actual OpenAI integration
   */
  private static async mockAICall(messages: Array<{ role: string; content: string }>): Promise<any> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Extract user query from messages
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    const query = userMessage.toLowerCase();

    // Enhanced pattern-based mock responses for different body regions

    // Knee patterns
    if (query.includes('knie')) {
      return {
        suggestions: [
          {
            code: '7920',
            name: 'Epicondylitis/tendinitis/tendovaginitis – knie/onderbeen/voet',
            rationale: 'Knieklachten passen vaak bij tendinitis van patellapees of andere peesstructuren rondom het kniegewricht.'
          },
          {
            code: '7921',
            name: 'Bursitis/capsulitis – knie/onderbeen/voet',
            rationale: 'Ontsteking van bursae rond het kniegewricht kan kniepijn veroorzaken.'
          },
          {
            code: '7922',
            name: 'Chondropathie/arthropathie/meniscuslaesie – knie/onderbeen/voet',
            rationale: 'Kraakbeenschade of meniscusletsel past bij knieproblematiek.'
          }
        ],
        needsClarification: false,
        clarifyingQuestion: null
      };
    }

    // Hip patterns
    if (query.includes('heup')) {
      return {
        suggestions: [
          {
            code: '5920',
            name: 'Epicondylitis/tendinitis/tendovaginitis – bekken/heup',
            rationale: 'Heupklachten kunnen ontstaan door tendinitis van periarticulaire spieren zoals de m. iliopsoas of m. gluteus medius.'
          },
          {
            code: '5921',
            name: 'Bursitis/capsulitis – bekken/heup',
            rationale: 'Bursitis trochanterica of andere bursae rond de heup veroorzaken laterale heuppijn.'
          },
          {
            code: '5923',
            name: 'Artrose – bekken/heup',
            rationale: 'Coxartrose kan lies- en heuppijn veroorzaken met bewegingsbeperking.'
          }
        ],
        needsClarification: false,
        clarifyingQuestion: null
      };
    }

    // Shoulder patterns
    if (query.includes('schouder')) {
      return {
        suggestions: [
          {
            code: '2120',
            name: 'Epicondylitis/tendinitis/tendovaginitis – schouder',
            rationale: 'Schouderklachten passen bij tendinitis van de rotator cuff of bicepspees.'
          },
          {
            code: '2121',
            name: 'Bursitis/capsulitis – schouder',
            rationale: 'Subacromiale bursitis of frozen shoulder kunnen schouderpijn veroorzaken.'
          },
          {
            code: '2126',
            name: 'Spier-pees aandoeningen – schouder',
            rationale: 'Rotator cuff problematiek is een veelvoorkomende oorzaak van schouderpijn.'
          }
        ],
        needsClarification: false,
        clarifyingQuestion: null
      };
    }

    // Neck patterns
    if (query.includes('nek') || query.includes('cervicaal')) {
      return {
        suggestions: [
          {
            code: '1027',
            name: 'HNP/discusdegeneratie – cervicale wervelkolom',
            rationale: 'Cervicale discuspathologie kan nekpijn en mogelijk uitstralende klachten veroorzaken.'
          },
          {
            code: '1026',
            name: 'Spier-pees aandoeningen – cervicale wervelkolom',
            rationale: 'Cervicale spierproblematiek door trauma of overbelasting.'
          },
          {
            code: '1038',
            name: 'Whiplash – cervicale wervelkolom',
            rationale: 'Whiplash trauma veroorzaakt cervicale klachten door plotselinge acceleratie-deceleratie.'
          }
        ],
        needsClarification: false,
        clarifyingQuestion: null
      };
    }

    // Back/lumbar patterns
    if (query.includes('rug') || query.includes('lumbaal') || query.includes('onderrug')) {
      return {
        suggestions: [
          {
            code: '3427',
            name: 'HNP/discusdegeneratie – lumbale wervelkolom',
            rationale: 'Lumbale rugklachten passen bij discusdegeneratie of hernia nuclei pulposi.'
          },
          {
            code: '3426',
            name: 'Spier-pees aandoeningen – lumbale wervelkolom',
            rationale: 'Lumbale spierproblematiek is een veel voorkomende oorzaak van rugpijn.'
          },
          {
            code: '3423',
            name: 'Artrose – lumbale wervelkolom',
            rationale: 'Degeneratieve veranderingen in de lumbale wervelkolom kunnen rugpijn veroorzaken.'
          }
        ],
        needsClarification: false,
        clarifyingQuestion: null
      };
    }

    // Ankle/foot patterns
    if (query.includes('enkel') || query.includes('voet')) {
      return {
        suggestions: [
          {
            code: '7931',
            name: 'Distorsie – knie/onderbeen/voet',
            rationale: 'Enkeldistorsie door omslaan is een veelvoorkomende oorzaak van enkelklachten.'
          },
          {
            code: '7920',
            name: 'Epicondylitis/tendinitis/tendovaginitis – knie/onderbeen/voet',
            rationale: 'Achillespees tendinitis of andere peesaandoeningen in enkel/voet gebied.'
          },
          {
            code: '7921',
            name: 'Bursitis/capsulitis – knie/onderbeen/voet',
            rationale: 'Bursitis of capsulitis van enkel- of voetgewrichten.'
          }
        ],
        needsClarification: false,
        clarifyingQuestion: null
      };
    }

    // Intelligent clarification logic
    const hasLocation = /knie|rug|nek|schouder|heup|elleboog|pols|voet|enkel|onderrug|lumbaal|cervicaal/.test(query);
    const hasPathology = /pijn|zwelling|stijf|beweeg|trauma|breuk|ontsteking|klacht|zeer|ongemak/.test(query);
    const hasMechanism = /trauma|val|overbelasting|plotseling|geleidelijk|sport|werk|tillen/.test(query);

    // If only location is mentioned, ask for symptoms
    if (hasLocation && !hasPathology && !hasMechanism) {
      return {
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: "Wat voor klachten heeft u precies in die regio? (bijvoorbeeld: pijn, stijfheid, zwelling, bewegingsbeperking)"
      };
    }

    // If query is very minimal, ask for location first
    if (query.split(' ').length < 2) {
      return {
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: determineClarifyingQuestion(query)
      };
    }

    // Default fallback
    return generateFallbackResponse(query);
  }

  /**
   * Validate AI response and suggestions
   */
  private static validateAIResponse(response: AIResponse): ValidationResult {
    const validatedSuggestions: Array<{
      code: string;
      name: string;
      rationale: string;
      confidence: number;
      validationScore: number;
    }> = [];

    const invalidCodes: string[] = [];
    const warnings: string[] = [];

    // Validate each suggestion
    for (const suggestion of response.suggestions) {
      const validation = validateDCSPHCode(suggestion.code);

      if (validation.isValid) {
        // Calculate validation score based on multiple factors
        const validationScore = this.calculateValidationScore(suggestion);

        validatedSuggestions.push({
          ...suggestion,
          validationScore
        });
      } else {
        invalidCodes.push(suggestion.code);
        warnings.push(`Invalid code ${suggestion.code}: ${validation.error}`);
      }
    }

    // Check for minimum quality requirements
    if (validatedSuggestions.length === 0 && !response.needsClarification) {
      warnings.push('No valid code suggestions provided');
    }

    const avgValidationScore = validatedSuggestions.length > 0 ?
      validatedSuggestions.reduce((sum, s) => sum + s.validationScore, 0) / validatedSuggestions.length : 0;

    return {
      isValid: invalidCodes.length === 0 && avgValidationScore > 0.5,
      validatedSuggestions,
      invalidCodes,
      warnings
    };
  }

  /**
   * Calculate validation score for a suggestion
   */
  private static calculateValidationScore(suggestion: {
    code: string;
    name: string;
    rationale: string;
    confidence: number;
  }): number {
    let score = 0.5; // Base score

    // Code format validation (already passed)
    score += 0.1;

    // Rationale quality
    if (suggestion.rationale.length > 50) score += 0.1;
    if (suggestion.rationale.length > 100) score += 0.1;
    if (suggestion.rationale.includes('past bij')) score += 0.05;

    // Name consistency
    if (suggestion.name.includes(suggestion.code)) score += 0.05;

    // Medical terminology check
    const medicalTerms = ['pijn', 'ontsteking', 'tendinitis', 'artrose', 'trauma', 'klacht'];
    const hasTerms = medicalTerms.some(term =>
      suggestion.rationale.toLowerCase().includes(term)
    );
    if (hasTerms) score += 0.1;

    return Math.min(1.0, score);
  }

  /**
   * Enhance response with detailed rationales
   */
  private static async enhanceWithRationales(
    response: AIResponse,
    request: AIRequest
  ): Promise<AIResponse> {
    const patternAnalysis = MedicalPatternMatcher.analyzeText(request.query);

    const enhancedSuggestions = response.suggestions.map(suggestion => {
      const validation = validateDCSPHCode(suggestion.code);

      if (validation.isValid && validation.suggestions) {
        const dcsphCode = validation.suggestions[0];

        const rationale = RationaleGenerator.generateRationale(dcsphCode, {
          query: request.query,
          patternAnalysis,
          confidence: suggestion.confidence
        });

        return {
          ...suggestion,
          rationale: rationale.shortRationale,
          confidence: Math.min(1.0, suggestion.confidence * 1.1) // Slight boost for successful validation
        };
      }

      return suggestion;
    });

    return {
      ...response,
      suggestions: enhancedSuggestions
    };
  }

  /**
   * Fallback to pattern matching when AI fails
   */
  private static async fallbackToPatternMatching(
    request: AIRequest,
    conversationId: string
  ): Promise<AIResponse> {
    try {
      // Use knowledge base for pattern-based analysis
      const kbQuery: KnowledgeBaseQuery = {
        query: request.query,
        context: 'fallback',
        previousQuestions: request.context?.previousQuestions
      };

      const kbResponse: KnowledgeBaseResponse = DCSPHKnowledgeBase.processQuery(kbQuery);

      return {
        success: true,
        suggestions: kbResponse.suggestions.map(s => ({
          code: s.code.code,
          name: s.code.fullDescription,
          rationale: s.rationale,
          confidence: s.confidence * 0.8 // Lower confidence for fallback
        })),
        needsClarification: kbResponse.needsClarification,
        clarifyingQuestion: kbResponse.clarifyingQuestion,
        conversationId
      };
    } catch (error) {
      // Ultimate fallback - ask for clarification
      return {
        success: false,
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: 'Kunt u uw klacht specifieker beschrijven? Geef aan waar de klachten zich bevinden en wat voor type klacht het betreft.',
        conversationId,
        error: 'Fallback to pattern matching failed'
      };
    }
  }

  /**
   * Process clarifying question response
   */
  static async processClarificationResponse(
    conversationId: string,
    response: string
  ): Promise<AIResponse> {
    // Update conversation
    conversationManager.processUserResponse(conversationId, response);

    // Build complete query from conversation
    const completeQuery = conversationManager.buildCompleteQuery(conversationId);

    // Process the enhanced query
    return this.processQuery({
      query: completeQuery,
      conversationId
    });
  }

  /**
   * Get conversation analysis
   */
  static getConversationAnalysis(conversationId: string): {
    conversation: any;
    missingInfo: string[];
    suggestions: string[];
  } {
    const conversation = conversationManager.getConversation(conversationId);

    if (!conversation) {
      return {
        conversation: null,
        missingInfo: ['conversation'],
        suggestions: ['Start een nieuwe conversatie']
      };
    }

    const analysis = conversationManager.analyzeMissingInformation(conversationId);

    const suggestions = [];
    if (analysis.missingInfo.includes('location')) {
      suggestions.push('Specificeer de exacte lichaamsregio');
    }
    if (analysis.missingInfo.includes('pathology')) {
      suggestions.push('Beschrijf het type klacht in meer detail');
    }
    if (analysis.missingInfo.includes('mechanism')) {
      suggestions.push('Leg uit hoe de klachten zijn ontstaan');
    }

    return {
      conversation: conversationManager.exportConversation(conversationId),
      missingInfo: analysis.missingInfo,
      suggestions
    };
  }

  /**
   * Health check for AI integration
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      // Test with simple query
      const testResponse = await this.processQuery({
        query: 'test kniepijn'
      });

      const isHealthy = testResponse.success || testResponse.needsClarification;

      return {
        status: isHealthy ? 'healthy' : 'degraded',
        details: {
          aiIntegration: isHealthy,
          fallbackAvailable: true,
          conversationManager: conversationManager.getStats()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          aiIntegration: false,
          fallbackAvailable: true
        }
      };
    }
  }
}