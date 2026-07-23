import { describe, it, expect, beforeEach } from 'vitest';
import { MetadataEngine } from '../MetadataEngine.js';
import type { ImageMetadata } from '../interfaces.js';

describe('MetadataEngine', () => {
  let engine: MetadataEngine;

  beforeEach(() => {
    engine = new MetadataEngine();
  });

  it('creates MetadataEngine', () => {
    expect(engine).toBeDefined();
  });

  it('extracts metadata', async () => {
    const metadata = await engine.extractMetadata(Buffer.from(''), 'png');
    expect(metadata).toBeDefined();
    expect(metadata.format).toBe('png');
    expect(metadata.size).toBeDefined();
  });

  it('formats date', () => {
    const date = new Date('2024-01-15');
    const formatted = engine.formatDate(date);
    expect(formatted).toBe('2024-01-15');
  });

  it('formats file size', () => {
    expect(engine.formatFileSize(500)).toBe('500 B');
    expect(engine.formatFileSize(1500)).toContain('KB');
    expect(engine.formatFileSize(1500000)).toContain('MB');
  });

  it('formats resolution', () => {
    expect(engine.formatResolution(1920, 1080)).toBe('Full HD');
    expect(engine.formatResolution(3840, 2160)).toBe('4K UHD');
    expect(engine.formatResolution(640, 480)).toBe('SD');
  });

  it('compares metadata', () => {
    const meta1: ImageMetadata = { format: 'png', size: { width: 100, height: 100 } };
    const meta2: ImageMetadata = { format: 'jpg', size: { width: 200, height: 200 } };
    const result = engine.compareMetadata(meta1, meta2);
    expect(result.match).toBe(false);
    expect(result.differences.length).toBeGreaterThan(0);
  });

  it('strips metadata', () => {
    const metadata: ImageMetadata = {
      format: 'png',
      size: { width: 100, height: 100 },
      dpi: 72,
      exif: { camera: 'Test' },
    };
    const stripped = engine.stripMetadata(metadata);
    expect(stripped.dpi).toBeUndefined();
    expect(stripped.exif).toBeUndefined();
  });

  it('validates metadata', () => {
    const valid: ImageMetadata = { format: 'png', size: { width: 100, height: 100 } };
    const result = engine.validateMetadata(valid);
    expect(result.valid).toBe(true);
  });
});
