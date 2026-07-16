import type {
  CRMSync as ICRMSync,
  CRMContact,
  CRMDeal,
} from './interfaces.js';

export class CRMSync implements ICRMSync {
  private contacts: Map<string, CRMContact> = new Map();
  private deals: Map<string, CRMDeal> = new Map();

  async updateContact(contact: CRMContact): Promise<void> {
    this.contacts.set(contact.id, contact);
  }

  async updateDeal(deal: CRMDeal): Promise<void> {
    this.deals.set(deal.id, deal);
  }

  async addMeetingNote(meetingId: string, contactId: string, note: string): Promise<void> {
    const contact = this.contacts.get(contactId);
    if (contact && !contact.meetingIds.includes(meetingId)) {
      contact.meetingIds.push(meetingId);
    }
  }

  async getContacts(): Promise<CRMContact[]> {
    return Array.from(this.contacts.values());
  }

  async getDeals(): Promise<CRMDeal[]> {
    return Array.from(this.deals.values());
  }

  async sync(): Promise<void> {}
}
