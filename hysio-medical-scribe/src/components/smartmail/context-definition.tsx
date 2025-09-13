// Context and objective definition interface with healthcare communication templates
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Target, Clock, AlertTriangle, Lightbulb, Check
} from 'lucide-react';

import type { CommunicationContext, CommunicationObjective } from '@/lib/types/smartmail';

const HEALTHCARE_OBJECTIVES = [
  { value: 'referral' as CommunicationObjective, label: 'Verwijzing', icon: '📋' },
  { value: 'follow_up' as CommunicationObjective, label: 'Follow-up', icon: '📅' },
  { value: 'patient_education' as CommunicationObjective, label: 'Patiënt educatie', icon: '📚' },
  { value: 'treatment_update' as CommunicationObjective, label: 'Behandeling update', icon: '🔄' },
  { value: 'consultation_request' as CommunicationObjective, label: 'Consultatie verzoek', icon: '💬' },
  { value: 'red_flag_notification' as CommunicationObjective, label: 'Red flag melding', icon: '🚩' }
];

interface ContextDefinitionProps {
  value: Partial<CommunicationContext>;
  onChange: (context: Partial<CommunicationContext>) => void;
  recipientLanguage?: string;
}

export function ContextDefinition({ value, onChange, recipientLanguage = 'nl' }: ContextDefinitionProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const handleObjectiveSelect = useCallback((objective: CommunicationObjective) => {
    onChange({ ...value, objective });
  }, [value, onChange]);

  const handleFieldChange = useCallback((field: keyof CommunicationContext, fieldValue: any) => {
    onChange({ ...value, [field]: fieldValue });
  }, [value, onChange]);

  const isComplete = Boolean(value.objective && value.subject && value.background);

  return (
    <div className="space-y-6">
      {/* Objective Selection */}
      <div>
        <Label className="text-base font-medium mb-4 block">Communicatiedoel</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {HEALTHCARE_OBJECTIVES.map((obj) => (
            <Button
              key={obj.value}
              variant={value.objective === obj.value ? "default" : "outline"}
              className="h-auto p-4 justify-start"
              onClick={() => handleObjectiveSelect(obj.value)}
            >
              <span className="mr-2">{obj.icon}</span>
              <span>{obj.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label htmlFor="subject" className="text-base font-medium">Onderwerp</Label>
        <Input
          id="subject"
          value={value.subject || ''}
          onChange={(e) => handleFieldChange('subject', e.target.value)}
          placeholder="Korte omschrijving van het onderwerp"
          className="mt-2"
        />
      </div>

      {/* Background */}
      <div>
        <Label htmlFor="background" className="text-base font-medium">Achtergrond</Label>
        <Textarea
          id="background"
          value={value.background || ''}
          onChange={(e) => handleFieldChange('background', e.target.value)}
          placeholder="Relevante context en achtergrond informatie"
          className="mt-2 min-h-[100px]"
        />
      </div>

      {/* Urgency */}
      <div>
        <Label className="text-base font-medium mb-3 block">Urgentie</Label>
        <div className="flex space-x-3">
          {['routine', 'urgent', 'emergency'].map((urgency) => (
            <Button
              key={urgency}
              variant={value.urgency === urgency ? "default" : "outline"}
              size="sm"
              onClick={() => handleFieldChange('urgency', urgency)}
            >
              {urgency === 'routine' && '📋 Routine'}
              {urgency === 'urgent' && '⚡ Urgent'}
              {urgency === 'emergency' && '🚨 Spoed'}
            </Button>
          ))}
        </div>
      </div>

      {/* Completion Status */}
      {isComplete && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Context gedefinieerd</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}