import type { HermesEvent, HermesEventName, EventHandler } from './interfaces.js';

export class EventBus {
  private subscriptions = new Map<string, Set<EventHandler>>();
  private history: HermesEvent[] = [];
  private readonly maxHistory = 1000;

  subscribe(eventName: HermesEventName | '*', handler: EventHandler): void {
    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, new Set());
    }
    this.subscriptions.get(eventName)!.add(handler);
  }

  unsubscribe(eventName: HermesEventName | '*', handler: EventHandler): void {
    const handlers = this.subscriptions.get(eventName);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscriptions.delete(eventName);
      }
    }
  }

  emit(event: HermesEvent): void {
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const handlers = this.subscriptions.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch {
          // swallow handler errors to not break event emission
        }
      }
    }

    const wildcardHandlers = this.subscriptions.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          handler(event);
        } catch {
          // swallow handler errors
        }
      }
    }
  }

  getHistory(eventName?: HermesEventName): HermesEvent[] {
    if (eventName) {
      return this.history.filter((e) => e.type === eventName);
    }
    return [...this.history];
  }

  getSubscriptionCount(eventName: HermesEventName): number {
    return this.subscriptions.get(eventName)?.size ?? 0;
  }
}
