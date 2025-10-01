import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { INTAKE_STAPSGEWIJS_VERWERKING_ONDERZOEKSBEVINDINGEN_PROMPT } from '@/lib/prompts';
import { detectRedFlags, generateRedFlagsSummary, extractRedFlagsList } from '@/lib/medical/red-flags-detection';
import { isValidInputData, isValidTranscript, createValidationError, createServerError } from '@/lib/utils/api-validation';
import type {
  ApiResponse,
  PatientInfo
} from '@/types/api';

interface OnderzoekProcessRequest {
  workflowType: string;
  patientInfo: PatientInfo;
  preparation: string | null;
  inputData: {
    type: 'manual' | 'transcribed-audio';
    data: string;
    originalSource?: string;
    duration?: number;
  };
  previousStepData?: {
    anamneseResult?: any;
  };
}

interface OnderzoekProcessResponse {
  onderzoekStructure: {
    inspectieEnPalpatie: string;
    bewegingsonderzoek: string;
    specifiekeTests: string;
    klinimetrie: string;
    samenvatting: string;
  };
  klinischeSynthese: {
    interpretatie: string;
    diagnose: string;
    onderbouwing: string;
  };
  epdTemplate: string;
  fullStructuredText: string;
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: {
    initials: string;
    age: number;
    gender: string;
    chiefComplaint: string;
  };
  redFlags: string[];
  redFlagsDetailed: any;
  redFlagsSummary: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<OnderzoekProcessResponse>>> {
  try {
    const body: OnderzoekProcessRequest = await request.json();
    const { workflowType, patientInfo, preparation, inputData, previousStepData } = body;

    // Validate required fields
    if (!workflowType || !patientInfo || !inputData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: workflowType, patientInfo, inputData'
        },
        { status: 400 }
      );
    }

    // Validate input data structure
    if (!isValidInputData(inputData)) {
      return NextResponse.json(
        createValidationError('inputData', 'Invalid input data structure'),
        { status: 400 }
      );
    }

    let transcript = '';

    // Process input data based on type
    const inputType = inputData.type as 'manual' | 'transcribed-audio';
    switch (inputType) {
      case 'manual':
        transcript = inputData.data;
        console.log('Processing manual onderzoek input:', transcript.substring(0, 100) + '...');
        break;
      case 'transcribed-audio':
        transcript = inputData.data;
        console.log('Processing transcribed onderzoek audio (' + inputData.originalSource + '):', transcript.substring(0, 100) + '...');
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid input data type for onderzoek processing' },
          { status: 400 }
        );
    }

    if (!isValidTranscript(transcript)) {
      return NextResponse.json(
        createValidationError('transcript', 'No valid transcript available for onderzoek processing'),
        { status: 400 }
      );
    }

    // Generate onderzoek analysis using specific prompt
    const onderzoekData = await generateOnderzoekAnalysis(patientInfo, preparation, transcript, workflowType, previousStepData?.anamneseResult);

    // Optimize response based on client type
    // const userAgent = request.headers.get('user-agent') || undefined;
    const response = NextResponse.json({
      success: true,
      data: onderzoekData
    });

    response.headers.set('X-Processing-Type', 'onderzoek');
    response.headers.set('X-Workflow-Step', '4');

    return response;

  } catch (error) {
    console.error('Onderzoek processing error:', error);

    return NextResponse.json(
      createServerError(error, 'Onderzoek processing'),
      { status: 500 }
    );
  }
}

async function generateOnderzoekAnalysis(
  patientInfo: PatientInfo,
  preparation: string | null,
  transcript: string,
  workflowType: string,
  anamneseResult?: any
): Promise<OnderzoekProcessResponse> {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  // Create user prompt for onderzoek processing
  const userPrompt = `PATIËNT INFORMATIE:
• Initialen: ${initials}
• Leeftijd: ${age} jaar
• Geslacht: ${genderText}
• Hoofdklacht: ${chiefComplaint}

${anamneseResult ? `HHSB ANAMNESEKAART (CONTEXT):
${typeof anamneseResult === 'object' ? JSON.stringify(anamneseResult, null, 2) : anamneseResult}

` : ''}

${preparation ? `ONDERZOEKSVOORSTEL:
${preparation}

` : ''}

TRANSCRIPTIE LICHAMELIJK ONDERZOEK:
${transcript}

Verwerk het lichamelijk onderzoek volgens de instructies en genereer een volledig onderzoeksverslag met zowel objectieve bevindingen als klinische synthese.`;

  console.log('🔍 Generating onderzoek analysis with specific prompt...');

  const completion = await openaiClient().chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      { role: 'system', content: INTAKE_STAPSGEWIJS_VERWERKING_ONDERZOEKSBEVINDINGEN_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 2500,
  });

  const analysisText = completion.choices[0]?.message?.content;

  if (!analysisText) {
    throw new Error('No onderzoek analysis generated');
  }

  console.log('🔍 DEBUG - Raw AI Onderzoek Analysis Text:', analysisText);

  // Parse the onderzoek analysis into structured format
  const onderzoekStructure = parseOnderzoekAnalysis(analysisText);

  // Systematic Red Flags Detection
  const detectedRedFlags = detectRedFlags(transcript, { age, gender: genderText, chiefComplaint });
  const redFlagsSummary = generateRedFlagsSummary(detectedRedFlags);
  const redFlagsList = extractRedFlagsList(detectedRedFlags);

  const finalResult = {
    onderzoekStructure,
    klinischeSynthese: {
      interpretatie: onderzoekStructure.samenvatting || 'Geen interpretatie beschikbaar',
      diagnose: extractDiagnoseFromText(analysisText),
      onderbouwing: extractOnderbouwingFromText(analysisText)
    },
    epdTemplate: extractEpdTemplateFromText(analysisText),
    fullStructuredText: analysisText,
    transcript,
    workflowType,
    processedAt: new Date().toISOString(),
    patientInfo: {
      initials,
      age,
      gender: genderText,
      chiefComplaint
    },
    redFlags: redFlagsList,
    redFlagsDetailed: detectedRedFlags,
    redFlagsSummary
  };

  console.log('🔍 DEBUG - Final Onderzoek Result:', finalResult);
  return finalResult;
}

