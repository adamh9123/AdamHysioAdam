'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentUploader } from '@/components/ui/document-uploader';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import { Mail, User, Users, UserCheck, FileText, Mic, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function SmartMailSimplePage() {
  const [recipientType, setRecipientType] = useState<'patient' | 'colleague' | 'huisarts'>('patient');
  const [subject, setSubject] = useState('');
  const [context, setContext] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Ultra Think Document Context State
  const [documentContext, setDocumentContext] = useState('');
  const [documentFilename, setDocumentFilename] = useState('');

  const recipientOptions = [
    { value: 'patient' as const, label: 'Patiënt', icon: User },
    { value: 'colleague' as const, label: 'Collega', icon: Users },
    { value: 'huisarts' as const, label: 'Huisarts', icon: UserCheck }
  ];

  // Ultra Think Document Upload Handler
  const handleDocumentUpload = (documentText: string, filename: string) => {
    setDocumentContext(documentText);
    setDocumentFilename(filename);
  };

  const handleGenerateEmail = async () => {
    if (!context.trim()) {
      alert('Vul een context in voor de email');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/smartmail/simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientType,
          subject: subject || 'Update over behandeling',
          context,
          tone: 'professional',
          // Ultra Think Enhancement: Include document context
          documentContext: documentContext || undefined
        })
      });

      const result = await response.json();

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

  const handleReset = () => {
    setGeneratedEmail('');
    setContext('');
    setSubject('');
    setDocumentContext('');
    setDocumentFilename('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Email gekopieerd naar klembord!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Dashboard Navigation */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-hysio-deep-green hover:bg-hysio-mint/10">
                  <ArrowLeft size={16} />
                  Terug naar Dashboard
                </Button>
              </Link>
              <div className="text-2xl font-bold text-green-800 flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Hysio SmartMail
              </div>
            </div>

            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <Home size={16} />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2 flex items-center justify-center gap-2">
            <Mail className="h-8 w-8" />
            Hysio SmartMail - Ultra Simple
          </h1>
        <p className="text-gray-600">
          Genereer professionele emails in seconden - Nu met fallback ondersteuning!
        </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Genereren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient Type */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
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
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
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
              <Label htmlFor="subject" className="text-sm font-medium">
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
              <Label htmlFor="context" className="text-sm font-medium">
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

              {/* Voice Dictation */}
              <div className="mt-2">
                <AudioRecorder
                  onTranscriptionComplete={(transcription) => {
                    if (transcription.text) {
                      setContext(prev => prev ? `${prev} ${transcription.text}` : transcription.text);
                    }
                  }}
                  autoTranscribe={true}
                  className="w-full"
                />
              </div>
            </div>

            {/* Ultra Think Document Upload */}
            <div>
              <Label className="text-sm font-medium block mb-3">
                Upload Bestand
              </Label>
              <DocumentUploader
                onUploadComplete={handleDocumentUpload}
                disabled={isGenerating}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">
                Voeg een bestand toe voor extra context
              </p>
              {documentContext && documentFilename && (
                <div className="mt-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-md p-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>✓ Bestand &apos;{documentFilename}&apos; toegevoegd</span>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateEmail}
              disabled={isGenerating || !context.trim()}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Email genereren...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
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
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    Kopiëren
                  </Button>
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
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                  {generatedEmail}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Vul de gegevens in en klik op &quot;Genereer Email&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="mt-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            ✨ <strong>Ultra Simple SmartMail</strong> - Van 27 bestanden naar 5 bestanden.
            Van complex naar simpel. Van traag naar sub-second response!
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}