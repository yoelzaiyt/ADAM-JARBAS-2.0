import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { Improvement, ImprovementType, ImprovementEngineConfig, Severity } from '../interfaces.js';

export class ImprovementEngine {
  private config: ImprovementEngineConfig;
  private improvements: Map<string, Improvement> = new Map();
  private log = createLogger('ImprovementEngine');

  constructor(config: ImprovementEngineConfig) {
    this.config = config;
  }

  async detectImprovements(scanData: ImprovementScanData): Promise<Improvement[]> {
    const results: Improvement[] = [];

    if (this.config.types.includes('code-duplication')) {
      results.push(...this.detectCodeDuplication(scanData));
    }
    if (this.config.types.includes('slow-api')) {
      results.push(...this.detectSlowAPIs(scanData));
    }
    if (this.config.types.includes('inefficient-query')) {
      results.push(...this.detectInefficientQueries(scanData));
    }
    if (this.config.types.includes('outdated-dependency')) {
      results.push(...this.detectOutdatedDependencies(scanData));
    }
    if (this.config.types.includes('unused-component')) {
      results.push(...this.detectUnusedComponents(scanData));
    }
    if (this.config.types.includes('low-test-coverage')) {
      results.push(...this.detectLowTestCoverage(scanData));
    }

    const filtered = results.filter(r => this.meetsSeverityThreshold(r.severity));
    for (const improvement of filtered) {
      this.improvements.set(improvement.id, improvement);
    }

    this.log(`Detected ${filtered.length} improvements`);
    return filtered;
  }

  private detectCodeDuplication(data: ImprovementScanData): Improvement[] {
    const results: Improvement[] = [];
    for (const dup of data.duplications || []) {
      results.push({
        id: generateId(),
        type: 'code-duplication',
        severity: dup.percentage > 30 ? 'high' : 'medium',
        title: `Code duplication in ${dup.module}`,
        description: `${dup.percentage}% code duplication detected`,
        location: dup.files.join(', '),
        currentMetrics: { duplicationPercentage: dup.percentage },
        suggestedAction: 'Extract common logic into shared utilities',
        estimatedImpact: dup.percentage * 0.8,
        estimatedEffort: 'medium',
        relatedFiles: dup.files,
        createdAt: new Date(),
        status: 'detected'
      });
    }
    return results;
  }

  private detectSlowAPIs(data: ImprovementScanData): Improvement[] {
    const results: Improvement[] = [];
    for (const api of data.slowAPIs || []) {
      if (api.avgLatency > 1000) {
        results.push({
          id: generateId(),
          type: 'slow-api',
          severity: api.avgLatency > 3000 ? 'critical' : 'high',
          title: `Slow API: ${api.endpoint}`,
          description: `Average latency is ${api.avgLatency}ms`,
          location: api.endpoint,
          currentMetrics: { avgLatency: api.avgLatency, p95: api.p95Latency },
          suggestedAction: 'Optimize database queries, add caching, or increase resources',
          estimatedImpact: Math.min(90, api.avgLatency / 50),
          estimatedEffort: api.avgLatency > 3000 ? 'hard' : 'medium',
          relatedFiles: [],
          createdAt: new Date(),
          status: 'detected'
        });
      }
    }
    return results;
  }

  private detectInefficientQueries(data: ImprovementScanData): Improvement[] {
    const results: Improvement[] = [];
    for (const query of data.inefficientQueries || []) {
      results.push({
        id: generateId(),
        type: 'inefficient-query',
        severity: query.executionTime > 5000 ? 'critical' : query.executionTime > 1000 ? 'high' : 'medium',
        title: `Inefficient query: ${query.name}`,
        description: `Query takes ${query.executionTime}ms to execute`,
        location: query.location,
        currentMetrics: { executionTime: query.executionTime, rowsScanned: query.rowsScanned },
        suggestedAction: 'Add indexes, optimize joins, or refactor query',
        estimatedImpact: Math.min(80, query.executionTime / 100),
        estimatedEffort: 'medium',
        relatedFiles: [query.location],
        createdAt: new Date(),
        status: 'detected'
      });
    }
    return results;
  }

  private detectOutdatedDependencies(data: ImprovementScanData): Improvement[] {
    const results: Improvement[] = [];
    for (const dep of data.outdatedDeps || []) {
      if (dep.versionsBehind > 2) {
        results.push({
          id: generateId(),
          type: 'outdated-dependency',
          severity: dep.securityIssues > 0 ? 'critical' : dep.versionsBehind > 5 ? 'high' : 'medium',
          title: `Outdated dependency: ${dep.name}`,
          description: `${dep.versionsBehind} versions behind, current: ${dep.currentVersion}, latest: ${dep.latestVersion}`,
          location: `package.json: ${dep.name}`,
          currentMetrics: { versionsBehind: dep.versionsBehind, securityIssues: dep.securityIssues },
          suggestedAction: dep.securityIssues > 0 ? 'Update immediately due to security issues' : 'Plan update during next maintenance window',
          estimatedImpact: dep.securityIssues > 0 ? 80 : 40,
          estimatedEffort: dep.versionsBehind > 5 ? 'hard' : 'easy',
          relatedFiles: ['package.json'],
          createdAt: new Date(),
          status: 'detected'
        });
      }
    }
    return results;
  }

