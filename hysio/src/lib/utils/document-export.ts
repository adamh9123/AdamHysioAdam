/**
 * Unified Document Export Utility
 *
 * Centralized export functionality for all document types (HHSB, SOEP, Sessions).
 * Eliminates duplication between session-export.ts and soep-export.ts.
 */

export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'html' | 'text' | 'word';

export interface ExportOptions {
  format: ExportFormat;
  includePatientInfo?: boolean;
  includeAudioTranscripts?: boolean;
  includeTimestamps?: boolean;
  anonymize?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | ArrayBuffer;
  filename: string;
  mimeType: string;
  error?: string;
}

export interface DocumentMetadata {
  title: string;
  subtitle?: string;
  patientName: string;
  date: string;
  sessionId?: string;
  footer?: string;
}

export class DocumentExporter {
  /**
   * Export document to specified format
   */
  static async exportDocument(
    content: string,
    filename: string,
    format: ExportFormat,
    metadata?: DocumentMetadata
  ): Promise<ExportResult> {
    try {
      const normalizedFormat = this.normalizeFormat(format);

      switch (normalizedFormat) {
        case 'txt':
          return this.exportAsText(content, filename);
        case 'html':
          return this.exportAsHTML(content, filename, metadata);
        case 'pdf':
          return await this.exportAsPDF(content, filename, metadata);
        case 'docx':
          return await this.exportAsDocx(content, filename, metadata);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: error instanceof Error ? error.message : 'Unknown export error',
      };
    }
  }

  /**
   * Normalize format names
   */
  private static normalizeFormat(format: ExportFormat): 'txt' | 'html' | 'pdf' | 'docx' {
    const formatMap: Record<string, 'txt' | 'html' | 'pdf' | 'docx'> = {
      'text': 'txt',
      'txt': 'txt',
      'html': 'html',
      'pdf': 'pdf',
      'word': 'docx',
      'docx': 'docx',
    };

    return formatMap[format.toLowerCase()] || 'txt';
  }

  /**
   * Export as plain text
   */
  private static exportAsText(content: string, filename: string): ExportResult {
    const txtFilename = filename.replace(/\.[^.]+$/, '.txt');

    return {
      success: true,
      data: content,
      filename: txtFilename,
      mimeType: 'text/plain',
    };
  }

  /**
   * Export as HTML with Hysio styling
   */
  private static exportAsHTML(
    content: string,
    filename: string,
    metadata?: DocumentMetadata
  ): ExportResult {
    const title = metadata?.title || 'Hysio Medical Scribe';
    const subtitle = metadata?.subtitle || '';

    const htmlContent = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #004B3A;
            background-color: #F8F8F5;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #A5E1C5, #004B3A);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 1.8em;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            border-left: 4px solid #A5E1C5;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: inherit;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #F0F0F0;
            border-radius: 8px;
            font-size: 0.9em;
            color: #666;
        }
        @media print {
            body { background: white; }
            .header { background: #004B3A !important; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
        ${metadata?.patientName ? `<p>Patiënt: ${metadata.patientName}</p>` : ''}
        ${metadata?.date ? `<p>Datum: ${metadata.date}</p>` : ''}
    </div>
    <div class="section">
        <pre>${content}</pre>
    </div>
    <div class="footer">
        <p>Gegenereerd door Hysio Medical Scribe</p>
        ${metadata?.footer || '<p>Voldoet aan Nederlandse fysiotherapie richtlijnen (KNGF, DTF)</p>'}
    </div>
</body>
</html>`;

    const htmlFilename = filename.replace(/\.[^.]+$/, '.html');

    return {
      success: true,
      data: htmlContent,
      filename: htmlFilename,
      mimeType: 'text/html',
    };
  }

  /**
   * Export as PDF using jsPDF
   */
  private static async exportAsPDF(
    content: string,
    filename: string,
    metadata?: DocumentMetadata
  ): Promise<ExportResult> {
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(metadata?.title || 'HYSIO MEDICAL SCRIBE', margin, 30);

      if (metadata?.subtitle) {
        doc.setFontSize(12);
        doc.text(metadata.subtitle, margin, 40);
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      let yPosition = metadata?.subtitle ? 55 : 45;

      if (metadata?.patientName) {
        doc.text(`Patiënt: ${metadata.patientName}`, margin, yPosition);
        yPosition += 10;
      }

      if (metadata?.date) {
        doc.text(`Datum: ${metadata.date}`, margin, yPosition);
        yPosition += 10;
      }

      doc.setLineWidth(0.5);
      doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

      yPosition += 20;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const lines = content.split('\n');
      const lineHeight = 6;

      for (const line of lines) {
        if (yPosition > 280) {
          doc.addPage();
          yPosition = 30;
        }

        if (line.trim()) {
          const wrappedLines = doc.splitTextToSize(line, maxWidth);
          for (const wrappedLine of wrappedLines) {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 30;
            }
            doc.text(wrappedLine, margin, yPosition);
            yPosition += lineHeight;
          }
        } else {
          yPosition += lineHeight / 2;
        }
      }

      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Pagina ${i} van ${totalPages}`, pageWidth - margin - 30, 290);
        doc.text('Gegenereerd door Hysio Medical Scribe', margin, 290);
      }

