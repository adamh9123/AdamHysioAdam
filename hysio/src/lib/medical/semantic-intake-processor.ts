/**
 * Semantic Intelligence Layer for Intake Automatisch
 *
 * This system transforms the intake module from a simple transcription tool
 * into an intelligent medical co-pilot with multi-pass semantic processing,
 * anti-hallucination validation, and structured clinical output.
 *
 * @version 8.0.0 - Complete Semantic Intelligence Transformation
 */

import { openaiClient } from '@/lib/api/openai';

// ============================================================================
// TYPE DEFINITIONS - Structured Clinical Data
// ============================================================================

export interface SemanticIntakeResult {
  // Structured sections
  hhsbAnamneseCard: HHSBStructuredData;
  onderzoeksBevindingen: OnderzoekStructuredData;
  klinischeConclusie: ConclusieStructuredData;
  samenvatting: IntakeSamenvattingData;

  // Validation & metadata
  validationReport: ValidationReport;
  redFlags: RedFlagData[];
  confidence: ConfidenceScores;
  processingMetadata: ProcessingMetadata;
}

export interface HHSBStructuredData {
  hulpvraag: {
    primary: string;
    secondary: string[];
    patientExpectations: string;
  };
  historie: {
    onset: string;
    duration: string;
    mechanism: string;
    progression: string;
    previousEpisodes: string | null;
    treatments: string[];
    medicalHistory: string[];
  };
  stoornissen: {
    pain: {
      location: string[];
      character: string;
      intensity: { current: string; worst: string; average: string };
      pattern: string;
      aggravatingFactors: string[];
      relievingFactors: string[];
    };
    movement: {
      restrictions: string[];
      quality: string;
    };
    otherSymptoms: string[];
  };
  beperkingen: {
    adl: Array<{ activity: string; limitation: string; impact: string }>;
    work: Array<{ task: string; limitation: string }>;
    sport: Array<{ activity: string; limitation: string }>;
    social: string[];
  };
}

export interface OnderzoekStructuredData {
  inspectie: {
    posture: string;
    swelling: string | null;
    atrophy: string | null;
    other: string[];
  };
  palpatie: {
    tenderness: Array<{ location: string; severity: string }>;
    tone: string;
    temperature: string | null;
  };
  bewegingsonderzoek: {
    arom: Array<{ movement: string; range: string; pain: string; limitation: string }>;
    prom: Array<{ movement: string; range: string; endFeel: string }>;
  };
  specifiekeTesten: Array<{
    testName: string;
    result: 'positive' | 'negative' | 'unclear';
    description: string;
  }>;
  krachtEnStabiliteit: Array<{
    muscle: string;
    strength: string;
    comment: string;
  }>;
  klinimetrie: Array<{
    measureName: string;
    score: string;
    interpretation: string;
  }>;
}

export interface ConclusieStructuredData {
  diagnose: {
    primary: string;
    differential: string[];
    icdCode: string | null;
  };
  onderbouwing: {
    supportingFindings: string[];
    excludedConditions: Array<{ condition: string; reason: string }>;
    evidenceLevel: string;
  };
  behandelplan: {
    mainGoals: Array<{ goal: string; timeframe: string; measures: string }>;
    phases: Array<{
      phaseName: string;
      duration: string;
      focus: string;
      interventions: string[];
    }>;
    frequency: string;
    estimatedDuration: string;
  };
  prognose: {
    expected: string;
    factorsPositive: string[];
    factorsNegative: string[];
  };
}

export interface IntakeSamenvattingData {
  executiveSummary: string;
  keyFindings: string[];
  clinicalReasoning: string;
  priorityActions: string[];
}

export interface ValidationReport {
  transcriptCoverage: number; // 0-100%
  dataCompleteness: number; // 0-100%
  crossReferenceChecks: Array<{
    claim: string;
    verified: boolean;
    source: string;
  }>;
  missingData: string[];
  warnings: string[];
}

