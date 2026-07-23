import { randomUUID } from 'node:crypto';
import type {
  MonitoringEngine as IMonitoringEngine,
  AnalyticsDashboard,
  EmailMetrics,
  EmailError,
} from './interfaces.js';

export class MonitoringEngine implements IMonitoringEngine {
  private metrics: Map<string, number> = new Map();
  private errors: EmailError[] = [];

  recordMetric(name: string, value: number): void { this.metrics.set(name, value); }

  recordError(error: Omit<EmailError, 'id' | 'timestamp'>): void {
    this.errors.push({ ...error, id: randomUUID(), timestamp: new Date() });
  }

  getMetrics(): EmailMetrics {
    const m = this.metrics;
    return {
      totalReceived: m.get('totalReceived') ?? 0,
      totalSent: m.get('totalSent') ?? 0,
      totalDrafts: m.get('totalDrafts') ?? 0,
      totalArchived: m.get('totalArchived') ?? 0,
      totalSpam: m.get('totalSpam') ?? 0,
      totalConversations: m.get('totalConversations') ?? 0,
      activeConversations: m.get('activeConversations') ?? 0,
      avgResponseTimeMs: m.get('avgResponseTimeMs') ?? 0,
      automationRate: m.get('automationRate') ?? 0,
      categoryBreakdown: {},
      priorityBreakdown: {},
      volumeByContact: {},
      pendingApprovals: m.get('pendingApprovals') ?? 0,
      tasksCreated: m.get('tasksCreated') ?? 0,
      estimatedCostUsd: m.get('estimatedCostUsd') ?? 0,
    };
  }

  getDashboard(): AnalyticsDashboard {
    return {
      metrics: this.getMetrics(),
      uptime: process.uptime(),
      status: 'healthy',
      recentErrors: this.errors.slice(-10),
    };
  }

  reset(): void { this.metrics.clear(); this.errors = []; }
}
