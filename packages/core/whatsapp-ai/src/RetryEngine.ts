import type {
  RetryEngine as IRetryEngine,
  RetryConfig,
} from './interfaces.js';

export class RetryEngine implements IRetryEngine {
  private retryCounts: Map<string, number> = new Map();
  private defaultConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
  };

  async execute<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T> {
    const cfg = config ?? this.defaultConfig;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err as Error;
        const delay = Math.min(
          cfg.baseDelayMs * Math.pow(cfg.backoffMultiplier, attempt),
          cfg.maxDelayMs
        );
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw lastError;
  }

  getRetryCount(itemId: string): number {
    return this.retryCounts.get(itemId) ?? 0;
  }

  reset(itemId: string): void {
    this.retryCounts.delete(itemId);
  }
}
