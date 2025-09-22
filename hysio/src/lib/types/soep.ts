/**
 * SOEP (Subjectief, Objectief, Evaluatie, Plan) Methodology Types
 *
 * This module defines comprehensive TypeScript types for the SOEP methodology
 * used in physiotherapy follow-up consultation documentation.
 */

/**
 * Core SOEP Structure
 * Represents the complete SOEP report structure for follow-up consultations
 */
export interface SOEPStructure {
  // Session identification
  sessionId: string;
  patientId?: string;
  consultationDate: string;
  consultationType: ConsultationType;

  // Core SOEP components
  subjectief: Subjectief;
  objectief: Objectief;
  evaluatie: Evaluatie;
  plan: Plan;

  // Additional clinical information
  redFlags: RedFlag[];
  followUpNeeds: FollowUpNeed[];
  communicationNotes: CommunicationNote[];

  // Session metadata
  duration: number; // in minutes
  sessionNumber?: number;
  treatmentPhase: TreatmentPhase;

  // Quality indicators
  completeness: SOEPCompleteness;
  reliability: ReliabilityAssessment;

  // Administrative
  createdAt: string;
  updatedAt: string;
  assessor: string;
  reviewRequired: boolean;
}

export type ConsultationType =
  | 'regular-followup'
  | 'progress-evaluation'
  | 'problem-focused'
  | 'discharge-planning'
  | 'reassessment'
  | 'maintenance';

export type TreatmentPhase =
  | 'initial'
  | 'intervention'
  | 'consolidation'
  | 'maintenance'
  | 'discharge';

/**
 * S - Subjectief (Subjective)
 * Patient-reported information and experiences
 */
export interface Subjectief {
  // Patient's current status
  currentStatus: PatientCurrentStatus;

  // Symptom changes since last visit
  symptomChanges: SymptomChange[];

  // Functional changes
  functionalChanges: FunctionalChange[];

  // Treatment response
  treatmentResponse: TreatmentResponse;

  // New concerns or issues
  newConcerns: NewConcern[];

  // Patient's perception of progress
  progressPerception: ProgressPerception;

  // Compliance and adherence
  compliance: ComplianceAssessment;

  // Psychosocial factors
  psychosocialFactors: PsychosocialUpdate[];

  // Environmental changes
  environmentalChanges: EnvironmentalChange[];

  // Goals and expectations update
  goalsUpdate: GoalsUpdate;
}

export interface PatientCurrentStatus {
  overallStatus: 'much-better' | 'better' | 'same' | 'worse' | 'much-worse';
  primaryConcernStatus: 'resolved' | 'much-improved' | 'improved' | 'unchanged' | 'worse';
  globalRating: number; // 0-10 scale
  description: string;
  confidence: ConfidenceLevel;
}

export interface SymptomChange {
  symptom: SymptomIdentifier;
  changeType: 'intensity' | 'frequency' | 'duration' | 'character' | 'location' | 'triggers';
  direction: 'improved' | 'worsened' | 'unchanged' | 'new' | 'resolved';
  magnitude: ChangeMagnitude;
  timeframe: ChangeTimeframe;
  description: string;
  patientAttribution: string[];
  impact: SymptomImpact;
}

export interface FunctionalChange {
  activity: ActivityIdentifier;
  changeDescription: string;
  direction: 'improved' | 'worsened' | 'unchanged' | 'new-ability' | 'lost-ability';
  magnitude: ChangeMagnitude;
  measurement?: FunctionalMeasurement;
  context: ActivityContext[];
  significance: 'high' | 'medium' | 'low';
  patientSatisfaction: SatisfactionRating;
}

export interface TreatmentResponse {
  overallResponse: ResponseQuality;
  specificInterventions: InterventionResponse[];
  homeExerciseResponse: HomeExerciseResponse;
  equipmentResponse?: EquipmentResponse;
  educationResponse: EducationResponse;
  sideEffects: SideEffect[];
  adherenceFactors: AdherenceFactors;
}

/**
 * O - Objectief (Objective)
 * Observable and measurable findings
 */
export interface Objectief {
  // Clinical observations
  observations: ClinicalObservation[];

  // Physical examination findings
  physicalExamination: PhysicalExaminationUpdate;

  // Measurements and tests
  measurements: MeasurementUpdate[];
  testResults: TestResult[];

