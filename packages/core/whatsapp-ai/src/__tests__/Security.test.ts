import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityEngine } from '../Security.js';

describe('SecurityEngine', () => {
  let security: SecurityEngine;

  beforeEach(() => {
    security = new SecurityEngine();
  });

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

  it('isSpam detects rapid messages', () => {
    for (let i = 0; i < 31; i++) {
      security.isSpam('user1');
    }
    expect(security.isSpam('user1')).toBe(true);
  });

  it('checkRateLimit allows within limit', () => {
    expect(security.checkRateLimit('id1', 5, 60000)).toBe(true);
  });

  it('encrypt returns hash', () => {
    const hash = security.encrypt('data');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
