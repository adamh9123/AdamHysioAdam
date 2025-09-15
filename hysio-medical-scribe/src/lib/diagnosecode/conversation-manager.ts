// Conversation Management for DCSPH Code Finding

import { v4 as uuidv4 } from 'uuid';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'query' | 'clarification' | 'response' | 'error';
}

export interface ConversationState {
  id: string;
  messages: ConversationMessage[];
  status: 'active' | 'completed' | 'error' | 'timeout';
  startedAt: Date;
  lastActiveAt: Date;
  needsClarification: boolean;
  clarificationCount: number;
  originalQuery: string;
  finalSuggestions?: any[];
}

export interface ClarificationContext {
  missingInfo: string[];
  attemptedQuestions: string[];
  userResponses: { [question: string]: string };
}

export class ConversationManager {
  private conversations: Map<string, ConversationState> = new Map();
  private readonly MAX_CLARIFICATION_ROUNDS = 2;
  private readonly CONVERSATION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Start a new conversation
   */
  startConversation(initialQuery: string): string {
    const conversationId = uuidv4();
    const now = new Date();

    const conversation: ConversationState = {
      id: conversationId,
      messages: [
        {
          id: uuidv4(),
          role: 'user',
          content: initialQuery,
          timestamp: now,
          type: 'query'
        }
      ],
      status: 'active',
      startedAt: now,
      lastActiveAt: now,
      needsClarification: false,
      clarificationCount: 0,
      originalQuery: initialQuery
    };

    this.conversations.set(conversationId, conversation);
    return conversationId;
  }

