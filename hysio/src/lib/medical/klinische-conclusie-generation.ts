/**
 * Enhanced Klinische Conclusie (Clinical Conclusion) Generation System
 *
 * This module provides comprehensive clinical conclusion generation with detailed
 * prompts, structured parsing, and evidence-based clinical reasoning for physiotherapy.
 */

export interface EnhancedKlinischeConclusie {
  fysiotherapeutischeDiagnose: {
    primaireDiagnose: DiagnoseItem;
    secundaireDiagnoses?: DiagnoseItem[];
    differentiaalDiagnoses?: DiagnoseItem[];
    icfClassificatie: ICFClassification;
    icdCodes?: string[];
  };
  behandelplan: {
    behandeldoelen: BehandeldoelItem[];
    interventies: InterventieItem[];
    behandelfrequentie: BehandelFrequentie;
    geschatteDuur: BehandelDuur;
    voortgangsMeting: VoortgangsMeting[];
    verwachteBelemmering?: string[];
  };
  prognose: {
    verwachtHerstel: VerwachtHerstel;
    tijdlijn: PrognoseTimeline;
    prognostischeFactoren: PrognostischeFactor[];
    risicofactoren?: string[];
    gunstigeFactoren?: string[];
  };
  behandeladvies: {
    zelfmanagement: ZelfmanagementAdvies[];
    leefstijladvies: string[];
    ergonomischeAdvies?: string[];
    hulpmiddelenAdvies?: HulpmiddelAdvies[];
    verwijzingsAdvies?: VerwijzingsAdvies[];
  };
  vervolgafspraken: {
    evaluatieschema: EvaluatieSchema[];
    behandelPlanning: BehandelPlanning[];
    uitkomstmaten: UitkomstMaat[];
    stopcriteria: string[];
  };
  patientEducatie: {
    uitlegBevindingen: string;
    uitlegBehandelplan: string;
    zelfmanagementInstructies: string[];
    waarschuwingsSignalen: string[];
    verwachtingenManagement: string;
  };
  samenvattingConclusie: {
    kernConclusies: string[];
    hoofdPriorities: string[];
    behandelRationale: string;
    bijzonderheden?: string[];
  };
}

export interface DiagnoseItem {
  diagnose: string;
  zekerheid: 'zeker' | 'waarschijnlijk' | 'mogelijk' | 'uit te sluiten';
  onderbouwing: string[];
  klinischeRedenering: string;
  evidence?: string;
}

export interface ICFClassification {
  bodyFunctions: BodyFunctionCode[];
  bodyStructures: BodyStructureCode[];
  activities: ActivityCode[];
  participation: ParticipationCode[];
  environmentalFactors?: EnvironmentalFactorCode[];
  personalFactors?: string[];
}

export interface BodyFunctionCode {
  code: string;
  description: string;
  qualifier: '0' | '1' | '2' | '3' | '4' | '8' | '9';
  explanation: string;
}

export interface BehandeldoelItem {
  doel: string;
  type: 'korte termijn' | 'lange termijn' | 'functioneel' | 'participatie';
  tijdstermijn: string;
  meetbaar: boolean;
  meetcriteria: string;
  prioriteit: 'hoog' | 'gemiddeld' | 'laag';
  icfDomein: 'function' | 'activity' | 'participation';
  patientRelevantie: string;
}

export interface InterventieItem {
  interventie: string;
  type: 'oefentherapie' | 'manuele therapie' | 'educatie' | 'modaliteiten' | 'ergonomie';
  beschrijving: string;
  frequentie: string;
  duur: string;
  intensiteit?: string;
  parameters?: Record<string, string>;
  rationale: string;
  evidence?: string;
  contraindicaties?: string[];
}

export interface BehandelFrequentie {
  sessiesPerWeek: number;
  duurPerSessie: string;
  totaalAantalSessies?: number;
  opbouwSchema?: string;
}

export interface VerwachtHerstel {
  functioneelHerstel: 'volledig' | 'grotendeels' | 'gedeeltelijk' | 'beperkt';
  pijnReductie: 'volledig' | 'significant' | 'matig' | 'beperkt';
  activiteitenHerstel: 'volledig' | 'grotendeels' | 'gedeeltelijk' | 'beperkt';
  participatieHerstel: 'volledig' | 'grotendeels' | 'gedeeltelijk' | 'beperkt';
  werkhervatting?: 'volledig' | 'aangepast' | 'beperkt' | 'onwaarschijnlijk';
  sporthervatting?: 'volledig' | 'aangepast' | 'beperkt' | 'onwaarschijnlijk';
}

