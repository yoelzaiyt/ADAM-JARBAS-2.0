import { describe, it, expect, beforeEach } from 'vitest';
import { Logistics } from '../logistics/Logistics.js';

const CID = 'comp-1';
const addr = { street: 'Rua A', number: '100', neighborhood: 'Centro', city: 'SP', state: 'SP', zipCode: '01000-000', country: 'BR' };

function carrierData(overrides = {}) {
  return {
    companyId: CID, name: 'TransExpress', cnpj: '88888888000199',
    isActive: true, ...overrides,
  };
}

function shipmentData(overrides = {}) {
  return {
    companyId: CID, orderId: 'ord-1', carrierId: 'car-1',
    status: 'pending' as const, origin: addr, destination: addr,
    freightCost: 150, ...overrides,
  };
}

describe('Logistics', () => {
  let log: Logistics;

  beforeEach(() => {
    log = new Logistics();
  });

  it('creates and retrieves a carrier', async () => {
    const c = await log.createCarrier(carrierData());
    expect(c.id).toBeDefined();
    expect((await log.getCarrierById(c.id))?.name).toBe('TransExpress');
  });

  it('updates and deletes a carrier', async () => {
    const c = await log.createCarrier(carrierData());
    await log.updateCarrier(c.id, { contactEmail: 'ops@trans.com' });
    expect((await log.getCarrierById(c.id))?.contactEmail).toBe('ops@trans.com');
    expect(await log.deleteCarrier(c.id)).toBe(true);
  });

  it('creates and retrieves a shipment', async () => {
    const s = await log.createShipment(shipmentData());
    expect(s.id).toBeDefined();
    expect((await log.getShipmentById(s.id))?.freightCost).toBe(150);
  });

  it('updates shipment status through lifecycle', async () => {
    const s = await log.createShipment(shipmentData());
    const picked = await log.updateShipmentStatus(s.id, 'picked_up');
    expect(picked.status).toBe('picked_up');
    const transit = await log.updateShipmentStatus(s.id, 'in_transit');
    expect(transit.status).toBe('in_transit');
    const delivered = await log.updateShipmentStatus(s.id, 'delivered');
    expect(delivered.status).toBe('delivered');
    expect(delivered.actualDelivery).toBeInstanceOf(Date);
  });

  it('lists shipments filtered by status and carrier', async () => {
    await log.createShipment(shipmentData({ carrierId: 'car-1', status: 'in_transit' }));
    await log.createShipment(shipmentData({ carrierId: 'car-2', status: 'delivered' }));
    expect(await log.listShipments(CID, { carrierId: 'car-1' })).toHaveLength(1);
    expect(await log.listShipments(CID, { status: 'delivered' })).toHaveLength(1);
  });

  it('finds shipments by order id', async () => {
    await log.createShipment(shipmentData({ orderId: 'ord-42' }));
    await log.createShipment(shipmentData({ orderId: 'ord-42' }));
    await log.createShipment(shipmentData({ orderId: 'ord-99' }));
    const found = await log.getShipmentsByOrder(CID, 'ord-42');
    expect(found).toHaveLength(2);
  });

  it('computes shipment metrics', async () => {
    await log.createShipment(shipmentData({ status: 'in_transit', freightCost: 100 }));
    const delivered = await log.createShipment(shipmentData({ status: 'pending', freightCost: 200 }));
    await log.updateShipmentStatus(delivered.id, 'delivered');
    const metrics = await log.getShipmentMetrics(CID);
    expect(metrics.totalShipments).toBe(2);
    expect(metrics.inTransit).toBe(1);
    expect(metrics.delivered).toBe(1);
    expect(metrics.totalFreightCost).toBe(300);
  });

  it('updates and deletes a shipment', async () => {
    const s = await log.createShipment(shipmentData());
    const updated = await log.updateShipment(s.id, { freightCost: 250 });
    expect(updated.freightCost).toBe(250);
    expect(await log.deleteShipment(s.id)).toBe(true);
    expect(await log.getShipmentById(s.id)).toBeUndefined();
  });
});
