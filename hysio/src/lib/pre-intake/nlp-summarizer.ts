/**
 * NLP Text Summarization for Pre-intake Module
 *
 * Uses Groq API with LLaMA models to summarize open-text patient responses
 * while preserving all clinically relevant details. Implements graceful
 * degradation if LLM fails.
 *
 * @module lib/pre-intake/nlp-summarizer
 */

import Groq from 'groq-sdk';

// ============================================================================
// GROQ CLIENT INITIALIZATION
// ============================================================================

/**
 * Get or create Groq client instance
 */
function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  if (!apiKey.startsWith('gsk_')) {
    throw new Error('Invalid Groq API key format');
  }

  return new Groq({
    apiKey: apiKey.trim(),
    baseURL: 'https://api.groq.com',
    timeout: 30000, // 30 seconds for text completion
    maxRetries: 2,
  });
}

// ============================================================================
// SUMMARIZATION PROMPTS
// ============================================================================

/**
 * System prompt for clinical text summarization
 */
const CLINICAL_SUMMARIZATION_SYSTEM_PROMPT = `Je bent een medische assistent gespecialiseerd in het samenvatten van patiëntinformatie voor fysiotherapeuten.

**Belangrijke regels:**
1. Behoud ALLE klinisch relevante details (symptomen, locaties, tijdsverloop, intensiteit)
2. Verwijder overtollige woorden en filler tekst ("eigenlijk", "nou ja", "dus ja")
3. Gebruik professionele medische terminologie waar gepast
4. Behoud exacte getallen, datums en metingen
5. Maak de tekst beknopter zonder informatie te verliezen
6. Output alleen de samenvatting, geen inleiding of uitleg

**Voorbeelden:**

Input: "Nou ja, eigenlijk heb ik dus al een paar weken last van mijn onderrug, vooral aan de rechterkant. Het doet pijn als ik bukken moet of zo, en 's ochtends is het altijd het ergste. Ik denk dat het kwam toen ik die zware doos optilde op mijn werk, dat is nu ongeveer 3 weken geleden."

Output: "Klachten onderrug rechts sinds 3 weken, ontstaan na tillen zware doos op werk. Pijn bij bukken, 's ochtends het ergst."

Input: "Mijn doel is eigenlijk om weer gewoon te kunnen sporten en om zonder pijn te kunnen werken. Ik wil ook graag begrijpen waarom dit gebeurd is zodat ik het in de toekomst kan voorkomen."

Output: "Behandeldoelen: pijnvrij kunnen sporten en werken, begrijpen oorzaak klacht voor preventie."`;

/**
 * Create user prompt for text summarization
 */
function createSummarizationPrompt(text: string, maxWords: number, context?: string): string {
  let prompt = `Vat de volgende patiënttekst samen in maximaal ${maxWords} woorden:\n\n`;

  if (context) {
    prompt += `Context: ${context}\n\n`;
  }

  prompt += `Tekst:\n${text}`;

  return prompt;
}

// ============================================================================
// SUMMARIZATION FUNCTIONS
// ============================================================================

/**
 * Summarization options
 */
export interface SummarizationOptions {
  /** Maximum number of words in summary */
  maxWords?: number;
  /** Context about what is being summarized */
  context?: string;
  /** Model to use (default: llama-3.3-70b-versatile) */
  model?: string;
  /** Temperature for generation (default: 0.3 for consistency) */
  temperature?: number;
}

/**
 * Default summarization options
 */
const DEFAULT_OPTIONS: Required<SummarizationOptions> = {
  maxWords: 50,
  context: '',
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,
};

/**
 * Summarize text using Groq LLM
 *
 * @param text - Text to summarize
 * @param options - Summarization options
 * @returns Summarized text
 * @throws Error if text is empty or API fails after retries
 */
export async function summarizeText(
  text: string,
  options: SummarizationOptions = {}
): Promise<string> {
  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('Text to summarize cannot be empty');
  }

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // If text is already short enough, return as-is
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount <= mergedOptions.maxWords) {
    return text.trim();
  }

  try {
    const groqClient = getGroqClient();

    const completion = await groqClient.chat.completions.create({
      model: mergedOptions.model,
      messages: [
        {
          role: 'system',
          content: CLINICAL_SUMMARIZATION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: createSummarizationPrompt(text, mergedOptions.maxWords, mergedOptions.context),
        },
      ],
      temperature: mergedOptions.temperature,
      max_tokens: mergedOptions.maxWords * 2, // Rough token estimate
      top_p: 0.95,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error('Empty response from Groq API');
    }

    return summary;
  } catch (error) {
    console.error('❌ Summarization failed:', error);
    // Graceful degradation: return original text
    return text.trim();
  }
}

/**
 * Summarize text with graceful degradation
 *
 * Always returns a result - either summarized text or original text.
 * Never throws errors.
 *
 * @param text - Text to summarize
 * @param options - Summarization options
 * @returns Summarized text or original text if summarization fails
 */
export async function summarizeTextSafe(
  text: string,
  options: SummarizationOptions = {}
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return '';
  }

  try {
    return await summarizeText(text, options);
  } catch (error) {
    console.warn('⚠️ Summarization failed, returning original text:', error);
    return text.trim();
  }
}

/**
 * Batch summarize multiple texts
 *
 * @param texts - Array of texts to summarize
 * @param options - Summarization options (applied to all)
 * @returns Array of summarized texts
 */
