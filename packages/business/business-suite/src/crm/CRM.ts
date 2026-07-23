import type {
  Lead,
  Contact,
  Opportunity,
  Pipeline,
  PipelineStage,
  FollowUp,
  LeadSource,
  LeadStatus,
  OpportunityStage,
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

export interface CRMConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface PipelineMetrics {
  pipelineId: string;
  totalOpportunities: number;
  totalValue: number;
  weightedValue: number;
  stageBreakdown: { stage: string; count: number; value: number }[];
}

export interface FunnelMetrics {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageScore: number;
  bySource: { source: LeadSource; count: number }[];
  byStatus: { status: LeadStatus; count: number }[];
}

export class CRM {
  private logger = new DefaultLogger('crm');
  private leads = new Map<string, Lead>();
  private contacts = new Map<string, Contact>();
  private opportunities = new Map<string, Opportunity>();
  private pipelines = new Map<string, Pipeline>();
  private followUps = new Map<string, FollowUp>();
  private config: CRMConfig;

  constructor(config?: CRMConfig) {
    this.config = config ?? {};
  }

  // ─── Lead ─────────────────────────────────────────────────────────────────

  async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const now = new Date();
    const lead: Lead = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.leads.set(lead.id, lead);
    await this.logger.info('Lead created', { id: lead.id });
    return lead;
  }

  async getLeadById(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async listLeads(companyId: string, filters?: { status?: LeadStatus; source?: LeadSource }): Promise<Lead[]> {
    let results = Array.from(this.leads.values()).filter(l => l.companyId === companyId);
    if (filters?.status) results = results.filter(l => l.status === filters.status);
    if (filters?.source) results = results.filter(l => l.source === filters.source);
    return results;
  }

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const existing = this.leads.get(id);
    if (!existing) throw new Error(`Lead ${id} not found`);
    const updated: Lead = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.leads.set(id, updated);
    await this.logger.info('Lead updated', { id });
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    const deleted = this.leads.delete(id);
    if (deleted) await this.logger.info('Lead deleted', { id });
    return deleted;
  }

  async scoreLead(id: string): Promise<Lead> {
    const lead = this.leads.get(id);
    if (!lead) throw new Error(`Lead ${id} not found`);
    let score = 0;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.company) score += 15;
    if (lead.source === 'referral') score += 20;
    else if (lead.source === 'website') score += 15;
    else if (lead.source === 'partner') score += 18;
    if (lead.status === 'qualified') score += 25;
    else if (lead.status === 'proposal') score += 30;
    score = Math.min(100, score);
    lead.score = score;
    lead.updatedAt = new Date();
    this.leads.set(id, lead);
    await this.logger.info('Lead scored', { id, score });
    return lead;
  }

  // ─── Contact ──────────────────────────────────────────────────────────────

  async createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const now = new Date();
    const contact: Contact = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.contacts.set(contact.id, contact);
    await this.logger.info('Contact created', { id: contact.id });
    return contact;
  }

  async getContactById(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async listContacts(companyId: string): Promise<Contact[]> {
    return Array.from(this.contacts.values()).filter(c => c.companyId === companyId);
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const existing = this.contacts.get(id);
    if (!existing) throw new Error(`Contact ${id} not found`);
    const updated: Contact = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.contacts.set(id, updated);
    await this.logger.info('Contact updated', { id });
    return updated;
  }

  async deleteContact(id: string): Promise<boolean> {
    const deleted = this.contacts.delete(id);
    if (deleted) await this.logger.info('Contact deleted', { id });
    return deleted;
  }

  // ─── Opportunity ──────────────────────────────────────────────────────────

  async createOpportunity(data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Opportunity> {
    const now = new Date();
    const opp: Opportunity = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.opportunities.set(opp.id, opp);
    await this.logger.info('Opportunity created', { id: opp.id });
    return opp;
  }

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async listOpportunities(companyId: string, filters?: { stage?: OpportunityStage }): Promise<Opportunity[]> {
    let results = Array.from(this.opportunities.values()).filter(o => o.companyId === companyId);
    if (filters?.stage) results = results.filter(o => o.stage === filters.stage);
    return results;
  }

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const existing = this.opportunities.get(id);
    if (!existing) throw new Error(`Opportunity ${id} not found`);
    const updated: Opportunity = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.opportunities.set(id, updated);
    await this.logger.info('Opportunity updated', { id });
    return updated;
  }

  async deleteOpportunity(id: string): Promise<boolean> {
    const deleted = this.opportunities.delete(id);
    if (deleted) await this.logger.info('Opportunity deleted', { id });
    return deleted;
  }

  // ─── Pipeline ─────────────────────────────────────────────────────────────

  async createPipeline(data: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pipeline> {
    const now = new Date();
    const pipeline: Pipeline = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.pipelines.set(pipeline.id, pipeline);
    await this.logger.info('Pipeline created', { id: pipeline.id });
    return pipeline;
  }

  async getPipelineById(id: string): Promise<Pipeline | undefined> {
    return this.pipelines.get(id);
  }

  async listPipelines(companyId: string): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values()).filter(p => p.companyId === companyId);
  }

  async updatePipeline(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    const existing = this.pipelines.get(id);
    if (!existing) throw new Error(`Pipeline ${id} not found`);
    const updated: Pipeline = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.pipelines.set(id, updated);
    await this.logger.info('Pipeline updated', { id });
    return updated;
  }

  async deletePipeline(id: string): Promise<boolean> {
    const deleted = this.pipelines.delete(id);
    if (deleted) await this.logger.info('Pipeline deleted', { id });
    return deleted;
  }

  async getPipelineMetrics(pipelineId: string, companyId: string): Promise<PipelineMetrics> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) throw new Error(`Pipeline ${pipelineId} not found`);
    const opps = Array.from(this.opportunities.values()).filter(
      o => o.companyId === companyId
    );
    const stageBreakdown = pipeline.stages.map(stage => {
      const stageOpps = opps.filter(o => o.stage === stage.name.toLowerCase().replace(/\s+/g, '_') as OpportunityStage);
      return {
        stage: stage.name,
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + o.value, 0),
      };
    });
    const totalValue = opps.reduce((sum, o) => sum + o.value, 0);
    const weightedValue = opps.reduce((sum, o) => sum + o.value * (o.probability / 100), 0);
    return { pipelineId, totalOpportunities: opps.length, totalValue, weightedValue, stageBreakdown };
  }

  // ─── FollowUp ─────────────────────────────────────────────────────────────

  async createFollowUp(data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>): Promise<FollowUp> {
    const now = new Date();
    const fu: FollowUp = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.followUps.set(fu.id, fu);
    await this.logger.info('FollowUp created', { id: fu.id });
    return fu;
  }

  async getFollowUpById(id: string): Promise<FollowUp | undefined> {
    return this.followUps.get(id);
  }

  async listFollowUps(companyId: string): Promise<FollowUp[]> {
    return Array.from(this.followUps.values()).filter(f => f.companyId === companyId);
  }

  async updateFollowUp(id: string, data: Partial<FollowUp>): Promise<FollowUp> {
    const existing = this.followUps.get(id);
    if (!existing) throw new Error(`FollowUp ${id} not found`);
    const updated: FollowUp = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.followUps.set(id, updated);
    await this.logger.info('FollowUp updated', { id });
    return updated;
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    const deleted = this.followUps.delete(id);
    if (deleted) await this.logger.info('FollowUp deleted', { id });
    return deleted;
  }

  // ─── Funnel Metrics ───────────────────────────────────────────────────────

  async getFunnelMetrics(companyId: string): Promise<FunnelMetrics> {
    const leads = Array.from(this.leads.values()).filter(l => l.companyId === companyId);
    const qualified = leads.filter(l => l.status === 'qualified' || l.status === 'proposal' || l.status === 'negotiation' || l.status === 'won');
    const conversionRate = leads.length > 0 ? (qualified.length / leads.length) * 100 : 0;
    const averageScore = leads.length > 0 ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length : 0;

    const sourceMap = new Map<LeadSource, number>();
    for (const l of leads) sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1);
    const bySource = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));

    const statusMap = new Map<LeadStatus, number>();
    for (const l of leads) statusMap.set(l.status, (statusMap.get(l.status) ?? 0) + 1);
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    return { totalLeads: leads.length, qualifiedLeads: qualified.length, conversionRate, averageScore, bySource, byStatus };
  }
}

export { CRM as default };
