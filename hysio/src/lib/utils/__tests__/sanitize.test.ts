import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitizeHTML, sanitizeText, createSafeHTML } from '../sanitize';

Object.defineProperty(global, 'window', {
  value: {},
  writable: true
});

describe('sanitize utilities', () => {
  describe('sanitizeHTML', () => {
    it('removes malicious script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>';
      const clean = sanitizeHTML(dirty);

      expect(clean).toContain('<p>');
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
    });

    it('removes event handlers', () => {
      const dirty = '<p onclick="alert(\'xss\')">Click me</p>';
      const clean = sanitizeHTML(dirty);

      expect(clean).toContain('<p>');
      expect(clean).not.toContain('onclick');
      expect(clean).not.toContain('alert');
    });

    it('preserves safe HTML tags', () => {
      const html = '<p><strong>Bold</strong> <em>italic</em></p>';
      const clean = sanitizeHTML(html);

      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
      expect(clean).toContain('Bold');
      expect(clean).toContain('italic');
    });

    it('allows safe links with href', () => {
      const html = '<a href="https://example.com">Link</a>';
      const clean = sanitizeHTML(html);

      expect(clean).toContain('<a');
      expect(clean).toContain('href=');
      expect(clean).toContain('example.com');
    });

    it('removes javascript: protocol links', () => {
      const dirty = '<a href="javascript:alert(\'xss\')">Click</a>';
      const clean = sanitizeHTML(dirty);

      expect(clean).not.toContain('javascript:');
      expect(clean).not.toContain('alert');
    });

    it('removes data attributes', () => {
      const dirty = '<div data-user-id="123">Content</div>';
      const clean = sanitizeHTML(dirty);

      expect(clean).not.toContain('data-user-id');
    });

    it('removes iframe tags', () => {
      const dirty = '<p>Text</p><iframe src="malicious.com"></iframe>';
      const clean = sanitizeHTML(dirty);

      expect(clean).toContain('<p>');
      expect(clean).not.toContain('<iframe>');
      expect(clean).not.toContain('malicious.com');
    });
  });

  describe('sanitizeText', () => {
    it('removes all HTML tags but keeps content', () => {
      const dirty = '<p>Hello <strong>World</strong></p>';
      const clean = sanitizeText(dirty);

      expect(clean).not.toContain('<p>');
      expect(clean).not.toContain('<strong>');
      expect(clean).toContain('Hello World');
    });

    it('removes script tags and content', () => {
      const dirty = 'Safe text<script>alert("xss")</script>More text';
      const clean = sanitizeText(dirty);

      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
      expect(clean).toContain('Safe text');
      expect(clean).toContain('More text');
    });

    it('handles plain text without changes', () => {
      const text = 'Plain text without HTML';
      const clean = sanitizeText(text);

      expect(clean).toBe(text);
    });
  });

  describe('createSafeHTML', () => {
    it('returns object with __html property', () => {
      const html = '<p>Safe content</p>';
      const result = createSafeHTML(html);

      expect(result).toHaveProperty('__html');
      expect(typeof result.__html).toBe('string');
    });

    it('sanitizes HTML in the __html property', () => {
      const dirty = '<p>Content</p><script>alert("xss")</script>';
      const result = createSafeHTML(dirty);

      expect(result.__html).toContain('<p>');
      expect(result.__html).not.toContain('<script>');
    });

    it('can be used with dangerouslySetInnerHTML', () => {
      const html = '<strong>Bold text</strong>';
      const safeHTML = createSafeHTML(html);

      expect(safeHTML).toMatchObject({
        __html: expect.stringContaining('<strong>')
      });
    });
  });
});