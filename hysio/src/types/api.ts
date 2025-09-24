// API Request and Response Types for Hysio Medical Scribe

// Common types
export interface PatientInfo {
  initials: string;
  birthYear: string;
  gender: 'male' | 'female' | 'other';
  chiefComplaint: string;
  additionalInfo?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  status?: number;
  details?: string;
}

// Input data types
export interface AudioInputData {
  type: 'recording' | 'file';
  data: Blob | File;
  duration?: number;
}

export interface ManualInputData {
  type: 'manual';
  data: string;
}

export type InputData = AudioInputData | ManualInputData;

// Preparation API
export interface PreparationRequest {
  workflowType: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
  step?: 'preparation' | 'anamnese' | 'onderzoek' | 'klinische-conclusie' | 'consult';
  patientInfo: PatientInfo;
  previousStepData?: {
    anamneseResult?: any;
    onderzoekResult?: any;
  };
}

export interface PreparationResponse {
  content: string;
  workflowType: string;
  step?: string;
  generatedAt: string;
}

// HHSB Processing API
export interface HHSBProcessRequest {
  workflowType: string;
  step?: string;
  patientInfo: PatientInfo;
  preparation?: string | null;
  inputData: InputData;
  previousStepData?: {
    anamneseResult?: any;
    onderzoekResult?: any;
  };
}

export interface HHSBStructure {
  hulpvraag: string;
  historie: string;
  stoornissen: string;
  beperkingen: string;
  anamneseSummary: string;
  redFlags: string[];
  fullStructuredText: string;
}

export interface HHSBProcessResponse {
  hhsbStructure: HHSBStructure;
  fullStructuredText: string;
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: {
    initials: string;
    age: number;
    gender: string;
    chiefComplaint: string;
  };
}

// SOEP Processing API
export interface SOEPProcessRequest {
  workflowType: string;
  patientInfo: PatientInfo;
  preparation?: string | null;
  inputData: InputData;
}

export interface SOEPStructure {
  subjectief: string;
  objectief: string;
  evaluatie: string;
  plan: string;
  consultSummary: string;
  redFlags: string[];
  fullStructuredText: string;
}

export interface SOEPProcessResponse {
  soepStructure: SOEPStructure;
  fullStructuredText: string;
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: {
    initials: string;
    age: number;
    gender: string;
    chiefComplaint: string;
  };
}

// Transcription API
export interface TranscriptionRequest {
  audioFile: File | Blob;
  language?: string;
  model?: string;
}

export interface TranscriptionResponse {
  transcript: string;
  confidence?: number;
  duration?: number;
  processedAt: string;
}

// Common workflow types
export type WorkflowType = 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
export type WorkflowStep = 'preparation' | 'anamnese' | 'onderzoek' | 'klinische-conclusie' | 'consult';

// Error types
export interface ValidationError extends ApiError {
  field: string;
  code: 'REQUIRED' | 'INVALID_FORMAT' | 'INVALID_VALUE';
}

export interface ProcessingError extends ApiError {
  stage: 'TRANSCRIPTION' | 'ANALYSIS' | 'GENERATION' | 'PARSING';
  retryable: boolean;
}

// Response wrapper type
export type ApiResult<T> = Promise<ApiResponse<T>>;