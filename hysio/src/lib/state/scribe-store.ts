import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
}

interface ScribeState {
  patientInfo: PatientInfo | null;
  setPatientInfo: (info: PatientInfo | null) => void;

  workflowData: {
    anamneseData: WorkflowStepData<AnamneseResult> | null;
    onderzoekData: WorkflowStepData<OnderzoekResult> | null;
    klinischeConclusieData: WorkflowStepData<KlinischeConclusieResult> | null;
    automatedIntakeData: WorkflowStepData<AutomatedIntakeResult> | null;
    consultData: WorkflowStepData<ConsultResult> | null;
    completedSteps: string[];
  };
  setAnamneseData: (data: Partial<WorkflowStepData<AnamneseResult>>) => void;
  setOnderzoekData: (data: Partial<WorkflowStepData<OnderzoekResult>>) => void;
  setKlinischeConclusieData: (data: Partial<WorkflowStepData<KlinischeConclusieResult>>) => void;
  setAutomatedIntakeData: (data: Partial<WorkflowStepData<AutomatedIntakeResult>>) => void;
  setConsultData: (data: Partial<WorkflowStepData<ConsultResult>>) => void;
  markStepComplete: (step: string) => void;

  sessionData: Record<string, unknown> | null;
  setSessionData: (data: Record<string, unknown> | null) => void;

  soepData: SOEPStructure | null;
  setSOEPData: (data: SOEPStructure | null) => void;

  currentWorkflow: WorkflowType | null;
  setCurrentWorkflow: (workflow: WorkflowType | null) => void;

  resetScribeState: () => void;
}

const initialState = {
  patientInfo: null,
  workflowData: {
    anamneseData: null,
    onderzoekData: null,
    klinischeConclusieData: null,
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
        state.workflowData.anamneseData = { ...state.workflowData.anamneseData, ...data };
      }),

      setOnderzoekData: (data) => set((state) => {
        state.workflowData.onderzoekData = { ...state.workflowData.onderzoekData, ...data };
      }),

      setKlinischeConclusieData: (data) => set((state) => {
        state.workflowData.klinischeConclusieData = { ...state.workflowData.klinischeConclusieData, ...data };
      }),

      setAutomatedIntakeData: (data) => set((state) => {
        state.workflowData.automatedIntakeData = { ...state.workflowData.automatedIntakeData, ...data };
      }),

      setConsultData: (data) => set((state) => {
        state.workflowData.consultData = { ...state.workflowData.consultData, ...data };
      }),

      markStepComplete: (step) => set((state) => {
        if (!state.workflowData.completedSteps.includes(step)) {
          state.workflowData.completedSteps.push(step);
        }
      }),

      setSessionData: (data) => set({ sessionData: data }),
      setSOEPData: (data) => set({ soepData: data }),
      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),

      resetScribeState: () => set(initialState),
    })),
    {
      name: 'hysio-scribe-v1',
      version: 1,
    }
  )
);