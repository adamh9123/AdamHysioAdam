/**
 * Voice Text Input Component
 *
 * Provides voice dictation functionality with Web Speech API.
 * Features a 5-minute countdown timer and real-time transcription.
 * Falls back to standard textarea if browser doesn't support speech recognition.
 *
 * @module components/pre-intake/VoiceTextInput
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { getTranslations } from '@/lib/pre-intake/translations';

interface VoiceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxDuration?: number; // in seconds, default 300 (5 minutes)
}

// Extend Window interface for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Recording states
type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export default function VoiceTextInput({
  value,
  onChange,
  placeholder = '',
  maxDuration = 300, // 5 minutes
}: VoiceTextInputProps) {
  const language = usePreIntakeStore((state) => state.language);
  const t = getTranslations(language);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0); // Track elapsed time instead
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string>('');
  const [interimText, setInterimText] = useState<string>(''); // Live interim results
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const finalizedTextRef = useRef<string>(''); // All finalized (permanent) text
  const lastFinalIndexRef = useRef<number>(0); // Track last processed final result

  // Map language codes to speech recognition locales
  const speechLangMap: Record<string, string> = {
    nl: 'nl-NL',
    en: 'en-US',
    ar: 'ar-SA',
  };

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsBrowserSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = speechLangMap[language] || 'nl-NL';

      recognitionRef.current.onresult = (event: any) => {
        // NEW STRATEGY: Process both interim AND final results
        let interim = '';
        let newFinalText = '';

        // Process all results
        for (let i = lastFinalIndexRef.current; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            // This is finalized speech - add permanently
            newFinalText += transcript + ' ';
            lastFinalIndexRef.current = i + 1; // Update last processed index
          } else {
            // This is interim speech - show live but don't save yet
            interim += transcript + ' ';
          }
        }

        // If we have new finalized text, add it permanently
        if (newFinalText) {
          finalizedTextRef.current = (finalizedTextRef.current + ' ' + newFinalText).trim();
        }

        // Update interim display
        setInterimText(interim.trim());

        // Combine finalized + interim for live display
        const displayText = finalizedTextRef.current
          ? (interim ? finalizedTextRef.current + ' ' + interim : finalizedTextRef.current)
          : interim;

        // Update the textarea LIVE with combined text
        onChange(displayText.trim());
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        // Handle specific error types
        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            setPermissionError(
              'Microfoon toegang geweigerd. Klik op het slot-icoon in uw browser adresbalk en sta microfoon toegang toe.'
            );
            break;
          case 'no-speech':
            setPermissionError('Geen spraak gedetecteerd. Probeer het opnieuw.');
            break;
          case 'audio-capture':
            setPermissionError('Geen microfoon gevonden. Controleer uw apparaat instellingen.');
            break;
          case 'network':
            setPermissionError(
              'Netwerkfout. Controleer uw internetverbinding en probeer opnieuw.'
            );
            break;
          default:
            setPermissionError(`Er is een fout opgetreden: ${event.error}`);
        }

        stopRecording();
      };

      recognitionRef.current.onend = () => {
        if (recordingState === 'recording') {
          // Restart if still supposed to be recording (handles auto-stop)
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Failed to restart recognition:', error);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = speechLangMap[language] || 'nl-NL';
    }
  }, [language]);

  // Sync finalizedTextRef when user manually edits the textarea
  // This ensures manual edits are preserved when recording resumes
  useEffect(() => {
    if (recordingState === 'idle' || recordingState === 'stopped') {
      // Only sync when NOT actively recording
      finalizedTextRef.current = value.trim();
    }
  }, [value, recordingState]);

  // Timer - counts UP when recording
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            // Auto-stop when max duration reached
            handleStop();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);
    } else if (recordingState === 'paused' || recordingState === 'stopped') {
      // Keep timer paused - don't reset
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (recordingState === 'idle') {
      // Only reset when truly idle
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimeElapsed(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recordingState, maxDuration]);

  const handleStart = () => {
    if (!recognitionRef.current) return;

    try {
      // Clear any previous errors
      setPermissionError('');

      // NEW STRATEGY: Initialize finalized text with current value
      // This ensures manually typed text is preserved
      finalizedTextRef.current = value.trim();

      // Reset interim text and tracking
      setInterimText('');
      lastFinalIndexRef.current = 0;

      recognitionRef.current.start();
      setRecordingState('recording');

      // Reset timer only when starting fresh (idle or stopped)
      if (recordingState === 'idle' || recordingState === 'stopped') {
        setTimeElapsed(0);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setPermissionError('Kon opname niet starten. Probeer de pagina te vernieuwen.');
    }
  };

  const handlePause = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // CRITICAL: Save current finalized text before pausing
    // Any interim text becomes part of finalized text
    if (interimText) {
      finalizedTextRef.current = (finalizedTextRef.current + ' ' + interimText).trim();
    }

    // Update the value to ensure persistence
    onChange(finalizedTextRef.current);

    // Clear interim text since we've finalized it
    setInterimText('');

    setRecordingState('paused');
  };

  const handleResume = () => {
    if (!recognitionRef.current) return;

    try {
      // CRITICAL: Reset the index tracker for new session
      // But keep finalizedTextRef intact - it has all previous text
      lastFinalIndexRef.current = 0;

      recognitionRef.current.start();
      setRecordingState('recording');
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // CRITICAL: Save current finalized text + any interim text
    if (interimText) {
      finalizedTextRef.current = (finalizedTextRef.current + ' ' + interimText).trim();
    }

    // Update the value to ensure persistence
    onChange(finalizedTextRef.current);

    // Clear interim text
    setInterimText('');

    setRecordingState('stopped');
  };

  const handleReset = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecordingState('idle');
    setTimeElapsed(0);
    onChange(''); // Clear the text
    finalizedTextRef.current = ''; // Reset finalized text
    setInterimText(''); // Clear interim text
    lastFinalIndexRef.current = 0; // Reset index tracker
  };

  // Legacy function for error handling
  const stopRecording = () => {
    handleStop();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fallback to standard textarea if browser doesn't support speech recognition
  if (!isBrowserSupported) {
    return (
      <div>
        <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">{t.voiceBrowserNotSupported}</p>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
        />
      </div>
    );
  }

  // Determine button action based on state
  const getButtonAction = () => {
    switch (recordingState) {
      case 'idle':
        return handleStart;
      case 'recording':
        return handlePause;
      case 'paused':
        return handleResume;
      case 'stopped':
        return handleStart; // Start new recording
      default:
        return handleStart;
    }
  };

  const getButtonLabel = () => {
    switch (recordingState) {
      case 'idle':
        return t.voiceClickToRecord || 'Klik om op te nemen';
      case 'recording':
        return 'Klik om te pauzeren';
      case 'paused':
        return 'Klik om te hervatten';
      case 'stopped':
        return 'Start nieuwe opname';
      default:
        return t.voiceClickToRecord || 'Klik om op te nemen';
    }
  };

  const getStatusText = () => {
    switch (recordingState) {
      case 'idle':
        return 'Begin met typen of klik op de microfoon om uw verhaal op te nemen';
      case 'recording':
        return 'Opname loopt... Klik op pauze om te stoppen';
      case 'paused':
        return 'Opname gepauzeerd. Klik op play om door te gaan';
      case 'stopped':
        return 'Opname voltooid. U kunt de tekst bewerken of een nieuwe opname starten';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {permissionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-900 mb-1">Fout bij opname</h4>
              <p className="text-sm text-red-800">{permissionError}</p>
            </div>
            <button
              type="button"
              onClick={() => setPermissionError('')}
              className="text-red-600 hover:text-red-800 flex-shrink-0"
              aria-label="Sluit foutmelding"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Instruction Text */}
      <div className="text-center mb-2">
        <p className="text-sm text-gray-600 italic">
          {getStatusText()}
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4">
        {/* Main Action Button (Start/Pause/Resume) */}
        <button
          type="button"
          onClick={getButtonAction()}
          className={`
            relative p-6 rounded-full transition-all duration-200 shadow-lg
            ${
              recordingState === 'recording'
                ? 'bg-orange-500 hover:bg-orange-600'
                : recordingState === 'paused'
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-green-500 hover:bg-green-600'
            }
          `}
          aria-label={getButtonLabel()}
        >
          {recordingState === 'recording' ? (
            // Pause icon
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
            </svg>
          ) : recordingState === 'paused' ? (
            // Resume/Play icon
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6 4l10 6-10 6V4z" />
            </svg>
          ) : (
            // Microphone icon (Start)
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Stop Button (only show when recording or paused) */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <button
            type="button"
            onClick={handleStop}
            className="p-6 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-lg"
            aria-label="Stop opname"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <rect x="5" y="5" width="10" height="10" rx="1" />
            </svg>
          </button>
        )}

        {/* Reset Button (only show when stopped) */}
        {recordingState === 'stopped' && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
            aria-label="Reset en wis alles"
          >
            Reset
          </button>
        )}

        {/* Timer Display */}
        {(recordingState === 'recording' || recordingState === 'paused' || recordingState === 'stopped') && (
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">
              {recordingState === 'paused' ? 'Gepauzeerd' : recordingState === 'stopped' ? 'Gestopt' : 'Opname loopt'}
            </span>
            <div className={`text-2xl font-bold ${recordingState === 'recording' ? 'text-orange-600' : 'text-gray-600'}`}>
              {formatTime(timeElapsed)} / {formatTime(maxDuration)}
            </div>
          </div>
        )}
      </div>

      {/* Text Display/Edit Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'Begin met typen of gebruik de microfoon...'}
          rows={8}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors resize-none
            ${recordingState === 'recording' ? 'border-orange-300 bg-orange-50' :
              recordingState === 'paused' ? 'border-blue-300 bg-blue-50' :
              'border-gray-300'}
            focus:ring-2 focus:ring-green-500 focus:border-transparent
          `}
        />
        {recordingState === 'recording' && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-orange-600 font-medium">● OPNAME ACTIEF</span>
          </div>
        )}
        {recordingState === 'paused' && (
          <div className="absolute top-2 right-2 flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">❚❚ GEPAUZEERD</span>
          </div>
        )}
      </div>

      {/* Character Count & Help Text */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>
          {recordingState === 'idle' && '💡 Tip: U kunt typen én dicteren combineren'}
          {recordingState === 'recording' && interimText && (
            <span className="text-orange-600 font-medium animate-pulse">
              ⚡ Live transcriptie actief...
            </span>
          )}
          {recordingState === 'recording' && !interimText && (
            <span className="text-orange-600">
              🎤 Luistert naar uw spraak...
            </span>
          )}
        </span>
        <span>{value.length} tekens</span>
      </div>

      {/* Debug info - alleen tijdens development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 font-mono p-2 bg-gray-50 rounded">
          <div>State: {recordingState}</div>
          <div>Finalized: {finalizedTextRef.current.substring(0, 50)}...</div>
          <div>Interim: {interimText.substring(0, 50)}...</div>
        </div>
      )}
    </div>
  );
}
