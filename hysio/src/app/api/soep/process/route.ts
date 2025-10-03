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
  PatientInfo
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
        { success: false, error: 'Invalid input data type' },
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
    const soepData = await generateSOEPAnalysis(patientInfo, preparation || null, transcript, workflowType);

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
      data: optimizedResponse as SOEPProcessResponse
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
  const options = preparation ? { preparation } : undefined;
  const { system: systemPrompt, user: userPrompt } = getOptimizedProcessingPrompt(
    'soep',
    patientInfo,
    transcript,
    options
  );

  // v8.5 FORENSICALLY-FIXED SOEP GENERATION:
  // - CRITICAL BUG FIX: Removed transcript truncation (was 2000 chars, now full transcript)
  // - Fixed invalid model name: 'gpt-4-turbo-preview' → 'gpt-4-turbo'
  // - Increased max_tokens to 3500 for complete detailed SOEP output
  // - Added comprehensive diagnostic logging for forensic analysis

  // FORENSIC LOGGING: Log payload before API call
  console.log('🔍 SOEP GENERATION DIAGNOSTIC PAYLOAD:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Patient Info:', { initials, birthYear, gender, chiefComplaint });
  console.log('📏 System Prompt Length:', systemPrompt.length, 'characters');
  console.log('📏 User Prompt Length:', userPrompt.length, 'characters');
  console.log('📏 Transcript Length:', transcript.length, 'characters');
  console.log('📝 Transcript Preview (first 500 chars):', transcript.substring(0, 500));
  console.log('📝 Transcript End (last 500 chars):', transcript.substring(Math.max(0, transcript.length - 500)));
  console.log('⚙️  Model: gpt-4-turbo');
  console.log('⚙️  Max Tokens: 3500');
  console.log('⚙️  Temperature: 0.2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const completion = await openaiClient().chat.completions.create({
    model: 'gpt-4-turbo', // FIXED: Correct model name (was 'gpt-4-turbo-preview')
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2, // Lower temperature for more consistent clinical documentation
    max_tokens: 3500, // Increased from 2500 to accommodate complete detailed SOEP with all sections
  });

  // FORENSIC LOGGING: Log AI response
  console.log('🤖 AI MODEL RESPONSE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📏 Response Length:', completion.choices[0]?.message?.content?.length || 0, 'characters');
  console.log('🔢 Tokens Used:', completion.usage?.total_tokens || 'N/A');
  console.log('📝 Response Preview (first 1000 chars):', completion.choices[0]?.message?.content?.substring(0, 1000));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const analysisText = completion.choices[0]?.message?.content;

  if (!analysisText) {
    throw new Error('No analysis generated');
  }

  // Parse the analysis into structured format with enhanced diagnostic logging
  console.log('🔍 PARSING SOEP STRUCTURE FROM AI RESPONSE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const soepStructure = parseSOEPAnalysis(analysisText);
  console.log('✅ Parsed SOEP Sections:');
  console.log('   📝 Subjectief:', soepStructure.subjectief ? `${soepStructure.subjectief.length} chars` : '❌ EMPTY');
  console.log('   🔬 Objectief:', soepStructure.objectief ? `${soepStructure.objectief.length} chars` : '❌ EMPTY');
  console.log('   📊 Evaluatie:', soepStructure.evaluatie ? `${soepStructure.evaluatie.length} chars` : '❌ EMPTY');
  console.log('   🎯 Plan:', soepStructure.plan ? `${soepStructure.plan.length} chars` : '❌ EMPTY');
  console.log('   💬 Consult Summary:', soepStructure.consultSummary ? `${soepStructure.consultSummary.length} chars` : '❌ EMPTY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Systematic Red Flags Detection using comprehensive medical criteria
  const detectedRedFlags = detectRedFlags(transcript, { age, gender: genderText, chiefComplaint });
  const redFlagsSummary = generateRedFlagsSummary(detectedRedFlags);
  const redFlagsList = extractRedFlagsList(detectedRedFlags);

  // Add systematic red flags to SOEP structure
  soepStructure.redFlags = redFlagsList;

  const finalResult = {
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

  console.log('🎉 SOEP GENERATION COMPLETE:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ All sections populated:',
    soepStructure.subjectief && soepStructure.objectief &&
    soepStructure.evaluatie && soepStructure.plan ? 'YES ✓' : '❌ INCOMPLETE');
  console.log('🚩 Red Flags Detected:', detectedRedFlags.length || 0);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return finalResult;
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
    // Extract Subjectief - Updated regex to match actual AI output format
    const subjectiefMatch = analysisText.match(/S:\s*Subjectief[\s\r\n]*([\s\S]*?)(?=\r?\n\s*O:\s*Objectief|\r?\n\s*E:\s*Evaluatie|\r?\n\s*P:\s*Plan|---|⚙️|$)/i);
    if (subjectiefMatch) {
      result.subjectief = subjectiefMatch[1].trim();
      console.log('🔍 DEBUG - Subjectief extracted:', result.subjectief.substring(0, 100));
    }

    // Extract Objectief - Updated regex
    const objectiefMatch = analysisText.match(/O:\s*Objectief[\s\r\n]*([\s\S]*?)(?=\r?\n\s*E:\s*Evaluatie|\r?\n\s*P:\s*Plan|---|⚙️|$)/i);
    if (objectiefMatch) {
      result.objectief = objectiefMatch[1].trim();
      console.log('🔍 DEBUG - Objectief extracted:', result.objectief.substring(0, 100));
    }

    // Extract Evaluatie - Updated regex
    const evaluatieMatch = analysisText.match(/E:\s*Evaluatie[\s\r\n]*([\s\S]*?)(?=\r?\n\s*P:\s*Plan|---|⚙️|$)/i);
    if (evaluatieMatch) {
      result.evaluatie = evaluatieMatch[1].trim();
      console.log('🔍 DEBUG - Evaluatie extracted:', result.evaluatie.substring(0, 100));
    }

    // Extract Plan - Updated regex to STOP before Samenvatting Consult
    const planMatch = analysisText.match(/P:\s*Plan[\s\r\n]*([\s\S]*?)(?=\*\*Samenvatting|---|⚙️|$)/i);
    if (planMatch) {
      result.plan = planMatch[1].trim();
      console.log('🔍 DEBUG - Plan extracted:', result.plan.substring(0, 100));
    }

    // Extract EPD Summary from the template section
    const epdTemplateMatch = analysisText.match(/⚙️\s*Template\s*Klaar\s*voor\s*EPD-invoer[\s\S]*?SOEP-verslag[\s\S]*?([\s\S]*?)$/i);
    if (epdTemplateMatch) {
      // Extract the short summary format from EPD template
      const templateContent = epdTemplateMatch[1].trim();

      // Try to get the summary from S:, O:, E:, P: in template
      const templateSMatch = templateContent.match(/S:\s*([^\r\n]*(?:\r?\n(?!\s*[OEP]:)[^\r\n]*)*)/i);
      const templateOMatch = templateContent.match(/O:\s*([^\r\n]*(?:\r?\n(?!\s*[EP]:)[^\r\n]*)*)/i);
      const templateEMatch = templateContent.match(/E:\s*([^\r\n]*(?:\r?\n(?!\s*P:)[^\r\n]*)*)/i);
      const templatePMatch = templateContent.match(/P:\s*([\s\S]*)/i);

      if (templateSMatch && templateOMatch && templateEMatch && templatePMatch) {
        result.consultSummary = [
          `S: ${templateSMatch[1].trim()}`,
          `O: ${templateOMatch[1].trim()}`,
          `E: ${templateEMatch[1].trim()}`,
          `P: ${templatePMatch[1].trim()}`
        ].join('\n\n');
        console.log('🔍 DEBUG - Consult Summary extracted from EPD template:', result.consultSummary.substring(0, 100));
      }
    }

    // Extract the new brief consult summary (10-15 words)
    if (!result.consultSummary) {
      const briefSummaryMatch = analysisText.match(/\*\*Samenvatting\s*Consult:?\*\*\s*([^\r\n]+)/i);
      if (briefSummaryMatch) {
        result.consultSummary = briefSummaryMatch[1].trim();
        console.log('🔍 DEBUG - Brief Consult Summary extracted:', result.consultSummary);
      }
    }

    // Fallback: try to extract general summary
    if (!result.consultSummary) {
      const summaryMatch = analysisText.match(/\*\*Samenvatting\s*(?:Consult)?:?\*\*\s*([\s\S]*?)$/i);
      if (summaryMatch) {
        result.consultSummary = summaryMatch[1].trim();
      }
    }

    // Extract red flags if present
    const redFlagMatch = analysisText.match(/\[RODE\s*VLAG[:\s]*([^\]]+)\]/gi);
    if (redFlagMatch) {
      (result as any).redFlags = redFlagMatch.map(flag => flag.replace(/\[RODE\s*VLAG[:\s]*/, '').replace(/\]/, '').trim());
    }

    // Log if any sections weren't extracted
    if (!result.subjectief) console.warn('⚠️ No Subjectief content extracted');
    if (!result.objectief) console.warn('⚠️ No Objectief content extracted');
    if (!result.evaluatie) console.warn('⚠️ No Evaluatie content extracted');
    if (!result.plan) console.warn('⚠️ No Plan content extracted');
    if (!result.consultSummary) console.warn('⚠️ No Consult Summary extracted');

  } catch (error) {
    console.error('Error parsing SOEP analysis:', error);
  }

  return result;
}

