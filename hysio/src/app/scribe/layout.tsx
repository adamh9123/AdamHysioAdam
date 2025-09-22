'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useSessionState } from '@/hooks/useSessionState';
import { PatientInfo, IntakeData, FollowupData, SOEPStructure } from '@/lib/types';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Home,
  Save
} from 'lucide-react';

// Create a context for sharing workflow state across pages
interface WorkflowContextType {
  patientInfo: PatientInfo | null;
  setPatientInfo: (info: PatientInfo | null) => void;
  sessionData: IntakeData | FollowupData | null;
  setSessionData: (data: IntakeData | FollowupData | null) => void;
  soepData: SOEPStructure | null;
  setSOEPData: (data: SOEPStructure | null) => void;
  currentWorkflow: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult' | null;
  setCurrentWorkflow: (workflow: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult' | null) => void;
  sessionState: ReturnType<typeof useSessionState>;
}

const WorkflowContext = React.createContext<WorkflowContextType | null>(null);

export const useWorkflowContext = () => {
  const context = React.useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
};

export default function ScribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [patientInfo, setPatientInfo] = React.useState<PatientInfo | null>(null);
  const [sessionData, setSessionData] = React.useState<IntakeData | FollowupData | null>(null);
  const [soepData, setSOEPData] = React.useState<SOEPStructure | null>(null);
  const [currentWorkflow, setCurrentWorkflow] = React.useState<'intake-automatisch' | 'intake-stapsgewijs' | 'consult' | null>(null);

  const sessionState = useSessionState({
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
  });

  const formatDuration = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSaveAndExit = () => {
    if (sessionState.isSessionActive) {
      sessionState.pauseSession();
    }
    window.location.href = '/dashboard';
  };

  const renderHeader = () => (
    <header className="bg-white border-b border-hysio-mint/20 p-4 mb-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hysio-mint/20 rounded-full flex items-center justify-center">
            <FileText size={20} className="text-hysio-deep-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-hysio-deep-green">
              Hysio Medical Scribe
            </h1>
            {patientInfo && (
              <p className="text-sm text-hysio-deep-green-900/70">
                {patientInfo.initials} ({patientInfo.birthYear}) -
                {currentWorkflow === 'intake-automatisch' ? ' Hysio Intake (Volledig Automatisch)' :
                 currentWorkflow === 'intake-stapsgewijs' ? ' Hysio Intake (Stapsgewijs)' :
                 currentWorkflow === 'consult' ? ' Hysio Consult (Vervolgconsult)' :
                 ' Hysio Medical Scribe'}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Session Status */}
          {sessionState.session.id && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-hysio-deep-green" />
                <span className="text-hysio-deep-green-900/80">
                  {formatDuration(sessionState.sessionDuration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {sessionState.isSessionActive && (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-700">Actief</span>
                  </>
                )}
                {sessionState.isSessionPaused && (
                  <>
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-amber-700">Gepauzeerd</span>
                  </>
                )}
                {sessionState.isSessionCompleted && (
                  <>
                    <CheckCircle size={14} className="text-green-600" />
                    <span className="text-green-700">Voltooid</span>
                  </>
                )}
              </div>

              {sessionState.hasUnsavedChanges && (
                <div className="flex items-center gap-1">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-amber-700 text-xs">Niet opgeslagen</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {sessionState.isSessionActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sessionState.pauseSession}
                className="text-hysio-deep-green"
              >
                <Pause size={14} className="mr-1" />
                Pauzeren
              </Button>
            )}

            {sessionState.isSessionPaused && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sessionState.resumeSession}
                className="text-hysio-deep-green"
              >
                <Play size={14} className="mr-1" />
                Hervatten
              </Button>
            )}

            {(sessionState.isSessionActive || sessionState.isSessionPaused) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={sessionState.manualSave}
                className="text-hysio-deep-green"
              >
                <Save size={14} className="mr-1" />
                Opslaan
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveAndExit}
            >
              <Home size={14} className="mr-1" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  const contextValue: WorkflowContextType = {
    patientInfo,
    setPatientInfo,
    sessionData,
    setSessionData,
    soepData,
    setSOEPData,
    currentWorkflow,
    setCurrentWorkflow,
    sessionState,
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      <div className="min-h-screen bg-hysio-cream/30">
        {renderHeader()}

        <main className="pb-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-hysio-mint/20 p-4 mt-8">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-hysio-deep-green-900/60">
              Hysio Medical Scribe - AI-ondersteunde fysiotherapie documentatie
            </p>
            <p className="text-xs text-hysio-deep-green-900/50 mt-1">
              Voldoet aan Nederlandse fysiotherapie richtlijnen (KNGF, DTF) -
              Alle AI-content moet worden geverifieerd door een bevoegd fysiotherapeut
            </p>
          </div>
        </footer>
      </div>
    </WorkflowContext.Provider>
  );
}