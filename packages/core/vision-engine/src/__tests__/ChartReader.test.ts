import { describe, it, expect, beforeEach } from 'vitest';
import { ChartReader } from '../ChartReader.js';
import type { VisionAnalysisRequest, ChartAnalysis } from '../interfaces.js';

describe('ChartReader', () => {
  let reader: ChartReader;

  beforeEach(() => {
    reader = new ChartReader();
  });

  it('creates ChartReader', () => {
    expect(reader).toBeDefined();
  });

  it('analyzes charts', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['charts'],
    };
    const charts = await reader.analyze(request);
    expect(charts).toBeDefined();
    expect(Array.isArray(charts)).toBe(true);
  });

  it('extracts data points', () => {
    const chart: ChartAnalysis = {
      type: 'bar',
      title: 'Sales',
      description: 'Monthly sales',
      dataPoints: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 150 },
      ],
    };
    const points = reader.extractDataPoints(chart);
    expect(points).toHaveLength(2);
  });

  it('gets chart summary', () => {
    const chart: ChartAnalysis = {
      type: 'bar',
      title: 'Sales',
      description: 'Monthly sales',
      dataPoints: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 120 },
      ],
    };
    const summary = reader.getChartSummary(chart);
    expect(summary).toContain('bar');
    expect(summary).toContain('Sales');
  });

  it('compares charts', () => {
    const chart1: ChartAnalysis = {
      type: 'bar',
      description: 'Chart 1',
      dataPoints: [{ label: 'A', value: 100 }],
    };
    const chart2: ChartAnalysis = {
      type: 'bar',
      description: 'Chart 2',
      dataPoints: [{ label: 'A', value: 100 }],
    };
    const result = reader.compareCharts(chart1, chart2);
    expect(result.similar).toBe(true);
  });

  it('extracts insights', () => {
    const chart: ChartAnalysis = {
      type: 'line',
      description: 'Trend',
      dataPoints: [
        { label: 'Jan', value: 100 },
        { label: 'Feb', value: 150 },
        { label: 'Mar', value: 200 },
      ],
    };
    const insights = reader.extractInsights(chart);
    expect(insights.length).toBeGreaterThan(0);
  });

  it('converts chart to table', () => {
    const chart: ChartAnalysis = {
      type: 'bar',
      description: 'Data',
      dataPoints: [
        { label: 'A', value: 100, category: 'X' },
      ],
    };
    const table = reader.chartToTable(chart);
    expect(table.headers).toHaveLength(3);
    expect(table.rows).toHaveLength(1);
  });
});
