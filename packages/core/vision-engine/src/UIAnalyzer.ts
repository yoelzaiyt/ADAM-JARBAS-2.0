// ─── UI Analyzer ─────────────────────────────────────────────────────────────
// Analyze UI components, accessibility, design patterns

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  UIAnalysis,
  UIComponent,
  UIIssue,
  AccessibilityInfo,
  LayoutInfo,
  BoundingBox,
} from './interfaces.js';

export class UIAnalyzer {
  async analyze(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<UIAnalysis> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.ui) return result.ui;
    }

    return this.fallbackAnalysis();
  }

  async analyzeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<UIAnalysis[]> {
    return Promise.all(requests.map(r => this.analyze(r, provider)));
  }

  private fallbackAnalysis(): UIAnalysis {
    return {
      accessibility: {
        score: 0.5,
        issues: ['Unable to analyze accessibility'],
      },
      layout: {
        type: 'unknown',
        responsive: false,
        navigation: 'unknown',
        sidebar: false,
        header: false,
        footer: false,
      },
      components: [],
    };
  }

  detectFramework(imageData: Buffer): string | undefined {
    return undefined;
  }

  detectDesignSystem(imageData: Buffer): string | undefined {
    return undefined;
  }

  analyzeAccessibility(analysis: UIAnalysis): AccessibilityInfo {
    const issues: string[] = [];

    // Check for common accessibility issues
    if (!analysis.layout.header) {
      issues.push('Missing header for navigation');
    }

    const interactiveWithoutLabel = analysis.components.filter(
      c => c.interactive && !c.label
    );
    if (interactiveWithoutLabel.length > 0) {
      issues.push(`${interactiveWithoutLabel.length} interactive elements without labels`);
    }

    const score = Math.max(0, 1 - issues.length * 0.2);

    return {
      score,
      issues,
    };
  }

  analyzeLayout(analysis: UIAnalysis): LayoutInfo {
    return analysis.layout;
  }

  detectComponents(imageData: Buffer): UIComponent[] {
    return [];
  }

  identifyIssues(analysis: UIAnalysis): UIIssue[] {
    const issues: UIIssue[] = [];

    // Check accessibility
    const accessibility = this.analyzeAccessibility(analysis);
    for (const issue of accessibility.issues) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        description: issue,
        suggestion: 'Add proper ARIA labels and roles',
      });
    }

    // Check for common UX issues
    if (analysis.components.length > 20) {
      issues.push({
        type: 'ux',
        severity: 'medium',
        description: 'Too many UI components on screen',
        suggestion: 'Consider simplifying the interface',
      });
    }

    return issues;
  }

  generateReport(analysis: UIAnalysis): string {
    const lines: string[] = [];

    lines.push('# UI Analysis Report');
    lines.push('');
    lines.push(`Framework: ${analysis.framework || 'Unknown'}`);
    lines.push(`Design System: ${analysis.designSystem || 'None detected'}`);
    lines.push('');
    lines.push('## Layout');
    lines.push(`- Type: ${analysis.layout.type}`);
    lines.push(`- Responsive: ${analysis.layout.responsive}`);
    lines.push(`- Navigation: ${analysis.layout.navigation}`);
    lines.push('');
    lines.push('## Accessibility');
    lines.push(`- Score: ${(analysis.accessibility.score * 100).toFixed(0)}%`);
    if (analysis.accessibility.issues.length > 0) {
      lines.push('- Issues:');
      for (const issue of analysis.accessibility.issues) {
        lines.push(`  - ${issue}`);
      }
    }
    lines.push('');
    lines.push('## Components');
    lines.push(`- Total: ${analysis.components.length}`);

    return lines.join('\n');
  }
}
