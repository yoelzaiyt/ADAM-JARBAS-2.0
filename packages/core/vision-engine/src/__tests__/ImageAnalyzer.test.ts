import { describe, it, expect, beforeEach } from 'vitest';
import { ImageAnalyzer } from '../ImageAnalyzer.js';
import type { VisionAnalysisRequest } from '../interfaces.js';

describe('ImageAnalyzer', () => {
  let analyzer: ImageAnalyzer;

  beforeEach(() => {
    analyzer = new ImageAnalyzer();
  });

  it('creates ImageAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes image', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['describe'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.description).toBeDefined();
  });

  it('detects image category', () => {
    expect(analyzer.detectCategory('jpeg')).toBe('photograph');
    expect(analyzer.detectCategory('png')).toBe('screenshot');
    expect(analyzer.detectCategory('gif')).toBe('illustration');
    expect(analyzer.detectCategory('svg')).toBe('illustration');
    expect(analyzer.detectCategory('unknown')).toBe('mixed');
  });

  it('extracts dominant colors', () => {
    const colors = analyzer.extractDominantColors(Buffer.from(''));
    expect(colors).toBeDefined();
    expect(colors.length).toBeGreaterThan(0);
  });

  it('compares images', () => {
    const result = analyzer.compareImages(Buffer.from(''), Buffer.from(''));
    expect(result.similarity).toBeGreaterThanOrEqual(0);
    expect(result.similarity).toBeLessThanOrEqual(1);
    expect(result.differences).toBeDefined();
  });

  it('detects text regions', () => {
    const regions = analyzer.detectTextRegions(Buffer.from(''));
    expect(regions).toBeDefined();
    expect(Array.isArray(regions)).toBe(true);
  });
});
