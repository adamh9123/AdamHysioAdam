'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Brain,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'query' | 'clarification' | 'response' | 'error' | 'success';
  metadata?: {
    confidence?: number;
    processingTime?: number;
    suggestions?: string[];
  };
}

interface ChatBubbleProps {
  message: ChatMessage;
  className?: string;
  showTimestamp?: boolean;
  showAvatar?: boolean;
}

export function ChatBubble({
  message,
  className,
  showTimestamp = true,
  showAvatar = true
}: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Determine bubble styling based on role and type
  const getBubbleStyles = () => {
    if (isUser) {
      return 'bg-hysio-deep-green text-white ml-12 max-w-[85%]';
    }

    if (isSystem) {
      return 'bg-blue-50 border border-blue-200 text-blue-800 mx-4';
    }

    // Assistant messages
    switch (message.type) {
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800 mr-12 max-w-[85%]';
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800 mr-12 max-w-[85%]';
      case 'clarification':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800 mr-12 max-w-[85%]';
      default:
        return 'bg-white border border-gray-200 text-gray-700 mr-12 max-w-[85%]';
    }
  };

  // Get appropriate icon for message type
  const getMessageIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    if (isSystem) return <AlertCircle className="h-4 w-4" />;

    switch (message.type) {
      case 'clarification':
        return <MessageCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Brain className="h-4 w-4 text-hysio-mint-dark" />;
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      {/* Assistant Avatar - shown on left */}
      {!isUser && showAvatar && (
        <div className="flex-shrink-0 mt-1">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            message.type === 'error' ? 'bg-red-100' :
            message.type === 'success' ? 'bg-green-100' :
            message.type === 'clarification' ? 'bg-yellow-100' :
            'bg-hysio-mint/20'
          )}>
            {getMessageIcon()}
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "rounded-2xl px-4 py-3 shadow-sm",
        getBubbleStyles()
      )}>
        {/* Message Header (for special message types) */}
        {message.type === 'clarification' && !isUser && (
          <div className="flex items-center gap-2 mb-2 text-yellow-700">
            <Lightbulb className="h-3 w-3" />
            <span className="text-xs font-medium">Verduidelijking nodig</span>
          </div>
        )}

        {message.type === 'error' && !isUser && (
          <div className="flex items-center gap-2 mb-2 text-red-700">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs font-medium">Fout</span>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-2">
          <p className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            isUser ? "text-white" :
            isSystem ? "text-blue-800" :
            message.type === 'error' ? "text-red-800" :
            message.type === 'success' ? "text-green-800" :
            message.type === 'clarification' ? "text-yellow-800" :
            "text-gray-700"
          )}>
            {message.content}
          </p>

          {/* Metadata Display */}
          {message.metadata && (
            <div className="mt-2 space-y-1">
              {/* Confidence Score */}
              {message.metadata.confidence && (
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    message.metadata.confidence > 0.8 ? "bg-green-100 text-green-700" :
                    message.metadata.confidence > 0.6 ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {Math.round(message.metadata.confidence * 100)}% zekerheid
                  </div>
                </div>
              )}

              {/* Processing Time */}
              {message.metadata.processingTime && (
                <div className={cn(
                  "text-xs flex items-center gap-1",
                  isUser ? "text-white/70" : "text-gray-500"
                )}>
                  <Clock className="h-3 w-3" />
                  {message.metadata.processingTime}ms
                </div>
              )}

              {/* Suggestions */}
              {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="mt-2">
                  <div className={cn(
                    "text-xs font-medium mb-1",
                    isUser ? "text-white/90" : "text-gray-600"
                  )}>
                    Suggesties:
                  </div>
                  <ul className="text-xs space-y-1">
                    {message.metadata.suggestions.map((suggestion, index) => (
                      <li key={index} className={cn(
                        "flex items-start gap-1",
                        isUser ? "text-white/80" : "text-gray-600"
                      )}>
                        <span className="text-gray-400">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          {showTimestamp && (
            <div className={cn(
              "text-xs mt-2 flex items-center gap-1",
              isUser ? "text-white/70 justify-end" :
              isSystem ? "text-blue-600 justify-center" :
              "text-gray-500"
            )}>
              <Clock className="h-3 w-3" />
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
      </div>

      {/* User Avatar - shown on right */}
      {isUser && showAvatar && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-hysio-deep-green rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

// Chat Thread Component for displaying multiple messages
interface ChatThreadProps {
  messages: ChatMessage[];
  className?: string;
  showTimestamps?: boolean;
  showAvatars?: boolean;
  emptyState?: React.ReactNode;
}

export function ChatThread({
  messages,
  className,
  showTimestamps = true,
  showAvatars = true,
  emptyState
}: ChatThreadProps) {
  if (messages.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div className={cn("space-y-2", className)}>
      {messages.map((message, index) => (
        <ChatBubble
          key={message.id}
          message={message}
          showTimestamp={showTimestamps}
          showAvatar={showAvatars}
        />
      ))}
    </div>
  );
}

// Typing indicator component
interface TypingIndicatorProps {
  className?: string;
  text?: string;
}

export function TypingIndicator({
  className,
  text = "AI denkt na..."
}: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center">
          <Brain className="h-4 w-4 text-hysio-mint-dark animate-pulse" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-[85%] mr-12">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{text}</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-hysio-mint-dark rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-hysio-mint-dark rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-hysio-mint-dark rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick actions component for common responses
interface QuickActionsProps {
  actions: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  onActionSelect: (value: string) => void;
  className?: string;
}

export function QuickActions({ actions, onActionSelect, className }: QuickActionsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2 mb-4", className)}>
      {actions.map((action) => (
        <button
          key={action.value}
          onClick={() => onActionSelect(action.value)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-200 transition-colors"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}