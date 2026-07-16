import { describe, it, expect, beforeEach } from 'vitest';
import { Compliance } from '../compliance/Compliance.js';

const CID = 'comp-1';

function recordData(overrides = {}) {
  return {
    companyId: CID,
    type: 'gdpr' as const,
    requirement: 'Data retention policy',
    status: 'pending_review' as const,
    description: 'Must retain data for 90 days',
    evidence: [],
    responsible: 'compliance@corp.com',
    nextReviewDate: new Date('2025-06-01'),
    lastAuditDate: undefined,
    ...overrides,
  };
}

function auditData(overrides = {}) {
  return {
    companyId: CID,
    title: 'Annual Security Audit',
    type: 'internal',
    auditor: 'Audit Team',
    startDate: new Date('2025-01-01'),
    endDate: undefined,
    overallResult: undefined as any,
    findings: [],
    ...overrides,
  };
}

describe('Compliance', () => {
  let compliance: Compliance;

  beforeEach(() => {
    compliance = new Compliance();
  });

  it('creates and retrieves a compliance record', async () => {
    const r = await compliance.createRecord(recordData());
    expect(r.id).toBeDefined();
    const found = await compliance.getRecordById(r.id);
    expect(found?.requirement).toBe('Data retention policy');
  });

  it('lists records with type filter', async () => {
    await compliance.createRecord(recordData({ type: 'gdpr' }));
    await compliance.createRecord(recordData({ type: 'sox' }));
    const gdpr = await compliance.listRecords(CID, { type: 'gdpr' });
    expect(gdpr).toHaveLength(1);
  });

  it('marks record compliant and non-compliant', async () => {
    const r = await compliance.createRecord(recordData());
    const compliant = await compliance.markCompliant(r.id);
    expect(compliant.status).toBe('compliant');
    expect(compliant.lastAuditDate).toBeDefined();
    const nonCompliant = await compliance.markNonCompliant(r.id);
    expect(nonCompliant.status).toBe('non_compliant');
  });

  it('builds compliance dashboard', async () => {
    await compliance.createRecord(recordData({ type: 'gdpr', status: 'compliant' }));
    await compliance.createRecord(recordData({ type: 'gdpr', status: 'non_compliant' }));
    await compliance.createRecord(recordData({ type: 'sox', status: 'partial' }));
    const dash = await compliance.getComplianceDashboard(CID);
    expect(dash.totalRecords).toBe(3);
    expect(dash.compliant).toBe(1);
    expect(dash.nonCompliant).toBe(1);
    expect(dash.byType).toHaveLength(2);
  });

  it('creates audit and adds findings', async () => {
    const a = await compliance.createAudit(auditData());
    expect(a.id).toBeDefined();
    const finding = await compliance.addFinding(a.id, {
      title: 'Missing encryption', severity: 'critical', description: 'Data at rest not encrypted',
      recommendation: 'Enable AES-256', status: 'open',
    });
    expect(finding.id).toBeDefined();
    expect(finding.severity).toBe('critical');
  });

  it('resolves a finding', async () => {
    const a = await compliance.createAudit(auditData());
    const f = await compliance.addFinding(a.id, {
      title: 'Access control gap', severity: 'high', description: 'Weak passwords',
      recommendation: 'Enforce MFA', status: 'open',
    });
    const resolved = await compliance.resolveFinding(a.id, f.id);
    expect(resolved.status).toBe('resolved');
  });

  it('completes audit and builds audit dashboard', async () => {
    const a = await compliance.createAudit(auditData());
    await compliance.addFinding(a.id, {
      title: 'Issue 1', severity: 'medium', description: 'desc',
      recommendation: 'fix', status: 'open',
    });
    const completed = await compliance.completeAudit(a.id, 'pass');
    expect(completed.overallResult).toBe('pass');
    expect(completed.endDate).toBeDefined();
    const dash = await compliance.getAuditDashboard(CID);
    expect(dash.totalAudits).toBe(1);
    expect(dash.passed).toBe(1);
    expect(dash.openFindings).toBe(1);
  });
});
