import { NextRequest, NextResponse } from 'next/server';
import { openaiClient } from '@/lib/api/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType, step, patientInfo } = body;

    if (!workflowType || !patientInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowType, patientInfo' },
        { status: 400 }
      );
    }

    // Generate preparation based on workflow type and patient info
    const systemPrompt = getSystemPrompt(workflowType, step);
    const userPrompt = generateUserPrompt(patientInfo, workflowType, step);

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    return NextResponse.json({
      success: true,
      data: {
        content,
        workflowType,
        step,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Preparation generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preparation' },
      { status: 500 }
    );
  }
}

function getSystemPrompt(workflowType: string, step?: string): string {
  const basePrompt = `Je bent een expert fysiotherapeut die intelligente voorbereiding genereert voor consultaties.
Je taak is om een gestructureerde voorbereiding te maken die helpt bij het intake- of consult proces.

Algemene richtlijnen:
- Gebruik Nederlandse medische terminologie
- Wees specifiek en actionable
- Focus op klinische relevantie
- Houd rekening met evidence-based practice
- Maak gebruik van ICF classificatie waar relevant`;

  switch (workflowType) {
    case 'intake-automatisch':
      return `${basePrompt}

Voor automatische intake:
- Genereer een uitgebreide voorbereiding voor de volledige intake
- Include anamnese vragen, onderzoek suggesties, en assessment tools
- Focus op HHSB methodiek (Hulpvraag, Historie, Stoornissen, Beperkingen)
- Suggereer specifieke tests en metingen
- Geef rode vlagen waarop te letten`;

    case 'intake-stapsgewijs':
      if (step === 'anamnese') {
        return `${basePrompt}

Voor stapsgewijze intake - Anamnese stap:
- Focus specifiek op anamnese vragen
- Geef gestructureerde vraagstelling per HHSB onderdeel
- Suggereer doorvragen en verdieping
- Let op psychosociale factoren
- Include vragenlijsten indien relevant`;
      }
      break;

    case 'consult':
      return `${basePrompt}

Voor follow-up consult:
- Focus op SOEP methodiek (Subjectief, Objectief, Evaluatie, Plan)
- Evalueer voortgang sinds vorige behandeling
- Suggereer reassessment en metingen
- Plan vervolgbehandeling
- Overweeg aanpassingen behandelplan`;

    default:
      return basePrompt;
  }

  return basePrompt;
}

function generateUserPrompt(patientInfo: any, workflowType: string, step?: string): string {
  const { initials, birthYear, gender, chiefComplaint, additionalInfo } = patientInfo;

  const age = new Date().getFullYear() - parseInt(birthYear);
  const genderText = gender === 'male' ? 'man' : gender === 'female' ? 'vrouw' : 'persoon';

  let prompt = `Genereer een gerichte voorbereiding voor de volgende patiënt:

Patiëntgegevens:
- Initialen: ${initials}
- Leeftijd: ${age} jaar
- Geslacht: ${genderText}
- Hoofdklacht: ${chiefComplaint}`;

  if (additionalInfo && additionalInfo.trim()) {
    prompt += `\n- Aanvullende informatie: ${additionalInfo}`;
  }

  switch (workflowType) {
    case 'intake-automatisch':
      prompt += `\n\nGenereer een uitgebreide intake voorbereiding die helpt bij het structureren van de volledige intake sessie. Include specifieke vragen, onderzoek suggesties, en assessment tools die relevant zijn voor deze hoofdklacht.`;
      break;

    case 'intake-stapsgewijs':
      if (step === 'anamnese') {
        prompt += `\n\nGenereer een gerichte anamnese voorbereiding. Focus op specifieke vragen die helpen bij het in kaart brengen van de hulpvraag, historie, stoornissen en beperkingen volgens de HHSB methodiek.`;
      }
      break;

    case 'consult':
      prompt += `\n\nGenereer een follow-up consult voorbereiding. Focus op evaluatie van voortgang, reassessment en planning van vervolgbehandeling volgens SOEP methodiek.`;
      break;
  }

  prompt += `\n\nHoud de voorbereiding praktisch, actionable en specifiek voor deze patiënt en hoofdklacht.`;

  return prompt;
}