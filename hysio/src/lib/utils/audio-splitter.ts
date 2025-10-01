/**
 * Audio file splitting utility for handling large audio files >25MB
 * Splits files into segments while maintaining logical order for processing
 * Groq API has a ~25MB limit, so we split files exceeding this threshold
 */

export interface AudioSegment {
  blob: Blob;
  index: number;
  duration: number;
  size: number;
  startTime: number;
  endTime: number;
}

export interface AudioSplitResult {
  segments: AudioSegment[];
  totalSize: number;
  totalDuration: number;
  error?: string;
}

/**
 * Maximum file size in bytes (25MB)
 * This matches the Groq API limit to prevent 413 errors
 */
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

/**
 * Check if an audio file exceeds the size limit
 */
export function isFileSizeExceeded(blob: Blob): boolean {
  return blob.size > MAX_FILE_SIZE;
}

/**
 * Split audio file into segments that don't exceed 25MB
 * Uses Web Audio API to process audio data
 */
export async function splitAudioFile(
  audioBlob: Blob,
  maxSegmentSize: number = MAX_FILE_SIZE
): Promise<AudioSplitResult> {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && window.AudioContext) {
      // Browser environment - use Web Audio API
      return await splitAudioFileWithWebAudio(audioBlob, maxSegmentSize);
    } else {
      // Server environment - use byte chunking
      console.log('Server environment detected, using byte chunking for audio splitting');
      return await splitByByteChunks(audioBlob, maxSegmentSize);
    }
  } catch (error) {
    console.error('Error splitting audio file:', error);

    // Fallback: split by byte chunks if Web Audio API fails
    return splitByByteChunks(audioBlob, maxSegmentSize);
  }
}

async function splitAudioFileWithWebAudio(
  audioBlob: Blob,
  maxSegmentSize: number = MAX_FILE_SIZE
): Promise<AudioSplitResult> {
  // Convert blob to ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Create audio context
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  try {
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

    const sampleRate = audioBuffer.sampleRate;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const totalDuration = audioBuffer.duration;

    // Calculate approximate segment duration based on file size ratio
    const compressionRatio = audioBlob.size / (audioBuffer.length * numberOfChannels * 4); // Rough estimate
    const segmentDurationApprox = (maxSegmentSize / audioBlob.size) * totalDuration;

    // Ensure minimum segment length of 30 seconds to avoid too many small segments
    const minSegmentDuration = Math.min(30, totalDuration / 10);
    const segmentDuration = Math.max(segmentDurationApprox, minSegmentDuration);

    const segments: AudioSegment[] = [];
    let currentTime = 0;
    let segmentIndex = 0;

    while (currentTime < totalDuration) {
      const endTime = Math.min(currentTime + segmentDuration, totalDuration);
      const segmentLength = Math.round((endTime - currentTime) * sampleRate);
      const startSample = Math.round(currentTime * sampleRate);

      // Create new AudioBuffer for this segment
      const segmentBuffer = audioContext.createBuffer(
        numberOfChannels,
        segmentLength,
        sampleRate
      );

      // Copy audio data for this segment
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const segmentChannelData = segmentBuffer.getChannelData(channel);

        for (let i = 0; i < segmentLength; i++) {
          segmentChannelData[i] = channelData[startSample + i] || 0;
        }
      }

      // Convert segment buffer back to blob
      const segmentBlob = await audioBufferToBlob(segmentBuffer, audioBlob.type);

      segments.push({
        blob: segmentBlob,
        index: segmentIndex,
        duration: endTime - currentTime,
        size: segmentBlob.size,
        startTime: currentTime,
        endTime: endTime
      });

      currentTime = endTime;
      segmentIndex++;
    }

    return {
      segments,
      totalSize: segments.reduce((sum, segment) => sum + segment.size, 0),
      totalDuration,
    };

  } finally {
    // Always close audio context to prevent memory leaks
    await audioContext.close();
  }
}

/**
 * Fallback method: Split audio file by byte chunks
 * Less precise but works when Web Audio API is not available
 * Enhanced with better duration estimation
 */
