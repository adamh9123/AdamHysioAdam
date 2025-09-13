import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { AssistantIntegration } from '@/components/assistant/assistant-integration';
import { 
  Mic, 
  Upload, 
  MessageSquare,
  FileText
} from 'lucide-react';
import { AudioRecording } from '@/lib/types';

interface ConsultInputPanelProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onManualNotesChange?: (notes: string) => void;
  onProcessClick?: () => void;
  manualNotes?: string;
  disabled?: boolean;
  isProcessing?: boolean;
  recording?: AudioRecording | null;
  canProcess?: boolean;
  className?: string;
}

export const ConsultInputPanel: React.FC<ConsultInputPanelProps> = ({
  onRecordingComplete,
  onManualNotesChange,
  onProcessClick,
  manualNotes = '',
  disabled = false,
  isProcessing = false,
  recording,
  canProcess = false,
  className
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
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-[#003728]">
          Consult Invoer
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-6">
        {/* Audio Opname Sectie */}
        <CollapsibleSection 
          title="Audio Opname"
          defaultOpen={true}
          className="border-2 border-hysio-mint/30"
        >
          <div className="space-y-4">
            {/* Audio Recorder */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Mic size={16} className="text-hysio-deep-green" />
                <span className="text-sm font-medium text-hysio-deep-green">
                  Live Opname
                </span>
              </div>
              
              <AudioRecorder
                onRecordingComplete={onRecordingComplete}
                autoTranscribe={false}
                transcriptionOptions={{
                  language: 'nl',
                  prompt: 'Dit is een fysiotherapie vervolgconsult in het Nederlands. Transcribeer accuraat alle medische termen, observaties en behandelnotities.',
                  temperature: 0.0,
                }}
                disabled={disabled || isProcessing}
                maxDuration={1800000}
              />
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Of</span>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Button
                variant="secondary"
                onClick={() => document.getElementById(`audio-upload-${uploadKey}`)?.click()}
                disabled={disabled || isProcessing}
                className="w-full flex items-center gap-2"
              >
                <Upload size={16} />
                Upload Audiobestand
              </Button>
              
              <input
                id={`audio-upload-${uploadKey}`}
                key={uploadKey}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <p className="text-xs text-gray-500">
                Ondersteunde formaten: MP3, WAV, M4A, MP4. Maximaal 25MB.
              </p>
            </div>
          </div>
        </CollapsibleSection>

        {/* Handmatige Invoer */}
        <CollapsibleSection 
          title="Handmatige Invoer"
          defaultOpen={true}
          className="border-2 border-hysio-mint/30"
        >
          <div className="space-y-4">
            <textarea
              value={manualNotes}
              onChange={(e) => onManualNotesChange?.(e.target.value)}
              placeholder="Typ hier uw observaties, meetresultaten, etc..."
              disabled={disabled || isProcessing}
              rows={5}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'focus:ring-hysio-mint focus:border-hysio-mint resize-y',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-sm leading-relaxed'
              )}
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
                AI Assistent voor Vervolgconsult
              </span>
            </div>
            <AssistantIntegration
              isCollapsed={false}
              className="border-0 bg-transparent p-0"
            />
          </div>
        </CollapsibleSection>
      </CardContent>

      {/* Process Button */}
      {canProcess && (
        <div className="border-t border-gray-200 p-4">
          <Button
            onClick={onProcessClick}
            disabled={disabled || isProcessing || !canProcess}
            size="lg"
            className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white py-3"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Verwerken...
              </>
            ) : (
              <>
                <FileText size={20} className="mr-2" />
                Verwerk in SOEP
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ConsultInputPanel;