import { describe, it, expect, beforeEach } from 'vitest';
import { CRM } from '../crm/CRM.js';

const CID = 'comp-1';

function leadData(overrides = {}) {
  return {
    companyId: CID,
    name: 'John Lead',
    source: 'website' as const,
    status: 'new' as const,
    score: 0,
    tags: [],
    customFields: {},
    ...overrides,
  };
}

describe('CRM', () => {
  let crm: CRM;

  beforeEach(() => {
    crm = new CRM();
  });

  it('creates and retrieves a lead', async () => {
    const lead = await crm.createLead(leadData());
    expect(lead.id).toBeDefined();
    const found = await crm.getLeadById(lead.id);
    expect(found?.name).toBe('John Lead');
  });

  it('updates and deletes a lead', async () => {
    const lead = await crm.createLead(leadData());
    const updated = await crm.updateLead(lead.id, { status: 'contacted' });
    expect(updated.status).toBe('contacted');
    expect(await crm.deleteLead(lead.id)).toBe(true);
    expect(await crm.getLeadById(lead.id)).toBeUndefined();
  });

  it('scores a lead based on attributes', async () => {
    const lead = await crm.createLead(leadData({
      email: 'j@test.com', phone: '1199', company: 'Corp',
      source: 'referral', status: 'qualified',
    }));
    const scored = await crm.scoreLead(lead.id);
    expect(scored.score).toBe(10 + 10 + 15 + 20 + 25);
  });

  it('scores caps at 100', async () => {
    const lead = await crm.createLead(leadData({
      email: 'j@test.com', phone: '1199', company: 'Corp',
      source: 'partner', status: 'proposal',
    }));
    const scored = await crm.scoreLead(lead.id);
    expect(scored.score).toBeLessThanOrEqual(100);
  });

  it('lists leads with status filter', async () => {
    await crm.createLead(leadData({ status: 'new' }));
    await crm.createLead(leadData({ status: 'qualified' }));
    const qualified = await crm.listLeads(CID, { status: 'qualified' });
    expect(qualified).toHaveLength(1);
  });

  it('CRUD for contacts and opportunities', async () => {
    const contact = await crm.createContact({ companyId: CID, name: 'Jane', email: 'j@t.com', isPrimary: true, tags: [], customFields: {} });
    const opp = await crm.createOpportunity({ companyId: CID, title: 'Deal', value: 5000, currency: 'BRL', stage: 'prospecting', probability: 20, contactId: contact.id, tags: [], customFields: {} });
    expect(await crm.listContacts(CID)).toHaveLength(1);
    expect(await crm.listOpportunities(CID)).toHaveLength(1);
    await crm.updateOpportunity(opp.id, { stage: 'negotiation', probability: 70 });
    expect((await crm.getOpportunityById(opp.id))?.stage).toBe('negotiation');
  });

  it('creates a pipeline and computes funnel metrics', async () => {
    await crm.createLead(leadData({ status: 'new', source: 'website' }));
    await crm.createLead(leadData({ status: 'qualified', source: 'referral', email: 'a@b.com' }));
    const metrics = await crm.getFunnelMetrics(CID);
    expect(metrics.totalLeads).toBe(2);
    expect(metrics.qualifiedLeads).toBe(1);
    expect(metrics.conversionRate).toBe(50);
  });
});
