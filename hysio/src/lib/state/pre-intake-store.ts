/**
 * Pre-intake Questionnaire State Management
 *
 * Zustand store with Immer middleware for managing patient questionnaire flow,
 * auto-save functionality, progress tracking, and draft persistence.
 *
 * @module lib/state/pre-intake-store
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  PreIntakeQuestionnaireData,
  QuestionnaireStep,
  PersonaliaData,
  ComplaintData,
  RedFlagsData,
  MedicalHistoryData,
  GoalsData,
  FunctionalLimitationsData,
} from '@/types/pre-intake';
import { QUESTIONNAIRE_STEPS } from '@/lib/pre-intake/constants';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface PreIntakeState {
  // Session management
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Current step
  currentStep: QuestionnaireStep;
  setCurrentStep: (step: QuestionnaireStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: QuestionnaireStep) => void;

  // Questionnaire data
  questionnaireData: Partial<PreIntakeQuestionnaireData>;
  setPersonalia: (data: Partial<PersonaliaData>) => void;
  setComplaint: (data: Partial<ComplaintData>) => void;
  setRedFlags: (data: Partial<RedFlagsData>) => void;
  setMedicalHistory: (data: Partial<MedicalHistoryData>) => void;
  setGoals: (data: Partial<GoalsData>) => void;
  setFunctionalLimitations: (data: Partial<FunctionalLimitationsData>) => void;
  setQuestionnaireData: (data: Partial<PreIntakeQuestionnaireData>) => void;

  // Draft management
  isDraftLoading: boolean;
  setIsDraftLoading: (loading: boolean) => void;
  lastSavedAt: string | null;
  setLastSavedAt: (timestamp: string | null) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  saveError: string | null;
  setSaveError: (error: string | null) => void;

  // Submission state
  isSubmitting: boolean;
  setIsSubmitting: (submitting: boolean) => void;
  submissionId: string | null;
  setSubmissionId: (id: string | null) => void;
  submitError: string | null;
  setSubmitError: (error: string | null) => void;

  // Progress tracking
  completedSteps: QuestionnaireStep[];
  markStepComplete: (step: QuestionnaireStep) => void;
  isStepCompleted: (step: QuestionnaireStep) => boolean;
  getProgressPercentage: () => number;
  getCompletedStepsCount: () => number;

  // Validation
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
  clearValidationErrors: () => void;

  // Consent
  consentGiven: boolean;
  setConsentGiven: (given: boolean) => void;

  // Utilities
  canProceedToStep: (step: QuestionnaireStep) => boolean;
  resetState: () => void;
  loadDraft: (draft: {
    questionnaireData: Partial<PreIntakeQuestionnaireData>;
    currentStep: QuestionnaireStep;
    lastSavedAt: string;
  }) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  sessionId: null,
  currentStep: 'welcome' as QuestionnaireStep,
  questionnaireData: {},
  isDraftLoading: false,
  lastSavedAt: null,
  isSaving: false,
  saveError: null,
  isSubmitting: false,
  submissionId: null,
  submitError: null,
  completedSteps: [],
  validationErrors: {},
  consentGiven: false,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const usePreIntakeStore = create<PreIntakeState>()(
  immer((set, get) => ({
    ...initialState,

    // Session management
    setSessionId: (id) => set({ sessionId: id }),

    // Current step navigation
    setCurrentStep: (step) => set({ currentStep: step }),

    goToNextStep: () => {
      const currentIndex = QUESTIONNAIRE_STEPS.indexOf(get().currentStep);
      if (currentIndex < QUESTIONNAIRE_STEPS.length - 1) {
        set({ currentStep: QUESTIONNAIRE_STEPS[currentIndex + 1] });
      }
    },

    goToPreviousStep: () => {
      const currentIndex = QUESTIONNAIRE_STEPS.indexOf(get().currentStep);
      if (currentIndex > 0) {
        set({ currentStep: QUESTIONNAIRE_STEPS[currentIndex - 1] });
      }
    },

    goToStep: (step) => {
      if (get().canProceedToStep(step)) {
        set({ currentStep: step });
      }
    },

    // Questionnaire data setters
    setPersonalia: (data) =>
      set((state) => {
        state.questionnaireData.personalia = {
          ...state.questionnaireData.personalia,
          ...data,
        } as PersonaliaData;
      }),

    setComplaint: (data) =>
      set((state) => {
        state.questionnaireData.complaint = {
          ...state.questionnaireData.complaint,
          ...data,
        } as ComplaintData;
      }),

    setRedFlags: (data) =>
      set((state) => {
        state.questionnaireData.redFlags = {
          ...state.questionnaireData.redFlags,
          ...data,
        } as RedFlagsData;
      }),

    setMedicalHistory: (data) =>
      set((state) => {
        state.questionnaireData.medicalHistory = {
          ...state.questionnaireData.medicalHistory,
          ...data,
        } as MedicalHistoryData;
      }),

    setGoals: (data) =>
      set((state) => {
        state.questionnaireData.goals = {
          ...state.questionnaireData.goals,
          ...data,
        } as GoalsData;
      }),

    setFunctionalLimitations: (data) =>
      set((state) => {
        state.questionnaireData.functionalLimitations = {
          ...state.questionnaireData.functionalLimitations,
          ...data,
        } as FunctionalLimitationsData;
      }),

    setQuestionnaireData: (data) =>
      set((state) => {
        state.questionnaireData = {
          ...state.questionnaireData,
          ...data,
        };
      }),

    // Draft management
    setIsDraftLoading: (loading) => set({ isDraftLoading: loading }),
    setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),
    setIsSaving: (saving) => set({ isSaving: saving }),
    setSaveError: (error) => set({ saveError: error }),

    // Submission state
    setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
    setSubmissionId: (id) => set({ submissionId: id }),
    setSubmitError: (error) => set({ submitError: error }),

    // Progress tracking
    markStepComplete: (step) =>
      set((state) => {
        if (!state.completedSteps.includes(step)) {
          state.completedSteps.push(step);
        }
      }),

    isStepCompleted: (step) => {
      return get().completedSteps.includes(step);
    },

    getProgressPercentage: () => {
      const totalSteps = QUESTIONNAIRE_STEPS.length;
      const completedCount = get().completedSteps.length;
      return Math.round((completedCount / totalSteps) * 100);
    },

    getCompletedStepsCount: () => {
      return get().completedSteps.length;
    },

    // Validation
    setValidationErrors: (errors) => set({ validationErrors: errors }),
    clearValidationErrors: () => set({ validationErrors: {} }),

    // Consent
    setConsentGiven: (given) => set({ consentGiven: given }),

    // Utilities
    canProceedToStep: (targetStep) => {
      const currentIndex = QUESTIONNAIRE_STEPS.indexOf(get().currentStep);
      const targetIndex = QUESTIONNAIRE_STEPS.indexOf(targetStep);

      // Can always go back
      if (targetIndex <= currentIndex) {
        return true;
      }

      // Can only go forward to next step or previously completed steps
      if (targetIndex === currentIndex + 1) {
        return true;
      }

      return get().isStepCompleted(targetStep);
    },

    resetState: () => {
      set(initialState);
    },

    loadDraft: (draft) => {
      set({
        questionnaireData: draft.questionnaireData,
        currentStep: draft.currentStep,
        lastSavedAt: draft.lastSavedAt,
      });
    },
  }))
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get current step index (0-based)
 */
export function useCurrentStepIndex(): number {
  const currentStep = usePreIntakeStore((state) => state.currentStep);
  return QUESTIONNAIRE_STEPS.indexOf(currentStep);
}

/**
 * Check if on first step
 */
export function useIsFirstStep(): boolean {
  const index = useCurrentStepIndex();
  return index === 0;
}

/**
 * Check if on last step
 */
export function useIsLastStep(): boolean {
  const index = useCurrentStepIndex();
  return index === QUESTIONNAIRE_STEPS.length - 1;
}

/**
 * Get total number of steps
 */
export function useTotalSteps(): number {
  return QUESTIONNAIRE_STEPS.length;
}