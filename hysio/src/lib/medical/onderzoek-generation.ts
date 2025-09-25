/**
 * Enhanced Onderzoeksbevindingen (Physical Examination Findings) Generation System
 *
 * This module provides comprehensive examination findings generation with detailed
 * prompts, structured parsing, and clinical accuracy for physiotherapy documentation.
 */

export interface EnhancedOnderzoeksBevindingen {
  observatie: {
    algemeneIndruk: string;
    houding: {
      staand: string;
      zittend?: string;
      bewegend?: string;
    };
    gang: {
      patroon: string;
      afwijkingen: string[];
      hulpmiddelen?: string[];
    };
    huidInspectie?: {
      kleur: string;
      zwelling: SwellingFinding[];
      littekens?: string[];
      overige?: string[];
    };
  };
  palpatie: {
    temperatuur: TemperatureFinding[];
    spanning: MuscleTensionFinding[];
    pijnpunten: PainPoint[];
    zwelling: SwellingFinding[];
    pulsen?: PulseFinding[];
    overige: string[];
  };
  bewegingsonderzoek: {
    actieveROM: ROMFinding[];
    passieveROM: ROMFinding[];
    eindgevoel: EndFeelFinding[];
    pijnGerelateerd: PainRelatedMovement[];
    compensaties: MovementCompensation[];
    kwaliteitBeweging: MovementQuality[];
  };
  krachtEnStabiliteit: {
    manuelleSpiertest: MuscleTesting[];
    functioneleKracht: FunctionalStrengthTest[];
    stabiliteit: StabilityTest[];
    uithoudingsvermogen?: EnduranceTest[];
  };
  neurologischOnderzoek: {
    reflexen: ReflexTesting[];
    sensibiliteit: SensationTesting[];
    coordinatie: CoordinationTest[];
    evenwicht: BalanceTest[];
    neurologischeSymptomen?: string[];
  };
  functietesten: {
    specifiekeTests: SpecificTest[];
    bewegingspatronenAnalyse: MovementPattern[];
    functioneleActiviteiten: FunctionalActivityTest[];
    pijnProvocatieTests: PainProvocationTest[];
  };
  metingenEnScores: {
    pijnScores: PainMeasurement[];
    romMetingen: ROMMeasurement[];
    krachtMetingen: StrengthMeasurement[];
    functioneleScores: FunctionalScore[];
    andereMeetinstrumenten: AdditionalMeasurement[];
  };
  samenvattingOnderzoek: {
    hoofdbevindingen: string[];
    klinischeIndruk: string;
    beperkingen: string[];
    werkdiagnoseHypotheses: string[];
  };
}

export interface SwellingFinding {
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  type: 'hard' | 'soft' | 'fluctuating';
  size?: string;
}

export interface TemperatureFinding {
  location: string;
  finding: 'warm' | 'cold' | 'normal';
  significance?: string;
}

