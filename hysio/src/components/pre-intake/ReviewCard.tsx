/**
 * Review Card Component
 *
 * Reusable card component for displaying questionnaire data in review screens.
 * Features collapsible content, icons, and clean typography.
 *
 * @module components/pre-intake/ReviewCard
 */

'use client';

import React, { useState } from 'react';

interface ReviewCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  onEdit?: () => void;
  editLabel?: string;
}

export default function ReviewCard({
  title,
  children,
  icon,
  defaultCollapsed = false,
  className = '',
  onEdit,
  editLabel = 'Bewerk',
}: ReviewCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`border-2 border-gray-200 rounded-lg overflow-hidden ${className}`} data-print-section>
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex-1 flex items-center gap-3 text-left hover:opacity-80 transition-opacity no-print"
          aria-expanded={!isCollapsed}
        >
          {icon && <div className="text-green-600">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </button>

        {/* Print-only title (visible when printing) */}
        <div className="hidden print:flex items-center gap-3">
          {icon && <div className="text-gray-700">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="flex items-center gap-2 no-print">
          {/* Edit Button */}
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors flex items-center gap-1.5 font-medium"
              title={`${editLabel} ${title}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {editLabel}
            </button>
          )}

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label={isCollapsed ? 'Uitklappen' : 'Inklappen'}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
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
        </div>
      </div>

      {/* Content - Always show when printing */}
      {!isCollapsed && <div className="px-6 py-4 bg-white">{children}</div>}
      {isCollapsed && <div className="px-6 py-4 bg-white hidden print:block">{children}</div>}
    </div>
  );
}

/**
 * Review Data Row Component
 * Helper for displaying key-value pairs
 */
interface ReviewDataRowProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

export function ReviewDataRow({ label, value, className = '' }: ReviewDataRowProps) {
  return (
    <div className={`flex border-b border-gray-100 py-3 last:border-b-0 ${className}`}>
      <dt className="w-1/3 text-sm font-medium text-gray-600">{label}:</dt>
      <dd className="w-2/3 text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );
}

/**
 * Review List Component
 * Helper for displaying lists with bullets
 */
interface ReviewListProps {
  items: string[];
  className?: string;
}

export function ReviewList({ items, className = '' }: ReviewListProps) {
  if (!items || items.length === 0) {
    return <span className="text-gray-500 italic">Geen items</span>;
  }

  return (
    <ul className={`list-disc list-inside space-y-1 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="text-sm text-gray-700">
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Review Text Block Component
 * Helper for displaying longer text content
 */
interface ReviewTextBlockProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export function ReviewTextBlock({ text, maxLines, className = '' }: ReviewTextBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return <span className="text-gray-500 italic">Geen tekst ingevoerd</span>;
  }

  const needsExpansion = maxLines && text.length > maxLines * 80; // Approximate

  return (
    <div className={className}>
      <p
        className={`text-sm text-gray-700 whitespace-pre-wrap ${
          !isExpanded && maxLines ? `line-clamp-${maxLines}` : ''
        } print:line-clamp-none`}
      >
        {text}
      </p>
      {needsExpansion && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium no-print"
        >
          {isExpanded ? 'Toon minder' : 'Toon meer'}
        </button>
      )}
    </div>
  );
}
