import type {
  Company,
  Lead,
  Opportunity,
  Transaction,
  Project,
  Ticket,
  Dashboard,
  KPI,
  AnalyticsDashboard,
  Workflow,
  ReportTemplate,
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

export interface BusinessAPIConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down';
  modules: string[];
  uptime: number;
  lastCheck: Date;
}

export class BusinessAPI {
  private logger = new DefaultLogger('business-api');
  private companies = new Map<string, Company>();
  private leads = new Map<string, Lead>();
  private opportunities = new Map<string, Opportunity>();
  private transactions = new Map<string, Transaction>();
  private projects = new Map<string, Project>();
  private tickets = new Map<string, Ticket>();
  private dashboards = new Map<string, Dashboard>();
  private kpis = new Map<string, KPI>();
  private analytics = new Map<string, AnalyticsDashboard>();
  private workflows = new Map<string, Workflow>();
  private reports = new Map<string, ReportTemplate>();
  private config: BusinessAPIConfig;
  private startTime: Date;

  constructor(config?: BusinessAPIConfig) {
    this.config = config ?? {};
    this.startTime = new Date();
  }

  // ─── Company ──────────────────────────────────────────────────────────────

  async createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const now = new Date();
    const company: Company = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.companies.set(company.id, company);
    await this.logger.info('Company created', { id: company.id });
    return company;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async listCompanies(filters?: { status?: Company['status']; industry?: string }): Promise<Company[]> {
    let results = Array.from(this.companies.values());
    if (filters?.status) results = results.filter(c => c.status === filters.status);
    if (filters?.industry) results = results.filter(c => c.industry === filters.industry);
    return results;
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const existing = this.companies.get(id);
    if (!existing) throw new Error(`Company ${id} not found`);
    const updated: Company = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.companies.set(id, updated);
    await this.logger.info('Company updated', { id });
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const deleted = this.companies.delete(id);
    if (deleted) await this.logger.info('Company deleted', { id });
    return deleted;
  }

  // ─── Lead ─────────────────────────────────────────────────────────────────

  async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const now = new Date();
    const lead: Lead = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.leads.set(lead.id, lead);
    await this.logger.info('Lead created', { id: lead.id });
    return lead;
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async listLeads(companyId: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(l => l.companyId === companyId);
  }

  // ─── Opportunity ──────────────────────────────────────────────────────────

  async createOpportunity(data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Opportunity> {
    const now = new Date();
    const opp: Opportunity = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.opportunities.set(opp.id, opp);
    await this.logger.info('Opportunity created', { id: opp.id });
    return opp;
  }

  async getOpportunity(id: string): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async listOpportunities(companyId: string): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values()).filter(o => o.companyId === companyId);
  }

  // ─── Transaction ──────────────────────────────────────────────────────────

  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date();
    const tx: Transaction = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.transactions.set(tx.id, tx);
    await this.logger.info('Transaction created', { id: tx.id });
    return tx;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async listTransactions(companyId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.companyId === companyId);
  }

  // ─── Project ──────────────────────────────────────────────────────────────

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = new Date();
    const project: Project = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.projects.set(project.id, project);
    await this.logger.info('Project created', { id: project.id });
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async listProjects(companyId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.companyId === companyId);
  }

  // ─── Ticket ───────────────────────────────────────────────────────────────

  async createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'number'>): Promise<Ticket> {
    const now = new Date();
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const ticket: Ticket = { ...data, id: crypto.randomUUID(), number: ticketNumber, createdAt: now, updatedAt: now };
    this.tickets.set(ticket.id, ticket);
    await this.logger.info('Ticket created', { id: ticket.id, number: ticketNumber });
    return ticket;
  }

  async getTicket(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async listTickets(companyId: string): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(t => t.companyId === companyId);
  }

  // ─── Dashboard / KPIs / Analytics ─────────────────────────────────────────

  async getDashboard(companyId: string): Promise<Dashboard | undefined> {
    return Array.from(this.dashboards.values()).find(d => d.companyId === companyId);
  }

  async getKPIs(companyId: string): Promise<KPI[]> {
    return Array.from(this.kpis.values()).filter(k => k.companyId === companyId);
  }

  async getAnalytics(companyId: string): Promise<AnalyticsDashboard | undefined> {
    return Array.from(this.analytics.values()).find(a => a.companyId === companyId);
  }

  // ─── Workflow ─────────────────────────────────────────────────────────────

  async createWorkflow(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'steps' | 'executionCount'>): Promise<Workflow> {
    const now = new Date();
    const workflow: Workflow = { ...data, id: crypto.randomUUID(), steps: [], executionCount: 0, createdAt: now, updatedAt: now };
    this.workflows.set(workflow.id, workflow);
    await this.logger.info('Workflow created', { id: workflow.id });
    return workflow;
  }

  // ─── Report ───────────────────────────────────────────────────────────────

  async createReport(data: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReportTemplate> {
    const now = new Date();
    const report: ReportTemplate = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.reports.set(report.id, report);
    await this.logger.info('Report created', { id: report.id });
    return report;
  }

  // ─── Health ───────────────────────────────────────────────────────────────

  async getHealth(): Promise<HealthResponse> {
    return {
      status: 'healthy',
      modules: [
        'company', 'lead', 'opportunity', 'transaction',
        'project', 'ticket', 'dashboard', 'kpi',
        'analytics', 'workflow', 'report',
      ],
      uptime: Date.now() - this.startTime.getTime(),
      lastCheck: new Date(),
    };
  }
}

export { BusinessAPI as default };
