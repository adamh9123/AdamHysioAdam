// SmartMail document integration - extends existing document-processor.ts with healthcare-specific formatting
// Specialized document processing for email generation context

import type {
  DocumentContext,
  CommunicationObjective,
  RecipientCategory,
  SupportedLanguage
} from '@/lib/types/smartmail';
import type { DocumentProcessingResult } from '@/lib/utils/document-processor';

// SmartMail-specific document processing result
export interface SmartMailDocumentResult extends DocumentProcessingResult {
  formattedForEmail: string;
  keyFindings: string[];
  relevantSections: DocumentSection[];
  privacyWarnings: string[];
}

// Document section structure for organized content
export interface DocumentSection {
  title: string;
  content: string;
  relevance: 'high' | 'medium' | 'low';
  type: 'diagnosis' | 'findings' | 'treatment' | 'recommendations' | 'history' | 'other';
}

// Processing options for different email contexts
export interface SmartMailProcessingOptions {
  objective: CommunicationObjective;
  recipientCategory: RecipientCategory;
  language: SupportedLanguage;
  maxContentLength?: number;
  includePrivacyWarnings?: boolean;
  extractKeyFindings?: boolean;
  formatForRecipient?: boolean;
}

/**
 * Process document for SmartMail email integration
 */
export async function processDocumentForSmartMail(
  file: File,
  options: SmartMailProcessingOptions
): Promise<SmartMailDocumentResult> {
  try {
    // Use existing document processor for basic text extraction
    const { processDocument, validateDocumentFile } = await import('@/lib/utils/document-processor');
    
    // Validate document first
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        filename: file.name,
        type: file.type,
        formattedForEmail: '',
        keyFindings: [],
        relevantSections: [],
        privacyWarnings: []
      };
    }
    
    // Process document to extract raw text
    const basicResult = await processDocument(file);
    if (!basicResult.success || !basicResult.text) {
      return {
        success: false,
        error: basicResult.error,
        filename: file.name,
        type: file.type,
        formattedForEmail: '',
        keyFindings: [],
        relevantSections: [],
        privacyWarnings: []
      };
    }
    
    // Apply SmartMail-specific processing
    const sections = extractDocumentSections(basicResult.text, options);
    const keyFindings = extractKeyFindings(basicResult.text, options);
    const formattedContent = formatDocumentForEmail(basicResult.text, sections, options);
    const privacyWarnings = detectPrivacyIssues(basicResult.text, options);
    
    return {
      success: true,
      text: basicResult.text,
      filename: file.name,
      type: file.type,
      formattedForEmail: formattedContent,
      keyFindings,
      relevantSections: sections,
      privacyWarnings
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing document for SmartMail',
      filename: file.name,
      type: file.type,
      formattedForEmail: '',
      keyFindings: [],
      relevantSections: [],
      privacyWarnings: []
    };
  }
}

/**
 * Extract structured sections from document text
 */
function extractDocumentSections(
  text: string, 
  options: SmartMailProcessingOptions
): DocumentSection[] {
  const sections: DocumentSection[] = [];
  
  // Common medical document section patterns (Dutch and English)
  const sectionPatterns = {
    diagnosis: [
      /(?:diagnos[ei]s?|conclusie|diagnosis|conclusion):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis,
      /(?:primary|primaire)\s+diagnos[ei]s?:\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis
    ],
    findings: [
      /(?:bevindingen|findings|onderzoek|examination):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis,
      /(?:clinical|klinische)\s+(?:findings|bevindingen):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis
    ],
    treatment: [
      /(?:behandeling|treatment|therapie|therapy):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis,
      /(?:treatment plan|behandelplan):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis
    ],
    recommendations: [
      /(?:aanbevelingen|recommendations|advies|advice):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis,
      /(?:follow.?up|vervolg):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis
    ],
    history: [
      /(?:anamnese|history|achtergrond|background):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis,
      /(?:medical history|medische geschiedenis):\s*(.+?)(?=\n\n|\n[A-Z]|$)/gis
    ]
  };
  
  // Extract sections based on patterns
  Object.entries(sectionPatterns).forEach(([sectionType, patterns]) => {
    patterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].trim().length > 10) {
          const content = cleanDocumentContent(match[1].trim());
          const relevance = determineRelevance(content, options);
          
          sections.push({
            title: capitalizeFirst(sectionType),
            content,
            relevance,
            type: sectionType as DocumentSection['type']
          });
        }
      });
    });
  });
  
  // If no structured sections found, create general content section
  if (sections.length === 0) {
    const cleanedText = cleanDocumentContent(text);
    sections.push({
      title: options.language === 'nl' ? 'Documentinhoud' : 'Document Content',
      content: cleanedText,
      relevance: 'medium',
      type: 'other'
    });
  }
  
  // Sort by relevance and limit if needed
  sections.sort((a, b) => {
    const relevanceOrder = { high: 3, medium: 2, low: 1 };
    return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
  });
  
  return sections.slice(0, 5); // Limit to 5 most relevant sections
}

/**
 * Extract key findings relevant to the email objective
 */
