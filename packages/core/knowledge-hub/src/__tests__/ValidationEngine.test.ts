import { describe, it, expect } from 'vitest';
import { ValidationEngine } from '../ValidationEngine.js';
import type { Document, ValidationRule } from '../interfaces.js';

function validDoc(overrides?: Partial<Document>): Document {
  return {
    id: 'doc1',
    title: 'Test Document',
    content: 'Some meaningful content here',
    tenantId: 'tenant-1',
    sourceType: 'internal',
    hash: '0',
    checksum: '0',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ValidationEngine', () => {
  it('validateDocument checks required fields', async () => {
    const engine = new ValidationEngine();
    const doc = validDoc({ id: '' });

    const result = await engine.validateDocument(doc);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'id')).toBe(true);
  });

  it('validateDocument rejects empty content', async () => {
    const engine = new ValidationEngine();
    const doc = validDoc({ content: '   ' });

    const result = await engine.validateDocument(doc);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'content' && e.message.includes('empty'))).toBe(true);
  });

  it('validateContent with default rules', async () => {
    const engine = new ValidationEngine();

    const result = await engine.validateContent('Hello, this is valid content.');

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.score).toBe(1);
  });

  it('validateContent with custom rules', async () => {
    const engine = new ValidationEngine();
    const rule: ValidationRule = {
      name: 'no-spaces',
      validate: (input) => typeof input === 'string' && !input.includes(' '),
      message: 'Content must not contain spaces',
    };

    const result = await engine.validateContent('has spaces in it', [rule]);

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toBe('Content must not contain spaces');
  });

  it('validateSource checks valid URL', async () => {
    const engine = new ValidationEngine();

    const validResult = await engine.validateSource('https://example.com/docs', 'web');
    expect(validResult.valid).toBe(true);

    const invalidResult = await engine.validateSource('not-a-url', 'web');
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.some(e => e.field === 'source')).toBe(true);
  });

  it('addRule adds custom validation', async () => {
    const engine = new ValidationEngine();
    const rule: ValidationRule = {
      name: 'max-100-chars',
      validate: (input) => typeof input === 'string' && input.length <= 100,
      message: 'Content must be at most 100 characters',
    };

    engine.addRule(rule);

    const shortResult = await engine.validateContent('This is long enough content for validation');
    expect(shortResult.valid).toBe(true);

    const longInput = 'a'.repeat(101);
    const longResult = await engine.validateContent(longInput);
    expect(longResult.valid).toBe(false);
  });
});
