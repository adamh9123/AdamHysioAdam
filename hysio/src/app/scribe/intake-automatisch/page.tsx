'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { cleanMarkdownArtifacts } from '@/lib/utils/sanitize';
import { transcribeAudio } from '@/lib/api/transcription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { UnifiedAudioInput } from '@/components/ui/unified-audio-input';
import { FileUpload } from '@/components/ui/file-upload';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Mic,
  Upload,
  Edit3,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Clock,
  Zap
} from 'lucide-react';

interface AutomatedIntakeState {
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
  isComplete: boolean;
  error: string | null;
  preparationGenerated: boolean;
  showManualNavigation: boolean;
  isTranscribing: boolean;
}

export default function AutomatedIntakePage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const { navigateBack, navigateWithStateWait, navigateToStep, navigateToPatientInfo, navigateToStepWithStateWait } = useWorkflowNavigation();
  const workflowData = useScribeStore(state => state.workflowData);
  const setAutomatedIntakeData = useScribeStore(state => state.setAutomatedIntakeData);
  const markStepComplete = useScribeStore(state => state.markStepComplete);

  const [state, setState] = React.useState<AutomatedIntakeState>({
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
    isComplete: false,
    error: null,
    preparationGenerated: false,
    showManualNavigation: false,
    isTranscribing: false,
  });

  // Set current workflow
  React.useEffect(() => {
    if (currentWorkflow !== 'intake-automatisch') {
      setCurrentWorkflow('intake-automatisch');
    }
  }, [currentWorkflow, setCurrentWorkflow]);

  // Safe redirect if no patient info using navigation hook
  React.useEffect(() => {
    if (!patientInfo) {
      console.log('No patient info, navigating to patient info page');
      navigateToPatientInfo();
    }
  }, [patientInfo, navigateToPatientInfo]);

  // Removed automatic preparation generation - now only triggered by user button click

  const generatePreparation = async () => {
    if (!patientInfo) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Call preparation generation API
      const response = await fetch('/api/preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-automatisch',
          step: 'preparation',
          patientInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preparation');
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        preparation: data.content,
        preparationGenerated: true,
        isProcessing: false,
      }));

      // Save to workflow state
      setAutomatedIntakeData({
        preparation: data.content,
      });

    } catch (error) {
      console.error('Preparation generation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon voorbereiding niet genereren. Probeer het opnieuw.',
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

    const audioFile = blob instanceof File ? blob : new File([blob], `intake-${source}.webm`, { type: 'audio/webm' });
    setAutomatedIntakeData({
      recording: audioFile,
    });
  };

  const handleManualNotesChange = (notes: string) => {
    setState(prev => ({
      ...prev,
      inputMethod: notes.trim() ? 'manual' : null,
      manualNotes: notes,
    }));

    setAutomatedIntakeData({
      transcript: notes,
    });
  };


  const processIntake = async () => {
    if (!patientInfo) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, isTranscribing: true, error: null }));

      let transcript = '';
      let inputData: any = {};

      // Handle audio recording - transcribe first
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
          console.error('Groq transcription failed:', {
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
        console.log('Transcription complete:', {
          transcriptLength: transcript.length,
          preview: transcript.substring(0, 100) + '...'
        });

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
        const transcriptionResult = await transcribeAudio(state.uploadedFile);

        console.log('File transcription result received:', {
          success: transcriptionResult.success,
          hasTranscript: !!transcriptionResult.transcript,
          transcriptLength: transcriptionResult.transcript?.length || 0,
          error: transcriptionResult.error
        });

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
          const errorMessage = transcriptionResult.error || 'Transcriptie mislukt';
          console.error('File transcription failed:', {
            success: transcriptionResult.success,
            transcript: transcriptionResult.transcript,
            error: errorMessage,
            hasError: !!transcriptionResult.error,
            errorLength: transcriptionResult.error?.length || 0,
            fullResult: JSON.stringify(transcriptionResult, null, 2)
          });
          throw new Error(errorMessage);
        }

        transcript = transcriptionResult.transcript;
        console.log('File transcription complete:', {
          transcriptLength: transcript.length,
          preview: transcript.substring(0, 100) + '...'
        });

        inputData = {
          type: 'transcribed-audio',
          data: transcript,
          originalSource: 'file',
        };
      }
      // Handle manual notes
      else if (state.inputMethod === 'manual' && state.manualNotes.trim()) {
        transcript = state.manualNotes.trim();
        inputData = {
          type: 'manual',
          data: transcript,
        };
      } else {
        throw new Error('Geen input data beschikbaar');
      }

      setState(prev => ({ ...prev, isTranscribing: false }));

      // Process the intake with transcript
      console.log('Processing intake with transcript...', {
        transcriptLength: transcript?.length || 0,
        transcriptPreview: transcript?.substring(0, 100) + '...',
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
          workflowType: 'intake-automatisch',
          patientInfo,
          preparation: state.preparation,
          inputData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🚨 HHSB API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error,
          debug: errorData.debug,
          url: response.url,
          timestamp: new Date().toISOString(),
          requestData: {
            workflowType: 'intake-automatisch',
            patientInfo,
            hasPreparation: !!state.preparation,
            inputType: state.inputMethod,
            transcriptLength: typeof transcript === 'string' ? transcript.length : 0
          }
        });

        // Enhanced error message with specific guidance
        let errorMessage = errorData.error || `HTTP ${response.status}: Failed to process intake`;

        // Add helpful context for common issues
        if (response.status === 500 && errorMessage.includes('API key')) {
          errorMessage += ' - Check if OpenAI API key is configured correctly.';
        } else if (response.status === 429) {
          errorMessage += ' - Rate limit reached. Please wait and try again.';
        } else if (response.status === 400) {
          errorMessage += ' - Invalid request data. Please check your input.';
        }

        throw new Error(errorMessage);
      }

      const { data } = await response.json();

      // Save results to workflow state
      setAutomatedIntakeData({
        result: data,
        completed: true,
      });

      // Mark step as complete
      markStepComplete('automated-intake');

      // Update state first
      setState(prev => ({
        ...prev,
        isProcessing: false,
        isComplete: true,
      }));

      console.log('Intake processing completed successfully, using enhanced navigation...');

      // Use enhanced navigation system with state stabilization
      const navigationSuccess = await navigateWithStateWait(
        '/scribe/intake-automatisch/conclusie',
        () => {
          // Verify state is properly set before navigation
          const currentState = useScribeStore.getState();
          return Boolean(currentState.workflowData.automatedIntakeData?.completed);
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
      console.error('Intake processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

      let userFriendlyError = 'Kon intake niet verwerken. Probeer het opnieuw.';

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

  const handleBack = () => {
    navigateBack();
  };

  const canProcess = () => {
    return (
      (state.inputMethod === 'recording' && state.recordingData.blob) ||
      (state.inputMethod === 'upload' && state.uploadedFile) ||
      (state.inputMethod === 'manual' && state.manualNotes.trim().length > 0)
    );
  };

  if (!patientInfo) {
    return null; // Will redirect via useEffect
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
            <Zap size={24} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Hysio Intake (Automatisch)
            </h1>
            <p className="text-hysio-deep-green-900/70">
              {patientInfo.initials} ({patientInfo.birthYear}) - {patientInfo.chiefComplaint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Clock size={14} className="mr-1" />
            Geschatte tijd: 15-20 minuten
          </Badge>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <FileText size={14} className="mr-1" />
            HHSB Methodiek
          </Badge>
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

      {/* Manual Navigation Button with State-Aware Navigation */}
      {state.showManualNavigation && (
        <div className="mb-6 text-center">
          <Button
            onClick={async () => {
              console.log('Manual navigation triggered to conclusie page');
              const success = await navigateToStepWithStateWait(
                'intake-automatisch',
                'conclusie',
                () => {
                  const currentState = useScribeStore.getState();
                  return Boolean(currentState.workflowData.automatedIntakeData?.completed);
                }
              );
              if (!success) {
                console.warn('Manual navigation failed, using fallback');
                setState(prev => ({ ...prev, error: 'Navigatie mislukt. Probeer het opnieuw.' }));
              }
            }}
            className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
            size="lg"
          >
            <ArrowRight size={18} className="mr-2" />
            Ga naar Resultaten
          </Button>
        </div>
      )}

      {/* Enhanced Success Alert with Progress Tracking */}
      {state.isComplete && !state.showManualNavigation && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-semibold">Intake succesvol verwerkt!</span>
              </div>
              <div className="text-sm">
                • HHSB Anamnesekaart gegenereerd ✓
              </div>
              <div className="text-sm">
                • Onderzoeksbevindingen geanalyseerd ✓
              </div>
              <div className="text-sm">
                • Klinische conclusie opgesteld ✓
              </div>
              <div className="text-sm text-green-700 mt-2">
                → Resultaten worden nu geladen...
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
              Intake Voorbereiding
            </CardTitle>
            <CardDescription>
              Automatisch gegenereerde voorbereiding voor uw intake gesprek
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
                  Voorbereiding Genereren
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-hysio-deep-green">Intake Opname</CardTitle>
            <CardDescription>
              Kies uw voorkeursmethode voor het vastleggen van de intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Audio Input Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-hysio-deep-green">
                  <Mic size={18} />
                  <h3 className="text-lg font-medium">Audio Invoer</h3>
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
                {(state.recordingData.blob || state.uploadedFile) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span>Audio gereed
                        {state.recordingData.blob && ` (opname: ${Math.round(state.recordingData.duration)}s)`}
                        {state.uploadedFile && ` (bestand: ${state.uploadedFile.name})`}
                      </span>
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
                  placeholder="Voer hier uw intake notities in..."
                  value={state.manualNotes}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  disabled={state.isProcessing}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-hysio-deep-green-900/60">
                  Tip: Beschrijf de anamnese, onderzoeksbevindingen en uw klinische impressie
                </p>

              </div>
            </div>

            {/* Process Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={processIntake}
                disabled={!canProcess() || state.isProcessing || state.isComplete}
                className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
                size="lg"
              >
                {state.isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    {state.isTranscribing ? 'Transcriberen...' : 'Verwerken...'}
                  </>
                ) : state.isComplete ? (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Voltooid
                  </>
                ) : (
                  <>
                    <Zap size={18} className="mr-2" />
                    Verwerk Volledige Intake
                  </>
                )}
              </Button>
              {state.isProcessing && (
                <p className="text-xs text-hysio-deep-green-900/60 text-center mt-2">
                  {state.isTranscribing
                    ? '🎤 Audio wordt getranscribeerd...'
                    : '⚡ Hysio analyseert intake gegevens...'}
                </p>
              )}
              {!canProcess() && !state.isProcessing && (
                <p className="text-xs text-hysio-deep-green-900/60 text-center mt-2">
                  Selecteer een invoermethode en voeg content toe om te verwerken
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Information */}
      <Card className="mt-6 bg-hysio-mint/5 border-hysio-mint/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-semibold text-hysio-deep-green">
              Wat gebeurt er na het verwerken?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">1</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>HHSB Anamnesekaart</strong><br />
                  Gestructureerde anamnese volgens HHSB methodiek
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">2</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>Onderzoeksbevindingen</strong><br />
                  Systematische vastlegging van fysiek onderzoek
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">3</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>Klinische Conclusie</strong><br />
                  Diagnose, behandelplan en vervolgafspraken
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}