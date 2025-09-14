/**
 * Intelligent Session Preparation System
 *
 * Dynamische, klacht-specifieke voorbereiding voor intake en consult sessies
 * met document context integratie en anatomische regio-specifieke vragen.
 */

export interface PatientInfo {
  initials?: string;
  age?: string;
  birthYear?: string;
  gender: string;
  chiefComplaint: string;
}

export interface PreparationRequest {
  patientInfo: PatientInfo;
  sessionType: 'intake' | 'consult';
  documentContext?: string;
  documentFilename?: string;
}

export interface AnatomicalRegion {
  name: string;
  keywords: string[];
  specificQuestions: {
    intake: string[];
    consult: string[];
  };
  assessmentTests: string[];
  commonConditions: string[];
}

/**
 * Anatomische regio's met klacht-specifieke vragen en tests
 */
const ANATOMICAL_REGIONS: AnatomicalRegion[] = [
  {
    name: 'Rug/Wervelkolom',
    keywords: ['rug', 'rugpijn', 'lumbaal', 'cervicaal', 'thoracaal', 'wervel', 'hernia', 'sciatica', 'nek', 'nekpijn', 'lende'],
    specificQuestions: {
      intake: [
        'Straalt de pijn uit naar benen of armen?',
        'Heeft u gevoelsstoornissen (tintelingen/doofheid)?',
        'Is er sprake van krachtverlies in armen/benen?',
        'Welke houding verergert/verlicht de klachten?',
        'Zijn er neurologische verschijnselen?',
        'Heeft u problemen met hoesten/niezen (verhoogde pijn)?'
      ],
      consult: [
        'Hoe is de uitstraling/neurologische symptomen sinds vorige keer?',
        'Welke bewegingen/activiteiten gaan nu beter/slechter?',
        'Hoe zijn de pijnscores ontwikkeld?',
        'Is er verbetering in houding/ergonomie?'
      ]
    },
    assessmentTests: ['Straight Leg Raise', 'Neurodynamische tests', 'Spurling test', 'Distraction test'],
    commonConditions: ['Hernia nuclei pulposi', 'Facet joint syndroom', 'Myofasciale pijn', 'Radiculopathie']
  },
  {
    name: 'Schouder',
    keywords: ['schouder', 'schouderpijn', 'frozen shoulder', 'impingement', 'rotator cuff', 'arm', 'bovenarm'],
    specificQuestions: {
      intake: [
        'In welke bewegingsrichtingen heeft u beperkingen?',
        'Heeft u nachtpijn in de schouder?',
        'Kunt u nog boven schouderhoogte reiken?',
        'Is er een specifiek trauma geweest?',
        'Voelt u krakende geluiden bij bewegen?'
      ],
      consult: [
        'Hoe is uw bewegingsbereik verbeterd?',
        'Is de nachtpijn verminderd?',
        'Welke ADL-activiteiten gaan nu beter?',
        'Hoe voelt de schouder bij specifieke oefeningen?'
      ]
    },
    assessmentTests: ['Neer test', 'Hawkins test', 'Empty can test', 'External rotation test'],
    commonConditions: ['Impingement syndroom', 'Frozen shoulder', 'Rotator cuff letsel', 'Bicepstendinopathie']
  },
  {
    name: 'Knie',
    keywords: ['knie', 'kniepijn', 'meniscus', 'kruisband', 'patella', 'been', 'bovenbeen', 'onderbeen'],
    specificQuestions: {
      intake: [
        'Heeft u zwelling rondom de knie?',
        'Voelt u instabiliteit of wegzakken?',
        'Is er sprake van blokkering of vastzitten?',
        'Doet traplopen pijn?',
        'Hoe is de pijn bij hurken/knielen?'
      ],
      consult: [
        'Hoe is de zwelling/stabiliteit ontwikkeld?',
        'Welke functionele activiteiten gaan beter?',
        'Hoe voelt de knie bij belasting?',
        'Is er verbetering in kracht/coördinatie?'
      ]
    },
    assessmentTests: ['McMurray test', 'Lachman test', 'Anterior drawer', 'Valgus/Varus stress test'],
    commonConditions: ['Meniscusletsel', 'Kruisbandletsel', 'Patellofemorale pijn', 'Gonartrose']
  },
  {
    name: 'Heup',
    keywords: ['heup', 'heuppijn', 'lies', 'dijbeen', 'bekken', 'SI-gewricht', 'coxartrose'],
    specificQuestions: {
      intake: [
        'Voelt u pijn in de lies of aan de zijkant van de heup?',
        'Heeft u stijfheid vooral \'s ochtends?',
        'Is traplopen/autorijden pijnlijk?',
        'Straalt de pijn uit naar de knie?',
        'Heeft u problemen met aankleden (sokken/schoenen)?'
      ],
      consult: [
        'Hoe is uw mobiliteit verbeterd?',
        'Welke dagelijkse activiteiten gaan nu makkelijker?',
        'Hoe zijn de ochtendstijfheid en pijn?',
        'Is er verbetering in looppatroon?'
      ]
    },
    assessmentTests: ['FABER test', 'FADIR test', 'Trendelenburg test', 'Thomas test'],
    commonConditions: ['Coxartrose', 'FAI (femoroacetabulaire impingement)', 'Trochanterische pijn', 'Labrum letsel']
  },
  {
    name: 'Voet/Enkel',
    keywords: ['voet', 'enkel', 'enkelpijn', 'voetpijn', 'achillespees', 'plantair', 'teen', 'hiel'],
    specificQuestions: {
      intake: [
        'Heeft u pijn vooral bij de eerste stappen \'s ochtends?',
        'Is er zwelling rondom de enkel?',
        'Voelt u instabiliteit bij lopen op oneffen ondergrond?',
        'Heeft u pijn onder de voet (hiel/middenvoet)?',
        'Zijn er problemen met schoenen/voetgewelf?'
      ],
      consult: [
        'Hoe zijn de ochtendpijn en eerste stappen?',
        'Is er verbetering in stabiliteit/balans?',
        'Welke loopactiviteiten gaan beter?',
        'Hoe voelt u zich in verschillende schoenen?'
      ]
    },
    assessmentTests: ['Anterior drawer test enkel', 'Talar tilt test', 'Thompson test', 'Windlass test'],
    commonConditions: ['Plantaire fasciitis', 'Achillestendinopathie', 'Enkelinstabiliteit', 'Metatarsalgie']
  }
];

