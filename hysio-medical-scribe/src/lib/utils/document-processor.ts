// Dynamic imports only - no static imports that could cause SSR issues

export interface DocumentProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  filename: string;
  type: string;
}

/**
 * Extract text content from PDF files
 */
export const extractTextFromPDF = async (file: File): Promise<DocumentProcessingResult> => {
  // CRITICAL: Multiple checks to prevent SSR execution
  if (typeof window === 'undefined' || typeof document === 'undefined' || !globalThis.window) {
    return {
      success: false,
      error: 'PDF processing is only available on the client side',
      filename: file.name,
      type: file.type
    };
  }

  try {
    // Additional client-side verification before import
    if (!window?.location || !document?.createElement) {
      throw new Error('Client-side environment not properly initialized');
    }

    // Dynamically import pdfjs-dist only on the client side
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure PDF.js worker
    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str: string }) => item.str)
        .join(' ')
        .trim();
      
      if (pageText) {
        fullText += `${pageText}\n\n`;
      }
    }
    
    return {
      success: true,
      text: fullText.trim(),
      filename: file.name,
      type: file.type
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing PDF',
      filename: file.name,
      type: file.type
    };
  }
};

/**
 * Extract text content from Word documents
 */
export const extractTextFromWord = async (file: File): Promise<DocumentProcessingResult> => {
  // CRITICAL: Multiple checks to prevent SSR execution
  if (typeof window === 'undefined' || typeof document === 'undefined' || !globalThis.window) {
    return {
      success: false,
      error: 'Word document processing is only available on the client side',
      filename: file.name,
      type: file.type
    };
  }

  try {
    // Additional client-side verification before import
    if (!window?.location || !document?.createElement) {
      throw new Error('Client-side environment not properly initialized');
    }

    // Dynamically import mammoth only on the client side
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      success: true,
      text: result.value.trim(),
      filename: file.name,
      type: file.type
    };
  } catch (error) {
    console.error('Error extracting text from Word document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing Word document',
      filename: file.name,
      type: file.type
    };
  }
};

/**
 * Process document based on file type
 */
export const processDocument = async (file: File): Promise<DocumentProcessingResult> => {
  const fileType = file.type.toLowerCase();
  
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    return extractTextFromWord(file);
  } else {
    return {
      success: false,
      error: 'Unsupported file type. Only PDF and Word documents are supported.',
      filename: file.name,
      type: file.type
    };
  }
};

/**
 * Validate document file
 */
export const validateDocumentFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Bestand is te groot. Maximum grootte is 10MB.'
    };
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Alleen PDF en Word bestanden zijn toegestaan.'
    };
  }
  
  return { valid: true };
};

/**
 * Format extracted text for AI processing
 */
export const formatDocumentTextForAI = (
  text: string, 
  filename: string, 
  maxLength: number = 4000
): string => {
  // Clean up the text
  let cleanText = text
    .replace(/\s+/g, ' ')  // Replace multiple whitespaces with single space
    .replace(/\n{3,}/g, '\n\n')  // Replace multiple newlines with double newline
    .trim();
  
  // Truncate if too long
  if (cleanText.length > maxLength) {
    cleanText = cleanText.substring(0, maxLength) + '... [document ingekort]';
  }
  
  return `**Context document: ${filename}**\n\n${cleanText}`;
};