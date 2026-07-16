import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function env(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined || val === '') throw new Error(`Missing env var: ${key}`);
  return val;
}

export const config = {
  nodeEnv: env('NODE_ENV', 'development'),
  port: parseInt(env('PORT', '3000'), 10),
  logLevel: env('LOG_LEVEL', 'info'),

  database: {
    url: env('DATABASE_URL'),
  },

  redis: {
    url: env('REDIS_URL', 'redis://localhost:6379'),
  },

  qdrant: {
    url: env('QDRANT_URL', 'http://localhost:6333'),
    apiKey: process.env.QDRANT_API_KEY,
  },

  jwt: {
    secret: env('JWT_SECRET'),
    expiresIn: env('JWT_EXPIRES_IN', '15m'),
    refreshExpiresIn: env('JWT_REFRESH_EXPIRES_IN', '7d'),
  },

  apiKeySalt: env('API_KEY_SALT'),

  providers: {
    openrouter: {
      apiKey: env('OPENROUTER_API_KEY', ''),
      baseUrl: env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    },
    deepseek: {
      apiKey: env('DEEPSEEK_API_KEY', ''),
      baseUrl: env('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
    },
    nvidia: {
      apiKey: env('NVIDIA_API_KEY', ''),
      baseUrl: env('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1'),
    },
    ollama: {
      baseUrl: env('OLLAMA_BASE_URL', 'http://localhost:11434'),
    },
    opencode: {
      baseUrl: env('OPENCODE_BASE_URL', 'http://localhost:4096'),
    },
    zhipuai: {
      apiKey: env('ZHIPUAI_API_KEY', ''),
      baseUrl: env('ZHIPUAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4'),
    },
    hermes: {
      apiKey: env('HERMES_API_KEY', ''),
      baseUrl: env('HERMES_BASE_URL', 'https://api.nousresearch.com/v1'),
    },
  },

  costControl: {
    monthlyBudgetLimit: parseFloat(env('MONTHLY_BUDGET_LIMIT', '100')),
    alertThreshold: parseInt(env('COST_ALERT_THRESHOLD', '80'), 10),
  },

  rateLimit: {
    windowMs: parseInt(env('RATE_LIMIT_WINDOW_MS', '60000'), 10),
    maxRequests: parseInt(env('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  },

  memory: {
    collection: env('MEMORY_COLLECTION', 'jarbas_memory'),
    vectorSize: parseInt(env('MEMORY_VECTOR_SIZE', '1536'), 10),
  },

  multiTenancy: {
    enabled: env('TENANT_ISOLATION', 'true') === 'true',
    maxTenants: parseInt(env('MAX_TENANTS', '100'), 10),
  },

  brainapi: {
    url: env('BRAINAPI_URL', 'http://localhost:8000'),
    token: env('BRAINAPI_TOKEN', ''),
    brainId: env('BRAINAPI_BRAIN_ID', 'jarbas-default-brain'),
  },

  supabase: {
    url: env('SUPABASE_URL'),
    anonKey: env('SUPABASE_ANON_KEY'),
  },

  cors: {
    origins: env('CORS_ORIGINS', 'http://localhost:3000').split(','),
  },
} as const;
