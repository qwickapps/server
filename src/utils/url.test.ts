import { sanitizeUrl } from './url.js';

describe('sanitizeUrl', () => {
  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
  });

  it('allows relative URLs starting with /', () => {
    expect(sanitizeUrl('/relative/path')).toBe('/relative/path');
  });

  it('blocks javascript: protocol', () => {
    expect(sanitizeUrl('javascript:alert(document.cookie)')).toBe('#');
  });

  it('blocks javascript: with uppercase', () => {
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('#');
  });

  it('blocks data: protocol', () => {
    expect(sanitizeUrl('data:text/html,<h1>test</h1>')).toBe('#');
  });

  it('blocks vbscript: protocol', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
  });

  it('returns fallback for empty string', () => {
    expect(sanitizeUrl('')).toBe('#');
  });

  it('returns custom fallback when provided', () => {
    expect(sanitizeUrl('javascript:alert(1)', '/safe')).toBe('/safe');
  });

  it('returns fallback for malformed URLs', () => {
    expect(sanitizeUrl('not a url at all')).toBe('#');
  });
});
