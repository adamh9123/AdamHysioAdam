/**
 * Integration Tests for Pre-intake API Endpoints
 *
 * Tests all API routes:
 * - POST /api/pre-intake/save-draft
 * - GET /api/pre-intake/[sessionId]
 * - POST /api/pre-intake/submit
 * - POST /api/pre-intake/process-hhsb
 * - GET /api/pre-intake/submissions
 *
 * @module app/api/pre-intake/__tests__/api-integration.test
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { QuestionnaireData } from '@/types/pre-intake';

// Mock fetch for testing
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('Pre-intake API Integration Tests', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe('POST /api/pre-intake/save-draft', () => {
    it('should save draft successfully', async () => {
      const sessionId = 'test-session-123';
      const questionnaireData: Partial<QuestionnaireData> = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1980-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Teststraat 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          sessionId,
          lastSavedAt: new Date().toISOString(),
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionnaireData,
          currentStep: 'personalia',
          completedSteps: ['welcome'],
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.sessionId).toBe(sessionId);
    });

    it('should reject draft save without session ID', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Session ID is required',
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireData: {},
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should handle rate limiting', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          message: 'Te veel verzoeken. Probeer het later opnieuw.',
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
          questionnaireData: {},
        }),
      });

      expect(response.status).toBe(429);
    });
  });

  describe('GET /api/pre-intake/[sessionId]', () => {
    it('should retrieve existing draft', async () => {
      const sessionId = 'test-session-123';

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          questionnaireData: {
            personalia: {
              firstName: 'Jan',
              lastName: 'Jansen',
            },
          },
          currentStep: 'personalia',
          completedSteps: ['welcome'],
          lastSavedAt: new Date().toISOString(),
          isExpired: false,
        }),
      } as Response);

      const response = await fetch(`/api/pre-intake/${sessionId}`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.questionnaireData).toBeDefined();
      expect(data.isExpired).toBe(false);
    });

    it('should return 404 for non-existent draft', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          message: 'Draft niet gevonden',
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/non-existent-session');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should mark expired drafts', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          isExpired: true,
          message: 'Dit concept is verlopen',
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/expired-session');
      const data = await response.json();

      expect(data.isExpired).toBe(true);
    });
  });

  describe('POST /api/pre-intake/submit', () => {
    it('should submit complete questionnaire successfully', async () => {
      const completeData: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1980-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Teststraat 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Rugpijn die uitstraalt',
          onset: 'Geleidelijk ontstaan',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 7,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
        medicalHistory: {
          hasRecentSurgeries: false,
          takesMedication: false,
          smokingStatus: 'no',
          alcoholConsumption: 'sometimes',
        },
        goals: {
          treatmentGoals: 'Pijnvermindering en functioneel herstel',
          thoughtsOnCause: 'Te veel zitten',
          moodImpact: 'moderate',
          limitedActivities: 'Sporten en huishouden',
        },
        functionalLimitations: {
          limitedActivityCategories: ['work', 'sports'],
          severityScores: {
            work: 6,
            sports: 8,
          },
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissionId: 'submission-123',
          message: 'Pre-intake succesvol ingediend',
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
          questionnaireData: completeData,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.submissionId).toBeDefined();
    });

    it('should reject incomplete questionnaire data', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          message: 'Incomplete questionnaire data',
          errors: ['Personalia is verplicht'],
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
          questionnaireData: {},
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should detect and return red flags', async () => {
      const dataWithRedFlags: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1980-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Teststraat 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Ernstige rugpijn',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 9,
        },
        redFlags: {
          unexplainedWeightLoss: true,
          nightSweatsOrFever: false,
          bladderBowelProblems: true,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
        medicalHistory: {
          hasRecentSurgeries: false,
          takesMedication: false,
          smokingStatus: 'no',
          alcoholConsumption: 'never',
        },
        goals: {
          treatmentGoals: 'Pijnvermindering',
          thoughtsOnCause: 'Onbekend',
          moodImpact: 'much',
          limitedActivities: 'Alles',
        },
        functionalLimitations: {
          limitedActivityCategories: ['work'],
          severityScores: { work: 9 },
        },
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissionId: 'submission-123',
          redFlagsDetected: true,
          redFlags: [
            {
              type: 'unexplained_weight_loss',
              severity: 'emergency',
              recommendation: 'Directe doorverwijzing vereist',
            },
            {
              type: 'cauda_equina',
              severity: 'emergency',
              recommendation: 'Spoedeisende hulp',
            },
          ],
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
          questionnaireData: dataWithRedFlags,
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.redFlagsDetected).toBe(true);
      expect(data.redFlags.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/pre-intake/process-hhsb', () => {
    it('should process pre-intake to HHSB structure', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          hhsb: {
            hulpvraag: 'Patiënt wil graag weer pijnvrij kunnen functioneren...',
            historie: 'Klachten zijn geleidelijk ontstaan...',
            stoornissen: 'Pijnintensiteit 7/10...',
            beperkingen: 'Beperkt in werk en sport...',
          },
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/process-hhsb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.hhsb).toBeDefined();
      expect(data.hhsb.hulpvraag).toBeDefined();
      expect(data.hhsb.historie).toBeDefined();
      expect(data.hhsb.stoornissen).toBeDefined();
      expect(data.hhsb.beperkingen).toBeDefined();
    });

    it('should return 404 for non-existent submission', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          message: 'Submission niet gevonden',
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/process-hhsb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'non-existent',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/pre-intake/submissions', () => {
    it('should retrieve list of submissions', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissions: [
            {
              id: 'sub-1',
              sessionId: 'session-1',
              questionnaireData: {
                personalia: {
                  firstName: 'Jan',
                  lastName: 'Jansen',
                },
              },
              submittedAt: new Date().toISOString(),
              isProcessed: false,
              redFlagsSummary: [],
            },
          ],
          total: 1,
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submissions');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.submissions)).toBe(true);
    });

    it('should support filtering by status', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissions: [],
          total: 0,
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submissions?status=submitted');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data.submissions)).toBe(true);
    });

    it('should support filtering by red flags', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissions: [
            {
              id: 'sub-1',
              redFlagsSummary: [
                { type: 'emergency', severity: 'emergency' },
              ],
            },
          ],
          total: 1,
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submissions?hasRedFlags=true');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.submissions.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          submissions: [],
          total: 100,
          limit: 20,
          offset: 0,
        }),
      } as Response);

      const response = await fetch('/api/pre-intake/submissions?limit=20&offset=0');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);
    });
  });
});