import type {
  Notification,
  NotificationRule,
  NotificationChannel,
  NotificationCondition,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface NotificationCenterConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export class NotificationCenter {
  private logger = new DefaultLogger('notification-center');
  private notifications = new Map<string, Notification>();
  private rules = new Map<string, NotificationRule>();
  private config: NotificationCenterConfig;

  constructor(config?: NotificationCenterConfig) {
    this.config = config ?? {};
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  async send(data: Omit<Notification, 'id' | 'read' | 'readAt' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      ...data,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    await this.logger.info('Notification sent', { id: notification.id, channel: notification.channel, userId: notification.userId });
    return notification;
  }

  async sendMultiChannel(data: Omit<Notification, 'id' | 'read' | 'readAt' | 'createdAt' | 'channel'>, channels: NotificationChannel[]): Promise<Notification[]> {
    const results: Notification[] = [];
    for (const channel of channels) {
      const notification: Notification = {
        ...data,
        id: crypto.randomUUID(),
        channel,
        read: false,
        createdAt: new Date(),
      };
      this.notifications.set(notification.id, notification);
      results.push(notification);
    }
    await this.logger.info('Multi-channel notification sent', { count: results.length, userId: data.userId });
    return results;
  }

  async getNotificationById(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async listNotifications(companyId: string, filters?: { userId?: string; channel?: NotificationChannel; type?: Notification['type']; unreadOnly?: boolean }): Promise<Notification[]> {
    let results = Array.from(this.notifications.values()).filter(n => n.companyId === companyId);
    if (filters?.userId) results = results.filter(n => n.userId === filters.userId);
    if (filters?.channel) results = results.filter(n => n.channel === filters.channel);
    if (filters?.type) results = results.filter(n => n.type === filters.type);
    if (filters?.unreadOnly) results = results.filter(n => !n.read);
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error(`Notification ${id} not found`);
    notification.read = true;
    notification.readAt = new Date();
    this.notifications.set(id, notification);
    await this.logger.info('Notification marked as read', { id });
    return notification;
  }

  async markAllAsRead(companyId: string, userId: string): Promise<number> {
    let count = 0;
    for (const [, notification] of this.notifications) {
      if (notification.companyId === companyId && notification.userId === userId && !notification.read) {
        notification.read = true;
        notification.readAt = new Date();
        count++;
      }
    }
    await this.logger.info('All notifications marked as read', { companyId, userId, count });
    return count;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const deleted = this.notifications.delete(id);
    if (deleted) await this.logger.info('Notification deleted', { id });
    return deleted;
  }

  async getUnreadCount(companyId: string, userId: string): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      n => n.companyId === companyId && n.userId === userId && !n.read
    ).length;
  }

  // ─── Rules ────────────────────────────────────────────────────────────────

  async createRule(data: Omit<NotificationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationRule> {
    const now = new Date();
    const rule: NotificationRule = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this.rules.set(rule.id, rule);
    await this.logger.info('Notification rule created', { id: rule.id });
    return rule;
  }

  async getRuleById(id: string): Promise<NotificationRule | undefined> {
    return this.rules.get(id);
  }

  async listRules(companyId: string): Promise<NotificationRule[]> {
    return Array.from(this.rules.values()).filter(r => r.companyId === companyId);
  }

  async updateRule(id: string, data: Partial<NotificationRule>): Promise<NotificationRule> {
    const existing = this.rules.get(id);
    if (!existing) throw new Error(`NotificationRule ${id} not found`);
    const updated: NotificationRule = { ...existing, ...data, id: existing.id, updatedAt: new Date() };
    this.rules.set(id, updated);
    await this.logger.info('Notification rule updated', { id });
    return updated;
  }

  async deleteRule(id: string): Promise<boolean> {
    const deleted = this.rules.delete(id);
    if (deleted) await this.logger.info('Notification rule deleted', { id });
    return deleted;
  }

  async evaluateRules(companyId: string, event: string, context: Record<string, unknown>): Promise<Notification[]> {
    const matchingRules = Array.from(this.rules.values()).filter(r => r.companyId === companyId && r.isActive && r.event === event);
    const results: Notification[] = [];
    for (const rule of matchingRules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        for (const channel of rule.channels) {
          const notification = await this.send({
            companyId,
            userId: (context['userId'] as string) ?? '',
            title: rule.name,
            message: this.renderTemplate(rule.template, context),
            type: 'info',
            channel,
            source: event,
          });
          results.push(notification);
        }
      }
    }
    return results;
  }

  private evaluateConditions(conditions: NotificationCondition[], context: Record<string, unknown>): boolean {
    if (conditions.length === 0) return true;
    return conditions.every(cond => {
      const val = context[cond.field];
      switch (cond.operator) {
        case 'equals': return val === cond.value;
        case 'not_equals': return val !== cond.value;
        case 'contains': return typeof val === 'string' && val.includes(cond.value as string);
        case 'greater_than': return typeof val === 'number' && typeof cond.value === 'number' && val > cond.value;
        case 'less_than': return typeof val === 'number' && typeof cond.value === 'number' && val < cond.value;
        default: return true;
      }
    });
  }

  private renderTemplate(template: string, context: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(context[key] ?? ''));
  }
}

export { NotificationCenter as default };
