export interface BrainAPIConfig {
  baseUrl: string;
  brainpatToken: string;
  brainId: string;
}

export interface IngestRequest {
  brain_id: string;
  data: {
    data_type: string;
    text_data?: string;
    file_data?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface IngestResponse {
  status: string;
  task_id?: string;
}

export interface RetrieveRequest {
  brain_id: string;
  text: string;
  limit?: number;
}

export interface RetrieveResponse {
  data: Array<{
    text: string;
    entities: Array<{ name: string; type: string }>;
    observations?: string[];
  }>;
  relationships?: Array<{
    name: string;
    description: string;
    type: string;
  }>;
}

export interface BrainStatus {
  brain_id: string;
  entity_count: number;
  relationship_count: number;
}

export class BrainAPIClient {
  private config: BrainAPIConfig;

  constructor(config: BrainAPIConfig) {
    this.config = config;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      BrainPAT: this.config.brainpatToken,
      ...((options.headers as Record<string, string>) ?? {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`BrainAPI error ${response.status}: ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  async ingestText(text: string, metadata?: Record<string, unknown>): Promise<IngestResponse> {
    return this.fetch<IngestResponse>('/ingest', {
      method: 'POST',
      body: JSON.stringify({
        brain_id: this.config.brainId,
        data: {
          data_type: 'text',
          text_data: text,
          metadata,
        },
      }),
    });
  }

  async ingestFile(fileBase64: string, fileName: string): Promise<IngestResponse> {
    return this.fetch<IngestResponse>('/ingest', {
      method: 'POST',
      body: JSON.stringify({
        brain_id: this.config.brainId,
        data: {
          data_type: 'file',
          file_data: fileBase64,
          metadata: { fileName },
        },
      }),
    });
  }

  async retrieve(query: string, limit = 10): Promise<RetrieveResponse> {
    const params = new URLSearchParams({
      brain_id: this.config.brainId,
      text: query,
      limit: limit.toString(),
    });

    return this.fetch<RetrieveResponse>(`/retrieve?${params}`, {
      method: 'GET',
    });
  }

  async getBrainStatus(): Promise<BrainStatus> {
    const params = new URLSearchParams({ brain_id: this.config.brainId });
    return this.fetch<BrainStatus>(`/brain/status?${params}`, {
      method: 'GET',
    });
  }

  async deleteBrain(): Promise<void> {
    await this.fetch(`/brain/${this.config.brainId}`, {
      method: 'DELETE',
    });
  }

  async healthCheck(): Promise<{ status: string; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.fetch('/', { method: 'GET' });
      return { status: 'healthy', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down', latencyMs: Date.now() - start };
    }
  }
}

export const createBrainAPI = (config: BrainAPIConfig): BrainAPIClient => {
  return new BrainAPIClient(config);
};
