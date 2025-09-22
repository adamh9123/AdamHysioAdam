// AI Content Generator for Hysio EduPack Module
// Specialized GPT-4.1-mini integration for B1-level Dutch patient education content

import { generateContentWithOpenAI, type OpenAICompletionOptions, HYSIO_LLM_MODEL } from '@/lib/api/openai';
import type {
  EduPackGenerationRequest,
  EduPackGenerationResponse,
  EduPackContent,
  SectionContent,
  EduPackSectionType,
  ContentValidationResult
} from '@/lib/types/edupack';
import type { SOEPStructure, PatientInfo } from '@/lib/types';
// Generate unique ID for EduPack templates
function generateEduPackId(): string {
  return `edu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// B1-level Dutch prompting configuration
const B1_LANGUAGE_PROMPT = `
Je bent een ervaren medische communicatiespecialist die patiëntvriendelijke samenvattingen schrijft voor fysiotherapiepatiënten in Nederland.

TAALVEREISTEN:
- Schrijf ALTIJD in Nederlands op B1-niveau (middelbaar onderwijs)
- Gebruik korte, duidelijke zinnen (max 20 woorden per zin)
- Vermijd medische jargon; leg moeilijke termen uit in gewone woorden
- Gebruik actieve vorm waar mogelijk
- Maak concrete, begrijpelijke uitleg

STIJLVEREISTEN:
- Warme maar professionele toon
- Spreek de patiënt direct aan met "u" (formeel) of "je" (informeel)
- Geef hoop en motivatie
- Vermeid angst of onzekerheid
- Gebruik positieve bewoordingen

MEDISCHE VEILIGHEID:
- Geef NOOIT medisch advies dat niet in de brondata staat
- Voeg NOOIT diagnoses toe die niet zijn genoemd
- Herhaal ALLEEN behandeladviezen die expliciet zijn gegeven
- Bij twijfel: verwijs naar de behandelaar
`;

const SECTION_PROMPTS: Record<EduPackSectionType, string> = {
  introduction: `
Schrijf een warme, persoonlijke introductie voor de patiënt.
Inhoud: Datum van bezoek, type afspraak (eerste bezoek/controle), doel van samenvatting.
Toon: Welkom, erkentelijk, professioneel maar toegankelijk.
Structuur: 2-3 korte alinea's, max 150 woorden.
  `,

  session_summary: `
Vat samen wat er tijdens het gesprek is besproken.
Inhoud: Hoofdklachten, wat patiënt heeft verteld, belangrijkste bevindingen.
Toon: Bevestigend, begripvol, objectief.
Structuur: Puntlijst of korte alinea's, max 200 woorden.
Vermijd: Interne notities, persoonlijke opmerkingen therapeut.
  `,

  diagnosis: `
Leg de diagnose of bevindingen uit in begrijpelijke taal.
Inhoud: Wat er aan de hand is, waarom dit gebeurt, wat het betekent.
Toon: Geruststellend maar eerlijk, informatief.
Structuur: Begin met hoofdboodschap, daarna uitleg, max 250 woorden.
Gebruik: Vergelijkingen uit het dagelijks leven waar mogelijk.
  `,

  treatment_plan: `
Beschrijf het behandelplan en doelen helder.
Inhoud: Wat gaan we doen, waarom, hoe lang, wat is het doel.
Toon: Optimistisch, motiverend, realistisch.
Structuur: Stappen in logische volgorde, max 300 woorden.
Focus: Wat de patiënt kan verwachten en hoe zij kunnen meehelpen.
  `,

  self_care: `
Geef praktische zelfzorginstructies die de patiënt thuis kan doen.
Inhoud: Oefeningen, leefstijladviezen, doe's en don'ts.
Toon: Bemoedigend, praktisch, begrijpelijk.
Structuur: Genummerde stappen of puntlijst, max 400 woorden.
Belangrijk: Alleen adviezen geven die expliciet zijn besproken.
  `,

  warning_signs: `
Beschrijf signalen waarbij de patiënt contact moet opnemen.
Inhoud: Wanneer bellen, bij welke klachten, hoe urgent.
Toon: Kalm maar duidelijk, niet beangstigend.
Structuur: Duidelijke lijst met concrete signalen, max 150 woorden.
Include: Contactgegevens en tijden waarop te bereiken.
  `,

  follow_up: `
Geef informatie over vervolgafspraken en planning.
Inhoud: Wanneer, waarom, wat gaan we dan doen.
Toon: Vooruitkijkend, samenwerkend.
Structuur: Concrete planning en verwachtingen, max 150 woorden.
Include: Praktische informatie over afspraken maken.
  `
};

interface GenerationContext {
  patientAge?: number;
  sessionType: 'intake' | 'followup';
  condition?: string;
  tone: 'formal' | 'informal';
  language: 'nl' | 'en';
}

export class EduPackContentGenerator {
  private static instance: EduPackContentGenerator;

  static getInstance(): EduPackContentGenerator {
    if (!this.instance) {
      this.instance = new EduPackContentGenerator();
    }
    return this.instance;
  }

  async generateEduPack(request: EduPackGenerationRequest): Promise<EduPackGenerationResponse> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!this.validateGenerationRequest(request)) {
        return {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid generation request parameters'
          },
          processingTime: Date.now() - startTime
        };
      }

      // Extract context from session data or manual input
      const context = this.extractGenerationContext(request);

      // Generate content for each requested section
      const sections: SectionContent[] = [];
      let totalTokens = 0;

      for (const sectionType of request.preferences.sections) {
        const sectionContent = await this.generateSection(
          sectionType,
          request,
          context
        );

        if (sectionContent) {
          sections.push(sectionContent);
          totalTokens += 100; // Approximate token count
        }
      }

      // Create EduPack content object
      const eduPackContent: EduPackContent = {
        id: generateEduPackId(),
        patientName: request.sessionData?.patientInfo?.name || request.manualInput?.patientInfo?.name,
        sessionDate: new Date(),
        sessionType: context.sessionType,
        language: request.preferences.language,
        tone: request.preferences.tone,
        wordCount: request.preferences.wordCount,
        sections: sections.sort((a, b) => a.order - b.order),
        generatedAt: new Date(),
        lastModified: new Date(),
        generatedBy: request.therapistId,
        status: 'draft'
      };

      return {
        success: true,
        eduPackId: eduPackContent.id,
        content: eduPackContent,
        processingTime: Date.now() - startTime,
        tokensUsed: totalTokens
      };

    } catch (error) {
      console.error('EduPack generation error:', error);
      return {
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate EduPack content',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        processingTime: Date.now() - startTime
      };
    }
  }

  private async generateSection(
    sectionType: EduPackSectionType,
    request: EduPackGenerationRequest,
    context: GenerationContext
  ): Promise<SectionContent | null> {
    try {
      const systemPrompt = this.buildSystemPrompt(sectionType, context, request.preferences.wordCount);
      const userPrompt = this.buildUserPrompt(sectionType, request);

      // Calculate max tokens based on word count preference
      const wordCountTokens = this.getTokensForWordCount(request.preferences.wordCount, request.preferences.sections.length);

      const options: OpenAICompletionOptions = {
        model: HYSIO_LLM_MODEL,
        temperature: 0.8, // Optimized for creative yet reliable patient education content
        max_tokens: Math.max(wordCountTokens, 1000), // Sufficient tokens for educational content
        top_p: 0.9,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      };

      const response = await generateContentWithOpenAI(
        systemPrompt,
        userPrompt,
        options
      );

      if (!response.success || !response.content) {
        console.error(`Failed to generate section ${sectionType}:`, response.error);
        return null;
      }

      return {
        id: `${sectionType}_${Date.now()}`,
        type: sectionType,
        title: this.getSectionTitle(sectionType),
        content: response.content.trim(),
        enabled: true,
        icon: this.getSectionIcon(sectionType),
        order: this.getSectionOrder(sectionType),
        lastModified: new Date()
      };

    } catch (error) {
      console.error(`Error generating section ${sectionType}:`, error);
      return null;
    }
  }

  private getTokensForWordCount(wordCount: 'kort' | 'middel' | 'lang', sectionCount: number): number {
    // Approximate tokens per word: 1.3 tokens per Dutch word
    // Total target words divided by number of sections
    const totalWords = {
      kort: 300,
      middel: 600,
      lang: 1000
    }[wordCount];

    const wordsPerSection = Math.floor(totalWords / sectionCount);
    return Math.floor(wordsPerSection * 1.3); // Convert to tokens
  }

  private buildSystemPrompt(sectionType: EduPackSectionType, context: GenerationContext, wordCount?: 'kort' | 'middel' | 'lang'): string {
    const toneInstruction = context.tone === 'formal'
      ? 'Gebruik formele aanspreking met "u"'
      : 'Gebruik informele aanspreking met "je"';

    const ageInstruction = context.patientAge
      ? `De patiënt is ${context.patientAge} jaar oud. Pas je taalgebruik hier op aan.`
      : '';

    const wordCountInstruction = wordCount ? {
      kort: 'Houd deze sectie KORT - maximaal 50 woorden. Wees beknopt en ga direct to the point.',
      middel: 'Houd deze sectie van GEMIDDELDE lengte - ongeveer 100 woorden. Geef voldoende detail maar blijf helder.',
      lang: 'Maak deze sectie UITGEBREID - ongeveer 150-200 woorden. Geef gedetailleerde uitleg en context.'
    }[wordCount] : 'Gebruik een gemiddelde lengte van ongeveer 100 woorden.';

    return `${B1_LANGUAGE_PROMPT}

SECTIESPECIFIEKE INSTRUCTIES:
${SECTION_PROMPTS[sectionType]}

WOORDENAANTAL:
${wordCountInstruction}

CONTEXT:
- Sessie type: ${context.sessionType === 'intake' ? 'eerste afspraak/intake' : 'controle/vervolgbehandeling'}
- Aanspreking: ${toneInstruction}
${ageInstruction}
- Conditie: ${context.condition || 'niet gespecificeerd'}

Genereer ALLEEN de inhoud voor deze sectie. Geen titels, headers of extra opmaak.`;
  }

  private buildUserPrompt(sectionType: EduPackSectionType, request: EduPackGenerationRequest): string {
    let sourceData = '';

    if (request.sessionData) {
      if (request.sessionData.soepData) {
        sourceData += `SOEP Gegevens:\n${JSON.stringify(request.sessionData.soepData, null, 2)}\n\n`;
      }
      if (request.sessionData.transcript) {
        sourceData += `Gesprek transcript:\n${request.sessionData.transcript}\n\n`;
      }
      if (request.sessionData.clinicalNotes) {
        sourceData += `Klinische notities:\n${request.sessionData.clinicalNotes}\n\n`;
      }
    }

    if (request.manualInput) {
      sourceData += `Handmatige invoer:\n`;
      sourceData += `Context: ${request.manualInput.sessionContext}\n`;
      if (request.manualInput.pathology) {
        sourceData += `Pathologie: ${request.manualInput.pathology}\n`;
      }
      if (request.manualInput.focusAreas) {
        sourceData += `Focusgebieden: ${request.manualInput.focusAreas.join(', ')}\n`;
      }
    }

    return `Gebaseerd op de volgende informatie, schrijf de ${sectionType} sectie voor de patiënt:

${sourceData}

Onthoud: Gebruik ALLEEN informatie uit bovenstaande brondata. Voeg geen eigen medische adviezen toe.`;
  }

  private extractGenerationContext(request: EduPackGenerationRequest): GenerationContext {
    return {
      patientAge: request.sessionData?.patientInfo?.age || request.manualInput?.patientInfo?.age,
      sessionType: request.sessionData?.patientInfo ? 'intake' : 'followup', // Simplified logic
      condition: request.sessionData?.patientInfo?.condition || request.manualInput?.patientInfo?.condition,
      tone: request.preferences.tone,
      language: request.preferences.language
    };
  }

  private validateGenerationRequest(request: EduPackGenerationRequest): boolean {
    if (!request.therapistId) return false;
    if (!request.preferences.language) return false;
    if (!request.preferences.sections || request.preferences.sections.length === 0) return false;

    // Must have either session data or manual input
    if (!request.sessionData && !request.manualInput) return false;

    return true;
  }

  private getSectionTitle(type: EduPackSectionType): string {
    const titles: Record<EduPackSectionType, string> = {
      introduction: 'Welkom',
      session_summary: 'Samenvatting van ons gesprek',
      diagnosis: 'Wat er aan de hand is',
      treatment_plan: 'Uw behandelplan',
      self_care: 'Wat kunt u zelf doen',
      warning_signs: 'Wanneer contact opnemen',
      follow_up: 'Vervolgafspraken'
    };
    return titles[type];
  }

  private getSectionIcon(type: EduPackSectionType): string {
    const icons: Record<EduPackSectionType, string> = {
      introduction: '📄',
      session_summary: '📋',
      diagnosis: '💡',
      treatment_plan: '🩺',
      self_care: '🧘',
      warning_signs: '⚠️',
      follow_up: '📅'
    };
    return icons[type];
  }

  private getSectionOrder(type: EduPackSectionType): number {
    const orders: Record<EduPackSectionType, number> = {
      introduction: 1,
      session_summary: 2,
      diagnosis: 3,
      treatment_plan: 4,
      self_care: 5,
      warning_signs: 6,
      follow_up: 7
    };
    return orders[type];
  }

  async validateContent(content: string): Promise<ContentValidationResult> {
    // Basic B1-level validation
    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const avgWordsPerSentence = words.length / sentences.length;
    const complexWords = words.filter(word => word.length > 12).length;
    const complexWordRatio = complexWords / words.length;

    const issues = [];

    if (avgWordsPerSentence > 20) {
      issues.push({
        type: 'language_complexity' as const,
        message: 'Zinnen zijn te lang voor B1-niveau',
        severity: 'medium' as const
      });
    }

    if (complexWordRatio > 0.1) {
      issues.push({
        type: 'medical_jargon' as const,
        message: 'Te veel complexe medische termen',
        severity: 'high' as const
      });
    }

    // Calculate readability score (simplified)
    const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2) - (complexWordRatio * 100));

    return {
      isValid: issues.filter(i => i.severity === 'high').length === 0,
      languageLevel: readabilityScore > 60 ? 'B1' : 'B2',
      readabilityScore,
      issues,
      suggestions: issues.length > 0 ? [
        'Gebruik kortere zinnen',
        'Vervang moeilijke woorden door eenvoudige alternatieven',
        'Leg medische termen uit in gewone woorden'
      ] : []
    };
  }

  async regenerateSection(
    sectionType: EduPackSectionType,
    originalRequest: EduPackGenerationRequest,
    customInstructions?: string
  ): Promise<SectionContent | null> {
    const context = this.extractGenerationContext(originalRequest);

    if (customInstructions) {
      // Add custom instructions to the prompt
      const enhancedRequest = {
        ...originalRequest,
        customInstructions
      };
      return this.generateSection(sectionType, enhancedRequest, context);
    }

    return this.generateSection(sectionType, originalRequest, context);
  }
}