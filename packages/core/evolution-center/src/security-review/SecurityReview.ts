import { generateId } from '@jarbas/utils';
import { createLogger } from '../Logger.js';
import type { SecurityReviewConfig, SecurityVulnerability, VulnerabilityType, Severity } from '../interfaces.js';

export class SecurityReview {
  private config: SecurityReviewConfig;
  private vulnerabilities: Map<string, SecurityVulnerability> = new Map();
  private log = createLogger('SecurityReview');

  constructor(config: SecurityReviewConfig) {
    this.config = config;
  }

  async runReview(reviewData: SecurityReviewData): Promise<SecurityVulnerability[]> {
    const results: SecurityVulnerability[] = [];

    for (const dep of reviewData.dependencies || []) {
      if (dep.knownVulnerabilities > 0) {
        results.push({
          id: generateId(), type: 'known-vulnerability',
          severity: dep.severity || 'high',
          title: `Known vulnerability in ${dep.name}`,
          description: `${dep.knownVulnerabilities} known vulnerabilities`,
          affectedComponent: dep.name,
          recommendation: `Update ${dep.name} to latest version`,
          cveId: dep.cveId, cvssScore: dep.cvssScore,
          autoFixable: false, detectedAt: new Date()
        });
      }
    }

    for (const secret of reviewData.exposedSecrets || []) {
      results.push({
        id: generateId(), type: 'exposed-secret',
        severity: 'critical',
        title: `Exposed secret: ${secret.type}`,
        description: `Secret found in ${secret.location}`,
        affectedComponent: secret.location,
        recommendation: 'Move to environment variables or secrets manager',
        autoFixable: false, detectedAt: new Date()
      });
    }

    for (const perm of reviewData.permissionIssues || []) {
      results.push({
        id: generateId(), type: 'permission-escalation',
        severity: perm.severity,
        title: `Permission issue: ${perm.description}`,
        description: perm.details,
        affectedComponent: perm.component,
        recommendation: perm.recommendation,
        autoFixable: false, detectedAt: new Date()
      });
    }

    for (const config of reviewData.insecureConfigs || []) {
      results.push({
        id: generateId(), type: 'insecure-config',
        severity: config.severity,
        title: `Insecure configuration: ${config.name}`,
        description: config.details,
        affectedComponent: config.component,
        recommendation: config.recommendation,
        autoFixable: true, detectedAt: new Date()
      });
    }

    for (const v of results) {
      this.vulnerabilities.set(v.id, v);
    }
    this.log(`Security review: ${results.length} vulnerabilities found`);
    return results;
  }

  getAll(): SecurityVulnerability[] {
    return Array.from(this.vulnerabilities.values());
  }

  getByType(type: VulnerabilityType): SecurityVulnerability[] {
    return Array.from(this.vulnerabilities.values()).filter(v => v.type === type);
  }

  getBySeverity(severity: Severity): SecurityVulnerability[] {
    return Array.from(this.vulnerabilities.values()).filter(v => v.severity === severity);
  }

  getCriticalVulnerabilities(): SecurityVulnerability[] {
    return this.getBySeverity('critical');
  }

  getStats(): { total: number; byType: Record<string, number>; bySeverity: Record<string, number> } {
    const all = Array.from(this.vulnerabilities.values());
    return {
      total: all.length,
      byType: all.reduce((acc, v) => { acc[v.type] = (acc[v.type] || 0) + 1; return acc; }, {} as Record<string, number>),
      bySeverity: all.reduce((acc, v) => { acc[v.severity] = (acc[v.severity] || 0) + 1; return acc; }, {} as Record<string, number>)
    };
  }
}

export interface SecurityReviewData {
  dependencies?: Array<{ name: string; knownVulnerabilities: number; cveId?: string; cvssScore?: number; severity?: Severity }>;
  exposedSecrets?: Array<{ type: string; location: string }>;
  permissionIssues?: Array<{ description: string; details: string; component: string; severity: Severity; recommendation: string }>;
  insecureConfigs?: Array<{ name: string; details: string; component: string; severity: Severity; recommendation: string }>;
}
