// Dictation-enabled Textarea Component
// Textarea with integrated voice dictation functionality

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Mic,
  MicOff,
  Square,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useDictation } from '@/hooks/useDictation';

export interface DictationTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  dictationLanguage?: string;
  showDictationControls?: boolean;
  className?: string;
}

export function DictationTextarea({
  value = '',
  onChange,
  maxLength = 5000,
  dictationLanguage = 'nl-NL',
  showDictationControls = true,
  className,
  placeholder,
  disabled,
  ...textareaProps
}: DictationTextareaProps) {
  const [cursorPosition, setCursorPosition] = useState(0);
  const [lastDictationLength, setLastDictationLength] = useState(0);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    confidence,
    start,
    stop,
    reset: resetDictation,
    toggle
  } = useDictation({
    language: dictationLanguage,
    continuous: true,
    interimResults: true
  });

  // Handle value changes from parent
  const handleChange = useCallback((newValue: string) => {
    onChange?.(newValue);
  }, [onChange]);

  // Handle textarea input
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);
    handleChange(e.target.value);
  }, [handleChange]);

  // Insert dictated text at cursor position
  useEffect(() => {
    if (transcript && transcript.length > lastDictationLength) {
      const newText = transcript.slice(lastDictationLength);
      const beforeCursor = value.slice(0, cursorPosition);
      const afterCursor = value.slice(cursorPosition);
      const newValue = beforeCursor + (beforeCursor && !beforeCursor.endsWith(' ') ? ' ' : '') + newText + afterCursor;

      if (newValue.length <= maxLength) {
        handleChange(newValue);
        setCursorPosition(beforeCursor.length + newText.length + (beforeCursor && !beforeCursor.endsWith(' ') ? 1 : 0));
      }

      setLastDictationLength(transcript.length);
    }
  }, [transcript, lastDictationLength, value, cursorPosition, maxLength, handleChange]);

  // Reset dictation when starting new session
  const handleStartDictation = useCallback(() => {
    resetDictation();
    setLastDictationLength(0);
    start();
  }, [start, resetDictation]);

  // Clear all dictated content
  const handleClearDictation = useCallback(() => {
    resetDictation();
    setLastDictationLength(0);
  }, [resetDictation]);

  // Display text with interim results
  const displayValue = value + (interimTranscript ? (value && !value.endsWith(' ') ? ' ' : '') + interimTranscript : '');

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          {...textareaProps}
          value={displayValue}
          onChange={handleTextareaChange}
          onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-12',
            interimTranscript && 'bg-blue-50/50',
            className
          )}
          maxLength={maxLength}
        />

        {/* Dictation status indicator */}
        {showDictationControls && isSupported && (
          <div className="absolute top-2 right-2">
            {isListening ? (
              <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                <Mic className="w-3 h-3 mr-1 animate-pulse" />
                Luistert...
              </Badge>
            ) : transcript ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <Volume2 className="w-3 h-3 mr-1" />
                Opgenomen
              </Badge>
            ) : null}
          </div>
        )}
      </div>

      {/* Character count */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{displayValue.length}/{maxLength} tekens</span>
        {confidence > 0 && (
          <span className={cn(
            'font-medium',
            confidence > 0.8 ? 'text-green-600' : confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
          )}>
            Betrouwbaarheid: {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {/* Dictation controls */}
      {showDictationControls && (
        <div className="space-y-2">
          {isSupported ? (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                onClick={toggle}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4" />
                    Stop opnemen
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start dictatie
                  </>
                )}
              </Button>

              {transcript && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearDictation}
                  disabled={disabled || isListening}
                  className="text-gray-600"
                >
                  <VolumeX className="w-4 h-4 mr-1" />
                  Wis dictatie
                </Button>
              )}

              {isListening && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span>Spreek duidelijk in de microfoon...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MicOff className="w-4 h-4" />
              <span>Spraakherkenning niet ondersteund in deze browser</span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Interim results preview */}
          {interimTranscript && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Voorlopig: </span>
                <span className="italic">{interimTranscript}</span>
              </p>
            </div>
          )}

          {/* Help text */}
          {!isListening && !error && isSupported && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>💡 <strong>Tips voor betere herkenning:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-0.5">
                <li>Spreek duidelijk en in een normaal tempo</li>
                <li>Vermijd achtergrondgeluid</li>
                <li>Gebruik interpunctie door "komma", "punt", "nieuwe regel" te zeggen</li>
                <li>De opname stopt automatisch na 30 seconden stilte</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}