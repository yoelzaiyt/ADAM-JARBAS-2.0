import type { OCREngine as IOCREngine, OCRResult, TableData } from './interfaces.js';

export class OCREngine implements IOCREngine {
  private readonly supportedFormats = [
    'image/png',
    'image/jpeg',
    'image/tiff',
    'application/pdf',
  ];

  async recognize(image: Buffer, mimeType: string): Promise<OCRResult> {
    if (!this.supportedFormats.includes(mimeType)) {
      return {
        text: '',
        tables: [],
        qrCodes: [],
        barcodes: [],
        confidence: 0,
      };
    }

    return {
      text: '',
      tables: [],
      qrCodes: [],
      barcodes: [],
      confidence: 0,
      language: 'eng',
    };
  }

  async recognizePdf(pdf: Buffer): Promise<OCRResult[]> {
    return [
      {
        text: '',
        tables: [],
        qrCodes: [],
        barcodes: [],
        confidence: 0,
        language: 'eng',
      },
    ];
  }

  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }
}
