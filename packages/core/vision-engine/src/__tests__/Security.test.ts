import { describe, it, expect, beforeEach } from 'vitest';
import { Security } from '../Security.js';

describe('Security', () => {
  let security: Security;

  beforeEach(() => {
    security = new Security();
  });

  it('creates Security', () => {
    expect(security).toBeDefined();
  });

  it('analyzes content', async () => {
    const result = await security.analyze(Buffer.from(''));
    expect(result).toBeDefined();
    expect(result.riskLevel).toBeDefined();
    expect(result.safeForWork).toBeDefined();
  });

  it('detects PII', async () => {
    const result = await security.analyze('Email: test@example.com, Phone: +1234567890');
    expect(result.piiDetected.length).toBeGreaterThan(0);
  });

  it('validates file size', () => {
    expect(security.validateFileSize(1000)).toBe(true);
    expect(security.validateFileSize(100 * 1024 * 1024)).toBe(false);
  });

  it('sanitizes filename', () => {
    expect(security.sanitizeFilename('test file.txt')).toBe('test_file.txt');
    expect(security.sanitizeFilename('file@name.pdf')).toBe('file_name.pdf');
  });

  it('gets config', () => {
    const config = security.getConfig();
    expect(config.enablePIIDetection).toBe(true);
    expect(config.enableContentFiltering).toBe(true);
  });

  it('updates config', () => {
    security.updateConfig({ maxFileSize: 20 * 1024 * 1024 });
    expect(security.getConfig().maxFileSize).toBe(20 * 1024 * 1024);
  });
});
