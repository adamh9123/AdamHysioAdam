/**
 * Clinical Document Formatter
 *
 * Transforms structured intake data into beautiful, scannable clinical markdown
 * with proper hierarchy, bullet points, and professional medical formatting.
 *
 * @version 8.0.0 - Professional Clinical Documentation
 */

import type {
  SemanticIntakeResult,
  HHSBStructuredData,
  OnderzoekStructuredData,
  ConclusieStructuredData,
  IntakeSamenvattingData,
} from './semantic-intake-processor';

// ============================================================================
// MAIN FORMATTER - Professional Clinical Documentation
// ============================================================================

export class ClinicalDocumentFormatter {
  /**
   * Format complete intake to professional markdown document
   */
  static formatCompleteIntake(
    result: SemanticIntakeResult,
    patientInfo: { initials: string; age: number; gender: string; chiefComplaint: string }
  ): string {
    const sections: string[] = [];

    // Header
    sections.push(this.formatHeader(patientInfo, result));

    // Executive Summary (new - at the top for quick scanning)
    sections.push(this.formatExecutiveSummary(result.samenvatting));

    // Red Flags Alert (if any)
    if (result.redFlags && result.redFlags.length > 0) {
      sections.push(this.formatRedFlags(result.redFlags));
    }

    // Main Sections
    sections.push(this.formatHHSB(result.hhsbAnamneseCard));
    sections.push(this.formatOnderzoek(result.onderzoeksBevindingen));
    sections.push(this.formatConclusie(result.klinischeConclusie));

    // Complete Intake Summary (comprehensive - renamed from "Samenvatting van Anamnese")
    sections.push(this.formatIntakeSamenvatting(result.samenvatting, result));

    // Metadata footer
    sections.push(this.formatMetadata(result));

    return sections.join('\n\n---\n\n');
  }

  // ============================================================================
  // SECTION FORMATTERS
  // ============================================================================

  private static formatHeader(
    patient: { initials: string; age: number; gender: string; chiefComplaint: string },
    result: SemanticIntakeResult
  ): string {
    return `# Fysiotherapeutisch Intakeverslag

**Patiënt:** ${patient.initials} | **Leeftijd:** ${patient.age} jaar | **Geslacht:** ${patient.gender}
**Hoofdklacht:** ${patient.chiefComplaint}
**Datum:** ${new Date().toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Confidence Score:** ${result.confidence.overall}% | **Validatie:** ${result.validationReport.transcriptCoverage}% transcript coverage`;
  }

  private static formatExecutiveSummary(samenvatting: IntakeSamenvattingData): string {
    return `## 📋 Executive Summary

### Kernprobleem
${samenvatting.executiveSummary}

### Belangrijkste Bevindingen
${samenvatting.keyFindings.map(finding => `- ${finding}`).join('\n')}

### Klinische Redenering
${samenvatting.clinicalReasoning}

### Prioriteitsacties
${samenvatting.priorityActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}`;
  }

  private static formatRedFlags(flags: Array<{ category: string; description: string; severity: string; actionRequired: string }>): string {
    const flagsBySeverity = {
      high: flags.filter(f => f.severity === 'high'),
      medium: flags.filter(f => f.severity === 'medium'),
      low: flags.filter(f => f.severity === 'low'),
    };

    let output = `## 🚨 Red Flags & Bijzonderheden\n\n`;

    if (flagsBySeverity.high.length > 0) {
      output += `### ⚠️ Hoge Prioriteit\n`;
      flagsBySeverity.high.forEach(flag => {
        output += `- **${flag.category}:** ${flag.description}\n`;
        output += `  - 🎯 Actie: ${flag.actionRequired}\n`;
      });
      output += '\n';
    }

    if (flagsBySeverity.medium.length > 0) {
      output += `### ⚠️ Aandachtspunten\n`;
      flagsBySeverity.medium.forEach(flag => {
        output += `- **${flag.category}:** ${flag.description}\n`;
      });
      output += '\n';
    }

    if (flagsBySeverity.low.length > 0) {
      output += `### ℹ️ Notities\n`;
      flagsBySeverity.low.forEach(flag => {
        output += `- ${flag.description}\n`;
      });
    }

    return output;
  }

