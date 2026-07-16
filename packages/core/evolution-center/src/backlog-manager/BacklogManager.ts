import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { BacklogItem, BacklogType, Sprint, Severity } from '../interfaces.js';

export class BacklogManager {
  private items: Map<string, BacklogItem> = new Map();
  private sprints: Map<string, Sprint> = new Map();
  private log = createLogger('BacklogManager');

  createItem(item: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>): BacklogItem {
    const newItem: BacklogItem = {
      ...item,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.items.set(newItem.id, newItem);
    this.log(`Created backlog item: ${newItem.title}`);
    return newItem;
  }

  createSprint(name: string, goal: string, startDate: Date, endDate: Date): Sprint {
    const sprint: Sprint = {
      id: generateId(),
      name,
      startDate,
      endDate,
      items: [],
      status: 'planned',
      goal
    };
    this.sprints.set(sprint.id, sprint);
    this.log(`Created sprint: ${name}`);
    return sprint;
  }

  addToSprint(itemId: string, sprintId: string): boolean {
    const item = this.items.get(itemId);
    const sprint = this.sprints.get(sprintId);
    if (!item || !sprint) return false;

    if (!sprint.items.includes(itemId)) {
      sprint.items.push(itemId);
      item.sprintId = sprintId;
      item.status = 'todo';
      item.updatedAt = new Date();
      this.log(`Added ${item.title} to sprint ${sprint.name}`);
    }
    return true;
  }

  removeFromSprint(itemId: string, sprintId: string): boolean {
    const sprint = this.sprints.get(sprintId);
    if (!sprint) return false;

    const idx = sprint.items.indexOf(itemId);
    if (idx === -1) return false;

    sprint.items.splice(idx, 1);
    const item = this.items.get(itemId);
    if (item) {
      item.sprintId = undefined;
      item.updatedAt = new Date();
    }
    return true;
  }

  updateItemStatus(itemId: string, status: BacklogItem['status']): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;
    item.status = status;
    item.updatedAt = new Date();
    return true;
  }

  prioritizeIcebox(): BacklogItem[] {
    const icebox = this.getItemsByType('icebox');
    const priorityOrder: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return icebox.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  getTechnicalDebt(): BacklogItem[] {
    return this.getItemsByType('technical-debt');
  }

  getArchitectureItems(): BacklogItem[] {
    return this.getItemsByType('architecture');
  }

  getResearchItems(): BacklogItem[] {
    return this.getItemsByType('research');
  }

  getSpikeItems(): BacklogItem[] {
    return this.getItemsByType('spike');
  }

  getAll(): BacklogItem[] {
    return Array.from(this.items.values());
  }

  getById(id: string): BacklogItem | undefined {
    return this.items.get(id);
  }

  getItemsByType(type: BacklogType): BacklogItem[] {
    return Array.from(this.items.values()).filter(i => i.type === type);
  }

  getItemsByPriority(priority: Severity): BacklogItem[] {
    return Array.from(this.items.values()).filter(i => i.priority === priority);
  }

  getItemsByStatus(status: BacklogItem['status']): BacklogItem[] {
    return Array.from(this.items.values()).filter(i => i.status === status);
  }

  getSprintById(id: string): Sprint | undefined {
    return this.sprints.get(id);
  }

  getAllSprints(): Sprint[] {
    return Array.from(this.sprints.values());
  }

  getActiveSprint(): Sprint | undefined {
    return Array.from(this.sprints.values()).find(s => s.status === 'active');
  }

  startSprint(sprintId: string): boolean {
    const sprint = this.sprints.get(sprintId);
    if (!sprint) return false;
    sprint.status = 'active';
    return true;
  }

  completeSprint(sprintId: string): boolean {
    const sprint = this.sprints.get(sprintId);
    if (!sprint) return false;
    sprint.status = 'completed';
    for (const itemId of sprint.items) {
      const item = this.items.get(itemId);
      if (item && item.status !== 'done') {
        item.status = 'todo';
        item.sprintId = undefined;
        item.updatedAt = new Date();
      }
    }
    return true;
  }

  getStats(): BacklogStats {
    const all = Array.from(this.items.values());
    return {
      total: all.length,
      byType: this.groupBy(all, 'type'),
      byPriority: this.groupBy(all, 'priority'),
      byStatus: this.groupBy(all, 'status'),
      totalStoryPoints: all.reduce((sum, i) => sum + (i.storyPoints || 0), 0)
    };
  }

  private groupBy(items: BacklogItem[], field: keyof BacklogItem): Record<string, number> {
    return items.reduce((acc, i) => {
      const key = String(i[field]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export interface BacklogStats {
  total: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  totalStoryPoints: number;
}
