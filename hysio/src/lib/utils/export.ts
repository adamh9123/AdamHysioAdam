// Export utilities for medical documentation - PDF, DOCX, TXT, HTML formats

import type { PatientInfo, HHSBProcessResponse, SOEPProcessResponse } from '@/types/api';

// Export format types
export type ExportFormat = 'html' | 'txt' | 'docx' | 'pdf';

// Common export data interface
export interface ExportData {
  patientInfo: PatientInfo;
  workflowType: string;
  content: any;
  timestamp: string;
  title: string;
}

// Export configuration
interface ExportConfig {
  includeHeader: boolean;
  includeFooter: boolean;
  includeTimestamp: boolean;
  includePatientInfo: boolean;
  template: 'standard' | 'compact' | 'detailed';
}

const defaultConfig: ExportConfig = {
  includeHeader: true,
  includeFooter: true,
  includeTimestamp: true,
  includePatientInfo: true,
  template: 'standard'
};

// Generate document header
function generateHeader(data: ExportData, format: ExportFormat): string {
  const { patientInfo, workflowType, timestamp, title } = data;
  const age = new Date().getFullYear() - parseInt(patientInfo.birthYear);
  const genderText = patientInfo.gender === 'male' ? 'Man' : patientInfo.gender === 'female' ? 'Vrouw' : 'Anders';

  switch (format) {
    case 'html':
      return `
        <div class="header" style="border-bottom: 2px solid #A5E1C5; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1 style="color: #004B3A; margin: 0; font-size: 24px; font-weight: bold;">${title}</h1>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Gegenereerd op ${new Date(timestamp).toLocaleDateString('nl-NL')}</p>
            </div>
            <div style="text-align: right;">
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA4MCA0MCIgZmlsbD0ibm9uZSI+PHRleHQgeD0iNDAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDA0QjNBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5IeXNpbzwvdGV4dD48L3N2Zz4=" alt="Hysio Logo" style="height: 40px;">
            </div>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #F8F8F5; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #004B3A; font-size: 16px;">Patiëntgegevens</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
              <div><strong>Initialen:</strong> ${patientInfo.initials}</div>
              <div><strong>Leeftijd:</strong> ${age} jaar</div>
              <div><strong>Geslacht:</strong> ${genderText}</div>
              <div><strong>Geboortejaar:</strong> ${patientInfo.birthYear}</div>
            </div>
            <div style="margin-top: 10px;">
              <div><strong>Hoofdklacht:</strong> ${patientInfo.chiefComplaint}</div>
              ${patientInfo.additionalInfo ? `<div style="margin-top: 5px;"><strong>Aanvullende informatie:</strong> ${patientInfo.additionalInfo}</div>` : ''}
            </div>
          </div>
        </div>
      `;

    case 'txt':
      return `
================================================================================
${title.toUpperCase()}
================================================================================

Gegenereerd op: ${new Date(timestamp).toLocaleDateString('nl-NL')}
Hysio Medical Scribe v3

PATIËNTGEGEVENS
---------------
Initialen: ${patientInfo.initials}
Leeftijd: ${age} jaar
Geslacht: ${genderText}
Geboortejaar: ${patientInfo.birthYear}
Hoofdklacht: ${patientInfo.chiefComplaint}
${patientInfo.additionalInfo ? `Aanvullende informatie: ${patientInfo.additionalInfo}` : ''}

================================================================================
`;

    default:
      return '';
  }
}

// Generate document footer
function generateFooter(data: ExportData, format: ExportFormat): string {
  const { timestamp } = data;

  switch (format) {
    case 'html':
      return `
        <div class="footer" style="border-top: 1px solid #A5E1C5; padding-top: 20px; margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Gegenereerd met Hysio Medical Scribe v3 op ${new Date(timestamp).toLocaleString('nl-NL')}</p>
          <p style="margin-top: 5px;">Dit document is gegenereerd door AI en dient ter ondersteuning van de fysiotherapeutische praktijk.</p>
        </div>
      `;

    case 'txt':
      return `
================================================================================
Gegenereerd met Hysio Medical Scribe v3
${new Date(timestamp).toLocaleString('nl-NL')}

Dit document is gegenereerd door AI en dient ter ondersteuning van de
fysiotherapeutische praktijk.
================================================================================`;

    default:
      return '';
  }
}

