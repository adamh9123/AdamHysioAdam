/**
 * Pre-intake Detail Page (Therapist View)
 *
 * Displays full details of a submitted pre-intake questionnaire.
 *
 * @module app/scribe/pre-intake/[submissionId]/page
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PreIntakeDetail from '@/components/pre-intake/therapist/PreIntakeDetail';
import type { PreIntakeSubmission } from '@/types/pre-intake';

export default function PreIntakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<PreIntakeSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/pre-intake/submissions/${submissionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmission(data.submission);
      } else {
        const error = await response.json();
        setError(error.message || 'Fout bij laden van pre-intake');
      }
    } catch (error) {
      console.error('Load submission error:', error);
      setError('Netwerkfout bij laden van gegevens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/scribe/pre-intake');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
          <p className="text-gray-600 mb-6">{error || 'Pre-intake niet gevonden'}</p>
          <button
            onClick={handleBack}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Terug naar overzicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PreIntakeDetail submission={submission} onBack={handleBack} />
      </div>
    </div>
  );
}