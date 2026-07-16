'use strict';

import type {
  ContextEngine as IContextEngine,
  ContextWindow,
  ContextSource,
  ContextAssemblyRequest,
  ContextAssemblyResult,
  Logger,
} from './interfaces.js';
import type { ChatMessage } from '@jarbas/types';
import { generateId } from '@jarbas/utils';

const CJK_REGEX = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;

function estimateTokens(text: string): number {
  if (text.length === 0) return 0;

  let cjkCount = 0;
  let nonCjkCount = 0;

  for (let i = 0; i < text.length; i++) {
    if (CJK_REGEX.test(text[i])) {
      cjkCount++;
    } else {
      nonCjkCount++;
    }
  }

  return Math.ceil(nonCjkCount / 4) + Math.ceil(cjkCount / 2);
}

function sortByPriorityDesc(a: ContextSource, b: ContextSource): number {
  return b.priority - a.priority;
}

function truncateText(text: string, maxTokens: number): string {
  if (maxTokens <= 0) return '';
  const estimatedTokens = estimateTokens(text);
  if (estimatedTokens <= maxTokens) return text;

  const targetChars = maxTokens * 4;
  if (text.length <= targetChars) return text;

  const truncated = text.slice(0, Math.floor(targetChars));
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > truncated.length * 0.8 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

export class ContextEngine implements IContextEngine {
  private sources: ContextSource[] = [];
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async assemble(request: ContextAssemblyRequest): Promise<ContextAssemblyResult> {
    const startTime = performance.now();

    this.logger.info('Assembling context window', {
      sessionId: request.sessionId,
      tenantId: request.tenantId,
      maxTokens: request.maxTokens,
      sourceCount: request.sources.length,
    });

    const availableBudget = request.maxTokens;
    let remainingBudget = availableBudget;

    const systemTokens = request.systemPrompt ? estimateTokens(request.systemPrompt) : 0;
    if (systemTokens > 0) {
      remainingBudget -= systemTokens;
    }

    const queryTokens = estimateTokens(request.query);
    remainingBudget -= queryTokens;

    const sortedSources = [...request.sources].sort(sortByPriorityDesc);
    const sourcesUsed: ContextSource[] = [];
    const messages: ChatMessage[] = [];
    let truncated = false;

    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    for (const source of sortedSources) {
      if (remainingBudget <= 0) {
        truncated = true;
        this.logger.debug('Token budget exhausted', {
          remainingBudget,
          sourceType: source.type,
        });
        break;
      }

      const sourceTokens = source.tokensEstimate > 0 ? source.tokensEstimate : estimateTokens(source.content);

      if (sourceTokens <= remainingBudget) {
        messages.push({
          role: 'user',
          content: `[${source.type}] ${source.content}`,
        });
        sourcesUsed.push(source);
        remainingBudget -= sourceTokens;
      } else {
        const truncatedContent = truncateText(source.content, remainingBudget);
        const truncatedTokens = estimateTokens(truncatedContent);

        if (truncatedTokens > 0 && truncatedContent.length > 0) {
          messages.push({
            role: 'user',
            content: `[${source.type}] ${truncatedContent}`,
          });
          sourcesUsed.push({
            ...source,
            content: truncatedContent,
            tokensEstimate: truncatedTokens,
          });
          remainingBudget -= truncatedTokens;
          truncated = true;
        } else {
          truncated = true;
        }
      }
    }

    const storedSources = this.sources.filter(s => !sourcesUsed.some(u => u.type === s.type && u.content === s.content));
    for (const stored of storedSources) {
      if (remainingBudget <= 0) break;

      const storedTokens = stored.tokensEstimate > 0 ? stored.tokensEstimate : estimateTokens(stored.content);
      if (storedTokens <= remainingBudget) {
        messages.push({
          role: 'user',
          content: `[${stored.type}] ${stored.content}`,
        });
        sourcesUsed.push(stored);
        remainingBudget -= storedTokens;
      }
    }

    messages.push({
      role: 'user',
      content: request.query,
    });

    const usedTokens = availableBudget - remainingBudget;
    const tokensSaved = request.sources
      .filter(s => !sourcesUsed.some(u => u.type === s.type && u.content === s.content))
      .reduce((sum, s) => sum + (s.tokensEstimate > 0 ? s.tokensEstimate : estimateTokens(s.content)), 0);

    const window: ContextWindow = {
      maxTokens: request.maxTokens,
      currentTokens: usedTokens,
      messages,
      systemPrompt: request.systemPrompt,
      metadata: {
        sessionId: request.sessionId,
        tenantId: request.tenantId,
        assembledAt: new Date().toISOString(),
        sourcesCount: sourcesUsed.length,
        truncated,
      },
    };

    const latencyMs = performance.now() - startTime;

    this.logger.info('Context window assembled', {
      sessionId: request.sessionId,
      currentTokens: usedTokens,
      maxTokens: request.maxTokens,
      sourcesUsed: sourcesUsed.length,
      truncated,
      latencyMs: Math.round(latencyMs * 100) / 100,
    });

    return {
      window,
      sourcesUsed,
      tokensSaved,
      truncated,
    };
  }

  addSource(source: ContextSource): void {
    this.sources.push(source);
    this.logger.debug('Source added', {
      type: source.type,
      priority: source.priority,
      tokensEstimate: source.tokensEstimate,
    });
  }

  removeSource(sourceId: string): void {
    const index = this.sources.findIndex((_, i) => `${i}` === sourceId);
    if (index !== -1) {
      this.sources.splice(index, 1);
      this.logger.debug('Source removed', { sourceId });
    } else {
      this.logger.warn('Source not found for removal', { sourceId });
    }
  }

  getSources(): ContextSource[] {
    return [...this.sources];
  }

  estimateTokens(text: string): number {
    return estimateTokens(text);
  }
}
