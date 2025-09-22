// AI Prompts for DCSPH Code Identification

import { HYSIO_LLM_MODEL } from '@/lib/api/openai';

export interface AIPromptConfig {
  systemPrompt: string;
  temperature: number;
  max_tokens: number; // Maximum tokens for GPT-4.1-mini
  /** @deprecated Use max_tokens. Supported for backwards compatibility. */
  maxTokens?: number;
  model: string;
}

export const DCSPH_SYSTEM_PROMPT = `Je bent een deskundige fysiotherapeut en expert in DCSPH-codering (Dutch Classification System for Physical Health).

## JE ROL
- Je bent gespecialiseerd in Nederlandse fysiotherapie
- Je hebt uitgebreide kennis van DCSPH systematiek
- Je bent getraind om precieze, klinisch relevante diagnoses te stellen

## JE TAAK
Analyseer patiëntklachten en suggereer de 3 meest waarschijnlijke DCSPH codes op basis van:
- Lichaamslocatie (Tabel A: 2-cijferige codes)
- Pathologie (Tabel B: 2-cijferige codes)
- Combinatie tot 4-cijferige DCSPH code

## WERKWIJZE
1. **Analyseer de klacht**: Identificeer hoofdsymptomen, locatie, en mechanisme
2. **Bepaal locatiecode**: Selecteer meest passende lichaamsregio uit Tabel A
3. **Bepaal pathologiecode**: Selecteer meest passende aandoening uit Tabel B
4. **Combineer codes**: Vorm 4-cijferige code (locatie + pathologie)
5. **Genereer rationale**: Korte, professionele onderbouwing in het Nederlands

## OUTPUT FORMAT
Antwoord ALLEEN in dit JSON format:
{
  "suggestions": [
    {
      "code": "7920",
      "name": "Epicondylitis/tendinitis/tendovaginitis – knie/onderbeen/voet",
      "rationale": "Overbelasting van de patellapees of quadricepspees veroorzaakt anterieure kniepijn; code 79 identificeert de knie/onderbeen/voet en code 20 de tendinitis-pathologie."
    }
  ],
  "needsClarification": false,
  "clarifyingQuestion": null
}

## WANNEER VERDUIDELIJKING NODIG
Als de klacht te vaag is, stel 1 korte, gerichte vraag:
{
  "suggestions": [],
  "needsClarification": true,
  "clarifyingQuestion": "In welke lichaamsregio bevinden de klachten zich precies?"
}

## BELANGRIJKE REGELS
- Gebruik ALLEEN codes die bestaan in de officiële DCSPH tabellen
- Maximaal 3 suggesties per query
- Rationale moet klinisch correct en professioneel zijn
- Spreek de gebruiker niet direct aan, geef alleen codes
- Bij twijfel: vraag om verduidelijking
- Gebruik Nederlandse medische terminologie`;

export const CLARIFICATION_PROMPTS = {
  LOCATION_UNCLEAR: "In welke lichaamsregio bevinden de klachten zich? (bijvoorbeeld: knie, onderrug, nek, schouder)",
  PATHOLOGY_UNCLEAR: "Wat voor type klacht betreft het? (bijvoorbeeld: pijn, zwelling, stijfheid, bewegingsbeperking)",
  MECHANISM_UNCLEAR: "Hoe zijn de klachten ontstaan? (bijvoorbeeld: plotseling, geleidelijk, na trauma, door overbelasting)",
  TIMING_UNCLEAR: "Wanneer zijn de klachten het ergst? (bijvoorbeeld: bij bewegen, in rust, 's nachts, 's ochtends)",
  RADIATION_UNCLEAR: "Straalt de pijn uit naar andere gebieden? Zo ja, waar naartoe?",
  AGGRAVATING_UNCLEAR: "Welke bewegingen of activiteiten maken de klachten erger?",
  PREVIOUS_TRAUMA: "Is er sprake geweest van een trauma, val of ongeval?",
  DURATION_UNCLEAR: "Hoe lang bestaan de klachten al? (bijvoorbeeld: dagen, weken, maanden)"
};

export const COMMON_SYMPTOM_PATTERNS = {
  ANTERIOR_KNEE_PAIN: {
    keywords: ['vooraan', 'knie', 'traplopen', 'patella', 'springen'],
    likelyCodes: ['7920', '7921', '7922'],
    rationale: 'Anterieure kniepijn bij belasting wijst op patellafemoraal syndroom, patellapees tendinopathie of bursa irritatie'
  },
  LOWER_BACK_PAIN: {
    keywords: ['onderrug', 'lumbaal', 'lenden', 'uitstraling', 'been'],
    likelyCodes: ['3427', '3475', '3426'],
    rationale: 'Lumbale rugpijn met mogelijk radiculaire component past bij discuspathologie of spieraandoening'
  },
  NECK_PAIN: {
    keywords: ['nek', 'cervicaal', 'whiplash', 'hoofdpijn', 'uitstraling'],
    likelyCodes: ['3038', '3027', '3026'],
    rationale: 'Nekklachten kunnen ontstaan door whiplash trauma, HNP of spieraandoeningen'
  },
  SHOULDER_IMPINGEMENT: {
    keywords: ['schouder', 'opheffen', 'arm', 'impingement', 'boven', 'hoofd'],
    likelyCodes: ['2120', '2121', '2126'],
    rationale: 'Schouderpijn bij overhead activiteiten wijst op impingement, tendinitis of bursitis'
  }
};