export interface RedFlagData {
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionRequired: string;
}

export interface ConfidenceScores {
  overall: number; // 0-100
  hhsb: number;
  onderzoek: number;
  conclusie: number;
}

export interface ProcessingMetadata {
  model: string;
  temperature: number;
  tokensUsed: number;
  processingTime: number;
  passesCompleted: number;
}

// ============================================================================
// SEMANTIC PROCESSOR - Multi-Pass Intelligence System
// ============================================================================

export class SemanticIntakeProcessor {
  private patientInfo: any;
  private transcript: string;
  private preparation: string | null;

  constructor(patientInfo: any, transcript: string, preparation: string | null) {
    this.patientInfo = patientInfo;
    this.transcript = transcript;
    this.preparation = preparation;
  }

  /**
   * Main entry point: Process intake with full semantic intelligence
   */
  async processIntake(): Promise<SemanticIntakeResult> {
    const startTime = Date.now();

    console.log('🧠 Semantic Intelligence: Starting multi-pass processing...');

    // PASS 1: Extract raw clinical data with strict grounding
    const extractedData = await this.extractionPass();

    // PASS 2: Validate and cross-reference every claim
    const validatedData = await this.validationPass(extractedData);

    // PASS 3: Structure and reason through clinical logic
    const structuredData = await this.reasoningPass(validatedData);

    // PASS 4: Generate comprehensive summary
    const withSummary = await this.summaryPass(structuredData);

    // PASS 5: Final formatting and quality checks
    const finalResult = await this.formattingPass(withSummary);

    const processingTime = (Date.now() - startTime) / 1000;

    console.log(`✅ Semantic Intelligence: Processing complete in ${processingTime}s`);

    return {
      ...finalResult,
      processingMetadata: {
        ...finalResult.processingMetadata,
        processingTime,
        passesCompleted: 5,
      },
    };
  }

  /**
   * PASS 1: Extraction Pass - Extract structured data with strict grounding
   */
  private async extractionPass(): Promise<any> {
    console.log('🔍 Pass 1/5: Extraction - Extracting structured clinical data...');

    const age = new Date().getFullYear() - parseInt(this.patientInfo.birthYear);
    const gender = this.patientInfo.gender === 'male' ? 'man' : 'vrouw';

    const systemPrompt = this.buildExtractionPrompt();
    const userPrompt = `PATIËNT:
- Initialen: ${this.patientInfo.initials}
- Leeftijd: ${age} jaar
- Geslacht: ${gender}
- Hoofdklacht: ${this.patientInfo.chiefComplaint}

${this.preparation ? `VOORBEREIDING:\n${this.preparation}\n\n` : ''}

TRANSCRIPT INTAKE GESPREK:
${this.transcript}

OPDRACHT: Extraheer ALLEEN de informatie die EXPLICIET in het transcript staat. Gebruik de exacte structuur uit de systeemprompt. Bij twijfel of onduidelijkheid: markeer als "Niet besproken" of "Onduidelijk".

BELANGRIJK: Lever je antwoord in JSON formaat volgens de structuur uit de systeemprompt.`;

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Very low for strict extraction
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No extraction result');

    return JSON.parse(content);
  }

