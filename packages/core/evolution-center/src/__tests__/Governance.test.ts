import { describe, it, expect } from 'vitest';
import { Governance } from '../governance/Governance.js';

describe('Governance', () => {
  const gov = new Governance();

  it('creates Governance', () => { expect(gov).toBeDefined(); });

  it('creates policy', () => {
    const policy = gov.createPolicy({
      name: 'Security Policy', description: 'Security rules', domain: 'security',
      rules: [{ id: '1', name: 'No secrets', description: 'No secrets in code', condition: 'true', action: 'block', severity: 'critical' }],
      enabled: true
    });
    expect(policy.name).toBe('Security Policy');
  });

  it('adds rule to policy', () => {
    const policy = gov.createPolicy({
      name: 'Test', description: '', domain: 'quality',
      rules: [], enabled: true
    });
    const rule = gov.addRule(policy.id, { name: 'Rule1', description: 'Test rule', condition: 'true', action: 'warn', severity: 'medium' });
    expect(rule).toBeDefined();
  });

  it('evaluates policy', () => {
    gov.createPolicy({
      name: 'Arch Policy', description: '', domain: 'architecture',
      rules: [{ id: '1', name: 'R', description: '', condition: 'true', action: 'block', severity: 'high' }], enabled: true
    });
    const result = gov.evaluate('architecture', {});
    expect(result.policiesChecked).toBeGreaterThan(0);
  });

  it('enables/disables policy', () => {
    const policy = gov.createPolicy({
      name: 'Test', description: '', domain: 'release',
      rules: [], enabled: false
    });
    gov.enable(policy.id);
    expect(gov.getById(policy.id)!.enabled).toBe(true);
  });

  it('gets stats', () => {
    const stats = gov.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