export interface MuscleTensionFinding {
  muscle: string;
  tension: 'hypertonie' | 'hypotonie' | 'normale spanning' | 'trigger points';
  location: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface PainPoint {
  location: string;
  intensity: number; // 0-10
  type: 'drukpijn' | 'spontane pijn' | 'bewegingspijn';
  referred?: boolean;
}

export interface ROMFinding {
  joint: string;
  movement: string;
  range: string; // e.g., "60°" or "75% van normaal"
  limitation: string;
  pain: boolean;
  comparison?: string; // e.g., "links vs rechts"
}

export interface EndFeelFinding {
  joint: string;
  movement: string;
  endFeel: 'hard' | 'zacht' | 'leeg' | 'spasme' | 'afwijkend';
  description: string;
}

export interface MuscleTesting {
  muscle: string;
  grade: '0' | '1' | '2' | '3' | '4' | '5';
  description: string;
  painPresent: boolean;
  movement: string;
}

export interface SpecificTest {
  testName: string;
  result: 'positief' | 'negatief' | 'onduidelijk';
  description: string;
  clinicalSignificance: string;
  reliability?: string;
}

export interface PainMeasurement {
  scale: 'NRS' | 'VAS' | 'VRS';
  currentPain: number;
  worstPain: number;
  bestPain: number;
  context: string;
}

/**
 * Generate enhanced system prompt for comprehensive Onderzoeksbevindingen
 */
export function createEnhancedOnderzoekPrompt(): string {
  return `Je bent een ervaren fysiotherapeut die een systematisch lichamelijk onderzoek uitvoert en documenteert volgens de Nederlandse fysiotherapie richtlijnen.

Het lichamelijk onderzoek volgt een vaste structuur en moet objectief, meetbaar en reproduceerbaar zijn:

**OBSERVATIE/INSPECTIE:**
- Algemene indruk van de patiënt (coöperatief, angstig, pijnlijk, etc.)
- Houding in verschillende posities (staand, zittend, bewegend)
- Gangpatroon en gebruik van hulpmiddelen
- Huidinspectie (zwelling, verkleuring, littekens)
- Asymmetrieën en compensaties

**PALPATIE:**
- Temperatuur (warm, koud, lokale verschillen)
- Spierspanning (hyper/hypotonie, trigger points)
- Pijnpunten (drukpijn, referentie patronen)
- Zwelling (hard, zacht, fluctuerend)
- Pulsen indien relevant

**BEWEGINGSONDERZOEK:**
- Actieve ROM per gewricht/bewegingsrichting
- Passieve ROM per gewricht/bewegingsrichting
- Eindgevoel bij passieve bewegingen
- Pijn gerelateerd aan beweging (wanneer, waar)
- Bewegingskwaliteit en compensaties

**KRACHT & STABILITEIT:**
- Manuele spiertest (MMT grade 0-5) per spier(groep)
- Functionele kracht bij relevante activiteiten
- Gewrichtsstabiliteit (ligamentair, musculair)
- Uithoudingsvermogen indien relevant

**NEUROLOGISCH ONDERZOEK:**
- Reflexen (diep, oppervlakkig, pathologisch)
- Sensibiliteit (aanraking, druk, trillingen, proprioceptie)
- Coördinatie en motorische controle
- Evenwicht (statisch, dynamisch)

**FUNCTIETESTEN:**
- Specifieke orthopedische testen per regio
- Bewegingspatronen analyse
- Functionele activiteiten testen
- Pijnprovocatie testen

**METINGEN & SCORES:**
- Pijnscores (NRS/VAS huidige, ergste, minste pijn)
- ROM metingen met goniometer
- Krachtmetingen indien mogelijk
- Functionele vragenlijsten/scores
- Andere meetinstrumenten

FORMAT JE ANTWOORD EXACT ALS VOLGT:

### ONDERZOEKSBEVINDINGEN ###

**OBSERVATIE:**
• Algemene indruk: [coöperatief/angstig/pijnlijk/normaal]
• Houding: [beschrijving houding staand/zittend/bewegend]
• Gang: [normaal/afwijkend - beschrijving patroon]
• Huid: [zwelling/verkleuring/littekens/normaal]
• Asymmetrie: [links-rechts verschillen/compensaties]

**PALPATIE:**
• Temperatuur: [lokale temperatuursverschillen]
• Spierspanning: [hyper/hypotonie per spier(groep)]
• Pijnpunten: [drukpijnlijke punten met NRS score]
• Zwelling: [lokalisatie, type, ernst]
• Overige: [pulsen, littekens, trigger points]

**BEWEGINGSONDERZOEK:**
• Actieve ROM: [gewricht - beweging: graden/percentage normaal]
• Passieve ROM: [gewricht - beweging: graden/percentage normaal]
• Eindgevoel: [gewricht - beweging: hard/zacht/leeg/spasme]
• Pijn tijdens beweging: [bij welke beweging, intensiteit NRS]
• Bewegingskwaliteit: [compensaties, afwijkend patroon]

**KRACHT & STABILITEIT:**
• Manuele spiertest: [spier/beweging: MMT grade 0-5]
• Functionele kracht: [bij specifieke activiteiten]
• Stabiliteit: [gewrichtsstabiliteit ligamentair/musculair]
• Uithoudingsvermogen: [bij herhaalde contracties]

**NEUROLOGIE:**
• Reflexen: [diep/oppervlakkig: normaal/verhoogd/verlaagd/afwezig]
• Sensibiliteit: [aanraking/druk/proprioceptie: normaal/afwijkend]
• Coördinatie: [finger-neus/hiel-knie: normaal/atactisch]
• Evenwicht: [Romberg/single leg stance: normaal/afwijkend]

**FUNCTIETESTEN:**
• Specifieke testen: [testnaam: positief/negatief - betekenis]
• Bewegingspatronen: [squat/lunge/overhead: normaal/afwijkend]
• Functionele activiteiten: [traplopen/bukken: beperkt/normaal]
• Provocatie testen: [pijnuitlokking bij specifieke testen]

**METINGEN:**
• Pijn NRS: [rust/activiteit/ergste/minste: 0-10 scores]
• ROM metingen: [gewricht-beweging: graden gemeten]
• Kracht: [dynamometer/functioneel: waarden]
• Functionele scores: [vragenlijst/test: score/interpretatie]

**SAMENVATTING ONDERZOEK:**
• Hoofdbevindingen: [3-5 belangrijkste objectieve bevindingen]
• Klinische indruk: [wat vertellen de onderzoeksbevindingen]
• Beperkingen: [welke beperkingen gevonden bij onderzoek]
• Werkdiagnose hypotheses: [mogelijke diagnoses op basis van onderzoek]

Zorg dat alle bevindingen objectief, meetbaar en reproduceerbaar zijn. Gebruik concrete waarden waar mogelijk.`;
}

/**
 * Enhanced user prompt for Onderzoek
 */
export function createEnhancedOnderzoekUserPrompt(
  patientInfo: { initials: string; age: number; gender: string; chiefComplaint: string },
  preparation: string | null,
  transcript: string,
  anamneseData?: any
): string {
  const { initials, age, gender, chiefComplaint } = patientInfo;
  const genderText = gender === 'male' ? 'man' : 'vrouw';

  return `PATIËNT INFORMATIE:
• Initialen: ${initials}
• Leeftijd: ${age} jaar
• Geslacht: ${genderText}
• Hoofdklacht: ${chiefComplaint}

${anamneseData ? `ANAMNESE BEVINDINGEN:\n${JSON.stringify(anamneseData, null, 2)}\n\n` : ''}

${preparation ? `ONDERZOEK VOORBEREIDING:\n${preparation}\n\n` : ''}

TRANSCRIPTIE LICHAMELIJK ONDERZOEK:
${transcript}

Voer een systematische analyse uit van het lichamelijk onderzoek. Documenteer alle objectieve bevindingen volgens de Nederlandse fysiotherapie standaarden. Let specifiek op:

- Objectieve, meetbare bevindingen
- ROM waarden in graden waar mogelijk
- MMT graden bij krachtonderzoek
- NRS/VAS scores bij pijnonderzoek
- Specifieke testuitslagen (positief/negatief)
- Functionele beperkingen geconstateerd bij onderzoek

Als bepaalde onderzoeksonderdelen niet zijn uitgevoerd, vermeld dit expliciet als "Niet onderzocht" of "Geen gegevens beschikbaar".`;
}

/**
 * Parse enhanced Onderzoeksbevindingen with structured extraction
 */
export function parseEnhancedOnderzoekAnalysis(analysisText: string): EnhancedOnderzoeksBevindingen {
  const result: EnhancedOnderzoeksBevindingen = {
    observatie: {
      algemeneIndruk: '',
      houding: { staand: '' },
      gang: { patroon: '', afwijkingen: [] }
    },
    palpatie: {
      temperatuur: [],
      spanning: [],
      pijnpunten: [],
      zwelling: [],
      overige: []
    },
    bewegingsonderzoek: {
      actieveROM: [],
      passieveROM: [],
      eindgevoel: [],
      pijnGerelateerd: [],
      compensaties: [],
      kwaliteitBeweging: []
    },
    krachtEnStabiliteit: {
      manuelleSpiertest: [],
      functioneleKracht: [],
      stabiliteit: []
    },
    neurologischOnderzoek: {
      reflexen: [],
      sensibiliteit: [],
      coordinatie: [],
      evenwicht: []
    },
    functietesten: {
      specifiekeTests: [],
      bewegingspatronenAnalyse: [],
      functioneleActiviteiten: [],
      pijnProvocatieTests: []
    },
    metingenEnScores: {
      pijnScores: [],
      romMetingen: [],
      krachtMetingen: [],
      functioneleScores: [],
      andereMeetinstrumenten: []
    },
    samenvattingOnderzoek: {
      hoofdbevindingen: [],
      klinischeIndruk: '',
      beperkingen: [],
      werkdiagnoseHypotheses: []
    }
  };

  try {
    // Parse OBSERVATIE section
    const observatieSection = extractSection(analysisText, 'OBSERVATIE');
    if (observatieSection) {
      result.observatie.algemeneIndruk = extractBulletPoint(observatieSection, 'Algemene indruk') || '';
      result.observatie.houding.staand = extractBulletPoint(observatieSection, 'Houding') || '';
      result.observatie.gang.patroon = extractBulletPoint(observatieSection, 'Gang') || '';
    }

    // Parse PALPATIE section
    const palpatieSection = extractSection(analysisText, 'PALPATIE');
    if (palpatieSection) {
      const temperatuurText = extractBulletPoint(palpatieSection, 'Temperatuur') || '';
      const spanningText = extractBulletPoint(palpatieSection, 'Spierspanning') || '';
      const pijnText = extractBulletPoint(palpatieSection, 'Pijnpunten') || '';

      // Simple parsing - can be enhanced with more sophisticated extraction
      if (temperatuurText) {
        result.palpatie.temperatuur.push({
          location: 'Algemeen',
          finding: 'normal',
          significance: temperatuurText
        });
      }

      result.palpatie.overige = [
        spanningText,
        pijnText,
        extractBulletPoint(palpatieSection, 'Overige') || ''
      ].filter(item => item.length > 0);
    }

    // Parse METINGEN section
    const metingenSection = extractSection(analysisText, 'METINGEN');
    if (metingenSection) {
      const pijnNRS = extractBulletPoint(metingenSection, 'Pijn NRS');
      if (pijnNRS) {
        const scores = pijnNRS.match(/\d+/g) || [];
        result.metingenEnScores.pijnScores.push({
          scale: 'NRS',
          currentPain: parseInt(scores[0]) || 0,
          worstPain: parseInt(scores[2]) || 0,
          bestPain: parseInt(scores[3]) || 0,
          context: pijnNRS
        });
      }
    }

    // Parse SAMENVATTING section
    const summarySection = extractSection(analysisText, 'SAMENVATTING ONDERZOEK');
    if (summarySection) {
      result.samenvattingOnderzoek.hoofdbevindingen = extractList(extractBulletPoint(summarySection, 'Hoofdbevindingen') || '');
      result.samenvattingOnderzoek.klinischeIndruk = extractBulletPoint(summarySection, 'Klinische indruk') || '';
      result.samenvattingOnderzoek.beperkingen = extractList(extractBulletPoint(summarySection, 'Beperkingen') || '');
      result.samenvattingOnderzoek.werkdiagnoseHypotheses = extractList(extractBulletPoint(summarySection, 'Werkdiagnose hypotheses') || '');
    }

  } catch (error) {
    console.error('Error parsing enhanced Onderzoek analysis:', error);
  }

  return result;
}

// Helper functions (reuse from HHSB module)
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
  if (!text || text.includes('Niet onderzocht') || text.includes('niet beschikbaar')) {
    return [];
  }