  /**
   * PASS 2: Validation Pass - Cross-reference and verify every claim
   */
  private async validationPass(extractedData: any): Promise<any> {
    console.log('✅ Pass 2/5: Validation - Cross-referencing claims with transcript...');

    const systemPrompt = `Je bent een Klinisch Validatie Expert. Je taak is om ELKE claim in de geëxtraheerde data te verifiëren tegen het originele transcript.

VALIDATIE REGELS:
1. Elke claim moet een directe tekstuele basis hebben in het transcript
2. Als iets niet exact matcht: markeer als "Onzeker" met confidence score
3. Als iets volledig ontbreekt: markeer als "Niet geverifieerd"
4. Check voor logische inconsistenties tussen secties
5. Detect mogelijke hallucinaties of aannames

OUTPUT: JSON object met:
{
  "validatedData": { /* Originele data met confidence scores */ },
  "validationReport": {
    "verified": [ /* Claims die geverifieerd zijn */ ],
    "uncertain": [ /* Claims met lage confidence */ ],
    "unverified": [ /* Claims die niet gevonden zijn */ ],
    "inconsistencies": [ /* Logische inconsistenties */ ]
  }
}`;

    const userPrompt = `ORIGINEEL TRANSCRIPT:
${this.transcript}

GEËXTRAHEERDE DATA:
${JSON.stringify(extractedData, null, 2)}

Valideer alle claims en genereer validatierapport.`;

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No validation result');

    return JSON.parse(content);
  }

  /**
   * PASS 3: Reasoning Pass - Clinical logic and diagnostic reasoning
   */
  private async reasoningPass(validatedData: any): Promise<any> {
    console.log('🧠 Pass 3/5: Reasoning - Applying clinical logic and diagnostic reasoning...');

    const systemPrompt = `Je bent een Expert Fysiotherapeut die klinische redenatie toepast.

Je taak is om de GEVERIFIEERDE bevindingen te synthetiseren in een logische klinische conclusie.

REDENATIE PROCES:
1. Link anamnese bevindingen met onderzoeksbevindingen
2. Identificeer patterns die een diagnose ondersteunen
3. Excludeer differentiaaldiagnoses op basis van bevindingen
4. Bouw een onderbouwde diagnostische hypothese
5. Formuleer een behandelplan dat logisch voortvloeit uit de diagnose

BELANGRIJK: Alleen concluderen op basis van aanwezige, geverifieerde data. Bij onvoldoende data: dit expliciet vermelden.

OUTPUT: JSON object met volledige klinische redenatie en conclusie.`;

    const userPrompt = `GEVERIFIEERDE DATA:
${JSON.stringify(validatedData.validatedData, null, 2)}

VALIDATIERAPPORT:
${JSON.stringify(validatedData.validationReport, null, 2)}

Voer klinische redenatie uit en formuleer onderbouwde conclusie.`;

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No reasoning result');

    const reasoningResult = JSON.parse(content);

    return {
      ...validatedData,
      clinicalReasoning: reasoningResult,
    };
  }

  /**
   * PASS 4: Summary Pass - Generate executive summary of ENTIRE intake
   */
  private async summaryPass(reasonedData: any): Promise<any> {
    console.log('📝 Pass 4/5: Summary - Generating comprehensive intake summary...');

    const systemPrompt = `Je bent een Expert die complete intake verslagen samenvat.

Genereer een executive summary die:
1. ALLE drie secties integreert (anamnese + onderzoek + conclusie)
2. De kern van het probleem formuleert in 2-3 zinnen
3. De belangrijkste bevindingen lijst (bullets)
4. De klinische redenatie samenvat
5. Prioriteitsacties benoemd

Dit is de "SAMENVATTING VAN INTAKE" (niet alleen anamnese!).

OUTPUT: JSON met executive summary structuur.`;

    const userPrompt = `COMPLETE INTAKE DATA:
${JSON.stringify(reasonedData, null, 2)}

Genereer comprehensive summary van VOLLEDIGE intake (anamnese + onderzoek + conclusie).`;

    const completion = await openaiClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No summary result');

    const summaryResult = JSON.parse(content);

    return {
      ...reasonedData,
      intakeSamenvatting: summaryResult,
    };
  }

