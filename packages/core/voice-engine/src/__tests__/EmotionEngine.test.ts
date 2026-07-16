import { describe, it, expect, beforeEach } from 'vitest';
import { EmotionEngine } from '../EmotionEngine.js';

describe('EmotionEngine', () => {
  const engine = new EmotionEngine();

  it('should detect happy emotion', async () => {
    const results = await engine.detect('I am so happy today');
    expect(results.some(r => r.emotion === 'happy')).toBe(true);
  });

  it('should detect sad emotion', async () => {
    const results = await engine.detect('I feel sad and depressed');
    expect(results.some(r => r.emotion === 'sad')).toBe(true);
  });

  it('should detect angry emotion', async () => {
    const results = await engine.detect('I am furious and outraged');
    expect(results.some(r => r.emotion === 'angry')).toBe(true);
  });

  it('should return neutral for unknown text', async () => {
    const results = await engine.detect('banana phone ring ring');
    expect(results.some(r => r.emotion === 'neutral')).toBe(true);
  });

  it('should get emotion profile', async () => {
    const profile = await engine.getProfile('I am anxious and worried');
    expect(['anxious', 'sad', 'neutral']).toContain(profile.dominant);
    expect(profile.mood).toBeDefined();
    expect(typeof profile.energy).toBe('number');
  });

  it('should adapt response for sad emotion', () => {
    const result = engine.adaptResponse('Tudo bem', 'sad');
    expect(result).toContain('Entendo');
    expect(result).toContain('Tudo bem');
  });

  it('should adapt response for angry emotion', () => {
    const result = engine.adaptResponse('Ok', 'angry');
    expect(result).toContain('Compreendo');
  });

  it('should return original text for neutral emotion', () => {
    const result = engine.adaptResponse('Hello', 'neutral');
    expect(result).toBe('Hello');
  });

  it('should return all emotion types', () => {
    const emotions = engine.getEmotions();
    expect(emotions).toContain('happy');
    expect(emotions).toContain('sad');
    expect(emotions).toContain('angry');
    expect(emotions).toContain('neutral');
    expect(emotions.length).toBeGreaterThanOrEqual(10);
  });

  it('should get emotion descriptions', () => {
    expect(engine.getEmotionDescription('happy')).toBe('Feliz / Alegre');
    expect(engine.getEmotionDescription('sad')).toBe('Triste');
    expect(engine.getEmotionDescription('unknown' as any)).toBe('Desconhecido');
  });
});
