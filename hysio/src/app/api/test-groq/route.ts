import { NextRequest, NextResponse } from 'next/server';
import { testGroqConnection } from '@/lib/api/groq';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    console.log('🧪 Testing Groq API connection via endpoint...');

    // Test environment variables
    const groqKey = process.env.GROQ_API_KEY;
    console.log('Environment check:', {
      hasGroqKey: !!groqKey,
      keyLength: groqKey?.length,
      keyFormat: groqKey?.startsWith('gsk_') ? 'Valid format' : 'Invalid format',
      nodeEnv: process.env.NODE_ENV
    });

    // Test actual connection
    const result = await testGroqConnection();

    return NextResponse.json({
      success: true,
      environment: {
        hasGroqKey: !!groqKey,
        keyLength: groqKey?.length,
        keyFormat: groqKey?.startsWith('gsk_') ? 'Valid' : 'Invalid',
        nodeEnv: process.env.NODE_ENV
      },
      connectionTest: result
    });

  } catch (error: any) {
    console.error('❌ Groq test endpoint failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      environment: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}