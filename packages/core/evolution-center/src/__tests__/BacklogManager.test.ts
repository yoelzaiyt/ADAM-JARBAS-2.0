import { describe, it, expect } from 'vitest';
import { BacklogManager } from '../backlog-manager/BacklogManager.js';

describe('BacklogManager', () => {
  const manager = new BacklogManager();

  it('creates BacklogManager', () => {
    expect(manager).toBeDefined();
  });

  it('creates backlog item', () => {
    const item = manager.createItem({ type: 'product', title: 'Auth', description: 'Auth module', priority: 'high', status: 'todo', labels: ['auth'] });
    expect(item.title).toBe('Auth');
    expect(item.type).toBe('product');
  });

  it('creates sprint', () => {
    const sprint = manager.createSprint('Sprint 1', 'Build auth', new Date(), new Date());
    expect(sprint.name).toBe('Sprint 1');
  });

  it('adds item to sprint', () => {
    const item = manager.createItem({ type: 'product', title: 'Auth', description: '', priority: 'high', status: 'todo', labels: [] });
    const sprint = manager.createSprint('Sprint 1', 'Goal', new Date(), new Date());
    const added = manager.addToSprint(item.id, sprint.id);
    expect(added).toBe(true);
    expect(manager.getSprintById(sprint.id)!.items.length).toBe(1);
  });

  it('removes item from sprint', () => {
    const item = manager.createItem({ type: 'product', title: 'Auth', description: '', priority: 'high', status: 'todo', labels: [] });
    const sprint = manager.createSprint('Sprint 1', 'Goal', new Date(), new Date());
    manager.addToSprint(item.id, sprint.id);
    const removed = manager.removeFromSprint(item.id, sprint.id);
    expect(removed).toBe(true);
    expect(manager.getSprintById(sprint.id)!.items.length).toBe(0);
  });

  it('updates item status', () => {
    const item = manager.createItem({ type: 'product', title: 'Auth', description: '', priority: 'high', status: 'todo', labels: [] });
    const updated = manager.updateItemStatus(item.id, 'done');
    expect(updated).toBe(true);
  });

  it('prioritizes icebox', () => {
    manager.createItem({ type: 'icebox', title: 'Low', description: '', priority: 'low', status: 'todo', labels: [] });
    manager.createItem({ type: 'icebox', title: 'High', description: '', priority: 'high', status: 'todo', labels: [] });
    const prioritized = manager.prioritizeIcebox();
    expect(prioritized[0].priority).toBe('high');
  });

  it('gets technical debt', () => {
    manager.createItem({ type: 'technical-debt', title: 'Refactor', description: '', priority: 'medium', status: 'todo', labels: [] });
    const debt = manager.getTechnicalDebt();
    expect(debt.length).toBeGreaterThan(0);
  });

  it('starts sprint', () => {
    const sprint = manager.createSprint('Sprint 1', 'Goal', new Date(), new Date());
    manager.startSprint(sprint.id);
    expect(manager.getActiveSprint()!.id).toBe(sprint.id);
  });

  it('gets stats', () => {
    manager.createItem({ type: 'product', title: 'A', description: '', priority: 'high', status: 'todo', labels: [], storyPoints: 5 });
    const stats = manager.getStats();
    expect(stats.total).toBeGreaterThan(0);
  });
});
