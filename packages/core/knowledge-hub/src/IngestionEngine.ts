import { randomUUID } from 'node:crypto';
import type {
  IngestionEngine as IIngestionEngine,
  IngestionRequest,
  IngestionResult,
  Document,
  DocumentStatus,
  ParserType,
} from './interfaces.js';
import type { ParserFactory } from './Parsers.js';
import type { ChunkEngine } from './ChunkEngine.js';
import type { EmbeddingEngine } from './EmbeddingEngine.js';
import type { IndexingEngine } from './IndexingEngine.js';
import { Logger } from './Logger.js';

const EXTENSION_TO_PARSER: Record<string, ParserType> = {
  '.txt': 'txt',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.html': 'html',
  '.htm': 'html',
  '.csv': 'csv',
  '.json': 'json',
  '.xml': 'xml',
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.xlsx': 'xlsx',
  '.pptx': 'pptx',
};

export class IngestionEngine implements IIngestionEngine {
  private readonly documents: Map<string, Document> = new Map();
  private readonly parserFactory: ParserFactory;
  private readonly chunkEngine: ChunkEngine;
  private readonly embeddingEngine: EmbeddingEngine;
  private readonly indexingEngine: IndexingEngine;
  private readonly logger: Logger;

  constructor(
    parserFactory: ParserFactory,
    chunkEngine: ChunkEngine,
    embeddingEngine: EmbeddingEngine,
    indexingEngine: IndexingEngine,
    logger?: Logger,
  ) {
    this.parserFactory = parserFactory;
    this.chunkEngine = chunkEngine;
    this.embeddingEngine = embeddingEngine;
    this.indexingEngine = indexingEngine;
    this.logger = logger ?? new Logger('IngestionEngine');
  }

  async ingest(request: IngestionRequest): Promise<IngestionResult> {
    const now = new Date();
    const documentId = randomUUID();
    const errors: string[] = [];

    const document: Document = {
      id: documentId,
      title: request.filename,
      content: '',
      source: request.source ?? request.filename,
      sourceType: 'txt',
      connectorType: request.connectorType,
      tenantId: request.tenantId,
      tags: request.tags ?? [],
      status: 'pending',
      version: 0,
      checksum: '',
      hash: '',
      metadata: request.options ?? {},
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(documentId, document);

    const pipelineStart = performance.now();

    try {
      const parserType = this.mapExtensionToParserType(this.getExtension(request.filename));
      document.sourceType = parserType;
      this.logger.info('Starting ingestion', {
        documentId,
        filename: request.filename,
        parserType,
      });

      const parseResult = await this.parserFactory.parse(
        { content: request.content, filename: request.filename, mimeType: request.mimeType },
        parserType,
      );

      document.status = 'processing';
      document.content = parseResult.content;
      document.updatedAt = new Date();

      const chunks = this.chunkEngine.chunk(parseResult.content, documentId, {
        strategy: 'semantic',
      });

      this.logger.info('Chunks created', { documentId, chunkCount: chunks.length });

      const embeddingStart = performance.now();
      const embedResult = await this.embeddingEngine.embed(
        chunks.map((c) => c.content),
      );

      for (let i = 0; i < chunks.length; i++) {
        chunks[i]!.embedding = embedResult.embeddings[i];
      }

      const embeddingTimeMs = performance.now() - embeddingStart;

      this.logger.info('Embeddings computed', {
        documentId,
        dimensions: embedResult.dimensions,
        tokensUsed: embedResult.tokensUsed,
      });

      const indexingStart = performance.now();
      await this.indexingEngine.index({
        chunks,
        tenantId: request.tenantId,
      });
      const indexingTimeMs = performance.now() - indexingStart;

      this.logger.info('Indexing complete', { documentId, indexed: chunks.length });

      document.status = 'indexed';
      document.indexedAt = new Date();
      document.version++;
      document.updatedAt = new Date();

      const totalTimeMs = performance.now() - pipelineStart;

      return {
        documentId,
        status: 'indexed',
        chunksCreated: chunks.length,
        embeddingTimeMs,
        indexingTimeMs,
        totalTimeMs,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      document.status = 'failed';
      document.updatedAt = new Date();

      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);

      this.logger.error('Ingestion failed', { documentId, error: message });

      const totalTimeMs = performance.now() - pipelineStart;

      return {
        documentId,
        status: 'failed',
        chunksCreated: 0,
        embeddingTimeMs: 0,
        indexingTimeMs: 0,
        totalTimeMs,
        errors,
      };
    }
  }

  async ingestBatch(requests: IngestionRequest[]): Promise<IngestionResult[]> {
    const results: IngestionResult[] = [];

    for (const request of requests) {
      results.push(await this.ingest(request));
    }

    return results;
  }

  async getDocument(documentId: string): Promise<Document | null> {
    return this.documents.get(documentId) ?? null;
  }

  async deleteDocument(documentId: string): Promise<void> {
    this.documents.delete(documentId);
    await this.indexingEngine.delete(documentId);

    this.logger.info('Document deleted', { documentId });
  }

  async listDocuments(
    filters?: {
      tenantId?: string;
      status?: DocumentStatus;
      sourceType?: ParserType;
    },
  ): Promise<Document[]> {
    let docs = Array.from(this.documents.values());

    if (filters?.tenantId) {
      docs = docs.filter((d) => d.tenantId === filters.tenantId);
    }
    if (filters?.status) {
      docs = docs.filter((d) => d.status === filters.status);
    }
    if (filters?.sourceType) {
      docs = docs.filter((d) => d.sourceType === filters.sourceType);
    }

    return docs;
  }

  private getExtension(filename: string): string {
    const dot = filename.lastIndexOf('.');
    if (dot === -1) return '';
    return filename.slice(dot).toLowerCase();
  }

  private mapExtensionToParserType(ext: string): ParserType {
    const type = EXTENSION_TO_PARSER[ext];
    if (!type) {
      throw new Error(`Unsupported file extension: ${ext}`);
    }
    return type;
  }
}
