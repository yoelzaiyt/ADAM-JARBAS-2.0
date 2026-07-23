import { describe, it, expect } from 'vitest';
import { AgentDispatch } from '../AgentDispatch.js';

function createDispatch() {
  return new AgentDispatch();
}

describe('AgentDispatch', () => {
  it('dispatch returns dispatch result with status completed or timeout', async () => {
    const dispatch = createDispatch();
    const result = await dispatch.dispatch({
      agentId: 'test-agent',
      input: 'do something',
    });

    expect(result.dispatchId).toBeDefined();
    expect(typeof result.dispatchId).toBe('string');
    expect(result.agentId).toBe('test-agent');
    expect(['completed', 'timeout']).toContain(result.status);
    expect(typeof result.output).toBe('string');
    expect(result.iterations).toBeGreaterThan(0);
  });

  it('dispatch includes tool calls and token counts', async () => {
    const dispatch = createDispatch();
    const result = await dispatch.dispatch({
      agentId: 'test-agent',
      input: 'do something',
    });

    expect(Array.isArray(result.toolCalls)).toBe(true);
    expect(result.toolCalls.length).toBeGreaterThan(0);
    expect(typeof result.toolCalls[0].tool).toBe('string');
    expect(result.toolCalls[0].args).toBeDefined();
    expect(result.toolCalls[0].result).toBeDefined();

    expect(typeof result.totalTokens).toBe('number');
    expect(result.totalTokens).toBeGreaterThan(0);
    expect(typeof result.totalCostUsd).toBe('number');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('getStatus returns dispatch result by id', async () => {
    const dispatch = createDispatch();
    const result = await dispatch.dispatch({
      agentId: 'test-agent',
      input: 'do something',
    });

    const status = await dispatch.getStatus(result.dispatchId);
    expect(status).not.toBeNull();
    expect(status!.dispatchId).toBe(result.dispatchId);
    expect(status!.agentId).toBe('test-agent');
  });

  it('getStatus returns null for unknown id', async () => {
    const dispatch = createDispatch();
    const status = await dispatch.getStatus('nonexistent-id');
    expect(status).toBeNull();
  });

  it('cancel sets dispatch to failed', async () => {
    const dispatch = createDispatch();
    const result = await dispatch.dispatch({
      agentId: 'test-agent',
      input: 'do something',
    });

    await dispatch.cancel(result.dispatchId);

    const status = await dispatch.getStatus(result.dispatchId);
    expect(status).not.toBeNull();
    expect(status!.status).toBe('failed');
    expect(status!.output).toContain('CANCELLED');
  });

  it('works without AgentManager (simulated mode)', async () => {
    const dispatch = new AgentDispatch(undefined, undefined, undefined);

    const result = await dispatch.dispatch({
      agentId: 'sim-agent',
      input: 'simulate',
    });
    expect(result.agentId).toBe('sim-agent');
    expect(result.dispatchId).toBeDefined();
    expect(['completed', 'timeout']).toContain(result.status);

    const status = await dispatch.getStatus(result.dispatchId);
    expect(status).not.toBeNull();

    await dispatch.cancel(result.dispatchId);
    const cancelled = await dispatch.getStatus(result.dispatchId);
    expect(cancelled!.status).toBe('failed');
  });
});