  private detectUnusedComponents(data: ImprovementScanData): Improvement[] {
    const results: Improvement[] = [];
    for (const comp of data.unusedComponents || []) {
      results.push({
        id: generateId(),
        type: 'unused-component',
        severity: 'low',
        title: `Unused component: ${comp.name}`,
        description: `Component has not been used in ${comp.daysSinceLastUse} days`,
        location: comp.path,
        currentMetrics: { daysSinceLastUse: comp.daysSinceLastUse, referenceCount: comp.referenceCount },
        suggestedAction: 'Consider removing or archiving the component',
        estimatedImpact: 20,
        estimatedEffort: 'easy',
        relatedFiles: [comp.path],
        createdAt: new Date(),
        status: 'detected'
      });
    }
    return results;
  }

  private detectLowTestCoverage(data: ImprovementScanData): Improvement[] {
    const results: Improvement[] = [];
    for (const mod of data.lowCoverageModules || []) {
      if (mod.coverage < (this.config.types.includes('low-test-coverage') ? 90 : 70)) {
        results.push({
          id: generateId(),
          type: 'low-test-coverage',
          severity: mod.coverage < 50 ? 'high' : 'medium',
          title: `Low test coverage: ${mod.name}`,
          description: `Test coverage is ${mod.coverage}%`,
          location: mod.path,
          currentMetrics: { coverage: mod.coverage, lines: mod.lines, uncovered: mod.uncoveredLines },
          suggestedAction: 'Add unit and integration tests',
          estimatedImpact: (100 - mod.coverage) * 0.5,
          estimatedEffort: mod.uncoveredLines > 1000 ? 'hard' : 'medium',
          relatedFiles: [mod.path],
          createdAt: new Date(),
          status: 'detected'
        });
      }
    }
    return results;
  }

  private meetsSeverityThreshold(severity: Severity): boolean {
    const levels: Severity[] = ['low', 'medium', 'high', 'critical'];
    return levels.indexOf(severity) >= levels.indexOf(this.config.minSeverity);
  }

  getAll(): Improvement[] {
    return Array.from(this.improvements.values());
  }

  getById(id: string): Improvement | undefined {
    return this.improvements.get(id);
  }

  updateStatus(id: string, status: Improvement['status']): boolean {
    const improvement = this.improvements.get(id);
    if (improvement) {
      improvement.status = status;
      return true;
    }
    return false;
  }

  getByType(type: ImprovementType): Improvement[] {
    return Array.from(this.improvements.values()).filter(i => i.type === type);
  }

  getBySeverity(severity: Severity): Improvement[] {
    return Array.from(this.improvements.values()).filter(i => i.severity === severity);
  }

  getStats(): ImprovementStats {
    const all = Array.from(this.improvements.values());
    return {
      total: all.length,
      byType: this.groupByType(all),
      bySeverity: this.groupBySeverity(all),
      byStatus: this.groupByStatus(all),
      avgImpact: all.reduce((sum, i) => sum + i.estimatedImpact, 0) / all.length || 0
    };
  }

  private groupByType(items: Improvement[]): Record<string, number> {
    return items.reduce((acc, i) => { acc[i.type] = (acc[i.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  }

  private groupBySeverity(items: Improvement[]): Record<string, number> {
    return items.reduce((acc, i) => { acc[i.severity] = (acc[i.severity] || 0) + 1; return acc; }, {} as Record<string, number>);
  }

  private groupByStatus(items: Improvement[]): Record<string, number> {
    return items.reduce((acc, i) => { acc[i.status] = (acc[i.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  }
}

export interface ImprovementScanData {
  duplications?: Array<{ module: string; files: string[]; percentage: number }>;
  slowAPIs?: Array<{ endpoint: string; avgLatency: number; p95Latency: number }>;
  inefficientQueries?: Array<{ name: string; location: string; executionTime: number; rowsScanned: number }>;
  outdatedDeps?: Array<{ name: string; currentVersion: string; latestVersion: string; versionsBehind: number; securityIssues: number }>;
  unusedComponents?: Array<{ name: string; path: string; daysSinceLastUse: number; referenceCount: number }>;
  lowCoverageModules?: Array<{ name: string; path: string; coverage: number; lines: number; uncoveredLines: number }>;
}

export interface ImprovementStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  avgImpact: number;
}
