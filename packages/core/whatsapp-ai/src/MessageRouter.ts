import type {
  MessageRouter as IMessageRouter,
  MessageContext,
  RouteDecision,
} from './interfaces.js';

export class MessageRouter implements IMessageRouter {
  private handlers: Map<string, string> = new Map();

  async route(context: MessageContext): Promise<RouteDecision> {
    const text = context.message.text?.toLowerCase() ?? '';

    for (const [pattern, handler] of this.handlers) {
      if (text.includes(pattern.toLowerCase())) {
        return { action: 'respond', confidence: 0.9, reason: `Pattern matched: ${pattern}`, handler };
      }
    }

    if (context.message.type === 'audio') {
      return { action: 'voice', confidence: 0.8, reason: 'Audio message received' };
    }

    if (context.message.type === 'document') {
      return { action: 'task', confidence: 0.7, reason: 'Document received' };
    }

    if (context.message.type === 'image') {
      return { action: 'respond', confidence: 0.6, reason: 'Image received' };
    }

    return { action: 'respond', confidence: 0.5, reason: 'Default route' };
  }

  registerHandler(pattern: string, handler: string): void {
    this.handlers.set(pattern, handler);
  }

  getRegisteredHandlers(): Map<string, string> {
    return new Map(this.handlers);
  }
}
