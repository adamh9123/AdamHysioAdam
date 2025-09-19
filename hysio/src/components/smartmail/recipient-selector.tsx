// Recipient selection component for SmartMail with healthcare-specific recipient types
// Provides context-aware formality recommendations and multilingual support

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  User, 
  UserCheck, 
  Heart, 
  Stethoscope, 
  Building2, 
  UserPlus,
  Info,
  AlertCircle,
  Check
} from 'lucide-react';

import type { 
  RecipientType, 
  RecipientCategory,
  FormalityLevel,
  SupportedLanguage 
} from '@/lib/types/smartmail';
import { 
  RECIPIENT_CATEGORIES,
  FORMALITY_LEVELS,
  SUPPORTED_LANGUAGES
} from '@/lib/smartmail/enums';

// Recipient category configuration with healthcare context
interface RecipientOption {
  category: RecipientCategory;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  examples: string[];
  recommendedFormality: FormalityLevel[];
  requiresSpecialHandling?: boolean;
  privacyLevel: 'standard' | 'elevated' | 'restricted';
}

// Formality configuration with healthcare communication guidelines
interface FormalityOption {
  level: FormalityLevel;
  title: string;
  description: string;
  when: string;
  tone: string;
  examples: string[];
}

// Language options with healthcare context
interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  healthcareContext: string;
  isDefault?: boolean;
}

// Healthcare recipient configurations
const HEALTHCARE_RECIPIENTS: RecipientOption[] = [
  {
    category: 'patient',
    icon: Heart,
    title: 'Patiënt',
    description: 'Directe communicatie met de patiënt',
    examples: ['Behandelinformatie', 'Afspraakbevestiging', 'Nazorg instructies'],
    recommendedFormality: ['empathetic', 'friendly'],
    privacyLevel: 'elevated',
    requiresSpecialHandling: true
  },
  {
    category: 'family',
    icon: Users,
    title: 'Familie/Mantelzorger',
    description: 'Communicatie met familieleden of verzorgers',
    examples: ['Familie-update', 'Zorgplan uitleg', 'Ondersteuning informatie'],
    recommendedFormality: ['empathetic', 'friendly'],
    privacyLevel: 'elevated',
    requiresSpecialHandling: true
  },
  {
    category: 'specialist',
    icon: Stethoscope,
    title: 'Specialist',
    description: 'Verwijzing of consultatie met medisch specialist',
    examples: ['Patiënt verwijzing', 'Consultatie verzoek', 'Bevindingen delen'],
    recommendedFormality: ['formal', 'professional'],
    privacyLevel: 'standard'
  },
  {
    category: 'colleague',
    icon: UserCheck,
    title: 'Collega',
    description: 'Communicatie met collega-zorgverleners',
    examples: ['Case overleg', 'Behandelplan discussie', 'Ervaring delen'],
    recommendedFormality: ['professional', 'friendly'],
    privacyLevel: 'standard'
  },
  {
    category: 'referring_physician',
    icon: User,
    title: 'Verwijzend Arts',
    description: 'Communicatie met verwijzende huisarts of specialist',
    examples: ['Behandelresultaat', 'Aanbevelingen', 'Follow-up plan'],
    recommendedFormality: ['formal', 'professional'],
    privacyLevel: 'standard'
  },
  {
    category: 'support_staff',
    icon: Building2,
    title: 'Ondersteunend Personeel',
    description: 'Communicatie met administratief of ondersteunend personeel',
    examples: ['Planning verzoek', 'Administratie update', 'Logistieke zaken'],
    recommendedFormality: ['professional', 'friendly'],
    privacyLevel: 'standard'
  }
];

