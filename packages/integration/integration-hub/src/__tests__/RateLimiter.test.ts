import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../core/RateLimiter.js';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      strategy: 'fixed-window',
      maxRequests: 10,
      windowMs: 60000,
      retryAfterMs: 1000,
    });
  });

  it('should allow requests within limit', () => {
    expect(limiter.canProceed('api-1')).toBe(true);
    limiter.consume('api-1');
    const state = limiter.getState('api-1');
    expect(state?.remaining).toBe(9);
  });

  it('should block requests over limit', () => {
    for (let i = 0; i < 10; i++) {
      limiter.consume('api-1');
    }
    expect(limiter.canProceed('api-1')).toBe(false);
  });

  it('should track state per API', () => {
    limiter.consume('api-1');
    limiter.consume('api-1');
    limiter.consume('api-2');

    const state1 = limiter.getState('api-1');
    const state2 = limiter.getState('api-2');

    expect(state1?.requests).toBe(2);
    expect(state2?.requests).toBe(1);
  });

  it('should calculate retry after time', () => {
    for (let i = 0; i < 10; i++) {
      limiter.consume('api-1');
    }
    const retryAfter = limiter.getRetryAfterMs('api-1');
    expect(retryAfter).toBeGreaterThan(0);
  });

  it('should return zero retry time when requests available', () => {
    const retryAfter = limiter.getRetryAfterMs('api-1');
    expect(retryAfter).toBe(0);
  });

  it('should return stats', () => {
    limiter.consume('api-1');
    limiter.consume('api-2');

    const stats = limiter.getStats();
    expect(stats.tracked).toBe(2);
    expect(stats.totalRequests).toBe(2);
  });
});
