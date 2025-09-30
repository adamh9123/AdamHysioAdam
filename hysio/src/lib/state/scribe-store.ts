import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PatientInfo,
  AnamneseResult,
  OnderzoekResult,
  KlinischeConclusieResult,
  AutomatedIntakeResult,
  ConsultResult,
  SOEPStructure,
  WorkflowType
} from '@/types/api';

interface WorkflowStepData<T> {
  preparation?: string;
  recording?: File | null;
  transcript?: string;
  result?: T;
  completed?: boolean;
  completedAt?: string;
  processingDuration?: number;
  validationErrors?: string[];
}

interface ScribeState {
  patientInfo: PatientInfo | null;
  setPatientInfo: (info: PatientInfo | null) => void;

  workflowData: {
    anamneseData: WorkflowStepData<AnamneseResult> | null;
    onderzoekData: WorkflowStepData<OnderzoekResult> | null;
    klinischeConclusieData: WorkflowStepData<KlinischeConclusieResult> | null;
    zorgplanData: WorkflowStepData<any> | null;
    automatedIntakeData: WorkflowStepData<AutomatedIntakeResult> | null;
    consultData: WorkflowStepData<ConsultResult> | null;
    completedSteps: string[];
  };
  setAnamneseData: (data: Partial<WorkflowStepData<AnamneseResult>>) => void;
  setOnderzoekData: (data: Partial<WorkflowStepData<OnderzoekResult>>) => void;
  setKlinischeConclusieData: (data: Partial<WorkflowStepData<KlinischeConclusieResult>>) => void;
  setZorgplanData: (data: Partial<WorkflowStepData<any>>) => void;
  setAutomatedIntakeData: (data: Partial<WorkflowStepData<AutomatedIntakeResult>>) => void;
  setConsultData: (data: Partial<WorkflowStepData<ConsultResult>>) => void;
  markStepComplete: (step: string) => void;

  sessionData: Record<string, unknown> | null;
  setSessionData: (data: Record<string, unknown> | null) => void;

  soepData: SOEPStructure | null;
  setSOEPData: (data: SOEPStructure | null) => void;

  currentWorkflow: WorkflowType | null;
  setCurrentWorkflow: (workflow: WorkflowType | null) => void;

  // Enhanced data flow utilities
  validateStepDependencies: (step: string) => { isValid: boolean; missingSteps: string[] };
  getWorkflowProgress: (workflow: WorkflowType) => { completed: number; total: number; percentage: number };
  canProceedToStep: (step: string) => boolean;
  getStepData: <T>(step: string) => WorkflowStepData<T> | null;
  isStepCompleted: (step: string) => boolean;
  getCompletedStepsCount: () => number;
  getAllStepData: () => Record<string, WorkflowStepData<any>>;
  clearStepData: (step: string) => void;

  resetScribeState: () => void;
}

const initialState = {
  patientInfo: null,
  workflowData: {
    anamneseData: null,
    onderzoekData: null,
    klinischeConclusieData: null,
    zorgplanData: null,
    automatedIntakeData: null,
    consultData: null,
    completedSteps: [],
  },
  sessionData: null,
  soepData: null,
  currentWorkflow: null,
};

