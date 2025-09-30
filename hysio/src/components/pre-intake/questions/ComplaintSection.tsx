/**
 * Complaint Section Component (LOFTIG Framework)
 *
 * Collects complaint information following LOFTIG methodology:
 * - Locatie (Location) - Body map
 * - Ontstaan (Onset) - How it started
 * - Frequentie (Frequency) - How often
 * - Tijdsduur (Duration) - How long
 * - Intensiteit (Intensity) - Pain level (VAS scale)
 * - Geschiedenis (History) - Previous occurrences
 *
 * @module components/pre-intake/questions/ComplaintSection
 */

'use client';

import React from 'react';
import type { ComplaintData, BodyRegion } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import BodyMap from '../BodyMap';
import { FREQUENCY_OPTIONS, DURATION_OPTIONS } from '@/lib/pre-intake/constants';

export default function ComplaintSection() {
  const complaint = usePreIntakeStore((state) => state.questionnaireData.complaint);
  const setComplaint = usePreIntakeStore((state) => state.setComplaint);

  const handleBodyMapChange = (regions: BodyRegion[]) => {
    setComplaint({ locations: regions });
  };

  const handleChange = (field: keyof ComplaintData, value: any) => {
    setComplaint({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* L - Locatie (Location) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Locatie van de klacht <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Klik op de lichaamskaart om aan te geven waar u klachten heeft
        </p>
        <BodyMap
          selectedRegions={complaint?.locations || []}
          onSelectionChange={handleBodyMapChange}
          maxSelections={10}
        />
      </div>

      {/* O - Ontstaan (Onset) */}
      <div>
        <label htmlFor="onset" className="block text-lg font-semibold text-gray-900 mb-3">
          Hoe is de klacht ontstaan? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Beschrijf zo uitgebreid mogelijk hoe de klacht is begonnen
        </p>
        <textarea
          id="onset"
          value={complaint?.onset || ''}
          onChange={(e) => handleChange('onset', e.target.value)}
          placeholder="Bijvoorbeeld: De pijn is ontstaan na het tillen van een zware doos op mijn werk. Ik voelde meteen een scherpe pijn in mijn onderrug..."
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          Minimaal 10 tekens
        </p>
      </div>

      {/* F - Frequentie (Frequency) */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Hoe vaak heeft u last van de klacht? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {FREQUENCY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <input
                type="radio"
                name="frequency"
                value={option.value}
                checked={complaint?.frequency === option.value}
                onChange={(e) => handleChange('frequency', e.target.value)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* T - Tijdsduur (Duration) */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Hoe lang heeft u al last? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {DURATION_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <input
                type="radio"
                name="duration"
                value={option.value}
                checked={complaint?.duration === option.value}
                onChange={(e) => handleChange('duration', e.target.value)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* I - Intensiteit (Intensity - VAS Scale) */}
      <div>
        <label htmlFor="intensity" className="block text-lg font-semibold text-gray-900 mb-3">
          Hoe erg is de pijn op dit moment? <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Geef aan op een schaal van 0 (geen pijn) tot 10 (ondraaglijke pijn)
        </p>

        {/* VAS Slider */}
        <div className="relative">
          <input
            type="range"
            id="intensity"
            min="0"
            max="10"
            value={complaint?.intensity ?? 5}
            onChange={(e) => handleChange('intensity', Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-400 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #BBF7D0 0%, #FEF08A 50%, #FCA5A5 100%)`,
            }}
            required
          />

          {/* Value Display */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 border-4 border-green-600">
              <span className="text-2xl font-bold text-green-700">
                {complaint?.intensity ?? 5}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-700">
              {complaint?.intensity === 0 && 'Geen pijn'}
              {complaint?.intensity && complaint.intensity >= 1 && complaint.intensity <= 3 && 'Lichte pijn'}
              {complaint?.intensity && complaint.intensity >= 4 && complaint.intensity <= 6 && 'Matige pijn'}
              {complaint?.intensity && complaint.intensity >= 7 && complaint.intensity <= 9 && 'Ernstige pijn'}
              {complaint?.intensity === 10 && 'Ondraaglijke pijn'}
            </p>
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>0 - Geen pijn</span>
            <span>10 - Ondraaglijk</span>
          </div>
        </div>
      </div>

      {/* G - Geschiedenis (History) */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Is dit eerder voorgekomen? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <input
              type="radio"
              name="hasOccurredBefore"
              value="yes"
              checked={complaint?.hasOccurredBefore === true}
              onChange={() => handleChange('hasOccurredBefore', true)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Ja, dit is eerder voorgekomen</span>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <input
              type="radio"
              name="hasOccurredBefore"
              value="no"
              checked={complaint?.hasOccurredBefore === false}
              onChange={() => handleChange('hasOccurredBefore', false)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Nee, dit is de eerste keer</span>
          </label>
        </div>

        {/* Conditional: Previous Occurrence Details */}
        {complaint?.hasOccurredBefore === true && (
          <div className="mt-4">
            <label htmlFor="previousOccurrenceDetails" className="block text-sm font-medium text-gray-700 mb-2">
              Vertel meer over de eerdere voorvallen
            </label>
            <textarea
              id="previousOccurrenceDetails"
              value={complaint?.previousOccurrenceDetails || ''}
              onChange={(e) => handleChange('previousOccurrenceDetails', e.target.value)}
              placeholder="Bijvoorbeeld: Dit is de derde keer dit jaar. De vorige keer duurde het ongeveer 2 weken voordat de pijn over was..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}