  return text.split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .filter(item => !item.includes('Niet onderzocht'));
}

// Additional interfaces for completeness
interface PulseFinding {
  location: string;
  quality: 'normal' | 'weak' | 'bounding' | 'absent';
  rate?: number;
}

interface PainRelatedMovement {
  movement: string;
  painLocation: string;
  intensity: number;
  phase: 'start' | 'during' | 'end' | 'after';
}

interface MovementCompensation {
  movement: string;
  compensation: string;
  reason: string;
}

interface MovementQuality {
  movement: string;
  quality: 'normal' | 'altered' | 'restricted' | 'excessive';
  description: string;
}

interface FunctionalStrengthTest {
  activity: string;
  performance: 'normal' | 'reduced' | 'unable';
  description: string;
}

interface StabilityTest {
  joint: string;
  test: string;
  result: 'stable' | 'unstable' | 'hypermobile';
  grade?: string;
}

interface EnduranceTest {
  muscle: string;
  duration: string;
  performance: 'normal' | 'reduced';
}

interface ReflexTesting {
  reflex: string;
  result: 'normal' | 'increased' | 'decreased' | 'absent';
  grade?: string;
}

interface SensationTesting {
  area: string;
  modality: 'light touch' | 'pressure' | 'vibration' | 'proprioception';
  result: 'normal' | 'decreased' | 'absent' | 'hyperesthetic';
}

interface CoordinationTest {
  test: string;
  result: 'normal' | 'impaired';
  description: string;
}

interface BalanceTest {
  test: string;
  duration?: string;
  result: 'normal' | 'impaired';
  description: string;
}

interface MovementPattern {
  pattern: string;
  quality: 'normal' | 'altered';
  deviations: string[];
}

interface FunctionalActivityTest {
  activity: string;
  performance: 'normal' | 'limited' | 'unable';
  limitations: string[];
}

interface PainProvocationTest {
  test: string;
  result: 'positive' | 'negative';
  painLocation?: string;
  intensity?: number;
}

interface ROMMeasurement {
  joint: string;
  movement: string;
  degrees: number;
  method: 'goniometer' | 'inclinometer' | 'visual';
}

interface StrengthMeasurement {
  muscle: string;
  value: number;
  unit: 'kg' | 'N' | 'lbs';
  method: 'dynamometer' | 'manual';
}

interface FunctionalScore {
  instrument: string;
  score: number;
  maxScore: number;
  interpretation: string;
}

interface AdditionalMeasurement {
  instrument: string;
  value: string;
  interpretation: string;
}