/**
 * Export Utilities for Pre-intake Data
 *
 * Provides functions to export questionnaire data in multiple formats:
 * - PDF (using jspdf) - Lazy loaded for performance
 * - DOCX (using docx library) - Lazy loaded for performance
 * - HTML (styled template)
 * - TXT (plain text)
 *
 * Performance optimized with dynamic imports to reduce initial bundle size.
 *
 * @module lib/pre-intake/export-utils
 */

import type { PreIntakeQuestionnaireData } from '@/types/pre-intake';
import { formatPreIntakeData, formatDate, type FormattedPreIntakeData } from './review-formatters';

// ============================================================================
// PDF EXPORT (LAZY LOADED)
// ============================================================================

/**
 * Export data as PDF
 * Uses dynamic import for jsPDF to reduce initial bundle size
 */
export async function exportToPDF(data: Partial<PreIntakeQuestionnaireData>): Promise<Blob> {
  // Lazy load jsPDF only when needed
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const formatted = formatPreIntakeData(data);

  let yPos = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Helper to check if we need a new page
  const checkPageBreak = (linesNeeded: number = 1) => {
    if (yPos + (linesNeeded * lineHeight) > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Hysio Pre-intake Vragenlijst', margin, yPos);
  yPos += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Datum: ${formatDate(new Date().toISOString())}`, margin, yPos);
  yPos += 10;

  // Personalia
  if (formatted.personalia) {
    checkPageBreak(8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Persoonlijke Gegevens', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Naam: ${formatted.personalia.fullName}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Geslacht: ${formatted.personalia.gender}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Geboortedatum: ${formatted.personalia.birthDate}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Telefoon: ${formatted.personalia.phone}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Email: ${formatted.personalia.email}`, margin, yPos);
    yPos += lineHeight;
    if (formatted.personalia.insurance) {
      doc.text(`Zorgverzekeraar: ${formatted.personalia.insurance}`, margin, yPos);
      yPos += lineHeight;
    }
    yPos += 5;
  }

  // Complaint
  if (formatted.complaint) {
    checkPageBreak(10);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Uw Klacht', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Locaties: ${formatted.complaint.locations}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Frequentie: ${formatted.complaint.frequency}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Duur: ${formatted.complaint.duration}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Intensiteit: ${formatted.complaint.intensity}`, margin, yPos);
    yPos += lineHeight * 2;

    doc.setFont('helvetica', 'bold');
    doc.text('Hoofdklacht:', margin, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');

    // Split long text into lines
    const splitText = doc.splitTextToSize(formatted.complaint.mainComplaint, 170);
    splitText.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += 5;
  }

  // Red Flags
  if (formatted.redFlags) {
    checkPageBreak(8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Screeningsvragen', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    if (formatted.redFlags.hasPositiveFlags) {
      doc.setTextColor(200, 0, 0);
      doc.text('⚠ Enkele waarschuwingssignalen gedetecteerd', margin, yPos);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setTextColor(0, 150, 0);
      doc.text('✓ Geen waarschuwingssignalen', margin, yPos);
      doc.setTextColor(0, 0, 0);
    }
    yPos += 10;
  }

  // Medical History
  if (formatted.medicalHistory) {
    checkPageBreak(8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medische Achtergrond', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Recente operaties: ${formatted.medicalHistory.hasRecentSurgeries}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Medicatie: ${formatted.medicalHistory.takesMedication}`, margin, yPos);
    yPos += lineHeight;
    if (formatted.medicalHistory.medications) {
      formatted.medicalHistory.medications.forEach((med) => {
        checkPageBreak();
        doc.text(`  - ${med}`, margin + 5, yPos);
        yPos += lineHeight;
      });
    }
    doc.text(`Roken: ${formatted.medicalHistory.smokingStatus}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Alcohol: ${formatted.medicalHistory.alcoholConsumption}`, margin, yPos);
    yPos += 10;
  }

  // Goals
  if (formatted.goals) {
    checkPageBreak(10);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Uw Doelen', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Behandeldoelen:', margin, yPos);
    yPos += lineHeight;
    const goalText = doc.splitTextToSize(formatted.goals.treatmentGoals, 170);
    goalText.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += 5;
  }

  // PSK
  if (formatted.functionalLimitations && formatted.functionalLimitations.length > 0) {
    checkPageBreak(formatted.functionalLimitations.length + 3);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patiënt Specifieke Klachtenlijst (PSK)', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    formatted.functionalLimitations.forEach((limitation) => {
      checkPageBreak();
      doc.setFont('helvetica', 'normal');
      doc.text(`${limitation.activity}: ${limitation.severity}/10 (${limitation.severityLabel})`, margin, yPos);
      yPos += lineHeight;
    });
  }

  return doc.output('blob');
}

