import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';
import { transcribeAudio } from '@/lib/api/transcription';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType, patientInfo, preparation, inputData } = body;

    if (!workflowType || !patientInfo || !inputData) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowType, patientInfo, inputData' },
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

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'No transcript available for processing' },
        { status: 400 }
      );
    }

    // Generate HHSB structured output
    const hhsbData = await generateHHSBAnalysis(patientInfo, preparation, transcript, workflowType);

    return NextResponse.json({
      success: true,
      data: hhsbData
    });

  } catch (error) {
    console.error('HHSB processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process HHSB data' },
      { status: 500 }
    );
  }
}

async function processAudioInput(inputData: any): Promise<string> {
  // For demonstration purposes, return a simulated transcript
  // In a real implementation, this would handle actual audio transcription
  if (inputData.type === 'recording') {
    return `[Simulatie] Patiënt rapporteert klachten die passen bij de hoofdklacht. Anamnese gegevens werden verzameld tijdens het gesprek. Verdere analyse is nodig voor een complete HHSB beoordeling.`;
  } else if (inputData.type === 'file') {
    return `[Simulatie] Audio bestand verwerkt. Patiënt beschrijft klachten en geeft relevante anamnese informatie. Transcript gegenereerd voor HHSB analyse.`;
  }
  return '';
}

async function generateHHSBAnalysis(
  patientInfo: any,
  preparation: string | null,
  transcript: string,
  workflowType: string
): Promise<any> {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  const systemPrompt = `Je bent een expert fysiotherapeut die intake data analyseert volgens de HHSB methodiek.

HHSB staat voor:
- H: Hulpvraag (motivatie/hulpvraag en doelen/verwachtingen van de patiënt)
- H: Historie (ontstaansmoment, verloop klachten en eerdere behandeling)
- S: Stoornissen (pijn, mobiliteit, kracht en stabiliteit)
- B: Beperkingen (ADL, werk en sport gerelateerde beperkingen)

Je taak is om de verstrekte informatie te analyseren en te structureren volgens deze HHSB indeling.
Geef voor elke sectie duidelijke, klinisch relevante informatie.
Voeg ook een beknopte samenvatting van de anamnese toe.

Output format:
- Gestructureerd volgens HHSB onderdelen
- Nederlandse medische terminologie
- Evidence-based bevindingen
- Klinisch relevante details
- ICF classificatie waar mogelijk`;

  const userPrompt = `Analyseer de volgende intake informatie en structureer volgens HHSB methodiek:

Patiëntgegevens:
- Initialen: ${initials}
- Leeftijd: ${age} jaar
- Geslacht: ${genderText}
- Hoofdklacht: ${chiefComplaint}

${preparation ? `Voorbereiding:\n${preparation}\n` : ''}

Intake transcript:
${transcript}

Genereer een volledige HHSB analyse met de volgende structuur:

**H - Hulpvraag:**
[Analyseer de hulpvraag, motivatie en doelen van de patiënt]

**H - Historie:**
[Beschrijf ontstaansmoment, verloop en eerdere behandelingen]

**S - Stoornissen in lichaamsfuncties en anatomische structuren:**
[Analyseer stoornissen in pijn, mobiliteit, kracht en stabiliteit]

**B - Beperkingen:**
[Beschrijf beperkingen in ADL, werk en sport]

**Samenvatting Anamnese:**
[Geef een beknopte, klinische samenvatting van de belangrijkste bevindingen]

Zorg dat elke sectie inhoudelijk gevuld is op basis van de beschikbare informatie.`;

  const completion = await openaiClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.3,
    max_tokens: 2000,
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

function parseHHSBAnalysis(analysisText: string): any {
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
    const redFlagMatch = analysisText.match(/\[RODE\s*VLAG[:\s]*([^\]]+)\]/gi);
    if (redFlagMatch) {
      result.redFlags = redFlagMatch.map(flag => flag.replace(/\[RODE\s*VLAG[:\s]*/, '').replace(/\]/, '').trim());
    }

  } catch (error) {
    console.error('Error parsing HHSB analysis:', error);
  }

  return result;
}