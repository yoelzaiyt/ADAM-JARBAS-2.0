import { describe, it, expect, beforeEach } from 'vitest';
import { FailoverManager } from '../core/FailoverManager.js';

describe('FailoverManager', () => {
  let failover: FailoverManager;

  beforeEach(() => {
    failover = new FailoverManager({
      enabled: true,
      maxFailures: 3,
      cooldownPeriod: 60000,
      healthCheckEnabled: true,
    });
  });

  it('should record failure', () => {
    const state = failover.recordFailure('api-1');
    expect(state.failureCount).toBe(1);
    expect(state.isFailedOver).toBe(false);
  });

  it('should trigger failover after max failures', () => {
    failover.recordFailure('api-1');
    failover.recordFailure('api-1');
    const state = failover.recordFailure('api-1');
    expect(state.isFailedOver).toBe(true);
    expect(state.nextRetry).toBeDefined();
  });

  it('should check if should failover', () => {
    expect(failover.shouldFailover('api-1')).toBe(false);

    failover.recordFailure('api-1');
    failover.recordFailure('api-1');
    failover.recordFailure('api-1');

    expect(failover.shouldFailover('api-1')).toBe(true);
  });

  it('should record success and reset', () => {
    failover.recordFailure('api-1');
    failover.recordFailure('api-1');
    failover.recordFailure('api-1');
    expect(failover.shouldFailover('api-1')).toBe(true);

    failover.recordSuccess('api-1');
    expect(failover.shouldFailover('api-1')).toBe(false);
  });

  it('should set fallback API', () => {
    failover.setFallback('api-1', 'api-2');
    const state = failover.getState('api-1');
    expect(state?.fallbackApiId).toBe('api-2');
  });

  it('should get failed APIs', () => {
    failover.recordFailure('api-1');
    failover.recordFailure('api-1');
    failover.recordFailure('api-1');

    failover.recordFailure('api-2');

    const failed = failover.getFailedApis();
    expect(failed.length).toBe(1);
    expect(failed[0].apiId).toBe('api-1');
  });

  it('should return stats', () => {
    failover.recordFailure('api-1');
    failover.recordFailure('api-2');

    const stats = failover.getStats();
    expect(stats.total).toBe(2);
    expect(stats.failedOver).toBe(0);
  });
});
