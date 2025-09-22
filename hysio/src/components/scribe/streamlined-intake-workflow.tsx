import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TwoPanelLayout } from '@/components/ui/two-panel-layout';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { HHSBResultsPanel } from '@/components/ui/hhsb-results-panel';
import { ClinicalConclusionView } from '@/components/ui/clinical-conclusion-view';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { AssistantIntegration } from '@/components/assistant/assistant-integration';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { AnonymousExportService } from '@/lib/utils/anonymous-export-service';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import { transcribeAudio } from '@/lib/api/transcription';
import {
  Copy,
  FileText,
  MessageSquare,
  Stethoscope,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import type {
  IntakeData,
  PatientInfo,
  AudioRecording,
  HHSBStructure
} from '@/lib/types';

// Parse HHSB structured text into individual sections
const parseHHSBText = (fullText: string): HHSBStructure => {
  // Input validation and error handling
  if (!fullText || typeof fullText !== 'string') {
    console.warn('parseHHSBText: Invalid input provided, returning empty structure');
    return {
      patientNeeds: '',
      history: '',
      disorders: '',
      limitations: '',
      redFlags: [],
      fullStructuredText: '',
    };
  }

  const result: HHSBStructure = {
    patientNeeds: '',
    history: '',
    disorders: '',
    limitations: '',
    redFlags: [],
    fullStructuredText: fullText,
  };

  try {

  // Define section patterns with multiple variations
  const patterns = [
    {
      key: 'patientNeeds' as keyof HHSBStructure,
      patterns: [
        /\*\*P\s*-\s*Patiënt\s*Probleem\/Hulpvraag:?\*\*([\s\S]*?)(?=\*\*[HhSsBb]\s*-|$)/i,
        /\*\*Patiëntbehoeften:?\*\*([\s\S]*?)(?=\*\*Historie|\*\*[HhSsBb]\s*-|$)/i,
        /\*\*P:?\*\*([\s\S]*?)(?=\*\*[HhSsBb]\s*-|$)/i,
      ]
    },
    {
      key: 'history' as keyof HHSBStructure,
      patterns: [
        /\*\*H\s*-\s*Historie:?\*\*([\s\S]*?)(?=\*\*[SsBb]\s*-|$)/i,
        /\*\*Historie:?\*\*([\s\S]*?)(?=\*\*Stoornissen|\*\*[SsBb]\s*-|$)/i,
        /\*\*H:?\*\*([\s\S]*?)(?=\*\*[SsBb]\s*-|$)/i,
      ]
    },
    {
      key: 'disorders' as keyof HHSBStructure,
      patterns: [
        /\*\*S\s*-\s*Stoornissen\s*in\s*lichaamsfuncties\s*en\s*anatomische\s*structuren:?\*\*([\s\S]*?)(?=\*\*[Bb]\s*-|$)/i,
        /\*\*Stoornissen:?\*\*([\s\S]*?)(?=\*\*Beperkingen|\*\*[Bb]\s*-|$)/i,
        /\*\*S:?\*\*([\s\S]*?)(?=\*\*[Bb]\s*-|$)/i,
      ]
    },
    {
      key: 'limitations' as keyof HHSBStructure,
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
    console.error('Critical error in parseHHSBText:', error);
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

// Streamlined Input Panel component
interface StreamlinedInputPanelProps {
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

const StreamlinedInputPanel: React.FC<StreamlinedInputPanelProps> = ({
  onRecordingComplete,
  onManualNotesChange,
  onProcessClick,
  processButtonLabel = 'Verwerk Intake',
  manualNotes = '',
  disabled = false,
  isProcessing = false,
  recording,
  showProcessButton = true,
  canProcess = false,
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
              prompt: 'Dit is een fysiotherapie intake gesprek in het Nederlands. Transcribeer accuraat alle medische termen en patiënt uitspraken.',
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
            placeholder="Voer hier handmatige intake notities in..."
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
              AI Assistent voor Intake
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

type IntakePhase = 'intake' | 'results';
type WorkflowStep = 'start' | 'recording' | 'processing' | 'results';

export interface StreamlinedIntakeWorkflowProps {
  patientInfo: PatientInfo;
  onComplete: (data: IntakeData) => void;
  onBack: () => void;
  className?: string;
  disabled?: boolean;
}

const StreamlinedIntakeWorkflow: React.FC<StreamlinedIntakeWorkflowProps> = ({
  patientInfo,
  onComplete,
  onBack,
  className,
  disabled = false,
}) => {
  // State management
  const [currentPhase, setCurrentPhase] = React.useState<IntakePhase>('intake');
  const [currentStep, setCurrentStep] = React.useState<WorkflowStep>('start');
  const [recording, setRecording] = React.useState<AudioRecording | null>(null);
  const [transcription, setTranscription] = React.useState<string>('');
  const [phsbStructure, setHHSBStructure] = React.useState<HHSBStructure | null>(null);
  const [examinationFindings, setExaminationFindings] = React.useState<string>('');
  const [clinicalConclusion, setClinicalConclusion] = React.useState<string>('');
  const [preparationContent, setPreparationContent] = React.useState<string>('');

  // Document upload state
  const [documentContext, setDocumentContext] = React.useState<string>('');
  const [documentFilename, setDocumentFilename] = React.useState<string>('');

  // Manual notes state
  const [manualNotes, setManualNotes] = React.useState<string>('');

  // Input method state
  const [inputMethod, setInputMethod] = React.useState<'audio' | 'file' | null>(null);

  // File upload state
  const [uploadKey, setUploadKey] = React.useState(0);

  // Loading states
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStep, setProcessingStep] = React.useState<string>('');
  const [isExporting, setIsExporting] = React.useState(false);

  // Generate preparation content when patient info is available
  React.useEffect(() => {
    const generatePreparation = async () => {
      if (!patientInfo.chiefComplaint?.trim()) return;

      try {
        const systemPrompt = `Je bent een ervaren fysiotherapeut die intake-voorbereidingen maakt. Genereer een beknopte, algemene voorbereiding voor een intake gesprek.`;

        const userPrompt = `Hoofdklacht: ${patientInfo.chiefComplaint}

Genereer een beknopte voorbereiding (maximaal 250 woorden) met:
- Mogelijke vragen om uit te diepen (voor de Intake - Anamnese gedeelte)
- Relevante onderzoeken om te overwegen (voor de Intake - Onderzoek gedeelte)
- Aandachtspunten tijdens het consult

Antwoord in het Nederlands, professioneel en praktisch.`;

        const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
          method: 'POST',
          body: JSON.stringify({
            systemPrompt,
            userPrompt,
            options: {
              temperature: 0.4,
              max_completion_tokens: 300,
            }
          }),
        });

        if (response.success && response.data?.content) {
          setPreparationContent(response.data.content);
        }
      } catch (error) {
        console.error('Failed to generate preparation:', error);
      }
    };

    generatePreparation();
  }, [patientInfo.chiefComplaint]);

  // Document upload handler
  const handleDocumentUpload = (documentText: string, filename: string) => {
    setDocumentContext(documentText);
    setDocumentFilename(filename);
  };

  // File upload handler for intake files
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';
    setUploadKey(prev => prev + 1);

    if (!file.type.startsWith('audio/')) {
      handleRecordingError('Selecteer een audio bestand');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      handleRecordingError('Audio bestand is te groot (max 25MB)');
      return;
    }

    try {
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      const estimatedDuration = file.size / 16000; // Rough estimate

      const audioRecording: AudioRecording = {
        id: `intake-upload-${Date.now()}`,
        blob,
        duration: estimatedDuration,
        timestamp: new Date().toISOString(),
      };

      handleStopRecording(audioRecording);
    } catch (error) {
      handleRecordingError('Fout bij uploaden van audio bestand');
    }
  };

  // Recording handlers
  const handleStartRecording = () => {
    setInputMethod('audio');
    setCurrentStep('recording');
  };

  const handleStartFileUpload = () => {
    setInputMethod('file');
    // Trigger file input click programmatically
    const fileInput = document.getElementById('intake-file-upload') as HTMLInputElement;
    fileInput?.click();
  };

  const handleStopRecording = (audioRecording: AudioRecording) => {
    setRecording(audioRecording);
    setCurrentStep('recording'); // Keep in recording step, don't auto-process
    // processRecording(audioRecording); // Removed automatic processing
  };

  const handleRecordingError = (error: string) => {
    console.error('Recording error:', error);
    // Could show error message to user
  };

  // Recording complete handler
  const handleRecordingComplete = (blob: Blob, duration: number) => {
    const audioRecording: AudioRecording = {
      id: `intake-recording-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
    };
    handleStopRecording(audioRecording);
  };

  // Process intake handler
  const handleProcessIntake = () => {
    setCurrentStep('processing'); // Transition to processing step
    if (recording) {
      processRecording(recording);
    } else if (manualNotes.trim()) {
      // Process manual notes only
      processManualNotes();
    }
  };

  // Process manual notes when no recording
  const processManualNotes = async () => {
    if (!manualNotes.trim()) return;

    setIsProcessing(true);
    try {
      // Use manual notes as transcription
      setTranscription(manualNotes);

      // Continue with normal processing flow using manual notes as input
      await processRecording({
        id: `manual-notes-${Date.now()}`,
        blob: new Blob([''], { type: 'text/plain' }),
        duration: 0,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error processing manual notes:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Export handlers
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      if (!phsbStructure) return;

      const intakeData: IntakeData = {
        patientInfo,
        preparation: preparationContent,
        anamnesisRecording: recording,
        anamnesisTranscript: transcription,
        phsbStructure,
        examinationPlan: '',
        examinationRecording: null,
        examinationFindings,
        clinicalConclusion,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: phsbStructure?.redFlags || [],
        recommendations: '',
        followUpPlan: '',
        notes: manualNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AnonymousExportService.exportToPDF(intakeData, patientInfo);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      if (!phsbStructure) return;

      const intakeData: IntakeData = {
        patientInfo,
        preparation: preparationContent,
        anamnesisRecording: recording,
        anamnesisTranscript: transcription,
        phsbStructure,
        examinationPlan: '',
        examinationRecording: null,
        examinationFindings,
        clinicalConclusion,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: phsbStructure?.redFlags || [],
        recommendations: '',
        followUpPlan: '',
        notes: manualNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AnonymousExportService.exportToWord(intakeData, patientInfo);
    } catch (error) {
      console.error('Error exporting Word:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Main processing function - performs complete intake analysis
  const processRecording = async (audioRecording: AudioRecording) => {
    setIsProcessing(true);

    try {
      // Step 1: Transcription
      setProcessingStep('Transcriptie wordt verwerkt...');
      let transcriptionText = '';

      if (audioRecording.blob.size > 0 && audioRecording.blob.type !== 'text/plain') {
        // Real audio file
        const transcriptionResult = await transcribeAudio(audioRecording.blob);
        transcriptionText = transcriptionResult.text;
      } else {
        // Manual notes mode
        transcriptionText = manualNotes;
      }

      setTranscription(transcriptionText);

      // Step 2: Generate PHSB Structure
      setProcessingStep('Anamnese wordt gestructureerd...');

      const systemPrompt = `Je bent een ervaren fysiotherapeut die intake gesprekken structureert volgens de PHSB methode (Patiëntbehoeften, Historie, Stoornissen, Beperkingen).`;

      const userPrompt = `Analyseer de volgende intake transcriptie en genereer een gestructureerde PHSB documentatie.

TRANSCRIPTIE:
${transcriptionText}

${documentContext ? `\nCONTEXT DOCUMENT:\n${documentContext}` : ''}
${manualNotes ? `\nHANDMATIGE NOTITIES:\n${manualNotes}` : ''}

Genereer een complete PHSB analyse in de volgende structuur:

**P - Patiënt Probleem/Hulpvraag:**
[Hoofdklacht en hulpvraag van patiënt]

**H - Historie:**
[Relevante voorgeschiedenis, ontstaan klachten, vorige behandelingen]

**S - Stoornissen in lichaamsfuncties en anatomische structuren:**
[Waargenomen/gemeten stoornissen]

**B - Beperkingen in activiteiten en participatie:**
[ADL, werk, sport, hobby's die beïnvloed zijn]

Antwoord in het Nederlands, professioneel geformatteerd.`;

      const phsbResponse = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            temperature: 0.3,
            max_completion_tokens: 1500, // Updated for GPT-5-mini compatibility
          }
        }),
      });

      if (!phsbResponse.success) {
        throw new Error('Failed to generate PHSB structure');
      }

      const parsedPHSB = parseHHSBText(phsbResponse.data?.content || '');
      setHHSBStructure(parsedPHSB);

      // Step 3: Generate Examination Findings
      setProcessingStep('Onderzoeksbevindingen worden geanalyseerd...');

      const examinationSystemPrompt = `Je bent een ervaren fysiotherapeut die onderzoeksbevindingen analyseert en documenterert. Analyseer de gegeven informatie en genereer gestructureerde onderzoeksbevindingen.

Focus op:
- Inspectie bevindingen
- Palpatie bevindingen
- Bewegingsonderzoek (ROM, kracht, stabiliteit)
- Functioneel onderzoek
- Specifieke testen
- Observaties tijdens onderzoek

Rapporteer in duidelijke, professionele Nederlandse tekst.`;

      const examinationUserPrompt = `Analyseer de volgende informatie en genereer onderzoeksbevindingen:

TRANSCRIPT:
${transcriptionText}

PATIËNT INFORMATIE:
${JSON.stringify(patientInfo, null, 2)}

PHSB CONTEXT:
${JSON.stringify(parsedPHSB, null, 2)}

${manualNotes ? `HANDMATIGE NOTITIES:\n${manualNotes}` : ''}

${documentContext ? `DOCUMENT CONTEXT:\n${documentContext}` : ''}

Genereer gestructureerde onderzoeksbevindingen gebaseerd op deze informatie.`;

      const examinationResponse = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: examinationSystemPrompt,
          userPrompt: examinationUserPrompt
        }),
      });

      if (!examinationResponse.success) {
        console.error('Examination findings generation failed:', {
          error: examinationResponse.error,
          endpoint: API_ENDPOINTS.AI_ANALYSIS,
          requestData: {
            systemPromptLength: examinationSystemPrompt.length,
            userPromptLength: examinationUserPrompt.length,
            hasTranscript: !!transcriptionText,
            hasPatientInfo: !!patientInfo
          }
        });

        throw new Error(`Failed to generate examination findings: ${examinationResponse.error || 'Unknown error'}`);
      }

      console.log('Examination findings generated successfully:', {
        dataLength: examinationResponse.data?.data?.content?.length || 0,
        hasContent: !!examinationResponse.data?.data?.content
      });
      setExaminationFindings(examinationResponse.data?.data?.content || '');

      // Step 4: Generate Clinical Conclusion
      setProcessingStep('Klinische conclusie wordt gegenereerd...');

      const conclusionSystemPrompt = `Je bent een ervaren fysiotherapeut die klinische conclusies opstelt gebaseerd op anamnese en onderzoeksbevindingen. Formuleer een professionele klinische conclusie.

Focus op:
- Samenvatting van bevindingen
- Werkingsdiagnose/hypothese
- Prognostische factoren
- Behandeldoelen
- Behandelstrategie
- Verwachte uitkomst

Rapporteer in duidelijke, professionele Nederlandse tekst.`;

      const conclusionUserPrompt = `Stel een klinische conclusie op gebaseerd op de volgende informatie:

TRANSCRIPT:
${transcriptionText}

PATIËNT INFORMATIE:
${JSON.stringify(patientInfo, null, 2)}

PHSB CONTEXT:
${JSON.stringify(parsedPHSB, null, 2)}

ONDERZOEKSBEVINDINGEN:
${examinationResponse.data?.data?.content || ''}

${manualNotes ? `HANDMATIGE NOTITIES:\n${manualNotes}` : ''}

${documentContext ? `DOCUMENT CONTEXT:\n${documentContext}` : ''}

Formuleer een professionele klinische conclusie gebaseerd op deze informatie.`;

      const conclusionResponse = await apiCall(API_ENDPOINTS.AI_ANALYSIS, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt: conclusionSystemPrompt,
          userPrompt: conclusionUserPrompt
        }),
      });

      if (!conclusionResponse.success) {
        console.error('Clinical conclusion generation failed:', {
          error: conclusionResponse.error,
          endpoint: API_ENDPOINTS.AI_ANALYSIS,
          requestData: {
            systemPromptLength: conclusionSystemPrompt.length,
            userPromptLength: conclusionUserPrompt.length,
            hasTranscript: !!transcriptionText,
            hasExaminationFindings: !!examinationResponse.data?.data?.content
          }
        });

        throw new Error(`Failed to generate clinical conclusion: ${conclusionResponse.error || 'Unknown error'}`);
      }

      console.log('Clinical conclusion generated successfully:', {
        dataLength: conclusionResponse.data?.data?.content?.length || 0,
        hasContent: !!conclusionResponse.data?.data?.content
      });
      setClinicalConclusion(conclusionResponse.data?.data?.content || '');

      setProcessingStep('Voltooiing...');
      setCurrentStep('results');
      // setCurrentPhase('results'); // Keep in same phase, show results in left panel

    } catch (error) {
      console.error('Error processing recording:', error);
      setProcessingStep('Er is een fout opgetreden tijdens de verwerking.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render intake phase
  const renderIntakePhase = () => {
    return (
      <TwoPanelLayout
        leftPanel={
          <div className="h-full overflow-auto p-6 space-y-6">
            {/* Anamnesekaart */}
            <CollapsibleSection
              title="Anamnesekaart"
              defaultOpen={!!phsbStructure}
              className="border-2 border-hysio-mint/30"
            >
              {phsbStructure ? (
                <HHSBResultsPanel
                  hhsbData={phsbStructure}
                  preparationContent={preparationContent}
                  showSources={true}
                  audioSource={!!recording}
                  manualSource={!!manualNotes.trim()}
                  className="border-0 p-0"
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Anamnesekaart wordt hier getoond na verwerking</p>
                </div>
              )}
            </CollapsibleSection>

            {/* Onderzoeksbevindingen */}
            <CollapsibleSection
              title="Onderzoeksbevindingen"
              defaultOpen={!!examinationFindings}
              className="border-2 border-hysio-mint/30"
            >
              {examinationFindings ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-hysio-mint/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={18} className="text-hysio-deep-green" />
                        <h4 className="font-semibold text-hysio-deep-green">Bevindingen</h4>
                      </div>
                      <CopyToClipboard text={examinationFindings} size="sm" />
                    </div>
                    <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
                      {examinationFindings}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Stethoscope size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Onderzoeksbevindingen worden hier getoond na verwerking</p>
                </div>
              )}
            </CollapsibleSection>

            {/* Klinische Conclusie */}
            <CollapsibleSection
              title="Klinische Conclusie"
              defaultOpen={!!clinicalConclusion}
              className="border-2 border-hysio-mint/30"
            >
              {clinicalConclusion ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-hysio-mint/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-hysio-deep-green" />
                        <h4 className="font-semibold text-hysio-deep-green">Conclusie</h4>
                      </div>
                      <CopyToClipboard text={clinicalConclusion} size="sm" />
                    </div>
                    <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
                      {clinicalConclusion}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Klinische conclusie wordt hier getoond na verwerking</p>
                </div>
              )}
            </CollapsibleSection>
          </div>
        }
        rightPanel={
          <StreamlinedInputPanel
            onRecordingComplete={handleRecordingComplete}
            onManualNotesChange={setManualNotes}
            onProcessClick={handleProcessIntake}
            processButtonLabel="Verwerk Volledige Intake"
            manualNotes={manualNotes}
            disabled={disabled}
            isProcessing={isProcessing}
            showProcessButton={true}
            canProcess={!!recording || !!manualNotes.trim()}
          />
        }
      />
    );
  };

  // Render results phase
  const renderResultsPhase = () => {
    const intakeData: IntakeData = {
      patientInfo,
      preparation: '',
      anamnesisRecording: recording,
      anamnesisTranscript: '',
      phsbStructure,
      examinationPlan: '',
      examinationRecording: null,
      examinationFindings,
      clinicalConclusion,
      diagnosis: '',
      treatmentPlan: '',
      redFlags: phsbStructure?.redFlags || [],
      recommendations: '',
      followUpPlan: '',
      notes: manualNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return (
      <ClinicalConclusionView
        intakeData={intakeData}
        patientInfo={patientInfo}
        onExportPDF={handleExportPDF}
        onExportWord={handleExportWord}
        isExporting={isExporting}
        disabled={disabled}
      />
    );
  };

  // Render phase content
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'intake':
        return renderIntakePhase();
      case 'results':
        return renderResultsPhase();
      default:
        return null;
    }
  };

  // Complete the workflow
  const handleComplete = () => {
    if (!phsbStructure) {
      console.error('Missing required data for completion');
      return;
    }

    const intakeData: IntakeData = {
      patientInfo,
      preparation: '', // No preparation step in streamlined workflow
      anamnesisRecording: recording,
      anamnesisTranscript: '',
      phsbStructure,
      examinationPlan: '',
      examinationRecording: null,
      examinationFindings,
      clinicalConclusion,
      diagnosis: '',
      treatmentPlan: '',
      redFlags: phsbStructure?.redFlags || [],
      recommendations: '',
      followUpPlan: '',
      notes: manualNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onComplete(intakeData);
  };



  return (
    <div className={cn('w-full min-h-screen', className)}>
      {/* Header */}
      <div className="bg-white border-b border-hysio-mint/20 p-6 mb-6">
        <div className="w-full px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-hysio-deep-green">
                Hysio Intake
              </h1>
              <p className="text-sm text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) - {patientInfo.chiefComplaint}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onBack}
              disabled={disabled}
            >
              Terug naar patiënt info
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pb-8">
        {renderPhaseContent()}
      </div>

      {/* Bottom navigation for results phase */}
      {currentPhase === 'results' && phsbStructure && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-hysio-mint/20 shadow-2xl z-[9999]">
          <div className="max-w-6xl mx-auto p-6">
            <Button
              onClick={handleComplete}
              disabled={disabled}
              size="lg"
              className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white py-4 text-xl font-semibold mb-3"
            >
              <CheckCircle size={24} className="mr-3" />
              Intake Afronden
              <ChevronRight size={24} className="ml-3" />
            </Button>
            <p className="text-center text-sm text-hysio-deep-green-900/60">
              ✅ Intake voltooid - Alle documentatie is gegenereerd
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export { StreamlinedIntakeWorkflow };