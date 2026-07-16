import { randomUUID } from 'node:crypto';
import type {
  StreamingEngine as IStreamingEngine,
  StreamingConfig,
  StreamingSession,
  AudioChunk,
} from './interfaces.js';

type Listener = (chunk: AudioChunk) => void;

export class StreamingEngine implements IStreamingEngine {
  private sessions: Map<string, StreamingSession> = new Map();
  private listeners: Map<string, Set<Listener>> = new Map();

  async startSession(config: StreamingConfig): Promise<StreamingSession> {
    const id = randomUUID();
    const session: StreamingSession = {
      id,
      mode: config.mode,
      startedAt: new Date(),
      status: 'active',
      chunksProcessed: 0,
    };
    this.sessions.set(id, session);
    this.listeners.set(id, new Set());
    return session;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'ended';
    }
    this.listeners.delete(sessionId);
  }

  async sendAudio(sessionId: string, chunk: AudioChunk): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') return;

    session.chunksProcessed++;
    const callbacks = this.listeners.get(sessionId);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(chunk);
      }
    }
  }

  onAudio(callback: Listener, sessionId: string): void {
    const callbacks = this.listeners.get(sessionId);
    if (callbacks) {
      callbacks.add(callback);
    }
  }

  getSession(sessionId: string): StreamingSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  getActiveSessions(): StreamingSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }
}
