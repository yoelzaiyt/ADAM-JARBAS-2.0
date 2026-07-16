import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { RollbackAction, RollbackTrigger } from '../interfaces.js';

export class RollbackManager {
  private actions: Map<string, RollbackAction> = new Map();
  private log = createLogger('RollbackManager');

  initiateRollback(action: Omit<RollbackAction, 'id' | 'status' | 'initiatedAt'>): RollbackAction {
    const newAction: RollbackAction = {
      ...action,
      id: generateId(),
      status: 'pending',
      initiatedAt: new Date()
    };
    this.actions.set(newAction.id, newAction);
    this.log(`Rollback initiated: ${newAction.releaseId} -> ${newAction.targetVersion}`);
    return newAction;
  }

  execute(id: string): boolean {
    const action = this.actions.get(id);
    if (!action) return false;
    action.status = 'in-progress';
    return true;
  }

  complete(id: string): boolean {
    const action = this.actions.get(id);
    if (!action) return false;
    action.status = 'completed';
    action.completedAt = new Date();
    return true;
  }

  fail(id: string): boolean {
    const action = this.actions.get(id);
    if (!action) return false;
    action.status = 'failed';
    return true;
  }

  detectTriggers(metrics: { errorRate: number; crashRate: number; latency: number }): RollbackTrigger[] {
    const triggers: RollbackTrigger[] = [];
    if (metrics.errorRate > 10) {
      triggers.push({ id: generateId(), type: 'error-rate', threshold: 10, current: metrics.errorRate, triggered: true });
    }
    if (metrics.crashRate > 5) {
      triggers.push({ id: generateId(), type: 'crash', threshold: 5, current: metrics.crashRate, triggered: true });
    }
    if (metrics.latency > 5000) {
      triggers.push({ id: generateId(), type: 'latency', threshold: 5000, current: metrics.latency, triggered: true });
    }
    return triggers;
  }

  shouldRollback(triggers: RollbackTrigger[]): boolean {
    return triggers.some(t => t.triggered);
  }

  getById(id: string): RollbackAction | undefined {
    return this.actions.get(id);
  }

  getAll(): RollbackAction[] {
    return Array.from(this.actions.values());
  }

  getCompleted(): RollbackAction[] {
    return Array.from(this.actions.values()).filter(a => a.status === 'completed');
  }

  getPending(): RollbackAction[] {
    return Array.from(this.actions.values()).filter(a => a.status === 'pending' || a.status === 'in-progress');
  }

  getStats(): { total: number; byStatus: Record<string, number> } {
    const all = Array.from(this.actions.values());
    return {
      total: all.length,
      byStatus: all.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }
}
