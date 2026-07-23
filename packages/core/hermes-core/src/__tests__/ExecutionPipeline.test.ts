import { describe, it, expect, vi } from 'vitest';
import { ExecutionPipeline } from '../ExecutionPipeline.js';
import type { PipelineDefinition, PipelineStage } from '../interfaces.js';

function makeStage(overrides: Partial<PipelineStage> = {}): PipelineStage {
  return {
    name: 'Stage 1',
    handler: 'handler1',
    config: {},
    ...overrides,
  };
}

function makePipeline(overrides: Partial<PipelineDefinition> = {}): PipelineDefinition {
  return {
    id: 'pipe1',
    name: 'Test Pipeline',
    stages: [makeStage()],
    onError: 'stop',
    ...overrides,
  };
}

describe('ExecutionPipeline', () => {
  it('register: registers a pipeline definition', () => {
    const pipeline = new ExecutionPipeline();
    pipeline.register(makePipeline());
    const list = pipeline.listPipelines();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('pipe1');
  });

  it('execute: runs all stages sequentially', async () => {
    const pipeline = new ExecutionPipeline();
    pipeline.register(makePipeline({
      stages: [makeStage({ name: 'A', handler: 'h1' }), makeStage({ name: 'B', handler: 'h2' })],
    }));
    const exec = await pipeline.execute('pipe1', { data: 1 });
    expect(exec.stages).toHaveLength(2);
    expect(exec.stages[0].stage).toBe('A');
    expect(exec.stages[1].stage).toBe('B');
    expect(exec.stages[0].status).toBe('completed');
    expect(exec.stages[1].status).toBe('completed');
  });

  it('execute: returns completed execution', async () => {
    const pipeline = new ExecutionPipeline();
    pipeline.register(makePipeline());
    const exec = await pipeline.execute('pipe1', 'input');
    expect(exec.status).toBe('completed');
    expect(exec.pipelineId).toBe('pipe1');
    expect(exec.input).toBe('input');
    expect(exec.output).toBeDefined();
    expect(exec.completedAt).toBeInstanceOf(Date);
    expect(exec.id).toBeTruthy();
  });

  it('execute: throws for nonexistent pipeline', async () => {
    const pipeline = new ExecutionPipeline();
    await expect(pipeline.execute('nope', {})).rejects.toThrow('Pipeline not found');
  });

  it('execute: handles stage failure with onError=stop', async () => {
    const pipeline = new ExecutionPipeline();
    pipeline.register(makePipeline({
      stages: [makeStage({ name: 'FailStage' })],
      onError: 'stop',
    }));

    const spy = vi.spyOn(
      pipeline as unknown as { simulateStageHandler: (s: PipelineStage, i: unknown) => Promise<unknown> },
      'simulateStageHandler',
    );
    spy.mockRejectedValueOnce(new Error('stage failed'));

    const exec = await pipeline.execute('pipe1', {});
    expect(exec.status).toBe('failed');
    expect(exec.stages).toHaveLength(1);
    expect(exec.stages[0].status).toBe('failed');
    expect(exec.stages[0].error).toBe('stage failed');
    expect(exec.completedAt).toBeInstanceOf(Date);
  });

  it('getExecution: returns execution by id', async () => {
    const pipeline = new ExecutionPipeline();
    pipeline.register(makePipeline());
    const exec = await pipeline.execute('pipe1', {});
    const fetched = await pipeline.getExecution(exec.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(exec.id);
  });

  it('getExecution: returns null if not found', async () => {
    const pipeline = new ExecutionPipeline();
    expect(await pipeline.getExecution('nope')).toBeNull();
  });

  it('listPipelines: returns all registered pipelines', () => {
    const pipeline = new ExecutionPipeline();
    pipeline.register(makePipeline({ id: 'p1', name: 'P1' }));
    pipeline.register(makePipeline({ id: 'p2', name: 'P2' }));
    const list = pipeline.listPipelines();
    expect(list).toHaveLength(2);
    expect(list.map((p) => p.id)).toEqual(['p1', 'p2']);
  });
});
