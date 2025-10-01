'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { UnifiedAudioInput } from './unified-audio-input';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';
import { LoadingSpinner } from './loading-spinner';
import {
  CheckCircle,
  AlertCircle,
  Mic,
  Edit3,
  Lightbulb,
  Play,
  Pause,
  Clock,
  FileText,
  Upload,
  RotateCcw
} from 'lucide-react';
import type { WorkflowType, PatientInfo } from '@/types/api';
import type { AudioTranscription } from '@/lib/types';

export interface InputMethod {
  type: 'recording' | 'upload' | 'manual';
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  enabled?: boolean;
}

export interface WorkflowInputData {
  preparation?: string;
  inputMethod?: 'recording' | 'upload' | 'manual' | null;
  recording?: {
    blob: Blob | null;
    duration: number;
    file?: File;
  };
  transcript?: string;
  manualNotes?: string;
  isProcessing?: boolean;
  error?: string | null;
}

export interface WorkflowInputPanelProps {
  // Core workflow info
  workflowType: WorkflowType;
  step: string;
  patientInfo?: PatientInfo | null;

  // Data and state
  data: WorkflowInputData;
  onDataChange: (data: Partial<WorkflowInputData>) => void;

  // Actions
  onProcess?: () => void;
  onGeneratePreparation?: () => void;

  // Configuration
  title?: string;
  description?: string;
  enabledMethods?: ('recording' | 'upload' | 'manual')[];
  showPreparation?: boolean;
  showProgress?: boolean;
  autoTranscribe?: boolean;

  // UI options
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
  disabled?: boolean;

  // Audio options
  maxRecordingDuration?: number;
  maxUploadSize?: number;
  acceptedAudioTypes?: string[];

  // Manual input options
  manualInputRows?: number;
  manualInputPlaceholder?: string;
  manualInputHelper?: string;

  // Processing options
  processingMessage?: string;
  successMessage?: string;
}

const DEFAULT_INPUT_METHODS: InputMethod[] = [
  {
    type: 'recording',
    label: 'Live Opname',
    description: 'Neem de sessie live op',
    icon: Mic,
    enabled: true
  },
  {
    type: 'upload',
    label: 'Audio Upload',
    description: 'Upload een bestaand audiobestand',
    icon: Upload,
    enabled: true
  },
  {
    type: 'manual',
    label: 'Handmatige Invoer',
    description: 'Typ notities handmatig in',
    icon: Edit3,
    enabled: true
  }
];

const WORKFLOW_TITLES = {
  'intake-stapsgewijs': {
    anamnese: 'Anamnese Gegevens',
    onderzoek: 'Onderzoek Bevindingen',
    'klinische-conclusie': 'Klinische Conclusie'
  },
  'intake-automatisch': {
    intake: 'Automatische Intake'
  },
  'consult': {
    consult: 'Vervolgconsult SOEP'
  }
};

const WORKFLOW_DESCRIPTIONS = {
  'intake-stapsgewijs': {
    anamnese: 'Leg de anamnese vast met de HHSB-structuur',
    onderzoek: 'Documenteer de onderzoeksbevindingen',
    'klinische-conclusie': 'Formuleer diagnose en behandelplan'
  },
  'intake-automatisch': {
    intake: 'Volledige intake in één gestructureerde opname'
  },
  'consult': {
    consult: 'SOEP-structuur voor vervolgconsulten'
  }
};

const MANUAL_PLACEHOLDERS = {
  'intake-stapsgewijs': {
    anamnese: 'Voer hier de anamnese informatie in...\n\nDenk aan:\n• Hulpvraag\n• Historie van de klachten\n• Stoornissen\n• Beperkingen',
    onderzoek: 'Voer hier de onderzoeksbevindingen in...\n\nDenk aan:\n• Fysieke testen\n• Bewegingsonderzoek\n• Palpatie bevindingen',
    'klinische-conclusie': 'Voer hier de klinische conclusie in...\n\nDenk aan:\n• Diagnose\n• Behandelplan\n• Vervolgafspraken'
  },
  'intake-automatisch': {
    intake: 'Voer hier uw complete intake notities in...\n\nStructureer volgens:\n• Anamnese (HHSB)\n• Onderzoek\n• Conclusie'
  },
  'consult': {
    consult: 'Voer hier uw consultverzag in...\n\nSOEP-structuur:\n• Subjectief\n• Objectief\n• Evaluatie\n• Plan'
  }
};

