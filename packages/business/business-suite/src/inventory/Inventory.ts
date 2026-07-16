import type {
  InventoryItem,
  Warehouse,
  StockMovement,
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

export interface InventoryConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface StockSummary {
  warehouseId: string;
  totalProducts: number;
  totalQuantity: number;
  totalReserved: number;
  totalAvailable: number;
  lowStockItems: number;
}

export interface StockAdjustment {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  reason: string;
}

export class Inventory {
  private logger = new DefaultLogger('inventory');
  private items = new Map<string, InventoryItem>();
  private warehouses = new Map<string, Warehouse>();
  private movements = new Map<string, StockMovement>();
  private config: InventoryConfig;

  constructor(config?: InventoryConfig) {
    this.config = config ?? {};
  }

  // ─── InventoryItem ─────────────────────────────────────────────────────────

  async createItem(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'availableQuantity'>): Promise<InventoryItem> {
    const now = new Date();
    const item: InventoryItem = {
      ...data,
      id: crypto.randomUUID(),
      availableQuantity: data.quantity - data.reservedQuantity,
      createdAt: now,
      updatedAt: now,
    };
    this.items.set(item.id, item);
    await this.logger.info('Inventory item created', { id: item.id, productId: item.productId });
    return item;
  }

  async getItemById(id: string): Promise<InventoryItem | undefined> {
    return this.items.get(id);
  }

  async listItems(companyId: string, filters?: { warehouseId?: string; productId?: string; lotNumber?: string }): Promise<InventoryItem[]> {
    let results = Array.from(this.items.values()).filter(i => i.companyId === companyId);
    if (filters?.warehouseId) results = results.filter(i => i.warehouseId === filters.warehouseId);
    if (filters?.productId) results = results.filter(i => i.productId === filters.productId);
    if (filters?.lotNumber) results = results.filter(i => i.lotNumber === filters.lotNumber);
    return results;
  }

  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const existing = this.items.get(id);
    if (!existing) throw new Error(`InventoryItem ${id} not found`);
    const merged = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    merged.availableQuantity = merged.quantity - merged.reservedQuantity;
    this.items.set(id, merged);
    await this.logger.info('Inventory item updated', { id });
    return merged;
  }

  async deleteItem(id: string): Promise<boolean> {
    const deleted = this.items.delete(id);
    if (deleted) await this.logger.info('Inventory item deleted', { id });
    return deleted;
  }

  async reserveStock(id: string, quantity: number): Promise<InventoryItem> {
    const item = this.items.get(id);
    if (!item) throw new Error(`InventoryItem ${id} not found`);
    if (item.availableQuantity < quantity) throw new Error(`Insufficient stock: available ${item.availableQuantity}, requested ${quantity}`);
    item.reservedQuantity += quantity;
    item.availableQuantity = item.quantity - item.reservedQuantity;
    item.updatedAt = new Date();
    this.items.set(id, item);
    await this.logger.info('Stock reserved', { id, quantity, reserved: item.reservedQuantity });
    return item;
  }

  async releaseReservation(id: string, quantity: number): Promise<InventoryItem> {
    const item = this.items.get(id);
    if (!item) throw new Error(`InventoryItem ${id} not found`);
    if (item.reservedQuantity < quantity) throw new Error(`Cannot release ${quantity}: only ${item.reservedQuantity} reserved`);
    item.reservedQuantity -= quantity;
    item.availableQuantity = item.quantity - item.reservedQuantity;
    item.updatedAt = new Date();
    this.items.set(id, item);
    await this.logger.info('Reservation released', { id, quantity, reserved: item.reservedQuantity });
    return item;
  }

  async adjustStock(id: string, newQuantity: number, reason: string): Promise<StockMovement> {
    const item = this.items.get(id);
    if (!item) throw new Error(`InventoryItem ${id} not found`);
    const diff = newQuantity - item.quantity;
    item.quantity = newQuantity;
    item.availableQuantity = item.quantity - item.reservedQuantity;
    item.updatedAt = new Date();
    this.items.set(id, item);

    const movement = await this.createMovement({
      companyId: item.companyId,
      productId: item.productId,
      warehouseId: item.warehouseId,
      type: 'adjustment',
      quantity: Math.abs(diff),
      reference: reason,
      createdBy: 'system',
    });
    return movement;
  }

  async getLowStockItems(companyId: string): Promise<InventoryItem[]> {
    return Array.from(this.items.values()).filter(
      i => i.companyId === companyId && i.availableQuantity <= i.minimumStock
    );
  }

  async getExpiringItems(companyId: string, withinDays: number = 30): Promise<InventoryItem[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return Array.from(this.items.values()).filter(
      i => i.companyId === companyId && i.expiryDate !== undefined && i.expiryDate <= cutoff
    );
  }

  // ─── Warehouse ─────────────────────────────────────────────────────────────

  async createWarehouse(data: Omit<Warehouse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warehouse> {
    const now = new Date();
    const warehouse: Warehouse = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.warehouses.set(warehouse.id, warehouse);
    await this.logger.info('Warehouse created', { id: warehouse.id, name: warehouse.name });
    return warehouse;
  }

  async getWarehouseById(id: string): Promise<Warehouse | undefined> {
    return this.warehouses.get(id);
  }

  async listWarehouses(companyId: string): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values()).filter(w => w.companyId === companyId);
  }

  async updateWarehouse(id: string, data: Partial<Warehouse>): Promise<Warehouse> {
    const existing = this.warehouses.get(id);
    if (!existing) throw new Error(`Warehouse ${id} not found`);
    const updated: Warehouse = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.warehouses.set(id, updated);
    await this.logger.info('Warehouse updated', { id });
    return updated;
  }

  async deleteWarehouse(id: string): Promise<boolean> {
    const deleted = this.warehouses.delete(id);
    if (deleted) await this.logger.info('Warehouse deleted', { id });
    return deleted;
  }

  async getWarehouseSummary(warehouseId: string): Promise<StockSummary> {
    const items = Array.from(this.items.values()).filter(i => i.warehouseId === warehouseId);
    return {
      warehouseId,
      totalProducts: items.length,
      totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
      totalReserved: items.reduce((s, i) => s + i.reservedQuantity, 0),
      totalAvailable: items.reduce((s, i) => s + i.availableQuantity, 0),
      lowStockItems: items.filter(i => i.availableQuantity <= i.minimumStock).length,
    };
  }

  // ─── StockMovement ─────────────────────────────────────────────────────────

  async createMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> {
    const movement: StockMovement = { ...data, id: crypto.randomUUID(), createdAt: new Date() };
    this.movements.set(movement.id, movement);
    await this.logger.info('Stock movement recorded', { id: movement.id, type: movement.type, quantity: movement.quantity });
    return movement;
  }

  async getMovementById(id: string): Promise<StockMovement | undefined> {
    return this.movements.get(id);
  }

  async listMovements(companyId: string, filters?: { productId?: string; warehouseId?: string; type?: StockMovement['type'] }): Promise<StockMovement[]> {
    let results = Array.from(this.movements.values()).filter(m => m.companyId === companyId);
    if (filters?.productId) results = results.filter(m => m.productId === filters.productId);
    if (filters?.warehouseId) results = results.filter(m => m.warehouseId === filters.warehouseId);
    if (filters?.type) results = results.filter(m => m.type === filters.type);
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteMovement(id: string): Promise<boolean> {
    const deleted = this.movements.delete(id);
    if (deleted) await this.logger.info('Stock movement deleted', { id });
    return deleted;
  }
}

export { Inventory as default };
