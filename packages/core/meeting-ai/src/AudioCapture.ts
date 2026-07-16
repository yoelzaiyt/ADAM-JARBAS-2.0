import type {
  AudioCapture as IAudioCapture,
  AudioChunk,
  CaptureConfig,
  AudioSource,
} from './interfaces.js';

type Listener = (chunk: AudioChunk) => void;

export class AudioCapture implements IAudioCapture {
  private activeCaptures: Set<string> = new Set();
  private listeners: Set<Listener> = new Set();

  async startCapture(meetingId: string, config: CaptureConfig): Promise<void> {
    this.activeCaptures.add(meetingId);
  }

  async stopCapture(meetingId: string): Promise<void> {
    this.activeCaptures.delete(meetingId);
  }

  onAudio(callback: Listener): void {
    this.listeners.add(callback);
  }

  emitChunk(chunk: AudioChunk): void {
    for (const cb of this.listeners) {
      cb(chunk);
    }
  }

  getActiveCaptures(): string[] {
    return Array.from(this.activeCaptures);
  }

  isCapturing(meetingId: string): boolean {
    return this.activeCaptures.has(meetingId);
  }
}
