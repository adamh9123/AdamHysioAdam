// Comprehensive test suite for SmartMail email generation API endpoint
// Tests all recipient types, edge cases, error scenarios, and fallback mechanisms

import { NextRequest } from 'next/server';
import { POST, GET } from './route';
import { generateContentWithOpenAI } from '@/lib/api/openai';
import type { EmailGenerationRequest, EmailGenerationResponse } from '@/lib/types/smartmail';

// Mock dependencies
jest.mock('@/lib/api/openai');
jest.mock('@/lib/smartmail/error-handling');
jest.mock('@/lib/smartmail/caching');

const mockGenerateContentWithOpenAI = jest.mocked(generateContentWithOpenAI);

// Test utilities
function createMockRequest(body: EmailGenerationRequest): NextRequest {
  return {
    json: async () => body,
    headers: new Headers(),
    method: 'POST',
    url: 'http://localhost:3000/api/smartmail/generate'
  } as NextRequest;
}

function createValidRequest(overrides: Partial<EmailGenerationRequest> = {}): EmailGenerationRequest {
  return {
    recipient: {
      category: 'patient',
      formality: 'empathetic',
      language: 'nl'
    },
    context: {
      objective: 'patient_education',
      subject: 'Behandeling informatie',
      background: 'Na ons gesprek vandaag',
      language: 'nl'
    },
    userId: 'test-user-123',
    timestamp: new Date().toISOString(),
    requestId: 'test-request-123',
    ...overrides
  };
}

