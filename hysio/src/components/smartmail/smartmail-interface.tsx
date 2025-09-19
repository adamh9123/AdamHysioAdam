// Main SmartMail interface component with progressive disclosure pattern
// Provides healthcare professionals with intuitive email composition workflow

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Settings, 
  Users, 
  FileText, 
  Send, 
  Eye, 
  Edit, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

import type {
  EmailGenerationRequest,
  EmailGenerationResponse,
  EmailTemplate,
  RecipientType,
  CommunicationContext,
  DocumentContext,
  EmailSuggestion
} from '@/lib/types/smartmail';

// Workflow steps for progressive disclosure
export type WorkflowStep = 
  | 'recipient_selection'
  | 'context_definition' 
  | 'document_upload'
  | 'generation'
  | 'review_edit'
  | 'finalization';

// Component state interface
interface SmartMailState {
  currentStep: WorkflowStep;
  recipient: Partial<RecipientType>;
  context: Partial<CommunicationContext>;
  documents: DocumentContext[];
  isGenerating: boolean;
  generatedTemplate: EmailTemplate | null;
  suggestions: EmailSuggestion[];
  warnings: string[];
  expandedSections: Set<string>;
}

// Progress indicator data
const WORKFLOW_STEPS: Array<{
  id: WorkflowStep;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
}> = [
  {
    id: 'recipient_selection',
    label: 'Ontvanger',
    description: 'Selecteer type ontvanger en formaliteit',
    icon: Users,
    required: true
  },
  {
    id: 'context_definition',
    label: 'Context',
    description: 'Definieer doel en achtergrond',
    icon: FileText,
    required: true
  },
  {
    id: 'document_upload',
    label: 'Documenten',
    description: 'Upload relevante documenten (optioneel)',
    icon: FileText,
    required: false
  },
  {
    id: 'generation',
    label: 'Genereren',
    description: 'AI email generatie',
    icon: Sparkles,
    required: true
  },
  {
    id: 'review_edit',
    label: 'Controle',
    description: 'Bekijk en bewerk email',
    icon: Eye,
    required: true
  },
  {
    id: 'finalization',
    label: 'Voltooien',
    description: 'Verzenden of exporteren',
    icon: Send,
    required: true
  }
];

// Props interface
interface SmartMailInterfaceProps {
  // Integration with existing Hysio components
  initialContext?: Partial<CommunicationContext>;
  scribeSessionId?: string;
  onEmailGenerated?: (template: EmailTemplate) => void;
  onEmailSent?: (template: EmailTemplate, recipient: string) => void;
  onError?: (error: string) => void;
  
  // UI customization
  className?: string;
  compactMode?: boolean;
  showProgress?: boolean;
  
  // Feature flags
  enableDocumentUpload?: boolean;
  enableHistory?: boolean;
  enableExport?: boolean;
}

/**
 * Main SmartMail interface with progressive disclosure workflow
 */
