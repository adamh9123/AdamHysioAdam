'use client';

import * as React from 'react';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { cleanMarkdownArtifacts } from '@/lib/utils/sanitize';
import { transcribeAudio } from '@/lib/api/transcription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HysioGeneralDisclaimer } from '@/components/ui/hysio-disclaimer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UnifiedAudioInput } from '@/components/ui/unified-audio-input';
import {
  ArrowLeft,
  FileText,
  Mic,
  Edit3,
  Lightbulb,
  Clock,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface ConsultState {
  preparation: string | null;
  inputMethod: 'recording' | 'file' | 'manual' | null;
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

export default function ConsultPage() {
  const { navigateWithStateWait, navigateToPatientInfo, navigateToWorkflowSelection, navigateToStepWithStateWait } = useWorkflowNavigation();
  const patientInfo = useScribeStore((state: any) => state.patientInfo);
  const currentWorkflow = useScribeStore((state: any) => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore((state: any) => state.setCurrentWorkflow);
  const workflowData = useScribeStore((state: any) => state.workflowData);
  const setConsultData = useScribeStore((state: any) => state.setConsultData);
  const markStepComplete = useScribeStore((state: any) => state.markStepComplete);

  const [state, setState] = React.useState<ConsultState>({
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
    if (currentWorkflow !== 'consult') {
      setCurrentWorkflow('consult');
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
    const existingData = workflowData.consultData;
    if (existingData) {
      setState(prev => ({
        ...prev,
        preparation: existingData.preparation || null,
        manualNotes: existingData.transcript || '',
        preparationGenerated: !!existingData.preparation,
        isComplete: existingData.completed || false,
      }));
    }
  }, [workflowData.consultData]);

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
          workflowType: 'consult',
          step: 'consult',
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
      setConsultData({
        preparation: data.content,
      });

    } catch (error) {
      console.error('Preparation generation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon consult voorbereiding niet genereren. Probeer het opnieuw.',
        isProcessing: false,
      }));
    }
  };


  const handleAudioReady = (blob: Blob, duration: number, source: 'recording' | 'upload') => {
    const inputMethod = source === 'upload' ? 'file' : source;
    setState(prev => ({
      ...prev,
      inputMethod,
      recordingData: source === 'recording' ? { blob, duration, isRecording: false } : { blob: null, duration: 0, isRecording: false },
      uploadedFile: source === 'upload' ? blob as unknown as File : null,
    }));

    const audioFile = blob instanceof File ? blob : new File([blob], `consult-${source}.webm`, { type: 'audio/webm' });
    setConsultData({
      recording: audioFile,
    });
  };


  const handleManualNotesChange = (notes: string) => {
    setState(prev => ({
      ...prev,
      inputMethod: notes.trim() ? 'manual' : null,
      manualNotes: notes,
    }));

    setConsultData({
      transcript: notes,
    });
  };

  const processConsult = async () => {
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
      else if (state.inputMethod === 'file' && state.uploadedFile) {
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

      // Process the consult with transcript
      console.log('Processing consult with transcript...', {
        transcriptLength: transcript?.length || 0,
        transcriptPreview: transcript?.substring(0, 100) + '...',
        inputDataType: inputData.type,
        inputDataLength: inputData.data?.length || 0
      });

      if (!transcript || transcript.trim().length < 10) {
        throw new Error(`Transcript te kort of leeg. Transcript lengte: ${transcript?.length || 0}`);
      }

      // Process the consult with SOEP methodology
      const response = await fetch('/api/soep/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'consult',
          patientInfo,
          preparation: state.preparation,
          inputData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process consult');
      }

      const { data } = await response.json();

      console.log('🔍 DEBUG - SOEP API Response:', {
        success: response.ok,
        data: data,
        dataKeys: Object.keys(data || {}),
        soepStructure: data?.soepStructure,
        soepStructureKeys: data?.soepStructure ? Object.keys(data.soepStructure) : 'NO SOEP STRUCTURE'
      });

      // Save results to workflow state
      setConsultData({
        soepResult: data,
        completed: true,
      });

      // Mark step as complete
      markStepComplete('consult');

      // Update state first
      setState(prev => ({
        ...prev,
        isProcessing: false,
        isComplete: true,
      }));

      // Use enhanced navigation system with state stabilization
      const navigationSuccess = await navigateWithStateWait(
        '/scribe/consult/soep-verslag',
        () => {
          // Verify state is properly set before navigation
          const currentState = useScribeStore.getState();
          return Boolean(currentState.workflowData.consultData?.completed);
        },
        8000 // 8 second max wait for state stabilization
      );

      if (!navigationSuccess) {
        console.warn('Enhanced navigation failed, showing manual fallback');
        setState(prev => ({
          ...prev,
          error: 'Navigatie naar SOEP verslag werd vertraagd. Klik hieronder om door te gaan.',
          showManualNavigation: true,
        }));
      }

    } catch (error) {
      console.error('Consult processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

      let userFriendlyError = 'Kon consult niet verwerken. Probeer het opnieuw.';

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
    console.log('Navigating back to workflow selection');
    navigateToWorkflowSelection();
  };

  const canProcess = () => {
    return (
      (state.inputMethod === 'recording' && state.recordingData.blob) ||
      (state.inputMethod === 'file' && state.uploadedFile) ||
      (state.inputMethod === 'manual' && state.manualNotes.trim().length > 0)
    );
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
            <MessageSquare size={24} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Hysio Consult (Vervolgconsult)
            </h1>
            <p className="text-hysio-deep-green-900/70">
              {patientInfo.initials} ({patientInfo.birthYear}) - {patientInfo.chiefComplaint}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Clock size={14} className="mr-1" />
            Geschatte tijd: 10-15 minuten
          </Badge>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <FileText size={14} className="mr-1" />
            SOEP Methodiek
          </Badge>
          {state.isComplete && (
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
              console.log('Manual navigation triggered to SOEP verslag page');
              const success = await navigateToStepWithStateWait(
                'consult',
                'soep-verslag',
                () => {
                  const currentState = useScribeStore.getState();
                  return Boolean(currentState.workflowData.consultData?.completed);
                }
              );
              if (!success) {
                console.warn('Manual navigation failed');
                // Could add error state here if needed
              }
            }}
            className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
            size="lg"
          >
            <ArrowRight size={18} className="mr-2" />
            Ga naar SOEP Verslag
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
                <span className="font-semibold">Consult succesvol verwerkt!</span>
              </div>
              <div className="text-sm">
                • SOEP methodiek toegepast ✓
              </div>
              <div className="text-sm">
                • Subjectieve bevindingen geanalyseerd ✓
              </div>
              <div className="text-sm">
                • Objectieve gegevens verwerkt ✓
              </div>
              <div className="text-sm">
                • Evaluatie en plan opgesteld ✓
              </div>
              <div className="text-sm text-green-700 mt-2">
                → SOEP verslag wordt nu geladen...
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
              Consult Voorbereiding
            </CardTitle>
            <CardDescription>
              SOEP-gestructureerde voorbereiding voor vervolgconsult
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.isProcessing && !state.preparationGenerated ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-hysio-deep-green-900/70">
                  Consult voorbereiding genereren...
                </span>
              </div>
            ) : state.preparation ? (
              <div className="space-y-4">
                <HysioGeneralDisclaimer variant="info" className="text-xs" />
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
            <CardTitle className="text-hysio-deep-green">Consult Opname</CardTitle>
            <CardDescription>
              Leg het vervolgconsult vast volgens SOEP-methodiek
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
                  placeholder="Voer hier uw consult notities in..."
                  value={state.manualNotes}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  disabled={state.isProcessing}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-hysio-deep-green-900/60">
                  Tip: Noteer subjectieve klachten, objectieve bevindingen, evaluatie en behandelplan
                </p>

                {/* Hysio Assistant Integration */}
              </div>
            </div>

            {/* Process Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={processConsult}
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
                    <MessageSquare size={18} className="mr-2" />
                    Verwerk Consult
                  </>
                )}
              </Button>
              {state.isProcessing && (
                <p className="text-xs text-hysio-deep-green-900/60 text-center mt-2">
                  {state.isTranscribing
                    ? '🎤 Audio wordt getranscribeerd...'
                    : '🤖 AI analyseert consult gegevens...'}
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

      {/* SOEP Information */}
      <Card className="mt-6 bg-hysio-mint/5 border-hysio-mint/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-semibold text-hysio-deep-green">
              SOEP Methodiek voor Vervolgconsulten
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">S</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>Subjectief</strong><br />
                  Patiënt ervaring en klachten sinds vorige consult
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">O</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>Objectief</strong><br />
                  Onderzoeksbevindingen, metingen en ingezette interventies
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">E</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>Evaluatie</strong><br />
                  Voortgang beoordeling en analyse
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-hysio-deep-green font-semibold">P</span>
                </div>
                <p className="text-hysio-deep-green-900/80">
                  <strong>Plan</strong><br />
                  Aangepast behandelplan en vervolgafspraken
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}