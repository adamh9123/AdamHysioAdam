// API Request and Response Types for Hysio Medical Scribe
import type { RedFlagResult } from '@/lib/medical/red-flags-detection';

// Common types
export interface PatientInfo {
  initials: string;
  birthYear: string;
  gender: 'male' | 'female';
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

export interface TranscribedAudioInputData {
  type: 'transcribed-audio';
  data: string;
  originalSource: 'recording' | 'file';
  duration?: number;
  transcriptionConfidence?: number;
}

export interface ManualInputData {
  type: 'manual';
  data: string;
}

export type InputData = AudioInputData | TranscribedAudioInputData | ManualInputData;

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
  // Enhanced red flags detection
  redFlagsDetailed?: RedFlagResult[];
  redFlagsSummary?: string;
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
  // Enhanced red flags detection
  redFlagsDetailed?: RedFlagResult[];
  redFlagsSummary?: string;
}

// Transcription API
export interface TranscriptionRequest {
  audioFile: File | Blob;
  language?: string;
  model?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  transcript?: string;
  confidence?: number;
  duration?: number;
  segmented?: boolean;
  fileSize?: string;
  error?: string;
  processedAt?: string;
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

// Workflow result types
export interface AnamneseResult {
  hhsbStructure: HHSBStructure;
  fullStructuredText: string;
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: PatientInfo;
}

export interface OnderzoekResult {
  examinationFindings: {
    physicalTests: string;
    movements: string;
    palpation: string;
    functionalTests: string;
    measurements: string;
    observations: string;
    summary: string;
    redFlags: string[];
  };
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: PatientInfo;
}

export interface KlinischeConclusieResult {
  diagnosis: string;
  treatmentPlan: string;
  prognosis: string;
  followUp: string;
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: PatientInfo;
}

export interface AutomatedIntakeResult {
  hhsbAnamneseCard: HHSBStructure;
  onderzoeksBevindingen: OnderzoekResult['examinationFindings'];
  klinischeConclusie: KlinischeConclusieResult;
  transcript: string;
  workflowType: string;
  processedAt: string;
  patientInfo: PatientInfo;
  // Enhanced red flags detection
  redFlags?: string[];
  redFlagsDetailed?: RedFlagResult[];
  redFlagsSummary?: string;
}

export interface ConsultResult {
  soepStructure: SOEPStructure;
  fullStructuredText: string;
  transcript: string;
  workflowType: string;
  processingDuration: number;
  generatedAt: string;
  redFlags: string[];
  // Enhanced red flags detection
  redFlagsDetailed?: RedFlagResult[];
  redFlagsSummary?: string;
}

// Distribution details types
export interface EmailDistributionDetails {
  to: string;
  subject: string;
  body: string;
}

export interface DownloadDistributionDetails {
  filename: string;
  format: 'pdf' | 'docx' | 'txt';
}

export interface ShareDistributionDetails {
  url: string;
  expiresAt: string;
}

export type DistributionDetails =
  | EmailDistributionDetails
  | DownloadDistributionDetails
  | ShareDistributionDetails
  | undefined;

// Email settings type
export interface EmailSettings {
  from: string;
  subject: string;
  bodyTemplate: string;
  signature: string;
  cc?: string;
  bcc?: string;
}

// PDF font type (for jsPDF)
export interface PDFFont {
  getTextWidth: (text: string) => number;
}