// Export as HTML
export async function exportAsHTML(data: ExportData, config: ExportConfig = defaultConfig): Promise<void> {
  try {
    const { content } = data;
    let htmlContent = '';

    // Add HTML document structure
    htmlContent = `
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }
        .section {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fafafa;
        }
        .section h3 {
            margin-top: 0;
            color: #004B3A;
            border-bottom: 2px solid #A5E1C5;
            padding-bottom: 10px;
        }
        .summary {
            background-color: #F8F8F5;
            border-left: 4px solid #A5E1C5;
            padding: 15px;
            margin: 20px 0;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
`;

    // Add header
    if (config.includeHeader) {
      htmlContent += generateHeader(data, 'html');
    }

    // Add content based on workflow type
    if (content.hhsbStructure) {
      htmlContent += generateHHSBHTML(content);
    } else if (content.soepStructure) {
      htmlContent += generateSOEPHTML(content);
    } else {
      htmlContent += generateGenericHTML(content);
    }

    // Add footer
    if (config.includeFooter) {
      htmlContent += generateFooter(data, 'html');
    }

    htmlContent += `
</body>
</html>`;

    // Create and download file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    downloadFile(blob, `${data.title.replace(/\s+/g, '_')}.html`);

  } catch (error) {
    console.error('HTML export error:', error);
    throw new Error('Fout bij HTML export');
  }
}

// Export as TXT
export async function exportAsTXT(data: ExportData, config: ExportConfig = defaultConfig): Promise<void> {
  try {
    const { content } = data;
    let txtContent = '';

    // Add header
    if (config.includeHeader) {
      txtContent += generateHeader(data, 'txt');
    }

    // Add content based on workflow type
    if (content.hhsbStructure) {
      txtContent += generateHHSBTXT(content);
    } else if (content.soepStructure) {
      txtContent += generateSOEPTXT(content);
    } else {
      txtContent += generateGenericTXT(content);
    }

    // Add footer
    if (config.includeFooter) {
      txtContent += generateFooter(data, 'txt');
    }

    // Create and download file
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    downloadFile(blob, `${data.title.replace(/\s+/g, '_')}.txt`);

  } catch (error) {
    console.error('TXT export error:', error);
    throw new Error('Fout bij TXT export');
  }
}

// Export as PDF (using browser print)
export async function exportAsPDF(data: ExportData, config: ExportConfig = defaultConfig): Promise<void> {
  try {
    // Create a temporary HTML content for PDF generation
    const htmlContent = await createPDFContent(data, config);

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Popup geblokkeerd. Sta popups toe voor PDF export.');
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Fout bij PDF export');
  }
}

// Export as DOCX (simplified format)
export async function exportAsDOCX(data: ExportData, config: ExportConfig = defaultConfig): Promise<void> {
  try {
    // For DOCX, we'll create an RTF file which can be opened by Word
    const rtfContent = await createRTFContent(data, config);

    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    downloadFile(blob, `${data.title.replace(/\s+/g, '_')}.rtf`);

  } catch (error) {
    console.error('DOCX export error:', error);
    throw new Error('Fout bij DOCX export');
  }
}

