import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'class', 'id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeText(text: string): string {
  if (typeof window === 'undefined') {
    return text;
  }

  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true,
  });
}

export function createSafeHTML(html: string) {
  return { __html: sanitizeHTML(html) };
}

/**
 * Removes markdown formatting artifacts from AI-generated text
 * This is specifically for cleaning up text that contains raw markdown
 * formatting that shouldn't be displayed to users
 */
export function cleanMarkdownArtifacts(text: string): string {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  return text
    // Remove markdown code blocks with language identifiers (but preserve content structure)
    .replace(/```[\w]*\n?/g, '')
    .replace(/```\n?/g, '')
    // Remove markdown headers but preserve the text
    .replace(/^#+\s*/gm, '')
    // Remove markdown bold/italic markers but preserve the text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove markdown links but preserve the text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Convert markdown list markers to simple dashes (preserve structure)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, '• ')
    // Remove markdown horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove table borders but keep content readable
    .replace(/^\s*\|/gm, '')
    .replace(/\|\s*$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^[\s]*:?-+:?[\s]*$/gm, '')
    // Normalize excessive whitespace but preserve paragraph structure
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    // Only trim the very beginning and end, not each line
    .trim();
}