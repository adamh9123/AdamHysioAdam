/**
 * HHSB (Hulpvraag, Historie, Stoornissen, Beperkingen) Parser
 *
 * Centralized parsing utility for HHSB structured text.
 * Extracts individual sections from formatted text output.
 */

import type { HHSBStructure } from '@/lib/types';

export interface ParseHHSBOptions {
  strict?: boolean; // If true, throws error on invalid input
  defaultToEmpty?: boolean; // If true, returns empty structure instead of null
}

/**
 * Parse HHSB structured text into individual sections
 *
 * @param fullText - The complete HHSB formatted text
 * @param options - Parsing options
 * @returns Parsed HHSB structure or null if invalid
 */
export function parseHHSBText(
  fullText: string,
  options: ParseHHSBOptions = {}
): HHSBStructure | null {
  const { strict = false, defaultToEmpty = true } = options;

  // Input validation
  if (!fullText || typeof fullText !== 'string') {
    if (strict) {
      throw new Error('parseHHSBText: Invalid input provided');
    }

    if (defaultToEmpty) {
      console.warn('parseHHSBText: Invalid input provided, returning empty structure');
      return createEmptyHHSBStructure();
    }

    return null;
  }

  const result: HHSBStructure = {
    hulpvraag: '',
    historie: '',
    stoornissen: '',
    beperkingen: '',
    redFlags: [],
    fullStructuredText: fullText,
    anamneseSummary: '',
  };

  try {
    // Comprehensive regex patterns for robust parsing
    const sectionPatterns = [
      // Hulpvraag patterns - more comprehensive
      {
        key: 'hulpvraag' as keyof HHSBStructure,
        patterns: [
          /\*\*H\s*[-:]?\s*Hulpvraag\s*(?:\/\s*Patiënt\s*Probleem)?:?\s*\*\*\s*([\s\S]*?)(?=\*\*[HhSsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Hulpvraag:?\s*\*\*\s*([\s\S]*?)(?=\*\*[HhSsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*H\s*[-:]?\s*\*\*\s*([\s\S]*?)(?=\*\*[HhSsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      },
      // Historie patterns - enhanced
      {
        key: 'historie' as keyof HHSBStructure,
        patterns: [
          /\*\*H\s*[-:]?\s*Historie:?\s*\*\*\s*([\s\S]*?)(?=\*\*[SsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Historie:?\s*\*\*\s*([\s\S]*?)(?=\*\*[SsBb]|\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      },
      // Stoornissen patterns - enhanced
      {
        key: 'stoornissen' as keyof HHSBStructure,
        patterns: [
          /\*\*S\s*[-:]?\s*Stoornissen\s*(?:in\s*lichaamsfuncties\s*en\s*anatomische\s*structuren)?:?\s*\*\*\s*([\s\S]*?)(?=\*\*[Bb]|\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Stoornissen:?\s*\*\*\s*([\s\S]*?)(?=\*\*[Bb]|\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      },
      // Beperkingen patterns - enhanced
      {
        key: 'beperkingen' as keyof HHSBStructure,
        patterns: [
          /\*\*B\s*[-:]?\s*Beperkingen:?\s*\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|\*\*Rode|$)/im,
          /\*\*Beperkingen:?\s*\*\*\s*([\s\S]*?)(?=\*\*Samenvatting|\*\*Rode|$)/im,
        ]
      }
    ];

    // Extract content for each section with better parsing
    sectionPatterns.forEach(({ key, patterns }) => {
      for (const pattern of patterns) {
        const match = fullText.match(pattern);
        if (match && match[1]) {
          // Clean and trim the content
          const content = match[1]
            .replace(/^\s*[\n\r]+/, '') // Remove leading whitespace/newlines
            .replace(/[\n\r]+\s*$/, '') // Remove trailing whitespace/newlines
            .trim();

          if (content) {
            result[key] = content;
            break;
          }
        }
      }
    });

    // Extract anamnesis summary
    const summaryPatterns = [
      /\*\*Samenvatting\s*(?:Anamnese)?:?\s*\*\*\s*([\s\S]*?)(?=\*\*Rode|$)/im,
      /\*\*Anamnese\s*Samenvatting:?\s*\*\*\s*([\s\S]*?)(?=\*\*Rode|$)/im,
    ];

    for (const pattern of summaryPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        result.anamneseSummary = match[1].trim();
        break;
      }
    }

    // Enhanced red flags extraction
    result.redFlags = extractRedFlags(fullText);

    return result;
  } catch (error) {
    console.error('Critical error in parseHHSBText:', error);

    if (strict) {
      throw error;
    }

    return defaultToEmpty ? createEmptyHHSBStructure(fullText) : null;
  }
}

/**
 * Extract red flags from HHSB text
 */
function extractRedFlags(fullText: string): string[] {
  const redFlags: string[] = [];

  const redFlagPatterns = [
    /\*\*Rode\s*Vlagen:?\s*\*\*\s*([\s\S]*?)$/im,
    /\[RODE\s*VLAG\s*:?\s*([^\]]+)\]/gim
  ];

  for (const pattern of redFlagPatterns) {
    try {
      if (pattern.global) {
        const matches = Array.from(fullText.matchAll(pattern));
        for (const match of matches) {
          if (match && match[1]) {
            const flag = match[1].trim();
            if (flag && !redFlags.includes(flag)) {
              redFlags.push(flag);
            }
          }
        }
      } else {
        const match = fullText.match(pattern);
        if (match && match[1]) {
          const flags = match[1]
            .split(/[\n\r]+/)
            .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())
            .filter(line => line.length > 0);

          flags.forEach(flag => {
            if (!redFlags.includes(flag)) {
              redFlags.push(flag);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error extracting red flags:', error);
    }
  }

  return redFlags;
}

/**
 * Create an empty HHSB structure
 */
export function createEmptyHHSBStructure(fullText = ''): HHSBStructure {
  return {
    hulpvraag: '',
    historie: '',
    stoornissen: '',
    beperkingen: '',
    redFlags: [],
    fullStructuredText: fullText,
    anamneseSummary: '',
  };
}

/**
 * Validate if HHSB structure is complete
 */
export function isHHSBComplete(structure: HHSBStructure): boolean {
  return !!(
    structure.hulpvraag &&
    structure.historie &&
    structure.stoornissen &&
    structure.beperkingen
  );
}

/**
 * Get HHSB completeness percentage
 */
export function getHHSBCompleteness(structure: HHSBStructure): number {
  const fields = [
    structure.hulpvraag,
    structure.historie,
    structure.stoornissen,
    structure.beperkingen
  ];

  const filledFields = fields.filter(field => field && field.trim().length > 0).length;
  return Math.round((filledFields / fields.length) * 100);
}

/**
 * Build full structured text from HHSB structure
 */
export function buildHHSBText(structure: HHSBStructure): string {
  const sections = [];

  if (structure.hulpvraag) {
    sections.push(`**H - Hulpvraag:**\n${structure.hulpvraag}`);
  }

  if (structure.historie) {
    sections.push(`**H - Historie:**\n${structure.historie}`);
  }

  if (structure.stoornissen) {
    sections.push(`**S - Stoornissen:**\n${structure.stoornissen}`);
  }

  if (structure.beperkingen) {
    sections.push(`**B - Beperkingen:**\n${structure.beperkingen}`);
  }

  if (structure.anamneseSummary) {
    sections.push(`**Samenvatting Anamnese:**\n${structure.anamneseSummary}`);
  }

  if (structure.redFlags && structure.redFlags.length > 0) {
    const flagsList = structure.redFlags.map(flag => `- ${flag}`).join('\n');
    sections.push(`**Rode Vlagen:**\n${flagsList}`);
  }

  return sections.join('\n\n');
}