// Post-Session EduPack Integration Component
// Offers EduPack generation after completing Intake or Consult workflows

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EduPackPanel } from './edupack-panel';
import {
  FileText,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';

import type {
  EduPackContent,
  EduPackSectionType
} from '@/lib/types/edupack';
import type {
  PatientInfo,
  IntakeData,
  FollowupData,
  SOEPStructure
} from '@/lib/types';

export interface PostSessionIntegrationProps {
  // Session data
  sessionType: 'intake' | 'followup' | 'consult';
  patientInfo: PatientInfo;
  sessionData?: IntakeData | FollowupData;
  soepData?: SOEPStructure;
  transcript?: string;
  sessionPreparation?: string;

  // Integration callbacks
  onEduPackGenerated?: (eduPack: EduPackContent) => void;
  onEduPackDistributed?: (method: string, details: any) => void;
  onSkip?: () => void;
  onClose?: () => void;

  // UI configuration
  autoShow?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

type IntegrationStep = 'offer' | 'generating' | 'review' | 'completed' | 'skipped';

export function PostSessionIntegration({
  sessionType,
  patientInfo,
  sessionData,
  soepData,
  transcript,
  sessionPreparation,
  onEduPackGenerated,
  onEduPackDistributed,
  onSkip,
  onClose,
  autoShow = true,
  showCloseButton = true,
  className = ''
}: PostSessionIntegrationProps) {
  const [currentStep, setCurrentStep] = useState<IntegrationStep>('offer');
  const [showEduPackPanel, setShowEduPackPanel] = useState(false);
  const [generatedEduPack, setGeneratedEduPack] = useState<EduPackContent | null>(null);

  // Determine session context from available data
  const getSessionContext = useCallback(() => {
    let context = '';

    // Add session type context
    const sessionTypeLabel = {
      intake: 'Eerste afspraak (Intake)',
      followup: 'Controleafspraak',
      consult: 'Consultgesprek'
    }[sessionType];

    context += `Sessie type: ${sessionTypeLabel}\n\n`;

    // Add patient context
    if (patientInfo.age) {
      context += `Patiënt: ${patientInfo.age} jaar\n`;
    }
    if (patientInfo.condition) {
      context += `Hoofdklacht: ${patientInfo.condition}\n`;
    }

    context += '\n';

    // Add session-specific data
    if (soepData) {
      if (soepData.subjective) {
        context += `Subjectieve bevindingen:\n${soepData.subjective}\n\n`;
      }
      if (soepData.objective) {
        context += `Objectieve bevindingen:\n${soepData.objective}\n\n`;
      }
      if (soepData.evaluation) {
        context += `Evaluatie:\n${soepData.evaluation}\n\n`;
      }
      if (soepData.plan) {
        context += `Behandelplan:\n${soepData.plan}\n\n`;
      }
    }

    // Add intake-specific data
    if (sessionData && 'phsbData' in sessionData) {
      const phsbData = sessionData.phsbData;
      if (phsbData?.patientNeeds) {
        context += `Patiëntbehoeften:\n${phsbData.patientNeeds}\n\n`;
      }
      if (phsbData?.history) {
        context += `Anamnese:\n${phsbData.history}\n\n`;
      }
      if (phsbData?.disorders) {
        context += `Stoornissen:\n${phsbData.disorders}\n\n`;
      }
      if (phsbData?.limitations) {
        context += `Beperkingen:\n${phsbData.limitations}\n\n`;
      }
    }

    // Add transcript if available
    if (transcript) {
      context += `Gespreksnotities:\n${transcript}\n\n`;
    }

    // Add preparation context
    if (sessionPreparation) {
      context += `Voorbereiding:\n${sessionPreparation}\n\n`;
    }

    return context.trim();
  }, [sessionType, patientInfo, sessionData, soepData, transcript, sessionPreparation]);

  // Handle EduPack generation start
  const handleStartGeneration = useCallback(() => {
    setShowEduPackPanel(true);
    setCurrentStep('generating');
  }, []);

  // Handle EduPack completion
  const handleEduPackComplete = useCallback((eduPack: EduPackContent) => {
    setGeneratedEduPack(eduPack);
    setCurrentStep('review');
    onEduPackGenerated?.(eduPack);
  }, [onEduPackGenerated]);

  // Handle distribution completion
  const handleDistributionComplete = useCallback((method: 'email' | 'download' | 'copy', details?: any) => {
    setCurrentStep('completed');
    onEduPackDistributed?.(method, details);
  }, [onEduPackDistributed]);

  // Handle skip
  const handleSkip = useCallback(() => {
    setCurrentStep('skipped');
    onSkip?.();
  }, [onSkip]);

  // Don't render if not auto-showing and not explicitly shown
  if (!autoShow && currentStep === 'offer') {
    return null;
  }

  // Don't render if skipped or completed
  if (currentStep === 'skipped') {
    return null;
  }

  // Show EduPack panel for generation/review
  if (showEduPackPanel) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-900">Sessie voltooid</CardTitle>
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-green-700 hover:text-green-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700">
              EduPack wordt gegenereerd op basis van uw {sessionType === 'intake' ? 'intake' : sessionType === 'followup' ? 'controle' : 'consult'}sessie.
            </p>
          </CardContent>
        </Card>

        <EduPackPanel
          sessionId={`session_${Date.now()}`}
          soepData={soepData}
          patientInfo={patientInfo}
          transcript={getSessionContext()}
          isVisible={true}
          onComplete={handleEduPackComplete}
          onEmailSent={(recipient, eduPackId) => handleDistributionComplete('email', { recipient, eduPackId })}
          onDownloaded={(eduPackId, format) => handleDistributionComplete('download', { eduPackId, format })}
          onCopied={(eduPackId) => handleDistributionComplete('copy', { eduPackId })}
        />
      </div>
    );
  }

  // Show completion message
  if (currentStep === 'completed') {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h3 className="font-semibold text-green-900">EduPack succesvol gedeeld!</h3>
            <p className="text-sm text-green-700">
              De patiëntinformatie is {generatedEduPack ? 'gegenereerd en gedeeld' : 'beschikbaar gemaakt'}.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show initial offer
  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">EduPack Genereren</CardTitle>
          </div>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-blue-700 hover:text-blue-900"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-700">
          Wilt u een patiëntvriendelijke samenvatting genereren op basis van deze {' '}
          {sessionType === 'intake' ? 'intake' : sessionType === 'followup' ? 'controle' : 'consult'}sessie?
        </p>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-900">Beschikbare gegevens:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <User className="h-3 w-3 mr-1" />
              Patiëntinfo
            </Badge>
            {soepData && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <FileText className="h-3 w-3 mr-1" />
                SOEP-structuur
              </Badge>
            )}
            {sessionData && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <MessageSquare className="h-3 w-3 mr-1" />
                Sessiegegevens
              </Badge>
            )}
            {transcript && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Clock className="h-3 w-3 mr-1" />
                Gespreksnotities
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex gap-3">
          <Button
            onClick={handleStartGeneration}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            EduPack Genereren
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            className="text-blue-700 border-blue-200 hover:bg-blue-50"
          >
            Overslaan
          </Button>
        </div>

        <p className="text-xs text-blue-600">
          💡 EduPacks helpen patiënten om hun behandeling beter te begrijpen met informatie in begrijpelijke taal.
        </p>
      </CardContent>
    </Card>
  );
}