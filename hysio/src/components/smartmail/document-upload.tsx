// Document upload interface for SmartMail with enhanced drag-and-drop and validation
'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Check, AlertTriangle } from 'lucide-react';
import type { DocumentContext } from '@/lib/types/smartmail';

interface DocumentUploadProps {
  documents: DocumentContext[];
  onChange: (documents: DocumentContext[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

// Validation constants
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

// File validation result
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function DocumentUpload({
  documents,
  onChange,
  maxFiles = 3,
  maxSizeMB = 10
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate individual file
  const validateFile = useCallback((file: File): ValidationResult => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Bestandstype ${fileExtension} niet ondersteund. Gebruik PDF, DOC, DOCX of TXT.`
      };
    }

    // Check file size (convert MB to bytes)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        isValid: false,
        error: `Bestand te groot (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: ${maxSizeMB}MB.`
      };
    }

    // Check total count
    if (documents.length >= maxFiles) {
      return {
        isValid: false,
        error: `Maximum aantal bestanden bereikt (${maxFiles}). Verwijder eerst een bestand.`
      };
    }

    // Check for duplicates
    const isDuplicate = documents.some(doc => doc.filename === file.name);
    if (isDuplicate) {
      return {
        isValid: false,
        error: `Bestand "${file.name}" is al toegevoegd.`
      };
    }

    return { isValid: true };
  }, [documents, maxFiles, maxSizeMB]);

  // Process and extract file content
  const processFile = useCallback(async (file: File): Promise<DocumentContext> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;

        // For PDF files, we might need special handling (basic text extraction for now)
        let extractedContent = content;
        if (file.type === 'application/pdf') {
          // Basic PDF text extraction - in a real implementation you'd use a library like pdf-parse
          extractedContent = `[PDF Content from ${file.name}]\n\nNote: PDF content extraction is simplified. Full text extraction would require server-side processing.`;
        }

        const newDoc: DocumentContext = {
          filename: file.name,
          type: file.type,
          content: extractedContent,
          source: 'upload',
          timestamp: new Date().toISOString(),
          size: file.size
        };

        resolve(newDoc);
      };

      reader.onerror = () => reject(new Error(`Fout bij lezen van ${file.name}`));

      // Read as text for now - in production you'd handle PDFs differently
      if (file.type === 'application/pdf') {
        reader.readAsDataURL(file); // For PDFs, read as data URL for now
      } else {
        reader.readAsText(file);
      }
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    setIsProcessing(true);
    setErrors([]);

    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate all files first
    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        newErrors.push(validation.error!);
      }
    });

    // Process valid files
    try {
      const processedDocs = await Promise.all(
        validFiles.map(file => processFile(file))
      );

      onChange([...documents, ...processedDocs]);
    } catch (error) {
      newErrors.push(error instanceof Error ? error.message : 'Onbekende fout opgetreden');
    }

    setErrors(newErrors);
    setIsProcessing(false);
  }, [documents, onChange, validateFile, processFile]);

  // Remove document
  const removeDocument = useCallback((index: number) => {
    onChange(documents.filter((_, i) => i !== index));
    setErrors([]); // Clear errors when removing documents
  }, [documents, onChange]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // File input click handler
  const handleFileInputClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-dashed border-2 transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : isProcessing
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleFileInputClick : undefined}
      >
        <CardContent className="p-8 text-center">
          {isProcessing ? (
            <>
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Bestanden worden verwerkt...</p>
            </>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-gray-600 mb-2">
                Sleep bestanden hierheen of klik om te uploaden
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Ondersteund: PDF, DOC, DOCX, TXT (max {maxSizeMB}MB per bestand)
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Maximum {maxFiles} bestanden • {documents.length}/{maxFiles} gebruikt
              </p>
              <Button
                variant="outline"
                disabled={isProcessing || documents.length >= maxFiles}
              >
                Bestanden selecteren
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-2">Upload fouten</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Geüploade documenten ({documents.length})
          </h4>
          {documents.map((doc, index) => (
            <Card key={index} className="border-green-200 bg-green-50/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{doc.filename}</span>
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    </div>
                    <div className="text-xs text-gray-500 flex gap-3">
                      {doc.size && <span>{formatFileSize(doc.size)}</span>}
                      <span>{doc.type || 'Onbekend type'}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 flex-shrink-0 ml-2"
                  title="Verwijder document"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}