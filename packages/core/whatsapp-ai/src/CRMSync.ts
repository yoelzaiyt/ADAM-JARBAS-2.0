import type {
  CRMSync as ICRMSync,
  CRMContact,
  CRMDeal,
  Contact,
} from './interfaces.js';
import { randomUUID } from 'node:crypto';

export class CRMSync implements ICRMSync {
  private contacts: Map<string, CRMContact> = new Map();
  private deals: Map<string, CRMDeal> = new Map();

  async syncContact(contact: Contact): Promise<CRMContact> {
    let crm = this.getByPhone(contact.phone);
    if (crm) {
      crm.name = contact.name;
      crm.email = contact.email;
      crm.company = contact.company;
      crm.lastActivity = new Date();
      return crm;
    }
    crm = {
      id: randomUUID(), name: contact.name, phone: contact.phone,
      email: contact.email, company: contact.company, stage: 'lead',
      lastActivity: new Date(),
    };
    this.contacts.set(crm.id, crm);
    return crm;
  }

  async syncDeal(deal: CRMDeal): Promise<void> {
    this.deals.set(deal.id, deal);
  }

  async addNote(contactId: string, note: string): Promise<void> {
    const c = this.contacts.get(contactId);
    if (c) c.lastActivity = new Date();
  }

  async getContact(phone: string): Promise<CRMContact | null> {
    return this.getByPhone(phone);
  }

  async getDeals(contactId: string): Promise<CRMDeal[]> {
    return Array.from(this.deals.values()).filter(d => d.contactId === contactId);
  }

  private getByPhone(phone: string): CRMContact | null {
    for (const c of this.contacts.values()) {
      if (c.phone === phone) return c;
    }
    return null;
  }
}
