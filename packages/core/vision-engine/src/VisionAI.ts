// ─── Vision AI Orchestrator ──────────────────────────────────────────────────
// Main entry point connecting all 27 modules

import { ProviderRegistry } from './ProviderRegistry.js';
import { ImageAnalyzer } from './ImageAnalyzer.js';
import { DocumentAnalyzer } from './DocumentAnalyzer.js';
import { ScreenshotAnalyzer } from './ScreenshotAnalyzer.js';
import { DiagramAnalyzer } from './DiagramAnalyzer.js';
import { ArchitectureAnalyzer } from './ArchitectureAnalyzer.js';
import { VideoAnalyzer } from './VideoAnalyzer.js';
import { FrameExtractor } from './FrameExtractor.js';
import { ObjectDetection } from './ObjectDetection.js';
import { SceneUnderstanding } from './SceneUnderstanding.js';
import { OCREngine } from './OCREngine.js';
import { BarcodeReader } from './BarcodeReader.js';
import { QRReader } from './QRReader.js';
import { FaceDetector } from './FaceDetector.js';
import { EmotionDetector } from './EmotionDetector.js';
import { HandwritingReader } from './HandwritingReader.js';
import { TableExtractor } from './TableExtractor.js';
import { ChartReader } from './ChartReader.js';
import { UIAnalyzer } from './UIAnalyzer.js';
import { PromptGenerator } from './PromptGenerator.js';
import { ImageSearch } from './ImageSearch.js';
import { MetadataEngine } from './MetadataEngine.js';
import { Security } from './Security.js';
import { Analytics } from './Analytics.js';
import { Monitoring } from './Monitoring.js';
import { VisionAPI } from './VisionAPI.js';

import type {
  VisionEngineConfig,
  VisionAnalysisRequest,
  VisionAnalysisResult,
  VisionAnalysisType,
  ImageSearchRequest,
  ImageSearchResult,
  VisionMetrics,
  VisionHealth,
} from './interfaces.js';

export class VisionAI {
  readonly providerRegistry: ProviderRegistry;
  readonly imageAnalyzer: ImageAnalyzer;
  readonly documentAnalyzer: DocumentAnalyzer;
  readonly screenshotAnalyzer: ScreenshotAnalyzer;
  readonly diagramAnalyzer: DiagramAnalyzer;
  readonly architectureAnalyzer: ArchitectureAnalyzer;
  readonly videoAnalyzer: VideoAnalyzer;
  readonly frameExtractor: FrameExtractor;
  readonly objectDetection: ObjectDetection;
  readonly sceneUnderstanding: SceneUnderstanding;
  readonly ocrEngine: OCREngine;
  readonly barcodeReader: BarcodeReader;
  readonly qrReader: QRReader;
  readonly faceDetector: FaceDetector;
  readonly emotionDetector: EmotionDetector;
  readonly handwritingReader: HandwritingReader;
  readonly tableExtractor: TableExtractor;
  readonly chartReader: ChartReader;
  readonly uiAnalyzer: UIAnalyzer;
  readonly promptGenerator: PromptGenerator;
  readonly imageSearch: ImageSearch;
  readonly metadataEngine: MetadataEngine;
  readonly security: Security;
  readonly analytics: Analytics;
  readonly monitoring: Monitoring;
  readonly api: VisionAPI;

  private config: VisionEngineConfig;

  constructor(config: VisionEngineConfig) {
    this.config = config;

    // Initialize modules
    this.providerRegistry = new ProviderRegistry(config.providers, config.defaultProvider);
    this.imageAnalyzer = new ImageAnalyzer();
    this.documentAnalyzer = new DocumentAnalyzer();
    this.screenshotAnalyzer = new ScreenshotAnalyzer();
    this.diagramAnalyzer = new DiagramAnalyzer();
    this.architectureAnalyzer = new ArchitectureAnalyzer();
    this.videoAnalyzer = new VideoAnalyzer();
    this.frameExtractor = new FrameExtractor();
    this.objectDetection = new ObjectDetection();
    this.sceneUnderstanding = new SceneUnderstanding();
    this.ocrEngine = new OCREngine();
    this.barcodeReader = new BarcodeReader();
    this.qrReader = new QRReader();
    this.faceDetector = new FaceDetector();
    this.emotionDetector = new EmotionDetector();
    this.handwritingReader = new HandwritingReader();
    this.tableExtractor = new TableExtractor();
    this.chartReader = new ChartReader();
    this.uiAnalyzer = new UIAnalyzer();
    this.promptGenerator = new PromptGenerator();
    this.imageSearch = new ImageSearch();
    this.metadataEngine = new MetadataEngine();
    this.security = new Security(config.security);
    this.analytics = new Analytics();
    this.monitoring = new Monitoring();

    // Initialize API
    this.api = new VisionAPI(
      { port: 3000, host: 'localhost' },
      {
        analyze: this.analyze.bind(this),
        search: this.search.bind(this),
        getMetrics: this.analytics.getMetrics.bind(this.analytics),
        getHealth: this.monitoring.getHealth.bind(this.monitoring),
      }
    );
  }

