'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSafeHTML, cleanMarkdownArtifacts } from '@/lib/utils/sanitize';
import { useScribeStore } from '@/lib/state/scribe-store';
import { transcribeAudio } from '@/lib/api/transcription';
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
  Users,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw,
  Activity
} from 'lucide-react';

interface OnderzoekState {
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
  result: any | null;
  error: string | null;
  preparationGenerated: boolean;
  resultExpanded: boolean;
}

export default function OnderzoekPage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const workflowData = useScribeStore(state => state.workflowData);
  const setOnderzoekData = useScribeStore(state => state.setOnderzoekData);
  const markStepComplete = useScribeStore(state => state.markStepComplete);

  const [state, setState] = React.useState<OnderzoekState>({
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
  });

  // Set current workflow
  React.useEffect(() => {
    if (currentWorkflow !== 'intake-stapsgewijs') {
      setCurrentWorkflow('intake-stapsgewijs');
    }
  }, [currentWorkflow, setCurrentWorkflow]);

  // Redirect if no patient info or no anamnese data
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
      return;
    }

    // Check if anamnese step is completed
    if (!workflowData.anamneseData?.completed) {
      router.push('/scribe/intake-stapsgewijs/anamnese');
      return;
    }
  }, [patientInfo, workflowData.anamneseData, router]);

  // Load existing data from workflow state
  React.useEffect(() => {
    const existingData = workflowData.onderzoekData;
    if (existingData) {
      setState(prev => ({
        ...prev,
        preparation: existingData.preparation || null,
        manualNotes: existingData.transcript || '',
        result: existingData.result || null,
        preparationGenerated: !!existingData.preparation,
      }));
    }
  }, [workflowData.onderzoekData]);

  // Generate preparation on component mount
  // Removed automatic preparation generation - now only triggered by user button click

  const generatePreparation = async () => {
    if (!patientInfo || !workflowData.anamneseData?.result) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Call preparation generation API with anamnese data
      const response = await fetch('/api/preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'onderzoek',
          patientInfo,
          previousStepData: {
            anamneseResult: workflowData.anamneseData.result,
          },
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
      setOnderzoekData({
        preparation: data.content,
      });

    } catch (error) {
      console.error('Preparation generation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon onderzoeksvoorbereiding niet genereren. Probeer het opnieuw.',
        isProcessing: false,
      }));
    }
  };


  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setState(prev => ({
      ...prev,
      inputMethod: 'recording',
      recordingData: { blob, duration, isRecording: false },
      uploadedFile: null, // Clear file upload when recording
    }));

    setOnderzoekData({
      recording: new File([blob], 'onderzoek-recording.webm', { type: 'audio/webm' }),
    });
  };

  const handleFileUpload = (file: File) => {
    setState(prev => ({
      ...prev,
      inputMethod: 'file',
      uploadedFile: file,
      recordingData: { blob: null, duration: 0, isRecording: false }, // Clear recording when uploading file
    }));

    setOnderzoekData({
      recording: file,
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

  const processOnderzoek = async () => {
    if (!patientInfo || !workflowData.anamneseData?.result) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // ✅ V7.0 FIX: Sync manual notes to store before processing
      if (state.inputMethod === 'manual' && state.manualNotes) {
        setOnderzoekData({
          transcript: state.manualNotes,
          inputMethod: 'manual',
        });
      }

      let transcript = '';
      let inputData: any = {};

      // STEP 1: Handle transcription for audio/file inputs (same as anamnese)
      if (state.inputMethod === 'recording' && state.recordingData.blob) {
        console.log('Transcribing onderzoek audio recording...', {
          blobSize: state.recordingData.blob.size,
          duration: state.recordingData.duration
        });
        const transcriptionResult = await transcribeAudio(state.recordingData.blob);

        console.log('Onderzoek transcription result received:', {
          success: transcriptionResult.success,
          hasTranscript: !!transcriptionResult.transcript,
          transcriptLength: transcriptionResult.transcript?.length || 0,
          error: transcriptionResult.error
        });

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
          const errorMessage = transcriptionResult.error || 'Transcriptie mislukt';
          console.error('Onderzoek audio transcription failed:', {
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
              '• De tekst handmatig in te voeren in plaats van audio'
            );
          }

          throw new Error(errorMessage);
        }

        transcript = transcriptionResult.transcript;
        console.log('Onderzoek audio transcription complete:', {
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
      else if (state.inputMethod === 'file' && state.uploadedFile) {
        console.log('Transcribing onderzoek uploaded file...', {
          fileName: state.uploadedFile.name,
          fileSize: state.uploadedFile.size,
          fileType: state.uploadedFile.type
        });
        const fileBlob = new Blob([await state.uploadedFile.arrayBuffer()], { type: state.uploadedFile.type });
        const transcriptionResult = await transcribeAudio(fileBlob);

        console.log('Onderzoek file transcription result received:', {
          success: transcriptionResult.success,
          hasTranscript: !!transcriptionResult.transcript,
          transcriptLength: transcriptionResult.transcript?.length || 0,
          error: transcriptionResult.error
        });

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
          const errorMessage = transcriptionResult.error || 'Bestandstranscriptie mislukt';
          console.error('Onderzoek file transcription failed:', {
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
        console.log('Onderzoek file transcription complete:', {
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
        console.log('Using manual onderzoek notes directly:', transcript.substring(0, 100) + '...');
      } else {
        throw new Error('Geen input data beschikbaar');
      }

      // STEP 2: Process with HHSB endpoint (now only receives text)
      console.log('Processing onderzoek with transcribed data:', {
        workflowType: 'intake-stapsgewijs',
        step: 'onderzoek',
        patientInfo,
        preparation: state.preparation ? 'present' : 'missing',
        transcriptLength: transcript.length,
        transcriptPreview: transcript.substring(0, 100) + '...',
        inputDataType: inputData.type,
        inputDataLength: inputData.data?.length || 0
      });

      // Enhanced validation to match API requirements (minimum 50 characters)
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Geen transcript beschikbaar. Voer tekst in of neem audio op.');
      }

      const response = await fetch('/api/onderzoek/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          patientInfo,
          preparation: state.preparation,
          inputData,
          previousStepData: {
            anamneseResult: workflowData.anamneseData.result,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Onderzoek processing error:', response.status, errorData);
        throw new Error(`Failed to process onderzoek: ${response.status} ${errorData}`);
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        result: data,
        isProcessing: false,
        resultExpanded: true,
      }));

      // Save results to workflow state with transcript and input method
      console.log('Saving onderzoek results to workflow state:', data);
      setOnderzoekData({
        result: data,
        transcript: transcript, // Save the transcribed text
        inputMethod: state.inputMethod, // Save how the input was provided
        completed: true,
      });

      // Mark step as complete
      markStepComplete('onderzoek');

      // Navigate to onderzoek-resultaat page to show detailed results
      console.log('Onderzoek processing completed successfully, navigating to onderzoek-resultaat...');
      setTimeout(() => {
        router.push('/scribe/intake-stapsgewijs/onderzoek-resultaat');
      }, 1000); // Small delay to let user see success

    } catch (error) {
      console.error('Onderzoek processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';

      let userFriendlyError = 'Kon onderzoek niet verwerken. Probeer het opnieuw.';

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

  const handleNext = () => {
    // Navigate to klinische conclusie step
    router.push('/scribe/intake-stapsgewijs/klinische-conclusie');
  };

  const handleBack = () => {
    router.push('/scribe/intake-stapsgewijs/anamnese');
  };

  const canProcess = () => {
    return (
      (state.inputMethod === 'recording' && state.recordingData.blob) ||
      (state.inputMethod === 'file' && state.uploadedFile) ||
      (state.inputMethod === 'manual' && state.manualNotes.trim().length > 0)
    );
  };

  const canProceedToNext = () => {
    return state.result && workflowData.onderzoekData?.completed;
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Onderzoek result copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const renderStructuredContent = (content: any): string => {
    if (!content) return 'Geen informatie beschikbaar';

    if (typeof content === 'string') {
      return content;
    }

    if (typeof content === 'object') {
      // Handle arrays
      if (Array.isArray(content)) {
        return content.filter(item => item).join('\n\n');
      }

      // Handle objects by extracting meaningful text
      if (content.text || content.description || content.value) {
        return content.text || content.description || content.value;
      }

      // Last resort: extract all string values from object
      const textValues = Object.values(content)
        .filter(value => typeof value === 'string' && value.trim())
        .join('\n\n');

      return textValues || 'Informatie verwerkt maar geen leesbare inhoud beschikbaar';
    }

    return String(content);
  };

  if (!patientInfo || !workflowData.anamneseData?.completed) {
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
          Terug naar anamnese
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center">
            <Activity size={24} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Stap 2: Onderzoek
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
            <span className="text-sm text-hysio-deep-green-900/70">Stap 2 van 3</span>
          </div>
          <Progress value={66} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Clock size={14} className="mr-1" />
            Geschatte tijd: 15 minuten
          </Badge>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <FileText size={14} className="mr-1" />
            Onderzoeksbevindingen
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
          </AlertDescription>
        </Alert>
      )}

      {/* Previous Step Summary */}
      <Card className="mb-6 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle size={20} />
            Anamnese Voltooid
          </CardTitle>
          <CardDescription className="text-green-700">
            De anamnese is succesvol afgerond. Het onderzoeksvoorstel is gebaseerd op deze bevindingen.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Preparation */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
              <Lightbulb size={20} />
              Onderzoeksvoorbereiding
            </CardTitle>
            <CardDescription>
              Aangepast onderzoeksvoorstel gebaseerd op anamnese bevindingen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.isProcessing && !state.preparationGenerated ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-hysio-deep-green-900/70">
                  Onderzoeksvoorstel genereren...
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
                  Geen onderzoeksvoorstel beschikbaar
                </p>
                <Button
                  onClick={generatePreparation}
                  disabled={state.isProcessing}
                  className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green"
                >
                  <Lightbulb size={16} className="mr-2" />
                  Onderzoeksvoorstel Genereren
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-hysio-deep-green">Onderzoek Opname</CardTitle>
            <CardDescription>
              Leg het fysieke onderzoek vast volgens het onderzoeksvoorstel
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
                  onAudioReady={(blob, duration, source) => {
                    if (source === 'recording') {
                      handleRecordingComplete(blob, duration);
                    } else if (source === 'upload') {
                      handleFileUpload(blob as File);
                    }
                  }}
                  disabled={state.isProcessing}
                  acceptedTypes={['audio/*']}
                  allowUpload={true}
                />
                {state.recordingData.blob && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span>Opname gereed ({Math.round(state.recordingData.duration)}s)</span>
                    </div>
                  </div>
                )}

                {state.uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span>Bestand geüpload: {state.uploadedFile.name}</span>
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
                  placeholder="Voer hier uw onderzoeksbevindingen in..."
                  value={state.manualNotes}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  disabled={state.isProcessing}
                  rows={8}
                  className="resize-none"
                />
                <div className="flex justify-between items-start">
                  <p className="text-xs text-hysio-deep-green-900/60">
                    Tip: Noteer inspectie, palpatie, bewegingsonderzoek, functietesten en specifieke onderzoeken of noem de uitslagen hardop tijdens Live Recording
                  </p>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={processOnderzoek}
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
                    <Activity size={18} className="mr-2" />
                    Verwerk Onderzoek
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
                      <CardTitle className="text-hysio-deep-green">Onderzoeksbevindingen</CardTitle>
                      <CardDescription>
                        Gestructureerde bevindingen van het fysieke onderzoek
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const formattedContent = [
                          'ONDERZOEKSBEVINDINGEN',
                          '===================',
                          state.result?.hhsbStructure?.onderzoeksBevindingen ? renderStructuredContent(state.result.hhsbStructure.onderzoeksBevindingen) : 'Geen gegevens',
                          '',
                          'FUNCTIONELE METINGEN',
                          '==================',
                          state.result?.hhsbStructure?.functioneleMetingen ? renderStructuredContent(state.result.hhsbStructure.functioneleMetingen) : 'Geen gegevens',
                          '',
                          'ANALYSE EN INTERPRETATIE',
                          '======================',
                          state.result?.hhsbStructure?.analyseInterpretatie ? renderStructuredContent(state.result.hhsbStructure.analyseInterpretatie) : 'Geen gegevens',
                          '',
                          'RED FLAGS',
                          '=========',
                          state.result?.hhsbStructure?.redFlags?.length > 0 ? state.result.hhsbStructure.redFlags.join('\n• ') : 'Geen red flags gedetecteerd'
                        ].join('\n');
                        copyToClipboard(formattedContent);
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
                  <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap space-y-4">
                    {state.result?.hhsbStructure ? (
                      <div className="space-y-6">
                        {/* Onderzoeksbevindingen */}
                        {state.result.hhsbStructure.onderzoeksBevindingen && (
                          <div>
                            <h4 className="font-semibold text-hysio-deep-green mb-3">Onderzoeksbevindingen</h4>
                            <div className="bg-white/50 rounded-lg p-3">
                              <div className="whitespace-pre-wrap">
                                {renderStructuredContent(state.result.hhsbStructure.onderzoeksBevindingen)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Functionele Metingen */}
                        {state.result.hhsbStructure.functioneleMetingen && (
                          <div>
                            <h4 className="font-semibold text-hysio-deep-green mb-3">Functionele Metingen</h4>
                            <div className="bg-white/50 rounded-lg p-3">
                              <div className="whitespace-pre-wrap">
                                {renderStructuredContent(state.result.hhsbStructure.functioneleMetingen)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Analyse en Interpretatie */}
                        {state.result.hhsbStructure.analyseInterpretatie && (
                          <div>
                            <h4 className="font-semibold text-hysio-deep-green mb-3">Analyse en Interpretatie</h4>
                            <div className="bg-white/50 rounded-lg p-3">
                              <div className="whitespace-pre-wrap">
                                {renderStructuredContent(state.result.hhsbStructure.analyseInterpretatie)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Red Flags */}
                        {state.result.hhsbStructure.redFlags && state.result.hhsbStructure.redFlags.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-red-600 mb-3">Red Flags</h4>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <ul className="list-disc list-inside text-red-700 space-y-1">
                                {state.result.hhsbStructure.redFlags.map((flag: string, index: number) => (
                                  <li key={index}>{flag}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <p>Geen onderzoeksresultaten beschikbaar</p>
                      </div>
                    )}
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
          Terug naar Anamnese
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceedToNext() || state.isProcessing}
          className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
        >
          Volgende: Klinische Conclusie
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}