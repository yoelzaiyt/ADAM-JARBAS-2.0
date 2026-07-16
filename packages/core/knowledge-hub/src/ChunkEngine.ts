import { randomUUID } from 'node:crypto';
import type {
  ChunkEngine as IChunkEngine,
  ContentChunk,
  ChunkConfig,
  ChunkStrategy,
} from './interfaces.js';

const DEFAULTS = {
  chunkSize: 1000,
  chunkOverlap: 200,
  minChunkSize: 100,
  maxChunkSize: 2000,
} as const;

const ALL_STRATEGIES: ChunkStrategy[] = [
  'semantic',
  'paragraph',
  'sliding-window',
  'recursive',
  'token',
  'adaptive',
];

function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.round(words * 1.3);
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function buildChunk(
  content: string,
  documentId: string,
  index: number,
  startOffset: number,
  strategy: ChunkStrategy,
  metadataExtras?: Record<string, unknown>,
): ContentChunk {
  const trimmed = content.trim();
  return {
    id: randomUUID(),
    documentId,
    content: trimmed,
    index,
    startOffset,
    endOffset: startOffset + trimmed.length,
    tokenCount: estimateTokens(trimmed),
    strategy,
    metadata: {
      charCount: trimmed.length,
      wordCount: wordCount(trimmed),
      ...metadataExtras,
    },
  };
}

function mergeSmallParagraphs(
  paragraphs: string[],
  chunkSize: number,
  chunkOverlap: number,
): string[] {
  const merged: string[] = [];
  let buffer = '';

  for (const para of paragraphs) {
    if (buffer.length === 0) {
      buffer = para;
    } else if (buffer.length + para.length + 1 <= chunkSize) {
      buffer += '\n\n' + para;
    } else {
      merged.push(buffer);
      buffer = para;
    }
  }
  if (buffer.length > 0) merged.push(buffer);

  if (chunkOverlap > 0 && merged.length > 1) {
    const overlapped: string[] = [merged[0]!];
    for (let i = 1; i < merged.length; i++) {
      const prev = merged[i - 1]!;
      const overlapText = prev.slice(Math.max(0, prev.length - chunkOverlap));
      overlapped.push(overlapText + merged[i]!);
    }
    return overlapped;
  }

  return merged;
}

export class ChunkEngine implements IChunkEngine {
  getStrategies(): ChunkStrategy[] {
    return [...ALL_STRATEGIES];
  }

  chunk(content: string, documentId: string, config: ChunkConfig): ContentChunk[] {
    const {
      strategy,
      chunkSize = DEFAULTS.chunkSize,
      chunkOverlap = DEFAULTS.chunkOverlap,
      minChunkSize = DEFAULTS.minChunkSize,
      maxChunkSize = DEFAULTS.maxChunkSize,
      separators,
    } = config;

    switch (strategy) {
      case 'semantic':
        return this.chunkSemantic(content, documentId, chunkSize, chunkOverlap, minChunkSize);
      case 'paragraph':
        return this.chunkParagraph(content, documentId, minChunkSize, maxChunkSize);
      case 'sliding-window':
        return this.chunkSlidingWindow(content, documentId, chunkSize, chunkOverlap);
      case 'recursive':
        return this.chunkRecursive(content, documentId, chunkSize, separators);
      case 'token':
        return this.chunkToken(content, documentId, chunkSize);
      case 'adaptive':
        return this.chunkAdaptive(content, documentId, chunkSize, chunkOverlap, minChunkSize, maxChunkSize);
      default:
        return this.chunkSemantic(content, documentId, chunkSize, chunkOverlap, minChunkSize);
    }
  }

  rechunk(chunks: ContentChunk[], config: ChunkConfig): ContentChunk[] {
    const combined = chunks.map((c) => c.content).join('\n\n');
    const documentId = chunks[0]?.documentId ?? '';
    return this.chunk(combined, documentId, config);
  }

  private chunkSemantic(
    content: string,
    documentId: string,
    chunkSize: number,
    chunkOverlap: number,
    minChunkSize: number,
  ): ContentChunk[] {
    const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);
    const merged = mergeSmallParagraphs(paragraphs, chunkSize, chunkOverlap);
    const chunks: ContentChunk[] = [];
    let offset = 0;

    for (let i = 0; i < merged.length; i++) {
      const text = merged[i]!;
      if (text.length < minChunkSize && i < merged.length - 1) {
        continue;
      }
      chunks.push(buildChunk(text, documentId, chunks.length, offset, 'semantic'));
      offset += text.length + 2;
    }

