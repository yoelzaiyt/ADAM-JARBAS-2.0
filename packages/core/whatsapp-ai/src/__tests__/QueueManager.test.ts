import { describe, it, expect, beforeEach } from 'vitest';
import { QueueManager } from '../QueueManager.js';

describe('QueueManager', () => {
  let queue: QueueManager;

  beforeEach(() => {
    queue = new QueueManager();
  });

  it('enqueues item', async () => {
    const item = await queue.enqueue({
      type: 'message', payload: {}, priority: 'normal', maxAttempts: 3,
    });
    expect(item.id).toBeDefined();
    expect(item.status).toBe('pending');
  });

  it('dequeues in priority order', async () => {
    await queue.enqueue({ type: 'low', payload: {}, priority: 'low', maxAttempts: 3 });
    await queue.enqueue({ type: 'high', payload: {}, priority: 'high', maxAttempts: 3 });
    const item = queue.dequeue();
    expect(item?.type).toBe('high');
  });

  it('complete marks done', async () => {
    const item = await queue.enqueue({ type: 'a', payload: {}, priority: 'normal', maxAttempts: 3 });
    await queue.complete(item.id);
    expect(queue.getStats().completed).toBe(1);
  });

  it('fail moves to dead letter after max attempts', async () => {
    const item = await queue.enqueue({ type: 'a', payload: {}, priority: 'normal', maxAttempts: 1 });
    await queue.fail(item.id, 'error');
    expect(queue.getDeadLetter().length).toBe(1);
  });

  it('retry resets item', async () => {
    const item = await queue.enqueue({ type: 'a', payload: {}, priority: 'normal', maxAttempts: 1 });
    await queue.fail(item.id, 'err');
    await queue.retry(item.id);
    const dequeued = queue.dequeue();
    expect(dequeued?.id).toBe(item.id);
  });

  it('getStats returns counts', async () => {
    await queue.enqueue({ type: 'a', payload: {}, priority: 'normal', maxAttempts: 3 });
    const stats = queue.getStats();
    expect(stats.pending).toBe(1);
  });
});
