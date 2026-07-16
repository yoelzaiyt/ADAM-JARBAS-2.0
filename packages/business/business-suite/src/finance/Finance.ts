import type {
  FinancialAccount,
  Transaction,
  CashFlow,
  CashFlowProjection,
  BankReconciliation,
  ReconciliationItem,
  AccountType,
  TransactionStatus,
  PaymentMethod,
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

export interface FinanceConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface CashFlowSummary {
  period: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  closingBalance: number;
  byCategory: { category: string; income: number; expense: number }[];
}

export class Finance {
  private logger = new DefaultLogger('finance');
  private accounts = new Map<string, FinancialAccount>();
  private transactions = new Map<string, Transaction>();
  private cashFlows = new Map<string, CashFlow>();
  private reconciliations = new Map<string, BankReconciliation>();
  private config: FinanceConfig;

  constructor(config?: FinanceConfig) {
    this.config = config ?? {};
  }

  // ─── Financial Account ────────────────────────────────────────────────────

  async createAccount(data: Omit<FinancialAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialAccount> {
    const now = new Date();
    const account: FinancialAccount = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.accounts.set(account.id, account);
    await this.logger.info('Account created', { id: account.id, name: account.name });
    return account;
  }

  async getAccountById(id: string): Promise<FinancialAccount | undefined> {
    return this.accounts.get(id);
  }

  async listAccounts(companyId: string, filters?: { type?: AccountType; isActive?: boolean }): Promise<FinancialAccount[]> {
    let results = Array.from(this.accounts.values()).filter(a => a.companyId === companyId);
    if (filters?.type) results = results.filter(a => a.type === filters.type);
    if (filters?.isActive !== undefined) results = results.filter(a => a.isActive === filters.isActive);
    return results;
  }

  async updateAccount(id: string, data: Partial<FinancialAccount>): Promise<FinancialAccount> {
    const existing = this.accounts.get(id);
    if (!existing) throw new Error(`Account ${id} not found`);
    const updated: FinancialAccount = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.accounts.set(id, updated);
    await this.logger.info('Account updated', { id });
    return updated;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const deleted = this.accounts.delete(id);
    if (deleted) await this.logger.info('Account deleted', { id });
    return deleted;
  }

  // ─── Transaction ──────────────────────────────────────────────────────────

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date();
    const txn: Transaction = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.transactions.set(txn.id, txn);

    const account = this.accounts.get(txn.accountId);
    if (account) {
      if (txn.type === 'income') account.balance += txn.amount;
      else if (txn.type === 'expense') account.balance -= txn.amount;
      account.updatedAt = now;
      this.accounts.set(account.id, account);
    }

    if (txn.type === 'transfer' && txn.destinationAccountId) {
      const dest = this.accounts.get(txn.destinationAccountId);
      if (dest) {
        dest.balance += txn.amount;
        dest.updatedAt = now;
        this.accounts.set(dest.id, dest);
      }
    }

    await this.logger.info('Transaction created', { id: txn.id, type: txn.type, amount: txn.amount });
    return txn;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async listTransactions(companyId: string, filters?: { accountId?: string; status?: TransactionStatus; type?: Transaction['type'] }): Promise<Transaction[]> {
    let results = Array.from(this.transactions.values()).filter(t => t.companyId === companyId);
    if (filters?.accountId) results = results.filter(t => t.accountId === filters.accountId);
    if (filters?.status) results = results.filter(t => t.status === filters.status);
    if (filters?.type) results = results.filter(t => t.type === filters.type);
    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const existing = this.transactions.get(id);
    if (!existing) throw new Error(`Transaction ${id} not found`);
    const updated: Transaction = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.transactions.set(id, updated);
    await this.logger.info('Transaction updated', { id });
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const deleted = this.transactions.delete(id);
    if (deleted) await this.logger.info('Transaction deleted', { id });
    return deleted;
  }

  // ─── Cash Flow ────────────────────────────────────────────────────────────

  async createCashFlow(data: Omit<CashFlow, 'id' | 'createdAt'>): Promise<CashFlow> {
    const cf: CashFlow = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    this.cashFlows.set(cf.id, cf);
    await this.logger.info('CashFlow created', { id: cf.id, period: cf.period });
    return cf;
  }

  async getCashFlowById(id: string): Promise<CashFlow | undefined> {
    return this.cashFlows.get(id);
  }

  async listCashFlows(companyId: string): Promise<CashFlow[]> {
    return Array.from(this.cashFlows.values()).filter(c => c.companyId === companyId);
  }

  async getCashFlowSummary(companyId: string, period: string): Promise<CashFlowSummary> {
    const txns = Array.from(this.transactions.values()).filter(
      t => t.companyId === companyId && t.status === 'paid'
    );
    const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const catMap = new Map<string, { income: number; expense: number }>();
    for (const t of txns) {
      const entry = catMap.get(t.category) ?? { income: 0, expense: 0 };
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
      catMap.set(t.category, entry);
    }

    return {
      period,
      openingBalance: 0,
      totalIncome: income,
      totalExpense: expense,
      netCashFlow: income - expense,
      closingBalance: income - expense,
      byCategory: Array.from(catMap.entries()).map(([category, v]) => ({ category, ...v })),
    };
  }

  // ─── Bank Reconciliation ──────────────────────────────────────────────────

  async createReconciliation(data: Omit<BankReconciliation, 'id' | 'createdAt'>): Promise<BankReconciliation> {
    const recon: BankReconciliation = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    this.reconciliations.set(recon.id, recon);
    await this.logger.info('Reconciliation created', { id: recon.id });
    return recon;
  }

  async getReconciliationById(id: string): Promise<BankReconciliation | undefined> {
    return this.reconciliations.get(id);
  }

  async listReconciliations(companyId: string): Promise<BankReconciliation[]> {
    return Array.from(this.reconciliations.values()).filter(r => r.companyId === companyId);
  }

  async updateReconciliation(id: string, data: Partial<BankReconciliation>): Promise<BankReconciliation> {
    const existing = this.reconciliations.get(id);
    if (!existing) throw new Error(`Reconciliation ${id} not found`);
    const updated: BankReconciliation = { ...existing, ...data, id: existing.id };
    this.reconciliations.set(id, updated);
    await this.logger.info('Reconciliation updated', { id });
    return updated;
  }

  async deleteReconciliation(id: string): Promise<boolean> {
    const deleted = this.reconciliations.delete(id);
    if (deleted) await this.logger.info('Reconciliation deleted', { id });
    return deleted;
  }
}

export { Finance as default };
