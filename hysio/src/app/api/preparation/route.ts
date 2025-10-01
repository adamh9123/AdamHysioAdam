import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { isValidPatientInfo, createValidationError, createServerError } from '@/lib/utils/api-validation';
import { getOptimizedPreparationPrompt } from '@/lib/prompts/optimized-prompts';
import { createPerformanceMiddleware } from '@/lib/monitoring/performance-monitor';
import type {
  PreparationRequest,
  PreparationResponse,
  ApiResponse
} from '@/types/api';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<PreparationResponse>>> {
  const perfMonitor = createPerformanceMiddleware('preparation');
  const startTime = perfMonitor.start();

  try {
    const body: PreparationRequest = await request.json();
    const { workflowType, step, patientInfo } = body;

    // Validate required fields
    if (!workflowType || !patientInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: workflowType, patientInfo'
        },
        { status: 400 }
      );
    }

    // Validate patient info structure
    if (!isValidPatientInfo(patientInfo)) {
      return NextResponse.json(
        createValidationError('patientInfo', 'Invalid patient information structure'),
        { status: 400 }
      );
    }

    // Caching disabled to ensure fresh results for each request

    // Generate preparation using optimized prompts
    const { system: systemPrompt, user: userPrompt } = getOptimizedPreparationPrompt(
      workflowType,
      step,
      patientInfo,
      body.previousStepData
    );

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000, // Increased to ensure complete preparation data display
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    const responseData: PreparationResponse = {
      content,
      workflowType,
      step: step || 'preparation',
      generatedAt: new Date().toISOString()
    };

    // Caching disabled - not storing results for future requests

    perfMonitor.end(startTime, false, false); // Success, no cache
    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Preparation generation error:', error);
    perfMonitor.end(startTime, true, false); // Error

    return NextResponse.json(
      createServerError(error, 'preparation generation'),
      { status: 500 }
    );
  }
}