  async analyze(request: VisionAnalysisRequest): Promise<VisionAnalysisResult> {
    const startTime = Date.now();

    try {
      const provider = this.providerRegistry.selectProvider(
        request.analysisType[0]
      );

      let result: VisionAnalysisResult;

      if (provider) {
        result = await provider.analyzeImage(request);
      } else {
        // Fallback to local analysis
        result = await this.localAnalysis(request);
      }

      // Record metrics
      const latencyMs = Date.now() - startTime;
      this.analytics.recordRequest(
        request.analysisType[0],
        result.provider,
        latencyMs,
        result.success,
        result.tokensUsed,
        result.cost
      );

      return result;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.analytics.recordError({
        type: 'analysis-error',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId: request.id,
      });

      this.analytics.recordRequest(
        request.analysisType[0],
        'local',
        latencyMs,
        false
      );

      throw error;
    }
  }

  private async localAnalysis(
    request: VisionAnalysisRequest
  ): Promise<VisionAnalysisResult> {
    const result: VisionAnalysisResult = {
      id: `res-${Date.now()}`,
      requestId: request.id,
      success: true,
      timestamp: new Date(),
      provider: 'local',
      latencyMs: 0,
    };

    for (const type of request.analysisType) {
      switch (type) {
        case 'describe':
        case 'objects':
          result.image = await this.imageAnalyzer.analyze(request);
          break;
        case 'document':
          result.document = await this.documentAnalyzer.analyze(request);
          break;
        case 'screenshot':
        case 'ui':
          result.screenshot = await this.screenshotAnalyzer.analyze(request);
          result.ui = await this.uiAnalyzer.analyze(request);
          break;
        case 'diagram':
          result.diagram = await this.diagramAnalyzer.analyze(request);
          break;
        case 'architecture':
          result.architecture = await this.architectureAnalyzer.analyze(request);
          break;
        case 'ocr':
          result.ocr = await this.ocrEngine.recognize(request);
          break;
        case 'faces':
          result.faces = await this.faceDetector.detect(request);
          break;
        case 'emotions':
          result.emotions = await this.emotionDetector.detect(request);
          break;
        case 'scene':
          result.scene = await this.sceneUnderstanding.analyze(request);
          break;
        case 'handwriting':
          result.handwriting = await this.handwritingReader.recognize(request);
          break;
        case 'tables':
          result.tables = await this.tableExtractor.extract(request);
          break;
        case 'charts':
          result.charts = await this.chartReader.analyze(request);
          break;
        case 'barcode':
          result.barcode = await this.barcodeReader.read(request);
          break;
        case 'qr':
          result.qr = await this.qrReader.read(request);
          break;
        case 'metadata':
          result.metadata = await this.metadataEngine.extractMetadata(
            Buffer.from(''),
            'png'
          );
          break;
        case 'security':
          result.security = await this.security.analyze(Buffer.from(''));
          break;
      }
    }

    return result;
  }

  async analyzeBatch(
    requests: VisionAnalysisRequest[]
  ): Promise<VisionAnalysisResult[]> {
    return Promise.all(requests.map(r => this.analyze(r)));
  }

  async search(
    request: ImageSearchRequest
  ): Promise<ImageSearchResult[]> {
    return this.imageSearch.search(request);
  }

  getMetrics(): VisionMetrics {
    return this.analytics.getMetrics();
  }

  getHealth(): VisionHealth {
    return this.monitoring.getHealth();
  }

  getConfig(): VisionEngineConfig {
    return { ...this.config };
  }
}

// Re-export all modules and types
export { ProviderRegistry } from './ProviderRegistry.js';
export { ImageAnalyzer } from './ImageAnalyzer.js';
export { DocumentAnalyzer } from './DocumentAnalyzer.js';
export { ScreenshotAnalyzer } from './ScreenshotAnalyzer.js';
export { DiagramAnalyzer } from './DiagramAnalyzer.js';
export { ArchitectureAnalyzer } from './ArchitectureAnalyzer.js';
export { VideoAnalyzer } from './VideoAnalyzer.js';
export { FrameExtractor } from './FrameExtractor.js';
export { ObjectDetection } from './ObjectDetection.js';
export { SceneUnderstanding } from './SceneUnderstanding.js';
export { OCREngine } from './OCREngine.js';
export { BarcodeReader } from './BarcodeReader.js';
export { QRReader } from './QRReader.js';
export { FaceDetector } from './FaceDetector.js';
export { EmotionDetector } from './EmotionDetector.js';
export { HandwritingReader } from './HandwritingReader.js';
export { TableExtractor } from './TableExtractor.js';
export { ChartReader } from './ChartReader.js';
export { UIAnalyzer } from './UIAnalyzer.js';
export { PromptGenerator } from './PromptGenerator.js';
export { ImageSearch } from './ImageSearch.js';
export { MetadataEngine } from './MetadataEngine.js';
export { Security } from './Security.js';
export { Analytics } from './Analytics.js';
export { Monitoring } from './Monitoring.js';
export { VisionAPI } from './VisionAPI.js';
export * from './interfaces.js';
