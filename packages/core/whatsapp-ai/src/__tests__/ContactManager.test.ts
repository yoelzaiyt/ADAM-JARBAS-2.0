import { describe, it, expect, beforeEach } from 'vitest';
import { ContactManager } from '../ContactManager.js';

describe('ContactManager', () => {
  let manager: ContactManager;

  beforeEach(() => {
    manager = new ContactManager();
  });

  it('creates contact', async () => {
    const contact = await manager.getOrCreate('5511999', 'João');
    expect(contact.name).toBe('João');
    expect(contact.phone).toBe('5511999');
  });

  it('returns existing contact', async () => {
    const first = await manager.getOrCreate('5511999', 'João');
    const second = await manager.getOrCreate('5511999', 'João');
    expect(first.id).toBe(second.id);
  });

  it('get returns null for nonexistent', () => {
    expect(manager.get('bad')).toBeNull();
  });

  it('updates contact', async () => {
    const c = await manager.getOrCreate('5511999', 'João');
    const updated = await manager.update(c.id, { company: 'Acme' });
    expect(updated.company).toBe('Acme');
  });

  it('search finds by name', async () => {
    await manager.getOrCreate('111', 'João');
    await manager.getOrCreate('222', 'Maria');
    expect(manager.search('joão').length).toBe(1);
  });

  it('getAll returns all', async () => {
    await manager.getOrCreate('111', 'A');
    await manager.getOrCreate('222', 'B');
    expect(manager.getAll().length).toBe(2);
  });

  it('delete removes contact', async () => {
    const c = await manager.getOrCreate('111', 'A');
    await manager.delete(c.id);
    expect(manager.get(c.id)).toBeNull();
  });

  it('getByPhone finds contact', async () => {
    await manager.getOrCreate('5511999', 'João');
    expect(manager.getByPhone('5511999')?.name).toBe('João');
    expect(manager.getByPhone('0000')).toBeNull();
  });
});
