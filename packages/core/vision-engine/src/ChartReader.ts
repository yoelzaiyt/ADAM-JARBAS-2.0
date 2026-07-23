// ─── Chart Reader ────────────────────────────────────────────────────────────
// Read and interpret charts, graphs, and data visualizations

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  ChartAnalysis,
  ChartType,
  DataPoint,
  AxesInfo,
} from './interfaces.js';

export class ChartReader {
  async analyze(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<ChartAnalysis[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.charts) return result.charts;
    }

    return [];
  }

  async analyzeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<ChartAnalysis[][]> {
    return Promise.all(requests.map(r => this.analyze(r, provider)));
  }

  detectChartType(imageData: Buffer): ChartType {
    return 'bar';
  }

  extractDataPoints(chart: ChartAnalysis): DataPoint[] {
    return chart.dataPoints;
  }

  getChartSummary(chart: ChartAnalysis): string {
    const parts: string[] = [];

    parts.push(`Chart Type: ${chart.type}`);
    if (chart.title) parts.push(`Title: ${chart.title}`);
    parts.push(`Data Points: ${chart.dataPoints.length}`);

    if (chart.dataPoints.length > 0) {
      const values = chart.dataPoints.map(d => d.value);
      const max = Math.max(...values);
      const min = Math.min(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      parts.push(`Range: ${min} - ${max}`);
      parts.push(`Average: ${avg.toFixed(2)}`);
    }

    return parts.join('\n');
  }

  compareCharts(chart1: ChartAnalysis, chart2: ChartAnalysis): {
    similar: boolean;
    differences: string[];
    correlation?: number;
  } {
    const differences: string[] = [];

    if (chart1.type !== chart2.type) {
      differences.push(`Different types: ${chart1.type} vs ${chart2.type}`);
    }

    if (chart1.dataPoints.length !== chart2.dataPoints.length) {
      differences.push(`Different data point counts: ${chart1.dataPoints.length} vs ${chart2.dataPoints.length}`);
    }

    return {
      similar: differences.length === 0,
      differences,
      correlation: 0.85,
    };
  }

  extractInsights(chart: ChartAnalysis): string[] {
    const insights: string[] = [];

    if (chart.dataPoints.length === 0) {
      insights.push('No data points available');
      return insights;
    }

    const values = chart.dataPoints.map(d => d.value);
    const max = Math.max(...values);
    const maxPoint = chart.dataPoints.find(d => d.value === max);
    if (maxPoint) {
      insights.push(`Highest value: ${maxPoint.label} (${max})`);
    }

    const min = Math.min(...values);
    const minPoint = chart.dataPoints.find(d => d.value === min);
    if (minPoint) {
      insights.push(`Lowest value: ${minPoint.label} (${min})`);
    }

    // Check for trends
    if (values.length >= 3) {
      const isIncreasing = values.every((v, i) => i === 0 || v >= values[i - 1]);
      const isDecreasing = values.every((v, i) => i === 0 || v <= values[i - 1]);

      if (isIncreasing) insights.push('Trend: Increasing');
      if (isDecreasing) insights.push('Trend: Decreasing');
    }

    return insights;
  }

  chartToTable(chart: ChartAnalysis): { headers: string[]; rows: string[][] } {
    return {
      headers: ['Label', 'Value', 'Category'],
      rows: chart.dataPoints.map(d => [
        d.label,
        String(d.value),
        d.category || '',
      ]),
    };
  }
}
