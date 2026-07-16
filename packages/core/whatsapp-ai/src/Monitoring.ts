import { randomUUID } from 'node:crypto';
import type {
  MonitoringEngine as IMonitoringEngine,
  AnalyticsDashboard,
  WhatsAppMetrics,
  WhatsAppError,
} from './interfaces.js';

export class MonitoringEngine implements IMonitoringEngine {
  private metrics: Map<string, number> = new Map();
  private errors: WhatsAppError[] = [];

  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }

  recordError(error: Omit<WhatsAppError, 'id' | 'timestamp'>): void {
    this.errors.push({ ...error, id: randomUUID(), timestamp: new Date() });
  }

  getMetrics(): WhatsAppMetrics {
    const m = this.metrics;
    return {
      totalMessages: m.get('totalMessages') ?? 0,
      inboundMessages: m.get('inboundMessages') ?? 0,
      outboundMessages: m.get('outboundMessages') ?? 0,
      totalConversations: m.get('totalConversations') ?? 0,
      activeConversations: m.get('activeConversations') ?? 0,
      averageResponseTimeMs: m.get('averageResponseTimeMs') ?? 0,
      totalContacts: m.get('totalContacts') ?? 0,
      totalMediaFiles: m.get('totalMediaFiles') ?? 0,
      totalTasks: m.get('totalTasks') ?? 0,
      totalAutomations: m.get('totalAutomations') ?? 0,
      aiVsHumanRatio: m.get('aiVsHumanRatio') ?? 0,
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

  reset(): void {
    this.metrics.clear();
    this.errors = [];
  }
}
