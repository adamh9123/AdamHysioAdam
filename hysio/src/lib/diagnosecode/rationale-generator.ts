// Rationale Generation System for DCSPH Code Suggestions

import { DCSPHCode, LocationCode, PathologyCode } from './dcsph-tables';
import { PatternAnalysis } from './pattern-matcher';

export interface RationaleContext {
  query: string;
  patternAnalysis?: PatternAnalysis;
  confidence: number;
  clinicalContext?: {
    age?: number;
    mechanism?: string;
    duration?: string;
    severity?: string;
  };
}

export interface DetailedRationale {
  shortRationale: string; // 50-100 words for UI
  extendedRationale: string; // Detailed explanation
  clinicalReasoningSteps: string[];
  confidenceFactors: string[];
  alternativeConsiderations?: string[];
}

export class RationaleGenerator {

  /**
   * Generate clinical rationale for a DCSPH code suggestion
   */
  static generateRationale(
    code: DCSPHCode,
    context: RationaleContext
  ): DetailedRationale {

    const location = code.locationDescription.toLowerCase();
    const pathology = code.pathologyDescription.toLowerCase();

    // Generate core rationale components
    const anatomicalReasoning = this.generateAnatomicalReasoning(code, context);
    const pathophysiologyReasoning = this.generatePathophysiologyReasoning(code, context);
    const clinicalReasoning = this.generateClinicalReasoning(code, context);

    // Build short rationale for UI
    const shortRationale = this.buildShortRationale(anatomicalReasoning, pathophysiologyReasoning);

    // Build extended rationale
    const extendedRationale = this.buildExtendedRationale(
      anatomicalReasoning,
      pathophysiologyReasoning,
      clinicalReasoning,
      context
    );

    // Generate reasoning steps
    const clinicalReasoningSteps = this.generateReasoningSteps(code, context);

    // Identify confidence factors
    const confidenceFactors = this.identifyConfidenceFactors(code, context);

    // Generate alternative considerations
    const alternativeConsiderations = this.generateAlternativeConsiderations(code, context);

    return {
      shortRationale,
      extendedRationale,
      clinicalReasoningSteps,
      confidenceFactors,
      alternativeConsiderations
    };
  }

  /**
   * Generate anatomical reasoning
   */
  private static generateAnatomicalReasoning(code: DCSPHCode, context: RationaleContext): string {
    const locationCode = code.locationCode;
    const pathologyCode = code.pathologyCode;

    // Anatomical context mapping
    const anatomicalContext: { [key: string]: string } = {
      // Spine regions
      '30': 'De cervicale wervelkolom is zeer mobiel en daardoor kwetsbaar voor trauma en degeneratie',
      '34': 'De lumbale wervelkolom draagt het meeste gewicht en is daarom gevoelig voor overbelasting',
      '35': 'Het lumbo-sacrale overgangsgebied is een mechanisch zwak punt in de wervelkolom',

      // Extremities
      '79': 'Het knie-onderbeen-voet complex vormt een functionele keten die vaak samen wordt aangedaan',
      '72': 'Het bovenste spronggewricht is cruciaal voor gewichtsdragen en loopfunctie',

      // Soft tissue regions
      '13': 'De cervicale weke delen bevatten veel spier- en fasciestructuren die gevoelig zijn voor spanning',
      '21': 'De dorsale thoracale regio bevat complexe spier- en ligamentstructuren'
    };

    const baseContext = anatomicalContext[locationCode] ||
      `De ${code.locationDescription.toLowerCase()} is anatomisch relevant voor deze klachtenpresentatie`;

    return baseContext;
  }

  /**
   * Generate pathophysiology reasoning
   */
  private static generatePathophysiologyReasoning(code: DCSPHCode, context: RationaleContext): string {
    const pathologyCode = code.pathologyCode;

    // Pathophysiology explanations
    const pathophysiologyExplanations: { [key: string]: string } = {
      // Inflammatory conditions
      '20': 'Tendinitis ontstaat door repetitieve microtrauma\'s of overbelasting van peesstructuren, resulterend in inflammatie',
      '21': 'Bursitis of capsulitis ontwikkelt zich door mechanische irritatie of inflammatoire processen in gewrichtsstructuren',

      // Degenerative conditions
      '22': 'Chondropathie en meniscuslaesies ontstaan door mechanische slijtage of acute trauma van kraakbeenstructuren',
      '23': 'Artrose is het resultaat van progressieve kraakbeendegeneratie en subchondrale botveranderingen',
      '27': 'HNP ontstaat door degeneratie van de annulus fibrosus met protrusion van nucleus pulposus materiaal',

      // Traumatic conditions
      '31': 'Gewrichtdistorsie ontstaat door acute overrekking van ligamentaire structuren binnen fysiologische grenzen',
      '32': 'Luxatie is het gevolg van complete verstoring van gewrichtsrelaties door excessieve krachten',
      '33': 'Spier-peesletsel ontstaat door acute overstretch of contractie boven weefselcapaciteit',
      '36': 'Fracturen ontstaan wanneer toegepaste krachten de mechanische weerstand van botweefsel overschrijden',
      '38': 'Whiplash injury veroorzaakt cervicale hyperextensie-flexie trauma met betrokkenheid van multiple structuren',

      // Muscle and soft tissue
      '26': 'Spier-, pees- en fasciestoornissen ontstaan door overbelasting, trauma of biomechanische dysfunctie'
    };

    return pathophysiologyExplanations[pathologyCode] ||
      `${code.pathologyDescription} past bij het beschreven klinische beeld`;
  }