  /**
   * PASS 5: Formatting Pass - Transform to final structure
   */
  private async formattingPass(data: any): Promise<SemanticIntakeResult> {
    console.log('🎨 Pass 5/5: Formatting - Transforming to final structured output...');

    // Transform the processed data into the final SemanticIntakeResult structure
    // This maps the AI outputs to our typed interfaces

    const result: SemanticIntakeResult = {
      hhsbAnamneseCard: this.transformHHSB(data.validatedData?.hhsb || data.clinicalReasoning?.hhsb),
      onderzoeksBevindingen: this.transformOnderzoek(data.validatedData?.onderzoek || data.clinicalReasoning?.onderzoek),
      klinischeConclusie: this.transformConclusie(data.clinicalReasoning?.conclusie),
      samenvatting: this.transformSamenvatting(data.intakeSamenvatting),
      validationReport: this.transformValidation(data.validationReport),
      redFlags: this.extractRedFlags(data),
      confidence: this.calculateConfidence(data.validationReport),
      processingMetadata: {
        model: 'gpt-4o',
        temperature: 0.3,
        tokensUsed: 0, // Will be calculated
        processingTime: 0, // Will be set by caller
        passesCompleted: 5,
      },
    };

    return result;
  }

  // ============================================================================
  // TRANSFORMATION HELPERS - Convert AI output to structured types
  // ============================================================================

  private transformHHSB(hhsbData: any): HHSBStructuredData {
    return {
      hulpvraag: {
        primary: hhsbData?.hulpvraag?.primary || 'Niet gespecificeerd',
        secondary: hhsbData?.hulpvraag?.secondary || [],
        patientExpectations: hhsbData?.hulpvraag?.expectations || 'Niet besproken',
      },
      historie: {
        onset: hhsbData?.historie?.onset || 'Niet besproken',
        duration: hhsbData?.historie?.duration || 'Onbekend',
        mechanism: hhsbData?.historie?.mechanism || 'Niet beschreven',
        progression: hhsbData?.historie?.progression || 'Niet besproken',
        previousEpisodes: hhsbData?.historie?.previousEpisodes || null,
        treatments: hhsbData?.historie?.treatments || [],
        medicalHistory: hhsbData?.historie?.medicalHistory || [],
      },
      stoornissen: {
        pain: {
          location: hhsbData?.stoornissen?.pain?.location || [],
          character: hhsbData?.stoornissen?.pain?.character || 'Niet beschreven',
          intensity: hhsbData?.stoornissen?.pain?.intensity || { current: 'Niet gemeten', worst: 'Niet gemeten', average: 'Niet gemeten' },
          pattern: hhsbData?.stoornissen?.pain?.pattern || 'Niet besproken',
          aggravatingFactors: hhsbData?.stoornissen?.pain?.aggravating || [],
          relievingFactors: hhsbData?.stoornissen?.pain?.relieving || [],
        },
        movement: {
          restrictions: hhsbData?.stoornissen?.movement?.restrictions || [],
          quality: hhsbData?.stoornissen?.movement?.quality || 'Niet beoordeeld',
        },
        otherSymptoms: hhsbData?.stoornissen?.other || [],
      },
      beperkingen: {
        adl: hhsbData?.beperkingen?.adl || [],
        work: hhsbData?.beperkingen?.work || [],
        sport: hhsbData?.beperkingen?.sport || [],
        social: hhsbData?.beperkingen?.social || [],
      },
    };
  }

  private transformOnderzoek(onderzoekData: any): OnderzoekStructuredData {
    return {
      inspectie: onderzoekData?.inspectie || { posture: 'Niet gedocumenteerd', swelling: null, atrophy: null, other: [] },
      palpatie: onderzoekData?.palpatie || { tenderness: [], tone: 'Niet beoordeeld', temperature: null },
      bewegingsonderzoek: {
        arom: onderzoekData?.bewegingsonderzoek?.arom || [],
        prom: onderzoekData?.bewegingsonderzoek?.prom || [],
      },
      specifiekeTesten: onderzoekData?.specifiekeTesten || [],
      krachtEnStabiliteit: onderzoekData?.kracht || [],
      klinimetrie: onderzoekData?.klinimetrie || [],
    };
  }

  private transformConclusie(conclusieData: any): ConclusieStructuredData {
    return {
      diagnose: {
        primary: conclusieData?.diagnose?.primary || 'Aanvullend onderzoek vereist',
        differential: conclusieData?.diagnose?.differential || [],
        icdCode: conclusieData?.diagnose?.icdCode || null,
      },
      onderbouwing: {
        supportingFindings: conclusieData?.onderbouwing?.supporting || [],
        excludedConditions: conclusieData?.onderbouwing?.excluded || [],
        evidenceLevel: conclusieData?.onderbouwing?.evidenceLevel || 'Niet bepaald',
      },
      behandelplan: {
        mainGoals: conclusieData?.behandelplan?.goals || [],
        phases: conclusieData?.behandelplan?.phases || [],
        frequency: conclusieData?.behandelplan?.frequency || 'Niet bepaald',
        estimatedDuration: conclusieData?.behandelplan?.duration || 'Nog te bepalen',
      },
      prognose: {
        expected: conclusieData?.prognose?.expected || 'Nog te bepalen',
        factorsPositive: conclusieData?.prognose?.positive || [],
        factorsNegative: conclusieData?.prognose?.negative || [],
      },
    };
  }

  private transformSamenvatting(samenvattingData: any): IntakeSamenvattingData {
    return {
      executiveSummary: samenvattingData?.executiveSummary || 'Geen samenvatting beschikbaar',
      keyFindings: samenvattingData?.keyFindings || [],
      clinicalReasoning: samenvattingData?.clinicalReasoning || 'Niet beschikbaar',
      priorityActions: samenvattingData?.priorityActions || [],
    };
  }

  private transformValidation(validationData: any): ValidationReport {
    const verified = validationData?.verified || [];
    const uncertain = validationData?.uncertain || [];
    const unverified = validationData?.unverified || [];
    const total = verified.length + uncertain.length + unverified.length;

    return {
      transcriptCoverage: total > 0 ? Math.round((verified.length / total) * 100) : 0,
      dataCompleteness: total > 0 ? Math.round(((verified.length + uncertain.length) / total) * 100) : 0,
      crossReferenceChecks: [
        ...verified.map((v: any) => ({ claim: v, verified: true, source: 'transcript' })),
        ...uncertain.map((u: any) => ({ claim: u, verified: false, source: 'uncertain' })),
      ],
      missingData: unverified || [],
      warnings: validationData?.inconsistencies || [],
    };
  }

  private extractRedFlags(data: any): RedFlagData[] {
    const flags: RedFlagData[] = [];
    // Extract from validation warnings and clinical reasoning
    if (data.validationReport?.inconsistencies) {
      data.validationReport.inconsistencies.forEach((inc: string) => {
        flags.push({
          category: 'Data Inconsistency',
          description: inc,
          severity: 'medium',
          actionRequired: 'Verificatie vereist',
        });
      });
    }
    return flags;
  }

  private calculateConfidence(validationReport: any): ConfidenceScores {
    const verified = validationReport?.verified?.length || 0;
    const total = (validationReport?.verified?.length || 0) +
                  (validationReport?.uncertain?.length || 0) +
                  (validationReport?.unverified?.length || 0);

    const score = total > 0 ? Math.round((verified / total) * 100) : 50;

    return {
      overall: score,
      hhsb: score,
      onderzoek: score,
      conclusie: score,
    };
  }

  // ============================================================================
  // PROMPT BUILDERS
  // ============================================================================

