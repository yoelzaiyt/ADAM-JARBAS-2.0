import type {
  BankAccount,
  Investment,
  Loan,
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

export interface TreasuryConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface TreasurySummary {
  totalBankBalance: number;
  totalInvestments: number;
  totalLoansOutstanding: number;
  netPosition: number;
  investmentsByType: { type: string; count: number; totalValue: number }[];
}

export class Treasury {
  private logger = new DefaultLogger('treasury');
  private bankAccounts = new Map<string, BankAccount>();
  private investments = new Map<string, Investment>();
  private loans = new Map<string, Loan>();
  private config: TreasuryConfig;

  constructor(config?: TreasuryConfig) {
    this.config = config ?? {};
  }

  // ─── Bank Account ─────────────────────────────────────────────────────────

  async createBankAccount(data: Omit<BankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
    const now = new Date();
    const acct: BankAccount = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.bankAccounts.set(acct.id, acct);
    await this.logger.info('Bank account created', { id: acct.id, name: acct.name });
    return acct;
  }

  async getBankAccountById(id: string): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }

  async listBankAccounts(companyId: string): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values()).filter(a => a.companyId === companyId);
  }

  async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const existing = this.bankAccounts.get(id);
    if (!existing) throw new Error(`BankAccount ${id} not found`);
    const updated: BankAccount = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.bankAccounts.set(id, updated);
    await this.logger.info('Bank account updated', { id });
    return updated;
  }

  async deleteBankAccount(id: string): Promise<boolean> {
    const deleted = this.bankAccounts.delete(id);
    if (deleted) await this.logger.info('Bank account deleted', { id });
    return deleted;
  }

  // ─── Investment ───────────────────────────────────────────────────────────

  async createInvestment(data: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Investment> {
    const now = new Date();
    const inv: Investment = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.investments.set(inv.id, inv);
    await this.logger.info('Investment created', { id: inv.id, name: inv.name });
    return inv;
  }

  async getInvestmentById(id: string): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async listInvestments(companyId: string, filters?: { type?: Investment['type']; status?: Investment['status'] }): Promise<Investment[]> {
    let results = Array.from(this.investments.values()).filter(i => i.companyId === companyId);
    if (filters?.type) results = results.filter(i => i.type === filters.type);
    if (filters?.status) results = results.filter(i => i.status === filters.status);
    return results;
  }

  async updateInvestment(id: string, data: Partial<Investment>): Promise<Investment> {
    const existing = this.investments.get(id);
    if (!existing) throw new Error(`Investment ${id} not found`);
    const updated: Investment = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.investments.set(id, updated);
    await this.logger.info('Investment updated', { id });
    return updated;
  }

  async deleteInvestment(id: string): Promise<boolean> {
    const deleted = this.investments.delete(id);
    if (deleted) await this.logger.info('Investment deleted', { id });
    return deleted;
  }

  // ─── Loan ─────────────────────────────────────────────────────────────────

  async createLoan(data: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Loan> {
    const now = new Date();
    const loan: Loan = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.loans.set(loan.id, loan);
    await this.logger.info('Loan created', { id: loan.id, lender: loan.lender });
    return loan;
  }

  async getLoanById(id: string): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async listLoans(companyId: string, filters?: { status?: Loan['status'] }): Promise<Loan[]> {
    let results = Array.from(this.loans.values()).filter(l => l.companyId === companyId);
    if (filters?.status) results = results.filter(l => l.status === filters.status);
    return results;
  }

  async updateLoan(id: string, data: Partial<Loan>): Promise<Loan> {
    const existing = this.loans.get(id);
    if (!existing) throw new Error(`Loan ${id} not found`);
    const updated: Loan = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.loans.set(id, updated);
    await this.logger.info('Loan updated', { id });
    return updated;
  }

  async deleteLoan(id: string): Promise<boolean> {
    const deleted = this.loans.delete(id);
    if (deleted) await this.logger.info('Loan deleted', { id });
    return deleted;
  }

  async payInstallment(loanId: string): Promise<Loan> {
    const loan = this.loans.get(loanId);
    if (!loan) throw new Error(`Loan ${loanId} not found`);
    if (loan.status !== 'active') throw new Error(`Loan ${loanId} is not active`);
    loan.paidInstallments += 1;
    loan.outstandingBalance -= loan.installmentAmount;
    if (loan.outstandingBalance <= 0) {
      loan.outstandingBalance = 0;
      loan.status = 'paid';
    }
    loan.updatedAt = new Date();
    this.loans.set(loanId, loan);
    await this.logger.info('Loan installment paid', { loanId, paidInstallments: loan.paidInstallments });
    return loan;
  }

  // ─── Treasury Summary ─────────────────────────────────────────────────────

  async getTreasurySummary(companyId: string): Promise<TreasurySummary> {
    const bankAccts = Array.from(this.bankAccounts.values()).filter(a => a.companyId === companyId);
    const invs = Array.from(this.investments.values()).filter(i => i.companyId === companyId && i.status === 'active');
    const activeLoans = Array.from(this.loans.values()).filter(l => l.companyId === companyId && l.status === 'active');

    const totalBankBalance = bankAccts.reduce((s, a) => s + a.balance, 0);
    const totalInvestments = invs.reduce((s, i) => s + i.currentValue, 0);
    const totalLoansOutstanding = activeLoans.reduce((s, l) => s + l.outstandingBalance, 0);

    const typeMap = new Map<string, { count: number; totalValue: number }>();
    for (const i of invs) {
      const entry = typeMap.get(i.type) ?? { count: 0, totalValue: 0 };
      entry.count += 1;
      entry.totalValue += i.currentValue;
      typeMap.set(i.type, entry);
    }

    return {
      totalBankBalance,
      totalInvestments,
      totalLoansOutstanding,
      netPosition: totalBankBalance + totalInvestments - totalLoansOutstanding,
      investmentsByType: Array.from(typeMap.entries()).map(([type, v]) => ({ type, ...v })),
    };
  }
}

export { Treasury as default };
