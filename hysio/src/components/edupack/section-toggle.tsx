// Section Toggle Component for EduPack Module
// Allows therapists to customize which sections to include in generated EduPack

'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  MessageSquare,
  Lightbulb,
  Stethoscope,
  Heart,
  AlertTriangle,
  Calendar,
  Info,
  CheckCircle2
} from 'lucide-react';

import type { EduPackSectionType } from '@/lib/types/edupack';
import { getSectionTemplate } from '@/lib/edupack/section-templates';

export interface SectionToggleProps {
  sectionType: EduPackSectionType;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  showDescription?: boolean;
  isRecommended?: boolean;
  disabled?: boolean;
  className?: string;
}

// Section metadata for display
const SECTION_METADATA: Record<EduPackSectionType, {
  icon: React.ComponentType<any>;
  emoji: string;
  label: string;
  shortDescription: string;
  recommendedFor: ('intake' | 'followup')[];
  color: string;
  priority: 'essential' | 'recommended' | 'optional';
}> = {
  introduction: {
    icon: FileText,
    emoji: '📄',
    label: 'Introductie',
    shortDescription: 'Welkom en uitleg van de samenvatting',
    recommendedFor: ['intake', 'followup'],
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    priority: 'essential'
  },
  session_summary: {
    icon: MessageSquare,
    emoji: '📋',
    label: 'Samenvatting gesprek',
    shortDescription: 'Overzicht van wat er besproken is',
    recommendedFor: ['intake', 'followup'],
    color: 'bg-green-50 text-green-700 border-green-200',
    priority: 'essential'
  },
  diagnosis: {
    icon: Lightbulb,
    emoji: '💡',
    label: 'Uitleg diagnose',
    shortDescription: 'Wat er aan de hand is in begrijpelijke taal',
    recommendedFor: ['intake'],
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    priority: 'recommended'
  },
  treatment_plan: {
    icon: Stethoscope,
    emoji: '🩺',
    label: 'Behandelplan',
    shortDescription: 'Doelen en geplande behandeling',
    recommendedFor: ['intake', 'followup'],
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    priority: 'essential'
  },
  self_care: {
    icon: Heart,
    emoji: '🧘',
    label: 'Zelfzorg en oefeningen',
    shortDescription: 'Wat de patiënt zelf kan doen',
    recommendedFor: ['intake', 'followup'],
    color: 'bg-teal-50 text-teal-700 border-teal-200',
    priority: 'recommended'
  },
  warning_signs: {
    icon: AlertTriangle,
    emoji: '⚠️',
    label: 'Waarschuwingssignalen',
    shortDescription: 'Wanneer contact opnemen',
    recommendedFor: ['intake', 'followup'],
    color: 'bg-red-50 text-red-700 border-red-200',
    priority: 'recommended'
  },
  follow_up: {
    icon: Calendar,
    emoji: '📅',
    label: 'Vervolgafspraken',
    shortDescription: 'Planning en volgende stappen',
    recommendedFor: ['intake', 'followup'],
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    priority: 'essential'
  }
};

export function SectionToggle({
  sectionType,
  enabled,
  onToggle,
  showDescription = true,
  isRecommended = false,
  disabled = false,
  className = ''
}: SectionToggleProps) {
  const metadata = SECTION_METADATA[sectionType];
  const template = getSectionTemplate(sectionType);
  const IconComponent = metadata.icon;

  const handleToggle = (checked: boolean) => {
    if (!disabled) {
      onToggle(checked);
    }
  };

  return (
    <div className={`group ${className}`}>
      <div
        className={`
          flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
          ${enabled
            ? `${metadata.color} shadow-sm`
            : 'bg-gray-50 text-gray-500 border-gray-200'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
        `}
        onClick={() => handleToggle(!enabled)}
      >
        {/* Icon and emoji */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg" role="img" aria-label={metadata.label}>
            {metadata.emoji}
          </span>
          <IconComponent className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium text-sm ${enabled ? '' : 'text-gray-500'}`}>
                {metadata.label}
              </h4>

              {/* Priority badge */}
              <PriorityBadge priority={metadata.priority} enabled={enabled} />

              {/* Recommended badge */}
              {isRecommended && (
                <Badge variant="secondary" className="text-xs">
                  Aanbevolen
                </Badge>
              )}
            </div>

            {/* Toggle switch */}
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={disabled}
              className="data-[state=checked]:bg-hysio-deep-green"
            />
          </div>

          {/* Description */}
          {showDescription && (
            <p className={`text-xs mt-1 ${enabled ? 'text-current opacity-80' : 'text-gray-400'}`}>
              {metadata.shortDescription}
            </p>
          )}

          {/* Additional info when enabled */}
          {enabled && showDescription && (
            <div className="mt-2 text-xs opacity-75">
              <div className="flex items-center gap-4">
                <span>Max. {template.maxLength} woorden</span>
                {template.requiredFields.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Vereist sessiedata
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Priority badge component
function PriorityBadge({ priority, enabled }: { priority: string; enabled: boolean }) {
  const config = {
    essential: {
      label: 'Essentieel',
      className: enabled
        ? 'bg-green-100 text-green-700 border-green-300'
        : 'bg-gray-100 text-gray-500 border-gray-300'
    },
    recommended: {
      label: 'Aanbevolen',
      className: enabled
        ? 'bg-blue-100 text-blue-700 border-blue-300'
        : 'bg-gray-100 text-gray-500 border-gray-300'
    },
    optional: {
      label: 'Optioneel',
      className: enabled
        ? 'bg-gray-100 text-gray-700 border-gray-300'
        : 'bg-gray-100 text-gray-500 border-gray-300'
    }
  };

  const priorityConfig = config[priority as keyof typeof config] || config.optional;

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${priorityConfig.className}`}>
      {priorityConfig.label}
    </span>
  );
}

