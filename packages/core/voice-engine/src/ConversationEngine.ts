import { randomUUID } from 'node:crypto';
import type {
  ConversationEngine as IConversationEngine,
  ConversationTurn,
  ConversationSession,
  ConversationConfig,
  SpeakerRole,
  VoiceEmotion,
  Language,
} from './interfaces.js';

export class ConversationEngine implements IConversationEngine {
  private readonly sessions: Map<string, ConversationSession> = new Map();

  async startSession(config: ConversationConfig): Promise<ConversationSession> {
    const id = randomUUID();
    const now = new Date();
    const session: ConversationSession = {
      id,
      turns: [],
      startedAt: now,
      lastActivity: now,
      language: config.language,
      personality: config.personality,
      status: 'active',
    };
    this.sessions.set(id, session);
    return session;
  }

  async addTurn(
    sessionId: string,
    turn: Omit<ConversationTurn, 'id' | 'timestamp'>,
  ): Promise<ConversationTurn> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    const fullTurn: ConversationTurn = {
      ...turn,
      id: randomUUID(),
      timestamp: new Date(),
    };
    session.turns.push(fullTurn);
    session.lastActivity = new Date();
    return fullTurn;
  }

  getSession(sessionId: string): ConversationSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    session.status = 'ended';
  }

  getHistory(sessionId: string): ConversationTurn[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    return [...session.turns];
  }

  getActiveSessions(): ConversationSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.status === 'active',
    );
  }
}
