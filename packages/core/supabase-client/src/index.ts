export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseUser {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  role: string;
  created_at: string;
  last_login_at?: string;
}

export interface SupabaseTenant {
  id: string;
  name: string;
  plan: string;
  max_requests_per_month: number;
  created_at: string;
}

export interface SupabaseAPIKey {
  id: string;
  key: string;
  name: string;
  user_id: string;
  tenant_id: string;
  permissions: string[];
  created_at: string;
  expires_at?: string;
}

export interface SupabaseChatLog {
  id: string;
  user_id: string;
  tenant_id: string;
  provider: string;
  model: string;
  messages: unknown;
  response: string;
  tokens_used: number;
  cost_usd: number;
  latency_ms: number;
  created_at: string;
}

export interface SupabaseSkill {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  tools: unknown;
  tags: string[];
  author: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseClient {
  private config: SupabaseConfig;

  constructor(config: SupabaseConfig) {
    this.config = config;
  }

  private async fetch<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.config.url}/rest/v1${endpoint}`);

    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: options.method === 'POST' ? 'return=representation' : undefined as any,
      ...options.headers,
    };

    const response = await fetch(url.toString(), {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Supabase error ${response.status}: ${errorBody}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  // ============================================================
  // USERS
  // ============================================================
  async createUser(user: Omit<SupabaseUser, 'id' | 'created_at'>): Promise<SupabaseUser> {
    const result = await this.fetch<SupabaseUser[]>('/users', {
      method: 'POST',
      body: { ...user, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    });
    return result[0];
  }

  async getUser(id: string): Promise<SupabaseUser | null> {
    const result = await this.fetch<SupabaseUser[]>('/users', {
      params: { id: `eq.${id}`, select: '*' },
    });
    return result[0] ?? null;
  }

  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    const result = await this.fetch<SupabaseUser[]>('/users', {
      params: { email: `eq.${email}`, select: '*' },
    });
    return result[0] ?? null;
  }

  async updateUser(id: string, updates: Partial<SupabaseUser>): Promise<SupabaseUser> {
    const result = await this.fetch<SupabaseUser[]>('/users', {
      method: 'PATCH',
      body: updates,
      params: { id: `eq.${id}`, select: '*' },
    });
    return result[0];
  }

  async listUsers(tenantId?: string): Promise<SupabaseUser[]> {
    const params: Record<string, string> = { select: '*', order: 'created_at.desc' };
    if (tenantId) params.tenant_id = `eq.${tenantId}`;
    return this.fetch<SupabaseUser[]>('/users', { params });
  }

  // ============================================================
  // TENANTS
  // ============================================================
  async createTenant(tenant: Omit<SupabaseTenant, 'id' | 'created_at'>): Promise<SupabaseTenant> {
    const result = await this.fetch<SupabaseTenant[]>('/tenants', {
      method: 'POST',
      body: { ...tenant, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    });
    return result[0];
  }

  async getTenant(id: string): Promise<SupabaseTenant | null> {
    const result = await this.fetch<SupabaseTenant[]>('/tenants', {
      params: { id: `eq.${id}`, select: '*' },
    });
    return result[0] ?? null;
  }

  async updateTenant(id: string, updates: Partial<SupabaseTenant>): Promise<SupabaseTenant> {
    const result = await this.fetch<SupabaseTenant[]>('/tenants', {
      method: 'PATCH',
      body: updates,
      params: { id: `eq.${id}`, select: '*' },
    });
    return result[0];
  }

  // ============================================================
  // API KEYS
  // ============================================================
  async createAPIKey(key: Omit<SupabaseAPIKey, 'id' | 'created_at'>): Promise<SupabaseAPIKey> {
    const result = await this.fetch<SupabaseAPIKey[]>('/api_keys', {
      method: 'POST',
      body: { ...key, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    });
    return result[0];
  }

  async getAPIKey(keyValue: string): Promise<SupabaseAPIKey | null> {
    const result = await this.fetch<SupabaseAPIKey[]>('/api_keys', {
      params: { key: `eq.${keyValue}`, select: '*' },
    });
    return result[0] ?? null;
  }

  async listAPIKeys(userId: string): Promise<SupabaseAPIKey[]> {
    return this.fetch<SupabaseAPIKey[]>('/api_keys', {
      params: { user_id: `eq.${userId}`, select: '*', order: 'created_at.desc' },
    });
  }

  async deleteAPIKey(id: string): Promise<void> {
    await this.fetch('/api_keys', {
      method: 'DELETE',
      params: { id: `eq.${id}` },
    });
  }

  // ============================================================
  // CHAT LOGS
  // ============================================================
  async logChat(log: Omit<SupabaseChatLog, 'id' | 'created_at'>): Promise<SupabaseChatLog> {
    const result = await this.fetch<SupabaseChatLog[]>('/chat_logs', {
      method: 'POST',
      body: { ...log, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    });
    return result[0];
  }

  async getChatLogs(userId: string, limit = 50): Promise<SupabaseChatLog[]> {
    return this.fetch<SupabaseChatLog[]>('/chat_logs', {
      params: {
        user_id: `eq.${userId}`,
        select: '*',
        order: 'created_at.desc',
        limit: limit.toString(),
      },
    });
  }

  async getChatLogsByTenant(tenantId: string, limit = 100): Promise<SupabaseChatLog[]> {
    return this.fetch<SupabaseChatLog[]>('/chat_logs', {
      params: {
        tenant_id: `eq.${tenantId}`,
        select: '*',
        order: 'created_at.desc',
        limit: limit.toString(),
      },
    });
  }

  async getChatStats(tenantId: string): Promise<{
    total_chats: number;
    total_tokens: number;
    total_cost: number;
    avg_latency: number;
  }> {
    const logs = await this.getChatLogsByTenant(tenantId, 10000);
    return {
      total_chats: logs.length,
      total_tokens: logs.reduce((sum, l) => sum + l.tokens_used, 0),
      total_cost: logs.reduce((sum, l) => sum + l.cost_usd, 0),
      avg_latency: logs.length > 0 ? logs.reduce((sum, l) => sum + l.latency_ms, 0) / logs.length : 0,
    };
  }

  // ============================================================
  // SKILLS
  // ============================================================
  async saveSkill(skill: Omit<SupabaseSkill, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseSkill> {
    const now = new Date().toISOString();
    const result = await this.fetch<SupabaseSkill[]>('/skills', {
      method: 'POST',
      body: { ...skill, id: crypto.randomUUID(), created_at: now, updated_at: now },
    });
    return result[0];
  }

  async getSkill(id: string): Promise<SupabaseSkill | null> {
    const result = await this.fetch<SupabaseSkill[]>('/skills', {
      params: { id: `eq.${id}`, select: '*' },
    });
    return result[0] ?? null;
  }

  async listSkills(): Promise<SupabaseSkill[]> {
    return this.fetch<SupabaseSkill[]>('/skills', {
      params: { select: '*', order: 'created_at.desc' },
    });
  }

  async updateSkill(id: string, updates: Partial<SupabaseSkill>): Promise<SupabaseSkill> {
    const result = await this.fetch<SupabaseSkill[]>('/skills', {
      method: 'PATCH',
      body: { ...updates, updated_at: new Date().toISOString() },
      params: { id: `eq.${id}`, select: '*' },
    });
    return result[0];
  }

  async deleteSkill(id: string): Promise<void> {
    await this.fetch('/skills', {
      method: 'DELETE',
      params: { id: `eq.${id}` },
    });
  }

  // ============================================================
  // HEALTH CHECK
  // ============================================================
  async healthCheck(): Promise<{ status: string; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.fetch('/users', { params: { select: 'id', limit: '1' } });
      return { status: 'healthy', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }
}

export const createSupabaseClient = (config: SupabaseConfig): SupabaseClient => {
  return new SupabaseClient(config);
};
