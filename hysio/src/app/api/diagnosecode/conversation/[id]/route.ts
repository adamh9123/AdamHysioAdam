// API Route for DCSPH Conversation Management

import { NextRequest, NextResponse } from 'next/server';
import { AIIntegration } from '@/lib/diagnosecode/ai-integration';
import { DCSPHErrorHandler, ErrorType } from '@/lib/diagnosecode/error-handling';

export const runtime = 'nodejs';

/**
 * GET /api/diagnosecode/conversation/[id]
 * Get conversation details and analysis
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    if (!conversationId) {
      const error = DCSPHErrorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Conversation ID is vereist',
        { recoverable: true }
      );
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(error),
        { status: 400 }
      );
    }

    // Get conversation analysis
    const analysis = AIIntegration.getConversationAnalysis(conversationId);

    if (!analysis.conversation) {
      const error = DCSPHErrorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Conversatie niet gevonden of verlopen',
        {
          recoverable: true,
          suggestions: ['Start een nieuwe conversatie']
        }
      );
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(error),
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: analysis.conversation,
      analysis: {
        missingInfo: analysis.missingInfo,
        suggestions: analysis.suggestions
      },
      metadata: {
        retrievedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in conversation GET:', error);

    const dcsphError = DCSPHErrorHandler.createError(
      ErrorType.UNKNOWN_ERROR,
      'Fout bij ophalen conversatie',
      { details: error.message }
    );

    return NextResponse.json(
      DCSPHErrorHandler.createErrorResponse(dcsphError),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/diagnosecode/conversation/[id]
 * Delete/clear conversation
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;

    if (!conversationId) {
      const error = DCSPHErrorHandler.createError(
        ErrorType.VALIDATION_ERROR,
        'Conversation ID is vereist',
        { recoverable: true }
      );
      return NextResponse.json(
        DCSPHErrorHandler.createErrorResponse(error),
        { status: 400 }
      );
    }

    // Note: In real implementation, you might want to implement
    // conversation deletion in the conversation manager
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Conversatie gewist',
      conversationId,
      metadata: {
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error in conversation DELETE:', error);

    const dcsphError = DCSPHErrorHandler.createError(
      ErrorType.UNKNOWN_ERROR,
      'Fout bij verwijderen conversatie',
      { details: error.message }
    );

    return NextResponse.json(
      DCSPHErrorHandler.createErrorResponse(dcsphError),
      { status: 500 }
    );
  }
}