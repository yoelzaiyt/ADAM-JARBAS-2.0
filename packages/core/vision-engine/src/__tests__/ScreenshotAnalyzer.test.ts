import { describe, it, expect, beforeEach } from 'vitest';
import { ScreenshotAnalyzer } from '../ScreenshotAnalyzer.js';
import type { VisionAnalysisRequest } from '../interfaces.js';

describe('ScreenshotAnalyzer', () => {
  let analyzer: ScreenshotAnalyzer;

  beforeEach(() => {
    analyzer = new ScreenshotAnalyzer();
  });

  it('creates ScreenshotAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes screenshot', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['screenshot'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.platform).toBeDefined();
  });

  it('detects platform', () => {
    const platform = analyzer.detectPlatform(Buffer.from(''));
    expect(['web', 'mobile', 'desktop', 'unknown']).toContain(platform);
  });

  it('detects components', () => {
    const components = analyzer.detectComponents(Buffer.from(''));
    expect(components).toBeDefined();
    expect(Array.isArray(components)).toBe(true);
  });

  it('detects messages', () => {
    const messages = analyzer.detectMessages(Buffer.from(''));
    expect(messages).toBeDefined();
    expect(Array.isArray(messages)).toBe(true);
  });

  it('generates suggestions', () => {
    const suggestions = analyzer.generateSuggestions({
      platform: 'web',
      description: 'Test',
      components: [],
      messages: [],
    });
    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
  });
});
