/**
 * Progress Bar Component for Pre-intake Questionnaire
 *
 * Visual progress indicator showing current step and completion percentage.
 * Displays step labels with checkmarks for completed steps.
 *
 * @module components/pre-intake/ProgressBar
 */

'use client';

import React from 'react';
import type { QuestionnaireStep } from '@/types/pre-intake';
import { QUESTIONNAIRE_STEPS, STEP_LABELS } from '@/lib/pre-intake/constants';

interface ProgressBarProps {
  currentStep: QuestionnaireStep;
  completedSteps: QuestionnaireStep[];
  className?: string;
}

export default function ProgressBar({
  currentStep,
  completedSteps,
  className = '',
}: ProgressBarProps) {
  const currentIndex = QUESTIONNAIRE_STEPS.indexOf(currentStep);
  const totalSteps = QUESTIONNAIRE_STEPS.length;
  const progressPercentage = ((currentIndex + 1) / totalSteps) * 100;

  const isStepCompleted = (step: QuestionnaireStep): boolean => {
    return completedSteps.includes(step);
  };

  const isStepCurrent = (step: QuestionnaireStep): boolean => {
    return step === currentStep;
  };

  const getStepStatus = (
    step: QuestionnaireStep
  ): 'completed' | 'current' | 'pending' => {
    if (isStepCompleted(step)) return 'completed';
    if (isStepCurrent(step)) return 'current';
    return 'pending';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Vragenlijst ${Math.round(progressPercentage)}% voltooid`}
          />
        </div>

        {/* Step Percentage Text */}
        <div className="mt-2 flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Stap {currentIndex + 1} van {totalSteps}
          </span>
          <span className="font-medium text-green-700">
            {Math.round(progressPercentage)}% voltooid
          </span>
        </div>
      </div>

      {/* Step Indicators (Desktop) */}
      <div className="hidden md:block mt-6">
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />

          {/* Steps */}
          <div className="relative grid grid-cols-9 gap-2">
            {QUESTIONNAIRE_STEPS.map((step, index) => {
              const status = getStepStatus(step);

              return (
                <div key={step} className="flex flex-col items-center">
                  {/* Circle Indicator */}
                  <div
                    className={`
                      relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                      border-2 transition-all duration-300
                      ${
                        status === 'completed'
                          ? 'bg-green-600 border-green-600'
                          : status === 'current'
                          ? 'bg-white border-green-600'
                          : 'bg-white border-gray-300'
                      }
                    `}
                    aria-current={status === 'current' ? 'step' : undefined}
                  >
                    {status === 'completed' ? (
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span
                        className={`
                          text-sm font-semibold
                          ${
                            status === 'current'
                              ? 'text-green-700'
                              : 'text-gray-400'
                          }
                        `}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span
                    className={`
                      mt-2 text-xs text-center
                      ${
                        status === 'current'
                          ? 'text-green-700 font-medium'
                          : status === 'completed'
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Indicators (Mobile) - Current Step Only */}
      <div className="md:hidden mt-4">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            {/* Circle Indicator */}
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {currentIndex + 1}
              </span>
            </div>

            {/* Current Step Label */}
            <span className="mt-2 text-sm font-medium text-green-700 text-center">
              {STEP_LABELS[currentStep]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}