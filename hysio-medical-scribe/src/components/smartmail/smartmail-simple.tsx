'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { DocumentUploader } from '@/components/ui/document-uploader';
import { Mail, Sparkles, User, Users, UserCheck, FileText } from 'lucide-react';
import { SimpleEmailRequest, SimpleEmailResponse } from '@/lib/types/smartmail-simple';

interface SmartMailSimpleProps {
  patientInfo?: {
    initials: string;
    age: number;
    chiefComplaint: string;
  };
  onClose?: () => void;
}

export const SmartMailSimple: React.FC<SmartMailSimpleProps> = ({
  patientInfo,
  onClose
}) => {
  // Simple state - no complex state management
  const [recipientType, setRecipientType] = useState<'patient' | 'colleague' | 'huisarts'>('patient');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState<'professional' | 'friendly'>('professional');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Document context state for Ultra Think AI enhancement
  const [documentContext, setDocumentContext] = useState('');
  const [documentFilename, setDocumentFilename] = useState('');

  // Recipient options - simplified to 3 essential types
  const recipientOptions = [
    { value: 'patient' as const, label: 'Patiënt', icon: User },
    { value: 'colleague' as const, label: 'Collega', icon: Users },
    { value: 'huisarts' as const, label: 'Huisarts', icon: UserCheck }
  ];

  // Handle document upload for Ultra Think AI context enhancement
  const handleDocumentUpload = (documentText: string, filename: string) => {
    setDocumentContext(documentText);
    setDocumentFilename(filename);
  };

  // Generate email - single API call
  const handleGenerateEmail = async () => {
    if (!context.trim()) {
      alert('Vul een context in voor de email');
      return;
    }

    setIsGenerating(true);

    try {
      const request: SimpleEmailRequest = {
        recipientType,
        subject: subject || 'Update over behandeling',
        context,
        patientInfo,
        tone,
        // Ultra Think Enhancement: Include document context for AI
        documentContext: documentContext || undefined
      };

      const response = await fetch('/api/smartmail/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const result: SimpleEmailResponse = await response.json();

      if (result.success && result.email) {
        setGeneratedEmail(result.email);
      } else {
        throw new Error(result.error || 'Email generatie mislukt');
      }
    } catch (error) {
      console.error('SmartMail Error:', error);
      alert('Er ging iets mis bij het genereren van de email. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset form including document context
  const handleReset = () => {
    setGeneratedEmail('');
    setContext('');
    setSubject('');
    setDocumentContext('');
    setDocumentFilename('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-hysio-deep-green mb-2 flex items-center justify-center gap-2">
          <Mail className="h-8 w-8" />
          SmartMail
        </h1>
        <p className="text-hysio-deep-green-900/70">
          Genereer professionele emails in seconden
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Email Genereren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Type */}
            <div>
              <Label className="text-sm font-medium text-hysio-deep-green mb-3 block">
                Voor wie is deze email?
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {recipientOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setRecipientType(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        recipientType === option.value
                          ? 'border-hysio-mint bg-hysio-mint/10'
                          : 'border-gray-200 hover:border-hysio-mint/50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-hysio-deep-green">
                Onderwerp (optioneel)
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Update over behandeling"
                className="mt-1"
              />
            </div>

            {/* Context */}
            <div>
              <Label htmlFor="context" className="text-sm font-medium text-green-800">
                Wat wil je communiceren? *
              </Label>
              <Textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Bijvoorbeeld: Behandeling gaat goed, nog 2 sessies nodig. Oefeningen thuis doen."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Ultra Think Document Upload */}
            <div>
              <Label className="text-sm font-medium text-green-800 block mb-3">
                Context Document (optioneel) - Ultra Think AI
              </Label>
              <DocumentUploader
                onUploadComplete={handleDocumentUpload}
                disabled={isGenerating}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Upload verwijsbrieven, vorige verslagen of andere relevante documenten voor context-bewuste AI
              </p>
              {documentContext && documentFilename && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-md p-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>✓ Document &apos;{documentFilename}&apos; geladen - AI heeft nu extra context!</span>
                </div>
              )}
            </div>

            {/* Tone */}
            <div>
              <Label className="text-sm font-medium text-hysio-deep-green mb-2 block">
                Toon
              </Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTone('professional')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    tone === 'professional'
                      ? 'bg-hysio-mint text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Professioneel
                </button>
                <button
                  onClick={() => setTone('friendly')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    tone === 'friendly'
                      ? 'bg-hysio-mint text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Vriendelijk
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateEmail}
              disabled={isGenerating || !context.trim()}
              className="w-full bg-hysio-mint hover:bg-hysio-mint/90"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Email genereren...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Genereer Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right: Generated Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Gegenereerde Email
              </span>
              {generatedEmail && (
                <div className="flex gap-2">
                  <CopyToClipboard text={generatedEmail} size="sm" />
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Nieuw
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedEmail ? (
              <div className="bg-white border rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                  {generatedEmail}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Vul de gegevens in en klik op "Genereer Email"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Patient Info Display */}
      {patientInfo && (
        <Card className="bg-hysio-cream/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 text-sm text-hysio-deep-green-900">
              <User className="h-4 w-4" />
              <span>
                Patiënt: {patientInfo.initials} ({patientInfo.age} jaar) - {patientInfo.chiefComplaint}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close Button */}
      {onClose && (
        <div className="text-center">
          <Button variant="ghost" onClick={onClose}>
            Sluiten
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartMailSimple;