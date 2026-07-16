import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { ArchitectureReviewConfig, ArchitectureViolation, ArchitectureRule, ArchitecturePrinciple, Severity } from '../interfaces.js';

export class ArchitectureReview {
  private config: ArchitectureReviewConfig;
  private violations: Map<string, ArchitectureViolation> = new Map();
  private rules: Map<string, ArchitectureRule> = new Map();
  private log = createLogger('ArchitectureReview');

  constructor(config: ArchitectureReviewConfig) {
    this.config = config;
    this.initDefaultRules();
  }

  private initDefaultRules(): void {
    const defaultRules: ArchitectureRule[] = [
      { id: generateId(), name: 'DDD Layer Separation', description: 'Domain layer must not depend on infrastructure', principle: 'ddd', pattern: 'import.*from.*infrastructure', severity: 'high', enabled: true },
      { id: generateId(), name: 'SOLID - SRP', description: 'Classes should have single responsibility', principle: 'solid', pattern: 'class.*\\{.*methods.*>.*10', severity: 'medium', enabled: true },
      { id: generateId(), name: 'Clean Architecture', description: 'Inner layers must not depend on outer layers', principle: 'clean-architecture', pattern: 'import.*from.*presentation', severity: 'high', enabled: true },
      { id: generateId(), name: 'Event Driven', description: 'Use events for cross-module communication', principle: 'event-driven', pattern: 'direct.*call.*cross.*module', severity: 'medium', enabled: true },
      { id: generateId(), name: 'Loose Coupling', description: 'Modules should have minimal dependencies', principle: 'loose-coupling', pattern: 'import.*>.*5.*from.*same.*package', severity: 'medium', enabled: true },
    ];
    for (const rule of defaultRules) {
      this.rules.set(rule.id, rule);
    }
  }

  addRule(rule: Omit<ArchitectureRule, 'id'>): ArchitectureRule {
    const newRule: ArchitectureRule = { ...rule, id: generateId() };
    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  async runReview(reviewData: ArchitectureReviewData): Promise<ArchitectureViolation[]> {
    const newViolations: ArchitectureViolation[] = [];

    if (this.config.principles.includes('ddd')) {
      newViolations.push(...this.checkDDD(reviewData));
    }
    if (this.config.principles.includes('solid')) {
      newViolations.push(...this.checkSOLID(reviewData));
    }
    if (this.config.principles.includes('clean-architecture')) {
      newViolations.push(...this.checkCleanArchitecture(reviewData));
    }
    if (this.config.principles.includes('event-driven')) {
      newViolations.push(...this.checkEventDriven(reviewData));
    }
    if (this.config.principles.includes('loose-coupling')) {
      newViolations.push(...this.checkLooseCoupling(reviewData));
    }
    if (this.config.principles.includes('high-cohesion')) {
      newViolations.push(...this.checkHighCohesion(reviewData));
    }

    for (const v of newViolations) {
      this.violations.set(v.id, v);
    }
    this.log(`Architecture review: ${newViolations.length} violations found`);
    return newViolations;
  }

  private checkDDD(data: ArchitectureReviewData): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const imp of data.imports || []) {
      if (imp.from.includes('infrastructure') && imp.to.includes('domain')) {
        violations.push({
          id: generateId(), principle: 'ddd', severity: 'high',
          title: 'Domain layer depends on infrastructure',
          description: `${imp.file} imports from infrastructure`,
          location: imp.file, recommendation: 'Move dependency to adapter/port pattern',
          autoFixable: false, detectedAt: new Date()
        });
      }
    }
    return violations;
  }

  private checkSOLID(data: ArchitectureReviewData): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const cls of data.classes || []) {
      if (cls.methodCount > 15) {
        violations.push({
          id: generateId(), principle: 'solid', severity: 'medium',
          title: `Class ${cls.name} has too many methods (${cls.methodCount})`,
          description: 'Possible violation of Single Responsibility Principle',
          location: cls.path, recommendation: 'Split into smaller, focused classes',
          autoFixable: false, detectedAt: new Date()
        });
      }
    }
    return violations;
  }

  private checkCleanArchitecture(data: ArchitectureReviewData): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const imp of data.imports || []) {
      if (imp.from.includes('presentation') && imp.to.includes('domain')) {
        violations.push({
          id: generateId(), principle: 'clean-architecture', severity: 'high',
          title: 'Domain layer depends on presentation layer',
          description: `${imp.file} creates upward dependency`,
          location: imp.file, recommendation: 'Use dependency inversion',
          autoFixable: false, detectedAt: new Date()
        });
      }
    }
    return violations;
  }

  private checkEventDriven(data: ArchitectureReviewData): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const call of data.directCalls || []) {
      if (call.crossModule) {
        violations.push({
          id: generateId(), principle: 'event-driven', severity: 'medium',
          title: `Direct cross-module call: ${call.from} -> ${call.to}`,
          description: 'Consider using events for loose coupling',
          location: call.file, recommendation: 'Replace with event emission',
          autoFixable: false, detectedAt: new Date()
        });
      }
    }
    return violations;
  }

  private checkLooseCoupling(data: ArchitectureReviewData): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const mod of data.modules || []) {
      if (mod.internalImports > 10) {
        violations.push({
          id: generateId(), principle: 'loose-coupling', severity: 'medium',
          title: `Module ${mod.name} has ${mod.internalImports} internal imports`,
          description: 'High internal coupling detected',
          location: mod.path, recommendation: 'Extract shared interfaces and reduce direct dependencies',
          autoFixable: false, detectedAt: new Date()
        });
      }
    }
    return violations;
  }

  private checkHighCohesion(data: ArchitectureReviewData): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (const cls of data.classes || []) {
      if (cls.cohesionScore !== undefined && cls.cohesionScore < 0.3) {
        violations.push({
          id: generateId(), principle: 'high-cohesion', severity: 'medium',
          title: `Low cohesion in ${cls.name} (score: ${cls.cohesionScore})`,
          description: 'Class has unrelated responsibilities',
          location: cls.path, recommendation: 'Split into cohesive classes',
          autoFixable: false, detectedAt: new Date()
        });
      }
    }
    return violations;
  }

  getAllViolations(): ArchitectureViolation[] {
    return Array.from(this.violations.values());
  }

  getViolationStats(): { total: number; byPrinciple: Record<string, number>; bySeverity: Record<string, number> } {
    const all = Array.from(this.violations.values());
    return {
      total: all.length,
      byPrinciple: all.reduce((acc, v) => { acc[v.principle] = (acc[v.principle] || 0) + 1; return acc; }, {} as Record<string, number>),
      bySeverity: all.reduce((acc, v) => { acc[v.severity] = (acc[v.severity] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }

  getAllRules(): ArchitectureRule[] {
    return Array.from(this.rules.values());
  }
}

export interface ArchitectureReviewData {
  imports?: Array<{ from: string; to: string; file: string }>;
  classes?: Array<{ name: string; path: string; methodCount: number; cohesionScore?: number }>;
  directCalls?: Array<{ from: string; to: string; file: string; crossModule: boolean }>;
  modules?: Array<{ name: string; path: string; internalImports: number }>;
}
