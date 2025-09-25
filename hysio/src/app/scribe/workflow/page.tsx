'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useScribeStore } from '@/lib/state/scribe-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, List, MessageSquare, Play, Zap } from 'lucide-react';

export default function WorkflowPage() {
  const router = useRouter();
  const patientInfo = useScribeStore(state => state.patientInfo);
  const setCurrentWorkflow = useScribeStore(state => state.setCurrentWorkflow);

  // Redirect if no patient info
  React.useEffect(() => {
    if (!patientInfo) {
      router.push('/scribe');
    }
  }, [patientInfo, router]);

  const handleWorkflowSelection = (workflow: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult') => {
    setCurrentWorkflow(workflow);

    switch (workflow) {
      case 'intake-automatisch':
        router.push('/scribe/intake-automatisch');
        break;
      case 'intake-stapsgewijs':
        router.push('/scribe/intake-stapsgewijs/anamnese');
        break;
      case 'consult':
        router.push('/scribe/consult');
        break;
    }
  };

  const handleBack = () => {
    router.push('/scribe');
  };

  if (!patientInfo) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4 text-hysio-deep-green hover:bg-hysio-mint/10"
        >
          <ArrowLeft size={16} className="mr-2" />
          Terug naar patiëntgegevens
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-hysio-deep-green mb-2">
            Kies uw Workflow
          </h1>
          <p className="text-hysio-deep-green-900/70 text-lg">
            Selecteer de juiste procedure voor {patientInfo.initials} ({patientInfo.birthYear})
          </p>
          {patientInfo.chiefComplaint && (
            <p className="text-hysio-deep-green-900/60 text-sm mt-1">
              Hoofdklacht: "{patientInfo.chiefComplaint}"
            </p>
          )}
        </div>
      </div>

      {/* Workflow Options */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Automated Intake */}
        <Card
          className="border-2 border-hysio-mint/30 hover:border-hysio-mint transition-colors cursor-pointer group"
          onClick={() => handleWorkflowSelection('intake-automatisch')}
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-hysio-mint/30 transition-colors">
              <Zap size={24} className="text-hysio-deep-green" />
            </div>
            <CardTitle className="text-xl text-hysio-deep-green">
              Hysio Intake (Automatisch)
            </CardTitle>
            <CardDescription className="text-hysio-deep-green-900/70">
              Snelle en efficiënte intake voor ervaren therapeuten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-hysio-mint-dark" />
                <span className="text-hysio-deep-green-900/80">Geschatte tijd: 15-20 minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <Play size={16} className="text-hysio-mint-dark" />
                <span className="text-hysio-deep-green-900/80">Eén doorlopende sessie</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-hysio-deep-green text-sm">Wat te verwachten:</h4>
              <ul className="text-xs text-hysio-deep-green-900/70 space-y-1">
                <li>• Optionele voorbereiding wordt automatisch gegenereerd</li>
                <li>• Gecombineerde anamnese en onderzoek opname</li>
                <li>• Direct resultaat met HHSB-gestructureerde documentatie</li>
                <li>• Anamnesekaart, onderzoeksbevindingen en klinische conclusie</li>
                <li>• Alle secties zijn bewerkbaar en exporteerbaar</li>
              </ul>
            </div>

            <div className="pt-2">
              <p className="text-xs text-hysio-deep-green-900/60 italic">
                Ideaal voor: Ervaren therapeuten die snel tot een complete intake willen komen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Intake */}
        <Card
          className="border-2 border-hysio-mint/30 hover:border-hysio-mint transition-colors cursor-pointer group"
          onClick={() => handleWorkflowSelection('intake-stapsgewijs')}
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-hysio-mint/30 transition-colors">
              <List size={24} className="text-hysio-deep-green" />
            </div>
            <CardTitle className="text-xl text-hysio-deep-green">
              Hysio Intake (Stapsgewijs)
            </CardTitle>
            <CardDescription className="text-hysio-deep-green-900/70">
              Uitgebreide intake met maximale controle en ondersteuning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-hysio-mint-dark" />
                <span className="text-hysio-deep-green-900/80">Geschatte tijd: 30-45 minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <List size={16} className="text-hysio-mint-dark" />
                <span className="text-hysio-deep-green-900/80">Drie afzonderlijke stappen</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-hysio-deep-green text-sm">Stapsgewijze aanpak:</h4>
              <ul className="text-xs text-hysio-deep-green-900/70 space-y-1">
                <li>• <strong>Stap 1:</strong> Anamnese met gepersonaliseerde voorbereiding</li>
                <li>• <strong>Stap 2:</strong> Onderzoek met aangepaste onderzoeksvoorstel</li>
                <li>• <strong>Stap 3:</strong> Klinische conclusie en behandelplan</li>
                <li>• Mogelijkheid om terug te gaan naar vorige stappen</li>
                <li>• HHSB-gestructureerde documentatie per fase</li>
              </ul>
            </div>

            <div className="pt-2">
              <p className="text-xs text-hysio-deep-green-900/60 italic">
                Ideaal voor: Complexe gevallen of wanneer u gedetailleerde begeleiding wilt
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Consultation */}
        <Card
          className="border-2 border-hysio-mint/30 hover:border-hysio-mint transition-colors cursor-pointer group"
          onClick={() => handleWorkflowSelection('consult')}
        >
          <CardHeader className="pb-4">
            <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-hysio-mint/30 transition-colors">
              <MessageSquare size={24} className="text-hysio-deep-green" />
            </div>
            <CardTitle className="text-xl text-hysio-deep-green">
              Hysio Consult (Vervolgconsult)
            </CardTitle>
            <CardDescription className="text-hysio-deep-green-900/70">
              Vervolgconsult met SOEP-methodiek documentatie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-hysio-mint-dark" />
                <span className="text-hysio-deep-green-900/80">Geschatte tijd: 10-15 minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-hysio-mint-dark" />
                <span className="text-hysio-deep-green-900/80">SOEP-gestructureerde rapportage</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-hysio-deep-green text-sm">SOEP-methodiek:</h4>
              <ul className="text-xs text-hysio-deep-green-900/70 space-y-1">
                <li>• <strong>S</strong>ubjectief: Patiënt ervaring en klachten</li>
                <li>• <strong>O</strong>bjectief: Onderzoeksbevindingen en metingen</li>
                <li>• <strong>E</strong>valuatie: Analyse en interpretatie</li>
                <li>• <strong>P</strong>lan: Behandelplan en vervolgafspraken</li>
                <li>• Directe export naar verschillende formaten (PDF, DOCX, etc.)</li>
              </ul>
            </div>

            <div className="pt-2">
              <p className="text-xs text-hysio-deep-green-900/60 italic">
                Ideaal voor: Vervolgconsulten en behandelsessies bij bestaande patiënten
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <div className="bg-hysio-mint/10 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-hysio-deep-green mb-2">
          Niet zeker welke workflow te kiezen?
        </h3>
        <p className="text-hysio-deep-green-900/70 text-sm mb-4">
          Kies "Automatisch" voor snelle intakes, "Stapsgewijs" voor complexe gevallen met begeleiding,
          of "Vervolgconsult" voor bestaande patiënten.
        </p>
        <p className="text-xs text-hysio-deep-green-900/60">
          U kunt altijd teruggaan en een andere workflow kiezen als nodig.
        </p>
      </div>
    </div>
  );
}