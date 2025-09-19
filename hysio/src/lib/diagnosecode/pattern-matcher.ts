// Pattern Matching for Dutch Medical Terminology

export interface TermPattern {
  term: string;
  synonyms: string[];
  category: 'location' | 'pathology' | 'symptom' | 'mechanism' | 'timing';
  weight: number;
  dcsphCodes?: string[];
}

export interface MatchResult {
  term: string;
  confidence: number;
  category: string;
  matchedText: string;
  position: number;
}

export interface PatternAnalysis {
  locationMatches: MatchResult[];
  pathologyMatches: MatchResult[];
  symptomMatches: MatchResult[];
  mechanismMatches: MatchResult[];
  timingMatches: MatchResult[];
  overallConfidence: number;
  suggestedCodes: string[];
}

// Comprehensive Dutch medical terminology patterns
export const MEDICAL_PATTERNS: TermPattern[] = [
  // === LOCATION PATTERNS ===
  // Head and Neck
  {
    term: 'hoofd',
    synonyms: ['hoofd', 'schedel', 'cranium', 'hoofdpijn'],
    category: 'location',
    weight: 0.9,
    dcsphCodes: ['10']
  },
  {
    term: 'aangezicht',
    synonyms: ['aangezicht', 'gezicht', 'facial', 'kaak', 'mandibula', 'maxilla'],
    category: 'location',
    weight: 0.8,
    dcsphCodes: ['11', '12']
  },
  {
    term: 'nek',
    synonyms: ['nek', 'hals', 'cervicaal', 'cervicale', 'nekwervels', 'c-wervelkolom'],
    category: 'location',
    weight: 0.95,
    dcsphCodes: ['13', '30', '31']
  },

  // Spine
  {
    term: 'wervelkolom',
    synonyms: ['wervelkolom', 'ruggengraat', 'vertebrae', 'spine', 'wervelzuil'],
    category: 'location',
    weight: 0.9,
    dcsphCodes: ['30', '32', '34', '35', '36']
  },
  {
    term: 'onderrug',
    synonyms: ['onderrug', 'lage rug', 'lumbaal', 'lumbale', 'lenden', 'lendenwervelkolom', 'l-wervelkolom'],
    category: 'location',
    weight: 0.95,
    dcsphCodes: ['34', '35']
  },
  {
    term: 'bovenrug',
    synonyms: ['bovenrug', 'thoracaal', 'thoracale', 'middenrug', 't-wervelkolom', 'borstwervelkolom'],
    category: 'location',
    weight: 0.9,
    dcsphCodes: ['32', '33']
  },

  // Upper extremity
  {
    term: 'schouder',
    synonyms: ['schouder', 'schouderblad', 'scapula', 'clavicula', 'sleutelbeen', 'humeruskop'],
    category: 'location',
    weight: 0.95,
    dcsphCodes: ['21']
  },
  {
    term: 'elleboog',
    synonyms: ['elleboog', 'elbow', 'epicondyl', 'olecranon', 'epicondylitis'],
    category: 'location',
    weight: 0.95,
    dcsphCodes: ['79'] // Often grouped with arm
  },
  {
    term: 'pols',
    synonyms: ['pols', 'polsgewricht', 'carpaal', 'wrist', 'radius', 'ulna'],
    category: 'location',
    weight: 0.9,
    dcsphCodes: ['79']
  },

  // Lower extremity
  {
    term: 'heup',
    synonyms: ['heup', 'heupgewricht', 'coxae', 'femur', 'trochanter', 'bekken'],
    category: 'location',
    weight: 0.95,
    dcsphCodes: ['79']
  },
  {
    term: 'knie',
    synonyms: ['knie', 'kniegewricht', 'patella', 'knieschijf', 'meniscus', 'kruisband'],
    category: 'location',
    weight: 0.98,
    dcsphCodes: ['79']
  },
  {
    term: 'enkel',
    synonyms: ['enkel', 'enkelgewricht', 'malleolus', 'talus', 'spronggewricht'],
    category: 'location',
    weight: 0.95,
    dcsphCodes: ['72', '73']
  },
  {
    term: 'voet',
    synonyms: ['voet', 'teen', 'tenen', 'metatarsaal', 'calcaneus', 'voetwortel', 'middenvoet'],
    category: 'location',
    weight: 0.9,
    dcsphCodes: ['74', '75', '76', '79']
  },

  // === PATHOLOGY PATTERNS ===
  // Inflammatory conditions
  {
    term: 'tendinitis',
    synonyms: ['tendinitis', 'peesontsteking', 'tendinopathie', 'tendinose', 'epicondylitis'],
    category: 'pathology',
    weight: 0.95,
    dcsphCodes: ['20']
  },
  {
    term: 'bursitis',
    synonyms: ['bursitis', 'slijmbeursontsteking', 'bursa', 'bursaal'],
    category: 'pathology',
    weight: 0.9,
    dcsphCodes: ['21']
  },
  {
    term: 'capsulitis',
    synonyms: ['capsulitis', 'kapselontsteking', 'frozen shoulder', 'adhesieve capsulitis'],
    category: 'pathology',
    weight: 0.85,
    dcsphCodes: ['21']
  },

  // Degenerative conditions
  {
    term: 'artrose',
    synonyms: ['artrose', 'slijtage', 'degeneratie', 'osteoarthrose', 'gewrichtsslijtage'],
    category: 'pathology',
    weight: 0.9,
    dcsphCodes: ['23']
  },
  {
    term: 'chondropathie',
    synonyms: ['chondropathie', 'kraakbeenschade', 'chondromalacie', 'patellofemoraal syndroom'],
    category: 'pathology',
    weight: 0.85,
    dcsphCodes: ['22']
  },
  {
    term: 'hnp',
    synonyms: ['hnp', 'hernia', 'discusprolapses', 'discushernia', 'rughernia'],
    category: 'pathology',
    weight: 0.95,
    dcsphCodes: ['27', '75']
  },

  // Traumatic conditions
  {
    term: 'fractuur',
    synonyms: ['fractuur', 'breuk', 'botbreuk', 'fractura'],
    category: 'pathology',
    weight: 0.98,
    dcsphCodes: ['36']
  },
  {
    term: 'distorsie',
    synonyms: ['distorsie', 'verstuiking', 'verzwiking', 'verrekking'],
    category: 'pathology',
    weight: 0.9,
    dcsphCodes: ['31']
  },
  {
    term: 'contusie',
    synonyms: ['contusie', 'kneuzing', 'blauwe plek', 'hematoom'],
    category: 'pathology',
    weight: 0.85,
    dcsphCodes: ['31', '34']
  },
  {
    term: 'luxatie',
    synonyms: ['luxatie', 'ontwrichting', 'subluxatie'],
    category: 'pathology',
    weight: 0.9,
    dcsphCodes: ['32']
  },
  {
    term: 'whiplash',
    synonyms: ['whiplash', 'nektrauma', 'zweepslag', 'cervicaal trauma'],
    category: 'pathology',
    weight: 0.95,
    dcsphCodes: ['38']
  },

  // Muscle and soft tissue
  {
    term: 'spierverrekking',
    synonyms: ['spierverrekking', 'spierletsel', 'strain', 'spierscheur', 'myalgie'],
    category: 'pathology',
    weight: 0.9,
    dcsphCodes: ['26', '33']
  },

  // === SYMPTOM PATTERNS ===
  {
    term: 'pijn',
    synonyms: ['pijn', 'zeer', 'klachten', 'ongemak', 'algie', 'doloreus'],
    category: 'symptom',
    weight: 0.7
  },
  {
    term: 'zwelling',
    synonyms: ['zwelling', 'oedeem', 'verdikking', 'hydrops'],
    category: 'symptom',
    weight: 0.8
  },
  {
    term: 'stijfheid',
    synonyms: ['stijfheid', 'stijf', 'bewegingsbeperking', 'beperkte beweeglijkheid'],
    category: 'symptom',
    weight: 0.8
  },
  {
    term: 'instabiliteit',
    synonyms: ['instabiliteit', 'instabiel', 'wegklapppen', 'giving way', 'onzekerheid'],
    category: 'symptom',
    weight: 0.85
  },
  {
    term: 'uitstraling',
    synonyms: ['uitstraling', 'uitstralende pijn', 'radiculair', 'neuraal', 'tintelingen'],
    category: 'symptom',
    weight: 0.9
  },

  // === MECHANISM PATTERNS ===
  {
    term: 'trauma',
    synonyms: ['trauma', 'letsel', 'ongeval', 'val', 'botsing'],
    category: 'mechanism',
    weight: 0.9
  },
  {
    term: 'overbelasting',
    synonyms: ['overbelasting', 'overuse', 'herhalende bewegingen', 'repetitief'],
    category: 'mechanism',
    weight: 0.85
  },
  {
    term: 'sport',
    synonyms: ['sport', 'sporten', 'atletiek', 'voetbal', 'tennis', 'hardlopen', 'fitness'],
    category: 'mechanism',
    weight: 0.7
  },

  // === TIMING PATTERNS ===
  {
    term: 'acute',
    synonyms: ['acute', 'plotseling', 'acuut', 'ineens'],
    category: 'timing',
    weight: 0.8
  },
  {
    term: 'chronisch',
    synonyms: ['chronisch', 'langdurig', 'aanhoudend', 'permanent'],
    category: 'timing',
    weight: 0.8
  },
  {
    term: 'ochtend',
    synonyms: ['ochtend', 'ochtendstifjheid', 's morgens', 'opstaan'],
    category: 'timing',
    weight: 0.7
  },
  {
    term: 'belasting',
    synonyms: ['belasting', 'bij bewegen', 'activiteit', 'inspanning'],
    category: 'timing',
    weight: 0.8
  }
];