  /**
   * Add message to conversation
   */
  addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    type: ConversationMessage['type'] = 'response'
  ): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    const message: ConversationMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date(),
      type
    };

    conversation.messages.push(message);
    conversation.lastActiveAt = new Date();

    return true;
  }

  /**
   * Add clarifying question
   */
  addClarifyingQuestion(conversationId: string, question: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    // Check if we've reached max clarification rounds
    if (conversation.clarificationCount >= this.MAX_CLARIFICATION_ROUNDS) {
      this.addMessage(conversationId, 'assistant',
        'Te veel verduidelijkingsvragen. Probeer een meer gedetailleerde beschrijving.', 'error');
      conversation.status = 'error';
      return false;
    }

    conversation.clarificationCount++;
    conversation.needsClarification = true;

    return this.addMessage(conversationId, 'assistant', question, 'clarification');
  }

  /**
   * Process user response to clarification
   */
  processUserResponse(conversationId: string, response: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.needsClarification = false;
    return this.addMessage(conversationId, 'user', response, 'query');
  }

  /**
   * Complete conversation with final suggestions
   */
  completeConversation(conversationId: string, suggestions: any[]): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.status = 'completed';
    conversation.finalSuggestions = suggestions;
    conversation.needsClarification = false;

    // Add final response message
    this.addMessage(conversationId, 'assistant',
      `${suggestions.length} DCSPH code suggesties gegenereerd.`, 'response');

    return true;
  }

  /**
   * Get conversation state
   */
  getConversation(conversationId: string): ConversationState | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    // Check if conversation has timed out
    if (this.isConversationTimedOut(conversation)) {
      conversation.status = 'timeout';
    }

    return conversation;
  }

  /**
   * Get conversation history for AI context
   */
  getConversationHistory(conversationId: string): Array<{ role: 'user' | 'assistant'; content: string }> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];

    return conversation.messages
      .filter(msg => msg.role !== 'system' && msg.type !== 'error')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }

  /**
   * Build complete query from conversation
   */
  buildCompleteQuery(conversationId: string): string {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return '';

    const userMessages = conversation.messages
      .filter(msg => msg.role === 'user' && msg.type === 'query')
      .map(msg => msg.content);

    return userMessages.join(' ');
  }

  /**
   * Analyze conversation for missing information
   */
  analyzeMissingInformation(conversationId: string): ClarificationContext {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return {
        missingInfo: [],
        attemptedQuestions: [],
        userResponses: {}
      };
    }

    const completeQuery = this.buildCompleteQuery(conversationId);
    const normalizedQuery = completeQuery.toLowerCase();

    const missingInfo: string[] = [];
    const attemptedQuestions = conversation.messages
      .filter(msg => msg.role === 'assistant' && msg.type === 'clarification')
      .map(msg => msg.content);

    // Analyze what information is still missing
    const hasLocation = this.hasLocationInfo(normalizedQuery);
    const hasPathology = this.hasPathologyInfo(normalizedQuery);
    const hasTiming = this.hasTimingInfo(normalizedQuery);
    const hasMechanism = this.hasMechanismInfo(normalizedQuery);

    if (!hasLocation) missingInfo.push('location');
    if (!hasPathology) missingInfo.push('pathology');
    if (!hasTiming) missingInfo.push('timing');
    if (!hasMechanism) missingInfo.push('mechanism');

    // Build user responses map
    const userResponses: { [question: string]: string } = {};
    let lastQuestion = '';

    for (const message of conversation.messages) {
      if (message.role === 'assistant' && message.type === 'clarification') {
        lastQuestion = message.content;
      } else if (message.role === 'user' && message.type === 'query' && lastQuestion) {
        userResponses[lastQuestion] = message.content;
        lastQuestion = '';
      }
    }

    return {
      missingInfo,
      attemptedQuestions,
      userResponses
    };
  }

  /**
   * Check if query has location information
   */
  private hasLocationInfo(query: string): boolean {
    const locationKeywords = [
      'knie', 'rug', 'nek', 'schouder', 'heup', 'elleboog', 'pols', 'voet', 'enkel',
      'hoofd', 'kaak', 'thorax', 'buik', 'wervelkolom', 'cervicaal', 'lumbaal',
      'bovenarm', 'onderarm', 'dijbeen', 'onderbeen', 'hand', 'vingers'
    ];

    return locationKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query has pathology information
   */
  private hasPathologyInfo(query: string): boolean {
    const pathologyKeywords = [
      'pijn', 'zwelling', 'stijf', 'beweging', 'ontsteking', 'tendinitis', 'artrose',
      'breuk', 'fractuur', 'trauma', 'contusie', 'distorsie', 'zenuw', 'radiculair',
      'bursitis', 'spasm', 'contractuur', 'hnp', 'hernia'
    ];

    return pathologyKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query has timing information
   */
  private hasTimingInfo(query: string): boolean {
    const timingKeywords = [
      'ochtend', 'avond', 'nacht', 'bewegen', 'rust', 'belasting', 'zitten', 'staan',
      'lopen', 'dagen', 'weken', 'maanden', 'acute', 'chronisch'
    ];

    return timingKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query has mechanism information
   */
  private hasMechanismInfo(query: string): boolean {
    const mechanismKeywords = [
      'trauma', 'val', 'ongeval', 'overbelasting', 'plotseling', 'geleidelijk',
      'sport', 'werk', 'auto', 'fiets', 'trap', 'tillen', 'draaien'
    ];

    return mechanismKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if conversation has timed out
   */
  private isConversationTimedOut(conversation: ConversationState): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - conversation.lastActiveAt.getTime();
    return timeDiff > this.CONVERSATION_TIMEOUT;
  }

  /**
   * Clean up old conversations
   */
  cleanupOldConversations(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, conversation] of this.conversations.entries()) {
      const timeDiff = now.getTime() - conversation.lastActiveAt.getTime();

      // Remove conversations older than 1 hour or completed conversations older than 10 minutes
      const shouldCleanup =
        timeDiff > 60 * 60 * 1000 || // 1 hour
        (conversation.status === 'completed' && timeDiff > 10 * 60 * 1000); // 10 minutes

      if (shouldCleanup) {
        this.conversations.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Get conversation statistics
   */
  getStats(): {
    totalConversations: number;
    activeConversations: number;
    completedConversations: number;
    averageMessages: number;
    averageClarifications: number;
  } {
    const conversations = Array.from(this.conversations.values());

    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    const completedConversations = conversations.filter(c => c.status === 'completed').length;

    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
    const totalClarifications = conversations.reduce((sum, c) => sum + c.clarificationCount, 0);

    return {
      totalConversations,
      activeConversations,
      completedConversations,
      averageMessages: totalConversations > 0 ? totalMessages / totalConversations : 0,
      averageClarifications: totalConversations > 0 ? totalClarifications / totalConversations : 0
    };
  }

  /**
   * Export conversation for analysis
   */
  exportConversation(conversationId: string): any {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    return {
      id: conversation.id,
      originalQuery: conversation.originalQuery,
      status: conversation.status,
      duration: conversation.lastActiveAt.getTime() - conversation.startedAt.getTime(),
      messageCount: conversation.messages.length,
      clarificationCount: conversation.clarificationCount,
      messages: conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        type: msg.type,
        timestamp: msg.timestamp.toISOString()
      })),
      finalSuggestions: conversation.finalSuggestions
    };
  }
}

// Singleton instance
export const conversationManager = new ConversationManager();

// Cleanup old conversations every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    conversationManager.cleanupOldConversations();
  }, 10 * 60 * 1000);
}