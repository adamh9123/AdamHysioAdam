// API Route for DCSPH Code Validation

import { NextRequest, NextResponse } from 'next/server';
import { validateDCSPHCode, validateMultipleCodes } from '@/lib/diagnosecode/code-validator';
import { DCSPHErrorHandler, ErrorType } from '@/lib/diagnosecode/error-handling';

export const runtime = 'nodejs';

/**
 * POST /api/diagnosecode/validate
 * Validate DCSPH codes
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, codes } = body;

    // Validate single code
    if (code && typeof code === 'string') {
      const validation = validateDCSPHCode(code);

      return NextResponse.json({
        success: true,
        validation,
        code,
        timestamp: new Date().toISOString()
      });
    }

    // Validate multiple codes
    if (codes && Array.isArray(codes)) {
      const validations = validateMultipleCodes(codes);

      return NextResponse.json({
        success: true,
        validations,
        codeCount: codes.length,
        timestamp: new Date().toISOString()
      });
    }

    // Invalid request
    const error = DCSPHErrorHandler.createError(
      ErrorType.VALIDATION_ERROR,
      'Geef een \'code\' (string) of \'codes\' (array) parameter op',
      {
        recoverable: true,
        suggestions: [
          'Voor enkele code: {"code": "7920"}',
          'Voor meerdere codes: {"codes": ["7920", "3427"]}'
        ]
      }
    );

    return NextResponse.json(
      DCSPHErrorHandler.createErrorResponse(error),
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error in diagnosecode/validate:', error);

    const dcsphError = DCSPHErrorHandler.handleValidationError('', 'Validatie fout opgetreden');
    return NextResponse.json(
      DCSPHErrorHandler.createErrorResponse(dcsphError),
      { status: 500 }
    );
  }
}