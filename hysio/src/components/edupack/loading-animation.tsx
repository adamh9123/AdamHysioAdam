// Enhanced Loading Animation for EduPack Generation
// Modern, engaging loading animation with progress steps and smooth transitions

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Brain,
  FileText,
  Sparkles,
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';

interface EduPackLoadingAnimationProps {
  className?: string;
  message?: string;
  progress?: number;
}

interface LoadingStep {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  duration: number;
}

const loadingSteps: LoadingStep[] = [
  {
    icon: Brain,
    title: 'Inhoud analyseren',
    description: 'AI analyseert uw sessiegegevens...',
    duration: 3000
  },
  {
    icon: Sparkles,
    title: 'B1-Nederlands genereren',
    description: 'Complexe termen worden omgezet naar begrijpelijke taal...',
    duration: 4000
  },
  {
    icon: FileText,
    title: 'Secties samenstellen',
    description: 'Gepersonaliseerde secties worden opgebouwd...',
    duration: 3000
  },
  {
    icon: CheckCircle,
    title: 'Validatie & afronding',
    description: 'Kwaliteit en leesbaarheid worden gecontroleerd...',
    duration: 2000
  }
];

export function EduPackLoadingAnimation({
  className,
  message,
  progress
}: EduPackLoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    let stepTimer: NodeJS.Timeout;
    let progressTimer: NodeJS.Timeout;

    const startStepProgress = () => {
      setStepProgress(0);
      const duration = loadingSteps[currentStep]?.duration || 3000;
      const increment = 100 / (duration / 50); // Update every 50ms

      progressTimer = setInterval(() => {
        setStepProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressTimer);
            return 100;
          }
          return prev + increment;
        });
      }, 50);
    };

    const nextStep = () => {
      if (currentStep < loadingSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    };

    startStepProgress();

    if (stepProgress >= 100 && currentStep < loadingSteps.length - 1) {
      stepTimer = setTimeout(nextStep, 500);
    }

    return () => {
      clearTimeout(stepTimer);
      clearInterval(progressTimer);
    };
  }, [currentStep, stepProgress]);

  // Reset animation when progress prop changes
  useEffect(() => {
    if (progress === 0) {
      setCurrentStep(0);
      setStepProgress(0);
    }
  }, [progress]);

  const CurrentIcon = loadingSteps[currentStep]?.icon || Activity;

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-6 p-8', className)}>
      {/* Central animated icon with pulsing effect */}
      <div className="relative">
        {/* Outer ring with rotation */}
        <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-hysio-mint/20 border-t-hysio-mint animate-spin" />

        {/* Inner icon with bounce animation */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-hysio-mint to-hysio-deep-green flex items-center justify-center shadow-lg">
          <CurrentIcon className="w-8 h-8 text-white animate-pulse" />
        </div>

        {/* Sparkle effects */}
        <div className="absolute -top-1 -right-1">
          <Zap className="w-4 h-4 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <div className="absolute -bottom-1 -left-1">
          <Sparkles className="w-3 h-3 text-hysio-mint animate-bounce" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>

      {/* Current step information */}
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-hysio-deep-green transition-all duration-500">
          {loadingSteps[currentStep]?.title || 'EduPack genereren...'}
        </h3>
        <p className="text-sm text-gray-600 transition-all duration-500">
          {message || loadingSteps[currentStep]?.description || 'Even geduld a.u.b...'}
        </p>
      </div>

      {/* Step progress bar */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Stap {currentStep + 1} van {loadingSteps.length}</span>
          <span>{Math.round(stepProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-hysio-mint to-hysio-deep-green rounded-full transition-all duration-300 ease-out"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex space-x-3">
        {loadingSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={index}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                isActive && 'bg-hysio-mint text-white scale-110 shadow-lg',
                isCompleted && 'bg-hysio-deep-green text-white',
                !isActive && !isCompleted && 'bg-gray-200 text-gray-400'
              )}
            >
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <StepIcon className={cn(
                  'w-5 h-5 transition-all duration-300',
                  isActive && 'animate-pulse'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Estimated time remaining */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Geschatte tijd: {Math.max(0, (loadingSteps.length - currentStep) * 3)} - {Math.max(5, (loadingSteps.length - currentStep) * 4)} seconden
        </p>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-hysio-mint rounded-full opacity-60 animate-pulse"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i * 0.2)}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Simpler version for inline use
export function EduPackMiniLoader({
  className,
  size = 'md'
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-hysio-mint/20 border-t-hysio-mint animate-spin" />
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-hysio-mint/20 to-hysio-deep-green/20 animate-pulse" />
      <Brain className="absolute inset-0 w-full h-full p-1 text-hysio-deep-green" />
    </div>
  );
}