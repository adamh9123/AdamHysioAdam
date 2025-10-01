#!/usr/bin/env npx tsx

/**
 * Ultra-Think Protocol: Groq API Smoke Test
 *
 * This script tests the Groq transcription functionality with enhanced diagnostics
 * to verify that the Cloudflare WAF bypass solution is working correctly.
 *
 * Exit codes:
 * - 0: Success - Groq API is working correctly
 * - 1: Failure - API connectivity or authentication issues
 * - 2: Configuration error - Missing API key or environment issues
 */

import { promises as fs } from 'fs';
import path from 'path';
import { transcribeAudioWithGroq, testGroqConnection } from '../hysio/src/lib/api/groq';

const TEST_AUDIO_DATA = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x28, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6D, 0x74, 0x20,
  0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x44, 0xAC, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
  0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
]);

async function createTestAudioFile(): Promise<Blob> {
  console.log('🎵 Creating minimal test audio file (WAV format)...');
  return new Blob([TEST_AUDIO_DATA], { type: 'audio/wav' });
}

async function runGroqSmokeTest(): Promise<void> {
  console.log('🧪 ULTRA-THINK PROTOCOL: Groq API Smoke Test');
  console.log('================================================');
  console.log(`📅 Test started: ${new Date().toISOString()}`);
  console.log('🎯 Objective: Verify Cloudflare WAF bypass solution\n');

  try {
    // Step 1: Check environment configuration
    console.log('1️⃣ Checking environment configuration...');
    const hasGroqKey = !!(process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY);

    if (!hasGroqKey) {
      console.error('❌ GROQ_API_KEY not found in environment variables');
      console.error('💡 Please set GROQ_API_KEY in your .env.local file');
      process.exit(2);
    }

    console.log('✅ GROQ_API_KEY found in environment');

    // Step 2: Test basic connectivity
    console.log('\n2️⃣ Testing Groq API connectivity...');
    const connectionResult = await testGroqConnection();

    if (!connectionResult.success) {
      console.error('❌ Groq API connectivity test failed:');
      console.error('   Error:', connectionResult.error);
      console.error('   Details:', connectionResult.details);

      // Check if this is a 403 error (our target issue)
      if (connectionResult.details?.status === 403) {
        console.error('\n🚫 403 ERROR DETECTED - This is the Cloudflare WAF issue!');
        console.error('   Status: WAF bypass solution not working correctly');
        process.exit(1);
      }

      process.exit(1);
    }

    console.log('✅ Basic connectivity test passed');
    console.log('   Details:', connectionResult.details);

    // Step 3: Test actual transcription with minimal audio
    console.log('\n3️⃣ Testing transcription with minimal audio file...');
    const testAudio = await createTestAudioFile();

    console.log('📊 Test parameters:', {
      audioSize: testAudio.size,
      audioType: testAudio.type,
      model: 'whisper-large-v3-turbo',
      language: 'nl'
    });

    const transcriptionResult = await transcribeAudioWithGroq(testAudio, {
      model: 'whisper-large-v3-turbo',
      language: 'nl',
      response_format: 'verbose_json',
      temperature: 0.0
    });

    if (!transcriptionResult.success) {
      console.error('❌ Transcription test failed:');
      console.error('   Error:', transcriptionResult.error);

      // Check if this contains the 403 error indicators
      if (transcriptionResult.error.includes('403') ||
          transcriptionResult.error.includes('Access denied') ||
          transcriptionResult.error.includes('cloudflare')) {
        console.error('\n🚫 403/CLOUDFLARE ERROR DETECTED!');
        console.error('   Status: WAF bypass solution is NOT working');
        console.error('   Action needed: Review User-Agent and header configuration');
        process.exit(1);
      }

      process.exit(1);
    }

    console.log('✅ Transcription test passed successfully!');
    console.log('📝 Result:', {
      text: transcriptionResult.data.text || '(empty - expected for minimal test file)',
      duration: transcriptionResult.data.duration,
      confidence: transcriptionResult.data.confidence
    });

    // Success summary
    console.log('\n🎉 SMOKE TEST PASSED - ALL SYSTEMS GO!');
    console.log('================================================');
    console.log('✅ Environment configuration: OK');
    console.log('✅ Groq API connectivity: OK');
    console.log('✅ Transcription functionality: OK');
    console.log('✅ Cloudflare WAF bypass: WORKING');
    console.log(`📅 Test completed: ${new Date().toISOString()}`);

    process.exit(0);

  } catch (error) {
    console.error('\n💥 SMOKE TEST FAILED - CRITICAL ERROR');
    console.error('================================================');
    console.error('Error:', error);

    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }

    console.error(`📅 Test failed: ${new Date().toISOString()}`);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  runGroqSmokeTest().catch((error) => {
    console.error('Unhandled error in smoke test:', error);
    process.exit(1);
  });
}

export { runGroqSmokeTest };