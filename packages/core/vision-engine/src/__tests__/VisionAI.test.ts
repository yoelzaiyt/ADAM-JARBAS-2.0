import { describe, it, expect, beforeEach } from 'vitest';
import { VisionAI } from '../VisionAI.js';
import type { VisionEngineConfig, VisionAnalysisRequest } from '../interfaces.js';

describe('VisionAI', () => {
  let ai: VisionAI;

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
    ai = new VisionAI(config);
  });

  it('creates VisionAI', () => {
    expect(ai).toBeDefined();
    expect(ai.providerRegistry).toBeDefined();
    expect(ai.imageAnalyzer).toBeDefined();
    expect(ai.documentAnalyzer).toBeDefined();
    expect(ai.screenshotAnalyzer).toBeDefined();
    expect(ai.diagramAnalyzer).toBeDefined();
    expect(ai.architectureAnalyzer).toBeDefined();
    expect(ai.videoAnalyzer).toBeDefined();
    expect(ai.frameExtractor).toBeDefined();
    expect(ai.objectDetection).toBeDefined();
    expect(ai.sceneUnderstanding).toBeDefined();
    expect(ai.ocrEngine).toBeDefined();
    expect(ai.barcodeReader).toBeDefined();
    expect(ai.qrReader).toBeDefined();
    expect(ai.faceDetector).toBeDefined();
    expect(ai.emotionDetector).toBeDefined();
    expect(ai.handwritingReader).toBeDefined();
    expect(ai.tableExtractor).toBeDefined();
    expect(ai.chartReader).toBeDefined();
    expect(ai.uiAnalyzer).toBeDefined();
    expect(ai.promptGenerator).toBeDefined();
    expect(ai.imageSearch).toBeDefined();
    expect(ai.metadataEngine).toBeDefined();
    expect(ai.security).toBeDefined();
    expect(ai.analytics).toBeDefined();
    expect(ai.monitoring).toBeDefined();
    expect(ai.api).toBeDefined();
  });

  it('analyzes image', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['describe'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('analyzes document', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'document', data: Buffer.from(''), format: 'pdf' },
      analysisType: ['document'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.document).toBeDefined();
  });

  it('analyzes screenshot', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['screenshot'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.screenshot).toBeDefined();
  });

  it('analyzes diagram', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['diagram'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.diagram).toBeDefined();
  });

  it('analyzes architecture', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['architecture'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.architecture).toBeDefined();
  });

  it('runs OCR', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'png' },
      analysisType: ['ocr'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.ocr).toBeDefined();
  });

  it('detects faces', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['faces'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.faces).toBeDefined();
  });

  it('detects emotions', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['emotions'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.emotions).toBeDefined();
  });

  it('understands scene', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['scene'],
    };
    const result = await ai.analyze(request);
    expect(result).toBeDefined();
    expect(result.scene).toBeDefined();
  });

  it('analyzes batch', async () => {
    const requests: VisionAnalysisRequest[] = [
      {
        id: 'req-1',
        source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
        analysisType: ['describe'],
      },
      {
        id: 'req-2',
        source: { type: 'image', data: Buffer.from(''), format: 'png' },
        analysisType: ['ocr'],
      },
    ];
    const results = await ai.analyzeBatch(requests);
    expect(results).toHaveLength(2);
  });

  it('gets metrics', () => {
    const metrics = ai.getMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.totalRequests).toBe(0);
  });

  it('gets health', () => {
    const health = ai.getHealth();
    expect(health).toBeDefined();
    expect(health.status).toBeDefined();
  });

  it('gets config', () => {
    const cfg = ai.getConfig();
    expect(cfg).toBeDefined();
    expect(cfg.defaultProvider).toBe('local');
  });
});
