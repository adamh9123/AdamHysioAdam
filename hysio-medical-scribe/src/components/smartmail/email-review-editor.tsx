// Email review and editing component with real-time feedback
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, Eye, Save, RotateCcw, AlertTriangle, CheckCircle, 
  Clock, FileText, Sparkles, RefreshCw 
} from 'lucide-react';
import type { EmailTemplate, EmailSuggestion } from '@/lib/types/smartmail';

interface EmailReviewEditorProps {
  template: EmailTemplate;
  onChange: (template: EmailTemplate) => void;
  onRegenerate?: () => void;
  suggestions?: EmailSuggestion[];
  readOnly?: boolean;
}

export function EmailReviewEditor({ 
  template, 
  onChange, 
  onRegenerate,
  suggestions = [],
  readOnly = false 
}: EmailReviewEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(template.subject);
  const [editedContent, setEditedContent] = useState(template.content);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = useCallback(() => {
    const updatedTemplate: EmailTemplate = {
      ...template,
      subject: editedSubject,
      content: editedContent,
      formattedContent: {
        html: editedContent.replace(/\n/g, '<br>'),
        plainText: editedContent
      },
      metadata: {
        ...template.metadata,
        wordCount: editedContent.split(/\s+/).length,
        estimatedReadingTime: Math.ceil(editedContent.split(/\s+/).length / 200)
      }
    };
    onChange(updatedTemplate);
    setIsEditing(false);
  }, [template, editedSubject, editedContent, onChange]);

  const handleReset = useCallback(() => {
    setEditedSubject(template.subject);
    setEditedContent(template.content);
    setIsEditing(false);
  }, [template]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const wordCount = editedContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Email controle en bewerking</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Bewerken' : 'Voorbeeld'}
          </Button>
          {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Opnieuw genereren
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Suggesties voor verbetering
          </h4>
          {suggestions.map((suggestion, index) => (
            <Card key={index} className={`border ${getSeverityColor(suggestion.severity)}`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {suggestion.severity === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />}
                  {suggestion.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />}
                  {suggestion.severity === 'info' && <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{suggestion.message}</p>
                    {suggestion.suggestedAction && (
                      <p className="text-xs mt-1 opacity-75">
                        Aanbeveling: {suggestion.suggestedAction}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Email Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Email inhoud</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {wordCount} woorden
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {readingTime} min leestijd
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject Line */}
          <div>
            <label className="block text-sm font-medium mb-2">Onderwerp</label>
            {showPreview || readOnly ? (
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="font-medium">{editedSubject}</p>
              </div>
            ) : (
              <Input
                value={editedSubject}
                onChange={(e) => {
                  setEditedSubject(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Email onderwerp"
                disabled={readOnly}
              />
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Inhoud</label>
            {showPreview || readOnly ? (
              <div className="p-4 bg-gray-50 rounded-md min-h-[200px]">
                <div className="whitespace-pre-wrap text-sm">{editedContent}</div>
              </div>
            ) : (
              <Textarea
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value);
                  setIsEditing(true);
                }}
                placeholder="Email inhoud"
                className="min-h-[200px]"
                disabled={readOnly}
              />
            )}
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                {isEditing && (
                  <Badge variant="outline" className="text-orange-600 bg-orange-50">
                    Niet opgeslagen wijzigingen
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                {isEditing && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Opslaan
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Metadata */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Email eigenschappen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-medium">{template.metadata.recipientCategory}</div>
              <div className="text-xs text-gray-600">Ontvanger type</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium capitalize">{template.metadata.formalityLevel}</div>
              <div className="text-xs text-gray-600">Formaliteit</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium uppercase">{template.metadata.language}</div>
              <div className="text-xs text-gray-600">Taal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium">{template.metadata.objective}</div>
              <div className="text-xs text-gray-600">Doel</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}