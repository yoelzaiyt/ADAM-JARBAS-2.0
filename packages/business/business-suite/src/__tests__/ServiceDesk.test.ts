import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceDesk } from '../service-desk/ServiceDesk.js';

const CID = 'comp-1';

function ticketData(overrides = {}) {
  return {
    companyId: CID,
    subject: 'Login not working',
    description: 'Cannot access dashboard after password reset',
    priority: 'high' as const,
    status: 'open' as const,
    category: 'authentication',
    requestedBy: 'user-1',
    assignedTo: undefined,
    slaDeadline: undefined,
    tags: [],
    ...overrides,
  };
}

describe('ServiceDesk', () => {
  let desk: ServiceDesk;

  beforeEach(() => {
    desk = new ServiceDesk();
  });

  it('creates a ticket with auto-generated number', async () => {
    const t = await desk.createTicket(ticketData());
    expect(t.id).toBeDefined();
    expect(t.number).toMatch(/^TKT-\d{6}$/);
    expect(t.messages).toEqual([]);
  });

  it('lists tickets with priority filter', async () => {
    await desk.createTicket(ticketData({ subject: 'T1', priority: 'high' }));
    await desk.createTicket(ticketData({ subject: 'T2', priority: 'low' }));
    const high = await desk.listTickets(CID, { priority: 'high' });
    expect(high).toHaveLength(1);
  });

  it('assigns a ticket and transitions to in_progress', async () => {
    const t = await desk.createTicket(ticketData());
    const assigned = await desk.assignTicket(t.id, 'agent-1');
    expect(assigned.assignedTo).toBe('agent-1');
    expect(assigned.status).toBe('in_progress');
  });

  it('resolves and closes a ticket', async () => {
    const t = await desk.createTicket(ticketData());
    await desk.assignTicket(t.id, 'agent-1');
    const resolved = await desk.resolveTicket(t.id);
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).toBeDefined();
    const closed = await desk.closeTicket(t.id);
    expect(closed.status).toBe('closed');
    expect(closed.closedAt).toBeDefined();
  });

  it('cannot resolve a closed ticket', async () => {
    const t = await desk.createTicket(ticketData());
    await desk.closeTicket(t.id);
    await expect(desk.resolveTicket(t.id)).rejects.toThrow('already closed');
  });

  it('adds messages and tracks first agent response', async () => {
    const t = await desk.createTicket(ticketData());
    await desk.addMessage(t.id, { senderId: 'user-1', senderType: 'customer', content: 'Help please' });
    const msg = await desk.addMessage(t.id, { senderId: 'agent-1', senderType: 'agent', content: 'Looking into it' });
    expect(msg.id).toBeDefined();
    const updated = await desk.getTicketById(t.id);
    expect(updated?.firstResponseAt).toBeDefined();
    expect(updated?.messages).toHaveLength(2);
  });

  it('computes ticket stats', async () => {
    await desk.createTicket(ticketData({ subject: 'T1', status: 'open', category: 'auth', priority: 'high' }));
    await desk.createTicket(ticketData({ subject: 'T2', status: 'open', category: 'billing', priority: 'low' }));
    await desk.createTicket(ticketData({ subject: 'T3', status: 'closed', category: 'auth', priority: 'high' }));
    const stats = await desk.getTicketStats(CID);
    expect(stats.total).toBe(3);
    expect(stats.open).toBe(2);
    expect(stats.closed).toBe(1);
    expect(stats.byCategory).toHaveLength(2);
  });
});
