// API Route for DCSPH Clarification Responses

import { NextRequest, NextResponse } from 'next/server';
import { AIIntegration } from '@/lib/diagnosecode/ai-integration';
import { DCSPHErrorHandler } from '@/lib/diagnosecode/error-handling';

export const runtime = 'nodejs';

/**
 * POST /api/diagnosecode/clarify
 * Process clarifying question response
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { conversationId, response } = body;

    // Validate required fields
    if (!conversationId || typeof conversationId !== 'string') {
      const error = DCSPHErrorHandler.handleValidationError('', 'ConversationId is vereist');
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(error),
        { status: 400 }
      );
    }

    if (!response || typeof response !== 'string') {
      const error = DCSPHErrorHandler.handleValidationError('', 'Response is vereist');
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(error),
        { status: 400 }
      );
    }

    // Validate response content
    const responseValidation = DCSPHErrorHandler.validateQuery(response);
    if (responseValidation) {
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(responseValidation),
        { status: 400 }
      );
    }

    console.log('DCSPH Clarification request:', {
      conversationId,
      responseLength: response.length
    });

    // Process the clarification response
    const result = await AIIntegration.processClarificationResponse(conversationId, response);

    // Return response
    return NextResponse.json({
      success: result.success,
      suggestions: result.suggestions,
      needsClarification: result.needsClarification,
      clarifyingQuestion: result.clarifyingQuestion,
      conversationId: result.conversationId,
      metadata: {
        processedAt: new Date().toISOString(),
        isFollowUp: true
      }
    });

  } catch (error: any) {
    console.error('Error in diagnosecode/clarify:', error);

    const dcsphError = DCSPHErrorHandler.handleAIError('clarification', error);
    DCSPHErrorHandler.logError(dcsphError);

    return NextResponse.json(
      DCSPHErrorHandler.createErrorResponse(dcsphError),
      { status: 500 }
    );
  }
}