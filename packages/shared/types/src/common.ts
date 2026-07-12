export interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CostEntry {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  timestamp: Date;
  tenantId: string;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyBy: 'ip' | 'tenant' | 'user';
}
