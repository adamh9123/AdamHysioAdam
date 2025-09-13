// API endpoint for SmartMail email generation using specialized healthcare prompts
// Extends existing /api/generate pattern with SmartMail-specific validation and logic

import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithOpenAI, type OpenAICompletionOptions } from '@/lib/api/openai';
import type {
  EmailGenerationRequest,
  EmailGenerationResponse,
  EmailTemplate,
  EmailSuggestion,
  RecipientType,
  CommunicationContext,
  DocumentContext
} from '@/lib/types/smartmail';
import {
  validateSmartMailInput,
  validatePrivacyContent
} from '@/lib/smartmail/validation';
import {
  generateSystemPrompt,
  generateUserPrompt,
  validatePromptParameters
} from '@/lib/smartmail/prompt-engineering';
import { SUBJECT_PATTERNS } from '@/lib/smartmail/email-templates';
import { ErrorHandlerUtils } from '@/lib/smartmail/error-handling';

export const runtime = 'nodejs';

// Generate request ID for tracking
function generateRequestId(): string {
  return `sm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate template ID for email templates
function generateTemplateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract and format document content for AI processing
function formatDocumentContent(documents: DocumentContext[]): string[] {
  return documents.map(doc => {
    return `**${doc.filename}** (${doc.source}):\n${doc.content}`;
  });
}

// Generate subject line based on patterns and context
function generateSubjectLine(
  context: CommunicationContext,
  recipient: RecipientType,
  patientInitials?: string
): string {
  const patterns = SUBJECT_PATTERNS[recipient.language];
  const pattern = patterns[context.objective];
  
  if (!pattern) {
    return context.subject;
  }
  
  let subject = pattern;
  
  // Replace common placeholders
  if (patientInitials) {
    subject = subject.replace('[PATIENT_INITIALEN]', patientInitials);
    subject = subject.replace('[PATIENT_INITIALS]', patientInitials);
  }
  
  subject = subject.replace('[REDEN]', context.subject);
  subject = subject.replace('[REASON]', context.subject);
  subject = subject.replace('[ONDERWERP]', context.subject);
  subject = subject.replace('[SUBJECT]', context.subject);
  subject = subject.replace('[DATUM]', new Date().toLocaleDateString(recipient.language === 'nl' ? 'nl-NL' : 'en-US'));
  subject = subject.replace('[DATE]', new Date().toLocaleDateString(recipient.language === 'nl' ? 'nl-NL' : 'en-US'));
  
  return subject;
}

// Estimate reading time based on word count
function estimateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Generate privacy and content warnings
function generateContentWarnings(
  context: CommunicationContext,
  documents: DocumentContext[] = []
): EmailSuggestion[] {
  const warnings: EmailSuggestion[] = [];
  
  // Check privacy in context fields
  const contentToCheck = [
    context.subject,
    context.background,
    context.chiefComplaint,
    context.additionalInstructions
  ].filter(Boolean).join(' ');
  
  const privacyValidation = validatePrivacyContent(contentToCheck);
  privacyValidation.warnings.forEach(warning => {
    warnings.push({
      type: 'privacy_warning',
      message: warning.message,
      severity: 'warning',
      actionable: true,
      suggestedAction: warning.suggestion
    });
  });
  
  // Check documents for potential PHI
  documents.forEach((doc, index) => {
    const docPrivacyValidation = validatePrivacyContent(doc.content);
    docPrivacyValidation.warnings.forEach(warning => {
      warnings.push({
        type: 'privacy_warning',
        message: `Document ${index + 1} (${doc.filename}): ${warning.message}`,
        severity: 'warning',
        actionable: true,
        suggestedAction: warning.suggestion
      });
    });
  });
  
  return warnings;
}

// Generate contextual suggestions for improving email
function generateContextualSuggestions(
  recipient: RecipientType,
  context: CommunicationContext
): EmailSuggestion[] {
  const suggestions: EmailSuggestion[] = [];
  
  // Validate prompt parameters
  const validation = validatePromptParameters(recipient, context);
  validation.missingElements.forEach(element => {
    suggestions.push({
      type: 'missing_context',
      message: `Consider adding ${element} for better context`,
      severity: 'info',
      actionable: true,
      suggestedAction: `Add ${element} to improve email relevance and completeness`
    });
  });
  
  // Suggest formality adjustments based on recipient and objective
  if (recipient.category === 'patient' && recipient.formality === 'formal') {
    suggestions.push({
      type: 'formality_adjustment',
      message: 'Consider using a more empathetic tone for patient communication',
      severity: 'info',
      actionable: true,
      suggestedAction: 'Switch to empathetic formality level'
    });
  }
  
  if (recipient.category === 'huisarts' && recipient.formality !== 'formal') {
    suggestions.push({
      type: 'formality_adjustment',
      message: 'Consider using formal tone for huisarts communication',
      severity: 'info',
      actionable: true,
      suggestedAction: 'Switch to formal formality level'
    });
  }
  
  // Medical accuracy suggestions
  if (context.objective === 'red_flag_notification' && !context.urgency) {
    suggestions.push({
      type: 'medical_accuracy',
      message: 'Red flag notifications should specify urgency level',
      severity: 'warning',
      actionable: true,
      suggestedAction: 'Set urgency to "urgent" for red flag notifications'
    });
  }
  
  return suggestions;
}

// Main POST handler for email generation
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body: EmailGenerationRequest = await request.json();
    
    // Add request ID if not provided
    if (!body.requestId) {
      body.requestId = generateRequestId();
    }
    
    // Add timestamp if not provided
    if (!body.timestamp) {
      body.timestamp = new Date().toISOString();
    }
    
    // Comprehensive input validation
    const validation = validateSmartMailInput(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        suggestions: validation.errors.map(error => ({
          type: 'missing_context' as const,
          message: error.message,
          severity: 'error' as const,
          actionable: true
        }))
      } satisfies EmailGenerationResponse, { status: 400 });
    }
    
    const { recipient, context, documents = [] } = body;
    
    // Generate content warnings and suggestions
    const contentWarnings = generateContentWarnings(context, documents);
    const contextualSuggestions = generateContextualSuggestions(recipient, context);
    const allSuggestions = [...contentWarnings, ...contextualSuggestions];
    
    // Format document content for AI processing
    const documentContent = documents.length > 0 ? formatDocumentContent(documents) : undefined;
    
    // Generate AI prompts
    const systemPrompt = generateSystemPrompt(recipient, context, documents.length > 0);
    const userPrompt = generateUserPrompt(context, recipient, documentContent);
    
    // Configure OpenAI options for healthcare communication
    const openAIOptions: OpenAICompletionOptions = {
      model: 'gpt-4o', // Use GPT-4 for better healthcare communication
      temperature: 0.3, // Lower temperature for more consistent, professional output
      max_tokens: 2000, // Sufficient for detailed emails
      top_p: 0.9,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    };
    
    const startTime = Date.now();
    
    // Generate email content using OpenAI with comprehensive error handling
    const aiResponse = await ErrorHandlerUtils.withErrorHandling(
      () => generateContentWithOpenAI(systemPrompt, userPrompt, openAIOptions),
      body,
      { startTime }
    );
    
    const processingTime = Date.now() - startTime;
    
    // Check if error handler returned a fallback response
    if (aiResponse && typeof aiResponse === 'object' && 'success' in aiResponse) {
      // This is an EmailGenerationResponse from error handler
      return NextResponse.json(aiResponse);
    }
    
    // Type guard to ensure aiResponse is OpenAI response
    if (!aiResponse || typeof aiResponse !== 'object' || !('success' in aiResponse)) {
      throw new Error('Invalid AI response format');
    }
    
    if (!aiResponse.success || !aiResponse.content) {
      return NextResponse.json({
        success: false,
        error: aiResponse.error || 'Failed to generate email content',
        suggestions: allSuggestions
      } satisfies EmailGenerationResponse, { status: 500 });
    }
    
    // Process generated content
    const generatedContent = aiResponse.content.trim();
    
    // Extract subject line (if generated in content) or use generated subject
    let subject = generateSubjectLine(context, recipient);
    const subjectMatch = generatedContent.match(/^\*\*(?:Onderwerp|Subject):\*\*\s*(.+?)$/m);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
    }
    
    // Calculate metadata
    const wordCount = generatedContent.split(/\s+/).length;
    const estimatedReadingTime = estimateReadingTime(wordCount);
    
    // Create formatted content versions
    const plainTextContent = generatedContent
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold formatting
      .replace(/^\*\*(?:Onderwerp|Subject):\*\*.*$/m, '') // Remove subject line if present
      .trim();
    
    const htmlContent = generatedContent
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Convert bold formatting
      .replace(/\n/g, '<br>') // Convert line breaks
      .replace(/^\*\*(?:Onderwerp|Subject):\*\*.*$<br>/m, ''); // Remove subject line if present
    
    // Create email template
    const template: EmailTemplate = {
      id: generateTemplateId(),
      subject,
      content: plainTextContent,
      formattedContent: {
        html: htmlContent,
        plainText: plainTextContent
      },
      metadata: {
        recipientCategory: recipient.category,
        objective: context.objective,
        language: recipient.language,
        wordCount,
        estimatedReadingTime,
        formalityLevel: recipient.formality,
        includedDisclaimer: context.includeMedicalDisclaimer || false
      },
      generatedAt: new Date().toISOString(),
      userId: body.userId,
      requestId: body.requestId
    };
    
    // Create response
    const response: EmailGenerationResponse = {
      success: true,
      template,
      warnings: validation.warnings.map(warning => warning.message),
      suggestions: allSuggestions,
      usage: {
        promptTokens: aiResponse.usage?.prompt_tokens || 0,
        completionTokens: aiResponse.usage?.completion_tokens || 0,
        totalTokens: aiResponse.usage?.total_tokens || 0,
        processingTime
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('SmartMail generation error:', error);
    
    // Use error handler for consistent error processing
    const errorMessage = ErrorHandlerUtils.getUserFriendlyMessage(
      error instanceof Error ? error : String(error)
    );
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      suggestions: [{
        type: 'error_recovery',
        message: 'Een onverwachte fout is opgetreden',
        severity: 'error',
        actionable: true,
        suggestedAction: 'Probeer het opnieuw of neem contact op met ondersteuning'
      }]
    } satisfies EmailGenerationResponse, { status: 500 });
  }
}

// GET handler for health check and API information
export async function GET() {
  return NextResponse.json({
    service: 'Hysio SmartMail Generation API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      generate: 'POST /api/smartmail/generate',
      health: 'GET /api/smartmail/generate'
    },
    supportedLanguages: ['nl', 'en'],
    supportedRecipients: ['colleague', 'huisarts', 'patient', 'family', 'referring_physician', 'support_staff'],
    supportedObjectives: [
      'referral', 
      'follow_up', 
      'consultation_request', 
      'patient_education', 
      'treatment_update', 
      'diagnostic_request', 
      'discharge_summary', 
      'colleague_inquiry', 
      'red_flag_notification'
    ]
  });
}