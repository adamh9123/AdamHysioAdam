/**
 * Functional Limitations Section Component
 *
 * Collects information about which activities are limited and to what degree.
 * Uses checkboxes for activity selection and sliders for severity rating.
 * Supports multiple custom "other" activities.
 *
 * @module components/pre-intake/questions/FunctionalLimitationsSection
 */

'use client';

import React, { useState } from 'react';
import type { FunctionalLimitationsData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { ACTIVITY_CATEGORIES } from '@/lib/pre-intake/constants';

type ActivityCategory = 'work' | 'sports' | 'household' | 'driving' | 'sleeping' | 'hobbies' | 'social' | 'other';

export default function FunctionalLimitationsSection() {
  const functionalLimitations = usePreIntakeStore((state) => state.questionnaireData.functionalLimitations);
  const setFunctionalLimitations = usePreIntakeStore((state) => state.setFunctionalLimitations);
  const [editingCustom, setEditingCustom] = useState<string | null>(null);

  // Get all selected activities (including custom ones with unique IDs)
  const getSelectedActivities = (): string[] => {
    const categories = functionalLimitations?.limitedActivityCategories || [];
    const customActivities = functionalLimitations?.customActivities || {};

    // Combine base categories with custom activity IDs
    const allActivities = [...categories];
    Object.keys(customActivities).forEach(id => {
      if (!allActivities.includes(id)) {
        allActivities.push(id);
      }
    });

    return allActivities;
  };

  const handleCategoryToggle = (category: ActivityCategory) => {
    const current = functionalLimitations?.limitedActivityCategories || [];
    const severityScores = { ...functionalLimitations?.severityScores } || {};
    const customActivities = { ...functionalLimitations?.customActivities } || {};

    if (current.includes(category)) {
      // Remove category
      const updated = current.filter((c) => c !== category);
      delete severityScores[category];

      // If it's 'other', don't remove custom activities - they have their own removal
      setFunctionalLimitations({
        limitedActivityCategories: updated,
        severityScores,
        customActivities,
      });
    } else {
      // Add category
      const allActivities = getSelectedActivities();
      if (allActivities.length < 8) {
        const updated = [...current, category];
        severityScores[category] = 5; // Default to middle value
        setFunctionalLimitations({
          limitedActivityCategories: updated,
          severityScores,
          customActivities,
        });
      }
    }
  };

  const handleAddCustomActivity = () => {
    // CRITICAL FIX: Create new array instead of mutating
    const current = [...(functionalLimitations?.limitedActivityCategories || [])];
    const customActivities = { ...functionalLimitations?.customActivities } || {};
    const severityScores = { ...functionalLimitations?.severityScores } || {};

    // Ensure 'other' is selected
    if (!current.includes('other')) {
      current.push('other');
    }

    // Generate unique ID for this custom activity
    const id = `custom_${Date.now()}`;
    customActivities[id] = '';
    severityScores[id] = 5;

    setFunctionalLimitations({
      limitedActivityCategories: current,
      customActivities,
      severityScores,
    });

    setEditingCustom(id);
  };

  const handleRemoveCustomActivity = (id: string) => {
    const customActivities = { ...functionalLimitations?.customActivities } || {};
    const severityScores = { ...functionalLimitations?.severityScores } || {};

    delete customActivities[id];
    delete severityScores[id];

    // If no custom activities left, remove 'other' from categories
    // CRITICAL FIX: Create new array instead of filtering read-only array
    const current = [...(functionalLimitations?.limitedActivityCategories || [])];
    const hasCustomActivities = Object.keys(customActivities).length > 0;
    const updated = hasCustomActivities ? current : current.filter(c => c !== 'other');

    setFunctionalLimitations({
      limitedActivityCategories: updated,
      customActivities,
      severityScores,
    });
  };

  const handleCustomActivityChange = (id: string, value: string) => {
    const customActivities = { ...functionalLimitations?.customActivities } || {};
    customActivities[id] = value;
    setFunctionalLimitations({ customActivities });
  };

  const handleSeverityChange = (category: string, severity: number) => {
    const severityScores = { ...functionalLimitations?.severityScores } || {};
    severityScores[category] = severity;
    setFunctionalLimitations({ severityScores });
  };

  const isSelected = (category: ActivityCategory) => {
    return functionalLimitations?.limitedActivityCategories?.includes(category) || false;
  };

  const getSeverity = (category: string): number => {
    // CRITICAL FIX: Return actual value, even if it's 0
    const value = functionalLimitations?.severityScores?.[category];
    return value !== undefined ? value : 5;
  };

  const getSeverityLabel = (severity: number): string => {
    if (severity === 0) return 'Niet beperkt';
    if (severity <= 3) return 'Licht beperkt';
    if (severity <= 6) return 'Matig beperkt';
    if (severity <= 9) return 'Ernstig beperkt';
    return 'Volledig beperkt';
  };

  const getSeverityColorClasses = (severity: number): { bg: string; border: string; text: string } => {
    if (severity === 0) return { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' };
    if (severity <= 3) return { bg: 'bg-green-100', border: 'border-green-600', text: 'text-green-700' };
    if (severity <= 6) return { bg: 'bg-yellow-100', border: 'border-yellow-600', text: 'text-yellow-700' };
    if (severity <= 9) return { bg: 'bg-orange-100', border: 'border-orange-600', text: 'text-orange-700' };
    return { bg: 'bg-red-100', border: 'border-red-600', text: 'text-red-700' };
  };

  const getCustomActivitiesArray = () => {
    return Object.entries(functionalLimitations?.customActivities || {});
  };

  const allActivities = getSelectedActivities();
  const baseCategories = functionalLimitations?.limitedActivityCategories || [];

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Patiënt Specifieke Klachtenlijst (PSK)
        </h3>
        <p className="text-sm text-blue-800">
          Selecteer de activiteiten waarin u beperkt wordt door uw klacht en geef aan hoe ernstig de beperking is.
        </p>
      </div>

      {/* Activity Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Welke activiteiten zijn beperkt? <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecteer maximaal 8 activiteiten (inclusief aangepaste activiteiten)
        </p>

        <div className="space-y-3">
          {ACTIVITY_CATEGORIES.filter(a => a.value !== 'other').map((activity) => (
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
                  allActivities.length >= 8
                }
              />
              <span className="ml-3 text-gray-900 font-medium">{activity.label}</span>
            </label>
          ))}
        </div>

        {/* Custom Activities Section */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-gray-900">
              Andere activiteiten
            </h4>
            {allActivities.length < 8 && (
              <button
                type="button"
                onClick={handleAddCustomActivity}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Voeg activiteit toe
              </button>
            )}
          </div>

          {getCustomActivitiesArray().length > 0 ? (
            <div className="space-y-3">
              {getCustomActivitiesArray().map(([id, name]) => (
                <div key={id} className="flex items-center gap-3 p-4 border-2 border-green-500 bg-green-50 rounded-lg">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleCustomActivityChange(id, e.target.value)}
                    onFocus={() => setEditingCustom(id)}
                    onBlur={() => setEditingCustom(null)}
                    placeholder="Bijvoorbeeld: tuinieren, muziek maken, enz."
                    maxLength={100}
                    className="flex-1 px-3 py-2 rounded-md border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomActivity(id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    aria-label="Verwijder activiteit"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">
                Klik op "Voeg activiteit toe" om een aangepaste activiteit toe te voegen
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Severity Sliders */}
      {allActivities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Hoe erg bent u beperkt?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Geef per activiteit aan hoe erg u beperkt wordt (0 = niet beperkt, 10 = volledig beperkt)
          </p>

          <div className="space-y-6">
            {/* Base categories */}
            {baseCategories.filter(cat => cat !== 'other').map((category) => {
              const activity = ACTIVITY_CATEGORIES.find((a) => a.value === category);
              if (!activity) return null;

              const severity = getSeverity(category);
              const colorClasses = getSeverityColorClasses(severity);

              return (
                <div key={category} className="border border-gray-300 rounded-lg p-4">
                  <label htmlFor={`severity-${category}`} className="block font-medium text-gray-900 mb-3">
                    {activity.label}
                  </label>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      id={`severity-${category}`}
                      min="0"
                      max="10"
                      step="1"
                      value={severity}
                      onChange={(e) => handleSeverityChange(category, Number(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-400 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #BBF7D0 0%, #FEF08A 50%, #FCA5A5 100%)`,
                      }}
                    />

                    {/* Value Display - Dynamic color based on severity */}
                    <div className="mt-3 flex justify-between items-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses.bg} border-2 ${colorClasses.border} transition-colors duration-200`}>
                        <span className={`text-lg font-bold ${colorClasses.text}`}>{severity}</span>
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

            {/* Custom activities */}
            {getCustomActivitiesArray().map(([id, name]) => {
              const severity = getSeverity(id);
              const colorClasses = getSeverityColorClasses(severity);

              return (
                <div key={id} className="border border-green-300 rounded-lg p-4 bg-green-50">
                  <label htmlFor={`severity-${id}`} className="block font-medium text-gray-900 mb-3">
                    {name || 'Aangepaste activiteit'}
                  </label>

                  {/* Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      id={`severity-${id}`}
                      min="0"
                      max="10"
                      step="1"
                      value={severity}
                      onChange={(e) => handleSeverityChange(id, Number(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-400 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #BBF7D0 0%, #FEF08A 50%, #FCA5A5 100%)`,
                      }}
                    />

                    {/* Value Display - Dynamic color based on severity */}
                    <div className="mt-3 flex justify-between items-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses.bg} border-2 ${colorClasses.border} transition-colors duration-200`}>
                        <span className={`text-lg font-bold ${colorClasses.text}`}>{severity}</span>
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
      {allActivities.length === 0 && (
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
