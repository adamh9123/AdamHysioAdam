// Personalization Engine for Hysio EduPack Module
// Advanced patient-specific content customization based on age, condition, and context

import type {
  EduPackGenerationRequest,
  EduPackContent,
  SectionContent,
  EduPackSectionType
} from '@/lib/types/edupack';
import { getSectionTemplate, customizeTemplateForPatient } from './section-templates';
import type { ExtractedSessionData } from './session-data-parser';

export interface PersonalizationProfile {
  // Demographics
  age?: number;
  gender?: 'male' | 'female';
  educationLevel?: 'low' | 'medium' | 'high';

  // Medical context
  primaryCondition?: string;
  comorbidities?: string[];
  severityLevel?: 'mild' | 'moderate' | 'severe';
  chronicCondition?: boolean;

  // Functional status
  mobilityLevel?: 'independent' | 'assisted' | 'dependent';
  cognitiveLevel?: 'normal' | 'mild_impairment' | 'significant_impairment';
  painLevel?: number; // 0-10 scale

  // Social context
  livingSituation?: 'independent' | 'family' | 'care_facility';
  workStatus?: 'employed' | 'retired' | 'disabled' | 'student';
  sportsActivity?: 'none' | 'recreational' | 'competitive';

  // Communication preferences
  languageLevel?: 'simple' | 'standard' | 'advanced';
  preferredTone?: 'formal' | 'informal';
  motivationStyle?: 'direct' | 'encouraging' | 'scientific';

  // Session context
  sessionType?: 'intake' | 'followup' | 'discharge';
  treatmentPhase?: 'acute' | 'subacute' | 'chronic' | 'maintenance';
  complianceHistory?: 'excellent' | 'good' | 'poor';
}

export interface PersonalizationRules {
  ageRules: AgeBasedRules;
  conditionRules: ConditionBasedRules;
  contextRules: ContextBasedRules;
  communicationRules: CommunicationRules;
}

interface AgeBasedRules {
  young: { minAge: number; maxAge: number; adaptations: PersonalizationAdaptation };
  middleAged: { minAge: number; maxAge: number; adaptations: PersonalizationAdaptation };
  elderly: { minAge: number; maxAge: number; adaptations: PersonalizationAdaptation };
}

interface ConditionBasedRules {
  [condition: string]: PersonalizationAdaptation;
}

interface ContextBasedRules {
  [context: string]: PersonalizationAdaptation;
}

interface CommunicationRules {
  [style: string]: PersonalizationAdaptation;
}

interface PersonalizationAdaptation {
  vocabularyLevel: 'simple' | 'standard' | 'complex';
  sentenceLength: 'short' | 'medium' | 'long';
  explanationDepth: 'basic' | 'detailed' | 'comprehensive';
  motivationalTone: 'neutral' | 'encouraging' | 'urgent';
  technicalDetail: 'minimal' | 'moderate' | 'extensive';
  exampleTypes: string[];
  focusAreas: string[];
  avoidTopics?: string[];
}