export const useScribeStore = create<ScribeState>()(
  persist(
    immer((set) => ({
      ...initialState,

      setPatientInfo: (info) => set({ patientInfo: info }),

      setAnamneseData: (data) => set((state) => {
        // ✅ IMMER FIX: Direct mutation instead of spread operators
        if (!state.workflowData.anamneseData) {
          state.workflowData.anamneseData = {};
        }
        Object.assign(state.workflowData.anamneseData, data);
        if (data.completed) {
          state.workflowData.anamneseData.completedAt = new Date().toISOString();
        }
      }),

      setOnderzoekData: (data) => set((state) => {
        // ✅ IMMER FIX: Direct mutation instead of spread operators
        if (!state.workflowData.onderzoekData) {
          state.workflowData.onderzoekData = {};
        }
        Object.assign(state.workflowData.onderzoekData, data);
        if (data.completed) {
          state.workflowData.onderzoekData.completedAt = new Date().toISOString();
        }
      }),

      setKlinischeConclusieData: (data) => set((state) => {
        // ✅ IMMER FIX: Direct mutation instead of spread operators
        if (!state.workflowData.klinischeConclusieData) {
          state.workflowData.klinischeConclusieData = {};
        }
        Object.assign(state.workflowData.klinischeConclusieData, data);
        if (data.completed) {
          state.workflowData.klinischeConclusieData.completedAt = new Date().toISOString();
        }
      }),

      setZorgplanData: (data) => set((state) => {
        // ✅ IMMER FIX: Direct mutation instead of spread operators
        if (!state.workflowData.zorgplanData) {
          state.workflowData.zorgplanData = {};
        }
        Object.assign(state.workflowData.zorgplanData, data);
        if (data.completed) {
          state.workflowData.zorgplanData.completedAt = new Date().toISOString();
        }
      }),

      setAutomatedIntakeData: (data) => set((state) => {
        // ✅ IMMER FIX: Direct mutation instead of spread operators
        if (!state.workflowData.automatedIntakeData) {
          state.workflowData.automatedIntakeData = {};
        }
        Object.assign(state.workflowData.automatedIntakeData, data);
        if (data.completed) {
          state.workflowData.automatedIntakeData.completedAt = new Date().toISOString();
        }
      }),

      setConsultData: (data) => set((state) => {
        // ✅ IMMER FIX: Direct mutation instead of spread operators
        if (!state.workflowData.consultData) {
          state.workflowData.consultData = {};
        }
        Object.assign(state.workflowData.consultData, data);
        if (data.completed) {
          state.workflowData.consultData.completedAt = new Date().toISOString();
        }
      }),

      markStepComplete: (step) => set((state) => {
        if (!state.workflowData.completedSteps.includes(step)) {
          state.workflowData.completedSteps.push(step);
        }
      }),

      setSessionData: (data) => set({ sessionData: data }),
      setSOEPData: (data) => set({ soepData: data }),
      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

      // Enhanced data flow utilities
      validateStepDependencies: (step) => {
        const { workflowData } = useScribeStore.getState();
        const stepDependencies: Record<string, string[]> = {
          'anamnese': [],
          'anamnese-resultaat': ['anamnese'],
          'onderzoek': ['anamnese'],
          'onderzoek-resultaat': ['onderzoek'],
          'klinische-conclusie': ['anamnese', 'onderzoek'],
          'zorgplan': ['anamnese', 'onderzoek', 'klinische-conclusie'],
          'conclusie': ['anamnese', 'onderzoek', 'klinische-conclusie', 'zorgplan'],
        };

        const requiredSteps = stepDependencies[step] || [];
        const missingSteps = requiredSteps.filter(reqStep =>
          !workflowData.completedSteps.includes(reqStep)
        );

        return {
          isValid: missingSteps.length === 0,
          missingSteps
        };
      },

      getWorkflowProgress: (workflow) => {
        const { workflowData } = useScribeStore.getState();

        const workflowSteps: Record<WorkflowType, string[]> = {
          'intake-stapsgewijs': ['anamnese', 'onderzoek', 'klinische-conclusie', 'zorgplan'],
          'intake-automatisch': ['intake'],
          'consult': ['consult']
        };

        const steps = workflowSteps[workflow] || [];
        const completedSteps = steps.filter(step =>
          workflowData.completedSteps.includes(step)
        );

        return {
          completed: completedSteps.length,
          total: steps.length,
          percentage: steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0
        };
      },

      canProceedToStep: (step) => {
        const validation = useScribeStore.getState().validateStepDependencies(step);
        return validation.isValid;
      },

      getStepData: (step) => {
        const { workflowData } = useScribeStore.getState();
        const stepDataMap: Record<string, keyof typeof workflowData> = {
          'anamnese': 'anamneseData',
          'anamnese-resultaat': 'anamneseData',
          'onderzoek': 'onderzoekData',
          'onderzoek-resultaat': 'onderzoekData',
          'klinische-conclusie': 'klinischeConclusieData',
          'zorgplan': 'zorgplanData',
          'conclusie': 'klinischeConclusieData',
          'intake': 'automatedIntakeData',
          'consult': 'consultData'
        };

        const dataKey = stepDataMap[step];
        return dataKey ? workflowData[dataKey] : null;
      },

      isStepCompleted: (step) => {
        const { workflowData } = useScribeStore.getState();
        return workflowData.completedSteps.includes(step);
      },

      getCompletedStepsCount: () => {
        const { workflowData } = useScribeStore.getState();
        return workflowData.completedSteps.length;
      },

      getAllStepData: () => {
        const { workflowData } = useScribeStore.getState();
        return {
          anamnese: workflowData.anamneseData,
          onderzoek: workflowData.onderzoekData,
          klinischeConclusie: workflowData.klinischeConclusieData,
          zorgplan: workflowData.zorgplanData,
          automatedIntake: workflowData.automatedIntakeData,
          consult: workflowData.consultData
        };
      },

      clearStepData: (step) => set((state) => {
        const stepDataMap: Record<string, keyof typeof state.workflowData> = {
          'anamnese': 'anamneseData',
          'onderzoek': 'onderzoekData',
          'klinische-conclusie': 'klinischeConclusieData',
          'zorgplan': 'zorgplanData',
          'intake': 'automatedIntakeData',
          'consult': 'consultData'
        };

        const dataKey = stepDataMap[step];
        if (dataKey && dataKey !== 'completedSteps') {
          (state.workflowData as any)[dataKey] = null;
        }

        // Remove from completed steps
        state.workflowData.completedSteps = state.workflowData.completedSteps.filter(s => s !== step);
      }),

    resetScribeState: () => set(initialState),
    })),
    {
      name: 'hysio-scribe-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        patientInfo: state.patientInfo,
        workflowData: state.workflowData,
        currentWorkflow: state.currentWorkflow,
        soepData: state.soepData,
        // sessionData is NOT persisted - it's session-specific
      }),
      version: 1,
    }
  )
);