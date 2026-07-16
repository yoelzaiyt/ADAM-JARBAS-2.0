// ─── Vision API ──────────────────────────────────────────────────────────────
// REST API for vision operations

import type {
  VisionAPIConfig,
  VisionAnalysisRequest,
  VisionAnalysisResult,
  VisionAnalysisType,
  ImageSearchRequest,
  ImageSearchResult,
  VisionMetrics,
  VisionHealth,
} from './interfaces.js';

export class VisionAPI {
  private config: VisionAPIConfig;
  private visionEngine: {
    analyze: (request: VisionAnalysisRequest) => Promise<VisionAnalysisResult>;
    search: (request: ImageSearchRequest) => Promise<ImageSearchResult[]>;
    getMetrics: () => VisionMetrics;
    getHealth: () => VisionHealth;
  };

  constructor(
    config: Partial<VisionAPIConfig>,
    visionEngine: {
      analyze: (request: VisionAnalysisRequest) => Promise<VisionAnalysisResult>;
      search: (request: ImageSearchRequest) => Promise<ImageSearchResult[]>;
      getMetrics: () => VisionMetrics;
      getHealth: () => VisionHealth;
    }
  ) {
    this.config = {
      port: config.port || 3000,
      host: config.host || 'localhost',
      cors: config.cors ?? true,
      rateLimit: config.rateLimit || 100,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024,
    };
    this.visionEngine = visionEngine;
  }

  async handleAnalyze(request: {
    body: {
      source: VisionAnalysisRequest['source'];
      analysisType: VisionAnalysisType[];
      options?: VisionAnalysisRequest['options'];
      context?: string;
    };
  }): Promise<{ status: number; data: VisionAnalysisResult | { error: string } }> {
    try {
      const analysisRequest: VisionAnalysisRequest = {
        id: `req-${Date.now()}`,
        source: request.body.source,
        analysisType: request.body.analysisType,
        options: request.body.options,
        context: request.body.context,
      };

      const result = await this.visionEngine.analyze(analysisRequest);
      return { status: 200, data: result };
    } catch (error) {
      return {
        status: 500,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  async handleSearch(request: {
    body: ImageSearchRequest;
  }): Promise<{ status: number; data: ImageSearchResult[] | { error: string } }> {
    try {
      const results = await this.visionEngine.search(request.body);
      return { status: 200, data: results };
    } catch (error) {
      return {
        status: 500,
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  async handleHealth(): Promise<{ status: number; data: VisionHealth }> {
    const health = this.visionEngine.getHealth();
    return { status: health.status === 'unavailable' ? 503 : 200, data: health };
  }

  async handleMetrics(): Promise<{ status: number; data: VisionMetrics }> {
    const metrics = this.visionEngine.getMetrics();
    return { status: 200, data: metrics };
  }

  getConfig(): VisionAPIConfig {
    return { ...this.config };
  }

  validateRequest(request: { body: unknown }): { valid: boolean; error?: string } {
    if (!request.body || typeof request.body !== 'object') {
      return { valid: false, error: 'Request body is required' };
    }

    const body = request.body as Record<string, unknown>;

    if (!body['source']) {
      return { valid: false, error: 'Source is required' };
    }

    if (!body['analysisType'] || !Array.isArray(body['analysisType'])) {
      return { valid: false, error: 'analysisType array is required' };
    }

    return { valid: true };
  }
}
