'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowContext } from '../../layout';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Users,
  Calendar,
  Home,
  RotateCcw
} from 'lucide-react';

interface IntakeResults {
  hhsbAnamneseCard: any;
  onderzoeksBevindingen: any;
  klinischeConclusie: any;
  redFlags: string[];
  processingDuration: number;
  generatedAt: string;
}

export default function AutomatedIntakeConclusie() {
  const router = useRouter();
  const { patientInfo, sessionState } = useWorkflowContext();
  const { navigateBack } = useWorkflowNavigation();
  const { workflowData } = useWorkflowState();

  const [results, setResults] = React.useState<IntakeResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    anamnese: true,
    onderzoek: true,
    conclusie: true,
    redflags: true,
  });

  // Redirect if no patient info
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
      return;
    }

    // Load results from workflow state
    const automatedData = workflowData.automatedIntakeData;
    if (automatedData?.result) {
      setResults(automatedData.result);
      setIsLoading(false);
    } else {
      // If no results, redirect back to intake page
      router.push('/scribe/intake-automatisch');
    }
  }, [patientInfo, workflowData, router]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = async (content: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add toast notification here
      console.log(`${sectionName} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleExport = (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    // Export functionality to be implemented
    console.log(`Exporting in ${format} format`);
  };

  const handleStartNewSession = () => {
    sessionState.resetSession();
    router.push('/scribe');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.push('/scribe/intake-automatisch');
  };

  if (!patientInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="mr-3" />
          <span className="text-hysio-deep-green">Resultaten laden...</span>
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
            {error || 'Geen resultaten beschikbaar. Ga terug naar de intake pagina.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar intake
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
          onClick={handleBack}
          className="mb-4 text-hysio-deep-green hover:bg-hysio-mint/10"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar intake
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hysio-deep-green">
                Intake Resultaten
              </h1>
              <p className="text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) - Volledig automatisch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Voltooid
            </Badge>
            <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
              <FileText size={14} className="mr-1" />
              HHSB Methodiek
            </Badge>
          </div>
        </div>

        {/* Processing Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle size={16} />
            <span>
              Intake succesvol verwerkt in {Math.round(results.processingDuration)} seconden
            </span>
            <span className="text-green-600">•</span>
            <span>Gegenereerd op {new Date(results.generatedAt).toLocaleString('nl-NL')}</span>
          </div>
        </div>
      </div>

      {/* Red Flags Alert */}
      {results.redFlags && results.redFlags.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-semibold text-red-800 mb-2">Red Flags Gedetecteerd:</div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {results.redFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Sections */}
      <div className="space-y-6">
        {/* HHSB Anamnesekaart */}
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
                      <CardTitle className="text-hysio-deep-green">HHSB Anamnesekaart</CardTitle>
                      <CardDescription>
                        Hulpvraag, Historie, Stoornissen en Beperkingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(results.hhsbAnamneseCard, null, 2), 'HHSB Anamnesekaart');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
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
                <div className="space-y-6">
                  {/* Hulpvraag */}
                  <div>
                    <h4 className="font-semibold text-hysio-deep-green mb-3">Hulpvraag</h4>
                    <div className="bg-hysio-mint/10 rounded-lg p-4 space-y-3">
                      <div>
                        <span className="font-medium text-hysio-deep-green-900">Primaire klacht:</span>
                        <p className="text-hysio-deep-green-900/80 mt-1">
                          {results.hhsbAnamneseCard?.hulpvraag?.primaryConcern || 'Niet gespecificeerd'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-hysio-deep-green-900">Patiënt doelen:</span>
                        <ul className="list-disc list-inside text-hysio-deep-green-900/80 mt-1">
                          {results.hhsbAnamneseCard?.hulpvraag?.patientGoals?.map((goal: string, index: number) => (
                            <li key={index}>{goal}</li>
                          )) || <li>Geen doelen gespecificeerd</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Historie */}
                  <div>
                    <h4 className="font-semibold text-hysio-deep-green mb-3">Historie</h4>
                    <div className="bg-hysio-mint/10 rounded-lg p-4">
                      <div className="text-hysio-deep-green-900/80">
                        {results.hhsbAnamneseCard?.historie ? (
                          <div className="space-y-2">
                            <p><strong>Huidige symptomen:</strong> {results.hhsbAnamneseCard.historie.currentSymptoms || 'Niet gespecificeerd'}</p>
                            <p><strong>Relevante voorgeschiedenis:</strong> {results.hhsbAnamneseCard.historie.relevantHistory || 'Niet gespecificeerd'}</p>
                          </div>
                        ) : (
                          'Geen historie informatie beschikbaar'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stoornissen */}
                  <div>
                    <h4 className="font-semibold text-hysio-deep-green mb-3">Stoornissen</h4>
                    <div className="bg-hysio-mint/10 rounded-lg p-4">
                      <div className="text-hysio-deep-green-900/80">
                        {results.hhsbAnamneseCard?.stoornissen ? (
                          JSON.stringify(results.hhsbAnamneseCard.stoornissen, null, 2)
                        ) : (
                          'Geen stoornissen geïdentificeerd'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Beperkingen */}
                  <div>
                    <h4 className="font-semibold text-hysio-deep-green mb-3">Beperkingen</h4>
                    <div className="bg-hysio-mint/10 rounded-lg p-4">
                      <div className="text-hysio-deep-green-900/80">
                        {results.hhsbAnamneseCard?.beperkingen ? (
                          JSON.stringify(results.hhsbAnamneseCard.beperkingen, null, 2)
                        ) : (
                          'Geen beperkingen geïdentificeerd'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Onderzoeksbevindingen */}
        <Card>
          <Collapsible
            open={expandedSections.onderzoek}
            onOpenChange={() => toggleSection('onderzoek')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Onderzoeksbevindingen</CardTitle>
                      <CardDescription>
                        Fysiek onderzoek en functionele testen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(results.onderzoeksBevindingen, null, 2), 'Onderzoeksbevindingen');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
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
                <div className="bg-hysio-mint/10 rounded-lg p-4">
                  <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap">
                    {results.onderzoeksBevindingen ? (
                      JSON.stringify(results.onderzoeksBevindingen, null, 2)
                    ) : (
                      'Geen onderzoeksbevindingen beschikbaar'
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Klinische Conclusie */}
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
                        copyToClipboard(JSON.stringify(results.klinischeConclusie, null, 2), 'Klinische Conclusie');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
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
                <div className="bg-hysio-mint/10 rounded-lg p-4">
                  <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap">
                    {results.klinischeConclusie ? (
                      JSON.stringify(results.klinischeConclusie, null, 2)
                    ) : (
                      'Geen klinische conclusie beschikbaar'
                    )}
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
            Download de resultaten in verschillende formaten
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

      {/* Action Buttons */}
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