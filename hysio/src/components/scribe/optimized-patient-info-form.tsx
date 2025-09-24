// Performance-optimized patient info form with React.memo and optimized state management

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import { useOptimizedObjectState, useDebouncedState, useStableCallback } from '@/lib/hooks/useOptimizedState';
import { PerformanceTimer } from '@/lib/utils/performance';
import type { PatientInfo } from '@/types/api';

export interface OptimizedPatientInfoFormProps {
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

// Memoized validation functions to prevent recreation on each render
const validateInitials = (initials: string): string | undefined => {
  if (!initials?.trim()) return 'Voorletters zijn verplicht';
  if (initials.length > 10) return 'Voorletters mogen maximaal 10 karakters bevatten';
  return undefined;
};

const validateBirthYear = (birthYear: string): string | undefined => {
  if (!birthYear?.trim()) return 'Geboortejaar is verplicht';

  const year = parseInt(birthYear);
  const currentYear = new Date().getFullYear();

  if (isNaN(year)) return 'Voer een geldig jaar in';
  if (year < 1900) return 'Geboortejaar moet na 1900 zijn';
  if (year > currentYear) return 'Geboortejaar kan niet in de toekomst liggen';
  if (birthYear.length !== 4) return 'Voer een volledig jaar in (4 cijfers)';

  return undefined;
};

const validateChiefComplaint = (complaint: string): string | undefined => {
  if (!complaint?.trim()) return 'Hoofdklacht is verplicht';
  if (complaint.length < 3) return 'Hoofdklacht moet minimaal 3 karakters bevatten';
  if (complaint.length > 500) return 'Hoofdklacht mag maximaal 500 karakters bevatten';
  return undefined;
};

// Memoized input components to prevent unnecessary re-renders
const MemoizedInput = React.memo<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  maxLength?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
}>(({ label, value, onChange, error, placeholder, maxLength, disabled, icon }) => {
  const handleChange = useStableCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  });

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(' ', '-')} className="text-sm font-semibold text-hysio-deep-green">
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </Label>
      <Input
        id={label.toLowerCase().replace(' ', '-')}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={cn(
          "transition-colors",
          error ? "border-red-500 focus:border-red-500" : "border-hysio-mint/30 focus:border-hysio-deep-green"
        )}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
});

MemoizedInput.displayName = 'MemoizedInput';

const MemoizedTextarea = React.memo<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  maxLength?: number;
  disabled?: boolean;
  rows?: number;
}>(({ label, value, onChange, error, placeholder, maxLength, disabled, rows = 4 }) => {
  const handleChange = useStableCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  });

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(' ', '-')} className="text-sm font-semibold text-hysio-deep-green">
        <div className="flex items-center gap-2">
          <FileText size={16} />
          {label}
        </div>
      </Label>
      <Textarea
        id={label.toLowerCase().replace(' ', '-')}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={rows}
        className={cn(
          "resize-none transition-colors",
          error ? "border-red-500 focus:border-red-500" : "border-hysio-mint/30 focus:border-hysio-deep-green"
        )}
      />
      {maxLength && (
        <p className="text-xs text-hysio-deep-green-900/60 text-right">
          {value.length}/{maxLength}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
});

MemoizedTextarea.displayName = 'MemoizedTextarea';

