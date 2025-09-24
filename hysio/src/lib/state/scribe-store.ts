import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PatientInfo } from '@/types/api';

interface ScribeState {
  patientInfo: PatientInfo | null;
  setPatientInfo: (info: PatientInfo | null) => void;

  workflowData: {
    anamneseData: any | null;
    onderzoekData: any | null;
    klinischeConclusieData: any | null;
    automatedIntakeData: any | null;
    consultData: any | null;
    completedSteps: string[];
  };
  setAnamneseData: (data: any) => void;
  setOnderzoekData: (data: any) => void;
  setKlinischeConclusieData: (data: any) => void;
  setAutomatedIntakeData: (data: any) => void;
  setConsultData: (data: any) => void;
  markStepComplete: (step: string) => void;

  sessionData: any | null;
  setSessionData: (data: any | null) => void;

  soepData: any | null;
  setSOEPData: (data: any | null) => void;

  currentWorkflow: string | null;
  setCurrentWorkflow: (workflow: string | null) => void;

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