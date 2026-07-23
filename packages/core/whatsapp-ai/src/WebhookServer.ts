import type {
  WebhookServer as IWebhookServer,
  WebhookConfig,
  WebhookEvent,
  ProviderName,
} from './interfaces.js';

type EventCallback = (event: WebhookEvent) => void;

export class WebhookServer implements IWebhookServer {
  private running = false;
  private callbacks: EventCallback[] = [];

  async start(config: WebhookConfig): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  onEvent(callback: EventCallback): void {
    this.callbacks.push(callback);
  }

  isRunning(): boolean {
    return this.running;
  }

  emitEvent(event: WebhookEvent): void {
    for (const cb of this.callbacks) {
      cb(event);
    }
  }
}
