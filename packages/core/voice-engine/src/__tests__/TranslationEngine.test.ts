import { describe, it, expect } from 'vitest';
import { TranslationEngine } from '../TranslationEngine.js';

describe('TranslationEngine', () => {
  const engine = new TranslationEngine();

  it('should translate text', async () => {
    const result = await engine.translate('Olá', { sourceLanguage: 'pt', targetLanguage: 'en', preserveFormatting: true, formal: false });
    expect(result.translated).toContain('en');
    expect(result.source).toBe('Olá');
    expect(result.confidence).toBe(0.85);
    expect(result.sourceLanguage).toBe('pt');
    expect(result.targetLanguage).toBe('en');
  });

  it('should translate batch', async () => {
    const results = await engine.translateBatch(['A', 'B', 'C'], { sourceLanguage: 'pt', targetLanguage: 'es', preserveFormatting: true, formal: false });
    expect(results).toHaveLength(3);
    expect(results[0].source).toBe('A');
    expect(results[2].targetLanguage).toBe('es');
  });

  it('should return supported pairs', () => {
    const pairs = engine.getSupportedPairs();
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs.some(p => p.source === 'pt' && p.target === 'en')).toBe(true);
    expect(pairs.some(p => p.source === 'en' && p.target === 'pt')).toBe(true);
  });

  it('should not include same-language pairs', () => {
    const pairs = engine.getSupportedPairs();
    expect(pairs.every(p => p.source !== p.target)).toBe(true);
  });
});
