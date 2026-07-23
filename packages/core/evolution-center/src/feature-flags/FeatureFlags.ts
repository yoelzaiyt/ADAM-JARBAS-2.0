import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { FeatureFlag, FlagTargeting } from '../interfaces.js';

export class FeatureFlags {
  private flags: Map<string, FeatureFlag> = new Map();
  private log = createLogger('FeatureFlags');

  createFlag(flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>): FeatureFlag {
    const newFlag: FeatureFlag = {
      ...flag,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.flags.set(newFlag.id, newFlag);
    this.log(`Created feature flag: ${newFlag.key}`);
    return newFlag;
  }

  enable(id: string): boolean {
    const flag = this.flags.get(id);
    if (!flag) return false;
    flag.enabled = true;
    flag.updatedAt = new Date();
    return true;
  }

  disable(id: string): boolean {
    const flag = this.flags.get(id);
    if (!flag) return false;
    flag.enabled = false;
    flag.updatedAt = new Date();
    return true;
  }

  isEnabled(key: string, context?: FlagContext): boolean {
    const flag = Array.from(this.flags.values()).find(f => f.key === key);
    if (!flag || !flag.enabled) return false;
    if (flag.expiresAt && flag.expiresAt < new Date()) return false;
    return this.evaluateTargeting(flag, context);
  }

  private evaluateTargeting(flag: FeatureFlag, context?: FlagContext): boolean {
    if (!context) {
      if (flag.targeting === 'all') return true;
      if (flag.targeting === 'percentage' && (flag.percentage ?? 0) >= 100) return true;
      return false;
    }

    switch (flag.targeting) {
      case 'all': return true;
      case 'percentage': return Math.random() * 100 < (flag.percentage || 0);
      case 'user-segment': return flag.userSegments?.includes(context.userSegment || '') || false;
      case 'company-segment': return flag.companySegments?.includes(context.companySegment || '') || false;
      case 'environment': return flag.environments?.includes(context.environment || '') || false;
      default: return false;
    }
  }

  getById(id: string): FeatureFlag | undefined {
    return this.flags.get(id);
  }

  getByKey(key: string): FeatureFlag | undefined {
    return Array.from(this.flags.values()).find(f => f.key === key);
  }

  getAll(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getActive(): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(f => f.enabled && (!f.expiresAt || f.expiresAt > new Date()));
  }

  getExpired(): FeatureFlag[] {
    return Array.from(this.flags.values()).filter(f => f.expiresAt && f.expiresAt < new Date());
  }

  deleteFlag(id: string): boolean {
    return this.flags.delete(id);
  }

  cleanupExpired(): number {
    let count = 0;
    for (const [id, flag] of this.flags) {
      if (flag.expiresAt && flag.expiresAt < new Date()) {
        this.flags.delete(id);
        count++;
      }
    }
    return count;
  }
}

export interface FlagContext {
  userId?: string;
  userSegment?: string;
  companySegment?: string;
  environment?: string;
}
