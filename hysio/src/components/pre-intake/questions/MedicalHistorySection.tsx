/**
 * Medical History Section Component
 *
 * Collects patient medical background: surgeries, medications,
 * other conditions, smoking status, alcohol consumption.
 *
 * @module components/pre-intake/questions/MedicalHistorySection
 */

'use client';

import React from 'react';
import type { MedicalHistoryData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { SMOKING_OPTIONS, ALCOHOL_OPTIONS } from '@/lib/pre-intake/constants';

export default function MedicalHistorySection() {
  const medicalHistory = usePreIntakeStore((state) => state.questionnaireData.medicalHistory);
  const setMedicalHistory = usePreIntakeStore((state) => state.setMedicalHistory);

  const handleChange = (field: keyof MedicalHistoryData, value: any) => {
    setMedicalHistory({ [field]: value });
  };

  const handleAddMedication = () => {
    const current = medicalHistory?.medications || [];
    if (current.length < 20) {
      handleChange('medications', [...current, '']);
    }
  };

  const handleRemoveMedication = (index: number) => {
    const current = medicalHistory?.medications || [];
    handleChange('medications', current.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, value: string) => {
    const current = medicalHistory?.medications || [];
    const updated = [...current];
    updated[index] = value;
    handleChange('medications', updated);
  };

  return (
    <div className="space-y-8">
      {/* Recent Surgeries */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Heeft u recente operaties gehad? <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <input
              type="radio"
              name="hasRecentSurgeries"
              value="yes"
              checked={medicalHistory?.hasRecentSurgeries === true}
              onChange={() => handleChange('hasRecentSurgeries', true)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Ja</span>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <input
              type="radio"
              name="hasRecentSurgeries"
              value="no"
              checked={medicalHistory?.hasRecentSurgeries === false}
              onChange={() => handleChange('hasRecentSurgeries', false)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Nee</span>
          </label>
        </div>

        {/* Conditional: Surgery Details */}
        {medicalHistory?.hasRecentSurgeries === true && (
          <div className="mt-4">
            <label htmlFor="surgeryDetails" className="block text-sm font-medium text-gray-700 mb-2">
              Vertel meer over de operatie(s)
            </label>
            <textarea
              id="surgeryDetails"
              value={medicalHistory?.surgeryDetails || ''}
              onChange={(e) => handleChange('surgeryDetails', e.target.value)}
              placeholder="Bijvoorbeeld: Knie operatie in januari 2024, herstel verloopt goed..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
            />
          </div>
        )}
      </div>

      {/* Medications */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Gebruikt u medicatie? <span className="text-red-500">*</span>
        </label>

        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <input
              type="radio"
              name="takesMedication"
              value="yes"
              checked={medicalHistory?.takesMedication === true}
              onChange={() => handleChange('takesMedication', true)}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Ja</span>
          </label>

          <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <input
              type="radio"
              name="takesMedication"
              value="no"
              checked={medicalHistory?.takesMedication === false}
              onChange={() => {
                handleChange('takesMedication', false);
                handleChange('medications', []);
              }}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Nee</span>
          </label>
        </div>

        {/* Conditional: Medication List */}
        {medicalHistory?.takesMedication === true && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-gray-600 mb-2">
              Voer uw medicatie in (maximaal 20 medicijnen)
            </p>

            {(medicalHistory?.medications || ['']).map((med, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={med}
                  onChange={(e) => handleMedicationChange(index, e.target.value)}
                  placeholder={`Medicijn ${index + 1}`}
                  maxLength={100}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                {medicalHistory.medications && medicalHistory.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(index)}
                    className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    aria-label={`Verwijder medicijn ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {(!medicalHistory?.medications || medicalHistory.medications.length < 20) && (
              <button
                type="button"
                onClick={handleAddMedication}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
              >
                + Voeg medicijn toe
              </button>
            )}
          </div>
        )}
      </div>

      {/* Other Conditions */}
      <div>
        <label htmlFor="otherConditions" className="block text-lg font-semibold text-gray-900 mb-3">
          Heeft u andere aandoeningen?
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Bijvoorbeeld: diabetes, hoge bloeddruk, astma, enz.
        </p>
        <textarea
          id="otherConditions"
          value={medicalHistory?.otherConditions || ''}
          onChange={(e) => handleChange('otherConditions', e.target.value)}
          placeholder="Beschrijf hier andere aandoeningen (optioneel)"
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          {medicalHistory?.otherConditions?.length || 0} / 1000 tekens
        </p>
      </div>

      {/* Smoking Status */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Rookt u? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {SMOKING_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <input
                type="radio"
                name="smokingStatus"
                value={option.value}
                checked={medicalHistory?.smokingStatus === option.value}
                onChange={(e) => handleChange('smokingStatus', e.target.value)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Alcohol Consumption */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Gebruikt u alcohol? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {ALCOHOL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors"
            >
              <input
                type="radio"
                name="alcoholConsumption"
                value={option.value}
                checked={medicalHistory?.alcoholConsumption === option.value}
                onChange={(e) => handleChange('alcoholConsumption', e.target.value)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
                required
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Privacy:</strong> Al uw medische informatie wordt veilig opgeslagen en alleen gedeeld met uw fysiotherapeut.
        </p>
      </div>
    </div>
  );
}