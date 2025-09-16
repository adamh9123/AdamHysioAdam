// EduPack Panel Component for Hysio Medical Scribe Integration
// Main integration panel that appears after session completion

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import {
  FileText,
  Sparkles,
  Send,
  Download,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

import { PreviewPanel } from './preview-panel';
import { SectionToggle } from './section-toggle';
import { DistributionControls } from './distribution-controls';
import { useEduPackGeneration } from '@/hooks/useEduPackGeneration';

import type {
  EduPackContent,
  EduPackGenerationRequest,
  EduPackSectionType
} from '@/lib/types/edupack';
import type { SOEPStructure, PatientInfo } from '@/lib/types';

export interface EduPackPanelProps {
  // Session data from scribe workflow
  sessionId?: string;
  soepData?: SOEPStructure;
  patientInfo?: PatientInfo;
  transcript?: string;
  clinicalNotes?: string;

  // Panel configuration
  isVisible: boolean;
  onClose?: () => void;
  onComplete?: (eduPack: EduPackContent) => void;

  // Integration callbacks
  onEmailSent?: (recipient: string, eduPackId: string) => void;
  onDownloaded?: (eduPackId: string, format: string) => void;
  onCopied?: (eduPackId: string) => void;
}

interface PanelState {
  step: 'configuration' | 'generating' | 'review' | 'distributing' | 'completed';
  selectedSections: EduPackSectionType[];
  generationSettings: {
    language: 'nl' | 'en';
    tone: 'formal' | 'informal';
    personalizationLevel: 'basic' | 'detailed';
  };
  showPreview: boolean;
}

export function EduPackPanel({
  sessionId,
  soepData,
  patientInfo,
  transcript,
  clinicalNotes,
  isVisible,
  onClose,
  onComplete,
  onEmailSent,
  onDownloaded,
  onCopied
}: EduPackPanelProps) {
  // Local state
  const [panelState, setPanelState] = useState<PanelState>({
    step: 'configuration',
    selectedSections: ['introduction', 'session_summary', 'treatment_plan', 'self_care', 'warning_signs', 'follow_up'],
    generationSettings: {
      language: 'nl',
      tone: 'formal',
      personalizationLevel: 'detailed'
    },
    showPreview: false
  });

  // EduPack generation hook
  const {
    isGenerating,
    content,
    error,
    validationResult,
    generateEduPack,
    regenerateSection,
    updateContent
  } = useEduPackGeneration();

  // Effect to add diagnosis section for intake sessions
  useEffect(() => {
    if (soepData && !panelState.selectedSections.includes('diagnosis')) {
      // Add diagnosis section for intake sessions
      setPanelState(prev => ({
        ...prev,
        selectedSections: [
          'introduction',
          'session_summary',
          'diagnosis',
          'treatment_plan',
          'self_care',
          'warning_signs',
          'follow_up'
        ].filter((section, index, arr) => arr.indexOf(section) === index) as EduPackSectionType[]
      }));
    }
  }, [soepData, panelState.selectedSections]);

  // Handle EduPack generation
  const handleGenerate = useCallback(async () => {
    setPanelState(prev => ({ ...prev, step: 'generating' }));

    const generationRequest: EduPackGenerationRequest = {
      sessionId,
      sessionData: {
        soepData,
        patientInfo,
        transcript,
        clinicalNotes
      },
      preferences: {
        language: panelState.generationSettings.language,
        tone: panelState.generationSettings.tone,
        sections: panelState.selectedSections,
        personalizationLevel: panelState.generationSettings.personalizationLevel
      },
      therapistId: 'current-user' // TODO: Get from auth context
    };

    try {
      await generateEduPack(generationRequest);
      setPanelState(prev => ({ ...prev, step: 'review', showPreview: true }));
    } catch (error) {
      console.error('EduPack generation failed:', error);
      setPanelState(prev => ({ ...prev, step: 'configuration' }));
    }
  }, [
    sessionId,
    soepData,
    patientInfo,
    transcript,
    clinicalNotes,
    panelState.selectedSections,
    panelState.generationSettings,
    generateEduPack
  ]);

  // Handle section toggle
  const handleSectionToggle = useCallback((sectionType: EduPackSectionType, enabled: boolean) => {
    setPanelState(prev => ({
      ...prev,
      selectedSections: enabled
        ? [...prev.selectedSections, sectionType]
        : prev.selectedSections.filter(s => s !== sectionType)
    }));
  }, []);

  // Handle regeneration
  const handleRegenerate = useCallback(async () => {
    if (!content) return;

    setPanelState(prev => ({ ...prev, step: 'generating' }));

    try {
      await handleGenerate();
    } catch (error) {
      setPanelState(prev => ({ ...prev, step: 'review' }));
    }
  }, [content, handleGenerate]);

  // Handle distribution complete
  const handleDistributionComplete = useCallback((method: 'email' | 'download' | 'copy', details?: any) => {
    if (!content) return;

    switch (method) {
      case 'email':
        onEmailSent?.(details.recipient, content.id);
        break;
      case 'download':
        onDownloaded?.(content.id, details.format);
        break;
      case 'copy':
        onCopied?.(content.id);
        break;
    }

    setPanelState(prev => ({ ...prev, step: 'completed' }));
    setTimeout(() => {
      onComplete?.(content);
    }, 1500);
  }, [content, onEmailSent, onDownloaded, onCopied, onComplete]);

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-hysio-mint/5">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-hysio-deep-green" />
          <h3 className="font-semibold text-gray-900">EduPack Genereren</h3>
          {content && (
            <Badge variant="secondary" className="bg-hysio-mint/20 text-hysio-deep-green">
              Klaar
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          ×
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {panelState.step === 'configuration' && (
          <ConfigurationStep
            selectedSections={panelState.selectedSections}
            generationSettings={panelState.generationSettings}
            onSectionToggle={handleSectionToggle}
            onSettingsChange={(settings) =>
              setPanelState(prev => ({ ...prev, generationSettings: { ...prev.generationSettings, ...settings } }))
            }
            onGenerate={handleGenerate}
            hasSessionData={!!(soepData || transcript)}
          />
        )}

        {panelState.step === 'generating' && (
          <GeneratingStep />
        )}

        {panelState.step === 'review' && content && (
          <ReviewStep
            content={content}
            validationResult={validationResult}
            showPreview={panelState.showPreview}
            onTogglePreview={() =>
              setPanelState(prev => ({ ...prev, showPreview: !prev.showPreview }))
            }
            onRegenerate={handleRegenerate}
            onContentUpdate={updateContent}
            onDistribute={() => setPanelState(prev => ({ ...prev, step: 'distributing' }))}
          />
        )}

        {panelState.step === 'distributing' && content && (
          <DistributionStep
            content={content}
            patientInfo={patientInfo}
            onDistributionComplete={handleDistributionComplete}
            onBack={() => setPanelState(prev => ({ ...prev, step: 'review' }))}
          />
        )}

        {panelState.step === 'completed' && (
          <CompletedStep
            onClose={onClose}
          />
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Fout bij genereren</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPanelState(prev => ({ ...prev, step: 'configuration' }))}
            className="mt-2"
          >
            Opnieuw proberen
          </Button>
        </div>
      )}
    </div>
  );
}

// Configuration step component
function ConfigurationStep({
  selectedSections,
  generationSettings,
  onSectionToggle,
  onSettingsChange,
  onGenerate,
  hasSessionData
}: {
  selectedSections: EduPackSectionType[];
  generationSettings: PanelState['generationSettings'];
  onSectionToggle: (section: EduPackSectionType, enabled: boolean) => void;
  onSettingsChange: (settings: Partial<PanelState['generationSettings']>) => void;
  onGenerate: () => void;
  hasSessionData: boolean;
}) {
  const allSections: EduPackSectionType[] = [
    'introduction',
    'session_summary',
    'diagnosis',
    'treatment_plan',
    'self_care',
    'warning_signs',
    'follow_up'
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Session data indicator */}
      {hasSessionData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Sessiegegevens gevonden</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            EduPack wordt automatisch gegenereerd op basis van uw sessiedata
          </p>
        </div>
      )}

      {/* Section selection */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Selecteer secties</h4>
        <div className="space-y-2">
          {allSections.map((section) => (
            <SectionToggle
              key={section}
              sectionType={section}
              enabled={selectedSections.includes(section)}
              onToggle={(enabled) => onSectionToggle(section, enabled)}
            />
          ))}
        </div>
      </div>

      {/* Generation settings */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Instellingen</h4>
        <div className="space-y-3">
          {/* Tone selection */}
          <div>
            <label className="text-sm font-medium text-gray-700">Aanspreking</label>
            <div className="mt-1 flex gap-2">
              <Button
                variant={generationSettings.tone === 'formal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSettingsChange({ tone: 'formal' })}
                className="flex-1"
              >
                Formeel (u)
              </Button>
              <Button
                variant={generationSettings.tone === 'informal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSettingsChange({ tone: 'informal' })}
                className="flex-1"
              >
                Informeel (je)
              </Button>
            </div>
          </div>

          {/* Personalization level */}
          <div>
            <label className="text-sm font-medium text-gray-700">Personalisatie</label>
            <div className="mt-1 flex gap-2">
              <Button
                variant={generationSettings.personalizationLevel === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSettingsChange({ personalizationLevel: 'basic' })}
                className="flex-1"
              >
                Basis
              </Button>
              <Button
                variant={generationSettings.personalizationLevel === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSettingsChange({ personalizationLevel: 'detailed' })}
                className="flex-1"
              >
                Uitgebreid
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="pt-4 border-t border-gray-200">
        <Button
          onClick={onGenerate}
          disabled={selectedSections.length === 0}
          className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          EduPack Genereren
        </Button>
      </div>
    </div>
  );
}

// Generating step component
function GeneratingStep() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-4">
          <Spinner className="h-8 w-8 mx-auto text-hysio-deep-green" />
        </div>
        <h4 className="font-medium text-gray-900 mb-2">EduPack aan het genereren...</h4>
        <p className="text-sm text-gray-600">
          Dit duurt ongeveer 10-30 seconden
        </p>
      </div>
    </div>
  );
}

// Review step component
function ReviewStep({
  content,
  validationResult,
  showPreview,
  onTogglePreview,
  onRegenerate,
  onContentUpdate,
  onDistribute
}: {
  content: EduPackContent;
  validationResult?: any;
  showPreview: boolean;
  onTogglePreview: () => void;
  onRegenerate: () => void;
  onContentUpdate: (content: EduPackContent) => void;
  onDistribute: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Preview toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">EduPack gegenereerd</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePreview}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Verberg' : 'Bekijk'}
          </Button>
        </div>

        {/* Validation summary */}
        {validationResult && (
          <div className="mt-2 text-sm">
            <span className="text-gray-600">
              Taalniveau: <span className="font-medium">{validationResult.languageLevel}</span>
            </span>
            {validationResult.issues?.length > 0 && (
              <span className="ml-3 text-amber-600">
                {validationResult.issues.length} aandachtspunt(en)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preview panel */}
      {showPreview && (
        <div className="flex-1 overflow-hidden">
          <PreviewPanel
            content={content}
            validationResult={validationResult}
            onContentUpdate={onContentUpdate}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Opnieuw genereren
        </Button>
        <Button
          onClick={onDistribute}
          className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90"
        >
          <Send className="h-4 w-4 mr-2" />
          Versturen
        </Button>
      </div>
    </div>
  );
}

// Distribution step component
function DistributionStep({
  content,
  patientInfo,
  onDistributionComplete,
  onBack
}: {
  content: EduPackContent;
  patientInfo?: PatientInfo;
  onDistributionComplete: (method: 'email' | 'download' | 'copy', details?: any) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-2"
        >
          ← Terug naar review
        </Button>
        <h4 className="font-medium text-gray-900">EduPack versturen</h4>
      </div>

      <div className="flex-1 p-4">
        <DistributionControls
          content={content}
          patientInfo={patientInfo}
          onComplete={onDistributionComplete}
        />
      </div>
    </div>
  );
}

// Completed step component
function CompletedStep({
  onClose
}: {
  onClose?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="mb-4">
          <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
        </div>
        <h4 className="font-medium text-gray-900 mb-2">EduPack verstuurd!</h4>
        <p className="text-sm text-gray-600 mb-4">
          De patiënt heeft de samenvatting ontvangen
        </p>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
        >
          Sluiten
        </Button>
      </div>
    </div>
  );
}