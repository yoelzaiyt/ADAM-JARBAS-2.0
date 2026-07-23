import type {
  DecisionEngine as IDecisionEngine,
  DecisionInput,
  DecisionResult,
  DecisionStrategy,
  DecisionWeights,
  ProviderScore,
  DecisionStats,
  Logger,
} from './interfaces.js';
import type { AIProviderName } from '@jarbas/types';

const DEFAULT_COST_TABLE: Record<AIProviderName, number> = {
  ollama: 0,
  opencode: 0,
  deepseek: 0.00014,
  zhipuai: 0.00071,
  hermes: 0.0009,
  nvidia: 0.00088,
  openrouter: 0.0015,
};

const DEFAULT_LATENCY_TABLE: Record<AIProviderName, number> = {
  ollama: 200,
  opencode: 150,
  deepseek: 300,
  zhipuai: 400,
  hermes: 350,
  nvidia: 250,
  openrouter: 500,
};

const DEFAULT_QUALITY_TABLE: Record<AIProviderName, number> = {
  hermes: 0.95,
  nvidia: 0.92,
  openrouter: 0.90,
  deepseek: 0.88,
  zhipuai: 0.85,
  ollama: 0.80,
  opencode: 0.75,
};

const DEFAULT_MODEL_TABLE: Record<AIProviderName, string> = {
  deepseek: 'deepseek-chat',
  openrouter: 'openrouter-auto',
  nvidia: 'meta/llama-3.1-8b-instruct',
  ollama: 'llama3.1',
  opencode: 'opencode-default',
  zhipuai: 'glm-4-flash',
  hermes: 'hermes-3-llama-3.1-8b',
};

const BALANCED_WEIGHTS: DecisionWeights = {
  cost: 0.3,
  latency: 0.3,
  quality: 0.3,
  availability: 0.1,
};

const MAX_HISTORY = 500;

const ALL_PROVIDERS: AIProviderName[] = [
  'deepseek', 'openrouter', 'nvidia', 'ollama', 'opencode', 'zhipuai', 'hermes',
];

