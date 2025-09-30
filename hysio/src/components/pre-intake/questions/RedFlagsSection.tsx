/**
 * Red Flags Screening Section Component
 *
 * DTF (Directe Toegang Fysiotherapie) screening questions for identifying
 * potential serious pathology. Uses non-alarming B1 Dutch language with
 * reassuring messages.
 *
 * @module components/pre-intake/questions/RedFlagsSection
 */

'use client';

import React from 'react';
import type { RedFlagsData, BodyRegion } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { BASE_RED_FLAGS, REGION_SPECIFIC_RED_FLAGS, RED_FLAGS_REASSURANCE } from '@/lib/pre-intake/constants';

export default function RedFlagsSection() {
  const redFlags = usePreIntakeStore((state) => state.questionnaireData.redFlags);
  const complaint = usePreIntakeStore((state) => state.questionnaireData.complaint);
  const setRedFlags = usePreIntakeStore((state) => state.setRedFlags);

  const handleBaseRedFlagChange = (key: string, value: boolean) => {
    setRedFlags({ [key]: value });
  };

  const handleRegionSpecificChange = (key: string, value: boolean) => {
    const regionSpecific = { ...redFlags?.regionSpecific };
    regionSpecific[key] = value;
    setRedFlags({ regionSpecific });
  };

  // Check if any red flag is positive
  const hasAnyPositiveFlag = React.useMemo(() => {
    const baseFlags = BASE_RED_FLAGS.some((flag) => redFlags?.[flag.key as keyof RedFlagsData] === true);
    const regionFlags = redFlags?.regionSpecific && Object.values(redFlags.regionSpecific).some((v) => v === true);
    return baseFlags || regionFlags;
  }, [redFlags]);

  // Get region-specific questions based on selected body locations
  const regionSpecificQuestions = React.useMemo(() => {
    if (!complaint?.locations || complaint.locations.length === 0) {
      return [];
    }

    const questions: Array<{ key: string; question: string; region: string }> = [];

    complaint.locations.forEach((location: BodyRegion) => {
      let regionKey = location;

      // Map specific locations to region groups
      if (location === 'lower-back') {
        regionKey = 'lower-back';
      } else if (location === 'head') {
        regionKey = 'head';
      } else if (location === 'chest') {
        regionKey = 'chest';
      }

      const regionFlags = REGION_SPECIFIC_RED_FLAGS[regionKey];
      if (regionFlags) {
        regionFlags.forEach((flag) => {
          // Avoid duplicates
          if (!questions.some((q) => q.key === flag.key)) {
            questions.push({
              key: flag.key,
              question: flag.question,
              region: regionKey,
            });
          }
        });
      }
    });

    return questions;
  }, [complaint?.locations]);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Belangrijke gezondheidsvragen
        </h3>
        <p className="text-sm text-blue-800">
          Deze vragen helpen uw fysiotherapeut om uw veiligheid te waarborgen. Wees eerlijk in uw antwoorden.
        </p>
      </div>

      {/* Base Red Flags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Algemene vragen <span className="text-red-500">*</span>
        </h3>

        {BASE_RED_FLAGS.map((flag) => (
          <div key={flag.key} className="border border-gray-300 rounded-lg p-4">
            <label className="flex items-start cursor-pointer">
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-3">{flag.question}</p>

                <div className="flex gap-4">
                  {/* Yes */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={flag.key}
                      value="yes"
                      checked={redFlags?.[flag.key as keyof RedFlagsData] === true}
                      onChange={() => handleBaseRedFlagChange(flag.key, true)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                      required
                    />
                    <span className="ml-2 text-gray-700">Ja</span>
                  </label>

                  {/* No */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={flag.key}
                      value="no"
                      checked={redFlags?.[flag.key as keyof RedFlagsData] === false}
                      onChange={() => handleBaseRedFlagChange(flag.key, false)}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                      required
                    />
                    <span className="ml-2 text-gray-700">Nee</span>
                  </label>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>

      {/* Region-Specific Red Flags */}
      {regionSpecificQuestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Aanvullende vragen over uw klacht <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600">
            Op basis van de locatie van uw klacht hebben we nog enkele extra vragen
          </p>

          {regionSpecificQuestions.map((question) => (
            <div key={question.key} className="border border-gray-300 rounded-lg p-4">
              <label className="flex items-start cursor-pointer">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium mb-3">{question.question}</p>

                  <div className="flex gap-4">
                    {/* Yes */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={question.key}
                        value="yes"
                        checked={redFlags?.regionSpecific?.[question.key] === true}
                        onChange={() => handleRegionSpecificChange(question.key, true)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                        required
                      />
                      <span className="ml-2 text-gray-700">Ja</span>
                    </label>

                    {/* No */}
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={question.key}
                        value="no"
                        checked={redFlags?.regionSpecific?.[question.key] === false}
                        onChange={() => handleRegionSpecificChange(question.key, false)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500"
                        required
                      />
                      <span className="ml-2 text-gray-700">Nee</span>
                    </label>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Reassurance Message */}
      {hasAnyPositiveFlag && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900 mb-1">
                Bedankt voor uw openheid
              </h4>
              <p className="text-sm text-green-800">
                {RED_FLAGS_REASSURANCE}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Waarom deze vragen?</strong> Deze vragen helpen uw fysiotherapeut om eventuele
          ernstige aandoeningen uit te sluiten. In de meeste gevallen is er geen reden tot zorgen.
        </p>
      </div>
    </div>
  );
}