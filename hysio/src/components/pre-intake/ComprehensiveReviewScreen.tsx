/**
 * Comprehensive Review Screen Component
 *
 * Complete review of all questionnaire data before submission.
 * Displays all sections with formatted data in collapsible cards.
 *
 * @module components/pre-intake/ComprehensiveReviewScreen
 */

'use client';

import React from 'react';
import type { PreIntakeQuestionnaireData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { getTranslations } from '@/lib/pre-intake/translations';
import ReviewCard, { ReviewDataRow, ReviewList, ReviewTextBlock } from './ReviewCard';
import { formatPreIntakeData } from '@/lib/pre-intake/review-formatters';

interface ComprehensiveReviewScreenProps {
  data: Partial<PreIntakeQuestionnaireData>;
  onEdit?: (step: string) => void;
}

export default function ComprehensiveReviewScreen({
  data,
  onEdit,
}: ComprehensiveReviewScreenProps) {
  const language = usePreIntakeStore((state) => state.language);
  const setCurrentStep = usePreIntakeStore((state) => state.setCurrentStep);
  const t = getTranslations(language);
  const formatted = formatPreIntakeData(data);

  // Edit handler - navigate to specific step
  const handleEdit = (step: string) => {
    if (onEdit) {
      onEdit(step);
    } else {
      setCurrentStep(step as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 print-friendly-review">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Controleer uw gegevens</h3>
        <p className="text-sm text-blue-800">
          {t.reviewDescription} Klik op "Bewerk" bij een sectie om wijzigingen aan te brengen.
        </p>
      </div>

      {/* 1. Persoonlijke Gegevens */}
      {formatted.personalia && (
        <ReviewCard
          title={t.personalia}
          onEdit={() => handleEdit('personalia')}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <dl>
            <ReviewDataRow label="Volledige naam" value={formatted.personalia.fullName} />
            <ReviewDataRow label="Geslacht" value={formatted.personalia.gender} />
            <ReviewDataRow label="Geboortedatum" value={formatted.personalia.birthDate} />
            <ReviewDataRow label="Telefoonnummer" value={formatted.personalia.phone} />
            <ReviewDataRow label="E-mailadres" value={formatted.personalia.email} />
            {formatted.personalia.insurance && (
              <ReviewDataRow label="Zorgverzekeraar" value={formatted.personalia.insurance} />
            )}
            {formatted.personalia.insuranceNumber && (
              <ReviewDataRow label="Polisnummer" value={formatted.personalia.insuranceNumber} />
            )}
          </dl>
        </ReviewCard>
      )}

      {/* 2. Screeningsvragen (Red Flags) */}
      {formatted.redFlags && (
        <ReviewCard
          title={t.screeningQuestions}
          onEdit={() => handleEdit('redFlags')}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          {formatted.redFlags.hasPositiveFlags ? (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Enkele waarschuwingssignalen gedetecteerd - zal worden besproken met uw
                fysiotherapeut
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✓ Geen waarschuwingssignalen gedetecteerd
              </p>
            </div>
          )}

          <h4 className="text-sm font-semibold text-gray-700 mb-2">Algemene vragen:</h4>
          <dl className="mb-4">
            {formatted.redFlags.baseFlags.map((flag, index) => (
              <div
                key={index}
                className={`flex justify-between py-2 border-b border-gray-100 ${
                  flag.positive ? 'bg-yellow-50' : ''
                }`}
              >
                <dt className="text-sm text-gray-700">{flag.question}</dt>
                <dd
                  className={`text-sm font-medium ${
                    flag.positive ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {flag.answer}
                </dd>
              </div>
            ))}
          </dl>

          {formatted.redFlags.regionFlags.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Aanvullende vragen:</h4>
              <dl>
                {formatted.redFlags.regionFlags.map((flag, index) => (
                  <div
                    key={index}
                    className={`flex justify-between py-2 border-b border-gray-100 ${
                      flag.positive ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <dt className="text-sm text-gray-700">{flag.question}</dt>
                    <dd
                      className={`text-sm font-medium ${
                        flag.positive ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {flag.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </ReviewCard>
      )}

      {/* 3. Medische Achtergrond */}
      {formatted.medicalHistory && (
        <ReviewCard
          title={t.medicalHistory}
          onEdit={() => handleEdit('medicalHistory')}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          }
        >
          <dl>
            <ReviewDataRow
              label="Recente operaties"
              value={formatted.medicalHistory.hasRecentSurgeries}
            />
            {formatted.medicalHistory.surgeryDetails && (
              <div className="py-3 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-600 mb-2">Details operaties:</dt>
                <dd className="text-sm text-gray-900">
                  <ReviewTextBlock text={formatted.medicalHistory.surgeryDetails} maxLines={3} />
                </dd>
              </div>
            )}
            <ReviewDataRow label="Gebruikt medicatie" value={formatted.medicalHistory.takesMedication} />
            {formatted.medicalHistory.medications && formatted.medicalHistory.medications.length > 0 && (
              <div className="py-3 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-600 mb-2">Medicijnen:</dt>
                <dd className="text-sm text-gray-900">
                  <ReviewList items={formatted.medicalHistory.medications} />
                </dd>
              </div>
            )}
            {formatted.medicalHistory.otherConditions && (
              <div className="py-3 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-600 mb-2">Andere aandoeningen:</dt>
                <dd className="text-sm text-gray-900">
                  <ReviewTextBlock text={formatted.medicalHistory.otherConditions} maxLines={3} />
                </dd>
              </div>
            )}
            <ReviewDataRow label="Rookstatus" value={formatted.medicalHistory.smokingStatus} />
            <ReviewDataRow
              label="Alcoholgebruik"
              value={formatted.medicalHistory.alcoholConsumption}
            />
          </dl>
        </ReviewCard>
      )}

      {/* 4. Uw Klacht */}
      {formatted.complaint && (
        <ReviewCard
          title={t.complaint}
          onEdit={() => handleEdit('complaint')}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <dl>
            <ReviewDataRow label="Locaties" value={formatted.complaint.locations} />
            <ReviewDataRow label="Frequentie" value={formatted.complaint.frequency} />
            <ReviewDataRow label="Duur klacht" value={formatted.complaint.duration} />
            <ReviewDataRow
              label="Pijnintensiteit"
              value={
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatted.complaint.intensity}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        parseInt(formatted.complaint.intensity) === 0
                          ? 'bg-gray-400'
                          : parseInt(formatted.complaint.intensity) <= 3
                          ? 'bg-green-500'
                          : parseInt(formatted.complaint.intensity) <= 6
                          ? 'bg-yellow-500'
                          : parseInt(formatted.complaint.intensity) <= 9
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(parseInt(formatted.complaint.intensity) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              }
            />
            <ReviewDataRow
              label="Eerder gehad"
              value={formatted.complaint.hasOccurredBefore}
            />
            {formatted.complaint.previousOccurrenceDetails && (
              <div className="py-3 border-b border-gray-100">
                <dt className="text-sm font-medium text-gray-600 mb-2">Eerdere voorkomens:</dt>
                <dd className="text-sm text-gray-900">
                  <ReviewTextBlock text={formatted.complaint.previousOccurrenceDetails} maxLines={3} />
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{t.mainComplaint}:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ReviewTextBlock text={formatted.complaint.mainComplaint} />
            </div>
          </div>
        </ReviewCard>
      )}

      {/* 5. Uw Doelen */}
      {formatted.goals && (
        <ReviewCard
          title={t.goals}
          onEdit={() => handleEdit('goals')}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
            </svg>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Behandeldoelen:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ReviewTextBlock text={formatted.goals.treatmentGoals} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Gedachten over oorzaak:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ReviewTextBlock text={formatted.goals.thoughtsOnCause} />
              </div>
            </div>

            <dl>
              <ReviewDataRow label="Invloed op stemming" value={formatted.goals.moodImpact} />
            </dl>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Beperkte activiteiten:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ReviewTextBlock text={formatted.goals.limitedActivities} />
              </div>
            </div>
          </div>
        </ReviewCard>
      )}

      {/* 6. PSK (Functional Limitations) */}
      {formatted.functionalLimitations && formatted.functionalLimitations.length > 0 && (
        <ReviewCard
          title={t.psk}
          onEdit={() => handleEdit('functionalLimitations')}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          <p className="text-sm text-gray-600 mb-4">
            Geselecteerde activiteiten en mate van beperking:
          </p>
          <div className="space-y-3">
            {formatted.functionalLimitations.map((limitation, index) => {
              // Determine badge color based on severity
              const getBadgeColor = (severity: number) => {
                if (severity === 0) return 'bg-gray-100 text-gray-800';
                if (severity <= 3) return 'bg-green-100 text-green-800';
                if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
                if (severity <= 9) return 'bg-orange-100 text-orange-800';
                return 'bg-red-100 text-red-800';
              };

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-900">{limitation.activity}</h5>
                    <span className={`px-3 py-1 ${getBadgeColor(limitation.severity)} text-sm font-semibold rounded-full transition-colors`}>
                      {limitation.severity}/10
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          limitation.severity <= 3
                            ? 'bg-green-500'
                            : limitation.severity <= 6
                            ? 'bg-yellow-500'
                            : limitation.severity <= 9
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(limitation.severity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-[120px]">
                      {limitation.severityLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ReviewCard>
      )}

      {/* Final Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Let op:</strong> Controleer alle informatie zorgvuldig. Na het geven van
          toestemming in de volgende stap wordt deze informatie verzonden naar uw fysiotherapeut.
        </p>
      </div>
    </div>
  );
}
