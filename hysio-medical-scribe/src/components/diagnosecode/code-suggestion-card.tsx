'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Copy,
  CheckCircle,
  Info,
  TrendingUp,
  Zap,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

export interface CodeSuggestion {
  code: string;
  name: string;
  rationale: string;
  confidence: number;
  metadata?: {
    category?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    alternativeCodes?: string[];
    estimatedAccuracy?: number;
  };
}

interface CodeSuggestionCardProps {
  suggestion: CodeSuggestion;
  rank: number;
  onCopy?: (code: string) => void;
  onSelect?: (suggestion: CodeSuggestion) => void;
  onViewDetails?: (code: string) => void;
  isSelected?: boolean;
  className?: string;
}

export function CodeSuggestionCard({
  suggestion,
  rank,
  onCopy,
  onSelect,
  onViewDetails,
  isSelected = false,
  className
}: CodeSuggestionCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle copy functionality
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(suggestion.code);
      setIsCopied(true);
      onCopy?.(suggestion.code);

      // Reset after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [suggestion.code, onCopy]);

  // Handle card selection
  const handleSelect = useCallback(() => {
    onSelect?.(suggestion);
  }, [suggestion, onSelect]);

  // Get confidence styling
  const getConfidenceStyle = (confidence: number) => {
    if (confidence > 0.8) {
      return {
        badge: 'border-green-200 bg-green-50 text-green-700',
        indicator: 'bg-green-500',
        border: 'border-l-green-500'
      };
    } else if (confidence > 0.6) {
      return {
        badge: 'border-yellow-200 bg-yellow-50 text-yellow-700',
        indicator: 'bg-yellow-500',
        border: 'border-l-yellow-500'
      };
    } else {
      return {
        badge: 'border-gray-200 bg-gray-50 text-gray-700',
        indicator: 'bg-gray-500',
        border: 'border-l-gray-500'
      };
    }
  };

  // Get rank styling
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-hysio-deep-green text-white';
      case 2:
        return 'bg-hysio-mint-dark text-white';
      case 3:
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const confidenceStyle = getConfidenceStyle(suggestion.confidence);

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md cursor-pointer border-l-4",
      confidenceStyle.border,
      isSelected ? "ring-2 ring-hysio-mint shadow-lg" : "hover:border-gray-300",
      className
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {/* Rank Badge */}
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  getRankStyle(rank)
                )}>
                  {rank}
                </div>

                {/* DCSPH Code */}
                <code className="text-lg font-bold text-hysio-deep-green bg-hysio-mint/10 px-3 py-1 rounded-md">
                  {suggestion.code}
                </code>

                {/* Confidence Badge */}
                <Badge
                  variant="outline"
                  className={cn("text-xs", confidenceStyle.badge)}
                >
                  <div className={cn("w-2 h-2 rounded-full mr-1", confidenceStyle.indicator)} />
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>

                {/* Best Match Indicator */}
                {rank === 1 && suggestion.confidence > 0.8 && (
                  <Badge className="bg-green-600 text-white text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Beste match
                  </Badge>
                )}
              </div>

              {/* Code Name/Description */}
              <h4 className="font-semibold text-gray-800 leading-tight mb-2">
                {suggestion.name}
              </h4>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Copy Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="h-8 w-8 p-0"
              >
                {isCopied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              {/* Details Button */}
              {onViewDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(suggestion.code);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Rationale */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              {suggestion.rationale}
            </p>

            {/* Metadata Tags */}
            {suggestion.metadata && (
              <div className="flex flex-wrap gap-2">
                {suggestion.metadata.category && (
                  <Badge variant="outline" className="text-xs">
                    {suggestion.metadata.category}
                  </Badge>
                )}

                {suggestion.metadata.riskLevel && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      suggestion.metadata.riskLevel === 'high' ? 'border-red-200 text-red-700' :
                      suggestion.metadata.riskLevel === 'medium' ? 'border-yellow-200 text-yellow-700' :
                      'border-green-200 text-green-700'
                    )}
                  >
                    {suggestion.metadata.riskLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {suggestion.metadata.riskLevel === 'medium' && <Info className="w-3 h-3 mr-1" />}
                    {suggestion.metadata.riskLevel === 'low' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {suggestion.metadata.riskLevel} risico
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Expandable Details */}
          {suggestion.metadata?.alternativeCodes && suggestion.metadata.alternativeCodes.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs text-hysio-mint-dark hover:text-hysio-mint font-medium flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                {isExpanded ? 'Minder details' : 'Meer details'}
              </button>

              {isExpanded && (
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium mb-1">Alternatieve codes:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.metadata.alternativeCodes.map((altCode) => (
                      <code key={altCode} className="bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {altCode}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selection Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {/* Quick indicators */}
              {suggestion.confidence > 0.9 && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Zap className="w-3 h-3" />
                  <span>Hoge zekerheid</span>
                </div>
              )}

              {rank === 1 && (
                <div className="flex items-center gap-1 text-xs text-hysio-mint-dark">
                  <TrendingUp className="w-3 h-3" />
                  <span>Aanbevolen</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSelect}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-xs",
                isSelected
                  ? "bg-hysio-deep-green hover:bg-hysio-deep-green-900"
                  : "border-hysio-deep-green text-hysio-deep-green hover:bg-hysio-deep-green hover:text-white"
              )}
            >
              {isSelected ? 'Geselecteerd' : 'Selecteer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Container component for displaying multiple suggestions
interface CodeSuggestionsListProps {
  suggestions: CodeSuggestion[];
  onCopy?: (code: string) => void;
  onSelect?: (suggestion: CodeSuggestion) => void;
  onViewDetails?: (code: string) => void;
  selectedCode?: string;
  maxSuggestions?: number;
  className?: string;
}

export function CodeSuggestionsList({
  suggestions,
  onCopy,
  onSelect,
  onViewDetails,
  selectedCode,
  maxSuggestions = 3,
  className
}: CodeSuggestionsListProps) {
  // Sort suggestions by confidence and take top N
  const sortedSuggestions = [...suggestions]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxSuggestions);

  if (sortedSuggestions.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <Info className="h-8 w-8 mx-auto mb-2" />
        <p>Geen code suggesties beschikbaar</p>
        <p className="text-sm">Probeer uw query te verfijnen</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-hysio-deep-green flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          DCSPH Code Suggesties
        </h3>

        <Badge variant="outline" className="text-xs">
          {sortedSuggestions.length} van {suggestions.length} resultaten
        </Badge>
      </div>

      {/* Suggestions Grid/List */}
      <div className="space-y-3">
        {sortedSuggestions.map((suggestion, index) => (
          <CodeSuggestionCard
            key={suggestion.code}
            suggestion={suggestion}
            rank={index + 1}
            onCopy={onCopy}
            onSelect={onSelect}
            onViewDetails={onViewDetails}
            isSelected={selectedCode === suggestion.code}
          />
        ))}
      </div>

      {/* Summary Information */}
      {suggestions.length > maxSuggestions && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            {suggestions.length - maxSuggestions} meer resultaten beschikbaar
          </p>
        </div>
      )}
    </div>
  );
}