import type {
  Product,
  ProductCategory,
  ERPOrder,
  OrderItem,
  ProductType,
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

export interface ERPConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class ERP {
  private logger = new DefaultLogger('erp');
  private products = new Map<string, Product>();
  private categories = new Map<string, ProductCategory>();
  private orders = new Map<string, ERPOrder>();
  private orderCounter = 0;
  private config: ERPConfig;

  constructor(config?: ERPConfig) {
    this.config = config ?? {};
  }

  // ─── Product ──────────────────────────────────────────────────────────────

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date();
    const product: Product = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.products.set(product.id, product);
    await this.logger.info('Product created', { id: product.id, sku: product.sku });
    return product;
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(companyId: string, sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.companyId === companyId && p.sku === sku);
  }

  async listProducts(companyId: string, filters?: { type?: ProductType; categoryId?: string; isActive?: boolean }): Promise<Product[]> {
    let results = Array.from(this.products.values()).filter(p => p.companyId === companyId);
    if (filters?.type) results = results.filter(p => p.type === filters.type);
    if (filters?.categoryId) results = results.filter(p => p.categoryId === filters.categoryId);
    if (filters?.isActive !== undefined) results = results.filter(p => p.isActive === filters.isActive);
    return results;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error(`Product ${id} not found`);
    const updated: Product = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.products.set(id, updated);
    await this.logger.info('Product updated', { id });
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const deleted = this.products.delete(id);
    if (deleted) await this.logger.info('Product deleted', { id });
    return deleted;
  }

  // ─── Product Category ─────────────────────────────────────────────────────

  async createCategory(data: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProductCategory> {
    const now = new Date();
    const cat: ProductCategory = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.categories.set(cat.id, cat);
    await this.logger.info('Category created', { id: cat.id });
    return cat;
  }

  async getCategoryById(id: string): Promise<ProductCategory | undefined> {
    return this.categories.get(id);
  }

  async listCategories(companyId: string): Promise<ProductCategory[]> {
    return Array.from(this.categories.values()).filter(c => c.companyId === companyId);
  }

  async updateCategory(id: string, data: Partial<ProductCategory>): Promise<ProductCategory> {
    const existing = this.categories.get(id);
    if (!existing) throw new Error(`Category ${id} not found`);
    const updated: ProductCategory = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.categories.set(id, updated);
    await this.logger.info('Category updated', { id });
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const deleted = this.categories.delete(id);
    if (deleted) await this.logger.info('Category deleted', { id });
    return deleted;
  }

  // ─── Order ────────────────────────────────────────────────────────────────

  async createOrder(data: Omit<ERPOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<ERPOrder> {
    this.orderCounter++;
    const now = new Date();
    const orderNumber = `ORD-${now.getFullYear()}-${String(this.orderCounter).padStart(6, '0')}`;
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const tax = data.items.reduce((sum, item) => sum + (item.tax ?? 0), 0);
    const order: ERPOrder = {
      ...data,
      id: crypto.randomUUID(),
      orderNumber,
      subtotal,
      tax,
      total: subtotal + tax,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(order.id, order);
    await this.logger.info('Order created', { id: order.id, orderNumber });
    return order;
  }

  async getOrderById(id: string): Promise<ERPOrder | undefined> {
    return this.orders.get(id);
  }

  async listOrders(companyId: string, filters?: { type?: ERPOrder['type']; status?: ERPOrder['status'] }): Promise<ERPOrder[]> {
    let results = Array.from(this.orders.values()).filter(o => o.companyId === companyId);
    if (filters?.type) results = results.filter(o => o.type === filters.type);
    if (filters?.status) results = results.filter(o => o.status === filters.status);
    return results;
  }

  async updateOrder(id: string, data: Partial<ERPOrder>): Promise<ERPOrder> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error(`Order ${id} not found`);
    const updated: ERPOrder = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.orders.set(id, updated);
    await this.logger.info('Order updated', { id });
    return updated;
  }

  async deleteOrder(id: string): Promise<boolean> {
    const deleted = this.orders.delete(id);
    if (deleted) await this.logger.info('Order deleted', { id });
    return deleted;
  }
}

export { ERP as default };