// Default personalization rules
const DEFAULT_PERSONALIZATION_RULES: PersonalizationRules = {
  ageRules: {
    young: {
      minAge: 18,
      maxAge: 35,
      adaptations: {
        vocabularyLevel: 'standard',
        sentenceLength: 'medium',
        explanationDepth: 'detailed',
        motivationalTone: 'encouraging',
        technicalDetail: 'moderate',
        exampleTypes: ['sport', 'werk', 'uitgaan', 'fitness'],
        focusAreas: ['snelHerstel', 'sportTerugkeer', 'werkCapaciteit', 'voorkoming']
      }
    },
    middleAged: {
      minAge: 36,
      maxAge: 65,
      adaptations: {
        vocabularyLevel: 'standard',
        sentenceLength: 'medium',
        explanationDepth: 'comprehensive',
        motivationalTone: 'neutral',
        technicalDetail: 'moderate',
        exampleTypes: ['werk', 'gezin', 'hobby', 'tuin'],
        focusAreas: ['functionaliteit', 'werkCapaciteit', 'dagelijkseLeven', 'pijnManagement']
      }
    },
    elderly: {
      minAge: 66,
      maxAge: 120,
      adaptations: {
        vocabularyLevel: 'simple',
        sentenceLength: 'short',
        explanationDepth: 'basic',
        motivationalTone: 'encouraging',
        technicalDetail: 'minimal',
        exampleTypes: ['dagelijkseLeven', 'huishouden', 'lopen', 'traplopen'],
        focusAreas: ['veiligheid', 'zelfstandigheid', 'valPreventie', 'mobiliteit'],
        avoidTopics: ['complexeOefeningen', 'snelleBeweging']
      }
    }
  },
  conditionRules: {
    'rugklachten': {
      vocabularyLevel: 'standard',
      sentenceLength: 'medium',
      explanationDepth: 'detailed',
      motivationalTone: 'encouraging',
      technicalDetail: 'moderate',
      exampleTypes: ['zitten', 'tillen', 'bukken', 'slapen'],
      focusAreas: ['houding', 'ergonomie', 'core-stabiliteit', 'pijnManagement']
    },
    'nekklachten': {
      vocabularyLevel: 'standard',
      sentenceLength: 'medium',
      explanationDepth: 'detailed',
      motivationalTone: 'encouraging',
      technicalDetail: 'moderate',
      exampleTypes: ['computerwerk', 'autorijden', 'slapen', 'stress'],
      focusAreas: ['houding', 'ergonomie', 'stressManagement', 'mobiliteit']
    },
    'knieklachten': {
      vocabularyLevel: 'standard',
      sentenceLength: 'medium',
      explanationDepth: 'detailed',
      motivationalTone: 'encouraging',
      technicalDetail: 'moderate',
      exampleTypes: ['lopen', 'traplopen', 'sport', 'fietsen'],
      focusAreas: ['belasting', 'kracht', 'stabiliteit', 'gewichtsmanagement']
    }
  },
  contextRules: {
    'acute': {
      vocabularyLevel: 'simple',
      sentenceLength: 'short',
      explanationDepth: 'basic',
      motivationalTone: 'neutral',
      technicalDetail: 'minimal',
      exampleTypes: ['rust', 'bescherming', 'pijnVerlichting'],
      focusAreas: ['pijnManagement', 'bescherming', 'geleidelijkeToename']
    },
    'chronic': {
      vocabularyLevel: 'standard',
      sentenceLength: 'medium',
      explanationDepth: 'comprehensive',
      motivationalTone: 'encouraging',
      technicalDetail: 'moderate',
      exampleTypes: ['aanpassing', 'management', 'zelfmanagement'],
      focusAreas: ['management', 'aanpassing', 'kwaliteitVanLeven', 'zelfeffectiviteit']
    }
  },
  communicationRules: {
    'formal': {
      vocabularyLevel: 'standard',
      sentenceLength: 'medium',
      explanationDepth: 'detailed',
      motivationalTone: 'neutral',
      technicalDetail: 'moderate',
      exampleTypes: ['professioneel', 'beleefd'],
      focusAreas: ['respect', 'professionaliteit']
    },
    'informal': {
      vocabularyLevel: 'simple',
      sentenceLength: 'short',
      explanationDepth: 'basic',
      motivationalTone: 'encouraging',
      technicalDetail: 'minimal',
      exampleTypes: ['vriendelijk', 'toegankelijk'],
      focusAreas: ['toegankelijkheid', 'persoonlijkheid']
    }
  }
};

export class PersonalizationEngine {
  private rules: PersonalizationRules;

  constructor(customRules?: Partial<PersonalizationRules>) {
    this.rules = { ...DEFAULT_PERSONALIZATION_RULES, ...customRules };
  }

  // Main personalization function
  personalizeEduPack(
    baseContent: EduPackContent,
    profile: PersonalizationProfile,
    sessionData?: ExtractedSessionData
  ): EduPackContent {
    // Create personalized copy
    const personalizedContent: EduPackContent = {
      ...baseContent,
      sections: baseContent.sections.map(section =>
        this.personalizeSection(section, profile, sessionData)
      )
    };

    // Apply global personalizations
    personalizedContent.tone = this.determineTone(profile);
    personalizedContent.language = 'nl'; // Currently Dutch only

    return personalizedContent;
  }

