'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyToClipboard } from '@/components/ui/copy-to-clipboard';
import { DocumentUpload } from '@/components/smartmail/document-upload';
import { AudioRecorder } from '@/components/ui/audio-recorder';
import type { DocumentContext } from '@/lib/types/smartmail';
import {
  Mail,
  Sparkles,
  User,
  Users,
  UserCheck,
  FileText,
  ArrowLeft,
  Home,
  Save,
  History,
  Eye,
  Edit,
  Settings,
  Sliders,
  Type,
  Globe,
  Clock,
  MessageSquare,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  ChevronDown,
  Volume2,
  Upload
} from 'lucide-react';
import { useSessionState } from '@/hooks/useSessionState';

// Enhanced types for SmartMail V2
interface EmailSettings {
  contentLength: 'short' | 'medium' | 'extended';
  toneOfVoice: 'neutral' | 'formal' | 'informal' | 'direct' | 'scientific';
  greeting: 'geachte' | 'beste' | 'hallo';
  closing: 'vriendelijk' | 'collegiaal' | 'hoogachtend';
  autoSubject: boolean;
  language: 'nl' | 'en' | 'ar' | 'fr' | 'de' | 'es' | 'zh' | 'hi';
  recipientType: 'general' | 'patient' | 'colleague' | 'huisarts';
}

interface EmailHistory {
  id: string;
  timestamp: string;
  recipientType: 'general' | 'patient' | 'colleague' | 'huisarts';
  settings: EmailSettings;
  subject: string;
  content: string;
  context: string;
  exported: boolean;
}

