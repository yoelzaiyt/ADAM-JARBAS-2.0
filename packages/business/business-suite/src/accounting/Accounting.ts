import type {
  ChartOfAccounts,
  JournalEntry,
  JournalLine,
  TrialBalance,
  TrialBalanceAccount,
  FinancialStatement,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface AccountingConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class Accounting {
  private logger = new DefaultLogger('accounting');
  private accounts = new Map<string, ChartOfAccounts>();
  private journalEntries = new Map<string, JournalEntry>();
  private entryCounter = 0;
  private config: AccountingConfig;

  constructor(config?: AccountingConfig) {
    this.config = config ?? {};
  }

  // ─── Chart of Accounts ────────────────────────────────────────────────────

  async createAccount(data: Omit<ChartOfAccounts, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChartOfAccounts> {
    const now = new Date();
    const account: ChartOfAccounts = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.accounts.set(account.id, account);
    await this.logger.info('Account created', { id: account.id, code: account.code, name: account.name });
    return account;
  }

  async getAccountById(id: string): Promise<ChartOfAccounts | undefined> {
    return this.accounts.get(id);
  }

  async listAccounts(companyId: string, filters?: { type?: ChartOfAccounts['type']; isActive?: boolean }): Promise<ChartOfAccounts[]> {
    let results = Array.from(this.accounts.values()).filter(a => a.companyId === companyId);
    if (filters?.type) results = results.filter(a => a.type === filters.type);
    if (filters?.isActive !== undefined) results = results.filter(a => a.isActive === filters.isActive);
    return results.sort((a, b) => a.code.localeCompare(b.code));
  }

  async updateAccount(id: string, data: Partial<ChartOfAccounts>): Promise<ChartOfAccounts> {
    const existing = this.accounts.get(id);
    if (!existing) throw new Error(`Account ${id} not found`);
    const updated: ChartOfAccounts = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.accounts.set(id, updated);
    await this.logger.info('Account updated', { id });
    return updated;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const deleted = this.accounts.delete(id);
    if (deleted) await this.logger.info('Account deleted', { id });
    return deleted;
  }

  // ─── Journal Entry ────────────────────────────────────────────────────────

  async createJournalEntry(data: Omit<JournalEntry, 'id' | 'entryNumber' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      throw new Error(`Journal entry is not balanced: debit=${totalDebit}, credit=${totalCredit}`);
    }

    this.entryCounter++;
    const now = new Date();
    const entryNumber = `JE-${now.getFullYear()}-${String(this.entryCounter).padStart(6, '0')}`;
    const entry: JournalEntry = {
      ...data,
      id: crypto.randomUUID(),
      entryNumber,
      createdAt: now,
      updatedAt: now,
    };
    this.journalEntries.set(entry.id, entry);
    await this.logger.info('Journal entry created', { id: entry.id, entryNumber });
    return entry;
  }

  async getJournalEntryById(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async listJournalEntries(companyId: string, filters?: { status?: JournalEntry['status'] }): Promise<JournalEntry[]> {
    let results = Array.from(this.journalEntries.values()).filter(e => e.companyId === companyId);
    if (filters?.status) results = results.filter(e => e.status === filters.status);
    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async updateJournalEntry(id: string, data: Partial<JournalEntry>): Promise<JournalEntry> {
    const existing = this.journalEntries.get(id);
    if (!existing) throw new Error(`Journal entry ${id} not found`);
    const updated: JournalEntry = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.journalEntries.set(id, updated);
    await this.logger.info('Journal entry updated', { id });
    return updated;
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    const deleted = this.journalEntries.delete(id);
    if (deleted) await this.logger.info('Journal entry deleted', { id });
    return deleted;
  }

  async postJournalEntry(id: string, postedBy: string): Promise<JournalEntry> {
    const entry = this.journalEntries.get(id);
    if (!entry) throw new Error(`Journal entry ${id} not found`);
    if (entry.status !== 'draft') throw new Error(`Journal entry ${id} is not in draft status`);
    entry.status = 'posted';
    entry.postedBy = postedBy;
    entry.postedAt = new Date();
    entry.updatedAt = new Date();
    this.journalEntries.set(id, entry);
    await this.logger.info('Journal entry posted', { id });
    return entry;
  }

  async reverseJournalEntry(id: string, postedBy: string): Promise<JournalEntry> {
    const original = this.journalEntries.get(id);
    if (!original) throw new Error(`Journal entry ${id} not found`);
    if (original.status !== 'posted') throw new Error(`Journal entry ${id} is not posted`);

    original.status = 'reversed';
    original.updatedAt = new Date();
    this.journalEntries.set(id, original);

    const reversedLines: JournalLine[] = original.lines.map(l => ({
      id: crypto.randomUUID(),
      accountId: l.accountId,
      debit: l.credit,
      credit: l.debit,
      description: `Reversal: ${l.description ?? ''}`,
    }));

    this.entryCounter++;
    const now = new Date();
    const entryNumber = `JE-${now.getFullYear()}-${String(this.entryCounter).padStart(6, '0')}`;
    const reversal: JournalEntry = {
      companyId: original.companyId,
      id: crypto.randomUUID(),
      entryNumber,
      date: now,
      description: `Reversal of ${original.entryNumber}`,
      lines: reversedLines,
      status: 'posted',
      postedBy,
      postedAt: now,
      createdBy: postedBy,
      createdAt: now,
      updatedAt: now,
    };
    this.journalEntries.set(reversal.id, reversal);
    await this.logger.info('Journal entry reversed', { originalId: id, reversalId: reversal.id });
    return reversal;
  }

  // ─── Trial Balance ────────────────────────────────────────────────────────

  async generateTrialBalance(companyId: string, period: string): Promise<TrialBalance> {
    const posted = Array.from(this.journalEntries.values()).filter(
      e => e.companyId === companyId && e.status === 'posted'
    );

    const accountTotals = new Map<string, { code: string; name: string; debit: number; credit: number }>();
    for (const entry of posted) {
      for (const line of entry.lines) {
        const acct = this.accounts.get(line.accountId);
        const key = line.accountId;
        const existing = accountTotals.get(key) ?? { code: acct?.code ?? '', name: acct?.name ?? '', debit: 0, credit: 0 };
        existing.debit += line.debit;
        existing.credit += line.credit;
        accountTotals.set(key, existing);
      }
    }

    const accounts: TrialBalanceAccount[] = Array.from(accountTotals.entries()).map(([accountId, v]) => ({
      accountId,
      accountCode: v.code,
      accountName: v.name,
      debit: v.debit,
      credit: v.credit,
      balance: v.debit - v.credit,
    }));

    const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
    const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);

    const tb: TrialBalance = {
      id: crypto.randomUUID(),
      companyId,
      period,
      accounts,
      totalDebit,
      totalCredit,
      generatedAt: new Date(),
    };
    await this.logger.info('Trial balance generated', { companyId, period, totalDebit, totalCredit });
    return tb;
  }

  // ─── Financial Statement ──────────────────────────────────────────────────

  async generateFinancialStatement(
    companyId: string,
    type: FinancialStatement['type'],
    period: string
  ): Promise<FinancialStatement> {
    const accounts = Array.from(this.accounts.values()).filter(a => a.companyId === companyId);
    const tb = await this.generateTrialBalance(companyId, period);

    const data: Record<string, unknown> = { trialBalance: tb };

    if (type === 'balance_sheet') {
      const assets = tb.accounts.filter(a => {
        const acct = accounts.find(c => c.id === a.accountId);
        return acct?.type === 'asset';
      });
      const liabilities = tb.accounts.filter(a => {
        const acct = accounts.find(c => c.id === a.accountId);
        return acct?.type === 'liability';
      });
      const equity = tb.accounts.filter(a => {
        const acct = accounts.find(c => c.id === a.accountId);
        return acct?.type === 'equity';
      });
      data.totalAssets = assets.reduce((s, a) => s + a.balance, 0);
      data.totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(a.balance), 0);
      data.totalEquity = equity.reduce((s, a) => s + a.balance, 0);
      data.assets = assets;
      data.liabilities = liabilities;
      data.equity = equity;
    } else if (type === 'dre') {
      const revenue = tb.accounts.filter(a => {
        const acct = accounts.find(c => c.id === a.accountId);
        return acct?.type === 'revenue';
      });
      const expenses = tb.accounts.filter(a => {
        const acct = accounts.find(c => c.id === a.accountId);
        return acct?.type === 'expense';
      });
      data.totalRevenue = revenue.reduce((s, a) => s + a.balance, 0);
      data.totalExpenses = expenses.reduce((s, a) => s + Math.abs(a.balance), 0);
      data.netIncome = (data.totalRevenue as number) - (data.totalExpenses as number);
      data.revenue = revenue;
      data.expenses = expenses;
    }

    const stmt: FinancialStatement = {
      id: crypto.randomUUID(),
      companyId,
      type,
      period,
      data,
      generatedAt: new Date(),
    };
    await this.logger.info('Financial statement generated', { companyId, type, period });
    return stmt;
  }
}

export { Accounting as default };
