import { describe, it, expect, beforeEach } from 'vitest';
import { EmotionDetector } from '../EmotionDetector.js';
import type { VisionAnalysisRequest, EmotionResult, EmotionScore } from '../interfaces.js';

describe('EmotionDetector', () => {
  let detector: EmotionDetector;

  beforeEach(() => {
    detector = new EmotionDetector();
  });

  it('creates EmotionDetector', () => {
    expect(detector).toBeDefined();
  });

  it('detects emotions', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['emotions'],
    };
    const emotions = await detector.detect(request);
    expect(emotions).toBeDefined();
    expect(Array.isArray(emotions)).toBe(true);
  });

  it('analyzes emotions', () => {
    const emotions: EmotionScore[] = [
      { emotion: 'happy', score: 0.8 },
      { emotion: 'neutral', score: 0.2 },
    ];
    const result = detector.analyzeEmotions(emotions);
    expect(result.dominant).toBe('happy');
    expect(result.isPositive).toBe(true);
  });

  it('gets overall mood', () => {
    const results: EmotionResult[] = [
      {
        faceId: '1',
        emotions: [{ emotion: 'happy', score: 0.9 }],
        dominant: 'happy',
        confidence: 0.9,
      },
    ];
    const mood = detector.getOverallMood(results);
    expect(mood.mood).toBe('happy');
  });

  it('detects micro expressions', () => {
    const emotions: EmotionScore[] = [
      { emotion: 'happy', score: 0.15 },
      { emotion: 'angry', score: 0.05 },
      { emotion: 'sad', score: 0.5 },
    ];
    const micro = detector.detectMicroExpressions(emotions);
    expect(micro).toHaveLength(1);
    expect(micro[0].emotion).toBe('happy');
  });

  it('gets supported emotions', () => {
    const emotions = detector.getSupportedEmotions();
    expect(emotions).toContain('happy');
    expect(emotions).toContain('sad');
    expect(emotions.length).toBeGreaterThan(0);
  });

  it('validates emotion score', () => {
    expect(detector.validateEmotionScore('happy', 0.5)).toBe(true);
    expect(detector.validateEmotionScore('invalid', 0.5)).toBe(false);
    expect(detector.validateEmotionScore('happy', 1.5)).toBe(false);
  });
});
