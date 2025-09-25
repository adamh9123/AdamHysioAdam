import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { detectRedFlags, generateRedFlagsSummary, extractRedFlagsList } from '@/lib/medical/red-flags-detection';
import {
  createEnhancedHHSBPrompt,
  createEnhancedHHSBUserPrompt,
  parseEnhancedHHSBAnalysis,
  validateHHSBCompleteness,
  type EnhancedHHSBStructure
} from '@/lib/medical/hhsb-generation';
import {
  createEnhancedOnderzoekPrompt,
  createEnhancedOnderzoekUserPrompt,
  parseEnhancedOnderzoekAnalysis,
  type EnhancedOnderzoeksBevindingen
} from '@/lib/medical/onderzoek-generation';
import {
  createEnhancedConclusiePrompt,
  createEnhancedConclusieUserPrompt,
  parseEnhancedConclusieAnalysis,
  type EnhancedKlinischeConclusie
} from '@/lib/medical/klinische-conclusie-generation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType, patientInfo, preparation, inputData } = body;

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

    if (!transcript || transcript.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'No valid transcript available for processing' },
        { status: 400 }
      );
    }

    // Caching disabled to ensure fresh results for each request

    // Generate complete intake data (HHSB, Onderzoek, Klinische Conclusie) using OpenAI
    const startTime = Date.now();
    const completeIntakeData = await generateCompleteIntakeAnalysis(patientInfo, preparation, transcript);
    const endTime = Date.now();
    const processingDuration = (endTime - startTime) / 1000; // in seconds

    // Add processing metadata
    const resultWithMetadata = {
      ...completeIntakeData,
      processingDuration,
      generatedAt: new Date().toISOString()
    };

    // Caching disabled - not storing results for future requests

    return NextResponse.json({
      success: true,
      data: resultWithMetadata
    });

  } catch (error) {
    console.error('HHSB processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'HHSB processing failed'
      },
      { status: 500 }
    );
  }
}

async function generateHHSBAnalysis(
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
      model: 'gpt-4o-mini',
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
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : 'vrouw';

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
    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000, // Increased for comprehensive three-section analysis
    });

    const analysisText = completion.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse all three enhanced sections
    const enhancedHHSB = parseEnhancedHHSBAnalysis(analysisText);
    const enhancedOnderzoek = parseEnhancedOnderzoekAnalysis(analysisText);
    const enhancedConclusie = parseEnhancedConclusieAnalysis(analysisText);

    // Validate HHSB completeness and quality
    const hhsbValidation = validateHHSBCompleteness(enhancedHHSB);

    // Systematic Red Flags Detection using comprehensive medical criteria
    const detectedRedFlags = detectRedFlags(transcript, { age, gender: genderText, chiefComplaint });
    const redFlagsSummary = generateRedFlagsSummary(detectedRedFlags);
    const redFlagsList = extractRedFlagsList(detectedRedFlags);

    // Also parse legacy format for backward compatibility
    const legacyParsed = parseCompleteIntakeAnalysis(analysisText);

    return {
      // Enhanced structures
      hhsbAnamneseCard: enhancedHHSB,
      onderzoeksBevindingen: enhancedOnderzoek,
      klinischeConclusie: enhancedConclusie,

      // Legacy structures for backward compatibility
      legacyHHSB: legacyParsed.hhsb,
      legacyOnderzoek: legacyParsed.onderzoek,
      legacyConclusie: legacyParsed.conclusie,

      // Red flags and validation
      redFlags: redFlagsList,
      redFlagsDetailed: detectedRedFlags,
      redFlagsSummary,
      hhsbValidation,

      // Metadata
      fullStructuredText: analysisText,
      transcript,
      generatedAt: new Date().toISOString(),
      processingDuration: 0 // Will be calculated by caller
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate complete intake analysis');
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
      result.redFlags = redFlagMatches.map(flag => flag.replace(/\[RODE\s*VLAG[:\s]*/, '').replace(/\]/, '').trim());
    }

  } catch (error) {
    console.error('Error parsing HHSB analysis:', error);
  }

  return result;
}