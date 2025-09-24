// Hysio Assistant - Context-aware AI assistant for medical documentation

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  FileText,
  Clock,
  Minimize2,
  Maximize2,
  X,
  Sparkles
} from 'lucide-react';
import { useStableCallback } from '@/lib/hooks/useOptimizedState';
import { PerformanceTimer } from '@/lib/utils/performance';
import type { PatientInfo } from '@/types/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
}

interface HysioAssistantProps {
  patientInfo?: PatientInfo;
  workflowType: 'intake-automatisch' | 'intake-stapsgewijs' | 'consult';
  workflowStep?: 'anamnese' | 'onderzoek' | 'klinische-conclusie' | 'consult';
  currentContext?: string;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export const HysioAssistant: React.FC<HysioAssistantProps> = React.memo(({
  patientInfo,
  workflowType,
  workflowStep,
  currentContext,
  onSuggestionSelect,
  className,
  minimized = false,
  onToggleMinimize,
  onClose
}) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions] = React.useState<string[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Generate contextual suggestions based on workflow
  const contextualSuggestions = React.useMemo(() => {
    const workflowSuggestions: Record<string, string[]> = {
      'intake-automatisch': [
        'Genereer HHSB anamnesekaart voor rugklachten',
        'Suggereer onderzoek voor kniepijn',
        'Maak behandelplan voor schouderimpingement',
        'Wat zijn rode vlagen bij rugpijn?'
      ],
      'intake-stapsgewijs-anamnese': [
        'Welke vragen stel ik bij hoofdpijn?',
        'HHSB vragen voor sportblessure',
        'Anamnese chronische pijn patiënt',
        'Psychosociale factoren inventariseren'
      ],
      'intake-stapsgewijs-onderzoek': [
        'Fysiek onderzoek schouder protocol',
        'Functietesten voor knie',
        'Stabiliteitsonderzoek wervelkolom',
        'Palpatie technieken nekklachten'
      ],
      'intake-stapsgewijs-klinische-conclusie': [
        'Diagnose formulering hulpvraag',
        'SMART behandeldoelen opstellen',
        'Prognose inschatting maken',
        'Vervolgafspraken plannen'
      ],
      'consult': [
        'SOEP evaluatie voortgang',
        'Aanpassing behandelplan',
        'Reassessment protocol',
        'Thuisoefeningen evalueren'
      ]
    };

    const key = workflowStep ? `${workflowType}-${workflowStep}` : workflowType;
    return workflowSuggestions[key] || workflowSuggestions[workflowType] || [];
  }, [workflowType, workflowStep]);

  // Initialize with welcome message
  React.useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Welkom bij Hysio Assistant! Ik help je met ${getWorkflowDisplayName(workflowType, workflowStep)}. ${patientInfo ? `Voor patiënt ${patientInfo.initials} (${patientInfo.chiefComplaint}).` : ''} Hoe kan ik je helpen?`,
        timestamp: Date.now(),
        suggestions: contextualSuggestions.slice(0, 3)
      };
      setMessages([welcomeMessage]);
    }
  }, [workflowType, workflowStep, patientInfo, contextualSuggestions, messages.length]);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate AI response (simulated for demo)
  const generateAssistantResponse = useStableCallback(async (userMessage: string): Promise<Message> => {
    return await PerformanceTimer.timeAsync('Assistant Response', async () => {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Context-aware response generation
      const context = {
        patientInfo,
        workflowType,
        workflowStep,
        currentContext,
        userMessage: userMessage.toLowerCase()
      };

      let response = '';
      let suggestions: string[] = [];

      // Generate contextual responses based on user input
      if (context.userMessage.includes('hhsb') || context.userMessage.includes('anamnese')) {
        response = generateHHSBResponse(context);
        suggestions = ['Hulpvraag specificeren', 'Historie uitvragen', 'Stoornissen inventariseren'];
      } else if (context.userMessage.includes('onderzoek') || context.userMessage.includes('fysiek')) {
        response = generateOnderzoekResponse(context);
        suggestions = ['Inspectie protocol', 'Palpatie technieken', 'Bewegingsonderzoek'];
      } else if (context.userMessage.includes('soep') || context.userMessage.includes('evaluatie')) {
        response = generateSOEPResponse(context);
        suggestions = ['Objectieve metingen', 'Voortgang beoordelen', 'Plan aanpassen'];
      } else if (context.userMessage.includes('diagnose') || context.userMessage.includes('behandel')) {
        response = generateDiagnoseResponse(context);
        suggestions = ['ICF classificatie', 'Behandeldoelen', 'Prognose'];
      } else {
        response = generateGeneralResponse(context);
        suggestions = contextualSuggestions.slice(0, 3);
      }

      return {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: response,
        timestamp: Date.now(),
        suggestions
      };
    });
  });

  const handleSendMessage = useStableCallback(async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: currentMessage.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const assistantResponse = await generateAssistantResponse(userMessage.content);
      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      console.error('Assistant response error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, er is een fout opgetreden bij het genereren van mijn reactie. Probeer het opnieuw.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  });

  const handleSuggestionClick = useStableCallback((suggestion: string) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      setCurrentMessage(suggestion);
    }
  });

  const handleKeyPress = useStableCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  if (minimized) {
    return (
      <Card className={cn("w-80 shadow-lg border-hysio-mint/30", className)}>
        <CardHeader className="pb-3 cursor-pointer" onClick={onToggleMinimize}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-hysio-deep-green" />
              </div>
              <CardTitle className="text-sm text-hysio-deep-green">Hysio Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onToggleMinimize?.(); }}>
                <Maximize2 size={14} />
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onClose(); }}>
                  <X size={14} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("w-96 h-96 shadow-lg border-hysio-mint/30 flex flex-col", className)}>
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-hysio-mint/20 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-hysio-deep-green" />
            </div>
            <div>
              <CardTitle className="text-sm text-hysio-deep-green">Hysio Assistant</CardTitle>
              <p className="text-xs text-hysio-deep-green-900/60">
                {getWorkflowDisplayName(workflowType, workflowStep)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleMinimize && (
              <Button variant="ghost" size="sm" onClick={onToggleMinimize}>
                <Minimize2 size={14} />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div className={cn(
                  "flex items-start gap-2",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 bg-hysio-mint/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={12} className="text-hysio-deep-green" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === 'user'
                      ? 'bg-hysio-deep-green text-white ml-auto'
                      : 'bg-hysio-mint/10 text-hysio-deep-green-900'
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1 opacity-60",
                      message.role === 'user' ? 'text-white' : 'text-hysio-deep-green-900'
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 bg-hysio-deep-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={12} className="text-hysio-deep-green" />
                    </div>
                  )}
                </div>

                {/* Suggestions */}
                {message.role === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 ml-8 flex flex-wrap gap-1">
                    {message.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-hysio-mint/20 text-xs border-hysio-mint/30"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Lightbulb size={10} className="mr-1" />
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-hysio-mint/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={12} className="text-hysio-deep-green" />
                </div>
                <div className="bg-hysio-mint/10 rounded-lg px-3 py-2 text-sm text-hysio-deep-green-900">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin">
                      <Sparkles size={14} />
                    </div>
                    <span>Hysio Assistant denkt na...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <Separator className="my-3" />

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-hysio-deep-green-900/60 mb-2">Snelle suggesties:</p>
            <div className="flex flex-wrap gap-1">
              {contextualSuggestions.slice(0, 4).map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-hysio-mint/20 text-xs border-hysio-mint/30"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Vraag Hysio Assistant om hulp..."
            disabled={isLoading}
            className="text-sm border-hysio-mint/30 focus:border-hysio-deep-green"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            size="sm"
            className="bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white"
          >
            <Send size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

HysioAssistant.displayName = 'HysioAssistant';

// Helper functions for response generation
function getWorkflowDisplayName(workflowType: string, workflowStep?: string): string {
  const names: Record<string, string> = {
    'intake-automatisch': 'Automatische Intake',
    'intake-stapsgewijs': 'Stapsgewijze Intake',
    'consult': 'Follow-up Consult'
  };

  let base = names[workflowType] || workflowType;

  if (workflowStep) {
    const steps: Record<string, string> = {
      'anamnese': 'Anamnese',
      'onderzoek': 'Onderzoek',
      'klinische-conclusie': 'Klinische Conclusie',
      'consult': 'Consult'
    };
    base += ` - ${steps[workflowStep] || workflowStep}`;
  }

  return base;
}

function generateHHSBResponse(context: any): string {
  const responses = [
    `Voor HHSB anamnese bij ${context.patientInfo?.chiefComplaint || 'deze klacht'} focus op:\n\n**Hulpvraag:** Wat wil de patiënt bereiken?\n**Historie:** Ontstaan, verloop, eerdere behandeling\n**Stoornissen:** Pijn, mobiliteit, kracht\n**Beperkingen:** ADL, werk, sport`,
    `HHSB structuur helpt bij systematische anamnese:\n\n- Begin met open vragen over de hulpvraag\n- Vraag door naar specifieke beperkingen\n- Inventariseer alle relevante stoornissen\n- Maak timeline van de klachtenhistorie`,
    `Voor een complete HHSB anamnese:\n\n1. Laat patiënt vertellen in eigen woorden\n2. Vraag naar impact op dagelijks leven\n3. Exploreer verwachtingen en doelen\n4. Check psychosociale factoren`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateOnderzoekResponse(context: any): string {
  const responses = [
    `Fysiek onderzoek protocol:\n\n**Inspectie:** Houding, zwelling, verkleuring\n**Palpatie:** Gevoeligheid, temperatuur, spanning\n**Bewegingsonderzoek:** ROM actief/passief\n**Functietesten:** Specifieke provocatietesten`,
    `Voor onderzoek bij ${context.patientInfo?.chiefComplaint || 'deze klacht'}:\n\n- Begin altijd met inspectie\n- Palpeer systematisch alle structuren\n- Test bewegingen in alle richtingen\n- Gebruik relevante specifieke testen`,
    `Onderzoeksprotocol stappen:\n\n1. Vraag eerst naar pijn (VAS)\n2. Observeer bewegingspatronen\n3. Test kracht en stabiliteit\n4. Evalueer functionele bewegingen`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateSOEPResponse(context: any): string {
  const responses = [
    `SOEP evaluatie structuur:\n\n**Subjectief:** Hoe ervaart patiënt de voortgang?\n**Objectief:** Metingen, tests, observaties\n**Evaluatie:** Interpretatie van bevindingen\n**Plan:** Aanpassingen behandeling/doelen`,
    `Voor SOEP follow-up:\n\n- Vergelijk met vorige metingen\n- Evalueer doelenbereik\n- Beoordeel functionele verbetering\n- Plan vervolgbehandeling`,
    `SOEP methodiek helpt bij:\n\n1. Systematische voortgangsevaluatie\n2. Evidence-based besluitvorming\n3. Heldere documentatie\n4. Behandelplan optimalisatie`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateDiagnoseResponse(context: any): string {
  const responses = [
    `Diagnose formulering tips:\n\n- Gebruik ICF classificatie\n- Beschrijf specifieke stoornissen\n- Link aan functionele beperkingen\n- Overweeg psychosociale factoren`,
    `Voor behandelplan:\n\n**SMART doelen:** Specifiek, Meetbaar, Acceptabel, Realistisch, Tijdgebonden\n**Interventies:** Evidence-based keuzes\n**Evaluatie:** Heldere meetmomenten`,
    `Klinische redenering proces:\n\n1. Analyseer alle bevindingen\n2. Overweeg differentiaal diagnose\n3. Formuleer hypotheses\n4. Plan behandelstrategie`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateGeneralResponse(context: any): string {
  const responses = [
    `Ik help je graag met ${context.workflowType === 'consult' ? 'follow-up documentatie' : 'intake documentatie'}. Waar kan ik je mee helpen? Vraag bijvoorbeeld naar specifieke onderzoekstechnieken, documentatiestructuur, of behandelprotocollen.`,
    `Als Hysio Assistant ondersteun ik je bij professionele fysiotherapie documentatie. Ik kan helpen met HHSB structuren, SOEP methodiek, onderzoeksprotocollen en klinische redenering.`,
    `Voor ${context.patientInfo?.chiefComplaint || 'deze klacht'} kan ik je helpen met evidence-based benaderingen, onderzoeksprotocollen en documentatiestructuren. Wat heb je nodig?`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default HysioAssistant;