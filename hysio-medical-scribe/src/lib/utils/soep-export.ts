/**
 * SOEP Export Utility
 * Provides specialized export functionality for SOEP documentation
 */

import { PatientInfo, SOEPStructure } from '@/lib/types';
import { ExportFormat, ExportOptions, ExportResult } from './session-export';

export interface SOEPExportData {
  patientInfo: PatientInfo;
  soepData: SOEPStructure;
  createdAt?: string;
  updatedAt?: string;
  uploadedDocuments?: Array<{
    filename: string;
    text: string;
    type: string;
  }>;
}

export class SOEPExporter {
  /**
   * Export SOEP documentation to various formats
   */
  static async exportSOEP(
    data: SOEPExportData,
    format: ExportFormat = 'pdf'
  ): Promise<ExportResult> {
    try {
      const content = this.generateSOEPContent(data);
      
      const filename = this.generateFilename(data.patientInfo, format);
      
      switch (format) {
        case 'text':
        case 'txt':
          return this.exportAsText(content, filename);
        case 'html':
          return this.exportAsHTML(content, filename, data);
        case 'pdf':
          return await this.exportAsPDF(content, filename, data);
        case 'word':
        case 'docx':
          return await this.exportAsDocx(content, filename, data);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('SOEP Export Error:', error);
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: error instanceof Error ? error.message : 'Unknown export error'
      };
    }
  }

  /**
   * Generate structured SOEP content
   */
  private static generateSOEPContent(data: SOEPExportData): string {
    const { patientInfo, soepData, uploadedDocuments } = data;
    
    const getAge = (birthYear: string): number => {
      return new Date().getFullYear() - parseInt(birthYear);
    };

    const age = getAge(patientInfo.birthYear);
    const timestamp = data.createdAt || new Date().toLocaleString('nl-NL');
    
    return `SOEP DOCUMENTATIE

═══════════════════════════════════════
PATIËNTGEGEVENS
═══════════════════════════════════════

Initialen: ${patientInfo.initials}
Leeftijd: ${age} jaar
Geslacht: ${patientInfo.gender}
Hoofdklacht: ${patientInfo.chiefComplaint}

${uploadedDocuments && uploadedDocuments.length > 0 ? `
═══════════════════════════════════════
CONTEXT DOCUMENTEN
═══════════════════════════════════════

Geüploade bijlagen gebruikt voor consultvoorbereiding:
${uploadedDocuments.map(doc => `• ${doc.filename} (${doc.type.includes('pdf') ? 'PDF' : 'Word'})`).join('\n')}

` : ''}═══════════════════════════════════════
SOEP STRUCTUUR
═══════════════════════════════════════

SUBJECTIEF (S)
${soepData.subjective || 'Geen informatie beschikbaar'}

───────────────────────────────────────

OBJECTIEF (O)
${soepData.objective || 'Geen informatie beschikbaar'}

───────────────────────────────────────

EVALUATIE (E)
${soepData.evaluation || 'Geen informatie beschikbaar'}

───────────────────────────────────────

PLAN (P)
${soepData.plan || 'Geen informatie beschikbaar'}

${soepData.redFlags && soepData.redFlags.length > 0 ? `
═══════════════════════════════════════
🚩 RODE VLAGEN
═══════════════════════════════════════

${soepData.redFlags.map(flag => `• ${flag}`).join('\\n')}
` : ''}

═══════════════════════════════════════
DOCUMENTATIE INFORMATIE
═══════════════════════════════════════

Gegenereerd: ${timestamp}
Door: Hysio Medical Scribe
Versie: SOEP Vervolgconsult
${uploadedDocuments && uploadedDocuments.length > 0 ? `Context: ${uploadedDocuments.length} bijlage(n) meegenomen` : ''}

DISCLAIMER:
Deze documentatie is gegenereerd door AI en moet worden geverifieerd
door een bevoegd fysiotherapeut voordat deze wordt gebruikt voor
patiëntenzorg of administratieve doeleinden.`;
  }

  /**
   * Generate filename based on patient info and format
   */
  private static generateFilename(patientInfo: PatientInfo, format: ExportFormat): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const initials = patientInfo.initials.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Map format names to file extensions
    const formatMap: Record<string, string> = {
      'text': 'txt',
      'txt': 'txt',
      'html': 'html',
      'pdf': 'pdf',
      'word': 'docx',
      'docx': 'docx'
    };
    
