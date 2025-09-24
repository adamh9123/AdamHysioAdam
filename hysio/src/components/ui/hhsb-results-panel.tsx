import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ChevronRight, 
  Lightbulb,
  Edit3,
  Mic,
  Copy,
  ChevronDown,
  ChevronUp,
  User,
  Heart,
  Stethoscope,
  Activity,
  AlertTriangle,
  Eye
} from 'lucide-react';
import type { HHSBStructure } from '@/lib/types';

// Parse HHSB structured text into individual sections
const parseHHSBText = (fullText: string): HHSBStructure => {
  // Input validation and error handling
  if (!fullText || typeof fullText !== 'string') {
    console.warn('parseHHSBText: Invalid input provided, returning empty structure');
    return {
      hulpvraag: '',
      historie: '',
      stoornissen: '',
      beperkingen: '',
      redFlags: [],
      fullStructuredText: '',
      anamneseSummary: '',
    };
  }

  const result: HHSBStructure = {
    hulpvraag: '',
    historie: '',
    stoornissen: '',
    beperkingen: '',
    redFlags: [],
    fullStructuredText: fullText,
    anamneseSummary: '',
  };

  try {
    // Comprehensive regex patterns for robust parsing
    const sectionPatterns = [
      // Hulpvraag patterns - more comprehensive
      {
        key: 'hulpvraag' as keyof HHSBStructure,
        patterns: [
          /\*\*H\s*[-:]?\s*Hulpvraag\s*(?:\/\s*Patiënt\s*Probleem)?:?\s*\*\*\s*([\s\S]*?)(?=\*\*[HhSsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Hulpvraag:?\s*\*\*\s*([\s\S]*?)(?=\*\*[HhSsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*H\s*[-:]?\s*\*\*\s*([\s\S]*?)(?=\*\*[HhSsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      },
      // Historie patterns - enhanced
      {
        key: 'historie' as keyof HHSBStructure,
        patterns: [
          /\*\*H\s*[-:]?\s*Historie:?\s*\*\*\s*([\s\S]*?)(?=\*\*[SsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Historie:?\s*\*\*\s*([\s\S]*?)(?=\*\*[SsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*H\s*[-:]?\s*\*\*\s*([\s\S]*?)(?=\*\*[SsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      },
      // Stoornissen patterns - enhanced
      {
        key: 'stoornissen' as keyof HHSBStructure,
        patterns: [
          /\*\*S\s*[-:]?\s*Stoornissen\s*(?:in\s*lichaamsfuncties\s*en\s*anatomische\s*structuren)?:?\s*\*\*\s*([\s\S]*?)(?=\*\*[Bb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Stoornissen:?\s*\*\*\s*([\s\S]*?)(?=\*\*[Bb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*S\s*[-:]?\s*\*\*\s*([\s\S]*?)(?=\*\*[Bb]|\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      },
      // Beperkingen patterns - enhanced
      {
        key: 'beperkingen' as keyof HHSBStructure,
        patterns: [
          /\*\*B\s*[-:]?\s*Beperkingen:?\s*\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Beperkingen:?\s*\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*B\s*[-:]?\s*\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      }
    ];

    // Extract content for each section with better parsing
    sectionPatterns.forEach(({ key, patterns }) => {
      for (const pattern of patterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
          // Clean and trim the content
          const content = match[1]
            .replace(/^\s*[\n\r]+/, '') // Remove leading whitespace/newlines
            .replace(/[\n\r]+\s*$/, '') // Remove trailing whitespace/newlines
            .trim();

          if (content) {
            result[key] = content;
            break;
          }
        }
      }
    });

    // Extract anamnesis summary
    const summaryPatterns = [
      /\*\*Samenvatting\s*(?:Anamnese)?:?\s*\*\*\s*([\s\S]*?)(?=\*\*Rode|$)/im,
      /\*\*Anamnese\s*Samenvatting:?\s*\*\*\s*([\s\S]*?)(?=\*\*Rode|$)/im,
    ];

    for (const pattern of summaryPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        result.anamneseSummary = match[1].trim();
        break;
      }
    }

    // Enhanced red flags extraction
    const redFlagPatterns = [
      /\*\*Rode\s*Vlagen:?\s*\*\*\s*([\s\S]*?)$/im,
      /\[RODE\s*VLAG\s*:?\s*([^\]]+)\]/gim
    ];

    for (const pattern of redFlagPatterns) {
      try {
        if (pattern.global) {
          const matches = Array.from(fullText.matchAll(pattern));
          for (const match of matches) {
            if (match && match[1]) {
              const flag = match[1].trim();
              if (flag && !result.redFlags.includes(flag)) {
                result.redFlags.push(flag);
              }
            }
          }
        } else {
          const match = fullText.match(pattern);
          if (match && match[1]) {
            const flags = match[1]
              .split(/[\n\r]+/)
              .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())
              .filter(line => line.length > 0);

            flags.forEach(flag => {
              if (!result.redFlags.includes(flag)) {
                result.redFlags.push(flag);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error extracting red flags:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('Critical error in parseHHSBText:', error);
    return {
      hulpvraag: '',
      historie: '',
      stoornissen: '',
      beperkingen: '',
      redFlags: [],
      fullStructuredText: fullText,
      anamneseSummary: '',
    };
  }
};

interface HHSBSection {
  id: keyof HHSBStructure;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  content?: string;
}

const hhsbSections: HHSBSection[] = [
  {
    id: 'hulpvraag',
    title: 'Hulpvraag',
    shortTitle: 'H',
    description: 'Motivatie/hulpvraag en doelen/verwachtingen van de patiënt',
    icon: User,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'historie',
    title: 'Historie',
    shortTitle: 'H',
    description: 'Ontstaansmoment, verloop klachten en eerdere behandeling',
    icon: FileText,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'stoornissen',
    title: 'Stoornissen',
    shortTitle: 'S',
    description: 'Pijn, mobiliteit, kracht en stabiliteit',
    icon: Stethoscope,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
  },
  {
    id: 'beperkingen',
    title: 'Beperkingen',
    shortTitle: 'B',
    description: 'ADL, werk en sport gerelateerde beperkingen',
    icon: Activity,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    id: 'anamneseSummary',
    title: 'Samenvatting Anamnese',
    shortTitle: 'Samenvatting',
    description: 'Beknopte samenvatting van de anamnese bevindingen',
    icon: Heart,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
];

export interface HHSBResultsPanelProps {
  hhsbData: HHSBStructure;
  preparationContent?: string;
  onNavigateNext?: () => void;
  nextButtonLabel?: string;
  disabled?: boolean;
  className?: string;
  showSources?: boolean;
  audioSource?: boolean;
  manualSource?: boolean;
  onDataChange?: (updatedData: HHSBStructure) => void;
  enableEditing?: boolean;
}

const HHSBResultsPanel: React.FC<HHSBResultsPanelProps> = React.memo(({
  hhsbData,
  preparationContent,
  onNavigateNext,
  nextButtonLabel = 'Ga naar Onderzoek',
  disabled = false,
  className,
  showSources = false,
  audioSource = false,
  manualSource = false,
  onDataChange,
  enableEditing = true,
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());
  const [showFullView, setShowFullView] = React.useState(false);
  const [localData, setLocalData] = React.useState<HHSBStructure>(hhsbData);
  const [editingSection, setEditingSection] = React.useState<string | null>(null);

  // Memoize parsed data to avoid re-parsing on every render
  const parsedData = React.useMemo(() => {
    if (hhsbData.fullStructuredText) {
      return parseHHSBText(hhsbData.fullStructuredText);
    }
    return null;
  }, [hhsbData.fullStructuredText]);

  // Update local data when props change
  React.useEffect(() => {
    if (hhsbData.fullStructuredText && parsedData) {
      // If individual sections were already provided, preserve them, otherwise use parsed data
      const mergedData: HHSBStructure = {
        hulpvraag: hhsbData.hulpvraag || parsedData.hulpvraag,
        historie: hhsbData.historie || parsedData.historie,
        stoornissen: hhsbData.stoornissen || parsedData.stoornissen,
        beperkingen: hhsbData.beperkingen || parsedData.beperkingen,
        redFlags: hhsbData.redFlags?.length ? hhsbData.redFlags : parsedData.redFlags,
        fullStructuredText: hhsbData.fullStructuredText
      };
      setLocalData(mergedData);
    } else {
      setLocalData(hhsbData);
    }
  }, [hhsbData, parsedData]);

  const toggleSectionCollapse = React.useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const copySectionContent = React.useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      console.log('HHSB sectie gekopieerd naar clipboard');
    } catch (err) {
      console.error('Failed to copy section to clipboard:', err);
    }
  }, []);

  const copyFullHHSB = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(localData.fullStructuredText);
      console.log('Volledige HHSB gekopieerd naar clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [localData.fullStructuredText]);

  const updateSectionContent = (sectionId: keyof HHSBStructure, newContent: string) => {
    const updatedData = {
      ...localData,
      [sectionId]: newContent
    };

    // Rebuild full structured text if individual sections change
    if (sectionId !== 'fullStructuredText' && sectionId !== 'redFlags') {
      updatedData.fullStructuredText = buildFullStructuredText(updatedData);
    } else if (sectionId === 'fullStructuredText') {
      // If full text is edited, parse it to update individual sections
      const parsedData = parseHHSBText(newContent);
      updatedData.hulpvraag = parsedData.hulpvraag;
      updatedData.historie = parsedData.historie;
      updatedData.stoornissen = parsedData.stoornissen;
      updatedData.beperkingen = parsedData.beperkingen;
      updatedData.redFlags = parsedData.redFlags;
    }

    setLocalData(updatedData);
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  const buildFullStructuredText = (data: HHSBStructure): string => {
    const sections = [];

    if (data.hulpvraag) {
      sections.push(`**H - Hulpvraag:**\n${data.hulpvraag}`);
    }

    if (data.historie) {
      sections.push(`**H - Historie:**\n${data.historie}`);
    }

    if (data.stoornissen) {
      sections.push(`**S - Stoornissen in lichaamsfuncties en anatomische structuren:**\n${data.stoornissen}`);
    }

    if (data.beperkingen) {
      sections.push(`**B - Beperkingen:**\n${data.beperkingen}`);
    }

    if (data.anamneseSummary) {
      sections.push(`**Samenvatting Anamnese:**\n${data.anamneseSummary}`);
    }

    if (data.redFlags && data.redFlags.length > 0) {
      const redFlagsText = data.redFlags.map(flag => `[RODE VLAG: ${flag}]`).join('\n');
      sections.push(`**Rode Vlagen:**\n${redFlagsText}`);
    }

    return sections.join('\n\n');
  };

  // Editable text component
  const EditableText: React.FC<{
    content: string;
    sectionId: keyof HHSBStructure;
    placeholder?: string;
    multiline?: boolean;
  }> = ({ content, sectionId, placeholder, multiline = true }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempValue, setTempValue] = React.useState(content);

    React.useEffect(() => {
      setTempValue(content);
    }, [content]);

    const handleSave = () => {
      updateSectionContent(sectionId, tempValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setTempValue(content);
      setIsEditing(false);
    };

    if (!enableEditing) {
      return (
        <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
          {content || placeholder}
        </pre>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border border-hysio-mint/40 rounded-md shadow-sm focus:ring-hysio-mint focus:border-hysio-mint resize-y font-inter text-sm"
              rows={Math.max(3, tempValue.split('\n').length + 1)}
              placeholder={placeholder}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 border border-hysio-mint/40 rounded-md shadow-sm focus:ring-hysio-mint focus:border-hysio-mint font-inter text-sm"
              placeholder={placeholder}
              autoFocus
            />
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-hysio-mint hover:bg-hysio-mint/90 text-white"
            >
              Opslaan
            </Button>
            <Button
              onClick={handleCancel}
              size="sm"
              variant="outline"
            >
              Annuleren
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className="cursor-text hover:bg-hysio-mint/5 p-2 rounded-md transition-colors group"
      >
        <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
          {content || (
            <span className="text-gray-400 italic">
              {placeholder || 'Klik om te bewerken...'}
            </span>
          )}
        </pre>
        <div className="opacity-0 group-hover:opacity-100 text-xs text-hysio-mint mt-1 transition-opacity">
          Klik om te bewerken
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* HHSB Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
              <div className="w-12 h-12 bg-hysio-mint/20 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-hysio-deep-green" />
              </div>
              HHSB Anamnesekaart
            </h2>
            <p className="text-hysio-deep-green-900/70 mt-2">
              Gestructureerde anamnese volgens HHSB-format (Hulpvraag, Historie, Stoornissen, Beperkingen)
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFullView(!showFullView)}
              variant="outline"
              size="sm"
              className="gap-2 border-[#A5E1C5] text-[#004B3A] hover:bg-[#A5E1C5]/10"
            >
              <Eye size={16} />
              {showFullView ? 'Compacte Weergave' : 'Volledige Weergave'}
            </Button>
            
            <Button
              onClick={copyFullHHSB}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={disabled}
            >
              <Copy size={16} />
              Kopiëer Volledig
            </Button>
          </div>
        </div>

        {/* Show sources used */}
        {showSources && (
          <div className="flex flex-wrap gap-2 mb-4">
            {audioSource && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                <Mic size={14} className="mr-2" />
                Audio transcriptie gebruikt
              </span>
            )}
            {manualSource && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                <Edit3 size={14} className="mr-2" />
                Handmatige notities gebruikt
              </span>
            )}
          </div>
        )}
      </div>

      {/* HHSB Sections */}
      <div className="space-y-4">
        {showFullView ? (
          // Full structured text view
          <Card className="border-2 border-hysio-mint/20 bg-hysio-cream/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-hysio-deep-green">
                  Volledige HHSB Structuur
                </h3>
                <Button
                  onClick={copyFullHHSB}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <Copy size={14} />
                  Kopiëren
                </Button>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <EditableText
                  content={localData.fullStructuredText}
                  sectionId="fullStructuredText"
                  placeholder="Volledige HHSB structuur..."
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          // Individual collapsible sections
          hhsbSections.map((section) => {
            const isCollapsed = collapsedSections.has(section.id);
            const sectionContent = localData[section.id] as string || '';
            
            return (
              <Card key={section.id} className={cn('border-2', section.bgColor, 'border-opacity-30')}>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        section.bgColor
                      )}>
                        <section.icon size={20} className={section.color} />
                      </div>
                      <div>
                        <h3 className={cn('text-lg font-semibold', section.color)}>
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => copySectionContent(sectionContent)}
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        disabled={disabled || !sectionContent.trim()}
                        title={`Kopiëer ${section.title}`}
                      >
                        <Copy size={14} />
                        <span className="sr-only">Kopiëer {section.shortTitle}</span>
                      </Button>
                      <Button
                        onClick={() => toggleSectionCollapse(section.id)}
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                      >
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </Button>
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="mt-4 pl-13">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <EditableText
                          content={sectionContent}
                          sectionId={section.id}
                          placeholder={`Voer ${section.title.toLowerCase()} in...`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Enhanced Preparation Reference */}
      {preparationContent && (
        <Card className="border-2 border-amber-200 bg-amber-50/30 mt-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb size={20} className="text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    Intake Voorbereiding (Referentie)
                  </h3>
                  <p className="text-sm text-amber-700/80">
                    AI-gegenereerde voorbereiding voor dit consult
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => copySectionContent(preparationContent)}
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-amber-700 hover:text-amber-800"
                  disabled={disabled}
                >
                  <Copy size={14} />
                  Kopiëren
                </Button>
                <Button
                  onClick={() => toggleSectionCollapse('preparation')}
                  variant="ghost"
                  size="sm"
                  className="text-amber-700"
                  disabled={disabled}
                >
                  {collapsedSections.has('preparation') ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </Button>
              </div>
            </div>
            
            {!collapsedSections.has('preparation') && (
              <div className="pl-13">
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
                    {preparationContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

    </div>
  );
});

HHSBResultsPanel.displayName = 'HHSBResultsPanel';

export { HHSBResultsPanel };