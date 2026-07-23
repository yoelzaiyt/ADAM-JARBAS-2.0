import { describe, it, expect } from 'vitest';
import { GoalManager } from '../GoalManager.js';
import type { Goal, GoalStatus, Logger } from '../interfaces.js';

const logger: Logger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
};

function makeGoalInput(overrides?: Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'childGoalIds' | 'taskIds' | 'progress'>>) {
  return {
    title: 'Test Goal',
    description: 'A test goal',
    status: 'active' as GoalStatus,
    priority: 'medium' as const,
    tenantId: 't1',
    userId: 'u1',
    successCriteria: ['done'],
    metadata: {},
    ...overrides,
  };
}

describe('GoalManager', () => {
  describe('create', () => {
    it('creates a goal with generated id', async () => {
      const manager = new GoalManager(logger);
      const goal = await manager.create(makeGoalInput());

      expect(goal.id).toBeDefined();
      expect(goal.title).toBe('Test Goal');
      expect(goal.childGoalIds).toEqual([]);
      expect(goal.taskIds).toEqual([]);
      expect(goal.progress).toBe(0);
      expect(goal.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('get', () => {
    it('returns goal by id', async () => {
      const manager = new GoalManager(logger);
      const created = await manager.create(makeGoalInput());
      const fetched = await manager.get(created.id);

      expect(fetched).not.toBeNull();
      expect(fetched!.id).toBe(created.id);
    });

    it('returns null for nonexistent id', async () => {
      const manager = new GoalManager(logger);
      const result = await manager.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('list', () => {
    it('returns all goals', async () => {
      const manager = new GoalManager(logger);
      await manager.create(makeGoalInput({ title: 'g1' }));
      await manager.create(makeGoalInput({ title: 'g2' }));

      const all = await manager.list();
      expect(all.length).toBe(2);
    });

    it('filters by status', async () => {
      const manager = new GoalManager(logger);
      await manager.create(makeGoalInput({ title: 'active1', status: 'active' }));
      await manager.create(makeGoalInput({ title: 'active2', status: 'active' }));
      await manager.create(makeGoalInput({ title: 'failed1', status: 'failed' }));

      const active = await manager.list({ status: 'active' });
      expect(active.length).toBe(2);

      const failed = await manager.list({ status: 'failed' });
      expect(failed.length).toBe(1);
    });

    it('filters by tenantId', async () => {
      const manager = new GoalManager(logger);
      await manager.create(makeGoalInput({ tenantId: 't1' }));
      await manager.create(makeGoalInput({ tenantId: 't2' }));

      const t1Goals = await manager.list({ tenantId: 't1' });
      expect(t1Goals.length).toBe(1);
      expect(t1Goals[0].tenantId).toBe('t1');
    });

    it('filters by userId', async () => {
      const manager = new GoalManager(logger);
      await manager.create(makeGoalInput({ userId: 'u1' }));
      await manager.create(makeGoalInput({ userId: 'u2' }));

      const u2Goals = await manager.list({ userId: 'u2' });
      expect(u2Goals.length).toBe(1);
      expect(u2Goals[0].userId).toBe('u2');
    });
  });

  describe('update', () => {
    it('updates goal fields', async () => {
      const manager = new GoalManager(logger);
      const goal = await manager.create(makeGoalInput());
      const updated = await manager.update(goal.id, { title: 'Updated Title' });

      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(goal.id);
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(goal.updatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('removes goal', async () => {
      const manager = new GoalManager(logger);
      const goal = await manager.create(makeGoalInput());
      await manager.delete(goal.id);

      const result = await manager.get(goal.id);
      expect(result).toBeNull();
    });
  });

  describe('complete', () => {
    it('sets status to completed', async () => {
      const manager = new GoalManager(logger);
      const goal = await manager.create(makeGoalInput());
      const completed = await manager.complete(goal.id);

      expect(completed.status).toBe('completed');
      expect(completed.progress).toBe(100);
      expect(completed.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('addChildGoal', () => {
    it('creates child and updates parent', async () => {
      const manager = new GoalManager(logger);
      const parent = await manager.create(makeGoalInput());

      const child = await manager.addChildGoal(parent.id, makeGoalInput({ title: 'Child Goal' }));

      expect(child.parentGoalId).toBe(parent.id);
      expect(child.childGoalIds).toEqual([]);

      const updatedParent = await manager.get(parent.id);
      expect(updatedParent!.childGoalIds).toContain(child.id);
    });
  });

  describe('addTask / removeTask', () => {
    it('manages taskIds', async () => {
      const manager = new GoalManager(logger);
      const goal = await manager.create(makeGoalInput());

      await manager.addTask(goal.id, 'task-1');
      await manager.addTask(goal.id, 'task-2');

      let fetched = await manager.get(goal.id);
      expect(fetched!.taskIds).toEqual(['task-1', 'task-2']);

      await manager.removeTask(goal.id, 'task-1');
      fetched = await manager.get(goal.id);
      expect(fetched!.taskIds).toEqual(['task-2']);
    });
  });

  describe('getProgress', () => {
    it('calculates progress correctly', async () => {
      const manager = new GoalManager(logger);
      const goal = await manager.create(makeGoalInput());

      const child1 = await manager.addChildGoal(goal.id, makeGoalInput({ title: 'c1' }));
      await manager.addChildGoal(goal.id, makeGoalInput({ title: 'c2' }));

      await manager.complete(child1.id);

      const progress = await manager.getProgress(goal.id);

      expect(progress.goalId).toBe(goal.id);
      expect(progress.subGoalsTotal).toBe(2);
      expect(progress.subGoalsCompleted).toBe(1);
      expect(progress.progress).toBe(50);
      expect(progress.tasksTotal).toBe(0);
      expect(progress.tasksCompleted).toBe(0);
      expect(progress.blockers).toEqual([]);
    });
  });
});
