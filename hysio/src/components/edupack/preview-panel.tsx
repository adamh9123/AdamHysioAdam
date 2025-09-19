// Preview Panel Component for EduPack Module
// Collapsible preview panel with section-specific icons and content validation

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { CollapsibleSection } from '@/components/ui/collapsible-section'; // TODO: Implement if needed
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Maximize2,
  Minimize2
} from 'lucide-react';

import { SectionEditor } from './section-editor';
import { SECTION_METADATA } from './section-toggle';

import type {
  EduPackContent,
  SectionContent,
  EduPackSectionType,
  ContentValidationResult
} from '@/lib/types/edupack';

export interface PreviewPanelProps {
  content: EduPackContent;
  validationResult?: ContentValidationResult;
  onContentUpdate?: (content: EduPackContent) => void;
  onSectionEdit?: (sectionType: EduPackSectionType, newContent: string) => void;
  onSectionRegenerate?: (sectionType: EduPackSectionType, instructions?: string) => void;
  isEditable?: boolean;
  showValidation?: boolean;
  fullScreen?: boolean;
  onFullScreenToggle?: () => void;
  className?: string;
}

interface PanelState {
  expandedSections: Set<EduPackSectionType>;
  editingSections: Set<EduPackSectionType>;
  viewMode: 'preview' | 'edit';
}

