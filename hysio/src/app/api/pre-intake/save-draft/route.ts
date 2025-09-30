/**
 * Pre-intake Draft Save API Endpoint
 *
 * POST /api/pre-intake/save-draft
 *
 * Saves partial questionnaire data as a draft with auto-save support.
 * Implements rate limiting (10 requests/min per session).
 *
 * @module api/pre-intake/save-draft
 */

import { NextRequest, NextResponse } from 'next/server';
import { SaveDraftRequestSchema } from '@/lib/pre-intake/validation';
import { validatePartialQuestionnaire } from '@/lib/pre-intake/validation';
import type { z } from 'zod';

// ============================================================================
// IN-MEMORY DRAFT STORAGE
// ============================================================================
// TODO (Task 1.2): Replace with database persistence (pre_intake_drafts table)
//
// For now, using in-memory storage for development. In production, this should:
// - Store drafts in PostgreSQL pre_intake_drafts table with JSONB
// - Set expires_at to 30 days from now
// - Use UPSERT logic (INSERT ON CONFLICT UPDATE)
// - Include proper indexing on session_id
// ============================================================================

interface DraftEntry {
  sessionId: string;
  questionnaireData: unknown;
  currentStep: number;
  lastSavedAt: string;
  expiresAt: string;
}

// In-memory draft storage (reset on server restart)
const draftsStore = new Map<string, DraftEntry>();

// Rate limiting storage: sessionId -> array of request timestamps
const rateLimitStore = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check if request exceeds rate limit
 */
function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const requests = rateLimitStore.get(sessionId) || [];

  // Remove requests outside the time window
  const recentRequests = requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  // Update rate limit store
  recentRequests.push(now);
  rateLimitStore.set(sessionId, recentRequests);

  return false;
}

/**
 * Get rate limit headers
 */
function getRateLimitHeaders(sessionId: string): Record<string, string> {
  const requests = rateLimitStore.get(sessionId) || [];
  const now = Date.now();
  const recentRequests = requests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

  return {
    'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
    'X-RateLimit-Remaining': String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - recentRequests.length)),
    'X-RateLimit-Reset': String(Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000)),
  };
}

// ============================================================================
// POST /api/pre-intake/save-draft
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();

    const validation = SaveDraftRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { sessionId, questionnaireData, currentStep } = validation.data;

    // Check rate limiting
    if (isRateLimited(sessionId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait before saving again.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(sessionId),
        }
      );
    }

    // Validate questionnaire data (partial is OK for drafts)
    const dataValidation = validatePartialQuestionnaire(questionnaireData);

    if (!dataValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid questionnaire data',
          details: dataValidation.error.errors,
        },
        { status: 400 }
      );
    }

    // Calculate expiration (30 days from now)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Save draft to storage
    // TODO (Task 1.2): Replace with database UPSERT query
    // Example SQL:
    // INSERT INTO pre_intake_drafts (session_id, questionnaire_data, current_step, last_saved_at, expires_at)
    // VALUES ($1, $2, $3, $4, $5)
    // ON CONFLICT (session_id)
    // DO UPDATE SET questionnaire_data = $2, current_step = $3, last_saved_at = $4, expires_at = $5
    const draftEntry: DraftEntry = {
      sessionId,
      questionnaireData: dataValidation.data,
      currentStep,
      lastSavedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    draftsStore.set(sessionId, draftEntry);

    console.log(`✅ Draft saved for session ${sessionId} (step ${currentStep})`);

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId,
          lastSavedAt: draftEntry.lastSavedAt,
          currentStep,
        },
      },
      {
        status: 200,
        headers: getRateLimitHeaders(sessionId),
      }
    );
  } catch (error) {
    console.error('❌ Draft save error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save draft',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/pre-intake/save-draft (Not allowed)
// ============================================================================

export async function GET(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to save drafts.',
    },
    { status: 405 }
  );
}