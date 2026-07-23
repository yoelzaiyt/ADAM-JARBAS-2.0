import { randomUUID } from 'node:crypto';
import type {
  DecisionEngine as IDecisionEngine,
  Decision,
} from './interfaces.js';

export class DecisionEngine implements IDecisionEngine {
  private decisions: Map<string, Decision> = new Map();

  async record(decision: Omit<Decision, 'id'>): Promise<Decision> {
    const id = randomUUID();
    const full: Decision = { ...decision, id };
    this.decisions.set(id, full);
    return full;
  }

  getDecision(decisionId: string): Decision | null {
    return this.decisions.get(decisionId) ?? null;
  }

  getByMeeting(meetingId: string): Decision[] {
    return Array.from(this.decisions.values()).filter(d => d.meetingId === meetingId);
  }

  async linkADR(decisionId: string, adrId: string): Promise<void> {
    const decision = this.decisions.get(decisionId);
    if (!decision) throw new Error(`Decision not found: ${decisionId}`);
    decision.adrId = adrId;
  }

  getAll(): Decision[] {
    return Array.from(this.decisions.values());
  }
}
