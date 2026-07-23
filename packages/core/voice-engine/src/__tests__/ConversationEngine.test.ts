import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationEngine } from '../ConversationEngine.js';
import type { ConversationConfig } from '../interfaces.js';

const config: ConversationConfig = {
  maxTurns: 50,
  timeout: 30000,
  language: 'pt',
  personality: 'jarbas',
  memoryEnabled: true,
};

describe('ConversationEngine', () => {
  let engine: ConversationEngine;
  beforeEach(() => { engine = new ConversationEngine(); });

  it('should start session', async () => {
    const session = await engine.startSession(config);
    expect(session.id).toBeDefined();
    expect(session.language).toBe('pt');
    expect(session.personality).toBe('jarbas');
    expect(session.status).toBe('active');
    expect(session.turns).toHaveLength(0);
  });

  it('should add turns', async () => {
    const session = await engine.startSession(config);
    const turn = await engine.addTurn(session.id, {
      role: 'user',
      content: 'Olá',
      metadata: {},
    });
    expect(turn.id).toBeDefined();
    expect(turn.content).toBe('Olá');
    expect(turn.role).toBe('user');
    expect(engine.getHistory(session.id)).toHaveLength(1);
  });

  it('should throw for unknown session turn', async () => {
    await expect(engine.addTurn('fake', { role: 'user', content: 'hi', metadata: {} }))
      .rejects.toThrow('Session not found');
  });

  it('should end session', async () => {
    const session = await engine.startSession(config);
    const countBefore = engine.getActiveSessions().length;
    await engine.endSession(session.id);
    expect(engine.getSession(session.id)?.status).toBe('ended');
    expect(engine.getActiveSessions()).toHaveLength(countBefore - 1);
  });

  it('should get active sessions', async () => {
    const countBefore = engine.getActiveSessions().length;
    const s1 = await engine.startSession(config);
    const s2 = await engine.startSession(config);
    expect(engine.getActiveSessions()).toHaveLength(countBefore + 2);
    await engine.endSession(s1.id);
    expect(engine.getActiveSessions()).toHaveLength(countBefore + 1);
    await engine.endSession(s2.id);
  });

  it('should return null for unknown session', () => {
    expect(engine.getSession('nonexistent')).toBeNull();
  });
});
