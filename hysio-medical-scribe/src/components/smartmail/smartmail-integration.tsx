// Complete SmartMail integration component for Medical Scribe workflow
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Sparkles, AlertTriangle } from 'lucide-react';

import { SmartMailInterface } from './smartmail-interface';
import { ContextualSuggestions } from './contextual-suggestions';
import { ScribeIntegration } from '@/lib/smartmail/scribe-integration';
import { PrivacySecurity } from '@/lib/smartmail/privacy-security';

import type { 
  EmailGenerationRequest,
  EmailTemplate,
  CommunicationObjective,
  RecipientCategory 
} from '@/lib/types/smartmail';

interface SmartMailIntegrationProps {
  scribeSessionData?: any;
  onIntegrationComplete?: (template: EmailTemplate) => void;
  showSuggestions?: boolean;
  compactMode?: boolean;
}

export function SmartMailIntegration({
  scribeSessionData,
  onIntegrationComplete,
  showSuggestions = true,
  compactMode = false
}: SmartMailIntegrationProps) {
  const [showSmartMail, setShowSmartMail] = useState(false);
  const [initialContext, setInitialContext] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Generate contextual suggestions when scribe data is available
  useEffect(() => {
    if (scribeSessionData && showSuggestions) {
      const objectives = ScribeIntegration.suggestObjectives(scribeSessionData);
      const recipients = ScribeIntegration.suggestRecipients(scribeSessionData);
      
      const newSuggestions = objectives.flatMap(objective =>
        recipients.map(recipient => ({
          type: 'email_suggestion' as const,
          recipient,
          objective,
          urgency: objective === 'red_flag_notification' ? 'high' as const : 'medium' as const,
          reason: `Gebaseerd op ${scribeSessionData.sessionType} sessie context`,
          confidence: 0.85
        }))
      );
      
      setSuggestions(newSuggestions.slice(0, 3)); // Limit to top 3 suggestions
    }
  }, [scribeSessionData, showSuggestions]);

  const handleSuggestionSelect = useCallback((
    recipient: RecipientCategory, 
    objective: CommunicationObjective
  ) => {
    if (scribeSessionData) {
      const context = ScribeIntegration.extractContext(scribeSessionData);
      const emailRequest = ScribeIntegration.generateEmailRequest(
        scribeSessionData,
        recipient,
        objective
      );
      
      setInitialContext({
        recipient: { category: recipient, language: 'nl' },
        context: emailRequest.context
      });
    }
    setShowSmartMail(true);
  }, [scribeSessionData]);

  const handleEmailGenerated = useCallback((template: EmailTemplate) => {
    // Log usage for analytics (without PHI)
    if (scribeSessionData) {
      const auditLog = PrivacySecurity.createAuditLog(
        {
          recipient: { category: template.metadata.recipientCategory as any, language: 'nl', formality: 'professional' },
          context: { objective: template.metadata.objective, subject: '', background: '', language: 'nl' },
          userId: 'current-user',
          timestamp: new Date().toISOString(),
          requestId: template.requestId || '',
          scribeSessionId: scribeSessionData.sessionId
        },
        true
      );
      console.log('SmartMail usage logged:', auditLog);
    }
    
    onIntegrationComplete?.(template);
  }, [scribeSessionData, onIntegrationComplete]);

  if (showSmartMail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">SmartMail</h2>
            <Badge variant="outline">Geïntegreerd met Medical Scribe</Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSmartMail(false)}
          >
            Terug naar suggesties
          </Button>
        </div>
        
        <SmartMailInterface
          initialContext={initialContext}
          scribeSessionId={scribeSessionData?.sessionId}
          onEmailGenerated={handleEmailGenerated}
          compactMode={compactMode}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">SmartMail AI Assistant</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Professionele healthcare email compositie op basis van uw Scribe sessie
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>✅ Privacy-first design</span>
              <span>✅ Medische compliance</span>
              <span>✅ Context-aware AI</span>
            </div>
            <Button 
              onClick={() => setShowSmartMail(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email opstellen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Suggestions */}
      {suggestions.length > 0 && (
        <ContextualSuggestions
          suggestions={suggestions}
          onSelectSuggestion={handleSuggestionSelect}
        />
      )}

      {/* Privacy Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Privacy & Veiligheid</h4>
              <p className="text-sm text-yellow-700">
                SmartMail respecteert privacy door geen patiëntgegevens op te slaan. 
                Alle gegenereerde emails worden automatisch gecontroleerd op PHI.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}