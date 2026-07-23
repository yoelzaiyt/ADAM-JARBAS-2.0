import type { AIProviderName } from '@jarbas/types';

// ─── Common ───────────────────────────────────────────────────────────────────

export type DocumentStatus = 'pending' | 'processing' | 'indexed' | 'failed' | 'archived';

export type ChunkStrategy = 'semantic' | 'paragraph' | 'sliding-window' | 'recursive' | 'token' | 'adaptive';

export type VectorStoreBackend = 'pgvector' | 'qdrant' | 'chromadb' | 'weaviate' | 'milvus' | 'pinecone';

export type EmbeddingProvider = 'openai' | 'gemini' | 'sentence-transformers' | 'bge' | 'e5' | 'jina' | 'nomic';

export type ConnectorType = 'github' | 'gitlab' | 'bitbucket' | 'google-drive' | 'onedrive' | 'dropbox' | 'nextcloud' | 'sharepoint' | 'obsidian' | 'notion' | 'confluence' | 'web' | 'youtube';

export type ParserType = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'markdown' | 'html' | 'csv' | 'json' | 'xml';

export interface KnowledgeEvent {
  type: string;
  timestamp: Date;
  source: string;
  tenantId?: string;
  data: Record<string, unknown>;
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  title: string;
  content: string;
  source: string;
  sourceType: ParserType;
  connectorType?: ConnectorType;
  tenantId: string;
  author?: string;
  tags: string[];
  language?: string;
  mimeType?: string;
  status: DocumentStatus;
  version: number;
  checksum: string;
  hash: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  ingestedAt?: Date;
  indexedAt?: Date;
  expiresAt?: Date;
}

