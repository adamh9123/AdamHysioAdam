/**
 * LOFTIG Memory Prompts Component
 *
 * Displays helper questions based on the LOFTIG framework to guide patients
 * in providing comprehensive complaint descriptions during voice dictation.
 *
 * @module components/pre-intake/LOFTIGPrompts
 */

'use client';

import React, { useState } from 'react';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { getTranslations } from '@/lib/pre-intake/translations';

export default function LOFTIGPrompts() {
  const language = usePreIntakeStore((state) => state.language);
  const t = getTranslations(language);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const prompts = [
    t.loftigPrompt1,
    t.loftigPrompt2,
    t.loftigPrompt3,
    t.loftigPrompt4,
    t.loftigPrompt5,
    t.loftigPrompt6,
  ];

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between bg-blue-100 hover:bg-blue-150 transition-colors"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-sm font-semibold text-blue-900">{t.loftigPromptsTitle}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-blue-600 transition-transform duration-200 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Prompts List */}
      {!isCollapsed && (
        <div className="p-4">
          <p className="text-xs text-blue-700 mb-3">
            Gebruik deze vragen als geheugensteun tijdens uw opname:
          </p>
          <ul className="space-y-2">
            {prompts.map((prompt, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="w-5 h-5 flex items-center justify-center bg-blue-200 rounded-full text-xs font-bold text-blue-700 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{prompt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
