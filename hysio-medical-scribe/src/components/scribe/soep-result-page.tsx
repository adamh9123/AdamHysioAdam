import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { SOEPViewModal } from '@/components/ui/soep-view-modal';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Copy,
  Edit3,
  Save,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  Eye,
  Stethoscope,
  ClipboardList,
  FileText,
  Download
} from 'lucide-react';
import { PatientInfo, SOEPStructure } from '@/lib/types';

export interface SOEPResultPageProps {
  patientInfo: PatientInfo;
  soepData: SOEPStructure;
  onBack: () => void;
  onComplete?: (editedSoepData: SOEPStructure) => void;
  className?: string;
  disabled?: boolean;
  uploadedDocuments?: Array<{
    filename: string;
    text: string;
    type: string;
  }>;
}

interface SOEPSection {
  id: keyof SOEPStructure;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}

const soepSections: SOEPSection[] = [
  {
    id: 'subjective',
    title: 'Subjectief (S)',
    shortTitle: 'S',
    description: 'Wat de patiënt vertelt - klachten, ervaringen, gevoelens',
    icon: User,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'objective',
    title: 'Objectief (O)',
    shortTitle: 'O',
    description: 'Wat u observeert en meet - bevindingen, tests, metingen',
    icon: Eye,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    id: 'evaluation',
    title: 'Evaluatie (E)',
    shortTitle: 'E',
    description: 'Uw analyse en interpretatie - conclusies, hypotheses',
    icon: Stethoscope,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'plan',
    title: 'Plan (P)',
    shortTitle: 'P',
    description: 'Behandelplan - interventies, oefeningen, vervolgafspraken',
    icon: ClipboardList,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
];

const SOEPResultPage: React.FC<SOEPResultPageProps> = ({
  patientInfo,
  soepData,
  onBack,
  onComplete,
  className,
  disabled = false,
  uploadedDocuments = [],
}) => {
  const [editableSOEP, setEditableSOEP] = React.useState<SOEPStructure>(soepData);
  const [isEditing, setIsEditing] = React.useState(false);
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = React.useState(false);
  const [showViewModal, setShowViewModal] = React.useState(false);

  // Track changes
  React.useEffect(() => {
    const hasChangedFields = soepSections.some(section => 
      editableSOEP[section.id] !== soepData[section.id]
    );
    setHasChanges(hasChangedFields);
  }, [editableSOEP, soepData]);

  const updateSOEPSection = (sectionId: keyof SOEPStructure, value: string) => {
    setEditableSOEP(prev => ({
      ...prev,
      [sectionId]: value,
    }));
  };

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const saveChanges = () => {
    // Update the fullStructuredText with the edited content
    const updatedSOEP: SOEPStructure = {
      ...editableSOEP,
      fullStructuredText: generateFullStructuredText(editableSOEP),
    };
    
    setEditableSOEP(updatedSOEP);
    setIsEditing(false);
    setHasChanges(false);
    onComplete?.(updatedSOEP);
  };

  const discardChanges = () => {
    setEditableSOEP(soepData);
    setIsEditing(false);
    setHasChanges(false);
  };

  const generateFullStructuredText = (soep: SOEPStructure): string => {
    return `**Subjectief:**
${soep.subjective}

**Objectief:**
${soep.objective}

**Evaluatie:**
${soep.evaluation}

**Plan:**
${soep.plan}`;
  };

  const copyFullSOEP = async () => {
    try {
      const fullText = generateFullStructuredText(editableSOEP);
      await navigator.clipboard.writeText(fullText);
      // Optional: Add toast notification here
      console.log('Volledige SOEP gekopieerd naar clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const copySectionContent = async (sectionId: keyof SOEPStructure) => {
    try {
      const content = editableSOEP[sectionId];
      if (typeof content === 'string' && content.trim()) {
        await navigator.clipboard.writeText(content);
        console.log(`${sectionId} sectie gekopieerd naar clipboard`);
      }
    } catch (err) {
      console.error('Failed to copy section to clipboard:', err);
    }
  };

  const getAgeFromBirthYear = (birthYear: string): number => {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(birthYear);
  };

  const handleModalSave = (editedData: SOEPStructure) => {
    setEditableSOEP(editedData);
    setHasChanges(true);
  };

  const [exportLoading, setExportLoading] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);

  const handleExportSOEP = async (format: 'pdf' | 'word' | 'text' | 'html' = 'pdf') => {
    setExportLoading(true);
    try {
      const { SOEPExporter } = await import('@/lib/utils/soep-export');
      
      const exportData = {
        patientInfo,
        soepData: editableSOEP,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedDocuments
      };

      await SOEPExporter.exportAndDownload(exportData, format);
      setShowExportMenu(false);
      
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show user-friendly error toast
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={disabled}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Terug
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-hysio-deep-green mb-2">
              Consult Overzicht
            </h1>
            <p className="text-hysio-deep-green-900/70 text-lg">
              {patientInfo.initials}, {getAgeFromBirthYear(patientInfo.birthYear)} jaar - {patientInfo.chiefComplaint}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-hysio-deep-green-900/60">
              <span>Consult datum: {new Date().toLocaleDateString('nl-NL')}</span>
              {uploadedDocuments.length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {uploadedDocuments.length} bijlage{uploadedDocuments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-hysio-cream/30 rounded-lg border border-hysio-mint/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-hysio-deep-green">
              SOEP documentatie voltooid
            </span>
            {hasChanges && (
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                Wijzigingen niet opgeslagen
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowViewModal(true)}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={disabled}
            >
              <FileText size={16} />
              Bekijk Volledig SOEP
            </Button>
            
            <Button
              onClick={copyFullSOEP}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={disabled}
            >
              <Copy size={16} />
              Kopiëer Volledige SOEP
            </Button>
            
            <DropdownMenu open={showExportMenu} onOpenChange={setShowExportMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={disabled || exportLoading}
                >
                  <Download size={16} />
                  {exportLoading ? 'Exporteren...' : 'Exporteer SOEP'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExportSOEP('pdf')}>
                  <FileText size={16} className="mr-2" />
                  Export als PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSOEP('word')}>
                  <FileText size={16} className="mr-2" />
                  Export als Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSOEP('text')}>
                  <FileText size={16} className="mr-2" />
                  Export als Tekst
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportSOEP('html')}>
                  <FileText size={16} className="mr-2" />
                  Export als HTML
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                size="sm"
                className="gap-2"
                disabled={disabled}
              >
                <Edit3 size={16} />
                Bewerken
              </Button>
            ) : (
              <>
                <Button
                  onClick={discardChanges}
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                >
                  Annuleren
                </Button>
                <Button
                  onClick={saveChanges}
                  variant="primary"
                  size="sm"
                  className="gap-2"
                  disabled={disabled || !hasChanges}
                >
                  <Save size={16} />
                  Opslaan
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Red Flags Alert */}
      {editableSOEP.redFlags && editableSOEP.redFlags.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
          <h4 className="font-medium text-red-800 flex items-center gap-2 mb-2">
            <AlertTriangle size={18} />
            Rode Vlagen Gedetecteerd
          </h4>
          <ul className="space-y-1">
            {editableSOEP.redFlags.map((flag, index) => (
              <li key={index} className="text-red-700 text-sm">
                • {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Documents Summary */}
      {uploadedDocuments.length > 0 && (
        <Card className="mb-8 border-2 border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-blue-800">Context Documenten</CardTitle>
                <CardDescription>
                  Geüploade documenten gebruikt voor consultvoorbereiding
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{doc.filename}</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {doc.type.includes('pdf') ? 'PDF' : 'Word'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive SOEP Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {soepSections.map((section) => {
          const isCollapsed = collapsedSections.has(section.id);
          const sectionContent = editableSOEP[section.id];
          const hasContent = sectionContent && typeof sectionContent === 'string' && sectionContent.trim();
          
          return (
            <Card 
              key={section.id} 
              className={cn(
                'border-2 cursor-pointer transition-all duration-200 hover:shadow-lg',
                section.bgColor,
                'border-opacity-30 hover:border-opacity-50',
                isCollapsed && 'hover:scale-[1.02]'
              )}
              onClick={() => toggleSectionCollapse(section.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center shadow-sm',
                      section.bgColor,
                      'border border-opacity-20'
                    )}>
                      <section.icon size={24} className={section.color} />
                    </div>
                    <div>
                      <CardTitle className={cn('text-lg font-semibold', section.color)}>
                        {section.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => copySectionContent(section.id)}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      disabled={disabled || !hasContent}
                    >
                      <Copy size={14} />
                      <span className="sr-only">Kopiëer {section.shortTitle}</span>
                    </Button>
                    <div className={cn(
                      'p-1 rounded-full transition-transform',
                      isCollapsed ? 'rotate-0' : 'rotate-180'
                    )}>
                      <ChevronDown size={16} className={section.color} />
                    </div>
                  </div>
                </div>
                
                {/* Content Preview when collapsed */}
                {isCollapsed && hasContent && (
                  <div className="mt-3 p-3 bg-white/80 rounded-lg border border-opacity-20">
                    <p className="text-sm text-gray-700 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const
                    }}>
                      {(sectionContent as string).substring(0, 120)}...
                    </p>
                  </div>
                )}
              </CardHeader>
              
              {!isCollapsed && (
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Label htmlFor={`edit-${section.id}`} className={cn('font-medium', section.color)}>
                        Bewerk {section.title}
                      </Label>
                      <Textarea
                        id={`edit-${section.id}`}
                        value={sectionContent as string || ''}
                        onChange={(e) => updateSOEPSection(section.id, e.target.value)}
                        rows={8}
                        disabled={disabled}
                        className="resize-none border-2 focus:border-opacity-50"
                        placeholder={`Voer ${section.title.toLowerCase()} informatie in...`}
                      />
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      {hasContent ? (
                        <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-gray-800">
                          {sectionContent}
                        </pre>
                      ) : (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                          <div className="text-center">
                            <section.icon size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm italic">
                              Geen informatie beschikbaar voor {section.title.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Full Structured Text Preview */}
      <Card className="mt-8 border-2 border-hysio-mint/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-hysio-deep-green">
                Volledige SOEP Documentatie
              </CardTitle>
              <CardDescription>
                Geformatteerde versie voor kopiëren naar uw systeem
              </CardDescription>
            </div>
            <CopyToClipboard text={generateFullStructuredText(editableSOEP)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-hysio-cream/20 p-4 rounded-lg border border-hysio-mint/20">
            <pre className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-hysio-deep-green-900">
              {generateFullStructuredText(editableSOEP)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Footer Information */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-sm text-hysio-deep-green-900/60">
          SOEP documentatie voldoet aan Nederlandse fysiotherapie richtlijnen
        </p>
        <p className="text-xs text-hysio-deep-green-900/50">
          Alle AI-gegenereerde content moet worden geverifieerd door een bevoegd fysiotherapeut
        </p>
        <p className="text-xs text-hysio-deep-green-900/40">
          Gegenereerd op {new Date().toLocaleString('nl-NL')}
        </p>
      </div>

      {/* SOEP View Modal */}
      <SOEPViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        patientInfo={patientInfo}
        soepData={editableSOEP}
        onSave={handleModalSave}
        onExport={handleExportSOEP}
        readonly={disabled}
      />
    </div>
  );
};

export { SOEPResultPage };