export interface ParsedDocument {
  document: Document;
  chunks: ContentChunk[];
  metadata: Record<string, unknown>;
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

export interface ParserResult {
  content: string;
  metadata: Record<string, unknown>;
  tables?: TableData[];
  images?: ImageData[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface ImageData {
  data: Buffer;
  mimeType: string;
  ocrText?: string;
}

export interface ParseInput {
  content: Buffer | string;
  filename?: string;
  mimeType?: string;
  options?: Record<string, unknown>;
}

export interface Parser {
  parse(input: ParseInput): Promise<ParserResult>;
  supportedTypes: ParserType[];
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

export interface IngestionRequest {
  content: Buffer | string;
  filename: string;
  mimeType?: string;
  source?: string;
  connectorType?: ConnectorType;
  tenantId: string;
  userId?: string;
  tags?: string[];
  options?: Record<string, unknown>;
}

export interface IngestionResult {
  documentId: string;
  status: DocumentStatus;
  chunksCreated: number;
  embeddingTimeMs: number;
  indexingTimeMs: number;
  totalTimeMs: number;
  errors?: string[];
}

export interface IngestionEngine {
  ingest(request: IngestionRequest): Promise<IngestionResult>;
  ingestBatch(requests: IngestionRequest[]): Promise<IngestionResult[]>;
  getDocument(documentId: string): Promise<Document | null>;
  deleteDocument(documentId: string): Promise<void>;
  listDocuments(filters?: {
    tenantId?: string;
    status?: DocumentStatus;
    sourceType?: ParserType;
  }): Promise<Document[]>;
}

// ─── Chunking ─────────────────────────────────────────────────────────────────

export interface ContentChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  startOffset: number;
  endOffset: number;
  tokenCount: number;
  strategy: ChunkStrategy;
  metadata: Record<string, unknown>;
  embedding?: number[];
}

export interface ChunkConfig {
  strategy: ChunkStrategy;
  chunkSize?: number;
  chunkOverlap?: number;
  minChunkSize?: number;
  maxChunkSize?: number;
  separators?: string[];
}

export interface ChunkEngine {
  chunk(content: string, documentId: string, config: ChunkConfig): ContentChunk[];
  rechunk(chunks: ContentChunk[], config: ChunkConfig): ContentChunk[];
  getStrategies(): ChunkStrategy[];
}

// ─── Embeddings ───────────────────────────────────────────────────────────────

export interface EmbeddingConfig {
  provider: EmbeddingProvider;
  model?: string;
  dimensions?: number;
  batchSize?: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface EmbeddingResult {
  embeddings: number[][];
  model: string;
  provider: EmbeddingProvider;
  dimensions: number;
  tokensUsed: number;
  latencyMs: number;
}

export interface EmbeddingEngine {
  embed(texts: string[], config?: EmbeddingConfig): Promise<EmbeddingResult>;
  embedQuery(text: string, config?: EmbeddingConfig): Promise<number[]>;
  getProviders(): EmbeddingProvider[];
  getDimensions(provider: EmbeddingProvider): number;
}

// ─── Indexing (Vector Store) ──────────────────────────────────────────────────

export interface VectorStoreConfig {
  backend: VectorStoreBackend;
  collectionName: string;
  dimensions: number;
  distance?: 'cosine' | 'euclidean' | 'dot';
  url?: string;
  apiKey?: string;
}

export interface IndexRequest {
  chunks: ContentChunk[];
  tenantId: string;
  collectionName?: string;
}

export interface IndexResult {
  indexed: number;
  failed: number;
  errors?: string[];
  latencyMs: number;
}

export interface SearchQuery {
  vector: number[];
  topK: number;
  tenantId: string;
  filters?: Record<string, unknown>;
  threshold?: number;
}

export interface SearchResult {
  chunk: ContentChunk;
  score: number;
  distance: number;
}

export interface IndexingEngine {
  index(request: IndexRequest): Promise<IndexResult>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  delete(documentId: string): Promise<void>;
  deleteCollection(collectionName: string): Promise<void>;
  getCollections(): Promise<string[]>;
  getStats(collectionName: string): Promise<{ count: number; dimensions: number }>;
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

export interface RetrievalRequest {
  query: string;
  tenantId: string;
  topK?: number;
  filters?: Record<string, unknown>;
  strategy?: 'similarity' | 'mmr' | 'hybrid';
}

export interface RetrievalResult {
  chunks: ContentChunk[];
  scores: number[];
  queryEmbedding: number[];
  latencyMs: number;
  totalCandidates: number;
}

export interface RetrievalEngine {
  retrieve(request: RetrievalRequest): Promise<RetrievalResult>;
  retrieveWithRerank(
    request: RetrievalRequest,
    rerankTopK?: number,
  ): Promise<RetrievalResult>;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

export interface RankingCriteria {
  dateWeight?: number;
  authorityWeight?: number;
  popularityWeight?: number;
  relevanceWeight?: number;
  contextWeight?: number;
  feedbackWeight?: number;
}

export interface RankedResult {
  chunk: ContentChunk;
  score: number;
  ranking: number;
  criteria: Record<string, number>;
  rankingReason: string;
}

export interface RankingEngine {
  rank(results: SearchResult[], criteria?: RankingCriteria): RankedResult[];
  rerank(
    results: RankedResult[],
    userFeedback?: Record<string, number>,
  ): RankedResult[];
  getDefaultCriteria(): RankingCriteria;
}

// ─── Deduplication ────────────────────────────────────────────────────────────

export interface DeduplicationResult {
  duplicates: DuplicateGroup[];
  uniqueDocuments: number;
  duplicatesRemoved: number;
}

export interface DuplicateGroup {
  groupId: string;
  documents: string[];
  similarity: number;
  type: 'exact' | 'near-duplicate' | 'semantic';
}

export interface DeduplicationEngine {
  detect(
    documentIds: string[],
    threshold?: number,
  ): Promise<DeduplicationResult>;
  removeDuplicates(groupId: string): Promise<string[]>;
  getSimilar(
    documentId: string,
    threshold?: number,
  ): Promise<Document[]>;
}

// ─── Versioning ───────────────────────────────────────────────────────────────

export interface DocumentVersion {
  documentId: string;
  version: number;
  hash: string;
  checksum: string;
  author?: string;
  source: string;
  changeDescription?: string;
  createdAt: Date;
  status: 'current' | 'archived' | 'deleted';
}

export interface VersioningEngine {
  createVersion(
    documentId: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<DocumentVersion>;
  getVersion(
    documentId: string,
    version: number,
  ): Promise<DocumentVersion | null>;
  getVersionHistory(documentId: string): Promise<DocumentVersion[]>;
  revertToVersion(
    documentId: string,
    version: number,
  ): Promise<Document>;
  getCurrentVersion(documentId: string): Promise<DocumentVersion | null>;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
  score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationRule {
  name: string;
  validate: (input: unknown) => boolean;
  message: string;
}

export interface ValidationEngine {
  validateDocument(document: Document): Promise<ValidationResult>;
  validateContent(
    content: string,
    rules?: ValidationRule[],
  ): Promise<ValidationResult>;
  validateSource(
    source: string,
    connectorType: ConnectorType,
  ): Promise<ValidationResult>;
}

// ─── Connectors ───────────────────────────────────────────────────────────────

export interface ConnectorConfig {
  type: ConnectorType;
  apiKey?: string;
  baseUrl?: string;
  options?: Record<string, unknown>;
}

export interface ConnectorContent {
  items: ConnectorItem[];
  totalItems: number;
  hasMore: boolean;
  cursor?: string;
}

export interface ConnectorItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  metadata: Record<string, unknown>;
  mimeType?: string;
}

export interface Connector {
  connect(config: ConnectorConfig): Promise<boolean>;
  fetch(options?: Record<string, unknown>): Promise<ConnectorContent>;
  getContent(itemId: string): Promise<ConnectorItem>;
  isAvailable(): Promise<boolean>;
  getType(): ConnectorType;
}

// ─── Web Reader ───────────────────────────────────────────────────────────────

export interface WebReaderConfig {
  userAgent?: string;
  maxDepth?: number;
  respectRobots?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  timeout?: number;
}

export interface WebContent {
  url: string;
  title: string;
  content: string;
  markdown: string;
  links: string[];
  metadata: Record<string, unknown>;
  fetchedAt: Date;
}

export interface WebReader {
  fetch(url: string, config?: WebReaderConfig): Promise<WebContent>;
  crawl(
    startUrl: string,
    config?: WebReaderConfig,
  ): Promise<WebContent[]>;
  getSitemap(url: string): Promise<string[]>;
  extractContent(html: string): Promise<string>;
}

// ─── OCR Engine ───────────────────────────────────────────────────────────────

export interface OCRResult {
  text: string;
  tables: TableData[];
  qrCodes: string[];
  barcodes: string[];
  confidence: number;
  language?: string;
}

export interface OCREngine {
  recognize(image: Buffer, mimeType: string): Promise<OCRResult>;
  recognizePdf(pdf: Buffer): Promise<OCRResult[]>;
  getSupportedFormats(): string[];
}

// ─── Cache ────────────────────────────────────────────────────────────────────

export interface CacheConfig {
  ttlMs?: number;
  maxSize?: number;
  strategy?: 'lru' | 'lfu' | 'fifo';
}

export interface CacheEngine {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  getStats(): {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export interface ScheduleSource {
  connectorType: ConnectorType;
  config: ConnectorConfig;
  priority?: number;
  filters?: Record<string, unknown>;
}

export interface ScheduleConfig {
  intervalMs: number;
  enabled: boolean;
  sources: ScheduleSource[];
}

export interface ScheduleStatus {
  id: string;
  lastRun?: Date;
  nextRun?: Date;
  runsCount: number;
  errorsCount: number;
  status: 'active' | 'paused' | 'error';
}

export interface SchedulerEngine {
  start(): Promise<void>;
  stop(): Promise<void>;
  addSource(source: ScheduleSource): Promise<void>;
  removeSource(sourceId: string): Promise<void>;
  getStatus(): ScheduleStatus[];
  triggerNow(sourceId: string): Promise<IngestionResult>;
}

// ─── Monitoring ───────────────────────────────────────────────────────────────

export interface MonitoringMetrics {
  ingestionTimeMs: number;
  ocrTimeMs: number;
  embeddingTimeMs: number;
  searchTimeMs: number;
  precision: number;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  gpuUsagePercent?: number;
  tokensUsed: number;
  costUsd: number;
  documentsIndexed: number;
  chunksStored: number;
  queriesProcessed: number;
}

export interface TrendData {
  metric: string;
  values: { timestamp: Date; value: number }[];
}

export interface AlertData {
  id: string;
  metric: string;
  threshold: number;
  currentValue: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: Date;
}

export interface DashboardData {
  summary: MonitoringMetrics;
  trends: TrendData[];
  alerts: AlertData[];
}

export interface MonitoringEngine {
  recordMetric(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void;
  getMetrics(timeRange?: { start: Date; end: Date }): MonitoringMetrics;
  getDashboard(): DashboardData;
  reset(): void;
}

// ─── Knowledge Graph ──────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: 'person' | 'project' | 'company' | 'document' | 'meeting' | 'product' | 'client' | 'concept';
  label: string;
  properties: Record<string, unknown>;
  tenantId: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  properties: Record<string, unknown>;
}

export interface GraphQuery {
  nodeTypes?: string[];
  edgeTypes?: string[];
  startNode?: string;
  maxDepth?: number;
  limit?: number;
  tenantId: string;
}

export interface KnowledgeGraph {
  addNode(node: Omit<GraphNode, 'id'>): Promise<GraphNode>;
  addEdge(edge: Omit<GraphEdge, 'id'>): Promise<GraphEdge>;
  query(
    query: GraphQuery,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  getNode(nodeId: string): Promise<GraphNode | null>;
  getNeighbors(
    nodeId: string,
    depth?: number,
  ): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  deleteNode(nodeId: string): Promise<void>;
  deleteEdge(edgeId: string): Promise<void>;
  search(query: string, tenantId: string): Promise<GraphNode[]>;
}

// ─── RAG Pipeline ─────────────────────────────────────────────────────────────

export interface RAGRequest {
  query: string;
  tenantId: string;
  topK?: number;
  strategy?: 'similarity' | 'mmr' | 'hybrid';
  rerank?: boolean;
  contextWindow?: number;
  filters?: Record<string, unknown>;
}

export interface RAGContext {
  chunks: RankedResult[];
  totalTokens: number;
  sources: { documentId: string; title: string; score: number }[];
}

export interface RAGResponse {
  answer: string;
  context: RAGContext;
  latencyMs: number;
  tokensUsed: number;
  model: string;
  provider: AIProviderName;
}

export interface RAGEngine {
  query(request: RAGRequest): Promise<RAGResponse>;
  queryStream(request: RAGRequest): AsyncIterable<string>;
  getContext(request: RAGRequest): Promise<RAGContext>;
}

// ─── Security ─────────────────────────────────────────────────────────────────

export interface SecurityConfig {
  encryptionEnabled: boolean;
  encryptionKey?: string;
  lgpdEnabled: boolean;
  auditLog: boolean;
  accessControl: boolean;
}

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
  tenantId: string;
  userId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  userId: string;
  tenantId: string;
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress?: string;
}

export interface SecurityEngine {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
  checkPermission(
    userId: string,
    permission: Permission,
  ): Promise<boolean>;
  logAudit(
    entry: Omit<AuditLog, 'id' | 'timestamp'>,
  ): Promise<AuditLog>;
  getAuditLogs(filters?: {
    tenantId?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]>;
  sanitize(content: string): string;
  validateLGPD(data: Record<string, unknown>): {
    compliant: boolean;
    issues: string[];
  };
}

// ─── Knowledge Hub Config ─────────────────────────────────────────────────────

export interface KnowledgeHubConfig {
  defaultChunkStrategy: ChunkStrategy;
  defaultChunkSize: number;
  defaultChunkOverlap: number;
  embeddingConfig: EmbeddingConfig;
  vectorStoreConfig: VectorStoreConfig;
  cacheConfig: CacheConfig;
  securityConfig: SecurityConfig;
  schedulerEnabled: boolean;
  maxConcurrentIngestions: number;
  defaultRetrievalTopK: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}
