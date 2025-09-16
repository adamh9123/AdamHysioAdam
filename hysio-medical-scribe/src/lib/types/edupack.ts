// TypeScript types for Hysio EduPack Module
// Comprehensive type definitions for AI-powered patient education system

import type { PatientInfo, SOEPStructure } from './index';

// Core EduPack section types
export type EduPackSectionType =
  | 'introduction'
  | 'session_summary'
  | 'diagnosis'
  | 'treatment_plan'
  | 'self_care'
  | 'warning_signs'
  | 'follow_up';

// Individual section content structure
export interface SectionContent {
  id: string;
  type: EduPackSectionType;
  title: string;
  content: string;
  enabled: boolean;
  icon: string;
  order: number;
  lastModified: Date;
}

// Complete EduPack content structure
export interface EduPackContent {
  id: string;
  patientName?: string;
  sessionDate: Date;
  sessionType: 'intake' | 'followup';
  language: 'nl' | 'en'; // Dutch primary, English future
  tone: 'formal' | 'informal';
  sections: SectionContent[];
  generatedAt: Date;
  lastModified: Date;
  generatedBy: string; // therapist ID
  status: 'draft' | 'ready' | 'sent' | 'archived';
}

// AI Generation request structure
export interface EduPackGenerationRequest {
  sessionId?: string;
  sessionData?: {
    soepData?: SOEPStructure;
    transcript?: string;
    patientInfo?: PatientInfo;
    clinicalNotes?: string;
  };
  manualInput?: {
    patientInfo: {
      name?: string;
      age?: number;
      condition?: string;
    };
    sessionContext: string;
    pathology?: string;
    focusAreas?: string[];
  };
  preferences: {
    language: 'nl' | 'en';
    tone: 'formal' | 'informal';
    sections: EduPackSectionType[];
    personalizationLevel: 'basic' | 'detailed';
  };
  therapistId: string;
}

// AI Generation response structure
export interface EduPackGenerationResponse {
  success: boolean;
  eduPackId?: string;
  content?: EduPackContent;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  processingTime: number;
  tokensUsed?: number;
}

// Distribution options
export interface EduPackDistribution {
  id: string;
  eduPackId: string;
  method: 'email' | 'download' | 'copy' | 'share_link';
  recipient?: {
    email?: string;
    name?: string;
  };
  distributedAt: Date;
  distributedBy: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  tracking?: {
    opened?: Date;
    downloaded?: Date;
    expiresAt?: Date;
  };
}

// PDF export configuration
export interface EduPackPDFConfig {
  includeBranding: boolean;
  includeDisclaimer: boolean;
  customFooter?: string;
  watermark?: string;
  format: 'A4' | 'Letter';
  fontSize: 'small' | 'medium' | 'large';
}

// Section template configuration
export interface SectionTemplate {
  type: EduPackSectionType;
  title: string;
  description: string;
  icon: string;
  defaultEnabled: boolean;
  aiPromptTemplate: string;
  requiredFields: string[];
  maxLength: number;
  order: number;
}

// Privacy filtering configuration
export interface PrivacyFilterConfig {
  removeInternalNotes: boolean;
  removePII: boolean;
  removeOtherPatients: boolean;
  confidentialKeywords: string[];
  allowedMedicalTerms: string[];
}

// Content validation result
export interface ContentValidationResult {
  isValid: boolean;
  languageLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  readabilityScore: number;
  issues: {
    type: 'language_complexity' | 'medical_jargon' | 'length' | 'privacy';
    message: string;
    severity: 'low' | 'medium' | 'high';
    section?: EduPackSectionType;
  }[];
  suggestions: string[];
}

// Audit trail entry
export interface EduPackAuditEntry {
  id: string;
  eduPackId: string;
  action: 'created' | 'modified' | 'sent' | 'downloaded' | 'deleted' | 'viewed';
  userId: string;
  timestamp: Date;
  details: {
    section?: EduPackSectionType;
    changes?: string[];
    recipient?: string;
    distributionMethod?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

// Access control types
export interface EduPackAccessControl {
  userId: string;
  subscriptionTier: 'basic' | 'advanced' | 'premium';
  permissions: {
    canGenerate: boolean;
    canEdit: boolean;
    canDistribute: boolean;
    canDownload: boolean;
    canShare: boolean;
    maxGenerationsPerMonth: number;
  };
  usageStats: {
    generationsThisMonth: number;
    lastGenerated?: Date;
    totalGenerated: number;
  };
}

// React hook state types
export interface EduPackGenerationState {
  isGenerating: boolean;
  currentStep: 'input' | 'processing' | 'review' | 'complete';
  progress: number;
  content?: EduPackContent;
  error?: string;
  validationResult?: ContentValidationResult;
}

// API response types
export interface EduPackApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Batch generation types
export interface EduPackBatchRequest {
  sessions: EduPackGenerationRequest[];
  batchId: string;
  preferences: {
    language: 'nl' | 'en';
    tone: 'formal' | 'informal';
    sections: EduPackSectionType[];
  };
  therapistId: string;
}

export interface EduPackBatchResponse {
  batchId: string;
  total: number;
  successful: number;
  failed: number;
  results: {
    sessionId: string;
    success: boolean;
    eduPackId?: string;
    error?: string;
  }[];
  processingTime: number;
}