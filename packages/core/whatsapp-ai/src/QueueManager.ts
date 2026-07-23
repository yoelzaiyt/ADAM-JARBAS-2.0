import { randomUUID } from 'node:crypto';
import type {
  QueueManager as IQueueManager,
  QueueItem,
  QueuePriority,
} from './interfaces.js';

export class QueueManager implements IQueueManager {
  private items: Map<string, QueueItem> = new Map();

  async enqueue(item: Omit<QueueItem, 'id' | 'attempts' | 'createdAt' | 'status'>): Promise<QueueItem> {
    const id = randomUUID();
    const full: QueueItem = {
      ...item, id, attempts: 0, status: 'pending', createdAt: new Date(),
    };
    this.items.set(id, full);
    return full;
  }

  dequeue(): QueueItem | null {
    const pending = Array.from(this.items.values())
      .filter(i => i.status === 'pending')
      .sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority));
    const item = pending[0] ?? null;
    if (item) item.status = 'processing';
    return item;
  }

  async complete(itemId: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item not found: ${itemId}`);
    item.status = 'completed';
    item.processedAt = new Date();
  }

  async fail(itemId: string, error: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item not found: ${itemId}`);
    item.attempts++;
    if (item.attempts >= item.maxAttempts) {
      item.status = 'dead_letter';
    } else {
      item.status = 'failed';
      item.error = error;
    }
  }

  getDeadLetter(): QueueItem[] {
    return Array.from(this.items.values()).filter(i => i.status === 'dead_letter');
  }

  async retry(itemId: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item not found: ${itemId}`);
    item.status = 'pending';
    item.attempts = 0;
  }

  getStats() {
    const items = Array.from(this.items.values());
    return {
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
      deadLetter: items.filter(i => i.status === 'dead_letter').length,
    };
  }

  size(): number {
    return this.items.size;
  }

  private priorityWeight(p: QueuePriority): number {
    const weights: Record<QueuePriority, number> = { low: 1, normal: 2, high: 3, critical: 4 };
    return weights[p] ?? 2;
  }
}