/**
 * Detecteer anatomische regio op basis van hoofdklacht
 */
export function detectAnatomicalRegion(chiefComplaint: string): AnatomicalRegion | null {
  const complaint = chiefComplaint.toLowerCase();

  for (const region of ANATOMICAL_REGIONS) {
    if (region.keywords.some(keyword => complaint.includes(keyword))) {
      return region;
    }
  }

  return null;
}

/**
 * Genereer intelligente system prompt voor voorbereiding
 */
export function generateIntelligentSystemPrompt(
  request: PreparationRequest,
  detectedRegion: AnatomicalRegion | null
): string {
  const basePrompt = `Je bent een zeer ervaren fysiotherapeut en klinisch expert gespecialiseerd in evidence-based praktijk. Je genereert gedetailleerde, professionele ${request.sessionType} voorbereidingen die fysiotherapeuten helpen optimaal voorbereid te zijn.`;

  const regionPrompt = detectedRegion
    ? `\n\nGEDETECTEERDE REGIO: ${detectedRegion.name}\nJe hebt specialistische kennis over deze anatomische regio, veel voorkomende aandoeningen (zoals ${detectedRegion.commonConditions.join(', ')}), en relevante assessmenttests (zoals ${detectedRegion.assessmentTests.join(', ')}).`
    : '\n\nGeen specifieke anatomische regio gedetecteerd - genereer een algemene maar grondige voorbereiding.';

  const documentPrompt = request.documentContext && request.documentFilename
    ? `\n\nDOCUMENT CONTEXT BESCHIKBAAR: Je hebt toegang tot een geüpload document (${request.documentFilename}) met aanvullende patiëntinformatie. Gebruik deze context om specifieke, relevante vragen en aandachtspunten te formuleren.`
    : '';

  const qualityPrompt = `\n\nKWALITEITSEISEN:
- Formuleer specifieke, gerichte vragen (geen algemene standaard vragen)
- Baseer aanbevelingen op actuele evidence-based richtlijnen
- Maak onderscheid tussen wat je WEL en NIET weet over deze patiënt
- Geef praktische, haalbare aanbevelingen voor de fysiotherapeut`;

  return basePrompt + regionPrompt + documentPrompt + qualityPrompt;
}

/**
 * Genereer intelligente user prompt voor voorbereiding
 */
