import { describe, it, expect, beforeEach } from 'vitest';
import { Payroll } from '../payroll/Payroll.js';

const CID = 'comp-1';

function recordData(overrides = {}) {
  return {
    companyId: CID,
    employeeId: 'emp-1',
    period: '2025-01',
    baseSalary: 5000,
    overtimePay: 500,
    bonuses: 200,
    deductions: 300,
    status: 'draft' as const,
    currency: 'USD',
    ...overrides,
  };
}

describe('Payroll', () => {
  let payroll: Payroll;

  beforeEach(() => {
    payroll = new Payroll();
  });

  it('creates a record with computed netPay', async () => {
    const r = await payroll.createRecord(recordData());
    expect(r.id).toBeDefined();
    expect(r.netPay).toBe(5000 + 500 + 200 - 300);
  });

  it('lists records with period filter', async () => {
    await payroll.createRecord(recordData({ period: '2025-01', employeeId: 'e1' }));
    await payroll.createRecord(recordData({ period: '2025-02', employeeId: 'e2' }));
    const jan = await payroll.listRecords(CID, { period: '2025-01' });
    expect(jan).toHaveLength(1);
  });

  it('approve then pay workflow', async () => {
    const r = await payroll.createRecord(recordData());
    const approved = await payroll.approveRecord(r.id);
    expect(approved.status).toBe('approved');
    const paid = await payroll.payRecord(approved.id);
    expect(paid.status).toBe('paid');
  });

  it('cannot pay a draft record', async () => {
    const r = await payroll.createRecord(recordData());
    await expect(payroll.payRecord(r.id)).rejects.toThrow('is not approved');
  });

  it('recalculates netPay on update', async () => {
    const r = await payroll.createRecord(recordData());
    const updated = await payroll.updateRecord(r.id, { baseSalary: 6000, deductions: 500 });
    expect(updated.netPay).toBe(6000 + 500 + 200 - 500);
  });

  it('creates and deactivates benefits', async () => {
    const b = await payroll.createBenefit({
      companyId: CID, employeeId: 'emp-1', type: 'health_insurance',
      employerContribution: 300, employeeContribution: 100, isActive: true,
      startDate: new Date(), endDate: undefined, provider: 'Aetna', planName: 'Gold',
    });
    expect(b.isActive).toBe(true);
    const deactivated = await payroll.deactivateBenefit(b.id);
    expect(deactivated.isActive).toBe(false);
  });

  it('computes payroll summary', async () => {
    await payroll.createRecord(recordData({ employeeId: 'e1', baseSalary: 4000, overtimePay: 0, bonuses: 0, deductions: 0 }));
    await payroll.createRecord(recordData({ employeeId: 'e2', baseSalary: 6000, overtimePay: 0, bonuses: 0, deductions: 0 }));
    const summary = await payroll.getPayrollSummary(CID, '2025-01');
    expect(summary.totalEmployees).toBe(2);
    expect(summary.totalBaseSalary).toBe(10000);
  });
});
