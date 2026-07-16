import { describe, it, expect, beforeEach } from 'vitest';
import { TokenManager } from '../core/TokenManager.js';

describe('TokenManager', () => {
  let manager: TokenManager;

  beforeEach(() => {
    manager = new TokenManager({
      encryptionKey: 'test-key',
      storageType: 'memory',
      maxTokens: 100,
      autoRotate: false,
      rotationDays: 90,
    });
  });

  it('should add a token', () => {
    const token = manager.addToken('api-1', 'My Token', 'sk-1234567890abcdef');
    expect(token.id).toBeDefined();
    expect(token.name).toBe('My Token');
    expect(token.maskedKey).toContain('****');
    expect(token.isActive).toBe(true);
  });

  it('should mask API keys', () => {
    const token = manager.addToken('api-1', 'Token', 'sk-1234567890abcdef');
    expect(token.maskedKey).toBe('sk-1****cdef');
  });

  it('should get token by ID', () => {
    const token = manager.addToken('api-1', 'Token', 'sk-123');
    const found = manager.getToken(token.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Token');
  });

  it('should get token by API ID', () => {
    manager.addToken('api-1', 'Token 1', 'sk-111');
    manager.addToken('api-1', 'Token 2', 'sk-222');
    manager.addToken('api-2', 'Token 3', 'sk-333');

    const token = manager.getTokenByApi('api-1');
    expect(token).toBeDefined();
    expect(token?.apiId).toBe('api-1');
  });

  it('should list tokens', () => {
    manager.addToken('api-1', 'Token 1', 'sk-111');
    manager.addToken('api-2', 'Token 2', 'sk-222');

    const tokens = manager.listTokens();
    expect(tokens.length).toBe(2);
  });

  it('should revoke token', () => {
    const token = manager.addToken('api-1', 'Token', 'sk-123');
    const revoked = manager.revokeToken(token.id);
    expect(revoked).toBe(true);
    expect(manager.getToken(token.id)?.isActive).toBe(false);
  });

  it('should delete token', () => {
    const token = manager.addToken('api-1', 'Token', 'sk-123');
    const deleted = manager.deleteToken(token.id);
    expect(deleted).toBe(true);
    expect(manager.getToken(token.id)).toBeUndefined();
  });

  it('should update token', () => {
    const token = manager.addToken('api-1', 'Old Name', 'sk-123');
    const updated = manager.updateToken(token.id, { name: 'New Name' });
    expect(updated?.name).toBe('New Name');
  });

  it('should return stats', () => {
    manager.addToken('api-1', 'Token 1', 'sk-111');
    manager.addToken('api-2', 'Token 2', 'sk-222');

    const stats = manager.getStats();
    expect(stats.total).toBe(2);
    expect(stats.active).toBe(2);
  });

  it('should enforce max token limit', () => {
    const smallManager = new TokenManager({
      encryptionKey: 'test-key',
      storageType: 'memory',
      maxTokens: 2,
      autoRotate: false,
      rotationDays: 90,
    });

    smallManager.addToken('api-1', 'Token 1', 'sk-1');
    smallManager.addToken('api-2', 'Token 2', 'sk-2');

    expect(() => {
      smallManager.addToken('api-3', 'Token 3', 'sk-3');
    }).toThrow('Maximum token limit');
  });

  it('should track stale tokens', () => {
    const token = manager.addToken('api-1', 'Token', 'sk-123');
    const stale = manager.getStaleTokens(0);
    expect(stale.length).toBe(1);
  });
});
