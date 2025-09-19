'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
  Search,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Lightbulb,
  Brain,
  FileText,
  Stethoscope,
  Zap,
  Target,
  MessageCircle
} from 'lucide-react';

// Enhanced Types for new analysis engine
interface CodeSuggestion {
  code: string;
  name: string;
  rationale: string;
  confidence: number;
  category: string;
  clinicalNotes: string;
}

interface AnalysisResult {
  success: boolean;
  suggestions: CodeSuggestion[];
  analysisMetadata?: {
    processedAt: string;
    extractedKeywords: string[];
    clinicalFindings: string[];
  };
  error?: string;
}

interface DiagnosisCodeFinderProps {
  onCodeSelected?: (code: CodeSuggestion) => void;
  initialQuery?: string;
  embedded?: boolean;
  className?: string;
}

export function DiagnosisCodeFinder({
  onCodeSelected,
  initialQuery = '',
  embedded = false,
  className = ''
}: DiagnosisCodeFinderProps) {
  // Simplified state management for one-shot analysis
  const [query, setQuery] = useState(initialQuery);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<CodeSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Enhanced analysis submission
  const handleAnalysis = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!query.trim() || isAnalyzing) return;

    const analysisText = query.trim();
    setIsAnalyzing(true);
    setError(null);
    setResults([]);

    try {
      console.log('Starting comprehensive DCSPH analysis for:', analysisText.substring(0, 100) + '...');

      // Call new analysis endpoint
      const response = await fetch('/api/diagnosecode/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clinicalDescription: analysisText,
          includeMetadata: true,
          maxSuggestions: 3
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();

      if (data.success && data.suggestions) {
        setResults(data.suggestions);
        setAnalysisMetadata(data.analysisMetadata);
        console.log('Analysis completed successfully:', data.suggestions.length, 'suggestions found');
      } else {
        throw new Error(data.error || 'Analysis returned no results');
      }

    } catch (error: any) {
      console.error('DCSPH analysis error:', error);
      setError(
        error.message || 'Er is een fout opgetreden tijdens de analyse. Probeer het opnieuw.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [query, isAnalyzing]);

  // Copy functionality with enhanced feedback
  const copyToClipboard = useCallback(async (suggestion: CodeSuggestion) => {
    try {
      const copyText = `${suggestion.code} - ${suggestion.name}`;
      await navigator.clipboard.writeText(copyText);
      setCopiedCode(suggestion.code);
      onCodeSelected?.(suggestion);

      // Clear copied state after 3 seconds
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [onCodeSelected]);

  // Clear analysis results
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setAnalysisMetadata(null);
    setQuery('');
    textareaRef.current?.focus();
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAnalysis();
    }
  }, [handleAnalysis]);

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
          <Brain className="h-5 w-5" />
          Hysio Diagnosecode Chat
          <Badge variant="outline" className="border-blue-200 text-blue-700 ml-2">
            Intelligente Analyse-Engine
          </Badge>
        </CardTitle>
        <CardDescription>
          Beschrijf de klacht uitgebreid en ontvang direct de top 3 meest waarschijnlijke DCSPH codes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhanced Input Section */}
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Beschrijf de klacht, locatie, aard van de pijn, bewegingsbeperkingen, ontstaan en andere relevante klinische informatie in detail..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAnalyzing}
              className="min-h-[120px] resize-none text-base leading-relaxed border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-hysio-deep-green focus:ring-2 focus:ring-hysio-deep-green/20 transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500"
              maxLength={2000}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
              {query.length}/2000 tekens
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAnalysis}
              disabled={!query.trim() || isAnalyzing}
              className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white px-6 py-2 h-auto"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Analyseert...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyseer & Vind Codes
                </>
              )}
            </Button>

            {(results.length > 0 || error) && (
              <Button
                variant="outline"
                onClick={clearResults}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Nieuwe Analyse
              </Button>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" />
            <span>Pro tip: Gebruik Ctrl/Cmd + Enter om snel te analyseren</span>
          </div>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-blue-600 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-900">Intelligente DCSPH Analyse Actief</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Vergelijkt uw beschrijving met de officiële DCSPH database...
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-900">Analyse Fout</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResults}
                    className="mt-2 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Probeer Opnieuw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section - Top 3 Code Suggestions */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-emerald-600">
              <Target className="h-5 w-5" />
              <span>Top 3 DCSPH Code Suggesties</span>
            </div>

            <div className="grid gap-4">
              {results.map((suggestion, index) => (
                <Card
                  key={suggestion.code}
                  className={`transition-all hover:shadow-md border-l-4 ${
                    index === 0
                      ? 'border-l-emerald-500 bg-emerald-50/50'
                      : index === 1
                        ? 'border-l-blue-500 bg-blue-50/50'
                        : 'border-l-orange-500 bg-orange-50/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header with rank and code */}
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`text-xs font-bold ${
                              index === 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : index === 1
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            #{index + 1}
                          </Badge>
                          <code className="text-lg font-bold text-gray-900 bg-white px-3 py-1 rounded border">
                            {suggestion.code}
                          </code>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-blue-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${suggestion.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        {/* Condition name and category */}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base mb-1">
                            {suggestion.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category}
                          </Badge>
                        </div>

                        {/* Clinical rationale */}
                        <div className="bg-white/80 p-3 rounded border">
                          <div className="flex items-start gap-2">
                            <Stethoscope className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm text-blue-900 mb-1">
                                Klinische Onderbouwing:
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {suggestion.rationale}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Clinical notes if available */}
                        {suggestion.clinicalNotes && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            <strong>Aanvullende info:</strong> {suggestion.clinicalNotes}
                          </div>
                        )}
                      </div>

                      {/* Copy button */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion)}
                          className={`transition-all ${
                            copiedCode === suggestion.code
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          disabled={copiedCode === suggestion.code}
                        >
                          {copiedCode === suggestion.code ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Gekopieerd!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3 w-3" />
                              Kopieer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Analysis metadata */}
            {analysisMetadata && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium">Analyse Details:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <strong>Verwerkt:</strong> {new Date(analysisMetadata.processedAt).toLocaleTimeString('nl-NL')}
                      </div>
                      {analysisMetadata.extractedKeywords && (
                        <div>
                          <strong>Keywords:</strong> {analysisMetadata.extractedKeywords.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Professional reminder */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Professionele Verificatie:</p>
                  <p>
                    Deze suggesties zijn gebaseerd op uw beschrijving en de officiële DCSPH database.
                    Controleer altijd of de voorgestelde codes overeenkomen met uw klinische bevindingen
                    en pas aan waar nodig.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}