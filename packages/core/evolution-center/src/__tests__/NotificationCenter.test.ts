import { describe, it, expect } from 'vitest';
import { NotificationCenter } from '../notifications/NotificationCenter.js';

describe('NotificationCenter', () => {
  const center = new NotificationCenter({
    enabled: true, channels: ['slack', 'email'],
    templates: [{ id: 't1', name: 'Alert', channel: 'slack', subject: 'Alert: {{title}}', body: '{{message}}', variables: ['title', 'message'] }]
  });

  it('creates NotificationCenter', () => { expect(center).toBeDefined(); });

  it('sends notification', () => {
    const n = center.send('t1', 'dev', { title: 'Test', message: 'Hello' });
    expect(n).toBeDefined();
    expect(n!.subject).toBe('Alert: Test');
  });

  it('creates template', () => {
    const t = center.createTemplate({ name: 'Test', channel: 'email', subject: 'Sub', body: 'Body', variables: [] });
    expect(t.id).toBeDefined();
  });

  it('gets unread notifications', () => {
    const unread = center.getUnread();
    expect(Array.isArray(unread)).toBe(true);
  });

  it('marks as read', () => {
    const n = center.send('t1', 'dev', { title: 'T', message: 'M' });
    center.markRead(n!.id);
    expect(center.getAll().find(x => x.id === n!.id)!.status).toBe('read');
  });

  it('gets stats', () => {
    const stats = center.getStats();
    expect(stats.total).toBeGreaterThanOrEqual(0);
  });
});