// Formality level guidelines for healthcare
const HEALTHCARE_FORMALITY: FormalityOption[] = [
  {
    level: 'empathetic',
    title: 'Empathisch',
    description: 'Warm, begripvol en ondersteunend',
    when: 'Bij patiëntencommunicatie, slecht nieuws, gevoelige onderwerpen',
    tone: 'Persoonlijk, zorgzaam, gebruikmakend van "u" maar wel warm',
    examples: [
      'Ik begrijp dat dit een moeilijke tijd voor u is...',
      'We zijn er om u te ondersteunen tijdens uw herstel...',
      'Heeft u vragen of zorgen die we kunnen bespreken?'
    ]
  },
  {
    level: 'friendly',
    title: 'Vriendelijk',
    description: 'Toegankelijk en persoonlijk maar professioneel',
    when: 'Bij routine patiëntcontact, familie-updates, collega\'s die u goed kent',
    tone: 'Warm maar professioneel, "u" of "jij" afhankelijk van relatie',
    examples: [
      'Fijn dat de behandeling goed verloopt!',
      'Ik hoop dat de informatie duidelijk was...',
      'Laat het me weten als je nog vragen hebt.'
    ]
  },
  {
    level: 'professional',
    title: 'Professioneel',
    description: 'Zakelijk maar respectvol en betrokken',
    when: 'Bij collegiale communicatie, standaard consultaties, interdisciplinair overleg',
    tone: 'Zakelijk en correct, duidelijk en to-the-point',
    examples: [
      'Bijgaand vindt u de bevindingen van het consult...',
      'Graag zou ik uw mening willen over de behandelstrategie...',
      'De resultaten tonen een positieve ontwikkeling.'
    ]
  },
  {
    level: 'formal',
    title: 'Formeel',
    description: 'Zeer zakelijk en officieel',
    when: 'Bij officiële verwijzingen, juridische communicatie, onbekende specialisten',
    tone: 'Formeel, volledig uitgeschreven, "u" vorm, volledige titels',
    examples: [
      'Geachte collega, hierbij verwijs ik onderstaande patiënt...',
      'Met betrekking tot de door u gevraagde consultatie...',
      'Hoogachtend, Dr. [Naam], Specialist [Vakgebied]'
    ]
  }
];

// Language options for healthcare communication
const HEALTHCARE_LANGUAGES: LanguageOption[] = [
  {
    code: 'nl',
    name: 'Nederlands',
    nativeName: 'Nederlands',
    healthcareContext: 'Primaire taal Nederlandse zorgverlening',
    isDefault: true
  },
  {
    code: 'en',
    name: 'Engels',
    nativeName: 'English',
    healthcareContext: 'Voor internationale consultaties en specialisten'
  }
];

// Props interface
interface RecipientSelectorProps {
  value: Partial<RecipientType>;
  onChange: (recipient: Partial<RecipientType>) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
  compactMode?: boolean;
  showRecommendations?: boolean;
}

/**
 * Healthcare recipient selection component with context-aware recommendations
 */
