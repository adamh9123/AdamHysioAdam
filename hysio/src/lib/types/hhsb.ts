/**
 * HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) Methodology Types
 *
 * This module defines comprehensive TypeScript types for the HHSB methodology
 * used in physiotherapy documentation.
 */

/**
 * Core HHSB Structure
 * Represents the complete HHSB anamnesis card structure
 */
export interface HHSBAnamneseCard {
  // Patient identification
  patientId?: string;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;

  // Core HHSB components
  hulpvraag: Hulpvraag;
  historie: Historie;
  stoornissen: Stoornissen;
  beperkingen: Beperkingen;

  // Additional clinical information
  redFlags: RedFlag[];
  patientEducationNeeds: PatientEducationNeed[];
  culturalConsiderations?: CulturalConsideration[];

  // Metadata
  assessmentTools?: AssessmentTool[];
  reliability: ReliabilityIndicator;
  completeness: CompletenessIndicator;
}

/**
 * H - Hulpvraag (Help Request)
 * Patient's primary concern and goals
 */
export interface Hulpvraag {
  // Primary concerns
  primaryConcern: PrimaryConcern;
  secondaryConcerns?: SecondaryConcern[];

  // Patient goals and expectations
  patientGoals: PatientGoal[];
  expectations: PatientExpectation[];

  // Functional impact
  functionalLimitations: FunctionalLimitation[];
  qualityOfLifeImpact: QualityOfLifeImpact;

  // Context and urgency
  urgency: UrgencyLevel;
  context: HelpRequestContext;

  // Patient perspective
  patientUnderstanding: PatientUnderstanding;
  previousExperiences: PreviousTherapyExperience[];
}

export interface PrimaryConcern {
  description: string;
  location?: AnatomicalLocation[];
  onset: OnsetInformation;
  characteristics: SymptomCharacteristics;
  impact: ImpactAssessment;
  patientPriority: Priority;
}

export interface SecondaryConcern {
  description: string;
  location?: AnatomicalLocation[];
  relationToPrimary: 'related' | 'unrelated' | 'unclear';
  impact: ImpactAssessment;
}

export interface PatientGoal {
  id: string;
  description: string;
  type: 'functional' | 'pain-relief' | 'performance' | 'participation' | 'quality-of-life';
  timeframe: GoalTimeframe;
  measurability: GoalMeasurability;
  importance: Priority;
  achievability: 'realistic' | 'challenging' | 'unrealistic';
}

export interface PatientExpectation {
  description: string;
  type: 'treatment-outcome' | 'treatment-method' | 'timeline' | 'provider-behavior';
  realism: 'realistic' | 'partially-realistic' | 'unrealistic';
  alignment: 'aligned' | 'partially-aligned' | 'misaligned';
}

/**
 * H - Historie (History)
 * Comprehensive patient history information
 */
export interface Historie {
  // Current episode
  currentEpisode: CurrentEpisode;

  // Historical information
  symptomTimeline: TimelineEvent[];
  previousEpisodes: PreviousEpisode[];

  // Medical history
  relevantMedicalHistory: MedicalHistoryItem[];
  medications: Medication[];
  surgicalHistory: SurgicalHistoryItem[];

  // Treatment history
  previousTreatments: PreviousTreatment[];
  currentTreatments: CurrentTreatment[];

  // Lifestyle and psychosocial
  lifestyleFactors: LifestyleFactor[];
  psychosocialFactors: PsychosocialFactor[];

  // Family and occupational history
  familyHistory: FamilyHistoryItem[];
  occupationalHistory: OccupationalHistoryItem[];

  // Sport and activity history
  sportHistory: SportHistoryItem[];
  activityLevel: ActivityLevel;
}

export interface CurrentEpisode {
  onset: OnsetInformation;
  duration: Duration;
  progression: ProgressionPattern;
  currentSeverity: SeverityRating;
  variability: SymptomVariability;
  triggeringEvents: TriggeringEvent[];
  relievingFactors: RelievingFactor[];
  aggravatingFactors: AggravatingFactor[];
}

export interface TimelineEvent {
  date: string | 'unknown';
  event: string;
  type: 'symptom-change' | 'treatment' | 'injury' | 'life-event' | 'medical-event';
  significance: 'high' | 'medium' | 'low';
  impact: string;
  verified: boolean;
}

export interface PreviousEpisode {
  timeframe: string;
  description: string;
  similarity: 'identical' | 'similar' | 'different';
  resolution: EpisodeResolution;
  treatmentReceived?: string[];
  lessons: string[];
}

/**
 * S - Stoornissen (Impairments)
 * Body structure and function impairments
 */
