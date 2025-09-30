/**
 * Pre-intake List Component (Therapist Dashboard)
 *
 * Displays a list of submitted pre-intake questionnaires with:
 * - Patient information
 * - Submission date
 * - Red flags indicators
 * - Processing status
 * - Search and filter functionality
 *
 * @module components/pre-intake/therapist/PreIntakeList
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { PreIntakeSubmission } from '@/types/pre-intake';

interface PreIntakeListProps {
  onSelectSubmission?: (submissionId: string) => void;
}

export default function PreIntakeList({ onSelectSubmission }: PreIntakeListProps) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<PreIntakeSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unprocessed' | 'processed'>('all');
  const [filterRedFlags, setFilterRedFlags] = useState<'all' | 'flagged' | 'none'>('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pre-intake/submissions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } else {
        const error = await response.json();
        setError(error.message || 'Fout bij laden van pre-intake formulieren');
      }
    } catch (error) {
      console.error('Load submissions error:', error);
      setError('Netwerkfout bij laden van gegevens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    if (onSelectSubmission) {
      onSelectSubmission(submissionId);
    } else {
      router.push(`/scribe/pre-intake/${submissionId}`);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      `${submission.questionnaireData.personalia?.firstName} ${submission.questionnaireData.personalia?.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      submission.questionnaireData.personalia?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'processed' && submission.isProcessed) ||
      (filterStatus === 'unprocessed' && !submission.isProcessed);

    // Red flags filter
    const hasRedFlags = submission.redFlagsSummary && submission.redFlagsSummary.length > 0;
    const matchesRedFlags =
      filterRedFlags === 'all' ||
      (filterRedFlags === 'flagged' && hasRedFlags) ||
      (filterRedFlags === 'none' && !hasRedFlags);

    return matchesSearch && matchesStatus && matchesRedFlags;
  });

  const getRedFlagSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-600 text-white';
      case 'urgent':
        return 'bg-orange-500 text-white';
      case 'referral':
        return 'bg-yellow-500 text-gray-900';
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadSubmissions}
          className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Probeer opnieuw
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pre-intake Formulieren</h2>
          <p className="text-sm text-gray-600 mt-1">
            {submissions.length} totaal, {filteredSubmissions.length} gefilterd
          </p>
        </div>
        <button
          onClick={loadSubmissions}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          ↻ Vernieuwen
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-300 p-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Zoeken
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Naam of email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="all">Alle</option>
              <option value="unprocessed">Niet verwerkt</option>
              <option value="processed">Verwerkt</option>
            </select>
          </div>

          {/* Red Flags Filter */}
          <div>
            <label htmlFor="redFlagsFilter" className="block text-sm font-medium text-gray-700 mb-2">
              Red Flags
            </label>
            <select
              id="redFlagsFilter"
              value={filterRedFlags}
              onChange={(e) => setFilterRedFlags(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="all">Alle</option>
              <option value="flagged">Met red flags</option>
              <option value="none">Zonder red flags</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500">Geen pre-intake formulieren gevonden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((submission) => {
            const hasRedFlags = submission.redFlagsSummary && submission.redFlagsSummary.length > 0;
            const highestSeverity = hasRedFlags
              ? submission.redFlagsSummary.reduce((max, flag) => {
                  const severityRank = { emergency: 3, urgent: 2, referral: 1 };
                  return (severityRank[flag.severity as keyof typeof severityRank] || 0) >
                    (severityRank[max as keyof typeof severityRank] || 0)
                    ? flag.severity
                    : max;
                }, 'referral')
              : null;

            return (
              <div
                key={submission.sessionId}
                onClick={() => handleSelectSubmission(submission.sessionId)}
                className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {submission.questionnaireData.personalia?.firstName}{' '}
                        {submission.questionnaireData.personalia?.lastName}
                      </h3>
                      {hasRedFlags && highestSeverity && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getRedFlagSeverityColor(
                            highestSeverity
                          )}`}
                        >
                          ⚠ Red Flag
                        </span>
                      )}
                      {submission.isProcessed && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                          ✓ Verwerkt
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span>{' '}
                        {submission.questionnaireData.personalia?.email}
                      </div>
                      <div>
                        <span className="font-medium">Telefoon:</span>{' '}
                        {submission.questionnaireData.personalia?.phone}
                      </div>
                      <div>
                        <span className="font-medium">Ingediend:</span>{' '}
                        {new Date(submission.submittedAt).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {submission.questionnaireData.complaint?.intensity !== undefined && (
                        <div>
                          <span className="font-medium">Pijn:</span>{' '}
                          {submission.questionnaireData.complaint.intensity}/10
                        </div>
                      )}
                    </div>

                    {hasRedFlags && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-red-700 mb-1">
                          Red Flags Gedetecteerd:
                        </p>
                        <ul className="text-xs text-red-600 space-y-1">
                          {submission.redFlagsSummary.slice(0, 2).map((flag, idx) => (
                            <li key={idx}>• {flag.type}</li>
                          ))}
                          {submission.redFlagsSummary.length > 2 && (
                            <li>• +{submission.redFlagsSummary.length - 2} meer...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}