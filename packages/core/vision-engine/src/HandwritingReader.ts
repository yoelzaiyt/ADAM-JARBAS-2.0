// ─── Handwriting Reader ──────────────────────────────────────────────────────
// Recognize handwritten text

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  HandwritingResult,
  HandwritingRegion,
  BoundingBox,
} from './interfaces.js';

export class HandwritingReader {
  private supportedLanguages = ['pt', 'en', 'es', 'fr'];

  async recognize(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<HandwritingResult> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.handwriting) return result.handwriting;
    }

    return {
      text: '',
      confidence: 0,
      language: request.options?.language || 'en',
      regions: [],
    };
  }

  async recognizeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<HandwritingResult[]> {
    return Promise.all(requests.map(r => this.recognize(r, provider)));
  }

  extractText(result: HandwritingResult): string {
    return result.text;
  }

  extractRegions(result: HandwritingResult): HandwritingRegion[] {
    return result.regions;
  }

  detectStyle(result: HandwritingResult): string {
    // Analyze handwriting style
    const text = result.text;
    if (text.length === 0) return 'unknown';

    // Simple heuristics
    const hasCapitals = /[A-Z]/.test(text);
    const hasCursive = false; // Would need actual analysis

    if (hasCapitals) return 'print';
    return 'mixed';
  }

  improveConfidence(regions: HandwritingRegion[]): HandwritingRegion[] {
    return regions.map(region => ({
      ...region,
      confidence: Math.min(region.confidence * 1.05, 1.0),
    }));
  }

  groupByLine(regions: HandwritingRegion[]): string[][] {
    const lines: string[][] = [];
    const sorted = [...regions].sort((a, b) => a.boundingBox.y - b.boundingBox.y);

    let currentLine: string[] = [];
    let currentY = -1;

    for (const region of sorted) {
      if (currentY === -1 || Math.abs(region.boundingBox.y - currentY) < 15) {
        currentLine.push(region.text);
        currentY = region.boundingBox.y;
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine);
        }
        currentLine = [region.text];
        currentY = region.boundingBox.y;
      }
    }

    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  isSupportedLanguage(lang: string): boolean {
    return this.supportedLanguages.includes(lang);
  }
}
