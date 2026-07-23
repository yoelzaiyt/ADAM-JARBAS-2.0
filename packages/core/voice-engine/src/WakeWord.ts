import type {
  WakeWordEngine as IWakeWordEngine,
  WakeWordConfig,
  WakeWordResult,
} from './interfaces.js';

type DetectionCallback = (result: WakeWordResult) => void;

export class WakeWordEngine implements IWakeWordEngine {
  private listening = false;
  private words: Set<string> = new Set(['jarbas', 'hermes', 'sexta-feira']);
  private callbacks: Set<DetectionCallback> = new Set();
  private sensitivity = 0.5;
  private timeout = 5000;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  async start(config: WakeWordConfig): Promise<void> {
    this.listening = true;
    this.sensitivity = config.sensitivity;
    this.timeout = config.timeout;
    this.words = new Set(config.words.map(w => w.toLowerCase()));

    if (config.continuous) {
      this.intervalHandle = setInterval(() => {
        if (this.listening) {
          this.simulateDetection();
        }
      }, this.timeout);
    }
  }

  async stop(): Promise<void> {
    this.listening = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  addWord(word: string): void {
    this.words.add(word.toLowerCase());
  }

  removeWord(word: string): void {
    this.words.delete(word.toLowerCase());
  }

  isListening(): boolean {
    return this.listening;
  }

  onDetection(callback: DetectionCallback): void {
    this.callbacks.add(callback);
  }

  private simulateDetection(): void {
    const words = Array.from(this.words);
    const word = words[Math.floor(Math.random() * words.length)] ?? 'jarbas';
    const confidence = this.sensitivity + Math.random() * (1 - this.sensitivity);

    const result: WakeWordResult = {
      detected: true,
      word,
      confidence,
      timestamp: new Date(),
    };

    for (const cb of this.callbacks) {
      cb(result);
    }
  }
}