  private static formatHHSB(hhsb: HHSBStructuredData): string {
    let output = `## 🎯 HHSB Anamnesekaart\n\n`;

    // Hulpvraag
    output += `### H - Hulpvraag\n\n`;
    output += `**Primaire klacht:**\n`;
    output += `- ${hhsb.hulpvraag.primary}\n\n`;

    if (hhsb.hulpvraag.secondary.length > 0) {
      output += `**Secundaire doelen:**\n`;
      hhsb.hulpvraag.secondary.forEach(goal => {
        output += `- ${goal}\n`;
      });
      output += '\n';
    }

    output += `**Verwachtingen patiënt:**\n`;
    output += `- ${hhsb.hulpvraag.patientExpectations}\n\n`;

    // Historie
    output += `### H - Historie\n\n`;
    output += `| Aspect | Bevinding |\n`;
    output += `|--------|----------|\n`;
    output += `| **Ontstaan** | ${hhsb.historie.onset} |\n`;
    output += `| **Duur** | ${hhsb.historie.duration} |\n`;
    output += `| **Mechanisme** | ${hhsb.historie.mechanism} |\n`;
    output += `| **Beloop** | ${hhsb.historie.progression} |\n`;
    if (hhsb.historie.previousEpisodes) {
      output += `| **Eerdere Episodes** | ${hhsb.historie.previousEpisodes} |\n`;
    }
    output += '\n';

    if (hhsb.historie.treatments.length > 0) {
      output += `**Eerdere behandelingen:**\n`;
      hhsb.historie.treatments.forEach(treatment => {
        output += `- ${treatment}\n`;
      });
      output += '\n';
    }

    if (hhsb.historie.medicalHistory.length > 0) {
      output += `**Medische voorgeschiedenis:**\n`;
      hhsb.historie.medicalHistory.forEach(history => {
        output += `- ${history}\n`;
      });
      output += '\n';
    }

    // Stoornissen
    output += `### S - Stoornissen (Functieniveau)\n\n`;
    output += `#### Pijn\n`;
    output += `- **Locatie:** ${hhsb.stoornissen.pain.location.join(', ') || 'Niet gespecificeerd'}\n`;
    output += `- **Karakter:** ${hhsb.stoornissen.pain.character}\n`;
    output += `- **Intensiteit:**\n`;
    output += `  - Huidig: ${hhsb.stoornissen.pain.intensity.current}\n`;
    output += `  - Ergste: ${hhsb.stoornissen.pain.intensity.worst}\n`;
    output += `  - Gemiddeld: ${hhsb.stoornissen.pain.intensity.average}\n`;
    output += `- **Patroon:** ${hhsb.stoornissen.pain.pattern}\n`;

    if (hhsb.stoornissen.pain.aggravatingFactors.length > 0) {
      output += `- **Provocerende factoren:**\n`;
      hhsb.stoornissen.pain.aggravatingFactors.forEach(factor => {
        output += `  - ${factor}\n`;
      });
    }

    if (hhsb.stoornissen.pain.relievingFactors.length > 0) {
      output += `- **Verlichtende factoren:**\n`;
      hhsb.stoornissen.pain.relievingFactors.forEach(factor => {
        output += `  - ${factor}\n`;
      });
    }
    output += '\n';

    output += `#### Beweging\n`;
    if (hhsb.stoornissen.movement.restrictions.length > 0) {
      output += `**Beperkingen:**\n`;
      hhsb.stoornissen.movement.restrictions.forEach(restriction => {
        output += `- ${restriction}\n`;
      });
    }
    output += `- **Kwaliteit:** ${hhsb.stoornissen.movement.quality}\n\n`;

    if (hhsb.stoornissen.otherSymptoms.length > 0) {
      output += `#### Overige Symptomen\n`;
      hhsb.stoornissen.otherSymptoms.forEach(symptom => {
        output += `- ${symptom}\n`;
      });
      output += '\n';
    }

    // Beperkingen
    output += `### B - Beperkingen (Activiteiten & Participatie)\n\n`;

    if (hhsb.beperkingen.adl.length > 0) {
      output += `#### ADL (Dagelijkse Activiteiten)\n`;
      output += `| Activiteit | Beperking | Impact |\n`;
      output += `|------------|-----------|--------|\n`;
      hhsb.beperkingen.adl.forEach(item => {
        output += `| ${item.activity} | ${item.limitation} | ${item.impact} |\n`;
      });
      output += '\n';
    }

    if (hhsb.beperkingen.work.length > 0) {
      output += `#### Werk\n`;
      output += `| Taak | Beperking |\n`;
      output += `|------|----------|\n`;
      hhsb.beperkingen.work.forEach(item => {
        output += `| ${item.task} | ${item.limitation} |\n`;
      });
      output += '\n';
    }

    if (hhsb.beperkingen.sport.length > 0) {
      output += `#### Sport & Hobby\n`;
      output += `| Activiteit | Beperking |\n`;
      output += `|------------|----------|\n`;
      hhsb.beperkingen.sport.forEach(item => {
        output += `| ${item.activity} | ${item.limitation} |\n`;
      });
      output += '\n';
    }

    if (hhsb.beperkingen.social.length > 0) {
      output += `#### Sociaal & Participatie\n`;
      hhsb.beperkingen.social.forEach(item => {
        output += `- ${item}\n`;
      });
      output += '\n';
    }

    return output;
  }

