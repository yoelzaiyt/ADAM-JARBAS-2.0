import { describe, it, expect, beforeEach } from 'vitest';
import { DiagramAnalyzer } from '../DiagramAnalyzer.js';
import type { VisionAnalysisRequest, DiagramAnalysis } from '../interfaces.js';

describe('DiagramAnalyzer', () => {
  let analyzer: DiagramAnalyzer;

  beforeEach(() => {
    analyzer = new DiagramAnalyzer();
  });

  it('creates DiagramAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes diagram', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['diagram'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.type).toBeDefined();
  });

  it('detects diagram type', () => {
    const type = analyzer.detectDiagramType(Buffer.from(''));
    expect(type).toBeDefined();
  });

  it('generates documentation', () => {
    const diagram: DiagramAnalysis = {
      type: 'flowchart',
      elements: [
        { id: '1', type: 'process', label: 'Start', boundingBox: { x: 0, y: 0, width: 100, height: 50 } },
      ],
      connections: [
        { source: '1', target: '2', type: 'arrow' },
      ],
      description: 'Test diagram',
    };
    const docs = analyzer.generateDocumentation(diagram);
    expect(docs).toBeDefined();
    expect(docs.length).toBeGreaterThan(0);
  });

  it('validates diagram', () => {
    const diagram: DiagramAnalysis = {
      type: 'flowchart',
      elements: [],
      connections: [],
      description: 'Empty diagram',
    };
    const result = analyzer.validateDiagram(diagram);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('finds isolated elements', () => {
    const diagram: DiagramAnalysis = {
      type: 'flowchart',
      elements: [
        { id: '1', type: 'process', label: 'A', boundingBox: { x: 0, y: 0, width: 100, height: 50 } },
        { id: '2', type: 'process', label: 'B', boundingBox: { x: 200, y: 0, width: 100, height: 50 } },
      ],
      connections: [
        { source: '1', target: '3', type: 'arrow' },
      ],
      description: 'Test',
    };
    const isolated = analyzer.findIsolatedElements(diagram);
    expect(isolated).toHaveLength(1);
    expect(isolated[0].id).toBe('2');
  });

  it('calculates complexity', () => {
    const diagram: DiagramAnalysis = {
      type: 'flowchart',
      elements: Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        type: 'process',
        label: `Node ${i}`,
        boundingBox: { x: 0, y: 0, width: 100, height: 50 },
      })),
      connections: Array.from({ length: 20 }, (_, i) => ({
        source: `${i}`,
        target: `${i + 1}`,
        type: 'arrow' as const,
      })),
      description: 'Complex diagram',
    };
    const result = analyzer.calculateComplexity(diagram);
    expect(result.score).toBeGreaterThan(0);
  });
});
