import type { KnowledgeHubConfig } from './interfaces.js';
import { Logger } from './Logger.js';
import { CacheEngine } from './CacheEngine.js';
import { ParserFactory } from './Parsers.js';
import { ChunkEngine } from './ChunkEngine.js';
import { EmbeddingEngine } from './EmbeddingEngine.js';
import { IndexingEngine } from './IndexingEngine.js';
import { RetrievalEngine } from './RetrievalEngine.js';
import { RankingEngine } from './RankingEngine.js';
import { IngestionEngine } from './IngestionEngine.js';
import { DeduplicationEngine } from './DeduplicationEngine.js';
import { VersioningEngine } from './VersioningEngine.js';
import { ValidationEngine } from './ValidationEngine.js';
import { ConnectorManager } from './ConnectorEngine.js';
import { WebReader } from './WebReader.js';
import { OCREngine } from './OCREngine.js';
import { SchedulerEngine } from './SchedulerEngine.js';
import { MonitoringEngine } from './MonitoringEngine.js';
import { KnowledgeGraph } from './KnowledgeGraph.js';
import { RAGEngine } from './RAGEngine.js';
import { SecurityEngine } from './SecurityEngine.js';

export class KnowledgeHub {
  private config: KnowledgeHubConfig;
  private logger: Logger;

  public cache: CacheEngine;
  public parsers: ParserFactory;
  public chunks: ChunkEngine;
  public embeddings: EmbeddingEngine;
  public indexing: IndexingEngine;
  public retrieval: RetrievalEngine;
  public ranking: RankingEngine;
  public ingestion: IngestionEngine;
  public deduplication: DeduplicationEngine;
  public versioning: VersioningEngine;
  public validation: ValidationEngine;
  public connectors: ConnectorManager;
  public webReader: WebReader;
  public ocr: OCREngine;
  public scheduler: SchedulerEngine;
  public monitoring: MonitoringEngine;
  public knowledgeGraph: KnowledgeGraph;
  public rag: RAGEngine;
  public security: SecurityEngine;

  constructor(config: KnowledgeHubConfig) {
    this.config = config;
    this.logger = new Logger('KnowledgeHub', config.logLevel);

    this.cache = new CacheEngine(config.cacheConfig);
    this.parsers = new ParserFactory();
    this.chunks = new ChunkEngine();
    this.embeddings = new EmbeddingEngine(config.embeddingConfig);
    this.indexing = new IndexingEngine(config.vectorStoreConfig);
    this.retrieval = new RetrievalEngine(this.indexing, this.embeddings);
    this.ranking = new RankingEngine();
    this.ingestion = new IngestionEngine(this.parsers, this.chunks, this.embeddings, this.indexing, this.logger);
    this.deduplication = new DeduplicationEngine();
    this.versioning = new VersioningEngine();
    this.validation = new ValidationEngine();
    this.connectors = new ConnectorManager();
    this.webReader = new WebReader();
    this.ocr = new OCREngine();
    this.scheduler = new SchedulerEngine({ intervalMs: 3600000, enabled: config.schedulerEnabled, sources: [] });
    this.monitoring = new MonitoringEngine();
    this.knowledgeGraph = new KnowledgeGraph();
    this.rag = new RAGEngine(this.retrieval, this.ranking);
    this.security = new SecurityEngine(config.securityConfig);

    this.logger.info('Knowledge Hub initialized', {
      config: {
        ...config,
        securityConfig: { ...config.securityConfig, encryptionKey: '***' },
      },
    });
  }

  static createDefault(): KnowledgeHub {
    return new KnowledgeHub({
      defaultChunkStrategy: 'semantic',
      defaultChunkSize: 1000,
      defaultChunkOverlap: 200,
      embeddingConfig: {
        provider: 'sentence-transformers',
        model: 'all-MiniLM-L6-v2',
        dimensions: 384,
        batchSize: 32,
      },
      vectorStoreConfig: {
        backend: 'chromadb',
        collectionName: 'jarbas-knowledge',
        dimensions: 384,
        distance: 'cosine',
      },
      cacheConfig: { ttlMs: 300000, maxSize: 10000, strategy: 'lru' },
      securityConfig: {
        encryptionEnabled: false,
        lgpdEnabled: true,
        auditLog: true,
        accessControl: true,
      },
      schedulerEnabled: false,
      maxConcurrentIngestions: 5,
      defaultRetrievalTopK: 10,
      logLevel: 'info',
    });
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Knowledge Hub subsystems...');
    if (this.config.schedulerEnabled) {
      await this.scheduler.start();
    }
    this.logger.info('Knowledge Hub ready');
  }

  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Knowledge Hub...');
    await this.scheduler.stop();
    this.cache.clear();
    this.logger.info('Knowledge Hub shut down');
  }

  getConfig(): KnowledgeHubConfig {
    return { ...this.config };
  }

  getHealth(): { status: string; uptime: number; modules: Record<string, string> } {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      modules: {
        cache: 'ok',
        parsers: 'ok',
        chunks: 'ok',
        embeddings: 'ok',
        indexing: 'ok',
        retrieval: 'ok',
        ranking: 'ok',
        ingestion: 'ok',
        deduplication: 'ok',
        versioning: 'ok',
        validation: 'ok',
        connectors: 'ok',
        webReader: 'ok',
        ocr: 'ok',
        scheduler: this.config.schedulerEnabled ? 'ok' : 'disabled',
        monitoring: 'ok',
        knowledgeGraph: 'ok',
        rag: 'ok',
        security: 'ok',
      },
    };
  }
}