async function splitByByteChunks(
  audioBlob: Blob,
  maxChunkSize: number = MAX_FILE_SIZE
): Promise<AudioSplitResult> {
  const segments: AudioSegment[] = [];
  let offset = 0;
  let segmentIndex = 0;

  // Better duration estimation based on audio format and file size
  const estimatedTotalDuration = estimateAudioDuration(audioBlob);
  const numberOfSegments = Math.ceil(audioBlob.size / maxChunkSize);

  console.log(`Splitting ${formatFileSize(audioBlob.size)} into ${numberOfSegments} segments (estimated ${formatDuration(estimatedTotalDuration)})`);

  while (offset < audioBlob.size) {
    const chunkSize = Math.min(maxChunkSize, audioBlob.size - offset);
    const chunkBlob = audioBlob.slice(offset, offset + chunkSize, audioBlob.type);

    // More accurate duration calculation based on file size ratio
    const durationRatio = chunkSize / audioBlob.size;
    const segmentDuration = durationRatio * estimatedTotalDuration;
    const startTime = (offset / audioBlob.size) * estimatedTotalDuration;
    const endTime = startTime + segmentDuration;

    segments.push({
      blob: chunkBlob,
      index: segmentIndex,
      duration: segmentDuration,
      size: chunkSize,
      startTime: startTime,
      endTime: endTime
    });

    console.log(`Created segment ${segmentIndex + 1}/${numberOfSegments}: ${formatFileSize(chunkSize)}, ${formatDuration(segmentDuration)}`);

    offset += chunkSize;
    segmentIndex++;
  }

  return {
    segments,
    totalSize: audioBlob.size,
    totalDuration: estimatedTotalDuration,
  };
}

/**
 * Estimate audio duration based on file size and format
 * This is a rough approximation but better than fixed values
 */
function estimateAudioDuration(audioBlob: Blob): number {
  const sizeInMB = audioBlob.size / (1024 * 1024);

  // Different compression rates for different formats
  let bitsPerSecond = 128000; // Default bitrate (128 kbps)

  if (audioBlob.type.includes('wav')) {
    bitsPerSecond = 1411200; // Uncompressed CD quality
  } else if (audioBlob.type.includes('flac')) {
    bitsPerSecond = 800000; // FLAC average
  } else if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) {
    bitsPerSecond = 256000; // AAC high quality
  } else if (audioBlob.type.includes('ogg') || audioBlob.type.includes('webm')) {
    bitsPerSecond = 192000; // Vorbis/Opus good quality
  } else if (audioBlob.type.includes('mp3') || audioBlob.type.includes('mpeg')) {
    bitsPerSecond = 192000; // MP3 good quality
  }

  // Calculate duration: fileSize (bits) / bitrate (bits per second)
  const durationSeconds = (audioBlob.size * 8) / bitsPerSecond;

  // Clamp to reasonable values (1 second minimum, 4 hours maximum)
  return Math.max(1, Math.min(durationSeconds, 14400));
}

/**
 * Convert AudioBuffer to Blob
 */
async function audioBufferToBlob(buffer: AudioBuffer, mimeType: string = 'audio/wav'): Promise<Blob> {
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buffer.length * blockAlign;
  const bufferSize = 44 + dataSize;
  
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Audio data
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: mimeType });
}

/**
 * Process multiple audio segments sequentially
 * Returns combined transcription results
 */
export interface SegmentProcessingResult {
  combinedTranscript: string;
  segments: Array<{
    index: number;
    transcript: string;
    duration: number;
    error?: string;
  }>;
  totalDuration: number;
  errors: string[];
}

export async function processAudioSegments(
  segments: AudioSegment[],
  processSegment: (blob: Blob, index: number) => Promise<string>
): Promise<SegmentProcessingResult> {
  const results: Array<{
    index: number;
    transcript: string;
    duration: number;
    error?: string;
  }> = [];
  
  const errors: string[] = [];
  
  // Process segments sequentially to maintain order
  for (const segment of segments) {
    try {
      console.log(`Processing segment ${segment.index + 1}/${segments.length} (${(segment.size / 1024 / 1024).toFixed(1)}MB)`);
      
      const transcript = await processSegment(segment.blob, segment.index);
      
      results.push({
        index: segment.index,
        transcript,
        duration: segment.duration,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error processing segment ${segment.index}:`, errorMessage);
      
      errors.push(`Segment ${segment.index + 1}: ${errorMessage}`);
      
      results.push({
        index: segment.index,
        transcript: `[Error processing segment ${segment.index + 1}]`,
        duration: segment.duration,
        error: errorMessage,
      });
    }
  }
  
  // Combine transcripts in correct order
  const combinedTranscript = results
    .sort((a, b) => a.index - b.index)
    .map(result => result.transcript)
    .join('\n\n');
  
  return {
    combinedTranscript,
    segments: results,
    totalDuration: segments.reduce((sum, segment) => sum + segment.duration, 0),
    errors,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format duration for display
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}