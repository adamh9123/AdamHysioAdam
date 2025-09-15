// API Route for DCSPH Code Finding

import { NextRequest, NextResponse } from 'next/server';
import { AIIntegration } from '@/lib/diagnosecode/ai-integration';
import { DCSPHErrorHandler, ErrorType } from '@/lib/diagnosecode/error-handling';

export const runtime = 'nodejs';

/**
 * POST /api/diagnosecode/find
 * Find DCSPH codes based on natural language query
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { query, conversationId, context } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      const error = DCSPHErrorHandler.handleValidationError('', 'Query is vereist en moet een string zijn');
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(error),
        { status: 400 }
      );
    }

    // Validate query content
    const queryValidation = DCSPHErrorHandler.validateQuery(query);
    if (queryValidation) {
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(queryValidation),
        { status: 400 }
      );
    }

    console.log('DCSPH Code Find request:', {
      queryLength: query.length,
      hasConversationId: !!conversationId,
      hasContext: !!context
    });

    // Process the query using AI integration
    const result = await AIIntegration.processQuery({
      query,
      conversationId,
      context
    });

    // Return successful response
    if (result.success) {
      return NextResponse.json({
        success: true,
        suggestions: result.suggestions,
        needsClarification: result.needsClarification,
        clarifyingQuestion: result.clarifyingQuestion,
        conversationId: result.conversationId,
        metadata: {
          processedAt: new Date().toISOString(),
          suggestionCount: result.suggestions.length
        }
      });
    } else {
      // Handle unsuccessful processing
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Verwerking mislukt',
          suggestions: [],
          needsClarification: result.needsClarification,
          clarifyingQuestion: result.clarifyingQuestion,
          conversationId: result.conversationId
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in diagnosecode/find:', error);

    // Handle different types of errors
    let dcsphError;

    if (error.name === 'SyntaxError') {
      dcsphError = DCSPHErrorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Ongeldige JSON in verzoek',
        { recoverable: true }
      );
    } else if (error.type && Object.values(ErrorType).includes(error.type)) {
      // Already a DCSPH error
      dcsphError = error;
    } else {
      // Unknown error
      dcsphError = DCSPHErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        'Er is een onverwachte fout opgetreden',
        {
          details: error.message,
          recoverable: true,
          suggestions: ['Probeer uw verzoek opnieuw', 'Controleer de invoer format']
        }
      );
    }

    // Log error for monitoring
    DCSPHErrorHandler.logError(dcsphError, {
      endpoint: '/api/diagnosecode/find',
      method: 'POST',
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      DCSPHErrorHandler.createErrorResponse(dcsphError),
      { status: 500 }
    );
  }
}

/**
 * GET /api/diagnosecode/find
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const healthCheck = await AIIntegration.healthCheck();

    return NextResponse.json({
      status: healthCheck.status,
      endpoint: '/api/diagnosecode/find',
      timestamp: new Date().toISOString(),
      details: healthCheck.details
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      endpoint: '/api/diagnosecode/find',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/diagnosecode/find
 * CORS preflight handling
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}