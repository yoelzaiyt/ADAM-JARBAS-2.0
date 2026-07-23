import { describe, it, expect, beforeEach } from 'vitest';
import { TableExtractor } from '../TableExtractor.js';
import type { VisionAnalysisRequest, ExtractedTable } from '../interfaces.js';

describe('TableExtractor', () => {
  let extractor: TableExtractor;

  beforeEach(() => {
    extractor = new TableExtractor();
  });

  it('creates TableExtractor', () => {
    expect(extractor).toBeDefined();
  });

  it('extracts tables', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['tables'],
    };
    const tables = await extractor.extract(request);
    expect(tables).toBeDefined();
    expect(Array.isArray(tables)).toBe(true);
  });

  it('converts table to CSV', () => {
    const table: ExtractedTable = {
      id: '1',
      rows: 2,
      columns: 2,
      cells: [
        [{ text: 'A', confidence: 0.9 }, { text: 'B', confidence: 0.9 }],
        [{ text: '1', confidence: 0.85 }, { text: '2', confidence: 0.85 }],
      ],
      headers: ['Col1', 'Col2'],
      confidence: 0.9,
    };
    const csv = extractor.tableToCSV(table);
    expect(csv).toContain('A');
    expect(csv).toContain('B');
  });

  it('converts table to JSON', () => {
    const table: ExtractedTable = {
      id: '1',
      rows: 2,
      columns: 2,
      cells: [
        [{ text: 'Name', confidence: 0.9 }, { text: 'Age', confidence: 0.9 }],
        [{ text: 'John', confidence: 0.85 }, { text: '30', confidence: 0.85 }],
      ],
      headers: ['Name', 'Age'],
      confidence: 0.9,
    };
    const json = extractor.tableToJSON(table);
    expect(json).toHaveLength(1);
    expect(json[0]['Name']).toBe('John');
  });

  it('merges tables', () => {
    const table1: ExtractedTable = {
      id: '1',
      rows: 1,
      columns: 2,
      cells: [[{ text: 'A', confidence: 0.9 }, { text: 'B', confidence: 0.9 }]],
      confidence: 0.9,
    };
    const table2: ExtractedTable = {
      id: '2',
      rows: 1,
      columns: 2,
      cells: [[{ text: 'C', confidence: 0.85 }, { text: 'D', confidence: 0.85 }]],
      confidence: 0.85,
    };
    const merged = extractor.mergeTables([table1, table2]);
    expect(merged.cells).toHaveLength(2);
  });

  it('calculates statistics', () => {
    const table: ExtractedTable = {
      id: '1',
      rows: 2,
      columns: 2,
      cells: [
        [{ text: 'A', confidence: 0.9 }, { text: '100', confidence: 0.85 }],
        [{ text: 'B', confidence: 0.88 }, { text: '200', confidence: 0.82 }],
      ],
      confidence: 0.9,
    };
    const stats = extractor.calculateStatistics(table);
    expect(stats.totalCells).toBe(4);
    expect(stats.numericColumns).toBe(1);
  });
});
