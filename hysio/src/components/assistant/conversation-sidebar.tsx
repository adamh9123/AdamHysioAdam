import * as React from 'react';
import { cn } from '@/lib/utils';
import { Conversation } from '@/lib/types/assistant';
import { Button } from '@/components/ui/button';
import { Plus, MessageCircle, Trash2 } from 'lucide-react';

export interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onNewConversation: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  currentConversation,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  isLoading = false,
  className
}) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  
  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deletingId) return;
    
    setDeletingId(conversationId);
    try {
      await onDeleteConversation(conversationId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('nl-NL', {
        weekday: 'short'
      });
    } else {
      return date.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-gradient-to-b from-white to-hysio-mint/5 border-r border-hysio-mint/30 shadow-xl',
      className
    )}>
      {/* Header */}
      <div className="p-6 border-b border-hysio-mint/30 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-hysio-mint to-hysio-mint-dark rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-hysio-deep-green font-bold text-sm">H</span>
            </div>
          </div>
          <h1 className="font-bold text-hysio-deep-green text-lg tracking-tight">Assistant</h1>
        </div>
        
        <Button
          onClick={onNewConversation}
          disabled={isLoading}
          className="w-full gap-3 bg-gradient-to-r from-hysio-mint-dark to-hysio-emerald hover:from-hysio-emerald hover:to-hysio-mint-dark shadow-lg hover:shadow-xl transition-all duration-200 text-white font-semibold py-3 rounded-xl"
        >
          <Plus size={18} />
          Nieuw gesprek
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-hysio-deep-green-900/60">
            <div className="w-16 h-16 bg-hysio-mint/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <MessageCircle size={32} className="text-hysio-mint-dark" />
            </div>
            <p className="text-sm font-medium">Nog geen gesprekken</p>
            <p className="text-xs text-hysio-deep-green-900/50 mt-1">Start je eerste gesprek hierboven</p>
          </div>
        ) : (
          <div className="space-y-2 p-3">
            {conversations.map((conversation) => {
              const isActive = currentConversation?.id === conversation.id;
              const isDeleting = deletingId === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    'group relative rounded-xl cursor-pointer transition-all duration-200',
                    'hover:bg-hysio-mint/15 hover:shadow-md hover:scale-[1.02]',
                    isActive && 'bg-gradient-to-r from-hysio-mint/25 to-hysio-mint/15 shadow-md border border-hysio-mint/40'
                  )}
                  onClick={() => !isDeleting && onSelectConversation(conversation)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          'text-sm font-medium truncate',
                          isActive 
                            ? 'text-hysio-deep-green' 
                            : 'text-hysio-deep-green-900'
                        )}>
                          {conversation.title || 'Nieuw gesprek'}
                        </h3>
                        
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-hysio-deep-green-900/50">
                            {conversation.messages.length} {conversation.messages.length === 1 ? 'bericht' : 'berichten'}
                          </p>
                          
                          <p className="text-xs text-hysio-deep-green-900/50">
                            {formatTime(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(conversation.id, e)}
                        disabled={isDeleting}
                        className={cn(
                          'w-7 h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg',
                          'hover:bg-red-100 hover:text-red-600 hover:scale-110',
                          isDeleting && 'opacity-100'
                        )}
                      >
                        {isDeleting ? (
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </Button>
                    </div>
                    
                    {/* Last Message Preview */}
                    {conversation.messages.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-hysio-deep-green-900/60 line-clamp-2">
                          {conversation.messages[conversation.messages.length - 1].role === 'user' ? '• ' : ''}
                          {conversation.messages[conversation.messages.length - 1].content.substring(0, 80)}
                          {conversation.messages[conversation.messages.length - 1].content.length > 80 ? '...' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-hysio-mint/30 bg-gradient-to-r from-hysio-mint/5 to-hysio-mint/10">
        <p className="text-xs text-hysio-deep-green-900/60 text-center font-medium">
          Hysio Assistant v2.0
        </p>
        <p className="text-xs text-hysio-deep-green-900/70 text-center mt-2 bg-hysio-mint/10 px-3 py-2 rounded-lg">
          <strong>⚠️ Altijd nazien door een bevoegd fysiotherapeut</strong>
        </p>
      </div>
    </div>
  );
};

export { ConversationSidebar };