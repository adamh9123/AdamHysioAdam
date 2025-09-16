// Distribution Controls Component for EduPack Module
// Handles email, download, and copy functionality for patient education summaries

'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  Mail,
  Download,
  Copy,
  Share2,
  CheckCircle,
  AlertTriangle,
  Send,
  FileText,
  Link2,
  Clock
} from 'lucide-react';

import type {
  EduPackContent,
  EduPackDistribution
} from '@/lib/types/edupack';
import type { PatientInfo } from '@/lib/types';

export interface DistributionControlsProps {
  content: EduPackContent;
  patientInfo?: PatientInfo;
  onComplete: (method: 'email' | 'download' | 'copy' | 'share', details?: any) => void;
  allowedMethods?: ('email' | 'download' | 'copy' | 'share')[];
  className?: string;
}

interface DistributionState {
  selectedMethod: 'email' | 'download' | 'copy' | 'share' | null;
  emailAddress: string;
  isProcessing: boolean;
  result?: {
    success: boolean;
    message: string;
    details?: any;
  };
}

export function DistributionControls({
  content,
  patientInfo,
  onComplete,
  allowedMethods = ['email', 'download', 'copy'],
  className = ''
}: DistributionControlsProps) {
  const [state, setState] = useState<DistributionState>({
    selectedMethod: null,
    emailAddress: patientInfo?.email || '',
    isProcessing: false
  });

  // Handle method selection
  const selectMethod = useCallback((method: typeof state.selectedMethod) => {
    setState(prev => ({
      ...prev,
      selectedMethod: method,
      result: undefined
    }));
  }, []);

  // Handle email distribution
  const handleEmailDistribution = useCallback(async () => {
    if (!state.emailAddress.trim()) {
      setState(prev => ({
        ...prev,
        result: {
          success: false,
          message: 'E-mailadres is verplicht'
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, result: undefined }));

    try {
      const response = await fetch('/api/edu-pack/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eduPackId: content.id,
          recipientEmail: state.emailAddress,
          recipientName: patientInfo?.name || 'Patiënt',
          content: content
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          result: {
            success: true,
            message: 'EduPack succesvol verstuurd via e-mail',
            details: { recipient: state.emailAddress }
          }
        }));

        setTimeout(() => {
          onComplete('email', { recipient: state.emailAddress });
        }, 1500);
      } else {
        setState(prev => ({
          ...prev,
          isProcessing: false,
          result: {
            success: false,
            message: result.error?.message || 'Versturen mislukt'
          }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: {
          success: false,
          message: 'Netwerkfout bij versturen e-mail'
        }
      }));
    }
  }, [state.emailAddress, content, patientInfo, onComplete]);

  // Handle PDF download
  const handlePDFDownload = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true, result: undefined }));

    try {
      const response = await fetch(`/api/edu-pack/${content.id}/pdf`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edupack-${content.patientName || 'patient'}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setState(prev => ({
          ...prev,
          isProcessing: false,
          result: {
            success: true,
            message: 'PDF succesvol gedownload',
            details: { format: 'PDF' }
          }
        }));

        setTimeout(() => {
          onComplete('download', { format: 'PDF' });
        }, 1500);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: {
          success: false,
          message: 'PDF download mislukt'
        }
      }));
    }
  }, [content, onComplete]);

  // Handle copy to clipboard
  const handleCopyToClipboard = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true, result: undefined }));

    try {
      const textContent = generateTextContent(content);
      await navigator.clipboard.writeText(textContent);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: {
          success: true,
          message: 'EduPack gekopieerd naar klembord'
        }
      }));

      setTimeout(() => {
        onComplete('copy');
      }, 1500);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: {
          success: false,
          message: 'Kopiëren naar klembord mislukt'
        }
      }));
    }
  }, [content, onComplete]);

  // Handle share link generation
  const handleShareLink = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true, result: undefined }));

    try {
      const response = await fetch('/api/edu-pack/share-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eduPackId: content.id,
          expirationDays: 7
        }),
      });

      const result = await response.json();

      if (result.success) {
        await navigator.clipboard.writeText(result.shareUrl);

        setState(prev => ({
          ...prev,
          isProcessing: false,
          result: {
            success: true,
            message: 'Deellink gekopieerd naar klembord',
            details: { shareUrl: result.shareUrl, expiresAt: result.expiresAt }
          }
        }));

        setTimeout(() => {
          onComplete('share', { shareUrl: result.shareUrl });
        }, 1500);
      } else {
        throw new Error(result.error?.message || 'Share link generation failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        result: {
          success: false,
          message: 'Deellink genereren mislukt'
        }
      }));
    }
  }, [content, onComplete]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Method selection */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Kies verzendmethode</h4>
        <div className="grid grid-cols-2 gap-3">
          {allowedMethods.includes('email') && (
            <MethodCard
              method="email"
              icon={Mail}
              title="E-mail versturen"
              description="Verstuur naar patiënt"
              isSelected={state.selectedMethod === 'email'}
              onSelect={() => selectMethod('email')}
            />
          )}

          {allowedMethods.includes('download') && (
            <MethodCard
              method="download"
              icon={Download}
              title="PDF downloaden"
              description="Download als bestand"
              isSelected={state.selectedMethod === 'download'}
              onSelect={() => selectMethod('download')}
            />
          )}

          {allowedMethods.includes('copy') && (
            <MethodCard
              method="copy"
              icon={Copy}
              title="Kopiëren"
              description="Naar klembord"
              isSelected={state.selectedMethod === 'copy'}
              onSelect={() => selectMethod('copy')}
            />
          )}

          {allowedMethods.includes('share') && (
            <MethodCard
              method="share"
              icon={Share2}
              title="Deellink"
              description="Beveiligde link"
              isSelected={state.selectedMethod === 'share'}
              onSelect={() => selectMethod('share')}
            />
          )}
        </div>
      </div>

      {/* Method-specific content */}
      {state.selectedMethod === 'email' && (
        <EmailDistributionForm
          emailAddress={state.emailAddress}
          onEmailChange={(email) => setState(prev => ({ ...prev, emailAddress: email }))}
          patientInfo={patientInfo}
          isProcessing={state.isProcessing}
          onSend={handleEmailDistribution}
        />
      )}

      {state.selectedMethod === 'download' && (
        <DownloadForm
          content={content}
          isProcessing={state.isProcessing}
          onDownload={handlePDFDownload}
        />
      )}

      {state.selectedMethod === 'copy' && (
        <CopyForm
          content={content}
          isProcessing={state.isProcessing}
          onCopy={handleCopyToClipboard}
        />
      )}

      {state.selectedMethod === 'share' && (
        <ShareForm
          content={content}
          isProcessing={state.isProcessing}
          onShare={handleShareLink}
        />
      )}

      {/* Result display */}
      {state.result && (
        <div className={`p-4 rounded-lg border ${
          state.result.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`flex items-center gap-2 ${
            state.result.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {state.result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">{state.result.message}</span>
          </div>

          {state.result.details?.shareUrl && (
            <div className="mt-2 text-xs text-green-600">
              Link verloopt op: {new Date(state.result.details.expiresAt).toLocaleDateString('nl-NL')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Method selection card
interface MethodCardProps {
  method: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

function MethodCard({ method, icon: Icon, title, description, isSelected, onSelect }: MethodCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-hysio-deep-green bg-hysio-mint/5'
          : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isSelected ? 'bg-hysio-deep-green text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h5 className="font-medium text-gray-900">{title}</h5>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Email distribution form
function EmailDistributionForm({
  emailAddress,
  onEmailChange,
  patientInfo,
  isProcessing,
  onSend
}: {
  emailAddress: string;
  onEmailChange: (email: string) => void;
  patientInfo?: PatientInfo;
  isProcessing: boolean;
  onSend: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">E-mail versturen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">E-mailadres patiënt</Label>
          <Input
            id="email"
            type="email"
            placeholder="patient@voorbeeld.nl"
            value={emailAddress}
            onChange={(e) => onEmailChange(e.target.value)}
            className="mt-1"
          />
          {patientInfo?.name && (
            <p className="text-xs text-gray-600 mt-1">
              Voor: {patientInfo.name}
            </p>
          )}
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">Beveiligde e-mail</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            EduPack wordt verstuurd via TLS-versleutelde e-mail met GDPR-compliance
          </p>
        </div>

        <Button
          onClick={onSend}
          disabled={!emailAddress.trim() || isProcessing}
          className="w-full bg-hysio-deep-green hover:bg-hysio-deep-green/90"
        >
          {isProcessing ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Versturen...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              EduPack versturen
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Download form
function DownloadForm({
  content,
  isProcessing,
  onDownload
}: {
  content: EduPackContent;
  isProcessing: boolean;
  onDownload: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">PDF downloaden</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-700">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">PDF-bestand</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Download als PDF met Hysio-branding en medische disclaimers
          </p>
        </div>

        <div className="text-xs text-gray-600">
          <p>Bestandsnaam: edupack-{content.patientName || 'patient'}-{new Date().toISOString().split('T')[0]}.pdf</p>
          <p>Geschatte grootte: ~150 KB</p>
        </div>

        <Button
          onClick={onDownload}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Genereren...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              PDF downloaden
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Copy form
function CopyForm({
  content,
  isProcessing,
  onCopy
}: {
  content: EduPackContent;
  isProcessing: boolean;
  onCopy: () => void;
}) {
  const wordCount = content.sections
    .filter(s => s.enabled)
    .reduce((total, s) => total + s.content.trim().split(/\s+/).length, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Naar klembord kopiëren</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-gray-700">
            <Copy className="h-4 w-4" />
            <span className="text-sm font-medium">Platte tekst</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Kopieer als tekstformaat voor gebruik in andere applicaties
          </p>
        </div>

        <div className="text-xs text-gray-600">
          <p>Inhoud: {content.sections.filter(s => s.enabled).length} secties</p>
          <p>Woorden: ~{wordCount}</p>
        </div>

        <Button
          onClick={onCopy}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Kopiëren...
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Naar klembord
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Share form
function ShareForm({
  content,
  isProcessing,
  onShare
}: {
  content: EduPackContent;
  isProcessing: boolean;
  onShare: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Beveiligde deellink</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700">
            <Link2 className="h-4 w-4" />
            <span className="text-sm font-medium">Tijdelijke link</span>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Link verloopt automatisch na 7 dagen voor beveiliging
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-3 w-3" />
          <span>Toegang tot: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL')}</span>
        </div>

        <Button
          onClick={onShare}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Genereren...
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Deellink maken
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Utility function to generate text content
function generateTextContent(content: EduPackContent): string {
  const sections = content.sections.filter(s => s.enabled && s.content.trim());

  let text = `EduPack - Patiëntinformatie\n`;
  text += `Gegenereerd op: ${new Date().toLocaleDateString('nl-NL')}\n`;
  if (content.patientName) {
    text += `Voor: ${content.patientName}\n`;
  }
  text += `\n${'='.repeat(50)}\n\n`;

  sections.forEach((section, index) => {
    const metadata = {
      introduction: { emoji: '📄', title: 'Introductie' },
      session_summary: { emoji: '📋', title: 'Samenvatting gesprek' },
      diagnosis: { emoji: '💡', title: 'Uitleg diagnose' },
      treatment_plan: { emoji: '🩺', title: 'Behandelplan' },
      self_care: { emoji: '🧘', title: 'Zelfzorg en oefeningen' },
      warning_signs: { emoji: '⚠️', title: 'Waarschuwingssignalen' },
      follow_up: { emoji: '📅', title: 'Vervolgafspraken' }
    }[section.type] || { emoji: '📝', title: section.type };

    text += `${metadata.emoji} ${metadata.title}\n`;
    text += `${'-'.repeat(metadata.title.length + 3)}\n`;
    text += `${section.content}\n\n`;
  });

  text += `${'='.repeat(50)}\n`;
  text += `Deze informatie is gegenereerd door Hysio Medical Scribe\n`;
  text += `en is bedoeld ter ondersteuning van uw behandeling.\n`;
  text += `Neem bij vragen contact op met uw behandelaar.\n`;

  return text;
}