// Loading states and progress indicators for SmartMail AI generation
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain, FileText, CheckCircle, Clock } from 'lucide-react';

interface LoadingStateProps {
  stage: 'analyzing' | 'generating' | 'reviewing' | 'finalizing';
  progress?: number;
  message?: string;
  estimatedTime?: number;
}

export function SmartMailLoadingState({ 
  stage, 
  progress = 0, 
  message,
  estimatedTime 
}: LoadingStateProps) {
  const stages = [
    {
      id: 'analyzing',
      label: 'Context analyseren',
      description: 'AI analyseert uw context en documenten',
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      id: 'generating',
      label: 'Email genereren',
      description: 'AI stelt professionele email samen',
      icon: Sparkles,
      color: 'text-purple-600'
    },
    {
      id: 'reviewing',
      label: 'Inhoud controleren',
      description: 'Controleren op medische nauwkeurigheid',
      icon: FileText,
      color: 'text-orange-600'
    },
    {
      id: 'finalizing',
      label: 'Afronden',
      description: 'Email voorbereiden voor controle',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === stage);
  const currentStage = stages[currentStageIndex];
  const Icon = currentStage?.icon || Sparkles;

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="p-8 text-center space-y-6">
          {/* Main Icon and Animation */}
          <div className="relative">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon className={`w-8 h-8 ${currentStage?.color || 'text-blue-600'} animate-pulse`} />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-2 border-blue-200 animate-spin border-t-blue-600"></div>
          </div>

          {/* Stage Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">{currentStage?.label}</h3>
            <p className="text-sm text-gray-600">
              {message || currentStage?.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Voortgang</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-center space-x-2">
            {stages.map((stageItem, index) => {
              const StageIcon = stageItem.icon;
              const isActive = index === currentStageIndex;
              const isCompleted = index < currentStageIndex;
              
              return (
                <div
                  key={stageItem.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : isActive
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  <StageIcon className="w-4 h-4" />
                </div>
              );
            })}
          </div>

          {/* Estimated Time */}
          {estimatedTime && (
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-2" />
              <span>Geschatte tijd: {estimatedTime} seconden</span>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Wist je dat...</h4>
            <p className="text-xs text-blue-700">
              SmartMail analyseert je context om de meest geschikte toon en 
              medische terminologie te kiezen voor je specifieke ontvanger.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton loader for email content
export function EmailContentSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// Progress indicator for multi-step workflow
export function WorkflowProgress({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: { 
  currentStep: number; 
  totalSteps: number; 
  stepLabels: string[] 
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Stap {currentStep} van {totalSteps}</span>
        <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
      <div className="flex justify-between mt-2">
        {stepLabels.map((label, index) => (
          <span 
            key={index}
            className={`text-xs ${
              index < currentStep 
                ? 'text-green-600' 
                : index === currentStep - 1 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-400'
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}