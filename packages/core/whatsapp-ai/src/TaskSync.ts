import { randomUUID } from 'node:crypto';
import type {
  TaskSync as ITaskSync,
  TaskItem,
  TaskPriority,
} from './interfaces.js';

export class TaskSync implements ITaskSync {
  private tasks: Map<string, TaskItem> = new Map();

  async createTask(task: Omit<TaskItem, 'id' | 'createdAt'>): Promise<TaskItem> {
    const id = randomUUID();
    const full: TaskItem = { ...task, id, createdAt: new Date() };
    this.tasks.set(id, full);
    return full;
  }

  async updateTask(taskId: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    Object.assign(task, updates, { id: taskId });
    return task;
  }

  getTasksByContact(contactId: string): TaskItem[] {
    return Array.from(this.tasks.values()).filter(t => t.contactId === contactId);
  }

  getTasksByProject(projectId: string): TaskItem[] {
    return Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
  }

  async completeTask(taskId: string): Promise<TaskItem> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = 'concluida';
    return task;
  }
}
