import type { FailoverConfig, FailoverState } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'FailoverManager' });

export class FailoverManager {
  private states: Map<string, FailoverState> = new Map();
  private config: FailoverConfig;

  constructor(config: FailoverConfig) {
    this.config = config;
  }

  recordFailure(apiId: string): FailoverState {
    let state = this.states.get(apiId) || {
      apiId,
      isFailedOver: false,
      failureCount: 0,
    };

    state.failureCount++;
    state.lastFailure = new Date();

    if (state.failureCount >= this.config.maxFailures && !state.isFailedOver) {
      state.isFailedOver = true;
      state.nextRetry = new Date(Date.now() + this.config.cooldownPeriod);
      log.warn(`Failover triggered for API ${apiId}`, {
        failureCount: state.failureCount,
        nextRetry: state.nextRetry,
      });
    }

    this.states.set(apiId, state);
    return state;
  }

  recordSuccess(apiId: string): void {
    const state = this.states.get(apiId);
    if (state) {
      state.failureCount = 0;
      state.isFailedOver = false;
      state.nextRetry = undefined;
      this.states.set(apiId, state);
      log.info(`API ${apiId} recovered from failover`);
    }
  }

  shouldFailover(apiId: string): boolean {
    const state = this.states.get(apiId);
    if (!state) return false;

    if (!state.isFailedOver) return false;

    if (state.nextRetry && Date.now() >= state.nextRetry.getTime()) {
      state.isFailedOver = false;
      state.nextRetry = undefined;
      this.states.set(apiId, state);
      log.info(`Failover cooldown ended for API ${apiId}, retrying`);
      return false;
    }

    return true;
  }

  getState(apiId: string): FailoverState | undefined {
    return this.states.get(apiId);
  }

  setFallback(apiId: string, fallbackApiId: string): void {
    const state = this.states.get(apiId) || {
      apiId,
      isFailedOver: false,
      failureCount: 0,
    };
    state.fallbackApiId = fallbackApiId;
    this.states.set(apiId, state);
    log.info(`Fallback set for API ${apiId}: ${fallbackApiId}`);
  }

  getFailedApis(): FailoverState[] {
    return Array.from(this.states.values()).filter(s => s.isFailedOver);
  }

  getStats(): {
    total: number;
    failedOver: number;
    avgFailures: number;
  } {
    const states = Array.from(this.states.values());
    return {
      total: states.length,
      failedOver: states.filter(s => s.isFailedOver).length,
      avgFailures: states.length > 0 ? states.reduce((sum, s) => sum + s.failureCount, 0) / states.length : 0,
    };
  }
}
