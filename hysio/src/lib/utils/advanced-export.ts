'use client';

import type { PatientInfo, AnamneseResult, OnderzoekResult, KlinischeConclusieResult, ConsultResult } from '@/types/api';
import { exportHistoryManager } from './export-history';

export type ExportFormat = 'html' | 'txt' | 'docx' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includePatientInfo?: boolean;
  includeTimestamp?: boolean;
  includeRedFlags?: boolean;
  template?: 'standard' | 'detailed' | 'summary';
  customHeader?: string;
  customFooter?: string;
  onProgress?: (progress: ExportProgress) => void;

  // Advanced customization options
  language?: 'nl' | 'en';
  dateFormat?: 'european' | 'american' | 'iso';
  includeExportMetadata?: boolean;
  customFileName?: string;
  pageSize?: 'a4' | 'letter' | 'a3';
  orientation?: 'portrait' | 'landscape';
  fontSize?: 'small' | 'medium' | 'large';
  colorScheme?: 'default' | 'monochrome' | 'high-contrast';
  sectionSeparator?: 'line' | 'space' | 'page-break';
  includeTableOfContents?: boolean;
  watermark?: string;
}

export interface ExportProgress {
  stage: string;
  percentage: number;
  currentStep?: string;
  estimatedTimeRemaining?: number;
}

export interface ExportData {
  patientInfo?: PatientInfo;
  anamneseResult?: AnamneseResult;
  onderzoekResult?: OnderzoekResult;
  klinischeConclusieResult?: KlinischeConclusieResult;
  consultResult?: ConsultResult;
  metadata?: {
    exportedAt: string;
    exportedBy: string;
    sessionId?: string;
    workflowType: string;
  };
}

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'html',
  includePatientInfo: true,
  includeTimestamp: true,
  includeRedFlags: true,
  template: 'standard',

  // Advanced defaults
  language: 'nl',
  dateFormat: 'european',
  includeExportMetadata: true,
  pageSize: 'a4',
  orientation: 'portrait',
  fontSize: 'medium',
  colorScheme: 'default',
  sectionSeparator: 'line',
  includeTableOfContents: false,
};

export class AdvancedExportManager {
  private static instance: AdvancedExportManager;

  static getInstance(): AdvancedExportManager {
    if (!AdvancedExportManager.instance) {
      AdvancedExportManager.instance = new AdvancedExportManager();
    }
    return AdvancedExportManager.instance;
  }

  /**
   * Validation and Error Handling Methods
   */

