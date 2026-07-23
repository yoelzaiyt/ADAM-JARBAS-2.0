import { describe, it, expect, beforeEach } from 'vitest';
import { Legal } from '../legal/Legal.js';

const CID = 'comp-1';

function processData(overrides = {}) {
  return {
    companyId: CID,
    number: 'LP-001',
    title: 'Contract Dispute v1',
    type: 'civil' as const,
    status: 'active' as const,
    risk: 'high',
    description: 'Dispute over terms',
    parties: ['Party A', 'Party B'],
    documents: [],
    deadline: undefined,
    nextHearing: undefined,
    ...overrides,
  };
}

describe('Legal', () => {
  let legal: Legal;

  beforeEach(() => {
    legal = new Legal();
  });

  it('creates and retrieves a process', async () => {
    const p = await legal.createProcess(processData());
    expect(p.id).toBeDefined();
    const found = await legal.getProcessById(p.id);
    expect(found?.title).toBe('Contract Dispute v1');
  });

  it('lists processes with status filter', async () => {
    await legal.createProcess(processData({ number: 'LP-001', status: 'active' }));
    await legal.createProcess(processData({ number: 'LP-002', status: 'closed' }));
    const active = await legal.listProcesses(CID, { status: 'active' });
    expect(active).toHaveLength(1);
  });

  it('closes a process', async () => {
    const p = await legal.createProcess(processData());
    const closed = await legal.closeProcess(p.id);
    expect(closed.status).toBe('closed');
  });

  it('suspends and appeals a process', async () => {
    const p = await legal.createProcess(processData());
    const suspended = await legal.suspendProcess(p.id);
    expect(suspended.status).toBe('suspended');
    const appealed = await legal.appealProcess(p.id);
    expect(appealed.status).toBe('appeal');
  });

  it('adds a document to a process', async () => {
    const p = await legal.createProcess(processData());
    const updated = await legal.addDocumentToProcess(p.id, 'https://docs.example.com/evidence.pdf');
    expect(updated.documents).toContain('https://docs.example.com/evidence.pdf');
  });

  it('creates and approves an opinion', async () => {
    const o = await legal.createOpinion({
      companyId: CID, processId: 'proc-1', title: 'IP Analysis',
      author: 'Legal Team', content: 'We have strong grounds.', status: 'draft',
    });
    const submitted = await legal.submitOpinion(o.id);
    expect(submitted.status).toBe('reviewed');
    const approved = await legal.approveOpinion(submitted.id);
    expect(approved.status).toBe('approved');
  });

  it('returns upcoming hearings', async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    await legal.createProcess(processData({ number: 'LP-H1', nextHearing: soon, status: 'active' }));
    const hearings = await legal.getUpcomingHearings(CID, 30);
    expect(hearings).toHaveLength(1);
  });

  it('builds legal dashboard', async () => {
    await legal.createProcess(processData({ number: 'L1', status: 'active', risk: 'high' }));
    await legal.createProcess(processData({ number: 'L2', status: 'closed', risk: 'low' }));
    const dashboard = await legal.getLegalDashboard(CID);
    expect(dashboard.totalProcesses).toBe(2);
    expect(dashboard.activeProcesses).toBe(1);
    expect(dashboard.byRisk).toHaveLength(2);
  });
});
