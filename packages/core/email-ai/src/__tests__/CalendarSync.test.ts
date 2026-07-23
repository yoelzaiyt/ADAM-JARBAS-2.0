import { describe, it, expect, beforeEach } from 'vitest';
import { CalendarSync } from '../CalendarSync.js';
import type { EmailMessage } from '../interfaces.js';

describe('CalendarSync', () => {
  let sync: CalendarSync;

  beforeEach(() => { sync = new CalendarSync(); });

  it('creates sync', () => { expect(sync).toBeDefined(); });

  it('createEvent creates event', async () => {
    const ev = await sync.createEvent({
      title: 'Standup', start: new Date(), end: new Date(), attendees: ['a@test.com'],
    });
    expect(ev.id).toBeDefined();
    expect(ev.title).toBe('Standup');
  });

  it('detectDates finds dates', () => {
    const msg: EmailMessage = {
      id: 'm1', messageId: '<m1@test>', from: { name: 'T', email: 'a@test.com' },
      to: [], subject: 'Meeting', textBody: 'Vamos nos encontrar em 15/07/2026',
      attachments: [], direction: 'inbound', status: 'delivered', labels: [],
      isRead: false, isStarred: false, priority: 'media', spamLevel: 'nenhum',
      phishingRisk: 'nenhum', receivedAt: new Date(), createdAt: new Date(),
      updatedAt: new Date(), metadata: {},
    };
    const dates = sync.detectDates(msg);
    expect(dates.length).toBe(1);
  });

  it('detectMeetingRequests detects meeting', () => {
    const msg: EmailMessage = {
      id: 'm1', messageId: '<m1@test>', from: { name: 'T', email: 'a@test.com' },
      to: [], subject: 'Agendar reunião', textBody: 'Podemos agendar reunião para discutir?',
      attachments: [], direction: 'inbound', status: 'delivered', labels: [],
      isRead: false, isStarred: false, priority: 'media', spamLevel: 'nenhum',
      phishingRisk: 'nenhum', receivedAt: new Date(), createdAt: new Date(),
      updatedAt: new Date(), metadata: {},
    };
    const result = sync.detectMeetingRequests(msg);
    expect(result).toBeDefined();
    expect(result?.title).toBe('Agendar reunião');
  });

  it('detectMeetingRequests returns null for non-meeting', () => {
    const msg: EmailMessage = {
      id: 'm1', messageId: '<m1@test>', from: { name: 'T', email: 'a@test.com' },
      to: [], subject: 'Hello', textBody: 'Just saying hi',
      attachments: [], direction: 'inbound', status: 'delivered', labels: [],
      isRead: false, isStarred: false, priority: 'media', spamLevel: 'nenhum',
      phishingRisk: 'nenhum', receivedAt: new Date(), createdAt: new Date(),
      updatedAt: new Date(), metadata: {},
    };
    expect(sync.detectMeetingRequests(msg)).toBeNull();
  });
});
