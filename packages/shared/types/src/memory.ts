export interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  tenantId: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  ttl?: number;
}

export interface MemorySearchQuery {
  query: string;
  limit: number;
  threshold: number;
  tenantId: string;
  filters?: Record<string, unknown>;
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  score: number;
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokenCount: number;
}
