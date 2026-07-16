const API_BASE = '/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('jarbas_token');
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
    const token = this.getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, { headers: this.headers() });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async streamChat(
    messages: { role: string; content: string }[],
    options: { provider?: string; model?: string; agentId?: string; onChunk: (delta: string) => void; onDone: (fullText: string) => void; onError: (err: Error) => void; }
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        messages,
        stream: true,
        provider: options.provider,
        model: options.model,
        agentId: options.agentId,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            options.onDone(fullText);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta || parsed.content || parsed.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              options.onChunk(delta);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    }

    options.onDone(fullText);
  }
}

export const api = new ApiClient();
