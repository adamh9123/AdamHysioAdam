/**
 * Red Flags Indicator Component
 *
 * Prominently displays detected red flags with severity levels and recommendations.
 *
 * @module components/pre-intake/therapist/RedFlagsIndicator
 */

'use client';

import React, { useState } from 'react';
import type { DetectedRedFlag } from '@/types/pre-intake';

interface RedFlagsIndicatorProps {
  redFlags: DetectedRedFlag[];
}

export default function RedFlagsIndicator({ redFlags }: RedFlagsIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!redFlags || redFlags.length === 0) {
    return null;
  }

  const emergencyFlags = redFlags.filter((f) => f.severity === 'emergency');
  const urgentFlags = redFlags.filter((f) => f.severity === 'urgent');
  const referralFlags = redFlags.filter((f) => f.severity === 'referral');

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-900',
          badge: 'bg-red-600 text-white',
          icon: '🚨',
          label: 'SPOED',
        };
      case 'urgent':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-500',
          text: 'text-orange-900',
          badge: 'bg-orange-500 text-white',
          icon: '⚠️',
          label: 'URGENT',
        };
      case 'referral':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-500',
          text: 'text-yellow-900',
          badge: 'bg-yellow-500 text-gray-900',
          icon: '⚡',
          label: 'DOORVERWIJZING',
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-900',
          badge: 'bg-gray-500 text-white',
          icon: 'ℹ️',
          label: 'INFO',
        };
    }
  };

  const highestSeverity = emergencyFlags.length > 0
    ? 'emergency'
    : urgentFlags.length > 0
    ? 'urgent'
    : 'referral';

  const config = getSeverityConfig(highestSeverity);

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div
        className={`p-4 ${config.text} cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="text-lg font-bold">Red Flags Gedetecteerd</h3>
              <p className="text-sm">
                {redFlags.length} waarschuwing{redFlags.length !== 1 ? 'en' : ''} vereist{redFlags.length !== 1 ? 'en' : ''} aandacht
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
              {config.label}
            </span>
            <svg
              className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 bg-white border-t-2 border-gray-200">
          <div className="space-y-4">
            {/* Emergency Flags */}
            {emergencyFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs">
                    SPOED
                  </span>
                  Directe Actie Vereist
                </h4>
                <ul className="space-y-2">
                  {emergencyFlags.map((flag, idx) => (
                    <RedFlagItem key={idx} flag={flag} />
                  ))}
                </ul>
              </div>
            )}

            {/* Urgent Flags */}
            {urgentFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-orange-700 mb-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs">
                    URGENT
                  </span>
                  Binnen 24 uur actie
                </h4>
                <ul className="space-y-2">
                  {urgentFlags.map((flag, idx) => (
                    <RedFlagItem key={idx} flag={flag} />
                  ))}
                </ul>
              </div>
            )}

            {/* Referral Flags */}
            {referralFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-yellow-700 mb-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 rounded text-xs">
                    DOORVERWIJZING
                  </span>
                  Overweeg doorverwijzing
                </h4>
                <ul className="space-y-2">
                  {referralFlags.map((flag, idx) => (
                    <RedFlagItem key={idx} flag={flag} />
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Recommendations */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Aanbevolen Acties:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {emergencyFlags.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600">•</span>
                  <span>Neem onmiddellijk contact op met patiënt of verwijs door naar spoedeisende hulp</span>
                </li>
              )}
              {urgentFlags.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Contact opnemen met huisarts binnen 24 uur</span>
                </li>
              )}
              {referralFlags.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>Bespreek bevindingen met patiënt en overweeg medische evaluatie</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function RedFlagItem({ flag }: { flag: DetectedRedFlag }) {
  return (
    <li className="bg-gray-50 border border-gray-300 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-medium text-gray-900 mb-1">{flag.type}</p>
          {flag.recommendation && (
            <p className="text-sm text-gray-600 italic">→ {flag.recommendation}</p>
          )}
        </div>
      </div>
    </li>
  );
}