function extractKeyFindings(
  text: string, 
  options: SmartMailProcessingOptions
): string[] {
  const findings: string[] = [];
  
  // Key finding patterns based on email objective
  const findingPatterns = {
    referral: [
      /(?:red flags?|rode vlag|warning signs|alarmsignalen).*?(?:\.|$)/gi,
      /(?:significant|belangrijk|notable|opvallend).*?(?:\.|$)/gi,
      /(?:requires?|vereist|needs?|nodig).*?(?:attention|aandacht|referral|verwijzing)/gi
    ],
    patient_education: [
      /(?:patient should|patiënt moet|important to|belangrijk om).*?(?:\.|$)/gi,
      /(?:avoid|vermijd|prevent|voorkom).*?(?:\.|$)/gi,
      /(?:exercise|oefening|activity|activiteit).*?(?:\.|$)/gi
    ],
    follow_up: [
      /(?:improvement|verbetering|progress|voortgang).*?(?:\.|$)/gi,
      /(?:concerns?|zorgen|issues?|problemen).*?(?:\.|$)/gi,
      /(?:next|volgende|continue|verdergaan).*?(?:\.|$)/gi
    ]
  };
  
  const objectivePatterns = findingPatterns[options.objective as keyof typeof findingPatterns];
  if (objectivePatterns) {
    objectivePatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[0] && match[0].length > 15 && match[0].length < 200) {
          findings.push(cleanDocumentContent(match[0].trim()));
        }
      });
    });
  }
  
  // Generic important findings if objective-specific ones not found
  if (findings.length === 0) {
    const genericPatterns = [
      /(?:conclusion|conclusie|summary|samenvatting).*?(?:\.|$)/gi,
      /(?:result|resultaat|outcome|uitkomst).*?(?:\.|$)/gi
    ];
    
    genericPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        if (match[0] && match[0].length > 15 && match[0].length < 200) {
          findings.push(cleanDocumentContent(match[0].trim()));
        }
      });
    });
  }
  
  return findings.slice(0, 3); // Limit to 3 key findings
}

/**
 * Format document content for email integration
 */
function formatDocumentForEmail(
  originalText: string,
  sections: DocumentSection[],
  options: SmartMailProcessingOptions
): string {
  const maxLength = options.maxContentLength || 1500;
  let formattedContent = '';
  
  if (!options.formatForRecipient) {
    // Simple truncation if no specific formatting requested
    return originalText.length > maxLength 
      ? originalText.substring(0, maxLength) + '...'
      : originalText;
  }
  
  // Format based on recipient type
  switch (options.recipientCategory) {
    case 'specialist':
      formattedContent = formatForSpecialist(sections, options);
      break;
    case 'colleague':
      formattedContent = formatForColleague(sections, options);
      break;
    case 'patient':
      formattedContent = formatForPatient(sections, options);
      break;
    case 'family':
      formattedContent = formatForFamily(sections, options);
      break;
    default:
      formattedContent = formatGeneric(sections, options);
  }
  
  // Ensure content doesn't exceed max length
  if (formattedContent.length > maxLength) {
    const truncatePoint = formattedContent.lastIndexOf('.', maxLength - 3);
    formattedContent = truncatePoint > maxLength * 0.8 
      ? formattedContent.substring(0, truncatePoint + 1)
      : formattedContent.substring(0, maxLength - 3) + '...';
  }
  
  return formattedContent;
}

/**
 * Format document content for specialist recipients
 */
function formatForSpecialist(
  sections: DocumentSection[], 
  options: SmartMailProcessingOptions
): string {
  const relevantSections = sections.filter(s => 
    ['diagnosis', 'findings', 'treatment'].includes(s.type) || s.relevance === 'high'
  );
  
  let formatted = options.language === 'nl' 
    ? '**Relevante bevindingen uit bijgevoegd document:**\n\n'
    : '**Relevant findings from attached document:**\n\n';
  
  relevantSections.forEach(section => {
    formatted += `**${section.title}:**\n${section.content}\n\n`;
  });
  
  return formatted.trim();
}

/**
 * Format document content for colleague recipients
 */
function formatForColleague(
  sections: DocumentSection[], 
  options: SmartMailProcessingOptions
): string {
  let formatted = options.language === 'nl'
    ? '**Context uit document:**\n\n'
    : '**Context from document:**\n\n';
  
  // Include all relevant sections with focus on clinical reasoning
  sections.forEach(section => {
    if (section.relevance !== 'low') {
      formatted += `**${section.title}:**\n${section.content}\n\n`;
    }
  });
  
  return formatted.trim();
}

/**
 * Format document content for patient recipients
 */
function formatForPatient(
  sections: DocumentSection[], 
  options: SmartMailProcessingOptions
): string {
  // Focus on treatment, recommendations, and simplified explanations
  const patientRelevant = sections.filter(s => 
    ['treatment', 'recommendations'].includes(s.type)
  );
  
  let formatted = options.language === 'nl'
    ? '**Informatie uit uw medisch dossier:**\n\n'
    : '**Information from your medical record:**\n\n';
  
  patientRelevant.forEach(section => {
    // Simplify medical terminology for patients
    const simplifiedContent = simplifyMedicalTerms(section.content, options.language);
    formatted += `**${section.title}:**\n${simplifiedContent}\n\n`;
  });
  
  return formatted.trim();
}

