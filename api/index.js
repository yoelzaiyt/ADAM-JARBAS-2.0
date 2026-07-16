// JARBAS 2.0 - Standalone Vercel Server
// All-in-one deployment without monorepo dependencies

import http from 'http';

const PORT = process.env.PORT || 3000;

// ============================================================
// AI PROVIDERS - Real API Integrations
// ============================================================
const PROVIDERS = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    models: ['deepseek/deepseek-chat', 'qwen/qwen-2.5-72b-instruct'],
  },
  nvidia: {
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY || '',
    models: ['meta/llama-3.1-70b-instruct', 'nvidia/nemotron-4-340b-instruct'],
  },
  hermes: {
    baseUrl: 'https://api.nousresearch.com/v1',
    apiKey: process.env.HERMES_API_KEY || '',
    models: ['Hermes-3-Llama-3.1-70B', 'Hermes-3-Llama-3.1-405B'],
  },
  zhipuai: {
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKey: process.env.ZHIPUAI_API_KEY || '',
    models: ['glm-4-flash', 'glm-4-plus'],
  },
};

// ============================================================
// CHAT COMPLETION - Real API Calls
// ============================================================
async function chatCompletion(provider, messages, model, temperature = 0.7, maxTokens = 4096) {
  const config = PROVIDERS[provider];
  if (!config) throw new Error(`Unknown provider: ${provider}`);
  if (!config.apiKey) throw new Error(`No API key for provider: ${provider}`);

  const startTime = Date.now();

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: model || config.models[0],
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`${provider} API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  return {
    id: data.id || crypto.randomUUID(),
    content: choice?.message?.content || '',
    model: data.model || model || config.models[0],
    provider,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    latencyMs: Date.now() - startTime,
    finishReason: choice?.finish_reason || 'stop',
  };
}

// ============================================================
// ROUTING - Select best provider
// ============================================================
function selectProvider(preferred) {
  if (preferred && PROVIDERS[preferred] && PROVIDERS[preferred].apiKey) {
    return preferred;
  }
  // Priority: hermes > deepseek > openrouter > nvidia > zhipuai
  for (const name of ['hermes', 'deepseek', 'openrouter', 'nvidia', 'zhipuai']) {
    if (PROVIDERS[name].apiKey) return name;
  }
  throw new Error('No AI providers configured with API keys');
}

// ============================================================
// REQUEST HANDLER
// ============================================================
async function handleRequest(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  try {
    // Health check
    if (path === '/health' || path === '/') {
      const activeProviders = Object.entries(PROVIDERS)
        .filter(([_, c]) => c.apiKey)
        .map(([name, c]) => ({ name, models: c.models }));

      sendJSON(res, 200, {
        status: 'ok',
        version: '0.1.0',
        platform: 'JARBAS 2.0 - Hermes Platform',
        providers: activeProviders,
        endpoints: ['/health', '/api/v1/chat', '/api/v1/providers', '/api/v1/embeddings'],
      });
      return;
    }

    // List providers
    if (path === '/api/v1/providers' && req.method === 'GET') {
      const providers = Object.entries(PROVIDERS)
        .filter(([_, c]) => c.apiKey)
        .map(([name, c]) => ({
          name,
          baseUrl: c.baseUrl,
          models: c.models,
          status: 'active',
        }));

      sendJSON(res, 200, { providers });
      return;
    }

    // Chat completion
    if (path === '/api/v1/chat' && req.method === 'POST') {
      const body = await readBody(req);
      const { messages, model, provider, temperature, maxTokens, stream } = body;

      if (!messages || !Array.isArray(messages)) {
        sendJSON(res, 400, { error: 'messages[] is required' });
        return;
      }

      const selectedProvider = selectProvider(provider);

      if (stream) {
        // SSE streaming
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });

        const config = PROVIDERS[selectedProvider];
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: model || config.models[0],
            messages,
            temperature: temperature || 0.7,
            max_tokens: maxTokens || 4096,
            stream: true,
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                res.write(line + '\n\n');
              }
            }
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

      // Non-streaming
      const result = await chatCompletion(
        selectedProvider,
        messages,
        model,
        temperature,
        maxTokens
      );

      sendJSON(res, 200, result);
      return;
    }

    // 404
    sendJSON(res, 404, { error: 'Not found', path });
  } catch (error) {
    console.error('[Error]', error.message);
    sendJSON(res, 500, { error: error.message });
  }
}

// ============================================================
// HELPERS
// ============================================================
function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// ============================================================
// START SERVER
// ============================================================
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  const activeProviders = Object.entries(PROVIDERS)
    .filter(([_, c]) => c.apiKey)
    .map(([name]) => name);

  console.log(`
╔══════════════════════════════════════════════════╗
║        JARBAS 2.0 - Hermes Platform              ║
║        AI Orchestration Server                    ║
╠══════════════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(37)}║
║  Providers: ${activeProviders.join(', ').padEnd(36)}║
║  Endpoints: /health, /api/v1/chat, /providers    ║
╚══════════════════════════════════════════════════╝
  `);
});

export default server;