  private static formatOnderzoek(onderzoek: OnderzoekStructuredData): string {
    let output = `## 🔬 Objectieve Onderzoeksbevindingen\n\n`;

    // Inspectie & Palpatie
    output += `### 1. Inspectie & Palpatie\n\n`;
    output += `#### Inspectie\n`;
    output += `- **Houding:** ${onderzoek.inspectie.posture}\n`;
    if (onderzoek.inspectie.swelling) output += `- **Zwelling:** ${onderzoek.inspectie.swelling}\n`;
    if (onderzoek.inspectie.atrophy) output += `- **Atrofie:** ${onderzoek.inspectie.atrophy}\n`;
    if (onderzoek.inspectie.other.length > 0) {
      output += `- **Overige observaties:**\n`;
      onderzoek.inspectie.other.forEach(obs => {
        output += `  - ${obs}\n`;
      });
    }
    output += '\n';

    output += `#### Palpatie\n`;
    if (onderzoek.palpatie.tenderness.length > 0) {
      output += `**Drukpijn:**\n`;
      onderzoek.palpatie.tenderness.forEach(item => {
        output += `- ${item.location}: ${item.severity}\n`;
      });
    }
    output += `- **Tonus:** ${onderzoek.palpatie.tone}\n`;
    if (onderzoek.palpatie.temperature) output += `- **Temperatuur:** ${onderzoek.palpatie.temperature}\n`;
    output += '\n';

    // Bewegingsonderzoek
    output += `### 2. Bewegingsonderzoek\n\n`;

    if (onderzoek.bewegingsonderzoek.arom.length > 0) {
      output += `#### Actief ROM (AROM)\n`;
      output += `| Beweging | Range | Pijn | Beperking |\n`;
      output += `|----------|-------|------|----------|\n`;
      onderzoek.bewegingsonderzoek.arom.forEach(item => {
        output += `| ${item.movement} | ${item.range} | ${item.pain} | ${item.limitation} |\n`;
      });
      output += '\n';
    }

    if (onderzoek.bewegingsonderzoek.prom.length > 0) {
      output += `#### Passief ROM (PROM)\n`;
      output += `| Beweging | Range | Eindgevoel |\n`;
      output += `|----------|-------|------------|\n`;
      onderzoek.bewegingsonderzoek.prom.forEach(item => {
        output += `| ${item.movement} | ${item.range} | ${item.endFeel} |\n`;
      });
      output += '\n';
    }

    // Specifieke Testen
    if (onderzoek.specifiekeTesten.length > 0) {
      output += `### 3. Specifieke Tests & Provocatietesten\n\n`;
      onderzoek.specifiekeTesten.forEach(test => {
        const icon = test.result === 'positive' ? '✅' : test.result === 'negative' ? '❌' : '❓';
        output += `${icon} **${test.testName}:** ${test.result.toUpperCase()}\n`;
        output += `   - ${test.description}\n\n`;
      });
    }

    // Kracht & Stabiliteit
    if (onderzoek.krachtEnStabiliteit.length > 0) {
      output += `### 4. Kracht & Stabiliteit\n\n`;
      output += `| Spier(groep) | Kracht | Opmerking |\n`;
      output += `|--------------|--------|----------|\n`;
      onderzoek.krachtEnStabiliteit.forEach(item => {
        output += `| ${item.muscle} | ${item.strength} | ${item.comment} |\n`;
      });
      output += '\n';
    }

    // Klinimetrie
    if (onderzoek.klinimetrie.length > 0) {
      output += `### 5. Klinimetrie (Baseline Metingen)\n\n`;
      output += `| Meetinstrument | Score | Interpretatie |\n`;
      output += `|----------------|-------|---------------|\n`;
      onderzoek.klinimetrie.forEach(item => {
        output += `| ${item.measureName} | ${item.score} | ${item.interpretation} |\n`;
      });
      output += '\n';
    }

    return output;
  }

