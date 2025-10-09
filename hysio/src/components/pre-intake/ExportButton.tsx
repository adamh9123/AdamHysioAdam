/**
 * Export Button Component
 *
 * Button component for triggering export of questionnaire data
 * in various formats (PDF, DOCX, HTML, TXT).
 *
 * @module components/pre-intake/ExportButton
 */

'use client';

import React, { useState } from 'react';
import type { PreIntakeExportFormat } from '@/types/pre-intake';

interface ExportButtonProps {
  format: PreIntakeExportFormat;
  label: string;
  icon: React.ReactNode;
  onClick: () => Promise<void>;
  className?: string;
}

export default function ExportButton({
  format,
  label,
  icon,
  onClick,
  className = '',
}: ExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      await onClick();
    } catch (err) {
      console.error(`Error exporting as ${format}:`, err);
      setError('Fout bij het genereren van de download');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format-specific colors
  const colorClasses = {
    pdf: 'bg-red-500 hover:bg-red-600 border-red-600',
    docx: 'bg-blue-500 hover:bg-blue-600 border-blue-600',
    html: 'bg-orange-500 hover:bg-orange-600 border-orange-600',
    txt: 'bg-gray-500 hover:bg-gray-600 border-gray-600',
    json: 'bg-purple-500 hover:bg-purple-600 border-purple-600',
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isGenerating}
        className={`
          w-full px-6 py-4 rounded-lg border-2 text-white font-semibold
          transition-all duration-200 flex items-center justify-center gap-3
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:shadow-lg transform hover:-translate-y-0.5
          ${colorClasses[format] || 'bg-green-500 hover:bg-green-600 border-green-600'}
        `}
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Bezig met genereren...</span>
          </>
        ) : (
          <>
            <div className="text-2xl">{icon}</div>
            <span>{label}</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

/**
 * Format icon components
 */
export const PDFIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
      clipRule="evenodd"
    />
  </svg>
);

export const WordIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
    <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
  </svg>
);

export const HTMLIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

export const TextIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
      clipRule="evenodd"
    />
  </svg>
);
