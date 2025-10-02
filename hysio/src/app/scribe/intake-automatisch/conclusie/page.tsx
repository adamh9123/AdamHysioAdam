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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MarkdownRenderer, ClinicalSection } from '@/components/ui/markdown-renderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  RotateCcw,
  FileCheck,
  TrendingUp
} from 'lucide-react';

interface IntakeResults {
  hhsbAnamneseCard: any;
  onderzoeksBevindingen: any;
  klinischeConclusie: any;
  samenvatting?: any;
  redFlags: string[];
  redFlagsDetailed?: any[];
  processingDuration: number;
  generatedAt: string;
  formattedMarkdown?: string; // NEW: Professional markdown from semantic intelligence
  confidence?: {
    overall: number;
    hhsb: number;
    onderzoek: number;
    conclusie: number;
  };
  validationReport?: {
    transcriptCoverage: number;
    dataCompleteness: number;
    missingData: string[];
    warnings: string[];
  };
  semanticIntelligenceVersion?: string;
}

export default function AutomatedIntakeConclusie() {
  const router = useRouter();
  const patientInfo = useScribeStore((state: any) => state.patientInfo);
  const { navigateToPatientInfo, navigateToWorkflow } = useWorkflowNavigation();
  const sessionState = useSessionState({ autoSave: true, autoSaveInterval: 30000 });
  const workflowData = useScribeStore((state: any) => state.workflowData);

  const [results, setResults] = React.useState<IntakeResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'formatted' | 'structured'>('formatted'); // NEW: View toggle
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    anamnese: true,
    onderzoek: true,
    conclusie: true,
    samenvatting: true,
  });

  // Enhanced state loading with comprehensive validation
  React.useEffect(() => {
    if (!patientInfo) {
      console.log('No patient info, navigating to patient info page');
      navigateToPatientInfo();
      return;
    }

    // Validate workflow data exists
    if (!workflowData) {
      console.error('No workflow data available');
      setError('Workflow data niet beschikbaar. Probeer het proces opnieuw.');
      setIsLoading(false);
      return;
    }

    // Load and validate results from workflow state
    const automatedData = workflowData.automatedIntakeData;

    if (automatedData?.result) {
      // Validate result structure
      if (typeof automatedData.result === 'object' && automatedData.result !== null) {
        setResults(automatedData.result);
        setIsLoading(false);
        console.log('Results successfully loaded:', automatedData.result);
      } else {
        console.error('Invalid result data structure:', automatedData.result);
        setError('Resultaat data is ongeldig. Probeer het proces opnieuw.');
        setIsLoading(false);
      }
    } else {
      // Enhanced fallback WITHOUT automatic redirect
      console.warn('No results found in workflow data');
      console.log('Full workflow data structure:', JSON.stringify(workflowData, null, 2));
      setError('Geen resultaten gevonden. Klik op "Terug naar Intake" om door te gaan.');
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
      // Could add toast notification here
      console.log(`${sectionName} copied to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Helper function to format Stoornissen data
  const formatStoornissen = (stoornissen: any) => {
    if (!stoornissen) return 'Geen stoornissen geïdentificeerd';

    return (
      <div className="space-y-4">
        {stoornissen.pain && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Pijn</h5>
            <ul className="list-disc list-inside space-y-1">
              {stoornissen.pain.location && stoornissen.pain.location.length > 0 && (
                <li><strong>Locatie:</strong> {stoornissen.pain.location.join(', ')}</li>
              )}
              {stoornissen.pain.character && (
                <li><strong>Karakter:</strong> {Array.isArray(stoornissen.pain.character) ? stoornissen.pain.character.join(', ') : stoornissen.pain.character}</li>
              )}
              {stoornissen.pain.intensity && (
                <li>
                  <strong>Intensiteit:</strong> Huidig: {stoornissen.pain.intensity.current || 'N/A'},
                  Ergste: {stoornissen.pain.intensity.worst || 'N/A'},
                  Gemiddeld: {stoornissen.pain.intensity.average || 'N/A'}
                </li>
              )}
              {stoornissen.pain.pattern && (
                <li><strong>Patroon:</strong> {stoornissen.pain.pattern}</li>
              )}
              {stoornissen.pain.aggravatingFactors && stoornissen.pain.aggravatingFactors.length > 0 && (
                <li><strong>Provocerende factoren:</strong> {stoornissen.pain.aggravatingFactors.join(', ')}</li>
              )}
              {stoornissen.pain.relievingFactors && stoornissen.pain.relievingFactors.length > 0 && (
                <li><strong>Verlichtende factoren:</strong> {stoornissen.pain.relievingFactors.join(', ')}</li>
              )}
            </ul>
          </div>
        )}
        {stoornissen.movement && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Beweging</h5>
            <ul className="list-disc list-inside space-y-1">
              {stoornissen.movement.restrictions && stoornissen.movement.restrictions.length > 0 && (
                <li><strong>Beperkingen:</strong> {stoornissen.movement.restrictions.join(', ')}</li>
              )}
              {stoornissen.movement.quality && (
                <li><strong>Kwaliteit:</strong> {stoornissen.movement.quality}</li>
              )}
            </ul>
          </div>
        )}
        {stoornissen.otherSymptoms && stoornissen.otherSymptoms.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Overige symptomen</h5>
            <ul className="list-disc list-inside">
              {stoornissen.otherSymptoms.map((symptom: string, idx: number) => (
                <li key={idx}>{symptom}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Helper function to format Beperkingen data
  const formatBeperkingen = (beperkingen: any) => {
    if (!beperkingen) return 'Geen beperkingen geïdentificeerd';

    return (
      <div className="space-y-4">
        {beperkingen.adl && beperkingen.adl.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">ADL (Dagelijkse activiteiten)</h5>
            <ul className="list-disc list-inside space-y-1">
              {beperkingen.adl.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>{item.activity}:</strong> {item.limitation} {item.impact && `(Impact: ${item.impact})`}
                </li>
              ))}
            </ul>
          </div>
        )}
        {beperkingen.work && beperkingen.work.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Werk</h5>
            <ul className="list-disc list-inside space-y-1">
              {beperkingen.work.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>{item.task}:</strong> {item.limitation}
                </li>
              ))}
            </ul>
          </div>
        )}
        {beperkingen.sport && beperkingen.sport.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Sport & Hobby</h5>
            <ul className="list-disc list-inside space-y-1">
              {beperkingen.sport.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>{item.activity}:</strong> {item.limitation}
                </li>
              ))}
            </ul>
          </div>
        )}
        {beperkingen.social && beperkingen.social.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Sociaal & Participatie</h5>
            <ul className="list-disc list-inside">
              {beperkingen.social.map((item: string, idx: number) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Helper function to format Onderzoeksbevindingen data
  const formatOnderzoek = (onderzoek: any) => {
    if (!onderzoek) return 'Geen onderzoeksbevindingen beschikbaar';

    return (
      <div className="space-y-4">
        {onderzoek.inspectie && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Inspectie & Observatie</h5>
            <ul className="list-disc list-inside space-y-1">
              {onderzoek.inspectie.posture && <li><strong>Houding:</strong> {onderzoek.inspectie.posture}</li>}
              {onderzoek.inspectie.swelling && <li><strong>Zwelling:</strong> {onderzoek.inspectie.swelling}</li>}
              {onderzoek.inspectie.atrophy && <li><strong>Atrofie:</strong> {onderzoek.inspectie.atrophy}</li>}
              {onderzoek.inspectie.other && onderzoek.inspectie.other.map((obs: string, idx: number) => (
                <li key={idx}>{obs}</li>
              ))}
            </ul>
          </div>
        )}
        {onderzoek.palpatie && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Palpatie</h5>
            <ul className="list-disc list-inside space-y-1">
              {onderzoek.palpatie.tenderness && onderzoek.palpatie.tenderness.length > 0 && (
                <li>
                  <strong>Drukpijn:</strong> {onderzoek.palpatie.tenderness.map((t: any) => `${t.location} (${t.severity})`).join(', ')}
                </li>
              )}
              {onderzoek.palpatie.tone && <li><strong>Tonus:</strong> {onderzoek.palpatie.tone}</li>}
              {onderzoek.palpatie.temperature && <li><strong>Temperatuur:</strong> {onderzoek.palpatie.temperature}</li>}
            </ul>
          </div>
        )}
        {onderzoek.bewegingsonderzoek && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Bewegingsonderzoek</h5>
            {onderzoek.bewegingsonderzoek.arom && onderzoek.bewegingsonderzoek.arom.length > 0 && (
              <div className="mb-3">
                <p className="font-medium mb-1">Actief ROM (AROM):</p>
                <ul className="list-disc list-inside pl-4">
                  {onderzoek.bewegingsonderzoek.arom.map((m: any, idx: number) => (
                    <li key={idx}>
                      {m.movement}: {m.range} {m.pain && `- Pijn: ${m.pain}`} {m.limitation && `- ${m.limitation}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {onderzoek.bewegingsonderzoek.prom && onderzoek.bewegingsonderzoek.prom.length > 0 && (
              <div>
                <p className="font-medium mb-1">Passief ROM (PROM):</p>
                <ul className="list-disc list-inside pl-4">
                  {onderzoek.bewegingsonderzoek.prom.map((m: any, idx: number) => (
                    <li key={idx}>
                      {m.movement}: {m.range} {m.endFeel && `- Eindgevoel: ${m.endFeel}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {onderzoek.specifiekeTesten && onderzoek.specifiekeTesten.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Specifieke Tests</h5>
            <ul className="list-disc list-inside space-y-1">
              {onderzoek.specifiekeTesten.map((test: any, idx: number) => (
                <li key={idx}>
                  <strong>{test.testName}:</strong> {test.result === 'positive' ? '✅ Positief' : test.result === 'negative' ? '❌ Negatief' : '❓ Onduidelijk'}
                  {test.description && ` - ${test.description}`}
                </li>
              ))}
            </ul>
          </div>
        )}
        {onderzoek.krachtEnStabiliteit && onderzoek.krachtEnStabiliteit.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Kracht & Stabiliteit</h5>
            <ul className="list-disc list-inside space-y-1">
              {onderzoek.krachtEnStabiliteit.map((k: any, idx: number) => (
                <li key={idx}>
                  <strong>{k.muscle}:</strong> {k.strength} {k.comment && `- ${k.comment}`}
                </li>
              ))}
            </ul>
          </div>
        )}
        {onderzoek.klinimetrie && onderzoek.klinimetrie.length > 0 && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Klinimetrie</h5>
            <ul className="list-disc list-inside space-y-1">
              {onderzoek.klinimetrie.map((k: any, idx: number) => (
                <li key={idx}>
                  <strong>{k.measureName}:</strong> {k.score} - {k.interpretation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Helper function to format Klinische Conclusie data
  const formatConclusie = (conclusie: any) => {
    if (!conclusie) return 'Geen klinische conclusie beschikbaar';

    return (
      <div className="space-y-4">
        {conclusie.diagnose && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Diagnose</h5>
            <p className="mb-2"><strong>Primair:</strong> {conclusie.diagnose.primary || conclusie.diagnose.primaireDiagnose || 'Niet gespecificeerd'}</p>
            {conclusie.diagnose.differential && conclusie.diagnose.differential.length > 0 && (
              <div>
                <p className="font-medium">Differentiaal diagnoses:</p>
                <ul className="list-disc list-inside pl-4">
                  {conclusie.diagnose.differential.map((d: string, idx: number) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {conclusie.behandelplan && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Behandelplan</h5>
            {conclusie.behandelplan.mainGoals && conclusie.behandelplan.mainGoals.length > 0 && (
              <div className="mb-3">
                <p className="font-medium mb-1">SMART Behandeldoelen:</p>
                <ul className="list-decimal list-inside pl-4">
                  {conclusie.behandelplan.mainGoals.map((goal: any, idx: number) => (
                    <li key={idx}>
                      {goal.goal} {goal.timeframe && `(${goal.timeframe})`}
                      {goal.measures && <span className="text-sm text-gray-600"> - Meetbaar: {goal.measures}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {conclusie.behandelplan.phases && conclusie.behandelplan.phases.length > 0 && (
              <div className="mb-3">
                <p className="font-medium mb-1">Behandelfasen:</p>
                {conclusie.behandelplan.phases.map((phase: any, idx: number) => (
                  <div key={idx} className="ml-4 mb-2">
                    <p className="font-medium">Fase {idx + 1}: {phase.phaseName} ({phase.duration})</p>
                    <p className="text-sm">{phase.focus}</p>
                    {phase.interventions && phase.interventions.length > 0 && (
                      <ul className="list-disc list-inside pl-4 text-sm">
                        {phase.interventions.map((intervention: string, i: number) => (
                          <li key={i}>{intervention}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {conclusie.behandelplan.frequency && <p><strong>Frequentie:</strong> {conclusie.behandelplan.frequency}</p>}
            {conclusie.behandelplan.estimatedDuration && <p><strong>Geschatte duur:</strong> {conclusie.behandelplan.estimatedDuration}</p>}
          </div>
        )}
        {conclusie.prognose && (
          <div>
            <h5 className="font-semibold text-hysio-deep-green mb-2">Prognose</h5>
            <p className="mb-2">{conclusie.prognose.expected}</p>
            {conclusie.prognose.factorsPositive && conclusie.prognose.factorsPositive.length > 0 && (
              <div className="mb-2">
                <p className="font-medium text-green-700">Positieve factoren:</p>
                <ul className="list-disc list-inside pl-4">
                  {conclusie.prognose.factorsPositive.map((f: string, idx: number) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {conclusie.prognose.factorsNegative && conclusie.prognose.factorsNegative.length > 0 && (
              <div>
                <p className="font-medium text-orange-700">Belemmerende factoren:</p>
                <ul className="list-disc list-inside pl-4">
                  {conclusie.prognose.factorsNegative.map((f: string, idx: number) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleExport = async (format: 'html' | 'txt' | 'docx' | 'pdf') => {
    if (!results || !patientInfo) {
      console.error('No results or patient info available for export');
      return;
    }

    try {
      await exportManager.exportAutomatedIntake(
        results,
        patientInfo,
        {
          format,
          includePatientInfo: true,
          includeTimestamp: true,
          includeRedFlags: true,
          template: 'detailed',
          customFileName: `Intake_Conclusie_${patientInfo.initials}_${new Date().toISOString().split('T')[0]}`,
        }
      );
      console.log(`Successfully exported in ${format} format`);
    } catch (error) {
      console.error(`Export failed for ${format} format:`, error);
      // You could add a toast notification here
    }
  };

  const handleStartNewSession = () => {
    sessionState.resetSession();
    console.log('Starting new session, navigating to patient info');
    navigateToPatientInfo();
  };

  const handleBackToDashboard = () => {
    // Navigation to dashboard still uses router since it's outside the scribe workflow
    console.log('Navigating to dashboard');
    router.push('/dashboard');
  };

  const handleBack = () => {
    console.log('Navigating back to intake-automatisch');
    navigateToWorkflow('intake-automatisch');
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
                {patientInfo.initials} ({patientInfo.birthYear}) - Automatisch
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

      {/* Quality & Confidence Indicators */}
      {results.semanticIntelligenceVersion && results.confidence && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Semantic Intelligence v{results.semanticIntelligenceVersion}</div>
                <div className="text-sm text-blue-700">
                  Confidence: {results.confidence.overall}% |
                  Transcript Coverage: {results.validationReport?.transcriptCoverage}% |
                  Data Completeness: {results.validationReport?.dataCompleteness}%
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'formatted' ? 'structured' : 'formatted')}
              className="text-blue-700 border-blue-300"
            >
              <FileCheck size={14} className="mr-2" />
              {viewMode === 'formatted' ? 'Structured View' : 'Formatted View'}
            </Button>
          </div>
        </div>
      )}

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

      {/* NEW: Formatted Clinical Document View (Semantic Intelligence v8.0) */}
      {viewMode === 'formatted' && results.formattedMarkdown ? (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-hysio-mint/20 to-hysio-mint/10 border-b border-hysio-mint/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-hysio-deep-green" />
                  <div>
                    <CardTitle className="text-hysio-deep-green">Professioneel Klinisch Verslag</CardTitle>
                    <CardDescription>
                      Automatisch gegenereerd met Semantic Intelligence - Scanbaar en gestructureerd
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(results.formattedMarkdown || '');
                    // Could add toast notification
                  }}
                  className="text-hysio-deep-green"
                >
                  <Copy size={16} className="mr-2" />
                  Copy Markdown
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <MarkdownRenderer content={results.formattedMarkdown} />
            </CardContent>
          </Card>
        </div>
      ) : (
        /* LEGACY: Structured Data View */
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
                        {formatStoornissen(results.hhsbAnamneseCard?.stoornissen)}
                      </div>
                    </div>
                  </div>

                  {/* Beperkingen */}
                  <div>
                    <h4 className="font-semibold text-hysio-deep-green mb-3">Beperkingen</h4>
                    <div className="bg-hysio-mint/10 rounded-lg p-4">
                      <div className="text-hysio-deep-green-900/80">
                        {formatBeperkingen(results.hhsbAnamneseCard?.beperkingen)}
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
                  <div className="text-hysio-deep-green-900/80">
                    {formatOnderzoek(results.onderzoeksBevindingen)}
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
                  <div className="text-hysio-deep-green-900/80">
                    {formatConclusie(results.klinischeConclusie)}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Samenvatting van Intake */}
        <Card>
          <Collapsible
            open={expandedSections.samenvatting || true}
            onOpenChange={() => toggleSection('samenvatting')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-hysio-mint/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-purple-600" />
                    <div>
                      <CardTitle className="text-purple-700">Samenvatting van Intake</CardTitle>
                      <CardDescription>
                        Complete samenvatting van anamnese, onderzoek en klinische conclusie
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(
                          (() => {
                            const summary = results.hhsbAnamneseCard?.anamneseSummary;
                            if (typeof summary === 'object' && summary !== null) {
                              const { keyFindings, clinicalImpression, priorityAreas, redFlagsNoted } = summary;
                              return [
                                clinicalImpression && `Klinische indruk: ${clinicalImpression}`,
                                keyFindings?.length > 0 && `Kernbevindingen: ${keyFindings.join(', ')}`,
                                priorityAreas?.length > 0 && `Prioriteiten: ${priorityAreas.join(', ')}`,
                                redFlagsNoted?.length > 0 && `Bijzonderheden: ${redFlagsNoted.join(', ')}`
                              ].filter(Boolean).join('\n\n');
                            }
                            return summary || 'Geen samenvatting beschikbaar';
                          })(),
                          'Samenvatting van Anamnese'
                        );
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
                    {(() => {
                      // Handle both string and object formats for backward compatibility
                      const summary = results.hhsbAnamneseCard?.anamneseSummary || results.hhsbAnamneseCard?.samenvatting;

                      if (!summary) {
                        return 'Geen samenvatting van anamnese beschikbaar. Deze wordt automatisch gegenereerd op basis van de HHSB bevindingen.';
                      }

                      // If it's an object (enhanced structure), format it properly
                      if (typeof summary === 'object' && summary !== null) {
                        const { keyFindings, clinicalImpression, priorityAreas, redFlagsNoted } = summary;
                        return [
                          clinicalImpression && `Klinische indruk: ${clinicalImpression}`,
                          keyFindings?.length > 0 && `Kernbevindingen: ${keyFindings.join(', ')}`,
                          priorityAreas?.length > 0 && `Prioriteiten: ${priorityAreas.join(', ')}`,
                          redFlagsNoted?.length > 0 && `Bijzonderheden: ${redFlagsNoted.join(', ')}`
                        ].filter(Boolean).join('\n\n');
                      }

                      // If it's a string (legacy structure), return as-is
                      return summary;
                    })()}
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