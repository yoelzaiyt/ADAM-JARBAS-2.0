import type {
  Integration,
  IntegrationEvent,
  IntegrationType,
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

export interface IntegrationsConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class Integrations {
  private logger = new DefaultLogger('integrations');
  private integrations = new Map<string, Integration>();
  private events = new Map<string, IntegrationEvent>();
  private config: IntegrationsConfig;

  constructor(config?: IntegrationsConfig) {
    this.config = config ?? {};
  }

  // ─── Integrations ─────────────────────────────────────────────────────────

  async createIntegration(data: Omit<Integration, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>): Promise<Integration> {
    const now = new Date();
    const integration: Integration = { ...data, id: crypto.randomUUID(), syncStatus: 'idle', createdAt: now, updatedAt: now };
    this.integrations.set(integration.id, integration);
    await this.logger.info('Integration created', { id: integration.id, type: integration.type });
    return integration;
  }

  async getIntegrationById(id: string): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async listIntegrations(companyId: string, filters?: { type?: IntegrationType; isActive?: boolean }): Promise<Integration[]> {
    let results = Array.from(this.integrations.values()).filter(i => i.companyId === companyId);
    if (filters?.type) results = results.filter(i => i.type === filters.type);
    if (filters?.isActive !== undefined) results = results.filter(i => i.isActive === filters.isActive);
    return results;
  }

  async updateIntegration(id: string, data: Partial<Integration>): Promise<Integration> {
    const existing = this.integrations.get(id);
    if (!existing) throw new Error(`Integration ${id} not found`);
    const updated: Integration = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.integrations.set(id, updated);
    await this.logger.info('Integration updated', { id });
    return updated;
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const deleted = this.integrations.delete(id);
    if (deleted) {
      for (const [eventId, event] of this.events) {
        if (event.integrationId === id) this.events.delete(eventId);
      }
      await this.logger.info('Integration deleted', { id });
    }
    return deleted;
  }

  async toggleIntegration(id: string, isActive: boolean): Promise<Integration> {
    const integration = this.integrations.get(id);
    if (!integration) throw new Error(`Integration ${id} not found`);
    integration.isActive = isActive;
    integration.updatedAt = new Date();
    this.integrations.set(id, integration);
    await this.logger.info('Integration toggled', { id, isActive });
    return integration;
  }

  async syncIntegration(id: string): Promise<Integration> {
    const integration = this.integrations.get(id);
    if (!integration) throw new Error(`Integration ${id} not found`);
    if (!integration.isActive) throw new Error(`Integration ${id} is not active`);
    integration.syncStatus = 'syncing';
    integration.updatedAt = new Date();
    this.integrations.set(id, integration);
    await this.logger.info('Integration sync started', { id });

    integration.syncStatus = 'success';
    integration.lastSyncAt = new Date();
    integration.updatedAt = new Date();
    this.integrations.set(id, integration);
    await this.logger.info('Integration sync completed', { id });
    return integration;
  }

  // ─── Events ───────────────────────────────────────────────────────────────

  async createEvent(data: Omit<IntegrationEvent, 'id' | 'createdAt' | 'status'>): Promise<IntegrationEvent> {
    const event: IntegrationEvent = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date(),
    };
    this.events.set(event.id, event);
    await this.logger.info('Integration event created', { id: event.id, integrationId: event.integrationId, event: event.event });
    return event;
  }

  async getEventById(id: string): Promise<IntegrationEvent | undefined> {
    return this.events.get(id);
  }

  async listEvents(integrationId: string, filters?: { direction?: IntegrationEvent['direction']; status?: IntegrationEvent['status'] }): Promise<IntegrationEvent[]> {
    let results = Array.from(this.events.values()).filter(e => e.integrationId === integrationId);
    if (filters?.direction) results = results.filter(e => e.direction === filters.direction);
    if (filters?.status) results = results.filter(e => e.status === filters.status);
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async processEvent(id: string): Promise<IntegrationEvent> {
    const event = this.events.get(id);
    if (!event) throw new Error(`IntegrationEvent ${id} not found`);
    if (event.status !== 'pending') throw new Error(`IntegrationEvent ${id} is ${event.status}`);
    event.status = 'processed';
    event.processedAt = new Date();
    this.events.set(id, event);
    await this.logger.info('Integration event processed', { id });
    return event;
  }

  async failEvent(id: string, error: string): Promise<IntegrationEvent> {
    const event = this.events.get(id);
    if (!event) throw new Error(`IntegrationEvent ${id} not found`);
    event.status = 'failed';
    event.error = error;
    event.processedAt = new Date();
    this.events.set(id, event);
    await this.logger.info('Integration event failed', { id, error });
    return event;
  }

  async getEventsByType(companyId: string, type: IntegrationType): Promise<IntegrationEvent[]> {
    const integrationIds = Array.from(this.integrations.values())
      .filter(i => i.companyId === companyId && i.type === type)
      .map(i => i.id);
    return Array.from(this.events.values())
      .filter(e => integrationIds.includes(e.integrationId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getStats(companyId: string): Promise<{ totalIntegrations: number; activeIntegrations: number; byType: Record<string, number>; totalEvents: number; failedEvents: number }> {
    const integrations = Array.from(this.integrations.values()).filter(i => i.companyId === companyId);
    const integrationIds = new Set(integrations.map(i => i.id));
    const events = Array.from(this.events.values()).filter(e => integrationIds.has(e.integrationId));
    const byType: Record<string, number> = {};
    for (const i of integrations) {
      byType[i.type] = (byType[i.type] ?? 0) + 1;
    }
    return {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.isActive).length,
      byType,
      totalEvents: events.length,
      failedEvents: events.filter(e => e.status === 'failed').length,
    };
  }
}

export { Integrations as default };
