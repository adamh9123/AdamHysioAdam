'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { FileUpload } from '@/components/ui/file-upload';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HysioAssistant } from '@/components/scribe/hysio-assistant';
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

export default function AnamnesePage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const workflowData = useScribeStore(state => state.workflowData);
  const setAnamneseData = useScribeStore(state => state.setAnamneseData);
  const markStepComplete = useScribeStore(state => state.markStepComplete);

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
  });

  // Set current workflow
  React.useEffect(() => {
    if (currentWorkflow !== 'intake-stapsgewijs') {
      setCurrentWorkflow('intake-stapsgewijs');
    }
  }, [currentWorkflow, setCurrentWorkflow]);

  // Redirect if no patient info
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
    }
  }, [patientInfo, router]);

  // Load existing data from workflow state
  React.useEffect(() => {
    const existingData = workflowData.anamneseData;
    if (existingData) {
      setState(prev => ({
        ...prev,
        preparation: existingData.preparation || null,
        manualNotes: existingData.transcript || '',
        result: existingData.result || null,
        preparationGenerated: !!existingData.preparation,
      }));
    }
  }, [workflowData.anamneseData]);

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


  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setState(prev => ({
      ...prev,
      inputMethod: 'recording',
      recordingData: { blob, duration, isRecording: false },
      uploadedFile: null, // Clear file upload when recording
    }));

    setAnamneseData({
      recording: new File([blob], 'anamnese-recording.webm', { type: 'audio/webm' }),
    });
  };

  const handleFileUpload = (file: File) => {
    setState(prev => ({
      ...prev,
      inputMethod: 'file',
      uploadedFile: file,
      recordingData: { blob: null, duration: 0, isRecording: false }, // Clear recording when uploading file
    }));

    setAnamneseData({
      recording: file,
    });
  };

  const handleManualNotesChange = (notes: string) => {
    setState(prev => ({
      ...prev,
      inputMethod: notes.trim() ? 'manual' : null,
      manualNotes: notes,
    }));

    setAnamneseData({
      transcript: notes,
    });
  };

  const processAnamnese = async () => {
    if (!patientInfo) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      let inputData: any = {};

      if (state.inputMethod === 'recording' && state.recordingData.blob) {
        inputData = {
          type: 'recording',
          data: state.recordingData.blob,
          duration: state.recordingData.duration,
        };
      } else if (state.inputMethod === 'file' && state.uploadedFile) {
        inputData = {
          type: 'file',
          data: state.uploadedFile,
        };
      } else if (state.inputMethod === 'manual' && state.manualNotes.trim()) {
        inputData = {
          type: 'manual',
          data: state.manualNotes.trim(),
        };
      } else {
        throw new Error('Geen input data beschikbaar');
      }

      // Enhanced processing with better logging
      console.log('Processing anamnese with data:', {
        workflowType: 'intake-stapsgewijs',
        step: 'anamnese',
        patientInfo,
        preparation: state.preparation ? 'present' : 'missing',
        inputData: { ...inputData, data: inputData.data ? 'present' : 'missing' }
      });

      // Process the anamnese
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

      // Save results to workflow state with enhanced logging
      console.log('Saving anamnese results to workflow state:', data);
      setAnamneseData({
        result: data,
        completed: true,
      });

      // Mark step as complete
      markStepComplete('anamnese');

      console.log('Anamnese processing completed successfully, navigating to results page...');

      // Enhanced navigation with better timing for state stabilization
      setTimeout(async () => {
        try {
          console.log('Navigating to anamnese results page...');
          await router.push('/scribe/intake-stapsgewijs/anamnese-resultaat');
        } catch (navigationError) {
          console.error('Navigation to results failed:', navigationError);
          setState(prev => ({
            ...prev,
            error: 'Navigatie naar resultaten mislukt. Probeer handmatig naar de resultaten te gaan.',
          }));
        }
      }, 2000); // 2 second delay for state stabilization

    } catch (error) {
      console.error('Anamnese processing error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon anamnese niet verwerken. Probeer het opnieuw.',
        isProcessing: false,
      }));
    }
  };

  const handleNext = () => {
    // Navigate to onderzoek step
    router.push('/scribe/intake-stapsgewijs/onderzoek');
  };

  const handleBack = () => {
    router.push('/scribe/workflow');
  };

  const canProcess = () => {
    return (
      (state.inputMethod === 'recording' && state.recordingData.blob) ||
      (state.inputMethod === 'file' && state.uploadedFile) ||
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
                  <div
                    className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: state.preparation }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generatePreparation}
                  disabled={state.isProcessing}
                  className="text-hysio-deep-green border-hysio-mint"
                >
                  <RotateCcw size={14} className="mr-1" />
                  Regenereren
                </Button>
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
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  disabled={state.isProcessing}
                />
                {state.recordingData.blob && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span>Opname gereed ({Math.round(state.recordingData.duration)}s)</span>
                    </div>
                  </div>
                )}

                {/* File Upload directly below recording */}
                <div className="pt-2 border-t border-hysio-mint/20">
                  <div className="flex items-center gap-2 text-hysio-deep-green mb-3">
                    <Upload size={16} />
                    <span className="text-sm font-medium">Bestand selecteren</span>
                  </div>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    acceptedTypes={['audio/*']}
                    disabled={state.isProcessing}
                  />
                  {state.uploadedFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle size={16} />
                        <span>Bestand geüpload: {state.uploadedFile.name}</span>
                      </div>
                    </div>
                  )}
                </div>
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

                {/* Hysio Assistant Integration */}
                {patientInfo && (
                  <div className="mt-4">
                    <HysioAssistant
                      patientInfo={patientInfo}
                      workflowType="intake-stapsgewijs"
                      workflowStep="anamnese"
                      currentContext={{
                        preparation: state.preparation,
                        notes: state.manualNotes,
                        inputMethod: state.inputMethod
                      }}
                      onSuggestionSelect={(suggestion) => {
                        const currentNotes = state.manualNotes;
                        const newNotes = currentNotes ?
                          `${currentNotes}\n\n${suggestion}` :
                          suggestion;
                        handleManualNotesChange(newNotes);
                      }}
                    />
                  </div>
                )}
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