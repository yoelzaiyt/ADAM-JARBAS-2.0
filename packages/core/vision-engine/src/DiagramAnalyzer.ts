// ─── Diagram Analyzer ────────────────────────────────────────────────────────
// Interpret UML, BPMN, flowcharts, ERD, Mermaid, architectures, orgcharts

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  DiagramAnalysis,
  DiagramType,
  DiagramElement,
  DiagramConnection,
  BoundingBox,
} from './interfaces.js';

export class DiagramAnalyzer {
  async analyze(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<DiagramAnalysis> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.diagram) return result.diagram;
    }

    return this.fallbackAnalysis(request);
  }

  async analyzeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<DiagramAnalysis[]> {
    return Promise.all(requests.map(r => this.analyze(r, provider)));
  }

  private fallbackAnalysis(request: VisionAnalysisRequest): DiagramAnalysis {
    return {
      type: 'other',
      elements: [],
      connections: [],
      description: 'Diagram analysis',
    };
  }

  detectDiagramType(imageData: Buffer): DiagramType {
    // Simplified diagram type detection
    return 'flowchart';
  }

  extractElements(diagram: DiagramAnalysis): DiagramElement[] {
    return diagram.elements;
  }

  extractConnections(diagram: DiagramAnalysis): DiagramConnection[] {
    return diagram.connections;
  }

  generateDocumentation(diagram: DiagramAnalysis): string {
    const lines: string[] = [];

    lines.push(`# ${diagram.title || 'Diagram Documentation'}`);
    lines.push('');
    lines.push(`Type: ${diagram.type}`);
    lines.push('');
    lines.push('## Elements');
    lines.push('');

    for (const element of diagram.elements) {
      lines.push(`- ${element.type}: ${element.label}`);
    }

    lines.push('');
    lines.push('## Connections');
    lines.push('');

    for (const conn of diagram.connections) {
      const label = conn.label ? ` (${conn.label})` : '';
      lines.push(`- ${conn.source} → ${conn.target}${label}`);
    }

    return lines.join('\n');
  }

  validateDiagram(diagram: DiagramAnalysis): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (diagram.elements.length === 0) {
      issues.push('No elements found in diagram');
    }

    if (diagram.connections.length === 0) {
      issues.push('No connections found in diagram');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  findIsolatedElements(diagram: DiagramAnalysis): DiagramElement[] {
    const connectedIds = new Set<string>();
    for (const conn of diagram.connections) {
      connectedIds.add(conn.source);
      connectedIds.add(conn.target);
    }

    return diagram.elements.filter(e => !connectedIds.has(e.id));
  }

  calculateComplexity(diagram: DiagramAnalysis): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 0;

    if (diagram.elements.length > 10) {
      factors.push('High element count');
      score += 2;
    }

    if (diagram.connections.length > 15) {
      factors.push('High connection count');
      score += 2;
    }

    const types = new Set(diagram.elements.map(e => e.type));
    if (types.size > 3) {
      factors.push('Multiple element types');
      score += 1;
    }

    return {
      score: Math.min(score, 10),
      factors,
    };
  }
}
