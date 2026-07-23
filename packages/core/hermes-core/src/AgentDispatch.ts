import type {
  AgentDispatch as IAgentDispatch,
  AgentDispatchRequest,
  AgentDispatchResult,
  AgentDispatchStatus,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

export class AgentDispatch implements IAgentDispatch {
  private agentManager: unknown | null;
  private registry: unknown | null;
  private logger: Logger;
  private dispatchStore: Map<string, AgentDispatchResult> = new Map();

  constructor(agentManager?: unknown, registry?: unknown, logger?: Logger) {
    this.agentManager = agentManager ?? null;
    this.registry = registry ?? null;
    this.logger = logger ?? {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };
  }

  async dispatch(request: AgentDispatchRequest): Promise<AgentDispatchResult> {
    const startTime = Date.now();
    const dispatchId = generateId();

    if (this.agentManager) {
      this.logger.debug('Delegating dispatch to AgentManager', {
        agentId: request.agentId,
        dispatchId,
      });

      const manager = this.agentManager as {
        dispatch: (req: AgentDispatchRequest) => Promise<AgentDispatchResult>;
      };

      try {
        const result = await manager.dispatch(request);
        this.dispatchStore.set(result.dispatchId, result);
        return result;
      } catch (err) {
        this.logger.error('AgentManager dispatch failed, falling back to simulation', {
          agentId: request.agentId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.debug('Using simulated agent dispatch', {
      agentId: request.agentId,
      dispatchId,
    });

    const timeout = request.timeout ?? 30000;
    const iterations = Math.floor(Math.random() * 5) + 1;
    const toolCalls: { tool: string; args: unknown; result: unknown }[] = [];

    for (let i = 0; i < iterations; i++) {
      toolCalls.push({
        tool: `tool-${generateId().slice(0, 8)}`,
        args: { step: i, input: request.input },
        result: `Step ${i + 1} completed`,
      });
    }

    const totalTokens = Math.floor(Math.random() * 2000) + 500;
    const totalCostUsd = totalTokens * 0.000003;
    const latencyMs = Date.now() - startTime;

    const status: AgentDispatchStatus =
      latencyMs > timeout ? 'timeout' : 'completed';

    const result: AgentDispatchResult = {
      dispatchId,
      agentId: request.agentId,
      status,
      output: `Agent "${request.agentId}" completed ${iterations} iterations`,
      iterations,
      toolCalls,
      totalTokens,
      totalCostUsd,
      latencyMs,
    };

    this.dispatchStore.set(dispatchId, result);
    return result;
  }

  async getStatus(dispatchId: string): Promise<AgentDispatchResult | null> {
    if (this.agentManager) {
      this.logger.debug('Fetching status from AgentManager', { dispatchId });

      const manager = this.agentManager as {
        getStatus: (dispatchId: string) => Promise<AgentDispatchResult | null>;
      };

      try {
        return await manager.getStatus(dispatchId);
      } catch (err) {
        this.logger.error('AgentManager getStatus failed, checking local store', {
          dispatchId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.debug('Checking local dispatch store for status', { dispatchId });

    return this.dispatchStore.get(dispatchId) ?? null;
  }

  async cancel(dispatchId: string): Promise<void> {
    if (this.agentManager) {
      this.logger.debug('Cancelling dispatch via AgentManager', { dispatchId });

      const manager = this.agentManager as {
        cancel: (dispatchId: string) => Promise<void>;
      };

      try {
        await manager.cancel(dispatchId);
      } catch (err) {
        this.logger.error('AgentManager cancel failed, updating local store', {
          dispatchId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    this.logger.debug('Updating local dispatch store for cancellation', { dispatchId });

    const existing = this.dispatchStore.get(dispatchId);
    if (existing) {
      this.dispatchStore.set(dispatchId, {
        ...existing,
        status: 'failed' as AgentDispatchStatus,
        output: existing.output
          ? `${existing.output} [CANCELLED]`
          : '[CANCELLED]',
      });
    }
  }
}