  // Functional performance
  functionalPerformance: FunctionalPerformanceUpdate[];

  // Technology-assisted assessments
  technologyAssessments: TechnologyAssessment[];

  // Objective change indicators
  objectiveChanges: ObjectiveChange[];

  // Assessment validity
  assessmentQuality: AssessmentQuality;
}

export interface ClinicalObservation {
  category: ObservationCategory;
  finding: string;
  changeFromPrevious: 'improved' | 'worsened' | 'unchanged' | 'new' | 'resolved';
  significance: ClinicalSignificance;
  method: ObservationMethod;
  context: ObservationContext[];
  reliability: ReliabilityLevel;
}

export interface PhysicalExaminationUpdate {
  areasExamined: ExaminationArea[];
  newFindings: ExaminationFinding[];
  changedFindings: ExaminationFinding[];
  resolvedFindings: string[];
  limitations: ExaminationLimitation[];
  comparability: ComparabilityAssessment;
}

export interface MeasurementUpdate {
  parameter: MeasurementParameter;
  currentValue: MeasurementValue;
  previousValue?: MeasurementValue;
  change: MeasurementChange;
  interpretation: MeasurementInterpretation;
  clinicalRelevance: ClinicalRelevance;
  measurementQuality: MeasurementQuality;
}

export interface FunctionalPerformanceUpdate {
  task: FunctionalTask;
  performance: PerformanceAssessment;
  change: PerformanceChange;
  factors: PerformanceFactor[];
  reliability: PerformanceReliability;
  clinicalMeaning: ClinicalMeaning;
}

/**
 * E - Evaluatie (Evaluation)
 * Analysis and interpretation of subjective and objective findings
 */
export interface Evaluatie {
  // Progress assessment
  progressAssessment: ProgressAssessment;

  // Goal evaluation
  goalEvaluation: GoalEvaluation[];

  // Treatment effectiveness
  treatmentEffectiveness: TreatmentEffectiveness;

  // Problem list update
  problemListUpdate: ProblemListUpdate;

  // Diagnosis/condition update
  diagnosisUpdate: DiagnosisUpdate;

  // Prognosis update
  prognosisUpdate: PrognosisUpdate;

  // Barriers and facilitators
  barriersAndFacilitators: BarriersAndFacilitators;

  // Clinical reasoning
  clinicalReasoning: ClinicalReasoning;

  // Risk assessment
  riskAssessment: RiskAssessment;
}

export interface ProgressAssessment {
  overallProgress: ProgressRating;
  progressRate: ProgressRate;
  trajectoryPrediction: TrajectoryPrediction;
  milestones: MilestoneStatus[];
  unexpectedFindings: UnexpectedFinding[];
  progressBarriers: ProgressBarrier[];
  progressFacilitators: ProgressFacilitator[];
  confidenceLevel: ConfidenceLevel;
}

export interface GoalEvaluation {
  goalId: string;
  originalGoal: string;
  currentStatus: GoalStatus;
  progressRating: number; // 0-100 percentage
  timeframe: GoalTimeframe;
  modification: GoalModification;
  achievability: GoalAchievability;
  patientPerspective: PatientGoalPerspective;
  clinicalPerspective: ClinicalGoalPerspective;
}

export interface TreatmentEffectiveness {
  overallEffectiveness: EffectivenessRating;
  interventionEffectiveness: InterventionEffectiveness[];
  dosageAppropriateness: DosageAppropriateness;
  timingAppropriateness: TimingAppropriateness;
  individualResponse: IndividualResponseProfile;
  evidenceBasis: EvidenceBasis;
  modifications: TreatmentModification[];
}

/**
 * P - Plan (Plan)
 * Future treatment planning and actions
 */
export interface Plan {
  // Treatment modifications
  treatmentModifications: TreatmentModification[];

  // New interventions
  newInterventions: NewIntervention[];

  // Discontinued interventions
  discontinuedInterventions: DiscontinuedIntervention[];

  // Home exercise updates
  homeExerciseUpdates: HomeExerciseUpdate[];

  // Patient education updates
  patientEducationUpdates: PatientEducationUpdate[];

  // Equipment and aids
  equipmentRecommendations: EquipmentRecommendation[];

  // Referrals and consultations
  referrals: Referral[];

