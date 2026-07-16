// ─── Security ────────────────────────────────────────────────────────────────
// OAuth, encryption, PII detection, content filtering

import type {
  SecurityAnalysis,
  SecurityIssue,
  PIIInfo,
  SecurityConfig,
  BoundingBox,
} from './interfaces.js';

export class Security {
  private config: SecurityConfig;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      enablePIIDetection: config?.enablePIIDetection ?? true,
      enableContentFiltering: config?.enableContentFiltering ?? true,
      enableMalwareDetection: config?.enableMalwareDetection ?? true,
      safeSearch: config?.safeSearch ?? true,
      maxFileSize: config?.maxFileSize ?? 10 * 1024 * 1024, // 10MB
    };
  }

  async analyze(
    imageData: Buffer | string,
    options?: { detectPII?: boolean; filterContent?: boolean }
  ): Promise<SecurityAnalysis> {
    const issues: SecurityIssue[] = [];
    const piiDetected: PIIInfo[] = [];
    const contentWarnings: string[] = [];

    // PII Detection
    if (this.config.enablePIIDetection && (options?.detectPII !== false)) {
      const pii = this.detectPII(imageData);
      piiDetected.push(...pii);
    }

    // Content Filtering
    if (this.config.enableContentFiltering && (options?.filterContent !== false)) {
      const warnings = this.checkContent(imageData);
      contentWarnings.push(...warnings);
    }

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(issues, piiDetected, contentWarnings);

    return {
      riskLevel,
      issues,
      piiDetected,
      contentWarnings,
      safeForWork: contentWarnings.length === 0,
    };
  }

  private detectPII(data: Buffer | string): PIIInfo[] {
    const pii: PIIInfo[] = [];
    const text = typeof data === 'string' ? data : data.toString('utf-8');

    // Email detection
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailPattern) || [];
    for (const email of emails) {
      pii.push({
        type: 'email',
        value: email,
        confidence: 0.95,
      });
    }

    // Phone detection
    const phonePattern = /[\+]?[(]?\d{3}[)]?[-\s.]?\d{3}[-\s.]?\d{4,6}/g;
    const phones = text.match(phonePattern) || [];
    for (const phone of phones) {
      pii.push({
        type: 'phone',
        value: phone,
        confidence: 0.85,
      });
    }

    // CPF detection (Brazilian)
    const cpfPattern = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
    const cpfs = text.match(cpfPattern) || [];
    for (const cpf of cpfs) {
      pii.push({
        type: 'document',
        value: cpf,
        confidence: 0.9,
      });
    }

    return pii;
  }

  private checkContent(data: Buffer | string): string[] {
    const warnings: string[] = [];
    const text = typeof data === 'string' ? data : data.toString('utf-8');

    // Basic content checks
    const sensitiveKeywords = ['password', 'senha', 'secret', 'segredo'];
    const lowerText = text.toLowerCase();

    for (const keyword of sensitiveKeywords) {
      if (lowerText.includes(keyword)) {
        warnings.push(`Sensitive keyword detected: ${keyword}`);
      }
    }

    return warnings;
  }

  private calculateRiskLevel(
    issues: SecurityIssue[],
    pii: PIIInfo[],
    warnings: string[]
  ): SecurityAnalysis['riskLevel'] {
    if (issues.some(i => i.severity === 'high') || warnings.length > 3) {
      return 'critical';
    }
    if (issues.length > 0 || pii.length > 2) {
      return 'high';
    }
    if (pii.length > 0 || warnings.length > 0) {
      return 'medium';
    }
    return 'low';
  }

  validateFileSize(size: number): boolean {
    return size <= this.config.maxFileSize;
  }

  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<SecurityConfig>): void {
    Object.assign(this.config, updates);
  }
}
