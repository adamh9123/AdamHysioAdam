// TypeScript type definitions for Hysio Diagnosecode module

export interface DCSPHLocation {
  code: string;
  description: string;
  region: string;
}

export interface DCSPHPathology {
  code: string;
  description: string;
  category: string;
}

export interface DCSPHCodeComplete {
  code: string;
  locationCode: string;
  pathologyCode: string;
  locationDescription: string;
  pathologyDescription: string;
  fullDescription: string;
}

export interface CodeSuggestion {
  code: string;
  name: string;
  rationale: string;
  confidence: number;
  metadata?: {
    category?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    alternativeCodes?: string[];
    estimatedAccuracy?: number;
  };
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type: 'query' | 'clarification' | 'response' | 'error' | 'success';
  metadata?: {
    confidence?: number;
    processingTime?: number;
    suggestions?: string[];
  };
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
  finalSuggestions?: CodeSuggestion[];
}

export interface DiagnosisRequest {
  query: string;
  conversationId?: string;
  context?: {
    previousQuestions?: string[];
    previousAnswers?: string[];
    clinicalContext?: {
      age?: number;
      gender?: 'male' | 'female';
      previousDiagnoses?: string[];
      currentMedication?: string[];
    };
  };
}

export interface DiagnosisResponse {
  success: boolean;
  suggestions: CodeSuggestion[];
  needsClarification: boolean;
  clarifyingQuestion?: string;
  conversationId: string;
  error?: {
    type: string;
    message: string;
    suggestions?: string[];
    recoverable: boolean;
  };
  metadata?: {
    processedAt: string;
    suggestionCount: number;
    processingTimeMs?: number;
    isFollowUp?: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: DCSPHCodeComplete[];
}

export interface PatternMatch {
  term: string;
  confidence: number;
  category: 'location' | 'pathology' | 'symptom' | 'mechanism' | 'timing';
  matchedText: string;
  position: number;
}

export interface PatternAnalysis {
  locationMatches: PatternMatch[];
  pathologyMatches: PatternMatch[];
  symptomMatches: PatternMatch[];
  mechanismMatches: PatternMatch[];
  timingMatches: PatternMatch[];
  overallConfidence: number;
  suggestedCodes: string[];
}

export interface RationaleContext {
  query: string;
  patternAnalysis?: PatternAnalysis;
  confidence: number;
  clinicalContext?: {
    age?: number;
    mechanism?: string;
    duration?: string;
    severity?: string;
  };
}

export interface DetailedRationale {
  shortRationale: string;
  extendedRationale: string;
  clinicalReasoningSteps: string[];
  confidenceFactors: string[];
  alternativeConsiderations?: string[];
}

export interface DiagnosisError {
  type: 'VALIDATION_ERROR' | 'NETWORK_ERROR' | 'AI_ERROR' | 'KNOWLEDGE_BASE_ERROR' | 'RATE_LIMIT_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  recoverable: boolean;
  suggestions?: string[];
}

export interface KnowledgeBaseQuery {
  query: string;
  context?: string;
  previousQuestions?: string[];
}

export interface KnowledgeBaseResponse {
  suggestions: Array<{
    code: DCSPHCodeComplete;
    confidence: number;
    rationale: string;
  }>;
  needsClarification: boolean;
  clarifyingQuestion?: string;
  confidence: number;
}

export interface DiagnosisStats {
  totalQueries: number;
  avgResponseTime: number;
  accuracyRate: number;
  timeSaved: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: {
    aiIntegration?: boolean;
    fallbackAvailable?: boolean;
    conversationManager?: any;
    error?: string;
  };
}

// Component Props Types
export interface DiagnosisCodeFinderProps {
  onCodeSelected?: (code: CodeSuggestion) => void;
  initialQuery?: string;
  embedded?: boolean;
  className?: string;
}

export interface CodeSuggestionCardProps {
  suggestion: CodeSuggestion;
  rank: number;
  onCopy?: (code: string) => void;
  onSelect?: (suggestion: CodeSuggestion) => void;
  onViewDetails?: (code: string) => void;
  isSelected?: boolean;
  className?: string;
}

export interface ChatBubbleProps {
  message: ConversationMessage;
  className?: string;
  showTimestamp?: boolean;
  showAvatar?: boolean;
}

export interface ClinicalIntegrationProps {
  clinicalConclusion?: string;
  onCodeSelected?: (code: CodeSuggestion) => void;
  className?: string;
}

// API Types
export interface APIValidationRequest {
  code?: string;
  codes?: string[];
}

export interface APIValidationResponse {
  success: boolean;
  validation?: ValidationResult;
  validations?: { [code: string]: ValidationResult };
  code?: string;
  codeCount?: number;
  timestamp: string;
}

export interface APIClarificationRequest {
  conversationId: string;
  response: string;
}

export interface APIConversationResponse {
  success: boolean;
  conversation: any;
  analysis: {
    missingInfo: string[];
    suggestions: string[];
  };
  metadata: {
    retrievedAt: string;
  };
}

// Utility Types
export type DiagnosisErrorType = DiagnosisError['type'];
export type ConversationStatus = ConversationState['status'];
export type MessageType = ConversationMessage['type'];
export type MessageRole = ConversationMessage['role'];
export type HealthStatus = HealthCheckResult['status'];

// Constants
export const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AI_ERROR: 'AI_ERROR',
  KNOWLEDGE_BASE_ERROR: 'KNOWLEDGE_BASE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export const CONVERSATION_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ERROR: 'error',
  TIMEOUT: 'timeout'
} as const;

export const MESSAGE_TYPES = {
  QUERY: 'query',
  CLARIFICATION: 'clarification',
  RESPONSE: 'response',
  ERROR: 'error',
  SUCCESS: 'success'
} as const;

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const;