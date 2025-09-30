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
          <button
            onClick={exportAsText}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            📄 Export
          </button>
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