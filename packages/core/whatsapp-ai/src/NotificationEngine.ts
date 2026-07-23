import { randomUUID } from 'node:crypto';
import type {
  NotificationEngine as INotificationEngine,
  Notification,
  NotificationChannel,
} from './interfaces.js';

export class NotificationEngine implements INotificationEngine {
  private notifications: Map<string, Notification> = new Map();

  async send(notification: Omit<Notification, 'id' | 'sent' | 'sentAt'>): Promise<Notification> {
    const id = randomUUID();
    const full: Notification = {
      ...notification, id, sent: true, sentAt: new Date(),
    };
    this.notifications.set(id, full);
    return full;
  }

  getNotifications(recipient: string): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.recipient === recipient);
  }

  getFailed(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => !n.sent);
  }

  async retry(notificationId: string): Promise<Notification> {
    const n = this.notifications.get(notificationId);
    if (!n) throw new Error(`Notification not found: ${notificationId}`);
    n.sent = true;
    n.sentAt = new Date();
    n.error = undefined;
    return n;
  }
}
