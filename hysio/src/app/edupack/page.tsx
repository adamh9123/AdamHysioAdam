// Standalone EduPack Generation Page
// Independent page for generating patient education summaries without session integration

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Upload,
  User,
  Stethoscope,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Info,
  ArrowLeft,
  Home
} from 'lucide-react';

import { StandaloneForm } from '@/components/edupack/standalone-form';
import { PreviewPanel } from '@/components/edupack/preview-panel';
import { DistributionControls } from '@/components/edupack/distribution-controls';
import { useEduPackGeneration } from '@/hooks/useEduPackGeneration';

import type {
  EduPackGenerationRequest,
  EduPackContent
} from '@/lib/types/edupack';

type PageStep = 'input' | 'generating' | 'review' | 'distributing' | 'completed';

export default function StandaloneEduPackPage() {
  const [currentStep, setCurrentStep] = useState<PageStep>('input');
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  // EduPack generation hook
  const {
    content,
    error,
    validationResult,
    generateEduPack,
    updateContent,
    reset
  } = useEduPackGeneration();

  // Handle form submission
  const handleFormSubmit = useCallback(async (request: EduPackGenerationRequest) => {
    setCurrentStep('generating');

    try {
      await generateEduPack(request);
      setCurrentStep('review');
      setShowPreview(true);
    } catch (error) {
      setCurrentStep('input');
    }
  }, [generateEduPack]);

  // Handle distribution completion
  const handleDistributionComplete = useCallback(() => {
    setCurrentStep('completed');
    setTimeout(() => {
      // Auto-reset after 5 seconds
      reset();
      setCurrentStep('input');
      setShowPreview(false);
    }, 5000);
  }, [reset]);

  // Handle starting over
  const handleStartOver = useCallback(() => {
    reset();
    setCurrentStep('input');
    setShowPreview(false);
  }, [reset]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 py-2 text-sm text-gray-600">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 hover:text-hysio-deep-green transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <span>/</span>
            <span className="text-hysio-deep-green font-medium">EduPack Generator</span>
          </div>

          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Terug
              </Button>

              <div className="flex items-center gap-3">
                <div className="bg-hysio-mint/20 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-hysio-deep-green" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">EduPack Generator</h1>
                  <p className="text-sm text-gray-600">
                    Genereer patiëntvriendelijke samenvattingen
                  </p>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <StepIndicator
                steps={[
                  { key: 'input', label: 'Invoer', icon: Upload },
                  { key: 'review', label: 'Review', icon: FileText },
                  { key: 'distributing', label: 'Versturen', icon: ArrowRight }
                ]}
                currentStep={currentStep}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'input' && (
          <InputStep onSubmit={handleFormSubmit} />
        )}

        {currentStep === 'generating' && (
          <GeneratingStep />
        )}

        {(currentStep === 'review' || currentStep === 'distributing') && content && (
          <ReviewStep
            content={content}
            validationResult={validationResult}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onContentUpdate={updateContent}
            onDistribute={() => setCurrentStep('distributing')}
            onDistributionComplete={handleDistributionComplete}
            isDistributing={currentStep === 'distributing'}
            onStartOver={handleStartOver}
          />
        )}

        {currentStep === 'completed' && (
          <CompletedStep onStartOver={handleStartOver} />
        )}

        {/* Error display */}
        {error && (
          <div className="mt-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <Info className="h-4 w-4" />
                  <span className="font-medium">Fout bij genereren</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  className="mt-3"
                >
                  Opnieuw proberen
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Step indicator component
function StepIndicator({
  steps,
  currentStep
}: {
  steps: Array<{ key: string; label: string; icon: React.ComponentType<any> }>;
  currentStep: string;
}) {
  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const IconComponent = step.icon;
        const isActive = index <= currentIndex;
        const isCurrent = step.key === currentStep;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${
                isActive
                  ? 'bg-hysio-deep-green text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                <IconComponent className="h-3 w-3" />
              </div>
              <span className={`text-xs font-medium ${
                isCurrent ? 'text-hysio-deep-green' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-6 h-px ${
                index < currentIndex ? 'bg-hysio-deep-green' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Input step component
function InputStep({ onSubmit }: { onSubmit: (request: EduPackGenerationRequest) => void }) {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="text-center">
        <div className="bg-hysio-mint/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8 text-hysio-deep-green" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welkom bij EduPack Generator
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Genereer professionele, patiëntvriendelijke samenvattingen in B1-niveau Nederlands met Hysio technologie.
          Voer handmatig informatie in of upload bestaande documenten.
        </p>
      </div>

      {/* Features highlight */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <FeatureCard
          icon={User}
          title="Gepersonaliseerd"
          description="Aangepast aan leeftijd, conditie en begripsniveau van de patiënt"
        />
        <FeatureCard
          icon={Stethoscope}
          title="Medisch accuraat"
          description="Gebaseerd op professionele richtlijnen en best practices"
        />
        <FeatureCard
          icon={Lightbulb}
          title="Begrijpelijk"
          description="B1-niveau Nederlands met uitleg van medische termen"
        />
      </div>

      {/* Main form */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Nieuwe EduPack genereren</CardTitle>
        </CardHeader>
        <CardContent>
          <StandaloneForm onSubmit={onSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center">
      <CardContent className="p-6">
        <div className="bg-hysio-mint/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Icon className="h-6 w-6 text-hysio-deep-green" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}

// Generating step component
function GeneratingStep() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card>
        <CardContent className="p-12">
          <div className="mb-6">
            <div className="relative">
              <div className="w-16 h-16 mx-auto rounded-full bg-hysio-mint/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-hysio-deep-green animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-hysio-mint animate-spin border-t-transparent" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            EduPack wordt gegenereerd...
          </h3>
          <p className="text-gray-600 mb-6">
            Hysio analyseert de informatie en genereert een gepersonaliseerde,
            patiëntvriendelijke samenvatting.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              ⏱️ Dit duurt meestal 10-30 seconden
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Review step component
function ReviewStep({
  content,
  validationResult,
  showPreview,
  onTogglePreview,
  onContentUpdate,
  onDistribute,
  onDistributionComplete,
  isDistributing,
  onStartOver
}: {
  content: EduPackContent;
  validationResult?: any;
  showPreview: boolean;
  onTogglePreview: () => void;
  onContentUpdate: (content: EduPackContent) => void;
  onDistribute: () => void;
  onDistributionComplete: () => void;
  isDistributing: boolean;
  onStartOver: () => void;
}) {
  if (isDistributing) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>EduPack versturen</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionControls
              content={content}
              onComplete={onDistributionComplete}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-green-800">EduPack succesvol gegenereerd!</h3>
            <p className="text-sm text-green-600">
              Review de inhoud en verstuur naar de patiënt
            </p>
          </div>
        </div>
      </div>

      {/* Content layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Preview panel */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Generated EduPack</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTogglePreview}
                >
                  {showPreview ? 'Verberg' : 'Toon'} Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              {showPreview ? (
                <PreviewPanel
                  content={content}
                  validationResult={validationResult}
                  onContentUpdate={onContentUpdate}
                  className="h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Klik op "Toon Preview" om de inhoud te bekijken</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-6">
          {/* Summary card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Samenvatting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Secties:</span>
                <span className="font-medium">
                  {content.sections.filter(s => s.enabled).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Woorden:</span>
                <span className="font-medium">
                  {content.sections
                    .filter(s => s.enabled)
                    .reduce((total, s) => total + s.content.trim().split(/\s+/).length, 0)
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taalniveau:</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {validationResult?.languageLevel || 'B1'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {content.status === 'ready' ? 'Klaar' : 'Concept'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={onDistribute}
              className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Versturen
            </Button>

            <Separator />

            <Button
              variant="outline"
              onClick={onStartOver}
              className="w-full"
            >
              Nieuwe EduPack
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Completed step component
function CompletedStep({ onStartOver }: { onStartOver: () => void }) {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <Card>
        <CardContent className="p-12">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            EduPack succesvol verstuurd!
          </h3>
          <p className="text-gray-600 mb-6">
            De patiënt heeft de samenvatting ontvangen en kan deze nu raadplegen
            voor een beter begrip van de behandeling.
          </p>
          <Button onClick={onStartOver} className="bg-hysio-deep-green hover:bg-hysio-deep-green/90">
            Nieuwe EduPack genereren
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}