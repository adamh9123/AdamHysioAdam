'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSafeHTML } from '@/lib/utils/sanitize';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useSessionState } from '@/hooks/useSessionState';
import { exportDocument } from '@/lib/utils/export';
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
import {
  ArrowLeft,
  FileText,
  Mic,
  Upload,
  Edit3,
  Lightbulb,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw,
  Home,
  Download,
  Heart,
  Activity
} from 'lucide-react';

interface KlinischeConclusieState {
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
  isComplete: boolean;
}

export default function KlinischeConclusie() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const sessionState = useSessionState({ autoSave: true, autoSaveInterval: 30000 });
  const workflowData = useScribeStore(state => state.workflowData);
  const setKlinischeConclusieData = useScribeStore(state => state.setKlinischeConclusieData);
  const markStepComplete = useScribeStore(state => state.markStepComplete);

  const [state, setState] = React.useState<KlinischeConclusieState>({
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
    isComplete: false,
  });

  // Set current workflow
  React.useEffect(() => {
    if (currentWorkflow !== 'intake-stapsgewijs') {
      setCurrentWorkflow('intake-stapsgewijs');
    }
  }, [currentWorkflow, setCurrentWorkflow]);

  // Redirect if no patient info or missing previous steps
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
      return;
    }

    // Check if anamnese and onderzoek steps are completed
    if (!workflowData.anamneseData?.completed) {
      router.push('/scribe/intake-stapsgewijs/anamnese');
      return;
    }

    if (!workflowData.onderzoekData?.completed) {
      router.push('/scribe/intake-stapsgewijs/onderzoek');
      return;
    }
  }, [patientInfo, workflowData.anamneseData, workflowData.onderzoekData, router]);

  // Load existing data from workflow state
  React.useEffect(() => {
    const existingData = workflowData.klinischeConclusieData;
    if (existingData) {
      setState(prev => ({
        ...prev,
        preparation: existingData.preparation || null,
        manualNotes: existingData.transcript || '',
        result: existingData.result || null,
        preparationGenerated: !!existingData.preparation,
        isComplete: existingData.completed || false,
      }));
    }
  }, [workflowData.klinischeConclusieData]);

  // Removed automatic preparation generation - now only triggered by user button click

  const generatePreparation = async () => {
    if (!patientInfo || !workflowData.anamneseData?.result || !workflowData.onderzoekData?.result) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Call preparation generation API with anamnese and onderzoek data
      const response = await fetch('/api/preparation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'klinische-conclusie',
          patientInfo,
          previousStepData: {
            anamneseResult: workflowData.anamneseData.result,
            onderzoekResult: workflowData.onderzoekData.result,
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
      setKlinischeConclusieData({
        preparation: data.content,
      });

    } catch (error) {
      console.error('Preparation generation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon klinische conclusie voorbereiding niet genereren. Probeer het opnieuw.',
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

    setKlinischeConclusieData({
      recording: new File([blob], 'klinische-conclusie-recording.webm', { type: 'audio/webm' }),
    });
  };

  const handleFileUpload = (file: File) => {
    setState(prev => ({
      ...prev,
      inputMethod: 'file',
      uploadedFile: file,
      recordingData: { blob: null, duration: 0, isRecording: false }, // Clear recording when uploading file
    }));

    setKlinischeConclusieData({
      recording: file,
    });
  };

  const handleManualNotesChange = (notes: string) => {
    setState(prev => ({
      ...prev,
      inputMethod: notes.trim() ? 'manual' : null,
      manualNotes: notes,
    }));

    setKlinischeConclusieData({
      transcript: notes,
    });
  };

  const processKlinischeConclusie = async () => {
    if (!patientInfo || !workflowData.anamneseData?.result || !workflowData.onderzoekData?.result) return;

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

      // Process the klinische conclusie
      const response = await fetch('/api/hhsb/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'klinische-conclusie',
          patientInfo,
          preparation: state.preparation,
          inputData,
          previousStepData: {
            anamneseResult: workflowData.anamneseData.result,
            onderzoekResult: workflowData.onderzoekData.result,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process klinische conclusie');
      }

      const { data } = await response.json();

      setState(prev => ({
        ...prev,
        result: data,
        isProcessing: false,
        resultExpanded: true,
        isComplete: true,
      }));

      // Save results to workflow state
      setKlinischeConclusieData({
        result: data,
        completed: true,
      });

      // Mark step as complete
      markStepComplete('klinische-conclusie');

      // Complete the session
      if (sessionState) {
        sessionState.completeSession();
      }

    } catch (error) {
      console.error('Klinische conclusie processing error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon klinische conclusie niet verwerken. Probeer het opnieuw.',
        isProcessing: false,
      }));
    }
  };

  const handleBack = () => {
    router.push('/scribe/intake-stapsgewijs/onderzoek-resultaat');
  };

  const handleStartNewSession = () => {
    if (sessionState) {
      sessionState.resetSession();
    }
    router.push('/scribe');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleExport = async (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    if (!state.result || !patientInfo) {
      console.error('No klinische conclusie result or patient info available for export');
      return;
    }

    try {
      const exportData = {
        patientInfo,
        workflowType: 'Stapsgewijze Intake - Klinische Conclusie',
        content: state.result,
        timestamp: new Date().toISOString(),
        title: `Klinische Conclusie - ${patientInfo.initials}`
      };

      await exportDocument(format, exportData);
      console.log(`Successfully exported klinische conclusie in ${format} format`);
    } catch (error) {
      console.error(`Export failed for ${format} format:`, error);
      // You could add a toast notification here
    }
  };

  const canProcess = () => {
    return (
      (state.inputMethod === 'recording' && state.recordingData.blob) ||
      (state.inputMethod === 'file' && state.uploadedFile) ||
      (state.inputMethod === 'manual' && state.manualNotes.trim().length > 0)
    );
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Klinische conclusie result copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!patientInfo || !workflowData.anamneseData?.completed || !workflowData.onderzoekData?.completed) {
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
          Terug naar Onderzoek
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center">
            <Calendar size={24} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Stap 3: Klinische Conclusie
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
            <span className="text-sm text-hysio-deep-green-900/70">Stap 3 van 3</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Clock size={14} className="mr-1" />
            Geschatte tijd: 10 minuten
          </Badge>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <FileText size={14} className="mr-1" />
            Klinische Conclusie
          </Badge>
          {state.isComplete && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Intake Voltooid
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

      {/* Previous Steps Summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
              <Heart size={16} />
              Anamnese Voltooid
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-green-700 text-xs">
              HHSB anamnesekaart is succesvol gegenereerd
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
              <Activity size={16} />
              Onderzoek Voltooid
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-green-700 text-xs">
              Onderzoeksbevindingen zijn geregistreerd
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Preparation */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
              <Lightbulb size={20} />
              Conclusie Voorbereiding
            </CardTitle>
            <CardDescription>
              Klinische conclusie gebaseerd op anamnese en onderzoek
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.isProcessing && !state.preparationGenerated ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2 text-hysio-deep-green-900/70">
                  Conclusie voorbereiding genereren...
                </span>
              </div>
            ) : state.preparation ? (
              <div className="space-y-4">
                <div className="bg-hysio-mint/10 rounded-lg p-4">
                  <div
                    className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={createSafeHTML(state.preparation)}
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
                  Geen conclusie voorbereiding beschikbaar
                </p>
                <Button
                  onClick={generatePreparation}
                  disabled={state.isProcessing}
                  className="bg-hysio-mint hover:bg-hysio-mint-dark text-hysio-deep-green"
                >
                  <Lightbulb size={16} className="mr-2" />
                  Conclusie Voorbereiding Genereren
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-hysio-deep-green">Klinische Conclusie</CardTitle>
            <CardDescription>
              Formuleer diagnose, behandelplan en vervolgafspraken
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
                  placeholder="Voer hier uw klinische conclusie in..."
                  value={state.manualNotes}
                  onChange={(e) => handleManualNotesChange(e.target.value)}
                  disabled={state.isProcessing}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-hysio-deep-green-900/60">
                  Tip: Formuleer diagnose, behandeldoelen, interventies en vervolgafspraken
                </p>
              </div>
            </div>

            {/* Process Button */}
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={processKlinischeConclusie}
                disabled={!canProcess() || state.isProcessing || state.isComplete}
                className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
                size="lg"
              >
                {state.isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Verwerken...
                  </>
                ) : state.isComplete ? (
                  <>
                    <CheckCircle size={18} className="mr-2" />
                    Intake Voltooid
                  </>
                ) : (
                  <>
                    <Calendar size={18} className="mr-2" />
                    Verwerk Klinische Conclusie
                  </>
                )}
              </Button>
              {!canProcess() && !state.isComplete && (
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
                      <CardTitle className="text-hysio-deep-green">Klinische Conclusie</CardTitle>
                      <CardDescription>
                        Diagnose, behandelplan en vervolgafspraken
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

      {/* Export Options */}
      {state.isComplete && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
              <Download size={20} />
              Export Opties
            </CardTitle>
            <CardDescription>
              Download de complete intake in verschillende formaten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('html')}
                className="text-hysio-deep-green border-hysio-mint"
              >
                <FileText size={16} className="mr-2" />
                HTML
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('txt')}
                className="text-hysio-deep-green border-hysio-mint"
              >
                <FileText size={16} className="mr-2" />
                TXT
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('docx')}
                className="text-hysio-deep-green border-hysio-mint"
              >
                <FileText size={16} className="mr-2" />
                DOCX
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                className="text-hysio-deep-green border-hysio-mint"
              >
                <FileText size={16} className="mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {!state.isComplete ? (
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={state.isProcessing}
            className="text-hysio-deep-green border-hysio-mint"
          >
            <ArrowLeft size={16} className="mr-2" />
            Terug naar Onderzoek
          </Button>
        </div>
      ) : (
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleStartNewSession}
            className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
            size="lg"
          >
            <RotateCcw size={18} className="mr-2" />
            Nieuwe Sessie Starten
          </Button>
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            size="lg"
            className="text-hysio-deep-green border-hysio-mint"
          >
            <Home size={18} className="mr-2" />
            Terug naar Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}