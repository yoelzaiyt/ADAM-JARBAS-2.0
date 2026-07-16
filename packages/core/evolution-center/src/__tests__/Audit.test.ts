import { describe, it, expect } from 'vitest';
import { Audit } from '../audit/Audit.js';

describe('Audit', () => {
  const audit = new Audit();

  it('creates Audit', () => { expect(audit).toBeDefined(); });

  it('records entry', () => {
    const entry = audit.record('deploy', 'dev', 'production', { version: '1.0.0' });
    expect(entry.action).toBe('deploy');
    expect(entry.immutable).toBe(true);
  });

  it('gets all entries', () => {
    audit.record('test', 'dev', 'test', {});
    expect(audit.getAll().length).toBeGreaterThan(0);
  });

  it('gets entries by actor', () => {
    audit.record('action', 'user1', 'target', {});
    expect(audit.getByActor('user1').length).toBeGreaterThan(0);
  });

  it('gets entries by action', () => {
    audit.record('deploy', 'dev', 'prod', {});
    expect(audit.getByAction('deploy').length).toBeGreaterThan(0);
  });

  it('gets recent entries', () => {
    const recent = audit.getRecent(24);
    expect(Array.isArray(recent)).toBe(true);
  });

  it('exports entries', () => {
    const exported = audit.exportEntries();
    expect(Array.isArray(exported)).toBe(true);
  });

  it('gets stats', () => {
    const stats = audit.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
