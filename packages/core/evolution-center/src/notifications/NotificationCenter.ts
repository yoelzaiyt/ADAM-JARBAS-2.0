import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Notification, NotificationChannel, NotificationTemplate, NotificationConfig } from '../interfaces.js';

export class NotificationCenter {
  private config: NotificationConfig;
  private notifications: Map<string, Notification> = new Map();
  private log = createLogger('NotificationCenter');

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  send(templateId: string, recipient: string, variables: Record<string, string>): Notification | null {
    const template = this.config.templates.find(t => t.id === templateId);
    if (!template) return null;

    let body = template.body;
    let subject = template.subject;
    for (const [key, value] of Object.entries(variables)) {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const notification: Notification = {
      id: generateId(),
      templateId,
      channel: template.channel,
      recipient,
      subject,
      body,
      status: 'sent',
      createdAt: new Date(),
      sentAt: new Date()
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  createTemplate(template: Omit<NotificationTemplate, 'id'>): NotificationTemplate {
    const newTemplate: NotificationTemplate = {
      ...template,
      id: generateId()
    };
    this.config.templates.push(newTemplate);
    return newTemplate;
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  getByChannel(channel: NotificationChannel): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.channel === channel);
  }

  getUnread(): Notification[] {
    return Array.from(this.notifications.values()).filter(n => n.status !== 'read');
  }

  markRead(id: string): boolean {
    const n = this.notifications.get(id);
    if (!n) return false;
    n.status = 'read';
    return true;
  }

  getTemplates(): NotificationTemplate[] {
    return this.config.templates;
  }

  getStats(): { total: number; byChannel: Record<string, number>; byStatus: Record<string, number> } {
    const all = Array.from(this.notifications.values());
    return {
      total: all.length,
      byChannel: all.reduce((acc, n) => { acc[n.channel] = (acc[n.channel] || 0) + 1; return acc; }, {} as Record<string, number>),
      byStatus: all.reduce((acc, n) => { acc[n.status] = (acc[n.status] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }
}
