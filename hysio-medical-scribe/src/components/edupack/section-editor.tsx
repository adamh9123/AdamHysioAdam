// Section Editor Component for EduPack Module
// Rich text editor with real-time validation and B1-level language assistance

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Type,
  Eye,
  Wand2
} from 'lucide-react';

import type {
  EduPackSectionType,
  ContentValidationResult
} from '@/lib/types/edupack';
import { getSectionTemplate } from '@/lib/edupack/section-templates';

export interface SectionEditorProps {
  content: string;
  sectionType: EduPackSectionType;
  onSave: (content: string) => void;
  onCancel: () => void;
  onRegenerate?: (instructions?: string) => void;
  maxLength?: number;
  showValidation?: boolean;
  showSuggestions?: boolean;
  className?: string;
}

interface EditorState {
  currentContent: string;
  hasChanges: boolean;
  wordCount: number;
  characterCount: number;
  validation?: ContentValidationResult;
  suggestions: string[];
  isValidating: boolean;
}

export function SectionEditor({
  content,
  sectionType,
  onSave,
  onCancel,
  onRegenerate,
  maxLength,
  showValidation = true,
  showSuggestions = true,
  className = ''
}: SectionEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const template = getSectionTemplate(sectionType);
  const maxWords = maxLength || template.maxLength;

  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    currentContent: content,
    hasChanges: false,
    wordCount: countWords(content),
    characterCount: content.length,
    suggestions: [],
    isValidating: false
  });

  // Debounced validation
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  // Update content and trigger validation
  const handleContentChange = useCallback((newContent: string) => {
    const wordCount = countWords(newContent);
    const characterCount = newContent.length;

    setEditorState(prev => ({
      ...prev,
      currentContent: newContent,
      hasChanges: newContent !== content,
      wordCount,
      characterCount
    }));

    // Debounced validation
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (showValidation) {
      setEditorState(prev => ({ ...prev, isValidating: true }));

      validationTimeoutRef.current = setTimeout(() => {
        validateContent(newContent, sectionType).then(validation => {
          setEditorState(prev => ({
            ...prev,
            validation,
            isValidating: false
          }));
        });
      }, 1000);
    }
  }, [content, sectionType, showValidation]);

  // Generate writing suggestions
  const generateSuggestions = useCallback(async (text: string) => {
    if (!showSuggestions || !text.trim()) return;

    try {
      const response = await fetch('/api/edu-pack/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: text,
          sectionType,
          language: 'nl',
          level: 'B1'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.suggestions) {
          setEditorState(prev => ({
            ...prev,
            suggestions: result.suggestions
          }));
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }, [sectionType, showSuggestions]);

  // Handle save
  const handleSave = () => {
    if (editorState.hasChanges) {
      onSave(editorState.currentContent);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditorState(prev => ({
      ...prev,
      currentContent: content,
      hasChanges: false
    }));
    onCancel();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.max(textarea.scrollHeight, 120) + 'px';
    }
  }, [editorState.currentContent]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Generate suggestions when content changes
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      generateSuggestions(editorState.currentContent);
    }, 2000);

    return () => clearTimeout(debounceTimeout);
  }, [editorState.currentContent, generateSuggestions]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Editor header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {template.title} bewerken
          </span>
          {editorState.hasChanges && (
            <Badge variant="secondary" className="text-xs">
              Gewijzigd
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Word count indicator */}
          <WordCountIndicator
            currentWords={editorState.wordCount}
            maxWords={maxWords}
          />

          {/* Validation status */}
          {showValidation && editorState.validation && (
            <ValidationIndicator
              validation={editorState.validation}
              isValidating={editorState.isValidating}
            />
          )}
        </div>
      </div>

      {/* Main editor */}
      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-hysio-mint focus-within:border-hysio-mint">
        <Textarea
          ref={textareaRef}
          value={editorState.currentContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={`Schrijf hier de ${template.title.toLowerCase()}...`}
          className="min-h-[120px] border-0 resize-none focus:ring-0 text-sm leading-relaxed"
          style={{ height: 'auto' }}
        />

        {/* Editor toolbar */}
        <div className="border-t border-gray-200 bg-gray-50 p-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{editorState.characterCount} tekens</span>
            <span>•</span>
            <span>
              {Math.ceil(editorState.wordCount / 200)} min leestijd
            </span>
          </div>

          <div className="flex items-center gap-1">
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate()}
                className="h-7 text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                AI hulp
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const preview = window.open('', '_blank');
                preview?.document.write(`
                  <html>
                    <head><title>Preview - ${template.title}</title></head>
                    <body style="font-family: Inter, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6;">
                      <h1>${template.title}</h1>
                      <div style="white-space: pre-wrap;">${editorState.currentContent}</div>
                    </body>
                  </html>
                `);
              }}
              className="h-7 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Validation feedback */}
      {showValidation && editorState.validation && (
        <ValidationFeedback validation={editorState.validation} />
      )}

      {/* Writing suggestions */}
      {showSuggestions && editorState.suggestions.length > 0 && (
        <WritingSuggestions
          suggestions={editorState.suggestions}
          onApplySuggestion={(suggestion) => {
            const improvedContent = editorState.currentContent + '\n\n' + suggestion;
            handleContentChange(improvedContent);
          }}
        />
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {template.description}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            size="sm"
          >
            <X className="h-4 w-4 mr-1" />
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editorState.hasChanges}
            size="sm"
            className="bg-hysio-deep-green hover:bg-hysio-deep-green/90"
          >
            <Save className="h-4 w-4 mr-1" />
            Opslaan
          </Button>
        </div>
      </div>
    </div>
  );
}

