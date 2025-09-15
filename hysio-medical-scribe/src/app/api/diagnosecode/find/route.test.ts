// Unit tests for DCSPH Code Finding API

import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock the AI integration
jest.mock('@/lib/diagnosecode/ai-integration', () => ({
  AIIntegration: {
    processQuery: jest.fn(),
    healthCheck: jest.fn()
  }
}));

import { AIIntegration } from '@/lib/diagnosecode/ai-integration';

describe('/api/diagnosecode/find', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    test('should handle valid query successfully', async () => {
      // Mock successful AI response
      (AIIntegration.processQuery as jest.Mock).mockResolvedValue({
        success: true,
        suggestions: [
          {
            code: '7920',
            name: 'Epicondylitis/tendinitis/tendovaginitis – knie/onderbeen/voet',
            rationale: 'Test rationale',
            confidence: 0.85
          }
        ],
        needsClarification: false,
        conversationId: 'test-conversation-id'
      });

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 'pijn in de knie bij traplopen'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.suggestions).toHaveLength(1);
      expect(data.suggestions[0].code).toBe('7920');
      expect(data.conversationId).toBe('test-conversation-id');
    });

    test('should handle clarification needed', async () => {
      (AIIntegration.processQuery as jest.Mock).mockResolvedValue({
        success: true,
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: 'In welke lichaamsregio bevinden de klachten zich?',
        conversationId: 'test-conversation-id'
      });

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 'pijn'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.needsClarification).toBe(true);
      expect(data.clarifyingQuestion).toContain('lichaamsregio');
      expect(data.suggestions).toHaveLength(0);
    });

    test('should reject empty query', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: ''
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });

    test('should reject missing query', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    test('should reject non-string query', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 123
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    test('should handle too short query', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 'ab'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.suggestions).toContain('Beschrijf de klacht in meer detail');
    });

    test('should handle too long query', async () => {
      const longQuery = 'a'.repeat(1001);

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: longQuery
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    test('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.type).toBe('VALIDATION_ERROR');
    });

    test('should handle AI integration errors', async () => {
      (AIIntegration.processQuery as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test query'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    test('should handle conversation continuation', async () => {
      (AIIntegration.processQuery as jest.Mock).mockResolvedValue({
        success: true,
        suggestions: [
          {
            code: '3427',
            name: 'HNP – lumbale wervelkolom',
            rationale: 'Rugpijn met uitstraling past bij HNP',
            confidence: 0.9
          }
        ],
        needsClarification: false,
        conversationId: 'existing-conversation'
      });

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 'uitstraling naar been',
          conversationId: 'existing-conversation'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.conversationId).toBe('existing-conversation');
      expect(AIIntegration.processQuery).toHaveBeenCalledWith({
        query: 'uitstraling naar been',
        conversationId: 'existing-conversation',
        context: undefined
      });
    });

    test('should reject suspicious content', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: '<script>alert("xss")</script>'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.suggestions).toContain('Gebruik alleen normale tekst zonder code');
    });
  });

  describe('GET', () => {
    test('should return health check when healthy', async () => {
      (AIIntegration.healthCheck as jest.Mock).mockResolvedValue({
        status: 'healthy',
        details: {
          aiIntegration: true,
          fallbackAvailable: true
        }
      });

      const request = new NextRequest('http://localhost/api/diagnosecode/find');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.endpoint).toBe('/api/diagnosecode/find');
      expect(data.details).toBeDefined();
    });

    test('should return unhealthy status when AI fails', async () => {
      (AIIntegration.healthCheck as jest.Mock).mockResolvedValue({
        status: 'unhealthy',
        details: {
          aiIntegration: false,
          error: 'AI service down'
        }
      });

      const request = new NextRequest('http://localhost/api/diagnosecode/find');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('unhealthy');
    });

    test('should handle health check errors', async () => {
      (AIIntegration.healthCheck as jest.Mock).mockRejectedValue(new Error('Health check failed'));

      const request = new NextRequest('http://localhost/api/diagnosecode/find');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('unhealthy');
      expect(data.error).toBe('Health check failed');
    });
  });

  describe('Edge cases and security', () => {
    test('should handle request without body', async () => {
      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });

    test('should handle very large valid query', async () => {
      (AIIntegration.processQuery as jest.Mock).mockResolvedValue({
        success: true,
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: 'Kunt u de klacht samenvatten?',
        conversationId: 'test'
      });

      const largeValidQuery = 'Patiënt heeft last van kniepijn die ontstaan is na het sporten. ' +
        'De pijn is vooral aanwezig bij traplopen en hurken. '.repeat(10); // About 600 chars

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: largeValidQuery
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test('should include metadata in response', async () => {
      (AIIntegration.processQuery as jest.Mock).mockResolvedValue({
        success: true,
        suggestions: [{ code: '7920', name: 'Test', rationale: 'Test', confidence: 0.8 }],
        needsClarification: false,
        conversationId: 'test'
      });

      const request = new NextRequest('http://localhost/api/diagnosecode/find', {
        method: 'POST',
        body: JSON.stringify({
          query: 'test query'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.metadata).toBeDefined();
      expect(data.metadata.processedAt).toBeDefined();
      expect(data.metadata.suggestionCount).toBe(1);
    });
  });
});

describe('API Integration Tests', () => {
  // These would be integration tests that test the full pipeline
  // In a real implementation, you might use a test database or mock services

  test('should integrate with conversation manager', async () => {
    // Test that would verify conversation state is properly maintained
    // across multiple API calls
  });

  test('should integrate with error logging', async () => {
    // Test that would verify errors are properly logged and monitored
  });

  test('should handle rate limiting', async () => {
    // Test that would verify rate limiting is applied correctly
  });
});