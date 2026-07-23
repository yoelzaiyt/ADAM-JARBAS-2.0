import { describe, it, expect } from 'vitest';
import { RoadmapEngine } from '../roadmap-engine/RoadmapEngine.js';

describe('RoadmapEngine', () => {
  const engine = new RoadmapEngine();

  it('creates RoadmapEngine', () => {
    expect(engine).toBeDefined();
  });

  it('creates a roadmap', () => {
    const roadmap = engine.createRoadmap('Q1 2026', 'First quarter roadmap', new Date('2026-01-01'), new Date('2026-03-31'));
    expect(roadmap.name).toBe('Q1 2026');
    expect(roadmap.items).toEqual([]);
  });

  it('adds items to roadmap', () => {
    const roadmap = engine.createRoadmap('Q1 2026', 'Roadmap', new Date(), new Date());
    const item = engine.addItem(roadmap.id, {
      type: 'feature', title: 'Auth Module', description: 'Implement auth',
      priority: 'high', status: 'planned', estimatedEffort: 'medium', dependencies: [], tags: ['auth']
    });
    expect(item).toBeDefined();
    expect(item!.title).toBe('Auth Module');
  });

  it('returns null for invalid roadmap', () => {
    const item = engine.addItem('invalid', {
      type: 'feature', title: 'Test', description: 'Test',
      priority: 'medium', status: 'planned', estimatedEffort: 'easy', dependencies: [], tags: []
    });
    expect(item).toBeNull();
  });

  it('prioritizes items', () => {
    const roadmap = engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    engine.addItem(roadmap.id, { type: 'feature', title: 'Low', description: '', priority: 'low', status: 'planned', estimatedEffort: 'easy', dependencies: [], tags: [] });
    engine.addItem(roadmap.id, { type: 'feature', title: 'Critical', description: '', priority: 'critical', status: 'planned', estimatedEffort: 'medium', dependencies: [], tags: [] });
    engine.addItem(roadmap.id, { type: 'feature', title: 'High', description: '', priority: 'high', status: 'planned', estimatedEffort: 'hard', dependencies: [], tags: [] });
    const prioritized = engine.autoPrioritize(roadmap.id);
    expect(prioritized[0].priority).toBe('critical');
  });

  it('tracks dependencies', () => {
    const roadmap = engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    const item1 = engine.addItem(roadmap.id, { type: 'feature', title: 'A', description: '', priority: 'high', status: 'completed', estimatedEffort: 'easy', dependencies: [], tags: [] });
    const item2 = engine.addItem(roadmap.id, { type: 'feature', title: 'B', description: '', priority: 'high', status: 'planned', estimatedEffort: 'easy', dependencies: [item1!.id], tags: [] });
    const deps = engine.getDependencies(roadmap.id);
    expect(deps.edges.length).toBe(1);
    expect(deps.edges[0].from).toBe(item1!.id);
  });

  it('gets blocked items', () => {
    const roadmap = engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    const item1 = engine.addItem(roadmap.id, { type: 'feature', title: 'A', description: '', priority: 'high', status: 'planned', estimatedEffort: 'easy', dependencies: [], tags: [] });
    engine.addItem(roadmap.id, { type: 'feature', title: 'B', description: '', priority: 'high', status: 'planned', estimatedEffort: 'easy', dependencies: [item1!.id], tags: [] });
    const blocked = engine.getBlockedItems(roadmap.id);
    expect(blocked.length).toBe(1);
  });

  it('gets ready items', () => {
    const roadmap = engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    const item1 = engine.addItem(roadmap.id, { type: 'feature', title: 'A', description: '', priority: 'high', status: 'completed', estimatedEffort: 'easy', dependencies: [], tags: [] });
    engine.addItem(roadmap.id, { type: 'feature', title: 'B', description: '', priority: 'high', status: 'planned', estimatedEffort: 'easy', dependencies: [item1!.id], tags: [] });
    const ready = engine.getReadyItems(roadmap.id);
    expect(ready.length).toBe(1);
  });

  it('calculates progress', () => {
    const roadmap = engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    engine.addItem(roadmap.id, { type: 'feature', title: 'A', description: '', priority: 'high', status: 'completed', estimatedEffort: 'easy', dependencies: [], tags: [] });
    engine.addItem(roadmap.id, { type: 'feature', title: 'B', description: '', priority: 'high', status: 'planned', estimatedEffort: 'easy', dependencies: [], tags: [] });
    const progress = engine.getProgress(roadmap.id);
    expect(progress!.total).toBe(2);
    expect(progress!.completed).toBe(1);
    expect(progress!.percentage).toBe(50);
  });

  it('updates item status', () => {
    const roadmap = engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    const item = engine.addItem(roadmap.id, { type: 'feature', title: 'A', description: '', priority: 'high', status: 'planned', estimatedEffort: 'easy', dependencies: [], tags: [] });
    const updated = engine.updateItemStatus(roadmap.id, item!.id, 'in-progress');
    expect(updated).toBe(true);
  });

  it('gets all roadmaps', () => {
    engine.createRoadmap('Q1', 'Roadmap', new Date(), new Date());
    engine.createRoadmap('Q2', 'Roadmap', new Date(), new Date());
    expect(engine.getAll().length).toBeGreaterThanOrEqual(2);
  });
});
