import { describe, it, expect } from 'vitest';
import { PlannerEngine } from '../PlannerEngine.js';
import type { PlanGoal } from '../interfaces.js';

function makeGoal(overrides?: Partial<PlanGoal>): PlanGoal {
  return {
    id: 'goal-1',
    description: 'test goal',
    successCriteria: ['criteria1'],
    priority: 'medium',
    ...overrides,
  };
}

describe('PlannerEngine', () => {
  const engine = new PlannerEngine();

  describe('createPlan', () => {
    it('creates a plan with draft status and correct steps', async () => {
      const goal = makeGoal();
      const plan = await engine.createPlan(goal);

      expect(plan.status).toBe('draft');
      expect(plan.goal).toEqual(goal);
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.id).toBeDefined();
      expect(plan.createdAt).toBeInstanceOf(Date);
      expect(plan.updatedAt).toBeInstanceOf(Date);
    });

    it('passes context to plan', async () => {
      const goal = makeGoal();
      const context = { foo: 'bar', num: 42 };
      const plan = await engine.createPlan(goal, context);

      expect(plan.context).toEqual(context);
    });

    it('produces research steps for research keywords', async () => {
      const goal = makeGoal({ description: 'research the topic' });
      const plan = await engine.createPlan(goal);

      const names = plan.steps.map((s) => s.name);
      expect(names).toContain('Research');
      expect(names).toContain('Validate');
      expect(names).toContain('Summarize');
    });

    it('produces creation steps for write keywords', async () => {
      const goal = makeGoal({ description: 'write a report' });
      const plan = await engine.createPlan(goal);

      const names = plan.steps.map((s) => s.name);
      expect(names).toContain('Create');
      expect(names).toContain('Validate');
    });
  });

  describe('getPlan', () => {
    it('returns plan by id', async () => {
      const plan = await engine.createPlan(makeGoal());
      const fetched = await engine.getPlan(plan.id);

      expect(fetched).not.toBeNull();
      expect(fetched!.id).toBe(plan.id);
    });

    it('returns null for nonexistent id', async () => {
      const result = await engine.getPlan('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('listPlans', () => {
    it('returns all plans', async () => {
      const engine2 = new PlannerEngine();
      await engine2.createPlan(makeGoal({ description: 'plan a' }));
      await engine2.createPlan(makeGoal({ description: 'plan b' }));

      const all = await engine2.listPlans();
      expect(all.length).toBe(2);
    });

    it('filters by status', async () => {
      const engine2 = new PlannerEngine();
      const plan = await engine2.createPlan(makeGoal());
      await engine2.cancelPlan(plan.id);
      await engine2.createPlan(makeGoal({ description: 'another' }));

      const cancelled = await engine2.listPlans('cancelled');
      expect(cancelled.length).toBe(1);
      expect(cancelled[0].id).toBe(plan.id);

      const draft = await engine2.listPlans('draft');
      expect(draft.length).toBe(1);
    });
  });

  describe('cancelPlan', () => {
    it('sets status to cancelled', async () => {
      const engine2 = new PlannerEngine();
      const plan = await engine2.createPlan(makeGoal());
      await engine2.cancelPlan(plan.id);

      const fetched = await engine2.getPlan(plan.id);
      expect(fetched!.status).toBe('cancelled');
    });

    it('throws for nonexistent plan', async () => {
      await expect(engine.cancelPlan('nonexistent')).rejects.toThrow('Plan not found');
    });
  });

  describe('decomposeGoal', () => {
    it('returns PlanStep[] for a string goal', async () => {
      const steps = await engine.decomposeGoal('analyze data');
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toHaveProperty('id');
      expect(steps[0]).toHaveProperty('name');
      expect(steps[0]).toHaveProperty('type');
    });
  });

  describe('updatePlan', () => {
    it('updates plan fields', async () => {
      const engine2 = new PlannerEngine();
      const plan = await engine2.createPlan(makeGoal());
      const updated = await engine2.updatePlan(plan.id, { status: 'active' });

      expect(updated.status).toBe('active');
      expect(updated.id).toBe(plan.id);
      expect(updated.createdAt).toEqual(plan.createdAt);
    });
  });
});