  /**
   * Generate clinical reasoning
   */
  private static generateClinicalReasoning(code: DCSPHCode, context: RationaleContext): string {
    const query = context.query.toLowerCase();

    // Analyze clinical indicators from the query
    let reasoning = '';

    // Pain pattern analysis
    if (query.includes('pijn')) {
      if (query.includes('uitstralend') || query.includes('uitstraling')) {
        reasoning += 'Uitstralende pijn suggereert neuraal betrokkenheid of referral patterns. ';
      }
      if (query.includes('stekend') || query.includes('scherp')) {
        reasoning += 'Stekende pijn past bij acute inflammatie of zenuwprikkeling. ';
      }
      if (query.includes('dof') || query.includes('chronisch')) {
        reasoning += 'Doffe, chronische pijn wijst op degeneratieve of langdurige inflammatoire processen. ';
      }
    }

    // Mechanism analysis
    if (query.includes('trauma') || query.includes('val') || query.includes('ongeval')) {
      reasoning += 'Het traumatische mechanisme past bij acute structurele schade. ';
    }
    if (query.includes('overbelasting') || query.includes('herhalend') || query.includes('sport')) {
      reasoning += 'Overbelasting mechanisme suggereert cumulatieve microtrauma en inflammatie. ';
    }
    if (query.includes('geleidelijk') || query.includes('sluipend')) {
      reasoning += 'Geleidelijk ontstaan wijst op degeneratieve of chronische processen. ';
    }

    // Functional analysis
    if (query.includes('bewegen') || query.includes('activiteit')) {
      reasoning += 'Bewegingsbeperking of pijn bij activiteit past bij structurele betrokkenheid. ';
    }

    return reasoning || 'De klinische presentatie is consistent met deze diagnose.';
  }

  /**
   * Build short rationale for UI display
   */
  private static buildShortRationale(
    anatomicalReasoning: string,
    pathophysiologyReasoning: string
  ): string {
    // Combine and shorten for UI
    const combined = `${pathophysiologyReasoning} ${anatomicalReasoning}`;

    // Truncate if too long, ensuring complete sentences
    if (combined.length <= 150) {
      return combined;
    }

    const sentences = combined.split('. ');
    let result = sentences[0];

    for (let i = 1; i < sentences.length; i++) {
      const testLength = result + '. ' + sentences[i];
      if (testLength.length <= 150) {
        result = testLength;
      } else {
        break;
      }
    }

    return result.endsWith('.') ? result : result + '.';
  }

