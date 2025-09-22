import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChatInterface } from './chat-interface';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { AssistantIntegrationProps } from '@/lib/types/assistant';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MessageCircle, Bot } from 'lucide-react';

const AssistantIntegration: React.FC<AssistantIntegrationProps> = ({
  isCollapsed = false,
  onToggle,
  className
}) => {
  const [localCollapsed, setLocalCollapsed] = React.useState(isCollapsed);
  const {
    currentConversation,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    startNewConversation,
    clearError,
  } = useAssistantChat({ autoLoadConversations: false });

  const collapsed = onToggle ? isCollapsed : localCollapsed;
  const handleToggle = onToggle || (() => setLocalCollapsed(!localCollapsed));

  const messages = currentConversation?.messages || [];

  const handleSendMessage = async (message: string) => {
    if (error) clearError();
    
    // Start conversation if none exists
    if (!currentConversation) {
      await startNewConversation();
    }
    
    sendMessage(message);
  };

  React.useEffect(() => {
    setLocalCollapsed(isCollapsed);
  }, [isCollapsed]);

  return (
    <div className={cn(
      'border border-hysio-mint/30 rounded-2xl bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden transition-all duration-300',
      collapsed ? 'h-auto' : 'h-96',
      className
    )}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between p-4 bg-gradient-to-r from-hysio-mint/10 to-hysio-mint/5',
          'border-b border-hysio-mint/30 cursor-pointer hover:from-hysio-mint/20 hover:to-hysio-mint/10 transition-all duration-200'
        )}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-hysio-mint-dark to-hysio-emerald rounded-xl flex items-center justify-center shadow-md">
            <Bot size={18} className="text-white" />
          </div>
          
          <div>
            <h3 className="font-bold text-hysio-deep-green text-sm tracking-tight">
              Hysio Assistant
            </h3>
            <p className="text-xs text-hysio-deep-green-900/60">
              {collapsed 
                ? 'Klik om uit te klappen' 
                : messages.length > 0 
                  ? `${messages.length} ${messages.length === 1 ? 'bericht' : 'berichten'}`
                  : 'AI co-piloot voor fysiotherapie'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicators */}
          {(isLoading || isStreaming) && (
            <div className="w-3 h-3 bg-hysio-mint-dark rounded-full animate-pulse shadow-sm" />
          )}
          
          {error && (
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm" />
          )}
          
          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 hover:bg-hysio-mint/20 rounded-lg transition-colors duration-200"
          >
            {collapsed ? (
              <ChevronDown size={16} className="text-hysio-deep-green" />
            ) : (
              <ChevronUp size={16} className="text-hysio-deep-green" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        'transition-all duration-300 overflow-hidden',
        collapsed ? 'max-h-0' : 'max-h-96'
      )}>
        {collapsed ? null : (
          <div className="h-80">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isStreaming={isStreaming}
              error={error}
              className="h-full"
            />
          </div>
        )}
      </div>

      {/* Collapsed State Preview */}
      {collapsed && messages.length > 0 && (
        <div className="p-4 border-t border-hysio-mint/20 bg-hysio-mint/5">
          <div className="flex items-center gap-2 text-xs text-hysio-deep-green-900/70">
            <MessageCircle size={14} className="text-hysio-mint-dark" />
            <span className="font-medium">
              Laatste: {messages[messages.length - 1].role === 'user' ? 'Jij' : 'Assistant'}
            </span>
            <span className="truncate max-w-40 text-hysio-deep-green-900/60">
              {messages[messages.length - 1].content.substring(0, 35)}
              {messages[messages.length - 1].content.length > 35 ? '...' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Footer Disclaimer (when expanded) */}
      {!collapsed && (
        <div className="px-4 py-3 bg-gradient-to-r from-hysio-mint/5 to-hysio-mint/10 border-t border-hysio-mint/20">
          <p className="text-xs text-hysio-deep-green-900/60 text-center font-medium">
            <strong>⚠️ Let op:</strong> Dit is gescheiden van je medische verslaglegging
          </p>
        </div>
      )}
    </div>
  );
};

export { AssistantIntegration };