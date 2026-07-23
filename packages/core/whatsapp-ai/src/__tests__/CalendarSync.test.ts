import { describe, it, expect, beforeEach } from 'vitest';
import { CalendarSync } from '../CalendarSync.js';

describe('CalendarSync', () => {
  let sync: CalendarSync;

  beforeEach(() => {
    sync = new CalendarSync();
  });

  it('creates event', async () => {
    const start = new Date();
    const end = new Date(start.getTime() + 3600000);
    const ev = await sync.createEvent({
      title: 'Standup', start, end, attendees: ['a@b.com'],
    });
    expect(ev.id).toBeDefined();
    expect(ev.title).toBe('Standup');
  });

  it('updates event', async () => {
    const ev = await sync.createEvent({
      title: 'A', start: new Date(), end: new Date(), attendees: [],
    });
    const updated = await sync.updateEvent(ev.id, { title: 'B' });
    expect(updated.title).toBe('B');
  });

  it('deletes event', async () => {
    const ev = await sync.createEvent({
      title: 'A', start: new Date(), end: new Date(), attendees: [],
    });
    await sync.deleteEvent(ev.id);
    const events = await sync.getEvents(new Date(0), new Date(Date.now() + 86400000));
    expect(events.find(e => e.id === ev.id)).toBeUndefined();
  });

  it('getEvents returns in range', async () => {
    const now = new Date();
    const later = new Date(now.getTime() + 3600000);
    await sync.createEvent({ title: 'A', start: now, end: later, attendees: [] });
    const events = await sync.getEvents(now, later);
    expect(events.length).toBe(1);
  });
});
