import type {
  AIResponseEngine as IAIResponseEngine,
  AIResponse,
  AIResponseConfig,
  ConversationMessage,
  ConversationContext,
  ApprovalMode,
} from './interfaces.js';

export class AIResponseEngine implements IAIResponseEngine {
  private mode: ApprovalMode;
  private defaultConfig: AIResponseConfig = {
    mode: 'assistido',
    autoRespondKeywords: ['oi', 'olá', 'bom dia', 'obrigado'],
    ignoreKeywords: ['stop', 'parar', 'cancelar'],
    maxResponseLength: 4096,
    language: 'pt-BR',
  };

  constructor(mode: ApprovalMode = 'assistido') {
    this.mode = mode;
  }

  async generateResponse(message: ConversationMessage, context: ConversationContext): Promise<AIResponse> {
    const text = message.content ?? '';
    const suggested = this.getSuggestedActions(message);

    return {
      text: `[AI] Resposta para: ${text.slice(0, 100)}`,
      confidence: 0.75,
      action: 'respond',
      suggestedActions: suggested,
      context: { conversationId: context.id, contactName: context.contactName },
    };
  }

  shouldAutoRespond(message: ConversationMessage, config: AIResponseConfig): boolean {
    if (this.mode === 'automatico') return true;
    const text = (message.content ?? '').toLowerCase();
    if (config.ignoreKeywords.some(k => text.includes(k))) return false;
    return config.autoRespondKeywords.some(k => text.includes(k));
  }

  getSuggestedActions(message: ConversationMessage): string[] {
    const actions: string[] = [];
    const text = (message.content ?? '').toLowerCase();
    if (text.includes('tarefa') || text.includes('task')) actions.push('criar_tarefa');
    if (text.includes('reunião') || text.includes('meeting')) actions.push('agendar_reuniao');
    if (text.includes('enviar') || text.includes('mandar')) actions.push('enviar_documento');
    if (actions.length === 0) actions.push('responder');
    return actions;
  }

  setMode(mode: ApprovalMode): void {
    this.mode = mode;
  }

  getMode(): ApprovalMode {
    return this.mode;
  }
}
