/**
 * Shared Workflow State Management Hook
 *
 * Consolidates common state patterns used across workflow components
 * to reduce duplication and improve maintainability.
 */

import { useState, useCallback } from 'react';
import type { AudioRecording, HHSBStructure, SOEPStructure } from '@/lib/types';

export type WorkflowPhase = 'preparation' | 'anamnesis' | 'examination' | 'conclusion' | 'complete';
export type ProcessingState = 'idle' | 'processing' | 'success' | 'error';

export interface WorkflowStateOptions {
  initialPhase?: WorkflowPhase;
  enableAudio?: boolean;
  enableManualInput?: boolean;
}

export interface WorkflowState {
  // Phase management
  currentPhase: WorkflowPhase;
  completedPhases: WorkflowPhase[];

  // Processing state
  isProcessing: boolean;
  processingStep: string;
  processingState: ProcessingState;

  // Audio recording
  recording: AudioRecording | null;
  transcription: string;

  // Manual input
  manualNotes: string;

  // Results
  hhsbStructure: HHSBStructure | null;
  soepStructure: SOEPStructure | null;

  // Document context
  documentContext: string;
  documentFilename: string;

  // Preparation
  preparationContent: string;
}

export interface WorkflowActions {
  // Phase management
  setCurrentPhase: (phase: WorkflowPhase) => void;
  completePhase: (phase: WorkflowPhase) => void;
  resetPhases: () => void;

  // Processing
  startProcessing: (step?: string) => void;
  stopProcessing: () => void;
  setProcessingStep: (step: string) => void;
  setProcessingState: (state: ProcessingState) => void;

  // Audio
  setRecording: (recording: AudioRecording | null) => void;
  setTranscription: (transcription: string) => void;
  clearAudio: () => void;

  // Manual input
  setManualNotes: (notes: string) => void;
  clearManualNotes: () => void;

  // Results
  setHHSBStructure: (structure: HHSBStructure | null) => void;
  setSOEPStructure: (structure: SOEPStructure | null) => void;
  clearResults: () => void;

  // Document
  setDocumentContext: (context: string, filename?: string) => void;
  clearDocument: () => void;

  // Preparation
  setPreparationContent: (content: string) => void;

  // Reset all
  resetAll: () => void;
}

export function useWorkflowState(
  options: WorkflowStateOptions = {}
): [WorkflowState, WorkflowActions] {
  const {
    initialPhase = 'preparation',
    enableAudio = true,
    enableManualInput = true,
  } = options;

  // Phase management
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>(initialPhase);
  const [completedPhases, setCompletedPhases] = useState<WorkflowPhase[]>([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');

  // Audio recording
  const [recording, setRecording] = useState<AudioRecording | null>(null);
  const [transcription, setTranscription] = useState('');

  // Manual input
  const [manualNotes, setManualNotes] = useState('');

  // Results
  const [hhsbStructure, setHHSBStructure] = useState<HHSBStructure | null>(null);
  const [soepStructure, setSOEPStructure] = useState<SOEPStructure | null>(null);

  // Document context
  const [documentContext, setDocumentContextState] = useState('');
  const [documentFilename, setDocumentFilename] = useState('');

  // Preparation
  const [preparationContent, setPreparationContent] = useState('');

  // Actions
  const completePhase = useCallback((phase: WorkflowPhase) => {
    setCompletedPhases(prev => [...new Set([...prev, phase])]);
  }, []);

  const resetPhases = useCallback(() => {
    setCurrentPhase(initialPhase);
    setCompletedPhases([]);
  }, [initialPhase]);

  const startProcessing = useCallback((step = 'Processing...') => {
    setIsProcessing(true);
    setProcessingStep(step);
    setProcessingState('processing');
  }, []);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    setProcessingStep('');
  }, []);

  const clearAudio = useCallback(() => {
    setRecording(null);
    setTranscription('');
  }, []);

  const clearManualNotes = useCallback(() => {
    setManualNotes('');
  }, []);

  const clearResults = useCallback(() => {
    setHHSBStructure(null);
    setSOEPStructure(null);
  }, []);

  const setDocumentContext = useCallback((context: string, filename = '') => {
    setDocumentContextState(context);
    setDocumentFilename(filename);
  }, []);

  const clearDocument = useCallback(() => {
    setDocumentContextState('');
    setDocumentFilename('');
  }, []);

  const resetAll = useCallback(() => {
    resetPhases();
    setIsProcessing(false);
    setProcessingStep('');
    setProcessingState('idle');
    clearAudio();
    clearManualNotes();
    clearResults();
    clearDocument();
    setPreparationContent('');
  }, [resetPhases, clearAudio, clearManualNotes, clearResults, clearDocument]);

  const state: WorkflowState = {
    currentPhase,
    completedPhases,
    isProcessing,
    processingStep,
    processingState,
    recording,
    transcription,
    manualNotes,
    hhsbStructure,
    soepStructure,
    documentContext,
    documentFilename,
    preparationContent,
  };

  const actions: WorkflowActions = {
    setCurrentPhase,
    completePhase,
    resetPhases,
    startProcessing,
    stopProcessing,
    setProcessingStep,
    setProcessingState,
    setRecording,
    setTranscription,
    clearAudio,
    setManualNotes,
    clearManualNotes,
    setHHSBStructure,
    setSOEPStructure,
    clearResults,
    setDocumentContext,
    clearDocument,
    setPreparationContent,
    resetAll,
  };

  return [state, actions];
}

// Helper hook for workflow navigation
export function useWorkflowNavigation() {
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>('preparation');
  const [history, setHistory] = useState<WorkflowPhase[]>(['preparation']);

  const goToPhase = useCallback((phase: WorkflowPhase) => {
    setCurrentPhase(phase);
    setHistory(prev => [...prev, phase]);
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentPhase(newHistory[newHistory.length - 1]);
    }
  }, [history]);

  const canGoBack = history.length > 1;

  return {
    currentPhase,
    history,
    goToPhase,
    goBack,
    canGoBack,
  };
}

// Helper hook for processing states
export function useProcessingState() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const start = useCallback((stepName: string) => {
    setIsProcessing(true);
    setStep(stepName);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    setIsProcessing(false);
    setStep('');
  }, []);

  const fail = useCallback((errorMessage: string) => {
    setIsProcessing(false);
    setError(errorMessage);
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setStep('');
    setError(null);
  }, []);

  return {
    isProcessing,
    step,
    error,
    start,
    stop,
    fail,
    reset,
  };
}