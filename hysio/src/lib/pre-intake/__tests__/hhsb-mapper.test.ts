/**
 * Unit Tests for HHSB Mapper
 *
 * Tests conversion of pre-intake questionnaire data to HHSB structure:
 * - Hulpvraag (Help request) mapping
 * - Historie (History) mapping
 * - Stoornissen (Impairments) mapping
 * - Beperkingen (Limitations) mapping
 *
 * @module lib/pre-intake/__tests__/hhsb-mapper.test
 */

import { describe, it, expect } from '@jest/globals';
import { mapPreIntakeToHHSB } from '../hhsb-mapper';
import type { QuestionnaireData } from '@/types/pre-intake';

describe('HHSB Mapper', () => {
  describe('mapPreIntakeToHHSB', () => {
    it('should map complete questionnaire data to HHSB structure', () => {
      const questionnaireData: QuestionnaireData = {
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
          bodyRegions: ['lower-back', 'leg-left'],
          description: 'Pijn in onderrug die uitstraalt naar linker been',
          onset: 'Geleidelijk ontstaan na lang zitten op het werk',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 7,
        },
        goals: {
          treatmentGoals: 'Ik wil graag weer pijnvrij kunnen werken en sporten',
          thoughtsOnCause: 'Ik denk dat het komt door veel zitten',
          moodImpact: 'moderate',
          limitedActivities: 'Hardlopen, fietsen, lang zitten',
        },
        medicalHistory: {
          hasRecentSurgeries: false,
          takesMedication: false,
          smokingStatus: 'no',
          alcoholConsumption: 'sometimes',
        },
        functionalLimitations: {
          limitedActivityCategories: ['work', 'sports'],
          severityScores: {
            work: 6,
            sports: 8,
          },
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Check that all HHSB sections are present
      expect(result.hulpvraag).toBeDefined();
      expect(result.historie).toBeDefined();
      expect(result.stoornissen).toBeDefined();
      expect(result.beperkingen).toBeDefined();

      // Check Hulpvraag contains patient goals
      expect(result.hulpvraag).toContain('weer pijnvrij kunnen werken');
      expect(result.hulpvraag).toContain('sporten');

      // Check Historie contains complaint details
      expect(result.historie).toContain('onderrug');
      expect(result.historie).toContain('linker been');
      expect(result.historie).toContain('Geleidelijk ontstaan');

      // Check Stoornissen contains pain intensity and location
      expect(result.stoornissen).toContain('7/10');
      expect(result.stoornissen.toLowerCase()).toContain('onderrug');

      // Check Beperkingen contains functional limitations
      expect(result.beperkingen.toLowerCase()).toContain('werk');
      expect(result.beperkingen.toLowerCase()).toContain('sport');
    });

    it('should handle minimal data gracefully', () => {
      const questionnaireData: QuestionnaireData = {
        complaint: {
          bodyRegions: ['neck'],
          description: 'Nekpijn',
          onset: 'Onbekend',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '<1week',
          intensity: 5,
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Should still produce valid HHSB structure
      expect(result.hulpvraag).toBeDefined();
      expect(result.historie).toBeDefined();
      expect(result.stoornissen).toBeDefined();
      expect(result.beperkingen).toBeDefined();

      // Should contain at least basic complaint info
      expect(result.historie).toContain('Nekpijn');
    });

    it('should include LOFTIG framework elements in Historie', () => {
      const questionnaireData: QuestionnaireData = {
        complaint: {
          bodyRegions: ['shoulder-right'],
          description: 'Schouderpijn rechts',
          onset: 'Acuut na val',
          hasOccurredBefore: true,
          previousOccurrence: 'Vorig jaar ook gehad',
          frequency: 'constant',
          duration: '1-4weeks',
          intensity: 8,
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Check all LOFTIG elements
      expect(result.historie).toContain('schouder'); // Locatie
      expect(result.historie).toContain('Acuut na val'); // Ontstaan
      expect(result.historie).toContain('constant'); // Frequentie
      expect(result.historie).toContain('1-4weeks' || '1 tot 4 weken'); // Tijdsduur
      expect(result.stoornissen).toContain('8/10'); // Intensiteit
      expect(result.historie).toContain('eerder voorgekomen' || 'Vorig jaar'); // Geschiedenis
    });

    it('should include SCEGS elements in Hulpvraag', () => {
      const questionnaireData: QuestionnaireData = {
        goals: {
          treatmentGoals: 'Pijnvermindering en functioneel herstel',
          thoughtsOnCause: 'Overbelasting door sport',
          moodImpact: 'much',
          limitedActivities: 'Sporten en hobby\'s',
        },
        complaint: {
          bodyRegions: ['knee-left'],
          description: 'Kniepijn',
          onset: 'Geleidelijk',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 6,
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Somatisch - treatment goals
      expect(result.hulpvraag).toContain('Pijnvermindering');
      expect(result.hulpvraag).toContain('functioneel herstel');

      // Cognitief - thoughts on cause
      expect(result.hulpvraag || result.historie).toContain('Overbelasting door sport');

      // Emotioneel - mood impact should be mentioned
      expect(result.hulpvraag).toContain('veel' || 'much');

      // Gedragsmatig/Sociaal - limited activities
      expect(result.beperkingen).toContain('Sporten');
    });

    it('should map functional limitations to Beperkingen', () => {
      const questionnaireData: QuestionnaireData = {
        functionalLimitations: {
          limitedActivityCategories: ['work', 'household', 'sleeping'],
          severityScores: {
            work: 7,
            household: 5,
            sleeping: 9,
          },
        },
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Rugpijn',
          onset: 'Geleidelijk',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '>3months',
          intensity: 7,
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Should list all limited activities
      expect(result.beperkingen.toLowerCase()).toContain('werk');
      expect(result.beperkingen.toLowerCase()).toContain('huishouden');
      expect(result.beperkingen.toLowerCase()).toContain('slapen');

      // Should include severity indicators
      expect(result.beperkingen).toContain('7' || '7/10');
      expect(result.beperkingen).toContain('9' || '9/10');
    });

    it('should include medical history in Stoornissen when relevant', () => {
      const questionnaireData: QuestionnaireData = {
        medicalHistory: {
          hasRecentSurgeries: true,
          surgeryDetails: 'Knie operatie 3 maanden geleden',
          takesMedication: true,
          medications: ['Paracetamol', 'Ibuprofen'],
          otherConditions: 'Diabetes type 2',
          smokingStatus: 'yes',
          alcoholConsumption: 'regularly',
        },
        complaint: {
          bodyRegions: ['knee-right'],
          description: 'Post-operatieve klachten',
          onset: 'Na operatie',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 5,
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Medical history should be mentioned
      expect(result.historie || result.stoornissen).toContain('operatie');
      expect(result.stoornissen).toContain('medicatie' || 'Paracetamol');
      expect(result.stoornissen).toContain('Diabetes');
    });

    it('should format text professionally in Dutch B1 level', () => {
      const questionnaireData: QuestionnaireData = {
        complaint: {
          bodyRegions: ['lower-back'],
          description: 'Test klacht',
          onset: 'Test',
          hasOccurredBefore: false,
          frequency: 'daily',
          duration: '1-3months',
          intensity: 5,
        },
        goals: {
          treatmentGoals: 'Test doelen',
          thoughtsOnCause: 'Test oorzaak',
          moodImpact: 'moderate',
          limitedActivities: 'Test activiteiten',
        },
      };

      const result = mapPreIntakeToHHSB(questionnaireData);

      // Check for proper sentence structure
      expect(result.hulpvraag.length).toBeGreaterThan(10);
      expect(result.historie.length).toBeGreaterThan(10);
      expect(result.stoornissen.length).toBeGreaterThan(10);
      expect(result.beperkingen.length).toBeGreaterThan(10);

      // Check that text starts with capital letter
      expect(result.hulpvraag[0]).toMatch(/[A-Z]/);
      expect(result.historie[0]).toMatch(/[A-Z]/);
      expect(result.stoornissen[0]).toMatch(/[A-Z]/);
      expect(result.beperkingen[0]).toMatch(/[A-Z]/);
    });
  });
});