export default function SmartMailPage() {
  // Core email generation state
  const [context, setContext] = useState('');
  const [subject, setSubject] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Enhanced settings state
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    contentLength: 'medium',
    toneOfVoice: 'neutral',
    greeting: 'beste',
    closing: 'vriendelijk',
    autoSubject: true,
    language: 'nl',
    recipientType: 'general'
  });

  // Document and history state
  const [documents, setDocuments] = useState<DocumentContext[]>([]);
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableEmail, setEditableEmail] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Session integration
  const { sessionData } = useSessionState();

  // Content length options
  const contentLengthOptions = [
    { value: 'short' as const, label: 'Kort', description: 'ca. 100 woorden', words: '~100' },
    { value: 'medium' as const, label: 'Gemiddeld', description: 'ca. 300 woorden', words: '~300' },
    { value: 'extended' as const, label: 'Uitgebreid', description: '500+ woorden', words: '500+' }
  ];

  // Tone of voice options with API-compatible configuration
  const toneOptions = [
    {
      value: 'neutral' as const,
      label: 'Standaard - Neutraal',
      description: 'Neutrale, professionele toon',
      systemPrompt: 'Schrijf in een neutrale, professionele toon die geschikt is voor algemene communicatie.',
      examples: []
    },
    {
      value: 'formal' as const,
      label: 'Formeel & Zakelijk',
      description: 'Professioneel en officieel',
      systemPrompt: 'Gebruik een formele, zakelijke toon met officiële bewoordingen en een professionele structuur.',
      examples: []
    },
    {
      value: 'informal' as const,
      label: 'Informeel & Ondersteunend',
      description: 'Warm en toegankelijk',
      systemPrompt: 'Schrijf op een warme, toegankelijke manier die empathie toont en een persoonlijke verbinding creëert.',
      examples: []
    },
    {
      value: 'direct' as const,
      label: 'Direct & Beknopt',
      description: 'Helder en to-the-point',
      systemPrompt: 'Gebruik directe, heldere bewoordingen. Wees bondig en kom direct ter zake zonder onnodige omhaal.',
      examples: []
    },
    {
      value: 'scientific' as const,
      label: 'Wetenschappelijk & Gedetailleerd',
      description: 'Technisch en uitgebreid',
      systemPrompt: 'Gebruik technische, wetenschappelijke bewoordingen met gedetailleerde uitleg en medische precisie.',
      examples: []
    }
  ];

  // Greeting options
  const greetingOptions = [
    { value: 'geachte' as const, label: 'Geachte [Naam]', formality: 'Zeer formeel' },
    { value: 'beste' as const, label: 'Beste [Naam]', formality: 'Standaard' },
    { value: 'hallo' as const, label: 'Hallo [Naam]', formality: 'Informeel' }
  ];

  // Closing options
  const closingOptions = [
    { value: 'vriendelijk' as const, label: 'Met vriendelijke groet', formality: 'Standaard' },
    { value: 'collegiaal' as const, label: 'Met collegiale groet', formality: 'Professioneel' },
    { value: 'hoogachtend' as const, label: 'Hoogachtend', formality: 'Zeer formeel' }
  ];

  // Language options
  const languageOptions = [
    { value: 'nl' as const, label: 'Nederlands', flag: '🇳🇱' },
    { value: 'en' as const, label: 'English', flag: '🇬🇧' },
    { value: 'ar' as const, label: 'العربية', flag: '🇸🇦' },
    { value: 'fr' as const, label: 'Français', flag: '🇫🇷' },
    { value: 'de' as const, label: 'Deutsch', flag: '🇩🇪' },
    { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
    { value: 'zh' as const, label: '中文', flag: '🇨🇳' },
    { value: 'hi' as const, label: 'हिन्दी', flag: '🇮🇳' }
  ];

  // Recipient options
  const recipientOptions = [
    { value: 'general' as const, label: 'Standaard', icon: Mail, color: 'bg-gray-100 text-gray-700' },
    { value: 'patient' as const, label: 'Patiënt', icon: User, color: 'bg-hysio-mint/20 text-hysio-deep-green' },
    { value: 'colleague' as const, label: 'Collega', icon: Users, color: 'bg-blue-100 text-blue-700' },
    { value: 'huisarts' as const, label: 'Huisarts', icon: UserCheck, color: 'bg-purple-100 text-purple-700' }
  ];

  // Load history on mount
  useEffect(() => {
    loadEmailHistory();
  }, []);

  // Auto-fill from session data if available (only for patient emails)
  useEffect(() => {
    if (sessionData?.patientInfo && emailSettings.recipientType === 'patient') {
      const patientContext = `Patiënt: ${sessionData.patientInfo.initials} (${sessionData.patientInfo.age} jaar)\nKlacht: ${sessionData.patientInfo.chiefComplaint}`;
      if (!context.includes(patientContext)) {
        setContext(prev => prev ? `${patientContext}\n\n${prev}` : patientContext);
      }
    }
  }, [sessionData, emailSettings.recipientType]);

  const loadEmailHistory = () => {
    const stored = localStorage.getItem('smartmail-history-v2');
    if (stored) {
      try {
        setEmailHistory(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load email history:', error);
      }
    }
  };

  const saveToHistory = (email: string) => {
    const historyEntry: EmailHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      recipientType: emailSettings.recipientType,
      settings: { ...emailSettings },
      subject,
      content: email,
      context,
      exported: false
    };

    const updatedHistory = [historyEntry, ...emailHistory.slice(0, 49)];
    setEmailHistory(updatedHistory);
    localStorage.setItem('smartmail-history-v2', JSON.stringify(updatedHistory));
  };

  const handleDocumentsChange = (newDocuments: DocumentContext[]) => {
    setDocuments(newDocuments);
  };

  const updateSettings = (key: keyof EmailSettings, value: any) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateEmail = async () => {
    if (!context.trim()) {
      alert('Vul een context in voor de email');
      return;
    }

    if (!emailSettings.recipientType) {
      alert('Selecteer een doelgroep voor de email');
      return;
    }

    setIsGenerating(true);

    try {
      // Find the selected tone configuration
      const selectedTone = toneOptions.find(tone => tone.value === emailSettings.toneOfVoice);
      if (!selectedTone) {
        throw new Error('Geen geldige toon geselecteerd');
      }

      // Structure request data to match API expectations
      const requestData = {
        recipientType: emailSettings.recipientType,
        subject: emailSettings.autoSubject ? 'Auto-gegenereerd onderwerp' : subject || '',
        context: context.trim(),
        language: emailSettings.language,
        contentLength: emailSettings.contentLength,
        tone: {
          id: selectedTone.value,
          name: selectedTone.label,
          description: selectedTone.description,
          systemPrompt: selectedTone.systemPrompt,
          examples: selectedTone.examples
        },
        documents: documents.length > 0 ? documents : undefined,
        patientInfo: sessionData?.patientInfo
      };

      const response = await fetch('/api/smartmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success && result.email) {
        setGeneratedEmail(result.email);
        setEditableEmail(result.email);
        if (result.subject && emailSettings.autoSubject) {
          setSubject(result.subject);
        }
        saveToHistory(result.email);
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
    if (!emailSettings.autoSubject) {
      setSubject('');
    }
    setDocuments([]);
    setIsEditMode(false);
    setEditableEmail('');
  };

  const handleEditEmail = () => {
    setIsEditMode(true);
    setEditableEmail(generatedEmail);
  };

  const handleSaveEdit = () => {
    setGeneratedEmail(editableEmail);
    setIsEditMode(false);
  };

  const handleHistoryView = (item: EmailHistory) => {
    setGeneratedEmail(item.content);
    setContext(item.context);
    setSubject(item.subject);
    setEmailSettings(item.settings);
    setShowHistory(false);
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = emailHistory.filter(item => item.id !== id);
    setEmailHistory(updatedHistory);
    localStorage.setItem('smartmail-history-v2', JSON.stringify(updatedHistory));
  };

  return (
    <div className="min-h-screen bg-hysio-cream/30">
      {/* Hysio-Styled Header */}
      <header className="bg-white border-b border-hysio-mint/30 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 text-hysio-deep-green hover:bg-hysio-mint/10">
                  <ArrowLeft size={18} />
                  Dashboard
                </Button>
              </Link>
              <div className="text-2xl font-bold text-hysio-deep-green flex items-center gap-3">
                <div className="w-10 h-10 bg-hysio-mint rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                Hysio SmartMail
                <span className="text-sm font-normal bg-hysio-mint/20 text-hysio-deep-green px-2 py-1 rounded">V2</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-2 border-hysio-mint/40 text-hysio-deep-green hover:bg-hysio-mint/10"
            >
              <History size={16} />
              Geschiedenis
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 max-w-full">
        {/* 3-Panel Layout: Input | Settings | Output */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">

          {/* LEFT PANEL: Input Section */}
          <div className="col-span-4 space-y-4 overflow-y-auto">

            {/* Auto Subject Toggle */}
            <Card className="border-hysio-mint/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-hysio-deep-green">Genereer automatische onderwerpregel</Label>
                  <button
                    onClick={() => updateSettings('autoSubject', !emailSettings.autoSubject)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailSettings.autoSubject ? 'bg-hysio-mint' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailSettings.autoSubject ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Subject (only if auto is disabled) */}
            {!emailSettings.autoSubject && (
              <Card className="border-hysio-mint/30">
                <CardContent className="p-4">
                  <Label htmlFor="subject" className="text-base font-semibold text-hysio-deep-green block mb-3">
                    Onderwerpregel
                  </Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Onderwerp van de email"
                    className="border-hysio-mint/30 focus:border-hysio-mint"
                  />
                </CardContent>
              </Card>
            )}

            {/* Communication Input */}
            <Card className="border-hysio-mint/30 shadow-lg">
              <CardHeader className="bg-hysio-mint/10 border-b border-hysio-mint/20">
                <CardTitle className="text-xl text-hysio-deep-green flex items-center gap-3">
                  <MessageSquare className="h-6 w-6" />
                  Wat wil je communiceren?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">

                {/* Context */}
                <div>
                  <Textarea
                    id="context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Beschrijf wat je wilt communiceren..."
                    rows={8}
                    className="border-hysio-mint/30 focus:border-hysio-mint text-base"
                  />

                  {/* Voice Dictation */}
                  <div className="mt-3">
                    <AudioRecorder
                      onTranscriptionComplete={(transcription) => {
                        if (transcription.text) {
                          setContext(prev => prev ? `${prev} ${transcription.text}` : transcription.text);
                        }
                      }}
                      autoTranscribe={true}
                      maxDuration={1800000} // 30 minutes in milliseconds
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <Label className="text-sm font-medium text-hysio-deep-green block mb-2">
                    Context Documenten (max 3)
                  </Label>
                  <DocumentUpload
                    documents={documents}
                    onChange={handleDocumentsChange}
                    maxFiles={3}
                    maxSizeMB={10}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateEmail}
                  disabled={isGenerating || !context.trim()}
                  className="w-full bg-hysio-mint hover:bg-hysio-mint/90 text-white font-medium py-3 text-base"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Email wordt gegenereerd...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Genereer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* MIDDLE PANEL: Settings Control Center */}
          <div className="col-span-4 space-y-4 overflow-y-auto">

            {/* Main Settings Panel */}
            <Card className="border-hysio-mint/30 shadow-lg">
              <CardHeader className="bg-hysio-mint/10 border-b border-hysio-mint/20">
                <CardTitle className="text-xl text-hysio-deep-green flex items-center gap-3">
                  <Sliders className="h-6 w-6" />
                  Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                {/* Recipient Type */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-hysio-deep-green">Doelgroep Specificatie</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {recipientOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => updateSettings('recipientType', option.value)}
                          className={`p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                            emailSettings.recipientType === option.value
                              ? 'border-hysio-mint bg-hysio-mint/20 shadow-md'
                              : 'border-gray-200 hover:border-hysio-mint/50 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${option.color}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Length */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-hysio-deep-green flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Lengte van de Inhoud
                  </Label>
                  <div className="space-y-2">
                    {contentLengthOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSettings('contentLength', option.value)}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                          emailSettings.contentLength === option.value
                            ? 'border-hysio-mint bg-hysio-mint/10'
                            : 'border-gray-200 hover:border-hysio-mint/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                          <span className="text-xs bg-hysio-mint/20 text-hysio-deep-green px-2 py-1 rounded">
                            {option.words}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone of Voice */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-hysio-deep-green flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Tone-of-Voice
                  </Label>
                  <select
                    value={emailSettings.toneOfVoice}
                    onChange={(e) => updateSettings('toneOfVoice', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-hysio-mint focus:border-hysio-mint bg-white"
                  >
                    {toneOptions.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label} - {tone.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formality Settings */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Greeting */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-hysio-deep-green">Aanhef</Label>
                    <select
                      value={emailSettings.greeting}
                      onChange={(e) => updateSettings('greeting', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-hysio-mint focus:border-hysio-mint text-sm"
                    >
                      {greetingOptions.map((greeting) => (
                        <option key={greeting.value} value={greeting.value}>
                          {greeting.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Closing */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-hysio-deep-green">Afsluiting</Label>
                    <select
                      value={emailSettings.closing}
                      onChange={(e) => updateSettings('closing', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-hysio-mint focus:border-hysio-mint text-sm"
                    >
                      {closingOptions.map((closing) => (
                        <option key={closing.value} value={closing.value}>
                          {closing.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-hysio-deep-green flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Taal
                  </Label>
                  <select
                    value={emailSettings.language}
                    onChange={(e) => updateSettings('language', e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-hysio-mint focus:border-hysio-mint bg-white"
                  >
                    {languageOptions.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.flag} {lang.label}
                      </option>
                    ))}
                  </select>
                  {emailSettings.language !== 'nl' && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                      ⚠️ Bij andere talen dan Nederlands is nacontrole op taalfouten belangrijk
                    </p>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* History Panel (when shown) */}
            {showHistory && (
              <Card className="border-hysio-mint/30 max-h-96">
                <CardHeader>
                  <CardTitle className="text-lg text-hysio-deep-green flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Email Geschiedenis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 overflow-y-auto max-h-80">
                  {emailHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nog geen emails gegenereerd</p>
                    </div>
                  ) : (
                    emailHistory.map((item) => (
                      <div key={item.id} className="p-3 border border-hysio-mint/20 rounded-lg hover:bg-hysio-mint/5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.subject || 'Geen onderwerp'}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleDateString('nl-NL')} - {item.recipientType}
                            </div>
                            <div className="text-xs text-gray-600 truncate mt-1">
                              {item.content.substring(0, 60)}...
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleHistoryView(item)}
                              className="h-7 w-7 p-0 text-hysio-deep-green hover:bg-hysio-mint/20"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(item.content)}
                              className="h-7 w-7 p-0 text-hysio-deep-green hover:bg-hysio-mint/20"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHistoryItem(item.id)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT PANEL: Email Output */}
          <div className="col-span-4 overflow-y-auto">
            <Card className="h-full border-hysio-mint/30 shadow-lg">
              <CardHeader className="bg-hysio-mint/5 border-b border-hysio-mint/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-hysio-deep-green flex items-center gap-3">
                    <div className="w-8 h-8 bg-hysio-mint/20 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-hysio-deep-green" />
                    </div>
                    Email Content
                    {emailSettings.autoSubject && subject && (
                      <span className="text-sm font-normal text-gray-600">({subject})</span>
                    )}
                  </CardTitle>
                  {generatedEmail && (
                    <div className="flex gap-2">
                      {!isEditMode && (
                        <Button variant="outline" size="sm" onClick={handleEditEmail} className="text-hysio-deep-green border-hysio-mint/40">
                          <Edit className="h-4 w-4 mr-1" />
                          Bewerk
                        </Button>
                      )}
                      <CopyToClipboard
                        text={generatedEmail}
                        size="sm"
                        className="text-hysio-deep-green border-hysio-mint/40"
                      />
                      <Button variant="outline" size="sm" onClick={handleReset} className="text-hysio-deep-green border-hysio-mint/40">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Nieuw
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-100px)] p-0">
                {isEditMode ? (
                  <div className="h-full flex flex-col p-6">
                    <Textarea
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      className="flex-1 font-mono text-sm resize-none border-hysio-mint/30 focus:border-hysio-mint"
                    />
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSaveEdit} size="sm" className="bg-hysio-mint hover:bg-hysio-mint/90">
                        <Save className="h-4 w-4 mr-1" />
                        Opslaan
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditMode(false)} size="sm" className="border-hysio-mint/40">
                        Annuleren
                      </Button>
                    </div>
                  </div>
                ) : generatedEmail ? (
                  <div className="h-full p-6">
                    <div className="bg-white border-2 border-hysio-mint/20 rounded-lg p-6 h-full overflow-y-auto shadow-inner">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-800">
                        {generatedEmail}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                    <div className="w-24 h-24 bg-hysio-mint/10 rounded-full flex items-center justify-center mb-6">
                      <Mail className="h-12 w-12 text-hysio-mint" />
                    </div>
                    <h3 className="text-lg font-medium text-hysio-deep-green mb-2">Klaar om te beginnen?</h3>
                    <p className="text-center text-gray-600 max-w-md">
                      Voer links uw content in, configureer de instellingen in het midden, en hier verschijnt uw gegenereerde email.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}