// Word count indicator component
function WordCountIndicator({
  currentWords,
  maxWords
}: {
  currentWords: number;
  maxWords: number;
}) {
  const percentage = (currentWords / maxWords) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = percentage > 100;

  return (
    <div className="flex items-center gap-1">
      <div
        className={`text-xs font-medium ${
          isOverLimit
            ? 'text-red-600'
            : isNearLimit
            ? 'text-amber-600'
            : 'text-gray-500'
        }`}
      >
        {currentWords}/{maxWords}
      </div>

      {/* Progress bar */}
      <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isOverLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-amber-500'
              : 'bg-hysio-deep-green'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// Validation indicator component
function ValidationIndicator({
  validation,
  isValidating
}: {
  validation: ContentValidationResult;
  isValidating: boolean;
}) {
  if (isValidating) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Valideren...
      </div>
    );
  }

  const highIssues = validation.issues.filter(i => i.severity === 'high').length;
  const mediumIssues = validation.issues.filter(i => i.severity === 'medium').length;

  if (highIssues > 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {highIssues} problemen
      </Badge>
    );
  }

  if (mediumIssues > 0) {
    return (
      <Badge className="bg-amber-100 text-amber-700 text-xs">
        <Info className="h-3 w-3 mr-1" />
        {mediumIssues} tips
      </Badge>
    );
  }

  return (
    <Badge className="bg-green-100 text-green-700 text-xs">
      <CheckCircle className="h-3 w-3 mr-1" />
      {validation.languageLevel}
    </Badge>
  );
}

// Validation feedback component
function ValidationFeedback({ validation }: { validation: ContentValidationResult }) {
  if (validation.issues.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Uitstekend! Tekst voldoet aan B1-niveau
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Leesbaarheidscore: {Math.round(validation.readabilityScore)}/100
          </p>
        </CardContent>
      </Card>
    );
  }

  const highIssues = validation.issues.filter(i => i.severity === 'high');
  const mediumIssues = validation.issues.filter(i => i.severity === 'medium');

  return (
    <Card className={`${highIssues.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
      <CardContent className="p-3">
        <div className={`flex items-center gap-2 ${highIssues.length > 0 ? 'text-red-700' : 'text-amber-700'}`}>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {highIssues.length > 0 ? 'Verbeterpunten gevonden' : 'Aandachtspunten'}
          </span>
        </div>

        <div className="mt-2 space-y-2">
          {[...highIssues, ...mediumIssues].slice(0, 3).map((issue, index) => (
            <div key={index} className="text-sm">
              <span className={`font-medium ${issue.severity === 'high' ? 'text-red-700' : 'text-amber-700'}`}>
                {issue.type === 'language_complexity' ? 'Taal' :
                 issue.type === 'medical_jargon' ? 'Jargon' :
                 issue.type === 'length' ? 'Lengte' : 'Overig'}:
              </span>
              <span className={`ml-2 ${issue.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`}>
                {issue.message}
              </span>
            </div>
          ))}
        </div>

        {validation.suggestions.length > 0 && (
          <div className="mt-3 pt-2 border-t border-current/20">
            <p className={`text-xs ${highIssues.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>
              <strong>Tip:</strong> {validation.suggestions[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Writing suggestions component
function WritingSuggestions({
  suggestions,
  onApplySuggestion
}: {
  suggestions: string[];
  onApplySuggestion: (suggestion: string) => void;
}) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-blue-700 mb-2">
          <Lightbulb className="h-4 w-4" />
          <span className="text-sm font-medium">Schrijfsuggesties</span>
        </div>

        <div className="space-y-2">
          {suggestions.slice(0, 2).map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <p className="text-sm text-blue-700">{suggestion}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onApplySuggestion(suggestion)}
                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                Toevoegen
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Utility functions
function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

async function validateContent(
  content: string,
  sectionType: EduPackSectionType
): Promise<ContentValidationResult> {
  try {
    const response = await fetch('/api/edu-pack/validate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        sectionType,
        language: 'nl'
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        return result.validation;
      }
    }
  } catch (error) {
    console.error('Validation failed:', error);
  }

  // Fallback validation
  const wordCount = countWords(content);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);

  return {
    isValid: wordCount > 0 && avgWordsPerSentence <= 20,
    languageLevel: avgWordsPerSentence > 20 ? 'B2' : 'B1',
    readabilityScore: Math.max(0, 100 - avgWordsPerSentence * 2),
    issues: avgWordsPerSentence > 20 ? [{
      type: 'language_complexity',
      message: 'Gemiddelde zinslengte is te hoog voor B1-niveau',
      severity: 'medium'
    }] : [],
    suggestions: ['Gebruik kortere zinnen voor betere leesbaarheid']
  };
}