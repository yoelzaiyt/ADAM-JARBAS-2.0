import { describe, it, expect, vi } from 'vitest';
import { WakeWordEngine } from '../WakeWord.js';

describe('WakeWordEngine', () => {
  const engine = new WakeWordEngine();

  it('should start and stop listening', async () => {
    expect(engine.isListening()).toBe(false);
    await engine.start({ words: ['jarbas'], sensitivity: 0.5, timeout: 5000, continuous: false });
    expect(engine.isListening()).toBe(true);
    await engine.stop();
    expect(engine.isListening()).toBe(false);
  });

  it('should add and remove words', async () => {
    await engine.start({ words: ['jarbas'], sensitivity: 0.5, timeout: 5000, continuous: false });
    engine.addWord('sexta');
    engine.removeWord('jarbas');
    expect(engine.isListening()).toBe(true);
    await engine.stop();
  });

  it('should fire detection callback', async () => {
    const callback = vi.fn();
    engine.onDetection(callback);
    await engine.start({ words: ['jarbas'], sensitivity: 0.8, timeout: 100, continuous: true });

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(callback).toHaveBeenCalled();
    const result = callback.mock.calls[0][0];
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
    await engine.stop();
  });
});
