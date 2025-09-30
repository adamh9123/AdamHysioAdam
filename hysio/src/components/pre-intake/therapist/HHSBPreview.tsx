/**
 * HHSB Preview Component
 *
 * Displays the generated HHSB structure (Hulpvraag, Historie, Stoornissen, Beperkingen)
 * in a readable format for therapist review.
 *
 * @module components/pre-intake/therapist/HHSBPreview
 */

'use client';

import React from 'react';
import type { HHSBStructure } from '@/types/pre-intake';

interface HHSBPreviewProps {
  hhsb: HHSBStructure;
}

export default function HHSBPreview({ hhsb }: HHSBPreviewProps) {
  const copyToClipboard = () => {
    const text = `
HHSB ANAMNESE
=============

HULPVRAAG
---------
${hhsb.hulpvraag}

HISTORIE
--------
${hhsb.historie}

STOORNISSEN
-----------
${hhsb.stoornissen}

BEPERKINGEN
-----------
${hhsb.beperkingen}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('HHSB gekopieerd naar klembord');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">HHSB Anamnese Preview</h3>
        <button
          onClick={copyToClipboard}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          📋 Kopieer
        </button>
      </div>

      <div className="space-y-4">
        {/* Hulpvraag */}
        <HHSBSection
          title="H - Hulpvraag"
          content={hhsb.hulpvraag}
          description="Wat wil de patiënt bereiken met de behandeling?"
        />

        {/* Historie */}
        <HHSBSection
          title="H - Historie"
          content={hhsb.historie}
          description="Ontstaansgeschiedenis en verloop van de klacht"
        />

        {/* Stoornissen */}
        <HHSBSection
          title="S - Stoornissen"
          content={hhsb.stoornissen}
          description="Objectieve bevindingen en functiestoornissen"
        />

        {/* Beperkingen */}
        <HHSBSection
          title="B - Beperkingen"
          content={hhsb.beperkingen}
          description="Activiteiten die de patiënt niet meer kan uitvoeren"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Let op:</strong> Deze HHSB is automatisch gegenereerd op basis van de pre-intake gegevens.
          Controleer en pas aan waar nodig tijdens het intake gesprek.
        </p>
      </div>
    </div>
  );
}

function HHSBSection({
  title,
  content,
  description,
}: {
  title: string;
  content: string;
  description: string;
}) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <div className="p-4 bg-white">
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    </div>
  );
}