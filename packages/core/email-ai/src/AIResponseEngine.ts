import type {
  AIResponseEngine as IAIResponseEngine,
  AIResponse,
  AIResponseAction,
  AIResponseConfig,
  EmailMessage,
  EmailConversation,
  ApprovalMode,
} from './interfaces.js';

export class AIResponseEngine implements IAIResponseEngine {
  private mode: ApprovalMode;
  private config: AIResponseConfig;

  constructor(mode: ApprovalMode = 'assistido') {
    this.mode = mode;
    this.config = {
      mode, autoReplyKeywords: ['obrigado', 'confirmado', 'recebido'],
      ignoreKeywords: ['unsubscribe', 'remover'],
      maxReplyLength: 4096, language: 'pt-BR', tone: 'profissional',
    };
  }

  async generateResponse(message: EmailMessage, conversation?: EmailConversation): Promise<AIResponse> {
    const actions = this.getSuggestedActions(message);
    const text = message.textBody.toLowerCase();

    let suggestedReply: string | undefined;
    if (this.shouldAutoReply(message)) {
      suggestedReply = `Prezado(a),\n\nRecebemos seu e-mail e entraremos em contato em breve.\n\nAtenciosamente,\nEquipe JARBAS`;
    }

    const extractedDates = this.extractDates(text);
    const extractedTasks = this.extractTasks(text);

    return {
      actions,
      suggestedReply,
      summary: `Email de ${message.from.name} sobre: ${message.subject.slice(0, 100)}`,
      keyPoints: [message.subject],
      extractedDates,
      extractedTasks,
      extractedContacts: [],
      context: { conversationId: conversation?.id },
    };
  }

  shouldAutoReply(message: EmailMessage): boolean {
    if (this.mode === 'automatico') return true;
    const text = message.textBody.toLowerCase();
    return this.config.autoReplyKeywords.some(k => text.includes(k));
  }

  getSuggestedActions(message: EmailMessage): AIResponseAction[] {
    const actions: AIResponseAction[] = [];
    const text = `${message.subject} ${message.textBody}`.toLowerCase();

    if (text.includes('reunião') || text.includes('meeting')) {
      actions.push({ type: 'meeting', confidence: 0.8, reason: 'Meeting mentioned' });
    }
    if (text.includes('tarefa') || text.includes('prazo') || text.includes('entregar')) {
      actions.push({ type: 'task', confidence: 0.7, reason: 'Task/deadline mentioned' });
    }
    if (text.includes('obrigado') || text.includes('agradeço')) {
      actions.push({ type: 'auto_reply', confidence: 0.9, reason: 'Thank you email' });
    }
    if (this.mode === 'assistido') {
      actions.push({ type: 'draft', confidence: 0.6, reason: 'Draft suggestion' });
    }
    if (actions.length === 0) {
      actions.push({ type: 'draft', confidence: 0.5, reason: 'Default action' });
    }
    return actions;
  }

  setMode(mode: ApprovalMode): void {
    this.mode = mode;
    this.config.mode = mode;
  }

  getMode(): ApprovalMode { return this.mode; }
  getConfig(): AIResponseConfig { return { ...this.config }; }
  updateConfig(updates: Partial<AIResponseConfig>): void { Object.assign(this.config, updates); }

  private extractDates(text: string): Date[] {
    const dates: Date[] = [];
    const datePatterns = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) ?? [];
    for (const p of datePatterns) {
      const d = new Date(p);
      if (!isNaN(d.getTime())) dates.push(d);
    }
    return dates;
  }

  private extractTasks(text: string): string[] {
    const tasks: string[] = [];
    const patterns = ['preciso de', 'favor enviar', 'pode me mandar', 'não esqueça de'];
    for (const p of patterns) {
      if (text.includes(p)) tasks.push(p);
    }
    return tasks;
  }
}