  // Follow-up schedule
  followUpSchedule: FollowUpSchedule;

  // Monitoring plan
  monitoringPlan: MonitoringPlan;

  // Discharge planning
  dischargePlanning?: DischargePlanning;

  // Contingency planning
  contingencyPlanning: ContingencyPlanning;
}

export interface TreatmentModification {
  intervention: InterventionIdentifier;
  modificationType: ModificationType;
  newParameters: InterventionParameters;
  rationale: string;
  expectedOutcome: ExpectedOutcome;
  timeframe: Timeframe;
  monitoringCriteria: MonitoringCriteria[];
  riskConsiderations: RiskConsideration[];
}

export interface NewIntervention {
  intervention: InterventionSpecification;
  rationale: string;
  evidence: EvidenceLevel;
  priority: Priority;
  implementation: ImplementationPlan;
  outcome: ExpectedOutcome;
  monitoring: MonitoringStrategy;
  duration: InterventionDuration;
}

export interface HomeExerciseUpdate {
  type: 'new' | 'modified' | 'progressed' | 'discontinued';
  exercise: ExerciseSpecification;
  modification?: ExerciseModification;
  rationale: string;
  progressionCriteria: ProgressionCriteria[];
  safetyConsiderations: SafetyConsideration[];
  patientEducation: ExerciseEducation;
}

export interface PatientEducationUpdate {
  topic: EducationTopic;
  type: 'new' | 'reinforcement' | 'modification' | 'advanced';
  method: EducationMethod[];
  materials: EducationMaterial[];
  assessment: EducationAssessment;
  followUp: EducationFollowUp;
}

export interface FollowUpSchedule {
  nextAppointment: NextAppointment;
  frequency: AppointmentFrequency;
  duration: AppointmentDuration;
  intensity: TreatmentIntensity;
  transitionPlanning: TransitionPlanning;
  alternatives: AlternativeOptions[];
}

/**
 * Supporting Types and Enums
 */

// Change and progression types
export type ChangeMagnitude = 'minimal' | 'small' | 'moderate' | 'large' | 'complete';
export type ChangeTimeframe = 'since-last-visit' | 'past-week' | 'past-month' | 'overall-treatment';
export type ProgressRating = 'excellent' | 'good' | 'fair' | 'poor' | 'none';
export type ProgressRate = 'faster-than-expected' | 'as-expected' | 'slower-than-expected' | 'no-progress' | 'regression';

// Quality and confidence indicators
export type ConfidenceLevel = 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
export type ReliabilityLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
export type ClinicalSignificance = 'highly-significant' | 'significant' | 'moderately-significant' | 'minimal' | 'not-significant';

// Assessment categories
export type ObservationCategory =
  | 'posture'
  | 'movement-quality'
  | 'gait'
  | 'muscle-tension'
  | 'swelling'
  | 'skin-condition'
  | 'equipment-use'
  | 'behavior'
  | 'communication';

export type ExaminationArea =
  | 'inspection'
  | 'palpation'
  | 'range-of-motion'
  | 'strength'
  | 'neurological'
  | 'special-tests'
  | 'functional-tests'
  | 'pain-assessment';

// Response and effectiveness ratings
export type ResponseQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'none' | 'adverse';
export type EffectivenessRating = 'highly-effective' | 'effective' | 'moderately-effective' | 'minimally-effective' | 'ineffective';
export type SatisfactionRating = 'very-satisfied' | 'satisfied' | 'neutral' | 'dissatisfied' | 'very-dissatisfied';

// Treatment and intervention types
export type ModificationType =
  | 'intensity-increase'
  | 'intensity-decrease'
  | 'frequency-change'
  | 'duration-change'
  | 'technique-modification'
  | 'parameter-adjustment'
  | 'approach-change';

export type Priority = 'high' | 'medium' | 'low';
export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'expert-opinion' | 'theoretical';

// Goal and outcome related
export type GoalStatus = 'achieved' | 'partially-achieved' | 'in-progress' | 'not-started' | 'discontinued';
export type GoalTimeframe = 'short-term' | 'medium-term' | 'long-term';
export type GoalAchievability = 'realistic' | 'challenging' | 'unrealistic' | 'needs-modification';

// Detailed supporting interfaces
export interface SymptomIdentifier {
  type: string;
  location: string;
  id?: string;
}

