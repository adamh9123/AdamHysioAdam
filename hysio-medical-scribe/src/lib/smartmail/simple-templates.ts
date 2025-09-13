import { EmailTemplate } from '@/lib/types/smartmail-simple';

// Ultra-simple email templates - just the essentials
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'patient-update',
    name: 'Patiënt Update',
    recipientType: 'patient',
    template: `Beste {{patientName}},

{{context}}

Met vriendelijke groet,
{{therapistName}}
Fysiotherapeut`
  },
  {
    id: 'colleague-referral',
    name: 'Collega Verwijzing',
    recipientType: 'colleague',
    template: `Beste collega,

{{context}}

Met collegiale groet,
{{therapistName}}
Fysiotherapeut`
  },
  {
    id: 'huisarts-consultation',
    name: 'Huisarts Consultatie',
    recipientType: 'huisarts',
    template: `Geachte huisarts,

{{context}}

Met vriendelijke groet,
{{therapistName}}
Fysiotherapeut`
  }
];

export function getTemplate(recipientType: 'patient' | 'colleague' | 'huisarts'): string {
  const template = EMAIL_TEMPLATES.find(t => t.recipientType === recipientType);
  return template?.template || EMAIL_TEMPLATES[0].template;
}