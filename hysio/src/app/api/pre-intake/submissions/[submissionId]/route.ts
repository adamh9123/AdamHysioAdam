/**
 * API Route: Get Single Pre-intake Submission
 *
 * Returns detailed data for a specific pre-intake submission.
 *
 * @route GET /api/pre-intake/submissions/[submissionId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMockSubmissions } from '@/lib/utils/pre-intake-mock-store';

interface RouteContext {
  params: Promise<{
    submissionId: string;
  }>;
}

/**
 * GET /api/pre-intake/submissions/[submissionId]
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Submission ID is required',
        },
        { status: 400 }
      );
    }

    // Find submission in mock store
    const submissions = getMockSubmissions();
    const submission = submissions.find(
      (s) => s.sessionId === submissionId || s.id === submissionId
    );

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pre-intake niet gevonden',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        submission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Fout bij ophalen van pre-intake',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}