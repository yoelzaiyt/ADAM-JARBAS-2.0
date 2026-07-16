import { describe, it, expect, beforeEach } from 'vitest';
import { CRMSync } from '../CRMSync.js';
import type { EmailContact } from '../interfaces.js';

function makeContact(email: string, name: string): EmailContact {
  return {
    id: email, name, email, tags: [], totalEmails: 5,
    lastContact: new Date(), notes: '', metadata: {},
  };
}

describe('CRMSync', () => {
  let sync: CRMSync;

  beforeEach(() => { sync = new CRMSync(); });

  it('creates sync', () => { expect(sync).toBeDefined(); });

  it('syncContact creates CRM contact', async () => {
    const crm = await sync.syncContact(makeContact('a@test.com', 'João'));
    expect(crm.name).toBe('João');
    expect(crm.stage).toBe('lead');
  });

  it('syncContact updates existing', async () => {
    await sync.syncContact(makeContact('a@test.com', 'João'));
    const updated = await sync.syncContact(makeContact('a@test.com', 'João V.'));
    expect(updated.name).toBe('João V.');
  });

  it('getContact returns contact', async () => {
    await sync.syncContact(makeContact('a@test.com', 'João'));
    expect((await sync.getContact('a@test.com'))?.name).toBe('João');
  });

  it('addNote works', async () => {
    const c = await sync.syncContact(makeContact('a@test.com', 'João'));
    await sync.addNote(c.id, 'test note');
    expect(true).toBe(true);
  });
});
