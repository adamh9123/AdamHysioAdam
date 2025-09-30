/**
 * API Route: Get Pre-intake Submissions List
 *
 * Returns all submitted pre-intake questionnaires for therapist dashboard.
 * Includes filtering, sorting, and pagination support.
 *
 * @route GET /api/pre-intake/submissions
 */

import { NextRequest, NextResponse } from 'next/server';
import type { PreIntakeSubmission } from '@/types/pre-intake';

// Mock data store - In production, this would be a database
const mockSubmissions: PreIntakeSubmission[] = [];

/**
 * GET /api/pre-intake/submissions
 *
 * Query parameters:
 * - status: filter by status (submitted, reviewed, imported)
 * - hasRedFlags: filter by presence of red flags (true/false)
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const hasRedFlagsFilter = searchParams.get('hasRedFlags');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter submissions
    let filteredSubmissions = [...mockSubmissions];

    if (statusFilter) {
      filteredSubmissions = filteredSubmissions.filter(
        (s) => s.status === statusFilter
      );
    }

    if (hasRedFlagsFilter === 'true') {
      filteredSubmissions = filteredSubmissions.filter(
        (s) => s.redFlagsSummary && s.redFlagsSummary.length > 0
      );
    } else if (hasRedFlagsFilter === 'false') {
      filteredSubmissions = filteredSubmissions.filter(
        (s) => !s.redFlagsSummary || s.redFlagsSummary.length === 0
      );
    }

    // Sort by submission date (newest first)
    filteredSubmissions.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    // Paginate
    const paginatedSubmissions = filteredSubmissions.slice(
      offset,
      offset + limit
    );

    return NextResponse.json(
      {
        success: true,
        submissions: paginatedSubmissions,
        total: filteredSubmissions.length,
        limit,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Fout bij ophalen van pre-intake formulieren',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to add a submission to the mock store
 * This would be called by the submit endpoint
 */
export function addMockSubmission(submission: PreIntakeSubmission) {
  mockSubmissions.push(submission);
}

/**
 * Helper function to get submissions (for internal use)
 */
export function getMockSubmissions(): PreIntakeSubmission[] {
  return mockSubmissions;
}