  // Personalize individual section
  private personalizeSection(
    section: SectionContent,
    profile: PersonalizationProfile,
    sessionData?: ExtractedSessionData
  ): SectionContent {
    if (!section.enabled || !section.content.trim()) {
      return section;
    }

    // Get personalization adaptations
    const adaptations = this.getPersonalizationAdaptations(profile);

    // Apply content modifications
    let personalizedContent = section.content;

    // Vocabulary level adjustments
    personalizedContent = this.adjustVocabulary(personalizedContent, adaptations.vocabularyLevel);

    // Sentence length adjustments
    personalizedContent = this.adjustSentenceLength(personalizedContent, adaptations.sentenceLength);

    // Add examples relevant to the patient
    personalizedContent = this.addRelevantExamples(
      personalizedContent,
      section.type,
      adaptations.exampleTypes,
      profile
    );

    // Adjust motivational tone
    personalizedContent = this.adjustMotivationalTone(personalizedContent, adaptations.motivationalTone);

    // Focus on relevant areas
    personalizedContent = this.emphasizeFocusAreas(
      personalizedContent,
      section.type,
      adaptations.focusAreas,
      profile
    );

    // Remove inappropriate content
    if (adaptations.avoidTopics) {
      personalizedContent = this.removeAvoidedTopics(personalizedContent, adaptations.avoidTopics);
    }

    return {
      ...section,
      content: personalizedContent
    };
  }

  // Determine overall personalization adaptations
  private getPersonalizationAdaptations(profile: PersonalizationProfile): PersonalizationAdaptation {
    // Start with default adaptation
    let adaptations: PersonalizationAdaptation = {
      vocabularyLevel: 'standard',
      sentenceLength: 'medium',
      explanationDepth: 'detailed',
      motivationalTone: 'neutral',
      technicalDetail: 'moderate',
      exampleTypes: ['algemeen'],
      focusAreas: ['algemeen']
    };

    // Apply age-based rules
    if (profile.age) {
      const ageRule = this.getAgeRule(profile.age);
      if (ageRule) {
        adaptations = this.mergeAdaptations(adaptations, ageRule.adaptations);
      }
    }

    // Apply condition-based rules
    if (profile.primaryCondition) {
      const conditionRule = this.rules.conditionRules[profile.primaryCondition.toLowerCase()];
      if (conditionRule) {
        adaptations = this.mergeAdaptations(adaptations, conditionRule);
      }
    }

    // Apply context-based rules
    if (profile.treatmentPhase) {
      const contextRule = this.rules.contextRules[profile.treatmentPhase];
      if (contextRule) {
        adaptations = this.mergeAdaptations(adaptations, contextRule);
      }
    }

    // Apply communication preferences
    if (profile.preferredTone) {
      const commRule = this.rules.communicationRules[profile.preferredTone];
      if (commRule) {
        adaptations = this.mergeAdaptations(adaptations, commRule);
      }
    }

    // Apply special adjustments for cognitive or physical limitations
    if (profile.cognitiveLevel === 'mild_impairment' || profile.cognitiveLevel === 'significant_impairment') {
      adaptations.vocabularyLevel = 'simple';
      adaptations.sentenceLength = 'short';
      adaptations.explanationDepth = 'basic';
    }

    return adaptations;
  }

  private getAgeRule(age: number): { minAge: number; maxAge: number; adaptations: PersonalizationAdaptation } | null {
    if (age >= this.rules.ageRules.young.minAge && age <= this.rules.ageRules.young.maxAge) {
      return this.rules.ageRules.young;
    }
    if (age >= this.rules.ageRules.middleAged.minAge && age <= this.rules.ageRules.middleAged.maxAge) {
      return this.rules.ageRules.middleAged;
    }
    if (age >= this.rules.ageRules.elderly.minAge && age <= this.rules.ageRules.elderly.maxAge) {
      return this.rules.ageRules.elderly;
    }
    return null;
  }

  private mergeAdaptations(base: PersonalizationAdaptation, override: PersonalizationAdaptation): PersonalizationAdaptation {
    return {
      vocabularyLevel: override.vocabularyLevel || base.vocabularyLevel,
      sentenceLength: override.sentenceLength || base.sentenceLength,
      explanationDepth: override.explanationDepth || base.explanationDepth,
      motivationalTone: override.motivationalTone || base.motivationalTone,
      technicalDetail: override.technicalDetail || base.technicalDetail,
      exampleTypes: [...base.exampleTypes, ...override.exampleTypes],
      focusAreas: [...base.focusAreas, ...override.focusAreas],
      avoidTopics: override.avoidTopics ? [...(base.avoidTopics || []), ...override.avoidTopics] : base.avoidTopics
    };
  }