export function generateIntelligentUserPrompt(
  request: PreparationRequest,
  detectedRegion: AnatomicalRegion | null
): string {
  const { patientInfo, sessionType, documentContext } = request;

  // Bereken leeftijd
  const age = patientInfo.age ||
    (patientInfo.birthYear ? String(new Date().getFullYear() - parseInt(patientInfo.birthYear)) : 'Onbekend');

  let baseInfo = `PATIËNT INFORMATIE:
- Voorletters: ${patientInfo.initials || 'Niet opgegeven'}
- Leeftijd: ${age} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}`;

  // Document context toevoegen indien beschikbaar
  if (documentContext) {
    baseInfo += `\n\nDOCUMENT CONTEXT:\n${documentContext}`;
  }

  // Regio-specifieke instructies
  const regionInstructions = detectedRegion
    ? `\n\nSPECIFIEKE FOCUS VOOR ${detectedRegion.name.toUpperCase()}:
Formuleer gerichte vragen over: ${detectedRegion.specificQuestions[sessionType].join(', ')}.
Overweeg assessment tests zoals: ${detectedRegion.assessmentTests.join(', ')}.
Houd rekening met veel voorkomende aandoeningen: ${detectedRegion.commonConditions.join(', ')}.`
    : '';

  // Sessie-specifieke template
  const sessionTemplate = sessionType === 'intake'
    ? `\n\nGENEREER EEN UITGEBREIDE INTAKE VOORBEREIDING MET:

**🎯 Werkhypothese & Differentiaaldiagnoses**
- Meest waarschijnlijke voorlopige diagnose op basis van hoofdklacht${documentContext ? ' en document context' : ''}
- 2-3 alternatieve verklaringen/differentiaaldiagnoses
- Rationale voor hypotheses

**🔍 Gerichte Anamnese Vragen**
- Specifieke LOFTIG vragen aangepast aan deze klacht
- Regio-specifieke symptoomvragen
- Functionele impact vragen (ADL, werk, sport)
- Red flags screening vragen

**📋 Aanbevolen Assessment Tests**
- Specifieke fysieke tests voor deze klacht/regio
- Relevante bewegingsanalyse punten
- Functionaliteit tests (indien van toepassing)

**⚠️ Aandachtspunten & Red Flags**
- Specifieke waarschuwingssignalen voor deze klacht
- Wanneer doorverwijzing overwegen
- Contra-indicaties voor behandeling

**📝 Voorbereiding Praktische Tips**
- Specifieke items om klaar te leggen/voorbereiden
- Geschatte tijdsduur per onderdeel
- Mogelijke vervolgstappen na intake`
    : `\n\nGENEREER EEN GERICHTE CONSULT VOORBEREIDING MET:

**📊 Voortgang Evaluatie Focus**
- Specifieke vragen over verbetering sinds vorig consult
- Relevante outcome measures voor deze klacht
- Functionele verbeteringen om te bespreken

**🔄 SOEP Gerichte Vragen**
- **Subjectief**: Specifieke symptoomvragen voor deze klacht
- **Objectief**: Relevante tests/metingen om te herhalen
- **Evaluatie**: Voortgang indicatoren voor deze aandoening
- **Plan**: Mogelijke behandelaanpassingen

**⚡ Efficiency Tips**
- Belangrijkste punten om snel te checken
- Kritische vragen die niet gemist mogen worden
- Praktische handige tips voor dit type consult

**🎯 Behandel Focus**
- Specifieke interventies om te overwegen/aanpassen
- Home exercise aanpassingen
- Lifestyle adviezen relevant voor deze klacht`;

  return baseInfo + regionInstructions + sessionTemplate + `\n\nMaak het praktisch, specifiek en evidence-based. Help de fysiotherapeut optimaal voorbereid en efficiënt te zijn!`;
}

/**
 * Valideer input requirements - hoofdklacht OF document is verplicht
 */
export function validatePreparationInput(request: PreparationRequest): {
  isValid: boolean;
  errorMessage?: string;
} {
  const hasChiefComplaint = request.patientInfo.chiefComplaint?.trim().length > 0;
  const hasDocumentContext = request.documentContext?.trim().length > 0;

  if (!hasChiefComplaint && !hasDocumentContext) {
    return {
      isValid: false,
      errorMessage: 'Vul een hoofdklacht in OF upload een document voor contextuele voorbereiding.'
    };
  }

  // Als er geen hoofdklacht is maar wel een document, dat is ok
  if (!hasChiefComplaint && hasDocumentContext) {
    return { isValid: true };
  }

  return { isValid: true };
}

/**
 * Genereer complete voorbereiding met intelligente prompts
 */
export async function generateIntelligentPreparation(
  request: PreparationRequest
): Promise<{ systemPrompt: string; userPrompt: string; region: AnatomicalRegion | null }> {

  // Detecteer anatomische regio
  const detectedRegion = request.patientInfo.chiefComplaint
    ? detectAnatomicalRegion(request.patientInfo.chiefComplaint)
    : null;

  // Genereer intelligente prompts
  const systemPrompt = generateIntelligentSystemPrompt(request, detectedRegion);
  const userPrompt = generateIntelligentUserPrompt(request, detectedRegion);

  return {
    systemPrompt,
    userPrompt,
    region: detectedRegion
  };
}