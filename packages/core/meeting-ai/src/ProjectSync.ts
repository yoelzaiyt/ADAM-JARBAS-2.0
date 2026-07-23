import type {
  ProjectSync as IProjectSync,
  ProjectTask,
} from './interfaces.js';

export class ProjectSync implements IProjectSync {
  private tasks: Map<string, ProjectTask> = new Map();

  async createTask(task: ProjectTask): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) Object.assign(task, updates);
  }

  async getTasks(project: string): Promise<ProjectTask[]> {
    return Array.from(this.tasks.values()).filter(t => t.project === project);
  }

  async sync(): Promise<void> {}
}
