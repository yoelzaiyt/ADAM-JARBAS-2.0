import { describe, it, expect, beforeEach } from 'vitest';
import { Sales } from '../sales/Sales.js';

const CID = 'comp-1';

function targetData(overrides = {}) {
  return {
    companyId: CID, name: 'Q1 Target', period: '2026-Q1',
    targetAmount: 100000, currentAmount: 0, currency: 'BRL',
    ...overrides,
  };
}

function commissionData(overrides = {}) {
  return {
    companyId: CID, salesPersonId: 'sp-1', opportunityId: 'opp-1',
    saleAmount: 10000, commissionRate: 5, commissionAmount: 500,
    status: 'pending' as const, period: '2026-Q1',
    ...overrides,
  };
}

describe('Sales', () => {
  let sales: Sales;

  beforeEach(() => {
    sales = new Sales();
  });

  it('creates and retrieves a sales target', async () => {
    const t = await sales.createTarget(targetData());
    expect(t.id).toBeDefined();
    expect((await sales.getTargetById(t.id))?.targetAmount).toBe(100000);
  });

  it('adds sale to target and tracks progress', async () => {
    const t = await sales.createTarget(targetData());
    await sales.addSaleToTarget(t.id, 25000);
    await sales.addSaleToTarget(t.id, 15000);
    const updated = await sales.getTargetById(t.id);
    expect(updated?.currentAmount).toBe(40000);
  });

  it('updates and deletes a target', async () => {
    const t = await sales.createTarget(targetData());
    await sales.updateTarget(t.id, { name: 'Q1 Revised' });
    expect((await sales.getTargetById(t.id))?.name).toBe('Q1 Revised');
    expect(await sales.deleteTarget(t.id)).toBe(true);
  });

  it('CRUD for commissions', async () => {
    const c = await sales.createCommission(commissionData());
    expect(c.id).toBeDefined();
    expect((await sales.getCommissionById(c.id))?.commissionAmount).toBe(500);
    expect(await sales.deleteCommission(c.id)).toBe(true);
  });

  it('approves and pays commission in sequence', async () => {
    const c = await sales.createCommission(commissionData());
    const approved = await sales.approveCommission(c.id);
    expect(approved.status).toBe('approved');
    const paid = await sales.payCommission(c.id);
    expect(paid.status).toBe('paid');
  });

  it('throws when approving non-pending commission', async () => {
    const c = await sales.createCommission(commissionData({ status: 'approved' }));
    await expect(sales.approveCommission(c.id)).rejects.toThrow('not pending');
  });

  it('computes sales KPIs', async () => {
    const t = await sales.createTarget(targetData({ targetAmount: 50000 }));
    await sales.addSaleToTarget(t.id, 30000);
    await sales.createCommission(commissionData({ saleAmount: 30000, commissionAmount: 1500, status: 'paid' }));
    await sales.createCommission(commissionData({ salesPersonId: 'sp-2', opportunityId: 'opp-2', saleAmount: 10000, commissionAmount: 500, status: 'pending' }));
    const kpis = await sales.getSalesKPIs(CID, '2026-Q1');
    expect(kpis.totalTarget).toBe(50000);
    expect(kpis.totalAchieved).toBe(30000);
    expect(kpis.achievementRate).toBe(60);
    expect(kpis.totalCommissions).toBe(2000);
    expect(kpis.paidCommissions).toBe(1500);
    expect(kpis.pendingCommissions).toBe(500);
  });
});
