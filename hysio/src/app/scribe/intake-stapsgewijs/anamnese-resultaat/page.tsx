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
  Heart,
  RotateCcw
} from 'lucide-react';

interface AnamneseResults {
  hhsbStructure: {
    hulpvraag: string;
    historie: string;
    stoornissen: string;
    beperkingen: string;
    anamneseSummary: string;
    redFlags: string[];
    fullStructuredText: string;
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

export default function AnamneseResultaatPage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const workflowData = useScribeStore(state => state.workflowData);

  const [results, setResults] = React.useState<AnamneseResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    hulpvraag: true,
    historie: true,
    stoornissen: true,
    beperkingen: true,
    samenvatting: true,
    redflags: true,
  });

  // Enhanced state loading with comprehensive validation and debugging
  React.useEffect(() => {
    console.log('Anamnese-resultaat page loading with:', {
      patientInfo: patientInfo ? 'present' : 'missing',
      workflowData: workflowData ? 'present' : 'missing',
      anamneseData: workflowData?.anamneseData ? 'present' : 'missing',
      anamneseResult: workflowData?.anamneseData?.result ? 'present' : 'missing'
    });

    if (!patientInfo) {
      console.error('No patient info, redirecting to scribe');
      router.push('/scribe');
      return;
    }

    // Validate workflow data exists
    if (!workflowData) {
      console.error('No workflow data available');
      setError('Workflow data niet beschikbaar. Ga terug naar anamnese.');
      setIsLoading(false);
      return;
    }

    // Load and validate results from workflow state
    const anamneseData = workflowData.anamneseData;
    console.log('Anamnese data from workflow state:', anamneseData);

    if (anamneseData?.result) {
      // Validate result structure
      if (typeof anamneseData.result === 'object' && anamneseData.result !== null) {
        console.log('Valid anamnese results found, loading into state');
        setResults(anamneseData.result);
        setIsLoading(false);
      } else {
        console.error('Invalid anamnese result data structure:', anamneseData.result);
        setError('Anamnese resultaat data is ongeldig. Probeer het proces opnieuw.');
        setIsLoading(false);
      }
    } else {
      // Enhanced fallback WITHOUT automatic redirect
      console.warn('No anamnese results found in workflow data');
      console.log('Full workflow data structure:', JSON.stringify(workflowData, null, 2));
      setError('Geen anamnese resultaten gevonden. Klik op "Terug naar Anamnese" om door te gaan.');
      setIsLoading(false);

      // NO automatic redirect - let user control navigation
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
    console.log(`Exporting anamnese results in ${format} format`);
  };

  const handleBackToAnamnese = () => {
    router.push('/scribe/intake-stapsgewijs/anamnese');
  };

  const handleNextToOnderzoek = () => {
    router.push('/scribe/intake-stapsgewijs/onderzoek');
  };

  if (!patientInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="mr-3" />
          <span className="text-hysio-deep-green">Anamnese resultaten laden...</span>
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
            {error || 'Geen anamnese resultaten beschikbaar. Ga terug naar de anamnese pagina.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={handleBackToAnamnese} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Terug naar anamnese
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
          onClick={handleBackToAnamnese}
          className="mb-4 text-hysio-deep-green hover:bg-hysio-mint/10"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar anamnese
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-hysio-deep-green">
                Anamnese Resultaten
              </h1>
              <p className="text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) - Stap 1 voltooid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-700 border-green-200">
              <CheckCircle size={14} className="mr-1" />
              Anamnese voltooid
            </Badge>
            <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
              <Heart size={14} className="mr-1" />
              HHSB Anamnesekaart
            </Badge>
          </div>
        </div>

        {/* Processing Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <CheckCircle size={16} />
            <span>
              Anamnese succesvol verwerkt op {new Date(results.processedAt).toLocaleString('nl-NL')}
            </span>
          </div>
        </div>
      </div>

      {/* Red Flags Alert */}
      {results.hhsbStructure?.redFlags && results.hhsbStructure?.redFlags.length > 0 && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="font-semibold text-red-800 mb-2">Red Flags Gedetecteerd:</div>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              {results.hhsbStructure?.redFlags?.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* HHSB Results Sections */}
      <div className="space-y-6">
        {/* Hulpvraag */}
        <Card>
          <Collapsible
            open={expandedSections.hulpvraag}
            onOpenChange={() => toggleSection('hulpvraag')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">H - Hulpvraag</CardTitle>
                      <CardDescription>
                        Motivatie, hulpvraag en doelen van de patiënt
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.hhsbStructure?.hulpvraag || '', 'Hulpvraag');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.hulpvraag ? (
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
                    {results.hhsbStructure?.hulpvraag || 'Geen hulpvraag informatie beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Historie */}
        <Card>
          <Collapsible
            open={expandedSections.historie}
            onOpenChange={() => toggleSection('historie')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">H - Historie</CardTitle>
                      <CardDescription>
                        Ontstaansmoment, verloop klachten en eerdere behandeling
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.hhsbStructure?.historie || '', 'Historie');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.historie ? (
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
                    {results.hhsbStructure?.historie || 'Geen historie informatie beschikbaar'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Stoornissen */}
        <Card>
          <Collapsible
            open={expandedSections.stoornissen}
            onOpenChange={() => toggleSection('stoornissen')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-hysio-deep-green" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">S - Stoornissen</CardTitle>
                      <CardDescription>
                        Stoornissen in lichaamsfuncties en anatomische structuren
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.hhsbStructure?.stoornissen || '', 'Stoornissen');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.stoornissen ? (
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
                    {results.hhsbStructure?.stoornissen || 'Geen stoornissen geïdentificeerd'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Beperkingen */}
        <Card>
          <Collapsible
            open={expandedSections.beperkingen}
            onOpenChange={() => toggleSection('beperkingen')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={20} className="text-orange-600" />
                    <div>
                      <CardTitle className="text-hysio-deep-green">B - Beperkingen</CardTitle>
                      <CardDescription>
                        Beperkingen in ADL, werk en sport
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.hhsbStructure?.beperkingen || '', 'Beperkingen');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.beperkingen ? (
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
                    {results.hhsbStructure?.beperkingen || 'Geen beperkingen geïdentificeerd'}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Samenvatting van Anamnese */}
        <Card>
          <Collapsible
            open={expandedSections.samenvatting}
            onOpenChange={() => toggleSection('samenvatting')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-purple-600" />
                    <div>
                      <CardTitle className="text-purple-700">Samenvatting van Anamnese</CardTitle>
                      <CardDescription>
                        Beknopte samenvatting van de anamnese bevindingen
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(results.hhsbStructure?.anamneseSummary || 'Geen samenvatting beschikbaar', 'Samenvatting van Anamnese');
                      }}
                    >
                      <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={14} />
                    </Button>
                    {expandedSections.samenvatting ? (
                      <ChevronDown size={20} className="text-purple-600" />
                    ) : (
                      <ChevronRight size={20} className="text-purple-600" />
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-purple-900/90 whitespace-pre-wrap leading-relaxed">
                    {results.hhsbStructure?.anamneseSummary ||
                     'Geen samenvatting van anamnese beschikbaar. Deze wordt automatisch gegenereerd op basis van de HHSB bevindingen.'}
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
            Download de anamnese resultaten in verschillende formaten
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
          onClick={handleBackToAnamnese}
          className="text-hysio-deep-green border-hysio-mint"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar Anamnese
        </Button>

        <Button
          onClick={handleNextToOnderzoek}
          className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
          size="lg"
        >
          Volgende: Onderzoek
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}