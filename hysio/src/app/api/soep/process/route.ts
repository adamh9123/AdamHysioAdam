import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';

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

    // Generate SOEP structured output
    const soepData = await generateSOEPAnalysis(patientInfo, preparation, transcript, workflowType);

    return NextResponse.json({
      success: true,
      data: soepData
    });

  } catch (error) {
    console.error('SOEP processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process SOEP data' },
      { status: 500 }
    );
  }
}

async function processAudioInput(inputData: any): Promise<string> {
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
  patientInfo: any,
  preparation: string | null,
  transcript: string,
  workflowType: string
): Promise<any> {
  const { initials, birthYear, gender, chiefComplaint } = patientInfo;
  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  const systemPrompt = `Je bent een expert fysiotherapeut die follow-up consulten analyseert volgens de SOEP methodiek.

SOEP staat voor:
- S: Subjectief (klachten, ervaring en observaties van de patiënt)
- O: Objectief (meetbare bevindingen, tests en observaties van de therapeut)
- E: Evaluatie (interpretatie, analyse en klinische redenering)
- P: Plan (behandelplan, doelen en vervolgafspraken)

Je taak is om de verstrekte follow-up informatie te analyseren en te structureren volgens deze SOEP indeling.
Focus op continuïteit van zorg en evaluatie van voortgang sinds vorige behandeling.

Output format:
- Gestructureerd volgens SOEP onderdelen
- Nederlandse medische terminologie
- Evidence-based evaluatie
- Klinisch relevante details
- Duidelijke vervolgstappen`;

  const userPrompt = `Analyseer de volgende follow-up consult informatie en structureer volgens SOEP methodiek:

Patiëntgegevens:
- Initialen: ${initials}
- Leeftijd: ${age} jaar
- Geslacht: ${genderText}
- Hoofdklacht: ${chiefComplaint}

${preparation ? `Voorbereiding:\n${preparation}\n` : ''}

Consult transcript:
${transcript}

Genereer een volledige SOEP analyse met de volgende structuur:

**S - Subjectief:**
[Analyseer patiënt gerapporteerde klachten, ervaringen en observaties]

**O - Objectief:**
[Beschrijf meetbare bevindingen, tests en therapeut observaties]

**E - Evaluatie:**
[Geef interpretatie, analyse en klinische redenering van de bevindingen]

**P - Plan:**
[Beschrijf behandelplan, doelen en vervolgafspraken]

**Samenvatting Consult:**
[Geef een beknopte samenvatting van het consult en belangrijkste beslissingen]

Zorg dat elke sectie inhoudelijk gevuld is op basis van de beschikbare informatie en focus op continuïteit van zorg.`;

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

function parseSOEPAnalysis(analysisText: string): any {
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