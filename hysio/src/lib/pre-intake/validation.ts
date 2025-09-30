/**
 * Validation Schemas for Pre-intake Module
 *
 * Zod-based validation schemas for questionnaire data, API requests,
 * and data integrity checks. Provides both runtime validation and
 * TypeScript type inference.
 *
 * @module lib/pre-intake/validation
 */

import { z } from 'zod';
import { BODY_REGIONS, MAX_LENGTHS, VAS_SCALE } from './constants';
import { UI_MESSAGES } from './constants';

// ============================================================================
// CUSTOM VALIDATORS
// ============================================================================

/**
 * Email validator (Dutch format friendly)
 */
const emailSchema = z
  .string()
  .email(UI_MESSAGES.invalidEmail)
  .max(MAX_LENGTHS.email, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.email));

/**
 * Phone validator (Dutch phone numbers: +31, 06, etc.)
 */
const phoneSchema = z
  .string()
  .min(10, 'Telefoonnummer moet minimaal 10 cijfers bevatten')
  .max(MAX_LENGTHS.phone, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.phone))
  .regex(/^(\+31|0)[0-9]{9}$|^[0-9]{10}$/, 'Voer een geldig Nederlands telefoonnummer in');

/**
 * Date validator (YYYY-MM-DD format, not in future)
 */
const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum moet in formaat JJJJ-MM-DD zijn')
  .refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      return birthDate <= today;
    },
    { message: 'Geboortedatum kan niet in de toekomst liggen' }
  )
  .refine(
    (date) => {
      const birthDate = new Date(date);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    },
    { message: 'Voer een geldige geboortedatum in' }
  );

/**
 * Body region validator
 */
const bodyRegionSchema = z.enum(BODY_REGIONS as [string, ...string[]]);

// ============================================================================
// SECTION SCHEMAS
// ============================================================================

/**
 * Personalia section validation
 */
export const PersonaliaSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Naam moet minimaal 2 tekens bevatten')
    .max(MAX_LENGTHS.name, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.name)),
  birthDate: birthDateSchema,
  phone: phoneSchema,
  email: emailSchema,
  insurance: z.string().min(1, UI_MESSAGES.requiredField),
  insuranceNumber: z.string().optional(),
});

/**
 * Complaint section validation (LOFTIG)
 */
export const ComplaintSchema = z.object({
  locations: z
    .array(bodyRegionSchema)
    .min(1, 'Selecteer minimaal 1 locatie op de lichaamskaart')
    .max(10, 'Selecteer maximaal 10 locaties'),
  onset: z
    .string()
    .min(10, 'Beschrijf hoe de klacht is ontstaan (minimaal 10 tekens)')
    .max(MAX_LENGTHS.mediumText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.mediumText)),
  frequency: z.enum(['constant', 'daily', 'weekly', 'occasionally']),
  duration: z.enum(['<1week', '1-4weeks', '1-3months', '>3months']),
  intensity: z
    .number()
    .min(VAS_SCALE.min, `Pijnscore moet minimaal ${VAS_SCALE.min} zijn`)
    .max(VAS_SCALE.max, `Pijnscore moet maximaal ${VAS_SCALE.max} zijn`)
    .int('Pijnscore moet een geheel getal zijn'),
  hasOccurredBefore: z.boolean(),
  previousOccurrenceDetails: z
    .string()
    .max(MAX_LENGTHS.mediumText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.mediumText))
    .optional(),
});

/**
 * Red flags section validation
 */
export const RedFlagsSchema = z.object({
  unexplainedWeightLoss: z.boolean(),
  nightSweatsOrFever: z.boolean(),
  bladderBowelProblems: z.boolean(),
  feelingVeryIll: z.boolean(),
  painNotDecreasingWithRest: z.boolean(),
  regionSpecific: z.record(z.string(), z.boolean()).optional(),
});

/**
 * Medical history section validation
 */
export const MedicalHistorySchema = z.object({
  hasRecentSurgeries: z.boolean(),
  surgeryDetails: z
    .string()
    .max(MAX_LENGTHS.mediumText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.mediumText))
    .optional(),
  takesMedication: z.boolean(),
  medications: z.array(z.string().max(100, 'Medicatienaam te lang')).max(20, 'Maximaal 20 medicijnen').optional(),
  otherConditions: z
    .string()
    .max(MAX_LENGTHS.longText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.longText))
    .optional(),
  smokingStatus: z.enum(['yes', 'no', 'stopped']),
  alcoholConsumption: z.enum(['never', 'sometimes', 'regularly']),
});

/**
 * Goals section validation (SCEGS)
 */
export const GoalsSchema = z.object({
  treatmentGoals: z
    .string()
    .min(10, 'Beschrijf uw behandeldoelen (minimaal 10 tekens)')
    .max(MAX_LENGTHS.mediumText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.mediumText)),
  thoughtsOnCause: z
    .string()
    .min(5, 'Deel uw gedachten over de oorzaak (minimaal 5 tekens)')
    .max(MAX_LENGTHS.shortText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.shortText)),
  moodImpact: z.enum(['not', 'little', 'moderate', 'much']),
  limitedActivities: z
    .string()
    .min(5, 'Beschrijf welke activiteiten beperkt zijn (minimaal 5 tekens)')
    .max(MAX_LENGTHS.mediumText, UI_MESSAGES.maxLengthExceeded(MAX_LENGTHS.mediumText)),
});

/**
 * Functional limitations section validation
 */
