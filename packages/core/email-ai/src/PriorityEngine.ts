import { randomUUID } from 'node:crypto';
import type {
  PriorityEngine as IPriorityEngine,
  PriorityRule,
  EmailMessage,
  EmailPriority,
} from './interfaces.js';

export class PriorityEngine implements IPriorityEngine {
  private rules: PriorityRule[] = [];

  constructor() {
    this.rules.push(
      { id: randomUUID(), name: 'Urgent sender', field: 'sender', operator: 'equals', value: 'urgent@company.com', priority: 'urgente', enabled: true },
      { id: randomUUID(), name: 'Subject deadline', field: 'subject', operator: 'contains', value: 'prazo', priority: 'alta', enabled: true },
      { id: randomUUID(), name: 'Subject meeting', field: 'subject', operator: 'contains', value: 'reunião', priority: 'alta', enabled: true },
    );
  }

  async classify(message: EmailMessage): Promise<EmailPriority> {
    const rulePriority = this.classifyByRules(message);
    if (rulePriority) return rulePriority;
    return this.heuristicClassify(message);
  }

  addRule(rule: Omit<PriorityRule, 'id'>): PriorityRule {
    const full: PriorityRule = { ...rule, id: randomUUID() };
    this.rules.push(full);
    return full;
  }

  updateRule(ruleId: string, updates: Partial<PriorityRule>): PriorityRule {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) throw new Error(`Rule not found: ${ruleId}`);
    Object.assign(rule, updates, { id: ruleId });
    return rule;
  }

  deleteRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  getRules(): PriorityRule[] {
    return [...this.rules];
  }

  classifyByRules(message: EmailMessage): EmailPriority | null {
    for (const rule of this.rules.filter(r => r.enabled)) {
      let field = '';
      if (rule.field === 'sender') field = message.from.email;
      else if (rule.field === 'subject') field = message.subject;
      else if (rule.field === 'content') field = message.textBody;
      else if (rule.field === 'category') field = message.category ?? '';

      const lower = field.toLowerCase();
      const value = rule.value.toLowerCase();

      let match = false;
      if (rule.operator === 'equals') match = lower === value;
      else if (rule.operator === 'contains') match = lower.includes(value);
      else if (rule.operator === 'starts_with') match = lower.startsWith(value);
      else if (rule.operator === 'ends_with') match = lower.endsWith(value);
      else if (rule.operator === 'regex') match = new RegExp(rule.value, 'i').test(field);

      if (match) return rule.priority;
    }
    return null;
  }

  private heuristicClassify(message: EmailMessage): EmailPriority {
    const text = (message.subject + ' ' + message.textBody).toLowerCase();
    if (text.includes('urgente') || text.includes('asap') || text.includes('imediato')) return 'urgente';
    if (text.includes('importante') || text.includes('prazo') || text.includes('deadline')) return 'alta';
    if (text.includes('quando puder') || text.includes('sem pressa')) return 'baixa';
    return 'media';
  }
}