export interface Stoornissen {
  // Body function impairments
  bodyFunctionImpairments: BodyFunctionImpairment[];

  // Body structure impairments
  bodyStructureImpairments: BodyStructureImpairment[];

  // System-specific impairments
  musculoskeletalImpairments: MusculoskeletalImpairment[];
  neurologicalImpairments: NeurologicalImpairment[];
  cardiovascularImpairments: CardiovascularImpairment[];
  respiratoryImpairments: RespiratoryImpairment[];

  // Pain-related impairments
  painImpairments: PainImpairment[];

  // Cognitive and psychological impairments
  cognitiveImpairments: CognitiveImpairment[];
  psychologicalImpairments: PsychologicalImpairment[];

  // Sensory impairments
  sensoryImpairments: SensoryImpairment[];

  // Composite impairment patterns
  impairmentPatterns: ImpairmentPattern[];
}

export interface BodyFunctionImpairment {
  icfCode?: string;
  category: ICFBodyFunction;
  description: string;
  severity: SeverityRating;
  impact: ImpactAssessment;
  measurable: boolean;
  measurement?: Measurement;
  progression: ProgressionPattern;
  relationToOtherImpairments: ImpairmentRelation[];
}

export interface BodyStructureImpairment {
  icfCode?: string;
  category: ICFBodyStructure;
  description: string;
  severity: SeverityRating;
  location: AnatomicalLocation;
  type: StructuralImpairmentType;
  verified: boolean;
  verificationMethod?: string;
  impact: ImpactAssessment;
}

export interface MusculoskeletalImpairment {
  type: 'strength' | 'endurance' | 'flexibility' | 'coordination' | 'stability' | 'alignment';
  location: AnatomicalLocation[];
  description: string;
  severity: SeverityRating;
  testing: TestingInformation;
  functionalImpact: string[];
  compensations: CompensationPattern[];
}

/**
 * B - Beperkingen (Limitations)
 * Activity limitations and participation restrictions
 */
export interface Beperkingen {
  // Activity limitations
  activityLimitations: ActivityLimitation[];

  // Participation restrictions
  participationRestrictions: ParticipationRestriction[];

  // Environmental factors
  environmentalFactors: EnvironmentalFactor[];

  // Personal factors
  personalFactors: PersonalFactor[];

  // Composite limitation patterns
  limitationPatterns: LimitationPattern[];

  // Adaptation and compensation
  adaptations: Adaptation[];
  compensations: Compensation[];
}

export interface ActivityLimitation {
  icfCode?: string;
  category: ICFActivity;
  description: string;
  severity: SeverityRating;
  frequency: FrequencyRating;
  importance: Priority;
  workarounds: Workaround[];
  assistance: AssistanceRequirement;
  safety: SafetyConsideration[];
  progression: ProgressionPattern;
  measurement?: FunctionalMeasurement;
}

export interface ParticipationRestriction {
  icfCode?: string;
  category: ICFParticipation;
  description: string;
  severity: SeverityRating;
  impact: ParticipationImpact;
  barriers: Barrier[];
  facilitators: Facilitator[];
  socialSupport: SocialSupport;
  modifications: ParticipationModification[];
}

export interface EnvironmentalFactor {
  icfCode?: string;
  category: ICFEnvironment;
  description: string;
  type: 'barrier' | 'facilitator' | 'neutral';
  impact: ImpactAssessment;
  modifiability: 'easily-modifiable' | 'moderately-modifiable' | 'difficult-to-modify' | 'non-modifiable';
  interventionPotential: string[];
}

/**
 * Supporting Types and Enums
 */

// Severity and rating scales
export type SeverityRating = 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
export type Priority = 'high' | 'medium' | 'low';
export type FrequencyRating = 'never' | 'rarely' | 'sometimes' | 'often' | 'always';
export type UrgencyLevel = 'emergency' | 'urgent' | 'semi-urgent' | 'routine';

// Temporal information
export interface Duration {
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  qualifier?: 'approximately' | 'less-than' | 'more-than' | 'exactly';
}

export interface OnsetInformation {
  type: 'sudden' | 'gradual' | 'insidious' | 'unknown';
  timeframe: string;
  precipitatingEvent?: PrecipitatingEvent;
  circumstances: string[];
  certainty: 'certain' | 'probable' | 'possible' | 'unknown';
}

export interface PrecipitatingEvent {
  type: 'trauma' | 'overuse' | 'illness' | 'surgery' | 'life-event' | 'unknown';
  description: string;
  relationship: 'direct-cause' | 'contributing-factor' | 'coincidental' | 'unclear';
}