    return chunks;
  }

  private chunkParagraph(
    content: string,
    documentId: string,
    minChunkSize: number,
    maxChunkSize: number,
  ): ContentChunk[] {
    const paragraphs = content.split(/\n+/).filter((p) => p.trim().length > 0);
    const chunks: ContentChunk[] = [];
    let offset = 0;

    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed.length >= minChunkSize && trimmed.length <= maxChunkSize) {
        chunks.push(buildChunk(trimmed, documentId, chunks.length, offset, 'paragraph'));
      } else if (trimmed.length > maxChunkSize) {
        const subChunks = this.chunkSlidingWindow(trimmed, documentId, maxChunkSize, 0);
        for (const sc of subChunks) {
          chunks.push({
            ...sc,
            id: randomUUID(),
            index: chunks.length,
            strategy: 'paragraph',
            metadata: { ...sc.metadata, paragraphSplit: true },
          });
        }
      }
      offset += para.length + 1;
    }

    return chunks;
  }

  private chunkSlidingWindow(
    content: string,
    documentId: string,
    chunkSize: number,
    chunkOverlap: number,
  ): ContentChunk[] {
    const chunks: ContentChunk[] = [];
    const step = Math.max(1, chunkSize - chunkOverlap);
    let offset = 0;

    while (offset < content.length) {
      const end = Math.min(offset + chunkSize, content.length);
      const slice = content.slice(offset, end);
      if (slice.trim().length > 0) {
        chunks.push(buildChunk(slice, documentId, chunks.length, offset, 'sliding-window'));
      }
      if (end >= content.length) break;
      offset += step;
    }

    return chunks;
  }

  private chunkRecursive(
    content: string,
    documentId: string,
    chunkSize: number,
    separators?: string[],
  ): ContentChunk[] {
    const seps = separators ?? ['\n\n', '\n', '. ', ' ', ''];
    return this.recursiveSplit(content, documentId, chunkSize, seps, 0);
  }

  private recursiveSplit(
    content: string,
    documentId: string,
    chunkSize: number,
    separators: string[],
    offset: number,
  ): ContentChunk[] {
    if (content.length <= chunkSize) {
      return content.trim().length > 0
        ? [buildChunk(content, documentId, 0, offset, 'recursive')]
        : [];
    }

    for (const sep of separators) {
      if (content.includes(sep) || sep === '') {
        const parts = sep === '' ? this.splitByChars(content, chunkSize) : content.split(sep);
        const chunks: ContentChunk[] = [];
        let currentOffset = offset;

        for (const part of parts) {
          if (part.trim().length === 0) {
            currentOffset += part.length + sep.length;
            continue;
          }
          if (part.length <= chunkSize) {
            chunks.push(buildChunk(part, documentId, chunks.length, currentOffset, 'recursive'));
          } else {
            const subChunks = this.recursiveSplit(part, documentId, chunkSize, separators, currentOffset);
            chunks.push(...subChunks);
          }
          currentOffset += part.length + sep.length;
        }

        if (chunks.length > 0) return chunks;
      }
    }

    return [buildChunk(content.slice(0, chunkSize), documentId, 0, offset, 'recursive')];
  }

  private splitByChars(content: string, chunkSize: number): string[] {
    const parts: string[] = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      parts.push(content.slice(i, i + chunkSize));
    }
    return parts;
  }

  private chunkToken(
    content: string,
    documentId: string,
    maxTokens: number,
  ): ContentChunk[] {
    const words = content.split(/\s+/);
    const chunks: ContentChunk[] = [];
    let currentWords: string[] = [];
    let offset = 0;

    for (const word of words) {
      currentWords.push(word);
      const tokenEstimate = Math.round(currentWords.length * 1.3);

      if (tokenEstimate >= maxTokens) {
        const text = currentWords.join(' ');
        chunks.push(buildChunk(text, documentId, chunks.length, offset, 'token'));
        offset += text.length + 1;
        currentWords = [];
      }
    }

    if (currentWords.length > 0) {
      const text = currentWords.join(' ');
      chunks.push(buildChunk(text, documentId, chunks.length, offset, 'token'));
    }

    return chunks;
  }

  private chunkAdaptive(
    content: string,
    documentId: string,
    chunkSize: number,
    chunkOverlap: number,
    minChunkSize: number,
    maxChunkSize: number,
  ): ContentChunk[] {
    const isCode = this.detectCode(content);

    if (isCode) {
      return this.chunkSlidingWindow(content, documentId, chunkSize, chunkOverlap).map((c) => ({
        ...c,
        strategy: 'adaptive' as ChunkStrategy,
        metadata: { ...c.metadata, detectedType: 'code' },
      }));
    }

    return this.chunkSemantic(content, documentId, chunkSize, chunkOverlap, minChunkSize).map((c) => ({
      ...c,
      strategy: 'adaptive' as ChunkStrategy,
      metadata: { ...c.metadata, detectedType: 'prose' },
    }));
  }

  private detectCode(content: string): boolean {
    const lines = content.split('\n');
    const codeIndicators = [
      /\b(function|class|const|let|var|import|export|return|if\s*\(|for\s*\(|while\s*\()\b/,
      /[{}\[\]();]/,
      /=>/,
      /\/\/|\/\*|\*\/|#include|#define/,
      /\bdef\s+\w+\s*\(/,
      /\b(self|this)\./,
    ];

    let codeLineCount = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;
      for (const pattern of codeIndicators) {
        if (pattern.test(trimmed)) {
          codeLineCount++;
          break;
        }
      }
    }

    const nonEmptyLines = lines.filter((l) => l.trim().length > 0).length;
    return nonEmptyLines > 0 && codeLineCount / nonEmptyLines > 0.3;
  }
}
