import type {
  Carrier,
  Shipment,
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

export interface LogisticsConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface ShipmentMetrics {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  returned: number;
  totalFreightCost: number;
  averageDeliveryDays: number;
}

export class Logistics {
  private logger = new DefaultLogger('logistics');
  private carriers = new Map<string, Carrier>();
  private shipments = new Map<string, Shipment>();
  private config: LogisticsConfig;

  constructor(config?: LogisticsConfig) {
    this.config = config ?? {};
  }

  // ─── Carrier ───────────────────────────────────────────────────────────────

  async createCarrier(data: Omit<Carrier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Carrier> {
    const now = new Date();
    const carrier: Carrier = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.carriers.set(carrier.id, carrier);
    await this.logger.info('Carrier created', { id: carrier.id, name: carrier.name });
    return carrier;
  }

  async getCarrierById(id: string): Promise<Carrier | undefined> {
    return this.carriers.get(id);
  }

  async listCarriers(companyId: string): Promise<Carrier[]> {
    return Array.from(this.carriers.values()).filter(c => c.companyId === companyId);
  }

  async updateCarrier(id: string, data: Partial<Carrier>): Promise<Carrier> {
    const existing = this.carriers.get(id);
    if (!existing) throw new Error(`Carrier ${id} not found`);
    const updated: Carrier = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.carriers.set(id, updated);
    await this.logger.info('Carrier updated', { id });
    return updated;
  }

  async deleteCarrier(id: string): Promise<boolean> {
    const deleted = this.carriers.delete(id);
    if (deleted) await this.logger.info('Carrier deleted', { id });
    return deleted;
  }

  // ─── Shipment ──────────────────────────────────────────────────────────────

  async createShipment(data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> {
    const now = new Date();
    const shipment: Shipment = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.shipments.set(shipment.id, shipment);
    await this.logger.info('Shipment created', { id: shipment.id, orderId: shipment.orderId });
    return shipment;
  }

  async getShipmentById(id: string): Promise<Shipment | undefined> {
    return this.shipments.get(id);
  }

  async listShipments(companyId: string, filters?: { carrierId?: string; status?: Shipment['status']; orderId?: string }): Promise<Shipment[]> {
    let results = Array.from(this.shipments.values()).filter(s => s.companyId === companyId);
    if (filters?.carrierId) results = results.filter(s => s.carrierId === filters.carrierId);
    if (filters?.status) results = results.filter(s => s.status === filters.status);
    if (filters?.orderId) results = results.filter(s => s.orderId === filters.orderId);
    return results;
  }

  async updateShipment(id: string, data: Partial<Shipment>): Promise<Shipment> {
    const existing = this.shipments.get(id);
    if (!existing) throw new Error(`Shipment ${id} not found`);
    const updated: Shipment = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.shipments.set(id, updated);
    await this.logger.info('Shipment updated', { id });
    return updated;
  }

  async deleteShipment(id: string): Promise<boolean> {
    const deleted = this.shipments.delete(id);
    if (deleted) await this.logger.info('Shipment deleted', { id });
    return deleted;
  }

  async updateShipmentStatus(id: string, status: Shipment['status']): Promise<Shipment> {
    const shipment = this.shipments.get(id);
    if (!shipment) throw new Error(`Shipment ${id} not found`);
    shipment.status = status;
    if (status === 'delivered') shipment.actualDelivery = new Date();
    shipment.updatedAt = new Date();
    this.shipments.set(id, shipment);
    await this.logger.info('Shipment status updated', { id, status });
    return shipment;
  }

  async getShipmentsByOrder(companyId: string, orderId: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(
      s => s.companyId === companyId && s.orderId === orderId
    );
  }

  async getShipmentsByCarrier(companyId: string, carrierId: string): Promise<Shipment[]> {
    return Array.from(this.shipments.values()).filter(
      s => s.companyId === companyId && s.carrierId === carrierId
    );
  }

  async getShipmentMetrics(companyId: string): Promise<ShipmentMetrics> {
    const all = Array.from(this.shipments.values()).filter(s => s.companyId === companyId);
    const delivered = all.filter(s => s.status === 'delivered' && s.actualDelivery);
    const totalDeliveryDays = delivered.reduce((sum, s) => {
      if (s.actualDelivery) {
        return sum + (s.actualDelivery.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      }
      return sum;
    }, 0);
    return {
      totalShipments: all.length,
      inTransit: all.filter(s => s.status === 'in_transit' || s.status === 'picked_up').length,
      delivered: delivered.length,
      returned: all.filter(s => s.status === 'returned').length,
      totalFreightCost: all.reduce((s, sh) => s + sh.freightCost, 0),
      averageDeliveryDays: delivered.length > 0 ? totalDeliveryDays / delivered.length : 0,
    };
  }
}

export { Logistics as default };
