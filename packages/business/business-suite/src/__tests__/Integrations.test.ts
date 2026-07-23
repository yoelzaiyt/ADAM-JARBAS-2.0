import { describe, it, expect, beforeEach } from 'vitest';
import { Integrations } from '../integrations/Integrations.js';

const CID = 'comp-1';

function integrationData(overrides = {}) {
  return {
    companyId: CID,
    name: 'GitHub',
    type: 'github' as const,
    config: { token: 'abc', repo: 'org/repo' },
    isActive: true,
    ...overrides,
  };
}

describe('Integrations', () => {
  let integ: Integrations;

  beforeEach(() => {
    integ = new Integrations();
  });

  it('creates and retrieves an integration', async () => {
    const i = await integ.createIntegration(integrationData());
    expect(i.id).toBeDefined();
    expect(i.syncStatus).toBe('idle');
    const found = await integ.getIntegrationById(i.id);
    expect(found?.name).toBe('GitHub');
  });

  it('lists integrations with filters', async () => {
    await integ.createIntegration(integrationData({ name: 'G1', type: 'github' }));
    await integ.createIntegration(integrationData({ name: 'N8N', type: 'n8n', isActive: false }));
    const active = await integ.listIntegrations(CID, { isActive: true });
    expect(active).toHaveLength(1);
    const github = await integ.listIntegrations(CID, { type: 'github' });
    expect(github).toHaveLength(1);
  });

  it('syncs an integration', async () => {
    const i = await integ.createIntegration(integrationData());
    const synced = await integ.syncIntegration(i.id);
    expect(synced.syncStatus).toBe('success');
    expect(synced.lastSyncAt).toBeDefined();
  });

  it('throws sync on inactive integration', async () => {
    const i = await integ.createIntegration(integrationData({ isActive: false }));
    await expect(integ.syncIntegration(i.id)).rejects.toThrow('not active');
  });

  it('toggles and deletes integrations', async () => {
    const i = await integ.createIntegration(integrationData());
    const toggled = await integ.toggleIntegration(i.id, false);
    expect(toggled.isActive).toBe(false);
    expect(await integ.deleteIntegration(i.id)).toBe(true);
  });

  it('creates, processes, and fails events', async () => {
    const i = await integ.createIntegration(integrationData());
    const ev = await integ.createEvent({
      integrationId: i.id,
      direction: 'inbound',
      event: 'push',
      payload: { ref: 'main' },
    });
    expect(ev.status).toBe('pending');
    const processed = await integ.processEvent(ev.id);
    expect(processed.status).toBe('processed');
    const ev2 = await integ.createEvent({
      integrationId: i.id,
      direction: 'outbound',
      event: 'deploy',
      payload: {},
    });
    const failed = await integ.failEvent(ev2.id, 'Timeout');
    expect(failed.status).toBe('failed');
    expect(failed.error).toBe('Timeout');
  });

  it('computes stats', async () => {
    const i = await integ.createIntegration(integrationData({ type: 'github' }));
    await integ.createIntegration(integrationData({ name: 'N8N', type: 'n8n' }));
    const ev = await integ.createEvent({ integrationId: i.id, direction: 'inbound', event: 'push', payload: {} });
    await integ.failEvent(ev.id, 'err');
    const stats = await integ.getStats(CID);
    expect(stats.totalIntegrations).toBe(2);
    expect(stats.activeIntegrations).toBe(2);
    expect(stats.totalEvents).toBe(1);
    expect(stats.failedEvents).toBe(1);
  });
});
