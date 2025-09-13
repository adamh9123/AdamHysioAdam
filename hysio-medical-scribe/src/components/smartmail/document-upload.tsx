// Document upload interface for SmartMail
'use client';

import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, Check } from 'lucide-react';
import type { DocumentContext } from '@/lib/types/smartmail';

interface DocumentUploadProps {
  documents: DocumentContext[];
  onChange: (documents: DocumentContext[]) => void;
}

export function DocumentUpload({ documents, onChange }: DocumentUploadProps) {
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDoc: DocumentContext = {
          filename: file.name,
          source: 'upload',
          content: e.target?.result as string,
          extractedAt: new Date().toISOString()
        };
        onChange([...documents, newDoc]);
      };
      reader.readAsText(file);
    });
  }, [documents, onChange]);

  const removeDocument = useCallback((index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  }, [documents, onChange]);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Sleep bestanden hierheen of klik om te uploaden</p>
          <Button
            variant="outline"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.txt';
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
              input.click();
            }}
          >
            Bestanden selecteren
          </Button>
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <Card key={index}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{doc.filename}</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
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