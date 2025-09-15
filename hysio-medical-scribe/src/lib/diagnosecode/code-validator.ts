// DCSPH Code Validation and Combination Logic

import {
  LOCATION_CODES,
  PATHOLOGY_CODES,
  LocationCode,
  PathologyCode,
  DCSPHCode,
  getLocationByCode,
  getPathologyByCode,
  buildDCSPHCode
} from './dcsph-tables';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: DCSPHCode[];
}

export interface CodeSuggestion {
  code: DCSPHCode;
  confidence: number;
  rationale: string;
}

/**
 * Validates a complete 4-digit DCSPH code
 */
export function validateDCSPHCode(code: string): ValidationResult {
  // Check basic format
  if (!code || typeof code !== 'string') {
    return { isValid: false, error: 'Code moet een string zijn' };
  }

  if (code.length !== 4) {
    return { isValid: false, error: 'DCSPH code moet exact 4 cijfers bevatten' };
  }

  if (!/^\d{4}$/.test(code)) {
    return { isValid: false, error: 'DCSPH code mag alleen cijfers bevatten' };
  }

  const locationCode = code.substring(0, 2);
  const pathologyCode = code.substring(2, 4);

  // Validate location code exists
  const location = getLocationByCode(locationCode);
  if (!location) {
    return {
      isValid: false,
      error: `Locatiecode ${locationCode} bestaat niet in DCSPH tabel A`
    };
  }

  // Validate pathology code exists
  const pathology = getPathologyByCode(pathologyCode);
  if (!pathology) {
    return {
      isValid: false,
      error: `Pathologiecode ${pathologyCode} bestaat niet in DCSPH tabel B`
    };
  }

  // Build the complete code
  const dcsphCode = buildDCSPHCode(locationCode, pathologyCode);
  if (!dcsphCode) {
    return {
      isValid: false,
      error: 'Kon geen geldige DCSPH code combinatie maken'
    };
  }

  return {
    isValid: true,
    suggestions: [dcsphCode]
  };
}

/**
 * Validates a batch of DCSPH codes
 */
export function validateMultipleCodes(codes: string[]): { [code: string]: ValidationResult } {
  const results: { [code: string]: ValidationResult } = {};

  for (const code of codes) {
    results[code] = validateDCSPHCode(code);
  }

  return results;
}

/**
 * Finds possible location codes based on body region keywords
 */
