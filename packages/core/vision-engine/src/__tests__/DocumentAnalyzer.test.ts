import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentAnalyzer } from '../DocumentAnalyzer.js';
import type { VisionAnalysisRequest } from '../interfaces.js';

describe('DocumentAnalyzer', () => {
  let analyzer: DocumentAnalyzer;

  beforeEach(() => {
    analyzer = new DocumentAnalyzer();
  });

  it('creates DocumentAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes document', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'document', data: Buffer.from(''), format: 'pdf' },
      analysisType: ['document'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

  it('detects document type', () => {
    expect(analyzer.detectDocumentType('pdf')).toBe('report');
    expect(analyzer.detectDocumentType('docx')).toBe('letter');
    expect(analyzer.detectDocumentType('pptx')).toBe('presentation');
    expect(analyzer.detectDocumentType('xlsx')).toBe('spreadsheet');
    expect(analyzer.detectDocumentType('unknown')).toBe('other');
  });

  it('extracts text', async () => {
    const text = await analyzer.extractText(Buffer.from('Hello'), 'txt');
    expect(text).toBeDefined();
  });

  it('extracts tables', async () => {
    const tables = await analyzer.extractTables(Buffer.from(''), 'pdf');
    expect(tables).toBeDefined();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('extracts entities', () => {
    const entities = analyzer.extractEntities('Email: test@example.com, Date: 01/01/2024');
    expect(entities).toBeDefined();
    expect(entities.length).toBeGreaterThan(0);
  });
});
