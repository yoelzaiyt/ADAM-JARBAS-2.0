import { describe, it, expect, beforeEach } from 'vitest';
import { TaskSync } from '../TaskSync.js';
import type { EmailMessage } from '../interfaces.js';

describe('TaskSync', () => {
  let sync: TaskSync;

  beforeEach(() => { sync = new TaskSync(); });

  it('creates sync', () => { expect(sync).toBeDefined(); });

  it('createTask creates task', async () => {
    const task = await sync.createTask({
      title: 'Follow up', description: 'call client',
      priority: 'alta', status: 'pendente', source: 'email',
    });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Follow up');
  });

  it('completeTask marks complete', async () => {
    const task = await sync.createTask({
      title: 'A', description: '', priority: 'media',
      status: 'pendente', source: 'email',
    });
    const done = await sync.completeTask(task.id);
    expect(done.status).toBe('concluida');
  });

  it('getPendingTasks returns pending', async () => {
    await sync.createTask({ title: 'A', description: '', priority: 'media', status: 'pendente', source: 'email' });
    expect(sync.getPendingTasks().length).toBe(1);
  });

  it('extractTasks extracts from email', async () => {
    const msg: EmailMessage = {
      id: 'm1', messageId: '<m1@test>', from: { name: 'T', email: 'a@test.com' },
      to: [], subject: 'Task', textBody: 'Favor enviar relatório e não esqueça do prazo',
      attachments: [], direction: 'inbound', status: 'delivered', labels: [],
      isRead: false, isStarred: false, priority: 'media', spamLevel: 'nenhum',
      phishingRisk: 'nenhum', receivedAt: new Date(), createdAt: new Date(),
      updatedAt: new Date(), metadata: {},
    };
    const tasks = await sync.extractTasks(msg);
    expect(tasks.length).toBeGreaterThan(0);
  });
});
