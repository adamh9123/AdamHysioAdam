import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { detectRedFlags, generateRedFlagsSummary, extractRedFlagsList } from '@/lib/medical/red-flags-detection';
import {
  createEnhancedHHSBPrompt,
  createEnhancedHHSBUserPrompt,
  parseEnhancedHHSBAnalysis,
  validateHHSBCompleteness
} from '@/lib/medical/hhsb-generation';
import {
  createEnhancedOnderzoekPrompt,
  parseEnhancedOnderzoekAnalysis
} from '@/lib/medical/onderzoek-generation';
import {
  createEnhancedConclusiePrompt,
  parseEnhancedConclusieAnalysis
} from '@/lib/medical/klinische-conclusie-generation';
import {
  createZorgplanPrompt,
  createZorgplanUserPrompt,
  parseZorgplanAnalysis
} from '@/lib/medical/zorgplan-generation';
import { processIntakeWithSemanticIntelligence } from '@/lib/medical/semantic-intake-processor';
import { formatIntakeToMarkdown } from '@/lib/medical/clinical-document-formatter';

export async function POST(request: NextRequest) {
  let workflowType: string | undefined;
  let patientInfo: any;
  let inputData: any;

  try {
    // Environment validation
    console.log('🚀 HHSB API: Starting request processing');

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ CRITICAL: OPENAI_API_KEY environment variable not set');
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: OpenAI API key not configured'
        },
        { status: 500 }
      );
    }

    console.log('✅ HHSB API: Environment validation passed');

    const body = await request.json();
    const parsedData = body;
    workflowType = parsedData.workflowType;
    const step = parsedData.step;
    patientInfo = parsedData.patientInfo;
    const preparation = parsedData.preparation;
    inputData = parsedData.inputData;
    const previousStepData = parsedData.previousStepData;

    console.log('📝 HHSB API: Request data:', {
      workflowType,
      step,
      hasPatientInfo: !!patientInfo,
      hasPreparation: !!preparation,
      inputDataType: inputData?.type,
      hasPreviousStepData: !!previousStepData,
      timestamp: new Date().toISOString()
    });

    // Basic validation
    if (!workflowType || !patientInfo || !inputData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: workflowType, patientInfo, inputData'
        },
        { status: 400 }
      );
    }

    let transcript = '';

    // Process input data based on type
    if (inputData.type === 'manual') {
      transcript = inputData.data;
      console.log('Processing manual input:', transcript.substring(0, 100) + '...');
    } else if (inputData.type === 'transcribed-audio') {
      transcript = inputData.data;
      console.log('Processing transcribed audio (' + inputData.originalSource + '):', transcript.substring(0, 100) + '...');
    } else if (inputData.type === 'recording' || inputData.type === 'file') {
      // Critical fix: Audio/file should never reach here - must be transcribed client-side first
      return NextResponse.json(
        {
          success: false,
          error: 'CRITICAL ERROR: Audio/file input must be transcribed client-side before API call. Only manual transcript text or transcribed-audio should be sent to this endpoint.'
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid input data type' },
        { status: 400 }
      );
    }

    // SECURITY: Server-side input validation with length limits
    const MAX_TRANSCRIPT_LENGTH = 50000; // ~50KB maximum to prevent abuse
    const MIN_TRANSCRIPT_LENGTH = 10;

    if (!transcript || transcript.trim().length < MIN_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Transcript must be at least ${MIN_TRANSCRIPT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Transcript exceeds maximum length of ${MAX_TRANSCRIPT_LENGTH} characters. Current length: ${transcript.length}` },
        { status: 400 }
      );
    }

    // Caching disabled to ensure fresh results for each request

    // Handle different workflow steps
    const startTime = Date.now();
    let resultData: any;

    if (step === 'zorgplan' && workflowType === 'intake-stapsgewijs') {
      // Generate zorgplan using previous step data
      if (!previousStepData || !previousStepData.anamneseResult || !previousStepData.onderzoekResult || !previousStepData.klinischeConclusieResult) {
        return NextResponse.json(
          { success: false, error: 'Missing required previous step data for zorgplan generation' },
          { status: 400 }
        );
      }

      resultData = await generateZorgplanAnalysis(
        patientInfo,
        previousStepData.anamneseResult,
        previousStepData.onderzoekResult,
        previousStepData.klinischeConclusieResult
      );
    } else if (step === 'klinische-conclusie' && workflowType === 'intake-stapsgewijs') {
      // Generate klinische conclusie using previous step data
      if (!previousStepData || !previousStepData.anamneseResult || !previousStepData.onderzoekResult) {
        return NextResponse.json(
          { success: false, error: 'Missing required previous step data for klinische conclusie generation' },
          { status: 400 }
        );
      }

      resultData = await generateKlinischeConclusieAnalysis(
        patientInfo,
        previousStepData.anamneseResult,
        previousStepData.onderzoekResult
      );
    } else {
      // Generate complete intake data (HHSB, Onderzoek, Klinische Conclusie) using OpenAI
      resultData = await generateCompleteIntakeAnalysis(patientInfo, preparation, transcript);
    }

    const endTime = Date.now();
    const processingDuration = (endTime - startTime) / 1000; // in seconds

    // Add processing metadata
    const resultWithMetadata = {
      ...resultData,
      processingDuration,
      generatedAt: new Date().toISOString()
    };

    // Caching disabled - not storing results for future requests

    return NextResponse.json({
      success: true,
      data: resultWithMetadata
    });

  } catch (error) {
    console.error('HHSB processing error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString(),
      workflowType,
      hasPatientInfo: !!patientInfo,
      hasInputData: !!inputData,
      inputDataType: inputData?.type,
      transcriptLength: typeof inputData?.data === 'string' ? inputData.data.length : 0
    });

    // Enhanced error message for debugging
    let detailedError = 'HHSB processing failed';
    if (error instanceof Error) {
      detailedError = error.message;

      // Check for specific error patterns
      if (error.message.includes('API key')) {
        detailedError = 'OpenAI API key is invalid or not configured properly';
      } else if (error.message.includes('rate limit')) {
        detailedError = 'OpenAI rate limit exceeded. Please try again in a moment';
      } else if (error.message.includes('timeout')) {
        detailedError = 'Request timed out. The AI processing took too long';
      } else if (error.message.includes('insufficient')) {
        detailedError = 'Insufficient OpenAI credits. Please check your billing';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: detailedError,
        debug: process.env.NODE_ENV === 'development' ? {
          originalError: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        } : undefined
      },
      { status: 500 }
    );
  }
}

async function generateKlinischeConclusieAnalysis(
  patientInfo: { initials: string; birthYear: string; gender: string; chiefComplaint: string },
  anamneseResult: any,
  onderzoekResult: any
) {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  // Use klinische conclusie generation system
  const systemPrompt = createEnhancedConclusiePrompt();
  const userPrompt = `PATIËNT INFORMATIE:
- Voorletters: ${initials}
- Leeftijd: ${age} jaar
- Geslacht: ${genderText}
- Hoofdklacht: ${chiefComplaint}

ANAMNESE GEGEVENS:
${typeof anamneseResult === 'string' ? anamneseResult : JSON.stringify(anamneseResult, null, 2)}

ONDERZOEKSBEVINDINGEN:
${typeof onderzoekResult === 'string' ? onderzoekResult : JSON.stringify(onderzoekResult, null, 2)}

Genereer een volledige klinische conclusie volgens het format uit de systeemprompt.`;

  try {
    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI for klinische conclusie generation');
    }

    console.log('✅ Klinische conclusie generation completed successfully');
    return parseEnhancedConclusieAnalysis(content);

  } catch (error) {
    console.error('❌ Error in klinische conclusie generation:', error);
    throw error;
  }
}

async function generateZorgplanAnalysis(
  patientInfo: { initials: string; birthYear: string; gender: string; chiefComplaint: string },
  anamneseResult: any,
  onderzoekResult: any,
  klinischeConclusieResult: any
) {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  // Use zorgplan generation system
  const systemPrompt = createZorgplanPrompt();
  const userPrompt = createZorgplanUserPrompt(
    { initials, age, gender: genderText, chiefComplaint },
    anamneseResult,
    onderzoekResult,
    klinischeConclusieResult
  );

  try {
    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI for zorgplan generation');
    }

    console.log('✅ Zorgplan generation completed successfully');
    return parseZorgplanAnalysis(content);

  } catch (error) {
    console.error('❌ Error in zorgplan generation:', error);
    throw error;
  }
}

// @ts-expect-error - Legacy function kept for reference but not currently used
async function _generateHHSBAnalysis(
  patientInfo: { initials: string; birthYear: string; gender: string; chiefComplaint: string },
  preparation: string | null,
  transcript: string
) {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  // Use enhanced HHSB generation system
  const systemPrompt = createEnhancedHHSBPrompt();
  const userPrompt = createEnhancedHHSBUserPrompt(
    { initials, age, gender: genderText, chiefComplaint },
    preparation,
    transcript
  );

  try {
    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse the enhanced HHSB analysis
    const enhancedHHSB = parseEnhancedHHSBAnalysis(analysisText);

    // Validate HHSB completeness and quality
    const validation = validateHHSBCompleteness(enhancedHHSB);

    // Systematic Red Flags Detection
    const detectedRedFlags = detectRedFlags(transcript, { age, gender: genderText, chiefComplaint });
    const redFlagsList = extractRedFlagsList(detectedRedFlags);

    // Create legacy structure for backward compatibility
    const legacyStructure = {
      hulpvraag: enhancedHHSB.hulpvraag.primaryConcern,
      historie: enhancedHHSB.historie.onsetDescription + ' ' + enhancedHHSB.historie.symptomProgression,
      stoornissen: enhancedHHSB.stoornissen.painDescription.location.join(', '),
      beperkingen: enhancedHHSB.beperkingen.activitiesOfDailyLiving.map(adl => adl.activity).join(', '),
      anamneseSummary: enhancedHHSB.anamneseSummary.clinicalImpression,
      redFlags: redFlagsList,
      fullStructuredText: analysisText
    };

    return {
      hhsbStructure: legacyStructure, // Legacy format for backward compatibility
      enhancedHHSBStructure: enhancedHHSB, // New enhanced structure
      fullStructuredText: analysisText,
      transcript,
      workflowType: 'intake-automatisch',
      processedAt: new Date().toISOString(),
      patientInfo: {
        initials,
        age,
        gender: genderText,
        chiefComplaint
      },
      redFlagsDetailed: detectedRedFlags, // Full structured red flags
      redFlagsSummary: generateRedFlagsSummary(detectedRedFlags),
      hhsbValidation: validation // HHSB quality validation
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate HHSB analysis');
  }
}

async function generateCompleteIntakeAnalysis(
  patientInfo: { initials: string; birthYear: string; gender: string; chiefComplaint: string },
  preparation: string | null,
  transcript: string
) {
  console.log('🔧 HHSB: Starting generateCompleteIntakeAnalysis with:', {
    patientInfo,
    hasPreparation: !!preparation,
    transcriptLength: transcript?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Defensive input validation
  if (!patientInfo || !transcript) {
    throw new Error('Missing required parameters: patientInfo or transcript');
  }

  if (typeof transcript !== 'string' || transcript.trim().length === 0) {
    throw new Error('Transcript must be a non-empty string');
  }

  if (transcript.trim().length < 50) {
    throw new Error(`Transcript too short (${transcript.length} characters). Minimum 50 characters required for meaningful analysis.`);
  }

  const { initials, birthYear, gender, chiefComplaint } = patientInfo;

  // Validate patient info fields
  if (!initials || !birthYear || !gender || !chiefComplaint) {
    throw new Error('Incomplete patient information. All fields (initials, birthYear, gender, chiefComplaint) are required.');
  }

  const currentYear = new Date().getFullYear();
  const birthYearNum = parseInt(birthYear);

  if (isNaN(birthYearNum) || birthYearNum < 1900 || birthYearNum > currentYear) {
    throw new Error(`Invalid birth year: ${birthYear}. Must be between 1900 and ${currentYear}.`);
  }

  const age = currentYear - birthYearNum;
  const genderText = gender === 'male' ? 'man' : 'vrouw';

  console.log('✅ HHSB: Input validation passed:', {
    initials,
    age,
    genderText,
    chiefComplaint: chiefComplaint.substring(0, 100) + (chiefComplaint.length > 100 ? '...' : ''),
    transcriptPreview: transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '')
  });

  // ============================================================================
  // Simple One-Shot Processing v7.1
  // ============================================================================
  console.log('⚡ Using Hysio Simple One-Shot Processing v7.1...');

  try {
    // Import the new prompt function
    const { createVolledigeIntakePrompt } = await import('@/lib/prompts/intake-automatisch/volledige-intake-v7.1');

    const { systemPrompt, userPrompt } = createVolledigeIntakePrompt(
      { initials, age, genderText, chiefComplaint },
      transcript,
      preparation
    );

    console.log('🤖 Hysio: Preparing OpenAI API call:', {
      model: 'gpt-4o-mini',
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      timestamp: new Date().toISOString(),
    });

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o-mini', // Best mini model available (no gpt-4.1-mini exists)
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2, // Lower for more consistent, focused output
      max_tokens: 20000, // Maximum for complete intake coverage (60min audio)
      response_format: { type: 'json_object' }, // Ensure JSON output
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    console.log('✅ Hysio: OpenAI API call successful:', {
      model: completion.model,
      usage: completion.usage,
      hasContent: !!content,
      contentLength: content.length
    });

    const result = JSON.parse(content);

    console.log('✅ Hysio: Processing complete - All 3 sections generated');

    // Return in format compatible with existing frontend
    return {
      // Main structured data
      hhsbAnamneseCard: result.hhsbAnamneseCard,
      onderzoeksBevindingen: result.onderzoeksBevindingen,
      klinischeConclusie: result.klinischeConclusie,

      // Metadata
      transcript,
      workflowType: 'intake-automatisch',
      processedAt: new Date().toISOString(),
      patientInfo: {
        initials,
        age,
        gender: genderText,
        chiefComplaint,
      },
    };

  } catch (error) {
    console.error('❌ Hysio Processing Failed:', error);
    throw error; // No fallback - fix the error directly
  }
}

// ============================================================================
// LEGACY FUNCTION - Preserved as fallback
// ============================================================================
async function generateCompleteIntakeAnalysisLegacy(
  patientInfo: { initials: string; birthYear: string; gender: string; chiefComplaint: string },
  preparation: string | null,
  transcript: string
) {
  console.log('⚠️ Using Legacy Processing Method');

  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : 'vrouw';

  console.log('✅ HHSB: Input validation passed (legacy):', {
    initials,
    age,
    genderText,
    chiefComplaint: chiefComplaint.substring(0, 100) + (chiefComplaint.length > 100 ? '...' : ''),
    transcriptPreview: transcript.substring(0, 200) + (transcript.length > 200 ? '...' : '')
  });

  // Create comprehensive system prompt combining all enhanced systems
  const systemPrompt = `${createEnhancedHHSBPrompt()}

${createEnhancedOnderzoekPrompt()}

${createEnhancedConclusiePrompt()}

BELANGRIJKE INSTRUCTIES:
- Genereer ALLE DRIE de secties: HHSB, Onderzoeksbevindingen, en Klinische Conclusie
- Gebruik de specifieke format van elke sectie zoals hierboven aangegeven
- Zorg dat de secties logisch op elkaar aansluiten
- Alle bevindingen moeten consistent zijn tussen de secties
- Gebruik concrete, meetbare waarden waar mogelijk`;

  const userPrompt = `VOLLEDIGE INTAKEDOCUMENTATIE AANVRAAG:

PATIËNT INFORMATIE:
• Initialen: ${initials}
• Leeftijd: ${age} jaar
• Geslacht: ${genderText}
• Hoofdklacht: ${chiefComplaint}

${preparation ? `INTAKE VOORBEREIDING:\n${preparation}\n\n` : ''}

TRANSCRIPTIE VOLLEDIGE INTAKE GESPREK:
${transcript}

Genereer een complete intakedocumentatie met alle drie de secties:
1. ### HHSB ANAMNESEKAART ### (gebruik enhanced HHSB format)
2. ### ONDERZOEKSBEVINDINGEN ### (gebruik enhanced onderzoek format)
3. ### KLINISCHE CONCLUSIE ### (gebruik enhanced conclusie format)

Zorg dat alle secties volledig ingevuld worden op basis van de transcriptie en logisch op elkaar aansluiten.`;

  try {
    console.log('🤖 HHSB: Preparing OpenAI API call:', {
      model: 'gpt-4.1-mini',
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      timestamp: new Date().toISOString()
    });

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000, // Increased for comprehensive three-section analysis
    }, {
      timeout: 180000, // 3 minutes timeout
      maxRetries: 1
    });

    console.log('✅ HHSB: OpenAI API call successful:', {
      model: completion.model,
      usage: completion.usage,
      hasContent: !!completion.choices[0]?.message?.content,
      contentLength: completion.choices[0]?.message?.content?.length || 0
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    console.log('🔍 HHSB: AI Generated Content Preview:', {
      contentLength: analysisText.length,
      contentPreview: analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : ''),
      hasHHSBSection: analysisText.includes('HULPVRAAG') || analysisText.includes('HHSB'),
      timestamp: new Date().toISOString()
    });

    // Parse all three enhanced sections
    const enhancedHHSB = parseEnhancedHHSBAnalysis(analysisText);
    const enhancedOnderzoek = parseEnhancedOnderzoekAnalysis(analysisText);
    const enhancedConclusie = parseEnhancedConclusieAnalysis(analysisText);

    console.log('✅ HHSB: Parsing Results:', {
      hhsbPrimaryConcern: enhancedHHSB.hulpvraag.primaryConcern ? 'FOUND' : 'EMPTY',
      hhsbGoalsCount: enhancedHHSB.hulpvraag.patientGoals.length,
      historieOnset: enhancedHHSB.historie.onsetDescription ? 'FOUND' : 'EMPTY',
      painIntensity: enhancedHHSB.stoornissen.painDescription.intensity.current,
      adlLimitationsCount: enhancedHHSB.beperkingen.activitiesOfDailyLiving.length,
      summaryFindings: enhancedHHSB.anamneseSummary.keyFindings.length,
      timestamp: new Date().toISOString()
    });

    // Validate HHSB completeness and quality
    const hhsbValidation = validateHHSBCompleteness(enhancedHHSB);

    // Systematic Red Flags Detection using comprehensive medical criteria
    const detectedRedFlags = detectRedFlags(transcript, { age, gender: genderText, chiefComplaint });
    const redFlagsSummary = generateRedFlagsSummary(detectedRedFlags);
    const redFlagsList = extractRedFlagsList(detectedRedFlags);

    // Also parse legacy format for backward compatibility
    const legacyParsed = parseCompleteIntakeAnalysis(analysisText);

    // Create proper legacy HHSB structure for frontend compatibility
    const legacyHHSBStructure = {
      hulpvraag: legacyParsed.hhsb.hulpvraag ||
                 enhancedHHSB.hulpvraag.primaryConcern ||
                 extractFallbackFromText(analysisText, 'hulpvraag'),
      historie: legacyParsed.hhsb.historie ||
                enhancedHHSB.historie.onsetDescription + ' ' + enhancedHHSB.historie.symptomProgression ||
                extractFallbackFromText(analysisText, 'historie'),
      stoornissen: legacyParsed.hhsb.stoornissen ||
                   enhancedHHSB.stoornissen.painDescription.location.join(', ') ||
                   extractFallbackFromText(analysisText, 'stoornissen'),
      beperkingen: legacyParsed.hhsb.beperkingen ||
                   enhancedHHSB.beperkingen.activitiesOfDailyLiving.map(adl => adl.activity).join(', ') ||
                   extractFallbackFromText(analysisText, 'beperkingen'),
      anamneseSummary: legacyParsed.hhsb.anamneseSummary ||
                       enhancedHHSB.anamneseSummary.clinicalImpression ||
                       extractFallbackFromText(analysisText, 'samenvatting anamnese'),
      redFlags: redFlagsList,
      fullStructuredText: analysisText
    };

    console.log('🔧 HHSB: Legacy structure created:', {
      hulpvraagLength: legacyHHSBStructure.hulpvraag?.length || 0,
      historieLength: legacyHHSBStructure.historie?.length || 0,
      stoornissenLength: legacyHHSBStructure.stoornissen?.length || 0,
      beperkingenLength: legacyHHSBStructure.beperkingen?.length || 0,
      summaryLength: legacyHHSBStructure.anamneseSummary?.length || 0,
      redFlagsCount: legacyHHSBStructure.redFlags?.length || 0
    });

    return {
      // Primary structure for frontend compatibility
      hhsbStructure: legacyHHSBStructure,
      transcript,
      workflowType: 'intake-stapsgewijs',
      processedAt: new Date().toISOString(),
      patientInfo: {
        initials: patientInfo.initials,
        age: new Date().getFullYear() - parseInt(patientInfo.birthYear),
        gender: patientInfo.gender === 'male' ? 'man' : 'vrouw',
        chiefComplaint: patientInfo.chiefComplaint
      },

      // Enhanced structures for advanced features
      hhsbAnamneseCard: enhancedHHSB,
      onderzoeksBevindingen: enhancedOnderzoek,
      klinischeConclusie: enhancedConclusie,

      // Red flags and validation
      redFlags: redFlagsList,
      redFlagsDetailed: detectedRedFlags,
      redFlagsSummary,
      hhsbValidation,

      // Metadata
      fullStructuredText: analysisText,
      generatedAt: new Date().toISOString(),
      processingDuration: 0 // Will be calculated by caller
    };

  } catch (error) {
    console.error('OpenAI API error in generateCompleteIntakeAnalysis:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      timestamp: new Date().toISOString(),
      patientInfo: { initials, age, gender: genderText },
      transcriptLength: transcript?.length || 0,
      hasPreparation: !!preparation
    });

    // Re-throw with original error details preserved
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    } else {
      throw new Error(`Unknown OpenAI Error: ${String(error)}`);
    }
  }
}

function parseCompleteIntakeAnalysis(analysisText: string) {
  const result = {
    hhsb: {
      hulpvraag: '',
      historie: '',
      stoornissen: '',
      beperkingen: '',
      anamneseSummary: ''
    },
    onderzoek: {
      inspectie: '',
      palpatie: '',
      bewegingsonderzoek: '',
      krachtStabiliteit: '',
      functietesten: '',
      metingen: ''
    },
    conclusie: {
      diagnose: '',
      behandelplan: '',
      behandeldoelen: '',
      prognose: '',
      vervolgafspraken: ''
    },
    redFlags: [] as string[]
  };

  try {
    // Extract HHSB sections
    const hulpvraagMatch = analysisText.match(/\*\*Hulpvraag:?\*\*\s*([\s\S]*?)(?=\*\*Historie|\*\*Stoornissen|###|$)/i);
    if (hulpvraagMatch) result.hhsb.hulpvraag = hulpvraagMatch[1].trim();

    const historieMatch = analysisText.match(/\*\*Historie:?\*\*\s*([\s\S]*?)(?=\*\*Stoornissen|\*\*Beperkingen|###|$)/i);
    if (historieMatch) result.hhsb.historie = historieMatch[1].trim();

    const stoornissenMatch = analysisText.match(/\*\*Stoornissen:?\*\*\s*([\s\S]*?)(?=\*\*Beperkingen|\*\*Samenvatting|###|$)/i);
    if (stoornissenMatch) result.hhsb.stoornissen = stoornissenMatch[1].trim();

    const beperkingenMatch = analysisText.match(/\*\*Beperkingen:?\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|###|$)/i);
    if (beperkingenMatch) result.hhsb.beperkingen = beperkingenMatch[1].trim();

    const summaryMatch = analysisText.match(/\*\*Samenvatting\s*(?:Anamnese)?:?\*\*\s*([\s\S]*?)(?=###|$)/i);
    if (summaryMatch) result.hhsb.anamneseSummary = summaryMatch[1].trim();

    // Extract Onderzoek sections
    const inspectieMatch = analysisText.match(/\*\*Inspectie:?\*\*\s*([\s\S]*?)(?=\*\*Palpatie|\*\*Bewegingsonderzoek|###|$)/i);
    if (inspectieMatch) result.onderzoek.inspectie = inspectieMatch[1].trim();

    const palpatieMatch = analysisText.match(/\*\*Palpatie:?\*\*\s*([\s\S]*?)(?=\*\*Bewegingsonderzoek|\*\*Kracht|###|$)/i);
    if (palpatieMatch) result.onderzoek.palpatie = palpatieMatch[1].trim();

    const bewegingMatch = analysisText.match(/\*\*Bewegingsonderzoek:?\*\*\s*([\s\S]*?)(?=\*\*Kracht|\*\*Functietesten|###|$)/i);
    if (bewegingMatch) result.onderzoek.bewegingsonderzoek = bewegingMatch[1].trim();

    const krachtMatch = analysisText.match(/\*\*Kracht\s*(?:&|en)?\s*Stabiliteit:?\*\*\s*([\s\S]*?)(?=\*\*Functietesten|\*\*Metingen|###|$)/i);
    if (krachtMatch) result.onderzoek.krachtStabiliteit = krachtMatch[1].trim();

    const functieMatch = analysisText.match(/\*\*Functietesten:?\*\*\s*([\s\S]*?)(?=\*\*Metingen|###|$)/i);
    if (functieMatch) result.onderzoek.functietesten = functieMatch[1].trim();

    const metingenMatch = analysisText.match(/\*\*Metingen:?\*\*\s*([\s\S]*?)(?=###|$)/i);
    if (metingenMatch) result.onderzoek.metingen = metingenMatch[1].trim();

    // Extract Klinische Conclusie sections
    const diagnoseMatch = analysisText.match(/\*\*Diagnose:?\*\*\s*([\s\S]*?)(?=\*\*Behandelplan|\*\*Behandeldoelen|###|$)/i);
    if (diagnoseMatch) result.conclusie.diagnose = diagnoseMatch[1].trim();

    const behandelplanMatch = analysisText.match(/\*\*Behandelplan:?\*\*\s*([\s\S]*?)(?=\*\*Behandeldoelen|\*\*Prognose|###|$)/i);
    if (behandelplanMatch) result.conclusie.behandelplan = behandelplanMatch[1].trim();

    const doelMatch = analysisText.match(/\*\*Behandeldoelen:?\*\*\s*([\s\S]*?)(?=\*\*Prognose|\*\*Vervolgafspraken|###|$)/i);
    if (doelMatch) result.conclusie.behandeldoelen = doelMatch[1].trim();

    const prognoseMatch = analysisText.match(/\*\*Prognose:?\*\*\s*([\s\S]*?)(?=\*\*Vervolgafspraken|###|$)/i);
    if (prognoseMatch) result.conclusie.prognose = prognoseMatch[1].trim();

    const vervolgMatch = analysisText.match(/\*\*Vervolgafspraken:?\*\*\s*([\s\S]*?)(?=###|$)/i);
    if (vervolgMatch) result.conclusie.vervolgafspraken = vervolgMatch[1].trim();

    // Extract red flags
    const redFlagMatches = analysisText.match(/\[RODE\s*VLAG[:\s]*([^\]]+)\]/gi);
    if (redFlagMatches) {
      result.redFlags = redFlagMatches.map(flag => flag.replace(/\[RODE\s*VLAG[:\s]*/, '').replace(/\]/, '').trim());
    }

  } catch (error) {
    console.error('Error parsing complete intake analysis:', error);
  }

  return result;
}

// @ts-expect-error - Legacy function kept for reference but not currently used
function parseHHSBAnalysis(analysisText: string) {
  const result = {
    hulpvraag: '',
    historie: '',
    stoornissen: '',
    beperkingen: '',
    anamneseSummary: '',
    redFlags: [],
    fullStructuredText: analysisText
  };

  try {
    // Extract Hulpvraag
    const hulpvraagMatch = analysisText.match(/\*\*H\s*-\s*Hulpvraag:?\*\*\s*([\s\S]*?)(?=\*\*H\s*-\s*Historie|\*\*S\s*-|\*\*B\s*-|\*\*Samenvatting|$)/i);
    if (hulpvraagMatch) {
      result.hulpvraag = hulpvraagMatch[1].trim();
    }

    // Extract Historie
    const historieMatch = analysisText.match(/\*\*H\s*-\s*Historie:?\*\*\s*([\s\S]*?)(?=\*\*S\s*-|\*\*B\s*-|\*\*Samenvatting|$)/i);
    if (historieMatch) {
      result.historie = historieMatch[1].trim();
    }

    // Extract Stoornissen
    const stoornissenMatch = analysisText.match(/\*\*S\s*-\s*Stoornissen[\s\S]*?:?\*\*\s*([\s\S]*?)(?=\*\*B\s*-|\*\*Samenvatting|$)/i);
    if (stoornissenMatch) {
      result.stoornissen = stoornissenMatch[1].trim();
    }

    // Extract Beperkingen
    const beperkingenMatch = analysisText.match(/\*\*B\s*-\s*Beperkingen:?\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|$)/i);
    if (beperkingenMatch) {
      result.beperkingen = beperkingenMatch[1].trim();
    }

    // Extract Summary
    const summaryMatch = analysisText.match(/\*\*Samenvatting\s*(?:Anamnese)?:?\*\*\s*([\s\S]*?)$/i);
    if (summaryMatch) {
      result.anamneseSummary = summaryMatch[1].trim();
    }

    // Extract red flags if present
    const redFlagMatches = analysisText.match(/\[RODE\s*VLAG[:\s]*([^\]]+)\]/gi);
    if (redFlagMatches) {
      (result as any).redFlags = redFlagMatches.map(flag => flag.replace(/\[RODE\s*VLAG[:\s]*/, '').replace(/\]/, '').trim());
    }

  } catch (error) {
    console.error('Error parsing HHSB analysis:', error);
  }

  return result;
}

// Fallback text extraction function for robust parsing
function extractFallbackFromText(text: string, sectionName: string): string {
  const sectionMappings: Record<string, string[]> = {
    hulpvraag: ['hulpvraag', 'primaire zorg', 'hoofdklacht', 'functionele doelen'],
    historie: ['historie', 'ontstaan', 'verloop', 'eerdere behandeling'],
    stoornissen: ['stoornissen', 'pijn', 'bewegingsbeperking', 'kracht'],
    beperkingen: ['beperkingen', 'adl', 'werk', 'sport'],
    'samenvatting anamnese': ['samenvatting anamnese', 'samenvatting', 'kernbevindingen', 'klinische indruk'],
    samenvatting: ['samenvatting', 'kernbevindingen', 'klinische indruk']
  };

  const keywords = sectionMappings[sectionName.toLowerCase()] || [sectionName];

  for (const keyword of keywords) {
    // Try multiple patterns to extract content
    const patterns = [
      new RegExp(`\\*\\*${keyword}:?\\*\\*[\\s]*([\\s\\S]*?)(?=\\*\\*[a-zA-Z]|###|$)`, 'i'),
      new RegExp(`### ${keyword} ###[\\s]*([\\s\\S]*?)(?=###|\\*\\*|$)`, 'i'),
      new RegExp(`•\\s*${keyword}[:\\s]*([^•\\n]*(?:\\n(?!•)[^\\n]*)*)`, 'i')
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 10) {
        return match[1].trim().substring(0, 1000); // Limit length
      }
    }
  }

  return `Geen ${sectionName} informatie beschikbaar`;
}