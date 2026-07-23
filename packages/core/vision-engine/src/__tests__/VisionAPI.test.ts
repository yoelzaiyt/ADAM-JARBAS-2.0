import { describe, it, expect, beforeEach } from 'vitest';
import { VisionAPI } from '../VisionAPI.js';
import { VisionAI } from '../VisionAI.js';
import type { VisionEngineConfig } from '../interfaces.js';

describe('VisionAPI', () => {
  let api: VisionAPI;
  let engine: VisionAI;

  const config: VisionEngineConfig = {
    providers: [],
    defaultProvider: 'local',
    defaultLanguage: 'pt',
    security: {
      enablePIIDetection: true,
      enableContentFiltering: true,
      enableMalwareDetection: true,
      maxFileSize: 10 * 1024 * 1024,
    },
    analytics: {
      enabled: true,
      storeResults: false,
      retentionDays: 30,
    },
  };

  beforeEach(() => {
    engine = new VisionAI(config);
    api = new VisionAPI(
      { port: 3000, host: 'localhost' },
      {
        analyze: engine.analyze.bind(engine),
        search: engine.search.bind(engine),
        getMetrics: engine.getMetrics.bind(engine),
        getHealth: engine.getHealth.bind(engine),
      }
    );
  });

  it('creates VisionAPI', () => {
    expect(api).toBeDefined();
  });

  it('handles health check', async () => {
    const response = await api.handleHealth();
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  it('handles metrics', async () => {
    const response = await api.handleMetrics();
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  it('validates request', () => {
    expect(api.validateRequest({ body: null }).valid).toBe(false);
    expect(api.validateRequest({ body: {} }).valid).toBe(false);
    expect(api.validateRequest({ body: { source: {}, analysisType: [] } }).valid).toBe(true);
  });

  it('gets config', () => {
    const config = api.getConfig();
    expect(config.port).toBe(3000);
    expect(config.host).toBe('localhost');
  });
});
