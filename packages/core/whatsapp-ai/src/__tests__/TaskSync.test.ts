import { describe, it, expect, beforeEach } from 'vitest';
import { TaskSync } from '../TaskSync.js';

describe('TaskSync', () => {
  let sync: TaskSync;

  beforeEach(() => {
    sync = new TaskSync();
  });

  it('creates task', async () => {
    const task = await sync.createTask({
      title: 'Follow up', description: 'call client',
      priority: 'alta', status: 'pendente', source: 'whatsapp',
    });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Follow up');
  });

  it('updates task', async () => {
    const task = await sync.createTask({
      title: 'A', description: '', priority: 'media',
      status: 'pendente', source: 'whatsapp',
    });
    const updated = await sync.updateTask(task.id, { title: 'B' });
    expect(updated.title).toBe('B');
  });

  it('getTasksByContact filters', async () => {
    await sync.createTask({
      title: 'A', description: '', priority: 'media',
      status: 'pendente', source: 'w', contactId: 'c1',
    });
    await sync.createTask({
      title: 'B', description: '', priority: 'media',
      status: 'pendente', source: 'w', contactId: 'c2',
    });
    expect(sync.getTasksByContact('c1').length).toBe(1);
  });

  it('completeTask sets concluida', async () => {
    const task = await sync.createTask({
      title: 'A', description: '', priority: 'media',
      status: 'pendente', source: 'w',
    });
    const done = await sync.completeTask(task.id);
    expect(done.status).toBe('concluida');
  });
});