export function PreviewPanel({
  content,
  validationResult,
  onContentUpdate,
  onSectionEdit,
  onSectionRegenerate,
  isEditable = true,
  showValidation = true,
  fullScreen = false,
  onFullScreenToggle,
  className = ''
}: PreviewPanelProps) {
  // Local state for panel management
  const [panelState, setPanelState] = useState<PanelState>({
    expandedSections: new Set(content.sections.map(s => s.type)),
    editingSections: new Set(),
    viewMode: 'preview'
  });

  // Get enabled sections sorted by order
  const enabledSections = useMemo(() => {
    return content.sections
      .filter(section => section.enabled && section.content.trim())
      .sort((a, b) => {
        const orderA = SECTION_METADATA[a.type]?.priority === 'essential' ? 0 : 1;
        const orderB = SECTION_METADATA[b.type]?.priority === 'essential' ? 0 : 1;
        return orderA - orderB || a.order - b.order;
      });
  }, [content.sections]);

  // Validation summary
  const validationSummary = useMemo(() => {
    if (!validationResult) return null;

    const sectionIssues = validationResult.issues.reduce((acc, issue) => {
      if (issue.section) {
        acc[issue.section] = (acc[issue.section] || 0) + 1;
      }
      return acc;
    }, {} as Record<EduPackSectionType, number>);

    return {
      overall: validationResult,
      bySections: sectionIssues
    };
  }, [validationResult]);

  // Toggle section expansion
  const toggleSection = (sectionType: EduPackSectionType) => {
    setPanelState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionType)) {
        newExpanded.delete(sectionType);
      } else {
        newExpanded.add(sectionType);
      }
      return { ...prev, expandedSections: newExpanded };
    });
  };

  // Toggle section editing
  const toggleSectionEdit = (sectionType: EduPackSectionType) => {
    setPanelState(prev => {
      const newEditing = new Set(prev.editingSections);
      if (newEditing.has(sectionType)) {
        newEditing.delete(sectionType);
      } else {
        newEditing.add(sectionType);
      }
      return { ...prev, editingSections: newEditing };
    });
  };

  // Handle section content update
  const handleSectionUpdate = (sectionType: EduPackSectionType, newContent: string) => {
    if (onSectionEdit) {
      onSectionEdit(sectionType, newContent);
    }

    // Update local content
    if (onContentUpdate) {
      const updatedContent = {
        ...content,
        sections: content.sections.map(section =>
          section.type === sectionType
            ? { ...section, content: newContent, lastModified: new Date() }
            : section
        ),
        lastModified: new Date()
      };
      onContentUpdate(updatedContent);
    }
  };

  // Expand/collapse all sections
  const toggleAllSections = (expand: boolean) => {
    setPanelState(prev => ({
      ...prev,
      expandedSections: expand
        ? new Set(enabledSections.map(s => s.type))
        : new Set()
    }));
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">EduPack Preview</h3>
              <Badge variant="secondary" className="bg-hysio-mint/20 text-hysio-deep-green">
                {enabledSections.length} secties
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={panelState.viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPanelState(prev => ({ ...prev, viewMode: 'preview' }))}
                  className="h-7 px-3 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                {isEditable && (
                  <Button
                    variant={panelState.viewMode === 'edit' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPanelState(prev => ({ ...prev, viewMode: 'edit' }))}
                    className="h-7 px-3 text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Bewerk
                  </Button>
                )}
              </div>

              {/* Fullscreen toggle */}
              {onFullScreenToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFullScreenToggle}
                  className="h-8 w-8 p-0"
                >
                  {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAllSections(true)}
                className="text-xs"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                Alles uitklappen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAllSections(false)}
                className="text-xs"
              >
                <ChevronUp className="h-3 w-3 mr-1" />
                Alles inklappen
              </Button>
            </div>

            {/* Validation status */}
            {showValidation && validationSummary && (
              <ValidationStatusBadge validation={validationSummary.overall} />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 space-y-3">
          {enabledSections.map((section) => {
            const metadata = SECTION_METADATA[section.type];
            const isExpanded = panelState.expandedSections.has(section.type);
            const isEditing = panelState.editingSections.has(section.type) && panelState.viewMode === 'edit';
            const sectionIssues = validationSummary?.bySections[section.type] || 0;

            return (
              <SectionPreviewCard
                key={section.type}
                section={section}
                metadata={metadata}
                isExpanded={isExpanded}
                isEditing={isEditing}
                issueCount={sectionIssues}
                viewMode={panelState.viewMode}
                isEditable={isEditable}
                onToggleExpand={() => toggleSection(section.type)}
                onToggleEdit={() => toggleSectionEdit(section.type)}
                onContentUpdate={(newContent) => handleSectionUpdate(section.type, newContent)}
                onRegenerate={(instructions) => onSectionRegenerate?.(section.type, instructions)}
              />
            );
          })}

          {/* Empty state */}
          {enabledSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Geen secties geselecteerd voor preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with word count and actions */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span>
              Totaal: {getTotalWordCount(enabledSections)} woorden
            </span>
            {content.language && (
              <span className="ml-3">
                Taal: {content.language.toUpperCase()}
              </span>
            )}
            {content.tone && (
              <span className="ml-3">
                Toon: {content.tone === 'formal' ? 'Formeel' : 'Informeel'}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(getFullContent(enabledSections))}
            >
              <Copy className="h-4 w-4 mr-1" />
              Kopiëren
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement PDF download
                console.log('Download PDF');
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual section preview card
interface SectionPreviewCardProps {
  section: SectionContent;
  metadata: any;
  isExpanded: boolean;
  isEditing: boolean;
  issueCount: number;
  viewMode: 'preview' | 'edit';
  isEditable: boolean;
  onToggleExpand: () => void;
  onToggleEdit: () => void;
  onContentUpdate: (content: string) => void;
  onRegenerate?: (instructions?: string) => void;
}

function SectionPreviewCard({
  section,
  metadata,
  isExpanded,
  isEditing,
  issueCount,
  viewMode,
  isEditable,
  onToggleExpand,
  onToggleEdit,
  onContentUpdate,
  onRegenerate
}: SectionPreviewCardProps) {
  const IconComponent = metadata.icon;
  const wordCount = section.content.trim().split(/\s+/).length;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          {/* Icon and emoji */}
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label={metadata.label}>
              {metadata.emoji}
            </span>
            <IconComponent className="h-4 w-4 text-gray-600" />
          </div>

          {/* Title and status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{metadata.label}</h4>

              {/* Priority badge */}
              <Badge
                variant="secondary"
                className={`text-xs ${
                  metadata.priority === 'essential'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {metadata.priority === 'essential' ? 'Essentieel' : 'Aanbevolen'}
              </Badge>

              {/* Issue indicator */}
              {issueCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {issueCount}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{wordCount} woorden</span>
              <span>Bijgewerkt: {new Date(section.lastModified).toLocaleTimeString('nl-NL')}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isEditable && viewMode === 'edit' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleEdit();
                }}
                className="h-7 w-7 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}

            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Expandable content */}
      {isExpanded && (
        <CardContent className="pt-0">
          {isEditing ? (
            <SectionEditor
              content={section.content}
              sectionType={section.type}
              onSave={onContentUpdate}
              onCancel={onToggleEdit}
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {section.content}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Validation status badge
function ValidationStatusBadge({ validation }: { validation: ContentValidationResult }) {
  const highIssues = validation.issues.filter(i => i.severity === 'high').length;
  const mediumIssues = validation.issues.filter(i => i.severity === 'medium').length;

  if (highIssues > 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {highIssues} kritieke problemen
      </Badge>
    );
  }

  if (mediumIssues > 0) {
    return (
      <Badge className="bg-amber-100 text-amber-700 text-xs">
        <Info className="h-3 w-3 mr-1" />
        {mediumIssues} aandachtspunten
      </Badge>
    );
  }

  return (
    <Badge className="bg-green-100 text-green-700 text-xs">
      <CheckCircle className="h-3 w-3 mr-1" />
      {validation.languageLevel} niveau - Goed
    </Badge>
  );
}

// Utility functions
function getTotalWordCount(sections: SectionContent[]): number {
  return sections.reduce((total, section) => {
    return total + section.content.trim().split(/\s+/).length;
  }, 0);
}

function getFullContent(sections: SectionContent[]): string {
  return sections
    .map(section => {
      const metadata = SECTION_METADATA[section.type];
      return `${metadata.emoji} ${metadata.label}\n\n${section.content}`;
    })
    .join('\n\n---\n\n');
}