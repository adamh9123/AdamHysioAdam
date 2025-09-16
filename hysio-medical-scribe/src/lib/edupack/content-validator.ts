// Content Validator for Hysio EduPack Module
// Comprehensive B1-level Dutch language validation and readability analysis

import type { ContentValidationResult, EduPackContent, SectionContent } from '@/lib/types/edupack';

// B1-level criteria for Dutch language
const B1_CRITERIA = {
  maxWordsPerSentence: 20,
  maxComplexWordRatio: 0.12, // 12% complex words max
  maxSyllablesPerWord: 3.5,
  minReadabilityScore: 60,
  maxSentenceLength: 25, // words
  maxParagraphLength: 5, // sentences
  recommendedWordCount: {
    min: 50,
    max: 400 // per section
  }
};

// Common Dutch medical terms that are acceptable at B1 level
const B1_MEDICAL_VOCABULARY = [
  // Body parts
  'hoofd', 'nek', 'schouder', 'arm', 'elleboog', 'pols', 'hand', 'vinger',
  'borst', 'rug', 'buik', 'heup', 'been', 'knie', 'enkel', 'voet', 'teen',
  'spier', 'bot', 'gewricht', 'pees', 'zenuw', 'huid',

  // Common conditions
  'pijn', 'zeer', 'stijf', 'zwak', 'moe', 'dik', 'opgezwollen',
  'artrose', 'reuma', 'hernia', 'migraine', 'stress',

  // Treatments
  'oefening', 'massage', 'rust', 'bewegen', 'rekken', 'kracht',
  'fysiotherapie', 'behandeling', 'therapie', 'training',

  // Common medical terms
  'bloeddruk', 'hartslag', 'ademhaling', 'koorts', 'infectie',
  'medicijn', 'antibiotica', 'pijnstiller', 'ontstoken'
];

// Complex words that should be simplified or explained
const COMPLEX_MEDICAL_TERMS = {
  // Latin/scientific terms
  'cervicaal': 'van de nek',
  'lumbaal': 'van de onderrug',
  'thoracaal': 'van de borstkas',
  'inflammatie': 'ontsteking',
  'degeneratie': 'slijtage',
  'mobilisatie': 'bewegend maken',
  'manipulatie': 'behandeling met de handen',
  'contractuur': 'stijf geworden spier',
  'adherentie': 'vastzitten',
  'ligamentair': 'van de banden',

  // Professional jargon
  'ROM': 'bewegingsbereik',
  'ADL': 'dagelijkse activiteiten',
  'proprioceptie': 'gevoel voor houding',
  'instabiliteit': 'onstabiel, wankel',
  'compensatie': 'opvangen, overnemen',

  // Complex anatomy
  'vertebra': 'ruggenwervel',
  'diskus': 'tussenwervelschijf',
  'facetgewricht': 'ruggewricht',
  'processus': 'uitsteeksel',
  'foramen': 'opening'
};

export interface ValidationOptions {
  strictMode: boolean; // Stricter validation for B1
  allowMedicalTerms: boolean; // Allow basic medical vocabulary
  customVocabulary?: string[]; // Additional allowed terms
  targetAudience: 'general' | 'educated' | 'elderly'; // Adjust criteria
  sectionType?: string; // Different criteria per section
}

export class EduPackContentValidator {
  private options: ValidationOptions;

  constructor(options: Partial<ValidationOptions> = {}) {
    this.options = {
      strictMode: false,
      allowMedicalTerms: true,
      targetAudience: 'general',
      ...options
    };
  }

  // Main validation function for complete EduPack
  validateEduPack(eduPack: EduPackContent): ContentValidationResult {
    const allIssues: ContentValidationResult['issues'] = [];
    const allSuggestions: string[] = [];
    let totalScore = 0;
    let sectionCount = 0;

    // Validate each section
    for (const section of eduPack.sections) {
      if (section.enabled && section.content.trim()) {
        const sectionResult = this.validateSection(section);

        allIssues.push(...sectionResult.issues.map(issue => ({
          ...issue,
          section: section.type
        })));

        allSuggestions.push(...sectionResult.suggestions);
        totalScore += sectionResult.readabilityScore;
        sectionCount++;
      }
    }

    const averageScore = sectionCount > 0 ? totalScore / sectionCount : 0;
    const highSeverityIssues = allIssues.filter(issue => issue.severity === 'high');

    return {
      isValid: highSeverityIssues.length === 0,
      languageLevel: this.determineLanguageLevel(averageScore, allIssues),
      readabilityScore: averageScore,
      issues: allIssues,
      suggestions: [...new Set(allSuggestions)] // Remove duplicates
    };
  }

