'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { useSessionState } from '@/hooks/useSessionState';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { exportManager } from '@/lib/utils/advanced-export';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Textarea } from '@/components/ui/textarea';
import { HysioClinicalDisclaimer } from '@/components/ui/hysio-disclaimer';
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Download,
  Copy,
  Edit,
  Save,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  MessageSquare,
  Home,
  RotateCcw,
  Eye,
  TrendingUp,
  Target,
  LayoutGrid,
  FileText as FileIcon
} from 'lucide-react';

interface SOEPResults {
  soepStructure: {
    subjectief: string;
    objectief: string;
    evaluatie: string;
    plan: string;
    consultSummary: string;
    redFlags: string[];
    fullStructuredText: string;
  };
  processedAt: string;
  transcript: string;
  workflowType: string;
  patientInfo: any;
  // Computed fields for display
  processingDuration?: number;
  generatedAt?: string;
}

export default function SOEPVerslagPage() {
  const router = useRouter();
  const patientInfo = useScribeStore((state: any) => state.patientInfo);
  const { navigateToPatientInfo, navigateToWorkflow } = useWorkflowNavigation();
  const sessionState = useSessionState({ autoSave: true, autoSaveInterval: 30000 });
  const workflowData = useScribeStore((state: any) => state.workflowData);

  const [results, setResults] = React.useState<SOEPResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'divided' | 'full'>('divided');
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    subjectief: true,
    objectief: true,
    evaluatie: true,
    plan: true,
    samenvatting: true,
    redflags: true,
  });
  const [editingSections, setEditingSections] = React.useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = React.useState<Record<string, string>>({});

  // Enhanced state loading with comprehensive validation and lifecycle logging
  React.useEffect(() => {
    console.log('SOEP Verslag: useEffect triggered', { patientInfo, workflowData });

    if (!patientInfo) {
      console.log('SOEP Verslag: No patient info, navigating to patient info page');
      navigateToPatientInfo();
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
        console.log('🔍 DEBUG - SOEP Verslag Loading:', {
          consultData: consultData,
          soepResult: consultData.soepResult,
          soepResultKeys: Object.keys(consultData.soepResult),
          soepStructure: consultData.soepResult.soepStructure,
          soepStructureKeys: consultData.soepResult.soepStructure ? Object.keys(consultData.soepResult.soepStructure) : 'NO SOEP STRUCTURE'
        });

        // Transform API response to expected format
        const transformedResults = {
          ...consultData.soepResult,
          generatedAt: consultData.soepResult.processedAt,
          processingDuration: Date.now() - new Date(consultData.soepResult.processedAt).getTime()
        };

        console.log('🔍 DEBUG - Transformed Results:', transformedResults);

        setResults(transformedResults);
        setIsLoading(false);
      } else {
        console.error('SOEP Verslag: Invalid result data structure', consultData.soepResult);
        setError('SOEP verslag data is ongeldig. Probeer het proces opnieuw.');
        setIsLoading(false);
      }
    } else {
      // Enhanced fallback WITHOUT automatic redirect
      console.warn('SOEP Verslag: No results found, showing error with user control');
      setError('Geen SOEP verslag gevonden. Klik op "Terug naar Consult" om door te gaan.');
      setIsLoading(false);
      // No automatic redirect - let user control navigation
    }
  }, [patientInfo, workflowData, router]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'divided' ? 'full' : 'divided');
  };

  const copyToClipboard = async (content: string, sectionName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log(`${sectionName} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const startEditing = (section: string, currentContent: string) => {
    setEditingSections(prev => ({ ...prev, [section]: true }));
    setEditedContent(prev => ({ ...prev, [section]: currentContent }));
  };

  const cancelEditing = (section: string) => {
    setEditingSections(prev => ({ ...prev, [section]: false }));
    setEditedContent(prev => ({ ...prev, [section]: '' }));
  };

  const saveEdit = (section: string) => {
    if (results && editedContent[section] !== undefined) {
      // Update the results with edited content
      const updatedResults = {
        ...results,
        soepStructure: {
          ...results.soepStructure,
          [section]: editedContent[section]
        }
      };
      setResults(updatedResults);
      setEditingSections(prev => ({ ...prev, [section]: false }));
    }
  };

  const handleExport = async (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    if (!results || !patientInfo) {
      console.error('No SOEP result or patient info available for export');
      setError('Geen SOEP resultaten beschikbaar voor export');
      return;
    }

    try {
      console.log(`Starting SOEP export in ${format.toUpperCase()} format...`);

      const blob = await exportManager.exportSOEP(
        results as any,
        patientInfo,
        {
          format,
          includePatientInfo: true,
          includeTimestamp: true,
          includeRedFlags: true,
          template: 'detailed',
          customFileName: `SOEP_Verslag_${patientInfo.initials}_${new Date().toISOString().split('T')[0]}`,
        }
      );

      // Generate filename with proper extension
      const fileName = `SOEP_Verslag_${patientInfo.initials}_${new Date().toISOString().split('T')[0]}.${format === 'docx' ? 'rtf' : format}`;

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`✅ Successfully exported and downloaded SOEP data as ${fileName}`);
    } catch (error) {
      console.error(`SOEP export failed for ${format} format:`, error);
      setError(`Export naar ${format.toUpperCase()} formaat is mislukt. Probeer het opnieuw.`);
    }
  };

  const handleStartNewSession = () => {
    if (sessionState) {
      sessionState.resetSession();
    }
    console.log('Starting new session, navigating to patient info');
    navigateToPatientInfo();
  };

  const handleBackToDashboard = () => {
    // Navigation to dashboard still uses router since it's outside the scribe workflow
    console.log('Navigating to dashboard');
    router.push('/dashboard');
  };

  const handleBack = () => {
    console.log('Navigating back to consult');
    navigateToWorkflow('consult');
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

        {/* Processing Info with View Toggle */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <CheckCircle size={16} />
              <span>
                Consult succesvol verwerkt in {results.processingDuration ? Math.round(results.processingDuration / 1000) : 'N/A'} seconden
              </span>
              <span className="text-green-600">•</span>
              <span>Gegenereerd op {new Date(results.generatedAt || results.processedAt).toLocaleString('nl-NL')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              {viewMode === 'divided' ? (
                <>
                  <FileIcon size={14} className="mr-1" />
                  Volledig
                </>
              ) : (
                <>
                  <LayoutGrid size={14} className="mr-1" />
                  Onderverdeeld
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <HysioClinicalDisclaimer className="mb-6" />

      {/* Red Flags Alert */}
      {results.soepStructure?.redFlags && results.soepStructure.redFlags.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-semibold text-red-800 mb-2">Red Flags Gedetecteerd:</div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {results.soepStructure.redFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* SOEP Sections */}
      {viewMode === 'full' ? (
        // Full View - All content in one continuous text
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
              <MessageSquare size={20} />
              SOEP Verslag - Volledige Weergave
            </CardTitle>
            <CardDescription>
              Alle SOEP bevindingen in één doorlopende tekst
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-hysio-mint/10 rounded-lg p-6">
              <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap leading-relaxed space-y-4 prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-ul:pl-0 prose-li:ml-0">
                {results.soepStructure?.subjectief && (
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-2">Subjectief:</h3>
                    <div className="mb-4">{results.soepStructure.subjectief}</div>
                  </div>
                )}
                {results.soepStructure?.objectief && (
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-2">Objectief:</h3>
                    <div className="mb-4">{results.soepStructure.objectief}</div>
                  </div>
                )}
                {results.soepStructure?.evaluatie && (
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-2">Evaluatie:</h3>
                    <div className="mb-4">{results.soepStructure.evaluatie}</div>
                  </div>
                )}
                {results.soepStructure?.plan && (
                  <div>
                    <h3 className="font-semibold text-hysio-deep-green mb-2">Plan:</h3>
                    <div className="mb-4">{results.soepStructure.plan}</div>
                  </div>
                )}
                {results.soepStructure?.consultSummary && (
                  <div>
                    <h3 className="font-semibold text-orange-600 mb-2">Samenvatting van Consult:</h3>
                    <div className="text-orange-900/90">{results.soepStructure.consultSummary}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fullText = [
                    results.soepStructure?.subjectief && `Subjectief: ${results.soepStructure.subjectief}`,
                    results.soepStructure?.objectief && `Objectief: ${results.soepStructure.objectief}`,
                    results.soepStructure?.evaluatie && `Evaluatie: ${results.soepStructure.evaluatie}`,
                    results.soepStructure?.plan && `Plan: ${results.soepStructure.plan}`,
                    results.soepStructure?.consultSummary && `Samenvatting: ${results.soepStructure.consultSummary}`
                  ].filter(Boolean).join('\n\n');
                  copyToClipboard(fullText, 'Volledig SOEP Verslag');
                }}
                className="text-hysio-deep-green border-hysio-mint"
              >
                <Copy size={14} className="mr-1" />
                Kopieer Alles
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Divided View - Collapsible sections
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
                        copyToClipboard(results.soepStructure?.subjectief || 'Geen data', 'Subjectief');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing('subjectief', results.soepStructure?.subjectief || '');
                      }}
                    >
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
                  {editingSections.subjectief ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedContent.subjectief || ''}
                        onChange={(e) => setEditedContent(prev => ({ ...prev, subjectief: e.target.value }))}
                        rows={6}
                        className="resize-none"
                        placeholder="Bewerk subjectieve bevindingen..."
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit('subjectief')}
                          className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
                        >
                          <Save size={14} className="mr-1" />
                          Opslaan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelEditing('subjectief')}
                        >
                          Annuleren
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-ul:pl-0 prose-li:ml-0">
                      {results.soepStructure?.subjectief || 'Geen subjectieve bevindingen beschikbaar'}
                    </div>
                  )}
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
                        copyToClipboard(results.soepStructure?.objectief || 'Geen data', 'Objectief');
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
                  <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-ul:pl-0 prose-li:ml-0">
                    {results.soepStructure?.objectief || 'Geen objectieve bevindingen beschikbaar'}
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
                        copyToClipboard(results.soepStructure?.evaluatie || 'Geen data', 'Evaluatie');
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
                  <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-ul:pl-0 prose-li:ml-0">
                    {results.soepStructure?.evaluatie || 'Geen evaluatie beschikbaar'}
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
                        copyToClipboard(results.soepStructure?.plan || 'Geen data', 'Plan');
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
                  <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap prose prose-sm max-w-none prose-ul:list-disc prose-ul:ml-6 prose-ul:pl-0 prose-li:ml-0">
                    {results.soepStructure?.plan || 'Geen behandelplan beschikbaar'}
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
                        copyToClipboard(results.soepStructure?.consultSummary || 'Geen samenvatting beschikbaar', 'Samenvatting van Consult');
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
                    {results.soepStructure?.consultSummary ||
                     'Geen samenvatting van consult beschikbaar. Deze wordt automatisch gegenereerd op basis van de SOEP bevindingen.'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
        </div>
      )}

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