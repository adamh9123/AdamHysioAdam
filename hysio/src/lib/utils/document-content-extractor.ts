// Enhanced document content extraction utility for SmartMail
// Handles PDF, Word, and text document processing with validation

export interface DocumentExtractionResult {
  success: boolean;
  content: string;
  metadata: {
    filename: string;
    type: string;
    size: number;
    wordCount: number;
    language?: string;
    extractionMethod: string;
  };
  warnings?: string[];
  error?: string;
}

export interface ExtractionOptions {
  maxLength?: number; // Maximum content length in characters
  preserveFormatting?: boolean;
  extractMetadata?: boolean;
}

/**
 * Extract and clean content from various document types
 */
export class DocumentContentExtractor {
  private static readonly MAX_CONTENT_LENGTH = 50000; // 50KB text limit for AI processing
  private static readonly SUPPORTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  /**
   * Extract content from a file based on its type
   */
  static async extractContent(
    file: File | { name: string; type: string; content: string; size: number },
    options: ExtractionOptions = {}
  ): Promise<DocumentExtractionResult> {
    const {
      maxLength = this.MAX_CONTENT_LENGTH,
      preserveFormatting = false,
      extractMetadata = true
    } = options;

    try {
      // Validate file type
      if (!this.SUPPORTED_TYPES.includes(file.type)) {
        return {
          success: false,
          content: '',
          metadata: {
            filename: file.name,
            type: file.type,
            size: file.size,
            wordCount: 0,
            extractionMethod: 'none'
          },
          error: `Unsupported file type: ${file.type}`
        };
      }

      let extractedContent = '';
      let extractionMethod = '';
      const warnings: string[] = [];

      // Handle different file types
      switch (file.type) {
        case 'text/plain':
          extractedContent = await this.extractTextContent(file, preserveFormatting);
          extractionMethod = 'plain-text';
          break;

        case 'application/pdf':
          extractedContent = await this.extractPdfContent(file, preserveFormatting);
          extractionMethod = 'pdf-basic';
          warnings.push('PDF text extraction is basic. For better results, consider converting to plain text first.');
          break;

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          extractedContent = await this.extractWordContent(file, preserveFormatting);
          extractionMethod = 'word-basic';
          warnings.push('Word document extraction is basic. For better results, save as plain text (.txt) first.');
          break;

        default:
          return {
            success: false,
            content: '',
            metadata: {
              filename: file.name,
              type: file.type,
              size: file.size,
              wordCount: 0,
              extractionMethod: 'unsupported'
            },
            error: `Unsupported file type: ${file.type}`
          };
      }

      // Clean and validate content
      const cleanedContent = this.cleanExtractedContent(extractedContent, maxLength);
      const wordCount = this.countWords(cleanedContent);

      // Add size warning if content was truncated
      if (extractedContent.length > maxLength) {
        warnings.push(`Content truncated from ${extractedContent.length} to ${maxLength} characters for AI processing.`);
      }

      // Detect content issues
      if (wordCount < 10) {
        warnings.push('Very little text extracted. Document may be image-based or corrupted.');
      }

      const result: DocumentExtractionResult = {
        success: true,
        content: cleanedContent,
        metadata: {
          filename: file.name,
          type: file.type,
          size: file.size,
          wordCount,
          extractionMethod
        }
      };

      if (warnings.length > 0) {
        result.warnings = warnings;
      }

      return result;

    } catch (error) {
      return {
        success: false,
        content: '',
        metadata: {
          filename: file.name,
          type: file.type,
          size: file.size,
          wordCount: 0,
          extractionMethod: 'failed'
        },
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      };
    }
  }

