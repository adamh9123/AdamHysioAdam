'use client';

import * as React from 'react';
import { useScribeStore } from '@/lib/state/scribe-store';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  Heart,
  Activity,
  Calendar,
  Award
} from 'lucide-react';
import type { WorkflowType } from '@/types/api';

interface WorkflowProgressProps {
  workflow: WorkflowType;
  currentStep?: string;
  showDetailedSteps?: boolean;
  className?: string;
}

interface StepConfig {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  estimatedMinutes: number;
}

const WORKFLOW_STEPS: Record<WorkflowType, StepConfig[]> = {
  'intake-stapsgewijs': [
    {
      key: 'anamnese',
      title: 'Anamnese',
      description: 'HHSB anamnesekaart genereren',
      icon: Heart,
      estimatedMinutes: 15
    },
    {
      key: 'onderzoek',
      title: 'Onderzoek',
      description: 'Fysiek onderzoek uitvoeren',
      icon: Activity,
      estimatedMinutes: 20
    },
    {
      key: 'klinische-conclusie',
      title: 'Klinische Conclusie',
      description: 'Diagnose en behandelplan',
      icon: Calendar,
      estimatedMinutes: 10
    }
  ],
  'intake-automatisch': [
    {
      key: 'intake',
      title: 'Automatische Intake',
      description: 'Volledige intake in één stap',
      icon: Award,
      estimatedMinutes: 20
    }
  ],
  'consult': [
    {
      key: 'consult',
      title: 'Vervolgconsult',
      description: 'SOEP verslag genereren',
      icon: Activity,
      estimatedMinutes: 15
    }
  ]
};

export function WorkflowProgress({
  workflow,
  currentStep,
  showDetailedSteps = false,
  className = ''
}: WorkflowProgressProps) {
  const {
    getWorkflowProgress,
    isStepCompleted,
    getStepData,
    validateStepDependencies
  } = useScribeStore();

  const progress = getWorkflowProgress(workflow);
  const steps = WORKFLOW_STEPS[workflow] || [];

  const getStepStatus = (stepKey: string) => {
    const isCompleted = isStepCompleted(stepKey);
    const isCurrent = currentStep === stepKey;
    const stepData = getStepData(stepKey);
    const validation = validateStepDependencies(stepKey);

    if (isCompleted) {
      return {
        status: 'completed' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      };
    }

    if (isCurrent) {
      return {
        status: 'current' as const,
        icon: Clock,
        color: 'text-hysio-deep-green',
        bgColor: 'bg-hysio-mint/20',
        borderColor: 'border-hysio-mint'
      };
    }

    if (!validation.isValid) {
      return {
        status: 'blocked' as const,
        icon: AlertCircle,
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200'
      };
    }

    return {
      status: 'available' as const,
      icon: Circle,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    };
  };

  const formatEstimatedTime = () => {
    const totalMinutes = steps.reduce((total, step) => {
      const isCompleted = isStepCompleted(step.key);
      return total + (isCompleted ? 0 : step.estimatedMinutes);
    }, 0);

    if (totalMinutes === 0) return 'Voltooid';
    if (totalMinutes < 60) return `${totalMinutes} min restant`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}u ${minutes}m restant`;
  };

  const getProgressColor = () => {
    if (progress.percentage === 100) return 'bg-green-500';
    if (progress.percentage >= 66) return 'bg-hysio-deep-green';
    if (progress.percentage >= 33) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  if (!showDetailedSteps) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Compact Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-hysio-deep-green">
              Voortgang Workflow
            </span>
            <span className="text-sm text-hysio-deep-green-900/70">
              {progress.completed} van {progress.total}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress.percentage} className="h-2" />
            <div className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${getProgressColor()}`}
                 style={{ width: `${progress.percentage}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs text-hysio-deep-green-900/60">
            <span>{progress.percentage}% voltooid</span>
            <span>{formatEstimatedTime()}</span>
          </div>
        </div>

        {/* Step Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {steps.map((step) => {
            const stepStatus = getStepStatus(step.key);
            const StepIcon = stepStatus.icon;

            return (
              <Badge
                key={step.key}
                variant="outline"
                className={`${stepStatus.color} ${stepStatus.borderColor} ${stepStatus.bgColor}`}
              >
                <StepIcon size={12} className="mr-1" />
                {step.title}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-hysio-deep-green">Workflow Voortgang</CardTitle>
            <CardDescription>
              {progress.completed} van {progress.total} stappen voltooid ({progress.percentage}%)
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-hysio-deep-green border-hysio-mint">
            {formatEstimatedTime()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="relative">
              <Progress value={progress.percentage} className="h-3" />
              <div className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                   style={{ width: `${progress.percentage}%` }} />
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const stepStatus = getStepStatus(step.key);
              const StepIcon = step.icon;
              const StatusIcon = stepStatus.icon;
              const stepData = getStepData(step.key);
              const isCurrent = currentStep === step.key;

              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    isCurrent
                      ? 'border-hysio-mint bg-hysio-mint/5 ring-1 ring-hysio-mint/20'
                      : stepStatus.borderColor + ' ' + stepStatus.bgColor
                  }`}
                >
                  {/* Step Number/Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stepStatus.status === 'completed' ? 'bg-green-100' :
                    stepStatus.status === 'current' ? 'bg-hysio-mint/30' : 'bg-gray-100'
                  }`}>
                    {stepStatus.status === 'completed' ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <span className={`text-xs font-semibold ${stepStatus.color}`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StepIcon size={16} className={stepStatus.color} />
                      <h4 className={`font-medium ${stepStatus.color}`}>
                        {step.title}
                      </h4>
                      <StatusIcon size={14} className={stepStatus.color} />
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>

                    {/* Step Metadata */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>~{step.estimatedMinutes} min</span>
                      {stepData?.completedAt && (
                        <span>
                          Voltooid: {new Date(stepData.completedAt).toLocaleTimeString('nl-NL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                      {stepStatus.status === 'blocked' && (
                        <span className="text-amber-600">
                          Wacht op vorige stappen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant={stepStatus.status === 'completed' ? 'default' : 'outline'}
                    className={
                      stepStatus.status === 'completed'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : stepStatus.status === 'current'
                          ? 'border-hysio-mint text-hysio-deep-green'
                          : 'text-gray-500 border-gray-200'
                    }
                  >
                    {stepStatus.status === 'completed' && 'Voltooid'}
                    {stepStatus.status === 'current' && 'Actief'}
                    {stepStatus.status === 'blocked' && 'Geblokkeerd'}
                    {stepStatus.status === 'available' && 'Beschikbaar'}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Summary Footer */}
          {progress.percentage === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Workflow succesvol voltooid!
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}