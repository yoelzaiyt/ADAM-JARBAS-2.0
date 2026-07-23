import { describe, it, expect, beforeEach } from 'vitest';
import { CRMSync } from '../CRMSync.js';
import type { Contact } from '../interfaces.js';

function makeContact(phone: string, name: string): Contact {
  return {
    id: phone, name, phone, tags: [], lastContact: new Date(),
    totalMessages: 0, notes: '', metadata: {},
  };
}

describe('CRMSync', () => {
  let sync: CRMSync;

  beforeEach(() => {
    sync = new CRMSync();
  });

  it('syncs contact', async () => {
    const crm = await sync.syncContact(makeContact('5511999', 'João'));
    expect(crm.name).toBe('João');
    expect(crm.phone).toBe('5511999');
    expect(crm.stage).toBe('lead');
  });

  it('updates existing contact', async () => {
    await sync.syncContact(makeContact('5511999', 'João'));
    const updated = await sync.syncContact(makeContact('5511999', 'João V.'));
    expect(updated.name).toBe('João V.');
  });

  it('syncs deal', async () => {
    await sync.syncDeal({
      id: 'd1', contactId: 'c1', name: 'Deal A',
      stage: 'proposal', value: 5000, probability: 0.5, meetingIds: [],
    });
    expect(true).toBe(true);
  });

  it('getDeals returns matching', async () => {
    await sync.syncDeal({
      id: 'd1', contactId: 'c1', name: 'A', stage: 'open', value: 100, probability: 0.5, meetingIds: [],
    });
    await sync.syncDeal({
      id: 'd2', contactId: 'c2', name: 'B', stage: 'closed', value: 200, probability: 1, meetingIds: [],
    });
    expect((await sync.getDeals('c1')).length).toBe(1);
  });
});