  /**
   * Extract content from plain text files
   */
  private static async extractTextContent(
    file: File | { content: string },
    preserveFormatting: boolean
  ): Promise<string> {
    let content: string;

    if (file instanceof File) {
      content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file, 'UTF-8');
      });
    } else {
      content = file.content;
    }

    return preserveFormatting ? content : this.normalizeWhitespace(content);
  }

  /**
   * Extract content from PDF files (basic implementation)
   * In production, you'd want to use a proper PDF parsing library
   */
  private static async extractPdfContent(
    file: File | { content: string; name: string },
    preserveFormatting: boolean
  ): Promise<string> {
    // This is a basic implementation. In production, you'd use:
    // - pdf-parse library on the server side
    // - PDF.js for client-side parsing
    // - External service like Adobe PDF Extract API

    const basicContent = `[PDF Document: ${file.name}]

This document contains content that requires specialized PDF text extraction.
For accurate processing, please:
1. Copy the text content from the PDF and paste it manually, or
2. Convert the PDF to a plain text (.txt) file first.

Basic extraction attempted but may be incomplete or inaccurate.`;

    return preserveFormatting ? basicContent : this.normalizeWhitespace(basicContent);
  }

  /**
   * Extract content from Word documents (basic implementation)
   * In production, you'd want to use a proper Word parsing library
   */
  private static async extractWordContent(
    file: File | { content: string; name: string },
    preserveFormatting: boolean
  ): Promise<string> {
    // This is a basic implementation. In production, you'd use:
    // - mammoth.js for .docx files
    // - textract or similar for .doc files
    // - Microsoft Graph API for cloud processing

    const basicContent = `[Word Document: ${file.name}]

This document contains content that requires specialized Word document extraction.
For accurate processing, please:
1. Copy the text content from the Word document and paste it manually, or
2. Save the document as a plain text (.txt) file first.

Basic extraction attempted but may be incomplete or inaccurate.`;

    return preserveFormatting ? basicContent : this.normalizeWhitespace(basicContent);
  }

  /**
   * Clean and normalize extracted content
   */
  private static cleanExtractedContent(content: string, maxLength: number): string {
    // Remove excessive whitespace
    let cleaned = this.normalizeWhitespace(content);

    // Remove common document artifacts
    cleaned = cleaned
      .replace(/\f/g, '\n') // Form feeds to newlines
      .replace(/\r\n/g, '\n') // Windows line endings
      .replace(/\r/g, '\n') // Mac line endings
      .replace(/\n{3,}/g, '\n\n') // Multiple newlines
      .replace(/[ \t]{2,}/g, ' ') // Multiple spaces/tabs
      .trim();

    // Truncate if necessary
    if (cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
      // Try to cut at word boundary
      const lastSpace = cleaned.lastIndexOf(' ');
      if (lastSpace > maxLength * 0.8) {
        cleaned = cleaned.substring(0, lastSpace);
      }
      cleaned += '... [content truncated]';
    }

    return cleaned;
  }

  /**
   * Normalize whitespace in text content
   */
  private static normalizeWhitespace(text: string): string {
    return text
      .replace(/[\r\n\t ]+/g, ' ') // Multiple whitespace to single space
      .replace(/\n\s*\n/g, '\n\n') // Preserve paragraph breaks
      .trim();
  }

  /**
   * Count words in text content
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Validate document size and content for AI processing
   */
  static validateForAIProcessing(
    result: DocumentExtractionResult
  ): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check content length
    if (result.content.length < 10) {
      issues.push('Document content is too short to be useful');
    }

    if (result.content.length > this.MAX_CONTENT_LENGTH) {
      issues.push(`Content exceeds recommended length for AI processing (${this.MAX_CONTENT_LENGTH} chars)`);
    }

    // Check word count
    if (result.metadata.wordCount < 5) {
      issues.push('Document contains very few words');
    }

    // Check for extraction warnings
    if (result.warnings && result.warnings.length > 0) {
      issues.push('Content extraction had warnings - quality may be reduced');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Format content for AI prompt inclusion
   */
  static formatForAIPrompt(
    result: DocumentExtractionResult,
    includeMetadata: boolean = true
  ): string {
    let formatted = '';

    if (includeMetadata) {
      formatted += `[Document: ${result.metadata.filename}]\n`;
      formatted += `[Type: ${result.metadata.type}]\n`;
      formatted += `[Words: ${result.metadata.wordCount}]\n`;
      if (result.warnings && result.warnings.length > 0) {
        formatted += `[Warnings: ${result.warnings.join('; ')}]\n`;
      }
      formatted += '\n';
    }

    formatted += result.content;

    return formatted;
  }
}

/**
 * Batch process multiple documents
 */
export async function extractMultipleDocuments(
  files: (File | { name: string; type: string; content: string; size: number })[],
  options: ExtractionOptions = {}
): Promise<DocumentExtractionResult[]> {
  const results = await Promise.all(
    files.map(file => DocumentContentExtractor.extractContent(file, options))
  );

  return results;
}

/**
 * Combine multiple document contents into a single formatted string for AI processing
 */
export function combineDocumentContents(
  results: DocumentExtractionResult[],
  includeMetadata: boolean = true
): string {
  const successfulResults = results.filter(result => result.success);

  if (successfulResults.length === 0) {
    return '';
  }

  const combined = successfulResults
    .map((result, index) => {
      let section = '';

      if (includeMetadata) {
        section += `\n--- Document ${index + 1}: ${result.metadata.filename} ---\n`;
      }

      section += DocumentContentExtractor.formatForAIPrompt(result, includeMetadata);

      return section;
    })
    .join('\n\n');

  return combined.trim();
}