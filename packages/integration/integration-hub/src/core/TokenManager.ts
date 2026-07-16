import { generateId } from '@jarbas/utils';
import type { ApiToken, TokenManagerConfig } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'TokenManager' });

export class TokenManager {
  private tokens: Map<string, ApiToken> = new Map();
  private config: TokenManagerConfig;

  constructor(config: TokenManagerConfig) {
    this.config = config;
  }

  addToken(apiId: string, name: string, key: string, environment: ApiToken['environment'] = 'production'): ApiToken {
    if (this.tokens.size >= this.config.maxTokens) {
      throw new Error(`Maximum token limit (${this.config.maxTokens}) reached`);
    }

    const token: ApiToken = {
      id: generateId(),
      apiId,
      name,
      key,
      maskedKey: this.maskKey(key),
      environment,
      permissions: [],
      createdAt: new Date(),
      isActive: true,
    };

    this.tokens.set(token.id, token);
    log.info(`Token added for API ${apiId}`, { tokenId: token.id, name });
    return token;
  }

  private maskKey(key: string): string {
    if (key.length <= 8) return '****';
    return `${key.substring(0, 4)}****${key.substring(key.length - 4)}`;
  }

  getToken(id: string): ApiToken | undefined {
    return this.tokens.get(id);
  }

  getTokenByApi(apiId: string): ApiToken | undefined {
    return Array.from(this.tokens.values()).find(t => t.apiId === apiId && t.isActive);
  }

  listTokens(): ApiToken[] {
    return Array.from(this.tokens.values());
  }

  listTokensByApi(apiId: string): ApiToken[] {
    return Array.from(this.tokens.values()).filter(t => t.apiId === apiId);
  }

  revokeToken(id: string): boolean {
    const token = this.tokens.get(id);
    if (!token) return false;
    token.isActive = false;
    log.info(`Token revoked`, { tokenId: id });
    return true;
  }

  deleteToken(id: string): boolean {
    const deleted = this.tokens.delete(id);
    if (deleted) log.info(`Token deleted`, { tokenId: id });
    return deleted;
  }

  updateToken(id: string, updates: Partial<Pick<ApiToken, 'name' | 'key' | 'environment' | 'permissions'>>): ApiToken | undefined {
    const token = this.tokens.get(id);
    if (!token) return undefined;

    if (updates.name) token.name = updates.name;
    if (updates.key) {
      token.key = updates.key;
      token.maskedKey = this.maskKey(updates.key);
    }
    if (updates.environment) token.environment = updates.environment;
    if (updates.permissions) token.permissions = updates.permissions;

    log.info(`Token updated`, { tokenId: id });
    return token;
  }

  markUsed(id: string): void {
    const token = this.tokens.get(id);
    if (token) {
      token.lastUsed = new Date();
    }
  }

  getExpiredTokens(): ApiToken[] {
    const now = new Date();
    return Array.from(this.tokens.values()).filter(
      t => t.isActive && t.expiresAt && t.expiresAt < now
    );
  }

  getStaleTokens(daysThreshold: number = 30): ApiToken[] {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);
    return Array.from(this.tokens.values()).filter(
      t => t.isActive && (!t.lastUsed || t.lastUsed < threshold)
    );
  }

  getStats(): {
    total: number;
    active: number;
    byEnvironment: Record<string, number>;
    expired: number;
    stale: number;
  } {
    const tokens = this.listTokens();
    const byEnvironment: Record<string, number> = {};
    for (const token of tokens) {
      byEnvironment[token.environment] = (byEnvironment[token.environment] || 0) + 1;
    }
    return {
      total: tokens.length,
      active: tokens.filter(t => t.isActive).length,
      byEnvironment,
      expired: this.getExpiredTokens().length,
      stale: this.getStaleTokens().length,
    };
  }
}