describe('/api/smartmail/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful OpenAI response
    mockGenerateContentWithOpenAI.mockResolvedValue({
      success: true,
      content: 'Beste patiënt,\n\nHierbij de gevraagde informatie over uw behandeling.\n\nMet vriendelijke groet,\nDr. Test',
      usage: {
        prompt_tokens: 150,
        completion_tokens: 75,
        total_tokens: 225
      }
    });
  });

  describe('POST /api/smartmail/generate', () => {
    describe('Successful generation scenarios', () => {
      test('should generate email for patient with empathetic tone', async () => {
        const request = createValidRequest({
          recipient: { category: 'patient', formality: 'empathetic', language: 'nl' },
          context: { objective: 'patient_education', subject: 'Diabetes educatie', background: 'Na de diagnose' }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.template).toBeDefined();
        expect(data.template?.metadata.recipientCategory).toBe('patient');
        expect(data.template?.metadata.formalityLevel).toBe('empathetic');
        expect(data.template?.subject).toContain('Diabetes');
      });

      test('should generate email for specialist with formal tone', async () => {
        const request = createValidRequest({
          recipient: { category: 'specialist', formality: 'formal', language: 'nl' },
          context: { objective: 'referral', subject: 'Patiënt verwijzing', background: 'Verdere diagnostiek vereist' }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.template?.metadata.recipientCategory).toBe('specialist');
        expect(data.template?.metadata.formalityLevel).toBe('formal');
      });

      test('should generate email for colleague with professional tone', async () => {
        const request = createValidRequest({
          recipient: { category: 'colleague', formality: 'professional', language: 'nl' },
          context: { objective: 'follow_up', subject: 'Patiënt update', background: 'Behandeling progressie' }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.template?.metadata.recipientCategory).toBe('colleague');
      });

      test('should generate email with documents attached', async () => {
        const request = createValidRequest({
          documents: [
            {
              filename: 'lab-results.pdf',
              source: 'upload',
              content: 'Laboratorium resultaten: Glucose 7.2 mmol/L',
              extractedAt: new Date().toISOString()
            }
          ]
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockGenerateContentWithOpenAI).toHaveBeenCalledWith(
          expect.stringContaining('document'),
          expect.stringContaining('lab-results.pdf'),
          expect.any(Object)
        );
      });

      test('should handle English language generation', async () => {
        const request = createValidRequest({
          recipient: { category: 'patient', formality: 'empathetic', language: 'en' },
          context: { objective: 'patient_education', subject: 'Treatment information', language: 'en' }
        });

        mockGenerateContentWithOpenAI.mockResolvedValueOnce({
          success: true,
          content: 'Dear patient,\n\nHere is the requested information about your treatment.\n\nKind regards,\nDr. Test',
          usage: { prompt_tokens: 150, completion_tokens: 75, total_tokens: 225 }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.template?.metadata.language).toBe('en');
      });
    });

    describe('Validation scenarios', () => {
      test('should reject request with missing recipient', async () => {
        const invalidRequest = {
          context: {
            objective: 'patient_education',
            subject: 'Test',
            language: 'nl'
          },
          userId: 'test-user',
          timestamp: new Date().toISOString(),
          requestId: 'test-request'
        } as EmailGenerationRequest;

        const response = await POST(createMockRequest(invalidRequest));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain('Validation failed');
      });

      test('should reject request with missing context', async () => {
        const invalidRequest = {
          recipient: { category: 'patient', formality: 'empathetic', language: 'nl' },
          userId: 'test-user',
          timestamp: new Date().toISOString(),
          requestId: 'test-request'
        } as EmailGenerationRequest;

        const response = await POST(createMockRequest(invalidRequest));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });

      test('should detect privacy violations in context', async () => {
        const request = createValidRequest({
          context: {
            objective: 'patient_education',
            subject: 'Informatie voor Jan de Vries, BSN 123456789',
            background: 'Patient Jan de Vries (geboren 01-01-1980) heeft diabetes',
            language: 'nl'
          }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'privacy_warning',
              severity: 'warning'
            })
          ])
        );
      });
    });

    describe('Error handling and fallback scenarios', () => {
      test('should handle OpenAI service unavailable', async () => {
        mockGenerateContentWithOpenAI.mockRejectedValueOnce(
          new Error('Service unavailable - 503')
        );

        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        // Should get fallback response
        expect(data.success).toBe(true);
        expect(data.warnings).toEqual(
          expect.arrayContaining([
            expect.stringContaining('cache')
          ])
        );
      });

      test('should handle rate limit exceeded', async () => {
        mockGenerateContentWithOpenAI.mockRejectedValueOnce(
          new Error('Rate limit exceeded - 429')
        );

        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        // Should get fallback or retry response
        expect(response.status).toBeLessThan(500);
      });

      test('should handle invalid API key', async () => {
        mockGenerateContentWithOpenAI.mockRejectedValueOnce(
          new Error('Unauthorized - 401')
        );

        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringContaining('error')
            })
          ])
        );
      });

      test('should handle content policy violation', async () => {
        mockGenerateContentWithOpenAI.mockRejectedValueOnce(
          new Error('Content policy violation')
        );

        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.template?.content).toContain('HANDLEIDING');
        expect(data.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'manual_guidance'
            })
          ])
        );
      });

      test('should handle context length exceeded', async () => {
        mockGenerateContentWithOpenAI.mockRejectedValueOnce(
          new Error('Context length exceeded - token limit')
        );

        const request = createValidRequest({
          documents: Array(10).fill({
            filename: 'large-doc.pdf',
            source: 'upload',
            content: 'Very long document content...'.repeat(1000),
            extractedAt: new Date().toISOString()
          })
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.success).toBe(true);
        expect(data.warnings).toEqual(
          expect.arrayContaining([
            expect.stringContaining('Vereenvoudigde')
          ])
        );
      });
    });

    describe('Suggestion generation', () => {
      test('should suggest formality adjustment for patient with formal tone', async () => {
        const request = createValidRequest({
          recipient: { category: 'patient', formality: 'formal', language: 'nl' }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'formality_adjustment',
              message: expect.stringContaining('empathetic')
            })
          ])
        );
      });

      test('should suggest formality adjustment for specialist with non-formal tone', async () => {
        const request = createValidRequest({
          recipient: { category: 'specialist', formality: 'empathetic', language: 'nl' }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'formality_adjustment',
              message: expect.stringContaining('formal')
            })
          ])
        );
      });

      test('should suggest urgency for red flag notifications', async () => {
        const request = createValidRequest({
          context: {
            objective: 'red_flag_notification',
            subject: 'Urgent: Patient symptoms',
            background: 'Patient heeft ernstige symptomen',
            language: 'nl'
          }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.suggestions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'medical_accuracy',
              severity: 'warning'
            })
          ])
        );
      });
    });

    describe('Subject line generation', () => {
      test('should generate context-appropriate subject lines', async () => {
        const request = createValidRequest({
          context: {
            objective: 'referral',
            subject: 'Cardioloog verwijzing',
            background: 'Voor verdere hartonderzoek',
            language: 'nl'
          }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.template?.subject).toContain('Cardioloog');
      });

      test('should handle subject extraction from AI content', async () => {
        mockGenerateContentWithOpenAI.mockResolvedValueOnce({
          success: true,
          content: '**Onderwerp:** Diabetes educatie voor patiënt\n\nBeste patiënt,\n\nHier is uw informatie...',
          usage: { prompt_tokens: 150, completion_tokens: 75, total_tokens: 225 }
        });

        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.template?.subject).toBe('Diabetes educatie voor patiënt');
      });
    });

    describe('Metadata and usage tracking', () => {
      test('should include comprehensive metadata', async () => {
        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.template?.metadata).toEqual({
          recipientCategory: 'patient',
          objective: 'patient_education',
          language: 'nl',
          wordCount: expect.any(Number),
          estimatedReadingTime: expect.any(Number),
          formalityLevel: 'empathetic',
          includedDisclaimer: false
        });

        expect(data.usage).toEqual({
          promptTokens: 150,
          completionTokens: 75,
          totalTokens: 225,
          processingTime: expect.any(Number)
        });
      });

      test('should generate unique template and request IDs', async () => {
        const request1 = createValidRequest();
        const request2 = createValidRequest();

        const response1 = await POST(createMockRequest(request1));
        const response2 = await POST(createMockRequest(request2));

        const data1: EmailGenerationResponse = await response1.json();
        const data2: EmailGenerationResponse = await response2.json();

        expect(data1.template?.id).not.toBe(data2.template?.id);
      });
    });

    describe('Content formatting', () => {
      test('should provide both HTML and plain text formats', async () => {
        mockGenerateContentWithOpenAI.mockResolvedValueOnce({
          success: true,
          content: 'Beste patiënt,\n\n**Belangrijk:** Dit is uw behandelinformatie.\n\nMet vriendelijke groet',
          usage: { prompt_tokens: 150, completion_tokens: 75, total_tokens: 225 }
        });

        const request = createValidRequest();
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(data.template?.formattedContent.html).toContain('<strong>Belangrijk:</strong>');
        expect(data.template?.formattedContent.html).toContain('<br>');
        expect(data.template?.formattedContent.plainText).not.toContain('<strong>');
        expect(data.template?.formattedContent.plainText).not.toContain('<br>');
      });
    });

    describe('Edge cases', () => {
      test('should handle malformed JSON request', async () => {
        const request = {
          json: async () => { throw new Error('Invalid JSON'); }
        } as NextRequest;

        const response = await POST(request);
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
      });

      test('should handle empty document content', async () => {
        const request = createValidRequest({
          documents: [
            {
              filename: 'empty.pdf',
              source: 'upload',
              content: '',
              extractedAt: new Date().toISOString()
            }
          ]
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });

      test('should handle very long subject lines', async () => {
        const request = createValidRequest({
          context: {
            objective: 'patient_education',
            subject: 'Very long subject line that exceeds normal length expectations and might cause issues with email clients or systems that have character limits for subject lines in healthcare communication systems',
            background: 'Normal background',
            language: 'nl'
          }
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.template?.subject.length).toBeLessThan(200);
      });
    });

    describe('Scribe session integration', () => {
      test('should handle scribe session ID reference', async () => {
        const request = createValidRequest({
          scribeSessionId: 'session-123-456'
        });

        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });

  describe('GET /api/smartmail/generate', () => {
    test('should return API information and health status', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        service: 'Hysio SmartMail Generation API',
        version: '1.0.0',
        status: 'active',
        endpoints: {
          generate: 'POST /api/smartmail/generate',
          health: 'GET /api/smartmail/generate'
        },
        supportedLanguages: ['nl', 'en'],
        supportedRecipients: [
          'colleague',
          'specialist', 
          'patient',
          'family',
          'referring_physician',
          'support_staff'
        ],
        supportedObjectives: [
          'referral',
          'follow_up',
          'consultation_request',
          'patient_education',
          'treatment_update',
          'diagnostic_request',
          'discharge_summary',
          'colleague_inquiry',
          'red_flag_notification'
        ]
      });
    });
  });

  describe('Integration tests', () => {
    test('should handle complete workflow with multiple recipients', async () => {
      const recipients = [
        { category: 'patient', formality: 'empathetic', language: 'nl' },
        { category: 'specialist', formality: 'formal', language: 'nl' },
        { category: 'colleague', formality: 'professional', language: 'nl' }
      ] as const;

      for (const recipient of recipients) {
        const request = createValidRequest({ recipient });
        const response = await POST(createMockRequest(request));
        const data: EmailGenerationResponse = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.template?.metadata.recipientCategory).toBe(recipient.category);
      }
    });

    test('should handle workflow with error recovery', async () => {
      // First request fails
      mockGenerateContentWithOpenAI.mockRejectedValueOnce(
        new Error('Service temporarily unavailable')
      );

      const request = createValidRequest();
      const response = await POST(createMockRequest(request));
      const data: EmailGenerationResponse = await response.json();

      // Should succeed with fallback
      expect(data.success).toBe(true);
      expect(data.warnings?.[0]).toContain('cache');
    });
  });
});