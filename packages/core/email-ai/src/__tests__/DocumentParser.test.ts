import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentParser } from '../DocumentParser.js';

describe('DocumentParser', () => {
  let parser: DocumentParser;

  beforeEach(() => { parser = new DocumentParser(); });

  it('creates parser', () => { expect(parser).toBeDefined(); });

  it('parse extracts text', async () => {
    const result = await parser.parse(Buffer.from('Hello world test'), 'text/plain', 'test.txt');
    expect(result.text).toBe('Hello world test');
    expect(result.wordCount).toBe(3);
  });

  it('parseEmailBody cleans HTML', () => {
    const result = parser.parseEmailBody('<p>Hello</p><b>World</b>', 'Hello World');
    expect(result.text).toContain('Hello');
    expect(result.wordCount).toBe(2);
  });

  it('supportsMimeType checks support', () => {
    expect(parser.supportsMimeType('text/plain')).toBe(true);
    expect(parser.supportsMimeType('application/msword')).toBe(false);
  });

  it('getSupportedTypes returns list', () => {
    expect(parser.getSupportedTypes().length).toBeGreaterThan(0);
  });
});
