/**
 * Pre-intake Final Submission API Endpoint
 *
 * POST /api/pre-intake/submit
 *
 * Validates complete questionnaire data, processes into HHSB structure,
 * detects red flags, and stores final submission with consent logging.
 *
 * @module api/pre-intake/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { SubmitPreIntakeRequestSchema } from '@/lib/pre-intake/validation';
import { validateQuestionnaire } from '@/lib/pre-intake/validation';
import { mapToHHSBWithMetadata } from '@/lib/pre-intake/hhsb-mapper';
import { detectRedFlags } from '@/lib/pre-intake/red-flags-detector';
import crypto from 'crypto';

// ============================================================================
// IN-MEMORY SUBMISSION STORAGE
// ============================================================================
// TODO (Task 1.2): Replace with database persistence
//
// Production implementation should:
// - Store in PostgreSQL pre_intake_submissions table
// - Store questionnaire_data as JSONB
// - Store hhsb_structured_data as JSONB
// - Store red_flags array as JSONB
// - Log consent in separate consent_logs table with audit hash
// - Link to patient_id and therapist_id once auth is implemented
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

// Rate limiting for submissions (stricter than drafts)
const submissionRateLimitStore = new Map<string, number[]>();
const SUBMISSION_RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const SUBMISSION_RATE_LIMIT_MAX_REQUESTS = 3;

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Check if submission request exceeds rate limit
 */
function isSubmissionRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  const requests = submissionRateLimitStore.get(ipAddress) || [];

  // Remove requests outside the time window
  const recentRequests = requests.filter((timestamp) => now - timestamp < SUBMISSION_RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= SUBMISSION_RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  // Update rate limit store
  recentRequests.push(now);
  submissionRateLimitStore.set(ipAddress, recentRequests);

  return false;
}

// ============================================================================
// CONSENT LOGGING
// ============================================================================

/**
 * Generate immutable audit hash for consent event
 */
function generateConsentAuditHash(data: {
  submissionId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}): string {
  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Log consent to database
 * TODO (Task 1.5): Implement full consent management with consent_logs table
 */
function logConsent(submission: SubmissionEntry): void {
  const auditHash = generateConsentAuditHash({
    submissionId: submission.id,
    timestamp: submission.consentTimestamp,
    ipAddress: submission.consentIpAddress,
    userAgent: submission.consentUserAgent,
  });

  console.log(`📝 Consent logged for submission ${submission.id}`);
  console.log(`   Audit hash: ${auditHash}`);
  console.log(`   IP: ${submission.consentIpAddress}`);
  console.log(`   Timestamp: ${submission.consentTimestamp}`);

  // TODO: Insert into consent_logs table
  // INSERT INTO consent_logs (pre_intake_id, patient_id, consent_given_at, ip_address, user_agent, consent_text, audit_hash)
  // VALUES ($1, $2, $3, $4, $5, $6, $7)
}

// ============================================================================
// POST /api/pre-intake/submit
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client information for consent logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check submission rate limiting (per IP)
    if (isSubmissionRateLimited(ipAddress)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Submission rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    const requestValidation = SubmitPreIntakeRequestSchema.safeParse(body);

    if (!requestValidation.success) {
      console.error('❌ Request validation failed:', requestValidation.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          message: 'Controleer de volgende velden:\n' + requestValidation.error.errors.map(e => `- ${e.path.join('.')}: ${e.message}`).join('\n'),
          details: requestValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const { sessionId, questionnaireData, consentGiven } = requestValidation.data;

    // Validate questionnaire data completeness
    const dataValidation = validateQuestionnaire(questionnaireData);

    if (!dataValidation.success) {
      console.error('❌ Questionnaire validation failed:', dataValidation.error.errors);
      const errorMessages = dataValidation.error.errors.map(e => {
        const path = e.path.join(' → ');
        return `${path}: ${e.message}`;
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Incomplete or invalid questionnaire data',
          message: 'Controleer de volgende velden:\n' + errorMessages.join('\n'),
          details: dataValidation.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = dataValidation.data;

    console.log(`🔄 Processing pre-intake submission for session ${sessionId}`);

    // Step 1: Detect red flags
    console.log('   1/3 Detecting red flags...');
    const redFlags = detectRedFlags(validatedData as any);
    console.log(`   ✓ Detected ${redFlags.length} red flags`);

    // Step 2: Map to HHSB structure
    console.log('   2/3 Mapping to HHSB structure...');
    const hhsbData = mapToHHSBWithMetadata(validatedData as any, redFlags);
    console.log('   ✓ HHSB structure created');

    // Step 3: Create submission record
    console.log('   3/3 Saving submission...');
    const submissionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const submission: SubmissionEntry = {
      id: submissionId,
      sessionId,
      questionnaireData: validatedData,
      hhsbStructuredData: hhsbData,
      redFlags,
      status: 'submitted',
      consentGiven,
      consentTimestamp: now,
      consentIpAddress: ipAddress,
      consentUserAgent: userAgent,
      submittedAt: now,
      createdAt: now,
    };

    // TODO (Task 1.2): Replace with database transaction
    // BEGIN TRANSACTION
    // INSERT INTO pre_intake_submissions (...)
    // INSERT INTO consent_logs (...)
    // DELETE FROM pre_intake_drafts WHERE session_id = $sessionId
    // COMMIT
    submissionsStore.set(submissionId, submission);

    // Log consent
    logConsent(submission);

    console.log(`✅ Pre-intake submitted successfully (ID: ${submissionId})`);

    // Determine if there are critical red flags
    const hasCriticalFlags = redFlags.some((flag: any) => flag.severity === 'emergency');

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId,
          sessionId,
          submittedAt: submission.submittedAt,
          redFlagsDetected: redFlags.length,
          hasCriticalFlags,
          status: submission.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Submission error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit pre-intake',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/pre-intake/submit (Not allowed)
// ============================================================================

export async function GET(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to submit pre-intake.',
    },
    { status: 405 }
  );
}