// Anatomical and location information
export interface AnatomicalLocation {
  region: AnatomicalRegion;
  side: 'left' | 'right' | 'bilateral' | 'central' | 'not-applicable';
  specificity: 'general' | 'specific' | 'precise';
  description: string;
  verified: boolean;
}

export type AnatomicalRegion =
  | 'head-neck'
  | 'cervical-spine'
  | 'thoracic-spine'
  | 'lumbar-spine'
  | 'sacroiliac'
  | 'shoulder'
  | 'elbow'
  | 'wrist-hand'
  | 'thorax'
  | 'hip'
  | 'knee'
  | 'ankle-foot'
  | 'systemic'
  | 'multiple-regions';

// Symptom characteristics
export interface SymptomCharacteristics {
  type: SymptomType[];
  quality: SymptomQuality[];
  intensity: IntensityRating;
  variability: SymptomVariability;
  pattern: TemporalPattern;
  radiation: RadiationPattern[];
  associated: AssociatedSymptom[];
}

export type SymptomType = 'pain' | 'stiffness' | 'weakness' | 'numbness' | 'tingling' | 'swelling' | 'instability' | 'fatigue' | 'other';
export type SymptomQuality = 'sharp' | 'dull' | 'aching' | 'burning' | 'throbbing' | 'stabbing' | 'cramping' | 'electric' | 'other';

export interface IntensityRating {
  current: number; // 0-10 scale
  average: number; // 0-10 scale
  worst: number; // 0-10 scale
  best: number; // 0-10 scale
  scale: 'numeric-0-10' | 'visual-analog' | 'faces' | 'verbal-descriptor';
}

export interface SymptomVariability {
  pattern: 'constant' | 'intermittent' | 'fluctuating' | 'unpredictable';
  triggers: Trigger[];
  relievers: Reliever[];
  timing: TimingPattern[];
}

// ICF Categories (simplified)
export type ICFBodyFunction =
  | 'mental-functions'
  | 'sensory-functions'
  | 'voice-speech-functions'
  | 'cardiovascular-functions'
  | 'respiratory-functions'
  | 'digestive-functions'
  | 'genitourinary-functions'
  | 'neuromusculoskeletal-functions'
  | 'skin-functions';

export type ICFBodyStructure =
  | 'nervous-system'
  | 'eye-ear-structures'
  | 'voice-speech-structures'
  | 'cardiovascular-structures'
  | 'respiratory-structures'
  | 'digestive-structures'
  | 'genitourinary-structures'
  | 'movement-structures'
  | 'skin-structures';

export type ICFActivity =
  | 'learning-applying-knowledge'
  | 'general-tasks-demands'
  | 'communication'
  | 'mobility'
  | 'self-care'
  | 'domestic-life'
  | 'interpersonal-interactions'
  | 'major-life-areas'
  | 'community-social-civic-life';

export type ICFParticipation =
  | 'education'
  | 'work-employment'
  | 'economic-life'
  | 'community-life'
  | 'recreation-leisure'
  | 'religion-spirituality'
  | 'political-life'
  | 'family-relationships'
  | 'intimate-relationships'
  | 'social-relationships';

export type ICFEnvironment =
  | 'products-technology'
  | 'natural-environment'
  | 'support-relationships'
  | 'attitudes'
  | 'services-systems-policies';

// Assessment and measurement
export interface Measurement {
  value: number | string;
  unit: string;
  method: string;
  date: string;
  assessor: string;
  reliability: ReliabilityIndicator;
  validity: ValidityIndicator;
  interpretation: string;
  reference?: ReferenceValue;
}

export interface FunctionalMeasurement {
  test: string;
  result: string | number;
  interpretation: 'normal' | 'mildly-impaired' | 'moderately-impaired' | 'severely-impaired';
  comparison?: ComparisonData;
  limitations: string[];
}

export interface TestingInformation {
  method: TestingMethod;
  results: TestResult[];
  limitations: TestingLimitation[];
  reliability: ReliabilityIndicator;
  validity: ValidityIndicator;
}

export type TestingMethod = 'manual' | 'instrumented' | 'functional' | 'standardized' | 'observation';

export interface TestResult {
  parameter: string;
  value: string | number;
  unit?: string;
  interpretation: string;
  reference?: ReferenceValue;
}

// Additional supporting interfaces
export interface RedFlag {
  category: RedFlagCategory;
  description: string;
  severity: 'high' | 'medium' | 'low';
  actionRequired: string;
  timeframe: 'immediate' | 'urgent' | 'routine';
  verified: boolean;
}

