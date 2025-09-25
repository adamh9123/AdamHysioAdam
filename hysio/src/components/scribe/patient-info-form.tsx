import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DocumentUploader } from '@/components/ui/document-uploader';
import { Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { PatientInfo } from '@/types/api';

export interface PatientInfoFormProps {
  onPatientInfoSubmit: (patientInfo: PatientInfo) => void;
  onBack: () => void;
  initialData?: Partial<PatientInfo>;
  sessionType: 'intake' | 'intake-plus' | 'consult';
  disabled?: boolean;
  className?: string;
}

interface FormErrors {
  initials?: string;
  birthYear?: string;
  gender?: string;
  chiefComplaint?: string;
}

const PatientInfoForm: React.FC<PatientInfoFormProps> = ({
  onPatientInfoSubmit,
  onBack,
  initialData = {},
  sessionType,
  disabled = false,
  className,
}) => {
  const [formData, setFormData] = React.useState<PatientInfo>({
    initials: initialData.initials || '',
    birthYear: initialData.birthYear || '',
    gender: initialData.gender || 'male',
    chiefComplaint: initialData.chiefComplaint || '',
  });

  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Document context state
  const [documentContext, setDocumentContext] = React.useState<string>('');
  const [documentFilename, setDocumentFilename] = React.useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation
    if (!formData.initials?.trim()) {
      newErrors.initials = 'Voorletters zijn verplicht';
    } else if (formData.initials.length > 10) {
      newErrors.initials = 'Voorletters mogen maximaal 10 karakters bevatten';
    }

    if (!formData.birthYear?.trim()) {
      newErrors.birthYear = 'Geboortejaar is verplicht';
    } else {
      const year = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.birthYear = `Geboortejaar moet tussen 1900 en ${currentYear} liggen`;
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Geslacht is verplicht';
    }

    // Hoofdklacht and document are now optional for all workflows

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PatientInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle document upload from DocumentUploader component
  const handleDocumentUpload = (documentText: string, filename: string) => {
    setDocumentContext(documentText);
    setDocumentFilename(filename);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || disabled) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Calculate age and add it to form data
      const currentYear = new Date().getFullYear();
      const calculatedAge = formData.birthYear ? currentYear - parseInt(formData.birthYear) : undefined;
      
      const patientDataWithAge = {
        ...formData,
        age: calculatedAge,
        documentContext: documentContext || undefined,
        documentFilename: documentFilename || undefined,
      };

      onPatientInfoSubmit(patientDataWithAge);
    } catch (error) {
      console.error('Error submitting patient info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className={cn('min-h-screen bg-[#E6F5F3] w-full py-8', className)}>
      <div className="w-full max-w-4xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#A5E1C5]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-[#004B3A]" />
          </div>
          <h1 className="text-4xl font-bold text-[#004B3A] mb-4">
            Hysio Medical Scribe
          </h1>
          <p className="text-xl text-[#003728]/80 mb-2">
            Welkom bij uw AI-ondersteunde fysiotherapie documentatie
          </p>
          <p className="text-[#003728]/70">
            Vul de essentiële gegevens in om een nieuwe sessie te starten
          </p>
        </div>

        <Card className="border-2 border-[#A5E1C5]/40 bg-[#F8F8F5] shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-[#A5E1C5]/30 rounded-full flex items-center justify-center">
              <User size={24} className="text-[#004B3A]" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-[#004B3A]">
                Patiëntinformatie
              </CardTitle>
              <CardDescription className="text-[#003728]/70">
                Invoeren van basisgegevens voor een nieuwe Hysio Scribe sessie
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#004B3A] flex items-center gap-2">
                <User size={18} />
                Basisgegevens
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="initials" className="text-hysio-deep-green">
                    Voorletters *
                  </Label>
                  <Input
                    id="initials"
                    value={formData.initials}
                    onChange={(e) => handleInputChange('initials', e.target.value.toUpperCase())}
                    placeholder="J.P."
                    disabled={disabled || isSubmitting}
                    className={cn(errors.initials && 'border-red-500')}
                    maxLength={10}
                  />
                  <p className="text-xs text-hysio-deep-green-900/60">
                    Bijvoorbeeld: J.P. of M.A.J.
                  </p>
                  {errors.initials && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors.initials}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthYear" className="text-hysio-deep-green flex items-center gap-1">
                    <Calendar size={16} />
                    Geboortejaar *
                  </Label>
                  <Input
                    id="birthYear"
                    type="number"
                    value={formData.birthYear}
                    onChange={(e) => handleInputChange('birthYear', e.target.value)}
                    placeholder="1985"
                    min="1900"
                    max={new Date().getFullYear()}
                    disabled={disabled || isSubmitting}
                    className={cn(errors.birthYear && 'border-red-500')}
                    onInput={(e) => {
                      // Limit to 4 digits
                      const target = e.target as HTMLInputElement;
                      if (target.value.length > 4) {
                        target.value = target.value.slice(0, 4);
                        handleInputChange('birthYear', target.value);
                      }
                    }}
                  />
                  {formData.birthYear && formData.birthYear.length === 4 && !isNaN(parseInt(formData.birthYear)) && (
                    <p className="text-sm text-hysio-deep-green-900/70 font-medium">
                      Leeftijd: ca. {new Date().getFullYear() - parseInt(formData.birthYear)} jaar
                    </p>
                  )}
                  {errors.birthYear && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle size={14} />
                      {errors.birthYear}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-hysio-deep-green">
                  Geslacht *
                </Label>
                <div className="flex gap-4">
                  {[
                    { value: 'male', label: 'Man' },
                    { value: 'female', label: 'Vrouw' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        disabled={disabled || isSubmitting}
                        className="text-hysio-mint focus:ring-hysio-mint"
                      />
                      <span className="text-sm text-hysio-deep-green">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#004B3A] flex items-center gap-2">
                <FileText size={18} />
                Medische informatie
              </h3>

              <div className="space-y-2">
                <Label htmlFor="chiefComplaint" className="text-hysio-deep-green">
                  Hoofdklacht
                  <span className="text-hysio-deep-green-900/60 text-sm font-normal ml-1">(optioneel)</span>
                </Label>
                <Textarea
                  id="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                  placeholder="Beschrijf de hoofdklacht van de patiënt..."
                  rows={3}
                  disabled={disabled || isSubmitting}
                  className={cn(errors.chiefComplaint && 'border-red-500')}
                />
                {errors.chiefComplaint && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    {errors.chiefComplaint}
                  </p>
                )}
              </div>

              {/* Document Upload Section */}
              <div className="space-y-2 pt-2">
                <Label className="text-hysio-deep-green text-sm">
                  Context Document (optioneel)
                </Label>
                <DocumentUploader
                  onUploadComplete={handleDocumentUpload}
                  disabled={disabled || isSubmitting}
                  className="mb-2"
                />
                <p className="text-xs text-hysio-deep-green-900/60">
                  Upload verwijsbrieven, vorige verslagen of andere relevante documenten voor context
                </p>
                {documentContext && documentFilename && (
                  <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-md p-2">
                    ✓ Document &apos;{documentFilename}&apos; succesvol geüpload en verwerkt
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onBack}
                disabled={isSubmitting}
                className="sm:w-auto font-semibold"
              >
                Terug
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={disabled || isSubmitting}
                className="flex-1 sm:flex-none sm:min-w-[200px] font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Bezig met opslaan...
                  </>
                ) : (
                  `${sessionType === 'intake' ? 'Kies uw workflow' : 'Ga verder naar vervolgconsult'}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-hysio-deep-green-900/60">
            Alle gegevens worden veilig opgeslagen en zijn alleen toegankelijk voor bevoegd zorgpersoneel
          </p>
          <p className="text-xs text-hysio-deep-green-900/50 mt-1">
            * = Verplichte velden | Hoofdklacht en document upload zijn optioneel voor flexibele workflow
          </p>
        </div>
      </div>
    </div>
  );
};

export { PatientInfoForm };