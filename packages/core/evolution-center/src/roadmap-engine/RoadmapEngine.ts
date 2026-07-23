import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Roadmap, RoadmapItem, InitiativeType, Severity } from '../interfaces.js';

export class RoadmapEngine {
  private roadmaps: Map<string, Roadmap> = new Map();
  private log = createLogger('RoadmapEngine');

  createRoadmap(name: string, description: string, startDate: Date, endDate: Date): Roadmap {
    const roadmap: Roadmap = {
      id: generateId(),
      name,
      description,
      items: [],
      startDate,
      endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.roadmaps.set(roadmap.id, roadmap);
    this.log(`Created roadmap: ${name}`);
    return roadmap;
  }

  addItem(roadmapId: string, item: Omit<RoadmapItem, 'id' | 'createdAt' | 'updatedAt'>): RoadmapItem | null {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return null;

    const newItem: RoadmapItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    roadmap.items.push(newItem);
    roadmap.updatedAt = new Date();
    this.log(`Added item to roadmap: ${newItem.title}`);
    return newItem;
  }

  autoPrioritize(roadmapId: string): RoadmapItem[] {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return [];

    const priorityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const effortOrder: Record<string, number> = { trivial: 1, easy: 2, medium: 3, hard: 4, epic: 5 };

    roadmap.items.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      const effortDiff = (effortOrder[a.estimatedEffort] || 3) - (effortOrder[b.estimatedEffort] || 3);
      if (effortDiff !== 0) return effortDiff;
      return b.dependencies.length - a.dependencies.length;
    });

    roadmap.updatedAt = new Date();
    return roadmap.items;
  }

  getDependencies(roadmapId: string): DependencyGraph {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return { nodes: [], edges: [] };

    const nodes = roadmap.items.map(item => ({ id: item.id, label: item.title, type: item.type }));
    const edges: Array<{ from: string; to: string }> = [];

    for (const item of roadmap.items) {
      for (const depId of item.dependencies) {
        edges.push({ from: depId, to: item.id });
      }
    }

    return { nodes, edges };
  }

  getBlockedItems(roadmapId: string): RoadmapItem[] {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return [];

    const completedIds = new Set(
      roadmap.items.filter(i => i.status === 'completed').map(i => i.id)
    );

    return roadmap.items.filter(item =>
      item.status !== 'completed' &&
      item.dependencies.some(depId => !completedIds.has(depId))
    );
  }

  getReadyItems(roadmapId: string): RoadmapItem[] {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return [];

    const completedIds = new Set(
      roadmap.items.filter(i => i.status === 'completed').map(i => i.id)
    );

    return roadmap.items.filter(item =>
      item.status === 'planned' &&
      item.dependencies.every(depId => completedIds.has(depId))
    );
  }

  getProgress(roadmapId: string): RoadmapProgress | null {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return null;

    const total = roadmap.items.length;
    const completed = roadmap.items.filter(i => i.status === 'completed').length;
    const inProgress = roadmap.items.filter(i => i.status === 'in-progress').length;
    const blocked = this.getBlockedItems(roadmapId).length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      planned: total - completed - inProgress - blocked,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  }

  getById(id: string): Roadmap | undefined {
    return this.roadmaps.get(id);
  }

  getAll(): Roadmap[] {
    return Array.from(this.roadmaps.values());
  }

  updateItemStatus(roadmapId: string, itemId: string, status: RoadmapItem['status']): boolean {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return false;

    const item = roadmap.items.find(i => i.id === itemId);
    if (!item) return false;

    item.status = status;
    item.updatedAt = new Date();
    if (status === 'completed') item.completedAt = new Date();
    roadmap.updatedAt = new Date();
    return true;
  }

  getByType(roadmapId: string, type: InitiativeType): RoadmapItem[] {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return [];
    return roadmap.items.filter(i => i.type === type);
  }

  getByPriority(roadmapId: string, priority: Severity): RoadmapItem[] {
    const roadmap = this.roadmaps.get(roadmapId);
    if (!roadmap) return [];
    return roadmap.items.filter(i => i.priority === priority);
  }
}

export interface DependencyGraph {
  nodes: Array<{ id: string; label: string; type: string }>;
  edges: Array<{ from: string; to: string }>;
}

export interface RoadmapProgress {
  total: number;
  completed: number;
  inProgress: number;
  blocked: number;
  planned: number;
  percentage: number;
}
