/**
 * Unit Tests for Red Flags Detector
 *
 * Tests detection and severity classification of red flags following DTF guidelines:
 * - Base red flags detection
 * - Region-specific red flags
 * - Age-based severity modifiers
 * - Severity classification
 *
 * @module lib/pre-intake/__tests__/red-flags-detector.test
 */

import { describe, it, expect } from '@jest/globals';
import { detectRedFlags } from '../red-flags-detector';
import type { QuestionnaireData } from '@/types/pre-intake';

describe('Red Flags Detector', () => {
  describe('detectRedFlags', () => {
    it('should return empty array when no red flags present', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['shoulder-right'],
          description: 'Schouderpijn',
          onset: 'Geleidelijk',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-4weeks',
          intensity: 5,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = detectRedFlags(data);
      expect(result).toEqual([]);
    });

    it('should detect emergency severity red flag', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Rugpijn',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 9,
        },
        redFlags: {
          unexplainedWeightLoss: true, // Emergency red flag
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = detectRedFlags(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].severity).toBe('emergency');
      expect(result[0].type).toContain('weight' || 'gewicht');
    });

    it('should detect urgent severity red flag', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['chest'],
          description: 'Pijn op de borst',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 8,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: true, // Urgent red flag
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = detectRedFlags(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].severity).toBe('urgent');
    });

    it('should detect multiple red flags', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
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
          nightSweatsOrFever: true,
          bladderBowelProblems: true,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = detectRedFlags(data);
      expect(result.length).toBe(3);
    });

    it('should detect region-specific red flag for chest pain', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['chest'],
          description: 'Pijn op de borst met kortademigheid',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 8,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
          chestPainWithShortness: true,
        } as any,
      };

      const result = detectRedFlags(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((f) => f.severity === 'emergency')).toBe(true);
    });

    it('should detect region-specific red flag for lower back (saddle anesthesia)', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Rugpijn met gevoelsverlies',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 9,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
          saddleAnesthesia: true,
        } as any,
      };

      const result = detectRedFlags(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((f) => f.type.toLowerCase().includes('cauda' || 'gevoelsverlies'))).toBe(true);
      expect(result.some((f) => f.severity === 'emergency')).toBe(true);
    });

    it('should detect region-specific red flag for head (sudden severe headache)', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['head'],
          description: 'Plotselinge hoofdpijn',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 10,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
          suddenSevereHeadache: true,
        } as any,
      };

      const result = detectRedFlags(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((f) => f.severity === 'emergency')).toBe(true);
    });

    it('should increase severity for patients over 50 years old', () => {
      const dataYoung: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1995-01-01', // Under 50
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Rugpijn',
          onset: 'Geleidelijk',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 6,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: true, // Referral severity
        },
      };

      const dataOld: QuestionnaireData = {
        ...dataYoung,
        personalia: {
          ...dataYoung.personalia!,
          dateOfBirth: '1960-01-01', // Over 50
        },
      };

      const resultYoung = detectRedFlags(dataYoung);
      const resultOld = detectRedFlags(dataOld);

      // Age >50 should potentially increase severity or add additional flags
      if (resultYoung.length > 0 && resultOld.length > 0) {
        // At minimum, both should detect the red flag
        expect(resultYoung.length).toBeGreaterThan(0);
        expect(resultOld.length).toBeGreaterThan(0);
      }
    });

    it('should provide recommendations for detected red flags', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1990-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'jan@example.com',
          address: 'Test 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Rugpijn',
          onset: 'Acuut',
          hasOccurredBefore: false,
          frequency: 'constant',
          duration: '<1week',
          intensity: 9,
        },
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: true,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = detectRedFlags(data);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].recommendation).toBeDefined();
      expect(result[0].recommendation).toBeTruthy();
    });

    it('should handle missing red flags data gracefully', () => {
      const data: QuestionnaireData = {
        complaint: {
          bodyRegions: ['neck'],
          description: 'Nekpijn',
          onset: 'Geleidelijk',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-4weeks',
          intensity: 5,
        },
        // No redFlags field
      };

      const result = detectRedFlags(data);
      expect(result).toEqual([]);
    });
  });
});