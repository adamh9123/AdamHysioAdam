// API endpoint for EduPack generation
// Main endpoint for AI-powered patient education content generation

import { NextRequest, NextResponse } from 'next/server';
import { EduPackContentGenerator } from '@/lib/edupack/content-generator';
import { sessionDataParser } from '@/lib/edupack/session-data-parser';
import { privacyFilter } from '@/lib/edupack/privacy-filter';
import { PersonalizationEngine } from '@/lib/edupack/personalization-engine';
import { contentValidator } from '@/lib/edupack/content-validator';

import type {
  EduPackGenerationRequest,
  EduPackGenerationResponse,
  EduPackContent
} from '@/lib/types/edupack';

export const runtime = 'nodejs';

// Rate limiting and caching
const generationCache = new Map<string, { content: EduPackContent; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function generateCacheKey(request: EduPackGenerationRequest): string {
  const key = JSON.stringify({
    sessionId: request.sessionId,
    sections: request.preferences.sections.sort(),
    language: request.preferences.language,
    tone: request.preferences.tone
  });
  return Buffer.from(key).toString('base64').slice(0, 32);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Parse request body
    const body: EduPackGenerationRequest = await request.json();

    // Validate request
    const validation = validateGenerationRequest(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: validation.error || 'Invalid request parameters'
        },
        processingTime: Date.now() - startTime
      } as EduPackGenerationResponse, { status: 400 });
    }

    // Check cache for recent generation
    const cacheKey = generateCacheKey(body);
    const cached = generationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        eduPackId: cached.content.id,
        content: cached.content,
        processingTime: Date.now() - startTime,
        fromCache: true
      } as EduPackGenerationResponse);
    }

    // Extract and parse session data
    const sessionData = sessionDataParser.parseSessionData(body);

    // Create personalization profile
    const personalizationProfile = PersonalizationEngine.extractPersonalizationProfile(body, sessionData);

    // Generate base content
    const contentGenerator = EduPackContentGenerator.getInstance();
    const generationResult = await contentGenerator.generateEduPack(body);

    if (!generationResult.success || !generationResult.content) {
      return NextResponse.json({
        success: false,
        error: generationResult.error || {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate EduPack content'
        },
        processingTime: Date.now() - startTime
      } as EduPackGenerationResponse, { status: 500 });
    }

    let finalContent = generationResult.content;

    // Apply personalization
    const personalizationEngine = new PersonalizationEngine();
    finalContent = personalizationEngine.personalizeEduPack(
      finalContent,
      personalizationProfile,
      sessionData
    );

    // Apply privacy filtering to each section
    finalContent.sections = finalContent.sections.map(section => {
      if (section.enabled && section.content.trim()) {
        const filterResult = privacyFilter.filterContent(
          section.content,
          sessionData.patientInfo?.name
        );

        // Log removed items for audit trail
        if (filterResult.removedItems.length > 0) {
          console.log(`Privacy filter removed ${filterResult.removedItems.length} items from ${section.type} section`);
        }

        return {
          ...section,
          content: filterResult.filteredText
        };
      }
      return section;
    });

    // Validate final content
    const contentValidation = contentValidator.validateEduPack(finalContent);

    // Update content status based on validation
    finalContent.status = contentValidation.isValid ? 'ready' : 'draft';

    // Cache successful generation
    generationCache.set(cacheKey, {
      content: finalContent,
      timestamp: Date.now()
    });

    // Clean up old cache entries
    cleanupCache();

    const response: EduPackGenerationResponse = {
      success: true,
      eduPackId: finalContent.id,
      content: finalContent,
      processingTime: Date.now() - startTime,
      tokensUsed: generationResult.tokensUsed,
      validation: contentValidation
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('EduPack generation error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal error occurred during generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      processingTime: Date.now() - startTime
    } as EduPackGenerationResponse, { status: 500 });
  }
}

// Request validation
function validateGenerationRequest(request: EduPackGenerationRequest): {
  isValid: boolean;
  error?: string;
} {
  // Check required fields
  if (!request.therapistId) {
    return { isValid: false, error: 'therapistId is required' };
  }

  if (!request.preferences) {
    return { isValid: false, error: 'preferences are required' };
  }

  if (!request.preferences.language) {
    return { isValid: false, error: 'language preference is required' };
  }

  if (!request.preferences.sections || request.preferences.sections.length === 0) {
    return { isValid: false, error: 'at least one section must be selected' };
  }

  // Validate sections
  const validSections = [
    'introduction',
    'session_summary',
    'diagnosis',
    'treatment_plan',
    'self_care',
    'warning_signs',
    'follow_up'
  ];

  const invalidSections = request.preferences.sections.filter(
    section => !validSections.includes(section)
  );

  if (invalidSections.length > 0) {
    return {
      isValid: false,
      error: `Invalid sections: ${invalidSections.join(', ')}`
    };
  }

  // Must have either session data or manual input
  if (!request.sessionData && !request.manualInput) {
    return {
      isValid: false,
      error: 'Either sessionData or manualInput is required'
    };
  }

  // Validate session data if provided
  if (request.sessionData) {
    // At least one data source should be present
    const hasData = request.sessionData.soepData ||
                   request.sessionData.transcript ||
                   request.sessionData.clinicalNotes ||
                   request.sessionData.patientInfo;

    if (!hasData) {
      return {
        isValid: false,
        error: 'sessionData must contain at least one data source'
      };
    }
  }

  // Validate manual input if provided
  if (request.manualInput) {
    if (!request.manualInput.sessionContext && !request.manualInput.pathology) {
      return {
        isValid: false,
        error: 'manualInput must contain sessionContext or pathology'
      };
    }
  }

  return { isValid: true };
}

// Cache cleanup
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of generationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 2) {
      generationCache.delete(key);
    }
  }
}

// Health check endpoint
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'edu-pack/generate',
    timestamp: new Date().toISOString(),
    cacheSize: generationCache.size
  });
}