export interface ActivityIdentifier {
  category: string;
  description: string;
  id?: string;
}

export interface SymptomImpact {
  functional: 'none' | 'mild' | 'moderate' | 'severe';
  emotional: 'none' | 'mild' | 'moderate' | 'severe';
  social: 'none' | 'mild' | 'moderate' | 'severe';
  sleep: 'none' | 'mild' | 'moderate' | 'severe';
  overall: 'none' | 'mild' | 'moderate' | 'severe';
}

export interface ActivityContext {
  environment: string;
  assistance: string;
  equipment: string[];
  timing: string;
  conditions: string[];
}

export interface InterventionResponse {
  intervention: string;
  response: ResponseQuality;
  duration: string;
  notes: string;
}

export interface HomeExerciseResponse {
  compliance: ComplianceLevel;
  difficulty: DifficultyLevel;
  effectiveness: EffectivenessRating;
  barriers: string[];
  modifications: string[];
}

export interface NewConcern {
  description: string;
  severity: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'soon' | 'routine';
  category: 'symptom' | 'function' | 'psychosocial' | 'administrative' | 'other';
  patientPriority: Priority;
}

export interface ProgressPerception {
  rating: number; // 0-10 scale
  description: string;
  expectations: 'exceeded' | 'met' | 'partially-met' | 'not-met';
  satisfaction: SatisfactionRating;
  concerns: string[];
  motivationLevel: 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
}

export interface ComplianceAssessment {
  overallCompliance: ComplianceLevel;
  appointments: ComplianceLevel;
  homeExercises: ComplianceLevel;
  recommendations: ComplianceLevel;
  barriers: ComplianceBarrier[];
  facilitators: ComplianceFacilitator[];
}

export type ComplianceLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
export type DifficultyLevel = 'very-easy' | 'easy' | 'moderate' | 'difficult' | 'very-difficult';

export interface SOEPCompleteness {
  subjectief: number; // 0-100 percentage
  objectief: number; // 0-100 percentage
  evaluatie: number; // 0-100 percentage
  plan: number; // 0-100 percentage
  overall: number; // 0-100 percentage
  missingElements: string[];
}

export interface ReliabilityAssessment {
  subjectief: ReliabilityLevel;
  objectief: ReliabilityLevel;
  evaluatie: ReliabilityLevel;
  plan: ReliabilityLevel;
  overall: ReliabilityLevel;
  factors: string[];
}

// Red flags and safety
export interface RedFlag {
  category: RedFlagCategory;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  actionRequired: string;
  timeframe: 'immediate' | 'urgent' | 'routine';
  source: 'subjective' | 'objective' | 'evaluative' | 'external';
}

export type RedFlagCategory =
  | 'serious-pathology'
  | 'neurological-deterioration'
  | 'vascular-compromise'
  | 'infection'
  | 'fracture'
  | 'psychological-crisis'
  | 'medication-reaction'
  | 'treatment-adverse-effect'
  | 'safety-concern';

// Follow-up and communication
export interface FollowUpNeed {
  type: 'assessment' | 'treatment' | 'education' | 'coordination' | 'monitoring';
  priority: Priority;
  timeframe: string;
  responsibility: string;
  rationale: string;
}

export interface CommunicationNote {
  recipient: 'patient' | 'caregiver' | 'physician' | 'other-provider' | 'insurance';
  topic: string;
  urgency: 'routine' | 'important' | 'urgent';
  method: 'verbal' | 'written' | 'electronic' | 'phone';
  completed: boolean;
  dueDate?: string;
}

// Additional complex supporting types
export interface MeasurementValue {
  value: number | string;
  unit: string;
  method: string;
  conditions: string[];
  quality: MeasurementQuality;
}

export interface MeasurementChange {
  absolute: number;
  percentage: number;
  direction: 'improved' | 'worsened' | 'unchanged';
  significance: ClinicalSignificance;
  reliability: ReliabilityLevel;
}

export interface MeasurementQuality {
  accuracy: 'high' | 'moderate' | 'low' | 'unknown';
  precision: 'high' | 'moderate' | 'low' | 'unknown';
  comparability: 'excellent' | 'good' | 'fair' | 'poor';
  limitations: string[];
}

// Export main SOEP interface for external use
export type { SOEPStructure as SOEP };