'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowContext } from '../layout';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { FileUpload } from '@/components/ui/file-upload';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
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
}

export default function AutomatedIntakePage() {
  const router = useRouter();
  const { patientInfo, currentWorkflow, setCurrentWorkflow } = useWorkflowContext();
  const { navigateBack } = useWorkflowNavigation();
  const { workflowData, setAutomatedIntakeData, markStepComplete } = useWorkflowState();

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
  });

  // Set current workflow
  React.useEffect(() => {
    if (currentWorkflow !== 'intake-automatisch') {
      setCurrentWorkflow('intake-automatisch');
    }
  }, [currentWorkflow, setCurrentWorkflow]);

  // Redirect if no patient info
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
    }
  }, [patientInfo, router]);

  // Generate preparation on component mount
  React.useEffect(() => {
    if (patientInfo && !state.preparationGenerated) {
      generatePreparation();
    }
  }, [patientInfo, state.preparationGenerated]);

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

  const handleInputMethodChange = (method: 'recording' | 'file' | 'manual') => {
    setState(prev => ({
      ...prev,
      inputMethod: method,
      error: null,
    }));
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setState(prev => ({
      ...prev,
      recordingData: { blob, duration, isRecording: false },
    }));

    setAutomatedIntakeData({
      recording: new File([blob], 'intake-recording.webm', { type: 'audio/webm' }),
    });
  };

  const handleFileUpload = (file: File) => {
    setState(prev => ({
      ...prev,
      uploadedFile: file,
    }));

    setAutomatedIntakeData({
      recording: file,
    });
  };

  const handleManualNotesChange = (notes: string) => {
    setState(prev => ({
      ...prev,
      manualNotes: notes,
    }));

    setAutomatedIntakeData({
      transcript: notes,
    });
  };

  const processIntake = async () => {
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

      // Process the intake
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
        throw new Error('Failed to process intake');
      }

      const { data } = await response.json();

      // Save results to workflow state
      setAutomatedIntakeData({
        result: data,
        completed: true,
      });

      // Mark step as complete
      markStepComplete('automated-intake');

      setState(prev => ({
        ...prev,
        isProcessing: false,
        isComplete: true,
      }));

      // Navigate to results page
      setTimeout(() => {
        router.push('/scribe/intake-automatisch/conclusie');
      }, 1000);

    } catch (error) {
      console.error('Intake processing error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon intake niet verwerken. Probeer het opnieuw.',
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
      (state.inputMethod === 'file' && state.uploadedFile) ||
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
              Hysio Intake (Volledig Automatisch)
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
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {state.isComplete && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Intake succesvol verwerkt! U wordt doorgestuurd naar de resultaten...
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
            <CardTitle className="text-hysio-deep-green">Intake Opname</CardTitle>
            <CardDescription>
              Kies uw voorkeursmethode voor het vastleggen van de intake
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={state.inputMethod || 'recording'}
              onValueChange={(value) => handleInputMethodChange(value as any)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="recording" className="flex items-center gap-2">
                  <Mic size={16} />
                  Live Opname
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload size={16} />
                  Bestand
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Edit3 size={16} />
                  Handmatig
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recording" className="space-y-4">
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
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <FileUpload
                  onFileUpload={handleFileUpload}
                  acceptedTypes={['audio/*']}
                  disabled={state.isProcessing}
                />
                {state.uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle size={16} />
                      <span>Bestand geüpload: {state.uploadedFile.name}</span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
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
              </TabsContent>
            </Tabs>

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
                    Verwerken...
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
              {!canProcess() && (
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