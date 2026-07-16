import { describe, it, expect, beforeEach } from 'vitest';
import { Purchasing } from '../purchasing/Purchasing.js';

const CID = 'comp-1';

function supplierData(overrides = {}) {
  return {
    companyId: CID, name: 'Acme Suppliers', cnpj: '99999999000199',
    rating: 4, isActive: true, tags: [], customFields: {},
    ...overrides,
  };
}

function quoteData(overrides = {}) {
  return {
    companyId: CID, supplierId: 'sup-1',
    items: [
      { id: 'qi1', productId: 'p1', description: 'Part A', quantity: 10, unitPrice: 50, total: 500 },
      { id: 'qi2', productId: 'p2', description: 'Part B', quantity: 5, unitPrice: 100, total: 500 },
    ],
    currency: 'BRL', validUntil: new Date(), status: 'received' as const, requestedBy: 'user1',
    ...overrides,
  };
}

describe('Purchasing', () => {
  let pur: Purchasing;

  beforeEach(() => {
    pur = new Purchasing();
  });

  it('creates and retrieves a supplier', async () => {
    const s = await pur.createSupplier(supplierData());
    expect(s.id).toBeDefined();
    expect((await pur.getSupplierById(s.id))?.name).toBe('Acme Suppliers');
  });

  it('updates and deletes a supplier', async () => {
    const s = await pur.createSupplier(supplierData());
    await pur.updateSupplier(s.id, { rating: 5 });
    expect((await pur.getSupplierById(s.id))?.rating).toBe(5);
    expect(await pur.deleteSupplier(s.id)).toBe(true);
  });

  it('lists suppliers with filters', async () => {
    await pur.createSupplier(supplierData({ rating: 5 }));
    await pur.createSupplier(supplierData({ cnpj: '111', name: 'Low Rated', rating: 2 }));
    expect(await pur.listSuppliers(CID, { rating: 5 })).toHaveLength(1);
    expect(await pur.listSuppliers(CID, { isActive: true })).toHaveLength(2);
  });

  it('creates a quote with auto-calculated total', async () => {
    const q = await pur.createQuote(quoteData());
    expect(q.totalAmount).toBe(1000);
    expect(q.id).toBeDefined();
  });

  it('approves a received quote', async () => {
    const q = await pur.createQuote(quoteData({ status: 'received' }));
    const approved = await pur.approveQuote(q.id);
    expect(approved.status).toBe('approved');
  });

  it('rejects a received quote', async () => {
    const q = await pur.createQuote(quoteData({ status: 'received' }));
    const rejected = await pur.rejectQuote(q.id);
    expect(rejected.status).toBe('rejected');
  });

  it('throws when approving non-received quote', async () => {
    const q = await pur.createQuote(quoteData({ status: 'requested' }));
    await expect(pur.approveQuote(q.id)).rejects.toThrow('not in received status');
  });

  it('lists quotes with status filter', async () => {
    await pur.createQuote(quoteData({ status: 'received' }));
    await pur.createQuote(quoteData({ status: 'approved' }));
    expect(await pur.listQuotes(CID, { status: 'received' })).toHaveLength(1);
    expect(await pur.listQuotes(CID, { status: 'approved' })).toHaveLength(1);
  });
});
