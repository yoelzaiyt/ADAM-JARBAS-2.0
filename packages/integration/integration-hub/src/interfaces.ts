// Integration Hub - All Interfaces

// ==================== API REGISTRY ====================
export type ApiPriority = 'essential' | 'important' | 'optional' | 'experimental';
export type ApiStatus = 'active' | 'deprecated' | 'sunset' | 'maintenance' | 'unknown';
export type AuthType = 'none' | 'apiKey' | 'oauth' | 'basic' | 'bearer' | 'custom';
export type CorsSupport = 'yes' | 'no' | 'unknown';
export type HttpsSupport = 'yes' | 'no';

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  documentation: string;
  category: string;
  subcategory?: string;
  auth: AuthType;
  authUrl?: string;
  https: HttpsSupport;
  cors: CorsSupport;
  priority: ApiPriority;
  status: ApiStatus;
  tags: string[];
  rateLimit?: RateLimitInfo;
  pricing?: PricingInfo;
  alternatives: string[];
  relatedApis: string[];
  lastVerified: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimitInfo {
  requests: number;
  period: 'second' | 'minute' | 'hour' | 'day' | 'month';
  freeTier: boolean;
  description?: string;
}

export interface PricingInfo {
  free: boolean;
  freeTierLimit?: number;
  plans: PricingPlan[];
}

export interface PricingPlan {
  name: string;
  price: number;
  period: 'month' | 'year';
  requests: number;
  features: string[];
}

// ==================== CATEGORY MANAGEMENT ====================
export interface ApiCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  totalApis: number;
  activeApis: number;
  essentialCount: number;
  importantCount: number;
  priority: ApiPriority;
  tags: string[];
}

// ==================== TOKEN MANAGER ====================
export interface ApiToken {
  id: string;
  apiId: string;
  name: string;
  key: string;
  maskedKey: string;
  environment: 'production' | 'development' | 'testing';
  permissions: string[];
  expiresAt?: Date;
  lastUsed?: Date;
  createdAt: Date;
  isActive: boolean;
}

export interface TokenManagerConfig {
  encryptionKey: string;
  storageType: 'memory' | 'file' | 'database';
  maxTokens: number;
  autoRotate: boolean;
  rotationDays: number;
}

// ==================== OAUTH MANAGER ====================
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  apiName: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
  scope: string[];
}

export interface OAuthState {
  apiId: string;
  status: 'idle' | 'authorizing' | 'authorized' | 'expired' | 'error';
  token?: OAuthToken;
  error?: string;
}

// ==================== HEALTH CHECK ====================
export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface HealthCheckResult {
  apiId: string;
  status: HealthStatus;
  latency: number;
  statusCode: number;
  error?: string;
  timestamp: Date;
  uptime: number;
}

export interface HealthCheckConfig {
  interval: number;
  timeout: number;
  retries: number;
  endpoints: string[];
}

// ==================== RATE LIMITER ====================
export interface RateLimitState {
  apiId: string;
  requests: number;
  resetAt: Date;
  remaining: number;
  limit: number;
}

export interface RateLimiterConfig {
  strategy: 'sliding-window' | 'fixed-window' | 'token-bucket' | 'leaky-bucket';
  maxRequests: number;
  windowMs: number;
  retryAfterMs: number;
}

// ==================== CACHE MANAGER ====================
export interface CacheEntry {
  key: string;
  value: unknown;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
}

export interface CacheConfig {
  strategy: 'memory' | 'redis' | 'file';
  maxSize: number;
  defaultTtl: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
}

// ==================== RETRY MANAGER ====================
export interface RetryConfig {
  maxRetries: number;
  backoffType: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  retryableErrors: string[];
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  totalDuration: number;
}

// ==================== FAILOVER MANAGER ====================
export interface FailoverConfig {
  enabled: boolean;
  maxFailures: number;
  cooldownPeriod: number;
  healthCheckEnabled: boolean;
}

export interface FailoverState {
  apiId: string;
  isFailedOver: boolean;
  failureCount: number;
  lastFailure?: Date;
  nextRetry?: Date;
  fallbackApiId?: string;
}

// ==================== REQUEST BUILDER ====================
export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  body?: unknown;
  query?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  headers: Record<string, string>;
  latency: number;
  cached: boolean;
}

// ==================== INTELLIGENCE ====================
export type ComparisonMetric = 'latency' | 'uptime' | 'pricing' | 'features' | 'auth' | 'cors' | 'docs';

export interface ApiComparison {
  apiA: string;
  apiB: string;
  metrics: Record<ComparisonMetric, ComparisonResult>;
  recommendation: string;
  confidence: number;
}

export interface ComparisonResult {
  winner: 'apiA' | 'apiB' | 'tie';
  scoreA: number;
  scoreB: number;
  explanation: string;
}

export interface DiscoveryQuery {
  category?: string;
  auth?: AuthType;
  https?: boolean;
  cors?: boolean;
  free?: boolean;
  tags?: string[];
  priority?: ApiPriority;
  search?: string;
}

export interface DiscoveryResult {
  apis: ApiEndpoint[];
  total: number;
  filters: DiscoveryQuery;
  suggestions: string[];
}

export interface ReplacementSuggestion {
  currentApi: string;
  suggestedApi: string;
  reason: string;
  similarity: number;
  migrationEffort: 'trivial' | 'easy' | 'medium' | 'hard';
  benefits: string[];
  risks: string[];
}

// ==================== SDK GENERATOR ====================
export interface SdkConfig {
  language: 'typescript' | 'python' | 'go' | 'java' | 'csharp';
  apiId: string;
  options: SdkOptions;
}

export interface SdkOptions {
  includeTypes: boolean;
  includeTests: boolean;
  includeExamples: boolean;
  retryConfig?: RetryConfig;
  cacheConfig?: CacheConfig;
}

export interface GeneratedSdk {
  language: string;
  apiId: string;
  files: SdkFile[];
  generatedAt: Date;
  version: string;
}

export interface SdkFile {
  name: string;
  content: string;
  path: string;
}

// ==================== MONITORING ====================
export interface ApiMetrics {
  apiId: string;
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  errorRate: number;
  lastChecked: Date;
  period: string;
}

export interface MonitoringAlert {
  id: string;
  apiId: string;
  type: 'downtime' | 'slow-response' | 'high-error-rate' | 'rate-limit' | 'deprecation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

// ==================== INTEGRATION HUB MAIN ====================
export interface IntegrationHubConfig {
  enabled: boolean;
  database: DatabaseConfig;
  tokenManager: TokenManagerConfig;
  rateLimiter: RateLimiterConfig;
  cache: CacheConfig;
  retry: RetryConfig;
  failover: FailoverConfig;
  healthCheck: HealthCheckConfig;
  monitoring: MonitoringConfig;
}

export interface DatabaseConfig {
  type: 'sqlite' | 'postgresql' | 'mongodb';
  url: string;
  maxConnections: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  interval: number;
  alerts: MonitoringAlert[];
  metrics: ApiMetrics[];
}
