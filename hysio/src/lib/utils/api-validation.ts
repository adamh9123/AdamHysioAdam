// Shared API validation utilities for Hysio Medical Scribe

import type { PatientInfo, InputData } from '@/types/api';

/**
 * Validates patient information structure
 */
export function isValidPatientInfo(patientInfo: unknown): patientInfo is PatientInfo {
  return (
    typeof patientInfo === 'object' &&
    patientInfo !== null &&
    typeof patientInfo.initials === 'string' &&
    typeof patientInfo.birthYear === 'string' &&
    typeof patientInfo.gender === 'string' &&
    ['male', 'female', 'other'].includes(patientInfo.gender) &&
    typeof patientInfo.chiefComplaint === 'string' &&
    (patientInfo.additionalInfo === undefined || typeof patientInfo.additionalInfo === 'string')
  );
}

/**
 * Validates input data structure for audio/manual processing
 */
export function isValidInputData(inputData: unknown): inputData is InputData {
  if (typeof inputData !== 'object' || inputData === null) {
    return false;
  }

  const { type, data } = inputData;

  if (!['recording', 'file', 'manual'].includes(type)) {
    return false;
  }

  if (type === 'manual') {
    return typeof data === 'string';
  }

  if (type === 'recording' || type === 'file') {
    return data instanceof Blob || data instanceof File;
  }

  return false;
}

/**
 * Validates workflow type
 */
export function isValidWorkflowType(workflowType: string): boolean {
  return ['intake-automatisch', 'intake-stapsgewijs', 'consult'].includes(workflowType);
}

/**
 * Validates workflow step for stepwise intake
 */
export function isValidWorkflowStep(step: string): boolean {
  return ['preparation', 'anamnese', 'onderzoek', 'klinische-conclusie', 'consult'].includes(step);
}

/**
 * Creates a standardized validation error response
 */
export function createValidationError(field: string, message: string) {
  return {
    success: false,
    error: `Validation failed for field: ${field}`,
    message,
    field
  };
}

/**
 * Creates a standardized server error response
 */
export function createServerError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  return {
    success: false,
    error: `Server error in ${context}`,
    message: errorMessage
  };
}

/**
 * Validates that a transcript has meaningful content
 */
export function isValidTranscript(transcript: string): boolean {
  return transcript && transcript.trim().length > 0;
}