export function RecipientSelector({
  value,
  onChange,
  onValidationChange,
  className = '',
  compactMode = false,
  showRecommendations = true
}: RecipientSelectorProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(
    value.category ? HEALTHCARE_RECIPIENTS.find(r => r.category === value.category) || null : null
  );
  const [showFormalityHelp, setShowFormalityHelp] = useState(false);
  const [showLanguageHelp, setShowLanguageHelp] = useState(false);

  // Validation state
  const isValid = Boolean(value.category && value.formality && value.language);

  // Notify parent of validation changes
  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Handle recipient selection
  const handleRecipientSelect = useCallback((recipient: RecipientOption) => {
    setSelectedRecipient(recipient);
    
    // Auto-select recommended formality if none selected
    const newFormality = value.formality || recipient.recommendedFormality[0];
    
    // Auto-select Dutch as default language if none selected
    const newLanguage = value.language || 'nl';
    
    onChange({
      ...value,
      category: recipient.category,
      formality: newFormality,
      language: newLanguage
    });
  }, [value, onChange]);

  // Handle formality selection
  const handleFormalitySelect = useCallback((formality: FormalityLevel) => {
    onChange({
      ...value,
      formality
    });
  }, [value, onChange]);

  // Handle language selection
  const handleLanguageSelect = useCallback((language: SupportedLanguage) => {
    onChange({
      ...value,
      language
    });
  }, [value, onChange]);

  // Get formality recommendations
  const getFormalityRecommendations = () => {
    if (!selectedRecipient) return [];
    return selectedRecipient.recommendedFormality;
  };

  // Render recipient options
  const renderRecipientOptions = () => {
    if (compactMode) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {HEALTHCARE_RECIPIENTS.map((recipient) => {
            const Icon = recipient.icon;
            const isSelected = value.category === recipient.category;
            
            return (
              <Button
                key={recipient.category}
                variant={isSelected ? "default" : "outline"}
                className="h-auto p-4 justify-start"
                onClick={() => handleRecipientSelect(recipient)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{recipient.title}</div>
                  <div className="text-xs opacity-75 mt-1">{recipient.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HEALTHCARE_RECIPIENTS.map((recipient) => {
          const Icon = recipient.icon;
          const isSelected = value.category === recipient.category;
          
          return (
            <Card 
              key={recipient.category}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:shadow-md hover:bg-gray-50'
              }`}
              onClick={() => handleRecipientSelect(recipient)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Icon className={`w-6 h-6 mt-0.5 ${
                    isSelected ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{recipient.title}</h3>
                      {recipient.requiresSpecialHandling && (
                        <Badge variant="secondary" className="text-xs">
                          Privacy+
                        </Badge>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{recipient.description}</p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Voorbeelden:</span>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          {recipient.examples.slice(0, 2).map((example, index) => (
                            <li key={index}>• {example}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render formality selection
  const renderFormalitySelection = () => {
    const recommendations = getFormalityRecommendations();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Formaliteitsniveau</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowFormalityHelp(!showFormalityHelp)}
          >
            <Info className="w-4 h-4 mr-1" />
            Info
          </Button>
        </div>

        {showFormalityHelp && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Kies het juiste formaliteitsniveau:</p>
                <ul className="space-y-1">
                  <li>• <strong>Empathisch:</strong> Voor patiënten en gevoelige onderwerpen</li>
                  <li>• <strong>Vriendelijk:</strong> Voor bekende contacten en routine communicatie</li>
                  <li>• <strong>Professioneel:</strong> Voor collegiale communicatie</li>
                  <li>• <strong>Formeel:</strong> Voor officiële verwijzingen en onbekende specialisten</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HEALTHCARE_FORMALITY.map((formality) => {
            const isSelected = value.formality === formality.level;
            const isRecommended = recommendations.includes(formality.level);
            
            return (
              <Card 
                key={formality.level}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : isRecommended
                      ? 'border-green-300 bg-green-50'
                      : 'hover:bg-gray-50'
                }`}
                onClick={() => handleFormalitySelect(formality.level)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{formality.title}</h4>
                    <div className="flex items-center space-x-1">
                      {isRecommended && (
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                          Aanbevolen
                        </Badge>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{formality.description}</p>
                  <p className="text-xs text-gray-500">{formality.when}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Render language selection
  const renderLanguageSelection = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Taal</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowLanguageHelp(!showLanguageHelp)}
          >
            <Info className="w-4 h-4 mr-1" />
            Info
          </Button>
        </div>

        {showLanguageHelp && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Taalkeuze in de zorgverlening:</p>
                <ul className="space-y-1">
                  <li>• <strong>Nederlands:</strong> Standaard voor Nederlandse patiënten en zorgverleners</li>
                  <li>• <strong>Engels:</strong> Voor internationale consultaties of specialisten</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex space-x-3">
          {HEALTHCARE_LANGUAGES.map((language) => {
            const isSelected = value.language === language.code;
            
            return (
              <Button
                key={language.code}
                variant={isSelected ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleLanguageSelect(language.code)}
              >
                <div className="text-center">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-xs opacity-75">{language.nativeName}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 ml-2" />}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render privacy notice
  const renderPrivacyNotice = () => {
    if (!selectedRecipient?.requiresSpecialHandling) return null;

    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Privacy en Veiligheid</h4>
              <p className="text-sm text-yellow-700">
                Deze ontvanger vereist extra zorgvuldigheid met patiëntgegevens. 
                Zorg ervoor dat geen identificeerbare informatie wordt gebruikt in de email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recipient Type Selection */}
      <div>
        <Label className="text-base font-medium mb-4 block">Type ontvanger</Label>
        {renderRecipientOptions()}
      </div>

      {/* Formality Selection */}
      {selectedRecipient && (
        <>
          <Separator />
          {renderFormalitySelection()}
        </>
      )}

      {/* Language Selection */}
      {selectedRecipient && (
        <>
          <Separator />
          {renderLanguageSelection()}
        </>
      )}

      {/* Privacy Notice */}
      {renderPrivacyNotice()}

      {/* Selection Summary */}
      {isValid && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">Ontvanger geconfigureerd</h4>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Type: {selectedRecipient?.title}</p>
              <p>• Formaliteit: {HEALTHCARE_FORMALITY.find(f => f.level === value.formality)?.title}</p>
              <p>• Taal: {HEALTHCARE_LANGUAGES.find(l => l.code === value.language)?.name}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}