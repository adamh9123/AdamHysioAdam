import { toast } from 'sonner';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
}

const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/mp3',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/m4a',
  'audio/aac',
];

const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUDIO_DURATION = 3600; // 60 minutes in seconds

export async function validateAudioFile(file: File): Promise<FileValidationResult> {
  // Check file type
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    const error = `Ongeldig bestandstype: ${file.type}. Toegestane types: MP3, WAV, WEBM, OGG, M4A, AAC`;
    toast.error('Bestand validatie mislukt', { description: error });
    return { valid: false, error };
  }

  // Check file size
  if (file.size > MAX_AUDIO_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_AUDIO_SIZE / (1024 * 1024)).toFixed(0);
    const error = `Bestand te groot: ${sizeMB}MB. Maximaal: ${maxMB}MB`;
    toast.error('Bestand validatie mislukt', { description: error });
    return { valid: false, error };
  }

  // Validate file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeExtensionMap: Record<string, string[]> = {
    'audio/webm': ['webm'],
    'audio/mp3': ['mp3'],
    'audio/mpeg': ['mp3', 'mpeg'],
    'audio/wav': ['wav'],
    'audio/ogg': ['ogg'],
    'audio/m4a': ['m4a'],
    'audio/aac': ['aac'],
  };

  const expectedExtensions = mimeExtensionMap[file.type];
  if (expectedExtensions && !expectedExtensions.includes(extension || '')) {
    const error = `Bestandsextensie (${extension}) komt niet overeen met type (${file.type})`;
    toast.error('Bestand validatie mislukt', { description: error });
    return { valid: false, error };
  }

  // Try to validate audio duration (if possible)
  try {
    const duration = await getAudioDuration(file);
    if (duration > MAX_AUDIO_DURATION) {
      const durationMin = Math.floor(duration / 60);
      const maxMin = Math.floor(MAX_AUDIO_DURATION / 60);
      const error = `Audio te lang: ${durationMin} min. Maximaal: ${maxMin} min`;
      toast.error('Bestand validatie mislukt', { description: error });
      return { valid: false, error };
    }
  } catch (err) {
    console.warn('Could not validate audio duration:', err);
  }

  return { valid: true, file };
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load audio metadata'));
    });

    audio.src = url;
  });
}

export function validateBlobRecording(blob: Blob, duration: number): FileValidationResult {
  // Check blob size
  if (blob.size > MAX_AUDIO_SIZE) {
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_AUDIO_SIZE / (1024 * 1024)).toFixed(0);
    const error = `Opname te groot: ${sizeMB}MB. Maximaal: ${maxMB}MB`;
    toast.error('Opname validatie mislukt', { description: error });
    return { valid: false, error };
  }

  // Check duration
  if (duration > MAX_AUDIO_DURATION) {
    const durationMin = Math.floor(duration / 60);
    const maxMin = Math.floor(MAX_AUDIO_DURATION / 60);
    const error = `Opname te lang: ${durationMin} min. Maximaal: ${maxMin} min`;
    toast.error('Opname validatie mislukt', { description: error });
    return { valid: false, error };
  }

  // Check if blob is empty
  if (blob.size === 0) {
    const error = 'Opname is leeg. Probeer het opnieuw.';
    toast.error('Opname validatie mislukt', { description: error });
    return { valid: false, error };
  }

  return { valid: true };
}

export interface ValidationConfig {
  maxSize?: number;
  allowedTypes?: string[];
  maxDuration?: number;
}

export async function validateFile(
  file: File,
  config: ValidationConfig = {}
): Promise<FileValidationResult> {
  const {
    maxSize = MAX_AUDIO_SIZE,
    allowedTypes = ALLOWED_AUDIO_TYPES,
    maxDuration = MAX_AUDIO_DURATION
  } = config;

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Ongeldig bestandstype: ${file.type}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `Bestand te groot: ${(file.size / (1024 * 1024)).toFixed(2)}MB` };
  }

  return { valid: true, file };
}