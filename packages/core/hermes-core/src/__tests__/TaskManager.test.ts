import { describe, it, expect, vi } from 'vitest';
import { TaskManager } from '../TaskManager.js';
import type { Logger } from '../interfaces.js';

function makeLogger(): Logger {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
}

function baseTask(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Test Task',
    description: 'desc',
    status: 'pending' as const,
    priority: 'medium' as const,
    tenantId: 't1',
    userId: 'u1',
    type: 'ai-call' as const,
    inputs: {},
    dependencies: [],
    metadata: {},
    ...overrides,
  };
}

describe('TaskManager', () => {
  it('create: creates a task with generated id, retryCount=0, maxRetries=3', async () => {
    const tm = new TaskManager(makeLogger());
    const task = await tm.create(baseTask());
    expect(task.id).toBeTruthy();
    expect(typeof task.id).toBe('string');
    expect(task.retryCount).toBe(0);
    expect(task.maxRetries).toBe(3);
    expect(task.name).toBe('Test Task');
    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.updatedAt).toBeInstanceOf(Date);
  });

  it('get: returns task by id', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const fetched = await tm.get(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(created.id);
    expect(fetched!.name).toBe(created.name);
  });

  it('get: returns null if not found', async () => {
    const tm = new TaskManager(makeLogger());
    expect(await tm.get('nonexistent')).toBeNull();
  });

  it('list: returns all tasks', async () => {
    const tm = new TaskManager(makeLogger());
    await tm.create(baseTask());
    await tm.create(baseTask({ name: 'Task 2' }));
    const all = await tm.list();
    expect(all).toHaveLength(2);
  });

  it('list: filters by status', async () => {
    const tm = new TaskManager(makeLogger());
    const t1 = await tm.create(baseTask({ status: 'pending' }));
    const t2 = await tm.create(baseTask({ name: 'Running', status: 'running' }));
    const pending = await tm.list({ status: 'pending' });
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe(t1.id);
  });

  it('list: filters by goalId', async () => {
    const tm = new TaskManager(makeLogger());
    await tm.create(baseTask({ goalId: 'g1' }));
    await tm.create(baseTask({ name: 'No goal' }));
    const filtered = await tm.list({ goalId: 'g1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].goalId).toBe('g1');
  });

  it('list: filters by tenantId', async () => {
    const tm = new TaskManager(makeLogger());
    await tm.create(baseTask({ tenantId: 't1' }));
    await tm.create(baseTask({ name: 'Other', tenantId: 't2' }));
    const filtered = await tm.list({ tenantId: 't1' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].tenantId).toBe('t1');
  });

  it('update: updates task fields', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const updated = await tm.update(created.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toEqual(created.createdAt);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
  });

  it('update: throws for nonexistent task', async () => {
    const tm = new TaskManager(makeLogger());
    await expect(tm.update('nope', { name: 'x' })).rejects.toThrow('Task not found');
  });

  it('delete: removes task', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    await tm.delete(created.id);
    expect(await tm.get(created.id)).toBeNull();
  });

  it('delete: throws for nonexistent task', async () => {
    const tm = new TaskManager(makeLogger());
    await expect(tm.delete('nope')).rejects.toThrow('Task not found');
  });

  it('start: sets status to running', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const started = await tm.start(created.id);
    expect(started.status).toBe('running');
    expect(started.startedAt).toBeInstanceOf(Date);
  });

  it('complete: sets status to completed with outputs', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const outputs = { result: 'done' };
    const completed = await tm.complete(created.id, outputs);
    expect(completed.status).toBe('completed');
    expect(completed.outputs).toEqual(outputs);
    expect(completed.completedAt).toBeInstanceOf(Date);
  });

  it('fail: sets status to retrying when retryCount < maxRetries', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const failed = await tm.fail(created.id, 'something broke');
    expect(failed.status).toBe('retrying');
    expect(failed.error).toBe('something broke');
  });

  it('fail: sets status to failed when retryCount >= maxRetries', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    await tm.update(created.id, { retryCount: 3, maxRetries: 3 });
    const failed = await tm.fail(created.id, 'final failure');
    expect(failed.status).toBe('failed');
  });

  it('cancel: sets status to cancelled', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const cancelled = await tm.cancel(created.id);
    expect(cancelled.status).toBe('cancelled');
  });

  it('retry: increments retryCount and sets status to pending', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    const retried = await tm.retry(created.id);
    expect(retried.retryCount).toBe(1);
    expect(retried.status).toBe('pending');
    expect(retried.error).toBeUndefined();
  });

  it('retry: throws when max retries exceeded', async () => {
    const tm = new TaskManager(makeLogger());
    const created = await tm.create(baseTask());
    await tm.retry(created.id);
    await tm.retry(created.id);
    await tm.retry(created.id);
    await expect(tm.retry(created.id)).rejects.toThrow('exceeded maximum retries');
  });

  it('getReadyTasks: returns pending tasks with all deps completed', async () => {
    const tm = new TaskManager(makeLogger());
    const dep = await tm.create(baseTask({ name: 'Dep' }));
    await tm.complete(dep.id, {});

    const ready = await tm.create(baseTask({ name: 'Ready', dependencies: [dep.id] }));
    const notReady = await tm.create(baseTask({ name: 'Not Ready', dependencies: [ready.id] }));

    const result = await tm.getReadyTasks();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(ready.id);
  });

  it('getReadyTasks: excludes non-pending tasks', async () => {
    const tm = new TaskManager(makeLogger());
    const t = await tm.create(baseTask());
    await tm.start(t.id);
    const ready = await tm.getReadyTasks();
    expect(ready).toHaveLength(0);
  });
});
