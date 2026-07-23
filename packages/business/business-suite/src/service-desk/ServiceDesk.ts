import type {
  Ticket,
  TicketMessage,
  TicketPriority,
  TicketStatus,
  BusinessSuiteConfig,
} from '../interfaces.js';

class DefaultLogger {
  private context: string;
  constructor(context: string) { this.context = context; }
  async debug(msg: string, data?: unknown) { console.debug(`[${this.context}] DEBUG`, msg, data ?? ''); }
  async info(msg: string, data?: unknown) { console.log(`[${this.context}] INFO`, msg, data ?? ''); }
  async warn(msg: string, data?: unknown) { console.warn(`[${this.context}] WARN`, msg, data ?? ''); }
  async error(msg: string, data?: unknown) { console.error(`[${this.context}] ERROR`, msg, data ?? ''); }
}

export interface ServiceDeskConfig extends Partial<BusinessSuiteConfig> {
  tenantId?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
  byPriority: { priority: TicketPriority; count: number }[];
  byCategory: { category: string; count: number }[];
  averageResolutionTimeMs: number;
  slaBreaches: number;
}

let ticketCounter = 0;

export class ServiceDesk {
  private logger = new DefaultLogger('service-desk');
  private tickets = new Map<string, Ticket>();
  private config: ServiceDeskConfig;

  constructor(config?: ServiceDeskConfig) {
    this.config = config ?? {};
  }

  private generateTicketNumber(): string {
    ticketCounter += 1;
    return `TKT-${String(ticketCounter).padStart(6, '0')}`;
  }

  async createTicket(data: Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt' | 'messages'>): Promise<Ticket> {
    const now = new Date();
    const ticket: Ticket = {
      ...data,
      id: crypto.randomUUID(),
      number: this.generateTicketNumber(),
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    this.tickets.set(ticket.id, ticket);
    await this.logger.info('Ticket created', { id: ticket.id, number: ticket.number });
    return ticket;
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async listTickets(companyId: string, filters?: { status?: TicketStatus; priority?: TicketPriority; assignedTo?: string; category?: string }): Promise<Ticket[]> {
    let results = Array.from(this.tickets.values()).filter(t => t.companyId === companyId);
    if (filters?.status) results = results.filter(t => t.status === filters.status);
    if (filters?.priority) results = results.filter(t => t.priority === filters.priority);
    if (filters?.assignedTo) results = results.filter(t => t.assignedTo === filters.assignedTo);
    if (filters?.category) results = results.filter(t => t.category === filters.category);
    return results;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    const existing = this.tickets.get(id);
    if (!existing) throw new Error(`Ticket ${id} not found`);
    const updated: Ticket = { ...existing, ...data, id: existing.id, number: existing.number, updatedAt: new Date() };
    this.tickets.set(id, updated);
    await this.logger.info('Ticket updated', { id });
    return updated;
  }

  async deleteTicket(id: string): Promise<boolean> {
    const deleted = this.tickets.delete(id);
    if (deleted) await this.logger.info('Ticket deleted', { id });
    return deleted;
  }

  async assignTicket(id: string, assignedTo: string): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    ticket.assignedTo = assignedTo;
    if (ticket.status === 'open') ticket.status = 'in_progress';
    ticket.updatedAt = new Date();
    this.tickets.set(id, ticket);
    await this.logger.info('Ticket assigned', { id, assignedTo });
    return ticket;
  }

  async resolveTicket(id: string): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    if (ticket.status === 'closed') throw new Error(`Ticket ${id} is already closed`);
    ticket.status = 'resolved';
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();
    this.tickets.set(id, ticket);
    await this.logger.info('Ticket resolved', { id });
    return ticket;
  }

  async closeTicket(id: string): Promise<Ticket> {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.updatedAt = new Date();
    this.tickets.set(id, ticket);
    await this.logger.info('Ticket closed', { id });
    return ticket;
  }

  async addMessage(ticketId: string, data: Omit<TicketMessage, 'id' | 'ticketId' | 'createdAt'>): Promise<TicketMessage> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    const message: TicketMessage = {
      ...data,
      id: crypto.randomUUID(),
      ticketId,
      createdAt: new Date(),
    };
    ticket.messages.push(message);
    if (!ticket.firstResponseAt && data.senderType === 'agent') {
      ticket.firstResponseAt = message.createdAt;
    }
    ticket.updatedAt = new Date();
    this.tickets.set(ticketId, ticket);
    await this.logger.info('Message added to ticket', { ticketId, messageId: message.id });
    return message;
  }

  async getTicketStats(companyId: string): Promise<TicketStats> {
    const all = Array.from(this.tickets.values()).filter(t => t.companyId === companyId);
    const priorityMap = new Map<TicketPriority, number>();
    const categoryMap = new Map<string, number>();
    let totalResolutionTimeMs = 0;
    let resolvedCount = 0;
    let slaBreaches = 0;
    const now = Date.now();

    for (const t of all) {
      priorityMap.set(t.priority, (priorityMap.get(t.priority) ?? 0) + 1);
      categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + 1);
      if (t.resolvedAt) {
        totalResolutionTimeMs += t.resolvedAt.getTime() - t.createdAt.getTime();
        resolvedCount += 1;
      }
      if (t.slaDeadline && t.status !== 'resolved' && t.status !== 'closed' && now > t.slaDeadline.getTime()) {
        slaBreaches += 1;
      }
    }

    return {
      total: all.length,
      open: all.filter(t => t.status === 'open').length,
      inProgress: all.filter(t => t.status === 'in_progress').length,
      waiting: all.filter(t => t.status === 'waiting').length,
      resolved: all.filter(t => t.status === 'resolved').length,
      closed: all.filter(t => t.status === 'closed').length,
      byPriority: Array.from(priorityMap.entries()).map(([priority, count]) => ({ priority, count })),
      byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count })),
      averageResolutionTimeMs: resolvedCount > 0 ? totalResolutionTimeMs / resolvedCount : 0,
      slaBreaches,
    };
  }
}

export { ServiceDesk as default };
