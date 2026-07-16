import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../EventBus.js';
import type { HermesEvent } from '../interfaces.js';

function makeEvent(type: string = 'task:created'): HermesEvent {
  return { type: type as any, timestamp: new Date(), source: 'test', data: {} };
}

describe('EventBus', () => {
  it('subscribe/emit: handler is called with correct event', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe('task:created', handler);
    const event = makeEvent('task:created');
    bus.emit(event);
    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('subscribe wildcard "*": handler receives all events', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe('*', handler);
    bus.emit(makeEvent('task:created'));
    bus.emit(makeEvent('task:started'));
    bus.emit(makeEvent('plan:created'));
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('wildcard and specific handlers both fire for the same event', () => {
    const bus = new EventBus();
    const specific = vi.fn();
    const wildcard = vi.fn();
    bus.subscribe('task:created', specific);
    bus.subscribe('*', wildcard);
    bus.emit(makeEvent('task:created'));
    expect(specific).toHaveBeenCalledOnce();
    expect(wildcard).toHaveBeenCalledOnce();
  });

  it('unsubscribe: handler is no longer called', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe('task:created', handler);
    bus.emit(makeEvent('task:created'));
    expect(handler).toHaveBeenCalledTimes(1);
    bus.unsubscribe('task:created', handler);
    bus.emit(makeEvent('task:created'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('getHistory: returns all events', () => {
    const bus = new EventBus();
    const e1 = makeEvent('task:created');
    const e2 = makeEvent('plan:created');
    bus.emit(e1);
    bus.emit(e2);
    expect(bus.getHistory()).toEqual([e1, e2]);
  });

  it('getHistory: filters by event name', () => {
    const bus = new EventBus();
    bus.emit(makeEvent('task:created'));
    bus.emit(makeEvent('plan:created'));
    bus.emit(makeEvent('task:started'));
    const result = bus.getHistory('task:created');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('task:created');
  });

  it('getHistory: returns empty array when no events match filter', () => {
    const bus = new EventBus();
    bus.emit(makeEvent('task:created'));
    expect(bus.getHistory('plan:created')).toEqual([]);
  });

  it('getSubscriptionCount: returns correct count', () => {
    const bus = new EventBus();
    expect(bus.getSubscriptionCount('task:created')).toBe(0);
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.subscribe('task:created', h1);
    expect(bus.getSubscriptionCount('task:created')).toBe(1);
    bus.subscribe('task:created', h2);
    expect(bus.getSubscriptionCount('task:created')).toBe(2);
    bus.unsubscribe('task:created', h1);
    expect(bus.getSubscriptionCount('task:created')).toBe(1);
  });

  it('error in handler does not break emit', () => {
    const bus = new EventBus();
    const badHandler = vi.fn(() => { throw new Error('boom'); });
    const goodHandler = vi.fn();
    bus.subscribe('task:created', badHandler);
    bus.subscribe('task:created', goodHandler);
    expect(() => bus.emit(makeEvent('task:created'))).not.toThrow();
    expect(badHandler).toHaveBeenCalledOnce();
    expect(goodHandler).toHaveBeenCalledOnce();
  });

  it('maxHistory: oldest events are removed after 1000', () => {
    const bus = new EventBus();
    for (let i = 0; i < 1005; i++) {
      bus.emit(makeEvent('task:created'));
    }
    expect(bus.getHistory()).toHaveLength(1000);
  });
});
