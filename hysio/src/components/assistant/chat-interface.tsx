import * as React from 'react';
import { cn } from '@/lib/utils';
import { MessageBubble } from './message-bubble';
import { AssistantMessage } from '@/lib/types/assistant';
import { EXAMPLE_QUESTIONS } from '@/lib/assistant/system-prompt';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, AlertCircle, Lightbulb } from 'lucide-react';

export interface ChatInterfaceProps {
  messages: AssistantMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  error?: string | null;
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  isStreaming = false,
  error,
  className
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // ✅ V7.0 IMPROVEMENT: NO AUTO-SCROLL - User has full control
  // Removed auto-scroll behavior to give users control over viewport
  
  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputValue.trim();
    if (message && !isLoading && !isStreaming) {
      onSendMessage(message);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleExampleQuestion = (question: string) => {
    if (!isLoading && !isStreaming) {
      onSendMessage(question);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={cn('flex flex-col h-full bg-gradient-to-br from-hysio-mint/10 to-hysio-mint/5', className)}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!hasMessages ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-hysio-mint to-hysio-mint-dark rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-inner">
                <span className="text-hysio-deep-green font-bold text-xl">H</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-hysio-deep-green mb-3 tracking-tight">
              Welkom bij Hysio Assistant v7.0
            </h2>

            <p className="text-hysio-deep-green-900/80 mb-3 max-w-lg text-lg leading-relaxed">
              Uw Hysio copiloot en klinisch sparringpartner voor fysiotherapie.
            </p>

            <p className="text-hysio-deep-green-900/70 mb-10 max-w-lg text-sm">
              Evidence-based practice • ICF-model • Biopsychosociale perspectief
            </p>

            {/* ✅ V7.0: Prominent Quick-Start Questions */}
            <div className="mb-8 max-w-3xl w-full">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <Lightbulb size={20} className="text-hysio-deep-green" />
                <h3 className="text-lg font-semibold text-hysio-deep-green">Snelstart Vragen</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {EXAMPLE_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestion(question)}
                    disabled={isLoading || isStreaming}
                    className={cn(
                      'w-full text-left px-5 py-4 rounded-xl transition-all duration-200',
                      'bg-white hover:bg-hysio-mint/10 border-2 border-hysio-mint/30 hover:border-hysio-mint/60',
                      'shadow-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
                      'hover:scale-[1.02] transform'
                    )}
                  >
                    <p className="text-sm text-hysio-deep-green-900 font-medium leading-relaxed">{question}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="text-sm">
                  <strong>Er is een fout opgetreden:</strong> {error}
                </p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-hysio-mint/30 bg-white/95 backdrop-blur-sm p-4 shadow-lg">
        {/* ✅ V7.0: Permanent Disclaimer - Always visible */}
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

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Stel je vraag aan Hysio Assistant..."
              disabled={isLoading || isStreaming}
              className={cn(
                'min-h-[48px] max-h-[120px] resize-none',
                'border-hysio-mint/40 focus:border-hysio-mint-dark focus:ring-hysio-mint/20',
                'bg-white shadow-sm rounded-xl'
              )}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isStreaming}
            className={cn(
              'bg-hysio-mint-dark hover:bg-hysio-emerald self-end shadow-lg',
              'min-w-[48px] h-[48px] p-0 rounded-xl hover:scale-105 transition-all duration-200'
            )}
          >
            {isLoading || isStreaming ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-hysio-deep-green-900/50">
            Druk Enter om te verzenden, Shift + Enter voor nieuwe regel
          </p>
          
          {(isLoading || isStreaming) && (
            <p className="text-xs text-hysio-mint-dark flex items-center gap-2 font-medium">
              <Loader2 size={14} className="animate-spin" />
              {isStreaming ? '✨ Assistant is aan het typen...' : '📤 Bericht wordt verstuurd...'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatInterface };