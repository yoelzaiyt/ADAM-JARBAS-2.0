import type {
  TaskManager as ITaskManager,
  Task,
  TaskStatus,
  TaskPriority,
  TaskStepType,
  RetryPolicy,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

export class TaskManager implements ITaskManager {
  private tasks: Map<string, Task> = new Map();

  constructor(private readonly logger: Logger) {}

  async create(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'retryCount' | 'maxRetries'>
  ): Promise<Task> {
    const now = new Date();
    const created: Task = {
      ...task,
      id: generateId(),
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(created.id, created);
    this.logger.info('Task created', { taskId: created.id, name: created.name });
    return structuredClone(created);
  }

  async get(taskId: string): Promise<Task | null> {
    const task = this.tasks.get(taskId);
    return task ? structuredClone(task) : null;
  }

  async list(filters?: { status?: TaskStatus; goalId?: string; tenantId?: string }): Promise<Task[]> {
    let results = Array.from(this.tasks.values());

    if (filters?.status) {
      results = results.filter((t) => t.status === filters.status);
    }
    if (filters?.goalId) {
      results = results.filter((t) => t.goalId === filters.goalId);
    }
    if (filters?.tenantId) {
      results = results.filter((t) => t.tenantId === filters.tenantId);
    }

    return results.map((t) => structuredClone(t));
  }

  async update(taskId: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updated: Task = {
      ...task,
      ...updates,
      id: task.id,
      createdAt: task.createdAt,
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updated);
    this.logger.info('Task updated', { taskId });
    return structuredClone(updated);
  }

  async delete(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.tasks.delete(taskId);
    this.logger.info('Task deleted', { taskId });
  }

  async start(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updated: Task = {
      ...task,
      status: 'running' as TaskStatus,
      startedAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updated);
    this.logger.info('Task started', { taskId });
    return structuredClone(updated);
  }

  async complete(taskId: string, outputs: Record<string, unknown>): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updated: Task = {
      ...task,
      status: 'completed' as TaskStatus,
      outputs,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updated);
    this.logger.info('Task completed', { taskId });
    return structuredClone(updated);
  }

  async fail(taskId: string, error: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const canRetry = task.retryCount < task.maxRetries;
    const updated: Task = {
      ...task,
      status: canRetry ? 'retrying' : 'failed',
      error,
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updated);
    this.logger.info('Task failed', { taskId, error, canRetry });
    return structuredClone(updated);
  }

  async cancel(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updated: Task = {
      ...task,
      status: 'cancelled' as TaskStatus,
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updated);
    this.logger.info('Task cancelled', { taskId });
    return structuredClone(updated);
  }

  async retry(taskId: string): Promise<Task> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.retryCount >= task.maxRetries) {
      throw new Error(`Task ${taskId} has exceeded maximum retries (${task.maxRetries})`);
    }

    const updated: Task = {
      ...task,
      retryCount: task.retryCount + 1,
      status: 'pending' as TaskStatus,
      error: undefined,
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updated);
    this.logger.info('Task retried', { taskId, retryCount: updated.retryCount });
    return structuredClone(updated);
  }

  async getReadyTasks(): Promise<Task[]> {
    const readyTasks = Array.from(this.tasks.values()).filter((task) => {
      if (task.status !== 'pending') return false;

      if (task.dependencies.length === 0) return true;

      return task.dependencies.every((depId) => {
        const dep = this.tasks.get(depId);
        return dep !== undefined && dep.status === 'completed';
      });
    });

    return readyTasks.map((t) => structuredClone(t));
  }
}