export const AI_MODEL_CONFIG: AIPromptConfig = {
  systemPrompt: DCSPH_SYSTEM_PROMPT,
  temperature: 0.7, // Lower temperature for precise diagnostic coding
  max_tokens: 1000, // Sufficient for structured JSON responses
  model: HYSIO_LLM_MODEL
};

/**
 * Build conversation context for AI
 */
export function buildConversationContext(
  currentQuery: string,
  previousQuestions?: string[],
  previousAnswers?: string[]
): Array<{ role: 'user' | 'assistant'; content: string }> {
  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  // Add conversation history if available
  if (previousQuestions && previousAnswers) {
    for (let i = 0; i < Math.min(previousQuestions.length, previousAnswers.length); i++) {
      messages.push({ role: 'user', content: previousQuestions[i] });
      messages.push({ role: 'assistant', content: previousAnswers[i] });
    }
  }

  // Add current query
  messages.push({ role: 'user', content: currentQuery });

  return messages;
}

/**
 * Enhance query with medical context
 */
export function enhanceQueryWithContext(
  query: string,
  context?: {
    patientAge?: number;
    patientGender?: 'male' | 'female';
    previousDiagnoses?: string[];
    currentMedication?: string[];
  }
): string {
  let enhancedQuery = query;

  if (context?.patientAge) {
    enhancedQuery += ` (Patiënt: ${context.patientAge} jaar)`;
  }

  if (context?.patientGender) {
    const genderNL = context.patientGender === 'male' ? 'man' : 'vrouw';
    enhancedQuery += ` (${genderNL})`;
  }

  if (context?.previousDiagnoses && context.previousDiagnoses.length > 0) {
    enhancedQuery += ` (Voorgeschiedenis: ${context.previousDiagnoses.join(', ')})`;
  }

  return enhancedQuery;
}

/**
 * Validate AI response format
 */
export function validateAIResponse(response: any): {
  isValid: boolean;
  error?: string;
  parsedResponse?: {
    suggestions: Array<{
      code: string;
      name: string;
      rationale: string;
    }>;
    needsClarification: boolean;
    clarifyingQuestion?: string;
  };
} {
  try {
    // Check if response is valid JSON
    if (typeof response !== 'object' || response === null) {
      return { isValid: false, error: 'Respons is geen geldig JSON object' };
    }

    // Check required fields
    if (!('suggestions' in response) || !('needsClarification' in response)) {
      return { isValid: false, error: 'Ontbrekende verplichte velden in AI respons' };
    }

    // Validate suggestions array
    if (!Array.isArray(response.suggestions)) {
      return { isValid: false, error: 'Suggestions moet een array zijn' };
    }

    // Validate each suggestion
    for (const suggestion of response.suggestions) {
      if (!suggestion.code || !suggestion.name || !suggestion.rationale) {
        return { isValid: false, error: 'Elke suggestie moet code, name en rationale bevatten' };
      }

      // Check if code is 4 digits
      if (!/^\d{4}$/.test(suggestion.code)) {
        return { isValid: false, error: `Ongeldige code format: ${suggestion.code}` };
      }
    }

    // Validate clarification logic
    if (response.needsClarification && !response.clarifyingQuestion) {
      return { isValid: false, error: 'Clarifying question ontbreekt terwijl needsClarification true is' };
    }

    return {
      isValid: true,
      parsedResponse: response
    };

  } catch (error) {
    return { isValid: false, error: `JSON parse error: ${error}` };
  }
}

/**
 * Generate fallback response when AI fails
 */
export function generateFallbackResponse(query: string): {
  suggestions: any[];
  needsClarification: boolean;
  clarifyingQuestion: string;
} {
  // Try to match common patterns
  const normalizedQuery = query.toLowerCase();

  for (const [pattern, config] of Object.entries(COMMON_SYMPTOM_PATTERNS)) {
    const matchCount = config.keywords.filter(keyword =>
      normalizedQuery.includes(keyword.toLowerCase())
    ).length;

    if (matchCount >= 2) {
      // Return pattern-based suggestions
      return {
        suggestions: config.likelyCodes.map(code => ({
          code,
          name: `DCSPH ${code} - Patroon match`,
          rationale: config.rationale
        })),
        needsClarification: false,
        clarifyingQuestion: ''
      };
    }
  }

  // Default fallback - ask for clarification
  return {
    suggestions: [],
    needsClarification: true,
    clarifyingQuestion: CLARIFICATION_PROMPTS.LOCATION_UNCLEAR
  };
}

/**
 * Determine best clarifying question based on query analysis
 */
export function determineClarifyingQuestion(query: string): string {
  const normalizedQuery = query.toLowerCase();

  // Check what information is missing
  const hasLocation = /knie|rug|nek|schouder|heup|elleboog|pols|voet|enkel/.test(normalizedQuery);
  const hasPathology = /pijn|zwelling|stijf|beweeg|trauma|breuk|ontsteking/.test(normalizedQuery);
  const hasMechanism = /trauma|val|overbelasting|plotseling|geleidelijk/.test(normalizedQuery);

  if (!hasLocation) {
    return CLARIFICATION_PROMPTS.LOCATION_UNCLEAR;
  }

  if (!hasPathology) {
    return CLARIFICATION_PROMPTS.PATHOLOGY_UNCLEAR;
  }

  if (!hasMechanism) {
    return CLARIFICATION_PROMPTS.MECHANISM_UNCLEAR;
  }

  // Default to asking for more specificity
  return "Kunt u de klachten specifieker beschrijven? Denk aan locatie, type klacht en wanneer deze ontstaan zijn.";
}