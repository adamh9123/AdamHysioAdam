// DCSPH Knowledge Base - Central hub for all DCSPH operations

import {
  LOCATION_CODES,
  PATHOLOGY_CODES,
  LocationCode,
  PathologyCode,
  DCSPHCode,
  getLocationByCode,
  getPathologyByCode,
  buildDCSPHCode,
  isValidDCSPHCode
} from './dcsph-tables';

import {
  validateDCSPHCode,
  findLocationsByKeywords,
  findPathologiesByKeywords,
  generateCodeSuggestions,
  isLogicalCombination,
  CodeSuggestion
} from './code-validator';

// Dutch medical terminology mapping for better keyword matching
const DUTCH_MEDICAL_TERMS: { [key: string]: string[] } = {
  // Body regions
  'knie': ['knie', 'patella', 'meniscus', 'kruisband'],
  'rug': ['rug', 'lumbaal', 'lumbo', 'wervelkolom', 'lenden'],
  'nek': ['nek', 'cervicaal', 'hals', 'nekwervels'],
  'schouder': ['schouder', 'humerus', 'clavicula', 'scapula'],
  'elleboog': ['elleboog', 'epicondyl', 'olecranon'],
  'pols': ['pols', 'carpaal', 'radius', 'ulna'],
  'heup': ['heup', 'coxae', 'femoraal', 'trochanter'],
  'enkel': ['enkel', 'malleolus', 'talus', 'voetwortel'],
  'voet': ['voet', 'teen', 'metatarsaal', 'calcaneus'],

  // Pathology terms
  'pijn': ['pijn', 'algie', 'doloreus'],
  'zwelling': ['zwelling', 'oedeem', 'hydrops'],
  'ontsteking': ['ontsteking', 'itis', 'inflammatie'],
  'overbelasting': ['overbelasting', 'tendinitis', 'tendinopathie'],
  'slijtage': ['slijtage', 'artrose', 'degeneratie'],
  'trauma': ['trauma', 'letsel', 'contusie', 'distorsie'],
  'breuk': ['breuk', 'fractuur', 'fracturen'],
  'zenuw': ['zenuw', 'neuraal', 'radiculair', 'paresthesie'],
  'spier': ['spier', 'myaal', 'contractuur', 'atrofie']
};

// Common symptom patterns for better matching
const SYMPTOM_PATTERNS: { [pattern: string]: { locations: string[]; pathologies: string[] } } = {
  'kniepijn_vooraan': {
    locations: ['79'], // Knie/Onderbeen/Voet
    pathologies: ['20', '21', '22'] // Tendinitis, Bursitis, Chondropathie
  },
  'rugpijn_onderrug': {
    locations: ['34', '35'], // Lumbale/Lumbo-sacrale wervelkolom
    pathologies: ['27', '26', '23'] // HNP, Spier-pees aandoeningen, Artrose
  },
  'nekpijn': {
    locations: ['30', '31'], // Cervicale wervelkolom
    pathologies: ['38', '27', '26'] // Whiplash, HNP, Spier-pees aandoeningen
  },
  'schouderpijn': {
    locations: ['13', '21'], // Depending on specific area
    pathologies: ['20', '21', '26'] // Tendinitis, Bursitis, Spier-pees
  }
};

export interface KnowledgeBaseQuery {
  query: string;
  context?: string;
  previousQuestions?: string[];
}

export interface KnowledgeBaseResponse {
  suggestions: CodeSuggestion[];
  needsClarification: boolean;
  clarifyingQuestion?: string;
  confidence: number;
}

/**
 * Main entry point for the DCSPH Knowledge Base
 */
export class DCSPHKnowledgeBase {

  /**
   * Process a natural language query and return code suggestions
   */
  static processQuery(query: KnowledgeBaseQuery): KnowledgeBaseResponse {
    const normalizedQuery = this.normalizeQuery(query.query);

    // Extract keywords from query
    const keywords = this.extractKeywords(normalizedQuery);

    // Check for common patterns first
    const patternMatch = this.matchSymptomPatterns(normalizedQuery);
    if (patternMatch) {
      return this.generateResponseFromPattern(patternMatch, normalizedQuery);
    }

    // Find potential locations and pathologies
    const locationMatches = this.findRelevantLocations(keywords);
    const pathologyMatches = this.findRelevantPathologies(keywords);

    // Check if we need more information
    const clarificationNeeded = this.needsClarification(locationMatches, pathologyMatches, query);
    if (clarificationNeeded.needed) {
      return {
        suggestions: [],
        needsClarification: true,
        clarifyingQuestion: clarificationNeeded.question,
        confidence: 0
      };
    }

    // Generate suggestions
    const suggestions = generateCodeSuggestions(locationMatches, pathologyMatches, 3);

    // Calculate overall confidence
    const confidence = suggestions.length > 0 ?
      suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length : 0;

    return {
      suggestions,
      needsClarification: false,
      confidence
    };
  }

