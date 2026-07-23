import {
  createHash,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from 'node:crypto';
import { randomUUID } from 'node:crypto';
import type {
  SecurityEngine as ISecurityEngine,
  SecurityConfig,
  Permission,
  AuditLog,
} from './interfaces.js';

const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ALGORITHM = 'aes-256-gcm';

export class SecurityEngine implements ISecurityEngine {
  private config: SecurityConfig;
  private auditLogs = new Map<string, AuditLog>();
  private permissions = new Map<string, Permission[]>();

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  async encrypt(data: string): Promise<string> {
    if (!this.config.encryptionEnabled || !this.config.encryptionKey) {
      return data;
    }

    const key = this.deriveKey(this.config.encryptionKey);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);

    return combined.toString('base64');
  }

  async decrypt(data: string): Promise<string> {
    if (!this.config.encryptionEnabled || !this.config.encryptionKey) {
      return data;
    }

    const key = this.deriveKey(this.config.encryptionKey);
    const combined = Buffer.from(data, 'base64');

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(
      IV_LENGTH,
      IV_LENGTH + AUTH_TAG_LENGTH,
    );
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async checkPermission(
    userId: string,
    permission: Permission,
  ): Promise<boolean> {
    if (!this.config.accessControl) {
      return true;
    }

    const userPerms = this.permissions.get(userId);
    if (!userPerms) return false;

    return userPerms.some(
      (p) =>
        p.resource === permission.resource &&
        (p.action === permission.action || p.action === 'admin'),
    );
  }

  async logAudit(
    entry: Omit<AuditLog, 'id' | 'timestamp'>,
  ): Promise<AuditLog> {
    const log: AuditLog = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date(),
    };

    this.auditLogs.set(log.id, log);
    return log;
  }

  async getAuditLogs(
    filters?: {
      tenantId?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<AuditLog[]> {
    let logs = [...this.auditLogs.values()];

    if (filters) {
      if (filters.tenantId) {
        logs = logs.filter((l) => l.tenantId === filters.tenantId);
      }
      if (filters.userId) {
        logs = logs.filter((l) => l.userId === filters.userId);
      }
      if (filters.startDate) {
        const start = filters.startDate.getTime();
        logs = logs.filter((l) => l.timestamp.getTime() >= start);
      }
      if (filters.endDate) {
        const end = filters.endDate.getTime();
        logs = logs.filter((l) => l.timestamp.getTime() <= end);
      }
    }

    return logs;
  }

  sanitize(content: string): string {
    let result = content;

    result = result.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL]',
    );

    result = result.replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/g,
      '[PHONE]',
    );

    result = result.replace(
      /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
      '[CPF]',
    );

    return result;
  }

  validateLGPD(data: Record<string, unknown>): {
    compliant: boolean;
    issues: string[];
  } {
    if (!this.config.lgpdEnabled) {
      return { compliant: true, issues: [] };
    }

    const issues: string[] = [];

    if (!data.consent) {
      issues.push('Missing required consent field');
    }

    if (!data.purpose) {
      issues.push('Missing required purpose field');
    }

    if (!data.dataCategory) {
      issues.push('Missing required dataCategory field');
    }

    const sensitiveFields = ['cpf', 'rg', 'healthData', 'biometricData'];
    for (const field of sensitiveFields) {
      if (data[field] && !data.consent) {
        issues.push(
          `Sensitive data field "${field}" present without consent`,
        );
      }
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  private deriveKey(key: string): Buffer {
    return createHash('sha256').update(key).digest();
  }
}
