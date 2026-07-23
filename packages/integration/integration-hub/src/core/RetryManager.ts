import type { RetryConfig, RetryResult } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'RetryManager' });

export class RetryManager {
  private config: RetryConfig;

  constructor(config: RetryConfig) {
    this.config = config;
  }

  async execute<T>(
    fn: () => Promise<T>,
    context?: { apiId?: string; operation?: string }
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    let lastError: string | undefined;
    let attempts = 0;

    while (attempts <= this.config.maxRetries) {
      attempts++;

      try {
        const data = await fn();
        return {
          success: true,
          data,
          attempts,
          totalDuration: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        log.warn(`Attempt ${attempts} failed${context ? ` for ${context.apiId}/${context.operation}` : ''}`, { error: lastError });

        if (attempts <= this.config.maxRetries) {
          const delay = this.calculateDelay(attempts);
          log.debug(`Retrying in ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalDuration: Date.now() - startTime,
    };
  }

  private calculateDelay(attempt: number): number {
    switch (this.config.backoffType) {
      case 'exponential':
        return Math.min(
          this.config.initialDelay * Math.pow(2, attempt - 1),
          this.config.maxDelay
        );
      case 'linear':
        return Math.min(
          this.config.initialDelay * attempt,
          this.config.maxDelay
        );
      case 'fixed':
      default:
        return this.config.initialDelay;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isRetryable(statusCode: number): boolean {
    return this.config.retryableStatuses.includes(statusCode);
  }

  isRetryableError(error: string): boolean {
    return this.config.retryableErrors.some(retryable =>
      error.toLowerCase().includes(retryable.toLowerCase())
    );
  }

  getConfig(): RetryConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<RetryConfig>): void {
    Object.assign(this.config, config);
    log.info('Retry config updated', config);
  }
}
