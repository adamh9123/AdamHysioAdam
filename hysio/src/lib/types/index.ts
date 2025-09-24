// Core type definitions for Hysio Medical Scribe

export interface PatientInfo {
  initials: string;
  birthYear: string;
  gender: 'man' | 'vrouw';
  chiefComplaint: string;
  // Calculated field for AI generation
  age?: number;
  // Document context from patient info stage
  documentContext?: string;
  documentFilename?: string;
  // Legacy fields for backward compatibility
  firstName?: string;
  dateOfBirth?: string;
}

export interface SessionData {
  id: string;
  type: 'intake' | 'followup';
  patientInfo: PatientInfo;
  status: 'in-progress' | 'completed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
  data: IntakeData | FollowupData;
}

export interface IntakeData {
  patientInfo: PatientInfo;
  preparation: string;
  anamnesisRecording: AudioRecording | null;
  anamnesisTranscript: string;
  anamnesisAdditionalNotes?: string;
  hhsbStructure: HHSBStructure | null;
  examinationPlan: string;
  examinationRecording: AudioRecording | null;
  examinationFindings: string;
  clinicalConclusion: string;
  diagnosis: string;
  treatmentPlan: string;
  redFlags: string[];
  recommendations: string;
  followUpPlan: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowupData {
  patientInfo: PatientInfo;
  sessionPreparation: string;
  soepRecording: AudioRecording | null;
  soepTranscript: string;
  soepStructure: SOEPStructure | null;
  progressEvaluation: string;
  treatmentAdjustments: string;
  nextSessionPlan: string;
  homeExercises: string;
  patientEducation: string;
  redFlags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntakePreparation {
  workingHypothesis: string;
  differentialDiagnoses: string[];
  anamnesisQuestions: string[];
  redFlagQuestions: string[];
}

export interface AnamnesisData {
  transcript: string;
  additionalNotes?: string;
  hhsb: HHSBData;
  redFlags: string[];
}

export interface HHSBData {
  hulpvraag: string; // H - Hulpvraag (Help Question)
  historie: string; // H - Historie (History)
  stoornissen: string; // S - Stoornissen (Disorders in body function and anatomy)
  beperkingen: string; // B - Beperkingen (Limitations in activities or participation)
}

export interface HHSBStructure {
  hulpvraag: string; // Hulpvraag - Motivatie/hulpvraag, doelen/verwachtingen
  historie: string; // Historie - Ontstaansmoment, verloop, eerdere behandeling
  stoornissen: string; // Stoornissen - Pijn, mobiliteit, kracht, stabiliteit
  beperkingen: string; // Beperkingen - ADL, werk, sport
  redFlags: string[];
  fullStructuredText: string;
  anamneseSummary?: string; // Samenvatting Anamnese - Narrative summary of the anamnesis
}

export interface SOEPStructure {
  subjective: string;
  objective: string;
  evaluation: string;
  plan: string;
  redFlags: string[];
  fullStructuredText: string;
  consultSummary?: string; // Samenvatting Consult - Narrative summary of the consultation
}

export interface AudioTranscription {
  text: string;
  confidence?: number;
  duration?: number;
  timestamp?: string;
}

export interface ExaminationData {
  transcript: string;
  findings: string[];
  testResults: TestResult[];
}

export interface TestResult {
  testName: string;
  result: string;
  normal: boolean;
}

export interface AnalysisData {
  primaryDiagnosis: DiagnosisData;
  differentialDiagnoses: DiagnosisData[];
}

export interface DiagnosisData {
  diagnosis: string;
  probability: number;
  rationale: string;
}

export interface ClinicalConclusion {
  summary: string;
  workingDiagnosis: string;
  treatmentIndication: string;
  prognosis: string;
  evaluationTimeline: string;
}

export interface SOEPData {
  subjective: string; // S - Patient-reported progress and symptoms
  objective: string; // O - Therapist observations and measurements
  evaluation: string; // E - Progress assessment and clinical reasoning
  plan: string; // P - Treatment adjustments and next steps
}

export interface AudioRecording {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: string;
  sessionId?: string;
  phase?: 'anamnesis' | 'examination' | 'followup';
}

export interface TranscriptionResponse {
  success: boolean;
  transcript?: string;
  error?: string;
  duration?: number;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Export assistant types
export * from './assistant';