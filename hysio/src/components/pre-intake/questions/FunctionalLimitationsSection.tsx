/**
 * Functional Limitations Section Component
 *
 * Collects information about which activities are limited and to what degree.
 * Uses checkboxes for activity selection and sliders for severity rating.
 *
 * @module components/pre-intake/questions/FunctionalLimitationsSection
 */

'use client';

import React from 'react';
import type { FunctionalLimitationsData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { ACTIVITY_CATEGORIES } from '@/lib/pre-intake/constants';

type ActivityCategory = 'work' | 'sports' | 'household' | 'driving' | 'sleeping' | 'hobbies' | 'social' | 'other';

export default function FunctionalLimitationsSection() {
  const functionalLimitations = usePreIntakeStore((state) => state.questionnaireData.functionalLimitations);
  const setFunctionalLimitations = usePreIntakeStore((state) => state.setFunctionalLimitations);

  const handleCategoryToggle = (category: ActivityCategory) => {
    const current = functionalLimitations?.limitedActivityCategories || [];
    const severityScores = { ...functionalLimitations?.severityScores } || {};

    if (current.includes(category)) {
      // Remove category
      const updated = current.filter((c) => c !== category);
      delete severityScores[category];
      setFunctionalLimitations({
        limitedActivityCategories: updated,
        severityScores,
      });
    } else {
      // Add category
      if (current.length < 8) {
        const updated = [...current, category];
        severityScores[category] = 5; // Default to middle value
        setFunctionalLimitations({
          limitedActivityCategories: updated,
          severityScores,
        });
      }
    }
  };

  const handleSeverityChange = (category: string, severity: number) => {
    const severityScores = { ...functionalLimitations?.severityScores } || {};
    severityScores[category] = severity;
    setFunctionalLimitations({ severityScores });
  };

  const handleCustomActivityChange = (value: string) => {
    setFunctionalLimitations({ customActivity: value });
  };

  const isSelected = (category: ActivityCategory) => {
    return functionalLimitations?.limitedActivityCategories?.includes(category) || false;
  };

  const getSeverity = (category: string): number => {
    return functionalLimitations?.severityScores?.[category] || 5;
  };

  const getSeverityLabel = (severity: number): string => {
    if (severity === 0) return 'Niet beperkt';
    if (severity <= 3) return 'Licht beperkt';
    if (severity <= 6) return 'Matig beperkt';
    if (severity <= 9) return 'Ernstig beperkt';
    return 'Volledig beperkt';
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Beperkingen in dagelijkse activiteiten
        </h3>
        <p className="text-sm text-blue-800">
          Selecteer de activiteiten waarbij u beperkt wordt door uw klacht en geef aan hoe erg de beperking is.
        </p>
      </div>

      {/* Activity Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Welke activiteiten zijn beperkt? <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecteer maximaal 8 activiteiten
        </p>

        <div className="space-y-3">
          {ACTIVITY_CATEGORIES.map((activity) => (
            <label
              key={activity.value}
              className={`
                flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                ${
                  isSelected(activity.value as ActivityCategory)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }
              `}
            >
              <input
                type="checkbox"
                checked={isSelected(activity.value as ActivityCategory)}
                onChange={() => handleCategoryToggle(activity.value as ActivityCategory)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                disabled={
                  !isSelected(activity.value as ActivityCategory) &&
                  (functionalLimitations?.limitedActivityCategories?.length || 0) >= 8
                }
              />
              <span className="ml-3 text-gray-900 font-medium">{activity.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Activity (if "other" is selected) */}
        {isSelected('other') && (
          <div className="mt-4">
            <label htmlFor="customActivity" className="block text-sm font-medium text-gray-700 mb-2">
              Welke andere activiteit?
            </label>
            <input
              type="text"
              id="customActivity"
              value={functionalLimitations?.customActivity || ''}
              onChange={(e) => handleCustomActivityChange(e.target.value)}
              placeholder="Bijvoorbeeld: tuinieren, muziek maken, enz."
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>
        )}
      </div>

      {/* Severity Sliders */}
      {functionalLimitations?.limitedActivityCategories && functionalLimitations.limitedActivityCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Hoe erg bent u beperkt?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Geef per activiteit aan hoe erg u beperkt wordt (0 = niet beperkt, 10 = volledig beperkt)
          </p>

          <div className="space-y-6">
            {functionalLimitations.limitedActivityCategories.map((category) => {
              const categoryLabel = category === 'other' && functionalLimitations.customActivity
                ? functionalLimitations.customActivity
                : ACTIVITY_CATEGORIES.find((a) => a.value === category)?.label || category;

              const severity = getSeverity(category);

              return (
                <div key={category} className="border border-gray-300 rounded-lg p-4">
                  <label htmlFor={`severity-${category}`} className="block font-medium text-gray-900 mb-3">
                    {categoryLabel}
                  </label>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      id={`severity-${category}`}
                      min="0"
                      max="10"
                      value={severity}
                      onChange={(e) => handleSeverityChange(category, Number(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-400 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #BBF7D0 0%, #FEF08A 50%, #FCA5A5 100%)`,
                      }}
                    />

                    {/* Value Display */}
                    <div className="mt-3 flex justify-between items-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 border-2 border-green-600">
                        <span className="text-lg font-bold text-green-700">{severity}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {getSeverityLabel(severity)}
                      </span>
                    </div>

                    {/* Scale Labels */}
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>0 - Niet beperkt</span>
                      <span>10 - Volledig beperkt</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!functionalLimitations?.limitedActivityCategories || functionalLimitations.limitedActivityCategories.length === 0) && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500">
            Selecteer minimaal 1 activiteit waarbij u beperkt wordt
          </p>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Tip:</strong> Denk goed na over welke activiteiten u graag weer zou willen kunnen doen.
          Dit helpt uw fysiotherapeut om realistische doelen te stellen.
        </p>
      </div>
    </div>
  );
}