  // Content modification methods
  private adjustVocabulary(content: string, level: 'simple' | 'standard' | 'complex'): string {
    if (level === 'simple') {
      // Replace complex words with simpler alternatives
      const replacements = {
        'medicatie': 'medicijnen',
        'inflammatie': 'ontsteking',
        'degeneratie': 'slijtage',
        'mobilisatie': 'bewegen',
        'stabilisatie': 'verstevigen',
        'optimaliseren': 'verbeteren',
        'implementeren': 'toepassen',
        'faciliteren': 'helpen',
        'progressie': 'vooruitgang',
        'interventie': 'behandeling'
      };

      let simplifiedContent = content;
      Object.entries(replacements).forEach(([complex, simple]) => {
        const regex = new RegExp(`\\b${complex}\\b`, 'gi');
        simplifiedContent = simplifiedContent.replace(regex, simple);
      });

      return simplifiedContent;
    }

    return content;
  }

  private adjustSentenceLength(content: string, length: 'short' | 'medium' | 'long'): string {
    if (length === 'short') {
      // Split long sentences at conjunctions
      return content
        .replace(/,\s*(?:en|of|maar|omdat|als|wanneer)\s*/g, '. ')
        .replace(/\.\s*\./g, '.')
        .replace(/\s+/g, ' ')
        .trim();
    }

    return content;
  }

  private addRelevantExamples(
    content: string,
    sectionType: EduPackSectionType,
    exampleTypes: string[],
    profile: PersonalizationProfile
  ): string {
    // Add context-specific examples based on patient profile
    const examples = this.generateExamples(sectionType, exampleTypes, profile);

    if (examples.length > 0 && !this.hasExamples(content)) {
      const exampleText = `\n\nVoorbeelden:\n${examples.join('\n')}`;
      return content + exampleText;
    }

    return content;
  }

  private generateExamples(
    sectionType: EduPackSectionType,
    exampleTypes: string[],
    profile: PersonalizationProfile
  ): string[] {
    const examples: string[] = [];

    // Generate examples based on section type and patient context
    if (sectionType === 'self_care' && exampleTypes.includes('werk')) {
      if (profile.workStatus === 'employed') {
        examples.push('• Zorg voor een goede werkplek met ondersteuning voor uw rug');
        examples.push('• Sta elk uur op en loop een rondje door het kantoor');
      }
    }

    if (sectionType === 'treatment_plan' && exampleTypes.includes('sport')) {
      if (profile.sportsActivity === 'recreational' || profile.sportsActivity === 'competitive') {
        examples.push('• Bouw sportactiviteiten geleidelijk weer op');
        examples.push('• Warm goed op voor elke sportactiviteit');
      }
    }

    if (sectionType === 'warning_signs' && profile.age && profile.age > 65) {
      examples.push('• Plotselinge verhoogde pijn na een val');
      examples.push('• Duizeligheid bij het opstaan');
    }

    return examples;
  }

  private adjustMotivationalTone(content: string, tone: 'neutral' | 'encouraging' | 'urgent'): string {
    if (tone === 'encouraging') {
      // Add encouraging phrases
      const encouragingPhrases = [
        'U bent op de goede weg',
        'Elke kleine stap telt',
        'Uw lichaam kan zich herstellen',
        'Blijf positief',
        'U doet het goed'
      ];

      // Randomly add one encouraging phrase if not already present
      const hasEncouragement = encouragingPhrases.some(phrase => content.toLowerCase().includes(phrase.toLowerCase()));

      if (!hasEncouragement && Math.random() > 0.7) {
        const randomPhrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
        return content + `\n\n${randomPhrase}!`;
      }
    }

    return content;
  }

