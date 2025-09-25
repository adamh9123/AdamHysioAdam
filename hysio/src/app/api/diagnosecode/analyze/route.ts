// Enhanced DCSPH Analysis API - Intelligent Analysis Engine

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Enhanced analysis request interface
interface AnalysisRequest {
  clinicalDescription: string;
  includeMetadata?: boolean;
  maxSuggestions?: number;
}

// Enhanced code suggestion with clinical context
interface EnhancedCodeSuggestion {
  code: string;
  name: string;
  rationale: string;
  confidence: number;
  category: string;
  clinicalNotes: string;
}

// Enhanced DCSPH Knowledge Base
class DCSPHAnalyzer {
  /**
   * Enhanced analysis using comprehensive pattern matching
   */
  static async analyzeDescription(description: string): Promise<EnhancedCodeSuggestion[]> {
    const descLower = description.toLowerCase();
    const suggestions: EnhancedCodeSuggestion[] = [];

    // Enhanced pattern matching for all body regions
    const patterns = [
      // Heup patterns
      {
        keywords: ['heup', 'coxofemorale', 'lies', 'trochanter'],
        codes: [
          {
            code: '5120',
            name: 'Epicondylitis/tendinitis - bekken/heup',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Heupklachten passen bij tendinitis van periarticulaire spieren zoals de m. iliopsoas of m. gluteus medius.',
            clinicalNotes: 'Overbelasting van heupspieren, vaak bij sporters'
          },
          {
            code: '5121',
            name: 'Bursitis/capsulitis - bekken/heup',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Bursitis trochanterica of andere bursae rond de heup veroorzaken laterale heuppijn.',
            clinicalNotes: 'Klassieke laterale heuppijn bij liggen op zijde'
          },
          {
            code: '5123',
            name: 'Artrose - bekken/heup',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Coxartrose kan lies- en heuppijn veroorzaken met bewegingsbeperking.',
            clinicalNotes: 'Degeneratieve gewrichtsveranderingen, vaak bij ouderen'
          }
        ]
      },
      // Knie patterns
      {
        keywords: ['knie', 'patella', 'meniscus', 'kruisband'],
        codes: [
          {
            code: '7920',
            name: 'Epicondylitis/tendinitis - knie/onderbeen/voet',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Knieklachten passen vaak bij tendinitis van patellapees of andere peesstructuren rondom het kniegewricht.',
            clinicalNotes: 'Patellapees tendinopathie, jumpers knee'
          },
          {
            code: '7921',
            name: 'Bursitis/capsulitis - knie/onderbeen/voet',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Ontsteking van bursae rond het kniegewricht kan kniepijn veroorzaken.',
            clinicalNotes: 'Prepatellar bursitis, housemaids knee'
          },
          {
            code: '7922',
            name: 'Chondropathie/meniscuslaesie - knie/onderbeen/voet',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Kraakbeenschade of meniscusletsel past bij knieproblematiek.',
            clinicalNotes: 'Meniscusscheur, chondromalacia patellae'
          }
        ]
      },
      // Schouder patterns
      {
        keywords: ['schouder', 'rotator', 'cuff', 'impingement'],
        codes: [
          {
            code: '2120',
            name: 'Epicondylitis/tendinitis - schouder',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Schouderklachten passen bij tendinitis van de rotator cuff of bicepspees.',
            clinicalNotes: 'Rotator cuff tendinopathie, swimmers shoulder'
          },
          {
            code: '2121',
            name: 'Bursitis/capsulitis - schouder',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Subacromiale bursitis of frozen shoulder kunnen schouderpijn veroorzaken.',
            clinicalNotes: 'Subacromiale impingement, frozen shoulder'
          },
          {
            code: '2126',
            name: 'Spier-pees aandoeningen - schouder',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Rotator cuff problematiek is een veelvoorkomende oorzaak van schouderpijn.',
            clinicalNotes: 'Rotator cuff syndroom, instabiliteit'
          }
        ]
      },
      // Nek patterns
      {
        keywords: ['nek', 'cervicaal', 'whiplash', 'hoofdpijn'],
        codes: [
          {
            code: '1027',
            name: 'HNP/discusdegeneratie - cervicale wervelkolom',
            category: 'Neurologisch',
            rationale: 'Cervicale discuspathologie kan nekpijn en mogelijk uitstralende klachten veroorzaken.',
            clinicalNotes: 'Hernia nuclei pulposi cervicaal, radiculopathie'
          },
          {
            code: '1026',
            name: 'Spier-pees aandoeningen - cervicale wervelkolom',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Cervicale spierproblematiek door trauma of overbelasting.',
            clinicalNotes: 'Myofasciale pijn, trigger points'
          },
          {
            code: '1038',
            name: 'Whiplash - cervicale wervelkolom',
            category: 'Traumatisch',
            rationale: 'Whiplash trauma veroorzaakt cervicale klachten door plotselinge acceleratie-deceleratie.',
            clinicalNotes: 'WAD (Whiplash Associated Disorders)'
          }
        ]
      },
      // Rug patterns
      {
        keywords: ['rug', 'lumbaal', 'onderrug', 'lenden'],
        codes: [
          {
            code: '3427',
            name: 'HNP/discusdegeneratie - lumbale wervelkolom',
            category: 'Neurologisch',
            rationale: 'Lumbale rugklachten passen bij discusdegeneratie of hernia nuclei pulposi.',
            clinicalNotes: 'Hernia nuclei pulposi lumbaal, ischias'
          },
          {
            code: '3426',
            name: 'Spier-pees aandoeningen - lumbale wervelkolom',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Lumbale spierproblematiek is een veel voorkomende oorzaak van rugpijn.',
            clinicalNotes: 'Lumbago, myofasciale rugpijn'
          },
          {
            code: '3423',
            name: 'Artrose - lumbale wervelkolom',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Degeneratieve veranderingen in de lumbale wervelkolom kunnen rugpijn veroorzaken.',
            clinicalNotes: 'Spondylartrose, facetgewricht artrose'
          }
        ]
      },
      // Enkel/voet patterns
      {
        keywords: ['enkel', 'voet', 'spronggewricht', 'achilles'],
        codes: [
          {
            code: '7931',
            name: 'Distorsie - knie/onderbeen/voet',
            category: 'Traumatisch',
            rationale: 'Enkeldistorsie door omslaan is een veelvoorkomende oorzaak van enkelklachten.',
            clinicalNotes: 'Laterale enkeldistorsie, ligamentletsel'
          },
          {
            code: '7920',
            name: 'Epicondylitis/tendinitis - knie/onderbeen/voet',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Achillespees tendinitis of andere peesaandoeningen in enkel/voet gebied.',
            clinicalNotes: 'Achillespees tendinopathie, plantair fascitis'
          },
          {
            code: '7921',
            name: 'Bursitis/capsulitis - knie/onderbeen/voet',
            category: 'Inflammatoir/Degeneratief',
            rationale: 'Bursitis of capsulitis van enkel- of voetgewrichten.',
            clinicalNotes: 'Retrocalcaneale bursitis'
          }
        ]
      }
    ];

    // Calculate matches and scores
    for (const pattern of patterns) {
      const matchCount = pattern.keywords.filter(keyword =>
        descLower.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const baseConfidence = Math.min(0.9, 0.4 + (matchCount * 0.15));

        pattern.codes.forEach((codeData, index) => {
          const confidence = baseConfidence - (index * 0.1);
          if (confidence > 0.2) {
            suggestions.push({
              ...codeData,
              confidence: Math.round(confidence * 100) / 100
            });
          }
        });
      }
    }

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }
}

