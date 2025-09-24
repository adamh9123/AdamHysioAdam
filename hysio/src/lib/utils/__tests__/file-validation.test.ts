import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateAudioFile, validateBlobRecording, validateFile } from '../file-validation';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  }
}));

describe('file-validation utilities', () => {
  describe('validateAudioFile', () => {
    it('accepts valid MP3 file', async () => {
      const file = new File(['audio content'], 'test.mp3', { type: 'audio/mp3' });
      const result = await validateAudioFile(file);

      expect(result.valid).toBe(true);
      expect(result.file).toBe(file);
      expect(result.error).toBeUndefined();
    });

    it('accepts valid WAV file', async () => {
      const file = new File(['audio content'], 'test.wav', { type: 'audio/wav' });
      const result = await validateAudioFile(file);

      expect(result.valid).toBe(true);
    });

    it('rejects invalid file type', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = await validateAudioFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldig bestandstype');
      expect(result.error).toContain('text/plain');
    });

    it('rejects file exceeding size limit', async () => {
      const largeContent = new Uint8Array(51 * 1024 * 1024); // 51MB
      const file = new File([largeContent], 'large.mp3', { type: 'audio/mp3' });
      const result = await validateAudioFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('te groot');
      expect(result.error).toContain('50MB');
    });

    it('detects extension mismatch', async () => {
      const file = new File(['content'], 'test.mp3', { type: 'audio/wav' });
      const result = await validateAudioFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('extensie');
      expect(result.error).toContain('niet overeen');
    });

    it('accepts file without extension check when MIME matches', async () => {
      const file = new File(['content'], 'test.mp3', { type: 'audio/mp3' });
      const result = await validateAudioFile(file);

      expect(result.valid).toBe(true);
    });
  });

  describe('validateBlobRecording', () => {
    it('accepts valid blob recording', () => {
      const blob = new Blob(['audio data'], { type: 'audio/webm' });
      const result = validateBlobRecording(blob, 300); // 5 minutes

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects empty blob', () => {
      const blob = new Blob([], { type: 'audio/webm' });
      const result = validateBlobRecording(blob, 10);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('leeg');
    });

    it('rejects blob exceeding size limit', () => {
      const largeContent = new Uint8Array(51 * 1024 * 1024); // 51MB
      const blob = new Blob([largeContent], { type: 'audio/webm' });
      const result = validateBlobRecording(blob, 300);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('te groot');
    });

    it('rejects recording exceeding duration limit', () => {
      const blob = new Blob(['audio data'], { type: 'audio/webm' });
      const result = validateBlobRecording(blob, 3700); // 61+ minutes

      expect(result.valid).toBe(false);
      expect(result.error).toContain('te lang');
      expect(result.error).toContain('60 min');
    });

    it('accepts recording at exact duration limit', () => {
      const blob = new Blob(['audio data'], { type: 'audio/webm' });
      const result = validateBlobRecording(blob, 3600); // Exactly 60 minutes

      expect(result.valid).toBe(true);
    });
  });

  describe('validateFile with custom config', () => {
    it('uses custom max size', async () => {
      const file = new File(['content'], 'test.mp3', { type: 'audio/mp3' });
      const result = await validateFile(file, {
        maxSize: 100, // 100 bytes
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('te groot');
    });

    it('uses custom allowed types', async () => {
      const file = new File(['content'], 'test.mp3', { type: 'audio/mp3' });
      const result = await validateFile(file, {
        allowedTypes: ['audio/wav'], // Only WAV allowed
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Ongeldig bestandstype');
    });

    it('accepts file with custom config', async () => {
      const file = new File(['content'], 'test.wav', { type: 'audio/wav' });
      const result = await validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['audio/wav'],
      });

      expect(result.valid).toBe(true);
      expect(result.file).toBe(file);
    });

    it('uses default config when not provided', async () => {
      const file = new File(['content'], 'test.mp3', { type: 'audio/mp3' });
      const result = await validateFile(file);

      expect(result.valid).toBe(true);
    });
  });
});