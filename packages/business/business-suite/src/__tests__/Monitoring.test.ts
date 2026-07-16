import { describe, it, expect, beforeEach } from 'vitest';
import { Monitoring } from '../monitoring/Monitoring.js';

const CID = 'comp-1';

describe('Monitoring', () => {
  let mon: Monitoring;

  beforeEach(() => {
    mon = new Monitoring();
  });

  it('records operations and gets module health', async () => {
    await mon.recordOperation('crm', 100, true);
    await mon.recordOperation('crm', 150, true);
    const health = await mon.getModuleHealth('crm');
    expect(health.status).toBe('healthy');
    expect(health.score).toBe(100);
    expect(health.responseTime).toBe(125);
  });

  it('detects degraded module health', async () => {
    for (let i = 0; i < 20; i++) {
      await mon.recordOperation('api', 100, i >= 15);
    }
    const health = await mon.getModuleHealth('api');
    expect(health.errorRate).toBeGreaterThan(0);
    expect(['degraded', 'down']).toContain(health.status);
  });

  it('creates and acknowledges alerts', async () => {
    const alert = await mon.createAlert({ companyId: CID, type: 'warning', module: 'crm', message: 'High error rate' });
    expect(alert.id).toBeDefined();
    expect(alert.acknowledged).toBe(false);
    const ack = await mon.acknowledgeAlert(alert.id);
    expect(ack.acknowledged).toBe(true);
  });

  it('lists and filters alerts', async () => {
    await mon.createAlert({ companyId: CID, type: 'critical', module: 'api', message: 'Down' });
    await mon.createAlert({ companyId: CID, type: 'warning', module: 'crm', message: 'Slow' });
    const critical = await mon.listAlerts(CID, { type: 'critical' });
    expect(critical).toHaveLength(1);
    const unacked = await mon.listAlerts(CID, { acknowledged: false });
    expect(unacked).toHaveLength(2);
  });

  it('runs health check and auto-creates alerts for unhealthy modules', async () => {
    await mon.recordOperation('crm', 50, false);
    await mon.recordOperation('crm', 50, false);
    await mon.recordOperation('crm', 50, false);
    const health = await mon.checkHealth(CID, ['crm', 'analytics']);
    expect(health.overallScore).toBeLessThan(100);
    expect(health.alerts.length).toBeGreaterThan(0);
  });

  it('stores last health record', async () => {
    await mon.checkHealth(CID, ['crm']);
    const last = await mon.getLastHealth(CID);
    expect(last).toBeDefined();
    expect(last?.companyId).toBe(CID);
  });

  it('computes alert stats', async () => {
    await mon.createAlert({ companyId: CID, type: 'error', module: 'crm', message: 'E1' });
    await mon.createAlert({ companyId: CID, type: 'error', module: 'crm', message: 'E2' });
    await mon.createAlert({ companyId: CID, type: 'info', module: 'api', message: 'I1' });
    const stats = await mon.getStats(CID);
    expect(stats.totalAlerts).toBe(3);
    expect(stats.unacknowledged).toBe(3);
    expect(stats.byType['error']).toBe(2);
    expect(stats.byModule['crm']).toBe(2);
  });
});