export const WorkflowInputPanel: React.FC<WorkflowInputPanelProps> = ({
  workflowType,
  step,
  patientInfo,
  data,
  onDataChange,
  onProcess,
  onGeneratePreparation,
  title: customTitle,
  description: customDescription,
  enabledMethods = ['recording', 'upload', 'manual'],
  showPreparation = true,
  showProgress = false,
  autoTranscribe = false,
  variant = 'default',
  className = '',
  disabled = false,
  maxRecordingDuration = 3600000, // 60 minutes
  maxUploadSize = 70, // MB
  acceptedAudioTypes = ['audio/*'],
  manualInputRows = 8,
  manualInputPlaceholder,
  manualInputHelper,
  processingMessage = 'Verwerken...',
  successMessage = 'Verwerkt!',
}) => {
  const title = customTitle || WORKFLOW_TITLES[workflowType]?.[step as keyof typeof WORKFLOW_TITLES[typeof workflowType]] || 'Workflow Input';
  const description = customDescription || WORKFLOW_DESCRIPTIONS[workflowType]?.[step as keyof typeof WORKFLOW_DESCRIPTIONS[typeof workflowType]] || 'Kies uw invoermethode';
  const placeholder = manualInputPlaceholder || MANUAL_PLACEHOLDERS[workflowType]?.[step as keyof typeof MANUAL_PLACEHOLDERS[typeof workflowType]] || 'Voer uw notities in...';

  // Filter available input methods
  const availableMethods = DEFAULT_INPUT_METHODS.filter(method =>
    enabledMethods.includes(method.type)
  );

  const handleAudioReady = React.useCallback((blob: Blob, duration: number, source: 'recording' | 'upload') => {
    onDataChange({
      inputMethod: source,
      recording: {
        blob: source === 'recording' ? blob : null,
        duration,
        file: source === 'upload' ? blob as unknown as File : undefined,
      },
      manualNotes: '', // Clear manual notes when audio is provided
    });
  }, [onDataChange]);

  const handleManualNotesChange = React.useCallback((value: string) => {
    onDataChange({
      inputMethod: 'manual',
      manualNotes: value,
      recording: { blob: null, duration: 0 }, // Clear recording when manual input is used
    });
  }, [onDataChange]);

  const handleTranscriptionComplete = React.useCallback((transcription: AudioTranscription) => {
    onDataChange({
      transcript: transcription.text,
    });
  }, [onDataChange]);

  const handleError = React.useCallback((error: string) => {
    onDataChange({ error });
  }, [onDataChange]);

  const hasInput = Boolean(
    data.recording?.blob ||
    data.recording?.file ||
    (data.manualNotes && data.manualNotes.trim().length > 0)
  );

  const canProcess = hasInput && !data.isProcessing && onProcess;

  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  return (
    <div className={cn('space-y-6', className)}>
      {/* Preparation Section */}
      {showPreparation && !isMinimal && (
        <Card>
          <CardHeader className={cn(isCompact && 'pb-3')}>
            <CardTitle className={cn('flex items-center gap-2 text-hysio-deep-green', isCompact && 'text-base')}>
              <Lightbulb size={isCompact ? 16 : 20} />
              Voorbereiding
            </CardTitle>
            {!isCompact && (
              <CardDescription>
                Automatisch gegenereerde voorbereiding voor dit werkstap
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {data.preparation ? (
              <div className="space-y-4">
                <div className="bg-hysio-mint/10 rounded-lg p-4">
                  <div className={cn('text-hysio-deep-green-900/80 whitespace-pre-wrap', isCompact ? 'text-sm' : 'text-sm')}>
                    {data.preparation}
                  </div>
                </div>
                {onGeneratePreparation && (
                  <Button
                    variant="outline"
                    size={isCompact ? 'sm' : 'default'}
                    onClick={onGeneratePreparation}
                    disabled={disabled || data.isProcessing}
                    className="text-hysio-deep-green border-hysio-mint"
                  >
                    <RotateCcw size={isCompact ? 12 : 14} className="mr-1" />
                    Regenereren
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className={cn('text-hysio-deep-green-900/60 mb-4', isCompact && 'text-sm')}>
                  Geen voorbereiding beschikbaar
                </p>
                {onGeneratePreparation && (
                  <Button
                    onClick={onGeneratePreparation}
                    disabled={disabled || data.isProcessing}
                    size={isCompact ? 'sm' : 'default'}
                    className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green"
                  >
                    <Lightbulb size={isCompact ? 14 : 16} className="mr-2" />
                    Voorbereiding Genereren
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {data.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {data.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Input Panel */}
      <Card>
        <CardHeader className={cn(isCompact && 'pb-3')}>
          <CardTitle className={cn('text-hysio-deep-green', isCompact && 'text-base')}>
            {title}
          </CardTitle>
          {!isMinimal && (
            <CardDescription>
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className={cn('space-y-6', isCompact && 'space-y-4', isMinimal && 'space-y-2')}>
            {/* Audio Input Section */}
            {(enabledMethods.includes('recording') || enabledMethods.includes('upload')) && (
              <div className="space-y-4">
                {!isMinimal && (
                  <div className="flex items-center gap-2 text-hysio-deep-green">
                    <Mic size={isCompact ? 16 : 18} />
                    <h3 className={cn('font-medium', isCompact ? 'text-base' : 'text-lg')}>
                      Audio Invoer
                    </h3>
                  </div>
                )}

                <UnifiedAudioInput
                  onAudioReady={handleAudioReady}
                  onTranscriptionComplete={autoTranscribe ? handleTranscriptionComplete : undefined}
                  onError={handleError}
                  disabled={disabled || data.isProcessing}
                  allowUpload={enabledMethods.includes('upload')}
                  maxDuration={maxRecordingDuration}
                  maxUploadSize={maxUploadSize}
                  acceptedTypes={acceptedAudioTypes}
                  showTips={!isCompact && !isMinimal}
                  showTimer={!isMinimal}
                  autoTranscribe={autoTranscribe}
                  variant={variant}
                  preferredInputMethod={enabledMethods.includes('recording') && enabledMethods.includes('upload') ? 'either' : enabledMethods.includes('recording') ? 'recording' : 'upload'}
                />

                {/* Audio Status */}
                {(data.recording?.blob || data.recording?.file) && !isMinimal && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span className={isCompact ? 'text-sm' : 'text-sm'}>
                        Audio gereed
                        {data.recording?.blob && data.recording.duration &&
                         ` (opname: ${Math.round(data.recording.duration / 1000)}s)`}
                        {data.recording?.file && ` (bestand: ${data.recording.file.name})`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manual Input Section */}
            {enabledMethods.includes('manual') && (
              <div className={cn('space-y-4', enabledMethods.length > 1 && !isMinimal && 'pt-4 border-t border-hysio-mint/30')}>
                {!isMinimal && (
                  <div className="flex items-center gap-2 text-hysio-deep-green">
                    <Edit3 size={isCompact ? 16 : 18} />
                    <h3 className={cn('font-medium', isCompact ? 'text-base' : 'text-lg')}>
                      Handmatige Invoer
                    </h3>
                  </div>
                )}

                <Textarea
                  placeholder={placeholder}
                  value={data.manualNotes || ''}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  disabled={disabled || data.isProcessing}
                  rows={isCompact ? Math.max(4, manualInputRows - 2) : manualInputRows}
                  className="resize-none"
                />

                {manualInputHelper && !isMinimal && (
                  <p className="text-xs text-hysio-deep-green-900/60">
                    {manualInputHelper}
                  </p>
                )}
              </div>
            )}

            {/* Processing Section */}
            {data.isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <LoadingSpinner size={isCompact ? 16 : 20} />
                  <span className={cn('text-blue-700 font-medium', isCompact && 'text-sm')}>
                    {processingMessage}
                  </span>
                </div>
              </div>
            )}

            {/* Process Button */}
            {onProcess && !isMinimal && (
              <div className="flex justify-end pt-4 border-t border-hysio-mint/20">
                <Button
                  onClick={onProcess}
                  disabled={!canProcess}
                  size={isCompact ? 'default' : 'lg'}
                  className="bg-hysio-deep-green hover:bg-hysio-deep-green/90"
                >
                  {data.isProcessing ? (
                    <>
                      <LoadingSpinner size={isCompact ? 14 : 16} className="mr-2" />
                      Verwerken...
                    </>
                  ) : (
                    <>
                      <Play size={isCompact ? 14 : 16} className="mr-2" />
                      Verwerken
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Progress Indicator */}
            {showProgress && !isMinimal && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-hysio-deep-green-900/70">Voortgang</span>
                  <span className="text-hysio-deep-green font-medium">
                    {hasInput ? (data.isProcessing ? 'Verwerken...' : 'Gereed voor verwerking') : 'Wachtend op input'}
                  </span>
                </div>
                <Progress
                  value={hasInput ? (data.isProcessing ? 50 : 100) : 0}
                  className="h-2"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowInputPanel;