// Contextual SmartMail suggestions that appear at workflow transition points
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import type { CommunicationObjective, RecipientCategory } from '@/lib/types/smartmail';

interface ContextualSuggestionsProps {
  suggestions: Array<{
    type: 'email_suggestion';
    recipient: RecipientCategory;
    objective: CommunicationObjective;
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    confidence: number;
  }>;
  onSelectSuggestion: (recipient: RecipientCategory, objective: CommunicationObjective) => void;
}

export function ContextualSuggestions({ suggestions, onSelectSuggestion }: ContextualSuggestionsProps) {
  if (suggestions.length === 0) return null;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getRecipientLabel = (recipient: RecipientCategory) => {
    const labels = {
      patient: 'Patiënt',
      specialist: 'Specialist',
      colleague: 'Collega',
      referring_physician: 'Verwijzend arts',
      family: 'Familie',
      support_staff: 'Ondersteuning'
    };
    return labels[recipient] || recipient;
  };

  const getObjectiveLabel = (objective: CommunicationObjective) => {
    const labels = {
      referral: 'Verwijzing',
      follow_up: 'Follow-up',
      patient_education: 'Patiënt educatie',
      treatment_update: 'Behandeling update',
      consultation_request: 'Consultatie verzoek',
      red_flag_notification: 'Red flag melding',
      diagnostic_request: 'Diagnostiek verzoek',
      discharge_summary: 'Ontslagbrief',
      colleague_inquiry: 'Collega vraag'
    };
    return labels[objective] || objective;
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <span>SmartMail suggesties</span>
          <Badge variant="outline" className="text-xs">
            Gebaseerd op sessie context
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-blue-700 mb-4">
          Op basis van de huidige sessie stellen we de volgende email communicaties voor:
        </p>
        
        {suggestions.map((suggestion, index) => (
          <Card key={index} className="bg-white border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge className={getUrgencyColor(suggestion.urgency)}>
                    {suggestion.urgency === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {suggestion.urgency === 'medium' && <Clock className="w-3 h-3 mr-1" />}
                    {suggestion.urgency.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium">
                    {getObjectiveLabel(suggestion.objective)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {getRecipientLabel(suggestion.recipient)}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {Math.round(suggestion.confidence * 100)}% zekerheid
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                {suggestion.reason}
              </p>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onSelectSuggestion(suggestion.recipient, suggestion.objective)}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email opstellen
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}