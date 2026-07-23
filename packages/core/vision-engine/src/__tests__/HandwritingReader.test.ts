import { describe, it, expect, beforeEach } from 'vitest';
import { HandwritingReader } from '../HandwritingReader.js';
import type { VisionAnalysisRequest, HandwritingResult, HandwritingRegion } from '../interfaces.js';

describe('HandwritingReader', () => {
  let reader: HandwritingReader;

  beforeEach(() => {
    reader = new HandwritingReader();
  });

  it('creates HandwritingReader', () => {
    expect(reader).toBeDefined();
  });

  it('recognizes handwriting', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['handwriting'],
    };
    const result = await reader.recognize(request);
    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
  });

  it('extracts text', () => {
    const result: HandwritingResult = {
      text: 'Hello World',
      confidence: 0.9,
      language: 'en',
      regions: [],
    };
    expect(reader.extractText(result)).toBe('Hello World');
  });

  it('detects style', () => {
    const result: HandwritingResult = {
      text: 'Hello World',
      confidence: 0.9,
      language: 'en',
      regions: [],
    };
    const style = reader.detectStyle(result);
    expect(['print', 'cursive', 'mixed', 'unknown']).toContain(style);
  });

  it('improves confidence', () => {
    const regions: HandwritingRegion[] = [
      { id: '1', text: 'Test', confidence: 0.8, boundingBox: { x: 0, y: 0, width: 100, height: 20 } },
    ];
    const improved = reader.improveConfidence(regions);
    expect(improved[0].confidence).toBeGreaterThan(0.8);
  });

  it('groups by line', () => {
    const regions: HandwritingRegion[] = [
      { id: '1', text: 'Word1', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 50, height: 20 } },
      { id: '2', text: 'Word2', confidence: 0.9, boundingBox: { x: 60, y: 0, width: 50, height: 20 } },
      { id: '3', text: 'Line2', confidence: 0.9, boundingBox: { x: 0, y: 30, width: 50, height: 20 } },
    ];
    const lines = reader.groupByLine(regions);
    expect(lines).toHaveLength(2);
  });

  it('validates supported language', () => {
    expect(reader.isSupportedLanguage('pt')).toBe(true);
    expect(reader.isSupportedLanguage('xx')).toBe(false);
  });
});
