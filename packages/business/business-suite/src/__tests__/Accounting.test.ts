import { describe, it, expect, beforeEach } from 'vitest';
import { Accounting } from '../accounting/Accounting.js';

const CID = 'comp-1';

function chartAccount(code: string, name: string, type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') {
  return { companyId: CID, code, name, type, isActive: true };
}

function balancedLines(drAcct: string, crAcct: string, amount: number) {
  return [
    { id: `l-${crypto.randomUUID()}`, accountId: drAcct, debit: amount, credit: 0, description: 'Dr' },
    { id: `l-${crypto.randomUUID()}`, accountId: crAcct, debit: 0, credit: amount, description: 'Cr' },
  ];
}

describe('Accounting', () => {
  let acc: Accounting;

  beforeEach(() => {
    acc = new Accounting();
  });

  it('creates chart of accounts entries', async () => {
    const cash = await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    const revenue = await acc.createAccount(chartAccount('4010', 'Revenue', 'revenue'));
    expect(cash.code).toBe('1010');
    expect(revenue.type).toBe('revenue');
  });

  it('lists accounts sorted by code', async () => {
    await acc.createAccount(chartAccount('4010', 'Revenue', 'revenue'));
    await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    const all = await acc.listAccounts(CID);
    expect(all[0].code).toBe('1010');
    expect(all[1].code).toBe('4010');
  });

  it('creates a balanced journal entry', async () => {
    const cash = await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    const rev = await acc.createAccount(chartAccount('4010', 'Revenue', 'revenue'));
    const entry = await acc.createJournalEntry({
      companyId: CID, date: new Date(), description: 'Sale',
      lines: balancedLines(cash.id, rev.id, 5000), status: 'draft', createdBy: 'admin',
    });
    expect(entry.entryNumber).toMatch(/^JE-/);
    expect(entry.lines).toHaveLength(2);
  });

  it('rejects unbalanced journal entries', async () => {
    const cash = await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    await expect(acc.createJournalEntry({
      companyId: CID, date: new Date(), description: 'Bad',
      lines: [{ id: 'l1', accountId: cash.id, debit: 1000, credit: 0 }],
      status: 'draft', createdBy: 'admin',
    })).rejects.toThrow('not balanced');
  });

  it('posts and reverses a journal entry', async () => {
    const cash = await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    const rev = await acc.createAccount(chartAccount('4010', 'Revenue', 'revenue'));
    const entry = await acc.createJournalEntry({
      companyId: CID, date: new Date(), description: 'Sale',
      lines: balancedLines(cash.id, rev.id, 1000), status: 'draft', createdBy: 'admin',
    });
    const posted = await acc.postJournalEntry(entry.id, 'admin');
    expect(posted.status).toBe('posted');
    expect(posted.postedBy).toBe('admin');
    const reversal = await acc.reverseJournalEntry(entry.id, 'admin');
    expect(reversal.status).toBe('posted');
    expect(reversal.description).toContain('Reversal');
  });

  it('generates a trial balance', async () => {
    const cash = await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    const rev = await acc.createAccount(chartAccount('4010', 'Revenue', 'revenue'));
    const entry = await acc.createJournalEntry({
      companyId: CID, date: new Date(), description: 'Sale',
      lines: balancedLines(cash.id, rev.id, 1000), status: 'draft', createdBy: 'admin',
    });
    await acc.postJournalEntry(entry.id, 'admin');
    const tb = await acc.generateTrialBalance(CID, '2026-Q1');
    expect(tb.totalDebit).toBe(1000);
    expect(tb.totalCredit).toBe(1000);
    expect(tb.accounts).toHaveLength(2);
  });

  it('throws when posting non-draft entry', async () => {
    const cash = await acc.createAccount(chartAccount('1010', 'Cash', 'asset'));
    const rev = await acc.createAccount(chartAccount('4010', 'Revenue', 'revenue'));
    const entry = await acc.createJournalEntry({
      companyId: CID, date: new Date(), description: 'Sale',
      lines: balancedLines(cash.id, rev.id, 500), status: 'draft', createdBy: 'admin',
    });
    await acc.postJournalEntry(entry.id, 'admin');
    await expect(acc.postJournalEntry(entry.id, 'admin')).rejects.toThrow('not in draft');
  });
});
