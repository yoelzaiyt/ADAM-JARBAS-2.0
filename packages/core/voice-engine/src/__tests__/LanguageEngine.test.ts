import { describe, it, expect } from 'vitest';
import { LanguageEngine } from '../LanguageEngine.js';

describe('LanguageEngine', () => {
  const engine = new LanguageEngine();

  it('should detect Portuguese', async () => {
    const results = await engine.detect('O Brasil é um país maravilhoso');
    expect(results[0].language).toBe('pt');
    expect(results[0].confidence).toBeGreaterThan(0.5);
  });

  it('should detect English', async () => {
    const results = await engine.detect('The quick brown fox is has been');
    expect(results[0].language).toBe('en');
  });

  it('should detect Japanese', async () => {
    const results = await engine.detect('こんにちは');
    expect(results[0].language).toBe('ja');
    expect(results[0].confidence).toBe(0.95);
  });

  it('should detect Spanish', async () => {
    const results = await engine.detect('El gato está en la casa');
    expect(results.some(r => r.language === 'es')).toBe(true);
  });

  it('should return English fallback for unknown text', async () => {
    const results = await engine.detect('xyz');
    expect(results[0].language).toBe('en');
    expect(results[0].confidence).toBe(0.3);
  });

  it('should get language profile', () => {
    const profile = engine.getProfile('pt');
    expect(profile.nativeName).toBe('Português');
    expect(profile.direction).toBe('ltr');
  });

  it('should get supported languages', () => {
    const langs = engine.getSupportedLanguages();
    expect(langs).toContain('pt');
    expect(langs).toContain('en');
    expect(langs).toContain('ja');
    expect(langs).toHaveLength(7);
  });

  it('should check if language is supported', () => {
    expect(engine.isSupported('pt')).toBe(true);
    expect(engine.isSupported('xx' as any)).toBe(false);
  });

  it('should get language name in different languages', () => {
    expect(engine.getLanguageName('pt', 'en')).toBe('Portuguese');
    expect(engine.getLanguageName('en', 'pt')).toBe('Inglês');
    expect(engine.getLanguageName('ja', 'ja')).toBe('日本語');
  });
});
