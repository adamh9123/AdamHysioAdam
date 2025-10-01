'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSafeHTML, cleanMarkdownArtifacts } from '@/lib/utils/sanitize';
import { useScribeStore } from '@/lib/state/scribe-store';
import { transcribeAudio } from '@/lib/api/transcription';
import { useWorkflowResumption } from '@/lib/utils/workflow-resumption';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedAudioInput } from '@/components/ui/unified-audio-input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Mic,
  Upload,
  Edit3,
  Lightbulb,
  Clock,
  Heart,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw
} from 'lucide-react';

interface AnamneseState {
  preparation: string | null;
  inputMethod: 'recording' | 'upload' | 'manual' | null;
  recordingData: {
    blob: Blob | null;
    duration: number;
    isRecording: boolean;
  };
  uploadedFile: File | null;
  manualNotes: string;
  isProcessing: boolean;
  result: any | null;
  error: string | null;
  preparationGenerated: boolean;
  resultExpanded: boolean;
  showManualNavigation: boolean;
}

export default function AnamnesePage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const workflowData = useScribeStore(state => state.workflowData);
  const setAnamneseData = useScribeStore(state => state.setAnamneseData);
  const markStepComplete = useScribeStore(state => state.markStepComplete);

  // Workflow interruption tracking and navigation
  const { saveInterruption } = useWorkflowResumption();
  const { navigateWithStateWait, navigateToStep, navigateToPatientInfo, navigateToWorkflowSelection } = useWorkflowNavigation();

  const [state, setState] = React.useState<AnamneseState>({
    preparation: null,
    inputMethod: null,
    recordingData: {
      blob: null,
      duration: 0,
      isRecording: false,
    },
    uploadedFile: null,
    manualNotes: '',
    isProcessing: false,
    result: null,
    error: null,
    preparationGenerated: false,
    resultExpanded: false,
    showManualNavigation: false,
  });

  // Set current workflow
  React.useEffect(() => {
    if (currentWorkflow !== 'intake-stapsgewijs') {
      setCurrentWorkflow('intake-stapsgewijs');
    }
  }, [currentWorkflow, setCurrentWorkflow]);

  // Safe redirect if no patient info using navigation hook
  React.useEffect(() => {
    if (!patientInfo) {
      console.log('No patient info, navigating to patient info page');
      navigateToPatientInfo();
    }
  }, [patientInfo, navigateToPatientInfo]);

  // Load existing data from workflow state
  React.useEffect(() => {
    const existingData = workflowData.anamneseData;
    if (existingData) {
      setState(prev => ({
        ...prev,
        preparation: existingData.preparation || null,
        // Only load manual notes if they were manually entered, not from transcription
        manualNotes: (existingData.inputMethod === 'manual' && existingData.transcript) ? existingData.transcript : '',
        result: existingData.result || null,
        preparationGenerated: !!existingData.preparation,
      }));
    }
  }, [workflowData.anamneseData]);

  // Track workflow interruptions
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentWorkflow === 'intake-stapsgewijs' && (state.isProcessing || state.preparation || state.manualNotes)) {
        saveInterruption('intake-stapsgewijs', 'anamnese', 'browser_close');
      }
    };

    // Listen for page unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Note: Router mutation removed - this was an anti-pattern
    // Workflow interruption on navigation is now handled by the workflow resumption system

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentWorkflow, state.isProcessing, state.preparation, state.manualNotes, saveInterruption]);

  // Removed automatic preparation generation - now only triggered by user button click

  const generatePreparation = async () => {
    if (!patientInfo) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Enhanced request with better error handling
      console.log('Generating preparation with data:', {
        workflowType: 'intake-stapsgewijs',
        step: 'anamnese',
        patientInfo
      });

      // Call preparation generation API
      const response = await fetch('/api/preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'anamnese',
          patientInfo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Preparation API error:', response.status, errorData);
        throw new Error(`Failed to generate preparation: ${response.status} ${errorData}`);
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        preparation: data.content,
        preparationGenerated: true,
        isProcessing: false,
      }));

      // Save to workflow state
      setAnamneseData({
        preparation: data.content,
      });

    } catch (error) {
      console.error('Preparation generation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon anamnese voorbereiding niet genereren. Probeer het opnieuw.',
        isProcessing: false,
      }));
    }
  };


  const handleAudioReady = (blob: Blob, duration: number, source: 'recording' | 'upload') => {
    setState(prev => ({
      ...prev,
      inputMethod: source,
      recordingData: source === 'recording' ? { blob, duration, isRecording: false } : { blob: null, duration: 0, isRecording: false },
      uploadedFile: source === 'upload' ? blob as unknown as File : null,
    }));

    const audioFile = blob instanceof File ? blob : new File([blob], `anamnese-${source}.webm`, { type: 'audio/webm' });
    setAnamneseData({
      recording: audioFile,
    });
  };

  const handleManualNotesChange = (notes: string) => {
    // ✅ V7.0 FIX: Only update local state during typing to prevent glitches
    // Store sync happens during processing, not during typing
    if (notes.length <= 4000) {  // 4000 character limit
      setState(prev => ({
        ...prev,
        inputMethod: notes.trim() ? 'manual' : null,
        manualNotes: notes,
      }));
    }
  };

  const processAnamnese = async () => {
    if (!patientInfo) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // ✅ V7.0 FIX: Sync manual notes to store before processing
      if (state.inputMethod === 'manual' && state.manualNotes) {
        setAnamneseData({
          transcript: state.manualNotes,
          inputMethod: 'manual',
        });
      }

      let transcript = '';
      let inputData: any = {};

      // STEP 1: Handle transcription for audio/file inputs
      if (state.inputMethod === 'recording' && state.recordingData.blob) {
        console.log('Transcribing audio recording...', {
          blobSize: state.recordingData.blob.size,
          duration: state.recordingData.duration
        });
        const transcriptionResult = await transcribeAudio(state.recordingData.blob);

        console.log('Transcription result received:', {
          success: transcriptionResult.success,
          hasTranscript: !!transcriptionResult.transcript,
          transcriptLength: transcriptionResult.transcript?.length || 0,
          error: transcriptionResult.error
        });

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
          const errorMessage = transcriptionResult.error || 'Transcriptie mislukt';
          console.error('Audio transcription failed:', {
            success: transcriptionResult.success,
            transcript: transcriptionResult.transcript,
            error: errorMessage,
            fullResult: transcriptionResult
          });

          // Provide helpful error message to user
          if (errorMessage.includes('Groq transcriptie service is momenteel niet beschikbaar')) {
            throw new Error(
              'Audio transcriptie is momenteel niet beschikbaar. ' +
              'U kunt dit oplossen door:\n' +
              '• Het opnieuw te proberen over enkele minuten\n' +
              '• De tekst handmatig in te voeren in plaats van audio'
            );
          }

          throw new Error(errorMessage);
        }

        transcript = transcriptionResult.transcript;
        console.log('Audio transcription complete:', {
          transcriptLength: transcript.length,
          preview: transcript.substring(0, 100) + '...'
        });

        // Convert to transcribed audio input
        inputData = {
          type: 'transcribed-audio',
          data: transcript,
          originalSource: 'recording',
          duration: state.recordingData.duration,
        };
      }
      // Handle file upload - transcribe first
      else if (state.inputMethod === 'upload' && state.uploadedFile) {
        console.log('Transcribing uploaded file...', {
          fileName: state.uploadedFile.name,
          fileSize: state.uploadedFile.size,
          fileType: state.uploadedFile.type
        });
        const fileBlob = new Blob([await state.uploadedFile.arrayBuffer()], { type: state.uploadedFile.type });
        const transcriptionResult = await transcribeAudio(fileBlob);

        console.log('File transcription result received:', {
          success: transcriptionResult.success,
          hasTranscript: !!transcriptionResult.transcript,
          transcriptLength: transcriptionResult.transcript?.length || 0,
          error: transcriptionResult.error
        });

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
          const errorMessage = transcriptionResult.error || 'Bestandstranscriptie mislukt';
          console.error('File transcription failed:', {
            success: transcriptionResult.success,
            transcript: transcriptionResult.transcript,
            error: errorMessage,
            fullResult: transcriptionResult
          });

          if (errorMessage.includes('Groq transcriptie service is momenteel niet beschikbaar')) {
            throw new Error(
              'Audio transcriptie is momenteel niet beschikbaar. ' +
              'U kunt dit oplossen door:\n' +
              '• Het opnieuw te proberen over enkele minuten\n' +
              '• De tekst handmatig in te voeren in plaats van het bestand'
            );
          }

          throw new Error(errorMessage);
        }

        transcript = transcriptionResult.transcript;
        console.log('File transcription complete:', {
          transcriptLength: transcript.length,
          preview: transcript.substring(0, 100) + '...'
        });

        // Convert to transcribed audio input
        inputData = {
          type: 'transcribed-audio',
          data: transcript,
          originalSource: 'file',
        };
      }
      // Handle manual notes - use directly as text
      else if (state.inputMethod === 'manual' && state.manualNotes.trim()) {
        transcript = state.manualNotes.trim();
        inputData = {
          type: 'manual',
          data: transcript,
        };
        console.log('Using manual notes directly:', transcript.substring(0, 100) + '...');
      } else {
        throw new Error('Geen input data beschikbaar');
      }

      // STEP 2: Process with HHSB endpoint (now only receives text)
      console.log('Processing anamnese with transcribed data:', {
        workflowType: 'intake-stapsgewijs',
        step: 'anamnese',
        patientInfo,
        preparation: state.preparation ? 'present' : 'missing',
        transcriptLength: transcript.length,
        transcriptPreview: transcript.substring(0, 100) + '...',
        inputDataType: inputData.type,
        inputDataLength: inputData.data?.length || 0
      });

      if (!transcript || transcript.trim().length < 10) {
        throw new Error(`Transcript te kort of leeg. Transcript lengte: ${transcript?.length || 0}`);
      }

      const response = await fetch('/api/hhsb/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'anamnese',
          patientInfo,
          preparation: state.preparation,
          inputData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('HHSB processing error:', response.status, errorData);
        throw new Error(`Failed to process anamnese: ${response.status} ${errorData}`);
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        result: data,
        isProcessing: false,
        resultExpanded: true,
      }));

      // Save results to workflow state with transcript and input method
      console.log('Saving anamnese results to workflow state:', data);
      setAnamneseData({
        result: data,
        transcript: transcript, // Save the transcribed text
        inputMethod: state.inputMethod, // Save how the input was provided
        completed: true,
      });

      // Mark step as complete
      markStepComplete('anamnese');

      console.log('Anamnese processing completed successfully, using enhanced navigation...');

      // Use enhanced navigation system with state stabilization
      const navigationSuccess = await navigateWithStateWait(
        '/scribe/intake-stapsgewijs/anamnese-resultaat',
        () => {
          // Verify state is properly set before navigation
          const currentState = useScribeStore.getState();
          return Boolean(
            currentState.workflowData.anamneseData?.completed &&
            currentState.workflowData.completedSteps.includes('anamnese')
          );
        },
        8000 // 8 second max wait for state stabilization
      );

      if (!navigationSuccess) {
        console.warn('Enhanced navigation failed, showing manual fallback');
        setState(prev => ({
          ...prev,
          error: 'Navigatie naar resultaten werd vertraagd. Klik hieronder om door te gaan.',
          showManualNavigation: true,
        }));
      }

    } catch (error) {
      console.error('Anamnese processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

      let userFriendlyError = 'Kon anamnese niet verwerken. Probeer het opnieuw.';

      // Handle transcription-specific errors
      if (errorMessage.includes('Audio transcriptie is momenteel niet beschikbaar')) {
        userFriendlyError = 'Audio transcriptie service is niet beschikbaar. Schakel over naar handmatige tekstinvoer of probeer het later opnieuw.';
      } else if (errorMessage.includes('transcriptie') || errorMessage.includes('Groq')) {
        userFriendlyError = 'Audio transcriptie mislukt. U kunt de tekst handmatig invoeren als alternatief.';
      }

      setState(prev => ({
        ...prev,
        error: userFriendlyError,
        isProcessing: false,
      }));
    }
  };

  const handleNext = async () => {
    // Navigate to onderzoek step with state validation
    console.log('Navigating to onderzoek step');
    const success = await navigateToStep('intake-stapsgewijs', 'onderzoek');
    if (!success) {
      console.warn('Navigation to onderzoek failed');
      setState(prev => ({ ...prev, error: 'Navigatie naar onderzoek mislukt. Probeer het opnieuw.' }));
    }
  };

  const handleBack = () => {
    console.log('Navigating back to workflow selection');
    navigateToWorkflowSelection();
  };

  const canProcess = () => {
    return (
      (state.inputMethod === 'recording' && state.recordingData.blob) ||
      (state.inputMethod === 'upload' && state.uploadedFile) ||
      (state.inputMethod === 'manual' && state.manualNotes.trim().length > 0)
    );
  };

  const canProceedToNext = () => {
    return state.result && workflowData.anamneseData?.completed;
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Anamnese result copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!patientInfo) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 text-hysio-deep-green hover:bg-hysio-mint/10"
          disabled={state.isProcessing}
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar workflow selectie
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center">
            <Heart size={24} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Stap 1: Anamnese
            </h1>
            <p className="text-hysio-deep-green-900/70">
              {patientInfo.initials} ({patientInfo.birthYear}) - Hysio Intake (Stapsgewijs)
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-hysio-deep-green">Voortgang</span>
            <span className="text-sm text-hysio-deep-green-900/70">Stap 1 van 3</span>
          </div>
          <Progress value={33} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Clock size={14} className="mr-1" />
            Geschatte tijd: 15 minuten
          </Badge>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <FileText size={14} className="mr-1" />
            HHSB Anamnesekaart
          </Badge>
          {canProceedToNext() && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Voltooid
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {state.error}
            {(state.error.includes('transcriptie') || state.error.includes('Audio')) && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setState(prev => ({
                    ...prev,
                    inputMethod: 'manual',
                    error: null,
                    manualNotes: ''
                  }))}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Schakel naar handmatige invoer
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Manual Navigation Button */}
      {state.showManualNavigation && (
        <div className="mb-6 text-center">
          <Button
            onClick={async () => {
              console.log('Manual navigation triggered to anamnese-resultaat page');
              const success = await navigateToStep('intake-stapsgewijs', 'anamnese-resultaat');
              if (!success) {
                console.warn('Manual navigation failed');
                setState(prev => ({ ...prev, error: 'Navigatie mislukt. Probeer het opnieuw.' }));
              }
            }}
            className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
            size="lg"
          >
            <ArrowRight size={18} className="mr-2" />
            Ga naar Anamnese Resultaten
          </Button>
        </div>
      )}

      {/* Enhanced Success Alert with Progress Tracking */}
      {state.result && !state.showManualNavigation && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Anamnese succesvol verwerkt!</span>
              </div>
              <div className="text-sm">
                • HHSB Anamnesekaart gegenereerd ✓
              </div>
              <div className="text-sm">
                • Hulpvraag en geschiedenis geanalyseerd ✓
              </div>
              <div className="text-sm">
                • Stoornissen en beperkingen geïdentificeerd ✓
              </div>
              <div className="text-sm">
                • Anamnese samenvatting opgesteld ✓
              </div>
              <div className="text-sm text-green-700 mt-2">
                → Anamnese resultaten worden nu geladen...
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Preparation */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
              <Lightbulb size={20} />
              Anamnese Voorbereiding
            </CardTitle>
            <CardDescription>
              Gepersonaliseerde voorbereiding voor het anamnesegesprek
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.isProcessing && !state.preparationGenerated ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-hysio-deep-green-900/70">
                  Voorbereiding genereren...
                </span>
              </div>
            ) : state.preparation ? (
              <div className="space-y-4">
                <div className="bg-hysio-mint/10 rounded-lg p-4">
                  <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap">
                    {cleanMarkdownArtifacts(state.preparation || '')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-hysio-deep-green-900/60 mb-4">
                  Geen voorbereiding beschikbaar
                </p>
                <Button
                  onClick={generatePreparation}
                  disabled={state.isProcessing}
                  className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green"
                >
                  <Lightbulb size={16} className="mr-2" />
                  Genereer Voorbereiding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-hysio-deep-green">Anamnese Opname</CardTitle>
            <CardDescription>
              Leg het anamnesegesprek vast volgens de voorbereiding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Recording Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-hysio-deep-green">
                  <Mic size={18} />
                  <h3 className="text-lg font-medium">Live Opname</h3>
                </div>
                <UnifiedAudioInput
                  onAudioReady={handleAudioReady}
                  onError={(error) => setState(prev => ({ ...prev, error }))}
                  disabled={state.isProcessing}
                  allowUpload={true}
                  maxUploadSize={70}
                  showTips={true}
                  showTimer={true}
                  autoTranscribe={false}
                  variant="default"
                />
                {state.recordingData.blob && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span>Opname gereed ({Math.round(state.recordingData.duration)}s)</span>
                    </div>
                  </div>
                )}

              </div>

              {/* Manual Notes Section */}
              <div className="space-y-4 pt-4 border-t border-hysio-mint/30">
                <div className="flex items-center gap-2 text-hysio-deep-green">
                  <Edit3 size={18} />
                  <h3 className="text-lg font-medium">Handmatige Invoer</h3>
                </div>
                <Textarea
                  placeholder="Voer hier uw anamnese notities in..."
                  value={state.manualNotes}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  disabled={state.isProcessing}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-hysio-deep-green-900/60">
                  Tip: Volg de voorbereiding en noteer de hoofdklacht, voorgeschiedenis en huidige beperkingen
                </p>

              </div>
            </div>

            {/* Process Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={processAnamnese}
                disabled={!canProcess() || state.isProcessing}
                className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
                size="lg"
              >
                {state.isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Verwerken...
                  </>
                ) : (
                  <>
                    <Heart size={18} className="mr-2" />
                    Verwerk Anamnese
                  </>
                )}
              </Button>
              {!canProcess() && (
                <p className="text-xs text-hysio-deep-green-900/60 text-center mt-2">
                  Selecteer een invoermethode en voeg content toe om te verwerken
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {state.result && (
        <Card className="mt-6">
          <Collapsible
            open={state.resultExpanded}
            onOpenChange={(open) => setState(prev => ({ ...prev, resultExpanded: open }))}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">HHSB Anamnesekaart</CardTitle>
                      <CardDescription>
                        Gestructureerde anamnese volgens HHSB methodiek
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(state.result, null, 2));
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    {state.resultExpanded ? (
                      <ChevronDown size={20} className="text-hysio-deep-green" />
                    ) : (
                      <ChevronRight size={20} className="text-hysio-deep-green" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="bg-hysio-mint/10 rounded-lg p-4">
                  <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap">
                    {JSON.stringify(state.result, null, 2)}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={state.isProcessing}
          className="text-hysio-deep-green border-hysio-mint"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceedToNext() || state.isProcessing}
          className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
        >
          Volgende: Onderzoek
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}