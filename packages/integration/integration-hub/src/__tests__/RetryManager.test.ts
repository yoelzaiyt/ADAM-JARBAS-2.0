import { describe, it, expect, beforeEach } from 'vitest';
import { RetryManager } from '../core/RetryManager.js';

describe('RetryManager', () => {
  let retry: RetryManager;

  beforeEach(() => {
    retry = new RetryManager({
      maxRetries: 3,
      backoffType: 'exponential',
      initialDelay: 100,
      maxDelay: 5000,
      retryableStatuses: [429, 500, 502, 503],
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
    });
  });

  it('should succeed on first attempt', async () => {
    const result = await retry.execute(async () => 'success');
    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(1);
  });

  it('should retry on failure and succeed', async () => {
    let attempts = 0;
    const result = await retry.execute(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Temporary failure');
      return 'success';
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(3);
  });

  it('should fail after max retries', async () => {
    const result = await retry.execute(async () => {
      throw new Error('Permanent failure');
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Permanent failure');
    expect(result.attempts).toBe(4);
  });

  it('should check if status is retryable', () => {
    expect(retry.isRetryable(429)).toBe(true);
    expect(retry.isRetryable(500)).toBe(true);
    expect(retry.isRetryable(200)).toBe(false);
    expect(retry.isRetryable(404)).toBe(false);
  });

  it('should check if error is retryable', () => {
    expect(retry.isRetryableError('ECONNRESET')).toBe(true);
    expect(retry.isRetryableError('ETIMEDOUT')).toBe(true);
    expect(retry.isRetryableError('EINVAL')).toBe(false);
  });

  it('should get config', () => {
    const config = retry.getConfig();
    expect(config.maxRetries).toBe(3);
    expect(config.backoffType).toBe('exponential');
  });

  it('should update config', () => {
    retry.updateConfig({ maxRetries: 5 });
    const config = retry.getConfig();
    expect(config.maxRetries).toBe(5);
  });
});