  private static formatConclusie(conclusie: ConclusieStructuredData): string {
    let output = `## 📊 Klinische Conclusie & Behandelplan\n\n`;

    // Diagnose
    output += `### 1. Fysiotherapeutische Diagnose\n\n`;
    output += `**Primaire diagnose:** ${conclusie.diagnose.primary}\n\n`;

    if (conclusie.diagnose.icdCode) {
      output += `**ICD-Code:** ${conclusie.diagnose.icdCode}\n\n`;
    }

    if (conclusie.diagnose.differential.length > 0) {
      output += `**Differentiaaldiagnoses:**\n`;
      conclusie.diagnose.differential.forEach(dd => {
        output += `- ${dd}\n`;
      });
      output += '\n';
    }

    // Onderbouwing
    output += `### 2. Onderbouwing & Klinische Redenering\n\n`;

    if (conclusie.onderbouwing.supportingFindings.length > 0) {
      output += `**Ondersteunende bevindingen:**\n`;
      conclusie.onderbouwing.supportingFindings.forEach(finding => {
        output += `- ✓ ${finding}\n`;
      });
      output += '\n';
    }

    if (conclusie.onderbouwing.excludedConditions.length > 0) {
      output += `**Uitgesloten aandoeningen:**\n`;
      conclusie.onderbouwing.excludedConditions.forEach(excluded => {
        output += `- ✗ ${excluded.condition} → ${excluded.reason}\n`;
      });
      output += '\n';
    }

    output += `**Evidence Level:** ${conclusie.onderbouwing.evidenceLevel}\n\n`;

    // Behandelplan
    output += `### 3. Behandelplan\n\n`;

    if (conclusie.behandelplan.mainGoals.length > 0) {
      output += `#### SMART Behandeldoelen\n`;
      conclusie.behandelplan.mainGoals.forEach((goal, index) => {
        output += `${index + 1}. **${goal.goal}**\n`;
        output += `   - Tijdsbestek: ${goal.timeframe}\n`;
        output += `   - Meetbaar: ${goal.measures}\n\n`;
      });
    }

    if (conclusie.behandelplan.phases.length > 0) {
      output += `#### Behandelfasering\n\n`;
      conclusie.behandelplan.phases.forEach((phase, index) => {
        output += `**Fase ${index + 1}: ${phase.phaseName}** (${phase.duration})\n`;
        output += `- Focus: ${phase.focus}\n`;
        output += `- Interventies:\n`;
        phase.interventions.forEach(intervention => {
          output += `  - ${intervention}\n`;
        });
        output += '\n';
      });
    }

    output += `**Frequentie:** ${conclusie.behandelplan.frequency}\n`;
    output += `**Geschatte duur:** ${conclusie.behandelplan.estimatedDuration}\n\n`;

    // Prognose
    output += `### 4. Prognose\n\n`;
    output += `**Verwachting:** ${conclusie.prognose.expected}\n\n`;

    if (conclusie.prognose.factorsPositive.length > 0) {
      output += `**Positieve factoren:**\n`;
      conclusie.prognose.factorsPositive.forEach(factor => {
        output += `- ✓ ${factor}\n`;
      });
      output += '\n';
    }

    if (conclusie.prognose.factorsNegative.length > 0) {
      output += `**Belemmerende factoren:**\n`;
      conclusie.prognose.factorsNegative.forEach(factor => {
        output += `- ⚠️ ${factor}\n`;
      });
      output += '\n';
    }

    return output;
  }

