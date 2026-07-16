import { describe, it, expect } from 'vitest';
import { SkillInvocation } from '../SkillInvocation.js';

function createInvocation() {
  return new SkillInvocation();
}

describe('SkillInvocation', () => {
  it('invoke returns skill output with tool calls', async () => {
    const invocation = createInvocation();
    const result = await invocation.invoke({
      skillId: 'web-search',
      input: 'test query',
    });

    expect(result.skillId).toBe('web-search');
    expect(result.output).toBeDefined();
    expect(typeof result.output).toBe('string');
    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls[0].tool).toBe('web-search');
    expect(typeof result.tokensUsed).toBe('number');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('invoke for known skill (web-search) returns mock result', async () => {
    const invocation = createInvocation();
    const result = await invocation.invoke({
      skillId: 'web-search',
      input: 'hello world',
    });

    expect(result.output).toContain('web search results');
    expect(result.output).toContain('hello world');
    expect(result.toolCalls[0].args).toHaveProperty('input', 'hello world');
  });

  it('invoke for unknown skill returns fallback result', async () => {
    const invocation = createInvocation();
    const result = await invocation.invoke({
      skillId: 'nonexistent-skill',
      input: 'some input',
    });

    expect(result.skillId).toBe('nonexistent-skill');
    expect(result.output).toContain('nonexistent-skill');
    expect(result.toolCalls).toHaveLength(0);
    expect(typeof result.tokensUsed).toBe('number');
  });

  it('listAvailable returns list of skills', async () => {
    const invocation = createInvocation();
    const skills = await invocation.listAvailable();

    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBe(3);
    expect(skills.map((s) => s.id)).toContain('web-search');
    expect(skills.map((s) => s.id)).toContain('code-analysis');
    expect(skills.map((s) => s.id)).toContain('data-retrieval');

    for (const skill of skills) {
      expect(typeof skill.name).toBe('string');
      expect(typeof skill.description).toBe('string');
    }
  });

  it('works without SkillManager (simulated mode)', async () => {
    const invocation = new SkillInvocation(undefined, undefined);

    const result = await invocation.invoke({
      skillId: 'code-analysis',
      input: 'test',
    });
    expect(result.skillId).toBe('code-analysis');
    expect(result.output).toContain('code analysis');

    const skills = await invocation.listAvailable();
    expect(skills.length).toBe(3);
  });
});
