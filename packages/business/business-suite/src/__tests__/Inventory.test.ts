import { describe, it, expect, beforeEach } from 'vitest';
import { Inventory } from '../inventory/Inventory.js';

const CID = 'comp-1';

function warehouseData(overrides = {}) {
  return {
    companyId: CID, name: 'Main Warehouse', code: 'WH-01', isActive: true,
    ...overrides,
  };
}

function itemData(overrides = {}) {
  return {
    companyId: CID, productId: 'prod-1', warehouseId: 'wh-1',
    quantity: 100, reservedQuantity: 0, minimumStock: 10, averageCost: 25,
    ...overrides,
  };
}

describe('Inventory', () => {
  let inv: Inventory;

  beforeEach(() => {
    inv = new Inventory();
  });

  it('creates and retrieves a warehouse', async () => {
    const w = await inv.createWarehouse(warehouseData());
    expect(w.id).toBeDefined();
    expect((await inv.getWarehouseById(w.id))?.code).toBe('WH-01');
  });

  it('updates and deletes a warehouse', async () => {
    const w = await inv.createWarehouse(warehouseData());
    await inv.updateWarehouse(w.id, { name: 'Updated WH' });
    expect((await inv.getWarehouseById(w.id))?.name).toBe('Updated WH');
    expect(await inv.deleteWarehouse(w.id)).toBe(true);
  });

  it('creates an inventory item with computed available quantity', async () => {
    const item = await inv.createItem(itemData({ quantity: 100, reservedQuantity: 20 }));
    expect(item.availableQuantity).toBe(80);
  });

  it('reserves stock and reduces available quantity', async () => {
    const item = await inv.createItem(itemData({ quantity: 100, reservedQuantity: 0 }));
    const reserved = await inv.reserveStock(item.id, 30);
    expect(reserved.reservedQuantity).toBe(30);
    expect(reserved.availableQuantity).toBe(70);
  });

  it('throws when reserving more than available', async () => {
    const item = await inv.createItem(itemData({ quantity: 10, reservedQuantity: 0 }));
    await expect(inv.reserveStock(item.id, 15)).rejects.toThrow('Insufficient stock');
  });

  it('releases reservation', async () => {
    const item = await inv.createItem(itemData({ quantity: 100, reservedQuantity: 40 }));
    const released = await inv.releaseReservation(item.id, 20);
    expect(released.reservedQuantity).toBe(20);
    expect(released.availableQuantity).toBe(80);
  });

  it('throws when releasing more than reserved', async () => {
    const item = await inv.createItem(itemData({ quantity: 100, reservedQuantity: 5 }));
    await expect(inv.releaseReservation(item.id, 10)).rejects.toThrow('Cannot release');
  });

  it('adjusts stock and records movement', async () => {
    const wh = await inv.createWarehouse(warehouseData());
    const item = await inv.createItem(itemData({ warehouseId: wh.id, quantity: 100 }));
    const movement = await inv.adjustStock(item.id, 120, 'Physical count correction');
    expect(movement.type).toBe('adjustment');
    expect(movement.quantity).toBe(20);
    expect((await inv.getItemById(item.id))?.quantity).toBe(120);
  });

  it('detects low stock items', async () => {
    await inv.createItem(itemData({ quantity: 5, minimumStock: 10 }));
    await inv.createItem(itemData({ productId: 'prod-2', quantity: 100, minimumStock: 10 }));
    const low = await inv.getLowStockItems(CID);
    expect(low).toHaveLength(1);
    expect(low[0].productId).toBe('prod-1');
  });
});
