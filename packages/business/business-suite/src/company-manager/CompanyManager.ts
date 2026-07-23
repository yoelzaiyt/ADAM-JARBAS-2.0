import type {
  Company,
  Branch,
  Department,
  CostCenter,
  Team,
  CompanyUser,
  CompanyStatus,
  UserRole,
  Permission,
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

export interface CompanyManagerConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class CompanyManager {
  private logger = new DefaultLogger('company-manager');
  private companies = new Map<string, Company>();
  private branches = new Map<string, Branch>();
  private departments = new Map<string, Department>();
  private costCenters = new Map<string, CostCenter>();
  private teams = new Map<string, Team>();
  private users = new Map<string, CompanyUser>();
  private config: CompanyManagerConfig;

  constructor(config?: CompanyManagerConfig) {
    this.config = config ?? {};
  }

  // ─── Company ──────────────────────────────────────────────────────────────

  async createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const now = new Date();
    const company: Company = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    this.companies.set(company.id, company);
    await this.logger.info('Company created', { id: company.id });
    return company;
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async listCompanies(tenantId?: string): Promise<Company[]> {
    const all = Array.from(this.companies.values());
    if (tenantId) return all.filter(c => c.tenantId === tenantId);
    return all;
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

  // ─── Branch ───────────────────────────────────────────────────────────────

  async createBranch(data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> {
    const now = new Date();
    const branch: Branch = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.branches.set(branch.id, branch);
    await this.logger.info('Branch created', { id: branch.id });
    return branch;
  }

  async getBranchById(id: string): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async listBranches(companyId: string): Promise<Branch[]> {
    return Array.from(this.branches.values()).filter(b => b.companyId === companyId);
  }

  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    const existing = this.branches.get(id);
    if (!existing) throw new Error(`Branch ${id} not found`);
    const updated: Branch = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.branches.set(id, updated);
    await this.logger.info('Branch updated', { id });
    return updated;
  }

  async deleteBranch(id: string): Promise<boolean> {
    const deleted = this.branches.delete(id);
    if (deleted) await this.logger.info('Branch deleted', { id });
    return deleted;
  }

  // ─── Department ───────────────────────────────────────────────────────────

  async createDepartment(data: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<Department> {
    const now = new Date();
    const dept: Department = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.departments.set(dept.id, dept);
    await this.logger.info('Department created', { id: dept.id });
    return dept;
  }

  async getDepartmentById(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async listDepartments(companyId: string): Promise<Department[]> {
    return Array.from(this.departments.values()).filter(d => d.companyId === companyId);
  }

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const existing = this.departments.get(id);
    if (!existing) throw new Error(`Department ${id} not found`);
    const updated: Department = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.departments.set(id, updated);
    await this.logger.info('Department updated', { id });
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const deleted = this.departments.delete(id);
    if (deleted) await this.logger.info('Department deleted', { id });
    return deleted;
  }

  // ─── Cost Center ──────────────────────────────────────────────────────────

  async createCostCenter(data: Omit<CostCenter, 'id' | 'createdAt' | 'updatedAt'>): Promise<CostCenter> {
    const now = new Date();
    const cc: CostCenter = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.costCenters.set(cc.id, cc);
    await this.logger.info('CostCenter created', { id: cc.id });
    return cc;
  }

  async getCostCenterById(id: string): Promise<CostCenter | undefined> {
    return this.costCenters.get(id);
  }

  async listCostCenters(companyId: string): Promise<CostCenter[]> {
    return Array.from(this.costCenters.values()).filter(c => c.companyId === companyId);
  }

  async updateCostCenter(id: string, data: Partial<CostCenter>): Promise<CostCenter> {
    const existing = this.costCenters.get(id);
    if (!existing) throw new Error(`CostCenter ${id} not found`);
    const updated: CostCenter = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.costCenters.set(id, updated);
    await this.logger.info('CostCenter updated', { id });
    return updated;
  }

  async deleteCostCenter(id: string): Promise<boolean> {
    const deleted = this.costCenters.delete(id);
    if (deleted) await this.logger.info('CostCenter deleted', { id });
    return deleted;
  }

  // ─── Team ─────────────────────────────────────────────────────────────────

  async createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
    const now = new Date();
    const team: Team = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.teams.set(team.id, team);
    await this.logger.info('Team created', { id: team.id });
    return team;
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async listTeams(companyId: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(t => t.companyId === companyId);
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const existing = this.teams.get(id);
    if (!existing) throw new Error(`Team ${id} not found`);
    const updated: Team = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.teams.set(id, updated);
    await this.logger.info('Team updated', { id });
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const deleted = this.teams.delete(id);
    if (deleted) await this.logger.info('Team deleted', { id });
    return deleted;
  }

  // ─── User ─────────────────────────────────────────────────────────────────

  async createUser(data: Omit<CompanyUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyUser> {
    const now = new Date();
    const user: CompanyUser = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.users.set(user.id, user);
    await this.logger.info('User created', { id: user.id });
    return user;
  }

  async getUserById(id: string): Promise<CompanyUser | undefined> {
    return this.users.get(id);
  }

  async listUsers(companyId: string): Promise<CompanyUser[]> {
    return Array.from(this.users.values()).filter(u => u.companyId === companyId);
  }

  async updateUser(id: string, data: Partial<CompanyUser>): Promise<CompanyUser> {
    const existing = this.users.get(id);
    if (!existing) throw new Error(`User ${id} not found`);
    const updated: CompanyUser = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.users.set(id, updated);
    await this.logger.info('User updated', { id });
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = this.users.delete(id);
    if (deleted) await this.logger.info('User deleted', { id });
    return deleted;
  }
}

export { CompanyManager as default };
