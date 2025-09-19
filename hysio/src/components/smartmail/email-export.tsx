// Email export functionality component supporting multiple formats
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Mail, Code, Copy, Check } from 'lucide-react';
import type { EmailTemplate } from '@/lib/types/smartmail';

interface EmailExportProps {
  template: EmailTemplate;
  onExport?: (format: string, content: string) => void;
}

export function EmailExport({ template, onExport }: EmailExportProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const exportFormats = [
    {
      id: 'plain',
      name: 'Platte tekst',
      description: 'Eenvoudige tekstversie',
      icon: FileText,
      content: template.content
    },
    {
      id: 'html',
      name: 'HTML',
      description: 'Opgemaakt voor web/email',
      icon: Code,
      content: template.formattedContent.html
    },
    {
      id: 'email',
      name: 'Email format',
      description: 'Klaar voor verzending',
      icon: Mail,
      content: `Onderwerp: ${template.subject}\n\n${template.content}`
    }
  ];

  const handleCopy = async (format: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = (format: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.subject.replace(/[^a-z0-9]/gi, '_')}_${format}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExport?.(format, content);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Export opties</h3>
        <p className="text-sm text-gray-600">
          Kies het gewenste formaat voor het exporteren van uw email
        </p>
      </div>

      <div className="grid gap-4">
        {exportFormats.map((format) => {
          const Icon = format.icon;
          const isCopied = copiedFormat === format.id;
          
          return (
            <Card key={format.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-base">{format.name}</CardTitle>
                      <p className="text-sm text-gray-600">{format.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {format.content.length} tekens
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-md mb-4 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {format.content.length > 200 
                      ? `${format.content.substring(0, 200)}...` 
                      : format.content
                    }
                  </pre>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(format.id, format.content)}
                    className="flex-1"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Gekopieerd
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Kopiëren
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(format.id, format.content)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Template Metadata */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Email informatie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Ontvanger:</span>
              <span className="ml-2 capitalize">{template.metadata.recipientCategory}</span>
            </div>
            <div>
              <span className="font-medium">Doel:</span>
              <span className="ml-2">{template.metadata.objective}</span>
            </div>
            <div>
              <span className="font-medium">Taal:</span>
              <span className="ml-2 uppercase">{template.metadata.language}</span>
            </div>
            <div>
              <span className="font-medium">Formaliteit:</span>
              <span className="ml-2 capitalize">{template.metadata.formalityLevel}</span>
            </div>
            <div>
              <span className="font-medium">Woorden:</span>
              <span className="ml-2">{template.metadata.wordCount}</span>
            </div>
            <div>
              <span className="font-medium">Leestijd:</span>
              <span className="ml-2">{template.metadata.estimatedReadingTime} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}