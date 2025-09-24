import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { isValidInputData, isValidTranscript, createValidationError, createServerError } from '@/lib/utils/api-validation';
import { getOptimizedProcessingPrompt } from '@/lib/prompts/optimized-prompts';
import { apiCache } from '@/lib/cache/api-cache';
import { generateOptimizedResponseWithMetadata, detectClientType } from '@/lib/utils/response-optimization';
import type {
  SOEPProcessRequest,
  SOEPProcessResponse,
  SOEPStructure,
  ApiResponse,
  PatientInfo,
  InputData
} from '@/types/api';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<SOEPProcessResponse>>> {
  try {
    const body: SOEPProcessRequest = await request.json();
    const { workflowType, patientInfo, preparation, inputData } = body;

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
    if (inputData.type === 'manual') {
      transcript = inputData.data;
    } else if (inputData.type === 'recording' || inputData.type === 'file') {
      // For now, we'll simulate transcription since the audio data needs to be properly handled
      // In a real implementation, you would need to process the audio file/blob
      transcript = await processAudioInput(inputData);
    } else {
      return NextResponse.json(
        { error: 'Invalid input data type' },
        { status: 400 }
      );
    }

    if (!isValidTranscript(transcript)) {
      return NextResponse.json(
        createValidationError('transcript', 'No valid transcript available for processing'),
        { status: 400 }
      );
    }

    // Check cache first for performance optimization
    const cachedResult = await apiCache.getCachedSOEPResult(
      patientInfo,
      transcript,
      preparation || undefined
    );

    if (cachedResult) {
      console.log(`Cache HIT for SOEP processing: ${patientInfo.chiefComplaint}`);
      return NextResponse.json({
        success: true,
        data: cachedResult
      });
    }

    console.log(`Cache MISS for SOEP processing: ${patientInfo.chiefComplaint}`);

    // Generate SOEP structured output
    const soepData = await generateSOEPAnalysis(patientInfo, preparation, transcript, workflowType);

    // Cache the result for future requests
    await apiCache.cacheSOEPResult(
      patientInfo,
      transcript,
      soepData,
      preparation || undefined
    );

    // Optimize response based on client type
    const userAgent = request.headers.get('user-agent') || undefined;
    const clientType = detectClientType(userAgent);
    const { response: optimizedResponse, metadata } = generateOptimizedResponseWithMetadata(
      soepData,
      clientType
    );

    // Add optimization metadata to response headers
    const response = NextResponse.json({
      success: true,
      data: optimizedResponse
    });

    response.headers.set('X-Response-Original-Size', metadata.originalSize.toString());
    response.headers.set('X-Response-Compressed-Size', metadata.compressedSize.toString());
    response.headers.set('X-Response-Compression-Ratio', metadata.compressionRatio.toFixed(2));
    response.headers.set('X-Response-Client-Type', metadata.clientType);

    return response;

  } catch (error) {
    console.error('SOEP processing error:', error);

    return NextResponse.json(
      createServerError(error, 'SOEP processing'),
      { status: 500 }
    );
  }
}

async function processAudioInput(inputData: InputData): Promise<string> {
  // For demonstration purposes, return a simulated transcript
  // In a real implementation, this would handle actual audio transcription
  if (inputData.type === 'recording') {
    return `[Simulatie] Follow-up consult - Patiënt rapporteert vooruitgang sinds vorige behandeling. Subjectieve klachten besproken, objectieve bevindingen verzameld, evaluatie uitgevoerd en behandelplan aangepast.`;
  } else if (inputData.type === 'file') {
    return `[Simulatie] Audio bestand follow-up consult verwerkt. SOEP methodiek toegepast voor systematische documentatie van het consult.`;
  }
  return '';
}

async function generateSOEPAnalysis(
  patientInfo: PatientInfo,
  preparation: string | null,
  transcript: string,
  workflowType: string
): Promise<SOEPProcessResponse> {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  // Use optimized prompts for better token efficiency
  const { system: systemPrompt, user: userPrompt } = getOptimizedProcessingPrompt(
    'soep',
    patientInfo,
    transcript,
    preparation || undefined
  );

  const completion = await openaiClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 1500, // Optimized from 2000 for better efficiency
  });

  const analysisText = completion.choices[0]?.message?.content;

  if (!analysisText) {
    throw new Error('No analysis generated');
  }

  // Parse the analysis into structured format
  const soepStructure = parseSOEPAnalysis(analysisText);

  return {
    soepStructure,
    fullStructuredText: analysisText,
    transcript,
    workflowType,
    processedAt: new Date().toISOString(),
    patientInfo: {
      initials,
      age,
      gender: genderText,
      chiefComplaint
    }
  };
}

function parseSOEPAnalysis(analysisText: string): SOEPStructure {
  const result = {
    subjectief: '',
    objectief: '',
    evaluatie: '',
    plan: '',
    consultSummary: '',
    redFlags: [],
    fullStructuredText: analysisText
  };

  try {
    // Extract Subjectief
    const subjectiefMatch = analysisText.match(/\*\*S\s*-\s*Subjectief:?\*\*\s*([\s\S]*?)(?=\*\*O\s*-|\*\*E\s*-|\*\*P\s*-|\*\*Samenvatting|$)/i);
    if (subjectiefMatch) {
      result.subjectief = subjectiefMatch[1].trim();
    }

    // Extract Objectief
    const objectiefMatch = analysisText.match(/\*\*O\s*-\s*Objectief:?\*\*\s*([\s\S]*?)(?=\*\*E\s*-|\*\*P\s*-|\*\*Samenvatting|$)/i);
    if (objectiefMatch) {
      result.objectief = objectiefMatch[1].trim();
    }

    // Extract Evaluatie
    const evaluatieMatch = analysisText.match(/\*\*E\s*-\s*Evaluatie:?\*\*\s*([\s\S]*?)(?=\*\*P\s*-|\*\*Samenvatting|$)/i);
    if (evaluatieMatch) {
      result.evaluatie = evaluatieMatch[1].trim();
    }

    // Extract Plan
    const planMatch = analysisText.match(/\*\*P\s*-\s*Plan:?\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|$)/i);
    if (planMatch) {
      result.plan = planMatch[1].trim();
    }

    // Extract Summary
    const summaryMatch = analysisText.match(/\*\*Samenvatting\s*(?:Consult)?:?\*\*\s*([\s\S]*?)$/i);
    if (summaryMatch) {
      result.consultSummary = summaryMatch[1].trim();
    }

    // Extract red flags if present
    const redFlagMatch = analysisText.match(/\[RODE\s*VLAG[:\s]*([^\]]+)\]/gi);
    if (redFlagMatch) {
      result.redFlags = redFlagMatch.map(flag => flag.replace(/\[RODE\s*VLAG[:\s]*/, '').replace(/\]/, '').trim());
    }

  } catch (error) {
    console.error('Error parsing SOEP analysis:', error);
  }

  return result;
}

