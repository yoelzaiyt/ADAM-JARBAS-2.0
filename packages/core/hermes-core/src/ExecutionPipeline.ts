import type {
  ExecutionPipeline as IExecutionPipeline,
  PipelineDefinition,
  PipelineStage,
  PipelineStageResult,
  PipelineExecution,
  PipelineStageStatus,
  Logger,
} from './interfaces.js';
import { generateId } from '@jarbas/utils';

export class ExecutionPipeline implements IExecutionPipeline {
  private pipelines = new Map<string, PipelineDefinition>();
  private executions = new Map<string, PipelineExecution>();
  private logger?: Logger;

  constructor(logger?: Logger) {
    this.logger = logger;
  }

  register(def: PipelineDefinition): void {
    this.pipelines.set(def.id, def);
    this.logger?.info(`Registered pipeline: ${def.id} (${def.name})`);
  }

  async execute(
    pipelineId: string,
    input: unknown,
  ): Promise<PipelineExecution> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    const executionId = generateId();
    const execution: PipelineExecution = {
      id: executionId,
      pipelineId,
      status: 'running',
      input,
      stages: [],
      startedAt: new Date(),
    };

    this.executions.set(executionId, execution);
    this.logger?.info(`Started pipeline execution: ${executionId}`);

    let previousOutput: unknown = input;

    for (const stage of pipeline.stages) {
      const stageResult = await this.executeStage(
        stage,
        previousOutput,
        execution,
      );

      execution.stages.push(stageResult);

      if (stageResult.status === 'failed') {
        this.logger?.error(
          `Pipeline ${executionId} stage "${stage.name}" failed: ${stageResult.error}`,
        );

        if (pipeline.onError === 'stop') {
          execution.status = 'failed';
          execution.completedAt = new Date();
          return execution;
        }

        if (pipeline.onError === 'retry') {
          const retryResult = await this.retryStage(
            stage,
            previousOutput,
            execution,
          );

          if (retryResult.status === 'failed') {
            execution.status = 'failed';
            execution.completedAt = new Date();
            return execution;
          }

          execution.stages.push(retryResult);
          previousOutput = retryResult.output;
        }
      } else {
        previousOutput = stageResult.output;
      }
    }

    execution.status = 'completed';
    execution.output = previousOutput;
    execution.completedAt = new Date();

    this.logger?.info(`Pipeline execution completed: ${executionId}`);

    return execution;
  }

  async getExecution(
    executionId: string,
  ): Promise<PipelineExecution | null> {
    return this.executions.get(executionId) ?? null;
  }

  listPipelines(): PipelineDefinition[] {
    return Array.from(this.pipelines.values());
  }

  private async executeStage(
    stage: PipelineStage,
    input: unknown,
    execution: PipelineExecution,
  ): Promise<PipelineStageResult> {
    const start = Date.now();

    try {
      const output = await this.simulateStageHandler(stage, input);

      const durationMs = Date.now() - start;

      this.logger?.info(
        `Stage "${stage.name}" completed in ${durationMs}ms`,
      );

      return {
        stage: stage.name,
        status: 'completed',
        output,
        durationMs,
      };
    } catch (err) {
      const durationMs = Date.now() - start;

      return {
        stage: stage.name,
        status: 'failed',
        output: undefined,
        durationMs,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  private async retryStage(
    stage: PipelineStage,
    input: unknown,
    execution: PipelineExecution,
  ): Promise<PipelineStageResult> {
    const maxRetries = 2;
    const backoffMs = 500;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      this.logger?.info(
        `Retrying stage "${stage.name}" (attempt ${attempt + 1}/${maxRetries})`,
      );

      await new Promise((resolve) =>
        setTimeout(resolve, backoffMs * (attempt + 1)),
      );

      const result = await this.executeStage(stage, input, execution);

      if (result.status === 'completed') {
        return result;
      }
    }

    return {
      stage: stage.name,
      status: 'failed',
      output: undefined,
      durationMs: 0,
      error: `Stage "${stage.name}" failed after ${maxRetries} retries`,
    };
  }

  private async simulateStageHandler(
    stage: PipelineStage,
    input: unknown,
  ): Promise<unknown> {
    const delay = Math.random() * 50 + 10;
    await new Promise((resolve) => setTimeout(resolve, delay));

    return {
      stage: stage.name,
      handler: stage.handler,
      processedAt: new Date().toISOString(),
      inputReceived: input !== undefined,
      mockData: {
        metrics: {
          processed: Math.floor(Math.random() * 100),
          successRate: 0.95 + Math.random() * 0.05,
        },
        config: stage.config,
      },
    };
  }
}
