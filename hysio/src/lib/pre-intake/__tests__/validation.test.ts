/**
 * Unit Tests for Pre-intake Validation Schemas
 *
 * Tests validation logic for all questionnaire steps:
 * - Personalia validation
 * - Complaint validation (LOFTIG)
 * - Red flags validation
 * - Medical history validation
 * - Goals validation (SCEGS)
 * - Functional limitations validation
 *
 * @module lib/pre-intake/__tests__/validation.test
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateStep,
  validatePersonalia,
  validateComplaint,
  validateRedFlags,
  validateMedicalHistory,
  validateGoals,
  validateFunctionalLimitations,
} from '../validation';
import type { QuestionnaireData } from '@/types/pre-intake';

describe('Pre-intake Validation', () => {
  describe('validatePersonalia', () => {
    it('should pass with valid personalia data', () => {
      const data: QuestionnaireData = {
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

      const result = validatePersonalia(data.personalia!);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with missing required fields', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'man',
          phone: '',
          email: '',
          address: '',
          postalCode: '',
          city: '',
        },
      };

      const result = validatePersonalia(data.personalia!);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid email format', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1980-01-01',
          gender: 'man',
          phone: '0612345678',
          email: 'invalid-email',
          address: 'Teststraat 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
      };

      const result = validatePersonalia(data.personalia!);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Voer een geldig e-mailadres in');
    });

    it('should fail with invalid phone format', () => {
      const data: QuestionnaireData = {
        personalia: {
          firstName: 'Jan',
          lastName: 'Jansen',
          dateOfBirth: '1980-01-01',
          gender: 'man',
          phone: '123', // Too short
          email: 'jan@example.com',
          address: 'Teststraat 1',
          postalCode: '1234AB',
          city: 'Amsterdam',
        },
      };

      const result = validatePersonalia(data.personalia!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('telefoonnummer'))).toBe(true);
    });
  });

  describe('validateComplaint', () => {
    it('should pass with valid complaint data (LOFTIG)', () => {
      const data: QuestionnaireData = {
        complaint: {
          bodyRegions: ['lower-back', 'leg-left'],
          description: 'Pijn in onderrug die uitstraalt naar linker been',
          onset: 'Geleidelijk ontstaan na lang zitten',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 7,
        },
      };

      const result = validateComplaint(data.complaint!);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with no body regions selected', () => {
      const data: QuestionnaireData = {
        complaint: {
          bodyRegions: [],
          description: 'Test description',
          onset: 'Test onset',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 5,
        },
      };

      const result = validateComplaint(data.complaint!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('locatie'))).toBe(true);
    });

    it('should fail with description too short', () => {
      const data: QuestionnaireData = {
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Pijn', // Too short
          onset: 'Test onset',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 5,
        },
      };

      const result = validateComplaint(data.complaint!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('beschrijving'))).toBe(true);
    });

    it('should fail with invalid intensity', () => {
      const data: QuestionnaireData = {
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Valid description here',
          onset: 'Test onset',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 15, // Out of range
        },
      };

      const result = validateComplaint(data.complaint!);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateRedFlags', () => {
    it('should pass with all red flags answered', () => {
      const data: QuestionnaireData = {
        redFlags: {
          unexplainedWeightLoss: false,
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = validateRedFlags(data.redFlags!);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with unanswered red flags', () => {
      const data: QuestionnaireData = {
        redFlags: {
          unexplainedWeightLoss: false,
          // Missing other required fields
        } as any,
      };

      const result = validateRedFlags(data.redFlags!);
      expect(result.isValid).toBe(false);
    });

    it('should pass even when red flags are positive', () => {
      const data: QuestionnaireData = {
        redFlags: {
          unexplainedWeightLoss: true, // Positive red flag
          nightSweatsOrFever: false,
          bladderBowelProblems: false,
          feelingVeryIll: false,
          painNotDecreasingWithRest: false,
        },
      };

      const result = validateRedFlags(data.redFlags!);
      expect(result.isValid).toBe(true); // Valid as long as answered
    });
  });

  describe('validateMedicalHistory', () => {
    it('should pass with valid medical history', () => {
      const data: QuestionnaireData = {
        medicalHistory: {
          hasRecentSurgeries: false,
          takesMedication: true,
          medications: ['Paracetamol', 'Ibuprofen'],
          smokingStatus: 'no',
          alcoholConsumption: 'sometimes',
        },
      };

      const result = validateMedicalHistory(data.medicalHistory!);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require surgery details when hasRecentSurgeries is true', () => {
      const data: QuestionnaireData = {
        medicalHistory: {
          hasRecentSurgeries: true,
          surgeryDetails: '', // Empty details
          takesMedication: false,
          smokingStatus: 'no',
          alcoholConsumption: 'never',
        },
      };

      const result = validateMedicalHistory(data.medicalHistory!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('operatie'))).toBe(true);
    });

    it('should require medications when takesMedication is true', () => {
      const data: QuestionnaireData = {
        medicalHistory: {
          hasRecentSurgeries: false,
          takesMedication: true,
          medications: [], // Empty medications list
          smokingStatus: 'no',
          alcoholConsumption: 'never',
        },
      };

      const result = validateMedicalHistory(data.medicalHistory!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('medicijn'))).toBe(true);
    });
  });

  describe('validateGoals (SCEGS)', () => {
    it('should pass with valid goals data', () => {
      const data: QuestionnaireData = {
        goals: {
          treatmentGoals:
            'Ik wil graag weer pijnvrij kunnen hardlopen en mijn werk kunnen doen',
          thoughtsOnCause: 'Ik denk dat het komt door veel zitten',
          moodImpact: 'moderate',
          limitedActivities: 'Hardlopen, fietsen, lange wandelingen',
        },
      };

      const result = validateGoals(data.goals!);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with too short treatment goals', () => {
      const data: QuestionnaireData = {
        goals: {
          treatmentGoals: 'Beter', // Too short
          thoughtsOnCause: 'Test',
          moodImpact: 'moderate',
          limitedActivities: 'Test',
        },
      };

      const result = validateGoals(data.goals!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('behandeldoel'))).toBe(true);
    });

    it('should require mood impact selection', () => {
      const data: QuestionnaireData = {
        goals: {
          treatmentGoals: 'Valid treatment goals here',
          thoughtsOnCause: 'Valid thoughts',
          moodImpact: '' as any, // Missing
          limitedActivities: 'Valid activities',
        },
      };

      const result = validateGoals(data.goals!);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateFunctionalLimitations', () => {
    it('should pass with valid functional limitations', () => {
      const data: QuestionnaireData = {
        functionalLimitations: {
          limitedActivityCategories: ['work', 'sports'],
          severityScores: {
            work: 6,
            sports: 8,
          },
        },
      };

      const result = validateFunctionalLimitations(data.functionalLimitations!);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with no activities selected', () => {
      const data: QuestionnaireData = {
        functionalLimitations: {
          limitedActivityCategories: [],
          severityScores: {},
        },
      };

      const result = validateFunctionalLimitations(data.functionalLimitations!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('activiteit'))).toBe(true);
    });

    it('should fail with missing severity scores', () => {
      const data: QuestionnaireData = {
        functionalLimitations: {
          limitedActivityCategories: ['work', 'sports'],
          severityScores: {
            work: 6,
            // Missing 'sports' severity
          },
        },
      };

      const result = validateFunctionalLimitations(data.functionalLimitations!);
      expect(result.isValid).toBe(false);
    });

    it('should require custom activity when "other" is selected', () => {
      const data: QuestionnaireData = {
        functionalLimitations: {
          limitedActivityCategories: ['other'],
          severityScores: {
            other: 5,
          },
          customActivity: '', // Empty
        },
      };

      const result = validateFunctionalLimitations(data.functionalLimitations!);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('andere activiteit'))).toBe(true);
    });
  });

  describe('validateStep', () => {
    it('should validate welcome step (always valid)', () => {
      const data: QuestionnaireData = {};
      const result = validateStep('welcome', data);
      expect(result.isValid).toBe(true);
    });

    it('should validate review step (always valid)', () => {
      const data: QuestionnaireData = {};
      const result = validateStep('review', data);
      expect(result.isValid).toBe(true);
    });

    it('should route to correct validator based on step', () => {
      const validData: QuestionnaireData = {
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

      const result = validateStep('personalia', validData);
      expect(result.isValid).toBe(true);
    });
  });
});