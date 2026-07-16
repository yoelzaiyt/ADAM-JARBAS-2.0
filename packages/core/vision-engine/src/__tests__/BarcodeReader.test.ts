import { describe, it, expect, beforeEach } from 'vitest';
import { BarcodeReader } from '../BarcodeReader.js';
import type { VisionAnalysisRequest } from '../interfaces.js';

describe('BarcodeReader', () => {
  let reader: BarcodeReader;

  beforeEach(() => {
    reader = new BarcodeReader();
  });

  it('creates BarcodeReader', () => {
    expect(reader).toBeDefined();
  });

  it('reads barcodes', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['barcode'],
    };
    const result = await reader.read(request);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('validates supported format', () => {
    expect(reader.isSupportedFormat('EAN-13')).toBe(true);
    expect(reader.isSupportedFormat('Code128')).toBe(true);
    expect(reader.isSupportedFormat('unknown')).toBe(false);
  });

  it('gets supported formats', () => {
    const formats = reader.getSupportedFormats();
    expect(formats).toBeDefined();
    expect(formats.length).toBeGreaterThan(0);
  });

  it('validates barcode', () => {
    expect(reader.validateBarcode('1234567890128', 'EAN-13')).toBe(true);
    expect(reader.validateBarcode('12345678', 'EAN-8')).toBe(true);
    expect(reader.validateBarcode('', 'EAN-13')).toBe(false);
  });

  it('formats barcode', () => {
    const formatted = reader.formatBarcode('1234567890128', 'EAN-13');
    expect(formatted).toContain('-');
  });
});
