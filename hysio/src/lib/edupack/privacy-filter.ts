// Privacy Filter for Hysio EduPack Module
// Advanced content filtering to remove confidential information and internal notes

import type { PrivacyFilterConfig } from '@/lib/types/edupack';

// Default privacy filter configuration
const DEFAULT_PRIVACY_CONFIG: PrivacyFilterConfig = {
  removeInternalNotes: true,
  removePII: true,
  removeOtherPatients: true,
  confidentialKeywords: [
    // Internal workflow keywords
    'intern', 'notitie', 'nota', 'TODO', 'FIXME', 'check',
    'collega', 'overleg', 'bespreken', 'navragen',

    // Financial/administrative
    'declaratie', 'rekening', 'betaling', 'verzekering',
    'DBC', 'zorgverzekering', 'eigen risico',

    // Legal/medical professional
    'juridisch', 'advocaat', 'rechtszaak', 'klacht',
    'incident', 'melden', 'rapport schrijven',

    // Personal staff information
    'privé', 'thuis', 'vakantie', 'ziek',
    'personeelsvergadering', 'teamoverleg',

    // Technical/system
    'systeem', 'software', 'backup', 'server',
    'login', 'wachtwoord', 'database'
  ],
  allowedMedicalTerms: [
    // Basic anatomical terms that are educational
    'rug', 'ruggengraat', 'wervelkolom', 'spier', 'gewricht',
    'pees', 'ligament', 'bot', 'kraakbeen', 'zenuw',
    'bloedvat', 'hart', 'long', 'lever', 'nier',

    // Common conditions in physiotherapy
    'artrose', 'arthritis', 'hernia', 'RSI', 'whiplash',
    'fibromyalgie', 'osteoporose', 'scoliose',

    // Treatment terms
    'fysiotherapie', 'manuele therapie', 'massage', 'oefentherapie',
    'mobilisatie', 'manipulatie', 'stretch', 'kracht',
    'mobiliteit', 'stabiliteit', 'coordinatie'
  ]
};

export interface FilterResult {
  filteredText: string;
  removedItems: {
    type: 'internal_note' | 'pii' | 'other_patient' | 'confidential';
    original: string;
    reason: string;
  }[];
  warningFlags: {
    type: 'potential_pii' | 'unclear_reference' | 'medical_complexity';
    text: string;
    suggestion: string;
  }[];
}

export class EduPackPrivacyFilter {
  private config: PrivacyFilterConfig;

  constructor(config?: Partial<PrivacyFilterConfig>) {
    this.config = { ...DEFAULT_PRIVACY_CONFIG, ...config };
  }

  // Main filtering function
  filterContent(text: string, patientName?: string): FilterResult {
    let filteredText = text;
    const removedItems: FilterResult['removedItems'] = [];
    const warningFlags: FilterResult['warningFlags'] = [];

    // 1. Remove internal notes and comments
    if (this.config.removeInternalNotes) {
      const internalResult = this.removeInternalNotes(filteredText);
      filteredText = internalResult.text;
      removedItems.push(...internalResult.removed);
    }

    // 2. Remove or mask PII (Personal Identifiable Information)
    if (this.config.removePII) {
      const piiResult = this.removePII(filteredText, patientName);
      filteredText = piiResult.text;
      removedItems.push(...piiResult.removed);
      warningFlags.push(...piiResult.warnings);
    }

    // 3. Remove references to other patients
    if (this.config.removeOtherPatients) {
      const otherPatientsResult = this.removeOtherPatientReferences(filteredText, patientName);
      filteredText = otherPatientsResult.text;
      removedItems.push(...otherPatientsResult.removed);
    }

    // 4. Remove confidential keywords and context
    const confidentialResult = this.removeConfidentialContent(filteredText);
    filteredText = confidentialResult.text;
    removedItems.push(...confidentialResult.removed);

    // 5. Validate medical terminology
    const medicalWarnings = this.validateMedicalTerminology(filteredText);
    warningFlags.push(...medicalWarnings);

    // 6. Clean up formatting and ensure readability
    filteredText = this.cleanupFormatting(filteredText);

    return {
      filteredText,
      removedItems,
      warningFlags
    };
  }

