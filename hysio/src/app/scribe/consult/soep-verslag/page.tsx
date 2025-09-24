'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useSessionState } from '@/hooks/useSessionState';
import { exportSOEPData } from '@/lib/utils/export';
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
  MessageSquare,
  Calendar,
  Home,
  RotateCcw,
  Eye,
  Search,
  TrendingUp,
  Target
} from 'lucide-react';

interface SOEPResults {
  subjectief: any;
  objectief: any;
  evaluatie: any;
  plan: any;
  redFlags: string[];
  processingDuration: number;
  generatedAt: string;
}

export default function SOEPVerslagPage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const sessionState = useSessionState({ autoSave: true, autoSaveInterval: 30000 });
  const workflowData = useScribeStore(state => state.workflowData);

  const [results, setResults] = React.useState<SOEPResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    subjectief: true,
    objectief: true,
    evaluatie: true,
    plan: true,
    samenvatting: true,
    redflags: true,
  });

  // Enhanced state loading with comprehensive validation and lifecycle logging
  React.useEffect(() => {
    console.log('SOEP Verslag: useEffect triggered', { patientInfo, workflowData });

    if (!patientInfo) {
      console.log('SOEP Verslag: No patient info, redirecting to scribe');
      router.push('/scribe');
      return;
    }

    // Validate workflow data exists
    if (!workflowData) {
      console.error('SOEP Verslag: No workflow data available');
      setError('Workflow data niet beschikbaar. Probeer het proces opnieuw.');
      setIsLoading(false);
      return;
    }

    // Load and validate results from workflow state
    const consultData = workflowData.consultData;
    console.log('SOEP Verslag: Checking consultData', consultData);

    if (consultData?.soepResult) {
      // Validate result structure
      if (typeof consultData.soepResult === 'object' && consultData.soepResult !== null) {
        console.log('SOEP Verslag: Results successfully loaded', consultData.soepResult);
        setResults(consultData.soepResult);
        setIsLoading(false);
      } else {
        console.error('SOEP Verslag: Invalid result data structure', consultData.soepResult);
        setError('SOEP verslag data is ongeldig. Probeer het proces opnieuw.');
        setIsLoading(false);
      }
    } else {
      // Enhanced fallback with delayed redirect to prevent phantom redirects
      console.warn('SOEP Verslag: No results found, showing error message with delayed redirect');
      setError('Geen SOEP verslag gevonden. U wordt over 5 seconden doorgestuurd naar de consult pagina...');
      setIsLoading(false);

      // Delayed redirect to give user time to see the error
      setTimeout(() => {
        console.log('SOEP Verslag: Executing delayed redirect to consult page');
        router.push('/scribe/consult');
      }, 5000);
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
      console.log(`${sectionName} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleExport = async (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    if (!soepResult || !patientInfo) {
      console.error('No SOEP result or patient info available for export');
      return;
    }

    try {
      await exportSOEPData(format, soepResult, patientInfo);
      console.log(`Successfully exported SOEP data in ${format} format`);
    } catch (error) {
      console.error(`SOEP export failed for ${format} format:`, error);
      // You could add a toast notification here
    }
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

  const handleBack = () => {
    router.push('/scribe/consult');
  };

  if (!patientInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="mr-3" />
          <span className="text-hysio-deep-green">SOEP verslag laden...</span>
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
            {error || 'Geen SOEP verslag beschikbaar. Ga terug naar de consult pagina.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar consult
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
          Terug naar consult
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageSquare size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hysio-deep-green">
                SOEP Verslag
              </h1>
              <p className="text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) - Vervolgconsult
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
              SOEP Methodiek
            </Badge>
          </div>
        </div>

        {/* Processing Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle size={16} />
            <span>
              Consult succesvol verwerkt in {Math.round(results.processingDuration)} seconden
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

      {/* SOEP Sections */}
      <div className="space-y-6">
        {/* Subjectief */}
        <Card>
          <Collapsible
            open={expandedSections.subjectief}
            onOpenChange={() => toggleSection('subjectief')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Subjectief</CardTitle>
                      <CardDescription>
                        Patiënt ervaring en klachten sinds vorige consult
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(results.subjectief, null, 2), 'Subjectief');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.subjectief ? (
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
                    {results.subjectief ? (
                      typeof results.subjectief === 'string' ? results.subjectief : JSON.stringify(results.subjectief, null, 2)
                    ) : (
                      'Geen subjectieve bevindingen beschikbaar'
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Objectief */}
        <Card>
          <Collapsible
            open={expandedSections.objectief}
            onOpenChange={() => toggleSection('objectief')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Objectief</CardTitle>
                      <CardDescription>
                        Onderzoeksbevindingen en metingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(results.objectief, null, 2), 'Objectief');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.objectief ? (
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
                    {results.objectief ? (
                      typeof results.objectief === 'string' ? results.objectief : JSON.stringify(results.objectief, null, 2)
                    ) : (
                      'Geen objectieve bevindingen beschikbaar'
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Evaluatie */}
        <Card>
          <Collapsible
            open={expandedSections.evaluatie}
            onOpenChange={() => toggleSection('evaluatie')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Evaluatie</CardTitle>
                      <CardDescription>
                        Voortgang beoordeling en analyse
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(results.evaluatie, null, 2), 'Evaluatie');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.evaluatie ? (
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
                    {results.evaluatie ? (
                      typeof results.evaluatie === 'string' ? results.evaluatie : JSON.stringify(results.evaluatie, null, 2)
                    ) : (
                      'Geen evaluatie beschikbaar'
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Plan */}
        <Card>
          <Collapsible
            open={expandedSections.plan}
            onOpenChange={() => toggleSection('plan')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Plan</CardTitle>
                      <CardDescription>
                        Aangepast behandelplan en vervolgafspraken
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(JSON.stringify(results.plan, null, 2), 'Plan');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.plan ? (
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
                    {results.plan ? (
                      typeof results.plan === 'string' ? results.plan : JSON.stringify(results.plan, null, 2)
                    ) : (
                      'Geen behandelplan beschikbaar'
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Samenvatting van Consult */}
        <Card>
          <Collapsible
            open={expandedSections.samenvatting || true}
            onOpenChange={() => toggleSection('samenvatting')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-orange-600" />
                    <div>
                      <CardTitle className="text-orange-700">Samenvatting van Consult</CardTitle>
                      <CardDescription>
                        Beknopte samenvatting van het vervolgconsult
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.consultSummary || 'Geen samenvatting beschikbaar', 'Samenvatting van Consult');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.samenvatting ? (
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
                  <div className="text-orange-900/90 whitespace-pre-wrap leading-relaxed">
                    {results.consultSummary ||
                     'Geen samenvatting van consult beschikbaar. Deze wordt automatisch gegenereerd op basis van de SOEP bevindingen.'}
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
            Download het SOEP verslag in verschillende formaten
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