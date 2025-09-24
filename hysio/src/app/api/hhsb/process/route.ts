import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { apiCache } from '@/lib/cache/api-cache';

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
    } else if (inputData.type === 'recording' || inputData.type === 'file') {
      // For now, simulate transcription
      transcript = `[Simulatie] Patiënt rapporteert klachten die passen bij de hoofdklacht "${patientInfo.chiefComplaint}". Anamnese gegevens werden verzameld tijdens het gesprek.`;
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

    // Check cache first for performance optimization
    const cachedResult = await apiCache.getCachedHHSBResult(
      patientInfo,
      transcript,
      preparation || undefined
    );

    if (cachedResult) {
      console.log(`Cache HIT for HHSB processing: ${patientInfo.chiefComplaint}`);
      return NextResponse.json({
        success: true,
        data: cachedResult
      });
    }

    console.log(`Cache MISS for HHSB processing: ${patientInfo.chiefComplaint}`);

    // Generate HHSB structured output using OpenAI
    const hhsbData = await generateHHSBAnalysis(patientInfo, preparation, transcript);

    // Cache the result for future requests
    await apiCache.cacheHHSBResult(
      patientInfo,
      transcript,
      hhsbData,
      preparation || undefined
    );

    return NextResponse.json({
      success: true,
      data: hhsbData
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

async function generateHHSBAnalysis(patientInfo: any, preparation: string | null, transcript: string) {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  const systemPrompt = `Je bent een ervaren fysiotherapeut die een gestructureerde HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) anamnese maakt.

Analyseer de transcriptie van het gesprek met de patiënt en struktureer deze volgens de HHSB methodiek.

Format je antwoord als volgt:
**H - Hulpvraag:**
[Wat wil de patiënt bereiken, wat is de reden van komst]

**H - Historie:**
[Ontstaan, verloop, eerdere behandeling]

**S - Stoornissen:**
[Pijn, bewegingsbeperkingen, andere symptomen]

**B - Beperkingen:**
[Impact op dagelijkse leven, werk, sport]

**Samenvatting Anamnese:**
[Korte samenvatting van de bevindingen]

Als er rode vlagen zijn, vermeld deze als [RODE VLAG: beschrijving]`;

  const userPrompt = `Patiënt informatie:
- Initialen: ${initials}
- Leeftijd: ${age} jaar
- Geslacht: ${genderText}
- Hoofdklacht: ${chiefComplaint}

${preparation ? `Voorbereiding:\n${preparation}\n\n` : ''}

Transcriptie van het gesprek:
${transcript}

Maak een gestructureerde HHSB analyse van deze informatie.`;

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

    // Parse the analysis into structured format
    const hhsbStructure = parseHHSBAnalysis(analysisText);

    return {
      hhsbStructure,
      fullStructuredText: analysisText,
      transcript,
      workflowType: 'intake-automatisch',
      processedAt: new Date().toISOString(),
      patientInfo: {
        initials,
        age,
        gender: genderText,
        chiefComplaint
      }
    };

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate HHSB analysis');
  }
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