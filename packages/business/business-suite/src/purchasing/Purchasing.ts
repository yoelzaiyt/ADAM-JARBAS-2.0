import type {
  Supplier,
  PurchaseQuote,
  PurchaseQuoteItem,
  Address,
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

export interface PurchasingConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class Purchasing {
  private logger = new DefaultLogger('purchasing');
  private suppliers = new Map<string, Supplier>();
  private quotes = new Map<string, PurchaseQuote>();
  private config: PurchasingConfig;

  constructor(config?: PurchasingConfig) {
    this.config = config ?? {};
  }

  // ─── Supplier ─────────────────────────────────────────────────────────────

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const now = new Date();
    const supplier: Supplier = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.suppliers.set(supplier.id, supplier);
    await this.logger.info('Supplier created', { id: supplier.id, name: supplier.name });
    return supplier;
  }

  async getSupplierById(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async listSuppliers(companyId: string, filters?: { isActive?: boolean; rating?: number }): Promise<Supplier[]> {
    let results = Array.from(this.suppliers.values()).filter(s => s.companyId === companyId);
    if (filters?.isActive !== undefined) results = results.filter(s => s.isActive === filters.isActive);
    if (filters?.rating !== undefined) results = results.filter(s => s.rating === filters.rating);
    return results;
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const existing = this.suppliers.get(id);
    if (!existing) throw new Error(`Supplier ${id} not found`);
    const updated: Supplier = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.suppliers.set(id, updated);
    await this.logger.info('Supplier updated', { id });
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const deleted = this.suppliers.delete(id);
    if (deleted) await this.logger.info('Supplier deleted', { id });
    return deleted;
  }

  // ─── Purchase Quote ───────────────────────────────────────────────────────

  async createQuote(data: Omit<PurchaseQuote, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseQuote> {
    const now = new Date();
    const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0);
    const quote: PurchaseQuote = { ...data, id: crypto.randomUUID(), totalAmount, createdAt: now, updatedAt: now };
    this.quotes.set(quote.id, quote);
    await this.logger.info('Purchase quote created', { id: quote.id, supplierId: quote.supplierId });
    return quote;
  }

  async getQuoteById(id: string): Promise<PurchaseQuote | undefined> {
    return this.quotes.get(id);
  }

  async listQuotes(companyId: string, filters?: { supplierId?: string; status?: PurchaseQuote['status'] }): Promise<PurchaseQuote[]> {
    let results = Array.from(this.quotes.values()).filter(q => q.companyId === companyId);
    if (filters?.supplierId) results = results.filter(q => q.supplierId === filters.supplierId);
    if (filters?.status) results = results.filter(q => q.status === filters.status);
    return results;
  }

  async updateQuote(id: string, data: Partial<PurchaseQuote>): Promise<PurchaseQuote> {
    const existing = this.quotes.get(id);
    if (!existing) throw new Error(`PurchaseQuote ${id} not found`);
    const updated: PurchaseQuote = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.quotes.set(id, updated);
    await this.logger.info('Purchase quote updated', { id });
    return updated;
  }

  async deleteQuote(id: string): Promise<boolean> {
    const deleted = this.quotes.delete(id);
    if (deleted) await this.logger.info('Purchase quote deleted', { id });
    return deleted;
  }

  async approveQuote(id: string): Promise<PurchaseQuote> {
    const quote = this.quotes.get(id);
    if (!quote) throw new Error(`PurchaseQuote ${id} not found`);
    if (quote.status !== 'received') throw new Error(`PurchaseQuote ${id} is not in received status`);
    quote.status = 'approved';
    quote.updatedAt = new Date();
    this.quotes.set(id, quote);
    await this.logger.info('Purchase quote approved', { id });
    return quote;
  }

  async rejectQuote(id: string): Promise<PurchaseQuote> {
    const quote = this.quotes.get(id);
    if (!quote) throw new Error(`PurchaseQuote ${id} not found`);
    if (quote.status !== 'received') throw new Error(`PurchaseQuote ${id} is not in received status`);
    quote.status = 'rejected';
    quote.updatedAt = new Date();
    this.quotes.set(id, quote);
    await this.logger.info('Purchase quote rejected', { id });
    return quote;
  }
}

export { Purchasing as default };