export const FunctionalLimitationsSchema = z.object({
  limitedActivityCategories: z
    .array(z.enum(['work', 'sports', 'household', 'driving', 'sleeping', 'hobbies', 'social', 'other']))
    .min(1, 'Selecteer minimaal 1 beperkte activiteit')
    .max(8, 'Selecteer maximaal 8 activiteiten'),
  customActivity: z.string().max(100, 'Aangepaste activiteit te lang').optional(),
  severityScores: z.record(
    z.string(),
    z.number().min(0, 'Score moet minimaal 0 zijn').max(10, 'Score moet maximaal 10 zijn').int('Score moet een geheel getal zijn')
  ),
});

// ============================================================================
// COMPLETE QUESTIONNAIRE SCHEMA
// ============================================================================

/**
 * Complete questionnaire validation (all sections)
 */
export const PreIntakeQuestionnaireSchema = z.object({
  personalia: PersonaliaSchema,
  complaint: ComplaintSchema,
  redFlags: RedFlagsSchema,
  medicalHistory: MedicalHistorySchema,
  goals: GoalsSchema,
  functionalLimitations: FunctionalLimitationsSchema,
});

/**
 * Partial questionnaire validation (for drafts)
 */
export const PartialPreIntakeQuestionnaireSchema = z.object({
  personalia: PersonaliaSchema.partial().optional(),
  complaint: ComplaintSchema.partial().optional(),
  redFlags: RedFlagsSchema.partial().optional(),
  medicalHistory: MedicalHistorySchema.partial().optional(),
  goals: GoalsSchema.partial().optional(),
  functionalLimitations: FunctionalLimitationsSchema.partial().optional(),
});

// ============================================================================
// API REQUEST SCHEMAS
// ============================================================================

/**
 * Save draft request validation
 */
export const SaveDraftRequestSchema = z.object({
  sessionId: z.string().uuid('Session ID moet een geldige UUID zijn'),
  questionnaireData: PartialPreIntakeQuestionnaireSchema,
  currentStep: z.number().min(0, 'Stap moet minimaal 0 zijn').max(8, 'Stap moet maximaal 8 zijn'),
});

/**
 * Submit pre-intake request validation
 */
export const SubmitPreIntakeRequestSchema = z.object({
  sessionId: z.string().uuid('Session ID moet een geldige UUID zijn'),
  questionnaireData: PreIntakeQuestionnaireSchema,
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'Toestemming is verplicht om door te gaan' }),
  }),
});

/**
 * Process HHSB request validation
 */
export const ProcessHHSBRequestSchema = z.object({
  submissionId: z.string().uuid('Submission ID moet een geldige UUID zijn'),
});

/**
 * Import pre-intake request validation
 */
export const ImportPreIntakeRequestSchema = z.object({
  preIntakeId: z.string().uuid('Pre-intake ID moet een geldige UUID zijn'),
});

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate complete questionnaire data
 *
 * @param data - Questionnaire data to validate
 * @returns Validation result with parsed data or errors
 */
export function validateQuestionnaire(data: unknown) {
  return PreIntakeQuestionnaireSchema.safeParse(data);
}

/**
 * Validate partial questionnaire data (for drafts)
 *
 * @param data - Partial questionnaire data to validate
 * @returns Validation result with parsed data or errors
 */
export function validatePartialQuestionnaire(data: unknown) {
  return PartialPreIntakeQuestionnaireSchema.safeParse(data);
}

/**
 * Validate individual section
 *
 * @param section - Section name
 * @param data - Section data to validate
 * @returns Validation result
 */
export function validateSection(
  section: 'personalia' | 'complaint' | 'redFlags' | 'medicalHistory' | 'goals' | 'functionalLimitations',
  data: unknown
) {
  const schemas = {
    personalia: PersonaliaSchema,
    complaint: ComplaintSchema,
    redFlags: RedFlagsSchema,
    medicalHistory: MedicalHistorySchema,
    goals: GoalsSchema,
    functionalLimitations: FunctionalLimitationsSchema,
  };

  return schemas[section].safeParse(data);
}

/**
 * Extract validation errors as user-friendly messages
 *
 * @param errors - Zod error object
 * @returns Record of field paths to error messages
 */
export function extractValidationErrors(errors: z.ZodError): Record<string, string> {
  const errorMap: Record<string, string> = {};

  errors.errors.forEach((error) => {
    const path = error.path.join('.');
    errorMap[path] = error.message;
  });

  return errorMap;
}

/**
 * Validate email format (standalone)
 *
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const result = emailSchema.safeParse(email);
  return result.success;
}

/**
 * Validate phone format (standalone)
 *
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  const result = phoneSchema.safeParse(phone);
  return result.success;
}

/**
 * Validate birth date (standalone)
 *
 * @param date - Date string to validate
 * @returns True if valid
 */
export function isValidBirthDate(date: string): boolean {
  const result = birthDateSchema.safeParse(date);
  return result.success;
}

/**
 * Check if questionnaire data is complete enough for submission
 *
 * @param data - Questionnaire data
 * @returns True if complete and valid
 */
export function isQuestionnaireComplete(data: unknown): boolean {
  const result = PreIntakeQuestionnaireSchema.safeParse(data);
  return result.success;
}

/**
 * Get completion percentage of questionnaire
 *
 * @param data - Partial questionnaire data
 * @returns Percentage (0-100) of completion
 */
export function getCompletionPercentage(data: any): number {
  if (!data || typeof data !== 'object') return 0;

  const sections = ['personalia', 'complaint', 'redFlags', 'medicalHistory', 'goals', 'functionalLimitations'];
  let completedSections = 0;

  sections.forEach((section) => {
    if (data[section] && Object.keys(data[section]).length > 0) {
      const sectionResult = validateSection(section as any, data[section]);
      if (sectionResult.success) {
        completedSections++;
      }
    }
  });

  return Math.round((completedSections / sections.length) * 100);
}