import { INTAKE_STAPSGEWIJS_VERWERKING_ZORGPLAN_PROMPT } from '@/lib/prompts/intake-stapsgewijs/stap6-verwerking-zorgplan';

export function createZorgplanPrompt(): string {
  return INTAKE_STAPSGEWIJS_VERWERKING_ZORGPLAN_PROMPT;
}

export function createZorgplanUserPrompt(
  patientInfo: { initials: string; age: number; gender: string; chiefComplaint: string },
  anamneseResult: any,
  onderzoekResult: any,
  klinischeConclusieResult: any
): string {
  const formatResult = (result: any): string => {
    if (typeof result === 'string') {
      return result;
    }
    return JSON.stringify(result, null, 2);
  };

  return `PATIËNT INFORMATIE:
- Voorletters: ${patientInfo.initials}
- Leeftijd: ${patientInfo.age} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

ANAMNESE GEGEVENS (Stap 2 - HHSB Anamnesekaart):
${formatResult(anamneseResult)}

ONDERZOEKSBEVINDINGEN (Stap 4 - Fysiek Onderzoek):
${formatResult(onderzoekResult)}

KLINISCHE CONCLUSIE (Stap 5 - Diagnose en Analyse):
${formatResult(klinischeConclusieResult)}

OPDRACHT:
Genereer een volledig, gestructureerd en patiëntgericht fysiotherapeutisch zorgplan volgens het exacte format gespecificeerd in de systeemprompt. Het zorgplan moet:

1. Alle voorgaande informatie synthetiseren
2. SMART-doelstellingen formuleren die direct gekoppeld zijn aan de patiënt's hulpvraag
3. Een gefaseerde behandelstrategie opstellen
4. Een realistische prognose geven met beïnvloedende factoren
5. Concrete interventies per fase specificeren
6. Evaluatiemomenten en criteria definiëren

Het resultaat moet EPD-klaar zijn en direct implementeerbaar door elke fysiotherapeut.`;
}

export function parseZorgplanAnalysis(content: string): any {
  try {
    // Clean the content first
    const cleanedContent = content
      .replace(/```markdown/g, '')
      .replace(/```/g, '')
      .trim();

    // For now, return the cleaned content as is
    // In the future, we could parse this into structured data
    return {
      zorgplan: cleanedContent,
      type: 'complete_care_plan',
      sections: extractZorgplanSections(cleanedContent)
    };
  } catch (error) {
    console.error('Error parsing zorgplan analysis:', error);
    return {
      zorgplan: content,
      type: 'raw_care_plan',
      parseError: true
    };
  }
}

function extractZorgplanSections(content: string): any {
  const sections: any = {};

  try {
    // Extract main sections based on the prompt structure
    const managementSummaryMatch = content.match(/1\.\s*Management Samenvatting([\s\S]*?)(?=2\.|$)/i);
    if (managementSummaryMatch) {
      sections.managementSamenvatting = managementSummaryMatch[1].trim();
    }

    const prognoseMatch = content.match(/2\.\s*Prognose[\s\S]*?Beïnvloedende Factoren([\s\S]*?)(?=3\.|$)/i);
    if (prognoseMatch) {
      sections.prognose = prognoseMatch[1].trim();
    }

    const behandelplanMatch = content.match(/3\.\s*Fysiotherapeutisch Behandelplan([\s\S]*?)(?=4\.|$)/i);
    if (behandelplanMatch) {
      sections.behandelplan = behandelplanMatch[1].trim();
    }

    const communicatieMatch = content.match(/4\.\s*Communicatie[\s\S]*?Evaluatieplan([\s\S]*?)(?=---|$)/i);
    if (communicatieMatch) {
      sections.communicatieEvaluatie = communicatieMatch[1].trim();
    }

    return sections;
  } catch (error) {
    console.error('Error extracting zorgplan sections:', error);
    return {};
  }
}