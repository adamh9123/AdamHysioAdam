// Dynamic imports only - no static imports that could cause SSR issues

export interface DocumentProcessingResult {
  success: boolean;
  text?: string;
  error?: string;
  filename: string;
  type: string;
}

/**
 * Extract text content from PDF files using server-side API
 */
export const extractTextFromPDF = async (file: File): Promise<DocumentProcessingResult> => {
  try {
    console.log('Processing PDF via server-side API');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/document/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing PDF via API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing PDF',
      filename: file.name,
      type: file.type
    };
  }
};

/**
 * Extract text content from Word documents using server-side API
 */
export const extractTextFromWord = async (file: File): Promise<DocumentProcessingResult> => {
  try {
    console.log('Processing Word document via server-side API');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/document/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing Word document via API:', error);
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

  console.log(`Processing document: ${file.name} (${fileType})`);

  if (fileType === 'application/pdf') {
    console.log('Processing PDF document');
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    console.log('Processing Word document');
    return extractTextFromWord(file);
  } else {
    console.warn(`Unsupported file type: ${fileType}`);
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