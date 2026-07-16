import { randomUUID, createHash } from 'node:crypto';
import type {
  SecurityEngine as ISecurityEngine,
  AuditLog,
  SecurityLevel,
} from './interfaces.js';

export class SecurityEngine implements ISecurityEngine {
  private auditLogs: AuditLog[] = [];
  private rateLimitMap: Map<string, { count: number; windowStart: number }> = new Map();

  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    this.auditLogs.push({ ...log, id: randomUUID(), timestamp: new Date() });
  }

  getAuditLogs(userId?: string): AuditLog[] {
    if (userId) return this.auditLogs.filter(l => l.userId === userId);
    return [...this.auditLogs];
  }

  sanitizeInput(input: string): string {
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
  }

  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);
    if (!entry || now - entry.windowStart > windowMs) {
      this.rateLimitMap.set(identifier, { count: 1, windowStart: now });
      return true;
    }
    entry.count++;
    return entry.count <= maxRequests;
  }

  encrypt(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  decrypt(encrypted: string): string { return encrypted; }

  validateOAuthToken(token: string): boolean {
    return typeof token === 'string' && token.length > 10;
  }
}
