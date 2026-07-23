import { randomUUID } from 'node:crypto';
import type {
  ContactManager as IContactManager,
  EmailContact,
} from './interfaces.js';

export class ContactManager implements IContactManager {
  private contacts: Map<string, EmailContact> = new Map();

  async getOrCreate(email: string, name?: string): Promise<EmailContact> {
    const existing = this.getByEmail(email);
    if (existing) return existing;

    const id = randomUUID();
    const contact: EmailContact = {
      id, name: name ?? email, email, tags: [], totalEmails: 0,
      lastContact: new Date(), notes: '', metadata: {},
    };
    this.contacts.set(id, contact);
    return contact;
  }

  get(contactId: string): EmailContact | null {
    return this.contacts.get(contactId) ?? null;
  }

  getByEmail(email: string): EmailContact | null {
    for (const c of this.contacts.values()) {
      if (c.email.toLowerCase() === email.toLowerCase()) return c;
    }
    return null;
  }

  async update(contactId: string, updates: Partial<EmailContact>): Promise<EmailContact> {
    const contact = this.contacts.get(contactId);
    if (!contact) throw new Error(`Contact not found: ${contactId}`);
    Object.assign(contact, updates, { id: contactId });
    return contact;
  }

  search(query: string): EmailContact[] {
    const lower = query.toLowerCase();
    return Array.from(this.contacts.values()).filter(
      c => c.name.toLowerCase().includes(lower) || c.email.toLowerCase().includes(lower)
    );
  }

  getAll(): EmailContact[] { return Array.from(this.contacts.values()); }

  async delete(contactId: string): Promise<void> { this.contacts.delete(contactId); }

  async incrementEmailCount(contactId: string): Promise<void> {
    const c = this.contacts.get(contactId);
    if (c) { c.totalEmails++; c.lastContact = new Date(); }
  }
}
