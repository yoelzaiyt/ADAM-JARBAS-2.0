import { describe, it, expect, beforeEach } from 'vitest';
import { RetryEngine } from '../RetryEngine.js';

describe('RetryEngine', () => {
  let engine: RetryEngine;

  beforeEach(() => {
    engine = new RetryEngine();
  });

  it('executes successful function', async () => {
    const result = await engine.execute(async () => 42);
    expect(result).toBe(42);
  });

  it('retries failed function', async () => {
    let attempts = 0;
    const result = await engine.execute(async () => {
      attempts++;
      if (attempts < 2) throw new Error('fail');
      return 'ok';
    }, { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100, backoffMultiplier: 2 });
    expect(result).toBe('ok');
    expect(attempts).toBe(2);
  });

  it('throws after max attempts', async () => {
    await expect(
      engine.execute(async () => { throw new Error('always fail'); },
        { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2 })
    ).rejects.toThrow('always fail');
  });

  it('getRetryCount returns 0 for new id', () => {
    expect(engine.getRetryCount('new')).toBe(0);
  });

  it('reset clears count', () => {
    engine.reset('test');
    expect(engine.getRetryCount('test')).toBe(0);
  });
});
