// Custom hook for diagnosis code finder functionality

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  CodeSuggestion,
  ConversationMessage,
  DiagnosisRequest,
  DiagnosisResponse,
  DiagnosisStats
} from '@/lib/types/diagnosecode';

interface UseDiagnosisCodeFinderOptions {
  initialQuery?: string;
  autoFocus?: boolean;
  onCodeSelected?: (code: CodeSuggestion) => void;
  onError?: (error: any) => void;
}

interface UseDiagnosisCodeFinderReturn {
  // State
  query: string;
  isLoading: boolean;
  suggestions: CodeSuggestion[];
  messages: ConversationMessage[];
  needsClarification: boolean;
  clarifyingQuestion: string | null;
  conversationId: string | null;
  error: string | null;
  stats: DiagnosisStats | null;

  // Actions
  setQuery: (query: string) => void;
  submitQuery: () => Promise<void>;
  clearConversation: () => void;
  selectCode: (suggestion: CodeSuggestion) => void;
  copyCode: (code: string) => Promise<boolean>;
  retryLastQuery: () => Promise<void>;

  // Utilities
  canSubmit: boolean;
  hasActiveConversation: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function useDiagnosisCodeFinder({
  initialQuery = '',
  autoFocus = false,
  onCodeSelected,
  onError
}: UseDiagnosisCodeFinderOptions = {}): UseDiagnosisCodeFinderReturn {
  // Core state
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DiagnosisStats | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Computed values
  const canSubmit = query.trim().length >= 3 && !isLoading;
  const hasActiveConversation = messages.length > 0 || conversationId !== null;

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus) {
      // Focus would be handled by the component using this hook
    }
  }, [autoFocus]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Add user message to conversation
  const addUserMessage = useCallback((content: string) => {
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      type: needsClarification ? 'response' : 'query'
    };

    setMessages(prev => [...prev, userMessage]);
    return userMessage;
  }, [needsClarification]);

  // Add assistant message to conversation
  const addAssistantMessage = useCallback((
    content: string,
    type: ConversationMessage['type'] = 'response',
    metadata?: ConversationMessage['metadata']
  ) => {
    const assistantMessage: ConversationMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      type,
      metadata
    };

    setMessages(prev => [...prev, assistantMessage]);
    return assistantMessage;
  }, []);

  // Submit query to API
  const submitQuery = useCallback(async () => {
    if (!canSubmit) return;

    const currentQuery = query.trim();
    setIsLoading(true);
    setError(null);
    setLastQuery(currentQuery);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Add user message
      addUserMessage(currentQuery);

      // Prepare request
      const endpoint = needsClarification ? '/api/diagnosecode/clarify' : '/api/diagnosecode/find';
      const requestBody: DiagnosisRequest = needsClarification
        ? { query: currentQuery, conversationId: conversationId || undefined }
        : { query: currentQuery, conversationId: conversationId || undefined };

      const startTime = Date.now();

      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      const data: DiagnosisResponse = await response.json();
      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(data.error?.message || 'Er is een fout opgetreden bij het verwerken van uw verzoek');
      }

      // Update conversation ID
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.needsClarification) {
        // Handle clarification needed
        setNeedsClarification(true);
        setClarifyingQuestion(data.clarifyingQuestion || null);
        setSuggestions([]);

        addAssistantMessage(
          data.clarifyingQuestion || 'Kunt u meer details geven?',
          'clarification'
        );
      } else {
        // Handle suggestions received
        setNeedsClarification(false);
        setClarifyingQuestion(null);
        setSuggestions(data.suggestions || []);

        addAssistantMessage(
          `Ik heb ${data.suggestions?.length || 0} DCSPH code suggesties gevonden.`,
          'response',
          {
            processingTime,
            confidence: data.suggestions?.length > 0 ?
              data.suggestions[0].confidence : undefined
          }
        );

        // Update stats if we got suggestions
        if (data.suggestions && data.suggestions.length > 0) {
          setStats(prev => ({
            totalQueries: (prev?.totalQueries || 0) + 1,
            avgResponseTime: processingTime / 1000,
            accuracyRate: prev?.accuracyRate || 95,
            timeSaved: (prev?.timeSaved || 0) + 2.5
          }));
        }
      }

      // Clear query input
      setQuery('');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }

      console.error('Error finding diagnosis codes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden';

      setError(errorMessage);
      addAssistantMessage(errorMessage, 'error');
      onError?.(error);

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [query, canSubmit, needsClarification, conversationId, addUserMessage, addAssistantMessage, onError]);

  // Retry last query
  const retryLastQuery = useCallback(async () => {
    if (lastQuery) {
      setQuery(lastQuery);
      await submitQuery();
    }
  }, [lastQuery, submitQuery]);

  // Clear conversation and reset state
  const clearConversation = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages([]);
    setSuggestions([]);
    setNeedsClarification(false);
    setClarifyingQuestion(null);
    setConversationId(null);
    setError(null);
    setQuery('');
    setIsLoading(false);
  }, []);

  // Select a code suggestion
  const selectCode = useCallback((suggestion: CodeSuggestion) => {
    onCodeSelected?.(suggestion);

    // Add confirmation message
    addAssistantMessage(
      `Code ${suggestion.code} geselecteerd: ${suggestion.name}`,
      'success',
      { confidence: suggestion.confidence }
    );
  }, [onCodeSelected, addAssistantMessage]);

  // Copy code to clipboard
  const copyCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(code);

      // Add success message
      addAssistantMessage(
        `Code ${code} gekopieerd naar klembord`,
        'success'
      );

      return true;
    } catch (error) {
      console.error('Failed to copy code:', error);

      // Add error message
      addAssistantMessage(
        `Kon code ${code} niet kopiëren naar klembord`,
        'error'
      );

      return false;
    }
  }, [addAssistantMessage]);

  return {
    // State
    query,
    isLoading,
    suggestions,
    messages,
    needsClarification,
    clarifyingQuestion,
    conversationId,
    error,
    stats,

    // Actions
    setQuery,
    submitQuery,
    clearConversation,
    selectCode,
    copyCode,
    retryLastQuery,

    // Utilities
    canSubmit,
    hasActiveConversation,
    messagesEndRef
  };
}

