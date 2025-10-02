/**
 * Mock data store for pre-intake submissions
 * In production, this would be replaced with a database
 */

import type { PreIntakeSubmission } from '@/types/pre-intake';

// Mock data store
const mockSubmissions: PreIntakeSubmission[] = [];

/**
 * Add a submission to the mock store
 */
export function addMockSubmission(submission: PreIntakeSubmission) {
  mockSubmissions.push(submission);
}

/**
 * Get all submissions from the mock store
 */
export function getMockSubmissions(): PreIntakeSubmission[] {
  return mockSubmissions;
}