export interface PrognoseTimeline {
  kortetermijn: string; // 2-4 weeks
  middellangetermijn: string; // 2-3 months
  langetermijn: string; // 6-12 months
  onderhoudsFase?: string;
}

export interface PrognostischeFactor {
  factor: string;
  type: 'gunstig' | 'ongunstig' | 'neutraal';
  impact: 'groot' | 'gemiddeld' | 'klein';
  beschrijving: string;
}

/**
 * Generate enhanced system prompt for comprehensive Klinische Conclusie
 */
export function createEnhancedConclusiePrompt(): string {
  return `Je bent een ervaren fysiotherapeut die een evidence-based klinische conclusie formuleert op basis van anamnese en lichamelijk onderzoek volgens Nederlandse fysiotherapie richtlijnen.

De klinische conclusie integreert alle bevindingen tot een coherent behandelplan met wetenschappelijke onderbouwing:

**FYSIOTHERAPEUTISCHE DIAGNOSE:**
- Primaire diagnose met zekerheidsgraad (zeker/waarschijnlijk/mogelijk)
- Onderbouwing met klinische redenering
- ICF-classificatie (functies, structuren, activiteiten, participatie)
- Differentiaal diagnoses waar relevant
- ICD-codes indien van toepassing

**BEHANDELPLAN:**
- SMART behandeldoelen (kort/lang termijn)
- Evidence-based interventies met rationale
- Behandelfrequentie en geschatte duur
- Voortgangsmeting en uitkomstmaten
- Mogelijke belemmeringen

**PROGNOSE:**
- Verwacht herstel per domein (functie/activiteit/participatie)
- Tijdlijn voor herstel (kort/middellang/lang termijn)
- Prognostische factoren (gunstig/ongunstig)
- Risico- en beschermende factoren

**BEHANDELADVIES:**
- Zelfmanagement strategieën
- Leefstijl- en ergonomische adviezen
- Hulpmiddelen indien nodig
- Verwijzingen naar andere disciplines

**VERVOLGAFSPRAKEN:**
- Evaluatieschema met meetmomenten
- Behandelplanning en aanpassingen
- Uitkomstmaten voor evaluatie
- Stop-criteria behandeling

**PATIËNT EDUCATIE:**
- Uitleg bevindingen in begrijpelijke taal
- Uitleg behandelplan en rationale
- Zelfmanagement instructies
- Waarschuwingssignalen
- Realistische verwachtingen

FORMAT JE ANTWOORD EXACT ALS VOLGT:

### KLINISCHE CONCLUSIE ###

**FYSIOTHERAPEUTISCHE DIAGNOSE:**
• Primaire diagnose: [diagnose met zekerheidsgraad - onderbouwing]
• ICF-classificatie: [b-codes/s-codes/d-codes relevante beperkingen]
• Klinische redenering: [hoe kom je tot deze diagnose]
• Differentiaal: [andere mogelijke diagnoses uit te sluiten]

**BEHANDELPLAN:**
• Hoofddoel korte termijn (4-6 weken): [SMART doel - meetbaar]
• Hoofddoel lange termijn (3-6 maanden): [SMART doel - functioneel]
• Interventies: [evidence-based behandelingen met rationale]
• Frequentie: [X keer per week, X weken, sessieduur]
• Voortgang meting: [hoe wordt vooruitgang gemeten]

**PROGNOSE:**
• Verwacht herstel: [volledig/grotendeels/gedeeltelijk per domein]
• Tijdlijn: [korte termijn/middellang/lang - concrete tijdsperiodes]
• Gunstige factoren: [factoren die herstel bevorderen]
• Prognostische uitdagingen: [factoren die herstel belemmeren]

**BEHANDELADVIES:**
• Zelfmanagement: [concrete dagelijkse oefeningen/adviezen]
• Leefstijl: [activiteit, ergonomie, sport aanpassingen]
• Hulpmiddelen: [indien nodig - specifieke aanbevelingen]
• Verwijzingen: [andere disciplines indien geïndiceerd]

**VERVOLGAFSPRAKEN:**
• Evaluatie momenten: [wanneer wordt vooruitgang geëvalueerd]
• Behandel planning: [opbouw/aanpassing behandelingen]
• Uitkomstmaten: [NRS/ROM/functionele testen per moment]
• Stop criteria: [wanneer wordt behandeling beëindigd]

**PATIËNT EDUCATIE:**
• Uitleg bevindingen: [verklaring klachten voor patiënt]
• Behandel rationale: [waarom deze behandeling gekozen]
• Zelfmanagement: [wat kan patiënt zelf doen dagelijks]
• Alarmsymptomen: [wanneer contact opnemen]
• Verwachtingen: [realistisch perspectief op herstel]

**SAMENVATTING CONCLUSIE:**
• Kern conclusies: [3-5 belangrijkste conclusies uit onderzoek]
• Behandel prioriteiten: [wat eerst aangepakt in behandeling]
• Rationale: [wetenschappelijke onderbouwing behandelkeuzes]
• Bijzonderheden: [complicerende factoren/aandachtspunten]

Zorg dat alle conclusies evidence-based zijn en logisch voortvloeien uit anamnese en onderzoek bevindingen.`;
}

