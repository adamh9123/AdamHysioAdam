// SmartMail component exports
export { SmartMailInterface } from './smartmail-interface';
export { RecipientSelector } from './recipient-selector';
export { ContextDefinition } from './context-definition';
export { DocumentUpload } from './document-upload';
export { SmartMailHistory } from './smartmail-history';
export { EmailExport } from './email-export';
export { EmailReviewEditor } from './email-review-editor';
export { SmartMailLoadingState, EmailContentSkeleton, WorkflowProgress } from './loading-states';

// Re-export types for convenience
export type {
  EmailGenerationRequest,
  EmailGenerationResponse,
  EmailTemplate,
  RecipientType,
  CommunicationContext,
  DocumentContext,
  EmailSuggestion
} from '@/lib/types/smartmail';