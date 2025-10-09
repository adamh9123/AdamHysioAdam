/**
 * Export Screen Component
 *
 * Final step of the pre-intake questionnaire where users can
 * download their completed intake in multiple formats and
 * send via email.
 *
 * @module components/pre-intake/ExportScreen
 */

'use client';

import React, { useState } from 'react';
import type { PreIntakeQuestionnaireData } from '@/types/pre-intake';
import { usePreIntakeStore } from '@/lib/state/pre-intake-store';
import { getTranslations } from '@/lib/pre-intake/translations';
import SuccessBanner from './SuccessBanner';
import ExportButton, { PDFIcon, WordIcon, HTMLIcon, TextIcon } from './ExportButton';
import { useToast } from './Toast';
import {
  exportToPDF,
  exportToDOCX,
  exportToHTML,
  exportToTXT,
  downloadBlob,
  downloadText,
  generateFilename,
} from '@/lib/pre-intake/export-utils';

interface ExportScreenProps {
  data: Partial<PreIntakeQuestionnaireData>;
  submissionId?: string;
}

export default function ExportScreen({ data, submissionId }: ExportScreenProps) {
  const language = usePreIntakeStore((state) => state.language);
  const toast = useToast();
  const t = getTranslations(language);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  // Export handlers with loading states
  const handleExportPDF = async () => {
    try {
      setExportingFormat('pdf');
      const blob = await exportToPDF(data);
      const filename = generateFilename(`hysio_intake_${data.personalia?.fullName || 'patient'}`, 'pdf');
      downloadBlob(blob, filename);
      // Show success feedback
      setTimeout(() => setExportingFormat(null), 1000);
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Fout bij PDF export. Probeer het opnieuw.');
      setExportingFormat(null);
    }
  };

  const handleExportDOCX = async () => {
    try {
      setExportingFormat('docx');
      const blob = await exportToDOCX(data);
      const filename = generateFilename(`hysio_intake_${data.personalia?.fullName || 'patient'}`, 'docx');
      downloadBlob(blob, filename);
      setTimeout(() => setExportingFormat(null), 1000);
    } catch (error) {
      console.error('DOCX export failed:', error);
      toast.error('Fout bij Word export. Probeer het opnieuw.');
      setExportingFormat(null);
    }
  };

  const handleExportHTML = async () => {
    try {
      setExportingFormat('html');
      const html = exportToHTML(data);
      const filename = generateFilename(`hysio_intake_${data.personalia?.fullName || 'patient'}`, 'html');
      downloadText(html, filename, 'text/html');
      setTimeout(() => setExportingFormat(null), 1000);
    } catch (error) {
      console.error('HTML export failed:', error);
      toast.error('Fout bij HTML export. Probeer het opnieuw.');
      setExportingFormat(null);
    }
  };

  const handleExportTXT = async () => {
    try {
      setExportingFormat('txt');
      const txt = exportToTXT(data);
      const filename = generateFilename(`hysio_intake_${data.personalia?.fullName || 'patient'}`, 'txt');
      downloadText(txt, filename, 'text/plain');
      setTimeout(() => setExportingFormat(null), 1000);
    } catch (error) {
      console.error('TXT export failed:', error);
      toast.error('Fout bij tekst export. Probeer het opnieuw.');
      setExportingFormat(null);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus('idle');

    try {
      const response = await fetch('/api/pre-intake/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submissionId || '',
          recipientEmail: data.personalia?.email || '',
          format: 'pdf',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailStatus('success');
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus('error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Success Banner */}
      <SuccessBanner submissionId={submissionId} />

      {/* Export Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.exportTitle}</h2>
          <p className="text-gray-600">{t.exportDescription}</p>
        </div>

        {/* Export Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ExportButton
            format="pdf"
            label={t.exportPDF}
            icon={<PDFIcon />}
            onClick={handleExportPDF}
          />
          <ExportButton
            format="docx"
            label={t.exportDOCX}
            icon={<WordIcon />}
            onClick={handleExportDOCX}
          />
          <ExportButton
            format="html"
            label={t.exportHTML}
            icon={<HTMLIcon />}
            onClick={handleExportHTML}
          />
          <ExportButton
            format="txt"
            label={t.exportTXT}
            icon={<TextIcon />}
            onClick={handleExportTXT}
          />
        </div>

        {/* Format Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📁 Bestandsformaten</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>PDF:</strong> Ideaal voor printen en archiveren
            </li>
            <li>
              <strong>Word:</strong> Bewerkbaar document voor notities
            </li>
            <li>
              <strong>HTML:</strong> Open in elke webbrowser
            </li>
            <li>
              <strong>Tekst:</strong> Eenvoudig platte tekst formaat
            </li>
          </ul>
        </div>
      </div>

      {/* Email Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.sendEmail}</h2>
          <p className="text-gray-600">{t.sendEmailDescription}</p>
        </div>

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={isSendingEmail}
          className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 disabled:cursor-not-allowed"
        >
          {isSendingEmail ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{t.sendingEmail}</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>{t.sendEmail}</span>
            </>
          )}
        </button>

        {/* Email Status Messages */}
        {emailStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-900">{t.sendEmailSuccess}</p>
              <p className="text-sm text-green-700 mt-1">
                De e-mail is verzonden naar {data.personalia?.email}
              </p>
            </div>
          </div>
        )}

        {emailStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900">{t.sendEmailError}</p>
              <p className="text-sm text-red-700 mt-1">
                Probeer het later opnieuw of neem contact op met de praktijk.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Wat gebeurt er nu?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Uw fysiotherapeut heeft uw intake ontvangen en zal deze bekijken</li>
              <li>• U ontvangt binnen 24 uur een bevestiging per e-mail</li>
              <li>• Bij vragen kunt u contact opnemen met de praktijk</li>
              <li>• Bewaar een kopie van dit formulier voor uw eigen administratie</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
