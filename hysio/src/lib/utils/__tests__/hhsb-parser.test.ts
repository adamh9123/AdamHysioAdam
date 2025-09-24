import { describe, it, expect } from 'vitest';
import { parseHHSBText, isHHSBComplete, getHHSBCompleteness, buildHHSBText, createEmptyHHSBStructure } from '../hhsb-parser';

describe('hhsb-parser utilities', () => {
  describe('parseHHSBText', () => {
    it('parses complete HHSB structure', () => {
      const fullText = `**H - Hulpvraag:**
Patient meldt pijn in rechter knie

**H - Historie:**
Begonnen na hardloopsessie vorige week

**S - Stoornissen:**
Beperkte flexie en zwelling mediaal

**B - Beperkingen:**
Kan niet meer dan 30 minuten lopen`;

      const result = parseHHSBText(fullText);

      expect(result).toBeTruthy();
      expect(result?.hulpvraag).toContain('pijn in rechter knie');
      expect(result?.historie).toContain('hardloopsessie');
      expect(result?.stoornissen).toContain('Beperkte flexie');
      expect(result?.beperkingen).toContain('30 minuten');
    });

    it('extracts red flags when present', () => {
      const fullText = `**H - Hulpvraag:**
Rugpijn

**Rode Vlagen:**
- Nachtelijke pijn
- Gewichtsverlies`;

      const result = parseHHSBText(fullText);

      expect(result?.redFlags).toHaveLength(2);
      expect(result?.redFlags).toContain('Nachtelijke pijn');
      expect(result?.redFlags).toContain('Gewichtsverlies');
    });

    it('handles missing sections gracefully', () => {
      const fullText = `**H - Hulpvraag:**
Kniepijn`;

      const result = parseHHSBText(fullText);

      expect(result?.hulpvraag).toContain('Kniepijn');
      expect(result?.historie).toBe('');
      expect(result?.stoornissen).toBe('');
      expect(result?.beperkingen).toBe('');
    });

    it('returns empty structure for invalid input with defaultToEmpty', () => {
      const result = parseHHSBText('', { defaultToEmpty: true });

      expect(result).toBeTruthy();
      expect(result?.hulpvraag).toBe('');
      expect(result?.redFlags).toEqual([]);
    });

    it('returns null for invalid input without defaultToEmpty', () => {
      const result = parseHHSBText('', { defaultToEmpty: false });

      expect(result).toBeNull();
    });

    it('extracts anamnesis summary when present', () => {
      const fullText = `**H - Hulpvraag:**
Test

**Samenvatting Anamnese:**
Dit is een samenvatting van de anamnese`;

      const result = parseHHSBText(fullText);

      expect(result?.anamneseSummary).toContain('samenvatting van de anamnese');
    });
  });

  describe('isHHSBComplete', () => {
    it('returns true for complete structure', () => {
      const structure = {
        hulpvraag: 'Test hulpvraag',
        historie: 'Test historie',
        stoornissen: 'Test stoornissen',
        beperkingen: 'Test beperkingen',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      expect(isHHSBComplete(structure)).toBe(true);
    });

    it('returns false when hulpvraag is missing', () => {
      const structure = {
        hulpvraag: '',
        historie: 'Test',
        stoornissen: 'Test',
        beperkingen: 'Test',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      expect(isHHSBComplete(structure)).toBe(false);
    });

    it('returns false when any required field is missing', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: 'Test',
        stoornissen: '',
        beperkingen: 'Test',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      expect(isHHSBComplete(structure)).toBe(false);
    });
  });

  describe('getHHSBCompleteness', () => {
    it('returns 100% for complete structure', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: 'Test',
        stoornissen: 'Test',
        beperkingen: 'Test',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      expect(getHHSBCompleteness(structure)).toBe(100);
    });

    it('returns 50% when half fields are filled', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: 'Test',
        stoornissen: '',
        beperkingen: '',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      expect(getHHSBCompleteness(structure)).toBe(50);
    });

    it('returns 0% for empty structure', () => {
      const structure = createEmptyHHSBStructure();

      expect(getHHSBCompleteness(structure)).toBe(0);
    });

    it('returns 25% when one field is filled', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: '',
        stoornissen: '',
        beperkingen: '',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      expect(getHHSBCompleteness(structure)).toBe(25);
    });
  });

  describe('buildHHSBText', () => {
    it('builds complete HHSB text from structure', () => {
      const structure = {
        hulpvraag: 'Kniepijn',
        historie: 'Ontstaan na sport',
        stoornissen: 'Zwelling',
        beperkingen: 'Kan niet hardlopen',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      const text = buildHHSBText(structure);

      expect(text).toContain('**H - Hulpvraag:**');
      expect(text).toContain('Kniepijn');
      expect(text).toContain('**H - Historie:**');
      expect(text).toContain('Ontstaan na sport');
      expect(text).toContain('**S - Stoornissen:**');
      expect(text).toContain('**B - Beperkingen:**');
    });

    it('includes red flags when present', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: 'Test',
        stoornissen: 'Test',
        beperkingen: 'Test',
        redFlags: ['Rode vlag 1', 'Rode vlag 2'],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      const text = buildHHSBText(structure);

      expect(text).toContain('**Rode Vlagen:**');
      expect(text).toContain('- Rode vlag 1');
      expect(text).toContain('- Rode vlag 2');
    });

    it('includes anamnesis summary when present', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: 'Test',
        stoornissen: 'Test',
        beperkingen: 'Test',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: 'Dit is de samenvatting',
      };

      const text = buildHHSBText(structure);

      expect(text).toContain('**Samenvatting Anamnese:**');
      expect(text).toContain('Dit is de samenvatting');
    });

    it('omits empty sections', () => {
      const structure = {
        hulpvraag: 'Test',
        historie: '',
        stoornissen: '',
        beperkingen: '',
        redFlags: [],
        fullStructuredText: '',
        anamneseSummary: '',
      };

      const text = buildHHSBText(structure);

      expect(text).toContain('**H - Hulpvraag:**');
      expect(text).not.toContain('**H - Historie:**');
      expect(text).not.toContain('**S - Stoornissen:**');
    });
  });

  describe('createEmptyHHSBStructure', () => {
    it('creates empty structure with all fields', () => {
      const structure = createEmptyHHSBStructure();

      expect(structure.hulpvraag).toBe('');
      expect(structure.historie).toBe('');
      expect(structure.stoornissen).toBe('');
      expect(structure.beperkingen).toBe('');
      expect(structure.redFlags).toEqual([]);
      expect(structure.fullStructuredText).toBe('');
      expect(structure.anamneseSummary).toBe('');
    });

    it('accepts optional fullText parameter', () => {
      const fullText = 'Test text';
      const structure = createEmptyHHSBStructure(fullText);

      expect(structure.fullStructuredText).toBe(fullText);
    });
  });
});