'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Download,
  Copy,
  Edit,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Search,
  Activity,
  RotateCcw,
  LayoutGrid
} from 'lucide-react';
import { AdvancedExportManager, type ExportFormat } from '@/lib/utils/advanced-export';

interface OnderzoekResults {
  examinationFindings: {
    physicalTests: string;
    movements: string;
    palpation: string;
    functionalTests: string;
    measurements: string;
    observations: string;
    summary: string;
    redFlags: string[];
  };
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: {
    initials: string;
    age: number;
    gender: string;
    chiefComplaint: string;
  };
}

export default function OnderzoeksbevindgingenPage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const workflowData = useScribeStore(state => state.workflowData);

  const [results, setResults] = React.useState<OnderzoekResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    observations: true,
    palpation: true,
    movements: true,
    measurements: true,
    physical: true,
    functional: true,
    summary: true,
    redflags: true,
  });
  const [viewMode, setViewMode] = React.useState<'divided' | 'full'>('divided');

  // Enhanced state loading with comprehensive validation
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
      return;
    }

    // Validate workflow data exists
    if (!workflowData) {
      console.error('No workflow data available');
      setError('Workflow data niet beschikbaar. Ga terug naar onderzoek.');
      setIsLoading(false);
      return;
    }

    // Load and validate results from workflow state
    const onderzoekData = workflowData.onderzoekData;

    if (onderzoekData?.result) {
      // Validate result structure
      if (typeof onderzoekData.result === 'object' && onderzoekData.result !== null) {
        // Transform HHSB API response to expected onderzoek-resultaat format
        const hhsbResult = onderzoekData.result;

        // Transform structured data with comprehensive mapping from multiple possible sources
        const renderStructuredContent = (content: any): string => {
          if (!content) return 'Geen informatie beschikbaar';
          if (typeof content === 'string') return content;
          if (Array.isArray(content)) return content.filter(item => item).join('\n\n');
          if (typeof content === 'object') {
            const textValues = Object.values(content)
              .filter(value => typeof value === 'string' && value.trim())
              .join('\n\n');
            return textValues || 'Informatie verwerkt maar geen leesbare inhoud beschikbaar';
          }
          return String(content);
        };

        // Map the onderzoekStructure from the new onderzoek API to the expected structure
        const transformedResults = {
          examinationFindings: {
            physicalTests: renderStructuredContent(
              hhsbResult.onderzoekStructure?.specifiekeTests ||
              'Geen fysieke test informatie beschikbaar'
            ),
            movements: renderStructuredContent(
              hhsbResult.onderzoekStructure?.bewegingsonderzoek ||
              'Geen bewegingsonderzoek informatie beschikbaar'
            ),
            palpation: renderStructuredContent(
              hhsbResult.onderzoekStructure?.inspectieEnPalpatie ||
              'Geen palpatie informatie beschikbaar'
            ),
            functionalTests: renderStructuredContent(
              hhsbResult.klinischeSynthese?.interpretatie ||
              hhsbResult.onderzoekStructure?.specifiekeTests ||
              'Geen functionele test informatie beschikbaar'
            ),
            measurements: renderStructuredContent(
              hhsbResult.onderzoekStructure?.klinimetrie ||
              'Geen metingen beschikbaar'
            ),
            observations: renderStructuredContent(
              hhsbResult.onderzoekStructure?.inspectieEnPalpatie ||
              'Geen observaties genoteerd'
            ),
            summary: renderStructuredContent(
              hhsbResult.klinischeSynthese?.diagnose ||
              hhsbResult.onderzoekStructure?.samenvatting ||
              'Geen samenvatting van onderzoek beschikbaar'
            ),
            redFlags: hhsbResult.redFlags || []
          },
          transcript: hhsbResult.transcript || 'Geen transcript beschikbaar',
          workflowType: hhsbResult.workflowType || 'intake-stapsgewijs',
          processedAt: hhsbResult.processedAt || new Date().toISOString(),
          patientInfo: hhsbResult.patientInfo || patientInfo
        };

        setResults(transformedResults);
        setIsLoading(false);
        console.log('Onderzoek results successfully transformed and loaded:', transformedResults);
      } else {
        console.error('Invalid onderzoek result data structure:', onderzoekData.result);
        setError('Onderzoeksbevindingen data is ongeldig. Probeer het proces opnieuw.');
        setIsLoading(false);
      }
    } else {
      // Enhanced fallback with delayed redirect
      console.warn('No onderzoek results found in workflow data, redirecting to onderzoek page');
      setError('Geen onderzoek resultaten gevonden. U wordt doorgestuurd naar de onderzoek pagina...');

      setTimeout(() => {
        router.push('/scribe/intake-stapsgewijs/onderzoek');
      }, 3000);
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

  const handleExport = async (format: ExportFormat) => {
    if (!results || !patientInfo) {
      console.error('No results or patient info available for export');
      return;
    }

    try {
      const exportManager = AdvancedExportManager.getInstance();

      // Transform results to the expected OnderzoekResult format
      const onderzoekResult = {
        onderzoekStructure: {
          inspectieEnPalpatie: results.examinationFindings.palpation + '\n\n' + results.examinationFindings.observations,
          bewegingsonderzoek: results.examinationFindings.movements,
          specifiekeTests: results.examinationFindings.physicalTests + '\n\n' + results.examinationFindings.functionalTests,
          klinimetrie: results.examinationFindings.measurements,
          samenvatting: results.examinationFindings.summary
        },
        transcript: results.transcript,
        workflowType: results.workflowType,
        processedAt: results.processedAt,
        patientInfo: results.patientInfo,
        redFlags: results.examinationFindings.redFlags || []
      };

      console.log(`Exporting onderzoek results in ${format} format...`);

      // For now, export just the onderzoek results as a single document
      // TODO: When klinische conclusie is available, use exportStepwiseIntake with all parts
      const blob = await exportManager.exportSOEP(
        {
          soepStructure: {
            subjectief: 'Zie anamnese rapport',
            objectief: onderzoekResult.onderzoekStructure.inspectieEnPalpatie + '\n\n' +
                      onderzoekResult.onderzoekStructure.bewegingsonderzoek + '\n\n' +
                      onderzoekResult.onderzoekStructure.specifiekeTests + '\n\n' +
                      (onderzoekResult.onderzoekStructure.klinimetrie ? onderzoekResult.onderzoekStructure.klinimetrie : ''),
            evaluatie: onderzoekResult.onderzoekStructure.samenvatting,
            plan: 'Zie klinische conclusie rapport'
          },
          transcript: onderzoekResult.transcript,
          workflowType: onderzoekResult.workflowType,
          processedAt: onderzoekResult.processedAt,
          patientInfo: onderzoekResult.patientInfo
        },
        results.patientInfo,
        {
          format,
          template: 'detailed',
          customHeader: 'Fysiek Onderzoek Rapport',
          includeRedFlags: true
        }
      );

      // Download the exported file
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `onderzoek-rapport-${results.patientInfo.initials}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`Onderzoek rapport geëxporteerd als ${format}`);

    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleBackToOnderzoek = () => {
    router.push('/scribe/intake-stapsgewijs/onderzoek');
  };

  const handleNextToConclusie = () => {
    router.push('/scribe/intake-stapsgewijs/klinische-conclusie');
  };

  if (!patientInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="mr-3" />
          <span className="text-hysio-deep-green">Onderzoeksbevindingen laden...</span>
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
            {error || 'Geen onderzoek resultaten beschikbaar. Ga terug naar de onderzoek pagina.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBackToOnderzoek} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar onderzoek
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
          onClick={handleBackToOnderzoek}
          className="mb-4 text-hysio-deep-green hover:bg-hysio-mint/10"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar onderzoek
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hysio-deep-green">
                Onderzoeksbevindingen
              </h1>
              <p className="text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) - Stap 2 voltooid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Onderzoek voltooid
            </Badge>
            <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
              <Search size={14} className="mr-1" />
              Fysiek Onderzoek
            </Badge>
          </div>
        </div>

        {/* Processing Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle size={16} />
            <span>
              Onderzoek succesvol verwerkt op {new Date(results.processedAt).toLocaleString('nl-NL')}
            </span>
          </div>
        </div>
      </div>

      {/* Red Flags Alert */}
      {results.examinationFindings.redFlags && results.examinationFindings.redFlags.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-semibold text-red-800 mb-2">Red Flags Gedetecteerd:</div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {results.examinationFindings.redFlags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* View Mode Toggle */}
      <div className="mb-6 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(prev => prev === 'divided' ? 'full' : 'divided')}
          className="text-hysio-deep-green border-hysio-mint"
        >
          {viewMode === 'divided' ? (
            <>
              <FileText size={14} className="mr-1" />
              Volledige Weergave
            </>
          ) : (
            <>
              <LayoutGrid size={14} className="mr-1" />
              Onderverdeeld
            </>
          )}
        </Button>
      </div>

      {/* Onderzoek Results Sections */}
      {viewMode === 'full' ? (
        // Full View - All content in one continuous text
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
              <Search size={20} />
              Onderzoeksbevindingen - Volledige Weergave
            </CardTitle>
            <CardDescription>
              Alle onderzoeksbevindingen in één doorlopende tekst
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-hysio-mint/10 rounded-lg p-6">
              <div className="text-hysio-deep-green-900/80 whitespace-pre-wrap leading-relaxed space-y-4">
                {results.examinationFindings.observations && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Observaties:</strong>
                    <br />
                    {results.examinationFindings.observations}
                  </div>
                )}

                {results.examinationFindings.palpation && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Palpatie:</strong>
                    <br />
                    {results.examinationFindings.palpation}
                  </div>
                )}

                {results.examinationFindings.movements && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Bewegingsonderzoek:</strong>
                    <br />
                    {results.examinationFindings.movements}
                  </div>
                )}

                {results.examinationFindings.measurements && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Metingen:</strong>
                    <br />
                    {results.examinationFindings.measurements}
                  </div>
                )}

                {results.examinationFindings.physicalTests && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Fysieke Testen:</strong>
                    <br />
                    {results.examinationFindings.physicalTests}
                  </div>
                )}

                {results.examinationFindings.functionalTests && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Functionele Testen:</strong>
                    <br />
                    {results.examinationFindings.functionalTests}
                  </div>
                )}

                {results.examinationFindings.summary && (
                  <div>
                    <strong className="text-hysio-deep-green text-lg">Samenvatting:</strong>
                    <br />
                    {results.examinationFindings.summary}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(
                  [
                    results.examinationFindings.observations && `Observaties: ${results.examinationFindings.observations}`,
                    results.examinationFindings.palpation && `Palpatie: ${results.examinationFindings.palpation}`,
                    results.examinationFindings.movements && `Bewegingsonderzoek: ${results.examinationFindings.movements}`,
                    results.examinationFindings.measurements && `Metingen: ${results.examinationFindings.measurements}`,
                    results.examinationFindings.physicalTests && `Fysieke Testen: ${results.examinationFindings.physicalTests}`,
                    results.examinationFindings.functionalTests && `Functionele Testen: ${results.examinationFindings.functionalTests}`,
                    results.examinationFindings.summary && `Samenvatting: ${results.examinationFindings.summary}`
                  ].filter(Boolean).join('\n\n'),
                  'Volledige Onderzoeksbevindingen'
                )}
                className="text-hysio-deep-green border-hysio-mint"
              >
                <Copy size={14} className="mr-1" />
                Kopieer Alles
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Divided View - Sections separately
        <div className="space-y-6">
        {/* Observaties */}
        <Card>
          <Collapsible
            open={expandedSections.observations}
            onOpenChange={() => toggleSection('observations')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search size={20} className="text-purple-600" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Observaties</CardTitle>
                      <CardDescription>
                        Visuele observaties en algemene bevindingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.observations, 'Observaties');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.observations ? (
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
                    {results.examinationFindings.observations || 'Geen observaties genoteerd'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Palpatie */}
        <Card>
          <Collapsible
            open={expandedSections.palpation}
            onOpenChange={() => toggleSection('palpation')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Palpatie</CardTitle>
                      <CardDescription>
                        Tastonderzoek en palpatiebevindingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.palpation, 'Palpatie');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.palpation ? (
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
                    {results.examinationFindings.palpation || 'Geen palpatie informatie beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Fysieke Testen */}
        <Card>
          <Collapsible
            open={expandedSections.physical}
            onOpenChange={() => toggleSection('physical')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Fysieke Testen</CardTitle>
                      <CardDescription>
                        Specifieke fysieke tests en beoordelingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.physicalTests, 'Fysieke Testen');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.physical ? (
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
                    {results.examinationFindings.physicalTests || 'Geen fysieke test informatie beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card>
          <Collapsible
            open={expandedSections.movements}
            onOpenChange={() => toggleSection('movements')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RotateCcw size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Bewegingsonderzoek</CardTitle>
                      <CardDescription>
                        Range of motion en bewegingspatronen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.movements, 'Bewegingsonderzoek');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.movements ? (
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
                    {results.examinationFindings.movements || 'Geen bewegingsonderzoek informatie beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Metingen */}
        <Card>
          <Collapsible
            open={expandedSections.measurements}
            onOpenChange={() => toggleSection('measurements')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Metingen</CardTitle>
                      <CardDescription>
                        Objectieve metingen en kwantificeerbare data
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.measurements, 'Metingen');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.measurements ? (
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
                    {results.examinationFindings.measurements || 'Geen metingen beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Functionele Testen */}
        <Card>
          <Collapsible
            open={expandedSections.functional}
            onOpenChange={() => toggleSection('functional')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity size={20} className="text-orange-600" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">Functionele Testen</CardTitle>
                      <CardDescription>
                        Functionele bewegingstesten en assessments
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.functionalTests, 'Functionele Testen');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.functional ? (
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
                    {results.examinationFindings.functionalTests || 'Geen functionele test informatie beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Samenvatting */}
        <Card>
          <Collapsible
            open={expandedSections.summary}
            onOpenChange={() => toggleSection('summary')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-orange-600" />
                    <div>
                      <CardTitle className="text-orange-700">Samenvatting Onderzoek</CardTitle>
                      <CardDescription>
                        Beknopte samenvatting van alle onderzoeksbevindingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.examinationFindings.summary || 'Geen samenvatting beschikbaar', 'Samenvatting Onderzoek');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
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
                  <div className="text-orange-900/90 whitespace-pre-wrap leading-relaxed">
                    {results.examinationFindings.summary ||
                     'Geen samenvatting van onderzoek beschikbaar. Deze wordt automatisch gegenereerd op basis van de onderzoeksbevindingen.'}
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
            Download de onderzoek resultaten in verschillende formaten
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
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={handleBackToOnderzoek}
          className="text-hysio-deep-green border-hysio-mint"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar Onderzoek
        </Button>

        <Button
          onClick={handleNextToConclusie}
          className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
          size="lg"
        >
          Volgende: Klinische Conclusie
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}