import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TwoPanelLayout } from '@/components/ui/two-panel-layout';
import { InputPanel } from '@/components/ui/input-panel';
import { GuidancePanel } from '@/components/ui/guidance-panel';
import { HHSBResultsPanel } from '@/components/ui/hhsb-results-panel';
import { ExaminationResultsPanel } from '@/components/ui/examination-results-panel';
import { ClinicalConclusionView } from '@/components/ui/clinical-conclusion-view';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { StreamlinedIntakeWorkflow } from './streamlined-intake-workflow';
import { StreamlinedFollowupWorkflow } from './streamlined-followup-workflow';
import { AnonymousExportService } from '@/lib/utils/anonymous-export-service';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import { transcribeAudio } from '@/lib/api/transcription';
import { HYSIO_LLM_MODEL } from '@/lib/api/openai';
import { Copy, FileText, Lightbulb, MessageSquare, Stethoscope, Target, RotateCcw, ChevronRight, CheckCircle } from 'lucide-react';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { WorkflowStepper, WorkflowPhase } from '@/components/ui/workflow-stepper';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { AssistantIntegration } from '@/components/assistant/assistant-integration';
import {
  generateIntelligentPreparation,
  validatePreparationInput,
  detectAnatomicalRegion,
  type PreparationRequest
} from '@/lib/preparation/intelligent-preparation';
import type {
  IntakeData,
  PatientInfo,
  AudioTranscription,
  AudioRecording,
  HHSBStructure,
  SOEPStructure
} from '@/lib/types';

// Parse HHSB structured text into individual sections
const parseHHSBText = (fullText: string): HHSBStructure => {
  // Input validation and error handling
  if (!fullText || typeof fullText !== 'string') {
    console.warn('parseHHSBText: Invalid input provided, returning empty structure');
    return {
      hulpvraag: '',
      historie: '',
      stoornissen: '',
      beperkingen: '',
      redFlags: [],
      fullStructuredText: '',
    };
  }

  const result: HHSBStructure = {
    hulpvraag: '',
    historie: '',
    stoornissen: '',
    beperkingen: '',
    redFlags: [],
    fullStructuredText: fullText,
  };

  try {

  // Define section patterns with multiple variations
  const patterns = [
    // Patient/Patiënt patterns
    {
      key: 'hulpvraag' as keyof HHSBStructure,
      patterns: [
        /\*\*P\s*-\s*Patiënt\s*Probleem\/Hulpvraag:?\*\*([\s\S]*?)(?=\*\*[HhSsBb]\s*-|$)/i,
        /\*\*Patiëntbehoeften:?\*\*([\s\S]*?)(?=\*\*Historie|\*\*[HhSsBb]\s*-|$)/i,
        /\*\*P:?\*\*([\s\S]*?)(?=\*\*[HhSsBb]\s*-|$)/i,
      ]
    },
    // Historie patterns
    {
      key: 'historie' as keyof HHSBStructure,
      patterns: [
        /\*\*H\s*-\s*Historie:?\*\*([\s\S]*?)(?=\*\*[SsBb]\s*-|$)/i,
        /\*\*Historie:?\*\*([\s\S]*?)(?=\*\*Stoornissen|\*\*[SsBb]\s*-|$)/i,
        /\*\*H:?\*\*([\s\S]*?)(?=\*\*[SsBb]\s*-|$)/i,
      ]
    },
    // Stoornissen patterns
    {
      key: 'stoornissen' as keyof HHSBStructure,
      patterns: [
        /\*\*S\s*-\s*Stoornissen\s*in\s*lichaamsfuncties\s*en\s*anatomische\s*structuren:?\*\*([\s\S]*?)(?=\*\*[Bb]\s*-|$)/i,
        /\*\*Stoornissen:?\*\*([\s\S]*?)(?=\*\*Beperkingen|\*\*[Bb]\s*-|$)/i,
        /\*\*S:?\*\*([\s\S]*?)(?=\*\*[Bb]\s*-|$)/i,
      ]
    },
    // Beperkingen patterns
    {
      key: 'beperkingen' as keyof HHSBStructure,
      patterns: [
        /\*\*B\s*-\s*Beperkingen\s*in\s*activiteiten\s*en\s*participatie:?\*\*([\s\S]*?)(?=\*\*Rode\s*Vlagen|$)/i,
        /\*\*B\s*-\s*Beperkingen:?\*\*([\s\S]*?)(?=\*\*Rode\s*Vlagen|$)/i,
        /\*\*Beperkingen\s*in\s*activiteiten\s*en\s*participatie:?\*\*([\s\S]*?)(?=\*\*Rode\s*Vlagen|$)/i,
        /\*\*Beperkingen:?\*\*([\s\S]*?)(?=\*\*Rode\s*Vlagen|$)/i,
        /\*\*B:?\*\*([\s\S]*?)(?=\*\*Rode\s*Vlagen|$)/i,
      ]
    }
  ];

  // Extract content for each section
  patterns.forEach(({ key, patterns: sectionPatterns }) => {
    for (const pattern of sectionPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        result[key] = match[1].trim();
        break;
      }
    }
  });

  // Extract red flags
  const redFlagPatterns = [
    /\*\*Rode\s*Vlagen:?\*\*([\s\S]*?)$/gi, // Fixed: Added global flag
    /\[RODE\s*VLAG:?([^\]]+)\]/gi
  ];
  
  for (const pattern of redFlagPatterns) {
    if (pattern.global) {
      const matches = fullText.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          const flags = match[1].split('\n')
            .map(line => line.replace(/^\s*[-*]\s*/, '').trim())
            .filter(line => line.length > 0);
          result.redFlags.push(...flags);
        }
      }
    } else {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        const flags = match[1].split('\n')
          .map(line => line.replace(/^\s*[-*]\s*/, '').trim())
          .filter(line => line.length > 0);
        result.redFlags.push(...flags);
      }
    }
  }

    // Remove duplicates from red flags
    result.redFlags = [...new Set(result.redFlags)];

    return result;
  } catch (error) {
    console.error('Critical error in parsePHSBText:', error);
    // Return a safe fallback structure
    return {
      patientNeeds: '',
      history: '',
      disorders: '',
      limitations: '',
      redFlags: [],
      fullStructuredText: fullText,
    };
  }
};

// NEW: Full Intake Input Panel component for single-action processing
interface FullIntakeInputPanelProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onManualNotesChange?: (notes: string) => void;
  onProcessClick?: () => void;
  manualNotes?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  recording?: AudioRecording | null;
  canProcess?: boolean;
  automationProgress?: {
    step: string;
    progress: number;
    isComplete: boolean;
  };
}