  private buildExtractionPrompt(): string {
    return `Je bent een Expert Fysiotherapeut met specialisatie in Intake Documentatie.

MISSIE: Extraheer ALLEEN de informatie die EXPLICIET in het intake transcript staat. Je bent GEEN diagnosticus in deze fase - je bent een perfecte documentarist.

ABSOLUTE REGELS:
1. ❌ NOOIT informatie verzinnen of assumeren
2. ❌ NOOIT standaard antwoorden invullen als niet besproken
3. ❌ NOOIT testresultaten raden als niet uitgevoerd
4. ✅ Bij twijfel: "Niet besproken" of "Onduidelijk"
5. ✅ Exacte quotes gebruiken waar mogelijk
6. ✅ Kwantitatieve data (NPRS, ROM) alleen als expliciet genoemd

OUTPUT STRUCTUUR:
{
  "hhsb": {
    "hulpvraag": {
      "primary": "Letterlijke primaire klacht",
      "secondary": ["Secundaire doelen"],
      "expectations": "Wat verwacht patiënt van behandeling"
    },
    "historie": {
      "onset": "Wanneer en hoe begonnen",
      "duration": "Hoe lang al klachten",
      "mechanism": "Ontstaan mechanisme",
      "progression": "Verloop (beter/slechter/gelijk)",
      "previousEpisodes": "Eerdere episodes of null",
      "treatments": ["Eerdere behandelingen"],
      "medicalHistory": ["Relevante medische voorgeschiedenis"]
    },
    "stoornissen": {
      "pain": {
        "location": ["Exact genoemd locaties"],
        "character": "Aard van pijn",
        "intensity": {
          "current": "Huidige pijn (NPRS als genoemd)",
          "worst": "Ergste pijn",
          "average": "Gemiddelde pijn"
        },
        "pattern": "Pijnpatroon (24u)",
        "aggravating": ["Provocerende factoren"],
        "relieving": ["Verlichtende factoren"]
      },
      "movement": {
        "restrictions": ["Bewegingsbeperkingen"],
        "quality": "Kwaliteit van beweging"
      },
      "other": ["Andere symptomen"]
    },
    "beperkingen": {
      "adl": [{"activity": "Activiteit", "limitation": "Beperking", "impact": "Impact"}],
      "work": [{"task": "Taak", "limitation": "Beperking"}],
      "sport": [{"activity": "Sport", "limitation": "Beperking"}],
      "social": ["Sociale beperkingen"]
    }
  },
  "onderzoek": {
    "inspectie": {
      "posture": "Houding observatie",
      "swelling": "Zwelling of null",
      "atrophy": "Atrofie of null",
      "other": ["Andere observaties"]
    },
    "palpatie": {
      "tenderness": [{"location": "Locatie", "severity": "Ernst"}],
      "tone": "Tonus bevinding",
      "temperature": "Temperatuur of null"
    },
    "bewegingsonderzoek": {
      "arom": [{"movement": "Beweging", "range": "ROM (exact getal of beschrijving)", "pain": "Pijn", "limitation": "Beperking"}],
      "prom": [{"movement": "Beweging", "range": "ROM", "endFeel": "Eindgevoel"}]
    },
    "specifiekeTesten": [{"testName": "Test naam", "result": "positive/negative/unclear", "description": "Beschrijving"}],
    "kracht": [{"muscle": "Spier(groep)", "strength": "Kracht", "comment": "Opmerking"}],
    "klinimetrie": [{"measureName": "Meetinstrument", "score": "Score", "interpretation": "Interpretatie"}]
  }
}

BELANGRIJKE HERINNERING:
- Als een sectie niet is besproken: laat het veld leeg of gebruik "Niet besproken"
- Als een test niet is uitgevoerd: niet opnemen in lijst
- Als ROM niet gemeten: "Niet gemeten"
- Wees conservatief: beter iets missen dan iets verzinnen`;
  }
}

// ============================================================================
// EXPORT MAIN FUNCTION
// ============================================================================

export async function processIntakeWithSemanticIntelligence(
  patientInfo: any,
  transcript: string,
  preparation: string | null
): Promise<SemanticIntakeResult> {
  const processor = new SemanticIntakeProcessor(patientInfo, transcript, preparation);
  return await processor.processIntake();
}
