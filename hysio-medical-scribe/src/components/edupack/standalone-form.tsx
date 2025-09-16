// Standalone Form Component for EduPack Generation
// Comprehensive input form for manual EduPack generation without session data

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DocumentUploader } from '@/components/ui/document-uploader';
import { SectionToggleGroup } from './section-toggle';
import {
  User,
  FileText,
  Upload,
  Wand2,
  AlertTriangle,
  Info,
  Plus,
  X
} from 'lucide-react';

import type {
  EduPackGenerationRequest,
  EduPackSectionType
} from '@/lib/types/edupack';

interface FormData {
  // Patient information
  patientName: string;
  patientAge: number | null;
  patientCondition: string;

  // Session context
  sessionContext: string;
  pathology: string;
  focusAreas: string[];

  // Upload option
  uploadedDocument?: File;
  documentContent?: string;

  // Generation preferences
  selectedSections: EduPackSectionType[];
  language: 'nl' | 'en';
  tone: 'formal' | 'informal';
  personalizationLevel: 'basic' | 'detailed';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StandaloneFormProps {
  onSubmit: (request: EduPackGenerationRequest) => void;
  isGenerating?: boolean;
  className?: string;
}

export function StandaloneForm({
  onSubmit,
  isGenerating = false,
  className = ''
}: StandaloneFormProps) {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    patientAge: null,
    patientCondition: '',
    sessionContext: '',
    pathology: '',
    focusAreas: [],
    selectedSections: ['introduction', 'session_summary', 'treatment_plan', 'self_care', 'warning_signs', 'follow_up'],
    language: 'nl',
    tone: 'formal',
    personalizationLevel: 'detailed'
  });

  const [inputMethod, setInputMethod] = useState<'manual' | 'upload'>('manual');
  const [newFocusArea, setNewFocusArea] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });

  // Update form data
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear validation errors when user makes changes
    if (validation.errors.length > 0) {
      setValidation({ isValid: true, errors: [], warnings: [] });
    }
  }, [validation.errors.length]);

  // Add focus area
  const addFocusArea = useCallback(() => {
    if (newFocusArea.trim() && !formData.focusAreas.includes(newFocusArea.trim())) {
      updateFormData({
        focusAreas: [...formData.focusAreas, newFocusArea.trim()]
      });
      setNewFocusArea('');
    }
  }, [newFocusArea, formData.focusAreas, updateFormData]);

  // Remove focus area
  const removeFocusArea = useCallback((area: string) => {
    updateFormData({
      focusAreas: formData.focusAreas.filter(fa => fa !== area)
    });
  }, [formData.focusAreas, updateFormData]);

  // Handle document upload
  const handleDocumentUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      updateFormData({
        uploadedDocument: file,
        documentContent: text,
        sessionContext: text.substring(0, 2000) // Limit initial context
      });
    } catch (error) {
      console.error('Error reading file:', error);
      setValidation({
        isValid: false,
        errors: ['Fout bij het lezen van het bestand'],
        warnings: []
      });
    }
  }, [updateFormData]);

  // Validate form
  const validateForm = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!formData.patientName.trim()) {
      errors.push('Patiëntnaam is verplicht');
    }

    if (inputMethod === 'manual') {
      if (!formData.sessionContext.trim() && !formData.pathology.trim()) {
        errors.push('Sessiecontext of pathologie is verplicht');
      }
    } else {
      if (!formData.uploadedDocument && !formData.documentContent) {
        errors.push('Document upload is verplicht');
      }
    }

    if (formData.selectedSections.length === 0) {
      errors.push('Selecteer minimaal één sectie');
    }

    // Warnings
    if (formData.patientAge && (formData.patientAge < 0 || formData.patientAge > 120)) {
      warnings.push('Controleer de leeftijd van de patiënt');
    }

    if (formData.sessionContext.length > 5000) {
      warnings.push('Lange teksten kunnen de generatietijd verhogen');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [formData, inputMethod]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = validateForm();
    setValidation(validationResult);

    if (!validationResult.isValid) {
      return;
    }

    // Build generation request
    const request: EduPackGenerationRequest = {
      manualInput: {
        patientInfo: {
          name: formData.patientName,
          age: formData.patientAge || undefined,
          condition: formData.patientCondition || undefined
        },
        sessionContext: formData.sessionContext,
        pathology: formData.pathology || undefined,
        focusAreas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined
      },
      preferences: {
        language: formData.language,
        tone: formData.tone,
        sections: formData.selectedSections,
        personalizationLevel: formData.personalizationLevel
      },
      therapistId: 'standalone-user' // TODO: Implement proper auth
    };

    onSubmit(request);
  }, [formData, validateForm, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Input method selection */}
      <div>
        <Label className="text-base font-medium">Invoermethode</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <InputMethodCard
            method="manual"
            icon={User}
            title="Handmatige invoer"
            description="Typ informatie direct in"
            isSelected={inputMethod === 'manual'}
            onSelect={() => setInputMethod('manual')}
          />
          <InputMethodCard
            method="upload"
            icon={Upload}
            title="Document upload"
            description="Upload bestaand verslag"
            isSelected={inputMethod === 'upload'}
            onSelect={() => setInputMethod('upload')}
          />
        </div>
      </div>

      {/* Patient information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Patiëntinformatie
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Naam patiënt *</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => updateFormData({ patientName: e.target.value })}
                placeholder="Voor- en achternaam"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="patientAge">Leeftijd</Label>
              <Input
                id="patientAge"
                type="number"
                value={formData.patientAge || ''}
                onChange={(e) => updateFormData({
                  patientAge: e.target.value ? parseInt(e.target.value) : null
                })}
                placeholder="Leeftijd in jaren"
                min="0"
                max="120"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="patientCondition">Hoofdklacht/conditie</Label>
            <Input
              id="patientCondition"
              value={formData.patientCondition}
              onChange={(e) => updateFormData({ patientCondition: e.target.value })}
              placeholder="bijv. rugklachten, nekpijn, knieproblemen"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Medische informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {inputMethod === 'manual' ? (
            <ManualInputSection
              sessionContext={formData.sessionContext}
              pathology={formData.pathology}
              focusAreas={formData.focusAreas}
              newFocusArea={newFocusArea}
              onSessionContextChange={(value) => updateFormData({ sessionContext: value })}
              onPathologyChange={(value) => updateFormData({ pathology: value })}
              onNewFocusAreaChange={setNewFocusArea}
              onAddFocusArea={addFocusArea}
              onRemoveFocusArea={removeFocusArea}
            />
          ) : (
            <UploadInputSection
              uploadedDocument={formData.uploadedDocument}
              documentContent={formData.documentContent}
              onDocumentUpload={handleDocumentUpload}
              onDocumentContentChange={(value) => updateFormData({ documentContent: value })}
            />
          )}
        </CardContent>
      </Card>

      {/* Section selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sectie-instellingen</CardTitle>
        </CardHeader>
        <CardContent>
          <SectionToggleGroup
            selectedSections={formData.selectedSections}
            onSectionToggle={(section, enabled) => {
              const newSections = enabled
                ? [...formData.selectedSections, section]
                : formData.selectedSections.filter(s => s !== section);
              updateFormData({ selectedSections: newSections });
            }}
            sessionType="intake"
            showRecommendations={false}
          />
        </CardContent>
      </Card>

      {/* Generation preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generatie-instellingen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Aanspreking</Label>
              <Select
                value={formData.tone}
                onValueChange={(value: 'formal' | 'informal') => updateFormData({ tone: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formeel (u)</SelectItem>
                  <SelectItem value="informal">Informeel (je)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Personalisatieniveau</Label>
              <Select
                value={formData.personalizationLevel}
                onValueChange={(value: 'basic' | 'detailed') => updateFormData({ personalizationLevel: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basis</SelectItem>
                  <SelectItem value="detailed">Uitgebreid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation feedback */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <ValidationFeedback validation={validation} />
      )}

      {/* Submit button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isGenerating || !validation.isValid}
          className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Wand2 className="h-4 w-4 mr-2 animate-spin" />
              Genereren...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              EduPack Genereren
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Input method selection card
function InputMethodCard({
  method,
  icon: Icon,
  title,
  description,
  isSelected,
  onSelect
}: {
  method: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-hysio-deep-green bg-hysio-mint/5'
          : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isSelected ? 'bg-hysio-deep-green text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Manual input section
function ManualInputSection({
  sessionContext,
  pathology,
  focusAreas,
  newFocusArea,
  onSessionContextChange,
  onPathologyChange,
  onNewFocusAreaChange,
  onAddFocusArea,
  onRemoveFocusArea
}: {
  sessionContext: string;
  pathology: string;
  focusAreas: string[];
  newFocusArea: string;
  onSessionContextChange: (value: string) => void;
  onPathologyChange: (value: string) => void;
  onNewFocusAreaChange: (value: string) => void;
  onAddFocusArea: () => void;
  onRemoveFocusArea: (area: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="sessionContext">Sessiecontext *</Label>
        <Textarea
          id="sessionContext"
          value={sessionContext}
          onChange={(e) => onSessionContextChange(e.target.value)}
          placeholder="Beschrijf wat er tijdens de sessie is besproken: klachten, bevindingen, behandelplan, adviezen..."
          rows={6}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          {sessionContext.length}/5000 tekens
        </p>
      </div>

      <div>
        <Label htmlFor="pathology">Pathologie/diagnose</Label>
        <Input
          id="pathology"
          value={pathology}
          onChange={(e) => onPathologyChange(e.target.value)}
          placeholder="bijv. lumbago, cervicalgie, gonartrose"
          className="mt-1"
        />
      </div>

      <div>
        <Label>Focusgebieden</Label>
        <div className="mt-1 space-y-2">
          {focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {focusAreas.map((area, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => onRemoveFocusArea(area)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newFocusArea}
              onChange={(e) => onNewFocusAreaChange(e.target.value)}
              placeholder="bijv. pijnmanagement, mobiliteit, kracht"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onAddFocusArea();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onAddFocusArea}
              disabled={!newFocusArea.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Upload input section
function UploadInputSection({
  uploadedDocument,
  documentContent,
  onDocumentUpload,
  onDocumentContentChange
}: {
  uploadedDocument?: File;
  documentContent?: string;
  onDocumentUpload: (file: File) => void;
  onDocumentContentChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Document upload</Label>
        <div className="mt-1">
          <DocumentUploader
            onFileUpload={onDocumentUpload}
            acceptedFileTypes={['.txt', '.pdf', '.docx']}
            maxFileSize={5 * 1024 * 1024} // 5MB
          />
        </div>
        {uploadedDocument && (
          <div className="mt-2 text-sm text-green-600">
            ✓ {uploadedDocument.name} geüpload
          </div>
        )}
      </div>

      {documentContent && (
        <div>
          <Label htmlFor="documentContent">Geëxtraheerde tekst</Label>
          <Textarea
            id="documentContent"
            value={documentContent}
            onChange={(e) => onDocumentContentChange(e.target.value)}
            rows={8}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            U kunt de geëxtraheerde tekst bewerken indien nodig
          </p>
        </div>
      )}
    </div>
  );
}

// Validation feedback component
function ValidationFeedback({ validation }: { validation: ValidationResult }) {
  return (
    <div className="space-y-2">
      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Corrigeer de volgende fouten:</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-700 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">Aandachtspunten:</span>
          </div>
          <ul className="text-sm text-amber-600 space-y-1">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}