  private removeInternalNotes(text: string): {
    text: string;
    removed: FilterResult['removedItems'];
  } {
    const removed: FilterResult['removedItems'] = [];
    let cleanText = text;

    // Pattern for parenthetical internal notes
    const internalNotePatterns = [
      /\([^)]*(?:intern|notitie|TODO|FIXME|check|navragen)[^)]*\)/gi,
      /\[[^\]]*(?:intern|notitie|TODO|FIXME|check|navragen)[^\]]*\]/gi,
      /\{[^}]*(?:intern|notitie|TODO|FIXME|check|navragen)[^}]*\}/gi,

      // Comments in various formats
      /\/\/.*$/gm,
      /\/\*[\s\S]*?\*\//g,
      /<!--[\s\S]*?-->/g,

      // Lines starting with internal markers
      /^.*(?:NB:|Opmerking:|Let op:|Intern:|Notitie:).*$/gm,

      // Medication/dosage details that are too specific for patient
      /\d+\s*mg(?:\/dag|\/week|\/maand)?(?:\s*[x×]\s*\d+)?/gi,
      /\b(?:medicatie|pillen|tabletten)\s+[^\s]+\s+\d+/gi
    ];

    internalNotePatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          removed.push({
            type: 'internal_note',
            original: match,
            reason: 'Interne notitie verwijderd voor patiëntvriendelijkheid'
          });
        });
        cleanText = cleanText.replace(pattern, '');
      }
    });

    return { text: cleanText, removed };
  }

  private removePII(text: string, currentPatientName?: string): {
    text: string;
    removed: FilterResult['removedItems'];
    warnings: FilterResult['warningFlags'];
  } {
    const removed: FilterResult['removedItems'] = [];
    const warnings: FilterResult['warningFlags'] = [];
    let cleanText = text;

    // Dutch phone number patterns
    const phonePattern = /(?:\+31|0)(?:[1-9]\d{1,2}[-\s]?)?[1-9](?:\d[-\s]?){6,7}\d/g;
    cleanText = cleanText.replace(phonePattern, (match) => {
      removed.push({
        type: 'pii',
        original: match,
        reason: 'Telefoonnummer verwijderd'
      });
      return '[telefoonnummer]';
    });

    // Email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    cleanText = cleanText.replace(emailPattern, (match) => {
      removed.push({
        type: 'pii',
        original: match,
        reason: 'E-mailadres verwijderd'
      });
      return '[e-mailadres]';
    });

    // Dutch postal codes
    const postalCodePattern = /\b\d{4}\s?[A-Z]{2}\b/g;
    cleanText = cleanText.replace(postalCodePattern, (match) => {
      removed.push({
        type: 'pii',
        original: match,
        reason: 'Postcode verwijderd'
      });
      return '[postcode]';
    });

    // BSN (Dutch social security number) patterns
    const bsnPattern = /\b\d{9}\b/g;
    cleanText = cleanText.replace(bsnPattern, (match) => {
      removed.push({
        type: 'pii',
        original: match,
        reason: 'BSN nummer verwijderd'
      });
      return '[BSN]';
    });

    // Dutch addresses (street + number)
    const addressPattern = /\b[A-Z][a-z]+(?:straat|laan|weg|plein|kade|gracht|park)\s+\d+[a-z]?\b/gi;
    cleanText = cleanText.replace(addressPattern, (match) => {
      removed.push({
        type: 'pii',
        original: match,
        reason: 'Adresgegevens verwijderd'
      });
      return '[adres]';
    });

    // Names (excluding the current patient's name if provided)
    const namePatterns = [
      // Full names with initials
      /\b[A-Z]\.\s*[A-Z]\.\s*[A-Z][a-z]+\b/g,
      // Dr./Drs./Mr. titles
      /\b(?:Dr|Drs|Mr|Mw|Ir)\.?\s+[A-Z][a-z]+\b/gi,
      // Common Dutch surnames
      /\b(?:van|de|der|den|te|op|aan|in)\s+[A-Z][a-z]+\b/g
    ];

    namePatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Don't remove the current patient's name if it's provided
          if (currentPatientName && match.toLowerCase().includes(currentPatientName.toLowerCase())) {
            return;
          }

          removed.push({
            type: 'pii',
            original: match,
            reason: 'Naam van andere persoon verwijderd'
          });
          cleanText = cleanText.replace(match, '[naam]');
        });
      }
    });

    // Check for potential PII that might need manual review
    const potentialPII = [
      /\b\d{2}[-\/]\d{2}[-\/]\d{4}\b/g, // Dates
      /\b[A-Z]{2,3}\d{3,}\b/g, // Codes (insurance, etc.)
    ];

    potentialPII.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          warnings.push({
            type: 'potential_pii',
            text: match,
            suggestion: 'Controleer of dit persoonlijke informatie is die verwijderd moet worden'
          });
        });
      }
    });

    return { text: cleanText, removed, warnings };
  }

  private removeOtherPatientReferences(text: string, currentPatientName?: string): {
    text: string;
    removed: FilterResult['removedItems'];
  } {
    const removed: FilterResult['removedItems'] = [];
    let cleanText = text;

    // References to other patients or cases
    const otherPatientPatterns = [
      /vorige patiënt|andere patiënt|patiënt eerder|vergelijkbare case/gi,
      /net als bij [A-Z][a-z]+/gi,
      /zoals ik bij .+ zag/gi,
      /vergelijkbaar met het geval van/gi
    ];

    otherPatientPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          removed.push({
            type: 'other_patient',
            original: match,
            reason: 'Verwijzing naar andere patiënt verwijderd'
          });
        });
        cleanText = cleanText.replace(pattern, '');
      }
    });

    return { text: cleanText, removed };
  }

  private removeConfidentialContent(text: string): {
    text: string;
    removed: FilterResult['removedItems'];
  } {
    const removed: FilterResult['removedItems'] = [];
    let cleanText = text;

    this.config.confidentialKeywords.forEach(keyword => {
      const pattern = new RegExp(`\\b${keyword}\\b.*?(?:\\.|$)`, 'gi');
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          removed.push({
            type: 'confidential',
            original: match,
            reason: `Vertrouwelijke informatie verwijderd: ${keyword}`
          });
        });
        cleanText = cleanText.replace(pattern, '');
      }
    });

    // Remove lines that contain confidential markers
    const confidentialLinePatterns = [
      /^.*(?:vertrouwelijk|confidentieel|geheim).*$/gmi,
      /^.*(?:niet doorvertellen|tussen ons).*$/gmi,
      /^.*(?:intern overleg|teambespreking).*$/gmi
    ];

    confidentialLinePatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          removed.push({
            type: 'confidential',
            original: match.trim(),
            reason: 'Vertrouwelijke lijn verwijderd'
          });
        });
        cleanText = cleanText.replace(pattern, '');
      }
    });

    return { text: cleanText, removed };
  }

  private validateMedicalTerminology(text: string): FilterResult['warningFlags'] {
    const warnings: FilterResult['warningFlags'] = [];

    // Check for complex medical terms that might need simplification
    const complexMedicalTerms = [
      // Latin/scientific terms
      /\b[a-z]+(?:itis|osis|ectomy|otomy|plasty|scopy)\b/gi,
      // Complex anatomical terms
      /\b(?:cervical|thoracal|lumbal|sacral|coccygeal)\b/gi,
      /\b(?:anterior|posterior|medial|lateral|proximal|distal)\b/gi,
      // Complex diagnostic terms
      /\b(?:degeneratief|inflammatoir|chronisch|acuut|progressief)\b/gi
    ];

    complexMedicalTerms.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Check if it's in allowed terms
          const isAllowed = this.config.allowedMedicalTerms.some(term =>
            match.toLowerCase().includes(term.toLowerCase())
          );

          if (!isAllowed) {
            warnings.push({
              type: 'medical_complexity',
              text: match,
              suggestion: `Medische term "${match}" zou vereenvoudigd kunnen worden voor patiënt`
            });
          }
        });
      }
    });

    // Check for jargon that needs explanation
    const jargonTerms = [
      /\b(?:ROM|ADL|SOEP|ICF)\b/g,
      /\b(?:mobilisatie|manipulatie|provocatie)\b/gi
    ];

    jargonTerms.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          warnings.push({
            type: 'medical_complexity',
            text: match,
            suggestion: `Vaktaal "${match}" heeft uitleg nodig voor patiënt`
          });
        });
      }
    });

    return warnings;
  }

  private cleanupFormatting(text: string): string {
    let cleaned = text;

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove empty lines
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Remove trailing/leading whitespace
    cleaned = cleaned.trim();

    // Fix punctuation spacing
    cleaned = cleaned.replace(/\s+([.,!?;:])/g, '$1');
    cleaned = cleaned.replace(/([.,!?;:])\s*/g, '$1 ');

    // Remove orphaned punctuation
    cleaned = cleaned.replace(/^\s*[.,;:]\s*/gm, '');

    // Clean up placeholder spacing
    cleaned = cleaned.replace(/\[\s*([^\]]+)\s*\]/g, '[$1]');

    return cleaned;
  }

  // Utility method to test filter effectiveness
  testFilter(text: string, patientName?: string): {
    original: string;
    filtered: string;
    summary: {
      totalRemovals: number;
      byType: Record<string, number>;
      warnings: number;
    };
  } {
    const result = this.filterContent(text, patientName);

    const byType: Record<string, number> = {};
    result.removedItems.forEach(item => {
      byType[item.type] = (byType[item.type] || 0) + 1;
    });

    return {
      original: text,
      filtered: result.filteredText,
      summary: {
        totalRemovals: result.removedItems.length,
        byType,
        warnings: result.warningFlags.length
      }
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<PrivacyFilterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): PrivacyFilterConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const privacyFilter = new EduPackPrivacyFilter();

// Export factory function for custom configurations
export function createPrivacyFilter(config?: Partial<PrivacyFilterConfig>): EduPackPrivacyFilter {
  return new EduPackPrivacyFilter(config);
}