// Response compression and payload optimization utilities

import type { HHSBProcessResponse, SOEPProcessResponse, PreparationResponse } from '@/types/api';

// Compress large text fields for efficient transport
export function compressResponse<T extends Record<string, any>>(response: T): T {
  const compressed = { ...response };

  // Compress large text fields by removing excessive whitespace
  if (typeof compressed.fullStructuredText === 'string') {
    compressed.fullStructuredText = compressText(compressed.fullStructuredText);
  }

  if (typeof compressed.transcript === 'string') {
    compressed.transcript = compressText(compressed.transcript);
  }

  if (compressed.hhsbStructure) {
    compressed.hhsbStructure = compressHHSBStructure(compressed.hhsbStructure);
  }

  if (compressed.soepStructure) {
    compressed.soepStructure = compressSOEPStructure(compressed.soepStructure);
  }

  return compressed;
}

// Compress text by normalizing whitespace and removing redundancy
function compressText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();
}

// Optimize HHSB structure for smaller payload
function compressHHSBStructure(structure: any): any {
  return {
    ...structure,
    hulpvraag: compressText(structure.hulpvraag || ''),
    historie: compressText(structure.historie || ''),
    stoornissen: compressText(structure.stoornissen || ''),
    beperkingen: compressText(structure.beperkingen || ''),
    anamneseSummary: compressText(structure.anamneseSummary || ''),
    fullStructuredText: compressText(structure.fullStructuredText || ''),
    redFlags: structure.redFlags?.map((flag: string) => compressText(flag)) || []
  };
}

// Optimize SOEP structure for smaller payload
function compressSOEPStructure(structure: any): any {
  return {
    ...structure,
    subjectief: compressText(structure.subjectief || ''),
    objectief: compressText(structure.objectief || ''),
    evaluatie: compressText(structure.evaluatie || ''),
    plan: compressText(structure.plan || ''),
    consultSummary: compressText(structure.consultSummary || ''),
    fullStructuredText: compressText(structure.fullStructuredText || ''),
    redFlags: structure.redFlags?.map((flag: string) => compressText(flag)) || []
  };
}

// Calculate response payload size
export function calculatePayloadSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size;
}

// Optimize response based on size thresholds
export function optimizeResponse<T extends Record<string, any>>(
  response: T,
  maxSize: number = 50 * 1024 // 50KB default
): T {
  let optimized = compressResponse(response);
  let currentSize = calculatePayloadSize(optimized);

  // If still too large, apply more aggressive optimizations
  if (currentSize > maxSize) {
    optimized = applyAggressiveOptimization(optimized, maxSize);
  }

  console.debug(`Response optimized: ${currentSize} bytes -> ${calculatePayloadSize(optimized)} bytes`);
  return optimized;
}

// Apply more aggressive optimizations if needed
function applyAggressiveOptimization<T extends Record<string, any>>(
  response: T,
  targetSize: number
): T {
  const optimized = { ...response };

  // Truncate very long text fields if necessary
  if (optimized.transcript && optimized.transcript.length > 2000) {
    optimized.transcript = optimized.transcript.substring(0, 2000) + '... [truncated]';
  }

  // Remove redundant full text if structured data exists
  if (optimized.hhsbStructure || optimized.soepStructure) {
    // Keep structured data, compress full text more aggressively
    if (optimized.fullStructuredText && optimized.fullStructuredText.length > 1000) {
      optimized.fullStructuredText = optimized.fullStructuredText.substring(0, 1000) + '... [truncated]';
    }
  }

  return optimized;
}

// Smart field selection for mobile/low-bandwidth clients
export function createMobileOptimizedResponse<T extends Record<string, any>>(
  response: T,
  includeFullText: boolean = false
): Partial<T> {
  const mobileResponse: Partial<T> = {
    ...response,
    processedAt: response.processedAt,
    workflowType: response.workflowType,
    patientInfo: response.patientInfo
  };

  // Include only essential structured data for mobile
  if (response.hhsbStructure) {
    mobileResponse.hhsbStructure = {
      hulpvraag: response.hhsbStructure.hulpvraag?.substring(0, 200) + (response.hhsbStructure.hulpvraag?.length > 200 ? '...' : ''),
      historie: response.hhsbStructure.historie?.substring(0, 200) + (response.hhsbStructure.historie?.length > 200 ? '...' : ''),
      stoornissen: response.hhsbStructure.stoornissen?.substring(0, 200) + (response.hhsbStructure.stoornissen?.length > 200 ? '...' : ''),
      beperkingen: response.hhsbStructure.beperkingen?.substring(0, 200) + (response.hhsbStructure.beperkingen?.length > 200 ? '...' : ''),
      anamneseSummary: response.hhsbStructure.anamneseSummary,
      redFlags: response.hhsbStructure.redFlags?.slice(0, 3) || [] // Limit to 3 most important red flags
    } as any;
  }

  if (response.soepStructure) {
    mobileResponse.soepStructure = {
      subjectief: response.soepStructure.subjectief?.substring(0, 200) + (response.soepStructure.subjectief?.length > 200 ? '...' : ''),
      objectief: response.soepStructure.objectief?.substring(0, 200) + (response.soepStructure.objectief?.length > 200 ? '...' : ''),
      evaluatie: response.soepStructure.evaluatie?.substring(0, 200) + (response.soepStructure.evaluatie?.length > 200 ? '...' : ''),
      plan: response.soepStructure.plan?.substring(0, 200) + (response.soepStructure.plan?.length > 200 ? '...' : ''),
      consultSummary: response.soepStructure.consultSummary,
      redFlags: response.soepStructure.redFlags?.slice(0, 3) || []
    } as any;
  }

  // Optionally include compressed full text
  if (includeFullText && response.fullStructuredText) {
    mobileResponse.fullStructuredText = compressText(response.fullStructuredText);
  }

  // Include compressed transcript for reference
  if (response.transcript) {
    mobileResponse.transcript = response.transcript.substring(0, 300) + (response.transcript.length > 300 ? '... [truncated]' : '');
  }

  return mobileResponse;
}

// Response metadata for optimization analytics
export interface ResponseMetadata {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  optimizationTime: number;
  clientType: 'desktop' | 'mobile' | 'tablet';
}

// Generate response with metadata
export function generateOptimizedResponseWithMetadata<T extends Record<string, any>>(
  originalResponse: T,
  clientType: 'desktop' | 'mobile' | 'tablet' = 'desktop'
): { response: T | Partial<T>; metadata: ResponseMetadata } {
  const startTime = performance.now();
  const originalSize = calculatePayloadSize(originalResponse);

  let optimizedResponse: T | Partial<T>;

  switch (clientType) {
    case 'mobile':
      optimizedResponse = createMobileOptimizedResponse(originalResponse, false);
      break;
    case 'tablet':
      optimizedResponse = createMobileOptimizedResponse(originalResponse, true);
      break;
    default:
      optimizedResponse = optimizeResponse(originalResponse);
  }

  const endTime = performance.now();
  const compressedSize = calculatePayloadSize(optimizedResponse);

  const metadata: ResponseMetadata = {
    originalSize,
    compressedSize,
    compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1,
    optimizationTime: endTime - startTime,
    clientType
  };

  return { response: optimizedResponse, metadata };
}

// Utility to detect client type from user agent
export function detectClientType(userAgent?: string): 'desktop' | 'mobile' | 'tablet' {
  if (!userAgent) return 'desktop';

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bTablet\b)|KFAPWI/i.test(userAgent);

  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}