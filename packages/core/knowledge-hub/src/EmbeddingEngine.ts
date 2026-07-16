import type {
  EmbeddingEngine as IEmbeddingEngine,
  EmbeddingConfig,
  EmbeddingResult,
  EmbeddingProvider,
} from './interfaces.js';

const PROVIDER_DIMENSIONS: Record<EmbeddingProvider, number> = {
  openai: 1536,
  gemini: 768,
  'sentence-transformers': 384,
  bge: 768,
  e5: 384,
  jina: 768,
  nomic: 768,
};

const ALL_PROVIDERS: EmbeddingProvider[] = [
  'openai',
  'gemini',
  'sentence-transformers',
  'bge',
  'e5',
  'jina',
  'nomic',
];

const DEFAULT_CONFIG: EmbeddingConfig = {
  provider: 'openai',
  dimensions: 1536,
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash);
}

function generatePseudoEmbedding(text: string, dimensions: number): number[] {
  const seed = hashText(text);
  const rng = seededRandom(seed);
  const vector: number[] = [];

  for (let i = 0; i < dimensions; i++) {
    vector.push(rng() * 2 - 1);
  }

  let norm = 0;
  for (let i = 0; i < vector.length; i++) {
    norm += vector[i]! * vector[i]!;
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] = vector[i]! / norm;
    }
  }

  return vector;
}

function estimateTokens(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export class EmbeddingEngine implements IEmbeddingEngine {
  private readonly config: EmbeddingConfig;

  constructor(config?: Partial<EmbeddingConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getProviders(): EmbeddingProvider[] {
    return [...ALL_PROVIDERS];
  }

  getDimensions(provider: EmbeddingProvider): number {
    return PROVIDER_DIMENSIONS[provider] ?? 1536;
  }

  async embed(texts: string[], config?: Partial<EmbeddingConfig>): Promise<EmbeddingResult> {
    const merged = { ...this.config, ...config };
    const provider = merged.provider ?? this.config.provider;
    const dimensions = merged.dimensions ?? PROVIDER_DIMENSIONS[provider] ?? 1536;
    const model = merged.model ?? `mock-${provider}-emb`;

    const start = Date.now();
    const embeddings: number[][] = [];

    for (const text of texts) {
      embeddings.push(generatePseudoEmbedding(text, dimensions));
    }

    const tokensUsed = texts.reduce((sum, t) => sum + estimateTokens(t), 0);
    const latencyMs = Date.now() - start;

    return {
      embeddings,
      model,
      provider,
      dimensions,
      tokensUsed,
      latencyMs,
    };
  }

  async embedQuery(text: string, config?: Partial<EmbeddingConfig>): Promise<number[]> {
    const result = await this.embed([text], config);
    return result.embeddings[0]!;
  }
}
