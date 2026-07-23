import { describe, it, expect, beforeEach } from 'vitest';
import { BusinessManager } from '../BusinessManager.js';

describe('BusinessManager', () => {
  let mgr: BusinessManager;

  beforeEach(() => {
    mgr = new BusinessManager({ name: 'Acme', phone: '111' });
  });

  it('getConfig returns config', () => {
    expect(mgr.getConfig().name).toBe('Acme');
  });

  it('updateConfig changes values', async () => {
    const updated = await mgr.updateConfig({ greetingMessage: 'Hello!' });
    expect(updated.greetingMessage).toBe('Hello!');
  });

  it('getGreeting returns greeting', () => {
    expect(typeof mgr.getGreeting()).toBe('string');
  });

  it('getAutoReply returns message', () => {
    expect(typeof mgr.getAutoReply()).toBe('string');
  });
});