// Section Toggle Group component for managing multiple sections
export interface SectionToggleGroupProps {
  selectedSections: EduPackSectionType[];
  onSectionToggle: (sectionType: EduPackSectionType, enabled: boolean) => void;
  sessionType?: 'intake' | 'followup';
  showRecommendations?: boolean;
  allowCustomization?: boolean;
  className?: string;
}

export function SectionToggleGroup({
  selectedSections,
  onSectionToggle,
  sessionType = 'intake',
  showRecommendations = true,
  allowCustomization = true,
  className = ''
}: SectionToggleGroupProps) {
  const allSections: EduPackSectionType[] = [
    'introduction',
    'session_summary',
    'diagnosis',
    'treatment_plan',
    'self_care',
    'warning_signs',
    'follow_up'
  ];

  // Filter sections based on session type recommendations
  const relevantSections = allSections.filter(sectionType => {
    const metadata = SECTION_METADATA[sectionType];
    return metadata.recommendedFor.includes(sessionType);
  });

  // Quick action buttons
  const selectAll = () => {
    relevantSections.forEach(sectionType => {
      if (!selectedSections.includes(sectionType)) {
        onSectionToggle(sectionType, true);
      }
    });
  };

  const selectEssential = () => {
    allSections.forEach(sectionType => {
      const metadata = SECTION_METADATA[sectionType];
      const shouldEnable = metadata.priority === 'essential' &&
                          metadata.recommendedFor.includes(sessionType);
      const isCurrentlyEnabled = selectedSections.includes(sectionType);

      if (shouldEnable !== isCurrentlyEnabled) {
        onSectionToggle(sectionType, shouldEnable);
      }
    });
  };

  const clearAll = () => {
    selectedSections.forEach(sectionType => {
      onSectionToggle(sectionType, false);
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with quick actions */}
      {allowCustomization && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Selecteer secties</h3>
            <p className="text-sm text-gray-600">
              Kies welke onderdelen in de EduPack moeten komen
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={selectEssential}
              className="text-xs"
            >
              Essentieel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="text-xs"
            >
              Alles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Wissen
            </Button>
          </div>
        </div>
      )}

      {/* Session type indicator */}
      {showRecommendations && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">
              {sessionType === 'intake' ? 'Intake sessie' : 'Controle afspraak'}
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            {sessionType === 'intake'
              ? 'Aanbevolen secties voor eerste afspraken zijn automatisch geselecteerd'
              : 'Aanbevolen secties voor controle afspraken zijn automatisch geselecteerd'
            }
          </p>
        </div>
      )}

      {/* Section toggles */}
      <div className="space-y-2">
        {allSections.map((sectionType) => {
          const metadata = SECTION_METADATA[sectionType];
          const isRecommended = showRecommendations &&
                               metadata.recommendedFor.includes(sessionType);
          const isEnabled = selectedSections.includes(sectionType);

          return (
            <SectionToggle
              key={sectionType}
              sectionType={sectionType}
              enabled={isEnabled}
              onToggle={(enabled) => onSectionToggle(sectionType, enabled)}
              isRecommended={isRecommended}
              disabled={!allowCustomization}
            />
          );
        })}
      </div>

      {/* Selection summary */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {selectedSections.length} van {allSections.length} secties geselecteerd
          </span>
          <div className="flex gap-2">
            {selectedSections.length > 0 && (
              <span className="text-green-600 font-medium">
                Geschatte lengte: {selectedSections.length * 150} woorden
              </span>
            )}
          </div>
        </div>

        {/* Show which essential sections are missing */}
        {allowCustomization && selectedSections.length > 0 && (
          <EssentialSectionCheck
            selectedSections={selectedSections}
            sessionType={sessionType}
          />
        )}
      </div>
    </div>
  );
}

// Component to check if essential sections are included
function EssentialSectionCheck({
  selectedSections,
  sessionType
}: {
  selectedSections: EduPackSectionType[];
  sessionType: 'intake' | 'followup';
}) {
  const essentialSections = Object.entries(SECTION_METADATA)
    .filter(([_, metadata]) =>
      metadata.priority === 'essential' &&
      metadata.recommendedFor.includes(sessionType)
    )
    .map(([sectionType]) => sectionType as EduPackSectionType);

  const missingSections = essentialSections.filter(
    sectionType => !selectedSections.includes(sectionType)
  );

  if (missingSections.length === 0) {
    return (
      <div className="flex items-center gap-2 mt-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm">Alle essentiële secties zijn geselecteerd</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Ontbrekende essentiële secties:</span>
      </div>
      <ul className="text-sm text-amber-600 mt-1 ml-6">
        {missingSections.map(sectionType => (
          <li key={sectionType}>
            • {SECTION_METADATA[sectionType].label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Export section metadata for use in other components
export { SECTION_METADATA };