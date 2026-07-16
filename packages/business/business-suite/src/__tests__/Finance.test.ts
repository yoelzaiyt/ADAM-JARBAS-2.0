import { describe, it, expect, beforeEach } from 'vitest';
import { Finance } from '../finance/Finance.js';

const CID = 'comp-1';

function accountData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Main Bank',
    type: 'bank' as const,
    balance: 10000,
    currency: 'BRL',
    isActive: true,
    ...overrides,
  };
}

function txnData(overrides = {}) {
  return {
    companyId: CID,
    type: 'income' as const,
    accountId: '',
    category: 'Revenue',
    description: 'Invoice 001',
    amount: 5000,
    currency: 'BRL',
    date: new Date(),
    status: 'paid' as const,
    attachments: [],
    createdBy: 'user1',
    ...overrides,
  };
}

describe('Finance', () => {
  let fin: Finance;

  beforeEach(() => {
    fin = new Finance();
  });

  it('creates and retrieves a financial account', async () => {
    const a = await fin.createAccount(accountData());
    expect(a.id).toBeDefined();
    expect((await fin.getAccountById(a.id))?.balance).toBe(10000);
  });

  it('updates and deletes an account', async () => {
    const a = await fin.createAccount(accountData());
    const updated = await fin.updateAccount(a.id, { balance: 15000 });
    expect(updated.balance).toBe(15000);
    expect(await fin.deleteAccount(a.id)).toBe(true);
  });

  it('creates income transaction and increases account balance', async () => {
    const a = await fin.createAccount(accountData({ balance: 10000 }));
    const txn = await fin.createTransaction(txnData({ accountId: a.id, amount: 2000 }));
    expect(txn.id).toBeDefined();
    const after = await fin.getAccountById(a.id);
    expect(after?.balance).toBe(12000);
  });

  it('creates expense transaction and decreases account balance', async () => {
    const a = await fin.createAccount(accountData({ balance: 10000 }));
    await fin.createTransaction(txnData({ accountId: a.id, type: 'expense', amount: 3000 }));
    const after = await fin.getAccountById(a.id);
    expect(after?.balance).toBe(7000);
  });

  it('creates transfer between accounts', async () => {
    const src = await fin.createAccount(accountData({ balance: 10000 }));
    const dst = await fin.createAccount(accountData({ name: 'Savings', balance: 5000 }));
    await fin.createTransaction(txnData({
      type: 'transfer', accountId: src.id, destinationAccountId: dst.id, amount: 2500,
    }));
    expect((await fin.getAccountById(dst.id))?.balance).toBe(7500);
  });

  it('lists transactions filtered by type', async () => {
    const a = await fin.createAccount(accountData());
    await fin.createTransaction(txnData({ accountId: a.id, type: 'income', amount: 100 }));
    await fin.createTransaction(txnData({ accountId: a.id, type: 'expense', amount: 50 }));
    const incomes = await fin.listTransactions(CID, { type: 'income' });
    expect(incomes).toHaveLength(1);
  });

  it('computes cash flow summary', async () => {
    const a = await fin.createAccount(accountData());
    await fin.createTransaction(txnData({ accountId: a.id, type: 'income', amount: 10000, status: 'paid' }));
    await fin.createTransaction(txnData({ accountId: a.id, type: 'expense', amount: 4000, status: 'paid' }));
    const summary = await fin.getCashFlowSummary(CID, '2026-01');
    expect(summary.totalIncome).toBe(10000);
    expect(summary.totalExpense).toBe(4000);
    expect(summary.netCashFlow).toBe(6000);
  });
});
