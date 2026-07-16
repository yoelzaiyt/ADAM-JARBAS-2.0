// ─── OCR Engine ──────────────────────────────────────────────────────────────
// Intelligent OCR for text, tables, forms, signatures, barcodes

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  OCRResult,
  OCRRegion,
  ExtractedTable,
  ExtractedForm,
  FormField,
  SignatureRegion,
  BarcodeResult,
  QRResult,
  BoundingBox,
} from './interfaces.js';

export class OCREngine {
  private supportedLanguages = ['pt', 'en', 'es', 'fr'];

  async recognize(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<OCRResult> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.ocr) return result.ocr;
    }

    return this.fallbackRecognition(request);
  }

  async recognizeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<OCRResult[]> {
    return Promise.all(requests.map(r => this.recognize(r, provider)));
  }

  private fallbackRecognition(request: VisionAnalysisRequest): OCRResult {
    return {
      text: '',
      confidence: 0,
      language: request.options?.language || 'pt',
      regions: [],
    };
  }

  extractText(ocrResult: OCRResult): string {
    return ocrResult.text;
  }

  extractRegions(ocrResult: OCRResult): OCRRegion[] {
    return ocrResult.regions;
  }

  extractTables(ocrResult: OCRResult): ExtractedTable[] {
    return ocrResult.tables || [];
  }

  extractForms(ocrResult: OCRResult): ExtractedForm[] {
    return ocrResult.forms || [];
  }

  extractSignatures(ocrResult: OCRResult): SignatureRegion[] {
    return ocrResult.signatures || [];
  }

  extractBarcodes(ocrResult: OCRResult): BarcodeResult[] {
    return ocrResult.barcodes || [];
  }

  extractQRCodes(ocrResult: OCRResult): QRResult[] {
    return ocrResult.qrcodes || [];
  }

  detectLanguage(text: string): string {
    // Simple language detection
    const portuguesePatterns = /\b(e|é|de|da|do|em|um|uma|com|para|por)\b/gi;
    const englishPatterns = /\b(the|is|are|was|were|have|has|had|will|would)\b/gi;
    const spanishPatterns = /\b(el|la|los|las|es|son|está|están|tiene|tienen)\b/gi;

    const ptMatches = (text.match(portuguesePatterns) || []).length;
    const enMatches = (text.match(englishPatterns) || []).length;
    const esMatches = (text.match(spanishPatterns) || []).length;

    if (ptMatches > enMatches && ptMatches > esMatches) return 'pt';
    if (enMatches > ptMatches && enMatches > esMatches) return 'en';
    if (esMatches > ptMatches && esMatches > enMatches) return 'es';
    return 'en';
  }

  isSupportedLanguage(lang: string): boolean {
    return this.supportedLanguages.includes(lang);
  }

  improveConfidence(regions: OCRRegion[]): OCRRegion[] {
    return regions.map(region => ({
      ...region,
      confidence: Math.min(region.confidence * 1.1, 1.0),
    }));
  }

  groupByLine(regions: OCRRegion[]): string[][] {
    const lines: string[][] = [];
    const sorted = [...regions].sort((a, b) => a.boundingBox.y - b.boundingBox.y);

    let currentLine: string[] = [];
    let currentY = -1;

    for (const region of sorted) {
      if (currentY === -1 || Math.abs(region.boundingBox.y - currentY) < 10) {
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
}