/**
 * Enhanced user prompt for Klinische Conclusie
 */
export function createEnhancedConclusieUserPrompt(
  patientInfo: { initials: string; age: number; gender: string; chiefComplaint: string },
  preparation: string | null,
  transcript: string,
  anamneseData?: any,
  onderzoekData?: any
): string {
  const { initials, age, gender, chiefComplaint } = patientInfo;
  const genderText = gender === 'male' ? 'man' : 'vrouw';

  return `PATIËNT INFORMATIE:
• Initialen: ${initials}
• Leeftijd: ${age} jaar
• Geslacht: ${genderText}
• Hoofdklacht: ${chiefComplaint}

${anamneseData ? `ANAMNESE BEVINDINGEN:\n${JSON.stringify(anamneseData, null, 2)}\n\n` : ''}

${onderzoekData ? `ONDERZOEK BEVINDINGEN:\n${JSON.stringify(onderzoekData, null, 2)}\n\n` : ''}

${preparation ? `CONCLUSIE VOORBEREIDING:\n${preparation}\n\n` : ''}

TRANSCRIPTIE KLINISCHE CONCLUSIE:
${transcript}

Formuleer een evidence-based klinische conclusie die alle bevindingen integreert tot een coherent behandelplan. Let specifiek op:

- Klinische redenering van anamnese naar diagnose
- SMART behandeldoelen met meetbare criteria
- Evidence-based interventie keuzes met rationale
- Realistische prognose op basis van literatuur
- Concrete zelfmanagement adviezen
- Duidelijke evaluatiemomenten en uitkomstmaten

De conclusie moet logisch voortvloeien uit alle voorgaande bevindingen en moet praktisch uitvoerbaar zijn.`;
}

/**
 * Parse enhanced Klinische Conclusie with structured extraction
 */