const FullIntakeInputPanel: React.FC<FullIntakeInputPanelProps> = ({
  onRecordingComplete,
  onManualNotesChange,
  onProcessClick,
  manualNotes = '',
  disabled = false,
  isProcessing = false,
  recording,
  canProcess = false,
  automationProgress = { step: 'Wachtend...', progress: 0, isComplete: false }
}) => {
  const [uploadKey, setUploadKey] = React.useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';
    setUploadKey(prev => prev + 1);

    if (!file.type.startsWith('audio/')) {
      console.error('Selecteer een audio bestand');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      console.error('Audio bestand is te groot (max 25MB)');
      return;
    }

    try {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const estimatedDuration = file.size / 16000;
      onRecordingComplete?.(blob, estimatedDuration);
    } catch (error) {
      console.error('Fout bij uploaden van audio bestand');
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Progress Display during Processing */}
      {isProcessing && (
        <div className="bg-hysio-mint/10 border-2 border-hysio-mint/30 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-4 border-hysio-deep-green border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-hysio-deep-green mb-2">
                Volledige Intake Verwerken
              </h3>
              <p className="text-sm text-hysio-deep-green/80 mb-4">
                {automationProgress.step}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-hysio-mint h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${automationProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-hysio-deep-green/60 mt-2">
                {automationProgress.progress}% voltooid
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Interface - Hidden during processing */}
      {!isProcessing && (
        <>
          {/* Live Opname voor Volledige Intake */}
          <CollapsibleSection
            title="Volledige Intake Opname"
            defaultOpen={true}
            className="border-2 border-hysio-mint/30"
          >
            <div className="space-y-4">
              <AudioRecorder
                onRecordingComplete={onRecordingComplete}
                autoTranscribe={false}
                transcriptionOptions={{
                  language: 'nl',
                  prompt: 'Dit is een complete fysiotherapie intake inclusief anamnese en lichamelijk onderzoek in het Nederlands. Transcribeer accuraat alle medische termen, patiënt uitspraken, en onderzoeksbevindingen.',
                  temperature: 0.0,
                }}
                disabled={disabled || isProcessing}
                maxDuration={1800000}
              />

              {/* File upload within Live Opname section */}
              <div className="pt-4 border-t border-hysio-mint/20">
                <input
                  key={uploadKey}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  disabled={disabled || isProcessing}
                  className="w-full text-sm text-hysio-deep-green-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-hysio-mint/20 file:text-hysio-deep-green hover:file:bg-hysio-mint/30 disabled:opacity-50"
                />
                <p className="text-xs text-hysio-deep-green-900/60 mt-2">
                  Ondersteunde formaten: MP3, WAV, M4A, MP4. Maximaal 25MB.
                </p>
              </div>
            </div>
          </CollapsibleSection>

          {/* Handmatige Notities voor Volledige Intake */}
          <CollapsibleSection
            title="Volledige Intake Notities"
            defaultOpen={true}
            className="border-2 border-hysio-mint/30"
          >
            <div className="space-y-4">
              <textarea
                value={manualNotes}
                onChange={(e) => onManualNotesChange?.(e.target.value)}
                placeholder="Voer hier uw complete intake in (anamnese, lichamelijk onderzoek, bevindingen, etc.)..."
                disabled={disabled || isProcessing}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-hysio-mint focus:border-hysio-mint resize-y disabled:opacity-50"
              />
              <p className="text-xs text-gray-500">
                Typ hier alle intake informatie. Deze wordt automatisch gecombineerd met audio transcriptie.
              </p>
            </div>
          </CollapsibleSection>

          {/* Hysio Assistant */}
          <CollapsibleSection
            title="Hysio Assistant"
            defaultOpen={false}
            className="border-2 border-hysio-mint/30"
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={18} className="text-hysio-deep-green" />
                <span className="text-sm font-medium text-hysio-deep-green">
                  AI Assistent voor Intake
                </span>
              </div>
              <AssistantIntegration
                isCollapsed={false}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </CollapsibleSection>
        </>
      )}

      {/* Process Button - Always visible at bottom */}
      {canProcess && (
        <div className="sticky bottom-0 bg-white p-4 border-t border-hysio-mint/20 -mx-6">
          <Button
            onClick={onProcessClick}
            disabled={disabled || isProcessing || !canProcess}
            size="lg"
            className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white px-8 py-4 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Volledige Intake Verwerken...
              </>
            ) : (
              <>
                <FileText size={24} className="mr-3" />
                Verwerk Volledige Intake
              </>
            )}
          </Button>
          {!isProcessing && (
            <p className="text-center text-xs text-hysio-deep-green/60 mt-2">
              Genereert automatisch: Anamnesekaart → Onderzoeksbevindingen → Klinische Conclusie
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// NEW: Unified Results Display Component
interface UnifiedResultsDisplayProps {
  hhsbResults?: HHSBStructure | null;
  examinationFindings?: string;
  clinicalConclusion?: string;
  isProcessing?: boolean;
  automationProgress?: {
    step: string;
    progress: number;
    isComplete: boolean;
  };
  patientInfo: PatientInfo;
  onExportPDF?: () => void;
  onExportWord?: () => void;
  isExporting?: boolean;
  disabled?: boolean;
}

const UnifiedResultsDisplay: React.FC<UnifiedResultsDisplayProps> = ({
  hhsbResults,
  examinationFindings,
  clinicalConclusion,
  isProcessing = false,
  automationProgress = { step: 'Wachtend...', progress: 0, isComplete: false },
  patientInfo,
  onExportPDF,
  onExportWord,
  isExporting = false,
  disabled = false
}) => {

  const hasResults = hhsbResults || examinationFindings || clinicalConclusion;
  const isCompleted = automationProgress.isComplete && hasResults;

  if (isProcessing) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-hysio-mint/10 border-2 border-hysio-mint/30 rounded-lg p-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
              <div className="w-10 h-10 border-4 border-hysio-deep-green border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-hysio-deep-green mb-3">
                Volledige Intake Verwerken
              </h2>
              <p className="text-lg text-hysio-deep-green/80 mb-6">
                {automationProgress.step}
              </p>
              <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4">
                <div
                  className="bg-hysio-mint h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${automationProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-hysio-deep-green/60 mt-3">
                {automationProgress.progress}% voltooid - Alle secties worden automatisch gegenereerd
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-hysio-deep-green" />
          </div>
          <h2 className="text-2xl font-bold text-hysio-deep-green mb-4">
            Volledige Intake Workflow
          </h2>
          <p className="text-hysio-deep-green-900/70 mb-8 max-w-md mx-auto">
            Voer uw intake gegevens in en klik op "Verwerk Volledige Intake" om automatisch alle drie secties te genereren.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Success Banner */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Intake Volledig Verwerkt!
              </h3>
              <p className="text-green-700">
                Alle drie secties zijn automatisch gegenereerd: Anamnesekaart, Onderzoeksbevindingen en Klinische Conclusie.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Export Actions */}
      {isCompleted && (
        <div className="bg-white border border-hysio-mint/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-hysio-deep-green mb-4">Export Opties</h3>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={onExportPDF}
              disabled={disabled || isExporting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <FileText size={16} className="mr-2" />
              )}
              Export als PDF
            </Button>
            <Button
              onClick={onExportWord}
              disabled={disabled || isExporting}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <FileText size={16} className="mr-2" />
              )}
              Export als Word
            </Button>
          </div>
        </div>
      )}

      {/* Unified Results - Single Column Layout */}
      <div className="space-y-6">

        {/* Anamnesekaart Section - Custom Collapsible */}
        <div className="border-2 border-[#A5E1C5]/40 bg-[#F8F8F5] rounded-lg">
          <div className="p-4 border-b border-[#A5E1C5]/30 bg-[#A5E1C5]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#004B3A]" />
                <h3 className="text-lg font-semibold text-[#004B3A]">Anamnesekaart (PHSB)</h3>
              </div>
              <div className="flex items-center gap-3">
                {hhsbResults && (
                  <>
                    <CopyToClipboard text={hhsbResults.fullStructuredText} size="sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#004B3A] text-[#004B3A] hover:bg-[#004B3A]/10"
                      onClick={() => {/* Edit functionality */}}
                    >
                      ✏️ Bewerk
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {hhsbResults ? (
            <div className="space-y-4">
              <HHSBResultsPanel
                hhsbData={hhsbResults}
                showSources={false}
                audioSource={false}
                manualSource={false}
                className="border-0 p-0"
              />

              {/* Samenvattend Section - Additional summary for anamnesis */}
              <div className="border-t border-[#A5E1C5]/30 pt-4 mt-6">
                <div className="bg-white border border-[#A5E1C5]/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-[#004B3A] mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#10B981]" />
                    Samenvattend
                  </h4>
                  <div className="text-sm text-[#003728] leading-relaxed">
                    <p className="mb-2">
                      <strong>Kernproblematiek:</strong> {hhsbResults.patientNeeds || 'Nog niet gespecificeerd'}
                    </p>
                    <p className="mb-2">
                      <strong>Primaire Bevindingen:</strong> Combinatie van {hhsbResults.disorders || 'functionele stoornissen'}
                      {hhsbResults.limitations && ` met impact op ${hhsbResults.limitations}`}
                    </p>
                    {hhsbResults.redFlags && hhsbResults.redFlags.length > 0 && (
                      <p className="mb-2 text-red-600">
                        <strong>Aandachtspunten:</strong> {hhsbResults.redFlags.join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-[#003728]/70 mt-3 italic">
                      Deze samenvatting geeft een overzicht van de belangrijkste bevindingen uit de anamnese.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Wachtend op verwerking...</p>
            </div>
          )}
        </div>

        {/* Onderzoeksbevindingen Section - Custom Collapsible */}
        <div className="border-2 border-[#A5E1C5]/40 bg-[#F8F8F5] rounded-lg">
          <div className="p-4 border-b border-[#A5E1C5]/30 bg-[#A5E1C5]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stethoscope size={20} className="text-[#004B3A]" />
                <h3 className="text-lg font-semibold text-[#004B3A]">Onderzoeksbevindingen</h3>
              </div>
              <div className="flex items-center gap-3">
                {examinationFindings && (
                  <>
                    <CopyToClipboard text={examinationFindings} size="sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#004B3A] text-[#004B3A] hover:bg-[#004B3A]/10"
                      onClick={() => {/* Edit functionality */}}
                    >
                      ✏️ Bewerk
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
          {examinationFindings ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md border border-[#A5E1C5]/30">
                <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-[#003728]">
                  {examinationFindings}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
              <p>Wachtend op verwerking...</p>
            </div>
          )}
          </div>
        </div>

        {/* Klinische Conclusie Section - Custom Collapsible */}
        <div className="border-2 border-[#A5E1C5]/40 bg-[#F8F8F5] rounded-lg">
          <div className="p-4 border-b border-[#A5E1C5]/30 bg-[#A5E1C5]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-[#004B3A]" />
                <h3 className="text-lg font-semibold text-[#004B3A]">Klinische Conclusie</h3>
              </div>
              <div className="flex items-center gap-3">
                {clinicalConclusion && (
                  <>
                    <CopyToClipboard text={clinicalConclusion} size="sm" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#004B3A] text-[#004B3A] hover:bg-[#004B3A]/10"
                      onClick={() => {/* Edit functionality */}}
                    >
                      ✏️ Bewerk
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
          {clinicalConclusion ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-md border border-[#A5E1C5]/30">
                <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-[#003728]">
                  {clinicalConclusion}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Wachtend op verwerking...</p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Patient Info Summary */}
      <div className="bg-[#F8F8F5] border-2 border-[#A5E1C5]/30 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-medium text-[#004B3A] mb-2">Patiënt Informatie</h4>
        <p className="text-sm text-[#003728]">
          {patientInfo.initials} ({patientInfo.age} jaar, {patientInfo.gender}) - {patientInfo.chiefComplaint}
        </p>
      </div>
    </div>
  );
};

// New Anamnesis Input Panel component
interface NewAnamnesisInputPanelProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onManualNotesChange?: (notes: string) => void;
  onProcessClick?: () => void;
  processButtonLabel?: string;
  manualNotes?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  recording?: AudioRecording | null;
  showProcessButton?: boolean;
  canProcess?: boolean;
}

const NewAnamnesisInputPanel: React.FC<NewAnamnesisInputPanelProps> = ({
  onRecordingComplete,
  onManualNotesChange,
  onProcessClick,
  processButtonLabel = 'Verwerk Anamnese',
  manualNotes = '',
  disabled = false,
  isProcessing = false,
  recording,
  showProcessButton = true,
  canProcess = false,
}) => {
  const [uploadKey, setUploadKey] = React.useState(0);
  
  // State management for collapsible sections in processed state
  const isProcessed = showProcessButton && canProcess;
  const defaultCollapsedState = !isProcessed; // Collapse after processing

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';
    setUploadKey(prev => prev + 1);

    if (!file.type.startsWith('audio/')) {
      console.error('Selecteer een audio bestand');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      console.error('Audio bestand is te groot (max 25MB)');
      return;
    }

    try {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const estimatedDuration = file.size / 16000;
      onRecordingComplete?.(blob, estimatedDuration);
    } catch (error) {
      console.error('Fout bij uploaden van audio bestand');
    }
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Live Opname */}
      <CollapsibleSection 
        title="Live Opname"
        defaultOpen={true}
        className="border-2 border-hysio-mint/30"
      >
        <div className="space-y-4">
          <AudioRecorder
            onRecordingComplete={onRecordingComplete}
            autoTranscribe={false}
            transcriptionOptions={{
              language: 'nl',
              prompt: 'Dit is een fysiotherapie anamnese gesprek in het Nederlands. Transcribeer accuraat alle medische termen en patiënt uitspraken.',
              temperature: 0.0,
            }}
            disabled={disabled || isProcessing}
            maxDuration={1800000}
          />
          
          {/* File upload within Live Opname section */}
          <div className="pt-4 border-t border-hysio-mint/20">
            <input
              key={uploadKey}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={disabled || isProcessing}
              className="w-full text-sm text-hysio-deep-green-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-hysio-mint/20 file:text-hysio-deep-green hover:file:bg-hysio-mint/30 disabled:opacity-50"
            />
            <p className="text-xs text-hysio-deep-green-900/60 mt-2">
              Ondersteunde formaten: MP3, WAV, M4A, MP4. Maximaal 25MB.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Handmatige Notities */}
      <CollapsibleSection 
        title="Handmatige Notities"
        defaultOpen={true}
        className="border-2 border-hysio-mint/30"
      >
        <div className="space-y-4">
          <textarea
            value={manualNotes}
            onChange={(e) => onManualNotesChange?.(e.target.value)}
            placeholder="Voer hier handmatige anamnese notities in..."
            disabled={disabled || isProcessing}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-hysio-mint focus:border-hysio-mint resize-y disabled:opacity-50"
          />
          <p className="text-xs text-gray-500">
            Deze notities worden automatisch gecombineerd met audio transcriptie bij verwerking.
          </p>
        </div>
      </CollapsibleSection>

      {/* Hysio Assistant */}
      <CollapsibleSection 
        title="Hysio Assistant"
        defaultOpen={false}
        className="border-2 border-hysio-mint/30"
      >
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={18} className="text-hysio-deep-green" />
            <span className="text-sm font-medium text-hysio-deep-green">
              AI Assistent voor Anamnese
            </span>
          </div>
          <AssistantIntegration
            isCollapsed={false}
            className="border-0 bg-transparent p-0"
          />
        </div>
      </CollapsibleSection>

      {/* Process Button */}
      {showProcessButton && canProcess && (
        <div className="sticky bottom-0 bg-white p-4 border-t border-hysio-mint/20 -mx-6">
          <Button
            onClick={onProcessClick}
            disabled={disabled || isProcessing || !canProcess}
            size="lg"
            className="w-full bg-hysio-mint hover:bg-hysio-mint/90 px-8"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verwerken...
              </>
            ) : (
              <>
                <FileText size={20} className="mr-2" />
                {processButtonLabel}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

type AnamnesisState = 'initial' | 'preparation-generated' | 'anamnesis-processed';
type ExaminationState = 'initial' | 'proposal-generated' | 'examination-processed';
type AutomationState = 'initial' | 'processing' | 'completed' | 'error';

export interface NewIntakeWorkflowProps {
  patientInfo: PatientInfo;
  onComplete: (intakeData: IntakeData) => void;
  onSOEPComplete?: (soepData: SOEPStructure, sessionPreparation?: string) => void;
  onBack: () => void;
  initialData?: Partial<IntakeData>;
  disabled?: boolean;
  className?: string;
  sessionState?: any;
}

export const NewIntakeWorkflow: React.FC<NewIntakeWorkflowProps> = ({
  patientInfo,
  onComplete,
  onSOEPComplete,
  onBack,
  initialData = {},
  disabled = false,
  className,
  sessionState,
}) => {
  // Workflow selection management
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<'intake' | 'intake-plus' | 'consult'>('intake-plus'); // Default to intake-plus (Stapsgewijs)

  // Phase management
  const [currentPhase, setCurrentPhase] = React.useState<WorkflowPhase>('anamnesis');
  const [completedPhases, setCompletedPhases] = React.useState<WorkflowPhase[]>([]);

  // NEW: Workflow mode selection

  // NEW: Full automation state (MOVED BEFORE useEffect)
  const [automationState, setAutomationState] = React.useState<AutomationState>('initial');
  const [fullIntakeInput, setFullIntakeInput] = React.useState<string>('');
  const [fullIntakeRecording, setFullIntakeRecording] = React.useState<AudioRecording | null>(null);
  const [automationProgress, setAutomationProgress] = React.useState<{
    step: string;
    progress: number;
    isComplete: boolean;
  }>({ step: 'Wachtend...', progress: 0, isComplete: false });

  // NEW: Redirect to clinical conclusion view for automation mode after processing
  React.useEffect(() => {
    if (selectedWorkflow === 'intake' && automationState === 'processing') {
      setCurrentPhase('clinical-conclusion');
    }
  }, [selectedWorkflow, automationState]);

  // Anamnesis state management
  const [anamnesisState, setAnamnesisState] = React.useState<AnamnesisState>('initial');
  const [intakePreparation, setIntakePreparation] = React.useState<string>('');
  const [anamnesisRecording, setAnamnesisRecording] = React.useState<AudioRecording | null>(null);
  const [anamnesisNotes, setAnamnesisNotes] = React.useState<string>('');
  const [hhsbResults, setHhsbResults] = React.useState<HHSBStructure | null>(null);

  // Examination state management
  const [examinationState, setExaminationState] = React.useState<ExaminationState>('initial');
  const [examinationProposal, setExaminationProposal] = React.useState<string>('');
  const [examinationRecording, setExaminationRecording] = React.useState<AudioRecording | null>(null);
  const [examinationNotes, setExaminationNotes] = React.useState<string>('');
  const [examinationFindings, setExaminationFindings] = React.useState<string>('');

  // SOEP state for vervolgconsult workflow
  const [soepState, setSOEPState] = React.useState<'initial' | 'processing' | 'processed'>('initial');
  const [soepRecording, setSOEPRecording] = React.useState<AudioRecording | null>(null);
  const [soepNotes, setSOEPNotes] = React.useState<string>('');
  const [soepResults, setSOEPResults] = React.useState<SOEPStructure | null>(null);

  // Clinical conclusion
  const [clinicalConclusion, setClinicalConclusion] = React.useState<string>('');

  // Loading states
  const [isGeneratingPreparation, setIsGeneratingPreparation] = React.useState(false);
  const [isProcessingAnamnesis, setIsProcessingAnamnesis] = React.useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = React.useState(false);
  const [isProcessingExamination, setIsProcessingExamination] = React.useState(false);
  const [isGeneratingConclusion, setIsGeneratingConclusion] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  
  // Initialize with existing data if provided
  React.useEffect(() => {
    if (initialData.preparation) setIntakePreparation(initialData.preparation);
    if (initialData.hhsbStructure) setHhsbResults(initialData.hhsbStructure);
    if (initialData.examinationPlan) setExaminationProposal(initialData.examinationPlan);
    if (initialData.examinationFindings) setExaminationFindings(initialData.examinationFindings);
    if (initialData.clinicalConclusion) setClinicalConclusion(initialData.clinicalConclusion);
  }, [initialData]);
  
  // DEBUG: Track all state changes that affect navigation button visibility
  React.useEffect(() => {
    console.log('[HYSIO DEBUG] State change detected:', {
      currentPhase,
      anamnesisState,
      examinationState,
      shouldShowAnamnesisButton: anamnesisState === 'anamnesis-processed' && currentPhase === 'anamnesis',
      shouldShowExaminationButton: examinationState === 'examination-processed' && currentPhase === 'examination',
      timestamp: new Date().toISOString()
    });
  }, [currentPhase, anamnesisState, examinationState]);
  
  // Generate intake preparation for manual (stepwise) workflow - using intelligent preparation system
  const handleGeneratePreparation = async () => {
    setIsGeneratingPreparation(true);
    try {
      // Create preparation request
      const preparationRequest: PreparationRequest = {
        patientInfo: {
          initials: patientInfo.initials,
          age: patientInfo.age,
          gender: patientInfo.gender,
          chiefComplaint: patientInfo.chiefComplaint || ''
        },
        sessionType: 'intake',
        documentContext: patientInfo.documentContext,
        documentFilename: patientInfo.documentFilename
      };

      // Validate input requirements
      const validation = validatePreparationInput(preparationRequest);
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }

      // Generate intelligent preparation
      const { systemPrompt, userPrompt, region } = await generateIntelligentPreparation(preparationRequest);

      // Call API with intelligent prompts
      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });

      if (response.success && response.data?.content) {
        setIntakePreparation(response.data.content);
        setAnamnesisState('preparation-generated');
      } else {
        console.warn('API preparation generation failed, using intelligent fallback:', response.error);
        // Generate intelligent fallback based on detected region
        const detectedRegion = preparationRequest.patientInfo.chiefComplaint
          ? detectAnatomicalRegion(preparationRequest.patientInfo.chiefComplaint)
          : null;

        let fallbackPreparation = `**🎯 Gerichte Anamnese Voorbereiding**
Hoofdklacht: ${preparationRequest.patientInfo.chiefComplaint || 'Uit geüpload document'}
${detectedRegion ? `Gedetecteerde regio: ${detectedRegion.name}` : ''}

**🎯 Werkhypothese & Differentiaaldiagnoses**
- Meest waarschijnlijke voorlopige diagnose op basis van hoofdklacht
- 2-3 alternatieve verklaringen/differentiaaldiagnoses
- Rationale voor hypotheses

**🔍 Gerichte Anamnese Vragen**`;

        if (detectedRegion) {
          fallbackPreparation += `
- Specifieke LOFTIG vragen aangepast aan ${detectedRegion.name}
- ${detectedRegion.specificQuestions.intake[0] || 'Gerichte regio-specifieke vragen'}
- ${detectedRegion.specificQuestions.intake[1] || 'Functionele impact vragen voor deze regio'}`;
        } else {
          fallbackPreparation += `
- Locatie, Ontstaan, Frequentie, Tijdsverloop, Intensiteit, Gewijzigd door
- Functionele impact vragen (ADL, werk, sport)
- Red flags screening vragen`;
        }

        fallbackPreparation += `

**📋 Aanbevolen Assessment Tests**`;

        if (detectedRegion) {
          fallbackPreparation += `
- ${detectedRegion.assessmentTests.slice(0, 2).join(', ')}
- Relevante bewegingsanalyse voor ${detectedRegion.name}
- Functionaliteit tests indien van toepassing`;
        } else {
          fallbackPreparation += `
- Basis bewegingsonderzoek en ROM
- Relevante palpatie en inspectie
- Functionele bewegingstests`;
        }

        fallbackPreparation += `

**⚠️ Aandachtspunten & Red Flags**`;

        if (detectedRegion) {
          fallbackPreparation += `
- Specifieke waarschuwingssignalen voor ${detectedRegion.name}
- Veel voorkomende aandoeningen: ${detectedRegion.commonConditions.slice(0, 2).join(', ')}
- Wanneer doorverwijzing overwegen`;
        } else {
          fallbackPreparation += `
- Algemene red flags voor musculoskeletale klachten
- Wanneer doorverwijzing overwegen
- Contra-indicaties voor behandeling`;
        }

        fallbackPreparation += `

*Let op: Deze voorbereiding is een fallback toen de AI-service niet beschikbaar was, maar wel aangepast aan uw klacht.*`;

        setIntakePreparation(fallbackPreparation);
        setAnamnesisState('preparation-generated');
        console.error('API call failed, using intelligent fallback preparation:', response.error);
      }
    } catch (error) {
      console.error('Error generating preparation:', error);

      // Create error fallback
      const errorFallback = `**Anamnese Voorbereiding**

Er is een technisch probleem opgetreden bij het genereren van de voorbereiding.

**Algemene aandachtspunten:**
- Gerichte anamnese met LOFTIG systematiek
- Functionele impact beoordeling
- Red flags screening
- Relevante lichamelijk onderzoek planning
- Werkhypothese en differentiaaldiagnoses opstellen

*Technische fout: Anamnese voorbereiding kon niet automatisch worden gegenereerd.*`;

      setIntakePreparation(errorFallback);
      setAnamnesisState('preparation-generated');
    } finally {
      setIsGeneratingPreparation(false);
    }
  };

  // NEW: Generate simplified intake preparation for automation workflow
  const handleGenerateIntakePreparation = async () => {
    setIsGeneratingPreparation(true);
    try {
      // Use the simplified prompts specified in requirements
      const systemPrompt = `Je bent een ervaren fysiotherapeut die intake-voorbereidingen maakt. Genereer een beknopte, algemene voorbereiding voor een intake gesprek.`;

      const userPrompt = `Hoofdklacht: ${patientInfo.chiefComplaint}

Genereer een beknopte voorbereiding (maximaal 250 woorden) met:
- Mogelijke vragen om uit te diepen (voor de Intake - Anamnese gedeelte)
- Relevante onderzoeken om te overwegen (voor de Intake - Onderzoek gedeelte)
- Aandachtspunten tijdens het consult

Antwoord in het Nederlands, professioneel en praktisch.`;

      // Call API with the new simplified prompts
      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0,
          },
        }),
      });

      if (response.success && response.data?.content) {
        setIntakePreparation(response.data.content);
      } else {
        console.warn('Intake preparation generation failed, using fallback:', response.error);
        const fallbackPreparation = `**Intake Voorbereiding**

**Hoofdklacht:** ${patientInfo.chiefComplaint}

**Anamnese Vragen:**
- Wanneer zijn de klachten begonnen?
- Wat maakt de klachten erger/beter?
- Hoe beïnvloeden de klachten dagelijkse activiteiten?
- Eerdere behandelingen of onderzoeken?

**Onderzoek Overwegingen:**
- ROM en functionaliteit testen
- Palpatie en inspectie
- Specifieke provocatietesten
- Kracht en stabiliteit beoordeling

**Aandachtspunten:**
- Red flags uitsluitingen
- Functionele doelen vaststellen
- Verwachtingen afstemmen

*Gegenereerd op basis van hoofdklacht: ${patientInfo.chiefComplaint}*`;

        setIntakePreparation(fallbackPreparation);
      }
    } catch (error) {
      console.error('Error generating intake preparation:', error);
      const errorFallback = `**Intake Voorbereiding - Fout**

Er kon geen automatische voorbereiding worden gegenereerd.

**Basis Aandachtspunten:**
- Anamnese: LOFTIG systematiek
- Onderzoek: ROM, kracht, functionaliteit
- Red flags screening
- Behandelplan opstellen

*Hoofdklacht: ${patientInfo.chiefComplaint}*`;

      setIntakePreparation(errorFallback);
    } finally {
      setIsGeneratingPreparation(false);
    }
  };
  
  // Handle anamnesis recording
  const handleAnamnesisRecording = (blob: Blob, duration: number) => {
    const recording: AudioRecording = {
      id: `anamnesis-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
      phase: 'anamnesis',
    };
    setAnamnesisRecording(recording);
  };
  
  // Process anamnesis
  const handleProcessAnamnesis = async () => {
    setIsProcessingAnamnesis(true);
    try {
      let transcriptionText = '';
      
      // Transcribe audio if available
      if (anamnesisRecording) {
        const transcriptionResult = await transcribeAudio(
          anamnesisRecording.blob,
          'nl',
          'Dit is een fysiotherapie anamnese gesprek in het Nederlands. Transcribeer accuraat alle medische termen en patiënt uitspraken.'
        );
        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        }
      }
      
      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, anamnesisNotes].filter(Boolean).join('\n\n');
      
      // Generate PHSB structure
      const systemPrompt = `Je bent een ervaren fysiotherapeut die PHSB anamnese kaarten maakt volgens de FysioRoadmap methodiek.`;
      
      const userPrompt = `Analyseer de volgende anamnese input en genereer een gestructureerde FysioRoadmap PHSB anamnese kaart.

Patiënt context:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Anamnese input:
${combinedInput}

Genereer een professionele PHSB structuur:

**P - Patiënt Probleem/Hulpvraag:**
[Wat is de hoofdreden van komst en wat wil de patiënt bereiken?]

**H - Historie:**
[Ontstaan, beloop, eerdere behandelingen, relevante voorgeschiedenis]

**S - Stoornissen in lichaamsfuncties en anatomische structuren:**
[Pijn, bewegingsbeperking, kracht, sensibiliteit, etc.]

**B - Beperkingen in activiteiten en participatie:**
[ADL, werk, sport, hobby's die beïnvloed zijn]

Antwoord in het Nederlands, professioneel geformatteerd.`;

      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });

      if (response.success && response.data?.content) {
        const hhsbStructure: HHSBStructure = parseHHSBText(response.data.content);

        setHhsbResults(hhsbStructure);
        setAnamnesisState('anamnesis-processed');
        // Mark anamnesis phase as completed
        setCompletedPhases(prev => [...prev.filter(p => p !== 'anamnesis'), 'anamnesis']);

        // DEBUG: Log state changes for navigation button visibility
        console.log('[HYSIO DEBUG] Anamnesis processing completed:', {
          anamnesisState: 'anamnesis-processed',
          currentPhase,
          willShowButton: currentPhase === 'anamnesis'
        });
      } else {
        // Create fallback PHSB structure
        console.warn('PHSB generation failed, creating fallback structure:', response.error);
        const fallbackHHSB: HHSBStructure = {
          patientNeeds: combinedInput || 'Handmatige invoer vereist - API verwerking mislukt',
          history: 'API verwerking niet beschikbaar. Vul handmatig historie in.',
          disorders: 'API verwerking niet beschikbaar. Vul handmatig stoornissen in.',
          limitations: 'API verwerking niet beschikbaar. Vul handmatig beperkingen in.',
          redFlags: [],
          fullStructuredText: `**HANDMATIGE INVOER VEREIST - API VERWERKING MISLUKT**

**P - Patiënt Probleem/Hulpvraag:**
${combinedInput || 'Handmatige invoer vereist - API verwerking mislukt'}

**H - Historie:**
API verwerking niet beschikbaar. Vul handmatig historie in.

**S - Stoornissen in lichaamsfuncties en anatomische structuren:**
API verwerking niet beschikbaar. Vul handmatig stoornissen in.

**B - Beperkingen in activiteiten en participatie:**
API verwerking niet beschikbaar. Vul handmatig beperkingen in.

*Let op: De AI-service was niet beschikbaar. Vul alle secties handmatig in voordat u doorgaat.*`
        };

        setHhsbResults(fallbackHHSB);
        setAnamnesisState('anamnesis-processed');
        setCompletedPhases(prev => [...prev.filter(p => p !== 'anamnesis'), 'anamnesis']);
      }
    } catch (error) {
      console.error('Error processing anamnesis:', error);
    } finally {
      setIsProcessingAnamnesis(false);
    }
  };
  
  // Navigate to examination phase
  const handleNavigateToExamination = () => {
    setCurrentPhase('examination');
  };
  
  // Generate examination proposal
  const handleGenerateExaminationProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      const systemPrompt = `Je bent een ervaren fysiotherapeut die onderzoeksplannen maakt op basis van anamnese bevindingen.`;
      
      const userPrompt = `Genereer een onderzoeksvoorstel voor fysiotherapie op basis van de anamnese bevindingen.

Patiënt informatie:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Anamnese resultaten:
${hhsbResults?.fullStructuredText || 'Geen anamnese beschikbaar'}

Genereer een gestructureerd onderzoeksplan inclusief:
1. Aanbevolen tests en metingen
2. Specifieke bewegingsonderzoeken
3. Palpatie punten
4. Functionele testen
5. Aandachtspunten tijdens onderzoek

Antwoord in het Nederlands, professioneel maar praktisch uitvoerbaar.`;

      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });
      
      if (response.success && response.data?.content) {
        setExaminationProposal(response.data.content);
        setExaminationState('proposal-generated');
      } else {
        console.warn('Examination proposal generation failed, using fallback:', response.error);
        const fallbackProposal = `**ONDERZOEKSVOORSTEL - HANDMATIGE INVOER VEREIST**

AI-verwerking was niet beschikbaar. Hieronder een basis onderzoeksvoorstel:

**1. Basis Bewegingsonderzoek**
- ROM (Range of Motion) meting
- Kracht testing
- Stabiliteit en balans
- Palpatie relevante structuren

**2. Functioneel Onderzoek**
- ADL bewegingen
- Werk-gerelateerde bewegingen
- Sport-specifieke bewegingen (indien van toepassing)

**3. Aanbevolen Tests**
- Specifieke tests afhankelijk van klacht locatie
- Provocatie tests voor pijn
- Neurologische screening indien geïndiceerd

**4. Aandachtspunten**
- Red flags uitsluitingen
- Veiligheidscontra-indicaties
- Patiënt comfort en grenzen

*Let op: Dit is een algemeen voorstel. Pas aan op basis van specifieke klacht en bevindingen.*`;

        setExaminationProposal(fallbackProposal);
        setExaminationState('proposal-generated');
      }
    } catch (error) {
      console.error('Error generating examination proposal:', error);
    } finally {
      setIsGeneratingProposal(false);
    }
  };
  
  // Handle examination recording
  const handleExaminationRecording = (blob: Blob, duration: number) => {
    const recording: AudioRecording = {
      id: `examination-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
      phase: 'examination',
    };
    setExaminationRecording(recording);
  };
  
  // Process examination
  const handleProcessExamination = async () => {
    setIsProcessingExamination(true);
    try {
      let transcriptionText = '';
      
      // Transcribe audio if available
      if (examinationRecording) {
        const transcriptionResult = await transcribeAudio(
          examinationRecording.blob,
          'nl',
          'Dit is een fysiotherapie lichamelijk onderzoek in het Nederlands. Transcribeer accuraat alle test resultaten, bevindingen en medische observaties.'
        );
        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        }
      }
      
      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, examinationNotes].filter(Boolean).join('\n\n');
      
      // Generate examination findings
      const systemPrompt = `Je bent een ervaren fysiotherapeut die onderzoeksbevindingen analyseert en structureert.`;
      
      const userPrompt = `Analyseer de volgende onderzoeksinput en genereer een gestructureerde samenvatting van de onderzoeksbevindingen.

Patiënt context:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Anamnese (referentie):
${hhsbResults?.fullStructuredText || 'Geen anamnese beschikbaar'}

Onderzoek input:
${combinedInput}

Genereer een professionele samenvatting van onderzoeksbevindingen inclusief:
1. Inspectie bevindingen
2. Palpatie resultaten
3. Bewegingsonderzoek (actief/passief ROM, kracht)
4. Specifieke testen en uitkomsten
5. Functionele beperkingen
6. Objectieve metingen

Antwoord in het Nederlands, professioneel gestructureerd.`;

      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });
      
      if (response.success && response.data?.content) {
        setExaminationFindings(response.data.content);
        setExaminationState('examination-processed');
        // Mark examination phase as completed
        setCompletedPhases(prev => [...prev.filter(p => p !== 'examination'), 'examination']);
      } else {
        console.warn('Examination findings generation failed, using fallback:', response.error);
        const fallbackFindings = `**ONDERZOEKSBEVINDINGEN - HANDMATIGE INVOER VEREIST**

AI-verwerking van onderzoeksgegevens was niet beschikbaar.

**Input Ontvangen:**
${combinedInput || 'Geen onderzoeksinput beschikbaar'}

**Te Completeren:**
- **Inspectie:** [Vul handmatig in - houding, asymmetrieën, zwelling, etc.]
- **Palpatie:** [Vul handmatig in - gevoeligheid, spanning, temperatuur, etc.]
- **ROM:** [Vul handmatig in - actief/passief bereik per gewricht]
- **Kracht:** [Vul handmatig in - MMT scores, specifieke zwaktes]
- **Functioneel:** [Vul handmatig in - ADL beperkingen, bewegingspatronen]
- **Specifieke Tests:** [Vul handmatig in - resultaten van uitgevoerde tests]

*BELANGRIJK: Vul alle onderzoeksbevindingen handmatig in voordat u doorgaat naar de klinische conclusie.*`;

        setExaminationFindings(fallbackFindings);
        setExaminationState('examination-processed');
        setCompletedPhases(prev => [...prev.filter(p => p !== 'examination'), 'examination']);
      }
    } catch (error) {
      console.error('Error processing examination:', error);
    } finally {
      setIsProcessingExamination(false);
    }
  };

  // SOEP handlers for vervolgconsult workflow
  const handleSOEPRecording = (blob: Blob, duration: number) => {
    const recording: AudioRecording = {
      id: `soep-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
      phase: 'followup',
    };
    setSOEPRecording(recording);
  };

  const handleSOEPProcessing = async () => {
    setSOEPState('processing');
    try {
      let transcriptionText = '';

      // Transcribe audio if available
      if (soepRecording) {
        const transcriptionResult = await transcribeAudio(
          soepRecording.blob,
          `SOEP vervolgconsult voor ${patientInfo.initials}`
        );

        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        } else {
          throw new Error(transcriptionResult.error || 'Transcription failed');
        }
      }

      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, soepNotes].filter(Boolean).join('\n\n');

      if (!combinedInput.trim()) {
        throw new Error('Geen input gedetecteerd voor SOEP verwerking');
      }

      // Process SOEP data using streamlined workflow
      const soepResponse = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: `Je bent een ervaren fysiotherapeut gespecialiseerd in SOEP-documentatie. Verwerk de verstrekte consultnotes in gestructureerde SOEP-format (Subjectief, Objectief, Evaluatie, Plan).`,
          userPrompt: `Patient: ${patientInfo.initials} (${patientInfo.birthYear})
Consultnotes: ${combinedInput}

Maak een gestructureerde SOEP-rapportage met duidelijke secties.`,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0,
          },
        }),
      });

      if (soepResponse.success && soepResponse.data?.content) {
        const soepStructure: SOEPStructure = {
          subjective: '',
          objective: '',
          evaluation: '',
          plan: '',
          redFlags: [],
          fullStructuredText: soepResponse.data.content,
          consultSummary: 'SOEP vervolgconsult samenvatting'
        };

        setSOEPResults(soepStructure);
        setSOEPState('processed');

        // Call the completion handler
        if (onSOEPComplete) {
          onSOEPComplete(soepStructure);
        }
      } else {
        throw new Error('Failed to process SOEP data');
      }
    } catch (error) {
      console.error('[SOEP Processing Error]', error);
      setSOEPState('initial');
    }
  };

  // Clinical conclusion handlers
  const [clinicalState, setClinicalState] = React.useState<'initial' | 'processing' | 'processed'>('initial');
  const [clinicalConclusionRecording, setClinicalConclusionRecording] = React.useState<AudioRecording | null>(null);
  const [clinicalConclusionNotes, setClinicalConclusionNotes] = React.useState<string>('');

  const handleClinicalConclusionRecording = (blob: Blob, duration: number) => {
    const recording: AudioRecording = {
      id: `clinical-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
      phase: 'examination',
    };
    setClinicalConclusionRecording(recording);
  };

  const handleClinicalConclusionProcessing = async () => {
    setClinicalState('processing');
    try {
      let transcriptionText = '';

      // Transcribe audio if available
      if (clinicalConclusionRecording) {
        const transcriptionResult = await transcribeAudio(
          clinicalConclusionRecording.blob,
          `Klinische conclusie voor ${patientInfo.initials}`
        );

        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        } else {
          throw new Error(transcriptionResult.error || 'Transcription failed');
        }
      }

      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, clinicalConclusionNotes].filter(Boolean).join('\n\n');

      if (!combinedInput.trim()) {
        throw new Error('Geen input gedetecteerd voor klinische conclusie');
      }

      // Process clinical conclusion
      setClinicalConclusion(combinedInput);
      setClinicalState('processed');

      // Call completion handler
      const intakeData: IntakeData = {
        patientInfo,
        preparation: intakePreparation,
        anamnesisRecording,
        anamnesisTranscript: '',
        hhsbStructure: hhsbResults,
        examinationPlan: '',
        examinationRecording,
        examinationFindings: examinationFindings,
        clinicalConclusion: combinedInput,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: [],
        recommendations: '',
        followUpPlan: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onComplete(intakeData);
    } catch (error) {
      console.error('[Clinical Conclusion Error]', error);
      setClinicalState('initial');
    }
  };

  // Anamnesis processing
  const handleAnamnesisProcessing = async () => {
    setAnamnesisState('processing');
    try {
      let transcriptionText = '';

      // Transcribe audio if available
      if (anamnesisRecording) {
        const transcriptionResult = await transcribeAudio(
          anamnesisRecording.blob,
          `Anamnese voor ${patientInfo.initials}`
        );

        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        } else {
          throw new Error(transcriptionResult.error || 'Transcription failed');
        }
      }

      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, anamnesisNotes].filter(Boolean).join('\n\n');

      if (!combinedInput.trim()) {
        throw new Error('Geen input gedetecteerd voor anamnese verwerking');
      }

      // Process anamnesis using existing logic
      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: `Je bent een ervaren fysiotherapeut gespecialiseerd in anamnese-documentatie volgens PHSB-methodiek.`,
          userPrompt: `Patient: ${patientInfo.initials} (${patientInfo.birthYear})
Anamnese input: ${combinedInput}

Verwerk deze anamnese volgens PHSB-structuur.`,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0,
          },
        }),
      });

      if (response.success && response.data?.content) {
        const hhsb: HHSBStructure = {
          patientNeeds: '',
          history: '',
          disorders: '',
          limitations: '',
          redFlags: [],
          fullStructuredText: response.data.content,
          anamneseSummary: 'Anamnese samenvatting'
        };

        setHhsbResults(hhsb);
        setAnamnesisState('anamnesis-processed');
        setCompletedPhases(prev => [...prev, 'anamnesis']);
      } else {
        throw new Error('Failed to process anamnesis');
      }
    } catch (error) {
      console.error('[Anamnesis Processing Error]', error);
      setAnamnesisState('initial');
    }
  };

  // Examination processing
  const handleExaminationProcessing = async () => {
    setExaminationState('processing');
    try {
      let transcriptionText = '';

      // Transcribe audio if available
      if (examinationRecording) {
        const transcriptionResult = await transcribeAudio(
          examinationRecording.blob,
          `Onderzoek voor ${patientInfo.initials}`
        );

        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        } else {
          throw new Error(transcriptionResult.error || 'Transcription failed');
        }
      }

      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, examinationNotes].filter(Boolean).join('\n\n');

      if (!combinedInput.trim()) {
        throw new Error('Geen input gedetecteerd voor onderzoek verwerking');
      }

      // Process examination
      setExaminationFindings(combinedInput);
      setExaminationState('examination-processed');
      setCompletedPhases(prev => [...prev, 'examination']);
    } catch (error) {
      console.error('[Examination Processing Error]', error);
      setExaminationState('initial');
    }
  };

  // Navigate to clinical conclusion
  const handleNavigateToClinicalConclusion = () => {
    setCurrentPhase('clinical-conclusion');
    // Do NOT auto-generate - user must click the button
  };

  // NEW: Full Automation Processing Function
  const handleFullIntakeProcessing = async () => {
    if (automationState === 'processing') return; // Prevent double-processing

    setAutomationState('processing');
    setCurrentPhase('clinical-conclusion'); // Switch to results view immediately

    try {
      // Step 1: Process transcription if audio available
      setAutomationProgress({ step: 'Audio transcriptie verwerken...', progress: 10, isComplete: false });

      let transcriptionText = '';
      if (fullIntakeRecording) {
        const transcriptionResult = await transcribeAudio(
          fullIntakeRecording.blob,
          'nl',
          'Dit is een complete fysiotherapie intake inclusief anamnese en lichamelijk onderzoek in het Nederlands. Transcribeer accuraat alle medische termen, patiënt uitspraken, en onderzoeksbevindingen.'
        );

        // FIXED: Better transcript detection - don't fail if transcript is empty
        if (transcriptionResult.success && transcriptionResult.transcript && transcriptionResult.transcript.trim()) {
          transcriptionText = transcriptionResult.transcript;
        } else {
          console.warn('Transcription failed or empty, using manual input only');
        }
      }

      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, fullIntakeInput].filter(text => text && text.trim()).join('\n\n');

      if (!combinedInput.trim()) {
        throw new Error('Geen intake gegevens beschikbaar voor verwerking');
      }

      // Step 2: Generate PHSB Anamnese structure
      setAutomationProgress({ step: 'Anamnesekaart genereren...', progress: 25, isComplete: false });

      const anamnesisSystemPrompt = `Je bent een ervaren fysiotherapeut die PHSB anamnese kaarten maakt volgens de FysioRoadmap methodiek.`;

      const anamnesisUserPrompt = `Analyseer de volgende intake input en genereer een gestructureerde FysioRoadmap PHSB anamnese kaart.

Patiënt context:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Volledige intake input:
${combinedInput}

Genereer een professionele PHSB structuur:

**P - Patiënt Probleem/Hulpvraag:**
[Wat is de hoofdreden van komst en wat wil de patiënt bereiken?]

**H - Historie:**
[Ontstaan, beloop, eerdere behandelingen, relevante voorgeschiedenis]

**S - Stoornissen in lichaamsfuncties en anatomische structuren:**
[Pijn, bewegingsbeperking, kracht, sensibiliteit, etc.]

**B - Beperkingen in activiteiten en participatie:**
[ADL, werk, sport, hobby's die beïnvloed zijn]

Antwoord in het Nederlands, professioneel geformatteerd.`;

      const anamnesisResponse = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: anamnesisSystemPrompt,
          userPrompt: anamnesisUserPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0,
          },
        }),
      });

      let hhsbStructure: HHSBStructure;
      if (anamnesisResponse.success && anamnesisResponse.data?.content) {
        hhsbStructure = parsePHSBText(anamnesisResponse.data.content);
      } else {
        // Fallback PHSB structure
        hhsbStructure = {
          patientNeeds: combinedInput,
          history: 'Automatische verwerking mislukt - handmatige invoer vereist',
          disorders: 'Automatische verwerking mislukt - handmatige invoer vereist',
          limitations: 'Automatische verwerking mislukt - handmatige invoer vereist',
          redFlags: [],
          fullStructuredText: `**P - Patiënt Probleem/Hulpvraag:**\n${combinedInput}\n\n**H - Historie:**\nAutomatische verwerking mislukt - handmatige invoer vereist\n\n**S - Stoornissen:**\nAutomatische verwerking mislukt - handmatige invoer vereist\n\n**B - Beperkingen:**\nAutomatische verwerking mislukt - handmatige invoer vereist`
        };
      }

      setHhsbResults(hhsbStructure);

      // Step 3: Generate Examination Findings
      setAutomationProgress({ step: 'Onderzoeksbevindingen genereren...', progress: 50, isComplete: false });

      const examinationSystemPrompt = `Je bent een ervaren fysiotherapeut die onderzoeksbevindingen analyseert en structureert op basis van intake gegevens.`;

      const examinationUserPrompt = `Genereer gestructureerde onderzoeksbevindingen op basis van de volledige intake input.

Patiënt context:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Anamnese (PHSB):
${hhsbStructure.fullStructuredText}

Volledige intake input (inclusief onderzoeksgegevens):
${combinedInput}

Genereer een professionele samenvatting van onderzoeksbevindingen inclusief:
1. Inspectie bevindingen
2. Palpatie resultaten
3. Bewegingsonderzoek (actief/passief ROM, kracht)
4. Specifieke testen en uitkomsten
5. Functionele beperkingen
6. Objectieve metingen

Let op: Als er geen specifieke onderzoeksgegevens zijn, genereer dan aanbevelingen voor nog uit te voeren onderzoek.

Antwoord in het Nederlands, professioneel gestructureerd.`;

      const examinationResponse = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: examinationSystemPrompt,
          userPrompt: examinationUserPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0,
          },
        }),
      });

      let examinationFindingsResult = '';
      if (examinationResponse.success && examinationResponse.data?.content) {
        examinationFindingsResult = examinationResponse.data.content;
      } else {
        examinationFindingsResult = `**ONDERZOEKSBEVINDINGEN - AUTOMATISCHE VERWERKING MISLUKT**

**Input Ontvangen:**
${combinedInput}

**Aanbevolen Onderzoek:**
- **Inspectie:** Bekijk houding, asymmetrieën, zwelling
- **Palpatie:** Beoordeel gevoeligheid, spanning, temperatuur
- **ROM:** Meet actief/passief bereik per gewricht
- **Kracht:** Voer MMT krachttesting uit
- **Functioneel:** Test ADL beperkingen en bewegingspatronen
- **Specifieke Tests:** Voer relevante provocatietesten uit

*Let op: Vul onderzoeksbevindingen handmatig aan na fysiek onderzoek.*`;
      }

      setExaminationFindings(examinationFindingsResult);

      // Step 4: Generate Clinical Conclusion
      setAutomationProgress({ step: 'Klinische conclusie genereren...', progress: 75, isComplete: false });

      const conclusionSystemPrompt = `Je bent een ervaren fysiotherapeut die klinische conclusies schrijft op basis van intake bevindingen.`;

      const conclusionUserPrompt = `Genereer een uitgebreide klinische conclusie voor deze fysiotherapie intake.

Patiënt informatie:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Anamnese (PHSB):
${hhsbStructure.fullStructuredText}

Onderzoeksbevindingen:
${examinationFindingsResult}

Genereer een professionele klinische conclusie inclusief:

**SAMENVATTING:**
[Korte samenvatting van de casus]

**WERKHYPOTHESE/DIAGNOSE:**
[Meest waarschijnlijke diagnose met onderbouwing]

**BEHANDELINDICATIE:**
[Aanbevolen behandeling en rationale]

**PROGNOSE:**
[Verwachte uitkomst en tijdslijn]

**EVALUATIEPLAN:**
[Follow-up en herbeoordelingsstrategie]

**AANBEVELINGEN:**
[Specifieke aanbevelingen voor patiënt]

Antwoord in het Nederlands, professioneel en evidence-based.`;

      const conclusionResponse = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: conclusionSystemPrompt,
          userPrompt: conclusionUserPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0,
          },
        }),
      });

      let clinicalConclusionResult = '';
      if (conclusionResponse.success && conclusionResponse.data?.content) {
        clinicalConclusionResult = conclusionResponse.data.content;
      } else {
        clinicalConclusionResult = `**KLINISCHE CONCLUSIE - AUTOMATISCHE VERWERKING MISLUKT**

**PATIËNT:** ${patientInfo.initials} (${patientInfo.age} jaar, ${patientInfo.gender})
**HOOFDKLACHT:** ${patientInfo.chiefComplaint}

**TE COMPLETEREN:**

**SAMENVATTING:**
[Handmatig in te vullen op basis van anamnese en onderzoek]

**WERKHYPOTHESE/DIAGNOSE:**
[Handmatig in te vullen - meest waarschijnlijke diagnose]

**BEHANDELINDICATIE:**
[Handmatig in te vullen - aanbevolen behandeling]

**PROGNOSE:**
[Handmatig in te vullen - verwachte uitkomst]

**EVALUATIEPLAN:**
[Handmatig in te vullen - follow-up strategie]

**AANBEVELINGEN:**
[Handmatig in te vullen - patiënt aanbevelingen]

*Let op: AI-verwerking was niet beschikbaar. Vul handmatig in.*`;
      }

      setClinicalConclusion(clinicalConclusionResult);

      // Step 5: Mark as completed
      setAutomationProgress({ step: 'Intake volledig verwerkt!', progress: 100, isComplete: true });
      setAutomationState('completed');

      // Mark all phases as completed
      setCompletedPhases(['anamnesis', 'examination', 'clinical-conclusion']);
      setAnamnesisState('anamnesis-processed');
      setExaminationState('examination-processed');

    } catch (error) {
      console.error('Full automation processing failed:', error);
      setAutomationState('error');
      setAutomationProgress({
        step: `Fout: ${error instanceof Error ? error.message : 'Onbekende fout tijdens verwerking'}`,
        progress: 0,
        isComplete: false
      });
    }
  };

  // Handle full intake recording
  const handleFullIntakeRecording = (blob: Blob, duration: number) => {
    const recording: AudioRecording = {
      id: `full-intake-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
      phase: 'full-intake' as any, // Extend the phase type
    };
    setFullIntakeRecording(recording);
  };

  // Generate clinical conclusion
  const generateClinicalConclusion = async () => {
    setIsGeneratingConclusion(true);
    try {
      const systemPrompt = `Je bent een ervaren fysiotherapeut die klinische conclusies schrijft op basis van intake bevindingen.`;
      
      const userPrompt = `Genereer een uitgebreide klinische conclusie voor deze fysiotherapie intake.

Patiënt informatie:
- Leeftijd: ${patientInfo.age || 'Onbekend'} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Anamnese (PHSB):
${hhsbResults?.fullStructuredText || 'Geen anamnese beschikbaar'}

Onderzoeksbevindingen:
${examinationFindings || 'Geen onderzoek beschikbaar'}

Genereer een professionele klinische conclusie inclusief:

**SAMENVATTING:**
[Korte samenvatting van de casus]

**WERKHYPOTHESE/DIAGNOSE:**
[Meest waarschijnlijke diagnose met onderbouwing]

**BEHANDELINDICATIE:**
[Aanbevolen behandeling en rationale]

**PROGNOSE:**
[Verwachte uitkomst en tijdslijn]

**EVALUATIEPLAN:**
[Follow-up en herbeoordelingsstrategie]

**AANBEVELINGEN:**
[Specifieke aanbevelingen voor patiënt]

Antwoord in het Nederlands, professioneel en evidence-based.`;

      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });
      
      if (response.success && response.data?.content) {
        setClinicalConclusion(response.data.content);
        // Mark clinical conclusion phase as completed
        setCompletedPhases(prev => [...prev.filter(p => p !== 'clinical-conclusion'), 'clinical-conclusion']);
      } else {
        console.warn('Clinical conclusion generation failed, using fallback:', response.error);
        const fallbackConclusion = `**KLINISCHE CONCLUSIE - HANDMATIGE INVOER VEREIST**

AI-verwerking van klinische gegevens was niet beschikbaar.

**PATIËNT:** ${patientInfo.initials} (${patientInfo.age} jaar, ${patientInfo.gender})
**HOOFDKLACHT:** ${patientInfo.chiefComplaint}

**TE COMPLETEREN:**

**SAMENVATTING:**
[Vul handmatig in - korte samenvatting van de casus op basis van anamnese en onderzoek]

**WERKHYPOTHESE/DIAGNOSE:**
[Vul handmatig in - meest waarschijnlijke diagnose met onderbouwing]

**BEHANDELINDICATIE:**
[Vul handmatig in - aanbevolen behandeling en rationale]

**PROGNOSE:**
[Vul handmatig in - verwachte uitkomst en tijdslijn]

**EVALUATIEPLAN:**
[Vul handmatig in - follow-up en herbeoordelingsstrategie]

**AANBEVELINGEN:**
[Vul handmatig in - specifieke aanbevelingen voor patiënt]

*BELANGRIJK: Vul alle secties handmatig in op basis van uw professionele beoordeling voordat u de intake afrondt.*`;

        setClinicalConclusion(fallbackConclusion);
        setCompletedPhases(prev => [...prev.filter(p => p !== 'clinical-conclusion'), 'clinical-conclusion']);
      }
    } catch (error) {
      console.error('Error generating clinical conclusion:', error);
    } finally {
      setIsGeneratingConclusion(false);
    }
  };
  
  // Export functions
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const intakeData: IntakeData = {
        patientInfo,
        preparation: intakePreparation,
        anamnesisRecording,
        anamnesisTranscript: '', // Excluded from export as per requirements
        hhsbStructure: hhsbResults,
        examinationPlan: examinationProposal,
        examinationRecording,
        examinationFindings,
        clinicalConclusion,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: hhsbResults?.redFlags || [],
        recommendations: '',
        followUpPlan: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const result = await AnonymousExportService.exportIntakeAsPDF(intakeData, patientInfo);
      if (result.success) {
        AnonymousExportService.downloadFile(result);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      const intakeData: IntakeData = {
        patientInfo,
        preparation: intakePreparation,
        anamnesisRecording,
        anamnesisTranscript: '', // Excluded from export as per requirements
        hhsbStructure: hhsbResults,
        examinationPlan: examinationProposal,
        examinationRecording,
        examinationFindings,
        clinicalConclusion,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: hhsbResults?.redFlags || [],
        recommendations: '',
        followUpPlan: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const result = await AnonymousExportService.exportIntakeAsWord(intakeData, patientInfo);
      if (result.success) {
        AnonymousExportService.downloadFile(result);
      }
    } catch (error) {
      console.error('Error exporting Word:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle stepper navigation
  const handleStepperNavigation = (phase: WorkflowPhase) => {
    // Only allow navigation to completed phases or current phase
    if (completedPhases.includes(phase) || phase === currentPhase) {
      setCurrentPhase(phase);
    }
  };
  
  // Render unified workflow content with dynamic sections based on selectedWorkflow
  const renderPhaseContent = () => {
    // Always show the unified interface with the workflow selector at the top
      return (
        <React.Fragment>
          <TwoPanelLayout
            leftPanel={
              <div className="h-full overflow-auto p-6 space-y-6">
                {/* Unified Workflow Selector */}
                <div className="bg-[#F8F8F5] border-2 border-[#A5E1C5]/30 rounded-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#004B3A] mb-2">
                      Kies uw Werkwijze
                    </h3>
                    <p className="text-sm text-[#003728]">
                      Voor {patientInfo.initials} ({patientInfo.birthYear}) - Selecteer de workflow die het beste past bij uw consultdoelen
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {/* Hysio Intake (Volledig Automatisch) */}
                    <div
                      className={cn(
                        "p-4 border-2 rounded-lg cursor-pointer transition-all",
                        selectedWorkflow === 'intake'
                          ? 'border-[#A5E1C5] bg-[#E6F5F3] shadow-md'
                          : 'border-[#A5E1C5]/30 bg-white hover:border-[#A5E1C5]/60 hover:bg-[#F8F8F5]'
                      )}
                      onClick={() => setSelectedWorkflow('intake')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            selectedWorkflow === 'intake'
                              ? 'border-[#004B3A] bg-[#004B3A]'
                              : 'border-[#A5E1C5]'
                          )}>
                            {selectedWorkflow === 'intake' && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#004B3A]">Hysio Intake (Volledig Automatisch)</h4>
                            <p className="text-xs text-[#003728] mt-1">Complete intake in één gestroomlijnde stap • 15-20 min</p>
                          </div>
                        </div>
                        <span className="text-2xl">🚀</span>
                      </div>
                    </div>

                    {/* Hysio Intake (Stapsgewijs) */}
                    <div
                      className={cn(
                        "p-4 border-2 rounded-lg cursor-pointer transition-all",
                        selectedWorkflow === 'intake-plus'
                          ? 'border-[#A5E1C5] bg-[#E6F5F3] shadow-md'
                          : 'border-[#A5E1C5]/30 bg-white hover:border-[#A5E1C5]/60 hover:bg-[#F8F8F5]'
                      )}
                      onClick={() => setSelectedWorkflow('intake-plus')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            selectedWorkflow === 'intake-plus'
                              ? 'border-[#004B3A] bg-[#004B3A]'
                              : 'border-[#A5E1C5]'
                          )}>
                            {selectedWorkflow === 'intake-plus' && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#004B3A]">Hysio Intake (Stapsgewijs)</h4>
                            <p className="text-xs text-[#003728] mt-1">Uitgebreide drie-fase intake workflow • 45-60 min</p>
                          </div>
                        </div>
                        <span className="text-2xl">👥</span>
                      </div>
                    </div>

                    {/* Hysio Consult (Vervolgconsult) */}
                    <div
                      className={cn(
                        "p-4 border-2 rounded-lg cursor-pointer transition-all",
                        selectedWorkflow === 'consult'
                          ? 'border-[#A5E1C5] bg-[#E6F5F3] shadow-md'
                          : 'border-[#A5E1C5]/30 bg-white hover:border-[#A5E1C5]/60 hover:bg-[#F8F8F5]'
                      )}
                      onClick={() => setSelectedWorkflow('consult')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            selectedWorkflow === 'consult'
                              ? 'border-[#004B3A] bg-[#004B3A]'
                              : 'border-[#A5E1C5]'
                          )}>
                            {selectedWorkflow === 'consult' && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#004B3A]">Hysio Consult (Vervolgconsult)</h4>
                            <p className="text-xs text-[#003728] mt-1">SOEP-methodiek voor vervolgconsulten • 20-30 min</p>
                          </div>
                        </div>
                        <span className="text-2xl">🩺</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Mode Description Based on Selection */}
                {selectedWorkflow === 'intake' && (
                  <div className="bg-[#A5E1C5]/20 border-2 border-[#A5E1C5]/40 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-[#10B981] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#004B3A] mb-2">
                          Volledig Geautomatiseerde Workflow
                        </h4>
                        <ul className="text-xs text-[#003728] space-y-1 list-disc list-inside">
                          <li>Voer complete intake in via één opname of tekstveld</li>
                          <li>Klik één keer op "Verwerk Volledige Intake"</li>
                          <li>Systeem genereert automatisch de Anamnesekaart, Onderzoeksbevindingen en Klinische Conclusie</li>
                          <li>Resultaten worden direct getoond</li>
                          <li>Export direct mogelijk na verwerking</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedWorkflow === 'intake-plus' && (
                  <div className="bg-[#A5E1C5]/20 border-2 border-[#A5E1C5]/40 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Target size={20} className="text-[#10B981] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#004B3A] mb-2">
                          Stapsgewijze Workflow
                        </h4>
                        <ul className="text-xs text-[#003728] space-y-1 list-disc list-inside">
                          <li>Ideaal voor complexe casuïstiek en grondige documentatie</li>
                          <li>Zorgt voor nauwkeuriger onderzoek door gefaseerde benadering</li>
                          <li>Elke stap bouwt voort op de vorige voor optimale kwaliteit</li>
                          <li>Volledige controle over het intake proces</li>
                          <li>Professionele voorbereiding voor elk onderdeel</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {selectedWorkflow === 'consult' && (
                  <div className="bg-[#A5E1C5]/20 border-2 border-[#A5E1C5]/40 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Stethoscope size={20} className="text-[#10B981] mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-[#004B3A] mb-2">
                          SOEP Vervolgconsult
                        </h4>
                        <ul className="text-xs text-[#003728] space-y-1 list-disc list-inside">
                          <li>Gestructureerde vervolgconsultatie volgens SOEP-methodiek</li>
                          <li>Systematische evaluatie van behandelvoortgang</li>
                          <li>Subjectief, Objectief, Evaluatie, Plan documentatie</li>
                          <li>Efficiënte behandelaanpassingen en vervolgplanning</li>
                          <li>Professionele rapportage voor vervolgbehandeling</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Content Based on Selected Workflow */}

                {/* Volledig Automatisch: Show Intake Voorbereiding */}
                {selectedWorkflow === 'intake' && (
                  <>
                    <CollapsibleSection
                      title="Intake Voorbereiding (Optioneel)"
                      defaultOpen={false}
                      className="border-2 border-[#A5E1C5]/30 bg-[#F8F8F5]"
                    >
                      {intakePreparation ? (
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-[#A5E1C5]/30">
                            <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-[#003728]">
                              {intakePreparation}
                            </pre>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => navigator.clipboard.writeText(intakePreparation)}
                              variant="outline"
                              size="sm"
                              className="gap-2 text-[#004B3A] border-[#A5E1C5] hover:bg-[#A5E1C5]/10"
                            >
                              <Copy size={14} />
                              Kopiëren
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Button
                            onClick={handleGenerateIntakePreparation}
                            disabled={isGeneratingPreparation}
                            className="bg-[#A5E1C5] hover:bg-[#5BC49E] text-[#004B3A]"
                          >
                            {isGeneratingPreparation ? (
                              <>
                                <div className="w-4 h-4 border-2 border-[#004B3A] border-t-transparent rounded-full animate-spin mr-2" />
                                Voorbereiden...
                              </>
                            ) : (
                              <>
                                <Lightbulb size={16} className="mr-2" />
                                Genereer Intake Voorbereiding
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CollapsibleSection>

                    {/* Progress or Instructions for Volledig Automatisch */}
                    {automationState === 'initial' && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Voer uw intake gegevens in aan de rechterkant</p>
                        <p className="text-xs mt-2">Alle resultaten verschijnen na verwerking</p>
                      </div>
                    )}
                  </>
                )}

                {/* Stapsgewijs: Show Traditional Multi-Step Interface */}
                {selectedWorkflow === 'intake-plus' && (
                  <>
                    {/* Anamnesekaart - Initially collapsed, expanded after processing */}
                    <CollapsibleSection
                      title="Anamnesekaart"
                      defaultOpen={anamnesisState === 'anamnesis-processed'}
                      className="border-2 border-hysio-mint/30"
                    >
                      {anamnesisState === 'anamnesis-processed' && hhsbResults ? (
                        <HHSBResultsPanel
                          hhsbData={hhsbResults}
                          showSources={true}
                          audioSource={!!anamnesisRecording}
                          manualSource={!!anamnesisNotes.trim()}
                          className="border-0 p-0"
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Anamnese resultaten verschijnen hier na verwerking</p>
                          <p className="text-xs mt-2">Voer uw anamnese gegevens in aan de rechterkant</p>
                        </div>
                      )}
                    </CollapsibleSection>

                    {/* Onderzoeksbevindingen */}
                    <CollapsibleSection
                      title="Onderzoeksbevindingen"
                      defaultOpen={examinationState === 'examination-processed'}
                      className="border-2 border-hysio-mint/30"
                    >
                      {examinationState === 'examination-processed' && examinationFindings ? (
                        <ExaminationResultsPanel
                          examinationData={examinationFindings}
                          showSources={true}
                          audioSource={!!examinationRecording}
                          manualSource={!!examinationNotes.trim()}
                          className="border-0 p-0"
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Onderzoeksbevindingen verschijnen hier na verwerking</p>
                          <p className="text-xs mt-2">Beschikbaar na voltooiing van de anamnese fase</p>
                        </div>
                      )}
                    </CollapsibleSection>

                    {/* Klinische Conclusie */}
                    <CollapsibleSection
                      title="Klinische Conclusie"
                      defaultOpen={currentPhase === 'clinical-conclusion'}
                      className="border-2 border-hysio-mint/30"
                    >
                      {clinicalConclusion ? (
                        <ClinicalConclusionView
                          conclusionData={clinicalConclusion}
                          patientInfo={patientInfo}
                          showSources={true}
                          className="border-0 p-0"
                        />
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Klinische conclusie verschijnt hier na verwerking</p>
                          <p className="text-xs mt-2">Beschikbaar na voltooiing van onderzoek en evaluatie</p>
                        </div>
                      )}
                    </CollapsibleSection>
                  </>
                )}

                {/* Vervolgconsult: Show SOEP Interface */}
                {selectedWorkflow === 'consult' && (
                  <div className="text-center py-8 text-[#004B3A]">
                    <Stethoscope size={48} className="mx-auto mb-4 opacity-70" />
                    <h3 className="text-lg font-semibold mb-2">SOEP Vervolgconsult</h3>
                    <p className="text-sm opacity-80">Voer uw vervolgconsult gegevens in aan de rechterkant</p>
                    <p className="text-xs mt-2 opacity-60">Systematische documentatie volgens SOEP-methodiek</p>
                  </div>
                )}
              </div>
            }
            rightPanel={
              <>
                {/* Dynamic Right Panel Based on Selected Workflow */}

                {/* Volledig Automatisch: Full Intake Input Panel */}
                {selectedWorkflow === 'intake' && (
                  <FullIntakeInputPanel
                    onRecordingComplete={handleFullIntakeRecording}
                    onManualNotesChange={setFullIntakeInput}
                    onProcessClick={handleFullIntakeProcessing}
                    manualNotes={fullIntakeInput}
                    disabled={disabled}
                    isProcessing={automationState === 'processing'}
                    recording={fullIntakeRecording}
                    canProcess={!!fullIntakeRecording || !!fullIntakeInput.trim()}
                    automationProgress={automationProgress}
                  />
                )}

                {/* Stapsgewijs: Phase-specific Input Panel */}
                {selectedWorkflow === 'intake-plus' && (
                  <>
                    {currentPhase === 'anamnesis' && (
                      <InputPanel
                        title="Anamnese"
                        icon={MessageSquare}
                        onRecordingComplete={handleAnamnesisRecording}
                        onManualNotesChange={setAnamnesisNotes}
                        onProcessClick={handleAnamnesisProcessing}
                        manualNotes={anamnesisNotes}
                        disabled={disabled}
                        isProcessing={anamnesisState === 'processing'}
                        recording={anamnesisRecording}
                        canProcess={!!anamnesisRecording || !!anamnesisNotes.trim()}
                        patientInfo={patientInfo}
                        showPreparation={true}
                        preparationData={intakePreparation}
                        onPreparationGenerate={handleGenerateIntakePreparation}
                        isGeneratingPreparation={isGeneratingPreparation}
                      />
                    )}

                    {currentPhase === 'examination' && (
                      <InputPanel
                        title="Lichamelijk Onderzoek"
                        icon={Stethoscope}
                        onRecordingComplete={handleExaminationRecording}
                        onManualNotesChange={setExaminationNotes}
                        onProcessClick={handleExaminationProcessing}
                        manualNotes={examinationNotes}
                        disabled={disabled}
                        isProcessing={examinationState === 'processing'}
                        recording={examinationRecording}
                        canProcess={!!examinationRecording || !!examinationNotes.trim()}
                        patientInfo={patientInfo}
                        phaseContext="examination"
                      />
                    )}

                    {currentPhase === 'clinical-conclusion' && (
                      <InputPanel
                        title="Klinische Conclusie"
                        icon={FileText}
                        onRecordingComplete={handleClinicalConclusionRecording}
                        onManualNotesChange={setClinicalConclusionNotes}
                        onProcessClick={handleClinicalConclusionProcessing}
                        manualNotes={clinicalConclusionNotes}
                        disabled={disabled}
                        isProcessing={clinicalState === 'processing'}
                        recording={clinicalConclusionRecording}
                        canProcess={!!clinicalConclusionRecording || !!clinicalConclusionNotes.trim()}
                        patientInfo={patientInfo}
                        phaseContext="clinical-conclusion"
                      />
                    )}
                  </>
                )}

                {/* Vervolgconsult: SOEP Input Panel */}
                {selectedWorkflow === 'consult' && (
                  <InputPanel
                    title="SOEP Vervolgconsult"
                    icon={Stethoscope}
                    onRecordingComplete={handleSOEPRecording}
                    onManualNotesChange={setSOEPNotes}
                    onProcessClick={handleSOEPProcessing}
                    manualNotes={soepNotes}
                    disabled={disabled}
                    isProcessing={soepState === 'processing'}
                    recording={soepRecording}
                    canProcess={!!soepRecording || !!soepNotes.trim()}
                    patientInfo={patientInfo}
                    phaseContext="soep"
                    showSOEPGuidance={true}
                  />
                )}
              </>
            }
          />
        </React.Fragment>
      );
  };

  // Render the unified interface with workflow selector and dynamic content
  return (
    <div className="min-h-screen bg-[#F8F8F5]">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-[#A5E1C5]/20 p-4 mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-[#004B3A] hover:bg-[#A5E1C5]/10"
              >
                ← Terug naar patiënt info
              </Button>
            </div>

            {/* Workflow Stepper - Only visible in stapsgewijs mode */}
            {selectedWorkflow === 'intake-plus' && (
              <WorkflowStepper
                currentPhase={currentPhase}
                completedPhases={completedPhases}
                onPhaseClick={handleStepperNavigation}
                disabled={disabled}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderPhaseContent()}
    </div>
  );
};
