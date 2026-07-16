import type {
  RealtimeStream as IRealtimeStream,
  StreamEvent,
} from './interfaces.js';

type Callback = (event: StreamEvent) => void;

export class RealtimeStream implements IRealtimeStream {
  private subscribers: Map<string, Set<Callback>> = new Map();

  subscribe(meetingId: string, callback: Callback): void {
    let subs = this.subscribers.get(meetingId);
    if (!subs) { subs = new Set(); this.subscribers.set(meetingId, subs); }
    subs.add(callback);
  }

  unsubscribe(meetingId: string, callback: Callback): void {
    this.subscribers.get(meetingId)?.delete(callback);
  }

  broadcast(event: StreamEvent): void {
    const subs = this.subscribers.get(event.meetingId);
    if (subs) {
      for (const cb of subs) {
        cb(event);
      }
    }
  }

  getSubscribers(meetingId: string): number {
    return this.subscribers.get(meetingId)?.size ?? 0;
  }
}
