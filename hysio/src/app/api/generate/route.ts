// API route for AI content generation using OpenAI GPT-5-mini

import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithOpenAI, generateContentStreamWithOpenAI, type OpenAICompletionOptions, HYSIO_LLM_MODEL } from '@/lib/api/openai';

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

    // Set default options
    const completionOptions: OpenAICompletionOptions = {
      model: HYSIO_LLM_MODEL,
      temperature: 1.0, // GPT-5-mini only supports temperature = 1
      max_tokens: 2000,
      ...options,
    };

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
        contentLength: result.data?.content?.length || 0,
        model: result.data?.model,
        usage: result.data?.usage
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

// GET endpoint to check API status
export async function GET() {
  try {
    console.log('GET /api/generate called');

    // Test imports first
    const importTest = testImports();
    console.log('Import test result:', importTest);

    // Test environment variables
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    console.log('OpenAI API Key configured:', hasOpenAIKey);
    console.log('OpenAI API Key length:', process.env.OPENAI_API_KEY?.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Content generation API is running',
      model: HYSIO_LLM_MODEL,
      provider: 'OpenAI',
      capabilities: ['text-generation', 'streaming', 'dutch-language-support'],
      maxPromptLength: '~50,000 characters',
      importTest,
      hasOpenAIKey,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('GET /api/generate error:', error);
    return NextResponse.json({
      success: false,
      error: 'GET endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}