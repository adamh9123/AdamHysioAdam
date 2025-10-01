'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { exportManager, type ExportFormat, type ExportOptions } from '@/lib/utils/advanced-export';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Separator } from './separator';
import { Toast } from './toast';
import { LoadingSpinner } from './loading-spinner';
import {
  Download,
  FileText,
  File,
  FileSpreadsheet,
  Printer,
  Copy,
  Share2,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import type { PatientInfo, AnamneseResult, OnderzoekResult, KlinischeConclusieResult, ConsultResult } from '@/types/api';

export interface ExportPanelProps {
  // Data to export
  patientInfo?: PatientInfo;
  anamneseResult?: AnamneseResult;
  onderzoekResult?: OnderzoekResult;
  klinischeConclusieResult?: KlinischeConclusieResult;
  consultResult?: ConsultResult;
  automatedIntakeResult?: any;

  // Workflow info
  workflowType: 'intake-stapsgewijs' | 'intake-automatisch' | 'consult';
  title?: string;

  // UI options
  variant?: 'default' | 'compact' | 'minimal';
  showPreview?: boolean;
  showAdvancedOptions?: boolean;
  defaultFormat?: ExportFormat;
  className?: string;

  // Callbacks
  onExportStart?: (format: ExportFormat) => void;
  onExportComplete?: (format: ExportFormat, filename: string) => void;
  onExportError?: (error: Error) => void;
}

interface ExportState {
  selectedFormat: ExportFormat;
  isExporting: boolean;
  lastExported: { format: ExportFormat; filename: string; timestamp: number } | null;
  showAdvanced: boolean;
  options: ExportOptions;
  error: string | null;
}

const FORMAT_CONFIG = {
  html: {
    icon: FileText,
    label: 'HTML',
    description: 'Webpagina format met opmaak',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  txt: {
    icon: File,
    label: 'TXT',
    description: 'Platte tekst zonder opmaak',
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  docx: {
    icon: FileSpreadsheet,
    label: 'DOCX',
    description: 'Microsoft Word document',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  pdf: {
    icon: Printer,
    label: 'PDF',
    description: 'Portable Document Format',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
};

const TEMPLATE_OPTIONS = [
  { value: 'standard', label: 'Standaard', description: 'Volledige informatie met structuur' },
  { value: 'detailed', label: 'Uitgebreid', description: 'Alle details en metadata' },
  { value: 'summary', label: 'Samenvatting', description: 'Alleen kerngegevens' }
];

export const ExportPanel: React.FC<ExportPanelProps> = ({
  patientInfo,
  anamneseResult,
  onderzoekResult,
  klinischeConclusieResult,
  consultResult,
  automatedIntakeResult,
  workflowType,
  title,
  variant = 'default',
  showPreview = false,
  showAdvancedOptions = false,
  defaultFormat = 'html',
  className = '',
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const [state, setState] = React.useState<ExportState>({
    selectedFormat: defaultFormat,
    isExporting: false,
    lastExported: null,
    showAdvanced: false,
    options: {
      format: defaultFormat,
      includePatientInfo: true,
      includeTimestamp: true,
      includeRedFlags: true,
      template: 'standard'
    },
    error: null
  });

  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  const handleFormatChange = React.useCallback((format: ExportFormat) => {
    setState(prev => ({
      ...prev,
      selectedFormat: format,
      options: { ...prev.options, format }
    }));
  }, []);

  const handleOptionChange = React.useCallback((key: keyof ExportOptions, value: any) => {
    setState(prev => ({
      ...prev,
      options: { ...prev.options, [key]: value }
    }));
  }, []);

  const handleExport = React.useCallback(async () => {
    if (!patientInfo) {
      setState(prev => ({ ...prev, error: 'Patiëntgegevens zijn vereist voor export' }));
      return;
    }

    setState(prev => ({ ...prev, isExporting: true, error: null }));
    onExportStart?.(state.selectedFormat);

    try {
      let blob: Blob;

      switch (workflowType) {
        case 'consult':
          if (!consultResult) {
            throw new Error('Consult resultaten niet gevonden');
          }
          blob = await exportManager.exportSOEP(consultResult, patientInfo, state.options);
          break;

        case 'intake-stapsgewijs':
          if (!anamneseResult || !onderzoekResult || !klinischeConclusieResult) {
            throw new Error('Niet alle stapsgewijze intake resultaten zijn beschikbaar');
          }
          blob = await exportManager.exportStepwiseIntake(
            anamneseResult,
            onderzoekResult,
            klinischeConclusieResult,
            patientInfo,
            state.options
          );
          break;

        case 'intake-automatisch':
          if (!automatedIntakeResult) {
            throw new Error('Automatische intake resultaten niet gevonden');
          }
          blob = await exportManager.exportAutomatedIntake(
            automatedIntakeResult,
            patientInfo,
            state.options
          );
          break;

        default:
          throw new Error(`Onbekend workflow type: ${workflowType}`);
      }

      const filename = exportManager.getSuggestedFilename(
        {
          patientInfo,
          anamneseResult,
          onderzoekResult,
          klinischeConclusieResult,
          consultResult,
          metadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: 'Hysio Medical Scribe v7.0',
            workflowType
          }
        },
        state.selectedFormat
      );

      exportManager.downloadBlob(blob, filename);

      setState(prev => ({
        ...prev,
        isExporting: false,
        lastExported: {
          format: state.selectedFormat,
          filename,
          timestamp: Date.now()
        }
      }));

      onExportComplete?.(state.selectedFormat, filename);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Onbekende export fout';
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: errorMessage
      }));
      onExportError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [
    patientInfo,
    anamneseResult,
    onderzoekResult,
    klinischeConclusieResult,
    consultResult,
    automatedIntakeResult,
    workflowType,
    state.selectedFormat,
    state.options,
    onExportStart,
    onExportComplete,
    onExportError
  ]);

  const copyToClipboard = React.useCallback(async () => {
    if (!patientInfo) return;

    try {
      setState(prev => ({ ...prev, isExporting: true }));

      let blob: Blob;
      const textOptions = { ...state.options, format: 'txt' as ExportFormat };

      switch (workflowType) {
        case 'consult':
          if (!consultResult) throw new Error('Consult resultaten niet gevonden');
          blob = await exportManager.exportSOEP(consultResult, patientInfo, textOptions);
          break;
        case 'intake-stapsgewijs':
          if (!anamneseResult || !onderzoekResult || !klinischeConclusieResult) {
            throw new Error('Niet alle resultaten beschikbaar');
          }
          blob = await exportManager.exportStepwiseIntake(
            anamneseResult,
            onderzoekResult,
            klinischeConclusieResult,
            patientInfo,
            textOptions
          );
          break;
        case 'intake-automatisch':
          if (!automatedIntakeResult) throw new Error('Resultaten niet gevonden');
          blob = await exportManager.exportAutomatedIntake(
            automatedIntakeResult,
            patientInfo,
            textOptions
          );
          break;
        default:
          throw new Error('Onbekend workflow type');
      }

      const text = await blob.text();
      await navigator.clipboard.writeText(text);

      setState(prev => ({ ...prev, isExporting: false }));

      // Show success toast (would need toast system)
      console.log('Gekopieerd naar klembord');

    } catch (error) {
      setState(prev => ({
        ...prev,
        isExporting: false,
        error: 'Kon niet kopiëren naar klembord'
      }));
    }
  }, [patientInfo, workflowType, consultResult, anamneseResult, onderzoekResult, klinischeConclusieResult, automatedIntakeResult, state.options]);

  const formatCount = Object.keys(FORMAT_CONFIG).length;
  const hasData = Boolean(
    patientInfo && (
      consultResult ||
      (anamneseResult && onderzoekResult && klinischeConclusieResult) ||
      automatedIntakeResult
    )
  );

  if (isMinimal) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          onClick={handleExport}
          disabled={!hasData || state.isExporting}
          size="sm"
          variant="outline"
          className="text-hysio-deep-green border-hysio-mint hover:bg-hysio-mint/10"
        >
          {state.isExporting ? (
            <LoadingSpinner size={14} className="mr-1" />
          ) : (
            <Download size={14} className="mr-1" />
          )}
          Export
        </Button>
        {hasData && (
          <Button
            onClick={copyToClipboard}
            disabled={state.isExporting}
            size="sm"
            variant="ghost"
          >
            <Copy size={14} />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className={cn('pb-4', isCompact && 'pb-3')}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn('text-hysio-deep-green flex items-center gap-2', isCompact && 'text-base')}>
              <Download size={isCompact ? 16 : 20} />
              {title || 'Export Opties'}
            </CardTitle>
            {!isCompact && (
              <CardDescription>
                Download uw medisch verslag in verschillende formaten
              </CardDescription>
            )}
          </div>
          {state.lastExported && (
            <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
              <CheckCircle size={12} className="mr-1" />
              Geëxporteerd
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={16} />
              <span className="text-sm">{state.error}</span>
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-hysio-deep-green">
            Export Formaat
          </Label>
          <div className={cn(
            'grid gap-3',
            isCompact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
          )}>
            {(Object.keys(FORMAT_CONFIG) as ExportFormat[]).map((format) => {
              const config = FORMAT_CONFIG[format];
              const Icon = config.icon;
              const isSelected = state.selectedFormat === format;

              return (
                <div
                  key={format}
                  className={cn(
                    'border rounded-lg p-3 cursor-pointer transition-all hover:border-hysio-mint',
                    isSelected ? 'border-hysio-mint bg-hysio-mint/5 ring-1 ring-hysio-mint/20' : 'border-gray-200'
                  )}
                  onClick={() => handleFormatChange(format)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-1.5 rounded', config.color)}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{config.label}</span>
                        {format === 'docx' || format === 'pdf' ? (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Binnenkort
                          </Badge>
                        ) : null}
                      </div>
                      {!isCompact && (
                        <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Options */}
        {(showAdvancedOptions || state.showAdvanced) && !isCompact && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-hysio-deep-green">
                  Export Opties
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
                >
                  <Settings size={14} className="mr-1" />
                  {state.showAdvanced ? 'Verbergen' : 'Tonen'}
                </Button>
              </div>

              {state.showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-patient"
                        checked={state.options.includePatientInfo}
                        onCheckedChange={(checked) =>
                          handleOptionChange('includePatientInfo', checked)
                        }
                      />
                      <Label htmlFor="include-patient" className="text-sm">
                        Patiëntgegevens
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-timestamp"
                        checked={state.options.includeTimestamp}
                        onCheckedChange={(checked) =>
                          handleOptionChange('includeTimestamp', checked)
                        }
                      />
                      <Label htmlFor="include-timestamp" className="text-sm">
                        Timestamp
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-redflags"
                        checked={state.options.includeRedFlags}
                        onCheckedChange={(checked) =>
                          handleOptionChange('includeRedFlags', checked)
                        }
                      />
                      <Label htmlFor="include-redflags" className="text-sm">
                        Red Flags
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Template
                      </Label>
                      <Select
                        value={state.options.template || 'standard'}
                        onValueChange={(value) => handleOptionChange('template', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_OPTIONS.map((template) => (
                            <SelectItem key={template.value} value={template.value}>
                              <div>
                                <div className="font-medium">{template.label}</div>
                                <div className="text-xs text-gray-500">
                                  {template.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className={cn('flex gap-3', isCompact ? 'flex-col' : 'flex-row justify-between')}>
          <div className="flex gap-2">
            <Button
              onClick={handleExport}
              disabled={!hasData || state.isExporting || (state.selectedFormat === 'docx' || state.selectedFormat === 'pdf')}
              className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 flex-1 sm:flex-none"
            >
              {state.isExporting ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Exporteren...
                </>
              ) : (
                <>
                  <Download size={16} className="mr-2" />
                  Export {FORMAT_CONFIG[state.selectedFormat].label}
                </>
              )}
            </Button>

            {hasData && !isCompact && (
              <Button
                onClick={copyToClipboard}
                disabled={state.isExporting}
                variant="outline"
                className="text-hysio-deep-green border-hysio-mint hover:bg-hysio-mint/10"
              >
                <Copy size={16} className="mr-2" />
                Kopiëren
              </Button>
            )}
          </div>

          {!isCompact && !state.showAdvanced && showAdvancedOptions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showAdvanced: true }))}
              className="text-hysio-deep-green"
            >
              <Settings size={16} className="mr-2" />
              Meer opties
            </Button>
          )}
        </div>

        {/* Last Export Info */}
        {state.lastExported && !isCompact && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={16} />
              <span className="text-sm">
                Laatst geëxporteerd: {FORMAT_CONFIG[state.lastExported.format].label} • {' '}
                {new Date(state.lastExported.timestamp).toLocaleString('nl-NL')}
              </span>
            </div>
          </div>
        )}

        {/* Data Status */}
        {!hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle size={16} />
              <span className="text-sm">
                Geen data beschikbaar voor export. Voltooi eerst de workflow.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportPanel;