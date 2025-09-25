/**
 * Comprehensive Workflow Type Definitions for Hysio Medical Scribe v3
 *
 * This module defines all TypeScript types and interfaces for the multi-page
 * workflow system, including automated intake, step-by-step intake, and
 * follow-up consultation workflows.
 */

// Re-export existing types for backward compatibility
export type { PatientInfo, IntakeData, FollowupData, SOEPStructure } from '@/lib/types';

/**
 * Core workflow configuration types
 */
export type WorkflowType = 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';

export type WorkflowStep =
  | 'patient-info'
  | 'workflow-selection'
  | 'anamnese'
  | 'onderzoek'
  | 'klinische-conclusie'
  | 'conclusie'
  | 'soep-verslag';

export type WorkflowStatus = 'not-started' | 'in-progress' | 'completed' | 'paused' | 'failed';

export type WorkflowMode = 'automated' | 'stepwise' | 'consultation';

/**
 * Workflow configuration interface
 */
export interface WorkflowConfig {
  id: WorkflowType;
  name: string;
  displayName: string;
  description: string;
  mode: WorkflowMode;
  estimatedDuration: number; // in minutes
  steps: WorkflowStepConfig[];
  requiresPatientInfo: boolean;
  supportsPreparation: boolean;
  outputFormat: 'HHSB' | 'SOEP' | 'COMBINED';
  exportFormats: ExportFormat[];
}

/**
 * Workflow step configuration
 */
export interface WorkflowStepConfig {
  id: WorkflowStep;
  name: string;
  title: string;
  description: string;
  path: string;
  order: number;
  isRequired: boolean;
  isTerminal?: boolean;
  estimatedDuration: number; // in minutes
  preparationSupported: boolean;
  recordingSupported: boolean;
  transcriptSupported: boolean;
  manualInputSupported: boolean;
  dependencies?: WorkflowStep[]; // Steps that must be completed first
  validationRules?: StepValidationRule[];
}

/**
 * Step validation rules
 */
export interface StepValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'maxLength' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

/**
 * Recording and input types
 */
export type RecordingSource = 'microphone' | 'file-upload' | 'manual-notes';

export interface RecordingData {
  source: RecordingSource;
  file?: File;
  blob?: Blob;
  transcript?: string;
  duration?: number;
  quality?: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface ManualInputData {
  text: string;
  timestamp: string;
  author?: string;
}

/**
 * Preparation document types
 */
export interface PreparationDocument {
  id: string;
  type: 'intake-general' | 'anamnese' | 'onderzoek' | 'consult';
  title: string;
  content: string;
  generatedAt: string;
  patientInfo?: any;
  customization?: Record<string, any>;
  source: 'ai-generated' | 'template' | 'manual';
}

/**
 * Step-specific data interfaces
 */
export interface BaseStepData {
  stepId: WorkflowStep;
  status: WorkflowStatus;
  startedAt?: string;
  completedAt?: string;
  lastModifiedAt: string;
  preparation?: PreparationDocument;
  recording?: RecordingData;
  manualInput?: ManualInputData;
  result?: any;
  errors?: WorkflowError[];
  metadata?: Record<string, any>;
}

export interface AnamneseStepData extends BaseStepData {
  stepId: 'anamnese';
  hhsbAnamneseCard?: HHSBAnamneseCard;
  redFlags?: string[];
  patientNarrative?: string;
}

export interface OnderzoekStepData extends BaseStepData {
  stepId: 'onderzoek';
  onderzoeksBevindingen?: OnderzoeksBevindingen;
  measurements?: Measurement[];
  assessmentTools?: AssessmentTool[];
}

export interface KlinischeConclusieStepData extends BaseStepData {
  stepId: 'klinische-conclusie';
  diagnosis?: Diagnosis;
  treatmentPlan?: TreatmentPlan;
  prognosis?: Prognosis;
  recommendations?: Recommendation[];
}

export interface AutomatedIntakeStepData extends BaseStepData {
  stepId: 'conclusie';
  hhsbAnamneseCard?: HHSBAnamneseCard;
  onderzoeksBevindingen?: OnderzoeksBevindingen;
  klinischeConclusie?: KlinischeConclusie;
  combinedResult?: CombinedIntakeResult;
}

export interface ConsultStepData extends BaseStepData {
  stepId: 'soep-verslag';
  soepStructure?: SOEPStructure;
  progressEvaluation?: ProgressEvaluation;
  treatmentAdjustments?: TreatmentAdjustment[];
}

/**
 * HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) structure
 */
export interface HHSBAnamneseCard {
  hulpvraag: {
    primaryConcern: string;
    patientGoals: string[];
    functionalLimitations: string[];
    qualityOfLifeImpact: string;
  };
  historie: {
    currentSymptoms: SymptomDescription[];
    symptomTimeline: TimelineEvent[];
    previousTreatments: PreviousTreatment[];
    relevantMedicalHistory: MedicalHistoryItem[];
  };
  stoornissen: {
    identifiedImpairments: Impairment[];
    bodyStructureIssues: BodyStructureIssue[];
    bodyFunctionIssues: BodyFunctionIssue[];
  };
  beperkingen: {
    activityLimitations: ActivityLimitation[];
    participationRestrictions: ParticipationRestriction[];
    environmentalFactors: EnvironmentalFactor[];
  };
  redFlags: string[];
  patientEducationNeeds: string[];
  culturalConsiderations?: string;
}

/**
 * Onderzoek (Examination) structure
 */
export interface OnderzoeksBevindingen {
  observation: {
    generalAppearance: string;
    posture: string;
    movement: string;
    assistiveDevices?: string[];
  };
  palpation: {
    muscleTension: MuscleTensionFinding[];
    painPoints: PainPoint[];
    swelling?: SwellingFinding[];
    temperature?: TemperatureFinding[];
  };
  rangeOfMotion: {
    activeROM: ROMFinding[];
    passiveROM: ROMFinding[];
    endFeel: EndFeelFinding[];
  };
  strength: {
    manualMuscleTesting: MuscleTesting[];
    functionalStrength: FunctionalStrengthTest[];
  };
  neurology: {
    reflexes: ReflexTesting[];
    sensation: SensationTesting[];
    coordination: CoordinationTest[];
    balance: BalanceTest[];
  };
  functionalTesting: {
    specificTests: SpecificTest[];
    movementPatterns: MovementPattern[];
    functionalActivities: FunctionalActivityTest[];
  };
  measurements: Measurement[];
  additionalFindings: string[];
}

/**
 * Klinische Conclusie (Clinical Conclusion) structure
 */
export interface KlinischeConclusie {
  diagnosis: Diagnosis;
  treatmentPlan: TreatmentPlan;
  prognosis: Prognosis;
  recommendations: Recommendation[];
  followUpPlan: FollowUpPlan;
  patientEducation: PatientEducation;
  goals: TreatmentGoal[];
  contraindications?: string[];
  specialConsiderations?: string[];
}

/**
 * Combined result for automated intake
 */
export interface CombinedIntakeResult {
  hhsbAnamneseCard: HHSBAnamneseCard;
  onderzoeksBevindingen: OnderzoeksBevindingen;
  klinischeConclusie: KlinischeConclusie;
  generatedAt: string;
  processingDuration: number; // in seconds
  confidence: number; // 0-1
  reviewRequired: boolean;
  automaticFlags: string[];
}

/**
 * SOEP structure for follow-up consultations
 */
export interface SOEPStructure {
  subjectief: {
    patientReported: string;
    symptomsChanges: SymptomChange[];
    functionalChanges: FunctionalChange[];
    treatmentResponse: TreatmentResponse;
    newConcerns?: string[];
  };
  objectief: {
    observations: ObservationFinding[];
    measurements: Measurement[];
    testResults: TestResult[];
    physicalFindings: PhysicalFinding[];
  };
  evaluatie: {
    progressAssessment: ProgressAssessment;
    goalEvaluation: GoalEvaluation[];
    treatmentEffectiveness: TreatmentEffectiveness;
    complicationsOrIssues?: string[];
  };
  plan: {
    treatmentModifications: TreatmentModification[];
    newInterventions: Intervention[];
    homeExerciseUpdates: HomeExerciseUpdate[];
    followUpSchedule: FollowUpSchedule;
    patientEducation: PatientEducationUpdate;
  };
  redFlags: string[];
  additionalNotes?: string;
}

/**
 * Supporting data structures
 */
export interface SymptomDescription {
  location: string;
  character: string;
  intensity: number; // 0-10 scale
  frequency: string;
  duration: string;
  aggravatingFactors: string[];
  relievingFactors: string[];
  associatedSymptoms?: string[];
}

export interface TimelineEvent {
  date: string;
  event: string;
  significance: 'high' | 'medium' | 'low';
  impact?: string;
}

export interface PreviousTreatment {
  type: string;
  provider: string;
  duration: string;
  outcome: string;
  effectiveness: 'very-effective' | 'effective' | 'minimal' | 'ineffective';
}

export interface MedicalHistoryItem {
  condition: string;
  diagnosed: string;
  status: 'active' | 'resolved' | 'chronic';
  relevance: string;
}

export interface Impairment {
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  functionalImpact: string;
}

export interface Measurement {
  type: string;
  value: number | string;
  unit: string;
  side?: 'left' | 'right' | 'bilateral';
  reference?: string;
  interpretation?: string;
}

export interface Diagnosis {
  primary: DiagnosisItem;
  secondary?: DiagnosisItem[];
  differential?: DiagnosisItem[];
  icdCodes?: string[];
}

export interface DiagnosisItem {
  condition: string;
  confidence: 'high' | 'moderate' | 'low';
  rationale: string;
  evidence: string[];
}

export interface TreatmentPlan {
  goals: TreatmentGoal[];
  interventions: Intervention[];
  frequency: string;
  duration: string;
  progressMeasures: ProgressMeasure[];
}

export interface TreatmentGoal {
  id: string;
  description: string;
  type: 'short-term' | 'long-term';
  timeframe: string;
  measurable: boolean;
  criteria: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Intervention {
  type: string;
  description: string;
  frequency: string;
  duration: string;
  parameters?: Record<string, any>;
  rationale: string;
}

/**
 * Workflow session management
 */
export interface WorkflowSession {
  id: string;
  type: WorkflowType;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  patientInfo: any; // PatientInfo type from existing types
  currentStep?: WorkflowStep;
  stepData: Record<WorkflowStep, BaseStepData>;
  metadata: {
    duration: number; // in seconds
    userAgent?: string;
    ipAddress?: string;
    version: string;
  };
  export?: {
    formats: ExportFormat[];
    lastExported?: string;
  };
}

/**
 * Export and sharing types
 */
export type ExportFormat = 'HTML' | 'TXT' | 'DOCX' | 'PDF' | 'JSON';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includePreparation: boolean;
  includeRecordings: boolean;
  includeTimestamps: boolean;
  brandingIncluded: boolean;
  customTemplate?: string;
}

export interface ExportResult {
  format: ExportFormat;
  data: string | Blob | Buffer;
  filename: string;
  size: number;
  generatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Error handling types
 */
export interface WorkflowError {
  id: string;
  type: 'validation' | 'processing' | 'ai-service' | 'network' | 'user';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  details?: string;
  timestamp: string;
  step?: WorkflowStep;
  recoverable: boolean;
  suggestedAction?: string;
}

/**
 * Navigation and state management types
 */
export interface WorkflowNavigationState {
  currentWorkflow: WorkflowType | null;
  currentStep: WorkflowStep | null;
  previousStep: WorkflowStep | null;
  nextStep: WorkflowStep | null;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  completedSteps: WorkflowStep[];
  availableSteps: WorkflowStep[];
  breadcrumbs: BreadcrumbItem[];
  progress: {
    percentage: number;
    currentStepIndex: number;
    totalSteps: number;
  };
}

export interface BreadcrumbItem {
  title: string;
  path: string;
  isActive: boolean;
  isAccessible: boolean;
}

/**
 * API response types for workflow operations
 */
export interface WorkflowApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: WorkflowError;
  metadata?: {
    processingTime: number;
    version: string;
    timestamp: string;
  };
}

export interface PreparationGenerationRequest {
  workflowType: WorkflowType;
  step: WorkflowStep;
  patientInfo: any; // PatientInfo type
  previousStepData?: Record<string, any>;
  customization?: Record<string, any>;
}

export interface ContentProcessingRequest {
  workflowType: WorkflowType;
  step: WorkflowStep;
  inputType: 'recording' | 'transcript' | 'manual';
  inputData: string | File | Blob;
  patientInfo: any; // PatientInfo type
  preparation?: string;
  previousStepData?: Record<string, any>;
}

/**
 * Configuration and constants
 */
export const WORKFLOW_CONFIGS: Record<WorkflowType, WorkflowConfig> = {
  'intake-automatisch': {
    id: 'intake-automatisch',
    name: 'automated-intake',
    displayName: 'Hysio Intake (Automatisch)',
    description: 'Snelle en efficiënte intake voor ervaren therapeuten',
    mode: 'automated',
    estimatedDuration: 20,
    steps: [], // To be filled with step configurations
    requiresPatientInfo: true,
    supportsPreparation: true,
    outputFormat: 'HHSB',
    exportFormats: ['HTML', 'TXT', 'DOCX', 'PDF'],
  },
  'intake-stapsgewijs': {
    id: 'intake-stapsgewijs',
    name: 'stepwise-intake',
    displayName: 'Hysio Intake (Stapsgewijs)',
    description: 'Uitgebreide intake met maximale controle en ondersteuning',
    mode: 'stepwise',
    estimatedDuration: 45,
    steps: [], // To be filled with step configurations
    requiresPatientInfo: true,
    supportsPreparation: true,
    outputFormat: 'HHSB',
    exportFormats: ['HTML', 'TXT', 'DOCX', 'PDF'],
  },
  'consult': {
    id: 'consult',
    name: 'consultation',
    displayName: 'Hysio Consult (Vervolgconsult)',
    description: 'Vervolgconsult met SOEP-methodiek documentatie',
    mode: 'consultation',
    estimatedDuration: 15,
    steps: [], // To be filled with step configurations
    requiresPatientInfo: true,
    supportsPreparation: true,
    outputFormat: 'SOEP',
    exportFormats: ['HTML', 'TXT', 'DOCX', 'PDF'],
  },
};

/**
 * Additional supporting types (to be expanded as needed)
 */
export interface BodyStructureIssue {
  structure: string;
  issue: string;
  severity: string;
}

export interface BodyFunctionIssue {
  function: string;
  impairment: string;
  impact: string;
}

export interface ActivityLimitation {
  activity: string;
  limitation: string;
  severity: string;
  workarounds?: string[];
}

export interface ParticipationRestriction {
  area: string;
  restriction: string;
  impact: string;
  barriers?: string[];
}

export interface EnvironmentalFactor {
  factor: string;
  type: 'barrier' | 'facilitator';
  impact: string;
}

// ... Additional supporting interfaces can be added as needed