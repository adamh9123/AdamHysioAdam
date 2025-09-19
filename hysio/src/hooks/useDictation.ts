// Speech Recognition Hook for EduPack Module
// Provides voice dictation functionality with Dutch language support

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface DictationOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface DictationState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

export function useDictation(options: DictationOptions = {}) {
  const {
    language = 'nl-NL',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1
  } = options;

  const [state, setState] = useState<DictationState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    confidence: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(prev => ({
      ...prev,
      isSupported: !!SpeechRecognition
    }));
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null
      }));
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript,
        confidence
      }));

      // Reset timeout for continuous mode
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Auto-stop after 30 seconds of silence
      timeoutRef.current = setTimeout(() => {
        stop();
      }, 30000);
    };

    recognition.onerror = (event) => {
      const errorMessages = {
        'no-speech': 'Geen spraak gedetecteerd. Probeer opnieuw.',
        'audio-capture': 'Microfoon kon niet worden geopend.',
        'not-allowed': 'Microfoon toegang geweigerd.',
        'network': 'Netwerkfout. Controleer uw internetverbinding.',
        'language-not-supported': 'Taal wordt niet ondersteund.',
        'service-not-allowed': 'Spraakherkenning service niet beschikbaar.'
      };

      setState(prev => ({
        ...prev,
        isListening: false,
        error: errorMessages[event.error as keyof typeof errorMessages] || `Spraakherkenning fout: ${event.error}`
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        interimTranscript: ''
      }));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [language, continuous, interimResults, maxAlternatives]);

  // Start dictation
  const start = useCallback(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Spraakherkenning wordt niet ondersteund in deze browser'
      }));
      return;
    }

    const recognition = initializeRecognition();
    if (!recognition) return;

    try {
      recognition.start();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Kon spraakherkenning niet starten'
      }));
    }
  }, [state.isSupported, initializeRecognition]);

  // Stop dictation
  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Clear transcript
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: null,
      confidence: 0
    }));
  }, []);

  // Toggle dictation
  const toggle = useCallback(() => {
    if (state.isListening) {
      stop();
    } else {
      start();
    }
  }, [state.isListening, start, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    start,
    stop,
    reset,
    toggle,
    fullTranscript: state.transcript + state.interimTranscript
  };
}

// Type declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}