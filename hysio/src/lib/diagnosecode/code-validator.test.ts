// Unit tests for DCSPH Code Validator

import {
  validateDCSPHCode,
  validateMultipleCodes,
  findLocationsByKeywords,
  findPathologiesByKeywords,
  generateCodeSuggestions,
  generateRationale,
  isLogicalCombination,
  getValidCombinationsForLocation,
  getValidCombinationsForPathology
} from './code-validator';

import {
  LOCATION_CODES,
  PATHOLOGY_CODES,
  getLocationByCode,
  getPathologyByCode
} from './dcsph-tables';

describe('validateDCSPHCode', () => {
  test('should validate correct 4-digit codes', () => {
    const result = validateDCSPHCode('7920'); // Knie tendinitis
    expect(result.isValid).toBe(true);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions![0].code).toBe('7920');
  });

  test('should reject codes with wrong length', () => {
    const result = validateDCSPHCode('123');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('4 cijfers');
  });

  test('should reject non-numeric codes', () => {
    const result = validateDCSPHCode('abcd');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('cijfers bevatten');
  });

  test('should reject codes with invalid location', () => {
    const result = validateDCSPHCode('9920'); // Invalid location 99
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Locatiecode 99 bestaat niet');
  });

  test('should reject codes with invalid pathology', () => {
    const result = validateDCSPHCode('7999'); // Invalid pathology 99
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Pathologiecode 99 bestaat niet');
  });

  test('should handle null and undefined input', () => {
    expect(validateDCSPHCode(null as any).isValid).toBe(false);
    expect(validateDCSPHCode(undefined as any).isValid).toBe(false);
  });
});

describe('validateMultipleCodes', () => {
  test('should validate multiple codes correctly', () => {
    const codes = ['7920', '7921', '9999']; // 2 valid, 1 invalid
    const results = validateMultipleCodes(codes);

    expect(results['7920'].isValid).toBe(true);
    expect(results['7921'].isValid).toBe(true);
    expect(results['9999'].isValid).toBe(false);
  });

  test('should handle empty array', () => {
    const results = validateMultipleCodes([]);
    expect(Object.keys(results)).toHaveLength(0);
  });
});

describe('findLocationsByKeywords', () => {
  test('should find knee-related locations', () => {
    const results = findLocationsByKeywords(['knie', 'onderbeen']);
    expect(results.length).toBeGreaterThan(0);

    // Should find location 79 (Knie/Onderbeen/Voet)
    const knieLocation = results.find(loc => loc.code === '79');
    expect(knieLocation).toBeDefined();
  });

  test('should find spine-related locations', () => {
    const results = findLocationsByKeywords(['wervelkolom', 'lumbaal']);
    expect(results.length).toBeGreaterThan(0);

    // Should find location 34 (Lumbale wervelkolom)
    const lumbalLocation = results.find(loc => loc.code === '34');
    expect(lumbalLocation).toBeDefined();
  });

  test('should handle case insensitive search', () => {
    const results1 = findLocationsByKeywords(['KNIE']);
    const results2 = findLocationsByKeywords(['knie']);

    expect(results1).toEqual(results2);
  });

  test('should return empty array for non-matching keywords', () => {
    const results = findLocationsByKeywords(['xyz', 'nonexistent']);
    expect(results).toHaveLength(0);
  });
});

describe('findPathologiesByKeywords', () => {
  test('should find tendinitis pathologies', () => {
    const results = findPathologiesByKeywords(['tendinitis', 'ontsteking']);
    expect(results.length).toBeGreaterThan(0);

    // Should find pathology 20 (Epicondylitis/tendinitis/tendovaginitis)
    const tendinitis = results.find(path => path.code === '20');
    expect(tendinitis).toBeDefined();
  });

  test('should find fracture pathologies', () => {
    const results = findPathologiesByKeywords(['fractuur', 'breuk']);
    expect(results.length).toBeGreaterThan(0);

    // Should find pathology 36 (Fracturen)
    const fracture = results.find(path => path.code === '36');
    expect(fracture).toBeDefined();
  });

  test('should rank results by relevance', () => {
    const results = findPathologiesByKeywords(['tendinitis']);

    // First result should be the most relevant (exact match)
    expect(results[0].description.toLowerCase()).toContain('tendinitis');
  });
});

describe('generateCodeSuggestions', () => {
  test('should generate valid code suggestions', () => {
    const locations = [getLocationByCode('79')!]; // Knie
    const pathologies = [getPathologyByCode('20')!]; // Tendinitis

    const suggestions = generateCodeSuggestions(locations, pathologies, 3);

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].code.code).toBe('7920');
    expect(suggestions[0].confidence).toBeGreaterThan(0);
    expect(suggestions[0].rationale).toContain('tendinitis');
  });

  test('should limit suggestions to maxSuggestions', () => {
    const locations = LOCATION_CODES.slice(0, 5);
    const pathologies = PATHOLOGY_CODES.slice(0, 5);

    const suggestions = generateCodeSuggestions(locations, pathologies, 3);

    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  test('should sort suggestions by confidence', () => {
    const locations = LOCATION_CODES.slice(0, 3);
    const pathologies = PATHOLOGY_CODES.slice(0, 3);

    const suggestions = generateCodeSuggestions(locations, pathologies, 5);

    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i].confidence).toBeLessThanOrEqual(suggestions[i-1].confidence);
    }
  });
});

