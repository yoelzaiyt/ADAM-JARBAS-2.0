import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityEngine } from '../Security.js';

describe('SecurityEngine', () => {
  let security: SecurityEngine;

  beforeEach(() => { security = new SecurityEngine(); });

  it('creates engine', () => { expect(security).toBeDefined(); });

  it('logAudit stores entry', () => {
    security.logAudit({ action: 'login', userId: 'u1', target: 'system', details: {}, level: 'interno' });
    expect(security.getAuditLogs().length).toBe(1);
  });

  it('getAuditLogs filters by userId', () => {
    security.logAudit({ action: 'a', userId: 'u1', target: 't', details: {}, level: 'publico' });
    security.logAudit({ action: 'b', userId: 'u2', target: 't', details: {}, level: 'publico' });
    expect(security.getAuditLogs('u1').length).toBe(1);
  });

  it('sanitizeInput escapes HTML', () => {
    expect(security.sanitizeInput('<script>alert(1)</script>')).not.toContain('<');
  });

  it('checkRateLimit allows within limit', () => {
    expect(security.checkRateLimit('id1', 5, 60000)).toBe(true);
  });

  it('encrypt returns hash', () => {
    expect(security.encrypt('data')).toMatch(/^[a-f0-9]{64}$/);
  });

  it('validateOAuthToken validates', () => {
    expect(security.validateOAuthToken('short')).toBe(false);
    expect(security.validateOAuthToken('long-enough-token-value')).toBe(true);
  });
});
