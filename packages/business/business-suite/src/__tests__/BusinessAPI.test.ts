import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessAPI } from '../api/BusinessAPI.js';

const CID = 'comp-1';

const companyData = {
  tenantId: 't1', name: 'Acme', legalName: 'Acme Corp', cnpj: '00000000000001',
  taxRegime: 'simples_nacional' as const, size: 'medium' as const, status: 'active' as const,
  industry: 'tech', email: 'a@acme.com', phone: '11999999999',
  address: { street: 'Main', number: '1', neighborhood: 'Center', city: 'SP', state: 'SP', zipCode: '01000-000', country: 'BR' },
};

describe('BusinessAPI', () => {
  let api: BusinessAPI;

  beforeEach(() => {
    api = new BusinessAPI();
  });

  it('creates and lists companies', async () => {
    const c = await api.createCompany(companyData);
    expect(c.id).toBeDefined();
    expect((await api.listCompanies()).length).toBeGreaterThanOrEqual(1);
  });

  it('CRUD for leads', async () => {
    const lead = await api.createLead({ companyId: CID, name: 'Lead1', source: 'website', status: 'new', score: 0, tags: [], customFields: {} });
    expect(await api.getLead(lead.id)).toBeDefined();
    expect(await api.listLeads(CID)).toHaveLength(1);
  });

  it('CRUD for opportunities', async () => {
    const opp = await api.createOpportunity({
      companyId: CID, title: 'Deal', value: 10000, currency: 'BRL', stage: 'prospecting', probability: 20, contactId: 'c1', tags: [], customFields: {},
    });
    expect(await api.getOpportunity(opp.id)).toBeDefined();
    expect(await api.listOpportunities(CID)).toHaveLength(1);
  });

  it('CRUD for transactions', async () => {
    const tx = await api.createTransaction({
      companyId: CID, type: 'income', accountId: 'acc1', category: 'sales', description: 'Sale', amount: 5000, currency: 'BRL', date: new Date(), status: 'pending', attachments: [], createdBy: 'u1',
    });
    expect(await api.getTransaction(tx.id)).toBeDefined();
    expect(await api.listTransactions(CID)).toHaveLength(1);
  });

  it('CRUD for projects', async () => {
    const p = await api.createProject({
      companyId: CID, name: 'Project X', status: 'planning', priority: 'high', spent: 0, currency: 'BRL', managerId: 'u1', teamIds: [], tags: [], milestones: [],
    });
    expect(await api.getProject(p.id)).toBeDefined();
    expect(await api.listProjects(CID)).toHaveLength(1);
  });

  it('creates tickets with auto-number', async () => {
    const t1 = await api.createTicket({
      companyId: CID, subject: 'Login issue', description: 'Cannot login', category: 'support', priority: 'high', status: 'open', contactId: 'c1', tags: [], attachments: [], messages: [],
    });
    const t2 = await api.createTicket({
      companyId: CID, subject: 'Billing', description: 'Wrong bill', category: 'billing', priority: 'low', status: 'open', contactId: 'c2', tags: [], attachments: [], messages: [],
    });
    expect(t1.number).toContain('TKT-');
    expect(t2.number).not.toBe(t1.number);
    expect(await api.listTickets(CID)).toHaveLength(2);
  });

  it('returns health status', async () => {
    const h = await api.getHealth();
    expect(h.status).toBe('healthy');
    expect(h.modules).toContain('company');
    expect(h.uptime).toBeGreaterThanOrEqual(0);
  });
});
