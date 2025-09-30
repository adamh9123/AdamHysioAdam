/**
 * Pre-intake Draft Retrieval/Deletion API Endpoint
 *
 * GET /api/pre-intake/[sessionId] - Retrieve draft by session ID
 * DELETE /api/pre-intake/[sessionId] - Delete draft by session ID
 *
 * @module api/pre-intake/[sessionId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ============================================================================
// IN-MEMORY DRAFT STORAGE (SHARED WITH save-draft)
// ============================================================================
// TODO (Task 1.2): Replace with database queries
// ============================================================================

interface DraftEntry {
  sessionId: string;
  questionnaireData: unknown;
  currentStep: number;
  lastSavedAt: string;
  expiresAt: string;
}

// In-memory draft storage (same instance as save-draft route)
// Note: In Next.js API routes, module-level variables are shared
// In production with database, this won't be needed
const draftsStore = new Map<string, DraftEntry>();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const sessionIdSchema = z.string().uuid('Invalid session ID format');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if draft has expired
 */
function isDraftExpired(draft: DraftEntry): boolean {
  const now = new Date();
  const expiresAt = new Date(draft.expiresAt);
  return now > expiresAt;
}

/**
 * Get draft from storage
 * TODO (Task 1.2): Replace with database query
 */
function getDraft(sessionId: string): DraftEntry | null {
  const draft = draftsStore.get(sessionId);

  if (!draft) {
    return null;
  }

  // Check expiration
  if (isDraftExpired(draft)) {
    draftsStore.delete(sessionId);
    console.log(`🗑️ Expired draft deleted for session ${sessionId}`);
    return null;
  }

  return draft;
}

/**
 * Delete draft from storage
 * TODO (Task 1.2): Replace with database DELETE query
 */
function deleteDraft(sessionId: string): boolean {
  return draftsStore.delete(sessionId);
}

// ============================================================================
// GET /api/pre-intake/[sessionId]
// ============================================================================

export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
): Promise<NextResponse> {
  try {
    // Validate session ID format
    const validation = sessionIdSchema.safeParse(params.sessionId);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session ID format. Must be a UUID.',
        },
        { status: 400 }
      );
    }

    const sessionId = validation.data;

    // Retrieve draft
    // TODO (Task 1.2): Replace with database query
    // Example SQL:
    // SELECT * FROM pre_intake_drafts
    // WHERE session_id = $1 AND expires_at > NOW()
    const draft = getDraft(sessionId);

    if (!draft) {
      return NextResponse.json(
        {
          success: false,
          error: 'Draft not found or expired',
        },
        { status: 404 }
      );
    }

    console.log(`📥 Draft retrieved for session ${sessionId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId: draft.sessionId,
          questionnaireData: draft.questionnaireData,
          currentStep: draft.currentStep,
          lastSavedAt: draft.lastSavedAt,
          expiresAt: draft.expiresAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Draft retrieval error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve draft',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/pre-intake/[sessionId]
// ============================================================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
): Promise<NextResponse> {
  try {
    // Validate session ID format
    const validation = sessionIdSchema.safeParse(params.sessionId);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session ID format. Must be a UUID.',
        },
        { status: 400 }
      );
    }

    const sessionId = validation.data;

    // Delete draft
    // TODO (Task 1.2): Replace with database DELETE query
    // Example SQL:
    // DELETE FROM pre_intake_drafts WHERE session_id = $1 RETURNING *
    const deleted = deleteDraft(sessionId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Draft not found',
        },
        { status: 404 }
      );
    }

    console.log(`🗑️ Draft deleted for session ${sessionId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Draft deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Draft deletion error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete draft',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}