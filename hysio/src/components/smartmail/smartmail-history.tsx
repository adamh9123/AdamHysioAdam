// SmartMail history component for viewing and reusing past generations
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, Copy, Eye, Star } from 'lucide-react';
import type { EmailTemplate } from '@/lib/types/smartmail';

interface SmartMailHistoryProps {
  onSelectTemplate?: (template: EmailTemplate) => void;
}

export function SmartMailHistory({ onSelectTemplate }: SmartMailHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data - would come from API
  const mockHistory: EmailTemplate[] = [
    {
      id: 'tpl_1',
      subject: 'Diabetes educatie informatie',
      content: 'Beste patiënt, hierbij de informatie over diabetes...',
      formattedContent: { html: '', plainText: '' },
      metadata: {
        recipientCategory: 'patient',
        objective: 'patient_education',
        language: 'nl',
        wordCount: 150,
        estimatedReadingTime: 1,
        formalityLevel: 'empathetic',
        includedDisclaimer: false
      },
      generatedAt: '2024-01-15T10:30:00Z',
      userId: 'user1',
      requestId: 'req1'
    }
  ];

  const categories = [
    { value: 'all', label: 'Alle' },
    { value: 'patient', label: 'Patiënt' },
    { value: 'specialist', label: 'Specialist' },
    { value: 'colleague', label: 'Collega' }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Zoeken in geschiedenis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          {categories.map(cat => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {mockHistory.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.subject}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {template.metadata.recipientCategory}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(template.generatedAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {template.metadata.estimatedReadingTime} min
                  </span>
                  <span>{template.metadata.wordCount} woorden</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onSelectTemplate?.(template)}
                  >
                    Hergebruiken
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}