import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SOEPResultView } from '@/components/ui/soep-result-view';
import { ConsultInputPanel } from '@/components/ui/consult-input-panel';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { DocumentUploader } from '@/components/ui/document-uploader';
import {
  Lightbulb
} from 'lucide-react';
import { PatientInfo, SOEPStructure, AudioRecording } from '@/lib/types';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import { transcribeAudio } from '@/lib/api/transcription';

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

  // Document upload state
  const [documentContext, setDocumentContext] = React.useState<string>('');
  const [documentFilename, setDocumentFilename] = React.useState<string>('');

  // Loading states
  const [isGeneratingPreparation, setIsGeneratingPreparation] = React.useState(false);
  const [isProcessingSOEP, setIsProcessingSOEP] = React.useState(false);

  // Handle document upload from DocumentUploader component
  const handleDocumentUpload = (documentText: string, filename: string) => {
    setDocumentContext(documentText);
    setDocumentFilename(filename);
  };

  // Generate session preparation
  const handleGeneratePreparation = async () => {
    setIsGeneratingPreparation(true);
    try {
      const systemPrompt = `Je bent een ervaren fysiotherapeut die algemene vervolgconsult guidance geeft. Geef ALLEEN algemene, evidence-based tips en aandachtspunten voor vervolgconsulten bij deze hoofdklacht. Verzin GEEN specifieke patiëntgegevens, testresultaten of behandeldetails die je niet weet. Houd je aan algemene richtlijnen en best practices.${documentContext ? '\n\nJe hebt toegang tot een context document dat extra informatie kan bevatten.' : ''}`;

      const getAgeFromBirthYear = (birthYear: string): number => {
        const currentYear = new Date().getFullYear();
        return currentYear - parseInt(birthYear);
      };

      const age = getAgeFromBirthYear(patientInfo.birthYear);

      let userPrompt = `Hoofdklacht: ${patientInfo.chiefComplaint}
Leeftijd: ${age} jaar
Geslacht: ${patientInfo.gender}`;

      // Add document context if available
      if (documentContext) {
        userPrompt += `\n\n${documentContext}`;
      }

      userPrompt += `

Geef algemene, evidence-based guidance voor vervolgconsulten bij deze hoofdklacht:

**Algemene Aandachtspunten**
- Typische vragen over vooruitgang sinds vorige sessie
- Standaard evaluatiepunten bij deze klacht
- Algemene compliance controle

**Subjectieve Evaluatie**
- Gebruikelijke vragen over pijnverloop bij deze klacht
- Standaard functionele vragen
- Algemene vragen over dagelijkse activiteiten
- Typische vragen over slaap en werk bij deze klacht

**Objectieve Metingen**
- Welke standaard metingen zijn relevant bij deze klacht
- Gebruikelijke ROM-metingen voor dit probleem
- Standaard functionele testen
- Algemene observatiepunten

**Best Practices**
- Waarschuwingssignalen waar elke fysiotherapeut op moet letten
- Wanneer doorverwijzing overwegen
- Algemene behandelopties bij deze klacht

BELANGRIJK: 
- Gebruik GEEN specifieke getallen, meetwaarden of behandelresultaten
- Verzin GEEN concrete patiëntdetails
- Geef alleen algemene, professionele guidance
- Gebruik Nederlandse fysiotherapie terminologie`;

      const response = await apiCall(API_ENDPOINTS.GENERATE_CONTENT, {
        method: 'POST',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          options: {
            model: 'gpt-4o',
            temperature: 0.3,
          },
        }),
      });
      
      if (response.success && response.data?.content) {
        setSessionPreparation(response.data.content);
      } else {
        // Fallback content when API fails
        const fallbackPreparation = `**Focus & Evaluatie**
- Evalueer vooruitgang sinds vorige behandeling
- Controleer of gestelde doelen zijn behaald
- Beoordeel effectiviteit van gegeven behandeling

**Subjectieve Vragen**
- Hoe ervaart patiënt de klachten sinds vorige sessie?
- VAS/NPRS score voor pijn (0-10)?
- Welke activiteiten zijn verbeterd of verslechterd?
- Compliance met huisoefeningen en adviezen?
- Nieuwe klachten of symptomen?

**Objectieve Aandachtspunten**
- ROM metingen vergelijken met vorige sessie
- Functionele testen herhalen
- Palpatie en inspectie van probleemgebied
- Gang- en bewegingspatronen observeren
- Kracht en stabiliteit testen

*Let op: Deze voorbereiding is automatisch gegenereerd toen de AI-service niet beschikbaar was.*`;
        
        setSessionPreparation(fallbackPreparation);
        console.error('API call failed, using fallback preparation:', response.error);
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
            model: 'gpt-4o',
            temperature: 0.2,
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
              
              {/* Document Upload Section */}
              <div className="mb-6">
                <label className="text-sm font-medium text-hysio-deep-green block mb-3">
                  Context Document (optioneel)
                </label>
                <DocumentUploader
                  onUploadComplete={handleDocumentUpload}
                  disabled={disabled}
                  className="mb-2"
                />
                <p className="text-xs text-hysio-deep-green-900/60">
                  Upload verwijsbrieven, vorige verslagen of andere relevante documenten om betere tips te krijgen
                </p>
              </div>
              
              <div className="text-center py-4">
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
                      Genereer Algemene Tips
                    </>
                  )}
                </Button>
                <p className="text-sm text-hysio-deep-green-900/70 mt-3">
                  {documentContext && documentFilename
                    ? `Krijg context-bewuste tips op basis van het geüploade document: ${documentFilename}`
                    : "Krijg algemene evidence-based tips voor vervolgconsulten bij deze hoofdklacht"
                  }
                </p>
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