// Hook for integration with other components
interface UseCompactDiagnosisOptions {
  onCodeSelected?: (code: CodeSuggestion) => void;
  defaultCode?: CodeSuggestion | null;
}

export function useCompactDiagnosis({
  onCodeSelected,
  defaultCode = null
}: UseCompactDiagnosisOptions = {}) {
  const [selectedCode, setSelectedCode] = useState<CodeSuggestion | null>(defaultCode);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCodeSelected = useCallback((code: CodeSuggestion) => {
    setSelectedCode(code);
    onCodeSelected?.(code);
    setIsModalOpen(false);
  }, [onCodeSelected]);

  const clearCode = useCallback(() => {
    setSelectedCode(null);
  }, []);

  return {
    selectedCode,
    isModalOpen,
    openModal,
    closeModal,
    handleCodeSelected,
    clearCode
  };
}

// Hook for performance monitoring
export function useDiagnosisPerformance() {
  const [metrics, setMetrics] = useState({
    queryCount: 0,
    totalTime: 0,
    averageTime: 0,
    errorRate: 0,
    successfulQueries: 0
  });

  const recordQuery = useCallback((duration: number, success: boolean) => {
    setMetrics(prev => {
      const newQueryCount = prev.queryCount + 1;
      const newTotalTime = prev.totalTime + duration;
      const newSuccessfulQueries = prev.successfulQueries + (success ? 1 : 0);

      return {
        queryCount: newQueryCount,
        totalTime: newTotalTime,
        averageTime: newTotalTime / newQueryCount,
        errorRate: ((newQueryCount - newSuccessfulQueries) / newQueryCount) * 100,
        successfulQueries: newSuccessfulQueries
      };
    });
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      queryCount: 0,
      totalTime: 0,
      averageTime: 0,
      errorRate: 0,
      successfulQueries: 0
    });
  }, []);

  return {
    metrics,
    recordQuery,
    resetMetrics
  };
}