export function findLocationsByKeywords(keywords: string[]): LocationCode[] {
  const normalizedKeywords = keywords.map(k => k.toLowerCase().trim());
  const matches: { location: LocationCode; matchCount: number }[] = [];

  for (const location of LOCATION_CODES) {
    let matchCount = 0;
    const locationText = location.description.toLowerCase();

    for (const keyword of normalizedKeywords) {
      if (locationText.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      matches.push({ location, matchCount });
    }
  }

  // Sort by match relevance
  matches.sort((a, b) => b.matchCount - a.matchCount);
  return matches.map(m => m.location);
}

/**
 * Finds possible pathology codes based on symptom keywords
 */
export function findPathologiesByKeywords(keywords: string[]): PathologyCode[] {
  const normalizedKeywords = keywords.map(k => k.toLowerCase().trim());
  const matches: { pathology: PathologyCode; matchCount: number }[] = [];

  for (const pathology of PATHOLOGY_CODES) {
    let matchCount = 0;
    const pathologyText = pathology.description.toLowerCase();

    for (const keyword of normalizedKeywords) {
      if (pathologyText.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      matches.push({ pathology, matchCount });
    }
  }

  // Sort by match relevance
  matches.sort((a, b) => b.matchCount - a.matchCount);
  return matches.map(m => m.pathology);
}

/**
 * Generates code suggestions based on location and pathology matches
 */
export function generateCodeSuggestions(
  locationMatches: LocationCode[],
  pathologyMatches: PathologyCode[],
  maxSuggestions: number = 3
): CodeSuggestion[] {
  const suggestions: CodeSuggestion[] = [];

  // Generate all possible combinations
  for (let i = 0; i < Math.min(locationMatches.length, 5); i++) {
    for (let j = 0; j < Math.min(pathologyMatches.length, 5); j++) {
      const location = locationMatches[i];
      const pathology = pathologyMatches[j];

      const code = buildDCSPHCode(location.code, pathology.code);
      if (code) {
        // Calculate confidence based on position in matches
        const locationConfidence = Math.max(0.5, 1 - (i * 0.1));
        const pathologyConfidence = Math.max(0.5, 1 - (j * 0.1));
        const confidence = (locationConfidence + pathologyConfidence) / 2;

        // Generate rationale
        const rationale = generateRationale(location, pathology);

        suggestions.push({
          code,
          confidence,
          rationale
        });
      }
    }
  }

  // Sort by confidence and return top suggestions
  suggestions.sort((a, b) => b.confidence - a.confidence);
  return suggestions.slice(0, maxSuggestions);
}

/**
 * Generates a clinical rationale for a location-pathology combination
 */
export function generateRationale(location: LocationCode, pathology: PathologyCode): string {
  const locationDesc = location.description.toLowerCase();
  const pathologyDesc = pathology.description.toLowerCase();

  // Basic rationale template
  let rationale = `${pathology.description} in de ${location.description.toLowerCase()}.`;

  // Add more specific reasoning based on common combinations
  if (pathologyDesc.includes('tendinitis') && locationDesc.includes('knie')) {
    rationale += ' Overbelasting van pees structuren rond het kniegewricht past bij deze klachtenpresentatie.';
  } else if (pathologyDesc.includes('artrose') && (locationDesc.includes('heup') || locationDesc.includes('knie'))) {
    rationale += ' Degeneratieve gewrichtsveranderingen zijn vaak zichtbaar in dragende gewrichten.';
  } else if (pathologyDesc.includes('fractuur') || pathologyDesc.includes('fracturen')) {
    rationale += ' Botbreuk in deze regio past bij het traumamechanisme.';
  } else if (pathologyDesc.includes('distorsie') || pathologyDesc.includes('contusie')) {
    rationale += ' Weke delen trauma in deze regio is consistent met het beschreven letsel.';
  } else if (pathologyDesc.includes('hnp') && locationDesc.includes('wervelkolom')) {
    rationale += ' Discuspathologie in deze wervelkolomsegment past bij de uitstralingspatroon.';
  }

  return rationale;
}

/**
 * Validates logical combinations (some combinations don't make clinical sense)
 */
export function isLogicalCombination(locationCode: string, pathologyCode: string): boolean {
  // Add specific validation rules for clinically impossible combinations
  const location = getLocationByCode(locationCode);
  const pathology = getPathologyByCode(pathologyCode);

  if (!location || !pathology) return false;

  // Example: Heart conditions shouldn't be applied to limbs
  if (pathology.category === 'cardiovasculair' &&
      (location.region === 'onderste-extremiteit' || location.region === 'bovenste-extremiteit')) {
    return false;
  }

  // Example: Fractures typically don't apply to soft tissue only regions
  if (pathologyCode === '36' && // Fracturen
      (locationCode === '13' || locationCode === '20' || locationCode === '21')) { // Soft tissue regions
    return false;
  }

  return true;
}

/**
 * Gets all valid combinations for a specific location
 */
export function getValidCombinationsForLocation(locationCode: string): DCSPHCode[] {
  const validCodes: DCSPHCode[] = [];

  for (const pathology of PATHOLOGY_CODES) {
    if (isLogicalCombination(locationCode, pathology.code)) {
      const code = buildDCSPHCode(locationCode, pathology.code);
      if (code) {
        validCodes.push(code);
      }
    }
  }

  return validCodes;
}

/**
 * Gets all valid combinations for a specific pathology
 */
export function getValidCombinationsForPathology(pathologyCode: string): DCSPHCode[] {
  const validCodes: DCSPHCode[] = [];

  for (const location of LOCATION_CODES) {
    if (isLogicalCombination(location.code, pathologyCode)) {
      const code = buildDCSPHCode(location.code, pathologyCode);
      if (code) {
        validCodes.push(code);
      }
    }
  }

  return validCodes;
}