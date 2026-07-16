import { describe, it, expect, beforeEach } from 'vitest';
import { IngestionEngine } from '../IngestionEngine.js';
import { ParserFactory } from '../Parsers.js';
import { ChunkEngine } from '../ChunkEngine.js';
import { EmbeddingEngine } from '../EmbeddingEngine.js';
import { IndexingEngine } from '../IndexingEngine.js';
import { Logger } from '../Logger.js';
import type { VectorStoreConfig, IngestionRequest } from '../interfaces.js';

const VECTOR_STORE_CONFIG: VectorStoreConfig = {
  backend: 'chromadb',
  collectionName: 'test-ingestion-collection',
  dimensions: 128,
  distance: 'cosine',
};

function makeRequest(overrides: Partial<IngestionRequest> = {}): IngestionRequest {
  return {
    content: 'This is the full content of a test document for ingestion.',
    filename: 'test-doc.txt',
    tenantId: 'tenant-test',
    ...overrides,
  };
}

describe('IngestionEngine', () => {
  let parserFactory: ParserFactory;
  let chunkEngine: ChunkEngine;
  let embeddingEngine: EmbeddingEngine;
  let indexingEngine: IndexingEngine;
  let logger: Logger;
  let engine: IngestionEngine;

  beforeEach(() => {
    parserFactory = new ParserFactory();
    chunkEngine = new ChunkEngine();
    embeddingEngine = new EmbeddingEngine({ dimensions: 128 });
    indexingEngine = new IndexingEngine(VECTOR_STORE_CONFIG);
    logger = new Logger('TestIngestion', 'error');
    engine = new IngestionEngine(parserFactory, chunkEngine, embeddingEngine, indexingEngine, logger);
  });

  it('should create with ParserFactory, ChunkEngine, EmbeddingEngine, IndexingEngine', () => {
    expect(engine).toBeInstanceOf(IngestionEngine);
  });

  describe('ingest', () => {
    it('should create a document with proper status', async () => {
      const result = await engine.ingest(makeRequest());

      expect(result.documentId).toBeTruthy();
      expect(typeof result.documentId).toBe('string');
      expect(result.status).toBe('indexed');
      expect(result.chunksCreated).toBeGreaterThanOrEqual(1);
    });

    it('should process through full pipeline (parse, chunk, embed, index)', async () => {
      const result = await engine.ingest(
        makeRequest({
          content: 'First paragraph of the document.\n\nSecond paragraph with more content.\n\nThird paragraph for testing.',
          filename: 'pipeline-test.txt',
        }),
      );

      expect(result.status).toBe('indexed');
      expect(result.chunksCreated).toBeGreaterThanOrEqual(1);
      expect(result.embeddingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.indexingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.totalTimeMs).toBeGreaterThan(0);

      const doc = await engine.getDocument(result.documentId);
      expect(doc).not.toBeNull();
      expect(doc!.status).toBe('indexed');
      expect(doc!.content.length).toBeGreaterThan(0);
      expect(doc!.version).toBe(1);
    });

    it('should store the document retrievable by getDocument', async () => {
      const result = await engine.ingest(makeRequest({ filename: 'fetch-test.txt' }));
      const doc = await engine.getDocument(result.documentId);

      expect(doc).not.toBeNull();
      expect(doc!.title).toBe('fetch-test.txt');
      expect(doc!.tenantId).toBe('tenant-test');
      expect(doc!.status).toBe('indexed');
    });
  });

  describe('ingestBatch', () => {
    it('should process multiple requests', async () => {
      const requests = [
        makeRequest({ filename: 'batch-1.txt', content: 'Content for batch document one.' }),
        makeRequest({ filename: 'batch-2.txt', content: 'Content for batch document two.' }),
        makeRequest({ filename: 'batch-3.txt', content: 'Content for batch document three.' }),
      ];

      const results = await engine.ingestBatch(requests);

      expect(results.length).toBe(3);
      results.forEach((r) => {
        expect(r.status).toBe('indexed');
        expect(r.documentId).toBeTruthy();
      });

      const ids = results.map((r) => r.documentId);
      expect(new Set(ids).size).toBe(3);
    });
  });

  describe('getDocument', () => {
    it('should return stored document', async () => {
      const result = await engine.ingest(makeRequest({ filename: 'stored.txt' }));
      const doc = await engine.getDocument(result.documentId);

      expect(doc).not.toBeNull();
      expect(doc!.id).toBe(result.documentId);
      expect(doc!.title).toBe('stored.txt');
    });

    it('should return null for non-existent document', async () => {
      const doc = await engine.getDocument('non-existent-id');
      expect(doc).toBeNull();
    });
  });

  describe('deleteDocument', () => {
    it('should remove document', async () => {
      const result = await engine.ingest(makeRequest({ filename: 'to-delete.txt' }));
      const docBefore = await engine.getDocument(result.documentId);
      expect(docBefore).not.toBeNull();

      await engine.deleteDocument(result.documentId);

      const docAfter = await engine.getDocument(result.documentId);
      expect(docAfter).toBeNull();
    });
  });

  describe('listDocuments', () => {
    it('should filter by tenantId', async () => {
      await engine.ingest(makeRequest({ filename: 't1.txt', tenantId: 'tenant-alpha' }));
      await engine.ingest(makeRequest({ filename: 't2.txt', tenantId: 'tenant-beta' }));
      await engine.ingest(makeRequest({ filename: 't3.txt', tenantId: 'tenant-alpha' }));

      const alphaDocs = await engine.listDocuments({ tenantId: 'tenant-alpha' });
      const betaDocs = await engine.listDocuments({ tenantId: 'tenant-beta' });

      expect(alphaDocs.length).toBe(2);
      expect(betaDocs.length).toBe(1);
      alphaDocs.forEach((d) => expect(d.tenantId).toBe('tenant-alpha'));
      betaDocs.forEach((d) => expect(d.tenantId).toBe('tenant-beta'));
    });

    it('should filter by status', async () => {
      await engine.ingest(makeRequest({ filename: 'indexed.txt', tenantId: 't1' }));

      const indexedDocs = await engine.listDocuments({ status: 'indexed' });
      const pendingDocs = await engine.listDocuments({ status: 'pending' });
      const failedDocs = await engine.listDocuments({ status: 'failed' });

      expect(indexedDocs.length).toBeGreaterThanOrEqual(1);
      expect(pendingDocs.length).toBe(0);
      expect(failedDocs.length).toBe(0);
    });

    it('should return all documents without filters', async () => {
      await engine.ingest(makeRequest({ filename: 'all-1.txt', tenantId: 'x' }));
      await engine.ingest(makeRequest({ filename: 'all-2.txt', tenantId: 'y' }));

      const allDocs = await engine.listDocuments();
      expect(allDocs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('error handling', () => {
    it('should set status to failed on unsupported file extension', async () => {
      const result = await engine.ingest(
        makeRequest({
          filename: 'bad-file.xyz',
          content: 'some content',
        }),
      );

      expect(result.status).toBe('failed');
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);

      const doc = await engine.getDocument(result.documentId);
      expect(doc!.status).toBe('failed');
    });
  });
});
