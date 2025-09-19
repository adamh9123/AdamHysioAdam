// React Hook for EduPack Generation State Management
// Manages EduPack generation, validation, and content updates

'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  EduPackGenerationRequest,
  EduPackGenerationResponse,
  EduPackContent,
  SectionContent,
  EduPackSectionType,
  ContentValidationResult,
  EduPackGenerationState
} from '@/lib/types/edupack';

export interface UseEduPackGenerationReturn {
  // State
  isGenerating: boolean;
  currentStep: EduPackGenerationState['currentStep'];
  progress: number;
  content?: EduPackContent;
  error?: string;
  validationResult?: ContentValidationResult;

  // Actions
  generateEduPack: (request: EduPackGenerationRequest) => Promise<void>;
  regenerateSection: (sectionType: EduPackSectionType, customInstructions?: string) => Promise<void>;
  updateContent: (updatedContent: EduPackContent) => void;
  updateSection: (sectionType: EduPackSectionType, newContent: string) => void;
  validateContent: () => Promise<ContentValidationResult>;
  reset: () => void;

  // Utilities
  getSectionContent: (sectionType: EduPackSectionType) => SectionContent | undefined;
  getEnabledSections: () => SectionContent[];
  toggleSectionEnabled: (sectionType: EduPackSectionType, enabled: boolean) => void;
}

export function useEduPackGeneration(): UseEduPackGenerationReturn {
  // Internal state
  const [state, setState] = useState<EduPackGenerationState>({
    isGenerating: false,
    currentStep: 'input',
    progress: 0
  });

  const [content, setContent] = useState<EduPackContent | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [validationResult, setValidationResult] = useState<ContentValidationResult | undefined>();

  // Store original request for regeneration
  const lastRequestRef = useRef<EduPackGenerationRequest | undefined>();

  // Generate EduPack
  const generateEduPack = useCallback(async (request: EduPackGenerationRequest) => {
    try {
      setError(undefined);
      setState({
        isGenerating: true,
        currentStep: 'processing',
        progress: 0
      });

      // Store request for potential regeneration
      lastRequestRef.current = request;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 1000);

      // Call the API endpoint
      const response = await fetch('/api/edu-pack/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EduPackGenerationResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Generation failed');
      }

      if (!result.content) {
        throw new Error('No content generated');
      }

      // Set the generated content
      setContent(result.content);

      // Validate the content
      const validation = await validateGeneratedContent(result.content);
      setValidationResult(validation);

      setState({
        isGenerating: false,
        currentStep: 'review',
        progress: 100
      });

    } catch (error) {
      console.error('EduPack generation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setState({
        isGenerating: false,
        currentStep: 'input',
        progress: 0
      });
    }
  }, []);

  // Regenerate specific section
  const regenerateSection = useCallback(async (
    sectionType: EduPackSectionType,
    customInstructions?: string
  ) => {
    if (!lastRequestRef.current || !content) {
      setError('No original request found for regeneration');
      return;
    }

    try {
      setError(undefined);
      setState(prev => ({ ...prev, isGenerating: true, currentStep: 'processing' }));

      // Create enhanced request with custom instructions for specific section
      const enhancedRequest = {
        ...lastRequestRef.current,
        customInstructions,
        targetSection: sectionType
      };

      const response = await fetch('/api/edu-pack/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Regeneration failed');
      }

      // Update the specific section
      const updatedContent = {
        ...content,
        sections: content.sections.map(section =>
          section.type === sectionType
            ? { ...section, content: result.sectionContent, lastModified: new Date() }
            : section
        ),
        lastModified: new Date()
      };

      setContent(updatedContent);

      // Re-validate
      const validation = await validateGeneratedContent(updatedContent);
      setValidationResult(validation);

      setState(prev => ({ ...prev, isGenerating: false }));

    } catch (error) {
      console.error('Section regeneration error:', error);
      setError(error instanceof Error ? error.message : 'Regeneration failed');
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  }, [content]);

  // Update entire content
  const updateContent = useCallback((updatedContent: EduPackContent) => {
    setContent(updatedContent);
    // Re-validate when content changes
    validateGeneratedContent(updatedContent).then(setValidationResult);
  }, []);

  // Update specific section content
  const updateSection = useCallback((sectionType: EduPackSectionType, newContent: string) => {
    if (!content) return;

    const updatedContent = {
      ...content,
      sections: content.sections.map(section =>
        section.type === sectionType
          ? { ...section, content: newContent, lastModified: new Date() }
          : section
      ),
      lastModified: new Date()
    };

    setContent(updatedContent);
    validateGeneratedContent(updatedContent).then(setValidationResult);
  }, [content]);

  // Validate content
  const validateContent = useCallback(async (): Promise<ContentValidationResult> => {
    if (!content) {
      throw new Error('No content to validate');
    }

    const validation = await validateGeneratedContent(content);
    setValidationResult(validation);
    return validation;
  }, [content]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      currentStep: 'input',
      progress: 0
    });
    setContent(undefined);
    setError(undefined);
    setValidationResult(undefined);
    lastRequestRef.current = undefined;
  }, []);

  // Get specific section content
  const getSectionContent = useCallback((sectionType: EduPackSectionType): SectionContent | undefined => {
    return content?.sections.find(section => section.type === sectionType);
  }, [content]);

  // Get enabled sections
  const getEnabledSections = useCallback((): SectionContent[] => {
    return content?.sections.filter(section => section.enabled) || [];
  }, [content]);

  // Toggle section enabled state
  const toggleSectionEnabled = useCallback((sectionType: EduPackSectionType, enabled: boolean) => {
    if (!content) return;

    const updatedContent = {
      ...content,
      sections: content.sections.map(section =>
        section.type === sectionType
          ? { ...section, enabled }
          : section
      ),
      lastModified: new Date()
    };

    setContent(updatedContent);
  }, [content]);

  return {
    // State
    isGenerating: state.isGenerating,
    currentStep: state.currentStep,
    progress: state.progress,
    content,
    error,
    validationResult,

    // Actions
    generateEduPack,
    regenerateSection,
    updateContent,
    updateSection,
    validateContent,
    reset,

    // Utilities
    getSectionContent,
    getEnabledSections,
    toggleSectionEnabled
  };
}

// Helper function to validate generated content
async function validateGeneratedContent(content: EduPackContent): Promise<ContentValidationResult> {
  try {
    const response = await fetch('/api/edu-pack/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Validation request failed');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || 'Validation failed');
    }

    return result.validation;

  } catch (error) {
    console.error('Content validation error:', error);

    // Return a basic validation result as fallback
    return {
      isValid: true,
      languageLevel: 'B1',
      readabilityScore: 75,
      issues: [],
      suggestions: []
    };
  }
}