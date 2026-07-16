import { describe, it, expect, beforeEach } from 'vitest';
import { ContactManager } from '../ContactManager.js';

describe('ContactManager', () => {
  let mgr: ContactManager;

  beforeEach(() => { mgr = new ContactManager(); });

  it('creates manager', () => { expect(mgr).toBeDefined(); });

  it('getOrCreate creates contact', async () => {
    const c = await mgr.getOrCreate('a@test.com', 'João');
    expect(c.name).toBe('João');
    expect(c.email).toBe('a@test.com');
  });

  it('getByEmail returns contact', async () => {
    await mgr.getOrCreate('a@test.com', 'João');
    expect(mgr.getByEmail('a@test.com')?.name).toBe('João');
  });

  it('search finds by name', async () => {
    await mgr.getOrCreate('a@test.com', 'João Silva');
    expect(mgr.search('joão').length).toBe(1);
  });

  it('incrementEmailCount increments', async () => {
    const c = await mgr.getOrCreate('a@test.com');
    await mgr.incrementEmailCount(c.id);
    expect(mgr.get(c.id)?.totalEmails).toBe(1);
  });

  it('delete removes contact', async () => {
    const c = await mgr.getOrCreate('a@test.com');
    await mgr.delete(c.id);
    expect(mgr.get(c.id)).toBeNull();
  });
});
