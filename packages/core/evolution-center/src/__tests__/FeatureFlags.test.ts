import { describe, it, expect } from 'vitest';
import { FeatureFlags } from '../feature-flags/FeatureFlags.js';

describe('FeatureFlags', () => {
  const flags = new FeatureFlags();

  it('creates FeatureFlags', () => { expect(flags).toBeDefined(); });

  it('creates a flag', () => {
    const flag = flags.createFlag({
      key: 'dark-mode', name: 'Dark Mode', description: 'Enable dark mode',
      enabled: true, targeting: 'all', createdBy: 'dev'
    });
    expect(flag.key).toBe('dark-mode');
  });

  it('enables/disables flag', () => {
    const flag = flags.createFlag({
      key: 'test', name: 'Test', description: '', enabled: false, targeting: 'all', createdBy: 'dev'
    });
    flags.enable(flag.id);
    expect(flags.isEnabled('test')).toBe(true);
    flags.disable(flag.id);
    expect(flags.isEnabled('test')).toBe(false);
  });

  it('evaluates percentage targeting', () => {
    flags.createFlag({
      key: 'pct', name: 'Pct', description: '', enabled: true, targeting: 'percentage', percentage: 100, createdBy: 'dev'
    });
    expect(flags.isEnabled('pct')).toBe(true);
  });

  it('evaluates environment targeting', () => {
    flags.createFlag({
      key: 'env', name: 'Env', description: '', enabled: true, targeting: 'environment', environments: ['production'], createdBy: 'dev'
    });
    expect(flags.isEnabled('env', { environment: 'production' })).toBe(true);
    expect(flags.isEnabled('env', { environment: 'staging' })).toBe(false);
  });

  it('respects expiry', () => {
    flags.createFlag({
      key: 'expired', name: 'Expired', description: '', enabled: true, targeting: 'all',
      expiresAt: new Date('2020-01-01'), createdBy: 'dev'
    });
    expect(flags.isEnabled('expired')).toBe(false);
  });

  it('gets active flags', () => {
    const active = flags.getActive();
    expect(Array.isArray(active)).toBe(true);
  });

  it('cleans up expired', () => {
    const cleaned = flags.cleanupExpired();
    expect(cleaned).toBeGreaterThanOrEqual(0);
  });
});
