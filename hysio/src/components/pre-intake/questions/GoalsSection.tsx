/**
 * Goals Section Component (SCEGS Framework)
 *
 * Collects patient treatment goals and expectations following SCEGS:
 * - Somatisch (Physical treatment goals)
 * - Cognitief (Thoughts on cause)
 * - Emotioneel (Mood impact)
 * - Gedragsmatig/Sociaal (Limited activities)
 *
 * @module components/pre-intake/questions/GoalsSection
 */

'use client';

import React from 'react';
import type { GoalsData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { MOOD_IMPACT_OPTIONS } from '@/lib/pre-intake/constants';

export default function GoalsSection() {
  const goals = usePreIntakeStore((state) => state.questionnaireData.goals);
  const setGoals = usePreIntakeStore((state) => state.setGoals);

  const handleChange = (field: keyof GoalsData, value: any) => {
    setGoals({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">
          Uw doelen zijn belangrijk
        </h3>
        <p className="text-sm text-green-800">
          Uw antwoorden helpen ons u beter te begrijpen en een behandeling te maken die bij u past.
        </p>
      </div>

      {/* S - Somatisch: Treatment Goals */}
      <div>
        <label htmlFor="treatmentGoals" className="block text-lg font-semibold text-gray-900 mb-3">
          Wat hoopt u met fysiotherapie te bereiken? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Beschrijf zo concreet mogelijk wat u graag weer zou willen kunnen doen
        </p>
        <textarea
          id="treatmentGoals"
          value={goals?.treatmentGoals || ''}
          onChange={(e) => handleChange('treatmentGoals', e.target.value)}
          placeholder="Bijvoorbeeld: Ik wil graag weer pijnvrij kunnen hardlopen en mijn werk kunnen doen zonder last van mijn rug..."
          rows={5}
          maxLength={500}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {goals?.treatmentGoals?.length || 0} / 500 tekens (minimaal 10)
        </p>
      </div>

      {/* C - Cognitief: Thoughts on Cause */}
      <div>
        <label htmlFor="thoughtsOnCause" className="block text-lg font-semibold text-gray-900 mb-3">
          Wat zijn uw gedachten over de oorzaak? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Heeft u zelf een idee waarom u deze klacht heeft?
        </p>
        <textarea
          id="thoughtsOnCause"
          value={goals?.thoughtsOnCause || ''}
          onChange={(e) => handleChange('thoughtsOnCause', e.target.value)}
          placeholder="Bijvoorbeeld: Ik denk dat het komt door mijn werk, ik zit veel achter de computer..."
          rows={4}
          maxLength={300}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {goals?.thoughtsOnCause?.length || 0} / 300 tekens (minimaal 5)
        </p>
      </div>

      {/* E - Emotioneel: Mood Impact */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Hoe beïnvloedt de klacht uw stemming? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Geef aan in hoeverre de klacht invloed heeft op hoe u zich voelt
        </p>
        <div className="space-y-2">
          {MOOD_IMPACT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <input
                type="radio"
                name="moodImpact"
                value={option.value}
                checked={goals?.moodImpact === option.value}
                onChange={(e) => handleChange('moodImpact', e.target.value)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* G/S - Gedragsmatig/Sociaal: Limited Activities */}
      <div>
        <label htmlFor="limitedActivities" className="block text-lg font-semibold text-gray-900 mb-3">
          Welke activiteiten kunt u niet meer doen? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Beschrijf welke dagelijkse activiteiten, sport of hobby's u niet meer kunt uitvoeren door uw klacht
        </p>
        <textarea
          id="limitedActivities"
          value={goals?.limitedActivities || ''}
          onChange={(e) => handleChange('limitedActivities', e.target.value)}
          placeholder="Bijvoorbeeld: Ik kan niet meer naar de sportschool, lange wandelingen zijn moeilijk, en ik heb moeite met het oppakken van mijn kleinkinderen..."
          rows={5}
          maxLength={500}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {goals?.limitedActivities?.length || 0} / 500 tekens (minimaal 5)
        </p>
      </div>

      {/* Encouragement Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Goed bezig!
            </h4>
            <p className="text-sm text-blue-800">
              Met deze informatie kan uw fysiotherapeut een behandelplan maken dat aansluit bij uw wensen en behoeften.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}