/**
 * Format document content for family recipients
 */
function formatForFamily(
  sections: DocumentSection[], 
  options: SmartMailProcessingOptions
): string {
  // Similar to patient format but with context for caregiver role
  return formatForPatient(sections, options).replace(
    options.language === 'nl' ? 'uw medisch dossier' : 'your medical record',
    options.language === 'nl' ? 'het medisch dossier' : 'the medical record'
  );
}

/**
 * Generic formatting for other recipients
 */
function formatGeneric(
  sections: DocumentSection[], 
  options: SmartMailProcessingOptions
): string {
  let formatted = options.language === 'nl'
    ? '**Documentinhoud:**\n\n'
    : '**Document content:**\n\n';
  
  sections.slice(0, 3).forEach(section => {
    formatted += `**${section.title}:**\n${section.content}\n\n`;
  });
  
  return formatted.trim();
}

/**
 * Determine relevance of content section based on email context
 */
function determineRelevance(
  content: string, 
  options: SmartMailProcessingOptions
): 'high' | 'medium' | 'low' {
  const objectiveKeywords = {
    referral: ['diagnosis', 'findings', 'symptoms', 'examination', 'diagnose', 'bevindingen', 'symptomen', 'onderzoek'],
    patient_education: ['treatment', 'exercise', 'advice', 'instructions', 'behandeling', 'oefening', 'advies', 'instructies'],
    follow_up: ['progress', 'improvement', 'concerns', 'next', 'voortgang', 'verbetering', 'zorgen', 'volgende']
  };
  
  const keywords = objectiveKeywords[options.objective as keyof typeof objectiveKeywords] || [];
  const contentLower = content.toLowerCase();
  
  const keywordCount = keywords.reduce((count, keyword) => {
    return count + (contentLower.includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);
  
  if (keywordCount >= 3) return 'high';
  if (keywordCount >= 1) return 'medium';
  return 'low';
}

/**
 * Detect potential privacy issues in document content
 */
function detectPrivacyIssues(
  text: string, 
  options: SmartMailProcessingOptions
): string[] {
  const warnings: string[] = [];
  const textLower = text.toLowerCase();
  
  // Check for potential PHI patterns
  const phiPatterns = [
    { pattern: /\b\d{9}\b/g, warning: 'BSN-like number detected' },
    { pattern: /\b\d{4}\s*[A-Z]{2}\b/g, warning: 'Postal code detected' },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, warning: 'Email address detected' },
    { pattern: /\b0\d{1,2}[-\s]?\d{7,8}\b/g, warning: 'Phone number detected' }
  ];
  
  phiPatterns.forEach(({ pattern, warning }) => {
    if (pattern.test(text)) {
      warnings.push(warning);
    }
  });
  
  // Check for names (basic detection)
  const commonNames = ['jan', 'peter', 'maria', 'anna', 'john', 'mary', 'david'];
  commonNames.forEach(name => {
    if (textLower.includes(name)) {
      warnings.push(`Potential name detected: ${name}`);
    }
  });
  
  return warnings;
}

/**
 * Clean and normalize document content
 */
function cleanDocumentContent(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .replace(/[^\w\s\n.,;:!?()-]/g, '') // Remove unusual characters
    .trim();
}

/**
 * Simplify medical terminology for patient communication
 */
function simplifyMedicalTerms(text: string, language: SupportedLanguage): string {
  const termReplacements = {
    nl: {
      'myalgie': 'spierpijn',
      'arthralgie': 'gewrichtspijn',
      'inflammatie': 'ontsteking',
      'contractuur': 'spierverkorting',
      'mobilisatie': 'beweging maken',
      'stabilisatie': 'stabiliteit verbeteren'
    },
    en: {
      'myalgia': 'muscle pain',
      'arthralgia': 'joint pain',
      'inflammation': 'swelling',
      'contracture': 'muscle tightness',
      'mobilization': 'movement therapy',
      'stabilization': 'stability improvement'
    }
  };
  
  const replacements = termReplacements[language];
  let simplifiedText = text;
  
  Object.entries(replacements).forEach(([medical, simple]) => {
    const regex = new RegExp(`\\b${medical}\\b`, 'gi');
    simplifiedText = simplifiedText.replace(regex, simple);
  });
  
  return simplifiedText;
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Create DocumentContext from processed SmartMail document
 */
export function createDocumentContext(
  result: SmartMailDocumentResult,
  source: 'upload' | 'scribe_session' | 'manual_input' = 'upload'
): DocumentContext {
  return {
    filename: result.filename,
    type: result.type,
    content: result.formattedForEmail || result.text || '',
    source,
    timestamp: new Date().toISOString(),
    size: result.text?.length || 0
  };
}

/**
 * Batch process multiple documents for SmartMail
 */
export async function processMultipleDocuments(
  files: File[],
  options: SmartMailProcessingOptions
): Promise<SmartMailDocumentResult[]> {
  const results = await Promise.all(
    files.map(file => processDocumentForSmartMail(file, options))
  );
  
  return results;
}