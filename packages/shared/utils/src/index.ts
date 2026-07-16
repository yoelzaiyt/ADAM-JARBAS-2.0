export function generateId(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateCost(
  promptTokens: number,
  completionTokens: number,
  pricing: { promptPer1k: number; completionPer1k: number }
): number {
  return (
    (promptTokens / 1000) * pricing.promptPer1k +
    (completionTokens / 1000) * pricing.completionPer1k
  );
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export async function hashApiKey(key: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key + salt);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ProviderError extends AppError {
  constructor(
    provider: string,
    message: string,
    details?: unknown
  ) {
    super(`[${provider}] ${message}`, 'PROVIDER_ERROR', 502, details);
    this.name = 'ProviderError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterMs: number) {
    super('Rate limit exceeded', 'RATE_LIMITED', 429, { retryAfterMs });
    this.name = 'RateLimitError';
  }
}
