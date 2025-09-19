import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { 
  User, 
  Eye, 
  Brain, 
  Target,
  Pencil,
  Copy
} from 'lucide-react';
import { SOEPStructure } from '@/lib/types';

interface SOEPResultViewProps {
  soepData?: SOEPStructure;
  isLoading?: boolean;
  onEdit?: () => void;
  className?: string;
}

export const SOEPResultView: React.FC<SOEPResultViewProps> = ({
  soepData,
  isLoading = false,
  onEdit,
  className
}) => {
  if (!soepData && !isLoading) {
    return (
      <Card className={cn('h-full opacity-50', className)}>
        <CardContent className="h-full flex flex-col justify-center">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-600">
              SOEP Documentatie
            </h3>
            <p className="text-gray-500">
              Wordt gegenereerd na verwerking van het consult.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn('h-full', className)}>
        <CardContent className="h-full flex flex-col justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-hysio-mint border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">SOEP documentatie wordt gegenereerd...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const soepSections = [
    {
      id: 'subjective',
      title: 'Subjectief',
      content: soepData?.subjective || '',
      icon: User,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    {
      id: 'objective',
      title: 'Objectief',
      content: soepData?.objective || '',
      icon: Eye,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    {
      id: 'evaluation',
      title: 'Evaluatie',
      content: soepData?.evaluation || '',
      icon: Brain,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800'
    },
    {
      id: 'plan',
      title: 'Plan',
      content: soepData?.plan || '',
      icon: Target,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800'
    }
  ];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            SOEP Documentatie
          </h3>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-1"
              >
                <Pencil size={14} />
                Bewerken
              </Button>
            )}
            <CopyToClipboard 
              text={soepData?.fullStructuredText || ''}
              size="sm"
            >
              <Copy size={14} />
            </CopyToClipboard>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {soepSections.map((section) => {
            const IconComponent = section.icon;
            
            return (
              <div
                key={section.id}
                className={cn(
                  'p-4 rounded-lg border',
                  section.bgColor,
                  section.borderColor
                )}
              >
                <h4 className={cn(
                  'font-semibold mb-2 flex items-center gap-2',
                  section.textColor
                )}>
                  <IconComponent size={16} />
                  {section.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {section.content || `Geen ${section.title.toLowerCase()} informatie beschikbaar.`}
                </p>
              </div>
            );
          })}

          {soepData?.redFlags && soepData.redFlags.length > 0 && (
            <div className="p-4 rounded-lg border bg-red-50 border-red-200">
              <h4 className="font-semibold mb-2 text-red-800 flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                Rode Vlagen
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {soepData.redFlags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 text-xs mt-1">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SOEPResultView;