/**
 * Personalia Section Component
 *
 * Collects patient personal information: name, birth date, phone, email, insurance.
 * Uses controlled inputs with validation feedback.
 *
 * @module components/pre-intake/questions/PersonaliaSection
 */

'use client';

import React from 'react';
import type { PersonaliaData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';

interface PersonaliaSectionProps {
  onValidationChange?: (isValid: boolean) => void;
}

export default function PersonaliaSection({ onValidationChange }: PersonaliaSectionProps) {
  const personalia = usePreIntakeStore((state) => state.questionnaireData.personalia);
  const setPersonalia = usePreIntakeStore((state) => state.setPersonalia);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (field: keyof PersonaliaData, value: string) => {
    setPersonalia({ [field]: value });

    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateField = (field: keyof PersonaliaData, value: string): string | null => {
    switch (field) {
      case 'fullName':
        if (!value || value.trim().length < 2) {
          return 'Naam moet minimaal 2 tekens bevatten';
        }
        return null;

      case 'birthDate':
        if (!value) {
          return 'Geboortedatum is verplicht';
        }
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate > today) {
          return 'Geboortedatum kan niet in de toekomst liggen';
        }
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120 || age < 0) {
          return 'Voer een geldige geboortedatum in';
        }
        return null;

      case 'phone':
        if (!value || value.length < 10) {
          return 'Voer een geldig telefoonnummer in';
        }
        return null;

      case 'email':
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Voer een geldig e-mailadres in';
        }
        return null;

      case 'gender':
        if (!value || (value !== 'man' && value !== 'vrouw')) {
          return 'Selecteer uw geslacht';
        }
        return null;

      case 'insurance':
        // Insurance is now optional - no validation needed
        return null;

      default:
        return null;
    }
  };

  const handleBlur = (field: keyof PersonaliaData) => {
    const value = personalia?.[field] as string || '';
    const error = validateField(field, value);

    if (error) {
      setErrors({ ...errors, [field]: error });
    }

    // Check overall validity (insurance is now optional)
    if (onValidationChange) {
      const isValid = !error &&
        personalia?.fullName &&
        personalia?.gender &&
        personalia?.birthDate &&
        personalia?.phone &&
        personalia?.email;
      onValidationChange(!!isValid);
    }
  };

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          Volledige naam <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="fullName"
          value={personalia?.fullName || ''}
          onChange={(e) => handleChange('fullName', e.target.value)}
          onBlur={() => handleBlur('fullName')}
          placeholder="Voor- en achternaam"
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.fullName ? 'border-red-500' : 'border-gray-300'}
            focus:ring-2 focus:ring-green-500 focus:border-transparent
            transition-colors
          `}
          required
          autoComplete="name"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Geslacht <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors flex-1">
            <input
              type="radio"
              name="gender"
              value="man"
              checked={personalia?.gender === 'man'}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={() => handleBlur('gender')}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Man</span>
          </label>
          <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-green-50 transition-colors flex-1">
            <input
              type="radio"
              name="gender"
              value="vrouw"
              checked={personalia?.gender === 'vrouw'}
              onChange={(e) => handleChange('gender', e.target.value)}
              onBlur={() => handleBlur('gender')}
              className="w-4 h-4 text-green-600 focus:ring-green-500"
              required
            />
            <span className="ml-3 text-gray-700">Vrouw</span>
          </label>
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
        )}
      </div>

      {/* Birth Date */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
          Geboortedatum <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="birthDate"
          value={personalia?.birthDate || ''}
          onChange={(e) => handleChange('birthDate', e.target.value)}
          onBlur={() => handleBlur('birthDate')}
          max={new Date().toISOString().split('T')[0]}
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}
            focus:ring-2 focus:ring-green-500 focus:border-transparent
            transition-colors
          `}
          required
          autoComplete="bday"
        />
        {errors.birthDate && (
          <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Telefoonnummer <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          value={personalia?.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="06 12345678 of +31 6 12345678"
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.phone ? 'border-red-500' : 'border-gray-300'}
            focus:ring-2 focus:ring-green-500 focus:border-transparent
            transition-colors
          `}
          required
          autoComplete="tel"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          E-mailadres <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={personalia?.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="voorbeeld@email.nl"
          className={`
            w-full px-4 py-3 rounded-lg border
            ${errors.email ? 'border-red-500' : 'border-gray-300'}
            focus:ring-2 focus:ring-green-500 focus:border-transparent
            transition-colors
          `}
          required
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Insurance */}
      <div>
        <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-2">
          Zorgverzekeraar <span className="text-gray-500 text-xs">(optioneel)</span>
        </label>
        <input
          type="text"
          id="insurance"
          value={personalia?.insurance || ''}
          onChange={(e) => handleChange('insurance', e.target.value)}
          onBlur={() => handleBlur('insurance')}
          placeholder="Bijv. Zilveren Kruis, VGZ, CZ"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        />
        <p className="mt-1 text-xs text-gray-500">
          Indien bekend - helpt bij de administratie
        </p>
      </div>

      {/* Insurance Number (Optional) */}
      <div>
        <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Polisnummer <span className="text-gray-500 text-xs">(optioneel)</span>
        </label>
        <input
          type="text"
          id="insuranceNumber"
          value={personalia?.insuranceNumber || ''}
          onChange={(e) => handleChange('insuranceNumber', e.target.value)}
          placeholder="Indien bekend"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        />
        <p className="mt-1 text-xs text-gray-500">
          Dit helpt uw fysiotherapeut bij de administratie
        </p>
      </div>
    </div>
  );
}