    const extension = formatMap[format] || format;
    return `SOEP_${initials}_${date}.${extension}`;
  }

  /**
   * Export as plain text
   */
  private static exportAsText(content: string, filename: string): ExportResult {
    return {
      success: true,
      data: content,
      filename,
      mimeType: 'text/plain'
    };
  }

  /**
   * Export as HTML with styling
   */
  private static exportAsHTML(content: string, filename: string, data: SOEPExportData): ExportResult {
    const htmlContent = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOEP Documentatie - ${data.patientInfo.initials}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2c7a5b;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c7a5b;
            margin-bottom: 5px;
        }
        .patient-info {
            background-color: #f7f5f0;
            padding: 20px;
            border-left: 4px solid #84cc9e;
            margin-bottom: 30px;
        }
        .soep-section {
            margin-bottom: 25px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .soep-section h3 {
            color: #2c7a5b;
            margin-top: 0;
            border-bottom: 2px solid #84cc9e;
            padding-bottom: 10px;
        }
        .red-flags {
            background-color: #fef2f2;
            border: 2px solid #fca5a5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
        }
        .red-flags h3 {
            color: #dc2626;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
        pre {
            white-space: pre-wrap;
            font-family: inherit;
            margin: 0;
        }
        @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>SOEP DOCUMENTATIE</h1>
        <p>Fysiotherapie Vervolgconsult</p>
    </div>
    
    <div class="patient-info">
        <h3>Patiëntgegevens</h3>
        <p><strong>Initialen:</strong> ${data.patientInfo.initials}</p>
        <p><strong>Leeftijd:</strong> ${new Date().getFullYear() - parseInt(data.patientInfo.birthYear)} jaar</p>
        <p><strong>Geslacht:</strong> ${data.patientInfo.gender}</p>
        <p><strong>Hoofdklacht:</strong> ${data.patientInfo.chiefComplaint}</p>
    </div>

    ${data.uploadedDocuments && data.uploadedDocuments.length > 0 ? `
    <div class="patient-info">
        <h3>Context Documenten</h3>
        <p><strong>Geüploade bijlagen gebruikt voor consultvoorbereiding:</strong></p>
        <ul>
            ${data.uploadedDocuments.map(doc => `
                <li>📄 ${doc.filename} <span style="color: #666; font-size: 0.9em;">(${doc.type.includes('pdf') ? 'PDF' : 'Word'})</span></li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    ${data.soepData.redFlags && data.soepData.redFlags.length > 0 ? `
    <div class="red-flags">
        <h3>🚩 Rode Vlagen</h3>
        <ul>
            ${data.soepData.redFlags.map(flag => `<li>${flag}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="soep-section">
        <h3>Subjectief (S)</h3>
        <pre>${data.soepData.subjective || 'Geen informatie beschikbaar'}</pre>
    </div>

    <div class="soep-section">
        <h3>Objectief (O)</h3>
        <pre>${data.soepData.objective || 'Geen informatie beschikbaar'}</pre>
    </div>

    <div class="soep-section">
        <h3>Evaluatie (E)</h3>
        <pre>${data.soepData.evaluation || 'Geen informatie beschikbaar'}</pre>
    </div>

    <div class="soep-section">
        <h3>Plan (P)</h3>
        <pre>${data.soepData.plan || 'Geen informatie beschikbaar'}</pre>
    </div>

    <div class="footer">
        <p><strong>Gegenereerd:</strong> ${data.createdAt || new Date().toLocaleString('nl-NL')}</p>
        <p><strong>Door:</strong> Hysio Medical Scribe</p>
        <p><em>Deze documentatie is gegenereerd door AI en moet worden geverifieerd door een bevoegd fysiotherapeut.</em></p>
    </div>
</body>
</html>`;

    return {
      success: true,
      data: htmlContent,
      filename: filename.replace('.html', '.html'),
      mimeType: 'text/html'
    };
  }

  /**
   * Export as PDF using jsPDF
   */
  private static async exportAsPDF(content: string, filename: string, data: SOEPExportData): Promise<ExportResult> {
    try {
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Set font
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      
      // Title
      doc.text('SOEP DOCUMENTATIE', 20, 30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Fysiotherapie Vervolgconsult', 20, 40);
      
      let yPosition = 60;
      
      // Patient info
      doc.setFont('helvetica', 'bold');
      doc.text('Patiëntgegevens:', 20, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      doc.text(`Initialen: ${data.patientInfo.initials}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Leeftijd: ${new Date().getFullYear() - parseInt(data.patientInfo.birthYear)} jaar`, 20, yPosition);
      yPosition += 10;
      doc.text(`Geslacht: ${data.patientInfo.gender}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Hoofdklacht: ${data.patientInfo.chiefComplaint}`, 20, yPosition);
      yPosition += 20;
      
      // Uploaded documents
      if (data.uploadedDocuments && data.uploadedDocuments.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Context Documenten:', 20, yPosition);
        yPosition += 10;
        doc.setFont('helvetica', 'normal');
        data.uploadedDocuments.forEach(doc_item => {
          doc.text(`• ${doc_item.filename} (${doc_item.type.includes('pdf') ? 'PDF' : 'Word'})`, 25, yPosition);
          yPosition += 8;
        });
        yPosition += 10;
      }
      
      // SOEP sections
      const sections = [
        { title: 'Subjectief (S)', content: data.soepData.subjective },
        { title: 'Objectief (O)', content: data.soepData.objective },
        { title: 'Evaluatie (E)', content: data.soepData.evaluation },
        { title: 'Plan (P)', content: data.soepData.plan }
      ];
      
      sections.forEach(section => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 20, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        const content = section.content || 'Geen informatie beschikbaar';
        const lines = doc.splitTextToSize(content, 170);
        
        lines.forEach((line: string) => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, 20, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      });
      
      // Red flags
      if (data.soepData.redFlags && data.soepData.redFlags.length > 0) {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text('🚩 Rode Vlagen', 20, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        data.soepData.redFlags.forEach(flag => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(`• ${flag}`, 25, yPosition);
          yPosition += 8;
        });
      }
      
      const pdfOutput = doc.output();
      
      return {
        success: true,
        data: pdfOutput,
        filename: filename.replace('.pdf', '.pdf'),
        mimeType: 'application/pdf'
      };
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: 'PDF generation failed'
      };
    }
  }

  /**
   * Export as DOCX using docx library
   */
  private static async exportAsDocx(content: string, filename: string, data: SOEPExportData): Promise<ExportResult> {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
      
      const children = [];
      
      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "SOEP DOCUMENTATIE",
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Fysiotherapie Vervolgconsult",
              italics: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({ children: [] }) // Empty line
      );
      
      // Patient info
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Patiëntgegevens",
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Initialen: ${data.patientInfo.initials}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Leeftijd: ${new Date().getFullYear() - parseInt(data.patientInfo.birthYear)} jaar` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Geslacht: ${data.patientInfo.gender}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Hoofdklacht: ${data.patientInfo.chiefComplaint}` }),
          ],
        }),
        new Paragraph({ children: [] }) // Empty line
      );
      
      // Uploaded documents
      if (data.uploadedDocuments && data.uploadedDocuments.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Context Documenten",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Geüploade bijlagen gebruikt voor consultvoorbereiding:" }),
            ],
          })
        );
        
        data.uploadedDocuments.forEach(doc => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: `• ${doc.filename} (${doc.type.includes('pdf') ? 'PDF' : 'Word'})` }),
              ],
            })
          );
        });
        
        children.push(new Paragraph({ children: [] })); // Empty line
      }
      
      // SOEP sections
      const sections = [
        { title: 'Subjectief (S)', content: data.soepData.subjective },
        { title: 'Objectief (O)', content: data.soepData.objective },
        { title: 'Evaluatie (E)', content: data.soepData.evaluation },
        { title: 'Plan (P)', content: data.soepData.plan }
      ];
      
      sections.forEach(section => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.title,
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
          })
        );
        
        const content = section.content || 'Geen informatie beschikbaar';
        const lines = content.split('\n');
        
        lines.forEach(line => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line })],
            })
          );
        });
        
        children.push(new Paragraph({ children: [] })); // Empty line
      });
      
      // Red flags
      if (data.soepData.redFlags && data.soepData.redFlags.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "🚩 Rode Vlagen",
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
          })
        );
        
        data.soepData.redFlags.forEach(flag => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: `• ${flag}` })],
            })
          );
        });
        
        children.push(new Paragraph({ children: [] })); // Empty line
      }
      
      // Footer
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Documentatie Informatie",
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Gegenereerd: ${data.createdAt || new Date().toLocaleString('nl-NL')}` }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Door: Hysio Medical Scribe" }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "DISCLAIMER: Deze documentatie is gegenereerd door AI en moet worden geverifieerd door een bevoegd fysiotherapeut.",
              italics: true,
            }),
          ],
        })
      );
      
      const doc = new Document({
        sections: [{
          children,
        }],
      });
      
      const buffer = await Packer.toBuffer(doc);
      
      return {
        success: true,
        data: buffer,
        filename: filename.replace('.docx', '.docx'),
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
    } catch (error) {
      console.error('DOCX generation failed:', error);
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: 'DOCX generation failed'
      };
    }
  }

  /**
   * Download the exported file
   */
  static downloadFile(result: ExportResult): void {
    if (!result.success || !result.data) {
      console.error('Cannot download file:', result.error);
      return;
    }

    try {
      const blob = new Blob([result.data], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
      
      console.log(`File downloaded: ${result.filename}`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }

  /**
   * Quick export and download
   */
  static async exportAndDownload(
    data: SOEPExportData,
    format: ExportFormat = 'html'
  ): Promise<void> {
    try {
      const result = await this.exportSOEP(data, format);
      
      if (result.success) {
        this.downloadFile(result);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export and download failed:', error);
      throw error;
    }
  }
}