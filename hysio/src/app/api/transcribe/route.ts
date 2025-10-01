// API route for audio transcription using Groq Whisper Large v3 Turbo
// Supports automatic splitting for files >25MB (Groq API limit)

import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudioWithGroq, isSupportedAudioFormat, type GroqTranscriptionOptions } from '@/lib/api/groq';
import {
  isFileSizeExceeded,
  splitAudioFile,
  processAudioSegments,
  formatFileSize
} from '@/lib/utils/audio-splitter';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check if request has form data
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, error: 'Request must be multipart/form-data' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = formData.get('language') as string || 'nl';
    const prompt = formData.get('prompt') as string || undefined;
    const temperature = formData.get('temperature') ? parseFloat(formData.get('temperature') as string) : 0.0;

    // Validate audio file
    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }


    // Debug logging
    console.log('Audio file details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      lastModified: audioFile.lastModified
    });

    // Convert File to Blob first for processing
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type });
    
    // Check if file needs splitting (>25MB due to Groq API limit)
    const needsSplitting = isFileSizeExceeded(audioBlob);

    console.log(`Audio file: ${formatFileSize(audioBlob.size)} - ${needsSplitting ? 'needs splitting' : 'processing directly'}`);

    if (needsSplitting) {
      console.log('File exceeds 25MB limit, initiating automatic splitting...');
    }

    // Check if audio format is supported (more lenient checking)
    if (!isSupportedAudioFormat(audioFile.type)) {
      console.log('Unsupported format detected:', audioFile.type);
      return NextResponse.json(
        { 
          success: false, 
          error: `Unsupported audio format: ${audioFile.type}. Supported formats: WAV, MP3, MP4, WebM, OGG, FLAC, M4A` 
        },
        { status: 400 }
      );
    }

    // Set up transcription options
    const options: GroqTranscriptionOptions = {
      language,
      ...(prompt && { prompt }),
      temperature,
      response_format: 'verbose_json',
      model: 'whisper-large-v3-turbo',
    };

    let finalTranscript = '';
    let totalDuration = 0;
    let confidence = 1.0;
    let isSegmented = false;

    if (needsSplitting) {
      // For large files, split them into chunks and process sequentially
      console.log('File exceeds 25MB limit, starting automatic splitting and processing...');

      try {
        // Split the audio file into segments
        const splitResult = await splitAudioFile(audioBlob);

        if (splitResult.error) {
          throw new Error(splitResult.error);
        }

        console.log(`Successfully split audio into ${splitResult.segments.length} segments`);

        // Process each segment through Groq
        const processSegment = async (segmentBlob: Blob, index: number): Promise<string> => {
          console.log(`Processing segment ${index + 1}/${splitResult.segments.length}`);

          const result = await transcribeAudioWithGroq(segmentBlob, options);

          if (!result.success) {
            throw new Error(result.error || `Failed to transcribe segment ${index + 1}`);
          }

          return result.data?.text || '';
        };

        // Process all segments sequentially
        const segmentResults = await processAudioSegments(splitResult.segments, processSegment);

        if (segmentResults.errors.length > 0) {
          console.warn('Some segments had errors:', segmentResults.errors);
        }

        finalTranscript = segmentResults.combinedTranscript;
        totalDuration = segmentResults.totalDuration;
        confidence = segmentResults.segments.reduce((sum, _seg) => sum + 1, 0) / segmentResults.segments.length; // Average confidence
        isSegmented = true;

        console.log(`Completed processing ${splitResult.segments.length} segments. Total transcript length: ${finalTranscript.length}`);

      } catch (error) {
        console.error('Audio splitting/processing failed:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to process large audio file: ' + (error instanceof Error ? error.message : 'Unknown error'),
          details: {
            fileSize: formatFileSize(audioBlob.size),
            suggestion: 'Try uploading a smaller file or check audio format compatibility.'
          }
        }, { status: 500 });
      }

    } else {
      // Handle normal file (≤25MB) - direct processing
      console.log('Starting direct transcription with Groq...', {
        size: audioBlob.size,
        type: audioBlob.type,
        language,
        model: options.model
      });

      const result = await transcribeAudioWithGroq(audioBlob, options);

      console.log('Groq transcription result:', {
        success: result.success,
        error: result.success ? undefined : result.error,
        textLength: result.success && result.data?.text ? result.data.text.length : 0
      });

      if (!result.success) {
        return NextResponse.json({
          success: false,
          error: result.error || 'Groq transcription failed'
        }, { status: 400 });
      }
      
      finalTranscript = result.data?.text || '';
      totalDuration = result.data?.duration || 0;
      confidence = result.data?.confidence || 1.0;
    }

    // Return unified result format
    return NextResponse.json({
      success: true,
      transcript: finalTranscript,
      duration: totalDuration,
      confidence: confidence,
      segmented: isSegmented,
      fileSize: formatFileSize(audioBlob.size)
    });

  } catch (error) {
    console.error('Transcription API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during transcription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check API status
export async function GET() {
  try {
    // Check if Groq API key is available
    const groqApiKey = process.env.GROQ_API_KEY;
    const hasGroqKey = Boolean(groqApiKey);
    
    return NextResponse.json({
      success: true,
      message: 'Transcription API is running with automatic splitting',
      model: 'whisper-large-v3-turbo',
      provider: 'Groq',
      supportedFormats: ['audio/m4a', 'audio/mp4', 'audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/flac'],
      maxFileSize: '70MB (automatic splitting for files >25MB)',
      splittingEnabled: true,
      maxRecordingTime: '60 minutes',
      hasGroqKey,
      groqKeyLength: groqApiKey ? groqApiKey.length : 0
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check API status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}