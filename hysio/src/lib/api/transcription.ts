// Client-side transcription utilities

import type { TranscriptionResponse } from '@/types';

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
}

// Client-side function to transcribe audio via API with comprehensive logging
export async function transcribeAudio(
  audioBlob: Blob,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> {
  const startTime = Date.now();
  console.log('🎤 TRANSCRIPTION START:', {
    audioSize: `${(audioBlob.size / 1024).toFixed(1)}KB`,
    audioType: audioBlob.type,
    language: options.language,
    hasPrompt: !!options.prompt,
    temperature: options.temperature,
    timestamp: new Date().toISOString()
  });

  try {
    // Prepare form data
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    if (options.language) {
      formData.append('language', options.language);
    }

    if (options.prompt) {
      formData.append('prompt', options.prompt);
      console.log('📝 Transcription prompt:', options.prompt.substring(0, 100) + '...');
    }

    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }

    // Make API request
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      console.error('❌ TRANSCRIPTION FAILED:', {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        duration: `${duration}ms`,
        audioSize: `${(audioBlob.size / 1024).toFixed(1)}KB`
      });
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ TRANSCRIPTION SUCCESS:', {
      duration: `${duration}ms`,
      transcriptLength: result.transcript?.length || 0,
      confidence: result.confidence,
      hasTranscript: !!result.transcript,
      transcriptPreview: result.transcript?.substring(0, 100) + '...'
    });

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🔥 TRANSCRIPTION ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      audioSize: `${(audioBlob.size / 1024).toFixed(1)}KB`,
      stack: error instanceof Error ? error.stack : null
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transcribe audio',
    };
  }
}

// Utility to get supported audio formats
export function getSupportedAudioFormats(): string[] {
  return [
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4', 
    'audio/wav',
    'audio/mpeg',
    'audio/webm',
    'audio/ogg',
    'audio/flac',
  ];
}

// Utility to validate audio file
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024; // 25MB
  const supportedFormats = getSupportedAudioFormats();

  if (!file.type.startsWith('audio/')) {
    return { valid: false, error: 'File must be an audio file' };
  }

  if (!supportedFormats.some(format => file.type.includes(format))) {
    return { 
      valid: false, 
      error: `Unsupported audio format. Supported formats: ${supportedFormats.join(', ')}` 
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 25MB' };
  }

  return { valid: true };
}