  // Validate individual section
  validateSection(section: SectionContent): ContentValidationResult {
    const issues: ContentValidationResult['issues'] = [];
    const suggestions: string[] = [];

    // Basic content checks
    this.validateBasicContent(section.content, issues, suggestions);

    // Language level validation
    this.validateLanguageLevel(section.content, issues, suggestions);

    // Medical terminology validation
    this.validateMedicalTerminology(section.content, issues, suggestions);

    // Structure and formatting validation
    this.validateStructure(section.content, issues, suggestions);

    // Section-specific validation
    this.validateSectionSpecific(section, issues, suggestions);

    const readabilityScore = this.calculateReadabilityScore(section.content);

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      languageLevel: this.determineLanguageLevel(readabilityScore, issues),
      readabilityScore,
      issues,
      suggestions
    };
  }

  private validateBasicContent(content: string, issues: ContentValidationResult['issues'], suggestions: string[]): void {
    const wordCount = this.countWords(content);
    const sentenceCount = this.countSentences(content);

    // Length validation
    if (wordCount < B1_CRITERIA.recommendedWordCount.min) {
      issues.push({
        type: 'length',
        message: `Te weinig inhoud (${wordCount} woorden, minimaal ${B1_CRITERIA.recommendedWordCount.min})`,
        severity: 'medium'
      });
      suggestions.push('Voeg meer uitleg toe om de patiënt beter te informeren');
    }

    if (wordCount > B1_CRITERIA.recommendedWordCount.max) {
      issues.push({
        type: 'length',
        message: `Te veel inhoud (${wordCount} woorden, maximaal ${B1_CRITERIA.recommendedWordCount.max})`,
        severity: 'medium'
      });
      suggestions.push('Maak de tekst korter en bondiger');
    }

    // Basic completeness
    if (sentenceCount < 2) {
      issues.push({
        type: 'length',
        message: 'Te weinig zinnen voor betekenisvolle informatie',
        severity: 'high'
      });
    }
  }

  private validateLanguageLevel(content: string, issues: ContentValidationResult['issues'], suggestions: string[]): void {
    const sentences = this.splitIntoSentences(content);
    const words = this.splitIntoWords(content);

    // Sentence length analysis
    const longSentences = sentences.filter(sentence => {
      const wordCount = this.countWords(sentence);
      return wordCount > B1_CRITERIA.maxWordsPerSentence;
    });

    if (longSentences.length > 0) {
      issues.push({
        type: 'language_complexity',
        message: `${longSentences.length} zinnen zijn te lang voor B1-niveau (max ${B1_CRITERIA.maxWordsPerSentence} woorden)`,
        severity: longSentences.length > sentences.length * 0.3 ? 'high' : 'medium'
      });
      suggestions.push('Maak lange zinnen korter door ze op te splitsen');
    }

    // Complex word analysis
    const complexWords = this.findComplexWords(words);
    const complexWordRatio = complexWords.length / words.length;

    if (complexWordRatio > B1_CRITERIA.maxComplexWordRatio) {
      issues.push({
        type: 'language_complexity',
        message: `Te veel moeilijke woorden (${Math.round(complexWordRatio * 100)}%, max ${Math.round(B1_CRITERIA.maxComplexWordRatio * 100)}%)`,
        severity: 'high'
      });
      suggestions.push('Vervang moeilijke woorden door eenvoudigere alternatieven');
    }

    // Passive voice detection (Dutch specific)
    const passiveVoiceCount = this.detectPassiveVoice(content);
    if (passiveVoiceCount > sentences.length * 0.3) {
      issues.push({
        type: 'language_complexity',
        message: 'Te veel lijdende vorm gebruikt',
        severity: 'medium'
      });
      suggestions.push('Gebruik meer actieve zinnen (bijv. "De dokter onderzoekt" i.p.v. "Er wordt onderzocht")');
    }
  }

  private validateMedicalTerminology(content: string, issues: ContentValidationResult['issues'], suggestions: string[]): void {
    const words = this.splitIntoWords(content.toLowerCase());

    // Find medical jargon that needs explanation
    const unexplainedJargon: string[] = [];

    Object.keys(COMPLEX_MEDICAL_TERMS).forEach(term => {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        // Check if explanation is provided nearby
        const explanation = COMPLEX_MEDICAL_TERMS[term as keyof typeof COMPLEX_MEDICAL_TERMS];
        if (!content.toLowerCase().includes(explanation.toLowerCase())) {
          unexplainedJargon.push(term);
        }
      }
    });

    if (unexplainedJargon.length > 0) {
      issues.push({
        type: 'medical_jargon',
        message: `Medische termen zonder uitleg: ${unexplainedJargon.join(', ')}`,
        severity: 'high'
      });
      suggestions.push('Leg medische termen uit in gewone woorden');
    }

    // Check for Latin/scientific terms
    const latinTerms = words.filter(word =>
      /(?:itis|osis|ectomy|otomy|plasty|scopy)$/.test(word) ||
      /^(?:pre|post|anti|inter|intra|extra)/.test(word)
    );

    if (latinTerms.length > 0) {
      issues.push({
        type: 'medical_jargon',
        message: `Wetenschappelijke termen gevonden: ${latinTerms.slice(0, 3).join(', ')}`,
        severity: 'medium'
      });
      suggestions.push('Gebruik Nederlandse benamingen in plaats van wetenschappelijke termen');
    }

    // Check for abbreviations without explanation
    const abbreviations = content.match(/\b[A-Z]{2,}s?\b/g) || [];
    const unexplainedAbbreviations = abbreviations.filter(abbr =>
      !content.includes(`${abbr} (`) && !content.includes(`(${abbr})`)
    );

    if (unexplainedAbbreviations.length > 0) {
      issues.push({
        type: 'medical_jargon',
        message: `Afkortingen zonder uitleg: ${unexplainedAbbreviations.slice(0, 3).join(', ')}`,
        severity: 'medium'
      });
      suggestions.push('Schrijf afkortingen volledig uit of geef uitleg');
    }
  }

  private validateStructure(content: string, issues: ContentValidationResult['issues'], suggestions: string[]): void {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const sentences = this.splitIntoSentences(content);

    // Paragraph length
    const longParagraphs = paragraphs.filter(paragraph => {
      const paragraphSentences = this.splitIntoSentences(paragraph);
      return paragraphSentences.length > B1_CRITERIA.maxParagraphLength;
    });

    if (longParagraphs.length > 0) {
      issues.push({
        type: 'language_complexity',
        message: `${longParagraphs.length} alinea's zijn te lang (max ${B1_CRITERIA.maxParagraphLength} zinnen)`,
        severity: 'medium'
      });
      suggestions.push('Verdeel lange alinea\'s op in kortere stukken');
    }

    // Check for proper structure elements
    if (!this.hasProperListStructure(content) && this.shouldHaveList(content)) {
      suggestions.push('Gebruik puntlijsten voor stappen of adviezen');
    }

    // Check for unclear references
    const unclearReferences = this.findUnclearReferences(content);
    if (unclearReferences.length > 0) {
      issues.push({
        type: 'unclear_reference',
        message: `Onduidelijke verwijzingen: ${unclearReferences.slice(0, 3).join(', ')}`,
        severity: 'medium'
      });
      suggestions.push('Maak verwijzingen specifieker (bijv. "deze oefening" → "de rekoefening")');
    }
  }

  private validateSectionSpecific(section: SectionContent, issues: ContentValidationResult['issues'], suggestions: string[]): void {
    const content = section.content.toLowerCase();

    switch (section.type) {
      case 'warning_signs':
        if (!content.includes('contact') && !content.includes('bellen')) {
          issues.push({
            type: 'length',
            message: 'Waarschuwingssignalen sectie mist contactinformatie',
            severity: 'high'
          });
        }
        break;

      case 'self_care':
        if (!content.includes('oefening') && !content.includes('thuis') && !content.includes('zelf')) {
          issues.push({
            type: 'length',
            message: 'Zelfzorg sectie mist praktische instructies',
            severity: 'medium'
          });
        }
        break;

      case 'treatment_plan':
        if (!content.includes('doel') && !content.includes('plan') && !content.includes('behandeling')) {
          issues.push({
            type: 'length',
            message: 'Behandelplan sectie mist doelen of planning',
            severity: 'medium'
          });
        }
        break;

      case 'follow_up':
        if (!content.includes('afspraak') && !content.includes('controle') && !content.includes('volgende')) {
          issues.push({
            type: 'length',
            message: 'Vervolgafspraken sectie mist afspraakinformatie',
            severity: 'medium'
          });
        }
        break;
    }
  }

  // Readability calculation (adapted Flesch formula for Dutch)
  private calculateReadabilityScore(content: string): number {
    const words = this.countWords(content);
    const sentences = this.countSentences(content);
    const syllables = this.countSyllables(content);

    if (sentences === 0 || words === 0) return 0;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    // Dutch Flesch formula (adjusted)
    const score = 206.835 - (0.93 * avgWordsPerSentence) - (58.5 * avgSyllablesPerWord);

    return Math.max(0, Math.min(100, score));
  }

  private determineLanguageLevel(score: number, issues: ContentValidationResult['issues']): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' {
    const highSeverityIssues = issues.filter(i => i.severity === 'high').length;
    const mediumSeverityIssues = issues.filter(i => i.severity === 'medium').length;

    if (score >= 80 && highSeverityIssues === 0 && mediumSeverityIssues <= 1) return 'A2';
    if (score >= 60 && highSeverityIssues === 0 && mediumSeverityIssues <= 3) return 'B1';
    if (score >= 40 && highSeverityIssues <= 1) return 'B2';
    if (score >= 20) return 'C1';
    return 'C2';
  }

  // Helper methods for text analysis
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private countSentences(text: string): number {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  private countSyllables(text: string): number {
    // Simplified Dutch syllable counting
    const words = this.splitIntoWords(text.toLowerCase());
    let totalSyllables = 0;

    words.forEach(word => {
      // Remove punctuation
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length === 0) return;

      // Count vowel groups (simplified for Dutch)
      const vowelGroups = cleanWord.match(/[aeiouy]+/g);
      let syllables = vowelGroups ? vowelGroups.length : 1;

      // Adjust for Dutch specific patterns
      if (cleanWord.endsWith('e') && syllables > 1) syllables--;
      if (cleanWord.endsWith('le') && syllables > 1) syllables--;

      totalSyllables += Math.max(1, syllables);
    });

    return totalSyllables;
  }

  private splitIntoWords(text: string): string[] {
    return text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  private splitIntoSentences(text: string): string[] {
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  }

  private findComplexWords(words: string[]): string[] {
    return words.filter(word => {
      // Complex if longer than 12 characters
      if (word.length > 12) return true;

      // Complex if has many syllables
      const syllables = this.countSyllables(word);
      if (syllables > 4) return true;

      // Complex if contains specific patterns
      if (/(?:isch|atie|eren|elijk)$/.test(word)) return true;

      return false;
    });
  }

  private detectPassiveVoice(content: string): number {
    const passivePatterns = [
      /\b(?:wordt|worden|werd|werden)\s+\w+/g,
      /\b(?:is|zijn|was|waren)\s+\w+(?:d|t|en)\b/g
    ];

    let count = 0;
    passivePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      count += matches ? matches.length : 0;
    });

    return count;
  }

  private hasProperListStructure(content: string): boolean {
    return /^[\s]*[-•*]\s/.test(content) || /^\d+\.\s/.test(content);
  }

  private shouldHaveList(content: string): boolean {
    const listIndicators = ['stappen', 'oefeningen', 'adviezen', 'tips', 'punten'];
    return listIndicators.some(indicator => content.toLowerCase().includes(indicator));
  }

  private findUnclearReferences(content: string): string[] {
    const unclearTerms = [];
    const vagueReferences = /\b(?:dit|dat|deze|die|het)\b/g;
    const matches = content.match(vagueReferences);

    if (matches && matches.length > content.split(/\s+/).length * 0.05) {
      unclearTerms.push('te veel vage verwijzingen');
    }

    return unclearTerms;
  }

  // Public utility methods
  updateOptions(options: Partial<ValidationOptions>): void {
    this.options = { ...this.options, ...options };
  }

  getValidationSummary(eduPack: EduPackContent): {
    overallScore: number;
    passingSections: number;
    totalSections: number;
    topIssues: string[];
    recommendations: string[];
  } {
    const result = this.validateEduPack(eduPack);
    const enabledSections = eduPack.sections.filter(s => s.enabled);

    const sectionScores = enabledSections.map(section => {
      const sectionResult = this.validateSection(section);
      return sectionResult.readabilityScore;
    });

    const passingSections = sectionScores.filter(score => score >= B1_CRITERIA.minReadabilityScore).length;

    const issueCounts: Record<string, number> = {};
    result.issues.forEach(issue => {
      issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
    });

    const topIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => `${type}: ${count}x`);

    return {
      overallScore: result.readabilityScore,
      passingSections,
      totalSections: enabledSections.length,
      topIssues,
      recommendations: result.suggestions.slice(0, 5)
    };
  }
}

// Export singleton instance
export const contentValidator = new EduPackContentValidator();

// Export factory for custom validation
export function createContentValidator(options: Partial<ValidationOptions> = {}): EduPackContentValidator {
  return new EduPackContentValidator(options);
}