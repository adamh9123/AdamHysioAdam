/**
 * Language Switcher Component
 *
 * Provides multi-language support for the pre-intake questionnaire
 * with flag-based visual selector (NL, EN, AR).
 * Persists language preference in localStorage.
 *
 * @module components/pre-intake/LanguageSwitcher
 */

'use client';

import React, { useEffect } from 'react';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import type { Language } from '@/lib/pre-intake/translations';

const LANGUAGE_OPTIONS: Array<{
  code: Language;
  label: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}> = [
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', direction: 'ltr' },
  { code: 'en', label: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', direction: 'rtl' },
];

const STORAGE_KEY = 'hysio-pre-intake-language';

export default function LanguageSwitcher() {
  const language = usePreIntakeStore((state) => state.language);
  const setLanguage = usePreIntakeStore((state) => state.setLanguage);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (savedLanguage && ['nl', 'en', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, [setLanguage]);

  // Update HTML dir attribute and save preference when language changes
  useEffect(() => {
    const selectedLang = LANGUAGE_OPTIONS.find((lang) => lang.code === language);
    if (selectedLang) {
      document.documentElement.dir = selectedLang.direction;
      document.documentElement.lang = selectedLang.code;
      localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex justify-center items-center gap-2 mb-6">
      <span className="text-sm text-gray-600 mr-2">Taal / Language / اللغة:</span>
      <div className="flex gap-2">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            className={`
              px-4 py-2 rounded-lg border-2 transition-all duration-200
              flex items-center gap-2 font-medium text-sm
              ${
                language === option.code
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50'
              }
            `}
            aria-label={`Switch to ${option.label}`}
            aria-pressed={language === option.code}
          >
            <span className="text-xl" aria-hidden="true">
              {option.flag}
            </span>
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
