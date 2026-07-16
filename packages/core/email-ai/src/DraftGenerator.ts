import { randomUUID } from 'node:crypto';
import type {
  DraftGenerator as IDraftGenerator,
  GeneratedDraft,
  EmailDraft,
  EmailMessage,
  DraftType,
  DraftTemplate,
  AIResponseConfig,
  EmailAddress,
} from './interfaces.js';

export class DraftGenerator implements IDraftGenerator {
  private templates: DraftTemplate[] = [];

  constructor() {
    this.templates = [
      { id: '1', name: 'Agradecimento', type: 'agradecimento', subjectTemplate: 'Agradecimento - {{assunto}}', bodyTemplate: 'Prezado(a) {{nome}},\n\nAgradecemos seu contato.\n\nAtenciosamente,', variables: ['nome', 'assunto'], language: 'pt-BR', createdAt: new Date() },
      { id: '2', name: 'Follow-up', type: 'followup', subjectTemplate: 'Follow-up: {{assunto}}', bodyTemplate: 'Prezado(a) {{nome}},\n\nGostaria de dar seguimento à nossa conversa sobre {{assunto}}.\n\nAtenciosamente,', variables: ['nome', 'assunto'], language: 'pt-BR', createdAt: new Date() },
      { id: '3', name: 'Cobrança', type: 'cobranca', subjectTemplate: 'Lembrete: {{assunto}}', bodyTemplate: 'Prezado(a) {{nome}},\n\nPassamos para lembrar sobre {{assunto}}.\n\nAtenciosamente,', variables: ['nome', 'assunto'], language: 'pt-BR', createdAt: new Date() },
    ];
  }

  async generate(message: EmailMessage, type: DraftType, options?: Partial<AIResponseConfig>): Promise<GeneratedDraft> {
    const template = this.templates.find(t => t.type === type);
    const draft: EmailDraft = {
      id: randomUUID(),
      replyToId: message.id,
      to: [message.from],
      subject: `Re: ${message.subject}`,
      body: template?.bodyTemplate.replace('{{nome}}', message.from.name).replace('{{assunto}}', message.subject) ?? `Resposta para: ${message.subject}`,
      attachments: [],
      type,
      approvalStatus: 'pendente',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { id: randomUUID(), draft, templateUsed: template?.id, confidence: 0.7, generatedAt: new Date(), context: {} };
  }

  async generateReply(message: EmailMessage, tone?: string): Promise<GeneratedDraft> {
    return this.generate(message, 'atendimento');
  }

  async generateForward(message: EmailMessage, to: EmailAddress[], note?: string): Promise<GeneratedDraft> {
    const draft: EmailDraft = {
      id: randomUUID(), forwardFromId: message.id, to,
      subject: `Fwd: ${message.subject}`,
      body: note ? `${note}\n\n---\n${message.textBody}` : message.textBody,
      attachments: [], type: 'atendimento', approvalStatus: 'pendente',
      createdAt: new Date(), updatedAt: new Date(),
    };
    return { id: randomUUID(), draft, confidence: 0.8, generatedAt: new Date(), context: {} };
  }

  getTemplates(): DraftTemplate[] { return [...this.templates]; }

  addTemplate(template: Omit<DraftTemplate, 'id' | 'createdAt'>): DraftTemplate {
    const full: DraftTemplate = { ...template, id: randomUUID(), createdAt: new Date() };
    this.templates.push(full);
    return full;
  }

  updateTemplate(templateId: string, updates: Partial<DraftTemplate>): DraftTemplate {
    const t = this.templates.find(t => t.id === templateId);
    if (!t) throw new Error(`Template not found: ${templateId}`);
    Object.assign(t, updates, { id: templateId });
    return t;
  }

  deleteTemplate(templateId: string): void {
    this.templates = this.templates.filter(t => t.id !== templateId);
  }
}