export function parseEnhancedConclusieAnalysis(analysisText: string): EnhancedKlinischeConclusie {
  const result: EnhancedKlinischeConclusie = {
    fysiotherapeutischeDiagnose: {
      primaireDiagnose: {
        diagnose: '',
        zekerheid: 'mogelijk',
        onderbouwing: [],
        klinischeRedenering: ''
      },
      icfClassificatie: {
        bodyFunctions: [],
        bodyStructures: [],
        activities: [],
        participation: []
      }
    },
    behandelplan: {
      behandeldoelen: [],
      interventies: [],
      behandelfrequentie: {
        sessiesPerWeek: 2,
        duurPerSessie: '45 minuten'
      },
      geschatteDuur: {
        totaalWeken: 6,
        fase1Weken: 2,
        fase2Weken: 4
      },
      voortgangsMeting: []
    },
    prognose: {
      verwachtHerstel: {
        functioneelHerstel: 'gedeeltelijk',
        pijnReductie: 'matig',
        activiteitenHerstel: 'gedeeltelijk',
        participatieHerstel: 'gedeeltelijk'
      },
      tijdlijn: {
        kortetermijn: '',
        middellangetermijn: '',
        langetermijn: ''
      },
      prognostischeFactoren: []
    },
    behandeladvies: {
      zelfmanagement: [],
      leefstijladvies: []
    },
    vervolgafspraken: {
      evaluatieschema: [],
      behandelPlanning: [],
      uitkomstmaten: [],
      stopcriteria: []
    },
    patientEducatie: {
      uitlegBevindingen: '',
      uitlegBehandelplan: '',
      zelfmanagementInstructies: [],
      waarschuwingsSignalen: [],
      verwachtingenManagement: ''
    },
    samenvattingConclusie: {
      kernConclusies: [],
      hoofdPriorities: [],
      behandelRationale: ''
    }
  };

  try {
    // Parse FYSIOTHERAPEUTISCHE DIAGNOSE section
    const diagnoseSection = extractSection(analysisText, 'FYSIOTHERAPEUTISCHE DIAGNOSE');
    if (diagnoseSection) {
      const primaireDiagnose = extractBulletPoint(diagnoseSection, 'Primaire diagnose') || '';
      result.fysiotherapeutischeDiagnose.primaireDiagnose = {
        diagnose: primaireDiagnose,
        zekerheid: 'waarschijnlijk', // Default
        onderbouwing: [extractBulletPoint(diagnoseSection, 'Klinische redenering') || ''],
        klinischeRedenering: extractBulletPoint(diagnoseSection, 'Klinische redenering') || ''
      };
    }

    // Parse BEHANDELPLAN section
    const behandelplanSection = extractSection(analysisText, 'BEHANDELPLAN');
    if (behandelplanSection) {
      const korteDoel = extractBulletPoint(behandelplanSection, 'Hoofddoel korte termijn');
      const langeDoel = extractBulletPoint(behandelplanSection, 'Hoofddoel lange termijn');

      if (korteDoel) {
        result.behandelplan.behandeldoelen.push({
          doel: korteDoel,
          type: 'korte termijn',
          tijdstermijn: '4-6 weken',
          meetbaar: true,
          meetcriteria: korteDoel,
          prioriteit: 'hoog',
          icfDomein: 'function',
          patientRelevantie: ''
        });
      }

      if (langeDoel) {
        result.behandelplan.behandeldoelen.push({
          doel: langeDoel,
          type: 'lange termijn',
          tijdstermijn: '3-6 maanden',
          meetbaar: true,
          meetcriteria: langeDoel,
          prioriteit: 'hoog',
          icfDomein: 'activity',
          patientRelevantie: ''
        });
      }

      const interventies = extractBulletPoint(behandelplanSection, 'Interventies');
      if (interventies) {
        result.behandelplan.interventies.push({
          interventie: interventies,
          type: 'oefentherapie',
          beschrijving: interventies,
          frequentie: '2-3x per week',
          duur: '45 minuten',
          rationale: ''
        });
      }
    }

    // Parse PROGNOSE section
    const prognoseSection = extractSection(analysisText, 'PROGNOSE');
    if (prognoseSection) {
      result.prognose.tijdlijn.kortetermijn = extractBulletPoint(prognoseSection, 'Tijdlijn') || '';
      result.prognose.prognostischeFactoren = parsePrognostischeFactoren(prognoseSection);
    }

    // Parse BEHANDELADVIES section
    const adviesSection = extractSection(analysisText, 'BEHANDELADVIES');
    if (adviesSection) {
      const zelfmanagementText = extractBulletPoint(adviesSection, 'Zelfmanagement') || '';
      result.behandeladvies.zelfmanagement = parseZelfmanagementAdvies(zelfmanagementText);
      result.behandeladvies.leefstijladvies = extractList(extractBulletPoint(adviesSection, 'Leefstijl') || '');
    }

    // Parse SAMENVATTING section
    const summarySection = extractSection(analysisText, 'SAMENVATTING CONCLUSIE');
    if (summarySection) {
      result.samenvattingConclusie.kernConclusies = extractList(extractBulletPoint(summarySection, 'Kern conclusies') || '');
      result.samenvattingConclusie.hoofdPriorities = extractList(extractBulletPoint(summarySection, 'Behandel prioriteiten') || '');
      result.samenvattingConclusie.behandelRationale = extractBulletPoint(summarySection, 'Rationale') || '';
    }

  } catch (error) {
    console.error('Error parsing enhanced Conclusie analysis:', error);
  }

  return result;
}

