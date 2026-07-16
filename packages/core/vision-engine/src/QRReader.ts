// ─── QR Reader ───────────────────────────────────────────────────────────────
// Read QR codes and parse content (URLs, text, emails, phones, WiFi)

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  QRResult,
  BoundingBox,
} from './interfaces.js';

export class QRReader {
  async read(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<QRResult[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.qr) return result.qr;
    }

    return [];
  }

  async readBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<QRResult[][]> {
    return Promise.all(requests.map(r => this.read(r, provider)));
  }

  parseContent(value: string): QRResult {
    const type = this.detectContentType(value);
    const parsed = this.parseByType(value, type);

    return {
      value,
      type,
      confidence: 0.9,
      parsed,
    };
  }

  detectContentType(value: string): QRResult['type'] {
    if (/^https?:\/\//i.test(value)) return 'url';
    if (/^mailto:/i.test(value) || /@/.test(value)) return 'email';
    if (/^tel:/i.test(value) || /^\+?[\d\s-()]+$/.test(value)) return 'phone';
    if (/^WIFI:/i.test(value)) return 'wifi';
    return 'text';
  }

  private parseByType(value: string, type: QRResult['type']): Record<string, string> {
    const parsed: Record<string, string> = {};

    switch (type) {
      case 'url':
        try {
          const url = new URL(value);
          parsed['protocol'] = url.protocol;
          parsed['host'] = url.host;
          parsed['path'] = url.pathname;
          if (url.search) parsed['query'] = url.search;
        } catch {
          parsed['raw'] = value;
        }
        break;

      case 'email':
        const emailMatch = value.match(/[\w.-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          parsed['email'] = emailMatch[0];
        }
        break;

      case 'phone':
        const phoneMatch = value.match(/[\d+()-\s]+/);
        if (phoneMatch) {
          parsed['phone'] = phoneMatch[0].trim();
        }
        break;

      case 'wifi':
        const ssidMatch = value.match(/S:([^;]+)/);
        const typeMatch = value.match(/T:([^;]+)/);
        const passMatch = value.match(/P:([^;]+)/);
        if (ssidMatch) parsed['ssid'] = ssidMatch[1];
        if (typeMatch) parsed['security'] = typeMatch[1];
        if (passMatch) parsed['password'] = passMatch[1];
        break;

      default:
        parsed['text'] = value;
    }

    return parsed;
  }

  validateQR(value: string): boolean {
    return value.length > 0 && value.length < 4296;
  }

  decodeQR(imageData: Buffer): QRResult[] {
    // Simplified QR detection
    return [];
  }

  generateQRContent(data: Record<string, unknown>): string {
    // Generate QR content from data
    if (data['url']) return String(data['url']);
    if (data['text']) return String(data['text']);
    return JSON.stringify(data);
  }
}
