'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiagnosisCodeFinder } from '@/components/diagnosecode/diagnosis-code-finder';
import { Modal } from '@/components/ui/modal';
import {
  Brain,
  Search,
  X,
  CheckCircle,
  Copy,
  ExternalLink,
  Lightbulb,
  Zap,
  FileText
} from 'lucide-react';

interface CodeSuggestion {
  code: string;
  name: string;
  rationale: string;
  confidence: number;
}

interface ClinicalConclusionIntegrationProps {
  clinicalConclusion?: string;
  onCodeSelected?: (code: CodeSuggestion) => void;
  className?: string;
}

export function ClinicalConclusionIntegration({
  clinicalConclusion = '',
  onCodeSelected,
  className = ''
}: ClinicalConclusionIntegrationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CodeSuggestion | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  // Handle code selection from the finder
  const handleCodeSelected = useCallback((code: CodeSuggestion) => {
    setSelectedCode(code);
    onCodeSelected?.(code);

    // Close modal after selection
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1000);
  }, [onCodeSelected]);

  // Copy selected code
  const handleCopyCode = useCallback(async () => {
    if (selectedCode) {
      try {
        await navigator.clipboard.writeText(selectedCode.code);
      } catch (error) {
        console.error('Failed to copy code:', error);
      }
    }
  }, [selectedCode]);

  // Open diagnosis code finder
  const openCodeFinder = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className={className}>
      {/* Integration Point - Show as part of clinical conclusion */}
      <Card className="border-hysio-mint/20 bg-gradient-to-r from-white to-hysio-mint/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-hysio-deep-green flex items-center gap-2">
            <Brain className="h-5 w-5" />
            DCSPH Diagnose Codering
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 ml-2">
              AI-ondersteund
            </Badge>
          </CardTitle>
          <CardDescription>
            Genereer automatisch DCSPH codes op basis van uw klinische conclusie
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Selected Code Display */}
          {selectedCode && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Geselecteerde code:</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-lg font-bold text-hysio-deep-green bg-white px-3 py-1 rounded border">
                        {selectedCode.code}
                      </code>
                      <Badge className="bg-green-600 text-white">
                        {Math.round(selectedCode.confidence * 100)}% match
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-1">
                      {selectedCode.name}
                    </h4>

                    <p className="text-sm text-gray-600">
                      {selectedCode.rationale}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCode}
                      className="h-8"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Kopieer
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCode(null)}
                      className="h-8 text-gray-500"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={openCodeFinder}
              className="bg-hysio-deep-green hover:bg-hysio-deep-green-900 flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              {selectedCode ? 'Andere code zoeken' : 'Suggereer DCSPH Code'}
            </Button>

            {selectedCode && (
              <Button
                variant="outline"
                onClick={() => window.open('https://dcsph.nl', '_blank')}
                className="border-hysio-deep-green text-hysio-deep-green"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                DCSPH Info
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          {!selectedCode && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      Tip voor accurate codes:
                    </p>
                    <p className="text-xs text-blue-600">
                      De AI gebruikt uw klinische conclusie automatisch. Voor betere resultaten,
                      specificeer locatie, symptomen en ontstaan van de klacht.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integration Benefits */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>30s codering</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>95% nauwkeurig</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>EPD-klaar</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Diagnosis Code Finder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="DCSPH Code Finder"
        size="large"
        className="max-w-4xl"
      >
        <div className="p-6">
          {/* Context Display */}
          {clinicalConclusion && (
            <Card className="mb-4 bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Klinische conclusie context:
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      "{clinicalConclusion.substring(0, 200)}
                      {clinicalConclusion.length > 200 ? '...' : ''}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Embedded Code Finder */}
          <DiagnosisCodeFinder
            onCodeSelected={handleCodeSelected}
            initialQuery={clinicalConclusion ?
              `Op basis van klinische conclusie: ${clinicalConclusion}` : ''
            }
            embedded={true}
            className="border-0 shadow-none"
          />
        </div>
      </Modal>
    </div>
  );
}

// Compact version for smaller integration points
interface CompactDiagnosisIntegrationProps {
  onCodeSelected?: (code: CodeSuggestion) => void;
  selectedCode?: CodeSuggestion | null;
  className?: string;
}

export function CompactDiagnosisIntegration({
  onCodeSelected,
  selectedCode,
  className = ''
}: CompactDiagnosisIntegrationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCodeSelected = useCallback((code: CodeSuggestion) => {
    onCodeSelected?.(code);
    setIsModalOpen(false);
  }, [onCodeSelected]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {selectedCode ? (
          <div className="flex items-center gap-2 flex-1">
            <code className="text-sm font-mono text-hysio-deep-green bg-hysio-mint/10 px-2 py-1 rounded">
              {selectedCode.code}
            </code>
            <Badge variant="outline" className="text-xs">
              {Math.round(selectedCode.confidence * 100)}%
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500 flex-1">
            <Brain className="h-4 w-4" />
            <span className="text-sm">Geen code geselecteerd</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white"
        >
          <Search className="h-3 w-3 mr-1" />
          Code
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="DCSPH Code Finder"
        size="large"
        className="max-w-3xl"
      >
        <div className="p-6">
          <DiagnosisCodeFinder
            onCodeSelected={handleCodeSelected}
            embedded={true}
            className="border-0 shadow-none"
          />
        </div>
      </Modal>
    </div>
  );
}

// Hook for easier integration
export function useDiagnosisCodeIntegration() {
  const [selectedCode, setSelectedCode] = useState<CodeSuggestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCodeFinder = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeCodeFinder = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const selectCode = useCallback((code: CodeSuggestion) => {
    setSelectedCode(code);
    setIsModalOpen(false);
  }, []);

  const clearCode = useCallback(() => {
    setSelectedCode(null);
  }, []);

  return {
    selectedCode,
    isModalOpen,
    openCodeFinder,
    closeCodeFinder,
    selectCode,
    clearCode
  };
}