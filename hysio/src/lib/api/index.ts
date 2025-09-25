// API integration utilities for Hysio Medical Scribe

import { performanceMonitor } from '@/lib/monitoring/performance-monitor';

export const API_ENDPOINTS = {
  TRANSCRIPTION: '/api/transcribe',
  GENERATE_CONTENT: '/api/generate',
  AI_ANALYSIS: '/api/generate', // Use the same generate endpoint for AI analysis
  ASSISTANT: '/api/assistant',
  SESSIONS: '/api/sessions',
} as const;

// API response wrapper type
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Base API utility function with comprehensive logging
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const startTime = Date.now();
  console.log(`🚀 API CALL START: ${endpoint}`, {
    method: options.method || 'GET',
    hasBody: !!options.body,
    bodyPreview: options.body ? String(options.body).substring(0, 200) + '...' : null,
    timestamp: new Date().toISOString()
  });

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      console.error(`❌ API CALL FAILED: ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        duration: `${duration}ms`,
        endpoint,
        method: options.method || 'GET'
      });

      // Record performance metrics for failed requests
      performanceMonitor.recordAPICall(endpoint, duration, true, false);

      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    console.log(`✅ API CALL SUCCESS: ${endpoint}`, {
      status: response.status,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(data).length,
      hasData: !!data,
      dataPreview: data ? JSON.stringify(data).substring(0, 200) + '...' : null
    });

    // Record performance metrics
    performanceMonitor.recordAPICall(endpoint, duration, false, false);

    return {
      success: true,
      data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`🔥 API CALL ERROR: ${endpoint}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      endpoint,
      method: options.method || 'GET',
      stack: error instanceof Error ? error.stack : null
    });

    // Record performance metrics for exception errors
    performanceMonitor.recordAPICall(endpoint, duration, true, false);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Export transcription utilities
export * from './transcription';
export * from './groq';

// Export OpenAI utilities
export * from './openai';