/**
 * POST /api/diagnosecode/analyze
 * Enhanced analysis endpoint
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== DCSPH Analysis Started ===');

    // Parse request body
    const body: AnalysisRequest = await request.json();
    const { clinicalDescription, includeMetadata = true, maxSuggestions = 3 } = body;

    // Validate input
    if (!clinicalDescription || typeof clinicalDescription !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Klinische beschrijving is vereist en moet een string zijn'
      }, { status: 400 });
    }

    if (clinicalDescription.trim().length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Geef een beschrijving voor accurate analyse'
      }, { status: 400 });
    }

    console.log('Analyzing clinical description:', clinicalDescription.substring(0, 100) + '...');

    // Perform analysis
    const startTime = Date.now();
    const suggestions = await DCSPHAnalyzer.analyzeDescription(clinicalDescription);
    const processingTime = Date.now() - startTime;

    console.log(`Analysis completed in ${processingTime}ms:`, suggestions.length, 'suggestions');

    // Prepare response
    const response = {
      success: true,
      suggestions: suggestions.slice(0, maxSuggestions),
      analysisMetadata: includeMetadata ? {
        processedAt: new Date().toISOString(),
        processingTimeMs: processingTime,
        extractedKeywords: clinicalDescription
          .toLowerCase()
          .match(/\b(knie|heup|schouder|nek|rug|pijn|zwelling|stijf|trauma|fractuur|tendinitis|bursitis|artrose)\b/g) || [],
        totalCandidates: suggestions.length
      } : undefined
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('DCSPH Analysis Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Er is een fout opgetreden tijdens de analyse. Probeer het opnieuw.',
      suggestions: []
    }, { status: 500 });
  }
}

/**
 * GET /api/diagnosecode/analyze
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: '/api/diagnosecode/analyze',
    timestamp: new Date().toISOString(),
    details: {
      analysisEngine: 'Enhanced Pattern Matcher',
      capabilities: ['Clinical description analysis', 'Multi-region support', 'Confidence scoring']
    }
  });
}

