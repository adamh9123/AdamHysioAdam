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
  const [showSmartGuide, setShowSmartGuide] = React.useState(false);
  const [showExamples, setShowExamples] = React.useState(false);

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

      {/* SMART Goals Guide - Expandable */}
      <div className="border border-blue-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSmartGuide(!showSmartGuide)}
          className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-medium text-blue-900">
              💡 Tips voor het stellen van goede behandeldoelen (SMART)
            </h3>
          </div>
          <svg
            className={`w-5 h-5 text-blue-600 transition-transform ${showSmartGuide ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showSmartGuide && (
          <div className="p-4 bg-white border-t border-blue-200">
            <p className="text-sm text-gray-700 mb-3">
              Goede behandeldoelen zijn <strong>SMART</strong>: Specifiek, Meetbaar, Acceptabel, Realistisch en Tijdgebonden.
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">S</span>
                <span><strong>Specifiek:</strong> "Ik wil weer kunnen hardlopen" in plaats van "Ik wil minder pijn"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">M</span>
                <span><strong>Meetbaar:</strong> "30 minuten fietsen" in plaats van "meer bewegen"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">A</span>
                <span><strong>Acceptabel:</strong> Doelen die voor u persoonlijk belangrijk zijn</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">R</span>
                <span><strong>Realistisch:</strong> Haalbare doelen binnen de behandelperiode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 min-w-[20px]">T</span>
                <span><strong>Tijdgebonden:</strong> "Over 3 maanden" geeft richting aan de behandeling</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Example Goals - Expandable */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExamples(!showExamples)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Bekijk voorbeelden van goede doelen</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${showExamples ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showExamples && (
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-gray-800">"Ik wil over 3 maanden weer 30 minuten kunnen hardlopen zonder kniepijn"</p>
              </div>
              <div className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-gray-800">"Over 2 maanden wil ik weer een hele werkdag zonder rugpijn kunnen werken"</p>
              </div>
              <div className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-gray-800">"Ik wil binnen 6 weken mijn kleinkinderen weer kunnen optillen zonder schouderpijn"</p>
              </div>
              <div className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                <p className="text-gray-800">"Over 4 maanden weer 2x per week kunnen sporten zoals ik voorheen deed"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* S - Somatisch: Treatment Goals */}
      <div>
        <label htmlFor="treatmentGoals" className="block text-lg font-semibold text-gray-900 mb-3">
          Wat hoopt u met fysiotherapie te bereiken? <span className="text-red-500">*</span>
        </label>

        {/* Helper Prompts */}
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">💭 Denk aan:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Wat wilt u over 3-6 maanden kunnen doen?</li>
            <li>• Welke activiteit mist u het meest?</li>
            <li>• Waarom is dit belangrijk voor u?</li>
          </ul>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Beschrijf zo concreet mogelijk wat u graag weer zou willen kunnen doen
        </p>
        <textarea
          id="treatmentGoals"
          value={goals?.treatmentGoals || ''}
          onChange={(e) => handleChange('treatmentGoals', e.target.value)}
          placeholder="Bijvoorbeeld: Over 3 maanden wil ik weer 30 minuten kunnen hardlopen zonder kniepijn, zodat ik kan meedoen met de halve marathon van mijn loopclub. Ook wil ik weer een hele werkdag achter de computer kunnen zitten zonder last van mijn rug..."
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