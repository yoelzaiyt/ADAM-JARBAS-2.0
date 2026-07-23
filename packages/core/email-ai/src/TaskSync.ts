import { randomUUID } from 'node:crypto';
import type {
  TaskSync as ITaskSync,
  TaskItem,
  TaskPriority,
  TaskStatus,
  EmailMessage,
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

  async completeTask(taskId: string): Promise<TaskItem> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    task.status = 'concluida';
    task.completedAt = new Date();
    return task;
  }

  getTasksByContact(contactId: string): TaskItem[] {
    return Array.from(this.tasks.values()).filter(t => t.contactId === contactId);
  }

  getTasksByProject(projectId: string): TaskItem[] {
    return Array.from(this.tasks.values()).filter(t => t.projectId === projectId);
  }

  getTasksByEmail(emailId: string): TaskItem[] {
    return Array.from(this.tasks.values()).filter(t => t.emailId === emailId);
  }

  getPendingTasks(): TaskItem[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pendente');
  }

  async extractTasks(message: EmailMessage): Promise<Omit<TaskItem, 'id' | 'createdAt'>[]> {
    const tasks: Omit<TaskItem, 'id' | 'createdAt'>[] = [];
    const text = message.textBody.toLowerCase();

    const taskPatterns = [
      { keyword: 'entregar', priority: 'alta' as TaskPriority },
      { keyword: 'prazo', priority: 'urgente' as TaskPriority },
      { keyword: 'favor enviar', priority: 'media' as TaskPriority },
      { keyword: 'não esqueça', priority: 'alta' as TaskPriority },
    ];

    for (const { keyword, priority } of taskPatterns) {
      if (text.includes(keyword)) {
        tasks.push({
          title: `Task from email: ${message.subject.slice(0, 50)}`,
          description: `Extracted from email: ${keyword}`,
          priority, status: 'pendente', source: 'email',
          emailId: message.id, contactId: undefined,
        });
      }
    }
    return tasks;
  }
}
