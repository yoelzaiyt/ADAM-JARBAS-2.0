import { describe, it, expect, beforeEach } from 'vitest';
import { Treasury } from '../treasury/Treasury.js';

const CID = 'comp-1';

function bankData(overrides = {}) {
  return {
    companyId: CID, name: 'Main Account', bank: 'Itau', agency: '0001',
    accountNumber: '12345', accountType: 'checking' as const,
    balance: 50000, availableBalance: 48000, currency: 'BRL', isActive: true,
    ...overrides,
  };
}

function investmentData(overrides = {}) {
  return {
    companyId: CID, bankAccountId: 'ba1', type: 'cdb' as const, name: 'CDB 120%',
    principal: 20000, currentValue: 22000, rate: 120, rateType: 'cdi' as const,
    startDate: new Date(), status: 'active' as const,
    ...overrides,
  };
}

function loanData(overrides = {}) {
  return {
    companyId: CID, bankAccountId: 'ba1', lender: 'Banco do Brasil',
    principal: 100000, outstandingBalance: 80000, rate: 1.5,
    installmentAmount: 2000, totalInstallments: 60, paidInstallments: 10,
    startDate: new Date(), endDate: new Date(), status: 'active' as const,
    ...overrides,
  };
}

describe('Treasury', () => {
  let tre: Treasury;

  beforeEach(() => {
    tre = new Treasury();
  });

  it('creates and retrieves a bank account', async () => {
    const ba = await tre.createBankAccount(bankData());
    expect(ba.id).toBeDefined();
    expect((await tre.getBankAccountById(ba.id))?.balance).toBe(50000);
  });

  it('updates and deletes a bank account', async () => {
    const ba = await tre.createBankAccount(bankData());
    const updated = await tre.updateBankAccount(ba.id, { balance: 60000 });
    expect(updated.balance).toBe(60000);
    expect(await tre.deleteBankAccount(ba.id)).toBe(true);
  });

  it('CRUD for investments', async () => {
    const inv = await tre.createInvestment(investmentData());
    expect(inv.id).toBeDefined();
    const updated = await tre.updateInvestment(inv.id, { currentValue: 25000 });
    expect(updated.currentValue).toBe(25000);
    expect(await tre.deleteInvestment(inv.id)).toBe(true);
  });

  it('lists investments filtered by type and status', async () => {
    await tre.createInvestment(investmentData({ type: 'cdb', status: 'active' }));
    await tre.createInvestment(investmentData({ type: 'stock', name: 'PETR4', status: 'matured' }));
    expect(await tre.listInvestments(CID, { type: 'cdb' })).toHaveLength(1);
    expect(await tre.listInvestments(CID, { status: 'matured' })).toHaveLength(1);
  });

  it('creates a loan and pays installments until paid off', async () => {
    const loan = await tre.createLoan(loanData({
      principal: 10000, outstandingBalance: 10000, installmentAmount: 5000,
      totalInstallments: 2, paidInstallments: 0,
    }));
    const after1 = await tre.payInstallment(loan.id);
    expect(after1.paidInstallments).toBe(1);
    expect(after1.outstandingBalance).toBe(5000);
    const after2 = await tre.payInstallment(loan.id);
    expect(after2.status).toBe('paid');
    expect(after2.outstandingBalance).toBe(0);
  });

  it('throws when paying installment on non-active loan', async () => {
    const loan = await tre.createLoan(loanData({ status: 'paid', outstandingBalance: 0 }));
    await expect(tre.payInstallment(loan.id)).rejects.toThrow('not active');
  });

  it('computes treasury summary', async () => {
    await tre.createBankAccount(bankData({ balance: 100000 }));
    await tre.createInvestment(investmentData({ currentValue: 50000 }));
    await tre.createLoan(loanData({ outstandingBalance: 30000 }));
    const summary = await tre.getTreasurySummary(CID);
    expect(summary.totalBankBalance).toBe(100000);
    expect(summary.totalInvestments).toBe(50000);
    expect(summary.totalLoansOutstanding).toBe(30000);
    expect(summary.netPosition).toBe(120000);
  });
});
