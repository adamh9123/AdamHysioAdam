/**
 * Pre-intake Detail View Component (Therapist Dashboard)
 *
 * Displays complete pre-intake questionnaire data with:
 * - All sections clearly organized
 * - Red flags prominently displayed
 * - HHSB preview and processing button
 * - Export functionality
 *
 * @module components/pre-intake/therapist/PreIntakeDetail
 */

'use client';

import React, { useState } from 'react';
import type { PreIntakeSubmission, QuestionnaireData } from '@/types/pre-intake';
import { BODY_REGION_LABELS } from '@/lib/pre-intake/constants';
import RedFlagsIndicator from './RedFlagsIndicator';
import HHSBPreview from './HHSBPreview';

interface PreIntakeDetailProps {
  submission: PreIntakeSubmission;
  onProcessToHHSB?: (submissionId: string) => void;
  onBack?: () => void;
}

export default function PreIntakeDetail({
  submission,
  onProcessToHHSB,
  onBack,
}: PreIntakeDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHHSBPreview, setShowHHSBPreview] = useState(false);
  const [hhsbData, setHhsbData] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const data = submission.questionnaireData;

  const handleProcessToHHSB = async () => {
    if (onProcessToHHSB) {
      onProcessToHHSB(submission.sessionId);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/pre-intake/process-hhsb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: submission.sessionId }),
      });

      if (response.ok) {
        const result = await response.json();
        setHhsbData(result.hhsb);
        setShowHHSBPreview(true);
      } else {
        const error = await response.json();
        alert(`Fout bij verwerken: ${error.message}`);
      }
    } catch (error) {
      console.error('Process to HHSB error:', error);
      alert('Netwerkfout bij verwerken');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportAsText = () => {
    const text = `
PRE-INTAKE FORMULIER
====================

PATIËNT GEGEVENS
----------------
Naam: ${data.personalia?.firstName} ${data.personalia?.lastName}
Geboortedatum: ${data.personalia?.dateOfBirth}
Geslacht: ${data.personalia?.gender}
Telefoon: ${data.personalia?.phone}
Email: ${data.personalia?.email}
Adres: ${data.personalia?.address}, ${data.personalia?.postalCode} ${data.personalia?.city}

KLACHT (LOFTIG)
---------------
Locatie: ${data.complaint?.bodyRegions?.map((r) => BODY_REGION_LABELS[r]).join(', ')}
Beschrijving: ${data.complaint?.description}
Ontstaan: ${data.complaint?.onset}
Eerder voorgekomen: ${data.complaint?.hasOccurredBefore ? 'Ja' : 'Nee'}
${data.complaint?.previousOccurrence ? `Details: ${data.complaint.previousOccurrence}` : ''}
Frequentie: ${data.complaint?.frequency}
Duur: ${data.complaint?.duration}
Intensiteit (VAS): ${data.complaint?.intensity}/10

RED FLAGS
---------
${
  submission.redFlagsSummary && submission.redFlagsSummary.length > 0
    ? submission.redFlagsSummary.map((f) => `⚠ ${f.type} (${f.severity})`).join('\n')
    : 'Geen red flags gedetecteerd'
}

MEDISCHE GESCHIEDENIS
---------------------
Recente operaties: ${data.medicalHistory?.hasRecentSurgeries ? 'Ja' : 'Nee'}
${data.medicalHistory?.surgeryDetails ? `Details: ${data.medicalHistory.surgeryDetails}` : ''}
Medicatie: ${data.medicalHistory?.takesMedication ? 'Ja' : 'Nee'}
${data.medicalHistory?.medications ? `Medicijnen: ${data.medicalHistory.medications.join(', ')}` : ''}
Andere aandoeningen: ${data.medicalHistory?.otherConditions || 'Geen'}
Roken: ${data.medicalHistory?.smokingStatus}
Alcohol: ${data.medicalHistory?.alcoholConsumption}

DOELEN (SCEGS)
--------------
Behandeldoelen: ${data.goals?.treatmentGoals}
Gedachten over oorzaak: ${data.goals?.thoughtsOnCause}
Invloed op stemming: ${data.goals?.moodImpact}
Beperkte activiteiten: ${data.goals?.limitedActivities}

FUNCTIONELE BEPERKINGEN
-----------------------
${
  data.functionalLimitations?.limitedActivityCategories
    ?.map(
      (cat) =>
        `${cat}: ${data.functionalLimitations?.severityScores?.[cat] || 0}/10`
    )
    .join('\n') || 'Geen beperkingen opgegeven'
}

Ingediend op: ${new Date(submission.submittedAt).toLocaleString('nl-NL')}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pre-intake-${data.personalia?.lastName}-${new Date(submission.submittedAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    const html = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pre-intake Formulier - ${data.personalia?.firstName} ${data.personalia?.lastName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #333; }
    h1 { color: #1e7560; border-bottom: 3px solid #a5e1c5; padding-bottom: 10px; }
    h2 { color: #1e7560; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    .section { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
    .field { margin-bottom: 12px; }
    .label { font-weight: 600; color: #4b5563; }
    .value { color: #1f2937; margin-left: 8px; }
    .red-flag { background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Pre-intake Formulier</h1>

  <div class="section">
    <h2>Patiënt Gegevens</h2>
    <div class="field"><span class="label">Naam:</span><span class="value">${data.personalia?.firstName} ${data.personalia?.lastName}</span></div>
    <div class="field"><span class="label">Geboortedatum:</span><span class="value">${data.personalia?.dateOfBirth}</span></div>
    <div class="field"><span class="label">Geslacht:</span><span class="value">${data.personalia?.gender}</span></div>
    <div class="field"><span class="label">Telefoon:</span><span class="value">${data.personalia?.phone}</span></div>
    <div class="field"><span class="label">Email:</span><span class="value">${data.personalia?.email}</span></div>
    <div class="field"><span class="label">Adres:</span><span class="value">${data.personalia?.address}, ${data.personalia?.postalCode} ${data.personalia?.city}</span></div>
  </div>

  <div class="section">
    <h2>Klacht (LOFTIG)</h2>
    <div class="field"><span class="label">Locatie:</span><span class="value">${data.complaint?.bodyRegions?.map((r) => BODY_REGION_LABELS[r]).join(', ')}</span></div>
    <div class="field"><span class="label">Beschrijving:</span><span class="value">${data.complaint?.description || 'Niet opgegeven'}</span></div>
    <div class="field"><span class="label">Ontstaan:</span><span class="value">${data.complaint?.onset || 'Niet opgegeven'}</span></div>
    <div class="field"><span class="label">Eerder voorgekomen:</span><span class="value">${data.complaint?.hasOccurredBefore ? 'Ja' : 'Nee'}</span></div>
    ${data.complaint?.previousOccurrence ? `<div class="field"><span class="label">Details:</span><span class="value">${data.complaint.previousOccurrence}</span></div>` : ''}
    <div class="field"><span class="label">Frequentie:</span><span class="value">${data.complaint?.frequency}</span></div>
    <div class="field"><span class="label">Duur:</span><span class="value">${data.complaint?.duration}</span></div>
    <div class="field"><span class="label">Intensiteit (VAS):</span><span class="value">${data.complaint?.intensity}/10</span></div>
  </div>

  <div class="section">
    <h2>Red Flags</h2>
    ${
      submission.redFlagsSummary && submission.redFlagsSummary.length > 0
        ? submission.redFlagsSummary.map((f) => `<div class="red-flag"><strong>⚠ ${f.type}</strong> (${f.severity})</div>`).join('')
        : '<p>Geen red flags gedetecteerd</p>'
    }
  </div>

  <div class="section">
    <h2>Medische Geschiedenis</h2>
    <div class="field"><span class="label">Recente operaties:</span><span class="value">${data.medicalHistory?.hasRecentSurgeries ? 'Ja' : 'Nee'}</span></div>
    ${data.medicalHistory?.surgeryDetails ? `<div class="field"><span class="label">Details:</span><span class="value">${data.medicalHistory.surgeryDetails}</span></div>` : ''}
    <div class="field"><span class="label">Medicatie:</span><span class="value">${data.medicalHistory?.takesMedication ? 'Ja' : 'Nee'}</span></div>
    ${data.medicalHistory?.medications ? `<div class="field"><span class="label">Medicijnen:</span><span class="value">${data.medicalHistory.medications.join(', ')}</span></div>` : ''}
    <div class="field"><span class="label">Andere aandoeningen:</span><span class="value">${data.medicalHistory?.otherConditions || 'Geen'}</span></div>
    <div class="field"><span class="label">Roken:</span><span class="value">${data.medicalHistory?.smokingStatus}</span></div>
    <div class="field"><span class="label">Alcohol:</span><span class="value">${data.medicalHistory?.alcoholConsumption}</span></div>
  </div>

  <div class="section">
    <h2>Doelen (SCEGS)</h2>
    <div class="field"><span class="label">Behandeldoelen:</span><span class="value">${data.goals?.treatmentGoals || 'Niet opgegeven'}</span></div>
    <div class="field"><span class="label">Gedachten over oorzaak:</span><span class="value">${data.goals?.thoughtsOnCause || 'Niet opgegeven'}</span></div>
    <div class="field"><span class="label">Invloed op stemming:</span><span class="value">${data.goals?.moodImpact}</span></div>
    <div class="field"><span class="label">Beperkte activiteiten:</span><span class="value">${data.goals?.limitedActivities || 'Niet opgegeven'}</span></div>
  </div>

  <div class="section">
    <h2>Functionele Beperkingen</h2>
    ${
      data.functionalLimitations?.limitedActivityCategories && data.functionalLimitations.limitedActivityCategories.length > 0
        ? data.functionalLimitations.limitedActivityCategories
            .map((cat) => `<div class="field"><span class="label">${cat}:</span><span class="value">${data.functionalLimitations?.severityScores?.[cat] || 0}/10</span></div>`)
            .join('')
        : '<p>Geen beperkingen opgegeven</p>'
    }
  </div>

  <div class="footer">
    <p>Ingediend op: ${new Date(submission.submittedAt).toLocaleString('nl-NL')}</p>
    <p>Gegenereerd door Hysio Pre-intake Module</p>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pre-intake-${data.personalia?.lastName}-${new Date(submission.submittedAt).toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportAsPDF = () => {
    // Generate HTML content and open print dialog
    const htmlContent = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <title>Pre-intake - ${data.personalia?.firstName} ${data.personalia?.lastName}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
    h1 { color: #1e7560; font-size: 24px; }
    h2 { color: #1e7560; font-size: 18px; margin-top: 20px; border-bottom: 2px solid #a5e1c5; padding-bottom: 5px; }
    .field { margin: 8px 0; }
    .label { font-weight: 600; }
    .red-flag { background: #fee2e2; border-left: 4px solid #ef4444; padding: 8px; margin: 6px 0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Pre-intake Formulier</h1>
  <h2>Patiënt Gegevens</h2>
  <div class="field"><span class="label">Naam:</span> ${data.personalia?.firstName} ${data.personalia?.lastName}</div>
  <div class="field"><span class="label">Geboortedatum:</span> ${data.personalia?.dateOfBirth}</div>
  <div class="field"><span class="label">Telefoon:</span> ${data.personalia?.phone}</div>
  <div class="field"><span class="label">Email:</span> ${data.personalia?.email}</div>

  <h2>Klacht</h2>
  <div class="field"><span class="label">Locatie:</span> ${data.complaint?.bodyRegions?.map((r) => BODY_REGION_LABELS[r]).join(', ')}</div>
  <div class="field"><span class="label">Intensiteit:</span> ${data.complaint?.intensity}/10</div>

  <h2>Red Flags</h2>
  ${
    submission.redFlagsSummary && submission.redFlagsSummary.length > 0
      ? submission.redFlagsSummary.map((f) => `<div class="red-flag">⚠ ${f.type} (${f.severity})</div>`).join('')
      : '<p>Geen red flags</p>'
  }

  <p style="margin-top: 30px; color: #666; font-size: 12px;">Ingediend: ${new Date(submission.submittedAt).toLocaleString('nl-NL')}</p>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    setShowExportMenu(false);
  };

  const exportAsDOCX = () => {
    // Export as Word-compatible HTML with proper headers
    const docxContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Pre-intake Formulier</title></head>
<body>
  <h1>Pre-intake Formulier</h1>
  <h2>Patiënt Gegevens</h2>
  <p><strong>Naam:</strong> ${data.personalia?.firstName} ${data.personalia?.lastName}</p>
  <p><strong>Geboortedatum:</strong> ${data.personalia?.dateOfBirth}</p>
  <p><strong>Telefoon:</strong> ${data.personalia?.phone}</p>
  <p><strong>Email:</strong> ${data.personalia?.email}</p>
  <p><strong>Adres:</strong> ${data.personalia?.address}, ${data.personalia?.postalCode} ${data.personalia?.city}</p>

  <h2>Klacht (LOFTIG)</h2>
  <p><strong>Locatie:</strong> ${data.complaint?.bodyRegions?.map((r) => BODY_REGION_LABELS[r]).join(', ')}</p>
  <p><strong>Beschrijving:</strong> ${data.complaint?.description || 'N/A'}</p>
  <p><strong>Ontstaan:</strong> ${data.complaint?.onset || 'N/A'}</p>
  <p><strong>Frequentie:</strong> ${data.complaint?.frequency}</p>
  <p><strong>Duur:</strong> ${data.complaint?.duration}</p>
  <p><strong>Intensiteit:</strong> ${data.complaint?.intensity}/10</p>

  <h2>Red Flags</h2>
  ${
    submission.redFlagsSummary && submission.redFlagsSummary.length > 0
      ? submission.redFlagsSummary.map((f) => `<p style="background:#ffebee;padding:8px;border-left:4px solid red;">⚠ ${f.type} (${f.severity})</p>`).join('')
      : '<p>Geen red flags gedetecteerd</p>'
  }

  <h2>Medische Geschiedenis</h2>
  <p><strong>Recente operaties:</strong> ${data.medicalHistory?.hasRecentSurgeries ? 'Ja' : 'Nee'}</p>
  ${data.medicalHistory?.surgeryDetails ? `<p><strong>Details:</strong> ${data.medicalHistory.surgeryDetails}</p>` : ''}
  <p><strong>Medicatie:</strong> ${data.medicalHistory?.takesMedication ? 'Ja' : 'Nee'}</p>
  ${data.medicalHistory?.medications ? `<p><strong>Medicijnen:</strong> ${data.medicalHistory.medications.join(', ')}</p>` : ''}
  <p><strong>Andere aandoeningen:</strong> ${data.medicalHistory?.otherConditions || 'Geen'}</p>

  <h2>Doelen (SCEGS)</h2>
  <p><strong>Behandeldoelen:</strong> ${data.goals?.treatmentGoals || 'N/A'}</p>
  <p><strong>Gedachten over oorzaak:</strong> ${data.goals?.thoughtsOnCause || 'N/A'}</p>
  <p><strong>Invloed op stemming:</strong> ${data.goals?.moodImpact}</p>
  <p><strong>Beperkte activiteiten:</strong> ${data.goals?.limitedActivities || 'N/A'}</p>

  <h2>Functionele Beperkingen</h2>
  ${
    data.functionalLimitations?.limitedActivityCategories && data.functionalLimitations.limitedActivityCategories.length > 0
      ? data.functionalLimitations.limitedActivityCategories
          .map((cat) => `<p><strong>${cat}:</strong> ${data.functionalLimitations?.severityScores?.[cat] || 0}/10</p>`)
          .join('')
      : '<p>Geen beperkingen opgegeven</p>'
  }

  <p style="margin-top:20px;color:#666;">Ingediend op: ${new Date(submission.submittedAt).toLocaleString('nl-NL')}</p>
  <p style="color:#666;">Gegenereerd door Hysio Pre-intake Module</p>
</body>
</html>
    `.trim();

    const blob = new Blob(['\ufeff', docxContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pre-intake-${data.personalia?.lastName}-${new Date(submission.submittedAt).toISOString().split('T')[0]}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Terug"
              >
                ←
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {data.personalia?.firstName} {data.personalia?.lastName}
            </h2>
            {submission.isProcessed && (
              <span className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700">
                ✓ Verwerkt
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Ingediend op{' '}
            {new Date(submission.submittedAt).toLocaleDateString('nl-NL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              📄 Export
              <span className="text-xs">▼</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={exportAsText}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <div className="font-medium text-sm">Text (.txt)</div>
                    <div className="text-xs text-gray-500">Platte tekst</div>
                  </div>
                </button>
                <button
                  onClick={exportAsHTML}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">🌐</span>
                  <div>
                    <div className="font-medium text-sm">HTML (.html)</div>
                    <div className="text-xs text-gray-500">Webpagina</div>
                  </div>
                </button>
                <button
                  onClick={exportAsPDF}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📑</span>
                  <div>
                    <div className="font-medium text-sm">PDF (.pdf)</div>
                    <div className="text-xs text-gray-500">Print naar PDF</div>
                  </div>
                </button>
                <button
                  onClick={exportAsDOCX}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📘</span>
                  <div>
                    <div className="font-medium text-sm">Word (.doc)</div>
                    <div className="text-xs text-gray-500">Microsoft Word</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          {!submission.isProcessed && (
            <button
              onClick={handleProcessToHHSB}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:bg-gray-400"
            >
              {isProcessing ? 'Bezig met verwerken...' : '→ Verwerk naar HHSB'}
            </button>
          )}
        </div>
      </div>

      {/* Red Flags Alert */}
      {submission.redFlagsSummary && submission.redFlagsSummary.length > 0 && (
        <RedFlagsIndicator redFlags={submission.redFlagsSummary} />
      )}

      {/* HHSB Preview */}
      {showHHSBPreview && hhsbData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900">✓ HHSB Gegenereerd</h3>
            <button
              onClick={() => setShowHHSBPreview(false)}
              className="text-green-700 hover:text-green-800"
            >
              ×
            </button>
          </div>
          <HHSBPreview hhsb={hhsbData} />
        </div>
      )}

      {/* Personalia */}
      <Section title="Persoonlijke Gegevens">
        <DataGrid>
          <DataItem label="Volledige naam">
            {data.personalia?.firstName} {data.personalia?.lastName}
          </DataItem>
          <DataItem label="Geboortedatum">{data.personalia?.dateOfBirth}</DataItem>
          <DataItem label="Geslacht">{data.personalia?.gender}</DataItem>
          <DataItem label="Telefoon">{data.personalia?.phone}</DataItem>
          <DataItem label="Email">{data.personalia?.email}</DataItem>
          <DataItem label="Adres">
            {data.personalia?.address}, {data.personalia?.postalCode} {data.personalia?.city}
          </DataItem>
        </DataGrid>
      </Section>

      {/* Complaint (LOFTIG) */}
      <Section title="Klacht (LOFTIG Framework)">
        <DataGrid>
          <DataItem label="L - Locatie">
            {data.complaint?.bodyRegions?.map((r) => BODY_REGION_LABELS[r]).join(', ') || 'Niet opgegeven'}
          </DataItem>
          <DataItem label="O - Ontstaan">{data.complaint?.onset}</DataItem>
          <DataItem label="F - Frequentie">{data.complaint?.frequency}</DataItem>
          <DataItem label="T - Tijdsduur">{data.complaint?.duration}</DataItem>
          <DataItem label="I - Intensiteit (VAS)">{data.complaint?.intensity}/10</DataItem>
          <DataItem label="G - Geschiedenis">
            {data.complaint?.hasOccurredBefore ? 'Eerder voorgekomen' : 'Eerste keer'}
          </DataItem>
        </DataGrid>
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Beschrijving</h4>
          <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{data.complaint?.description}</p>
        </div>
        {data.complaint?.previousOccurrence && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Eerdere voorvallen</h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {data.complaint.previousOccurrence}
            </p>
          </div>
        )}
      </Section>

      {/* Medical History */}
      <Section title="Medische Geschiedenis">
        <DataGrid>
          <DataItem label="Recente operaties">
            {data.medicalHistory?.hasRecentSurgeries ? 'Ja' : 'Nee'}
          </DataItem>
          {data.medicalHistory?.surgeryDetails && (
            <DataItem label="Operatie details" fullWidth>
              {data.medicalHistory.surgeryDetails}
            </DataItem>
          )}
          <DataItem label="Medicatie gebruik">
            {data.medicalHistory?.takesMedication ? 'Ja' : 'Nee'}
          </DataItem>
          {data.medicalHistory?.medications && data.medicalHistory.medications.length > 0 && (
            <DataItem label="Medicijnen" fullWidth>
              {data.medicalHistory.medications.join(', ')}
            </DataItem>
          )}
          <DataItem label="Roken">{data.medicalHistory?.smokingStatus}</DataItem>
          <DataItem label="Alcohol">{data.medicalHistory?.alcoholConsumption}</DataItem>
        </DataGrid>
        {data.medicalHistory?.otherConditions && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Andere aandoeningen</h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {data.medicalHistory.otherConditions}
            </p>
          </div>
        )}
      </Section>

      {/* Goals (SCEGS) */}
      <Section title="Doelen & Verwachtingen (SCEGS Framework)">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              S - Somatisch (Behandeldoelen)
            </h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{data.goals?.treatmentGoals}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              C - Cognitief (Gedachten over oorzaak)
            </h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{data.goals?.thoughtsOnCause}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              E - Emotioneel (Invloed op stemming)
            </h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{data.goals?.moodImpact}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              G/S - Gedragsmatig/Sociaal (Beperkte activiteiten)
            </h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {data.goals?.limitedActivities}
            </p>
          </div>
        </div>
      </Section>

      {/* Functional Limitations */}
      <Section title="Functionele Beperkingen">
        {data.functionalLimitations?.limitedActivityCategories &&
        data.functionalLimitations.limitedActivityCategories.length > 0 ? (
          <div className="space-y-3">
            {data.functionalLimitations.limitedActivityCategories.map((category) => {
              const severity = data.functionalLimitations?.severityScores?.[category] || 0;
              const severityLabel =
                severity === 0
                  ? 'Niet beperkt'
                  : severity <= 3
                  ? 'Licht beperkt'
                  : severity <= 6
                  ? 'Matig beperkt'
                  : severity <= 9
                  ? 'Ernstig beperkt'
                  : 'Volledig beperkt';

              return (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900 font-medium capitalize">{category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
                        style={{ width: `${(severity / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-32">
                      {severity}/10 - {severityLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">Geen functionele beperkingen opgegeven</p>
        )}
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function DataGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function DataItem({
  label,
  children,
  fullWidth,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
      <dd className="text-gray-900">{children || <span className="text-gray-400 italic">Niet opgegeven</span>}</dd>
    </div>
  );
}