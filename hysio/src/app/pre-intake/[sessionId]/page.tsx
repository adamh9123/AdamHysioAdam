/**
 * Pre-intake Questionnaire Session Page
 *
 * Displays the questionnaire flow for a specific session ID.
 * Attempts to load existing draft if available, otherwise starts fresh.
 *
 * @module app/pre-intake/[sessionId]/page
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuestionnaireFlow from '@/components/pre-intake/QuestionnaireFlow';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { UI_MESSAGES } from '@/lib/pre-intake/constants';

export default function PreIntakeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const setQuestionnaireData = usePreIntakeStore((state) => state.setQuestionnaireData);
  const setCurrentStep = usePreIntakeStore((state) => state.setCurrentStep);
  const setCompletedSteps = usePreIntakeStore((state) => state.setCompletedSteps);
  const resetQuestionnaire = usePreIntakeStore((state) => state.resetQuestionnaire);

  useEffect(() => {
    const loadDraft = async () => {
      if (!sessionId) {
        setLoadError('Geen geldige sessie-ID gevonden');
        setIsLoading(false);
        return;
      }

      try {
        // Attempt to load existing draft
        const response = await fetch(`/api/pre-intake/${sessionId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const draft = await response.json();

          // Check if draft is expired
          if (draft.isExpired) {
            setLoadError(UI_MESSAGES.draftExpired);
            resetQuestionnaire();
          } else {
            // Load draft data into store
            setQuestionnaireData(draft.questionnaireData);
            setCurrentStep(draft.currentStep || 'welcome');
            setCompletedSteps(draft.completedSteps || []);
            setIsDraftLoaded(true);
          }
        } else if (response.status === 404) {
          // No draft found, start fresh (this is normal for new sessions)
          resetQuestionnaire();
        } else {
          // Other error
          const error = await response.json();
          setLoadError(error.message || 'Fout bij laden van concept');
        }
      } catch (error) {
        console.error('Draft load error:', error);
        // Network error - start fresh rather than blocking user
        resetQuestionnaire();
      } finally {
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [sessionId, setQuestionnaireData, setCurrentStep, setCompletedSteps, resetQuestionnaire]);

  const handleComplete = () => {
    // Redirect to success page or dashboard
    router.push('/scribe');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">{UI_MESSAGES.loadingDraft}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Er is een probleem</h2>
          <p className="text-gray-600 mb-6">{loadError}</p>
          <button
            onClick={() => router.push('/pre-intake')}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Begin opnieuw
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Draft loaded notification */}
      {isDraftLoaded && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-300 rounded-lg px-6 py-3 shadow-lg animate-fade-in">
          <p className="text-sm text-green-800 font-medium">
            ✓ Uw concept is succesvol geladen
          </p>
        </div>
      )}

      <QuestionnaireFlow sessionId={sessionId} onComplete={handleComplete} />
    </>
  );
}