// ============================================================================
// DOCX EXPORT (LAZY LOADED)
// ============================================================================

/**
 * Export data as DOCX
 * Uses dynamic import for docx library to reduce initial bundle size
 */
export async function exportToDOCX(data: Partial<PreIntakeQuestionnaireData>): Promise<Blob> {
  // Lazy load docx library only when needed
  const { Document, Packer, Paragraph, HeadingLevel } = await import('docx');

  const formatted = formatPreIntakeData(data);
  const sections: any[] = [];

  // Title
  sections.push(
    new Paragraph({
      text: 'Hysio Pre-intake Vragenlijst',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      text: `Datum: ${formatDate(new Date().toISOString())}`,
      spacing: { after: 400 },
    })
  );

  // Personalia
  if (formatted.personalia) {
    sections.push(
      new Paragraph({
        text: 'Persoonlijke Gegevens',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    );

    sections.push(new Paragraph({ text: `Naam: ${formatted.personalia.fullName}` }));
    sections.push(new Paragraph({ text: `Geslacht: ${formatted.personalia.gender}` }));
    sections.push(new Paragraph({ text: `Geboortedatum: ${formatted.personalia.birthDate}` }));
    sections.push(new Paragraph({ text: `Telefoon: ${formatted.personalia.phone}` }));
    sections.push(new Paragraph({ text: `Email: ${formatted.personalia.email}` }));
    if (formatted.personalia.insurance) {
      sections.push(new Paragraph({ text: `Zorgverzekeraar: ${formatted.personalia.insurance}` }));
    }
  }

  // Complaint
  if (formatted.complaint) {
    sections.push(
      new Paragraph({
        text: 'Uw Klacht',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    sections.push(new Paragraph({ text: `Locaties: ${formatted.complaint.locations}` }));
    sections.push(new Paragraph({ text: `Frequentie: ${formatted.complaint.frequency}` }));
    sections.push(new Paragraph({ text: `Duur: ${formatted.complaint.duration}` }));
    sections.push(new Paragraph({ text: `Intensiteit: ${formatted.complaint.intensity}` }));
    sections.push(
      new Paragraph({
        text: 'Hoofdklacht:',
        bold: true,
        spacing: { before: 200 },
      })
    );
    sections.push(new Paragraph({ text: formatted.complaint.mainComplaint }));
  }

  // Red Flags
  if (formatted.redFlags) {
    sections.push(
      new Paragraph({
        text: 'Screeningsvragen',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    const statusText = formatted.redFlags.hasPositiveFlags
      ? '⚠ Enkele waarschuwingssignalen gedetecteerd'
      : '✓ Geen waarschuwingssignalen';
    sections.push(new Paragraph({ text: statusText }));
  }

  // Medical History
  if (formatted.medicalHistory) {
    sections.push(
      new Paragraph({
        text: 'Medische Achtergrond',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    sections.push(
      new Paragraph({ text: `Recente operaties: ${formatted.medicalHistory.hasRecentSurgeries}` })
    );
    sections.push(
      new Paragraph({ text: `Medicatie: ${formatted.medicalHistory.takesMedication}` })
    );
    if (formatted.medicalHistory.medications) {
      formatted.medicalHistory.medications.forEach((med) => {
        sections.push(new Paragraph({ text: `  - ${med}` }));
      });
    }
    sections.push(new Paragraph({ text: `Roken: ${formatted.medicalHistory.smokingStatus}` }));
    sections.push(
      new Paragraph({ text: `Alcohol: ${formatted.medicalHistory.alcoholConsumption}` })
    );
  }

  // Goals
  if (formatted.goals) {
    sections.push(
      new Paragraph({
        text: 'Uw Doelen',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    sections.push(new Paragraph({ text: 'Behandeldoelen:', bold: true }));
    sections.push(new Paragraph({ text: formatted.goals.treatmentGoals }));
  }

  // PSK
  if (formatted.functionalLimitations && formatted.functionalLimitations.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Patiënt Specifieke Klachtenlijst (PSK)',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    formatted.functionalLimitations.forEach((limitation) => {
      sections.push(
        new Paragraph({
          text: `${limitation.activity}: ${limitation.severity}/10 (${limitation.severityLabel})`,
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// ============================================================================
// HTML EXPORT
// ============================================================================

/**
 * Export data as HTML
 */
export function exportToHTML(data: Partial<PreIntakeQuestionnaireData>): string {
  const formatted = formatPreIntakeData(data);

  let html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hysio Pre-intake Vragenlijst</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 { color: #16a34a; border-bottom: 3px solid #16a34a; padding-bottom: 10px; }
    h2 { color: #16a34a; margin-top: 30px; border-bottom: 2px solid #d1d5db; padding-bottom: 5px; }
    .data-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .data-label { font-weight: bold; width: 200px; color: #6b7280; }
    .data-value { flex: 1; }
    .section { margin-bottom: 30px; }
    .text-block { background: #f9fafb; padding: 15px; border-left: 4px solid #16a34a; margin: 10px 0; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>Hysio Pre-intake Vragenlijst</h1>
  <p><strong>Datum:</strong> ${formatDate(new Date().toISOString())}</p>
`;

  // Personalia
  if (formatted.personalia) {
    html += `
  <div class="section">
    <h2>Persoonlijke Gegevens</h2>
    <div class="data-row"><div class="data-label">Naam:</div><div class="data-value">${formatted.personalia.fullName}</div></div>
    <div class="data-row"><div class="data-label">Geslacht:</div><div class="data-value">${formatted.personalia.gender}</div></div>
    <div class="data-row"><div class="data-label">Geboortedatum:</div><div class="data-value">${formatted.personalia.birthDate}</div></div>
    <div class="data-row"><div class="data-label">Telefoon:</div><div class="data-value">${formatted.personalia.phone}</div></div>
    <div class="data-row"><div class="data-label">Email:</div><div class="data-value">${formatted.personalia.email}</div></div>
    ${formatted.personalia.insurance ? `<div class="data-row"><div class="data-label">Zorgverzekeraar:</div><div class="data-value">${formatted.personalia.insurance}</div></div>` : ''}
  </div>
`;
  }

  // Complaint
  if (formatted.complaint) {
    html += `
  <div class="section">
    <h2>Uw Klacht</h2>
    <div class="data-row"><div class="data-label">Locaties:</div><div class="data-value">${formatted.complaint.locations}</div></div>
    <div class="data-row"><div class="data-label">Frequentie:</div><div class="data-value">${formatted.complaint.frequency}</div></div>
    <div class="data-row"><div class="data-label">Duur:</div><div class="data-value">${formatted.complaint.duration}</div></div>
    <div class="data-row"><div class="data-label">Intensiteit:</div><div class="data-value">${formatted.complaint.intensity}</div></div>
    <h3>Hoofdklacht:</h3>
    <div class="text-block">${formatted.complaint.mainComplaint.replace(/\n/g, '<br>')}</div>
  </div>
`;
  }

  // Red Flags
  if (formatted.redFlags) {
    const statusText = formatted.redFlags.hasPositiveFlags
      ? '⚠ Enkele waarschuwingssignalen gedetecteerd'
      : '✓ Geen waarschuwingssignalen';
    html += `
  <div class="section">
    <h2>Screeningsvragen</h2>
    <p style="color: ${formatted.redFlags.hasPositiveFlags ? '#dc2626' : '#16a34a'}; font-weight: bold;">${statusText}</p>
  </div>
`;
  }

  // Medical History
  if (formatted.medicalHistory) {
    html += `
  <div class="section">
    <h2>Medische Achtergrond</h2>
    <div class="data-row"><div class="data-label">Recente operaties:</div><div class="data-value">${formatted.medicalHistory.hasRecentSurgeries}</div></div>
    <div class="data-row"><div class="data-label">Medicatie:</div><div class="data-value">${formatted.medicalHistory.takesMedication}</div></div>
    ${
      formatted.medicalHistory.medications
        ? `<ul>${formatted.medicalHistory.medications.map((med) => `<li>${med}</li>`).join('')}</ul>`
        : ''
    }
    <div class="data-row"><div class="data-label">Roken:</div><div class="data-value">${formatted.medicalHistory.smokingStatus}</div></div>
    <div class="data-row"><div class="data-label">Alcohol:</div><div class="data-value">${formatted.medicalHistory.alcoholConsumption}</div></div>
  </div>
`;
  }

  // Goals
  if (formatted.goals) {
    html += `
  <div class="section">
    <h2>Uw Doelen</h2>
    <h3>Behandeldoelen:</h3>
    <div class="text-block">${formatted.goals.treatmentGoals.replace(/\n/g, '<br>')}</div>
  </div>
`;
  }

  // PSK
  if (formatted.functionalLimitations && formatted.functionalLimitations.length > 0) {
    html += `
  <div class="section">
    <h2>Patiënt Specifieke Klachtenlijst (PSK)</h2>
    <ul>
      ${formatted.functionalLimitations.map((lim) => `<li><strong>${lim.activity}:</strong> ${lim.severity}/10 (${lim.severityLabel})</li>`).join('')}
    </ul>
  </div>
`;
  }

  html += `
</body>
</html>
`;

  return html;
}

// ============================================================================
// TXT EXPORT
// ============================================================================

/**
 * Export data as plain text
 */
export function exportToTXT(data: Partial<PreIntakeQuestionnaireData>): string {
  const formatted = formatPreIntakeData(data);
  let txt = '';

  txt += '='.repeat(60) + '\n';
  txt += 'HYSIO PRE-INTAKE VRAGENLIJST\n';
  txt += '='.repeat(60) + '\n\n';
  txt += `Datum: ${formatDate(new Date().toISOString())}\n\n`;

  // Personalia
  if (formatted.personalia) {
    txt += '--- PERSOONLIJKE GEGEVENS ---\n\n';
    txt += `Naam: ${formatted.personalia.fullName}\n`;
    txt += `Geslacht: ${formatted.personalia.gender}\n`;
    txt += `Geboortedatum: ${formatted.personalia.birthDate}\n`;
    txt += `Telefoon: ${formatted.personalia.phone}\n`;
    txt += `Email: ${formatted.personalia.email}\n`;
    if (formatted.personalia.insurance) {
      txt += `Zorgverzekeraar: ${formatted.personalia.insurance}\n`;
    }
    txt += '\n';
  }

  // Complaint
  if (formatted.complaint) {
    txt += '--- UW KLACHT ---\n\n';
    txt += `Locaties: ${formatted.complaint.locations}\n`;
    txt += `Frequentie: ${formatted.complaint.frequency}\n`;
    txt += `Duur: ${formatted.complaint.duration}\n`;
    txt += `Intensiteit: ${formatted.complaint.intensity}\n\n`;
    txt += 'Hoofdklacht:\n';
    txt += formatted.complaint.mainComplaint + '\n\n';
  }

  // Red Flags
  if (formatted.redFlags) {
    txt += '--- SCREENINGSVRAGEN ---\n\n';
    txt += formatted.redFlags.hasPositiveFlags
      ? '⚠ Enkele waarschuwingssignalen gedetecteerd\n\n'
      : '✓ Geen waarschuwingssignalen\n\n';
  }

  // Medical History
  if (formatted.medicalHistory) {
    txt += '--- MEDISCHE ACHTERGROND ---\n\n';
    txt += `Recente operaties: ${formatted.medicalHistory.hasRecentSurgeries}\n`;
    txt += `Medicatie: ${formatted.medicalHistory.takesMedication}\n`;
    if (formatted.medicalHistory.medications) {
      formatted.medicalHistory.medications.forEach((med) => {
        txt += `  - ${med}\n`;
      });
    }
    txt += `Roken: ${formatted.medicalHistory.smokingStatus}\n`;
    txt += `Alcohol: ${formatted.medicalHistory.alcoholConsumption}\n\n`;
  }

  // Goals
  if (formatted.goals) {
    txt += '--- UW DOELEN ---\n\n';
    txt += 'Behandeldoelen:\n';
    txt += formatted.goals.treatmentGoals + '\n\n';
  }

  // PSK
  if (formatted.functionalLimitations && formatted.functionalLimitations.length > 0) {
    txt += '--- PATIËNT SPECIFIEKE KLACHTENLIJST (PSK) ---\n\n';
    formatted.functionalLimitations.forEach((lim) => {
      txt += `${lim.activity}: ${lim.severity}/10 (${lim.severityLabel})\n`;
    });
    txt += '\n';
  }

  txt += '='.repeat(60) + '\n';
  txt += 'Einde van document\n';
  txt += '='.repeat(60) + '\n';

  return txt;
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

/**
 * Trigger browser download of a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download text as file
 */
export function downloadText(text: string, filename: string, mimeType: string): void {
  const blob = new Blob([text], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}_${timestamp}.${extension}`;
}
