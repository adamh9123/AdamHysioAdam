// Integration tests for Hysio Diagnosecode module

import { validateDCSPHCode } from './code-validator';
import { DCSPHKnowledgeBase } from './dcsph-knowledge-base';
import { MedicalPatternMatcher } from './pattern-matcher';
import { AIIntegration } from './ai-integration';
import { conversationManager } from './conversation-manager';

describe('Hysio Diagnosecode Integration Tests', () => {
  beforeEach(() => {
    // Clean up any existing conversations
    jest.clearAllMocks();
  });

  describe('End-to-End Code Finding Flow', () => {
    test('should complete full flow from query to code suggestions', async () => {
      const query = 'pijn in de knie bij traplopen na overbelasting';

      // Test pattern matching
      const patternAnalysis = MedicalPatternMatcher.analyzeText(query);

      expect(patternAnalysis.locationMatches.length).toBeGreaterThan(0);
      expect(patternAnalysis.pathologyMatches.length).toBeGreaterThan(0);
      expect(patternAnalysis.overallConfidence).toBeGreaterThan(0.5);

      // Test knowledge base processing
      const kbResponse = DCSPHKnowledgeBase.processQuery({
        query,
        context: 'integration-test'
      });

      expect(kbResponse.suggestions.length).toBeGreaterThan(0);
      expect(kbResponse.confidence).toBeGreaterThan(0.5);

      // Validate suggested codes
      for (const suggestion of kbResponse.suggestions) {
        const validation = validateDCSPHCode(suggestion.code.code);
        expect(validation.isValid).toBe(true);
      }
    });

    test('should handle clarification flow correctly', async () => {
      const vagueQuery = 'pijn';

      // Process vague query
      const response = await AIIntegration.processQuery({ query: vagueQuery });

      // Should ask for clarification
      expect(response.needsClarification).toBe(true);
      expect(response.clarifyingQuestion).toBeDefined();
      expect(response.suggestions).toHaveLength(0);

      // Process clarification response
      if (response.conversationId) {
        const clarificationResponse = await AIIntegration.processClarificationResponse(
          response.conversationId,
          'pijn in de knie'
        );

        // Should now provide suggestions
        expect(clarificationResponse.needsClarification).toBe(false);
        expect(clarificationResponse.suggestions.length).toBeGreaterThan(0);
      }
    });

    test('should maintain conversation state correctly', async () => {
      const initialQuery = 'rugpijn';

      // Start conversation
      const response1 = await AIIntegration.processQuery({ query: initialQuery });
      expect(response1.conversationId).toBeDefined();

      const conversationId = response1.conversationId;

      // Check conversation state
      const conversation = conversationManager.getConversation(conversationId);
      expect(conversation).not.toBeNull();
      expect(conversation?.messages.length).toBeGreaterThan(0);
      expect(conversation?.originalQuery).toBe(initialQuery);

      // Continue conversation
      const response2 = await AIIntegration.processQuery({
        query: 'uitstraling naar been',
        conversationId
      });

      expect(response2.conversationId).toBe(conversationId);

      // Verify conversation updated
      const updatedConversation = conversationManager.getConversation(conversationId);
      expect(updatedConversation?.messages.length).toBeGreaterThan(conversation?.messages.length || 0);
    });
  });

  describe('Pattern Recognition Integration', () => {
    test('should recognize knee-related patterns correctly', () => {
      const queries = [
        'kniepijn bij traplopen',
        'pijn voorzijde knie na sport',
        'zwelling kniegewricht',
        'patellaire tendinitis'
      ];

      for (const query of queries) {
        const analysis = MedicalPatternMatcher.analyzeText(query);

        // Should identify knee location
        const hasKneeMatch = analysis.locationMatches.some(match =>
          match.term.includes('knie') || match.matchedText.includes('knie')
        );
        expect(hasKneeMatch).toBe(true);

        // Should have reasonable confidence
        expect(analysis.overallConfidence).toBeGreaterThan(0.3);
      }
    });

    test('should recognize spine-related patterns correctly', () => {
      const queries = [
        'lage rugpijn met uitstraling',
        'cervicale klachten',
        'lumbale hernia',
        'thoracale wervelkolom pijn'
      ];

      for (const query of queries) {
        const analysis = MedicalPatternMatcher.analyzeText(query);

        // Should identify spine location
        const hasSpineMatch = analysis.locationMatches.some(match =>
          ['rug', 'wervelkolom', 'cervicaal', 'lumbaal', 'thoracaal'].some(term =>
            match.term.includes(term) || match.matchedText.includes(term)
          )
        );
        expect(hasSpineMatch).toBe(true);
      }
    });

    test('should handle complex medical terminology', () => {
      const medicalQuery = 'anterieure kniepijn met patellofemoraal syndroom en quadriceps tendinopathie';

      const analysis = MedicalPatternMatcher.analyzeText(medicalQuery);

      expect(analysis.locationMatches.length).toBeGreaterThan(0);
      expect(analysis.pathologyMatches.length).toBeGreaterThan(0);
      expect(analysis.symptomMatches.length).toBeGreaterThan(0);
      expect(analysis.overallConfidence).toBeGreaterThan(0.7);
    });
  });

  describe('Knowledge Base Integration', () => {
    test('should generate appropriate codes for common conditions', () => {
      const testCases = [
        {
          query: 'knie tendinitis',
          expectedLocationCode: '79',
          expectedPathologyCode: '20'
        },
        {
          query: 'lumbale hernia',
          expectedLocationCode: '34',
          expectedPathologyCode: '27'
        },
        {
          query: 'schouder bursitis',
          expectedLocationCode: '21',
          expectedPathologyCode: '21'
        }
      ];

      for (const testCase of testCases) {
        const response = DCSPHKnowledgeBase.processQuery({
          query: testCase.query
        });

        expect(response.suggestions.length).toBeGreaterThan(0);

        // Check if expected codes are present
        const hasExpectedCode = response.suggestions.some(suggestion => {
          const code = suggestion.code.code;
          return code.startsWith(testCase.expectedLocationCode) ||
                 code.endsWith(testCase.expectedPathologyCode);
        });

        expect(hasExpectedCode).toBe(true);
      }
    });

    test('should provide fallback suggestions for unclear queries', () => {
      const unclearQueries = [
        'pijn',
        'klacht',
        'probleem'
      ];

      for (const query of unclearQueries) {
        const response = DCSPHKnowledgeBase.processQuery({ query });

        // Should ask for clarification
        expect(response.needsClarification).toBe(true);
        expect(response.clarifyingQuestion).toBeDefined();
      }
    });
  });

  describe('Code Validation Integration', () => {
    test('should validate all suggested codes', async () => {
      const queries = [
        'kniepijn bij belasting',
        'cervicale hoofdpijn',
        'lumbale uitstraling',
        'schouder impingement'
      ];

      for (const query of queries) {
        const response = DCSPHKnowledgeBase.processQuery({ query });

        for (const suggestion of response.suggestions) {
          const validation = validateDCSPHCode(suggestion.code.code);
          expect(validation.isValid).toBe(true);
          expect(validation.suggestions).toBeDefined();
        }
      }
    });

    test('should reject invalid code combinations', () => {
      const invalidCodes = [
        '9999', // Non-existent location and pathology
        '7999', // Valid location, invalid pathology
        '9920', // Invalid location, valid pathology
        '0000'  // All zeros
      ];

      for (const code of invalidCodes) {
        const validation = validateDCSPHCode(code);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBeDefined();
      }
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle malformed queries gracefully', async () => {
      const malformedQueries = [
        '',
        '   ',
        'a',
        'ab',
        'x'.repeat(1001) // Too long
      ];

      for (const query of malformedQueries) {
        try {
          await AIIntegration.processQuery({ query });
        } catch (error: any) {
          expect(error.type).toBeDefined();
          expect(error.recoverable).toBeDefined();
        }
      }
    });

    test('should provide helpful suggestions for errors', async () => {
      try {
        await AIIntegration.processQuery({ query: 'ab' }); // Too short
      } catch (error: any) {
        expect(error.suggestions).toBeDefined();
        expect(error.suggestions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance Integration', () => {
    test('should process queries within acceptable time limits', async () => {
      const query = 'kniepijn bij traplopen na overbelasting';
      const startTime = Date.now();

      const response = await AIIntegration.processQuery({ query });

      const processingTime = Date.now() - startTime;

      // Should complete within 5 seconds (generous for testing)
      expect(processingTime).toBeLessThan(5000);
      expect(response.success).toBe(true);
    });

    test('should handle multiple concurrent requests', async () => {
      const queries = [
        'kniepijn',
        'rugpijn',
        'nekpijn',
        'schouderpijn',
        'enkelpijn'
      ];

      const promises = queries.map(query =>
        AIIntegration.processQuery({ query })
      );

      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.success).toBe(true);
      });

      // Should not take too long (concurrent processing)
      expect(totalTime).toBeLessThan(10000);
    });
  });

  describe('Data Consistency Integration', () => {
    test('should maintain consistency between knowledge base and validation', () => {
      const kbStats = DCSPHKnowledgeBase.getKnowledgeBaseStats();

      expect(kbStats.totalLocations).toBeGreaterThan(0);
      expect(kbStats.totalPathologies).toBeGreaterThan(0);
      expect(kbStats.validCombinations).toBeGreaterThan(0);
      expect(kbStats.coverage).toBeGreaterThan(50); // At least 50% coverage
    });

    test('should search by description correctly', () => {
      const searchTerms = [
        'knie',
        'tendinitis',
        'fractuur',
        'wervelkolom'
      ];

      for (const term of searchTerms) {
        const results = DCSPHKnowledgeBase.searchByDescription(term);
        expect(results.length).toBeGreaterThan(0);

        // Verify all results contain the search term
        results.forEach(result => {
          expect(result.fullDescription.toLowerCase()).toContain(term.toLowerCase());
        });
      }
    });
  });

  describe('Health Check Integration', () => {
    test('should report system health correctly', async () => {
      const healthCheck = await AIIntegration.healthCheck();

      expect(healthCheck.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthCheck.status);
      expect(healthCheck.details).toBeDefined();
    });

    test('should provide conversation manager statistics', () => {
      const stats = conversationManager.getStats();

      expect(stats.totalConversations).toBeDefined();
      expect(stats.activeConversations).toBeDefined();
      expect(stats.completedConversations).toBeDefined();
      expect(stats.averageMessages).toBeDefined();
      expect(stats.averageClarifications).toBeDefined();
    });
  });
});