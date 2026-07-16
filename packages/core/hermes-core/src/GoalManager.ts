import type {
  GoalManager as IGoalManager,
  TaskManager as ITaskManager,
  Goal,
  GoalStatus,
  GoalProgress,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

export class GoalManager implements IGoalManager {
  private goals: Map<string, Goal> = new Map();

  constructor(
    private readonly logger: Logger,
    private readonly taskManager?: ITaskManager
  ) {}

  async create(
    goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'childGoalIds' | 'taskIds' | 'progress'>
  ): Promise<Goal> {
    const now = new Date();
    const created: Goal = {
      ...goal,
      id: generateId(),
      childGoalIds: [],
      taskIds: [],
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.goals.set(created.id, created);
    this.logger.info('Goal created', { goalId: created.id, title: created.title });
    return structuredClone(created);
  }

  async get(goalId: string): Promise<Goal | null> {
    const goal = this.goals.get(goalId);
    return goal ? structuredClone(goal) : null;
  }

  async list(filters?: { status?: GoalStatus; tenantId?: string; userId?: string }): Promise<Goal[]> {
    let results = Array.from(this.goals.values());

    if (filters?.status) {
      results = results.filter((g) => g.status === filters.status);
    }
    if (filters?.tenantId) {
      results = results.filter((g) => g.tenantId === filters.tenantId);
    }
    if (filters?.userId) {
      results = results.filter((g) => g.userId === filters.userId);
    }

    return results.map((g) => structuredClone(g));
  }

  async update(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const updated: Goal = {
      ...goal,
      ...updates,
      id: goal.id,
      createdAt: goal.createdAt,
      updatedAt: new Date(),
    };

    this.goals.set(goalId, updated);
    this.logger.info('Goal updated', { goalId });
    return structuredClone(updated);
  }

  async delete(goalId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    if (goal.parentGoalId) {
      const parent = this.goals.get(goal.parentGoalId);
      if (parent) {
        parent.childGoalIds = parent.childGoalIds.filter((id) => id !== goalId);
        parent.updatedAt = new Date();
      }
    }

    this.goals.delete(goalId);
    this.logger.info('Goal deleted', { goalId });
  }

  async complete(goalId: string): Promise<Goal> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const updated: Goal = {
      ...goal,
      status: 'completed' as GoalStatus,
      progress: 100,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    this.goals.set(goalId, updated);
    this.logger.info('Goal completed', { goalId });
    return structuredClone(updated);
  }

  async addChildGoal(
    parentId: string,
    childGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'childGoalIds' | 'taskIds' | 'progress' | 'parentGoalId'>
  ): Promise<Goal> {
    const parent = this.goals.get(parentId);
    if (!parent) {
      throw new Error(`Parent goal not found: ${parentId}`);
    }

    const now = new Date();
    const created: Goal = {
      ...childGoal,
      id: generateId(),
      parentGoalId: parentId,
      childGoalIds: [],
      taskIds: [],
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.goals.set(created.id, created);
    parent.childGoalIds.push(created.id);
    parent.updatedAt = now;

    this.logger.info('Child goal created', { parentId, childGoalId: created.id });
    return structuredClone(created);
  }

  async addTask(goalId: string, taskId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    if (!goal.taskIds.includes(taskId)) {
      goal.taskIds.push(taskId);
      goal.updatedAt = new Date();
    }
  }

  async removeTask(goalId: string, taskId: string): Promise<void> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    goal.taskIds = goal.taskIds.filter((id) => id !== taskId);
    goal.updatedAt = new Date();
  }

  async getProgress(goalId: string): Promise<GoalProgress> {
    const goal = this.goals.get(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    let tasksCompleted = 0;
    const tasksTotal = goal.taskIds.length;
    const blockers: string[] = [];

    for (const taskId of goal.taskIds) {
      if (this.taskManager) {
        const task = await this.taskManager.get(taskId);
        if (task && task.status === 'completed') {
          tasksCompleted++;
        } else if (task && task.status === 'failed') {
          blockers.push(`Task ${taskId} failed`);
        }
      } else {
        blockers.push(`Task ${taskId} not resolved (no TaskManager)`);
      }
    }

    let subGoalsCompleted = 0;
    const subGoalsTotal = goal.childGoalIds.length;

    for (const childId of goal.childGoalIds) {
      const child = this.goals.get(childId);
      if (child) {
        if (child.status === 'completed') {
          subGoalsCompleted++;
        } else if (child.status === 'failed') {
          blockers.push(`Sub-goal ${childId} failed`);
        }
      }
    }

    const progress = this.calculateProgress(tasksCompleted, tasksTotal, subGoalsCompleted, subGoalsTotal);

    return {
      goalId,
      progress,
      tasksCompleted,
      tasksTotal,
      subGoalsCompleted,
      subGoalsTotal,
      blockers,
    };
  }

  private calculateProgress(
    tasksCompleted: number,
    tasksTotal: number,
    subGoalsCompleted: number,
    subGoalsTotal: number
  ): number {
    const totalItems = tasksTotal + subGoalsTotal;
    if (totalItems === 0) return 0;

    const completedItems = tasksCompleted + subGoalsCompleted;
    return Math.round((completedItems / totalItems) * 100);
  }
}
