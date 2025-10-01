// Client-side transcription utilities

import type { TranscriptionResponse } from '@/types';

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
}

// Client-side function to transcribe audio via API with comprehensive logging
// This function routes through our server-side API which handles automatic splitting for large files
export async function transcribeAudio(
  audioBlob: Blob,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResponse> {
  const startTime = Date.now();
  const audioSizeMB = audioBlob.size / (1024 * 1024);

  console.log('🎤 TRANSCRIPTION START:', {
    audioSize: `${(audioBlob.size / 1024).toFixed(1)}KB`,
    audioSizeMB: `${audioSizeMB.toFixed(1)}MB`,
    audioType: audioBlob.type,
    language: options.language,
    hasPrompt: !!options.prompt,
    temperature: options.temperature,
    timestamp: new Date().toISOString(),
    willUseSplitting: audioSizeMB > 25 // Files >25MB will be split automatically
  });

  try {
    // Prepare form data
    const formData = new FormData();

    // Create a File object with proper extension for better processing
    const extension = audioBlob.type.includes('webm') ? 'webm' :
                     audioBlob.type.includes('wav') ? 'wav' :
                     audioBlob.type.includes('mp4') ? 'mp4' : 'wav';

    const audioFile = new File([audioBlob], `recording.${extension}`, {
      type: audioBlob.type || 'audio/wav'
    });

    formData.append('audio', audioFile);

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

    // Use our server-side API which handles splitting automatically
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
        error: result?.error || 'No error message',
        duration: `${duration}ms`,
        audioSize: `${(audioBlob.size / 1024).toFixed(1)}KB`,
        audioSizeMB: `${audioSizeMB.toFixed(1)}MB`,
        details: result?.details || 'No details available',
        fullResult: result
      });

      // Enhanced error handling for large files
      if (response.status === 413) {
        // Use the server's error message if available, fallback to generic Dutch message
        const serverError = result?.error || result?.details?.suggestion;
        const errorMessage = serverError ||
          `Audio bestand te groot (${audioSizeMB.toFixed(1)}MB). Upload een kleiner bestand of splits de audio vooraf.`;
        throw new Error(errorMessage);
      }

      // Handle other specific error cases
      if (result?.error && result.error.includes('te groot')) {
        throw new Error(result.error);
      }

      throw new Error(result?.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ TRANSCRIPTION SUCCESS:', {
      duration: `${duration}ms`,
      transcriptLength: result.transcript?.length || 0,
      confidence: result.confidence,
      hasTranscript: !!result.transcript,
      transcriptPreview: result.transcript?.substring(0, 100) + '...',
      wasSegmented: result.segmented || false,
      fileSize: result.fileSize
    });

    // Convert server response to expected format
    return {
      success: true,
      transcript: result.transcript,
      duration: result.duration,
      confidence: result.confidence || 1.0,
      segmented: result.segmented,
      fileSize: result.fileSize
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🔥 TRANSCRIPTION ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      audioSize: `${(audioBlob.size / 1024).toFixed(1)}KB`,
      audioSizeMB: `${audioSizeMB.toFixed(1)}MB`,
      stack: error instanceof Error ? error.stack : null,
      errorType: error instanceof Error ? error.constructor.name : typeof error
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
  const maxSize = 100 * 1024 * 1024; // 100MB
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
    return { valid: false, error: 'File size must be less than 100MB' };
  }

  return { valid: true };
}