// Helper function to create PDF content
async function createPDFContent(data: ExportData, config: ExportConfig): Promise<string> {
  const { content } = data;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${data.title}</title>
    <style>
        @page { margin: 2cm; }
        body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
        }
        .header { border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 10px; }
        .section { margin-bottom: 15px; page-break-inside: avoid; }
        .section-title { font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ccc; }
        .summary { background-color: #f5f5f5; padding: 10px; margin: 10px 0; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    ${generateHeader(data, 'html')}
    ${content.hhsbStructure ? generateHHSBHTML(content) : content.soepStructure ? generateSOEPHTML(content) : generateGenericHTML(content)}
    ${generateFooter(data, 'html')}
</body>
</html>`;
}

// Helper function to create RTF content for DOCX compatibility
async function createRTFContent(data: ExportData, config: ExportConfig): Promise<string> {
  const { content } = data;
  let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}';

  // Add header
  rtfContent += '\\f0\\fs24\\b ' + data.title + '\\b0\\par\\par';
  rtfContent += `Gegenereerd op: ${new Date(data.timestamp).toLocaleDateString('nl-NL')}\\par\\par`;

  // Add patient info
  rtfContent += '\\b Patiëntgegevens\\b0\\par';
  rtfContent += `Initialen: ${data.patientInfo.initials}\\par`;
  rtfContent += `Hoofdklacht: ${data.patientInfo.chiefComplaint}\\par\\par`;

  // Add content
  if (content.hhsbStructure) {
    rtfContent += generateHHSBRTF(content);
  } else if (content.soepStructure) {
    rtfContent += generateSOEPRTF(content);
  }

  rtfContent += '}';
  return rtfContent;
}

// Generate HHSB HTML content
function generateHHSBHTML(content: any): string {
  const { hhsbStructure } = content;

  return `
    <div class="section">
      <h3>🎯 H - Hulpvraag</h3>
      <p>${hhsbStructure.hulpvraag || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="section">
      <h3>📋 H - Historie</h3>
      <p>${hhsbStructure.historie || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="section">
      <h3>⚡ S - Stoornissen</h3>
      <p>${hhsbStructure.stoornissen || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="section">
      <h3>🚫 B - Beperkingen</h3>
      <p>${hhsbStructure.beperkingen || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="summary">
      <h3>📝 Samenvatting Anamnese</h3>
      <p>${hhsbStructure.anamneseSummary || 'Geen samenvatting beschikbaar'}</p>
    </div>

    ${hhsbStructure.redFlags && hhsbStructure.redFlags.length > 0 ? `
    <div class="section" style="border-left: 4px solid #ff6b6b;">
      <h3>🚨 Rode Vlagen</h3>
      <ul>
        ${hhsbStructure.redFlags.map((flag: string) => `<li>${flag}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  `;
}

// Generate SOEP HTML content
function generateSOEPHTML(content: any): string {
  const { soepStructure } = content;

  return `
    <div class="section">
      <h3>🗣️ S - Subjectief</h3>
      <p>${soepStructure.subjectief || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="section">
      <h3>🔬 O - Objectief</h3>
      <p>${soepStructure.objectief || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="section">
      <h3>🤔 E - Evaluatie</h3>
      <p>${soepStructure.evaluatie || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="section">
      <h3>📋 P - Plan</h3>
      <p>${soepStructure.plan || 'Geen informatie beschikbaar'}</p>
    </div>

    <div class="summary">
      <h3>📝 Samenvatting Consult</h3>
      <p>${soepStructure.consultSummary || 'Geen samenvatting beschikbaar'}</p>
    </div>

    ${soepStructure.redFlags && soepStructure.redFlags.length > 0 ? `
    <div class="section" style="border-left: 4px solid #ff6b6b;">
      <h3>🚨 Rode Vlagen</h3>
      <ul>
        ${soepStructure.redFlags.map((flag: string) => `<li>${flag}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  `;
}

// Generate generic HTML content
function generateGenericHTML(content: any): string {
  return `
    <div class="section">
      <h3>📄 Documentatie</h3>
      <p>${content.fullStructuredText || JSON.stringify(content, null, 2)}</p>
    </div>
  `;
}

// Generate HHSB TXT content
function generateHHSBTXT(content: any): string {
  const { hhsbStructure } = content;

  return `
HHSB ANAMNESEKAART
==================

H - HULPVRAAG
-------------
${hhsbStructure.hulpvraag || 'Geen informatie beschikbaar'}

H - HISTORIE
------------
${hhsbStructure.historie || 'Geen informatie beschikbaar'}

S - STOORNISSEN
---------------
${hhsbStructure.stoornissen || 'Geen informatie beschikbaar'}

B - BEPERKINGEN
---------------
${hhsbStructure.beperkingen || 'Geen informatie beschikbaar'}

SAMENVATTING ANAMNESE
=====================
${hhsbStructure.anamneseSummary || 'Geen samenvatting beschikbaar'}

${hhsbStructure.redFlags && hhsbStructure.redFlags.length > 0 ? `
RODE VLAGEN
===========
${hhsbStructure.redFlags.map((flag: string, index: number) => `${index + 1}. ${flag}`).join('\n')}
` : ''}
`;
}

// Generate SOEP TXT content
function generateSOEPTXT(content: any): string {
  const { soepStructure } = content;

  return `
SOEP METHODIEK
==============

S - SUBJECTIEF
--------------
${soepStructure.subjectief || 'Geen informatie beschikbaar'}

O - OBJECTIEF
-------------
${soepStructure.objectief || 'Geen informatie beschikbaar'}

E - EVALUATIE
-------------
${soepStructure.evaluatie || 'Geen informatie beschikbaar'}

P - PLAN
--------
${soepStructure.plan || 'Geen informatie beschikbaar'}

SAMENVATTING CONSULT
====================
${soepStructure.consultSummary || 'Geen samenvatting beschikbaar'}

${soepStructure.redFlags && soepStructure.redFlags.length > 0 ? `
RODE VLAGEN
===========
${soepStructure.redFlags.map((flag: string, index: number) => `${index + 1}. ${flag}`).join('\n')}
` : ''}
`;
}

// Generate generic TXT content
function generateGenericTXT(content: any): string {
  return `
DOCUMENTATIE
============
${content.fullStructuredText || JSON.stringify(content, null, 2)}
`;
}

// Generate HHSB RTF content
function generateHHSBRTF(content: any): string {
  const { hhsbStructure } = content;

  return `\\b HHSB ANAMNESEKAART\\b0\\par\\par
\\b H - Hulpvraag\\b0\\par
${hhsbStructure.hulpvraag || 'Geen informatie beschikbaar'}\\par\\par
\\b H - Historie\\b0\\par
${hhsbStructure.historie || 'Geen informatie beschikbaar'}\\par\\par
\\b S - Stoornissen\\b0\\par
${hhsbStructure.stoornissen || 'Geen informatie beschikbaar'}\\par\\par
\\b B - Beperkingen\\b0\\par
${hhsbStructure.beperkingen || 'Geen informatie beschikbaar'}\\par\\par`;
}

// Generate SOEP RTF content
function generateSOEPRTF(content: any): string {
  const { soepStructure } = content;

  return `\\b SOEP METHODIEK\\b0\\par\\par
\\b S - Subjectief\\b0\\par
${soepStructure.subjectief || 'Geen informatie beschikbaar'}\\par\\par
\\b O - Objectief\\b0\\par
${soepStructure.objectief || 'Geen informatie beschikbaar'}\\par\\par
\\b E - Evaluatie\\b0\\par
${soepStructure.evaluatie || 'Geen informatie beschikbaar'}\\par\\par
\\b P - Plan\\b0\\par
${soepStructure.plan || 'Geen informatie beschikbaar'}\\par\\par`;
}

// Helper function to download files
function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main export function that routes to appropriate format
export async function exportDocument(
  format: ExportFormat,
  data: ExportData,
  config: ExportConfig = defaultConfig
): Promise<void> {
  try {
    switch (format) {
      case 'html':
        await exportAsHTML(data, config);
        break;
      case 'txt':
        await exportAsTXT(data, config);
        break;
      case 'pdf':
        await exportAsPDF(data, config);
        break;
      case 'docx':
        await exportAsDOCX(data, config);
        break;
      default:
        throw new Error(`Onbekend export formaat: ${format}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

// Convenience functions for specific data types
export function exportHHSBData(
  format: ExportFormat,
  hhsbData: HHSBProcessResponse,
  patientInfo: PatientInfo
): Promise<void> {
  const exportData: ExportData = {
    patientInfo,
    workflowType: 'HHSB Intake',
    content: hhsbData,
    timestamp: new Date().toISOString(),
    title: `HHSB Anamnesekaart - ${patientInfo.initials}`
  };

  return exportDocument(format, exportData);
}

export function exportSOEPData(
  format: ExportFormat,
  soepData: SOEPProcessResponse,
  patientInfo: PatientInfo
): Promise<void> {
  const exportData: ExportData = {
    patientInfo,
    workflowType: 'SOEP Consult',
    content: soepData,
    timestamp: new Date().toISOString(),
    title: `SOEP Verslag - ${patientInfo.initials}`
  };

  return exportDocument(format, exportData);
}

export default {
  exportDocument,
  exportAsHTML,
  exportAsTXT,
  exportAsPDF,
  exportAsDOCX,
  exportHHSBData,
  exportSOEPData
};