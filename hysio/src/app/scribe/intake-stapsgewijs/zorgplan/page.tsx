'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cleanMarkdownArtifacts } from '@/lib/utils/sanitize';
import { formatZorgplan, formatContextData, getCopyableText } from '@/lib/utils/clinical-formatter';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useSessionState } from '@/hooks/useSessionState';
import { exportDocument } from '@/lib/utils/export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Heart,
  Activity,
  Calendar,
  Home,
  RotateCcw,
  Clock,
  Search,
  Lightbulb,
  Award,
  Target
} from 'lucide-react';

interface ZorgplanState {
  result: any | null;
  isProcessing: boolean;
  error: string | null;
  resultExpanded: boolean;
  isComplete: boolean;
}

export default function ZorgplanPage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);
  const sessionState = useSessionState({ autoSave: true, autoSaveInterval: 30000 });
  const workflowData = useScribeStore(state => state.workflowData);
  const setZorgplanData = useScribeStore(state => state.setZorgplanData);
  const markStepComplete = useScribeStore(state => state.markStepComplete);

  const [state, setState] = React.useState<ZorgplanState>({
    result: null,
    isProcessing: false,
    error: null,
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

    // Check if all previous steps are completed
    if (!workflowData.anamneseData?.completed) {
      router.push('/scribe/intake-stapsgewijs/anamnese');
      return;
    }

    if (!workflowData.onderzoekData?.completed) {
      router.push('/scribe/intake-stapsgewijs/onderzoek');
      return;
    }

    if (!workflowData.klinischeConclusieData?.completed) {
      router.push('/scribe/intake-stapsgewijs/klinische-conclusie');
      return;
    }
  }, [patientInfo, workflowData.anamneseData, workflowData.onderzoekData, workflowData.klinischeConclusieData, router]);

  // Load existing data from workflow state
  React.useEffect(() => {
    const existingData = workflowData.zorgplanData;
    if (existingData) {
      setState(prev => ({
        ...prev,
        result: existingData.result || null,
        isComplete: existingData.completed || false,
      }));
    }
  }, [workflowData.zorgplanData]);

  const generateZorgplan = async () => {
    if (!patientInfo || !workflowData.anamneseData?.result || !workflowData.onderzoekData?.result || !workflowData.klinischeConclusieData?.result) return;

    try {
      setState(prev => ({ ...prev, isProcessing: true, error: null }));

      // Call the API to generate zorgplan using step 6 prompt
      const response = await fetch('/api/hhsb/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType: 'intake-stapsgewijs',
          step: 'zorgplan',
          patientInfo,
          inputData: {
            type: 'manual',
            data: 'Genereer zorgplan op basis van alle voorgaande stappen'
          },
          previousStepData: {
            anamneseResult: workflowData.anamneseData.result,
            onderzoekResult: workflowData.onderzoekData.result,
            klinischeConclusieResult: workflowData.klinischeConclusieData.result,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate zorgplan');
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
      setZorgplanData({
        result: data,
        completed: true,
      });

      // Mark step as complete
      markStepComplete('zorgplan');

      // Complete the session
      if (sessionState) {
        sessionState.completeSession();
      }

    } catch (error) {
      console.error('Zorgplan generation error:', error);
      setState(prev => ({
        ...prev,
        error: 'Kon zorgplan niet genereren. Probeer het opnieuw.',
        isProcessing: false,
      }));
    }
  };

  const handleBack = () => {
    router.push('/scribe/intake-stapsgewijs/klinische-conclusie');
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
      console.error('No zorgplan result or patient info available for export');
      return;
    }

    try {
      const exportData = {
        patientInfo,
        workflowType: 'Stapsgewijze Intake - Volledig',
        content: {
          anamnese: workflowData.anamneseData?.result,
          onderzoek: workflowData.onderzoekData?.result,
          klinischeConclusie: workflowData.klinischeConclusieData?.result,
          zorgplan: state.result
        },
        timestamp: new Date().toISOString(),
        title: `Volledige Intake + Zorgplan - ${patientInfo.initials}`
      };

      await exportDocument(format, exportData);
      console.log(`Successfully exported complete intake with care plan in ${format} format`);
    } catch (error) {
      console.error(`Export failed for ${format} format:`, error);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('Zorgplan result copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!patientInfo || !workflowData.anamneseData?.completed || !workflowData.onderzoekData?.completed || !workflowData.klinischeConclusieData?.completed) {
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
          Terug naar Klinische Conclusie
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center">
            <Target size={24} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Stap 4: Zorgplan
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
            <span className="text-sm text-hysio-deep-green-900/70">Stap 4 van 4</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Clock size={14} className="mr-1" />
            Geschatte tijd: 5 minuten
          </Badge>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            <Target size={14} className="mr-1" />
            Zorgplan Generatie
          </Badge>
          {state.isComplete && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Zorgplan Voltooid
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {state.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Previous Steps Summary */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
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

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800 text-sm">
              <Calendar size={16} />
              Conclusie Voltooid
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-green-700 text-xs">
              Klinische conclusie is vastgesteld
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Zorgplan Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
            <Target size={20} />
            Fysiotherapeutisch Zorgplan
          </CardTitle>
          <CardDescription>
            Gestructureerd behandelplan gebaseerd op diagnose en bevindingen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!state.result ? (
            <div className="text-center py-8">
              <div className="bg-hysio-mint/10 rounded-lg p-6 mb-4">
                <Target size={48} className="mx-auto text-hysio-deep-green mb-4" />
                <h3 className="text-lg font-semibold text-hysio-deep-green mb-2">
                  Klaar voor Zorgplan Generatie
                </h3>
                <p className="text-hysio-deep-green-900/70 mb-4">
                  Alle voorgaande stappen zijn voltooid. Genereer nu een volledig, op maat gemaakt fysiotherapeutisch zorgplan.
                </p>
                <ul className="text-sm text-hysio-deep-green-900/60 text-left max-w-md mx-auto space-y-1">
                  <li>• Behandeldoelen gebaseerd op hulpvraag</li>
                  <li>• Gefaseerde behandelstrategie</li>
                  <li>• Prognose en verwachtingen</li>
                  <li>• Evaluatiemomenten</li>
                </ul>
              </div>
              <Button
                onClick={generateZorgplan}
                disabled={state.isProcessing}
                className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
                size="lg"
              >
                {state.isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Zorgplan Genereren...
                  </>
                ) : (
                  <>
                    <Target size={18} className="mr-2" />
                    Genereer Zorgplan
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-hysio-mint/10 rounded-lg p-6">
                <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap leading-relaxed font-mono">
                  {formatZorgplan(state.result)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(getCopyableText(state.result, formatZorgplan))}
                  className="text-hysio-deep-green border-hysio-mint"
                >
                  <Copy size={14} className="mr-1" />
                  Kopieer Zorgplan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contextual Data Blocks */}
      {state.result && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-blue-100/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-blue-800 text-sm">
                      <Heart size={16} />
                      Anamnese Context
                    </CardTitle>
                    <ChevronDown size={16} className="text-blue-600" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  <div className="bg-white rounded p-3 text-xs text-blue-900/80 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                    {formatContextData(workflowData.anamneseData?.result || 'Geen anamnese data beschikbaar')}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(getCopyableText(workflowData.anamneseData?.result, formatContextData))}
                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                  >
                    <Copy size={12} className="mr-1" />
                    Kopieer
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-purple-100/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-purple-800 text-sm">
                      <Activity size={16} />
                      Onderzoek Context
                    </CardTitle>
                    <ChevronDown size={16} className="text-purple-600" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  <div className="bg-white rounded p-3 text-xs text-purple-900/80 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono">
                    {formatContextData(workflowData.onderzoekData?.result || 'Geen onderzoek data beschikbaar')}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(getCopyableText(workflowData.onderzoekData?.result, formatContextData))}
                    className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                  >
                    <Copy size={12} className="mr-1" />
                    Kopieer
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
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
              Download de complete intake inclusief zorgplan in verschillende formaten
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
            Terug naar Klinische Conclusie
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