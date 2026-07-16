import { describe, it, expect } from 'vitest';
import { ToolDispatcher } from '../ToolDispatcher.js';
import type { ToolDefinition, ToolCallRequest } from '../interfaces.js';

function createTool(name = 'test-tool'): ToolDefinition {
  return {
    name,
    description: 'A test tool',
    parameters: { type: 'object', properties: {} },
    handler: async (args) => ({ success: true, input: args }),
  };
}

function createDispatcher() {
  return new ToolDispatcher();
}

describe('ToolDispatcher', () => {
  it('register adds a tool', () => {
    const dispatcher = createDispatcher();
    const tool = createTool();
    dispatcher.register(tool);

    expect(dispatcher.hasTool('test-tool')).toBe(true);
    expect(dispatcher.listTools()).toHaveLength(1);
    expect(dispatcher.listTools()[0].name).toBe('test-tool');
  });

  it('unregister removes a tool', () => {
    const dispatcher = createDispatcher();
    dispatcher.register(createTool());
    expect(dispatcher.hasTool('test-tool')).toBe(true);

    dispatcher.unregister('test-tool');
    expect(dispatcher.hasTool('test-tool')).toBe(false);
    expect(dispatcher.listTools()).toHaveLength(0);
  });

  it('execute runs tool handler and returns result', async () => {
    const dispatcher = createDispatcher();
    dispatcher.register(createTool());

    const result = await dispatcher.execute({ tool: 'test-tool', args: { foo: 'bar' } });

    expect(result.success).toBe(true);
    expect(result.tool).toBe('test-tool');
    expect(result.result).toEqual({ success: true, input: { foo: 'bar' } });
    expect(typeof result.durationMs).toBe('number');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('execute returns error for nonexistent tool', async () => {
    const dispatcher = createDispatcher();

    const result = await dispatcher.execute({ tool: 'no-such-tool', args: {} });

    expect(result.success).toBe(false);
    expect(result.tool).toBe('no-such-tool');
    expect(result.result).toBeNull();
    expect(result.error).toContain('not found');
  });

  it('execute handles timeout', async () => {
    const dispatcher = createDispatcher();
    const slowTool: ToolDefinition = {
      name: 'slow-tool',
      description: 'A slow tool',
      parameters: { type: 'object', properties: {} },
      handler: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return 'done';
      },
    };
    dispatcher.register(slowTool);

    const result = await dispatcher.execute({
      tool: 'slow-tool',
      args: {},
      timeout: 50,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('timed out');
  }, 5000);

  it('execute handles handler errors', async () => {
    const dispatcher = createDispatcher();
    const errorTool: ToolDefinition = {
      name: 'error-tool',
      description: 'A tool that throws',
      parameters: { type: 'object', properties: {} },
      handler: async () => {
        throw new Error('something went wrong');
      },
    };
    dispatcher.register(errorTool);

    const result = await dispatcher.execute({ tool: 'error-tool', args: {} });

    expect(result.success).toBe(false);
    expect(result.result).toBeNull();
    expect(result.error).toBe('something went wrong');
  });

  it('listTools returns all registered tools', () => {
    const dispatcher = createDispatcher();
    dispatcher.register(createTool('tool-a'));
    dispatcher.register(createTool('tool-b'));
    dispatcher.register(createTool('tool-c'));

    const tools = dispatcher.listTools();
    expect(tools).toHaveLength(3);

    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(['tool-a', 'tool-b', 'tool-c']);
  });

  it('hasTool returns true/false', () => {
    const dispatcher = createDispatcher();
    dispatcher.register(createTool('exists'));

    expect(dispatcher.hasTool('exists')).toBe(true);
    expect(dispatcher.hasTool('does-not-exist')).toBe(false);
  });
});