  private emphasizeFocusAreas(
    content: string,
    sectionType: EduPackSectionType,
    focusAreas: string[],
    profile: PersonalizationProfile
  ): string {
    // Add emphasis on relevant focus areas
    if (focusAreas.includes('veiligheid') && profile.age && profile.age > 65) {
      if (sectionType === 'self_care' && !content.includes('veilig')) {
        content += '\n\nLet vooral op veiligheid bij alle oefeningen en activiteiten.';
      }
    }

    if (focusAreas.includes('werkCapaciteit') && profile.workStatus === 'employed') {
      if (sectionType === 'treatment_plan' && !content.includes('werk')) {
        content += '\n\nEen belangrijk doel is om u weer volledig te laten functioneren op het werk.';
      }
    }

    return content;
  }

  private removeAvoidedTopics(content: string, avoidTopics: string[]): string {
    let filteredContent = content;

    avoidTopics.forEach(topic => {
      if (topic === 'complexeOefeningen') {
        // Remove references to complex exercises
        filteredContent = filteredContent.replace(/(?:complexe|geavanceerde|moeilijke)\s+oefeningen?/gi, 'eenvoudige oefeningen');
      }
      if (topic === 'snelleBeweging') {
        // Remove references to fast movements
        filteredContent = filteredContent.replace(/(?:snel|vlug|rap)\s+bewegen/gi, 'rustig bewegen');
      }
    });

    return filteredContent;
  }

  // Utility methods
  private determineTone(profile: PersonalizationProfile): 'formal' | 'informal' {
    if (profile.preferredTone) {
      return profile.preferredTone;
    }

    // Default based on age
    if (profile.age) {
      return profile.age > 50 ? 'formal' : 'informal';
    }

    return 'formal';
  }

  private hasExamples(content: string): boolean {
    return content.toLowerCase().includes('bijvoorbeeld') ||
           content.toLowerCase().includes('voorbeeld') ||
           content.includes('•') ||
           /^\d+\./.test(content);
  }

  // Public methods for extracting personalization profile
  static extractPersonalizationProfile(
    request: EduPackGenerationRequest,
    sessionData?: ExtractedSessionData
  ): PersonalizationProfile {
    const profile: PersonalizationProfile = {};

    // Extract from request data
    if (request.sessionData?.patientInfo) {
      profile.age = request.sessionData.patientInfo.age;
      profile.primaryCondition = request.sessionData.patientInfo.condition;
    }

    if (request.manualInput?.patientInfo) {
      profile.age = request.manualInput.patientInfo.age;
      profile.primaryCondition = request.manualInput.patientInfo.condition;
    }

    // Extract from session data
    if (sessionData) {
      profile.sessionType = sessionData.sessionInfo.type;
      profile.painLevel = sessionData.findings.painLevel;

      // Determine treatment phase from session context
      if (sessionData.sessionInfo.therapistNotes) {
        const notes = sessionData.sessionInfo.therapistNotes.toLowerCase();
        if (notes.includes('acute') || notes.includes('recent')) {
          profile.treatmentPhase = 'acute';
        } else if (notes.includes('chronisch') || notes.includes('langdurig')) {
          profile.treatmentPhase = 'chronic';
        } else {
          profile.treatmentPhase = 'subacute';
        }
      }

      // Extract work status from goals/context
      if (sessionData.treatment.goals?.some(goal => goal.includes('werk'))) {
        profile.workStatus = 'employed';
      }

      // Extract sports activity
      if (sessionData.treatment.goals?.some(goal => goal.includes('sport'))) {
        profile.sportsActivity = 'recreational';
      }
    }

    // Extract communication preferences
    profile.preferredTone = request.preferences.tone;

    // Set defaults
    profile.educationLevel = profile.educationLevel || 'medium';
    profile.languageLevel = profile.languageLevel || 'standard';
    profile.motivationStyle = profile.motivationStyle || 'encouraging';

    return profile;
  }

  // Update personalization rules
  updateRules(newRules: Partial<PersonalizationRules>): void {
    this.rules = { ...this.rules, ...newRules };
  }

  // Get current rules
  getRules(): PersonalizationRules {
    return { ...this.rules };
  }
}

// Export singleton instance
export const personalizationEngine = new PersonalizationEngine();

// Export factory function
export function createPersonalizationEngine(rules?: Partial<PersonalizationRules>): PersonalizationEngine {
  return new PersonalizationEngine(rules);
}