  /**
   * Validate export format
   */
  private validateFormat(format: ExportFormat): void {
    const validFormats: ExportFormat[] = ['html', 'txt', 'docx', 'pdf'];
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid export format: ${format}. Supported formats: ${validFormats.join(', ')}`);
    }
  }

  /**
   * Validate patient info
   */
  private validatePatientInfo(patientInfo: PatientInfo): void {
    if (!patientInfo) {
      throw new Error('Patient information is required for export');
    }

    if (!patientInfo.initials || patientInfo.initials.trim() === '') {
      throw new Error('Patient initials are required for export');
    }

    // Validate birth year if provided
    if (patientInfo.birthYear) {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(patientInfo.birthYear);
      if (isNaN(birthYear) || birthYear < 1900 || birthYear > currentYear) {
        throw new Error('Invalid birth year provided');
      }
    }
  }

  /**
   * Validate SOEP data
   */
  private validateSOEPData(consultResult: ConsultResult): void {
    if (!consultResult) {
      throw new Error('Consult result data is required for SOEP export');
    }

    if (!consultResult.soepStructure) {
      throw new Error('SOEP structure is missing from consult result');
    }

    const soep = consultResult.soepStructure;
    const missingSections: string[] = [];

    if (!soep.subjectief || soep.subjectief.trim() === '') {
      missingSections.push('Subjectief');
    }
    if (!soep.objectief || soep.objectief.trim() === '') {
      missingSections.push('Objectief');
    }
    if (!soep.evaluatie || soep.evaluatie.trim() === '') {
      missingSections.push('Evaluatie');
    }
    if (!soep.plan || soep.plan.trim() === '') {
      missingSections.push('Plan');
    }

    if (missingSections.length > 0) {
      console.warn(`Warning: Missing SOEP sections: ${missingSections.join(', ')}`);
    }
  }

  /**
   * Validate stepwise intake data
   */
  private validateStepwiseData(
    anamneseResult: AnamneseResult,
    onderzoekResult: OnderzoekResult,
    klinischeConclusieResult: KlinischeConclusieResult
  ): void {
    if (!anamneseResult && !onderzoekResult && !klinischeConclusieResult) {
      throw new Error('At least one step result is required for stepwise intake export');
    }

    if (anamneseResult && !anamneseResult.hhsbAnamneseCard) {
      console.warn('Warning: Anamnese result missing HHSB structure');
    }

    if (onderzoekResult && !onderzoekResult.examinationFindings) {
      console.warn('Warning: Onderzoek result missing examination findings');
    }

    if (klinischeConclusieResult && !klinischeConclusieResult.clinicalConclusion) {
      console.warn('Warning: Clinical conclusion result missing conclusion data');
    }
  }

  /**
   * Validate export options
   */
  private validateExportOptions(options: ExportOptions): void {
    if (options.format) {
      this.validateFormat(options.format);
    }

    const booleanOptions = ['includePatientInfo', 'includeRedFlags', 'includeTimestamp', 'includeExportMetadata', 'includeTableOfContents'];
    booleanOptions.forEach(option => {
      if (options[option as keyof ExportOptions] !== undefined &&
          typeof options[option as keyof ExportOptions] !== 'boolean') {
        throw new Error(`Option '${option}' must be a boolean value`);
      }
    });

    // Validate enum options
    if (options.language && !['nl', 'en'].includes(options.language)) {
      throw new Error(`Invalid language: ${options.language}. Supported languages: nl, en`);
    }

    if (options.dateFormat && !['european', 'american', 'iso'].includes(options.dateFormat)) {
      throw new Error(`Invalid date format: ${options.dateFormat}. Supported formats: european, american, iso`);
    }

    if (options.template && !['standard', 'detailed', 'summary'].includes(options.template)) {
      throw new Error(`Invalid template: ${options.template}. Supported templates: standard, detailed, summary`);
    }

    if (options.pageSize && !['a4', 'letter', 'a3'].includes(options.pageSize)) {
      throw new Error(`Invalid page size: ${options.pageSize}. Supported sizes: a4, letter, a3`);
    }

    if (options.orientation && !['portrait', 'landscape'].includes(options.orientation)) {
      throw new Error(`Invalid orientation: ${options.orientation}. Supported orientations: portrait, landscape`);
    }

    if (options.fontSize && !['small', 'medium', 'large'].includes(options.fontSize)) {
      throw new Error(`Invalid font size: ${options.fontSize}. Supported sizes: small, medium, large`);
    }

    if (options.colorScheme && !['default', 'monochrome', 'high-contrast'].includes(options.colorScheme)) {
      throw new Error(`Invalid color scheme: ${options.colorScheme}. Supported schemes: default, monochrome, high-contrast`);
    }

    if (options.sectionSeparator && !['line', 'space', 'page-break'].includes(options.sectionSeparator)) {
      throw new Error(`Invalid section separator: ${options.sectionSeparator}. Supported separators: line, space, page-break`);
    }
  }

  /**
   * Sanitize text content for HTML/RTF output
   */
  private sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\\/g, '\\\\')  // Escape backslashes for RTF
      .replace(/{/g, '\\{')     // Escape curly braces for RTF
      .replace(/}/g, '\\}')     // Escape curly braces for RTF
      .trim();
  }

  /**
   * Handle export errors
   */
  private handleExportError(error: unknown, context: string): never {
    console.error(`Export error in ${context}:`, error);

    if (error instanceof Error) {
      throw new Error(`Export failed (${context}): ${error.message}`);
    }

    throw new Error(`Export failed (${context}): Unknown error occurred`);
  }

  /**
   * Progress tracking helper methods
   */
  private reportProgress(options: ExportOptions, stage: string, percentage: number, currentStep?: string): void {
    if (options.onProgress) {
      const progress: ExportProgress = {
        stage,
        percentage: Math.min(100, Math.max(0, percentage)),
        currentStep,
        estimatedTimeRemaining: this.estimateTimeRemaining(percentage)
      };

      try {
        options.onProgress(progress);
      } catch (error) {
        console.warn('Error in progress callback:', error);
      }
    }
  }

  private estimateTimeRemaining(percentage: number): number {
    if (percentage >= 100) return 0;
    if (percentage <= 0) return 0;

    // Simple estimation: assume linear progress and estimate based on current rate
    // In a real implementation, you might track start time and calculate more accurately
    const estimatedTotalTime = 5000; // 5 seconds for typical export
    const remainingPercentage = 100 - percentage;
    return Math.round((remainingPercentage / 100) * estimatedTotalTime);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export SOEP consultation results
   */
  async exportSOEP(
    consultResult: ConsultResult,
    patientInfo: PatientInfo,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    const startTime = Date.now();

    try {
      const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

      // Report progress: Starting export
      this.reportProgress(opts, 'Initializing', 0, 'Starting SOEP export');

      // Validate inputs
      this.reportProgress(opts, 'Validating', 10, 'Validating export options');
      this.validateExportOptions(opts);
      this.reportProgress(opts, 'Validating', 20, 'Validating patient information');
      this.validatePatientInfo(patientInfo);
      this.reportProgress(opts, 'Validating', 30, 'Validating SOEP data');
      this.validateSOEPData(consultResult);

      // Prepare export data
      this.reportProgress(opts, 'Preparing', 40, 'Preparing export data');
      const exportData: ExportData = {
        patientInfo,
        consultResult,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Hysio Medical Scribe v7.0',
          workflowType: 'consult'
        }
      };

      // Generate document
      this.reportProgress(opts, 'Generating', 50, `Generating ${opts.format.toUpperCase()} document`);

      let result: Blob;
      switch (opts.format) {
        case 'html':
          result = this.generateSOEPHTML(exportData, opts);
          break;
        case 'txt':
          result = this.generateSOEPText(exportData, opts);
          break;
        case 'docx':
          result = this.generateSOEPDocx(exportData, opts);
          break;
        case 'pdf':
          result = this.generateSOEPPDF(exportData, opts);
          break;
        default:
          throw new Error(`Unsupported export format: ${opts.format}`);
      }

      // Record successful export in history
      const duration = Date.now() - startTime;
      const fileName = opts.customFileName || this.generateFileName('SOEP-verslag', patientInfo, opts);

      try {
        exportHistoryManager.addExportEntry(
          patientInfo,
          'consult',
          opts.format,
          fileName,
          result,
          opts,
          duration
        );
      } catch (historyError) {
        console.warn('Failed to record export in history:', historyError);
      }

      // Finalize
      this.reportProgress(opts, 'Finalizing', 90, 'Finalizing export');
      await this.delay(100); // Small delay to show progress
      this.reportProgress(opts, 'Complete', 100, 'Export completed successfully');

      return result;
    } catch (error) {
      // Record failed export in history
      const duration = Date.now() - startTime;
      const fileName = options.customFileName || this.generateFileName('SOEP-verslag', patientInfo, { format: options.format || 'html' });

      try {
        exportHistoryManager.recordExportFailure(
          patientInfo,
          'consult',
          options.format || 'html',
          fileName,
          { ...DEFAULT_EXPORT_OPTIONS, ...options },
          error instanceof Error ? error.message : 'Unknown error',
          duration
        );
      } catch (historyError) {
        console.warn('Failed to record export failure in history:', historyError);
      }

      this.handleExportError(error, 'SOEP export');
    }
  }

  /**
   * Generate filename for export
   */
  private generateFileName(type: string, patientInfo: PatientInfo, options: ExportOptions): string {
    const format = options.format || 'html';
    const extension = this.getFileExtension(format);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const patientId = patientInfo.initials || 'Patient';

    return `${type}_${patientId}_${timestamp}.${extension}`;
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'html': return 'html';
      case 'txt': return 'txt';
      case 'docx': return 'docx';
      case 'pdf': return 'pdf';
      default: return 'html';
    }
  }

  /**
   * Export step-by-step intake results
   */
  async exportStepwiseIntake(
    anamneseResult: AnamneseResult,
    onderzoekResult: OnderzoekResult,
    klinischeConclusieResult: KlinischeConclusieResult,
    patientInfo: PatientInfo,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    try {
      const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

      // Report progress: Starting export
      this.reportProgress(opts, 'Initializing', 0, 'Starting stepwise intake export');

      // Validate inputs
      this.reportProgress(opts, 'Validating', 15, 'Validating export options');
      this.validateExportOptions(opts);
      this.reportProgress(opts, 'Validating', 25, 'Validating patient information');
      this.validatePatientInfo(patientInfo);
      this.reportProgress(opts, 'Validating', 35, 'Validating stepwise data');
      this.validateStepwiseData(anamneseResult, onderzoekResult, klinischeConclusieResult);

      // Prepare export data
      this.reportProgress(opts, 'Preparing', 45, 'Preparing export data');
      const exportData: ExportData = {
        patientInfo,
        anamneseResult,
        onderzoekResult,
        klinischeConclusieResult,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Hysio Medical Scribe v7.0',
          workflowType: 'intake-stapsgewijs'
        }
      };

      // Generate document
      this.reportProgress(opts, 'Generating', 55, `Generating ${opts.format.toUpperCase()} document`);

      let result: Blob;
      switch (opts.format) {
        case 'html':
          result = this.generateStepwiseHTML(exportData, opts);
          break;
        case 'txt':
          result = this.generateStepwiseText(exportData, opts);
          break;
        case 'docx':
          result = this.generateStepwiseDocx(exportData, opts);
          break;
        case 'pdf':
          result = this.generateStepwisePDF(exportData, opts);
          break;
        default:
          throw new Error(`Unsupported export format: ${opts.format}`);
      }

      // Finalize
      this.reportProgress(opts, 'Finalizing', 90, 'Finalizing export');
      await this.delay(100);
      this.reportProgress(opts, 'Complete', 100, 'Export completed successfully');

      return result;
    } catch (error) {
      this.handleExportError(error, 'Stepwise intake export');
    }
  }

  /**
   * Export automated intake results
   */
  async exportAutomatedIntake(
    intakeResult: any,
    patientInfo: PatientInfo,
    options: Partial<ExportOptions> = {}
  ): Promise<Blob> {
    try {
      const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

      // Validate inputs
      this.validateExportOptions(opts);
      this.validatePatientInfo(patientInfo);

      if (!intakeResult) {
        throw new Error('Intake result data is required for automated intake export');
      }

      const exportData: ExportData = {
        patientInfo,
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'Hysio Medical Scribe v7.0',
          workflowType: 'intake-automatisch'
        }
      };

      // Add intake result data
      if (intakeResult?.hhsbAnamneseCard) {
        exportData.anamneseResult = { hhsbAnamneseCard: intakeResult.hhsbAnamneseCard };
      }
      if (intakeResult?.onderzoeksBevindingen) {
        exportData.onderzoekResult = { examinationFindings: intakeResult.onderzoeksBevindingen };
      }
      if (intakeResult?.klinischeConclusie) {
        exportData.klinischeConclusieResult = { clinicalConclusion: intakeResult.klinischeConclusie };
      }

      switch (opts.format) {
        case 'html':
          return this.generateAutomatedIntakeHTML(exportData, opts);
        case 'txt':
          return this.generateAutomatedIntakeText(exportData, opts);
        case 'docx':
          return this.generateAutomatedIntakeDocx(exportData, opts);
        case 'pdf':
          return this.generateAutomatedIntakePDF(exportData, opts);
        default:
          throw new Error(`Unsupported export format: ${opts.format}`);
      }
    } catch (error) {
      this.handleExportError(error, 'Automated intake export');
    }
  }

  // SOEP Export Methods
  private generateSOEPHTML(data: ExportData, options: ExportOptions): Blob {
    const { consultResult, patientInfo, metadata } = data;

    let html = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOEP Verslag - ${patientInfo?.initials || 'Patiënt'}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
            background: #f9f9f9;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 3px solid #2d5a27;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2d5a27;
            margin: 0;
            font-size: 28px;
        }
        .patient-info {
            background: #f0f8f0;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
            border-left: 4px solid #2d5a27;
        }
        .soep-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
        }
        .soep-section h2 {
            color: #2d5a27;
            border-bottom: 2px solid #a8d8a8;
            padding-bottom: 10px;
            font-size: 20px;
        }
        .soep-content {
            white-space: pre-wrap;
            background: #fafafa;
            padding: 15px;
            border-radius: 4px;
            border-left: 3px solid #2d5a27;
        }
        .red-flags {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
        }
        .red-flags h3 {
            color: #c53030;
            margin-top: 0;
        }
        .metadata {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { margin: 0; background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">`;

    // Header
    if (options.customHeader) {
      html += `<div class="custom-header">${options.customHeader}</div>`;
    }

    html += `
        <div class="header">
            <h1>SOEP Vervolgconsult Verslag</h1>
            ${options.includeTimestamp ? `<p>Gegenereerd op: ${new Date().toLocaleString('nl-NL')}</p>` : ''}
        </div>`;

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      html += `
        <div class="patient-info">
            <h2>Patiëntgegevens</h2>
            <p><strong>Initialen:</strong> ${patientInfo.initials || 'N/A'}</p>
            <p><strong>Geboortejaar:</strong> ${patientInfo.birthYear || 'N/A'}</p>
            <p><strong>Geslacht:</strong> ${patientInfo.gender || 'N/A'}</p>
            ${patientInfo.chiefComplaint ? `<p><strong>Hoofdklacht:</strong> ${patientInfo.chiefComplaint}</p>` : ''}
        </div>`;
    }

