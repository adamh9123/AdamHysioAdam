/**
 * Questionnaire Flow Orchestrator Component
 *
 * Manages the multi-step pre-intake questionnaire flow, including:
 * - Step navigation and progress tracking
 * - Section rendering based on current step
 * - Form validation before progression
 * - Auto-save functionality
 * - Success and error state handling
 *
 * @module components/pre-intake/QuestionnaireFlow
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import ProgressBar from './ProgressBar';
import PersonaliaSection from './questions/PersonaliaSection';
import ComplaintSection from './questions/ComplaintSection';
import RedFlagsSection from './questions/RedFlagsSection';
import MedicalHistorySection from './questions/MedicalHistorySection';
import GoalsSection from './questions/GoalsSection';
import FunctionalLimitationsSection from './questions/FunctionalLimitationsSection';
import ComprehensiveReviewScreen from './ComprehensiveReviewScreen';
import ExportScreen from './ExportScreen';
import LanguageSwitcher from './LanguageSwitcher';
import { ToastProvider, useToast } from './Toast';
import {
  QUESTIONNAIRE_STEPS,
  STEP_LABELS,
  WELCOME_TEXT,
  CONSENT_TEXT,
  UI_MESSAGES,
  AUTO_SAVE_DELAY_MS,
} from '@/lib/pre-intake/constants';
import { validateStep } from '@/lib/pre-intake/validation';
import { getTranslations } from '@/lib/pre-intake/translations';
import type { QuestionnaireStep } from '@/types/pre-intake';

interface QuestionnaireFlowProps {
  sessionId: string;
  onComplete?: () => void;
}

// Inner component with toast access
function QuestionnaireFlowContent({ sessionId, onComplete }: QuestionnaireFlowProps) {
  const router = useRouter();
  const toast = useToast(); // Now we can use toast!
  const currentStep = usePreIntakeStore((state) => state.currentStep);
  const completedSteps = usePreIntakeStore((state) => state.completedSteps);
  const questionnaireData = usePreIntakeStore((state) => state.questionnaireData);
  const setCurrentStep = usePreIntakeStore((state) => state.setCurrentStep);
  const markStepComplete = usePreIntakeStore((state) => state.markStepComplete);
  const goToNextStep = usePreIntakeStore((state) => state.goToNextStep);
  const goToPreviousStep = usePreIntakeStore((state) => state.goToPreviousStep);
  const getProgressPercentage = usePreIntakeStore((state) => state.getProgressPercentage);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [consentChecked, setConsentChecked] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [resumeLink, setResumeLink] = useState<string>('');

  // Auto-save functionality
  useEffect(() => {
    if (currentStep === 'welcome' || currentStep === 'consent') {
      return; // Don't auto-save on welcome or consent screens
    }

    const timer = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        const response = await fetch('/api/pre-intake/save-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionnaireData,
            currentStep,
            completedSteps,
          }),
        });

        if (response.ok) {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } else {
          setAutoSaveStatus('error');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [sessionId, questionnaireData, currentStep, completedSteps]);

  // Prevent accidental page close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Don't warn on welcome or after successful submission
      if (currentStep !== 'welcome' && !submitSuccess && currentStep !== 'export') {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentStep, submitSuccess]);

  const handleNext = async () => {
    setValidationErrors([]);

    // Validate current step
    const validation = validateStep(currentStep, questionnaireData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Mark current step as complete
    markStepComplete(currentStep);

    // Navigate to next step
    if (currentStep === 'consent') {
      // Submit the questionnaire and navigate to export
      await handleSubmit();
    } else {
      goToNextStep();
      // Scroll to top for next section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setValidationErrors([]);
    goToPreviousStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndExit = async () => {
    try {
      setAutoSaveStatus('saving');

      const response = await fetch('/api/pre-intake/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionnaireData,
          currentStep,
          completedSteps,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Generate resume link
        const link = `${window.location.origin}/pre-intake?session=${sessionId}`;
        setResumeLink(link);
        setShowExitConfirm(true);
        setAutoSaveStatus('saved');
      } else {
        setAutoSaveStatus('error');
        toast.error('Fout bij opslaan. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Save and exit error:', error);
      setAutoSaveStatus('error');
      toast.error('Fout bij opslaan. Probeer het opnieuw.');
    }
  };

  const handleSubmit = async () => {
    if (!consentChecked) {
      setValidationErrors(['U moet toestemming geven om door te gaan.']);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      const response = await fetch('/api/pre-intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionnaireData,
          consentGiven: true, // CRITICAL FIX: Include consent flag
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmissionId(result.submissionId || `HYSIO-${Date.now()}`);
        setSubmitSuccess(true);
        // Navigate to export step instead of showing success screen
        goToNextStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const error = await response.json();
        setValidationErrors([error.message || UI_MESSAGES.submitFailed]);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setValidationErrors([UI_MESSAGES.submitFailed]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'personalia':
        return <PersonaliaSection />;
      case 'complaint':
        return <ComplaintSection />;
      case 'redFlags':
        return <RedFlagsSection />;
      case 'medicalHistory':
        return <MedicalHistorySection />;
      case 'goals':
        return <GoalsSection />;
      case 'functionalLimitations':
        return <FunctionalLimitationsSection />;
      case 'review':
        return <ComprehensiveReviewScreen data={questionnaireData} />;
      case 'consent':
        return (
          <ConsentScreen
            consentChecked={consentChecked}
            onConsentChange={setConsentChecked}
          />
        );
      case 'export':
        return <ExportScreen data={questionnaireData} submissionId={submissionId} />;
      default:
        return <div>Onbekende stap</div>;
    }
  };

  const currentIndex = QUESTIONNAIRE_STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === QUESTIONNAIRE_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {STEP_LABELS[currentStep]}
            </h1>
            <p className="text-sm text-gray-600">
              Stap {currentIndex + 1} van {QUESTIONNAIRE_STEPS.length}
            </p>
          </div>
          <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        {/* Auto-save Status */}
        {autoSaveStatus !== 'idle' && currentStep !== 'welcome' && currentStep !== 'consent' && (
          <div className="mb-4 text-center">
            <span
              className={`text-sm ${
                autoSaveStatus === 'saved'
                  ? 'text-green-600'
                  : autoSaveStatus === 'saving'
                  ? 'text-gray-600'
                  : 'text-red-600'
              }`}
            >
              {autoSaveStatus === 'saved' && `✓ ${UI_MESSAGES.autoSaved}`}
              {autoSaveStatus === 'saving' && UI_MESSAGES.saving}
              {autoSaveStatus === 'error' && UI_MESSAGES.saveFailed}
            </span>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-900 mb-2">
                  Controleer de volgende velden:
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-800">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons - Hidden on export step */}
        {/* Sticky on mobile for better UX */}
        {currentStep !== 'export' && (
          <div className="flex flex-col gap-4 md:relative md:bottom-auto sticky bottom-0 left-0 right-0 bg-gradient-to-br from-green-50 to-blue-50 md:bg-transparent p-4 md:p-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none z-10">
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep || isSubmitting}
                className={`
                  flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg font-medium transition-colors
                  ${
                    isFirstStep || isSubmitting
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500 hover:text-green-600 shadow-sm'
                  }
                `}
              >
                <span className="md:inline">← </span>
                <span className="hidden sm:inline">Vorige</span>
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting || (currentStep === 'consent' && !consentChecked)}
                className={`
                  flex-1 md:flex-none px-6 md:px-8 py-3 rounded-lg font-medium transition-colors shadow-md
                  ${
                    isSubmitting || (currentStep === 'consent' && !consentChecked)
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    <span className="hidden sm:inline">{UI_MESSAGES.submitting}</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : currentStep === 'consent' ? (
                  'Verzenden'
                ) : (
                  <>
                    <span className="hidden sm:inline">Volgende</span>
                    <span className="sm:hidden">→</span>
                    <span className="md:inline"> →</span>
                  </>
                )}
              </button>
            </div>

            {/* Save & Exit Button - Only show if not on welcome or consent */}
            {currentStep !== 'welcome' && currentStep !== 'consent' && (
              <div className="text-center">
                <button
                  onClick={handleSaveAndExit}
                  disabled={isSubmitting || autoSaveStatus === 'saving'}
                  className="text-sm text-gray-600 hover:text-green-600 underline transition-colors"
                >
                  💾 <span className="hidden sm:inline">Opslaan en later verder gaan</span>
                  <span className="sm:hidden">Opslaan</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Save & Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Voortgang opgeslagen!
                </h3>
                <p className="text-gray-600 mb-4">
                  Uw ingevulde gegevens zijn veilig opgeslagen. U kunt op elk moment verder gaan waar u gebleven bent.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Gebruik deze link om later verder te gaan:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resumeLink}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded bg-white"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resumeLink);
                      toast.success('Link gekopieerd!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Kopieer
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  💡 Tip: Bewaar deze link of stuur hem naar uzelf per email
                </p>
              </div>

              <button
                onClick={() => router.push('/scribe')}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Afsluiten
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// WELCOME SCREEN
// ============================================================================

function WelcomeScreen() {
  const language = usePreIntakeStore((state) => state.language);
  const t = getTranslations(language);

  return (
    <div className="space-y-6">
      {/* Language Switcher */}
      <LanguageSwitcher />

      {/* Icon and Title - Centered */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.welcomeTitle}</h2>
      </div>

      {/* Introduction Text - Centered */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 leading-relaxed mb-4">
          {t.welcomeDescription}
        </p>
        <p className="text-gray-600 text-sm">
          {t.welcomeIntro}
        </p>
      </div>

      {/* Privacy Notice - Centered */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start justify-center">
          <svg
            className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 text-center">
            <h3 className="text-sm font-semibold text-green-900 mb-2">Privacy & Veiligheid</h3>
            <p className="text-sm text-green-800">{WELCOME_TEXT.privacyNotice}</p>
          </div>
        </div>
      </div>

      {/* Features Grid - Centered */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-sm text-gray-600">Ongeveer 10-15 minuten</p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">💾</div>
          <p className="text-sm text-gray-600">Automatisch opslaan</p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">🔒</div>
          <p className="text-sm text-gray-600">100% vertrouwelijk</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONSENT SCREEN
// ============================================================================

interface ConsentScreenProps {
  consentChecked: boolean;
  onConsentChange: (checked: boolean) => void;
}

function ConsentScreen({ consentChecked, onConsentChange }: ConsentScreenProps) {
  const language = usePreIntakeStore((state) => state.language);
  const t = getTranslations(language);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Laatste stap</h3>
        <p className="text-sm text-blue-800">
          Lees de toestemming en bevestig om uw gegevens te verzenden.
        </p>
      </div>

      <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Toestemming</h3>
        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
          {CONSENT_TEXT}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Voor meer informatie, zie ons{' '}
          <a
            href="/privacybeleid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 underline font-medium"
          >
            {t.consentPrivacyPolicy || 'privacybeleid'}
          </a>
          .
        </p>
      </div>

      <label className="flex items-start p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mt-0.5 mr-3 flex-shrink-0"
          required
        />
        <span className="text-sm text-gray-900">
          <strong>Ik ga akkoord</strong> met de bovenstaande voorwaarden en geef toestemming om
          mijn gegevens te delen met mijn fysiotherapeut.
        </span>
      </label>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          Door op &quot;Verzenden&quot; te klikken worden uw gegevens veilig verstuurd naar uw
          fysiotherapeut. U ontvangt een bevestiging per e-mail.
        </p>
      </div>
    </div>
  );
}

// Wrapper component with ToastProvider
export default function QuestionnaireFlow(props: QuestionnaireFlowProps) {
  return (
    <ToastProvider>
      <QuestionnaireFlowContent {...props} />
    </ToastProvider>
  );
}