  private static formatIntakeSamenvatting(samenvatting: IntakeSamenvattingData, result: SemanticIntakeResult): string {
    return `## 📝 Samenvatting van Intake

### Kern van het Probleem
${samenvatting.executiveSummary}

### Belangrijkste Bevindingen uit Anamnese
${result.hhsbAnamneseCard.hulpvraag.primary}

### Belangrijkste Bevindingen uit Onderzoek
${result.onderzoeksBevindingen.specifiekeTesten
  .filter(t => t.result === 'positive')
  .map(t => `- ${t.testName}: ${t.result}`)
  .join('\n') || '- Geen specifieke positieve tests'}

### Diagnostische Conclusie
${result.klinischeConclusie.diagnose.primary}

### Klinische Redenatie
${samenvatting.clinicalReasoning}

### Vervolgstappen
${samenvatting.priorityActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

---

*Deze samenvatting integreert alle bevindingen uit de anamnese, het objectieve onderzoek en de klinische conclusie tot een coherent beeld van de patiënt en het behandeltraject.*`;
  }

  private static formatMetadata(result: SemanticIntakeResult): string {
    return `## ℹ️ Documentatie Metadata

**Gegenereerd:** ${new Date().toLocaleString('nl-NL')}
**AI Model:** ${result.processingMetadata.model}
**Verwerkingstijd:** ${result.processingMetadata.processingTime.toFixed(2)}s
**Confidence Score:** ${result.confidence.overall}%
**Transcript Coverage:** ${result.validationReport.transcriptCoverage}%
**Data Compleetheid:** ${result.validationReport.dataCompleteness}%

**Validatie Status:**
- ✓ Geverifieerde claims: ${result.validationReport.crossReferenceChecks.filter(c => c.verified).length}
- ⚠️ Onzekere claims: ${result.validationReport.crossReferenceChecks.filter(c => !c.verified).length}
- ℹ️ Ontbrekende data: ${result.validationReport.missingData.length}

---

*Dit document is gegenereerd door Hysio Medical Scribe v8.0 met Semantic Intelligence. Alle bevindingen zijn cross-gereferenced met het originele intake transcript.*`;
  }
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

/**
 * Format complete intake result to professional markdown
 */
export function formatIntakeToMarkdown(
  result: SemanticIntakeResult,
  patientInfo: { initials: string; age: number; gender: string; chiefComplaint: string }
): string {
  return ClinicalDocumentFormatter.formatCompleteIntake(result, patientInfo);
}

/**
 * Format only HHSB section
 */
export function formatHHSBSection(hhsb: HHSBStructuredData): string {
  return ClinicalDocumentFormatter['formatHHSB'](hhsb);
}

/**
 * Format only Onderzoek section
 */
export function formatOnderzoekSection(onderzoek: OnderzoekStructuredData): string {
  return ClinicalDocumentFormatter['formatOnderzoek'](onderzoek);
}

/**
 * Format only Conclusie section
 */
export function formatConclusieSection(conclusie: ConclusieStructuredData): string {
  return ClinicalDocumentFormatter['formatConclusie'](conclusie);
}
