import { describe, it, expect } from 'vitest';
import { ChunkEngine } from '../ChunkEngine.js';

const engine = new ChunkEngine();
const docId = 'doc-test-1';

function makeChunk(content: string, strategy: 'semantic' | 'sliding-window' = 'semantic') {
  return engine.chunk(content, docId, { strategy, chunkSize: 1000, chunkOverlap: 200 });
}

describe('ChunkEngine', () => {
  describe('semantic strategy', () => {
    it('splits on double newlines', () => {
      const para = 'This is a sufficiently long paragraph to avoid merging. '.repeat(5);
      const text = `${para}\n\n${para}\n\n${para}`;
      const chunks = engine.chunk(text, docId, {
        strategy: 'semantic',
        chunkSize: 200,
        chunkOverlap: 0,
      });

      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks[0]!.content).toContain('This is a sufficiently');
    });

    it('merges small paragraphs to respect chunkSize', () => {
      const text = 'A short.\n\nB short.\n\nC short.';
      const chunks = engine.chunk(text, docId, {
        strategy: 'semantic',
        chunkSize: 1000,
        chunkOverlap: 0,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0]!.content).toContain('A short');
      expect(chunks[0]!.content).toContain('C short');
    });
  });

  describe('paragraph strategy', () => {
    it('splits on single newlines', () => {
      const text = 'Line one.\nLine two.\nLine three.';
      const chunks = engine.chunk(text, docId, {
        strategy: 'paragraph',
        minChunkSize: 5,
        maxChunkSize: 500,
      });

      expect(chunks.length).toBe(3);
      expect(chunks[0]!.content).toBe('Line one.');
      expect(chunks[1]!.content).toBe('Line two.');
      expect(chunks[2]!.content).toBe('Line three.');
    });

    it('skips paragraphs below minChunkSize', () => {
      const short = 'x'.repeat(5);
      const long = 'y'.repeat(150);
      const text = `${short}\n${long}`;
      const chunks = engine.chunk(text, docId, {
        strategy: 'paragraph',
        minChunkSize: 50,
        maxChunkSize: 500,
      });

      expect(chunks.length).toBe(1);
      expect(chunks[0]!.content).toBe(long);
    });
  });

  describe('sliding-window strategy', () => {
    it('creates fixed-size chunks with overlap', () => {
      const text = 'A'.repeat(300);
      const chunks = engine.chunk(text, docId, {
        strategy: 'sliding-window',
        chunkSize: 100,
        chunkOverlap: 20,
      });

      expect(chunks.length).toBeGreaterThan(0);
      for (const chunk of chunks) {
        expect(chunk.content.length).toBeLessThanOrEqual(100);
      }
    });

    it('covers the full text with overlap', () => {
      const text = 'B'.repeat(500);
      const chunks = engine.chunk(text, docId, {
        strategy: 'sliding-window',
        chunkSize: 100,
        chunkOverlap: 25,
      });

      const totalLength = chunks.reduce((sum, c) => sum + c.content.length, 0);
      expect(totalLength).toBeGreaterThanOrEqual(500);
    });
  });

  describe('recursive strategy', () => {
    it('uses multiple separators', () => {
      const text = 'Paragraph one.\n\nParagraph two.\nSentence one. Sentence two.';
      const chunks = engine.chunk(text, docId, {
        strategy: 'recursive',
        chunkSize: 200,
        separators: ['\n\n', '\n', '. ', ' ', ''],
      });

      expect(chunks.length).toBeGreaterThanOrEqual(1);
      for (const chunk of chunks) {
        expect(chunk.content.length).toBeLessThanOrEqual(200);
      }
    });

    it('falls back to character splitting when needed', () => {
      const long = 'X'.repeat(500);
      const chunks = engine.chunk(long, docId, {
        strategy: 'recursive',
        chunkSize: 100,
      });

      expect(chunks.length).toBeGreaterThan(1);
      for (const chunk of chunks) {
        expect(chunk.content.length).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('token strategy', () => {
    it('estimates tokens and splits at maxTokens', () => {
      const words = Array.from({ length: 50 }, (_, i) => `word${i}`).join(' ');
      const chunks = engine.chunk(words, docId, {
        strategy: 'token',
        chunkSize: 15,
      });

      expect(chunks.length).toBeGreaterThan(1);
      for (const chunk of chunks) {
        expect(chunk.tokenCount).toBeLessThanOrEqual(17);
      }
    });
  });

  describe('adaptive strategy', () => {
    it('detects code and uses sliding-window', () => {
      const code = `function hello() {\n  return true;\n}\n\nclass Foo {\n  constructor() {\n    this.x = 1;\n  }\n}\n\nconst bar = () => {\n  if (true) {\n    return false;\n  }\n};`;
      const chunks = engine.chunk(code, docId, {
        strategy: 'adaptive',
        chunkSize: 500,
        chunkOverlap: 50,
      });

      expect(chunks.length).toBeGreaterThanOrEqual(1);
      for (const chunk of chunks) {
        expect(chunk.strategy).toBe('adaptive');
        expect(chunk.metadata.detectedType).toBe('code');
      }
    });

    it('detects prose and uses semantic', () => {
      const prose = 'The quick brown fox jumps over the lazy dog. ' +
        'This is a longer prose paragraph that should not be detected as code ' +
        'because it has no brackets, semicolons, or keywords.';
      const chunks = engine.chunk(prose, docId, {
        strategy: 'adaptive',
        chunkSize: 500,
        chunkOverlap: 50,
        minChunkSize: 10,
      });

      expect(chunks.length).toBeGreaterThanOrEqual(1);
      for (const chunk of chunks) {
        expect(chunk.strategy).toBe('adaptive');
        expect(chunk.metadata.detectedType).toBe('prose');
      }
    });
  });

  describe('rechunk', () => {
    it('re-chunks existing chunks', () => {
      const long = 'A'.repeat(500);
      const original = engine.chunk(long, docId, {
        strategy: 'sliding-window',
        chunkSize: 100,
        chunkOverlap: 0,
      });

      expect(original.length).toBeGreaterThanOrEqual(2);

      const rechunked = engine.rechunk(original, {
        strategy: 'sliding-window',
        chunkSize: 30,
        chunkOverlap: 5,
      });

      expect(rechunked.length).toBeGreaterThan(0);
      expect(rechunked[0]!.strategy).toBe('sliding-window');
    });
  });

  describe('getStrategies', () => {
    it('returns all 6 strategies', () => {
      const strategies = engine.getStrategies();

      expect(strategies).toEqual([
        'semantic',
        'paragraph',
        'sliding-window',
        'recursive',
        'token',
        'adaptive',
      ]);
      expect(strategies.length).toBe(6);
    });

    it('returns a copy (not a reference)', () => {
      const s1 = engine.getStrategies();
      const s2 = engine.getStrategies();
      expect(s1).toEqual(s2);
      expect(s1).not.toBe(s2);
    });
  });

  describe('chunk metadata', () => {
    it('chunks have proper metadata fields', () => {
      const text = 'Hello world this is a test paragraph with enough content.';
      const chunks = makeChunk(text, 'sliding-window');

      for (const chunk of chunks) {
        expect(chunk.id).toBeDefined();
        expect(typeof chunk.id).toBe('string');
        expect(chunk.documentId).toBe(docId);
        expect(typeof chunk.index).toBe('number');
        expect(typeof chunk.startOffset).toBe('number');
        expect(typeof chunk.endOffset).toBe('number');
        expect(chunk.endOffset).toBeGreaterThan(chunk.startOffset);
        expect(typeof chunk.tokenCount).toBe('number');
        expect(chunk.tokenCount).toBeGreaterThan(0);
        expect(chunk.strategy).toBe('sliding-window');
        expect(chunk.metadata).toBeDefined();
        expect(typeof chunk.metadata.charCount).toBe('number');
        expect(typeof chunk.metadata.wordCount).toBe('number');
      }
    });

    it('indexes are sequential starting at 0', () => {
      const text = 'First.\n\nSecond.\n\nThird.';
      const chunks = makeChunk(text, 'semantic');

      chunks.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
      });
    });
  });
});
