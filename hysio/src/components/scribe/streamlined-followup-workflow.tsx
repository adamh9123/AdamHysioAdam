import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SOEPResultView } from '@/components/ui/soep-result-view';
import { ConsultInputPanel } from '@/components/ui/consult-input-panel';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import {
  Lightbulb,
  FileText,
  RotateCcw
} from 'lucide-react';
import { PatientInfo, SOEPStructure, AudioRecording } from '@/lib/types';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import { transcribeAudio } from '@/lib/api/transcription';
import { HYSIO_LLM_MODEL } from '@/lib/api/openai';
import {
  generateIntelligentPreparation,
  validatePreparationInput,
  detectAnatomicalRegion,
  type PreparationRequest
} from '@/lib/preparation/intelligent-preparation';

// Simple SOEP parsing function for this workflow
const parseSOEPText = (fullText: string): SOEPStructure => {
  const result: SOEPStructure = {
    subjective: '',
    objective: '',
    evaluation: '',
    plan: '',
    redFlags: [],
    fullStructuredText: fullText,
  };

  // Extract SOEP sections with basic regex patterns
  const sections = [
    { key: 'subjective', pattern: /\*\*S\s*-?\s*Subjectief:?\*\*([\s\S]*?)(?=\*\*[OoEePp]\s*-|$)/i },
    { key: 'objective', pattern: /\*\*O\s*-?\s*Objectief:?\*\*([\s\S]*?)(?=\*\*[EePp]\s*-|$)/i },
    { key: 'evaluation', pattern: /\*\*E\s*-?\s*Evaluatie:?\*\*([\s\S]*?)(?=\*\*[Pp]\s*-|$)/i },
    { key: 'plan', pattern: /\*\*P\s*-?\s*Plan:?\*\*([\s\S]*?)(?=\*\*Rode\s*Vlagen|$)/i },
  ];

  sections.forEach(({ key, pattern }) => {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      result[key as keyof SOEPStructure] = match[1].trim();
    }
  });

  // Extract red flags
  const redFlagMatch = fullText.match(/\*\*Rode\s*Vlagen:?\*\*([\s\S]*?)$/i);
  if (redFlagMatch && redFlagMatch[1]) {
    const flags = redFlagMatch[1].split('\n')
      .map(line => line.replace(/^\s*[-*]\s*/, '').trim())
      .filter(line => line.length > 0);
    result.redFlags = flags;
  }

  return result;
};


export interface StreamlinedFollowupWorkflowProps {
  patientInfo: PatientInfo;
  onComplete: (soepData: SOEPStructure, sessionPreparation?: string) => void;
  onBack: () => void;
  className?: string;
  disabled?: boolean;
}

