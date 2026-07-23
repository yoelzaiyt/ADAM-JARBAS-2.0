import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { GovernancePolicy, PolicyRule, PolicyDomain, Severity } from '../interfaces.js';

export class Governance {
  private policies: Map<string, GovernancePolicy> = new Map();
  private log = createLogger('Governance');

  createPolicy(policy: Omit<GovernancePolicy, 'id' | 'createdAt' | 'updatedAt'>): GovernancePolicy {
    const newPolicy: GovernancePolicy = {
      ...policy,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.policies.set(newPolicy.id, newPolicy);
    this.log(`Created policy: ${newPolicy.name}`);
    return newPolicy;
  }

  addRule(policyId: string, rule: Omit<PolicyRule, 'id'>): PolicyRule | null {
    const policy = this.policies.get(policyId);
    if (!policy) return null;
    const newRule: PolicyRule = { ...rule, id: generateId() };
    policy.rules.push(newRule);
    policy.updatedAt = new Date();
    return newRule;
  }

  evaluate(domain: PolicyDomain, context: Record<string, unknown>): PolicyEvaluation {
    const policies = Array.from(this.policies.values()).filter(p => p.domain === domain && p.enabled);
    const violations: PolicyViolation[] = [];

    for (const policy of policies) {
      for (const rule of policy.rules) {
        const passed = this.evaluateRule(rule, context);
        if (!passed) {
          violations.push({
            id: generateId(),
            policyId: policy.id,
            ruleId: rule.id,
            ruleName: rule.name,
            action: rule.action,
            severity: rule.severity,
            message: rule.description,
            evaluatedAt: new Date()
          });
        }
      }
    }

    return {
      domain,
      policiesChecked: policies.length,
      violations,
      canProceed: violations.filter(v => v.action === 'block').length === 0
    };
  }

  private evaluateRule(rule: PolicyRule, _context: Record<string, unknown>): boolean {
    // Simplified evaluation - in real implementation would parse rule.condition
    return true;
  }

  getById(id: string): GovernancePolicy | undefined {
    return this.policies.get(id);
  }

  getByDomain(domain: PolicyDomain): GovernancePolicy[] {
    return Array.from(this.policies.values()).filter(p => p.domain === domain);
  }

  getAll(): GovernancePolicy[] {
    return Array.from(this.policies.values());
  }

  enable(id: string): boolean {
    const policy = this.policies.get(id);
    if (!policy) return false;
    policy.enabled = true;
    policy.updatedAt = new Date();
    return true;
  }

  disable(id: string): boolean {
    const policy = this.policies.get(id);
    if (!policy) return false;
    policy.enabled = false;
    policy.updatedAt = new Date();
    return true;
  }

  getStats(): { total: number; enabled: number; byDomain: Record<string, number> } {
    const all = Array.from(this.policies.values());
    return {
      total: all.length,
      enabled: all.filter(p => p.enabled).length,
      byDomain: all.reduce((acc, p) => { acc[p.domain] = (acc[p.domain] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }
}

export interface PolicyEvaluation {
  domain: PolicyDomain;
  policiesChecked: number;
  violations: PolicyViolation[];
  canProceed: boolean;
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  ruleId: string;
  ruleName: string;
  action: PolicyRule['action'];
  severity: Severity;
  message: string;
  evaluatedAt: Date;
}
