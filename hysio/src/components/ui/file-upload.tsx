'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  disabled?: boolean;
  className?: string;
  multiple?: boolean;
}

export function FileUpload({
  onFileUpload,
  acceptedTypes = ['audio/*'],
  maxSize = 10,
  disabled = false,
  className = '',
  multiple = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `Bestand is te groot. Maximum grootte is ${maxSize}MB.`;
    }

    // Check file type
    if (acceptedTypes.length > 0) {
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.replace('/*', '');
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        return `Bestandstype wordt niet ondersteund. Toegestane types: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploadedFile(file);
    onFileUpload(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
      />

      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive
              ? 'border-hysio-mint bg-hysio-mint/10'
              : disabled
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-hysio-mint/50 hover:border-hysio-mint hover:bg-hysio-mint/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4">
            <Upload
              size={48}
              className={`mb-4 ${
                disabled ? 'text-gray-400' : 'text-hysio-deep-green'
              }`}
            />
            <p className={`text-center mb-2 ${
              disabled ? 'text-gray-400' : 'text-hysio-deep-green-900'
            }`}>
              <span className="font-medium">
                Klik om een bestand te selecteren
              </span>
              {!disabled && (
                <span className="text-hysio-deep-green-900/70">
                  {' '}of sleep het hier naartoe
                </span>
              )}
            </p>
            <p className="text-sm text-hysio-deep-green-900/60">
              {acceptedTypes.includes('audio/*') && 'Audio bestanden'}
              {acceptedTypes.includes('video/*') && 'Video bestanden'}
              {acceptedTypes.includes('image/*') && 'Afbeeldingen'}
              {' '}tot {maxSize}MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="flex items-center justify-between py-4 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <File size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-green-600">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
            >
              <X size={16} />
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}