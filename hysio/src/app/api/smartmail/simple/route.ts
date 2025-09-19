import { NextRequest, NextResponse } from 'next/server';
import { SimpleEmailRequest, SimpleEmailResponse } from '@/lib/types/smartmail-simple';
import { HYSIO_LLM_MODEL } from '@/lib/api/openai';

export async function POST(request: NextRequest): Promise<NextResponse<SimpleEmailResponse>> {
  try {
    const body: SimpleEmailRequest = await request.json();

    // Basic validation - keep it simple
    if (!body.recipientType || !body.context) {
      return NextResponse.json({
        success: false,
        error: 'Ontvanger type en context zijn verplicht'
      });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback when no API key is available
      const fallbackEmail = `Beste ${body.recipientType === 'patient' ? 'patiënt' : 'collega'},

${body.context}

Met vriendelijke groet,
[Uw naam]
Fysiotherapeut

---
Gegenereerd met Hysio SmartMail (Demo mode - geen OpenAI API key gedetecteerd)`;

      return NextResponse.json({
        success: true,
        email: fallbackEmail
      });
    }

    // ULTRA THINK: Context-injectie volgens gespecificeerde structuur
    let finalPrompt = '';

    // Length-specific instructions
    const lengthInstructions = {
      kort: 'Schrijf een ZEER KORTE email van maximaal 3-4 zinnen. Ga direct ter zake.',
      gemiddeld: 'Schrijf een email van gemiddelde lengte (5-8 zinnen). Balans tussen informatief en beknopt.',
      lang: 'Schrijf een uitgebreide email met alle relevante details. 10-15 zinnen zijn toegestaan voor volledigheid.'
    };

    const selectedLength = body.length || 'gemiddeld';
    const lengthInstruction = lengthInstructions[selectedLength as keyof typeof lengthInstructions] || lengthInstructions.gemiddeld;

    const userInstruction = `Schrijf een professionele email voor een fysiotherapeut.

Ontvanger: ${body.recipientType}
Onderwerp: ${body.subject || 'Update over behandeling'}
Context: ${body.context}

LENGTE INSTRUCTIES: ${lengthInstruction}

Gebruik Nederlandse taal en zorg dat de email professioneel maar vriendelijk is.`;

    if (body.documentContext) {
      finalPrompt = `Hier is de volledige context van een bijgevoegd document (bijvoorbeeld een verwijsbrief of vorig verslag). Gebruik deze informatie als achtergrond om de onderstaande opdracht perfect uit te voeren:

--- DOCUMENT CONTEXT ---
${body.documentContext}
--- EINDE DOCUMENT CONTEXT ---

Opdracht van de fysiotherapeut:
${userInstruction}`;
    } else {
      finalPrompt = userInstruction;
    }

    try {
      // Single API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: HYSIO_LLM_MODEL,
          messages: [{ role: 'user', content: finalPrompt }],
          max_tokens: 800, // Increased for document context
          temperature: 1.0, // GPT-5-mini only supports temperature = 1
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiData = await response.json();
      const generatedEmail = aiData.choices[0]?.message?.content;

      if (!generatedEmail) {
        throw new Error('Geen email gegenereerd door AI');
      }

      return NextResponse.json({
        success: true,
        email: generatedEmail.trim()
      });

    } catch (aiError) {
      console.warn('OpenAI API failed, using fallback:', aiError);

      // Fallback to simple template when AI fails
      const fallbackEmail = `Beste ${body.recipientType === 'patient' ? 'patiënt' : 'collega'},

${body.context}

Met vriendelijke groet,
[Uw naam]
Fysiotherapeut

---
Gegenereerd met Hysio SmartMail (Fallback mode)`;

      return NextResponse.json({
        success: true,
        email: fallbackEmail
      });
    }

  } catch (error) {
    console.error('SmartMail Simple Error:', error);

    // Simple fallback - no complex error handling
    const fallbackEmail = `Beste ${body?.recipientType === 'patient' ? 'patiënt' : 'collega'},

${body?.context || 'Update over uw behandeling.'}

Met vriendelijke groet,
[Uw naam]
Fysiotherapeut`;

    return NextResponse.json({
      success: true,
      email: fallbackEmail
    });
  }
}