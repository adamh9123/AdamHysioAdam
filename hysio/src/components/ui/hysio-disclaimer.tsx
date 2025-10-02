import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DisclaimerType = 'general' | 'clinical' | 'ai-generated' | 'educational' | 'legal';
export type DisclaimerVariant = 'default' | 'warning' | 'info' | 'minimal';

interface HysioDisclaimerProps {
  type?: DisclaimerType;
  variant?: DisclaimerVariant;
  className?: string;
  customText?: string;
  showIcon?: boolean;
}

const DISCLAIMER_TEXTS: Record<DisclaimerType, string> = {
  general: 'Let op: Deze informatie is door Hysio gegenereerd. Controleer de inhoud altijd zorgvuldig op klinische accuraatheid en volledigheid voordat u deze definitief vastlegt.',
  clinical: 'Klinische disclaimer: Deze door Hysio gegenereerde inhoud is bedoeld als ondersteuning. De eindverantwoordelijkheid voor klinische beslissingen ligt altijd bij de behandelend fysiotherapeut.',
  'ai-generated': 'Automatisch gegenereerde inhoud: Deze tekst is automatisch gegenereerd door Hysio. Verificatie door een gekwalificeerde fysiotherapeut is vereist voordat deze informatie wordt gebruikt.',
  educational: 'Educatief materiaal: Deze door Hysio gegenereerde content is bedoeld voor educatieve doeleinden. Pas de informatie aan naar de specifieke situatie van uw patiënt.',
  legal: 'Juridische disclaimer: Hysio is een ondersteunend hulpmiddel. De gebruiker draagt volledige verantwoordelijkheid voor de accuraatheid en geschiktheid van alle gegenereerde content voor klinisch gebruik.'
};

const VARIANT_STYLES: Record<DisclaimerVariant, { container: string; icon: React.ComponentType<any>; iconColor: string }> = {
  default: {
    container: 'border-orange-200 bg-orange-50',
    icon: AlertTriangle,
    iconColor: 'text-orange-600'
  },
  warning: {
    container: 'border-red-200 bg-red-50',
    icon: AlertTriangle,
    iconColor: 'text-red-600'
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    icon: Info,
    iconColor: 'text-blue-600'
  },
  minimal: {
    container: 'border-gray-200 bg-gray-50',
    icon: Shield,
    iconColor: 'text-gray-600'
  }
};

export function HysioDisclaimer({
  type = 'general',
  variant = 'default',
  className,
  customText,
  showIcon = true
}: HysioDisclaimerProps) {
  const disclaimerText = customText || DISCLAIMER_TEXTS[type];
  const variantStyle = VARIANT_STYLES[variant];
  const IconComponent = variantStyle.icon;

  return (
    <Alert className={cn(variantStyle.container, className)}>
      {showIcon && <IconComponent className={cn('h-4 w-4', variantStyle.iconColor)} />}
      <AlertDescription className={cn(
        'text-sm font-medium',
        variant === 'warning' ? 'text-red-800' :
        variant === 'info' ? 'text-blue-800' :
        variant === 'minimal' ? 'text-gray-700' :
        'text-orange-800'
      )}>
        {disclaimerText}
      </AlertDescription>
    </Alert>
  );
}

// Convenience components for common use cases
export const HysioGeneralDisclaimer = (props: Omit<HysioDisclaimerProps, 'type'>) => (
  <HysioDisclaimer {...props} type="general" />
);

export const HysioClinicalDisclaimer = (props: Omit<HysioDisclaimerProps, 'type'>) => (
  <HysioDisclaimer {...props} type="clinical" />
);

export const HysioAIDisclaimer = (props: Omit<HysioDisclaimerProps, 'type'>) => (
  <HysioDisclaimer {...props} type="ai-generated" />
);

export const HysioEducationalDisclaimer = (props: Omit<HysioDisclaimerProps, 'type'>) => (
  <HysioDisclaimer {...props} type="educational" />
);

export const HysioLegalDisclaimer = (props: Omit<HysioDisclaimerProps, 'type'>) => (
  <HysioDisclaimer {...props} type="legal" />
);