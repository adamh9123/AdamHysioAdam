/**
 * Pre-intake Dashboard Page (Therapist View)
 *
 * Lists all submitted pre-intake questionnaires with filtering and search.
 *
 * @module app/scribe/pre-intake/page
 */

'use client';

import React from 'react';
import PreIntakeList from '@/components/pre-intake/therapist/PreIntakeList';

export default function PreIntakeDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pre-intake Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overzicht van alle ingediende pre-intake formulieren
          </p>
        </div>

        <PreIntakeList />
      </div>
    </div>
  );
}