// ─── Barcode Reader ──────────────────────────────────────────────────────────
// Read various barcode formats (EAN, UPC, Code128, etc.)

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  BarcodeResult,
  BoundingBox,
} from './interfaces.js';

export class BarcodeReader {
  private supportedFormats = [
    'EAN-13', 'EAN-8', 'UPC-A', 'UPC-E',
    'Code128', 'Code39', 'Code93',
    'ITF', 'Codabar', 'QR', 'DataMatrix',
  ];

  async read(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<BarcodeResult[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.barcode) return result.barcode;
    }

    return [];
  }

  async readBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<BarcodeResult[][]> {
    return Promise.all(requests.map(r => this.read(r, provider)));
  }

  isSupportedFormat(format: string): boolean {
    return this.supportedFormats.includes(format);
  }

  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  validateBarcode(value: string, format: string): boolean {
    // Basic validation
    if (!value || value.length === 0) return false;

    switch (format) {
      case 'EAN-13':
        return /^\d{13}$/.test(value);
      case 'EAN-8':
        return /^\d{8}$/.test(value);
      case 'UPC-A':
        return /^\d{12}$/.test(value);
      case 'UPC-E':
        return /^\d{6,8}$/.test(value);
      case 'Code128':
        return /^[\x00-\x7F]+$/.test(value);
      case 'Code39':
        return /^[A-Z0-9\-. $/+%]+$/.test(value);
      default:
        return value.length > 0;
    }
  }

  decodeBarcode(imageData: Buffer): BarcodeResult[] {
    // Simplified barcode detection
    return [];
  }

  formatBarcode(value: string, format: string): string {
    switch (format) {
      case 'EAN-13':
        return value.replace(/(\d{1})(\d{6})(\d{6})/, '$1-$2-$3');
      case 'UPC-A':
        return value.replace(/(\d{6})(\d{6})/, '$1-$2');
      default:
        return value;
    }
  }
}
