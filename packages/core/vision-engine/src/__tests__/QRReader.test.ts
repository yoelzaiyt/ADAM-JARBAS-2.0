import { describe, it, expect, beforeEach } from 'vitest';
import { QRReader } from '../QRReader.js';
import type { VisionAnalysisRequest } from '../interfaces.js';

describe('QRReader', () => {
  let reader: QRReader;

  beforeEach(() => {
    reader = new QRReader();
  });

  it('creates QRReader', () => {
    expect(reader).toBeDefined();
  });

  it('reads QR codes', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['qr'],
    };
    const result = await reader.read(request);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('parses URL content', () => {
    const result = reader.parseContent('https://example.com');
    expect(result.type).toBe('url');
    expect(result.parsed['host']).toBe('example.com');
  });

  it('parses email content', () => {
    const result = reader.parseContent('mailto:test@example.com');
    expect(result.type).toBe('email');
  });

  it('parses phone content', () => {
    const result = reader.parseContent('tel:+1234567890');
    expect(result.type).toBe('phone');
  });

  it('parses WiFi content', () => {
    const result = reader.parseContent('WIFI:S:MyNetwork;T:WPA;P:password123;;');
    expect(result.type).toBe('wifi');
    expect(result.parsed['ssid']).toBe('MyNetwork');
  });

  it('parses text content', () => {
    const result = reader.parseContent('Hello World');
    expect(result.type).toBe('text');
  });

  it('validates QR', () => {
    expect(reader.validateQR('test')).toBe(true);
    expect(reader.validateQR('')).toBe(false);
  });
});
