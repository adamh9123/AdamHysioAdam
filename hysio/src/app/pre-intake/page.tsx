/**
 * Pre-intake Questionnaire Entry Page
 *
 * Initiates a new pre-intake session with a unique session ID.
 * Redirects to the session-specific page for the questionnaire flow.
 *
 * @module app/pre-intake/page
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function PreIntakePage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a unique session ID
    const sessionId = nanoid(21); // 21 characters for URL-safe uniqueness

    // Redirect to the session-specific page
    router.push(`/pre-intake/${sessionId}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className="text-gray-600">Bezig met voorbereiden...</p>
      </div>
    </div>
  );
}