      const pdfArrayBuffer = doc.output('arraybuffer');
      const pdfFilename = filename.replace(/\.[^.]+$/, '.pdf');

      return {
        success: true,
        data: pdfArrayBuffer,
        filename: pdfFilename,
        mimeType: 'application/pdf',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: 'PDF generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Export as DOCX using docx library
   */
  private static async exportAsDocx(
    content: string,
    filename: string,
    metadata?: DocumentMetadata
  ): Promise<ExportResult> {
    try {
      const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } = await import('docx');

      const children = [];

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: metadata?.title || 'HYSIO MEDICAL SCRIBE',
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        })
      );

      if (metadata?.subtitle) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: metadata.subtitle,
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          })
        );
      }

      if (metadata?.patientName) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Patiënt: ${metadata.patientName}`,
                size: 20,
              }),
            ],
          })
        );
      }

      if (metadata?.date) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Datum: ${metadata.date}`,
                size: 20,
              }),
            ],
          })
        );
      }

      if (metadata?.sessionId) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Sessie ID: ${metadata.sessionId}`,
                size: 16,
              }),
            ],
          })
        );
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '═══════════════════════════════════════════════════════════════',
              size: 16,
            }),
          ],
        }),
        new Paragraph({ text: '' })
      );

      const sections = content.split('\n\n');

      for (const section of sections) {
        if (!section.trim()) continue;

        const lines = section.split('\n');
        const firstLine = lines[0];
        const isHeader = firstLine && (
          firstLine === firstLine.toUpperCase() ||
          firstLine.includes('═') ||
          firstLine.includes('─')
        );

        if (isHeader && !firstLine.includes('═') && !firstLine.includes('─')) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: firstLine,
                  bold: true,
                  size: 22,
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            })
          );

          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: lines[i],
                      size: 20,
                    }),
                  ],
                })
              );
            } else {
              children.push(new Paragraph({ text: '' }));
            }
          }
        } else if (firstLine.includes('═') || firstLine.includes('─')) {
          children.push(new Paragraph({ text: '' }));
        } else {
          for (const line of lines) {
            if (line.trim()) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      size: 20,
                    }),
                  ],
                })
              );
            } else {
              children.push(new Paragraph({ text: '' }));
            }
          }
        }

        children.push(new Paragraph({ text: '' }));
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '═══════════════════════════════════════════════════════════════',
              size: 16,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Gegenereerd door Hysio Medical Scribe',
              italics: true,
              size: 18,
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );

      if (metadata?.footer) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: metadata.footer,
                italics: true,
                size: 16,
              }),
            ],
            alignment: AlignmentType.CENTER,
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            children: children,
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);
      const docxFilename = filename.replace(/\.[^.]+$/, '.docx');

      return {
        success: true,
        data: buffer,
        filename: docxFilename,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        mimeType: '',
        error: 'DOCX generation failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
    }
  }

  /**
   * Download exported file in browser
   */
  static downloadFile(result: ExportResult): void {
    if (!result.success || !result.data) {
      console.error('Cannot download file:', result.error);
      return;
    }

    let blob: Blob;

    if (result.data instanceof ArrayBuffer) {
      blob = new Blob([result.data], { type: result.mimeType });
    } else if (typeof result.data === 'string') {
      blob = new Blob([result.data], { type: result.mimeType });
    } else {
      blob = new Blob([result.data], { type: result.mimeType });
    }

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Date formatting utilities
   */
  static formatDate(dateString: string): string {
    if (!dateString) return 'Niet opgegeven';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  static formatDateTime(dateString: string): string {
    if (!dateString) return 'Niet opgegeven';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Filename sanitization
   */
  static sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Generate standardized filename
   */
  static generateFilename(
    type: string,
    patientIdentifier: string,
    date?: string,
    extension?: string
  ): string {
    const sanitizedPatient = this.sanitizeFilename(patientIdentifier);
    const dateStr = date || new Date().toISOString().split('T')[0];
    const ext = extension || 'txt';

    return `hysio_${type}_${sanitizedPatient}_${dateStr}.${ext}`;
  }

  /**
   * Calculate session duration
   */
  static calculateDuration(startTime: string, endTime?: string): string {
    if (!startTime) return 'Onbekend';

    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();

    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}u ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Calculate age from birth year
   */
  static calculateAge(birthYear: string): number | null {
    if (!birthYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear);
  }
}