export class DecisionEngine implements IDecisionEngine {
  private decisionHistory: DecisionResult[] = [];
  private roundRobinIndex = 0;
  private costTable: Record<AIProviderName, number>;
  private latencyTable: Record<AIProviderName, number>;
  private qualityTable: Record<AIProviderName, number>;
  private modelTable: Record<AIProviderName, string>;
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
    this.costTable = { ...DEFAULT_COST_TABLE };
    this.latencyTable = { ...DEFAULT_LATENCY_TABLE };
    this.qualityTable = { ...DEFAULT_QUALITY_TABLE };
    this.modelTable = { ...DEFAULT_MODEL_TABLE };
  }

  async decide(input: DecisionInput): Promise<DecisionResult> {
    const startTime = Date.now();
    const strategy = input.criteria.strategy;
    const weights = input.criteria.weights ?? BALANCED_WEIGHTS;

    const excluded = new Set(input.criteria.excludedProviders ?? []);
    const preferred = input.criteria.preferredProviders ?? [];
    const available = ALL_PROVIDERS.filter((p) => !excluded.has(p));

    this.logger?.info(`[DecisionEngine] Deciding with strategy: ${strategy}`);

    const scores = this.calculateScores(available, weights);
    const sorted = [...scores].sort((a, b) => b.score - a.score);

    let selected: ProviderScore;

    if (preferred.length > 0) {
      const preferredScore = sorted.find((s) => preferred.includes(s.provider));
      selected = preferredScore ?? sorted[0];
    } else {
      switch (strategy) {
        case 'cost-optimized':
          selected = this.selectByCost(available);
          break;
        case 'latency-optimized':
          selected = this.selectByLatency(available);
          break;
        case 'quality-first':
          selected = this.selectByQuality(available);
          break;
        case 'round-robin':
          selected = this.selectRoundRobin(available, scores);
          break;
        case 'balanced':
        default:
          selected = sorted[0];
          break;
      }
    }

    const result: DecisionResult = {
      provider: selected.provider,
      model: this.modelTable[selected.provider],
      reason: selected.reason,
      score: selected.score,
      alternatives: sorted.filter((s) => s.provider !== selected.provider).slice(0, 3),
      latencyMs: Date.now() - startTime,
    };

    this.decisionHistory.push(result);
    if (this.decisionHistory.length > MAX_HISTORY) {
      this.decisionHistory.shift();
    }

    this.logger?.info(`[DecisionEngine] Selected: ${result.provider} (score: ${result.score.toFixed(3)})`);
    return result;
  }

  getHistory(limit?: number): DecisionResult[] {
    if (limit !== undefined && limit > 0) {
      return this.decisionHistory.slice(-limit);
    }
    return [...this.decisionHistory];
  }

  getStats(): DecisionStats {
    const history = this.decisionHistory;
    const byProvider = {} as Record<AIProviderName, number>;
    const byStrategy = {} as Record<DecisionStrategy, number>;
    let totalDecisionTime = 0;

    for (const d of history) {
      byProvider[d.provider] = (byProvider[d.provider] ?? 0) + 1;
      totalDecisionTime += d.latencyMs;
    }

    return {
      totalDecisions: history.length,
      byProvider,
      byStrategy,
      avgDecisionTimeMs: history.length > 0 ? totalDecisionTime / history.length : 0,
    };
  }

  private calculateScores(
    available: AIProviderName[],
    weights: DecisionWeights,
  ): ProviderScore[] {
    const maxCost = Math.max(...available.map((p) => this.costTable[p]), 0.001);
    const maxLatency = Math.max(...available.map((p) => this.latencyTable[p]), 1);

    return available.map((provider) => {
      const costScore = 1 - this.costTable[provider] / maxCost;
      const latencyScore = 1 - this.latencyTable[provider] / maxLatency;
      const qualityScore = this.qualityTable[provider] ?? 0.5;
      const availabilityScore = 1;

      const score =
        costScore * weights.cost +
        latencyScore * weights.latency +
        qualityScore * weights.quality +
        availabilityScore * weights.availability;

      return {
        provider,
        model: this.modelTable[provider],
        score,
        costScore,
        latencyScore,
        qualityScore,
        availabilityScore,
        reason: `score=${score.toFixed(3)} (cost=${costScore.toFixed(2)}, lat=${latencyScore.toFixed(2)}, qual=${qualityScore.toFixed(2)})`,
      };
    });
  }

  private selectByCost(available: AIProviderName[]): ProviderScore {
    const scores = this.calculateScores(available, BALANCED_WEIGHTS);
    let best = scores[0];
    for (const s of scores) {
      if (this.costTable[s.provider] < this.costTable[best.provider]) {
        best = s;
      }
    }
    return { ...best, reason: `lowest-cost ($${this.costTable[best.provider].toFixed(6)}/1K tokens)` };
  }

  private selectByLatency(available: AIProviderName[]): ProviderScore {
    const scores = this.calculateScores(available, BALANCED_WEIGHTS);
    let best = scores[0];
    for (const s of scores) {
      if (this.latencyTable[s.provider] < this.latencyTable[best.provider]) {
        best = s;
      }
    }
    return { ...best, reason: `lowest-latency (${this.latencyTable[best.provider]}ms avg)` };
  }

  private selectByQuality(available: AIProviderName[]): ProviderScore {
    const scores = this.calculateScores(available, BALANCED_WEIGHTS);
    let best = scores[0];
    for (const s of scores) {
      if (this.qualityTable[s.provider] > this.qualityTable[best.provider]) {
        best = s;
      }
    }
    return { ...best, reason: `highest-quality (${(this.qualityTable[best.provider] * 100).toFixed(0)}% benchmark)` };
  }

  private selectRoundRobin(available: AIProviderName[], scores: ProviderScore[]): ProviderScore {
    const index = this.roundRobinIndex % available.length;
    this.roundRobinIndex++;
    const provider = available[index];
    const score = scores.find((s) => s.provider === provider)!;
    return { ...score, reason: `round-robin (position ${index + 1}/${available.length})` };
  }
}
