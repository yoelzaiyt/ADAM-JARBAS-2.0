import { describe, it, expect, beforeEach } from 'vitest';
import { UIAnalyzer } from '../UIAnalyzer.js';
import type { VisionAnalysisRequest, UIAnalysis } from '../interfaces.js';

describe('UIAnalyzer', () => {
  let analyzer: UIAnalyzer;

  beforeEach(() => {
    analyzer = new UIAnalyzer();
  });

  it('creates UIAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes UI', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['ui'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.accessibility).toBeDefined();
  });

  it('analyzes accessibility', () => {
    const analysis: UIAnalysis = {
      accessibility: { score: 0.8, issues: [] },
      layout: { type: 'web', responsive: true, navigation: 'top', sidebar: false, header: true, footer: true },
      components: [],
    };
    const result = analyzer.analyzeAccessibility(analysis);
    expect(result.score).toBeGreaterThan(0);
  });

  it('identifies issues', () => {
    const analysis: UIAnalysis = {
      accessibility: { score: 0.5, issues: ['Missing labels'] },
      layout: { type: 'web', responsive: false, navigation: 'none', sidebar: false, header: false, footer: false },
      components: Array.from({ length: 25 }, (_, i) => ({
        type: 'button',
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
        interactive: true,
      })),
    };
    const issues = analyzer.identifyIssues(analysis);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('generates report', () => {
    const analysis: UIAnalysis = {
      framework: 'React',
      designSystem: 'Material UI',
      accessibility: { score: 0.9, issues: [] },
      layout: { type: 'web', responsive: true, navigation: 'top', sidebar: true, header: true, footer: true },
      components: [],
    };
    const report = analyzer.generateReport(analysis);
    expect(report).toContain('React');
    expect(report).toContain('Material UI');
  });
});
