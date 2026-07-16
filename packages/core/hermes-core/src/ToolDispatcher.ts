import type {
  ToolDispatcher as IToolDispatcher,
  ToolDefinition,
  ToolHandler,
  ToolCallRequest,
  ToolCallResult,
  Logger,
} from './interfaces.js';

const DEFAULT_TIMEOUT_MS = 30000;

export class ToolDispatcher implements IToolDispatcher {
  private tools: Map<string, ToolDefinition> = new Map();
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    };
  }

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      this.logger.warn('Overwriting existing tool registration', {
        tool: tool.name,
      });
    }

    this.tools.set(tool.name, tool);
    this.logger.debug('Tool registered', { tool: tool.name });
  }

  unregister(toolName: string): void {
    if (!this.tools.has(toolName)) {
      this.logger.warn('Attempted to unregister non-existent tool', {
        tool: toolName,
      });
      return;
    }

    this.tools.delete(toolName);
    this.logger.debug('Tool unregistered', { tool: toolName });
  }

  async execute(request: ToolCallRequest): Promise<ToolCallResult> {
    const startTime = Date.now();
    const toolName = request.tool;

    if (!this.tools.has(toolName)) {
      this.logger.error('Tool not found', { tool: toolName });

      return {
        tool: toolName,
        result: null,
        success: false,
        durationMs: Date.now() - startTime,
        error: `Tool "${toolName}" not found. Available tools: ${Array.from(this.tools.keys()).join(', ')}`,
      };
    }

    const toolDef = this.tools.get(toolName)!;
    const timeout = request.timeout ?? toolDef.timeout ?? DEFAULT_TIMEOUT_MS;

    this.logger.debug('Executing tool', {
      tool: toolName,
      timeout,
    });

    try {
      const result = await Promise.race([
        toolDef.handler(request.args, request.context),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Tool "${toolName}" timed out after ${timeout}ms`)),
            timeout
          )
        ),
      ]);

      const durationMs = Date.now() - startTime;
      this.logger.debug('Tool execution completed', {
        tool: toolName,
        durationMs,
      });

      return {
        tool: toolName,
        result,
        success: true,
        durationMs,
      };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      this.logger.error('Tool execution failed', {
        tool: toolName,
        error: errorMessage,
        durationMs,
      });

      return {
        tool: toolName,
        result: null,
        success: false,
        durationMs,
        error: errorMessage,
      };
    }
  }

  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }
}
