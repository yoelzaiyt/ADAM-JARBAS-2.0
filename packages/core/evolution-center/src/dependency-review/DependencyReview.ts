import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { DependencyReviewConfig, DependencyInfo } from '../interfaces.js';

export class DependencyReview {
  private config: DependencyReviewConfig;
  private dependencies: Map<string, DependencyInfo> = new Map();
  private log = createLogger('DependencyReview');

  constructor(config: DependencyReviewConfig) {
    this.config = config;
  }

  async analyzeDependencies(deps: DependencyInfo[]): Promise<DependencyAnalysis> {
    for (const dep of deps) {
      this.dependencies.set(dep.name, dep);
    }

    const outdated = deps.filter(d => d.outdated);
    const deprecated = deps.filter(d => d.deprecated);
    const insecure = deps.filter(d => d.securityIssues > 0);
    const unlicensed = deps.filter(d => !d.license || d.license === 'UNKNOWN');
    const disallowed = deps.filter(d => !this.config.allowedLicenses.includes(d.license));

    return {
      total: deps.length,
      outdated: outdated.length,
      deprecated: deprecated.length,
      securityIssues: insecure.length,
      unlicensed: unlicensed.length,
      disallowedLicense: disallowed.length,
      outdatedList: outdated,
      deprecatedList: deprecated,
      insecureList: insecure,
      unlicensedList: unlicensed,
      disallowedList: disallowed,
      recommendations: this.generateRecommendations(outdated, deprecated, insecure, disallowed)
    };
  }

  private generateRecommendations(outdated: DependencyInfo[], deprecated: DependencyInfo[], insecure: DependencyInfo[], disallowed: DependencyInfo[]): string[] {
    const recs: string[] = [];
    if (insecure.length > 0) {
      recs.push(`URGENT: Update ${insecure.length} dependencies with security issues`);
    }
    if (deprecated.length > 0) {
      recs.push(`Replace ${deprecated.length} deprecated dependencies`);
    }
    if (outdated.length > 5) {
      recs.push(`${outdated.length} dependencies are outdated - schedule update`);
    }
    if (disallowed.length > 0) {
      recs.push(`${disallowed.length} dependencies have disallowed licenses`);
    }
    return recs;
  }

  getAll(): DependencyInfo[] {
    return Array.from(this.dependencies.values());
  }

  getOutdated(): DependencyInfo[] {
    return Array.from(this.dependencies.values()).filter(d => d.outdated);
  }

  getInsecure(): DependencyInfo[] {
    return Array.from(this.dependencies.values()).filter(d => d.securityIssues > 0);
  }

  getByName(name: string): DependencyInfo | undefined {
    return this.dependencies.get(name);
  }
}

export interface DependencyAnalysis {
  total: number;
  outdated: number;
  deprecated: number;
  securityIssues: number;
  unlicensed: number;
  disallowedLicense: number;
  outdatedList: DependencyInfo[];
  deprecatedList: DependencyInfo[];
  insecureList: DependencyInfo[];
  unlicensedList: DependencyInfo[];
  disallowedList: DependencyInfo[];
  recommendations: string[];
}
