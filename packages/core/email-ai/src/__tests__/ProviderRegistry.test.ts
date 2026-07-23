import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from '../ProviderRegistry.js';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => { registry = new ProviderRegistry(); });

  it('creates registry', () => { expect(registry).toBeDefined(); });

  it('registers and retrieves provider', () => {
    registry.register({ name: 'gmail', clientId: 'id', clientSecret: 'secret' });
    expect(registry.get('gmail')).toBeDefined();
    expect(registry.get('gmail')?.clientId).toBe('id');
  });

  it('getAll returns all providers', () => {
    registry.register({ name: 'gmail' });
    registry.register({ name: 'outlook' });
    expect(registry.getAll().length).toBe(2);
  });

  it('getCapabilities returns capabilities', () => {
    registry.register({ name: 'gmail' });
    const caps = registry.getCapabilities('gmail');
    expect(caps.supportsOAuth).toBe(true);
    expect(caps.canSend).toBe(true);
  });

  it('remove deletes provider', () => {
    registry.register({ name: 'gmail' });
    registry.remove('gmail');
    expect(registry.get('gmail')).toBeNull();
  });
});