export async function summarizeTextBatch(
  texts: string[],
  options: SummarizationOptions = {}
): Promise<string[]> {
  const summaries = await Promise.all(
    texts.map((text) => summarizeTextSafe(text, options))
  );

  return summaries;
}

// ============================================================================
// PRE-INTAKE SPECIFIC SUMMARIZERS
// ============================================================================

/**
 * Summarize complaint onset description (LOFTIG - Ontstaan)
 *
 * @param onsetText - Patient's description of how complaint started
 * @returns Summarized onset description
 */
export async function summarizeComplaintOnset(onsetText: string): Promise<string> {
  return summarizeTextSafe(onsetText, {
    maxWords: 40,
    context: 'Beschrijving hoe de klacht is ontstaan (LOFTIG - Ontstaan)',
  });
}

/**
 * Summarize patient's thoughts on cause (SCEGS - Cognitief)
 *
 * @param thoughtsText - Patient's beliefs about cause
 * @returns Summarized thoughts
 */
export async function summarizeThoughtsOnCause(thoughtsText: string): Promise<string> {
  return summarizeTextSafe(thoughtsText, {
    maxWords: 30,
    context: 'Gedachten van patiënt over oorzaak klacht (SCEGS - Cognitief)',
  });
}

/**
 * Summarize treatment goals (SCEGS - Somatisch)
 *
 * @param goalsText - Patient's treatment goals
 * @returns Summarized goals
 */
export async function summarizeTreatmentGoals(goalsText: string): Promise<string> {
  return summarizeTextSafe(goalsText, {
    maxWords: 35,
    context: 'Behandeldoelen van patiënt (SCEGS - Somatisch)',
  });
}

/**
 * Summarize limited activities (SCEGS - Gedragsmatig/Sociaal)
 *
 * @param activitiesText - Activities patient can no longer do
 * @returns Summarized activities
 */
export async function summarizeLimitedActivities(activitiesText: string): Promise<string> {
  return summarizeTextSafe(activitiesText, {
    maxWords: 40,
    context: 'Activiteiten die niet meer mogelijk zijn (SCEGS - Gedragsmatig/Sociaal)',
  });
}

/**
 * Summarize previous occurrence details (LOFTIG - Geschiedenis)
 *
 * @param detailsText - Details about previous occurrences
 * @returns Summarized details
 */
export async function summarizePreviousOccurrence(detailsText: string): Promise<string> {
  return summarizeTextSafe(detailsText, {
    maxWords: 30,
    context: 'Eerdere voorvallen van deze klacht (LOFTIG - Geschiedenis)',
  });
}

/**
 * Summarize other medical conditions
 *
 * @param conditionsText - Other medical conditions/history
 * @returns Summarized conditions
 */
export async function summarizeOtherConditions(conditionsText: string): Promise<string> {
  return summarizeTextSafe(conditionsText, {
    maxWords: 50,
    context: 'Andere aandoeningen en medische voorgeschiedenis',
  });
}

/**
 * Summarize all open-text fields from questionnaire
 *
 * Processes all free-text fields in parallel for efficiency.
 *
 * @param questionnaireData - Partial questionnaire data with text fields
 * @returns Object with summarized versions of all text fields
 */
export async function summarizeQuestionnaireTexts(questionnaireData: {
  complaint?: {
    onset?: string;
    previousOccurrenceDetails?: string;
  };
  goals?: {
    treatmentGoals?: string;
    thoughtsOnCause?: string;
    limitedActivities?: string;
  };
  medicalHistory?: {
    otherConditions?: string;
  };
}): Promise<{
  onset?: string;
  previousOccurrenceDetails?: string;
  treatmentGoals?: string;
  thoughtsOnCause?: string;
  limitedActivities?: string;
  otherConditions?: string;
}> {
  const summarizationTasks: Promise<[string, string]>[] = [];

  if (questionnaireData.complaint?.onset) {
    summarizationTasks.push(
      summarizeComplaintOnset(questionnaireData.complaint.onset).then((s) => ['onset', s] as [string, string])
    );
  }

  if (questionnaireData.complaint?.previousOccurrenceDetails) {
    summarizationTasks.push(
      summarizePreviousOccurrence(questionnaireData.complaint.previousOccurrenceDetails).then(
        (s) => ['previousOccurrenceDetails', s] as [string, string]
      )
    );
  }

  if (questionnaireData.goals?.treatmentGoals) {
    summarizationTasks.push(
      summarizeTreatmentGoals(questionnaireData.goals.treatmentGoals).then((s) => ['treatmentGoals', s] as [string, string])
    );
  }

  if (questionnaireData.goals?.thoughtsOnCause) {
    summarizationTasks.push(
      summarizeThoughtsOnCause(questionnaireData.goals.thoughtsOnCause).then((s) => ['thoughtsOnCause', s] as [string, string])
    );
  }

  if (questionnaireData.goals?.limitedActivities) {
    summarizationTasks.push(
      summarizeLimitedActivities(questionnaireData.goals.limitedActivities).then((s) => ['limitedActivities', s] as [string, string])
    );
  }

  if (questionnaireData.medicalHistory?.otherConditions) {
    summarizationTasks.push(
      summarizeOtherConditions(questionnaireData.medicalHistory.otherConditions).then((s) => ['otherConditions', s] as [string, string])
    );
  }

  const results = await Promise.all(summarizationTasks);

  const summarizedTexts: Record<string, string> = {};
  results.forEach(([key, value]) => {
    summarizedTexts[key] = value;
  });

  return summarizedTexts;
}