describe('generateRationale', () => {
  test('should generate basic rationale', () => {
    const location = getLocationByCode('79')!; // Knie
    const pathology = getPathologyByCode('20')!; // Tendinitis

    const rationale = generateRationale(location, pathology);

    expect(rationale).toContain('tendinitis');
    expect(rationale).toContain('knie');
    expect(rationale.length).toBeGreaterThan(10);
  });

  test('should generate specific rationale for knee tendinitis', () => {
    const location = getLocationByCode('79')!; // Knie
    const pathology = getPathologyByCode('20')!; // Tendinitis

    const rationale = generateRationale(location, pathology);

    expect(rationale).toContain('pees');
    expect(rationale).toContain('knie');
  });

  test('should generate specific rationale for fractures', () => {
    const location = getLocationByCode('34')!; // Lumbale wervelkolom
    const pathology = getPathologyByCode('36')!; // Fracturen

    const rationale = generateRationale(location, pathology);

    expect(rationale).toContain('Fracturen');
    expect(rationale).toContain('trauma');
  });
});

describe('isLogicalCombination', () => {
  test('should approve logical combinations', () => {
    // Knee tendinitis - logical
    expect(isLogicalCombination('79', '20')).toBe(true);

    // Spine HNP - logical
    expect(isLogicalCombination('34', '75')).toBe(true);
  });

  test('should reject illogical combinations', () => {
    // Heart condition on limb - illogical
    expect(isLogicalCombination('79', '41')).toBe(false);

    // Fracture in soft tissue only region - questionable
    expect(isLogicalCombination('13', '36')).toBe(false);
  });

  test('should handle invalid codes gracefully', () => {
    expect(isLogicalCombination('99', '20')).toBe(false);
    expect(isLogicalCombination('79', '99')).toBe(false);
  });
});

describe('getValidCombinationsForLocation', () => {
  test('should return valid combinations for knee', () => {
    const combinations = getValidCombinationsForLocation('79');

    expect(combinations.length).toBeGreaterThan(0);
    expect(combinations.every(combo => combo.locationCode === '79')).toBe(true);
    expect(combinations.some(combo => combo.pathologyCode === '20')).toBe(true); // Tendinitis
  });

  test('should filter out illogical combinations', () => {
    const combinations = getValidCombinationsForLocation('79');

    // Shouldn't include heart conditions
    expect(combinations.some(combo => combo.pathologyCode === '41')).toBe(false);
  });

  test('should return empty array for invalid location', () => {
    const combinations = getValidCombinationsForLocation('99');
    expect(combinations).toHaveLength(0);
  });
});

describe('getValidCombinationsForPathology', () => {
  test('should return valid combinations for tendinitis', () => {
    const combinations = getValidCombinationsForPathology('20');

    expect(combinations.length).toBeGreaterThan(0);
    expect(combinations.every(combo => combo.pathologyCode === '20')).toBe(true);
    expect(combinations.some(combo => combo.locationCode === '79')).toBe(true); // Knee
  });

  test('should return valid combinations for fractures', () => {
    const combinations = getValidCombinationsForPathology('36');

    expect(combinations.length).toBeGreaterThan(0);
    expect(combinations.every(combo => combo.pathologyCode === '36')).toBe(true);

    // Should not include soft tissue only locations
    expect(combinations.some(combo => combo.locationCode === '13')).toBe(false);
  });

  test('should return empty array for invalid pathology', () => {
    const combinations = getValidCombinationsForPathology('99');
    expect(combinations).toHaveLength(0);
  });
});

describe('Edge cases and error handling', () => {
  test('should handle empty keyword arrays', () => {
    expect(findLocationsByKeywords([])).toHaveLength(0);
    expect(findPathologiesByKeywords([])).toHaveLength(0);
  });

  test('should handle whitespace in keywords', () => {
    const results1 = findLocationsByKeywords(['  knie  ', ' onderbeen ']);
    const results2 = findLocationsByKeywords(['knie', 'onderbeen']);

    expect(results1).toEqual(results2);
  });

  test('should handle special characters in validation', () => {
    expect(validateDCSPHCode('79-20').isValid).toBe(false);
    expect(validateDCSPHCode('79 20').isValid).toBe(false);
    expect(validateDCSPHCode('79.20').isValid).toBe(false);
  });
});