const OptimizedPatientInfoForm: React.FC<OptimizedPatientInfoFormProps> = React.memo(({
  onPatientInfoSubmit,
  onBack,
  initialData = {},
  sessionType,
  disabled = false,
  className,
}) => {
  // Use optimized state management
  const [formData, updateFormData] = useOptimizedObjectState<PatientInfo>({
    initials: initialData.initials || '',
    birthYear: initialData.birthYear || '',
    gender: initialData.gender || 'male',
    chiefComplaint: initialData.chiefComplaint || '',
    additionalInfo: initialData.additionalInfo || '',
  });

  const [errors, updateErrors] = useOptimizedObjectState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Debounced validation to reduce validation calls during typing
  const [, debouncedFormData] = useDebouncedState(formData, 300);

  // Memoized validation function
  const validateForm = useStableCallback((): boolean => {
    return PerformanceTimer.time('Form Validation', () => {
      const newErrors: FormErrors = {
        initials: validateInitials(formData.initials),
        birthYear: validateBirthYear(formData.birthYear),
        chiefComplaint: validateChiefComplaint(formData.chiefComplaint),
      };

      // Only update errors if they've actually changed
      const hasErrors = Object.values(newErrors).some(error => error !== undefined);
      updateErrors(newErrors);

      return !hasErrors;
    });
  });

  // Real-time validation with debouncing
  React.useEffect(() => {
    validateForm();
  }, [debouncedFormData, validateForm]);

  // Memoized calculated age
  const calculatedAge = React.useMemo(() => {
    if (formData.birthYear && formData.birthYear.length === 4) {
      const year = parseInt(formData.birthYear);
      if (!isNaN(year)) {
        return new Date().getFullYear() - year;
      }
    }
    return null;
  }, [formData.birthYear]);

  // Stable event handlers
  const handleSubmit = useStableCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await PerformanceTimer.timeAsync('Form Submission', async () => {
        await onPatientInfoSubmit(formData);
      });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleFieldChange = useStableCallback((field: keyof PatientInfo) =>
    (value: string) => updateFormData({ [field]: value })
  );

  // Memoized session type description
  const sessionDescription = React.useMemo(() => {
    switch (sessionType) {
      case 'intake':
        return 'Nieuwe patiënt intake voor eerste consultatie';
      case 'intake-plus':
        return 'Uitgebreide intake met extra assessment tools';
      case 'consult':
        return 'Follow-up consult voor bestaande patiënt';
      default:
        return 'Patiënt informatie voor consultatie';
    }
  }, [sessionType]);

  return (
    <div className={cn("max-w-2xl mx-auto p-6", className)}>
      <Card className="shadow-lg border-hysio-mint/20">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-hysio-deep-green">
            Patiënt Informatie
          </CardTitle>
          <CardDescription className="text-hysio-deep-green-900/70">
            {sessionDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-hysio-deep-green border-b border-hysio-mint/30 pb-2">
                Basisgegevens
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <MemoizedInput
                  label="Voorletters"
                  value={formData.initials}
                  onChange={handleFieldChange('initials')}
                  error={errors.initials}
                  placeholder="Bijv. J.A."
                  maxLength={10}
                  disabled={disabled || isSubmitting}
                  icon={<User size={16} />}
                />

                <div className="space-y-2">
                  <MemoizedInput
                    label="Geboortejaar"
                    value={formData.birthYear}
                    onChange={handleFieldChange('birthYear')}
                    error={errors.birthYear}
                    placeholder="Bijv. 1985"
                    maxLength={4}
                    disabled={disabled || isSubmitting}
                    icon={<Calendar size={16} />}
                  />
                  {calculatedAge && (
                    <p className="text-xs text-hysio-deep-green-900/60 font-medium">
                      Leeftijd: {calculatedAge} jaar
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-hysio-deep-green mb-3 block">
                  Geslacht
                </Label>
                <div className="flex gap-4">
                  {[
                    { value: 'male', label: 'Man' },
                    { value: 'female', label: 'Vrouw' },
                    { value: 'other', label: 'Anders' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={(e) => updateFormData({ gender: e.target.value as PatientInfo['gender'] })}
                        disabled={disabled || isSubmitting}
                        className="text-hysio-deep-green focus:ring-hysio-mint"
                      />
                      <span className="text-sm text-hysio-deep-green-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-hysio-deep-green border-b border-hysio-mint/30 pb-2">
                Medische informatie
              </h3>

              <MemoizedTextarea
                label="Hoofdklacht"
                value={formData.chiefComplaint}
                onChange={handleFieldChange('chiefComplaint')}
                error={errors.chiefComplaint}
                placeholder="Beschrijf de hoofdklacht waarvoor de patiënt komt..."
                maxLength={500}
                disabled={disabled || isSubmitting}
                rows={4}
              />

              <MemoizedTextarea
                label="Aanvullende informatie (optioneel)"
                value={formData.additionalInfo || ''}
                onChange={handleFieldChange('additionalInfo')}
                placeholder="Relevante voorgeschiedenis, medicatie, of andere belangrijke informatie..."
                maxLength={1000}
                disabled={disabled || isSubmitting}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 border-hysio-mint text-hysio-deep-green hover:bg-hysio-mint/10"
              >
                Terug
              </Button>
              <Button
                type="submit"
                disabled={!validateForm() || isSubmitting}
                className="flex-1 bg-hysio-deep-green hover:bg-hysio-deep-green/90 text-white font-semibold"
              >
                {isSubmitting ? 'Verwerken...' : 'Kies uw workflow'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

OptimizedPatientInfoForm.displayName = 'OptimizedPatientInfoForm';

export default OptimizedPatientInfoForm;