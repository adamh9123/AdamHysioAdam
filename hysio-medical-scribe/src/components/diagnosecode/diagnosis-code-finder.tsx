'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
  Search,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Lightbulb,
  Clock,
  Brain
} from 'lucide-react';

// Types
interface CodeSuggestion {
  code: string;
  name: string;
  rationale: string;
  confidence: number;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'query' | 'clarification' | 'response';
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
  // State management
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [needsClarification, setNeedsClarification] = useState(false);
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!query.trim() || isLoading) return;

    const currentQuery = query.trim();
    setIsLoading(true);
    setError(null);

    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentQuery,
      timestamp: new Date(),
      type: needsClarification ? 'response' : 'query'
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Determine API endpoint
      const endpoint = needsClarification ? '/api/diagnosecode/clarify' : '/api/diagnosecode/find';

      // Prepare request body
      const requestBody = needsClarification
        ? { conversationId, response: currentQuery }
        : { query: currentQuery, conversationId };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

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
        setClarifyingQuestion(data.clarifyingQuestion);
        setSuggestions([]);

        // Add assistant clarification message
        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.clarifyingQuestion,
          timestamp: new Date(),
          type: 'clarification'
        };

        setMessages(prev => [...prev, assistantMessage]);

      } else {
        // Handle suggestions received
        setNeedsClarification(false);
        setClarifyingQuestion(null);
        setSuggestions(data.suggestions || []);

        // Add assistant response message
        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Ik heb ${data.suggestions?.length || 0} DCSPH code suggesties gevonden.`,
          timestamp: new Date(),
          type: 'response'
        };

        setMessages(prev => [...prev, assistantMessage]);
      }

      // Clear input
      setQuery('');

    } catch (error) {
      console.error('Error finding diagnosis codes:', error);
      setError(error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden');

      // Add error message
      const errorMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Er is een onbekende fout opgetreden',
        timestamp: new Date(),
        type: 'response'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [query, isLoading, needsClarification, conversationId]);

  // Handle code copy
  const handleCopyCode = useCallback(async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, []);

  // Handle code selection
  const handleCodeSelection = useCallback((suggestion: CodeSuggestion) => {
    onCodeSelected?.(suggestion);
    handleCopyCode(suggestion.code);
  }, [onCodeSelected, handleCopyCode]);

  // Clear conversation
  const handleClearConversation = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setNeedsClarification(false);
    setClarifyingQuestion(null);
    setConversationId(null);
    setError(null);
    setQuery('');
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && textareaRef.current) {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <Card className={`bg-white shadow-lg border-hysio-mint/20 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-hysio-deep-green">
          <Brain className="h-5 w-5" />
          DCSPH Code Finder
          {embedded && <Badge variant="outline" className="ml-2">Geïntegreerd</Badge>}
        </CardTitle>
        <CardDescription>
          Beschrijf de klacht in natuurlijke taal en ontvang accurate DCSPH diagnose codes
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Conversation History */}
          {messages.length > 0 && (
            <Card className="bg-gray-50">
              <CardContent className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-hysio-deep-green text-white ml-12'
                            : 'bg-white border border-gray-200 mr-12'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <div className="flex-shrink-0">
                              {message.type === 'clarification' ? (
                                <MessageCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                              ) : (
                                <Brain className="h-4 w-4 text-hysio-mint-dark mt-0.5" />
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className={`text-sm ${
                              message.role === 'user' ? 'text-white' : 'text-gray-700'
                            }`}>
                              {message.content}
                            </p>
                            <div className={`text-xs mt-1 ${
                              message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>
          )}

          {/* Code Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-hysio-deep-green">DCSPH Code Suggesties</h3>
              </div>

              <div className="grid gap-3">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={suggestion.code}
                    className="border-l-4 border-l-hysio-mint hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCodeSelection(suggestion)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-lg font-bold text-hysio-deep-green bg-hysio-mint/10 px-2 py-1 rounded">
                              {suggestion.code}
                            </code>
                            <Badge
                              variant="outline"
                              className={`${
                                suggestion.confidence > 0.8
                                  ? 'border-green-200 text-green-700'
                                  : suggestion.confidence > 0.6
                                  ? 'border-yellow-200 text-yellow-700'
                                  : 'border-gray-200 text-gray-700'
                              }`}
                            >
                              {Math.round(suggestion.confidence * 100)}% match
                            </Badge>
                          </div>

                          <h4 className="font-semibold text-gray-800 mb-2">
                            {suggestion.name}
                          </h4>

                          <p className="text-sm text-gray-600 leading-relaxed">
                            {suggestion.rationale}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyCode(suggestion.code);
                          }}
                          className="flex-shrink-0"
                        >
                          {copiedCode === suggestion.code ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Er is een fout opgetreden</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  needsClarification
                    ? "Geef meer details..."
                    : "Beschrijf de klacht (bijv. 'pijn in de knie bij traplopen na overbelasting')"
                }
                rows={3}
                className="resize-none pr-12"
                disabled={isLoading}
              />

              {needsClarification && (
                <div className="absolute top-2 right-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearConversation}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Nieuwe zoekopdracht
                  </Button>
                )}

                {conversationId && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Actieve conversatie
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500 hidden sm:block">
                  Cmd/Ctrl + Enter om te zoeken
                </div>

                <Button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className="bg-hysio-deep-green hover:bg-hysio-deep-green-900"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Verwerken...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      {needsClarification ? 'Antwoorden' : 'Vind Code'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Tips */}
          {messages.length === 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-700 font-medium mb-1">Tips voor betere resultaten:</p>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• Beschrijf de locatie (bijv. knie, onderrug, schouder)</li>
                      <li>• Vermeld het type klacht (pijn, zwelling, stijfheid)</li>
                      <li>• Geef context aan (trauma, overbelasting, geleidelijk ontstaan)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}