export class MedicalPatternMatcher {

  /**
   * Analyze text for medical patterns
   */
  static analyzeText(text: string): PatternAnalysis {
    const normalizedText = this.normalizeText(text);
    const words = normalizedText.split(/\s+/);

    const locationMatches: MatchResult[] = [];
    const pathologyMatches: MatchResult[] = [];
    const symptomMatches: MatchResult[] = [];
    const mechanismMatches: MatchResult[] = [];
    const timingMatches: MatchResult[] = [];

    // Find all pattern matches
    for (const pattern of MEDICAL_PATTERNS) {
      const matches = this.findPatternMatches(normalizedText, pattern);

      for (const match of matches) {
        switch (pattern.category) {
          case 'location':
            locationMatches.push(match);
            break;
          case 'pathology':
            pathologyMatches.push(match);
            break;
          case 'symptom':
            symptomMatches.push(match);
            break;
          case 'mechanism':
            mechanismMatches.push(match);
            break;
          case 'timing':
            timingMatches.push(match);
            break;
        }
      }
    }

    // Sort matches by confidence
    const sortMatches = (matches: MatchResult[]) =>
      matches.sort((a, b) => b.confidence - a.confidence);

    sortMatches(locationMatches);
    sortMatches(pathologyMatches);
    sortMatches(symptomMatches);
    sortMatches(mechanismMatches);
    sortMatches(timingMatches);

    // Calculate overall confidence
    const allMatches = [
      ...locationMatches,
      ...pathologyMatches,
      ...symptomMatches,
      ...mechanismMatches,
      ...timingMatches
    ];

    const overallConfidence = allMatches.length > 0 ?
      allMatches.reduce((sum, match) => sum + match.confidence, 0) / allMatches.length : 0;

    // Generate suggested codes based on best matches
    const suggestedCodes = this.generateSuggestedCodes(locationMatches, pathologyMatches);

    return {
      locationMatches,
      pathologyMatches,
      symptomMatches,
      mechanismMatches,
      timingMatches,
      overallConfidence,
      suggestedCodes
    };
  }