const StreamlinedFollowupWorkflow: React.FC<StreamlinedFollowupWorkflowProps> = ({
  patientInfo,
  onComplete,
  onBack,
  className,
  disabled = false,
}) => {
  // State management
  const [sessionPreparation, setSessionPreparation] = React.useState<string>('');
  const [consultRecording, setConsultRecording] = React.useState<AudioRecording | null>(null);
  const [consultNotes, setConsultNotes] = React.useState<string>('');
  const [soepResults, setSoepResults] = React.useState<SOEPStructure | null>(null);

  // Document context comes from patientInfo now

  // Loading states
  const [isGeneratingPreparation, setIsGeneratingPreparation] = React.useState(false);
  const [isProcessingSOEP, setIsProcessingSOEP] = React.useState(false);

  // Document context now comes from patientInfo, no need for separate handler

  // Generate session preparation using intelligent preparation system
  const handleGeneratePreparation = async () => {
    setIsGeneratingPreparation(true);
    try {
      // Create preparation request
      const preparationRequest: PreparationRequest = {
        patientInfo: {
          initials: patientInfo.initials,
          birthYear: patientInfo.birthYear,
          gender: patientInfo.gender,
          chiefComplaint: patientInfo.chiefComplaint || ''
        },
        sessionType: 'consult',
        documentContext: patientInfo.documentContext,
        documentFilename: patientInfo.documentFilename
      };

      // Validate input requirements
      const validation = validatePreparationInput(preparationRequest);
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }

      // Generate intelligent preparation
      const { systemPrompt, userPrompt, region } = await generateIntelligentPreparation(preparationRequest);

      // Call API with intelligent prompts
      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });
      
      if (response.success && response.data?.content) {
        setSessionPreparation(response.data.content);
      } else {
        // Generate intelligent fallback based on detected region
        const detectedRegion = preparationRequest.patientInfo.chiefComplaint
          ? detectAnatomicalRegion(preparationRequest.patientInfo.chiefComplaint)
          : null;

        let fallbackPreparation = `**🎯 Gerichte Consult Voorbereiding**
Hoofdklacht: ${preparationRequest.patientInfo.chiefComplaint || 'Uit geüpload document'}
${detectedRegion ? `Gedetecteerde regio: ${detectedRegion.name}` : ''}

**📊 Voortgang Evaluatie Focus**
- Hoe zijn de klachten ontwikkeld sinds vorige behandeling?
- Specifieke vragen over functionele verbetering
- VAS/NPRS pijnscores vergelijken (0-10)
- Compliance met gegeven huisoefeningen

**🔄 SOEP Gerichte Vragen**`;

        if (detectedRegion) {
          fallbackPreparation += `
- **Subjectief**: ${detectedRegion.specificQuestions.consult[0] || 'Hoe voelt de klacht nu vergeleken met vorige keer?'}
- **Objectief**: Relevante tests zoals ${detectedRegion.assessmentTests.slice(0, 2).join(', ')}
- **Evaluatie**: Vooruitgang beoordelen voor ${detectedRegion.commonConditions[0] || 'deze klacht'}
- **Plan**: Behandelaanpassingen overwegen`;
        } else {
          fallbackPreparation += `
- **Subjectief**: Hoe zijn klachten en functionaliteit veranderd?
- **Objectief**: ROM, kracht en functionele testen herhalen
- **Evaluatie**: Vooruitgang en effectiviteit beoordelen
- **Plan**: Behandeling aanpassen op basis van respons`;
        }

        fallbackPreparation += `

**⚡ Efficiency Tips**
- Kritische vragen die niet gemist mogen worden
- Belangrijkste punten om snel te checken
- Focus op functionele verbeteringen

*Let op: Deze voorbereiding is een fallback toen de AI-service niet beschikbaar was, maar wel aangepast aan uw klacht.*`;

        setSessionPreparation(fallbackPreparation);
        console.error('API call failed, using intelligent fallback preparation:', response.error);
      }
    } catch (error) {
      console.error('Error generating preparation:', error);
      // Fallback content for complete failure
      const errorFallback = `**Vervolgconsult Voorbereiding**

Er is een technisch probleem opgetreden bij het genereren van de voorbereiding.

**Algemene aandachtspunten:**
- Evalueer vooruitgang sinds vorige behandeling
- Vraag naar huidige klachten en pijnscores
- Test ROM, kracht en functionaliteit
- Beoordeel compliance met huisoefeningen
- Stel behandelplan bij indien nodig

*Technische fout: Sessie voorbereiding kon niet automatisch worden gegenereerd.*`;
      
      setSessionPreparation(errorFallback);
    } finally {
      setIsGeneratingPreparation(false);
    }
  };

  // Handle recording
  const handleConsultRecording = (blob: Blob, duration: number) => {
    const recording: AudioRecording = {
      id: `consult-${Date.now()}`,
      blob,
      duration,
      timestamp: new Date().toISOString(),
      phase: 'followup',
    };
    setConsultRecording(recording);
  };

  // Process SOEP
  const handleProcessSOEP = async () => {
    setIsProcessingSOEP(true);
    try {
      let transcriptionText = '';
      
      // Transcribe audio if available
      if (consultRecording) {
        const transcriptionResult = await transcribeAudio(
          consultRecording.blob,
          'nl',
          'Vervolgconsult fysiotherapie volgens SOEP methode. Inclusief klachten, behandeling, oefeningen en vervolgplan.'
        );
        if (transcriptionResult.success && transcriptionResult.transcript) {
          transcriptionText = transcriptionResult.transcript;
        }
      }
      
      // Combine transcription and manual notes
      const combinedInput = [transcriptionText, consultNotes].filter(Boolean).join('\n\n');
      
      // Generate SOEP structure
      const systemPrompt = `Je bent een ervaren fysiotherapeut die vervolgconsult transcripties structureert volgens de SOEP methode.`;
      
      const getAgeFromBirthYear = (birthYear: string): number => {
        const currentYear = new Date().getFullYear();
        return currentYear - parseInt(birthYear);
      };

      const age = getAgeFromBirthYear(patientInfo.birthYear);

      const userPrompt = `Analyseer de volgende vervolgconsult input en genereer een gestructureerde SOEP documentatie.

Patiënt context:
- Leeftijd: ${age} jaar
- Geslacht: ${patientInfo.gender}
- Hoofdklacht: ${patientInfo.chiefComplaint}

Consult input:
${combinedInput}

Genereer een professionele SOEP structuur:

**S - Subjectief:**
[Wat zegt de patiënt over klachten, ervaring, gevoel]

**O - Objectief:**
[Wat zie/meet je - observaties, testen, metingen]

**E - Evaluatie:**
[Wat betekent dit - analyse, interpretatie, conclusie]

**P - Plan:**
[Wat ga je doen - behandeling, huisoefeningen, vervolgafspraak]

Antwoord in het Nederlands, professioneel gestructureerd.`;

      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: HYSIO_LLM_MODEL,
            temperature: 1.0, // GPT-5-mini only supports temperature 1.0
          },
        }),
      });
      
      if (response.success && response.data?.content) {
        const soepStructure: SOEPStructure = parseSOEPText(response.data.content);
        
        // Set the results for display
        setSoepResults(soepStructure);
        
        // Navigate directly to summary page with results
        onComplete(soepStructure, sessionPreparation);
      } else {
        // Create fallback SOEP structure when API fails
        const fallbackSOEP: SOEPStructure = {
          subjective: combinedInput || 'Geen input beschikbaar voor verwerking.',
          objective: 'AI-verwerking niet beschikbaar. Vul handmatig objectieve bevindingen in.',
          evaluation: 'AI-verwerking niet beschikbaar. Vul handmatig evaluatie in.',
          plan: 'AI-verwerking niet beschikbaar. Vul handmatig behandelplan in.',
          redFlags: [],
          fullStructuredText: `**S - Subjectief:**
${combinedInput || 'Geen input beschikbaar voor verwerking.'}

**O - Objectief:**
AI-verwerking niet beschikbaar. Vul handmatig objectieve bevindingen in.

**E - Evaluatie:**
AI-verwerking niet beschikbaar. Vul handmatig evaluatie in.

**P - Plan:**
AI-verwerking niet beschikbaar. Vul handmatig behandelplan in.

*Let op: Deze SOEP-structuur is handmatig aangemaakt omdat de AI-service niet beschikbaar was.*`
        };
        
        console.error('API call failed, using fallback SOEP:', response.error);
        setSoepResults(fallbackSOEP);
        onComplete(fallbackSOEP, sessionPreparation);
      }
    } catch (error) {
      console.error('Error processing SOEP:', error);
      
      // Create error fallback SOEP structure
      const errorSOEP: SOEPStructure = {
        subjective: combinedInput || 'Technische fout bij verwerking van input.',
        objective: 'Technische fout: Kan objectieve gegevens niet automatisch verwerken.',
        evaluation: 'Technische fout: Kan evaluatie niet automatisch genereren.',
        plan: 'Technische fout: Kan behandelplan niet automatisch genereren.',
        redFlags: [],
        fullStructuredText: `**TECHNISCHE FOUT - HANDMATIGE INVOER VEREIST**

**S - Subjectief:**
${combinedInput || 'Technische fout bij verwerking van input.'}

**O - Objectief:**
Technische fout: Kan objectieve gegevens niet automatisch verwerken.

**E - Evaluatie:**
Technische fout: Kan evaluatie niet automatisch genereren.

**P - Plan:**
Technische fout: Kan behandelplan niet automatisch genereren.

*BELANGRIJK: Er is een technische fout opgetreden. Vul alle SOEP-secties handmatig in voordat u het rapport afrondt.*`
      };
      
      setSoepResults(errorSOEP);
      onComplete(errorSOEP, sessionPreparation);
    } finally {
      setIsProcessingSOEP(false);
    }
  };


  return (
    <div className={cn('w-full min-h-screen bg-hysio-cream/30', className)}>
      {/* Container with padding */}
      <div className="p-4 sm:p-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-[#003728] mb-6">
          Vervolgconsult
        </h2>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: SOEP Result View */}
          <SOEPResultView 
            soepData={soepResults}
            isLoading={isProcessingSOEP}
            onEdit={() => {
              // TODO: Implement edit functionality
              console.log('Edit SOEP clicked');
            }}
          />

          {/* Right Panel: Input Methods */}
          <ConsultInputPanel
            onRecordingComplete={handleConsultRecording}
            onManualNotesChange={setConsultNotes}
            onProcessClick={handleProcessSOEP}
            manualNotes={consultNotes}
            disabled={disabled}
            isProcessing={isProcessingSOEP}
            recording={consultRecording}
            canProcess={!!consultRecording || !!consultNotes.trim()}
          />
        </div>

        {/* Session Preparation - Optional Collapsible Section */}
        {!sessionPreparation && (
          <div className="mt-8">
            <div className="bg-hysio-mint/10 border-2 border-hysio-mint/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-hysio-deep-green" />
                <h3 className="text-lg font-semibold text-hysio-deep-green">Sessie Voorbereiding</h3>
              </div>
              
              {/* Document Context Info */}
              {patientInfo.documentContext && patientInfo.documentFilename && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Context document beschikbaar
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    '{patientInfo.documentFilename}' wordt gebruikt voor contextuele voorbereiding
                  </p>
                </div>
              )}
              
              <div className="text-center py-4 space-y-4">
                <p className="text-sm text-hysio-deep-green-900/70">
                  {patientInfo.documentContext && patientInfo.documentFilename
                    ? `Krijg context-bewuste tips op basis van het geüploade document: ${patientInfo.documentFilename}`
                    : "Krijg intelligente, klacht-specifieke tips voor vervolgconsulten"
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleGeneratePreparation}
                    disabled={isGeneratingPreparation}
                    size="lg"
                    className="bg-hysio-mint hover:bg-hysio-mint/90 text-white"
                  >
                    {isGeneratingPreparation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Voorbereiden...
                      </>
                    ) : (
                      <>
                        <Lightbulb size={18} className="mr-2" />
                        Genereer Tips
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setSessionPreparation(''); // Set empty to skip preparation but allow workflow to continue
                    }}
                    variant="outline"
                    disabled={isGeneratingPreparation}
                    size="lg"
                    className="border-hysio-mint/50 text-hysio-deep-green hover:bg-hysio-mint/10"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Overslaan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {sessionPreparation && (
          <div className="mt-8">
            <div className="bg-hysio-mint/10 border-2 border-hysio-mint/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={20} className="text-hysio-deep-green" />
                <h3 className="text-lg font-semibold text-hysio-deep-green">Algemene Tips voor Vervolgconsult</h3>
                <div className="ml-auto">
                  <CopyToClipboard text={sessionPreparation} size="sm" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-hysio-mint/20 shadow-sm">
                <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800 max-h-64 overflow-y-auto">
                  {sessionPreparation}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="mt-8 flex justify-start">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={disabled}
          >
            ← Terug naar patiënt info
          </Button>
        </div>
      </div>
    </div>
  );
};

export { StreamlinedFollowupWorkflow };