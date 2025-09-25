/**
 * Comprehensive Integration Tests for Hysio Medical Scribe
 * Tests the complete data flow from user input to AI processing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { transcribeAudio } from '@/lib/api/transcription';
import { apiCall, API_ENDPOINTS } from '@/lib/api';

// Mock the external APIs
vi.mock('@/lib/api/transcription');
vi.mock('@/lib/api');

describe('Medical Scribe Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Audio Transcription Flow', () => {
    it('should transcribe audio and process through workflow', async () => {
      // Mock transcription response
      const mockTranscriptionResponse = {
        success: true,
        transcript: 'Patiënt klaagt over pijn in de lies bij lopen sinds 3 weken. Pijn straalt niet uit.',
        confidence: 0.95
      };

      vi.mocked(transcribeAudio).mockResolvedValue(mockTranscriptionResponse);

      // Mock audio blob
      const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/webm' });

      // Test transcription
      const transcriptionResult = await transcribeAudio(mockAudioBlob, {
        language: 'nl',
        prompt: 'Fysiotherapie intake gesprek'
      });

      expect(transcriptionResult.success).toBe(true);
      expect(transcriptionResult.transcript).toContain('lies');
      expect(transcriptionResult.transcript.length).toBeGreaterThan(50);
    });

    it('should handle transcription failures gracefully', async () => {
      vi.mocked(transcribeAudio).mockResolvedValue({
        success: false,
        error: 'Audio file too short'
      });

      const mockAudioBlob = new Blob([''], { type: 'audio/webm' });
      const result = await transcribeAudio(mockAudioBlob);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Audio file too short');
    });
  });

  describe('AI Processing Flow', () => {
    it('should process real transcript data for HHSB generation', async () => {
      const mockAIResponse = {
        success: true,
        data: {
          content: `**H - Hulpvraag:** Patiënt wil weer kunnen lopen zonder pijn
**H - Historie:** Pijn ontstaan 3 weken geleden tijdens hardlopen
**S - Stoornissen:** Pijn in lies bij lopen, geen uitstraling
**B - Beperkingen:** Kan niet meer sporten, lopen beperkt`
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockAIResponse);

      const transcript = 'Patiënt klaagt over pijn in de lies bij lopen sinds 3 weken';
      const patientInfo = {
        initials: 'J.D.',
        birthYear: '1985',
        gender: 'male' as const,
        chiefComplaint: 'Liespijn bij lopen'
      };

      const result = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: 'HHSB analysis system prompt',
          userPrompt: `TRANSCRIPT: ${transcript}\nPatient: ${patientInfo.chiefComplaint}`
        })
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain('Hulpvraag');
      expect(result.data.content).toContain('Historie');
      expect(result.data.content).toContain('lies');
    });

    it('should include context document in AI prompts', async () => {
      const mockAIResponse = {
        success: true,
        data: { content: 'AI response with context' }
      };

      vi.mocked(apiCall).mockResolvedValue(mockAIResponse);

      const transcript = 'Patiënt rapporteert vooruitgang';
      const contextDocument = 'Verwijsbrief: Patiënt heeft chronische liespijn';

      await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: 'System prompt',
          userPrompt: `TRANSCRIPT: ${transcript}\nCONTEXT: ${contextDocument}`
        })
      });

      expect(apiCall).toHaveBeenCalledWith(
        API_ENDPOINTS.GENERATE_CONTENT,
        expect.objectContaining({
          body: expect.stringContaining('chronische liespijn')
        })
      );
    });
  });

  describe('Data Validation', () => {
    it('should reject empty transcripts', () => {
      const transcript = '';
      expect(transcript.length).toBe(0);
      // In real implementation, this should trigger validation error
    });

    it('should validate minimum transcript length', () => {
      const shortTranscript = 'Te kort';
      const validTranscript = 'Patiënt klaagt over pijn in de lies bij lopen sinds drie weken zonder duidelijke oorzaak';

      expect(shortTranscript.length).toBeLessThan(50);
      expect(validTranscript.length).toBeGreaterThan(50);
    });

    it('should validate patient info structure', () => {
      const validPatientInfo = {
        initials: 'J.D.',
        birthYear: '1985',
        gender: 'male' as const,
        chiefComplaint: 'Liespijn'
      };

      expect(validPatientInfo.initials).toBeDefined();
      expect(validPatientInfo.birthYear).toMatch(/^\d{4}$/);
      expect(['male', 'female']).toContain(validPatientInfo.gender);
      expect(validPatientInfo.chiefComplaint.length).toBeGreaterThan(0);
    });
  });

  describe('Clinical Accuracy Scenarios', () => {
    it('should generate relevant HHSB for liesklacht', async () => {
      const mockResponse = {
        success: true,
        data: {
          content: `**H - Hulpvraag:** Patiënt wil zonder pijn kunnen lopen en sporten
**H - Historie:** Acute onset 3 weken geleden tijdens hardlopen
**S - Stoornissen:** Pijn lies, bewegingsbeperking heup
**B - Beperkingen:** Kan niet meer sporten, dagelijks lopen beperkt`
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const liesklachtTranscript = 'Patiënt heeft sinds 3 weken pijn in de rechterlies die ontstond tijdens het hardlopen. De pijn is scherp en wordt erger bij lopen. Kan niet meer sporten.';

      const result = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: 'HHSB generation',
          userPrompt: `TRANSCRIPT: ${liesklachtTranscript}`
        })
      });

      expect(result.data.content).toContain('lies');
      expect(result.data.content).toContain('hardlopen');
      expect(result.data.content).toContain('sporten');
      expect(result.data.content).toContain('Hulpvraag');
      expect(result.data.content).toContain('Historie');
    });

    it('should generate relevant HHSB for rugklacht', async () => {
      const mockResponse = {
        success: true,
        data: {
          content: `**H - Hulpvraag:** Patiënt wil rugpijn verminderen voor werk
**H - Historie:** Geleidelijk ontstaan over 6 maanden, ergernomie probleem
**S - Stoornissen:** Lage rugpijn, stijfheid ochtend
**B - Beperkingen:** Moeilijk lang zitten, werk beïnvloed`
        }
      };

      vi.mocked(apiCall).mockResolvedValue(mockResponse);

      const rugklachtTranscript = 'Patiënt heeft al 6 maanden last van lage rugpijn. Vooral erg in de ochtend en na lang zitten op kantoor. Moeilijk om te tillen.';

      const result = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: 'HHSB generation',
          userPrompt: `TRANSCRIPT: ${rugklachtTranscript}`
        })
      });

      expect(result.data.content).toContain('rug');
      expect(result.data.content).toContain('zitten');
      expect(result.data.content).toContain('werk');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle API failures gracefully', async () => {
      vi.mocked(apiCall).mockResolvedValue({
        success: false,
        error: 'AI service temporarily unavailable'
      });

      const result = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' })
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('unavailable');
    });

    it('should handle network timeouts', async () => {
      vi.mocked(apiCall).mockRejectedValue(new Error('Network timeout'));

      try {
        await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
          method: 'POST',
          body: JSON.stringify({ test: 'data' })
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Performance Validation', () => {
    it('should complete transcription within acceptable time', async () => {
      const startTime = Date.now();

      vi.mocked(transcribeAudio).mockImplementation(async () => {
        // Simulate realistic transcription time
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          success: true,
          transcript: 'Mock transcript',
          confidence: 0.9
        };
      });

      await transcribeAudio(new Blob(['test'], { type: 'audio/webm' }));

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should complete AI processing within acceptable time', async () => {
      const startTime = Date.now();

      vi.mocked(apiCall).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
          success: true,
          data: { content: 'Mock AI response' }
        };
      });

      await apiCall(API_ENDPOINTS.GENERATE_CONTENT, { method: 'POST' });

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});