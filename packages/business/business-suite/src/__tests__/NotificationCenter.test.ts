import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationCenter } from '../notification-center/NotificationCenter.js';

const CID = 'comp-1';
const UID = 'user-1';

function notificationData(overrides = {}) {
  return {
    companyId: CID,
    userId: UID,
    title: 'New Order',
    message: 'Order #123 received',
    type: 'info' as const,
    channel: 'email' as const,
    source: 'order',
    ...overrides,
  };
}

describe('NotificationCenter', () => {
  let nc: NotificationCenter;

  beforeEach(() => {
    nc = new NotificationCenter();
  });

  it('sends and retrieves a notification', async () => {
    const n = await nc.send(notificationData());
    expect(n.id).toBeDefined();
    expect(n.read).toBe(false);
    const found = await nc.getNotificationById(n.id);
    expect(found?.title).toBe('New Order');
  });

  it('sends multi-channel notifications', async () => {
    const results = await nc.sendMultiChannel(
      { companyId: CID, userId: UID, title: 'Alert', message: 'x', type: 'warning', source: 'system' },
      ['email', 'push', 'sms'],
    );
    expect(results).toHaveLength(3);
    expect(new Set(results.map(r => r.channel))).toEqual(new Set(['email', 'push', 'sms']));
  });

  it('marks notifications as read', async () => {
    const n = await nc.send(notificationData());
    const read = await nc.markAsRead(n.id);
    expect(read.read).toBe(true);
    expect(read.readAt).toBeDefined();
  });

  it('marks all as read for a user', async () => {
    await nc.send(notificationData({ title: 'A' }));
    await nc.send(notificationData({ title: 'B' }));
    const count = await nc.markAllAsRead(CID, UID);
    expect(count).toBe(2);
    expect(await nc.getUnreadCount(CID, UID)).toBe(0);
  });

  it('filters notifications by user and unread', async () => {
    await nc.send(notificationData({ userId: 'u1' }));
    await nc.send(notificationData({ userId: 'u2' }));
    await nc.send(notificationData({ userId: 'u1', title: 'Read' }));
    await nc.markAllAsRead(CID, 'u1');
    const unread = await nc.listNotifications(CID, { userId: 'u1', unreadOnly: true });
    expect(unread).toHaveLength(0);
  });

  it('creates and evaluates notification rules', async () => {
    const rule = await nc.createRule({
      companyId: CID,
      name: 'Order Alert',
      event: 'order.created',
      conditions: [{ field: 'amount', operator: 'greater_than', value: 1000 }],
      channels: ['email', 'push'],
      template: 'New order for {{amount}}',
      isActive: true,
    });
    expect(rule.id).toBeDefined();
    const results = await nc.evaluateRules(CID, 'order.created', { amount: 5000, userId: UID });
    expect(results).toHaveLength(2);
    expect(results[0].message).toBe('New order for 5000');
  });

  it('evaluates rules with condition mismatch', async () => {
    await nc.createRule({
      companyId: CID,
      name: 'Small Orders',
      event: 'order.created',
      conditions: [{ field: 'amount', operator: 'less_than', value: 100 }],
      channels: ['email'],
      template: 'Small order',
      isActive: true,
    });
    const results = await nc.evaluateRules(CID, 'order.created', { amount: 500, userId: UID });
    expect(results).toHaveLength(0);
  });
});
