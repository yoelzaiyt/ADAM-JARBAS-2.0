import type {
  Employee,
  OrganizationalChart,
  Vacation,
  Training,
  PerformanceEvaluation,
  EmployeeStatus,
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

export interface HRConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface HeadcountReport {
  total: number;
  active: number;
  onLeave: number;
  terminated: number;
  suspended: number;
  byDepartment: { departmentId: string; count: number }[];
}

export interface TurnoverReport {
  totalHires: number;
  totalTerminations: number;
  turnoverRate: number;
  period: string;
}

export class HR {
  private logger = new DefaultLogger('hr');
  private employees = new Map<string, Employee>();
  private orgCharts = new Map<string, OrganizationalChart>();
  private vacations = new Map<string, Vacation>();
  private trainings = new Map<string, Training>();
  private evaluations = new Map<string, PerformanceEvaluation>();
  private config: HRConfig;

  constructor(config?: HRConfig) {
    this.config = config ?? {};
  }

  // ─── Employee ──────────────────────────────────────────────────────────────

  async createEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const now = new Date();
    const employee: Employee = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.employees.set(employee.id, employee);
    await this.logger.info('Employee created', { id: employee.id, name: employee.name });
    return employee;
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async listEmployees(companyId: string, filters?: { departmentId?: string; status?: EmployeeStatus; managerId?: string }): Promise<Employee[]> {
    let results = Array.from(this.employees.values()).filter(e => e.companyId === companyId);
    if (filters?.departmentId) results = results.filter(e => e.departmentId === filters.departmentId);
    if (filters?.status) results = results.filter(e => e.status === filters.status);
    if (filters?.managerId) results = results.filter(e => e.managerId === filters.managerId);
    return results;
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    const existing = this.employees.get(id);
    if (!existing) throw new Error(`Employee ${id} not found`);
    const updated: Employee = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.employees.set(id, updated);
    await this.logger.info('Employee updated', { id });
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const deleted = this.employees.delete(id);
    if (deleted) await this.logger.info('Employee deleted', { id });
    return deleted;
  }

  async terminateEmployee(id: string, terminationDate: Date = new Date()): Promise<Employee> {
    const employee = this.employees.get(id);
    if (!employee) throw new Error(`Employee ${id} not found`);
    employee.status = 'terminated';
    employee.terminationDate = terminationDate;
    employee.updatedAt = new Date();
    this.employees.set(id, employee);
    await this.logger.info('Employee terminated', { id });
    return employee;
  }

  async getHeadcount(companyId: string): Promise<HeadcountReport> {
    const all = Array.from(this.employees.values()).filter(e => e.companyId === companyId);
    const deptMap = new Map<string, number>();
    for (const e of all) deptMap.set(e.departmentId, (deptMap.get(e.departmentId) ?? 0) + 1);
    return {
      total: all.length,
      active: all.filter(e => e.status === 'active').length,
      onLeave: all.filter(e => e.status === 'on_leave').length,
      terminated: all.filter(e => e.status === 'terminated').length,
      suspended: all.filter(e => e.status === 'suspended').length,
      byDepartment: Array.from(deptMap.entries()).map(([departmentId, count]) => ({ departmentId, count })),
    };
  }

  // ─── OrganizationalChart ───────────────────────────────────────────────────

  async createOrgChart(data: Omit<OrganizationalChart, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrganizationalChart> {
    const now = new Date();
    const chart: OrganizationalChart = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.orgCharts.set(chart.id, chart);
    await this.logger.info('Org chart created', { id: chart.id, name: chart.name });
    return chart;
  }

  async getOrgChartById(id: string): Promise<OrganizationalChart | undefined> {
    return this.orgCharts.get(id);
  }

  async listOrgCharts(companyId: string): Promise<OrganizationalChart[]> {
    return Array.from(this.orgCharts.values()).filter(c => c.companyId === companyId);
  }

  async updateOrgChart(id: string, data: Partial<OrganizationalChart>): Promise<OrganizationalChart> {
    const existing = this.orgCharts.get(id);
    if (!existing) throw new Error(`OrganizationalChart ${id} not found`);
    const updated: OrganizationalChart = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.orgCharts.set(id, updated);
    await this.logger.info('Org chart updated', { id });
    return updated;
  }

  async deleteOrgChart(id: string): Promise<boolean> {
    const deleted = this.orgCharts.delete(id);
    if (deleted) await this.logger.info('Org chart deleted', { id });
    return deleted;
  }

  // ─── Vacation ──────────────────────────────────────────────────────────────

  async createVacation(data: Omit<Vacation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vacation> {
    const now = new Date();
    const vacation: Vacation = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.vacations.set(vacation.id, vacation);
    await this.logger.info('Vacation created', { id: vacation.id, employeeId: vacation.employeeId });
    return vacation;
  }

  async getVacationById(id: string): Promise<Vacation | undefined> {
    return this.vacations.get(id);
  }

  async listVacations(companyId: string, filters?: { employeeId?: string; status?: Vacation['status'] }): Promise<Vacation[]> {
    let results = Array.from(this.vacations.values()).filter(v => v.companyId === companyId);
    if (filters?.employeeId) results = results.filter(v => v.employeeId === filters.employeeId);
    if (filters?.status) results = results.filter(v => v.status === filters.status);
    return results;
  }

  async updateVacation(id: string, data: Partial<Vacation>): Promise<Vacation> {
    const existing = this.vacations.get(id);
    if (!existing) throw new Error(`Vacation ${id} not found`);
    const updated: Vacation = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.vacations.set(id, updated);
    await this.logger.info('Vacation updated', { id });
    return updated;
  }

  async deleteVacation(id: string): Promise<boolean> {
    const deleted = this.vacations.delete(id);
    if (deleted) await this.logger.info('Vacation deleted', { id });
    return deleted;
  }

  async approveVacation(id: string, approvedBy: string): Promise<Vacation> {
    const vacation = this.vacations.get(id);
    if (!vacation) throw new Error(`Vacation ${id} not found`);
    if (vacation.status !== 'requested') throw new Error(`Vacation ${id} is not in requested status`);
    vacation.status = 'approved';
    vacation.approvedBy = approvedBy;
    vacation.updatedAt = new Date();
    this.vacations.set(id, vacation);
    await this.logger.info('Vacation approved', { id, approvedBy });
    return vacation;
  }

  // ─── Training ──────────────────────────────────────────────────────────────

  async createTraining(data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<Training> {
    const now = new Date();
    const training: Training = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.trainings.set(training.id, training);
    await this.logger.info('Training created', { id: training.id, title: training.title });
    return training;
  }

  async getTrainingById(id: string): Promise<Training | undefined> {
    return this.trainings.get(id);
  }

  async listTrainings(companyId: string, filters?: { status?: Training['status'] }): Promise<Training[]> {
    let results = Array.from(this.trainings.values()).filter(t => t.companyId === companyId);
    if (filters?.status) results = results.filter(t => t.status === filters.status);
    return results;
  }

  async updateTraining(id: string, data: Partial<Training>): Promise<Training> {
    const existing = this.trainings.get(id);
    if (!existing) throw new Error(`Training ${id} not found`);
    const updated: Training = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.trainings.set(id, updated);
    await this.logger.info('Training updated', { id });
    return updated;
  }

  async deleteTraining(id: string): Promise<boolean> {
    const deleted = this.trainings.delete(id);
    if (deleted) await this.logger.info('Training deleted', { id });
    return deleted;
  }

  async enrollInTraining(trainingId: string, employeeId: string): Promise<Training> {
    const training = this.trainings.get(trainingId);
    if (!training) throw new Error(`Training ${trainingId} not found`);
    if (training.participants.includes(employeeId)) throw new Error(`Employee ${employeeId} already enrolled`);
    if (training.maxParticipants && training.participants.length >= training.maxParticipants) {
      throw new Error(`Training ${trainingId} is at max capacity`);
    }
    training.participants.push(employeeId);
    training.updatedAt = new Date();
    this.trainings.set(trainingId, training);
    await this.logger.info('Employee enrolled in training', { trainingId, employeeId });
    return training;
  }

  async unenrollFromTraining(trainingId: string, employeeId: string): Promise<Training> {
    const training = this.trainings.get(trainingId);
    if (!training) throw new Error(`Training ${trainingId} not found`);
    const idx = training.participants.indexOf(employeeId);
    if (idx === -1) throw new Error(`Employee ${employeeId} is not enrolled in training ${trainingId}`);
    training.participants.splice(idx, 1);
    training.updatedAt = new Date();
    this.trainings.set(trainingId, training);
    await this.logger.info('Employee unenrolled from training', { trainingId, employeeId });
    return training;
  }

  // ─── PerformanceEvaluation ─────────────────────────────────────────────────

  async createEvaluation(data: Omit<PerformanceEvaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceEvaluation> {
    const now = new Date();
    const evaluation: PerformanceEvaluation = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.evaluations.set(evaluation.id, evaluation);
    await this.logger.info('Evaluation created', { id: evaluation.id, employeeId: evaluation.employeeId });
    return evaluation;
  }

  async getEvaluationById(id: string): Promise<PerformanceEvaluation | undefined> {
    return this.evaluations.get(id);
  }

  async listEvaluations(companyId: string, filters?: { employeeId?: string; evaluatorId?: string; period?: string }): Promise<PerformanceEvaluation[]> {
    let results = Array.from(this.evaluations.values()).filter(e => e.companyId === companyId);
    if (filters?.employeeId) results = results.filter(e => e.employeeId === filters.employeeId);
    if (filters?.evaluatorId) results = results.filter(e => e.evaluatorId === filters.evaluatorId);
    if (filters?.period) results = results.filter(e => e.period === filters.period);
    return results;
  }

  async updateEvaluation(id: string, data: Partial<PerformanceEvaluation>): Promise<PerformanceEvaluation> {
    const existing = this.evaluations.get(id);
    if (!existing) throw new Error(`PerformanceEvaluation ${id} not found`);
    const updated: PerformanceEvaluation = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.evaluations.set(id, updated);
    await this.logger.info('Evaluation updated', { id });
    return updated;
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    const deleted = this.evaluations.delete(id);
    if (deleted) await this.logger.info('Evaluation deleted', { id });
    return deleted;
  }

  async submitEvaluation(id: string): Promise<PerformanceEvaluation> {
    const evaluation = this.evaluations.get(id);
    if (!evaluation) throw new Error(`PerformanceEvaluation ${id} not found`);
    if (evaluation.status !== 'draft') throw new Error(`Evaluation ${id} is not a draft`);
    evaluation.status = 'submitted';
    evaluation.updatedAt = new Date();
    this.evaluations.set(id, evaluation);
    await this.logger.info('Evaluation submitted', { id });
    return evaluation;
  }

  async completeEvaluation(id: string): Promise<PerformanceEvaluation> {
    const evaluation = this.evaluations.get(id);
    if (!evaluation) throw new Error(`PerformanceEvaluation ${id} not found`);
    if (evaluation.status !== 'submitted') throw new Error(`Evaluation ${id} is not submitted`);
    evaluation.status = 'completed';
    evaluation.updatedAt = new Date();
    this.evaluations.set(id, evaluation);
    await this.logger.info('Evaluation completed', { id });
    return evaluation;
  }
}

export { HR as default };
