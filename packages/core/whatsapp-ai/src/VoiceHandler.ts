import { randomUUID } from 'node:crypto';
import type {
  VoiceHandler as IVoiceHandler,
  VoiceMessage,
  GatewayMessage,
} from './interfaces.js';

export class VoiceHandler implements IVoiceHandler {
  private messages: Map<string, VoiceMessage> = new Map();

  async processAudio(audioUrl: string, contactId: string): Promise<VoiceMessage> {
    const id = randomUUID();
    const voice: VoiceMessage = {
      id, contactId, audioUrl, durationMs: 5000,
      language: 'pt-BR', transcribedAt: new Date(),
    };
    this.messages.set(id, voice);
    return voice;
  }

  async transcribe(voiceId: string): Promise<string> {
    const msg = this.messages.get(voiceId);
    if (!msg) throw new Error(`Voice message not found: ${voiceId}`);
    msg.transcription = '[transcription placeholder]';
    msg.transcribedAt = new Date();
    return msg.transcription;
  }

  async respondWithVoice(conversationId: string, text: string): Promise<GatewayMessage> {
    return {
      id: randomUUID(), from: 'system', to: conversationId,
      type: 'audio', direction: 'outbound', text,
      timestamp: new Date(), status: 'pending',
      provider: 'meta', metadata: {},
    };
  }

  getVoiceMessage(voiceId: string): VoiceMessage | null {
    return this.messages.get(voiceId) ?? null;
  }
}
