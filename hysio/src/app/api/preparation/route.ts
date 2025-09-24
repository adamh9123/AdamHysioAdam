import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { isValidPatientInfo, createValidationError, createServerError } from '@/lib/utils/api-validation';
import { getOptimizedPreparationPrompt } from '@/lib/prompts/optimized-prompts';
import { apiCache } from '@/lib/cache/api-cache';
import { createPerformanceMiddleware } from '@/lib/monitoring/performance-monitor';
import type {
  PreparationRequest,
  PreparationResponse,
  ApiResponse,
  PatientInfo
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

    // Check cache first for performance optimization
    const cachedResult = await apiCache.getCachedPreparation(
      workflowType,
      step,
      patientInfo,
      body.previousStepData
    );

    if (cachedResult) {
      console.log(`Cache HIT for preparation: ${workflowType}-${step}`);
      perfMonitor.end(startTime, false, true); // Cache hit
      return NextResponse.json({
        success: true,
        data: cachedResult
      });
    }

    console.log(`Cache MISS for preparation: ${workflowType}-${step}`);

    // Generate preparation using optimized prompts
    const { system: systemPrompt, user: userPrompt } = getOptimizedPreparationPrompt(
      workflowType,
      step,
      patientInfo,
      body.previousStepData
    );

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800, // Reduced from 1000 for better efficiency
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    const responseData: PreparationResponse = {
      content,
      workflowType,
      step,
      generatedAt: new Date().toISOString()
    };

    // Cache the result for future requests
    await apiCache.cachePreparation(
      workflowType,
      step,
      patientInfo,
      responseData,
      body.previousStepData
    );

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


