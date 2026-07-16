// ─── Table Extractor ─────────────────────────────────────────────────────────
// Extract tables from images and documents

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  ExtractedTable,
  TableCell,
  BoundingBox,
} from './interfaces.js';

export class TableExtractor {
  async extract(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<ExtractedTable[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.tables) return result.tables;
    }

    return [];
  }

  async extractBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<ExtractedTable[][]> {
    return Promise.all(requests.map(r => this.extract(r, provider)));
  }

  tableToCSV(table: ExtractedTable): string {
    const rows: string[] = [];

    for (const row of table.cells) {
      const cells = row.map(cell => `"${cell.text.replace(/"/g, '""')}"`);
      rows.push(cells.join(','));
    }

    return rows.join('\n');
  }

  tableToJSON(table: ExtractedTable): Record<string, unknown>[] {
    if (table.headers && table.headers.length > 0) {
      const records: Record<string, unknown>[] = [];
      const dataRows = table.cells.slice(1);

      for (const row of dataRows) {
        const record: Record<string, unknown> = {};
        for (let i = 0; i < table.headers.length && i < row.length; i++) {
          record[table.headers[i]] = row[i].text;
        }
        records.push(record);
      }

      return records;
    }

    return table.cells.map(row =>
      row.reduce((acc, cell, i) => {
        acc[`col${i}`] = cell.text;
        return acc;
      }, {} as Record<string, unknown>)
    );
  }

  mergeTables(tables: ExtractedTable[]): ExtractedTable {
    if (tables.length === 0) {
      throw new Error('No tables to merge');
    }

    if (tables.length === 1) return tables[0];

    // Merge tables with same column count
    const first = tables[0];
    const allCells = [first.cells];

    for (let i = 1; i < tables.length; i++) {
      if (tables[i].columns === first.columns) {
        allCells.push(tables[i].cells);
      }
    }

    const mergedCells = allCells.flat();

    return {
      id: `merged-${first.id}`,
      rows: mergedCells.length,
      columns: first.columns,
      cells: mergedCells,
      headers: first.headers,
      confidence: first.confidence,
    };
  }

  calculateStatistics(table: ExtractedTable): {
    totalCells: number;
    emptyCells: number;
    averageConfidence: number;
    numericColumns: number;
  } {
    let totalCells = 0;
    let emptyCells = 0;
    let totalConfidence = 0;
    let numericColumns = 0;

    for (let col = 0; col < table.columns; col++) {
      let isNumeric = true;
      for (const row of table.cells) {
        if (col < row.length) {
          totalCells++;
          totalConfidence += row[col].confidence;
          if (row[col].text.trim() === '') {
            emptyCells++;
          }
          if (isNaN(Number(row[col].text))) {
            isNumeric = false;
          }
        }
      }
      if (isNumeric) numericColumns++;
    }

    return {
      totalCells,
      emptyCells,
      averageConfidence: totalCells > 0 ? totalConfidence / totalCells : 0,
      numericColumns,
    };
  }

  findColumn(table: ExtractedTable, header: string): string[] {
    const headerIndex = table.headers?.findIndex(h => h.toLowerCase() === header.toLowerCase());
    if (headerIndex === undefined || headerIndex < 0) return [];

    return table.cells.map(row =>
      headerIndex < row.length ? row[headerIndex].text : ''
    );
  }
}
