// API route for AI content generation using OpenAI GPT-4.1-mini

import { NextRequest, NextResponse } from 'next/server';
import {
  generateContentWithOpenAI,
  generateContentStreamWithOpenAI,
  type OpenAICompletionOptions,
  HYSIO_LLM_MODEL,
  getAPIMetrics,
  healthCheck
} from '@/lib/api/openai';

export const runtime = 'nodejs';

// Test function to isolate import issues
function testImports() {
  console.log('Testing API route imports...');
  try {
    console.log('NextRequest:', typeof NextRequest);
    console.log('NextResponse:', typeof NextResponse);
    // console.log('generateContentWithOpenAI:', typeof generateContentWithOpenAI);
    return true;
  } catch (error) {
    console.error('Import test failed:', error);
    return false;
  }
}

interface GenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  stream?: boolean;
  options?: OpenAICompletionOptions;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json();
    
    const { systemPrompt, userPrompt, stream = false, options = {} } = body;

    // Validate required fields
    if (!systemPrompt || typeof systemPrompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'systemPrompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userPrompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate prompt lengths (rough token limit check)
    const maxPromptLength = 50000; // Approximate character limit
    if (systemPrompt.length > maxPromptLength || userPrompt.length > maxPromptLength) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Prompt too long. Maximum length is approximately 50,000 characters.' 
        },
        { status: 400 }
      );
    }

    // Set default options optimized for GPT-4.1-mini
    const completionOptions: OpenAICompletionOptions = {
      model: HYSIO_LLM_MODEL,
      temperature: 0.8, // Balanced creativity for content generation
      max_tokens: 4000, // Sufficient tokens for comprehensive content
      ...options,
    };

    // Handle backwards compatibility
    if (options.maxTokens !== undefined && options.max_tokens === undefined) {
      completionOptions.max_tokens = options.maxTokens;
    }

    if (stream) {
      // Handle streaming response
      const encoder = new TextEncoder();
      
      const readableStream = new ReadableStream({
        start(controller) {
          generateContentStreamWithOpenAI(
            systemPrompt,
            userPrompt,
            {
              ...completionOptions,
              onChunk: (chunk) => {
                const data = `data: ${JSON.stringify({ chunk })}\n\n`;
                controller.enqueue(encoder.encode(data));
              },
              onComplete: (fullContent) => {
                const data = `data: ${JSON.stringify({ 
                  complete: true, 
                  content: fullContent 
                })}\n\n`;
                controller.enqueue(encoder.encode(data));
                controller.close();
              },
              onError: (error) => {
                const data = `data: ${JSON.stringify({ 
                  error: true, 
                  message: error 
                })}\n\n`;
                controller.enqueue(encoder.encode(data));
                controller.close();
              },
            }
          );
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Handle regular response
      const result = await generateContentWithOpenAI(
        systemPrompt,
        userPrompt,
        completionOptions
      );

      console.log('Generation completed successfully:', {
        contentLength: result.content?.length || 0,
        model: result.model,
        usage: result.usage
      });

      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Generate API error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during content generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check API status with enhanced monitoring
export async function GET() {
  try {
    console.log('GET /api/generate called');

    // Test imports first
    const importTest = testImports();
    console.log('Import test result:', importTest);

    // Get comprehensive health check and metrics
    const health = await healthCheck();
    const metrics = getAPIMetrics();

    return NextResponse.json({
      success: true,
      message: 'Content generation API is running',
      model: HYSIO_LLM_MODEL,
      provider: 'OpenAI',
      capabilities: ['text-generation', 'streaming', 'dutch-language-support', 'rate-limiting', 'monitoring'],
      features: {
        tikTokenCounting: true,
        tokenBucketRateLimit: true,
        zodValidation: true,
        exponentialBackoff: true,
        costTracking: true,
        healthMonitoring: true
      },
      health: health.status,
      metrics: {
        totalRequests: metrics.requestCount,
        totalTokens: metrics.totalTokens,
        totalCost: parseFloat(metrics.totalCost.toFixed(6)),
        averageLatency: parseFloat(metrics.averageLatency.toFixed(2)),
        errorCount: metrics.errorCount,
        lastRequestTime: metrics.lastRequestTime
      },
      importTest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/generate error:', error);
    return NextResponse.json({
      success: false,
      error: 'GET endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      health: 'unhealthy'
    }, { status: 500 });
  }
}