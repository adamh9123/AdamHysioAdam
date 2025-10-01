'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { useSessionState } from '@/hooks/useSessionState';
import { useScribeStore } from '@/lib/state/scribe-store';
import { WorkflowErrorBoundary } from '@/components/workflow-error-boundary';
import { HysioAssistant } from '@/components/scribe/hysio-assistant';
import { WorkflowResumptionDialog, useAutomaticWorkflowResumption } from '@/components/scribe/workflow-resumption-dialog';
// Persistence disabled per user request
// import { useAutoPersistence } from '@/lib/utils/auto-persistence';
// import { PersistenceStatusCompact } from '@/components/ui/persistence-status';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Home,
  Save,
  MessageCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

// Zustand store now handles workflow state - no more context needed

export default function ScribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get state from Zustand store (replaces local useState)
  const patientInfo = useScribeStore(state => state.patientInfo);
  const currentWorkflow = useScribeStore(state => state.currentWorkflow);

  const sessionState = useSessionState({
    autoSave: false, // DISABLED per user request
    autoSaveInterval: 30000, // 30 seconds
  });

  // Workflow resumption capability
  const { checkForInterruption, markInterruption } = useAutomaticWorkflowResumption();

  // Auto-persistence system DISABLED per user request
  // const { isInitialized: isPersistenceInitialized, status: persistenceStatus } = useAutoPersistence({
  //   autoSaveInterval: 10000, // Save every 10 seconds
  //   immediateFields: ['result', 'completed', 'transcript'],
  //   crossTabSync: true
  // });

  // Hysio Assistant state
  const [assistantVisible, setAssistantVisible] = React.useState(false);
  const [assistantMinimized, setAssistantMinimized] = React.useState(false);

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
                {currentWorkflow === 'intake-automatisch' ? ' Hysio Intake (Automatisch)' :
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

              {/* Auto-persistence status DISABLED */}
              {/* <PersistenceStatusCompact
                isInitialized={isPersistenceInitialized}
                status={persistenceStatus}
              /> */}
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
              onClick={() => setAssistantVisible(!assistantVisible)}
              className="text-hysio-deep-green border-hysio-mint"
            >
              <MessageCircle size={14} className="mr-1" />
              AI Assistant
            </Button>

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

  return (
      <WorkflowErrorBoundary workflowName="Hysio Medical Scribe">
        <div className="min-h-screen bg-hysio-cream/30">
          {renderHeader()}

          {/* Workflow Resumption Dialog */}
          <WorkflowResumptionDialog
            onResume={() => console.log('Workflow resumed successfully')}
            onRestart={() => console.log('Workflow restarted successfully')}
            onDismiss={() => console.log('Workflow resumption dismissed')}
          />

          <main className="pb-8">
            {children}
          </main>

        {/* Floating Hysio Assistant */}
        {assistantVisible && patientInfo && (
          <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)]">
            <HysioAssistant
              patientInfo={patientInfo}
              workflowType={currentWorkflow as any}
              workflowStep={currentWorkflow === 'intake-stapsgewijs' ? 'anamnese' :
                          currentWorkflow === 'consult' ? 'consult' : 'intake'}
              currentContext={{}}
              minimized={assistantMinimized}
              onToggleMinimize={() => setAssistantMinimized(!assistantMinimized)}
              onClose={() => setAssistantVisible(false)}
              className="shadow-2xl border border-hysio-mint/30"
            />
          </div>
        )}

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
      </WorkflowErrorBoundary>
  );
}