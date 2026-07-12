import type { AIProviderName, CostEntry } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

export interface BudgetConfig {
  tenantId: string;
  monthlyLimitUsd: number;
  alertThresholdPercent: number;
  hardLimit: boolean;
}

export interface CostSummary {
  tenantId: string;
  period: string;
  totalCostUsd: number;
  byProvider: Record<AIProviderName, number>;
  byModel: Record<string, number>;
  requestCount: number;
  totalTokens: number;
}

export interface CostAlert {
  id: string;
  tenantId: string;
  type: 'threshold' | 'limit' | 'anomaly';
  message: string;
  currentCost: number;
  limit: number;
  createdAt: Date;
}

export class CostOptimizer {
  private costs: CostEntry[] = [];
  private budgets = new Map<string, BudgetConfig>();
  private alerts: CostAlert[] = [];

  async recordCost(entry: Omit<CostEntry, 'timestamp'>): Promise<CostEntry> {
    const fullEntry: CostEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.costs.push(fullEntry);
    await this.checkBudget(fullEntry.tenantId);
    return fullEntry;
  }

  async setBudget(config: BudgetConfig): Promise<void> {
    this.budgets.set(config.tenantId, config);
  }

  async getBudget(tenantId: string): Promise<BudgetConfig | undefined> {
    return this.budgets.get(tenantId);
  }

  async getSummary(tenantId: string, period?: string): Promise<CostSummary> {
    const now = new Date();
    const periodStart = period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : period === 'day'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : new Date(0);

    const filtered = this.costs.filter(
      (c) => c.tenantId === tenantId && c.timestamp >= periodStart
    );

    const byProvider = {} as Record<AIProviderName, number>;
    const byModel: Record<string, number> = {};
    let totalTokens = 0;

    for (const entry of filtered) {
      byProvider[entry.provider as AIProviderName] =
        (byProvider[entry.provider as AIProviderName] ?? 0) + entry.costUsd;
      byModel[entry.model] = (byModel[entry.model] ?? 0) + entry.costUsd;
      totalTokens += entry.promptTokens + entry.completionTokens;
    }

    return {
      tenantId,
      period: period ?? 'all',
      totalCostUsd: filtered.reduce((sum, c) => sum + c.costUsd, 0),
      byProvider,
      byModel,
      requestCount: filtered.length,
      totalTokens,
    };
  }

  async getCostHistory(tenantId: string, days = 30): Promise<{ date: string; cost: number }[]> {
    const now = new Date();
    const history: { date: string; cost: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];

      const dayCost = this.costs
        .filter(
          (c) =>
            c.tenantId === tenantId &&
            c.timestamp.toISOString().startsWith(dayStr)
        )
        .reduce((sum, c) => sum + c.costUsd, 0);

      history.push({ date: dayStr, cost: dayCost });
    }

    return history;
  }

  async getAlerts(tenantId: string): Promise<CostAlert[]> {
    return this.alerts.filter((a) => a.tenantId === tenantId);
  }

  async suggestCheaperProvider(
    currentProvider: AIProviderName,
    currentModel: string
  ): Promise<{ provider: AIProviderName; model: string; savingsPercent: number } | null> {
    const pricing: Record<string, { provider: AIProviderName; model: string; costPer1k: number }> = {
      'deepseek-chat': { provider: 'deepseek', model: 'deepseek-chat', costPer1k: 0.00014 },
      'glm-4-flash': { provider: 'zhipuai', model: 'glm-4-flash', costPer1k: 0.000071 },
      'ollama-local': { provider: 'ollama', model: 'llama3.1', costPer1k: 0 },
      'nvidia-70b': { provider: 'nvidia', model: 'meta/llama-3.1-70b-instruct', costPer1k: 0.00088 },
      'openrouter-deepseek': { provider: 'openrouter', model: 'deepseek/deepseek-chat', costPer1k: 0.00014 },
    };

    const currentKey = `${currentProvider}-${currentModel}`;
    const currentCost = pricing[currentKey]?.costPer1k ?? 0.003;

    let bestSuggestion: { provider: AIProviderName; model: string; savingsPercent: number } | null = null;

    for (const [key, info] of Object.entries(pricing)) {
      if (key === currentKey) continue;
      if (info.costPer1k < currentCost) {
        const savings = ((currentCost - info.costPer1k) / currentCost) * 100;
        if (!bestSuggestion || savings > bestSuggestion.savingsPercent) {
          bestSuggestion = { provider: info.provider, model: info.model, savingsPercent: savings };
        }
      }
    }

    return bestSuggestion;
  }

  private async checkBudget(tenantId: string): Promise<void> {
    const budget = this.budgets.get(tenantId);
    if (!budget) return;

    const summary = await this.getSummary(tenantId, 'month');
    const percentUsed = (summary.totalCostUsd / budget.monthlyLimitUsd) * 100;

    if (percentUsed >= 100 && budget.hardLimit) {
      this.alerts.push({
        id: generateId(),
        tenantId,
        type: 'limit',
        message: `Monthly budget limit reached: $${summary.totalCostUsd.toFixed(2)} / $${budget.monthlyLimitUsd.toFixed(2)}`,
        currentCost: summary.totalCostUsd,
        limit: budget.monthlyLimitUsd,
        createdAt: new Date(),
      });
    } else if (percentUsed >= budget.alertThresholdPercent) {
      this.alerts.push({
        id: generateId(),
        tenantId,
        type: 'threshold',
        message: `Budget alert: ${percentUsed.toFixed(1)}% of monthly limit used ($${summary.totalCostUsd.toFixed(2)} / $${budget.monthlyLimitUsd.toFixed(2)})`,
        currentCost: summary.totalCostUsd,
        limit: budget.monthlyLimitUsd,
        createdAt: new Date(),
      });
    }
  }
}
