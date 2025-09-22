'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowContext } from '../../layout';
import { useWorkflowState } from '@/hooks/useWorkflowState';
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
  RotateCcw
} from 'lucide-react';

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

export default function OnderzoekResultaatPage() {
  const router = useRouter();
  const { patientInfo } = useWorkflowContext();
  const { workflowData } = useWorkflowState();

  const [results, setResults] = React.useState<OnderzoekResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    physical: true,
    movements: true,
    palpation: true,
    functional: true,
    measurements: true,
    observations: true,
    summary: true,
    redflags: true,
  });

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
        setResults(onderzoekData.result);
        setIsLoading(false);
        console.log('Onderzoek results successfully loaded:', onderzoekData.result);
      } else {
        console.error('Invalid onderzoek result data structure:', onderzoekData.result);
        setError('Onderzoek resultaat data is ongeldig. Probeer het proces opnieuw.');
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

  const handleExport = (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    // Export functionality to be implemented
    console.log(`Exporting onderzoek results in ${format} format`);
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
          <span className="text-hysio-deep-green">Onderzoek resultaten laden...</span>
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
                Onderzoek Resultaten
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

      {/* Onderzoek Results Sections */}
      <div className="space-y-6">
        {/* Physical Tests */}
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

        {/* Movements */}
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

        {/* Palpation */}
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

        {/* Functional Tests */}
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

        {/* Measurements */}
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

        {/* Observations */}
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

        {/* Summary */}
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