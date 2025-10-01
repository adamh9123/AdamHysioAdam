'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkflowNavigation } from '@/hooks/useWorkflowNavigation';
import { useWorkflowResumption } from '@/lib/utils/workflow-resumption';
import { useScribeStore } from '@/lib/state/scribe-store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  PlayCircle,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import type { WorkflowInterruption, ResumptionResult } from '@/lib/utils/workflow-resumption';

interface WorkflowResumptionDialogProps {
  onResume?: () => void;
  onRestart?: () => void;
  onDismiss?: () => void;
}

export function WorkflowResumptionDialog({
  onResume,
  onRestart,
  onDismiss
}: WorkflowResumptionDialogProps) {
  const router = useRouter();
  const { navigateToStep } = useWorkflowNavigation();
  const { setCurrentWorkflow } = useScribeStore();
  const {
    checkForInterruption,
    analyzeResumption,
    executeResumption,
    clearInterruption,
    getResumptionSummary
  } = useWorkflowResumption();

  const [interruption, setInterruption] = React.useState<WorkflowInterruption | null>(null);
  const [resumptionResult, setResumptionResult] = React.useState<ResumptionResult | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isResuming, setIsResuming] = React.useState(false);

  // Check for interruptions on component mount
  React.useEffect(() => {
    const detected = checkForInterruption();
    if (detected) {
      setInterruption(detected);
      setIsOpen(true);
      analyzeInterruption(detected);
    }
  }, []);

  const analyzeInterruption = async (detected: WorkflowInterruption) => {
    setIsAnalyzing(true);
    try {
      const result = analyzeResumption(detected, {
        validateSteps: true,
        preservePartialInput: true,
        resumeFromLastValid: true
      });
      setResumptionResult(result);
    } catch (error) {
      console.error('Failed to analyze workflow resumption:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResume = async () => {
    if (!interruption || !resumptionResult) return;

    setIsResuming(true);
    try {
      const success = await executeResumption(interruption, resumptionResult);

      if (success) {
        setCurrentWorkflow(interruption.workflowType);
        await navigateToStep(resumptionResult.recommendedStep);
        clearInterruption();
        setIsOpen(false);
        onResume?.();
      } else {
        console.error('Failed to resume workflow');
      }
    } catch (error) {
      console.error('Error during workflow resumption:', error);
    } finally {
      setIsResuming(false);
    }
  };

  const handleRestart = () => {
    if (!interruption) return;

    clearInterruption();
    setCurrentWorkflow(interruption.workflowType);

    // Navigate to workflow start
    const workflowPaths = {
      'intake-stapsgewijs': '/scribe/intake-stapsgewijs',
      'intake-automatisch': '/scribe/intake-automatisch',
      'consult': '/scribe/consult'
    };

    router.push(workflowPaths[interruption.workflowType]);
    setIsOpen(false);
    onRestart?.();
  };

  const handleDismiss = () => {
    clearInterruption();
    setIsOpen(false);
    onDismiss?.();
  };

  if (!interruption || !isOpen) {
    return null;
  }

  const summary = getResumptionSummary(interruption);

  const getRiskIcon = () => {
    switch (summary.riskLevel) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskBadgeColor = () => {
    switch (summary.riskLevel) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIntegrityIcon = () => {
    if (!resumptionResult) return <Clock className="h-4 w-4 text-gray-400" />;

    switch (resumptionResult.dataIntegrity) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'corrupted': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getRiskIcon()}
            <div>
              <AlertDialogTitle className="text-hysio-deep-green">
                {summary.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {summary.description} • {summary.timeAgo}
              </AlertDialogDescription>
            </div>
            <Badge className={getRiskBadgeColor()}>
              {summary.riskLevel === 'low' && 'Laag risico'}
              {summary.riskLevel === 'medium' && 'Gemiddeld risico'}
              {summary.riskLevel === 'high' && 'Hoog risico'}
            </Badge>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Analysis Status */}
          {isAnalyzing && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-hysio-deep-green">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Workflow data analyseren...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumption Analysis Results */}
          {resumptionResult && !isAnalyzing && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getIntegrityIcon()}
                  Data Integriteit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge variant="outline" className={
                      resumptionResult.dataIntegrity === 'complete' ? 'text-green-700 border-green-300' :
                      resumptionResult.dataIntegrity === 'partial' ? 'text-yellow-700 border-yellow-300' :
                      'text-red-700 border-red-300'
                    }>
                      {resumptionResult.dataIntegrity === 'complete' && 'Compleet'}
                      {resumptionResult.dataIntegrity === 'partial' && 'Gedeeltelijk'}
                      {resumptionResult.dataIntegrity === 'corrupted' && 'Beschadigd'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aanbevolen stap</span>
                    <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
                      {resumptionResult.recommendedStep}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Beschikbare stappen</span>
                    <span className="text-sm font-medium">{resumptionResult.availableSteps.length}</span>
                  </div>

                  {resumptionResult.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">Waarschuwingen</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {resumptionResult.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resumptionResult.requiredActions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Benodigde acties</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {resumptionResult.requiredActions.map((action, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="sm:order-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Negeren
          </Button>

          <Button
            variant="outline"
            onClick={handleRestart}
            className="sm:order-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw starten
          </Button>

          {resumptionResult?.canResume && (
            <AlertDialogAction asChild>
              <Button
                onClick={handleResume}
                disabled={isResuming}
                className="sm:order-3 bg-hysio-deep-green hover:bg-hysio-deep-green/90"
              >
                {isResuming ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Hervatten...
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Hervatten
                  </>
                )}
              </Button>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for automatically checking and handling workflow resumption
export function useAutomaticWorkflowResumption() {
  const [hasChecked, setHasChecked] = React.useState(false);
  const { checkForInterruption, saveInterruption } = useWorkflowResumption();

  // Save interruption on beforeunload
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      const store = useScribeStore.getState();
      if (store.currentWorkflow) {
        // Try to determine current step from URL or state
        const currentStep = window.location.pathname.split('/').pop() || 'unknown';
        saveInterruption(store.currentWorkflow, currentStep, 'browser_close');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveInterruption]);

  // Check for interruption on page visibility change
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !hasChecked) {
        const interruption = checkForInterruption();
        if (interruption) {
          console.log('Workflow interruption detected on visibility change:', interruption);
        }
        setHasChecked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkForInterruption, hasChecked]);

  const checkForInterruptionManually = React.useCallback(() => {
    return checkForInterruption();
  }, [checkForInterruption]);

  const markInterruption = React.useCallback((workflowType: any, currentStep: string, reason: any) => {
    saveInterruption(workflowType, currentStep, reason);
  }, [saveInterruption]);

  return {
    checkForInterruption: checkForInterruptionManually,
    markInterruption,
    hasChecked
  };
}