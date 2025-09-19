// API endpoint for EduPack content validation
// Validates content for B1-level language compliance and medical appropriateness

import { NextRequest, NextResponse } from 'next/server';
import { contentValidator } from '@/lib/edupack/content-validator';
import type {
  EduPackContent,
  ContentValidationResult,
  EduPackApiResponse
} from '@/lib/types/edupack';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.content) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_CONTENT',
          message: 'Content is required for validation'
        },
        timestamp: new Date()
      } as EduPackApiResponse, { status: 400 });
    }

    const content: EduPackContent = body.content;

    // Perform validation
    const validationResult: ContentValidationResult = contentValidator.validateEduPack(content);

    // Get validation summary
    const summary = contentValidator.getValidationSummary(content);

    const response: EduPackApiResponse<{
      validation: ContentValidationResult;
      summary: typeof summary;
    }> = {
      success: true,
      data: {
        validation: validationResult,
        summary
      },
      timestamp: new Date()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Content validation error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date()
    } as EduPackApiResponse, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'edu-pack/validate',
    timestamp: new Date().toISOString()
  });
}