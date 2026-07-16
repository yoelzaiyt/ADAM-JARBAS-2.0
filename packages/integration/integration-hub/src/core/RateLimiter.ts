import type { RateLimitState, RateLimiterConfig } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'RateLimiter' });

export class RateLimiter {
  private states: Map<string, RateLimitState> = new Map();
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  canProceed(apiId: string): boolean {
    const state = this.states.get(apiId);
    if (!state) return true;

    if (Date.now() >= state.resetAt.getTime()) {
      this.resetWindow(apiId);
      return true;
    }

    return state.remaining > 0;
  }

  consume(apiId: string): boolean {
    if (!this.canProceed(apiId)) {
      log.warn(`Rate limit exceeded for API ${apiId}`);
      return false;
    }

    let state = this.states.get(apiId);
    if (!state || Date.now() >= state.resetAt.getTime()) {
      state = {
        apiId,
        requests: 0,
        resetAt: new Date(Date.now() + this.config.windowMs),
        remaining: this.config.maxRequests,
        limit: this.config.maxRequests,
      };
    }

    state.requests++;
    state.remaining = Math.max(0, state.limit - state.requests);
    this.states.set(apiId, state);

    return true;
  }

  private resetWindow(apiId: string): void {
    const state = this.states.get(apiId);
    if (state) {
      state.requests = 0;
      state.remaining = state.limit;
      state.resetAt = new Date(Date.now() + this.config.windowMs);
    }
  }

  getState(apiId: string): RateLimitState | undefined {
    return this.states.get(apiId);
  }

  getRetryAfterMs(apiId: string): number {
    const state = this.states.get(apiId);
    if (!state || state.remaining > 0) return 0;

    const now = Date.now();
    const resetTime = state.resetAt.getTime();
    return Math.max(0, resetTime - now);
  }

  updateConfig(apiId: string, maxRequests: number, windowMs: number): void {
    this.states.delete(apiId);
    log.info(`Rate limit config updated for API ${apiId}`, { maxRequests, windowMs });
  }

  getStats(): {
    tracked: number;
    totalRequests: number;
    totalRemaining: number;
    avgUtilization: number;
  } {
    const states = Array.from(this.states.values());
    const totalRequests = states.reduce((sum, s) => sum + s.requests, 0);
    const totalRemaining = states.reduce((sum, s) => sum + s.remaining, 0);
    const totalLimit = states.reduce((sum, s) => sum + s.limit, 0);

    return {
      tracked: states.length,
      totalRequests,
      totalRemaining,
      avgUtilization: totalLimit > 0 ? (totalRequests / totalLimit) * 100 : 0,
    };
  }
}