    // SOEP Structure
    if (consultResult?.soepStructure) {
      const soep = consultResult.soepStructure;

      if (soep.subjectief) {
        html += `
          <div class="soep-section">
              <h2>🗣️ Subjectief</h2>
              <div class="soep-content">${soep.subjectief}</div>
          </div>`;
      }

      if (soep.objectief) {
        html += `
          <div class="soep-section">
              <h2>🔍 Objectief</h2>
              <div class="soep-content">${soep.objectief}</div>
          </div>`;
      }

      if (soep.evaluatie) {
        html += `
          <div class="soep-section">
              <h2>📊 Evaluatie</h2>
              <div class="soep-content">${soep.evaluatie}</div>
          </div>`;
      }

      if (soep.plan) {
        html += `
          <div class="soep-section">
              <h2>📋 Plan</h2>
              <div class="soep-content">${soep.plan}</div>
          </div>`;
      }
    }

    // Red Flags
    if (options.includeRedFlags && consultResult?.redFlags && consultResult.redFlags.length > 0) {
      html += `
        <div class="red-flags">
            <h3>⚠️ Red Flags</h3>
            <ul>`;
      consultResult.redFlags.forEach(flag => {
        html += `<li>${flag}</li>`;
      });
      html += `
            </ul>
        </div>`;
    }

    // Custom Footer
    if (options.customFooter) {
      html += `<div class="custom-footer">${options.customFooter}</div>`;
    }

    // Metadata
    if (metadata) {
      html += `
        <div class="metadata">
            <p>Gegenereerd door: ${metadata.exportedBy}</p>
            <p>Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}</p>
            <p>Workflow type: ${metadata.workflowType}</p>
        </div>`;
    }

    html += `
    </div>
</body>
</html>`;

