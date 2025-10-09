/**
 * Interactive Body Map Component
 *
 * SVG-based clickable body map for selecting pain/complaint locations.
 * Supports multi-selection (up to 10 regions), keyboard navigation,
 * and touch interactions for mobile.
 *
 * @module components/pre-intake/BodyMap
 */

'use client';

import React, { useState } from 'react';
import type { BodyRegion } from '@/types/pre-intake';
import { BODY_REGION_LABELS } from '@/lib/pre-intake/constants';

interface BodyMapProps {
  selectedRegions: BodyRegion[];
  onSelectionChange: (regions: BodyRegion[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export default function BodyMap({
  selectedRegions,
  onSelectionChange,
  maxSelections = 10,
  disabled = false,
}: BodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  const isSelected = (region: BodyRegion): boolean => {
    return selectedRegions.includes(region);
  };

  const handleRegionClick = (region: BodyRegion) => {
    if (disabled) return;

    if (isSelected(region)) {
      // Deselect region
      onSelectionChange(selectedRegions.filter((r) => r !== region));
    } else {
      // Select region (if under max)
      if (selectedRegions.length < maxSelections) {
        onSelectionChange([...selectedRegions, region]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, region: BodyRegion) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRegionClick(region);
    }
  };

  const getRegionColor = (region: BodyRegion): string => {
    if (disabled) return '#E5E7EB';
    if (isSelected(region)) return '#10B981'; // Hysio green
    if (hoveredRegion === region) return '#A5E1C5'; // Hysio mintgroen
    return '#F3F4F6';
  };

  const getRegionStroke = (region: BodyRegion): string => {
    if (isSelected(region)) return '#059669';
    if (hoveredRegion === region) return '#10B981';
    return '#D1D5DB';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Body Map SVG */}
      <svg
        viewBox="0 0 400 600"
        className="w-full h-auto"
        role="img"
        aria-label="Interactieve lichaamskaart voor selectie van klachtlocaties - vooraanzicht"
      >
        {/* Head */}
        <ellipse
          cx="200"
          cy="50"
          rx="40"
          ry="50"
          fill={getRegionColor('head')}
          stroke={getRegionStroke('head')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('head')}
          onMouseEnter={() => setHoveredRegion('head')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'head')}
          role="button"
          aria-label={`Hoofd ${isSelected('head') ? '(geselecteerd)' : ''}`}
        />

        {/* Face - Smiley to indicate front view */}
        {/* Left Eye */}
        <circle
          cx="185"
          cy="45"
          r="4"
          fill="#374151"
          pointerEvents="none"
        />
        {/* Right Eye */}
        <circle
          cx="215"
          cy="45"
          r="4"
          fill="#374151"
          pointerEvents="none"
        />
        {/* Mouth - Simple smile */}
        <path
          d="M 185 58 Q 200 65 215 58"
          stroke="#374151"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          pointerEvents="none"
        />

        {/* Neck */}
        <rect
          x="180"
          y="95"
          width="40"
          height="25"
          fill={getRegionColor('neck')}
          stroke={getRegionStroke('neck')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('neck')}
          onMouseEnter={() => setHoveredRegion('neck')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'neck')}
          role="button"
          aria-label={`Nek ${isSelected('neck') ? '(geselecteerd)' : ''}`}
        />

        {/* Shoulders - CORRECTED: Left on canvas = Right anatomically (viewing from front) */}
        <circle
          cx="140"
          cy="135"
          r="30"
          fill={getRegionColor('shoulder-right')}
          stroke={getRegionStroke('shoulder-right')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('shoulder-right')}
          onMouseEnter={() => setHoveredRegion('shoulder-right')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'shoulder-right')}
          role="button"
          aria-label={`Schouder Rechts ${isSelected('shoulder-right') ? '(geselecteerd)' : ''}`}
        />
        <circle
          cx="260"
          cy="135"
          r="30"
          fill={getRegionColor('shoulder-left')}
          stroke={getRegionStroke('shoulder-left')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('shoulder-left')}
          onMouseEnter={() => setHoveredRegion('shoulder-left')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'shoulder-left')}
          role="button"
          aria-label={`Schouder Links ${isSelected('shoulder-left') ? '(geselecteerd)' : ''}`}
        />

