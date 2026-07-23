import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Bug, BugPriority, BugStatus } from '../interfaces.js';

export class BugCenter {
  private bugs: Map<string, Bug> = new Map();
  private log = createLogger('BugCenter');

  createBug(bug: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>): Bug {
    const newBug: Bug = {
      ...bug,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.bugs.set(newBug.id, newBug);
    this.log(`Created bug: ${newBug.title} [${newBug.priority}]`);
    return newBug;
  }

  updateStatus(id: string, status: BugStatus): boolean {
    const bug = this.bugs.get(id);
    if (!bug) return false;
    bug.status = status;
    bug.updatedAt = new Date();
    if (status === 'resolved') bug.resolvedAt = new Date();
    return true;
  }

  assign(id: string, assignee: string): boolean {
    const bug = this.bugs.get(id);
    if (!bug) return false;
    bug.assignee = assignee;
    bug.updatedAt = new Date();
    return true;
  }

  getById(id: string): Bug | undefined {
    return this.bugs.get(id);
  }

  getAll(): Bug[] {
    return Array.from(this.bugs.values());
  }

  getByPriority(priority: BugPriority): Bug[] {
    return Array.from(this.bugs.values()).filter(b => b.priority === priority);
  }

  getByStatus(status: BugStatus): Bug[] {
    return Array.from(this.bugs.values()).filter(b => b.status === status);
  }

  getByModule(module: string): Bug[] {
    return Array.from(this.bugs.values()).filter(b => b.module === module);
  }

  getCriticalBugs(): Bug[] {
    return this.getByPriority('critical').filter(b => b.status !== 'resolved' && b.status !== 'closed');
  }

  getStats(): BugStats {
    const all = Array.from(this.bugs.values());
    const open = all.filter(b => b.status !== 'resolved' && b.status !== 'closed');
    const mttr = this.calculateMTTR(all);
    return {
      total: all.length,
      open: open.length,
      byPriority: this.groupBy(all, 'priority'),
      byStatus: this.groupBy(all, 'status'),
      byModule: this.groupBy(all, 'module'),
      mttr
    };
  }

  private groupBy(items: Bug[], field: keyof Bug): Record<string, number> {
    return items.reduce((acc, i) => {
      const key = String(i[field] || 'unknown');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateMTTR(bugs: Bug[]): number {
    const resolved = bugs.filter(b => b.resolvedAt);
    if (resolved.length === 0) return 0;
    const totalMs = resolved.reduce((sum, b) => sum + (b.resolvedAt!.getTime() - b.createdAt.getTime()), 0);
    return totalMs / resolved.length / (1000 * 60 * 60);
  }
}

export interface BugStats {
  total: number;
  open: number;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  byModule: Record<string, number>;
  mttr: number;
}