export function SmartMailInterface({
  initialContext,
  scribeSessionId,
  onEmailGenerated,
  onEmailSent,
  onError,
  className = '',
  compactMode = false,
  showProgress = true,
  enableDocumentUpload = true,
  enableHistory = true,
  enableExport = true
}: SmartMailInterfaceProps) {
  // Component state
  const [state, setState] = useState<SmartMailState>({
    currentStep: 'recipient_selection',
    recipient: {},
    context: initialContext || {},
    documents: [],
    isGenerating: false,
    generatedTemplate: null,
    suggestions: [],
    warnings: [],
    expandedSections: new Set(['recipient_selection'])
  });

  // Auto-advance workflow based on completion
  useEffect(() => {
    const { currentStep, recipient, context } = state;
    
    if (currentStep === 'recipient_selection' && isRecipientComplete(recipient)) {
      setState(prev => ({
        ...prev,
        currentStep: 'context_definition',
        expandedSections: new Set(['context_definition'])
      }));
    } else if (currentStep === 'context_definition' && isContextComplete(context)) {
      setState(prev => ({
        ...prev,
        currentStep: enableDocumentUpload ? 'document_upload' : 'generation',
        expandedSections: new Set([enableDocumentUpload ? 'document_upload' : 'generation'])
      }));
    }
  }, [state.recipient, state.context, enableDocumentUpload]);

  // Validation helpers
  const isRecipientComplete = (recipient: Partial<RecipientType>): boolean => {
    return Boolean(recipient.category && recipient.formality && recipient.language);
  };

  const isContextComplete = (context: Partial<CommunicationContext>): boolean => {
    return Boolean(context.objective && context.subject && context.language);
  };

  const canGenerate = (): boolean => {
    return isRecipientComplete(state.recipient) && isContextComplete(state.context);
  };

  // Step navigation
  const goToStep = useCallback((step: WorkflowStep) => {
    setState(prev => ({
      ...prev,
      currentStep: step,
      expandedSections: new Set([step])
    }));
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedSections);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return { ...prev, expandedSections: newExpanded };
    });
  }, []);

  // Email generation
  const generateEmail = useCallback(async () => {
    if (!canGenerate()) {
      onError?.('Vul alle vereiste velden in voordat u een email genereert');
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, currentStep: 'generation' }));

    try {
      const request: EmailGenerationRequest = {
        recipient: state.recipient as RecipientType,
        context: state.context as CommunicationContext,
        documents: state.documents,
        scribeSessionId,
        userId: 'current-user', // Would be populated from auth context
        timestamp: new Date().toISOString(),
        requestId: `sm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const response = await fetch('/api/smartmail/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data: EmailGenerationResponse = await response.json();

      if (!data.success || !data.template) {
        throw new Error(data.error || 'Email generatie mislukt');
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        generatedTemplate: data.template!,
        suggestions: data.suggestions || [],
        warnings: data.warnings || [],
        currentStep: 'review_edit',
        expandedSections: new Set(['review_edit'])
      }));

      onEmailGenerated?.(data.template!);

    } catch (error) {
      setState(prev => ({ ...prev, isGenerating: false }));
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout opgetreden';
      onError?.(errorMessage);
    }
  }, [state.recipient, state.context, state.documents, scribeSessionId, onEmailGenerated, onError]);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setState({
      currentStep: 'recipient_selection',
      recipient: {},
      context: initialContext || {},
      documents: [],
      isGenerating: false,
      generatedTemplate: null,
      suggestions: [],
      warnings: [],
      expandedSections: new Set(['recipient_selection'])
    });
  }, [initialContext]);

  // Render progress indicator
  const renderProgressIndicator = () => {
    if (!showProgress || compactMode) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Voortgang</h3>
          <span className="text-xs text-gray-500">
            Stap {Math.max(1, WORKFLOW_STEPS.findIndex(s => s.id === state.currentStep) + 1)} van {WORKFLOW_STEPS.length}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {WORKFLOW_STEPS.map((step, index) => {
            const isActive = step.id === state.currentStep;
            const isCompleted = WORKFLOW_STEPS.findIndex(s => s.id === state.currentStep) > index;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isCompleted 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : isActive 
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // Render collapsible section
  const renderSection = (
    id: string,
    title: string,
    children: React.ReactNode,
    isRequired: boolean = false,
    isComplete: boolean = false
  ) => {
    const isExpanded = state.expandedSections.has(id);
    const isActive = state.currentStep === id;

    return (
      <Card className={`mb-4 transition-all ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader 
          className="cursor-pointer pb-3"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
              <CardTitle className="text-base font-medium">{title}</CardTitle>
              {isRequired && <Badge variant="secondary" className="text-xs">Vereist</Badge>}
              {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
          </div>
        </CardHeader>
        {isExpanded && <CardContent className="pt-0">{children}</CardContent>}
      </Card>
    );
  };

  // Main render
  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">SmartMail</h1>
          <Badge variant="outline" className="text-xs">AI-geassisteerd</Badge>
        </div>
        <div className="flex items-center space-x-2">
          {enableHistory && (
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Geschiedenis
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={resetWorkflow}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      {renderProgressIndicator()}

      {/* Warnings */}
      {state.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Aandachtspunten</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {state.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow sections */}
      <div className="space-y-4">
        {/* Recipient Selection */}
        {renderSection(
          'recipient_selection',
          'Ontvanger selecteren',
          <div>Recipient selection form would go here</div>,
          true,
          isRecipientComplete(state.recipient)
        )}

        {/* Context Definition */}
        {renderSection(
          'context_definition',
          'Context en doel definiëren',
          <div>Context definition form would go here</div>,
          true,
          isContextComplete(state.context)
        )}

        {/* Document Upload */}
        {enableDocumentUpload && renderSection(
          'document_upload',
          'Documenten toevoegen',
          <div>Document upload interface would go here</div>,
          false,
          state.documents.length > 0
        )}

        {/* Generation */}
        {renderSection(
          'generation',
          'Email genereren',
          <div className="text-center py-8">
            {state.isGenerating ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Email wordt gegenereerd...</p>
              </div>
            ) : (
              <Button
                size="lg"
                onClick={generateEmail}
                disabled={!canGenerate()}
                className="px-8"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Genereer Email
              </Button>
            )}
          </div>,
          true,
          Boolean(state.generatedTemplate)
        )}

        {/* Review & Edit */}
        {state.generatedTemplate && renderSection(
          'review_edit',
          'Email controleren en bewerken',
          <div>Email review and edit interface would go here</div>,
          true,
          Boolean(state.generatedTemplate)
        )}

        {/* Finalization */}
        {state.generatedTemplate && renderSection(
          'finalization',
          'Email verzenden of exporteren',
          <div>Email finalization options would go here</div>,
          true,
          false
        )}
      </div>

      {/* Suggestions */}
      {state.suggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Suggesties</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                    suggestion.severity === 'error' ? 'text-red-500' :
                    suggestion.severity === 'warning' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{suggestion.message}</p>
                    {suggestion.actionable && suggestion.suggestedAction && (
                      <p className="text-xs text-gray-500 mt-1">
                        Aanbeveling: {suggestion.suggestedAction}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}