// Helper parsing functions
function parsePrognostischeFactoren(prognoseText: string): PrognostischeFactor[] {
  const factors: PrognostischeFactor[] = [];

  const gunstigeText = extractBulletPoint(prognoseText, 'Gunstige factoren') || '';
  const ongunstigeText = extractBulletPoint(prognoseText, 'Prognostische uitdagingen') || '';

  if (gunstigeText) {
    extractList(gunstigeText).forEach(factor => {
      factors.push({
        factor: factor,
        type: 'gunstig',
        impact: 'gemiddeld',
        beschrijving: factor
      });
    });
  }

  if (ongunstigeText) {
    extractList(ongunstigeText).forEach(factor => {
      factors.push({
        factor: factor,
        type: 'ongunstig',
        impact: 'gemiddeld',
        beschrijving: factor
      });
    });
  }

  return factors;
}

function parseZelfmanagementAdvies(zelfmanagementText: string): ZelfmanagementAdvies[] {
  const adviezen: ZelfmanagementAdvies[] = [];

  extractList(zelfmanagementText).forEach(advies => {
    if (advies.length > 0) {
      adviezen.push({
        categorie: 'algemeen',
        advies: advies,
        frequentie: 'dagelijks',
        instructies: [advies]
      });
    }
  });

  return adviezen;
}

// Helper functions (reuse from previous modules)
function extractSection(text: string, sectionName: string): string | null {
  const regex = new RegExp(`\\*\\*${sectionName}\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractBulletPoint(text: string, bulletName: string): string | null {
  const regex = new RegExp(`•\\s*${bulletName}[:\\s]*([^•\\n]*(?:\\n(?!•)[^\\n]*)*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

function extractList(text: string): string[] {
  if (!text || text.includes('Niet gespecificeerd') || text.includes('niet van toepassing')) {
    return [];
  }

  return text.split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .filter(item => !item.includes('Niet gespecificeerd'));
}

// Additional interfaces
interface BodyStructureCode {
  code: string;
  description: string;
  qualifier: '0' | '1' | '2' | '3' | '4' | '8' | '9';
  explanation: string;
}

interface ActivityCode {
  code: string;
  description: string;
  qualifier: '0' | '1' | '2' | '3' | '4' | '8' | '9';
  explanation: string;
}

interface ParticipationCode {
  code: string;
  description: string;
  qualifier: '0' | '1' | '2' | '3' | '4' | '8' | '9';
  explanation: string;
}

interface EnvironmentalFactorCode {
  code: string;
  description: string;
  qualifier: '+1' | '+2' | '+3' | '+4' | '.1' | '.2' | '.3' | '.4' | '0';
  explanation: string;
}

interface BehandelDuur {
  totaalWeken: number;
  fase1Weken: number;
  fase2Weken?: number;
  fase3Weken?: number;
  onderhoudsFase?: string;
}

interface VoortgangsMeting {
  maat: string;
  meetmoment: string[];
  verwachteWaarde: string;
  instrument: string;
}

interface ZelfmanagementAdvies {
  categorie: 'oefeningen' | 'activiteit' | 'ergonomie' | 'leefstijl' | 'algemeen';
  advies: string;
  frequentie: string;
  instructies: string[];
  contraindicaties?: string[];
}

interface HulpmiddelAdvies {
  hulpmiddel: string;
  indicatie: string;
  tijdelijk: boolean;
  leverancier?: string;
}

interface VerwijzingsAdvies {
  discipline: string;
  reden: string;
  urgentie: 'spoed' | 'binnen 2 weken' | 'binnen maand' | 'niet urgent';
  informatie: string;
}

interface EvaluatieSchema {
  moment: string;
  meetinstrumenten: string[];
  verwachteUitkomst: string;
  beslispunt: string;
}

interface BehandelPlanning {
  fase: string;
  weken: string;
  focus: string;
  interventies: string[];
}

interface UitkomstMaat {
  maat: string;
  baseline: string;
  tussenmetingen: string[];
  eindmeting: string;
  minimaalBelangrijkVerschil: string;
}