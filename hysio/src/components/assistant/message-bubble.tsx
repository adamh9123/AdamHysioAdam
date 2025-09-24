import * as React from 'react';
import { cn } from '@/lib/utils';
import { AssistantMessage } from '@/lib/types/assistant';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeHTML } from '@/lib/utils/sanitize';

export interface MessageBubbleProps {
  message: AssistantMessage;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, className }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatContent = (content: string) => {
    // Basic markdown-like formatting
    const formatted = content
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-2">')
      .replace(/\n/g, '<br>');

    // Sanitize the HTML to prevent XSS
    return sanitizeHTML(`<p class="mb-2">${formatted}</p>`);
  };

  return (
    <div className={cn(
      'flex gap-3 mb-4',
      isUser ? 'flex-row-reverse' : 'flex-row',
      className
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium shadow-md',
        isUser
          ? 'bg-gradient-to-br from-hysio-mint to-hysio-mint-dark text-hysio-deep-green'
          : 'bg-gradient-to-br from-hysio-deep-green to-hysio-deep-green-900 text-white'
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      {/* Message Content */}
      <div className={cn(
        'flex-1 max-w-[75%]',
        isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
      )}>
        <div className={cn(
          'rounded-2xl px-5 py-4 shadow-md relative group backdrop-blur-sm',
          isUser
            ? 'bg-gradient-to-br from-hysio-mint/90 to-hysio-mint/70 text-hysio-deep-green-900 rounded-tr-lg border border-hysio-mint-dark/30'
            : 'bg-white/95 border border-hysio-mint/20 text-hysio-deep-green-900 rounded-tl-lg shadow-lg',
          message.isStreaming && 'animate-pulse'
        )}>
          {/* Content */}
          <div className={cn(
            'prose prose-sm max-w-none leading-relaxed',
            isUser ? 'text-hysio-deep-green-900 font-medium' : 'text-hysio-deep-green-900'
          )}>
            {message.content ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(message.content) 
                }} 
              />
            ) : (
              message.isStreaming && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-hysio-mint-dark rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-hysio-mint-dark rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-hysio-mint-dark rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              )
            )}
          </div>
          
          {/* Copy Button */}
          {!message.isStreaming && message.content && (
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              className={cn(
                'absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200',
                'hover:bg-hysio-mint/20 rounded-lg backdrop-blur-sm'
              )}
            >
              {copied ? (
                <Check size={12} className="text-green-600" />
              ) : (
                <Copy size={12} />
              )}
            </Button>
          )}
        </div>
        
        {/* Clinical Disclaimer */}
        {message.requiresDisclaimer && (
          <div className="mt-3 text-xs text-hysio-deep-green-900/80 italic max-w-[75%] bg-hysio-mint/10 px-3 py-2 rounded-lg border-l-4 border-hysio-mint-dark">
            <strong>⚠️ Altijd nazien door een bevoegd fysiotherapeut.</strong>
          </div>
        )}
        
        {/* Timestamp */}
        <div className={cn(
          'text-xs text-hysio-deep-green-900/60 mt-2 font-medium',
          isUser ? 'text-right' : 'text-left'
        )}>
          {new Date(message.timestamp).toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export { MessageBubble };