  /**
   * Find pattern matches in text
   */
  private static findPatternMatches(text: string, pattern: TermPattern): MatchResult[] {
    const matches: MatchResult[] = [];
    const allTerms = [pattern.term, ...pattern.synonyms];

    for (const term of allTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Calculate confidence based on exact match vs synonym
        let confidence = pattern.weight;
        if (term !== pattern.term) {
          confidence *= 0.9; // Slight penalty for synonym matches
        }

        // Boost confidence for longer terms
        if (term.length > 6) {
          confidence *= 1.1;
        }

        matches.push({
          term: pattern.term,
          confidence: Math.min(confidence, 1.0),
          category: pattern.category,
          matchedText: match[0],
          position: match.index
        });
      }
    }

    return matches;
  }

  /**
   * Generate suggested DCSPH codes from matches
   */
  private static generateSuggestedCodes(
    locationMatches: MatchResult[],
    pathologyMatches: MatchResult[]
  ): string[] {
    const suggestions: string[] = [];

    // Get top location and pathology patterns with DCSPH codes
    const topLocationPatterns = locationMatches
      .map(match => MEDICAL_PATTERNS.find(p => p.term === match.term))
      .filter(p => p && p.dcsphCodes)
      .slice(0, 3);

    const topPathologyPatterns = pathologyMatches
      .map(match => MEDICAL_PATTERNS.find(p => p.term === match.term))
      .filter(p => p && p.dcsphCodes)
      .slice(0, 3);

    // Generate combinations
    for (const locationPattern of topLocationPatterns) {
      for (const pathologyPattern of topPathologyPatterns) {
        for (const locationCode of locationPattern!.dcsphCodes || []) {
          for (const pathologyCode of pathologyPattern!.dcsphCodes || []) {
            const combinedCode = locationCode + pathologyCode;
            if (!suggestions.includes(combinedCode)) {
              suggestions.push(combinedCode);
            }
          }
        }
      }
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Normalize text for pattern matching
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[.,;:!?()]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /**
   * Escape regex special characters
   */
  private static escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get confidence score for specific categories
   */
  static getCategoryConfidence(analysis: PatternAnalysis, category: string): number {
    let matches: MatchResult[] = [];

    switch (category) {
      case 'location':
        matches = analysis.locationMatches;
        break;
      case 'pathology':
        matches = analysis.pathologyMatches;
        break;
      case 'symptom':
        matches = analysis.symptomMatches;
        break;
      case 'mechanism':
        matches = analysis.mechanismMatches;
        break;
      case 'timing':
        matches = analysis.timingMatches;
        break;
    }

    return matches.length > 0 ?
      matches.reduce((sum, match) => sum + match.confidence, 0) / matches.length : 0;
  }

  /**
   * Check if text contains sufficient information for diagnosis
   */
  static hasSufficientInformation(analysis: PatternAnalysis): {
    sufficient: boolean;
    missing: string[];
    recommendations: string[];
  } {
    const missing: string[] = [];
    const recommendations: string[] = [];

    // Check for essential information
    if (analysis.locationMatches.length === 0) {
      missing.push('location');
      recommendations.push('Geef aan in welke lichaamsregio de klachten zich bevinden');
    }

    if (analysis.pathologyMatches.length === 0 && analysis.symptomMatches.length === 0) {
      missing.push('pathology');
      recommendations.push('Beschrijf het type klacht (pijn, zwelling, stijfheid, etc.)');
    }

    // Check confidence levels
    const locationConfidence = this.getCategoryConfidence(analysis, 'location');
    const pathologyConfidence = this.getCategoryConfidence(analysis, 'pathology');

    if (locationConfidence < 0.7 && analysis.locationMatches.length > 0) {
      recommendations.push('Wees specifieker over de exacte locatie van de klachten');
    }

    if (pathologyConfidence < 0.7 && analysis.pathologyMatches.length > 0) {
      recommendations.push('Beschrijf de aard van de klachten in meer detail');
    }

    return {
      sufficient: missing.length === 0 && locationConfidence > 0.6,
      missing,
      recommendations
    };
  }
}