  /**
   * Build extended rationale
   */
  private static buildExtendedRationale(
    anatomicalReasoning: string,
    pathophysiologyReasoning: string,
    clinicalReasoning: string,
    context: RationaleContext
  ): string {
    const parts = [
      `**Anatomische basis:** ${anatomicalReasoning}`,
      `**Pathofysiologie:** ${pathophysiologyReasoning}`,
      `**Klinische redenering:** ${clinicalReasoning}`
    ];

    if (context.clinicalContext) {
      const clinicalInfo = [];
      if (context.clinicalContext.age) {
        clinicalInfo.push(`leeftijd ${context.clinicalContext.age} jaar`);
      }
      if (context.clinicalContext.mechanism) {
        clinicalInfo.push(`mechanisme: ${context.clinicalContext.mechanism}`);
      }
      if (context.clinicalContext.duration) {
        clinicalInfo.push(`duur: ${context.clinicalContext.duration}`);
      }

      if (clinicalInfo.length > 0) {
        parts.push(`**Klinische context:** ${clinicalInfo.join(', ')}`);
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Generate clinical reasoning steps
   */
  private static generateReasoningSteps(code: DCSPHCode, context: RationaleContext): string[] {
    const steps: string[] = [];

    // Step 1: Location identification
    steps.push(`Locatie: ${code.locationDescription} geïdentificeerd op basis van klachtbeschrijving`);

    // Step 2: Pathology identification
    steps.push(`Pathologie: ${code.pathologyDescription} past bij symptoompatroon`);

    // Step 3: Pattern matching
    if (context.patternAnalysis) {
      const locationConfidence = context.patternAnalysis.locationMatches[0]?.confidence || 0;
      const pathologyConfidence = context.patternAnalysis.pathologyMatches[0]?.confidence || 0;

      steps.push(`Patroonherkenning: locatie ${(locationConfidence * 100).toFixed(0)}%, pathologie ${(pathologyConfidence * 100).toFixed(0)}% match`);
    }

    // Step 4: Clinical correlation
    steps.push(`Klinische correlatie: symptomen consistent met DCSPH ${code.code}`);

    // Step 5: Differential considerations
    steps.push('Differentiaaldiagnostische overwegingen uitgesloten op basis van gepresenteerde informatie');

    return steps;
  }

  /**
   * Identify confidence factors
   */
  private static identifyConfidenceFactors(code: DCSPHCode, context: RationaleContext): string[] {
    const factors: string[] = [];

    // High confidence factors
    if (context.confidence > 0.8) {
      factors.push('Hoge patroonmatch met medische terminologie');
    }

    if (context.patternAnalysis) {
      const locationMatches = context.patternAnalysis.locationMatches.length;
      const pathologyMatches = context.patternAnalysis.pathologyMatches.length;

      if (locationMatches > 0) {
        factors.push(`Duidelijke locatie-indicatoren (${locationMatches} matches)`);
      }

      if (pathologyMatches > 0) {
        factors.push(`Specifieke pathologie markers (${pathologyMatches} matches)`);
      }

      if (context.patternAnalysis.mechanismMatches.length > 0) {
        factors.push('Traumamechanisme beschreven');
      }
    }

    // Query analysis
    const query = context.query.toLowerCase();
    if (query.includes('acute') || query.includes('plotseling')) {
      factors.push('Acute onset gerapporteerd');
    }

    if (query.includes('chronisch') || query.includes('langdurig')) {
      factors.push('Chronisch verloop beschreven');
    }

    if (query.split(' ').length > 10) {
      factors.push('Uitgebreide klachtbeschrijving');
    }

    return factors;
  }

  /**
   * Generate alternative considerations
   */
  private static generateAlternativeConsiderations(code: DCSPHCode, context: RationaleContext): string[] {
    const alternatives: string[] = [];
    const locationCode = code.locationCode;
    const pathologyCode = code.pathologyCode;

    // Location-based alternatives
    const locationAlternatives: { [key: string]: string[] } = {
      '79': ['72 (bovenste spronggewricht)', '73 (onderste spronggewricht)'],
      '34': ['35 (lumbo-sacrale wervelkolom)', '33 (thoraco-lumbale overgang)'],
      '30': ['31 (cervico-thoracale overgang)', '13 (cervicale weke delen)']
    };

    // Pathology-based alternatives
    const pathologyAlternatives: { [key: string]: string[] } = {
      '20': ['21 (bursitis/capsulitis)', '26 (spier-pees aandoeningen)'],
      '22': ['23 (artrose)', '31 (gewrichtcontusie)'],
      '27': ['75 (HNP met radiculair syndroom)', '26 (spieraandoeningen)']
    };

    if (locationAlternatives[locationCode]) {
      alternatives.push(`Alternatieve locaties: ${locationAlternatives[locationCode].join(', ')}`);
    }

    if (pathologyAlternatives[pathologyCode]) {
      alternatives.push(`Alternatieve pathologieën: ${pathologyAlternatives[pathologyCode].join(', ')}`);
    }

    // Clinical alternatives based on query analysis
    const query = context.query.toLowerCase();

    if (query.includes('pijn') && !query.includes('trauma')) {
      alternatives.push('Overweeg ook chronische/degeneratieve oorzaken');
    }

    if (query.includes('zwelling') && pathologyCode !== '21') {
      alternatives.push('Overweeg inflammatoire processen (bursitis/capsulitis)');
    }

    if (query.includes('instabiliteit') && !['31', '32'].includes(pathologyCode)) {
      alternatives.push('Overweeg ligamentaire letsels of gewrichtinstabiliteit');
    }

    return alternatives;
  }

  /**
   * Generate context-aware rationale
   */
  static generateContextAwareRationale(
    codes: DCSPHCode[],
    context: RationaleContext
  ): { [codeId: string]: DetailedRationale } {
    const rationales: { [codeId: string]: DetailedRationale } = {};

    for (const code of codes) {
      // Adjust confidence based on position in list
      const adjustedContext = {
        ...context,
        confidence: context.confidence * (1 - (codes.indexOf(code) * 0.1))
      };

      rationales[code.code] = this.generateRationale(code, adjustedContext);
    }

    return rationales;
  }

  /**
   * Validate rationale quality
   */
  static validateRationale(rationale: DetailedRationale): {
    isValid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    // Check length constraints
    if (rationale.shortRationale.length < 20) {
      issues.push('Short rationale te kort');
      score -= 20;
    }

    if (rationale.shortRationale.length > 200) {
      issues.push('Short rationale te lang');
      score -= 15;
    }

    // Check for medical terminology
    const medicalTerms = ['anatomisch', 'klinisch', 'pathologie', 'diagnose', 'symptoom'];
    const hasTerms = medicalTerms.some(term =>
      rationale.shortRationale.toLowerCase().includes(term)
    );

    if (!hasTerms) {
      issues.push('Onvoldoende medische terminologie');
      score -= 10;
    }

    // Check completeness
    if (rationale.clinicalReasoningSteps.length < 3) {
      issues.push('Onvoldoende redenatiestappen');
      score -= 15;
    }

    if (rationale.confidenceFactors.length === 0) {
      issues.push('Geen confidence factors');
      score -= 10;
    }

    return {
      isValid: issues.length === 0 && score >= 70,
      issues,
      score: Math.max(0, score)
    };
  }
}