/**
 * Pre-intake HHSB Processing API Endpoint
 *
 * POST /api/pre-intake/process-hhsb
 *
 * Retrieves a submitted pre-intake and returns its HHSB-structured data
 * for therapist viewing or import into Scribe workflows.
 *
 * @module api/pre-intake/process-hhsb
 */

import { NextRequest, NextResponse } from 'next/server';
import { ProcessHHSBRequestSchema } from '@/lib/pre-intake/validation';
import { formatRedFlagsForDisplay } from '@/lib/pre-intake/red-flags-detector';

// ============================================================================
// IN-MEMORY SUBMISSION STORAGE (SHARED WITH submit route)
// ============================================================================
// TODO (Task 1.2): Replace with database queries
// ============================================================================

interface SubmissionEntry {
  id: string;
  sessionId: string;
  questionnaireData: unknown;
  hhsbStructuredData: unknown;
  redFlags: unknown[];
  status: 'submitted' | 'reviewed' | 'imported';
  consentGiven: boolean;
  consentTimestamp: string;
  consentIpAddress: string;
  consentUserAgent: string;
  submittedAt: string;
  createdAt: string;
}

// In-memory submission storage
const submissionsStore = new Map<string, SubmissionEntry>();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get submission from storage
 * TODO (Task 1.2): Replace with database query
 */
function getSubmission(submissionId: string): SubmissionEntry | null {
  return submissionsStore.get(submissionId) || null;
}

/**
 * Update submission status
 * TODO (Task 1.2): Replace with database UPDATE query
 */
function updateSubmissionStatus(submissionId: string, status: SubmissionEntry['status']): boolean {
  const submission = submissionsStore.get(submissionId);

  if (!submission) {
    return false;
  }

  submission.status = status;
  submissionsStore.set(submissionId, submission);

  return true;
}

// ============================================================================
// POST /api/pre-intake/process-hhsb
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();

    const requestValidation = ProcessHHSBRequestSchema.safeParse(body);

    if (!requestValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: requestValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const { submissionId } = requestValidation.data;

    // Retrieve submission
    // TODO (Task 1.2): Replace with database query
    // SELECT * FROM pre_intake_submissions WHERE id = $1
    const submission = getSubmission(submissionId);

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: 'Submission not found',
        },
        { status: 404 }
      );
    }

    console.log(`📥 Processing HHSB for submission ${submissionId}`);

    // TODO (Task 1.3): Add authorization check
    // Verify that requesting user (therapist) has access to this submission
    // - Check if therapist is assigned to this patient
    // - Or check if submission was sent to this therapist

    // Mark as reviewed if not already
    if (submission.status === 'submitted') {
      updateSubmissionStatus(submissionId, 'reviewed');
    }

    // Format red flags for display
    const redFlagsFormatted = formatRedFlagsForDisplay(submission.redFlags as any[]);

    // Return HHSB data
    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId: submission.id,
          sessionId: submission.sessionId,
          hhsbData: submission.hhsbStructuredData,
          redFlags: submission.redFlags,
          redFlagsFormatted,
          status: submission.status,
          submittedAt: submission.submittedAt,
          // Include raw questionnaire data for reference (optional)
          sourceData: submission.questionnaireData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ HHSB processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process HHSB',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/pre-intake/process-hhsb (Not allowed)
// ============================================================================

export async function GET(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST with submissionId.',
    },
    { status: 405 }
  );
}