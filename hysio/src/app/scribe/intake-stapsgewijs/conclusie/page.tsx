'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useSessionState } from '@/hooks/useSessionState';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
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
  Edit,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Heart,
  Activity,
  Calendar,
  Home,
  RotateCcw,
  Clock,
  Users,
  Search,
  Lightbulb,
  Award
} from 'lucide-react';

interface StepwiseIntakeResults {
  anamnese: {
    hhsbCard: any;
    redFlags: string[];
    completedAt: string;
  };
  onderzoek: {
    examinationFindings: any;
    redFlags: string[];
    completedAt: string;
  };
  klinischeConclusie: {
    diagnosis: any;
    treatmentPlan: any;
    followUp: any;
    completedAt: string;
  };
  overallRedFlags: string[];
  workflowCompletedAt: string;
  totalDuration: number;
}

export default function StepwiseIntakeConclusie() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const { navigateToPatientInfo, navigateToStep } = useWorkflowNavigation();
  const sessionState = useSessionState({ autoSave: true, autoSaveInterval: 30000 });
  const workflowData = useScribeStore(state => state.workflowData);

  const [results, setResults] = React.useState<StepwiseIntakeResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    anamnese: true,
    onderzoek: true,
    conclusie: true,
    redflags: true,
    summary: true,
  });

  // Enhanced state loading with comprehensive validation
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
      return;
    }

    // Validate all steps are completed
    const { anamneseData, onderzoekData, klinischeConclusieData } = workflowData;

    if (!anamneseData?.completed) {
      console.warn('Anamnese not completed, redirecting');
      router.push('/scribe/intake-stapsgewijs/anamnese');
      return;
    }

    if (!onderzoekData?.completed) {
      console.warn('Onderzoek not completed, redirecting');
      router.push('/scribe/intake-stapsgewijs/onderzoek');
      return;
    }

    if (!klinischeConclusieData?.completed) {
      console.warn('Klinische conclusie not completed, redirecting');
      router.push('/scribe/intake-stapsgewijs/klinische-conclusie');
      return;
    }

    // Compile comprehensive results
    try {
      const allRedFlags = [
        ...(anamneseData.result?.redFlags || []),
        ...(onderzoekData.result?.examinationFindings?.redFlags || []),
      ];

      const compiledResults: StepwiseIntakeResults = {
        anamnese: {
          hhsbCard: anamneseData.result?.hhsbAnamneseCard || anamneseData.result,
          redFlags: anamneseData.result?.redFlags || [],
          completedAt: anamneseData.completedAt || new Date().toISOString(),
        },
        onderzoek: {
          examinationFindings: onderzoekData.result?.examinationFindings || onderzoekData.result,
          redFlags: onderzoekData.result?.examinationFindings?.redFlags || [],
          completedAt: onderzoekData.completedAt || new Date().toISOString(),
        },
        klinischeConclusie: {
          diagnosis: klinischeConclusieData.result?.diagnosis || klinischeConclusieData.result,
          treatmentPlan: klinischeConclusieData.result?.treatmentPlan,
          followUp: klinischeConclusieData.result?.followUp,
          completedAt: klinischeConclusieData.completedAt || new Date().toISOString(),
        },
        overallRedFlags: [...new Set(allRedFlags)], // Remove duplicates
        workflowCompletedAt: new Date().toISOString(),
        totalDuration: 0 // Can be calculated if timestamps are available
      };

      setResults(compiledResults);
      setIsLoading(false);

      // Complete the session
      if (sessionState) {
        sessionState.completeSession();
      }

      console.log('Stepwise intake results compiled successfully:', compiledResults);

    } catch (error) {
      console.error('Error compiling stepwise intake results:', error);
      setError('Er is een fout opgetreden bij het samenstellen van de intake resultaten.');
      setIsLoading(false);
    }
  }, [patientInfo, workflowData, router, sessionState]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = async (content: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(typeof content === 'object' ? JSON.stringify(content, null, 2) : content);
      console.log(`${sectionName} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleExport = async (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    if (!results || !patientInfo) {
      console.error('No stepwise intake results or patient info available for export');
      return;
    }

    try {
      const exportData = {
        patientInfo,
        workflowType: 'Stapsgewijze Intake - Volledige Resultaten',
        content: results,
        timestamp: new Date().toISOString(),
        title: `Volledige Intake - ${patientInfo.initials}`
      };

      await exportDocument(format, exportData);
      console.log(`Successfully exported stepwise intake in ${format} format`);
    } catch (error) {
      console.error(`Export failed for ${format} format:`, error);
    }
  };

  const handleBackToKlinischeConclusie = () => {
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

  if (!patientInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="mr-3" />
          <span className="text-hysio-deep-green">Intake resultaten samenstellen...</span>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Geen volledige intake resultaten beschikbaar. Zorg ervoor dat alle stappen zijn voltooid.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBackToKlinischeConclusie} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar klinische conclusie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToKlinischeConclusie}
          className="mb-4 text-hysio-deep-green hover:bg-hysio-mint/10"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar klinische conclusie
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Award size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hysio-deep-green">
                Volledige Intake Resultaten
              </h1>
              <p className="text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) - Stapsgewijze Intake Voltooid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Intake Voltooid
            </Badge>
            <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
              <Clock size={14} className="mr-1" />
              3 Stappen
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-hysio-deep-green">Voortgang</span>
            <span className="text-sm text-hysio-deep-green-900/70">Volledig voltooid</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>

        {/* Completion Summary */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-800 text-sm mb-2">
            <CheckCircle size={16} />
            <span className="font-semibold">
              Stapsgewijze intake succesvol voltooid op {new Date(results.workflowCompletedAt).toLocaleString('nl-NL')}
            </span>
          </div>
          <p className="text-green-700 text-sm">
            Alle drie de stappen (anamnese, onderzoek, klinische conclusie) zijn met succes doorlopen.
          </p>
        </div>
      </div>

      {/* Overall Red Flags Alert */}
      {results.overallRedFlags && results.overallRedFlags.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-semibold text-red-800 mb-2">Belangrijke Red Flags Gedetecteerd:</div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {results.overallRedFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Intake Results Sections */}
      <div className="space-y-6">
        {/* Step 1: Anamnese Results */}
        <Card>
          <Collapsible
            open={expandedSections.anamnese}
            onOpenChange={() => toggleSection('anamnese')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Stap 1: Anamnese</CardTitle>
                      <CardDescription>
                        HHSB anamnesekaart en patiëntgeschiedenis
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle size={14} className="mr-1" />
                      Voltooid
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.anamnese.hhsbCard, 'Anamnese');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    {expandedSections.anamnese ? (
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
                <div className="space-y-4">
                  <div className="bg-hysio-mint/10 rounded-lg p-4">
                    <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap">
                      {typeof results.anamnese.hhsbCard === 'object' ?
                        JSON.stringify(results.anamnese.hhsbCard, null, 2) :
                        results.anamnese.hhsbCard || 'Geen anamnese gegevens beschikbaar'
                      }
                    </div>
                  </div>
                  <div className="text-xs text-hysio-deep-green-900/60">
                    Voltooid op: {new Date(results.anamnese.completedAt).toLocaleString('nl-NL')}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Step 2: Onderzoek Results */}
        <Card>
          <Collapsible
            open={expandedSections.onderzoek}
            onOpenChange={() => toggleSection('onderzoek')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Stap 2: Onderzoek</CardTitle>
                      <CardDescription>
                        Fysiek onderzoek en bevindingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle size={14} className="mr-1" />
                      Voltooid
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.onderzoek.examinationFindings, 'Onderzoek');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    {expandedSections.onderzoek ? (
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
                <div className="space-y-4">
                  <div className="bg-hysio-mint/10 rounded-lg p-4 space-y-3">
                    <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap">
                      {typeof results.onderzoek.examinationFindings === 'object' ? (
                        <div className="space-y-2">
                          {results.onderzoek.examinationFindings.palpation && (
                            <div>
                              <strong>Inspectie & Palpatie:</strong>
                              <div className="mt-1">{results.onderzoek.examinationFindings.palpation}</div>
                            </div>
                          )}
                          {results.onderzoek.examinationFindings.movements && (
                            <div>
                              <strong>Bewegingsonderzoek:</strong>
                              <div className="mt-1">{results.onderzoek.examinationFindings.movements}</div>
                            </div>
                          )}
                          {results.onderzoek.examinationFindings.physicalTests && (
                            <div>
                              <strong>Fysieke Testen:</strong>
                              <div className="mt-1">{results.onderzoek.examinationFindings.physicalTests}</div>
                            </div>
                          )}
                          {results.onderzoek.examinationFindings.measurements && (
                            <div>
                              <strong>Klinimetrie:</strong>
                              <div className="mt-1">{results.onderzoek.examinationFindings.measurements}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        results.onderzoek.examinationFindings || 'Geen onderzoek bevindingen beschikbaar'
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-hysio-deep-green-900/60">
                    Voltooid op: {new Date(results.onderzoek.completedAt).toLocaleString('nl-NL')}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Step 3: Klinische Conclusie Results */}
        <Card>
          <Collapsible
            open={expandedSections.conclusie}
            onOpenChange={() => toggleSection('conclusie')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Stap 3: Klinische Conclusie</CardTitle>
                      <CardDescription>
                        Diagnose, behandelplan en vervolgafspraken
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle size={14} className="mr-1" />
                      Voltooid
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.klinischeConclusie.diagnosis, 'Klinische Conclusie');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    {expandedSections.conclusie ? (
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
                <div className="space-y-4">
                  <div className="bg-hysio-mint/10 rounded-lg p-4">
                    <div className="text-sm text-hysio-deep-green-900/80 whitespace-pre-wrap">
                      {typeof results.klinischeConclusie.diagnosis === 'object' ?
                        JSON.stringify(results.klinischeConclusie.diagnosis, null, 2) :
                        results.klinischeConclusie.diagnosis || 'Geen klinische conclusie beschikbaar'
                      }
                    </div>
                  </div>
                  <div className="text-xs text-hysio-deep-green-900/60">
                    Voltooid op: {new Date(results.klinischeConclusie.completedAt).toLocaleString('nl-NL')}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Summary Section */}
        <Card>
          <Collapsible
            open={expandedSections.summary}
            onOpenChange={() => toggleSection('summary')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-orange-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-orange-600" />
                    <div>
                      <CardTitle className="text-orange-700">Intake Samenvatting</CardTitle>
                      <CardDescription>
                        Overzicht van de volledige stapsgewijze intake
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results, 'Volledige Intake');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    {expandedSections.summary ? (
                      <ChevronDown size={20} className="text-orange-600" />
                    ) : (
                      <ChevronRight size={20} className="text-orange-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-orange-800">Patiënt:</span>
                      <span className="text-orange-700 ml-2">
                        {patientInfo.initials} ({patientInfo.birthYear})
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-800">Workflow:</span>
                      <span className="text-orange-700 ml-2">Stapsgewijze Intake</span>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-800">Voltooide stappen:</span>
                      <span className="text-orange-700 ml-2">3 van 3 (Anamnese, Onderzoek, Klinische Conclusie)</span>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-800">Red Flags:</span>
                      <span className="text-orange-700 ml-2">
                        {results.overallRedFlags.length} gedetecteerd
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-orange-800">Voltooid op:</span>
                      <span className="text-orange-700 ml-2">
                        {new Date(results.workflowCompletedAt).toLocaleString('nl-NL')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
            <Download size={20} />
            Export Opties
          </CardTitle>
          <CardDescription>
            Download de volledige stapsgewijze intake in verschillende formaten
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

      {/* Navigation */}
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
    </div>
  );
}