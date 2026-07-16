import type {
  EmailAPI as IEmailAPI,
  EmailAPIRequest,
  EmailAPIResponse,
} from './interfaces.js';
import type { EmailAI } from './EmailAI.js';

export class EmailAPI implements IEmailAPI {
  private ai: EmailAI;

  constructor(ai: EmailAI) {
    this.ai = ai;
  }

  async send(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    const body = req.body as { to: { name: string; email: string }[]; subject: string; body: string };
    const msg = await this.ai.gateway.send({
      to: body.to, subject: body.subject, body: body.body,
    });
    this.ai.analytics.recordMetric('totalSent', (this.ai.analytics.getMetrics().totalSent) + 1);
    return { status: 201, body: { id: msg.id, status: 'sent' } };
  }

  async draft(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 201, body: { id: 'draft-id', status: 'draft' } };
  }

  async reply(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: { status: 'replied' } };
  }

  async forward(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: { status: 'forwarded' } };
  }

  async sync(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    const provider = (req.body as { provider?: string })?.provider ?? 'gmail';
    const results = await this.ai.syncEngine.syncAll(provider as 'gmail', 'incremental');
    return { status: 200, body: { synced: results.length, results } };
  }

  async archive(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: { status: 'archived' } };
  }

  async classify(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: { category: 'Geral', confidence: 0.5 } };
  }

  async createTask(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 201, body: { status: 'task_created' } };
  }

  async getInbox(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: { emails: [], total: 0 } };
  }

  async getConversation(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    const id = req.params['id'] ?? 'unknown';
    const conv = this.ai.conversations.get(id);
    return { status: 200, body: conv ?? { error: 'Not found' } };
  }

  async getStatistics(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: this.ai.analytics.getMetrics() };
  }

  async delete(req: EmailAPIRequest): Promise<EmailAPIResponse> {
    return { status: 200, body: { status: 'deleted' } };
  }
}
