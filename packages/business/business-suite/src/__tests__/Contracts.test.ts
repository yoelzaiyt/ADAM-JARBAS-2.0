import { describe, it, expect, beforeEach } from 'vitest';
import { Contracts } from '../contracts/Contracts.js';

const CID = 'comp-1';

function contractData(overrides = {}) {
  return {
    companyId: CID,
    title: 'SaaS Agreement',
    type: 'saas' as const,
    status: 'draft' as const,
    counterparty: 'Acme Corp',
    value: 50000,
    currency: 'USD',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    autoRenew: false,
    renewalDate: undefined,
    tags: [],
    customFields: {},
    ...overrides,
  };
}

describe('Contracts', () => {
  let contracts: Contracts;

  beforeEach(() => {
    contracts = new Contracts();
  });

  it('creates and retrieves a contract', async () => {
    const c = await contracts.createContract(contractData());
    expect(c.id).toBeDefined();
    expect(c.alerts).toEqual([]);
    const found = await contracts.getContractById(c.id);
    expect(found?.title).toBe('SaaS Agreement');
  });

  it('activates a draft contract', async () => {
    const c = await contracts.createContract(contractData());
    const active = await contracts.activateContract(c.id);
    expect(active.status).toBe('active');
  });

  it('cannot activate a non-draft contract', async () => {
    const c = await contracts.createContract(contractData({ status: 'active' }));
    await expect(contracts.activateContract(c.id)).rejects.toThrow('not a draft');
  });

  it('suspends and terminates a contract', async () => {
    const c = await contracts.createContract(contractData());
    await contracts.activateContract(c.id);
    const suspended = await contracts.suspendContract(c.id);
    expect(suspended.status).toBe('suspended');
    const terminated = await contracts.terminateContract(c.id);
    expect(terminated.status).toBe('terminated');
  });

  it('renewContract extends end date', async () => {
    const c = await contracts.createContract(contractData());
    await contracts.activateContract(c.id);
    const newEnd = new Date('2026-12-31');
    const renewed = await contracts.renewContract(c.id, newEnd);
    expect(renewed.endDate).toEqual(newEnd);
    expect(renewed.status).toBe('active');
  });

  it('adds and acknowledges alerts', async () => {
    const c = await contracts.createContract(contractData());
    const alert = await contracts.addAlert(c.id, { type: 'renewal', message: 'Expires soon', severity: 'warning' });
    expect(alert.acknowledged).toBe(false);
    const ack = await contracts.acknowledgeAlert(c.id, alert.id);
    expect(ack.acknowledged).toBe(true);
  });

  it('lists expiring contracts within days', async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 15);
    await contracts.createContract(contractData({ endDate: soon }));
    await contracts.activateContract((await contracts.listContracts(CID))[0].id);
    const expiring = await contracts.getExpiringContracts(CID, 30);
    expect(expiring).toHaveLength(1);
  });

  it('builds contract summary', async () => {
    await contracts.createContract(contractData({ title: 'C1', type: 'saas', status: 'draft' }));
    await contracts.createContract(contractData({ title: 'C2', type: 'nda', status: 'active' }));
    const summary = await contracts.getContractSummary(CID);
    expect(summary.total).toBe(2);
    expect(summary.byType).toHaveLength(2);
  });
});