        {/* Upper Back & Chest */}
        <rect
          x="160"
          y="120"
          width="80"
          height="80"
          rx="10"
          fill={getRegionColor('upper-back')}
          stroke={getRegionStroke('upper-back')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('upper-back')}
          onMouseEnter={() => setHoveredRegion('upper-back')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'upper-back')}
          role="button"
          aria-label={`Bovenrug ${isSelected('upper-back') ? '(geselecteerd)' : ''}`}
        />

        {/* Chest (overlay) */}
        <rect
          x="170"
          y="130"
          width="60"
          height="50"
          rx="8"
          fill={getRegionColor('chest')}
          fillOpacity="0.8"
          stroke={getRegionStroke('chest')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('chest')}
          onMouseEnter={() => setHoveredRegion('chest')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'chest')}
          role="button"
          aria-label={`Borst ${isSelected('chest') ? '(geselecteerd)' : ''}`}
        />

        {/* Arms - CORRECTED: anatomical perspective */}
        <rect
          x="100"
          y="150"
          width="30"
          height="100"
          rx="15"
          fill={getRegionColor('arm-right')}
          stroke={getRegionStroke('arm-right')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('arm-right')}
          onMouseEnter={() => setHoveredRegion('arm-right')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'arm-right')}
          role="button"
          aria-label={`Arm Rechts ${isSelected('arm-right') ? '(geselecteerd)' : ''}`}
        />
        <rect
          x="270"
          y="150"
          width="30"
          height="100"
          rx="15"
          fill={getRegionColor('arm-left')}
          stroke={getRegionStroke('arm-left')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('arm-left')}
          onMouseEnter={() => setHoveredRegion('arm-left')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'arm-left')}
          role="button"
          aria-label={`Arm Links ${isSelected('arm-left') ? '(geselecteerd)' : ''}`}
        />

        {/* Lower Back */}
        <rect
          x="160"
          y="210"
          width="80"
          height="70"
          rx="10"
          fill={getRegionColor('lower-back')}
          stroke={getRegionStroke('lower-back')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('lower-back')}
          onMouseEnter={() => setHoveredRegion('lower-back')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'lower-back')}
          role="button"
          aria-label={`Onderrug ${isSelected('lower-back') ? '(geselecteerd)' : ''}`}
        />

        {/* Abdomen (overlay) */}
        <rect
          x="170"
          y="220"
          width="60"
          height="50"
          rx="8"
          fill={getRegionColor('abdomen')}
          fillOpacity="0.8"
          stroke={getRegionStroke('abdomen')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('abdomen')}
          onMouseEnter={() => setHoveredRegion('abdomen')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'abdomen')}
          role="button"
          aria-label={`Buik ${isSelected('abdomen') ? '(geselecteerd)' : ''}`}
        />

        {/* Hips - CORRECTED: anatomical perspective */}
        <circle
          cx="165"
          cy="300"
          r="30"
          fill={getRegionColor('hip-right')}
          stroke={getRegionStroke('hip-right')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('hip-right')}
          onMouseEnter={() => setHoveredRegion('hip-right')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'hip-right')}
          role="button"
          aria-label={`Heup Rechts ${isSelected('hip-right') ? '(geselecteerd)' : ''}`}
        />
        <circle
          cx="235"
          cy="300"
          r="30"
          fill={getRegionColor('hip-left')}
          stroke={getRegionStroke('hip-left')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('hip-left')}
          onMouseEnter={() => setHoveredRegion('hip-left')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'hip-left')}
          role="button"
          aria-label={`Heup Links ${isSelected('hip-left') ? '(geselecteerd)' : ''}`}
        />

        {/* Legs - CORRECTED: anatomical perspective */}
        <rect
          x="145"
          y="340"
          width="35"
          height="120"
          rx="17"
          fill={getRegionColor('leg-right')}
          stroke={getRegionStroke('leg-right')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('leg-right')}
          onMouseEnter={() => setHoveredRegion('leg-right')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'leg-right')}
          role="button"
          aria-label={`Been Rechts ${isSelected('leg-right') ? '(geselecteerd)' : ''}`}
        />
        <rect
          x="220"
          y="340"
          width="35"
          height="120"
          rx="17"
          fill={getRegionColor('leg-left')}
          stroke={getRegionStroke('leg-left')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('leg-left')}
          onMouseEnter={() => setHoveredRegion('leg-left')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'leg-left')}
          role="button"
          aria-label={`Been Links ${isSelected('leg-left') ? '(geselecteerd)' : ''}`}
        />

        {/* Knees - CORRECTED: anatomical perspective */}
        <circle
          cx="162"
          cy="410"
          r="20"
          fill={getRegionColor('knee-right')}
          stroke={getRegionStroke('knee-right')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('knee-right')}
          onMouseEnter={() => setHoveredRegion('knee-right')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'knee-right')}
          role="button"
          aria-label={`Knie Rechts ${isSelected('knee-right') ? '(geselecteerd)' : ''}`}
        />
        <circle
          cx="238"
          cy="410"
          r="20"
          fill={getRegionColor('knee-left')}
          stroke={getRegionStroke('knee-left')}
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => handleRegionClick('knee-left')}
          onMouseEnter={() => setHoveredRegion('knee-left')}
          onMouseLeave={() => setHoveredRegion(null)}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => handleKeyDown(e, 'knee-left')}
          role="button"
          aria-label={`Knie Links ${isSelected('knee-left') ? '(geselecteerd)' : ''}`}
        />
      </svg>

      {/* Selected Regions Display */}
      {selectedRegions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Geselecteerde locaties ({selectedRegions.length}/{maxSelections}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((region) => (
              <span
                key={region}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {BODY_REGION_LABELS[region]}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRegionClick(region)}
                    className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                    aria-label={`Verwijder ${BODY_REGION_LABELS[region]}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!disabled && (
        <p className="mt-4 text-sm text-gray-600 text-center">
          Klik op de lichaamskaart om maximaal {maxSelections} locaties te selecteren
        </p>
      )}
    </div>
  );
}