import { randomUUID } from 'node:crypto';
import type {
  ContactManager as IContactManager,
  Contact,
} from './interfaces.js';

export class ContactManager implements IContactManager {
  private contacts: Map<string, Contact> = new Map();

  async getOrCreate(phone: string, name?: string): Promise<Contact> {
    const existing = this.getByPhone(phone);
    if (existing) return existing;

    const id = randomUUID();
    const contact: Contact = {
      id, name: name ?? phone, phone, tags: [], lastContact: new Date(),
      totalMessages: 0, notes: '', metadata: {},
    };
    this.contacts.set(id, contact);
    return contact;
  }

  get(contactId: string): Contact | null {
    return this.contacts.get(contactId) ?? null;
  }

  async update(contactId: string, updates: Partial<Contact>): Promise<Contact> {
    const contact = this.contacts.get(contactId);
    if (!contact) throw new Error(`Contact not found: ${contactId}`);
    Object.assign(contact, updates, { id: contactId });
    return contact;
  }

  search(query: string): Contact[] {
    const lower = query.toLowerCase();
    return Array.from(this.contacts.values()).filter(c =>
      c.name.toLowerCase().includes(lower) || c.phone.includes(lower) || c.company?.toLowerCase().includes(lower)
    );
  }

  getAll(): Contact[] {
    return Array.from(this.contacts.values());
  }

  async delete(contactId: string): Promise<void> {
    this.contacts.delete(contactId);
  }

  getByPhone(phone: string): Contact | null {
    for (const c of this.contacts.values()) {
      if (c.phone === phone) return c;
    }
    return null;
  }
}
