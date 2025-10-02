// Hysio Assistant v7.0 - Enterprise-level AI chat assistant for physiotherapy

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  Minimize2,
  Maximize2,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import type { PatientInfo } from '@/types/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

interface HysioAssistantProps {
  patientInfo?: PatientInfo;
  workflowType: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
  workflowStep?: 'anamnese' | 'onderzoek' | 'klinische-conclusie' | 'consult' | 'intake';
  currentContext?: string | any;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

/**
 * Quick start questions - prominent, clickable questions for immediate use
 */
const QUICK_START_QUESTIONS = [
  "Wat zijn de rode vlaggen bij lage rugpijn?",
  "Geef mij de professionele richtlijn voor schouderklachten",
  "Help mij bij differentiaaldiagnose kniepijn"
] as const;

export const HysioAssistant: React.FC<HysioAssistantProps> = React.memo(({
  patientInfo,
  workflowType,
  workflowStep,
  currentContext,
  onSuggestionSelect,
  className,
  minimized = false,
  onToggleMinimize,
  onClose
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [streamingMessageId, setStreamingMessageId] = React.useState<string | null>(null);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Initialize with welcome message
  React.useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Welkom bij Hysio Assistant v7.0! Ik ben jouw Hysio copiloot en klinisch sparringpartner.\n\nIk help je met evidence-based fysiotherapeutische vragen. ${patientInfo ? `We werken aan ${getWorkflowDisplayName(workflowType, workflowStep)} voor patiënt ${patientInfo.initials}.` : ''}\n\nKies een snelstartvraag hieronder of stel je eigen vraag.`,
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Send message to AI API with streaming
  const sendMessage = React.useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    // Create user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now()
    };

    // Add user message to state
    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');
    setIsLoading(true);

    // Create placeholder for assistant response
    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    setMessages(prev => [...prev, assistantMsg]);
    setStreamingMessageId(assistantMsgId);

    try {
      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Call streaming API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
            .filter(m => m.id !== 'welcome')
            .map(m => ({ role: m.role, content: m.content }))
        }),
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
          try {
            const jsonStr = line.replace(/^data:\s*/, '');
            const data = JSON.parse(jsonStr);

            if (data.chunk) {
              // Accumulate streaming chunks
              accumulatedContent += data.chunk;
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: accumulatedContent, isStreaming: true }
                  : m
              ));
            } else if (data.complete) {
              // Stream complete
              const finalContent = data.content || accumulatedContent;
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId
                  ? { ...m, content: finalContent, isStreaming: false }
                  : m
              ));
              setStreamingMessageId(null);
            } else if (data.error) {
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('Error parsing stream data:', parseError);
          }
        }
      }

    } catch (error: any) {
      console.error('Chat error:', error);

      if (error.name === 'AbortError') {
        // Request was aborted, remove incomplete message
        setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
      } else {
        // Show error message
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: 'Sorry, er is een fout opgetreden. Probeer het opnieuw of neem contact op met support.',
                isStreaming: false
              }
            : m
        ));
      }
      setStreamingMessageId(null);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, isLoading, workflowType, workflowStep]);

  const handleSendMessage = React.useCallback(() => {
    if (currentMessage.trim() && !isLoading) {
      sendMessage(currentMessage);
    }
  }, [currentMessage, isLoading, sendMessage]);

  const handleQuickQuestion = React.useCallback((question: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(question);
    } else {
      setCurrentMessage(question);
      sendMessage(question);
    }
  }, [onSuggestionSelect, sendMessage]);

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Minimized state
  if (minimized) {
    return (
      <Card className={cn("w-80 shadow-xl border-hysio-mint/40 bg-white", className)}>
        <CardHeader className="pb-3 cursor-pointer hover:bg-hysio-mint/5 transition-colors" onClick={onToggleMinimize}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-hysio-mint to-hysio-deep-green/20 rounded-full flex items-center justify-center shadow-sm">
                <Bot size={18} className="text-hysio-deep-green" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-hysio-deep-green">Hysio Assistant v7.0</CardTitle>
                <p className="text-xs text-hysio-deep-green-900/60">Hysio Sparringpartner</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleMinimize?.(); }}>
                <Maximize2 size={14} className="text-hysio-deep-green" />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                  <X size={14} className="text-hysio-deep-green-900/60" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Full state
  return (
    <Card className={cn("w-full max-w-2xl h-[700px] shadow-2xl border-hysio-mint/40 flex flex-col bg-white", className)}>
      {/* Header */}
      <CardHeader className="pb-4 flex-shrink-0 border-b border-hysio-mint/20 bg-gradient-to-r from-white to-hysio-mint/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-hysio-mint to-hysio-deep-green/20 rounded-full flex items-center justify-center shadow-md">
              <Bot size={22} className="text-hysio-deep-green" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-hysio-deep-green">
                Hysio Assistant v7.0
              </CardTitle>
              <p className="text-xs text-hysio-deep-green-900/70 font-medium">
                Hysio Copiloot & Klinisch Sparringpartner • {getWorkflowDisplayName(workflowType, workflowStep)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="hover:bg-hysio-mint/20"
              >
                <Minimize2 size={16} className="text-hysio-deep-green" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-red-50"
              >
                <X size={16} className="text-hysio-deep-green-900/60 hover:text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-6 pt-4 overflow-hidden">
        {/* Quick Start Questions - Prominent placement */}
        {messages.length <= 1 && (
          <div className="mb-4 p-4 bg-gradient-to-br from-hysio-mint/10 to-hysio-mint/5 rounded-xl border border-hysio-mint/30">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-hysio-deep-green" />
              <h3 className="text-sm font-semibold text-hysio-deep-green">Snelstart Vragen</h3>
            </div>
            <div className="space-y-2">
              {QUICK_START_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  disabled={isLoading}
                  className="w-full text-left px-4 py-3 rounded-lg bg-white hover:bg-hysio-mint/10 border border-hysio-mint/20 hover:border-hysio-mint/40 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <p className="text-sm text-hysio-deep-green-900 font-medium">{question}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages - NO AUTO-SCROLL */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={cn(
                  "flex items-start gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-hysio-mint to-hysio-deep-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot size={14} className="text-hysio-deep-green" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-xl px-4 py-3 shadow-sm",
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-hysio-deep-green to-hysio-deep-green/90 text-white ml-auto'
                      : 'bg-gradient-to-br from-gray-50 to-white text-hysio-deep-green-900 border border-gray-200'
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.isStreaming && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-hysio-mint rounded-full"></div>
                          <div className="w-2 h-2 bg-hysio-mint rounded-full animation-delay-200"></div>
                          <div className="w-2 h-2 bg-hysio-mint rounded-full animation-delay-400"></div>
                        </div>
                      </div>
                    )}
                    <p className={cn(
                      "text-xs mt-2 opacity-70",
                      message.role === 'user' ? 'text-white' : 'text-hysio-deep-green-900'
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-hysio-deep-green/20 to-hysio-deep-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User size={14} className="text-hysio-deep-green" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && !streamingMessageId && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-hysio-mint to-hysio-deep-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot size={14} className="text-hysio-deep-green" />
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl px-4 py-3 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-hysio-deep-green-900">
                    <div className="animate-spin">
                      <Sparkles size={16} className="text-hysio-mint" />
                    </div>
                    <span>Hysio Assistant denkt na...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Permanent Disclaimer - Always visible */}
        <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200/60 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-900/80 leading-relaxed">
            <strong>Let op:</strong> De Hysio Assistant is een hulpmiddel en kan fouten maken. Verifieer informatie altijd en gebruik uw professionele oordeel.
            <a
              href="/algemene-voorwaarden"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-700 ml-1 font-medium"
            >
              Algemene voorwaarden
            </a>
          </p>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Stel je fysiotherapeutische vraag..."
            disabled={isLoading}
            className="text-sm border-hysio-mint/40 focus:border-hysio-deep-green focus:ring-hysio-deep-green/20 shadow-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            size="sm"
            className="bg-gradient-to-r from-hysio-deep-green to-hysio-deep-green/90 hover:from-hysio-deep-green/90 hover:to-hysio-deep-green text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

HysioAssistant.displayName = 'HysioAssistant';

// Helper functions
function getWorkflowDisplayName(workflowType: string, workflowStep?: string): string {
  const names: Record<string, string> = {
    'intake-automatisch': 'Automatische Intake',
    'intake-stapsgewijs': 'Stapsgewijze Intake',
    'consult': 'Follow-up Consult'
  };

  let base = names[workflowType] || workflowType;

  if (workflowStep) {
    const steps: Record<string, string> = {
      'anamnese': 'Anamnese',
      'onderzoek': 'Onderzoek',
      'klinische-conclusie': 'Klinische Conclusie',
      'consult': 'Consult',
      'intake': 'Intake'
    };
    base += ` / ${steps[workflowStep] || workflowStep}`;
  }

  return base;
}

export default HysioAssistant;