export type RedFlagCategory =
  | 'serious-pathology'
  | 'neurological-compromise'
  | 'vascular-compromise'
  | 'inflammatory-condition'
  | 'fracture'
  | 'infection'
  | 'psychological-distress'
  | 'medication-related'
  | 'other';

export interface PatientEducationNeed {
  category: EducationCategory;
  description: string;
  priority: Priority;
  method: EducationMethod[];
  timeframe: string;
  resources: EducationResource[];
}

export type EducationCategory =
  | 'condition-understanding'
  | 'self-management'
  | 'exercise-instruction'
  | 'lifestyle-modification'
  | 'prevention'
  | 'pain-management'
  | 'activity-modification'
  | 'ergonomics'
  | 'equipment-use';

export type EducationMethod = 'verbal' | 'written' | 'demonstration' | 'video' | 'digital' | 'hands-on';

export interface EducationResource {
  type: 'handout' | 'video' | 'app' | 'website' | 'book' | 'demonstration';
  title: string;
  source?: string;
  language: string;
  accessibility: AccessibilityFeature[];
}

export interface CulturalConsideration {
  category: CulturalCategory;
  description: string;
  impact: ImpactAssessment;
  accommodations: string[];
}

export type CulturalCategory =
  | 'language-barriers'
  | 'religious-considerations'
  | 'cultural-beliefs'
  | 'family-dynamics'
  | 'gender-considerations'
  | 'socioeconomic-factors'
  | 'healthcare-beliefs'
  | 'communication-styles';

export interface AssessmentTool {
  name: string;
  category: AssessmentCategory;
  score?: number | string;
  interpretation: string;
  date: string;
  validity: ValidityIndicator;
  clinicalUtility: ClinicalUtility;
}

export type AssessmentCategory =
  | 'pain-scale'
  | 'functional-scale'
  | 'quality-of-life'
  | 'psychological-screening'
  | 'activity-specific'
  | 'participation-measure'
  | 'impairment-measure'
  | 'global-rating';

// Quality indicators
export interface ReliabilityIndicator {
  level: 'high' | 'moderate' | 'low' | 'unknown';
  factors: string[];
  limitations: string[];
}

export interface ValidityIndicator {
  level: 'high' | 'moderate' | 'low' | 'unknown';
  factors: string[];
  limitations: string[];
}

export interface ClinicalUtility {
  relevance: 'high' | 'moderate' | 'low';
  actionability: string[];
  limitations: string[];
}

export interface CompletenessIndicator {
  hulpvraag: number; // 0-100 percentage
  historie: number; // 0-100 percentage
  stoornissen: number; // 0-100 percentage
  beperkingen: number; // 0-100 percentage
  overall: number; // 0-100 percentage
  missingElements: string[];
  recommendations: string[];
}

// Patterns and relationships
export interface ImpairmentPattern {
  name: string;
  description: string;
  components: string[];
  significance: 'primary' | 'secondary' | 'compensatory';
  evidence: string[];
}

export interface LimitationPattern {
  name: string;
  description: string;
  components: string[];
  impact: ImpactAssessment;
  interventionPotential: string[];
}

export interface CompensationPattern {
  description: string;
  effectiveness: 'effective' | 'partially-effective' | 'ineffective' | 'harmful';
  consequences: string[];
  modifiability: 'easily-modifiable' | 'moderately-modifiable' | 'difficult-to-modify';
}

// Additional supporting types
export interface ImpactAssessment {
  functional: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
  participation: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
  qualityOfLife: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
  psychological: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
  social: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
  economic: 'none' | 'mild' | 'moderate' | 'severe' | 'complete';
}

export interface QualityOfLifeImpact extends ImpactAssessment {
  domains: QualityOfLifeDomain[];
  globalRating: number; // 0-10 scale
  comparison: ComparisonTimeframe[];
}

export interface QualityOfLifeDomain {
  name: 'physical' | 'emotional' | 'social' | 'occupational' | 'recreational' | 'spiritual' | 'financial';
  impact: SeverityRating;
  importance: Priority;
  description: string;
}

// Utility types for complex data structures
export type ProgressionPattern = 'improving' | 'stable' | 'worsening' | 'fluctuating' | 'unclear';
export type GoalTimeframe = 'short-term' | 'medium-term' | 'long-term';
export type EpisodeResolution = 'complete' | 'partial' | 'minimal' | 'none' | 'unknown';
export type StructuralImpairmentType = 'absence' | 'deficiency' | 'additional-part' | 'aberrant-dimensions' | 'discontinuity' | 'deviating-position' | 'qualitative-change';

// Export main HHSB interface for external use
export type { HHSBAnamneseCard as HHSB };