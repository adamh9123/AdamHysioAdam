/**
 * Success Banner Component
 *
 * Displays success message after questionnaire submission
 * with confirmation and next steps information.
 *
 * @module components/pre-intake/SuccessBanner
 */

'use client';

import React from 'react';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { getTranslations } from '@/lib/pre-intake/translations';

interface SuccessBannerProps {
  submissionId?: string;
}

export default function SuccessBanner({ submissionId }: SuccessBannerProps) {
  const language = usePreIntakeStore((state) => state.language);
  const t = getTranslations(language);

  return (
    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Success Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-green-900 mb-2">{t.exportSuccess}</h2>
          <p className="text-green-800 mb-4">
            Uw intake formulier is succesvol ontvangen en opgeslagen. Uw fysiotherapeut zal deze
            informatie bekijken voor uw eerste afspraak.
          </p>

          {submissionId && (
            <div className="bg-white border border-green-300 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-1">Bevestigingsnummer:</p>
              <p className="text-lg font-mono font-semibold text-green-700">{submissionId}</p>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-green-700">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium mb-1">Volgende stappen:</p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>U kunt hieronder een kopie downloaden voor uw eigen administratie</li>
                <li>Uw fysiotherapeut ontvangt automatisch een melding</li>
                <li>U ontvangt een bevestiging per e-mail</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
