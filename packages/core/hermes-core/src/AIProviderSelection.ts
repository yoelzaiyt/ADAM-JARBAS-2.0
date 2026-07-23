import type {
  AIProviderSelection as IAIProviderSelection,
  ProviderSelectionRequest,
  ProviderSelectionResult,
  DecisionStrategy,
  Logger,
} from './interfaces.js';
import type { AIProviderName } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

interface ProviderHealthEntry {
  provider: AIProviderName;
  status: string;
  latencyMs: number;
  lastChecked: Date;
}

const DEFAULT_PROVIDERS: AIProviderName[] = [
  'deepseek',
  'openrouter',
  'nvidia',
  'ollama',
  'opencode',
  'zhipuai',
  'hermes',
];

const DEFAULT_PROVIDER_HEALTH: ProviderHealthEntry[] = DEFAULT_PROVIDERS.map(
  (provider) => ({
    provider,
    status: 'healthy',
    latencyMs: Math.floor(100 + Math.random() * 400),
    lastChecked: new Date(),
  })
);

const DEFAULT_MODEL_MAP: Record<AIProviderName, string> = {
  deepseek: 'deepseek-chat',
  openrouter: 'auto',
  nvidia: 'nvidia/nemotron-4-340b-instruct',
  ollama: 'llama3',
  opencode: 'default',
  zhipuai: 'glm-4',
  hermes: 'hermes-1',
};

const DEFAULT_COST_MAP: Record<AIProviderName, number> = {
  deepseek: 0.002,
  openrouter: 0.005,
  nvidia: 0.003,
  ollama: 0,
  opencode: 0.001,
  zhipuai: 0.003,
  hermes: 0.001,
};

const DEFAULT_LATENCY_MAP: Record<AIProviderName, number> = {
  deepseek: 300,
  openrouter: 500,
  nvidia: 250,
  ollama: 100,
  opencode: 150,
  zhipuai: 350,
  hermes: 200,
};

export class AIProviderSelection implements IAIProviderSelection {
  private registry: unknown | null;
  private router: unknown | null;
  private logger: Logger;
  private healthCache: Map<AIProviderName, ProviderHealthEntry> = new Map();

  constructor(registry?: unknown, router?: unknown, logger?: Logger) {
    this.registry = registry ?? null;
    this.router = router ?? null;
    this.logger = logger ?? {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };

    for (const entry of DEFAULT_PROVIDER_HEALTH) {
      this.healthCache.set(entry.provider, entry);
    }
  }

  async select(request: ProviderSelectionRequest): Promise<ProviderSelectionResult> {
    if (this.registry && this.router) {
      this.logger.debug('Delegating selection to registry/router', {
        strategy: request.strategy,
        tenantId: request.tenantId,
      });

      const reg = this.registry as {
        getProviders: () => { name: AIProviderName; enabled: boolean }[];
      };
      const rtr = this.router as {
        select: (req: ProviderSelectionRequest) => Promise<ProviderSelectionResult>;
      };

      try {
        return await rtr.select(request);
      } catch (err) {
        this.logger.error('Router selection failed, falling back to simulation', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.debug('Using simulated provider selection', {
      strategy: request.strategy,
    });

    const candidates = this.filterCandidates(request);
    const scored = this.scoreProviders(candidates, request.strategy);
    scored.sort((a, b) => b.score - a.score);

    const winner = scored[0];

    return {
      provider: winner.provider,
      model: DEFAULT_MODEL_MAP[winner.provider],
      estimatedCostUsd: winner.cost,
      estimatedLatencyMs: winner.latency,
      reason: winner.reason,
    };
  }

  getAvailableProviders(): AIProviderName[] {
    if (this.registry) {
      this.logger.debug('Fetching providers from registry');
      const reg = this.registry as {
        getProviders: () => { name: AIProviderName; enabled: boolean }[];
      };
      try {
        return reg.getProviders()
          .filter((p) => p.enabled)
          .map((p) => p.name);
      } catch (err) {
        this.logger.error('Registry fetch failed, using defaults', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return [...DEFAULT_PROVIDERS] as AIProviderName[];
  }

  async getProviderHealth(
    provider: AIProviderName
  ): Promise<{ status: string; latencyMs: number }> {
    if (this.registry) {
      this.logger.debug('Fetching health from registry', { provider });
      const reg = this.registry as {
        getHealth: (
          provider: AIProviderName
        ) => Promise<{ status: string; latencyMs: number }>;
      };
      try {
        return await reg.getHealth(provider);
      } catch (err) {
        this.logger.error('Registry health check failed, using cached', {
          provider,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const cached = this.healthCache.get(provider);
    if (cached) {
      return { status: cached.status, latencyMs: cached.latencyMs };
    }

    return {
      status: 'unknown',
      latencyMs: 0,
    };
  }

  private filterCandidates(
    request: ProviderSelectionRequest
  ): AIProviderName[] {
    let candidates = [...DEFAULT_PROVIDERS];

    if (request.budget) {
      candidates = candidates.filter(
        (p) => DEFAULT_COST_MAP[p] <= request.budget!.maxCostUsd
      );
    }

    if (candidates.length === 0) {
      candidates = ['ollama'];
    }

    return candidates;
  }

  private scoreProviders(
    providers: AIProviderName[],
    strategy: DecisionStrategy
  ): {
    provider: AIProviderName;
    score: number;
    cost: number;
    latency: number;
    reason: string;
  }[] {
    return providers.map((provider) => {
      const cost = DEFAULT_COST_MAP[provider];
      const latency = DEFAULT_LATENCY_MAP[provider];
      let score = 0;
      let reason = '';

      switch (strategy) {
        case 'cost-optimized': {
          const maxCost = Math.max(
            ...providers.map((p) => DEFAULT_COST_MAP[p]),
            0.001
          );
          score = 1 - cost / maxCost;
          reason = `Lowest cost provider (${cost.toFixed(4)} USD)`;
          break;
        }
        case 'latency-optimized': {
          const maxLatency = Math.max(
            ...providers.map((p) => DEFAULT_LATENCY_MAP[p]),
            1
          );
          score = 1 - latency / maxLatency;
          reason = `Lowest latency provider (${latency}ms)`;
          break;
        }
        case 'quality-first': {
          const qualityRank = DEFAULT_PROVIDERS.indexOf(provider);
          score = 1 - qualityRank / DEFAULT_PROVIDERS.length;
          reason = `High quality provider (rank ${qualityRank + 1})`;
          break;
        }
        case 'round-robin': {
          score = Math.random();
          reason = 'Randomly selected via round-robin';
          break;
        }
        case 'balanced':
        default: {
          const maxCost = Math.max(
            ...providers.map((p) => DEFAULT_COST_MAP[p]),
            0.001
          );
          const maxLatency = Math.max(
            ...providers.map((p) => DEFAULT_LATENCY_MAP[p]),
            1
          );
          const costScore = 1 - cost / maxCost;
          const latencyScore = 1 - latency / maxLatency;
          const healthEntry = this.healthCache.get(provider);
          const availabilityScore =
            healthEntry?.status === 'healthy'
              ? 1
              : healthEntry?.status === 'degraded'
                ? 0.5
                : 0.1;
          score =
            costScore * 0.3 +
            latencyScore * 0.3 +
            availabilityScore * 0.4;
          reason = `Balanced score (cost=${costScore.toFixed(2)}, latency=${latencyScore.toFixed(2)}, avail=${availabilityScore.toFixed(2)})`;
          break;
        }
      }

      return { provider, score, cost, latency, reason };
    });
  }
}
