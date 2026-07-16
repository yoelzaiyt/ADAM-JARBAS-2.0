import { describe, it, expect, beforeEach } from 'vitest';
import { ERP } from '../erp/ERP.js';

const CID = 'comp-1';

function productData(overrides = {}) {
  return {
    companyId: CID,
    name: 'Widget',
    sku: 'WGT-001',
    type: 'product' as const,
    unitPrice: 100,
    currency: 'BRL',
    isActive: true,
    customFields: {},
    ...overrides,
  };
}

function orderItems() {
  return [
    { id: 'i1', productId: 'p1', description: 'Item A', quantity: 2, unitPrice: 100, total: 200, tax: 20 },
    { id: 'i2', productId: 'p2', description: 'Item B', quantity: 1, unitPrice: 50, total: 50, tax: 5 },
  ];
}

describe('ERP', () => {
  let erp: ERP;

  beforeEach(() => {
    erp = new ERP();
  });

  it('creates and retrieves a product', async () => {
    const p = await erp.createProduct(productData());
    expect(p.id).toBeDefined();
    expect((await erp.getProductById(p.id))?.sku).toBe('WGT-001');
  });

  it('finds product by SKU', async () => {
    await erp.createProduct(productData({ sku: 'SKU-999' }));
    const found = await erp.getProductBySku(CID, 'SKU-999');
    expect(found).toBeDefined();
    expect(found?.sku).toBe('SKU-999');
  });

  it('updates and deletes a product', async () => {
    const p = await erp.createProduct(productData());
    const updated = await erp.updateProduct(p.id, { unitPrice: 150 });
    expect(updated.unitPrice).toBe(150);
    expect(await erp.deleteProduct(p.id)).toBe(true);
  });

  it('lists products with type and isActive filters', async () => {
    await erp.createProduct(productData({ type: 'product' }));
    await erp.createProduct(productData({ sku: 'SVC-1', type: 'service', isActive: false }));
    expect(await erp.listProducts(CID, { type: 'service' })).toHaveLength(1);
    expect(await erp.listProducts(CID, { isActive: true })).toHaveLength(1);
  });

  it('CRUD for categories', async () => {
    const cat = await erp.createCategory({ companyId: CID, name: 'Electronics' });
    expect(await erp.listCategories(CID)).toHaveLength(1);
    await erp.updateCategory(cat.id, { name: 'Electronics Pro' });
    expect((await erp.getCategoryById(cat.id))?.name).toBe('Electronics Pro');
    await erp.deleteCategory(cat.id);
    expect(await erp.getCategoryById(cat.id)).toBeUndefined();
  });

  it('creates order with auto-numbering and correct totals', async () => {
    const o = await erp.createOrder({
      companyId: CID, type: 'sale', status: 'draft', contactId: 'c1',
      items: orderItems(), currency: 'BRL', createdBy: 'user1',
    });
    expect(o.orderNumber).toMatch(/^ORD-\d{4}-\d{6}$/);
    expect(o.subtotal).toBe(250);
    expect(o.tax).toBe(25);
    expect(o.total).toBe(275);
  });

  it('increments order numbers sequentially', async () => {
    const o1 = await erp.createOrder({ companyId: CID, type: 'sale', status: 'draft', contactId: 'c1', items: orderItems(), currency: 'BRL', createdBy: 'u' });
    const o2 = await erp.createOrder({ companyId: CID, type: 'sale', status: 'draft', contactId: 'c1', items: orderItems(), currency: 'BRL', createdBy: 'u' });
    expect(o1.orderNumber).not.toBe(o2.orderNumber);
    const num1 = parseInt(o1.orderNumber.split('-')[2]);
    const num2 = parseInt(o2.orderNumber.split('-')[2]);
    expect(num2).toBe(num1 + 1);
  });

  it('updates order status', async () => {
    const o = await erp.createOrder({ companyId: CID, type: 'sale', status: 'draft', contactId: 'c1', items: orderItems(), currency: 'BRL', createdBy: 'u' });
    const updated = await erp.updateOrder(o.id, { status: 'processing' });
    expect(updated.status).toBe('processing');
  });
});