function parseOnderzoekAnalysis(analysisText: string) {
  const result = {
    inspectieEnPalpatie: '',
    bewegingsonderzoek: '',
    specifiekeTests: '',
    klinimetrie: '',
    samenvatting: ''
  };

  try {
    // Extract Inspectie & Palpatie
    const inspectieMatch = analysisText.match(/1\.\s*Inspectie\s*&\s*Palpatie([\s\S]*?)(?=2\.|Deel 2|##|\n\n---)/i);
    if (inspectieMatch) {
      result.inspectieEnPalpatie = inspectieMatch[1].trim();
    }

    // Extract Bewegingsonderzoek
    const bewegingMatch = analysisText.match(/2\.\s*Bewegingsonderzoek([\s\S]*?)(?=3\.|Deel 2|##|\n\n---)/i);
    if (bewegingMatch) {
      result.bewegingsonderzoek = bewegingMatch[1].trim();
    }

    // Extract Kracht & Stabiliteit (section 3)
    const krachtMatch = analysisText.match(/3\.\s*Kracht\s*&\s*Stabiliteit([\s\S]*?)(?=4\.|5\.|Deel 2|##|\n\n---)/i);

    // Extract Neurologisch Onderzoek (section 4)
    const neurologischMatch = analysisText.match(/4\.\s*Neurologisch\s*Onderzoek([\s\S]*?)(?=5\.|6\.|Deel 2|##|\n\n---)/i);

    // Extract Functietesten (section 5)
    const functietestenMatch = analysisText.match(/5\.\s*Functietesten([\s\S]*?)(?=6\.|Deel 2|##|\n\n---)/i);

    // Extract Klinimetrie (section 6)
    const klinimetrieMatch = analysisText.match(/6\.\s*Klinimetrie([\s\S]*?)(?=Deel 2|##|\n\n---)/i);

    // Combine test sections for specifiekeTests
    const testSections = [];
    if (krachtMatch) testSections.push('**Kracht & Stabiliteit:**\n' + krachtMatch[1].trim());
    if (neurologischMatch) testSections.push('**Neurologisch Onderzoek:**\n' + neurologischMatch[1].trim());
    if (functietestenMatch) testSections.push('**Functietesten:**\n' + functietestenMatch[1].trim());

    result.specifiekeTests = testSections.join('\n\n');

    if (klinimetrieMatch) {
      result.klinimetrie = klinimetrieMatch[1].trim();
    }

    // Extract Samenvatting from Deel 2
    const samenvattingMatch = analysisText.match(/1\.\s*Interpretatie\s*&\s*Samenvatting\s*van\s*Bevindingen([\s\S]*?)(?=2\.|##|$)/i);
    if (samenvattingMatch) {
      result.samenvatting = samenvattingMatch[1].trim();
    }

    // Fallback: if parsing failed, extract general content
    if (!result.specifiekeTests) {
      // Try to extract sections 3-6 as a block
      const testsBlockMatch = analysisText.match(/3\.\s*Kracht[\s\S]*?(?=Deel 2|##|\n\n---)/i);
      if (testsBlockMatch) {
        result.specifiekeTests = testsBlockMatch[0];
      }
    }

    if (!result.klinimetrie) {
      // Try to extract klinimetrie content more broadly
      const klinimetrieAltMatch = analysisText.match(/Pijnscores?\s*NRS[\s\S]*?(?=\n\n|Deel 2|##)/i);
      if (klinimetrieAltMatch) {
        result.klinimetrie = klinimetrieAltMatch[0];
      }
    }

    console.log('🔍 DEBUG - Parsed Onderzoek Structure:', result);

  } catch (error) {
    console.error('Error parsing onderzoek analysis:', error);
  }

  return result;
}

function extractDiagnoseFromText(text: string): string {
  const diagnoseMatch = text.match(/2\.\s*Fysiotherapeutische\s*Diagnose([\s\S]*?)(?=3\.|##|$)/i);
  if (diagnoseMatch) {
    return diagnoseMatch[1].trim();
  }
  return 'Geen diagnose beschikbaar';
}

function extractOnderbouwingFromText(text: string): string {
  const onderbouwingMatch = text.match(/3\.\s*Onderbouwing\s*&\s*Verantwoording([\s\S]*?)(?=⚙️|##|$)/i);
  if (onderbouwingMatch) {
    return onderbouwingMatch[1].trim();
  }
  return 'Geen onderbouwing beschikbaar';
}

function extractEpdTemplateFromText(text: string): string {
  const templateMatch = text.match(/⚙️\s*Template\s*Klaar\s*voor\s*EPD-invoer([\s\S]*?)$/i);
  if (templateMatch) {
    return templateMatch[1].trim();
  }
  return 'Geen EPD template beschikbaar';
}