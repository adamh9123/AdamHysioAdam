import * as React from 'react';
import { cn } from '@/lib/utils';
import { MessageBubble } from './message-bubble';
import { AssistantMessage } from '@/lib/types/assistant';
import { EXAMPLE_QUESTIONS } from '@/lib/assistant/system-prompt';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

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
  
  // Auto-scroll to bottom when new messages arrive or during streaming
  const scrollToBottom = React.useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  }, []);

  // Scroll immediately when new messages arrive
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Scroll smoothly during streaming updates
  React.useEffect(() => {
    if (isStreaming) {
      const timer = setTimeout(() => scrollToBottom(false), 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isStreaming, scrollToBottom]);
  
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
              Welkom bij Hysio Assistant
            </h2>
            
            <p className="text-hysio-deep-green-900/80 mb-10 max-w-lg text-lg leading-relaxed">
              Uw AI co-piloot voor fysiotherapie. Krijg evidence-based inzichten voor
              klinisch redeneren, diagnoses en behandelprotocollen.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-4xl">
              {EXAMPLE_QUESTIONS.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleExampleQuestion(question)}
                  disabled={isLoading || isStreaming}
                  className={cn(
                    'text-left p-6 h-auto whitespace-normal justify-start group',
                    'hover:bg-hysio-mint/30 hover:border-hysio-mint-dark hover:shadow-lg transition-all duration-200',
                    'border-hysio-mint/40 bg-white/80 backdrop-blur-sm shadow-sm',
                    'hover:scale-105 transform'
                  )}
                >
                  <span className="text-sm font-medium text-hysio-deep-green group-hover:text-hysio-deep-green-900">{question}</span>
                </Button>
              ))}
            </div>
            
            <p className="text-sm text-hysio-deep-green-900/60 mt-10 font-medium">
              <strong>⚠️ Altijd nazien door een bevoegd fysiotherapeut.</strong>
            </p>
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