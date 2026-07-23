import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { AuditEntry } from '../interfaces.js';

export class Audit {
  private entries: Map<string, AuditEntry> = new Map();
  private log = createLogger('Audit');

  record(action: string, actor: string, target: string, details: Record<string, unknown>, result: AuditEntry['result'] = 'success'): AuditEntry {
    const entry: AuditEntry = {
      id: generateId(),
      action,
      actor,
      target,
      details,
      result,
      timestamp: new Date(),
      immutable: true
    };
    this.entries.set(entry.id, entry);
    this.log(`Audit: ${actor} ${action} on ${target} [${result}]`);
    return entry;
  }

  getAll(): AuditEntry[] {
    return Array.from(this.entries.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getByActor(actor: string): AuditEntry[] {
    return this.getAll().filter(e => e.actor === actor);
  }

  getByTarget(target: string): AuditEntry[] {
    return this.getAll().filter(e => e.target === target);
  }

  getByAction(action: string): AuditEntry[] {
    return this.getAll().filter(e => e.action === action);
  }

  getRecent(hours: number = 24): AuditEntry[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getAll().filter(e => e.timestamp >= cutoff);
  }

  getStats(): { total: number; byAction: Record<string, number>; byResult: Record<string, number> } {
    const all = Array.from(this.entries.values());
    return {
      total: all.length,
      byAction: all.reduce((acc, e) => { acc[e.action] = (acc[e.action] || 0) + 1; return acc; }, {} as Record<string, number>),
      byResult: all.reduce((acc, e) => { acc[e.result] = (acc[e.result] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }

  exportEntries(): AuditEntry[] {
    return this.getAll();
  }
}
