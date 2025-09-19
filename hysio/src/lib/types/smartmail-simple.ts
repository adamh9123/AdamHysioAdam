// Ultra-Simple SmartMail Types
export interface SimpleEmailRequest {
  recipientType: 'patient' | 'colleague' | 'huisarts';
  subject: string;
  context: string;
  patientInfo?: {
    initials: string;
    age: number;
    chiefComplaint: string;
  };
  length: 'kort' | 'gemiddeld' | 'lang';
  // Ultra Think Enhancement: Document context for AI
  documentContext?: string;
}

export interface SimpleEmailResponse {
  success: boolean;
  email?: string;
  error?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  recipientType: 'patient' | 'colleague' | 'huisarts';
  template: string;
}