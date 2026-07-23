import type {
  Project,
  Epic,
  Task,
  Sprint,
  Milestone,
  ChecklistItem,
  TaskComment,
  ProjectStatus,
  ProjectPriority,
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

export interface ProjectsConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface ProjectProgress {
  projectId: string;
  totalTasks: number;
  completedTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  progressPercentage: number;
}

export interface SprintReport {
  sprintId: string;
  totalPoints: number;
  completedPoints: number;
  committedPoints: number;
  velocity: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export class Projects {
  private logger = new DefaultLogger('projects');
  private projects = new Map<string, Project>();
  private epics = new Map<string, Epic>();
  private tasks = new Map<string, Task>();
  private sprints = new Map<string, Sprint>();
  private config: ProjectsConfig;

  constructor(config?: ProjectsConfig) {
    this.config = config ?? {};
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'spent'>): Promise<Project> {
    const now = new Date();
    const project: Project = { ...data, id: crypto.randomUUID(), spent: 0, createdAt: now, updatedAt: now };
    this.projects.set(project.id, project);
    await this.logger.info('Project created', { id: project.id, name: project.name });
    return project;
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async listProjects(companyId: string, filters?: { status?: ProjectStatus; priority?: ProjectPriority; managerId?: string }): Promise<Project[]> {
    let results = Array.from(this.projects.values()).filter(p => p.companyId === companyId);
    if (filters?.status) results = results.filter(p => p.status === filters.status);
    if (filters?.priority) results = results.filter(p => p.priority === filters.priority);
    if (filters?.managerId) results = results.filter(p => p.managerId === filters.managerId);
    return results;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) throw new Error(`Project ${id} not found`);
    const updated: Project = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.projects.set(id, updated);
    await this.logger.info('Project updated', { id });
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const deleted = this.projects.delete(id);
    if (deleted) {
      for (const [taskId, task] of this.tasks) {
        if (task.projectId === id) this.tasks.delete(taskId);
      }
      for (const [epicId, epic] of this.epics) {
        if (epic.projectId === id) this.epics.delete(epicId);
      }
      for (const [sprintId, sprint] of this.sprints) {
        if (sprint.projectId === id) this.sprints.delete(sprintId);
      }
      await this.logger.info('Project deleted', { id });
    }
    return deleted;
  }

  async addMilestone(projectId: string, data: Omit<Milestone, 'id'>): Promise<Project> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    const milestone: Milestone = { ...data, id: crypto.randomUUID() };
    project.milestones.push(milestone);
    project.updatedAt = new Date();
    this.projects.set(projectId, project);
    await this.logger.info('Milestone added', { projectId, milestoneId: milestone.id });
    return project;
  }

  async getProjectProgress(projectId: string): Promise<ProjectProgress> {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    const projectTasks = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
    const completed = projectTasks.filter(t => t.status === 'done');
    const totalPoints = projectTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completedPoints = completed.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    return {
      projectId,
      totalTasks: projectTasks.length,
      completedTasks: completed.length,
      totalStoryPoints: totalPoints,
      completedStoryPoints: completedPoints,
      progressPercentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
    };
  }

  async createEpic(data: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>): Promise<Epic> {
    const now = new Date();
    const epic: Epic = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.epics.set(epic.id, epic);
    await this.logger.info('Epic created', { id: epic.id, name: epic.name });
    return epic;
  }

  async getEpicById(id: string): Promise<Epic | undefined> {
    return this.epics.get(id);
  }

  async listEpics(projectId: string): Promise<Epic[]> {
    return Array.from(this.epics.values()).filter(e => e.projectId === projectId);
  }

  async updateEpic(id: string, data: Partial<Epic>): Promise<Epic> {
    const existing = this.epics.get(id);
    if (!existing) throw new Error(`Epic ${id} not found`);
    const updated: Epic = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.epics.set(id, updated);
    await this.logger.info('Epic updated', { id });
    return updated;
  }

  async deleteEpic(id: string): Promise<boolean> {
    const deleted = this.epics.delete(id);
    if (deleted) {
      for (const [taskId, task] of this.tasks) {
        if (task.epicId === id) {
          task.epicId = undefined;
          this.tasks.set(taskId, task);
        }
      }
      await this.logger.info('Epic deleted', { id });
    }
    return deleted;
  }

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'loggedHours'>): Promise<Task> {
    const now = new Date();
    const task: Task = { ...data, id: crypto.randomUUID(), loggedHours: 0, createdAt: now, updatedAt: now };
    this.tasks.set(task.id, task);
    await this.logger.info('Task created', { id: task.id, title: task.title });
    return task;
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async listTasks(projectId: string, filters?: { sprintId?: string; epicId?: string; assigneeId?: string; status?: Task['status']; type?: Task['type'] }): Promise<Task[]> {
    let results = Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
    if (filters?.sprintId) results = results.filter(t => t.sprintId === filters.sprintId);
    if (filters?.epicId) results = results.filter(t => t.epicId === filters.epicId);
    if (filters?.assigneeId) results = results.filter(t => t.assigneeId === filters.assigneeId);
    if (filters?.status) results = results.filter(t => t.status === filters.status);
    if (filters?.type) results = results.filter(t => t.type === filters.type);
    return results;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const existing = this.tasks.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);
    const updated: Task = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.tasks.set(id, updated);
    await this.logger.info('Task updated', { id });
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const deleted = this.tasks.delete(id);
    if (deleted) await this.logger.info('Task deleted', { id });
    return deleted;
  }

  async addTaskComment(taskId: string, authorId: string, content: string): Promise<TaskComment> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    const comment: TaskComment = { id: crypto.randomUUID(), authorId, content, createdAt: new Date() };
    task.comments.push(comment);
    task.updatedAt = new Date();
    this.tasks.set(taskId, task);
    await this.logger.info('Comment added to task', { taskId, commentId: comment.id });
    return comment;
  }

  async addTaskChecklistItem(taskId: string, text: string): Promise<ChecklistItem> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    const item: ChecklistItem = { id: crypto.randomUUID(), text, completed: false };
    task.checklist.push(item);
    task.updatedAt = new Date();
    this.tasks.set(taskId, task);
    await this.logger.info('Checklist item added', { taskId, itemId: item.id });
    return item;
  }

  async createSprint(data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'completedPoints'>): Promise<Sprint> {
    const now = new Date();
    const sprint: Sprint = { ...data, id: crypto.randomUUID(), completedPoints: 0, createdAt: now, updatedAt: now };
    this.sprints.set(sprint.id, sprint);
    await this.logger.info('Sprint created', { id: sprint.id, name: sprint.name });
    return sprint;
  }

  async getSprintById(id: string): Promise<Sprint | undefined> {
    return this.sprints.get(id);
  }

  async listSprints(projectId: string): Promise<Sprint[]> {
    return Array.from(this.sprints.values()).filter(s => s.projectId === projectId);
  }

  async updateSprint(id: string, data: Partial<Sprint>): Promise<Sprint> {
    const existing = this.sprints.get(id);
    if (!existing) throw new Error(`Sprint ${id} not found`);
    const updated: Sprint = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.sprints.set(id, updated);
    await this.logger.info('Sprint updated', { id });
    return updated;
  }

  async deleteSprint(id: string): Promise<boolean> {
    const deleted = this.sprints.delete(id);
    if (deleted) {
      for (const [taskId, task] of this.tasks) {
        if (task.sprintId === id) {
          task.sprintId = undefined;
          this.tasks.set(taskId, task);
        }
      }
      await this.logger.info('Sprint deleted', { id });
    }
    return deleted;
  }

  async getSprintReport(sprintId: string): Promise<SprintReport> {
    const sprint = this.sprints.get(sprintId);
    if (!sprint) throw new Error(`Sprint ${sprintId} not found`);
    const sprintTasks = Array.from(this.tasks.values()).filter(t => t.sprintId === sprintId);
    const completed = sprintTasks.filter(t => t.status === 'done');
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completedPoints = completed.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    return {
      sprintId,
      totalPoints,
      completedPoints,
      committedPoints: sprint.totalPoints,
      velocity: completedPoints,
      tasksCompleted: completed.length,
      tasksTotal: sprintTasks.length,
    };
  }

  async completeSprint(id: string): Promise<Sprint> {
    const sprint = this.sprints.get(id);
    if (!sprint) throw new Error(`Sprint ${id} not found`);
    if (sprint.status !== 'active') throw new Error(`Sprint ${id} is not active`);
    const sprintTasks = Array.from(this.tasks.values()).filter(t => t.sprintId === id);
    const completedPoints = sprintTasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    sprint.status = 'completed';
    sprint.completedPoints = completedPoints;
    sprint.updatedAt = new Date();
    this.sprints.set(id, sprint);
    await this.logger.info('Sprint completed', { id });
    return sprint;
  }
}

export { Projects as default };