  /**
   * Normalize query text for better processing
   */
  private static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[.,;:!?]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Extract relevant keywords from query
   */
  private static extractKeywords(query: string): string[] {
    const words = query.split(' ').filter(word => word.length > 2);
    const keywords: string[] = [];

    // Add original words
    keywords.push(...words);

    // Add expanded terms based on medical terminology
    for (const word of words) {
      for (const [term, synonyms] of Object.entries(DUTCH_MEDICAL_TERMS)) {
        if (synonyms.some(synonym => word.includes(synonym) || synonym.includes(word))) {
          keywords.push(term, ...synonyms);
        }
      }
    }

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Match query against known symptom patterns
   */
  private static matchSymptomPatterns(query: string): { locations: string[]; pathologies: string[] } | null {
    for (const [pattern, codes] of Object.entries(SYMPTOM_PATTERNS)) {
      const patternWords = pattern.split('_');
      let matchCount = 0;

      for (const word of patternWords) {
        if (query.includes(word)) {
          matchCount++;
        }
      }

      // If we match most of the pattern words, use this pattern
      if (matchCount >= Math.ceil(patternWords.length * 0.6)) {
        return codes;
      }
    }

    return null;
  }

  /**
   * Generate response from a matched pattern
   */
  private static generateResponseFromPattern(
    pattern: { locations: string[]; pathologies: string[] },
    query: string
  ): KnowledgeBaseResponse {
    const suggestions: CodeSuggestion[] = [];

    for (const locationCode of pattern.locations) {
      for (const pathologyCode of pattern.pathologies) {
        const code = buildDCSPHCode(locationCode, pathologyCode);
        if (code && isLogicalCombination(locationCode, pathologyCode)) {
          const location = getLocationByCode(locationCode);
          const pathology = getPathologyByCode(pathologyCode);

          if (location && pathology) {
            suggestions.push({
              code,
              confidence: 0.9, // High confidence for pattern matches
              rationale: `${pathology.description} in de ${location.description.toLowerCase()}. Deze combinatie past goed bij de beschreven klachten.`
            });
          }
        }
      }
    }

    // Sort by confidence and take top 3
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return {
      suggestions: suggestions.slice(0, 3),
      needsClarification: false,
      confidence: 0.9
    };
  }

  /**
   * Find relevant locations based on keywords
   */
  private static findRelevantLocations(keywords: string[]): LocationCode[] {
    return findLocationsByKeywords(keywords);
  }

  /**
   * Find relevant pathologies based on keywords
   */
  private static findRelevantPathologies(keywords: string[]): PathologyCode[] {
    return findPathologiesByKeywords(keywords);
  }

  /**
   * Determine if clarification is needed
   */
  private static needsClarification(
    locationMatches: LocationCode[],
    pathologyMatches: PathologyCode[],
    query: KnowledgeBaseQuery
  ): { needed: boolean; question?: string } {

    // If we have no location matches, ask for body region
    if (locationMatches.length === 0) {
      return {
        needed: true,
        question: "In welke lichaamsregio bevinden de klachten zich? (bijvoorbeeld: knie, onderrug, nek, schouder)"
      };
    }

    // If we have no pathology matches, ask for symptom type
    if (pathologyMatches.length === 0) {
      return {
        needed: true,
        question: "Wat voor type klacht betreft het? (bijvoorbeeld: pijn, zwelling, stijfheid, bewegingsbeperking)"
      };
    }

    // If we have too many location matches but query is very short, ask for specificity
    if (locationMatches.length > 5 && query.query.split(' ').length < 4) {
      return {
        needed: true,
        question: "Kunt u specifieker aangeven waar precies de klachten zich bevinden?"
      };
    }

    return { needed: false };
  }

  /**
   * Get detailed information about a specific DCSPH code
   */
  static getCodeDetails(code: string): DCSPHCode | null {
    const validation = validateDCSPHCode(code);
    if (validation.isValid && validation.suggestions && validation.suggestions.length > 0) {
      return validation.suggestions[0];
    }
    return null;
  }

  /**
   * Search codes by partial description
   */
  static searchByDescription(searchTerm: string): DCSPHCode[] {
    const normalizedTerm = searchTerm.toLowerCase();
    const results: DCSPHCode[] = [];

    for (const location of LOCATION_CODES) {
      for (const pathology of PATHOLOGY_CODES) {
        if (isLogicalCombination(location.code, pathology.code)) {
          const code = buildDCSPHCode(location.code, pathology.code);
          if (code) {
            const fullDesc = code.fullDescription.toLowerCase();
            if (fullDesc.includes(normalizedTerm)) {
              results.push(code);
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Get statistics about the knowledge base
   */
  static getKnowledgeBaseStats() {
    const totalLocations = LOCATION_CODES.length;
    const totalPathologies = PATHOLOGY_CODES.length;
    const theoreticalCombinations = totalLocations * totalPathologies;

    // Count actual valid combinations
    let validCombinations = 0;
    for (const location of LOCATION_CODES) {
      for (const pathology of PATHOLOGY_CODES) {
        if (isLogicalCombination(location.code, pathology.code)) {
          validCombinations++;
        }
      }
    }

    return {
      totalLocations,
      totalPathologies,
      theoreticalCombinations,
      validCombinations,
      coverage: (validCombinations / theoreticalCombinations) * 100
    };
  }
}