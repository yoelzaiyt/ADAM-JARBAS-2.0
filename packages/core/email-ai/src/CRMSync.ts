import type {
  CRMSync as ICRMSync,
  CRMContact,
  CRMOpportunity,
  EmailContact,
} from './interfaces.js';
import { randomUUID } from 'node:crypto';

export class CRMSync implements ICRMSync {
  private crmContacts: Map<string, CRMContact> = new Map();
  private opportunities: Map<string, CRMOpportunity> = new Map();

  async syncContact(contact: EmailContact): Promise<CRMContact> {
    let crm = this.getByEmail(contact.email);
    if (crm) {
      crm.name = contact.name;
      crm.company = contact.company;
      crm.lastActivity = new Date();
      crm.emailCount = contact.totalEmails;
      return crm;
    }
    crm = {
      id: randomUUID(), name: contact.name, email: contact.email,
      company: contact.company, stage: 'lead', lastActivity: new Date(),
      emailCount: contact.totalEmails,
    };
    this.crmContacts.set(crm.id, crm);
    return crm;
  }

  async syncOpportunity(opportunity: CRMOpportunity): Promise<void> {
    this.opportunities.set(opportunity.id, opportunity);
  }

  async addNote(contactId: string, note: string): Promise<void> {
    const c = this.crmContacts.get(contactId);
    if (c) c.lastActivity = new Date();
  }

  async addEmailToTimeline(contactId: string, emailId: string, summary: string): Promise<void> {
    const c = this.crmContacts.get(contactId);
    if (c) c.lastActivity = new Date();
  }

  async getContact(email: string): Promise<CRMContact | null> {
    return this.getByEmail(email);
  }

  async getOpportunities(contactId: string): Promise<CRMOpportunity[]> {
    return Array.from(this.opportunities.values()).filter(o => o.contactId === contactId);
  }

  private getByEmail(email: string): CRMContact | null {
    for (const c of this.crmContacts.values()) {
      if (c.email.toLowerCase() === email.toLowerCase()) return c;
    }
    return null;
  }
}
