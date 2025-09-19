import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TwoPanelLayout } from '@/components/ui/two-panel-layout';
import { InputPanel } from '@/components/ui/input-panel';
import { GuidancePanel } from '@/components/ui/guidance-panel';
import { PHSBResultsPanel } from '@/components/ui/phsb-results-panel';
import { ExaminationResultsPanel } from '@/components/ui/examination-results-panel';
import { ClinicalConclusionView } from '@/components/ui/clinical-conclusion-view';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
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
  PHSBStructure
} from '@/lib/types';

// Parse PHSB structured text into individual sections
const parsePHSBText = (fullText: string): PHSBStructure => {
  const result: PHSBStructure = {
    patientNeeds: '',
    history: '',
    disorders: '',
    limitations: '',
    redFlags: [],
    fullStructuredText: fullText,
  };

  // Define section patterns with multiple variations
  const patterns = [
    // Patient/Patiënt patterns
    {
      key: 'patientNeeds' as keyof PHSBStructure,
      patterns: [
        /\*\*P\s*-\s*Patiënt\s*Probleem\/Hulpvraag:?\*\*([\s\S]*?)(?=\*\*[HhSsBb]\s*-|$)/i,
        /\*\*Patiëntbehoeften:?\*\*([\s\S]*?)(?=\*\*Historie|\*\*[HhSsBb]\s*-|$)/i,
        /\*\*P:?\*\*([\s\S]*?)(?=\*\*[HhSsBb]\s*-|$)/i,
      ]
    },
    // Historie patterns
    {
      key: 'history' as keyof PHSBStructure,
      patterns: [
        /\*\*H\s*-\s*Historie:?\*\*([\s\S]*?)(?=\*\*[SsBb]\s*-|$)/i,
        /\*\*Historie:?\*\*([\s\S]*?)(?=\*\*Stoornissen|\*\*[SsBb]\s*-|$)/i,
        /\*\*H:?\*\*([\s\S]*?)(?=\*\*[SsBb]\s*-|$)/i,
      ]
    },
    // Stoornissen patterns
    {
      key: 'disorders' as keyof PHSBStructure,
      patterns: [
        /\*\*S\s*-\s*Stoornissen\s*in\s*lichaamsfuncties\s*en\s*anatomische\s*structuren:?\*\*([\s\S]*?)(?=\*\*[Bb]\s*-|$)/i,
        /\*\*Stoornissen:?\*\*([\s\S]*?)(?=\*\*Beperkingen|\*\*[Bb]\s*-|$)/i,
        /\*\*S:?\*\*([\s\S]*?)(?=\*\*[Bb]\s*-|$)/i,
      ]
    },
    // Beperkingen patterns
    {
      key: 'limitations' as keyof PHSBStructure,
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
    /\*\*Rode\s*Vlagen:?\*\*([\s\S]*?)$/i,
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

export interface NewIntakeWorkflowProps {
  patientInfo: PatientInfo;
  onComplete: (intakeData: IntakeData) => void;
  onBack: () => void;
  initialData?: Partial<IntakeData>;
  disabled?: boolean;
  className?: string;
}

export const NewIntakeWorkflow: React.FC<NewIntakeWorkflowProps> = ({
  patientInfo,
  onComplete,
  onBack,
  initialData = {},
  disabled = false,
  className,
}) => {
  // Phase management
  const [currentPhase, setCurrentPhase] = React.useState<WorkflowPhase>('anamnesis');
  const [completedPhases, setCompletedPhases] = React.useState<WorkflowPhase[]>([]);
  
  // Anamnesis state management
  const [anamnesisState, setAnamnesisState] = React.useState<AnamnesisState>('initial');
  const [intakePreparation, setIntakePreparation] = React.useState<string>('');
  const [anamnesisRecording, setAnamnesisRecording] = React.useState<AudioRecording | null>(null);
  const [anamnesisNotes, setAnamnesisNotes] = React.useState<string>('');
  const [phsbResults, setPhsbResults] = React.useState<PHSBStructure | null>(null);
  
  // Examination state management
  const [examinationState, setExaminationState] = React.useState<ExaminationState>('initial');
  const [examinationProposal, setExaminationProposal] = React.useState<string>('');
  const [examinationRecording, setExaminationRecording] = React.useState<AudioRecording | null>(null);
  const [examinationNotes, setExaminationNotes] = React.useState<string>('');
  const [examinationFindings, setExaminationFindings] = React.useState<string>('');
  
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
    if (initialData.phsbStructure) setPhsbResults(initialData.phsbStructure);
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
  
  // Generate intake preparation using intelligent preparation system
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

        let fallbackPreparation = `**🎯 Gerichte Intake Voorbereiding**
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
      const errorFallback = `**Intake Voorbereiding**

Er is een technisch probleem opgetreden bij het genereren van de voorbereiding.

**Algemene aandachtspunten:**
- Gerichte anamnese met LOFTIG systematiek
- Functionele impact beoordeling
- Red flags screening
- Relevante lichamelijk onderzoek planning
- Werkhypothese en differentiaaldiagnoses opstellen

*Technische fout: Intake voorbereiding kon niet automatisch worden gegenereerd.*`;

      setIntakePreparation(errorFallback);
      setAnamnesisState('preparation-generated');
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
        const phsbStructure: PHSBStructure = parsePHSBText(response.data.content);

        setPhsbResults(phsbStructure);
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
        const fallbackPHSB: PHSBStructure = {
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

        setPhsbResults(fallbackPHSB);
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
${phsbResults?.fullStructuredText || 'Geen anamnese beschikbaar'}

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
${phsbResults?.fullStructuredText || 'Geen anamnese beschikbaar'}

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
  
  // Navigate to clinical conclusion
  const handleNavigateToClinicalConclusion = () => {
    setCurrentPhase('clinical-conclusion');
    // Do NOT auto-generate - user must click the button
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
${phsbResults?.fullStructuredText || 'Geen anamnese beschikbaar'}

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
        phsbStructure: phsbResults,
        examinationPlan: examinationProposal,
        examinationRecording,
        examinationFindings,
        clinicalConclusion,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: phsbResults?.redFlags || [],
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
        phsbStructure: phsbResults,
        examinationPlan: examinationProposal,
        examinationRecording,
        examinationFindings,
        clinicalConclusion,
        diagnosis: '',
        treatmentPlan: '',
        redFlags: phsbResults?.redFlags || [],
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
  
  // Render phase content
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'anamnesis':
        return (
          <React.Fragment>
            <TwoPanelLayout
              leftPanel={
                <div className="h-full overflow-auto p-6 space-y-6">
                  {/* Anamnesekaart - Initially collapsed, expanded after processing */}
                  <CollapsibleSection 
                    title="Anamnesekaart"
                    defaultOpen={anamnesisState === 'anamnesis-processed'}
                    className="border-2 border-hysio-mint/30"
                  >
                    {anamnesisState === 'anamnesis-processed' && phsbResults ? (
                      <PHSBResultsPanel
                        phsbData={phsbResults}
                        showSources={true}
                        audioSource={!!anamnesisRecording}
                        manualSource={!!anamnesisNotes.trim()}
                        className="border-0 p-0"
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Anamnesekaart wordt hier getoond na verwerking</p>
                      </div>
                    )}
                  </CollapsibleSection>
                  
                  {/* Intake Voorbereiding (Referentie) - Always collapsible, stays below anamnesekaart */}
                  <CollapsibleSection 
                    title="Intake Voorbereiding (Referentie)"
                    defaultOpen={true}
                    className="border-2 border-amber-200 bg-amber-50/30"
                  >
                    {intakePreparation ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-amber-200">
                          <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
                            {intakePreparation}
                          </pre>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={() => navigator.clipboard.writeText(intakePreparation)}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-amber-700 border-amber-200 hover:bg-amber-50"
                          >
                            <Copy size={14} />
                            Kopiëren
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-4">
                        <div className="flex gap-3 justify-center">
                          <Button
                            onClick={handleGeneratePreparation}
                            disabled={isGeneratingPreparation}
                            className="bg-hysio-mint hover:bg-hysio-mint/90"
                          >
                            {isGeneratingPreparation ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Voorbereiden...
                              </>
                            ) : (
                              <>
                                <Lightbulb size={16} className="mr-2" />
                                Genereer Voorbereiding
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setIntakePreparation(''); // Set empty preparation to indicate skipped
                              setAnamnesisState('preparation-generated'); // Move to next state
                            }}
                            variant="outline"
                            disabled={isGeneratingPreparation}
                            className="border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            <ChevronRight size={16} className="mr-2" />
                            Overslaan
                          </Button>
                        </div>
                      </div>
                    )}
                  </CollapsibleSection>
                </div>
              }
              rightPanel={
                <NewAnamnesisInputPanel
                  onRecordingComplete={handleAnamnesisRecording}
                  onManualNotesChange={setAnamnesisNotes}
                  onProcessClick={handleProcessAnamnesis}
                  processButtonLabel="Verwerk Anamnese"
                  manualNotes={anamnesisNotes}
                  disabled={disabled}
                  isProcessing={isProcessingAnamnesis}
                  recording={anamnesisRecording}
                  showProcessButton={true}
                  canProcess={!!anamnesisRecording || !!anamnesisNotes.trim()}
                />
              }
            />
            
          </React.Fragment>
        );
        
      case 'examination':
        return (
          <React.Fragment>
            <TwoPanelLayout
              leftPanel={
                <div className="h-full overflow-auto p-6 space-y-6">
                  {/* Onderzoeksbevindingen - Initially collapsed, expanded after processing */}
                  <CollapsibleSection 
                    title="Onderzoeksbevindingen"
                    defaultOpen={examinationState === 'examination-processed'}
                    className="border-2 border-hysio-mint/30"
                  >
                    {examinationState === 'examination-processed' && examinationFindings ? (
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
                  
                  {/* Onderzoeksvoorstel - Initially expanded, collapsed after processing */}
                  <CollapsibleSection 
                    title="Onderzoeksvoorstel"
                    defaultOpen={examinationState !== 'examination-processed'}
                    className="border-2 border-hysio-mint/30"
                  >
                    {examinationProposal ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-hysio-mint/20">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <Target size={18} className="text-hysio-deep-green" />
                              <h4 className="font-semibold text-hysio-deep-green">Onderzoeksplan</h4>
                            </div>
                            <CopyToClipboard text={examinationProposal} size="sm" />
                          </div>
                          <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
                            {examinationProposal}
                          </pre>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            onClick={handleGenerateExaminationProposal}
                            disabled={isGeneratingProposal}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <RotateCcw size={14} />
                            Vernieuwen
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Button
                          onClick={handleGenerateExaminationProposal}
                          disabled={isGeneratingProposal}
                          className="bg-hysio-mint hover:bg-hysio-mint/90"
                        >
                          {isGeneratingProposal ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Genereren...
                            </>
                          ) : (
                            <>
                              <Target size={16} className="mr-2" />
                              Genereer Onderzoeksvoorstel
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CollapsibleSection>
                </div>
              }
              rightPanel={
                <InputPanel
                  phase="examination"
                  onRecordingComplete={handleExaminationRecording}
                  onManualNotesChange={setExaminationNotes}
                  onProcessClick={handleProcessExamination}
                  processButtonLabel="Verwerk Onderzoek"
                  manualNotes={examinationNotes}
                  disabled={disabled}
                  isProcessing={isProcessingExamination}
                  recording={examinationRecording}
                  showProcessButton={true}
                  hasProcessed={examinationState === 'examination-processed'}
                />
              }
            />
            
          </React.Fragment>
        );
        
      case 'clinical-conclusion':
        // If no clinical conclusion generated yet, show the generation button
        if (!clinicalConclusion) {
          return (
            <div className="w-full max-w-4xl mx-auto p-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-hysio-deep-green" />
                </div>
                <h2 className="text-2xl font-bold text-hysio-deep-green mb-4">
                  Fase 3: Klinische Conclusie
                </h2>
                <p className="text-hysio-deep-green-900/70 mb-8 max-w-md mx-auto">
                  Genereer de definitieve klinische conclusie op basis van de anamnese en onderzoeksbevindingen.
                </p>
                <Button
                  onClick={generateClinicalConclusion}
                  disabled={isGeneratingConclusion || disabled}
                  size="lg"
                  className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 px-12 py-4 text-lg"
                >
                  {isGeneratingConclusion ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Klinische Conclusie Genereren...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={24} className="mr-3" />
                      Genereer Klinische Conclusie
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        }

        // If clinical conclusion is generated, show the full view
        const intakeData: IntakeData = {
          patientInfo,
          preparation: intakePreparation,
          anamnesisRecording,
          anamnesisTranscript: '',
          phsbStructure: phsbResults,
          examinationPlan: examinationProposal,
          examinationRecording,
          examinationFindings,
          clinicalConclusion,
          diagnosis: '',
          treatmentPlan: '',
          redFlags: phsbResults?.redFlags || [],
          recommendations: '',
          followUpPlan: '',
          notes: '',
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
        
      default:
        return null;
    }
  };
  
  // Calculate navigation state
  const canNavigateToExamination = anamnesisState === 'anamnesis-processed' && currentPhase === 'anamnesis';
  const canNavigateToConclusion = examinationState === 'examination-processed' && currentPhase === 'examination';
  const showBottomNavigation = canNavigateToExamination || canNavigateToConclusion;

  // DEBUG: Comprehensive navigation state logging
  React.useEffect(() => {
    console.log('[HYSIO NAVIGATION DEBUG] Current navigation state:', {
      currentPhase,
      anamnesisState,
      examinationState,
      canNavigateToExamination,
      canNavigateToConclusion,
      showBottomNavigation,
      completedPhases,
      timestamp: new Date().toISOString()
    });
  }, [currentPhase, anamnesisState, examinationState, canNavigateToExamination, canNavigateToConclusion, showBottomNavigation, completedPhases]);

  return (
    <div className={cn('w-full min-h-screen', className)}>
      {/* Global Stepper Navigation - Always visible */}
      <div className="bg-white border-b border-hysio-mint/20 p-6 mb-6">
        <div className="w-full px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-hysio-deep-green">
                Intake Workflow
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
          
          {/* Workflow Stepper */}
          <WorkflowStepper
            currentPhase={currentPhase}
            completedPhases={completedPhases}
            onPhaseClick={handleStepperNavigation}
            disabled={disabled}
          />
        </div>
      </div>
      
      {/* Main content with bottom padding for navigation */}
      <div className={cn('pb-32', { 'pb-8': !showBottomNavigation })}>
        {renderPhaseContent()}
      </div>
      
      {/* UNIVERSAL BOTTOM NAVIGATION - Always positioned, conditionally visible */}
      {showBottomNavigation ? (
        <div 
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-hysio-mint/20 shadow-2xl z-[9999]"
          style={{ 
            position: 'fixed',
            zIndex: 9999,
            bottom: 0,
            left: 0,
            right: 0,
            boxShadow: '0 -10px 25px -3px rgba(0, 0, 0, 0.1), 0 -4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="max-w-6xl mx-auto p-6">
            {canNavigateToExamination && (
              <>
                <Button
                  onClick={() => {
                    console.log('[HYSIO DEBUG] Navigation button clicked - Examination');
                    handleNavigateToExamination();
                  }}
                  disabled={disabled}
                  size="lg"
                  className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white py-4 text-xl font-semibold mb-3"
                >
                  <Stethoscope size={24} className="mr-3" />
                  Ga naar Onderzoek
                  <ChevronRight size={24} className="ml-3" />
                </Button>
                <p className="text-center text-sm text-hysio-deep-green-900/60">
                  ✅ Anamnese voltooid - Ga door naar de onderzoeksfase
                </p>
              </>
            )}
            
            {canNavigateToConclusion && (
              <>
                <Button
                  onClick={() => {
                    console.log('[HYSIO DEBUG] Navigation button clicked - Conclusion');
                    handleNavigateToClinicalConclusion();
                  }}
                  disabled={disabled}
                  size="lg"
                  className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white py-4 text-xl font-semibold mb-3"
                >
                  <CheckCircle size={24} className="mr-3" />
                  Ga naar Klinische Conclusie
                  <ChevronRight size={24} className="ml-3" />
                </Button>
                <p className="text-center text-sm text-hysio-deep-green-900/60">
                  ✅ Onderzoek voltooid - Ga door naar de conclusiefase
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        /* DEBUG: Show why navigation is not visible */
        process.env.NODE_ENV === 'development' && (anamnesisState === 'anamnesis-processed' || examinationState === 'examination-processed') && (
          <div 
            className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-[9999] max-w-sm"
            style={{ fontSize: '12px' }}
          >
            <div className="font-bold mb-1">🔍 DEBUG: Navigation Hidden</div>
            <div>Phase: {currentPhase}</div>
            <div>Anamnesis: {anamnesisState}</div>
            <div>Examination: {examinationState}</div>
            <div>Can Navigate: {canNavigateToExamination ? 'Exam ✓' : ''} {canNavigateToConclusion ? 'Conclusion ✓' : ''}</div>
          </div>
        )
      )}
    </div>
  );
};