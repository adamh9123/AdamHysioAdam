'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Paperclip, X, Upload, FileText } from 'lucide-react';
import { processDocument, validateDocumentFile, formatDocumentTextForAI, type DocumentProcessingResult } from '@/lib/utils/document-processor';

interface DocumentUploaderProps {
  onUploadComplete: (documentContext: string, filename: string) => void;
  disabled?: boolean;
  className?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
  disabled = false,
  className = ''
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything during SSR
  if (!isClient) {
    return (
      <div className={`document-uploader ${className}`}>
        <Button
          type="button"
          variant="outline"
          disabled={true}
          className="w-full flex items-center gap-2 text-sm border-dashed"
        >
          <Paperclip className="h-4 w-4" />
          Document uploader laden...
        </Button>
      </div>
    );
  }

  const handleFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Extra client-side safety check
    if (typeof window === 'undefined' || !isClient) {
      setError('Document processing is only available in the browser');
      return;
    }

    setError(null);

    // Validate file
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Ongeldige bestand');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      const result: DocumentProcessingResult = await processDocument(file);

      if (result.success && result.text) {
        const formattedText = formatDocumentTextForAI(result.text, result.filename);
        onUploadComplete(formattedText, result.filename);
      } else {
        setError(result.error || 'Fout bij het verwerken van het document');
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Document processing error:', err);
      setError('Er is een onverwachte fout opgetreden bij het verwerken van het document');
      setSelectedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onUploadComplete('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`document-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {!selectedFile ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleFileSelect}
          disabled={disabled || isProcessing}
          className="w-full flex items-center gap-2 text-sm border-dashed"
        >
          <Paperclip className="h-4 w-4" />
          {isProcessing ? (
            <>
              <Upload className="h-4 w-4 animate-pulse" />
              Document verwerken...
            </>
          ) : (
            'Bestand selecteren'
          )}
        </Button>
      ) : (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{selectedFile.name}</span>
            {isProcessing && (
              <span className="text-blue-600 animate-pulse">(verwerken...)</span>
            )}
          </div>
          {!isProcessing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;