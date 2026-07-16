import { randomUUID } from 'node:crypto';
import type {
  AutomationEngine as IAutomationEngine,
  AutomationRule,
  AutomationActionTarget,
  AutomationTrigger,
  AutomationCondition,
  ConversationMessage,
  ConversationContext,
} from './interfaces.js';

export class AutomationEngine implements IAutomationEngine {
  private rules: Map<string, AutomationRule> = new Map();

  async createRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'triggerCount'>): Promise<AutomationRule> {
    const id = randomUUID();
    const full: AutomationRule = {
      ...rule, id, createdAt: new Date(), triggerCount: 0,
    };
    this.rules.set(id, full);
    return full;
  }

  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) throw new Error(`Rule not found: ${ruleId}`);
    Object.assign(rule, updates, { id: ruleId });
    return rule;
  }

  async deleteRule(ruleId: string): Promise<void> {
    this.rules.delete(ruleId);
  }

  getRules(): AutomationRule[] {
    return Array.from(this.rules.values());
  }

  async evaluate(message: ConversationMessage, context: ConversationContext): Promise<AutomationActionTarget[]> {
    const matched: AutomationActionTarget[] = [];
    const text = (message.content ?? '').toLowerCase();

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      if (rule.trigger === 'mensagem' && text.includes(rule.triggerValue?.toLowerCase() ?? '')) {
        rule.triggerCount++;
        rule.lastTriggered = new Date();
        matched.push(...rule.actions);
      }
    }
    return matched;
  }

  getRule(ruleId: string): AutomationRule | null {
    return this.rules.get(ruleId) ?? null;
  }
}
