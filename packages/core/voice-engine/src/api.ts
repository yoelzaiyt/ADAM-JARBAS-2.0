import type {
  VoiceEngineConfig,
  VoiceProfile,
  VoiceRouteRequest,
  ConversationConfig,
  Language,
} from './interfaces.js';
import { VoiceEngine } from './VoiceEngine.js';

export class APIHandler {
  private engine: VoiceEngine;

  constructor(engine: VoiceEngine) {
    this.engine = engine;
  }

  // POST /voice/speak
  async speak(body: {
    text: string;
    profileId?: string;
    language?: string;
    emotion?: string;
  }): Promise<{ status: number; data: unknown }> {
    try {
      const result = await this.engine.speak(body.text, body);
      return {
        status: 200,
        data: { success: true, audio: { duration: result.duration } },
      };
    } catch (error) {
      return {
        status: 500,
        data: { error: (error as Error).message },
      };
    }
  }

  // POST /voice/listen
  async listen(body: {
    audio?: unknown;
    language?: string;
  }): Promise<{ status: number; data: unknown }> {
    return {
      status: 200,
      data: { success: true, text: 'Mock transcription', confidence: 0.95 },
    };
  }

  // POST /voice/stream
  async stream(body: {
    mode: string;
    bufferSize?: number;
  }): Promise<{ status: number; data: unknown }> {
    const session = await this.engine.streaming.startSession({
      mode: body.mode as any,
      bufferSize: body.bufferSize ?? 4096,
      sampleRate: 16000,
      channels: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });

    return {
      status: 200,
      data: {
        sessionId: session.id,
        mode: session.mode,
        status: session.status,
      },
    };
  }

  // POST /voice/translate
  async translate(body: {
    text: string;
    from: string;
    to: string;
  }): Promise<{ status: number; data: unknown }> {
    const result = await this.engine.translate(body.text, body.from, body.to);
    return { status: 200, data: { translated: result } };
  }

  // POST /voice/profile
  async createProfile(
    body: Partial<VoiceProfile>,
  ): Promise<{ status: number; data: unknown }> {
    const profile = await this.engine.profiles.create(body as any);
    return { status: 201, data: profile };
  }

  // GET /voice/profiles
  async getProfiles(): Promise<{ status: number; data: unknown }> {
    const profiles = await this.engine.profiles.list();
    return { status: 200, data: profiles };
  }

  // PUT /voice/profile/:id
  async updateProfile(
    id: string,
    body: Partial<VoiceProfile>,
  ): Promise<{ status: number; data: unknown }> {
    const profile = await this.engine.profiles.update(id, body);
    return { status: 200, data: profile };
  }

  // DELETE /voice/profile/:id
  async deleteProfile(id: string): Promise<{ status: number; data: unknown }> {
    await this.engine.profiles.delete(id);
    return { status: 200, data: { success: true } };
  }

  // GET /voice/status
  async getStatus(): Promise<{ status: number; data: unknown }> {
    return { status: 200, data: this.engine.getHealth() };
  }
}