    return new Blob([html], { type: 'text/html;charset=utf-8' });
  }

  private generateSOEPText(data: ExportData, options: ExportOptions): Blob {
    const { consultResult, patientInfo, metadata } = data;
    let text = '';

    // Header
    text += 'SOEP VERVOLGCONSULT VERSLAG\n';
    text += '='.repeat(50) + '\n\n';

    if (options.includeTimestamp) {
      text += `Gegenereerd op: ${new Date().toLocaleString('nl-NL')}\n\n`;
    }

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      text += 'PATIËNTGEGEVENS\n';
      text += '-'.repeat(20) + '\n';
      text += `Initialen: ${patientInfo.initials || 'N/A'}\n`;
      text += `Geboortejaar: ${patientInfo.birthYear || 'N/A'}\n`;
      text += `Geslacht: ${patientInfo.gender || 'N/A'}\n`;
      if (patientInfo.chiefComplaint) {
        text += `Hoofdklacht: ${patientInfo.chiefComplaint}\n`;
      }
      text += '\n';
    }

    // SOEP Structure
    if (consultResult?.soepStructure) {
      const soep = consultResult.soepStructure;

      if (soep.subjectief) {
        text += 'SUBJECTIEF\n';
        text += '-'.repeat(15) + '\n';
        text += `${soep.subjectief}\n\n`;
      }

      if (soep.objectief) {
        text += 'OBJECTIEF\n';
        text += '-'.repeat(15) + '\n';
        text += `${soep.objectief}\n\n`;
      }

      if (soep.evaluatie) {
        text += 'EVALUATIE\n';
        text += '-'.repeat(15) + '\n';
        text += `${soep.evaluatie}\n\n`;
      }

      if (soep.plan) {
        text += 'PLAN\n';
        text += '-'.repeat(15) + '\n';
        text += `${soep.plan}\n\n`;
      }
    }

    // Red Flags
    if (options.includeRedFlags && consultResult?.redFlags && consultResult.redFlags.length > 0) {
      text += 'RED FLAGS\n';
      text += '-'.repeat(15) + '\n';
      consultResult.redFlags.forEach((flag, index) => {
        text += `${index + 1}. ${flag}\n`;
      });
      text += '\n';
    }

    // Metadata
    if (metadata) {
      text += '='.repeat(50) + '\n';
      text += `Gegenereerd door: ${metadata.exportedBy}\n`;
      text += `Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}\n`;
      text += `Workflow type: ${metadata.workflowType}\n`;
    }

    return new Blob([text], { type: 'text/plain;charset=utf-8' });
  }

  private generateSOEPDocx(data: ExportData, options: ExportOptions): Blob {
    // Create RTF format content that can be opened by Word
    const { consultResult, patientInfo, metadata } = data;
    let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24';

    // Header
    rtfContent += '\\b SOEP VERVOLGCONSULT VERSLAG\\b0\\par\\par';

    if (options.includeTimestamp) {
      rtfContent += `Gegenereerd op: ${new Date().toLocaleString('nl-NL')}\\par\\par`;
    }

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      rtfContent += '\\b PATIËNTGEGEVENS\\b0\\par';
      rtfContent += `Initialen: ${this.sanitizeText(patientInfo.initials || 'N/A')}\\par`;
      rtfContent += `Geboortejaar: ${this.sanitizeText(patientInfo.birthYear || 'N/A')}\\par`;
      rtfContent += `Geslacht: ${this.sanitizeText(patientInfo.gender || 'N/A')}\\par`;
      if (patientInfo.chiefComplaint) {
        rtfContent += `Hoofdklacht: ${this.sanitizeText(patientInfo.chiefComplaint)}\\par`;
      }
      rtfContent += '\\par';
    }

    // SOEP Structure
    if (consultResult?.soepStructure) {
      const soep = consultResult.soepStructure;

      if (soep.subjectief) {
        rtfContent += '\\b SUBJECTIEF\\b0\\par';
        rtfContent += `${this.sanitizeText(soep.subjectief)}\\par\\par`;
      }

      if (soep.objectief) {
        rtfContent += '\\b OBJECTIEF\\b0\\par';
        rtfContent += `${this.sanitizeText(soep.objectief)}\\par\\par`;
      }

      if (soep.evaluatie) {
        rtfContent += '\\b EVALUATIE\\b0\\par';
        rtfContent += `${this.sanitizeText(soep.evaluatie)}\\par\\par`;
      }

      if (soep.plan) {
        rtfContent += '\\b PLAN\\b0\\par';
        rtfContent += `${this.sanitizeText(soep.plan)}\\par\\par`;
      }
    }

    // Red Flags
    if (options.includeRedFlags && consultResult?.redFlags && consultResult.redFlags.length > 0) {
      rtfContent += '\\b RED FLAGS\\b0\\par';
      consultResult.redFlags.forEach((flag, index) => {
        rtfContent += `${index + 1}. ${this.sanitizeText(flag)}\\par`;
      });
      rtfContent += '\\par';
    }

    // Metadata
    if (metadata) {
      rtfContent += '\\line\\line';
      rtfContent += `Gegenereerd door: ${this.sanitizeText(metadata.exportedBy)}\\par`;
      rtfContent += `Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}\\par`;
      rtfContent += `Workflow type: ${this.sanitizeText(metadata.workflowType)}\\par`;
    }

    rtfContent += '}';

    return new Blob([rtfContent], { type: 'application/rtf' });
  }

  private generateSOEPPDF(data: ExportData, options: ExportOptions): Blob {
    // Generate HTML optimized for PDF printing
    const { consultResult, patientInfo, metadata } = data;

    let html = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>SOEP Verslag - ${patientInfo?.initials || 'Patiënt'}</title>
    <style>
        @page {
            margin: 2cm;
            size: A4;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #000;
            margin: 0;
            font-size: 18pt;
        }
        .patient-info {
            background-color: #f5f5f5;
            padding: 10px;
            border: 1px solid #ccc;
            margin-bottom: 15px;
        }
        .soep-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .soep-section h2 {
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            font-size: 14pt;
            margin: 15px 0 10px 0;
        }
        .soep-content {
            background-color: #fafafa;
            padding: 10px;
            border-left: 3px solid #333;
            white-space: pre-wrap;
        }
        .red-flags {
            background-color: #fff0f0;
            border: 1px solid #ffcccc;
            padding: 10px;
            margin-top: 15px;
        }
        .red-flags h3 {
            color: #cc0000;
            margin-top: 0;
        }
        .metadata {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 10pt;
            color: #666;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>`;

    // Header
    html += `
    <div class="header">
        <h1>SOEP Vervolgconsult Verslag</h1>
        ${options.includeTimestamp ? `<p>Gegenereerd op: ${new Date().toLocaleString('nl-NL')}</p>` : ''}
    </div>`;

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      html += `
    <div class="patient-info">
        <h2>Patiëntgegevens</h2>
        <p><strong>Initialen:</strong> ${this.sanitizeText(patientInfo.initials || 'N/A')}</p>
        <p><strong>Geboortejaar:</strong> ${this.sanitizeText(patientInfo.birthYear || 'N/A')}</p>
        <p><strong>Geslacht:</strong> ${this.sanitizeText(patientInfo.gender || 'N/A')}</p>
        ${patientInfo.chiefComplaint ? `<p><strong>Hoofdklacht:</strong> ${this.sanitizeText(patientInfo.chiefComplaint)}</p>` : ''}
    </div>`;
    }

    // SOEP Structure
    if (consultResult?.soepStructure) {
      const soep = consultResult.soepStructure;

      if (soep.subjectief) {
        html += `
      <div class="soep-section">
          <h2>Subjectief</h2>
          <div class="soep-content">${this.sanitizeText(soep.subjectief)}</div>
      </div>`;
      }

      if (soep.objectief) {
        html += `
      <div class="soep-section">
          <h2>Objectief</h2>
          <div class="soep-content">${this.sanitizeText(soep.objectief)}</div>
      </div>`;
      }

      if (soep.evaluatie) {
        html += `
      <div class="soep-section">
          <h2>Evaluatie</h2>
          <div class="soep-content">${this.sanitizeText(soep.evaluatie)}</div>
      </div>`;
      }

      if (soep.plan) {
        html += `
      <div class="soep-section">
          <h2>Plan</h2>
          <div class="soep-content">${this.sanitizeText(soep.plan)}</div>
      </div>`;
      }
    }

    // Red Flags
    if (options.includeRedFlags && consultResult?.redFlags && consultResult.redFlags.length > 0) {
      html += `
    <div class="red-flags">
        <h3>Red Flags</h3>
        <ul>`;
      consultResult.redFlags.forEach(flag => {
        html += `<li>${this.sanitizeText(flag)}</li>`;
      });
      html += `
        </ul>
    </div>`;
    }

    // Metadata
    if (metadata) {
      html += `
    <div class="metadata">
        <p>Gegenereerd door: ${this.sanitizeText(metadata.exportedBy)}</p>
        <p>Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}</p>
        <p>Workflow type: ${this.sanitizeText(metadata.workflowType)}</p>
    </div>`;
    }

    html += `
</body>
</html>`;

    // Create a blob that will trigger the browser's print dialog
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

    // In a real environment, you would typically:
    // 1. Open this HTML in a new window
    // 2. Trigger the browser's print dialog
    // 3. User selects "Save as PDF" as the destination

    return blob;
  }

  // Stepwise Intake Export Methods
  private generateStepwiseHTML(data: ExportData, options: ExportOptions): Blob {
    const { anamneseResult, onderzoekResult, klinischeConclusieResult, patientInfo, metadata } = data;

    let html = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stapsgewijze Intake - ${patientInfo?.initials || 'Patiënt'}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
            background: #f9f9f9;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 3px solid #2d5a27;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2d5a27;
            margin: 0;
            font-size: 28px;
        }
        .patient-info {
            background: #f0f8f0;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 25px;
            border-left: 4px solid #2d5a27;
        }
        .step-section {
            margin-bottom: 40px;
            padding: 25px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: #fafafa;
        }
        .step-section h2 {
            color: #2d5a27;
            border-bottom: 2px solid #a8d8a8;
            padding-bottom: 10px;
            font-size: 22px;
            margin-top: 0;
        }
        .hhsb-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }
        .hhsb-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #2d5a27;
        }
        .hhsb-item h4 {
            color: #2d5a27;
            margin-top: 0;
            margin-bottom: 10px;
        }
        .content-block {
            white-space: pre-wrap;
            background: white;
            padding: 15px;
            border-radius: 4px;
            border-left: 3px solid #2d5a27;
            margin-top: 10px;
        }
        .red-flags {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
        }
        .red-flags h3 {
            color: #c53030;
            margin-top: 0;
        }
        .metadata {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
        }
        @media print {
            body { margin: 0; background: white; }
            .container { box-shadow: none; }
            .hhsb-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">`;

    // Header
    html += `
        <div class="header">
            <h1>Stapsgewijze Intake Verslag</h1>
            ${options.includeTimestamp ? `<p>Gegenereerd op: ${new Date().toLocaleString('nl-NL')}</p>` : ''}
        </div>`;

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      html += `
        <div class="patient-info">
            <h2>Patiëntgegevens</h2>
            <p><strong>Initialen:</strong> ${patientInfo.initials || 'N/A'}</p>
            <p><strong>Geboortejaar:</strong> ${patientInfo.birthYear || 'N/A'}</p>
            <p><strong>Geslacht:</strong> ${patientInfo.gender || 'N/A'}</p>
            ${patientInfo.chiefComplaint ? `<p><strong>Hoofdklacht:</strong> ${patientInfo.chiefComplaint}</p>` : ''}
        </div>`;
    }

    // Anamnese Section (HHSB)
    if (anamneseResult?.hhsbAnamneseCard) {
      const hhsb = anamneseResult.hhsbAnamneseCard;
      html += `
        <div class="step-section">
            <h2>📋 Anamnese (HHSB)</h2>
            <div class="hhsb-grid">`;

      if (hhsb.hulpvraag) {
        html += `
          <div class="hhsb-item">
              <h4>Hulpvraag</h4>
              <div>${hhsb.hulpvraag}</div>
          </div>`;
      }

      if (hhsb.historie) {
        html += `
          <div class="hhsb-item">
              <h4>Historie</h4>
              <div>${hhsb.historie}</div>
          </div>`;
      }

      if (hhsb.stoornissen) {
        html += `
          <div class="hhsb-item">
              <h4>Stoornissen</h4>
              <div>${hhsb.stoornissen}</div>
          </div>`;
      }

      if (hhsb.beperkingen) {
        html += `
          <div class="hhsb-item">
              <h4>Beperkingen</h4>
              <div>${hhsb.beperkingen}</div>
          </div>`;
      }

      if (hhsb.anamneseSummary) {
        html += `
          <div class="hhsb-item" style="grid-column: 1 / -1;">
              <h4>Samenvatting Anamnese</h4>
              <div>${hhsb.anamneseSummary}</div>
          </div>`;
      }

      html += `</div>`;

      // Red flags for anamnese
      if (options.includeRedFlags && anamneseResult.redFlags && anamneseResult.redFlags.length > 0) {
        html += `
          <div class="red-flags">
              <h3>⚠️ Red Flags (Anamnese)</h3>
              <ul>`;
        anamneseResult.redFlags.forEach(flag => {
          html += `<li>${flag}</li>`;
        });
        html += `
              </ul>
          </div>`;
      }

      html += `</div>`;
    }

    // Onderzoek Section
    if (onderzoekResult?.examinationFindings) {
      const findings = onderzoekResult.examinationFindings;
      html += `
        <div class="step-section">
            <h2>🔍 Onderzoek</h2>`;

      if (findings.physicalTests) {
        html += `
          <h3>Fysieke Testen</h3>
          <div class="content-block">${findings.physicalTests}</div>`;
      }

      if (findings.movements) {
        html += `
          <h3>Bewegingsonderzoek</h3>
          <div class="content-block">${findings.movements}</div>`;
      }

      if (findings.palpation) {
        html += `
          <h3>Palpatie</h3>
          <div class="content-block">${findings.palpation}</div>`;
      }

      // Red flags for onderzoek
      if (options.includeRedFlags && onderzoekResult.redFlags && onderzoekResult.redFlags.length > 0) {
        html += `
          <div class="red-flags">
              <h3>⚠️ Red Flags (Onderzoek)</h3>
              <ul>`;
        onderzoekResult.redFlags.forEach(flag => {
          html += `<li>${flag}</li>`;
        });
        html += `
              </ul>
          </div>`;
      }

      html += `</div>`;
    }

    // Klinische Conclusie Section
    if (klinischeConclusieResult?.clinicalConclusion) {
      const conclusion = klinischeConclusieResult.clinicalConclusion;
      html += `
        <div class="step-section">
            <h2>🎯 Klinische Conclusie</h2>`;

      if (conclusion.diagnosis) {
        html += `
          <h3>Diagnose</h3>
          <div class="content-block">${conclusion.diagnosis}</div>`;
      }

      if (conclusion.treatmentPlan) {
        html += `
          <h3>Behandelplan</h3>
          <div class="content-block">${conclusion.treatmentPlan}</div>`;
      }

      if (conclusion.followUp) {
        html += `
          <h3>Vervolgafspraken</h3>
          <div class="content-block">${conclusion.followUp}</div>`;
      }

      html += `</div>`;
    }

    // Metadata
    if (metadata) {
      html += `
        <div class="metadata">
            <p>Gegenereerd door: ${metadata.exportedBy}</p>
            <p>Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}</p>
            <p>Workflow type: ${metadata.workflowType}</p>
        </div>`;
    }

    html += `
    </div>
</body>
</html>`;

    return new Blob([html], { type: 'text/html;charset=utf-8' });
  }

  private generateStepwiseText(data: ExportData, options: ExportOptions): Blob {
    const { anamneseResult, onderzoekResult, klinischeConclusieResult, patientInfo, metadata } = data;
    let text = '';

    // Header
    text += 'STAPSGEWIJZE INTAKE VERSLAG\n';
    text += '='.repeat(50) + '\n\n';

    if (options.includeTimestamp) {
      text += `Gegenereerd op: ${new Date().toLocaleString('nl-NL')}\n\n`;
    }

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      text += 'PATIËNTGEGEVENS\n';
      text += '-'.repeat(20) + '\n';
      text += `Initialen: ${patientInfo.initials || 'N/A'}\n`;
      text += `Geboortejaar: ${patientInfo.birthYear || 'N/A'}\n`;
      text += `Geslacht: ${patientInfo.gender || 'N/A'}\n`;
      if (patientInfo.chiefComplaint) {
        text += `Hoofdklacht: ${patientInfo.chiefComplaint}\n`;
      }
      text += '\n';
    }

    // Anamnese (HHSB)
    if (anamneseResult?.hhsbAnamneseCard) {
      const hhsb = anamneseResult.hhsbAnamneseCard;
      text += 'ANAMNESE (HHSB)\n';
      text += '-'.repeat(25) + '\n';

      if (hhsb.hulpvraag) {
        text += `Hulpvraag:\n${hhsb.hulpvraag}\n\n`;
      }

      if (hhsb.historie) {
        text += `Historie:\n${hhsb.historie}\n\n`;
      }

      if (hhsb.stoornissen) {
        text += `Stoornissen:\n${hhsb.stoornissen}\n\n`;
      }

      if (hhsb.beperkingen) {
        text += `Beperkingen:\n${hhsb.beperkingen}\n\n`;
      }

      if (hhsb.anamneseSummary) {
        text += `Samenvatting Anamnese:\n${hhsb.anamneseSummary}\n\n`;
      }

      if (options.includeRedFlags && anamneseResult.redFlags && anamneseResult.redFlags.length > 0) {
        text += 'Red Flags (Anamnese):\n';
        anamneseResult.redFlags.forEach((flag, index) => {
          text += `${index + 1}. ${flag}\n`;
        });
        text += '\n';
      }
    }

    // Onderzoek
    if (onderzoekResult?.examinationFindings) {
      const findings = onderzoekResult.examinationFindings;
      text += 'ONDERZOEK\n';
      text += '-'.repeat(15) + '\n';

      if (findings.physicalTests) {
        text += `Fysieke Testen:\n${findings.physicalTests}\n\n`;
      }

      if (findings.movements) {
        text += `Bewegingsonderzoek:\n${findings.movements}\n\n`;
      }

      if (findings.palpation) {
        text += `Palpatie:\n${findings.palpation}\n\n`;
      }

      if (options.includeRedFlags && onderzoekResult.redFlags && onderzoekResult.redFlags.length > 0) {
        text += 'Red Flags (Onderzoek):\n';
        onderzoekResult.redFlags.forEach((flag, index) => {
          text += `${index + 1}. ${flag}\n`;
        });
        text += '\n';
      }
    }

    // Klinische Conclusie
    if (klinischeConclusieResult?.clinicalConclusion) {
      const conclusion = klinischeConclusieResult.clinicalConclusion;
      text += 'KLINISCHE CONCLUSIE\n';
      text += '-'.repeat(25) + '\n';

      if (conclusion.diagnosis) {
        text += `Diagnose:\n${conclusion.diagnosis}\n\n`;
      }

      if (conclusion.treatmentPlan) {
        text += `Behandelplan:\n${conclusion.treatmentPlan}\n\n`;
      }

      if (conclusion.followUp) {
        text += `Vervolgafspraken:\n${conclusion.followUp}\n\n`;
      }
    }

    // Metadata
    if (metadata) {
      text += '='.repeat(50) + '\n';
      text += `Gegenereerd door: ${metadata.exportedBy}\n`;
      text += `Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}\n`;
      text += `Workflow type: ${metadata.workflowType}\n`;
    }

    return new Blob([text], { type: 'text/plain;charset=utf-8' });
  }

  private generateStepwiseDocx(data: ExportData, options: ExportOptions): Blob {
    // Create RTF format content that can be opened by Word
    const { anamneseResult, onderzoekResult, klinischeConclusieResult, patientInfo, metadata } = data;
    let rtfContent = '{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24';

    // Header
    rtfContent += '\\b STAPSGEWIJZE INTAKE VERSLAG\\b0\\par\\par';

    if (options.includeTimestamp) {
      rtfContent += `Gegenereerd op: ${new Date().toLocaleString('nl-NL')}\\par\\par`;
    }

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      rtfContent += '\\b PATIËNTGEGEVENS\\b0\\par';
      rtfContent += `Initialen: ${this.sanitizeText(patientInfo.initials || 'N/A')}\\par`;
      rtfContent += `Geboortejaar: ${this.sanitizeText(patientInfo.birthYear || 'N/A')}\\par`;
      rtfContent += `Geslacht: ${this.sanitizeText(patientInfo.gender || 'N/A')}\\par`;
      if (patientInfo.chiefComplaint) {
        rtfContent += `Hoofdklacht: ${this.sanitizeText(patientInfo.chiefComplaint)}\\par`;
      }
      rtfContent += '\\par';
    }

    // Anamnese (HHSB)
    if (anamneseResult?.hhsbAnamneseCard) {
      const hhsb = anamneseResult.hhsbAnamneseCard;
      rtfContent += '\\b ANAMNESE (HHSB)\\b0\\par';

      if (hhsb.hulpvraag) {
        rtfContent += '\\b Hulpvraag:\\b0\\par';
        rtfContent += `${this.sanitizeText(hhsb.hulpvraag)}\\par\\par`;
      }

      if (hhsb.historie) {
        rtfContent += '\\b Historie:\\b0\\par';
        rtfContent += `${this.sanitizeText(hhsb.historie)}\\par\\par`;
      }

      if (hhsb.stoornissen) {
        rtfContent += '\\b Stoornissen:\\b0\\par';
        rtfContent += `${this.sanitizeText(hhsb.stoornissen)}\\par\\par`;
      }

      if (hhsb.beperkingen) {
        rtfContent += '\\b Beperkingen:\\b0\\par';
        rtfContent += `${this.sanitizeText(hhsb.beperkingen)}\\par\\par`;
      }

      if (hhsb.anamneseSummary) {
        rtfContent += '\\b Samenvatting Anamnese:\\b0\\par';
        rtfContent += `${this.sanitizeText(hhsb.anamneseSummary)}\\par\\par`;
      }

      if (options.includeRedFlags && anamneseResult.redFlags && anamneseResult.redFlags.length > 0) {
        rtfContent += '\\b Red Flags (Anamnese):\\b0\\par';
        anamneseResult.redFlags.forEach((flag, index) => {
          rtfContent += `${index + 1}. ${this.sanitizeText(flag)}\\par`;
        });
        rtfContent += '\\par';
      }
    }

    // Onderzoek
    if (onderzoekResult?.examinationFindings) {
      const findings = onderzoekResult.examinationFindings;
      rtfContent += '\\b ONDERZOEK\\b0\\par';

      if (findings.physicalTests) {
        rtfContent += '\\b Fysieke Testen:\\b0\\par';
        rtfContent += `${this.sanitizeText(findings.physicalTests)}\\par\\par`;
      }

      if (findings.movements) {
        rtfContent += '\\b Bewegingsonderzoek:\\b0\\par';
        rtfContent += `${this.sanitizeText(findings.movements)}\\par\\par`;
      }

      if (findings.palpation) {
        rtfContent += '\\b Palpatie:\\b0\\par';
        rtfContent += `${this.sanitizeText(findings.palpation)}\\par\\par`;
      }

      if (options.includeRedFlags && onderzoekResult.redFlags && onderzoekResult.redFlags.length > 0) {
        rtfContent += '\\b Red Flags (Onderzoek):\\b0\\par';
        onderzoekResult.redFlags.forEach((flag, index) => {
          rtfContent += `${index + 1}. ${this.sanitizeText(flag)}\\par`;
        });
        rtfContent += '\\par';
      }
    }

    // Klinische Conclusie
    if (klinischeConclusieResult?.clinicalConclusion) {
      const conclusion = klinischeConclusieResult.clinicalConclusion;
      rtfContent += '\\b KLINISCHE CONCLUSIE\\b0\\par';

      if (conclusion.diagnosis) {
        rtfContent += '\\b Diagnose:\\b0\\par';
        rtfContent += `${this.sanitizeText(conclusion.diagnosis)}\\par\\par`;
      }

      if (conclusion.treatmentPlan) {
        rtfContent += '\\b Behandelplan:\\b0\\par';
        rtfContent += `${this.sanitizeText(conclusion.treatmentPlan)}\\par\\par`;
      }

      if (conclusion.followUp) {
        rtfContent += '\\b Vervolgafspraken:\\b0\\par';
        rtfContent += `${this.sanitizeText(conclusion.followUp)}\\par\\par`;
      }
    }

    // Metadata
    if (metadata) {
      rtfContent += '\\line\\line';
      rtfContent += `Gegenereerd door: ${this.sanitizeText(metadata.exportedBy)}\\par`;
      rtfContent += `Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}\\par`;
      rtfContent += `Workflow type: ${this.sanitizeText(metadata.workflowType)}\\par`;
    }

    rtfContent += '}';

    return new Blob([rtfContent], { type: 'application/rtf' });
  }

  private generateStepwisePDF(data: ExportData, options: ExportOptions): Blob {
    // Generate HTML optimized for PDF printing
    const { anamneseResult, onderzoekResult, klinischeConclusieResult, patientInfo, metadata } = data;

    let html = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Stapsgewijze Intake - ${patientInfo?.initials || 'Patiënt'}</title>
    <style>
        @page {
            margin: 2cm;
            size: A4;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }
        .header {
            border-bottom: 2px solid #000;
            margin-bottom: 20px;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #000;
            margin: 0;
            font-size: 18pt;
        }
        .patient-info {
            background-color: #f5f5f5;
            padding: 10px;
            border: 1px solid #ccc;
            margin-bottom: 15px;
        }
        .step-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .step-section h2 {
            color: #000;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            font-size: 14pt;
            margin: 15px 0 10px 0;
        }
        .step-section h3 {
            color: #333;
            font-size: 12pt;
            margin: 10px 0 5px 0;
        }
        .hhsb-grid {
            display: block;
        }
        .hhsb-item {
            background-color: #fafafa;
            padding: 10px;
            border-left: 3px solid #333;
            margin-bottom: 10px;
        }
        .hhsb-item h4 {
            color: #000;
            margin: 0 0 5px 0;
            font-size: 11pt;
        }
        .content-block {
            background-color: #fafafa;
            padding: 10px;
            border-left: 3px solid #333;
            white-space: pre-wrap;
            margin-top: 5px;
        }
        .red-flags {
            background-color: #fff0f0;
            border: 1px solid #ffcccc;
            padding: 10px;
            margin-top: 15px;
        }
        .red-flags h3 {
            color: #cc0000;
            margin-top: 0;
        }
        .metadata {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #ccc;
            font-size: 10pt;
            color: #666;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>`;

    // Header
    html += `
    <div class="header">
        <h1>Stapsgewijze Intake Verslag</h1>
        ${options.includeTimestamp ? `<p>Gegenereerd op: ${new Date().toLocaleString('nl-NL')}</p>` : ''}
    </div>`;

    // Patient Information
    if (options.includePatientInfo && patientInfo) {
      html += `
    <div class="patient-info">
        <h2>Patiëntgegevens</h2>
        <p><strong>Initialen:</strong> ${this.sanitizeText(patientInfo.initials || 'N/A')}</p>
        <p><strong>Geboortejaar:</strong> ${this.sanitizeText(patientInfo.birthYear || 'N/A')}</p>
        <p><strong>Geslacht:</strong> ${this.sanitizeText(patientInfo.gender || 'N/A')}</p>
        ${patientInfo.chiefComplaint ? `<p><strong>Hoofdklacht:</strong> ${this.sanitizeText(patientInfo.chiefComplaint)}</p>` : ''}
    </div>`;
    }

    // Anamnese Section (HHSB)
    if (anamneseResult?.hhsbAnamneseCard) {
      const hhsb = anamneseResult.hhsbAnamneseCard;
      html += `
    <div class="step-section">
        <h2>Anamnese (HHSB)</h2>
        <div class="hhsb-grid">`;

      if (hhsb.hulpvraag) {
        html += `
      <div class="hhsb-item">
          <h4>Hulpvraag</h4>
          <div>${this.sanitizeText(hhsb.hulpvraag)}</div>
      </div>`;
      }

      if (hhsb.historie) {
        html += `
      <div class="hhsb-item">
          <h4>Historie</h4>
          <div>${this.sanitizeText(hhsb.historie)}</div>
      </div>`;
      }

      if (hhsb.stoornissen) {
        html += `
      <div class="hhsb-item">
          <h4>Stoornissen</h4>
          <div>${this.sanitizeText(hhsb.stoornissen)}</div>
      </div>`;
      }

      if (hhsb.beperkingen) {
        html += `
      <div class="hhsb-item">
          <h4>Beperkingen</h4>
          <div>${this.sanitizeText(hhsb.beperkingen)}</div>
      </div>`;
      }

      if (hhsb.anamneseSummary) {
        html += `
      <div class="hhsb-item">
          <h4>Samenvatting Anamnese</h4>
          <div>${this.sanitizeText(hhsb.anamneseSummary)}</div>
      </div>`;
      }

      html += `</div>`;

      // Red flags for anamnese
      if (options.includeRedFlags && anamneseResult.redFlags && anamneseResult.redFlags.length > 0) {
        html += `
      <div class="red-flags">
          <h3>Red Flags (Anamnese)</h3>
          <ul>`;
        anamneseResult.redFlags.forEach(flag => {
          html += `<li>${this.sanitizeText(flag)}</li>`;
        });
        html += `
          </ul>
      </div>`;
      }

      html += `</div>`;
    }

    // Onderzoek Section
    if (onderzoekResult?.examinationFindings) {
      const findings = onderzoekResult.examinationFindings;
      html += `
    <div class="step-section">
        <h2>Onderzoek</h2>`;

      if (findings.physicalTests) {
        html += `
      <h3>Fysieke Testen</h3>
      <div class="content-block">${this.sanitizeText(findings.physicalTests)}</div>`;
      }

      if (findings.movements) {
        html += `
      <h3>Bewegingsonderzoek</h3>
      <div class="content-block">${this.sanitizeText(findings.movements)}</div>`;
      }

      if (findings.palpation) {
        html += `
      <h3>Palpatie</h3>
      <div class="content-block">${this.sanitizeText(findings.palpation)}</div>`;
      }

      // Red flags for onderzoek
      if (options.includeRedFlags && onderzoekResult.redFlags && onderzoekResult.redFlags.length > 0) {
        html += `
      <div class="red-flags">
          <h3>Red Flags (Onderzoek)</h3>
          <ul>`;
        onderzoekResult.redFlags.forEach(flag => {
          html += `<li>${this.sanitizeText(flag)}</li>`;
        });
        html += `
          </ul>
      </div>`;
      }

      html += `</div>`;
    }

    // Klinische Conclusie Section
    if (klinischeConclusieResult?.clinicalConclusion) {
      const conclusion = klinischeConclusieResult.clinicalConclusion;
      html += `
    <div class="step-section">
        <h2>Klinische Conclusie</h2>`;

      if (conclusion.diagnosis) {
        html += `
      <h3>Diagnose</h3>
      <div class="content-block">${this.sanitizeText(conclusion.diagnosis)}</div>`;
      }

      if (conclusion.treatmentPlan) {
        html += `
      <h3>Behandelplan</h3>
      <div class="content-block">${this.sanitizeText(conclusion.treatmentPlan)}</div>`;
      }

      if (conclusion.followUp) {
        html += `
      <h3>Vervolgafspraken</h3>
      <div class="content-block">${this.sanitizeText(conclusion.followUp)}</div>`;
      }

      html += `</div>`;
    }

    // Metadata
    if (metadata) {
      html += `
    <div class="metadata">
        <p>Gegenereerd door: ${this.sanitizeText(metadata.exportedBy)}</p>
        <p>Export datum: ${new Date(metadata.exportedAt).toLocaleString('nl-NL')}</p>
        <p>Workflow type: ${this.sanitizeText(metadata.workflowType)}</p>
    </div>`;
    }

    html += `
</body>
</html>`;

    return new Blob([html], { type: 'text/html;charset=utf-8' });
  }

  // Automated Intake Export Methods (similar structure)
  private generateAutomatedIntakeHTML(data: ExportData, options: ExportOptions): Blob {
    // Simplified version that combines all data into a single report
    return this.generateStepwiseHTML(data, options);
  }

  private generateAutomatedIntakeText(data: ExportData, options: ExportOptions): Blob {
    return this.generateStepwiseText(data, options);
  }

  private generateAutomatedIntakeDocx(data: ExportData, options: ExportOptions): Blob {
    return this.generateStepwiseDocx(data, options);
  }

  private generateAutomatedIntakePDF(data: ExportData, options: ExportOptions): Blob {
    return this.generateStepwisePDF(data, options);
  }

  /**
   * Download a blob as a file
   */
  downloadBlob(blob: Blob, filename: string): void {
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
   * Get suggested filename based on export data and format
   */
  getSuggestedFilename(data: ExportData, format: ExportFormat): string {
    const { patientInfo, metadata } = data;
    const timestamp = new Date().toISOString().slice(0, 10);
    const patient = patientInfo?.initials || 'Patient';
    const workflow = metadata?.workflowType || 'workflow';

    return `${patient}_${workflow}_${timestamp}.${format}`;
  }
}

// Export singleton instance
export const exportManager = AdvancedExportManager.getInstance();