import { describe, it, expect, beforeEach } from 'vitest';
import { OCREngine } from '../OCREngine.js';
import type { VisionAnalysisRequest, OCRResult, OCRRegion } from '../interfaces.js';

describe('OCREngine', () => {
  let engine: OCREngine;

  beforeEach(() => {
    engine = new OCREngine();
  });

  it('creates OCREngine', () => {
    expect(engine).toBeDefined();
  });

  it('recognizes text', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['ocr'],
    };
    const result = await engine.recognize(request);
    expect(result).toBeDefined();
    expect(result.text).toBeDefined();
  });

  it('extracts text', () => {
    const ocrResult: OCRResult = {
      text: 'Hello World',
      confidence: 0.95,
      language: 'en',
      regions: [],
    };
    const text = engine.extractText(ocrResult);
    expect(text).toBe('Hello World');
  });

  it('extracts regions', () => {
    const ocrResult: OCRResult = {
      text: 'Test',
      confidence: 0.9,
      language: 'en',
      regions: [
        { id: '1', text: 'Header', confidence: 0.95, boundingBox: { x: 0, y: 0, width: 100, height: 20 }, type: 'heading' },
      ],
    };
    const regions = engine.extractRegions(ocrResult);
    expect(regions).toHaveLength(1);
  });

  it('detects language', () => {
    expect(engine.detectLanguage('This is English text')).toBe('en');
    expect(engine.detectLanguage('Isto é texto em português')).toBe('pt');
    expect(engine.detectLanguage('Esto es texto en español')).toBe('es');
  });

  it('validates supported language', () => {
    expect(engine.isSupportedLanguage('pt')).toBe(true);
    expect(engine.isSupportedLanguage('en')).toBe(true);
    expect(engine.isSupportedLanguage('xx')).toBe(false);
  });

  it('improves confidence', () => {
    const regions: OCRRegion[] = [
      { id: '1', text: 'Test', confidence: 0.8, boundingBox: { x: 0, y: 0, width: 100, height: 20 }, type: 'paragraph' },
    ];
    const improved = engine.improveConfidence(regions);
    expect(improved[0].confidence).toBeGreaterThan(0.8);
  });

  it('groups by line', () => {
    const regions: OCRRegion[] = [
      { id: '1', text: 'Word1', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 50, height: 20 }, type: 'paragraph' },
      { id: '2', text: 'Word2', confidence: 0.9, boundingBox: { x: 60, y: 0, width: 50, height: 20 }, type: 'paragraph' },
      { id: '3', text: 'Line2', confidence: 0.9, boundingBox: { x: 0, y: 30, width: 50, height: 20 }, type: 'paragraph' },
    ];
    const lines = engine.groupByLine(regions);
    expect(lines).toHaveLength(2);
  });
});
