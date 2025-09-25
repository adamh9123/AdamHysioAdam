import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { isValidInputData, isValidTranscript, createValidationError, createServerError } from '@/lib/utils/api-validation';
import { getOptimizedProcessingPrompt } from '@/lib/prompts/optimized-prompts';
import { generateOptimizedResponseWithMetadata, detectClientType } from '@/lib/utils/response-optimization';
import { detectRedFlags, generateRedFlagsSummary, extractRedFlagsList } from '@/lib/medical/red-flags-detection';
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

    // Caching disabled to ensure fresh results for each request

    // Generate SOEP structured output
    const soepData = await generateSOEPAnalysis(patientInfo, preparation, transcript, workflowType);

    // Caching disabled - not storing results for future requests

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

// REMOVED: processAudioInput function - audio transcription must happen client-side
// This API endpoint should only receive pre-transcribed text, never raw audio

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

  // Systematic Red Flags Detection using comprehensive medical criteria
  const detectedRedFlags = detectRedFlags(transcript, { age, gender: genderText, chiefComplaint });
  const redFlagsSummary = generateRedFlagsSummary(detectedRedFlags);
  const redFlagsList = extractRedFlagsList(detectedRedFlags);

  // Add systematic red flags to SOEP structure
  soepStructure.redFlags = redFlagsList;

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
    },
    redFlagsDetailed: detectedRedFlags, // Full structured red flags
    redFlagsSummary // Clinical summary for documentation
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

