import type {
  BusinessManager as IBusinessManager,
  BusinessConfig,
} from './interfaces.js';

export class BusinessManager implements IBusinessManager {
  private config: BusinessConfig;

  constructor(config?: Partial<BusinessConfig>) {
    this.config = {
      id: config?.id ?? 'default',
      name: config?.name ?? 'Business',
      phone: config?.phone ?? '',
      hours: config?.hours ?? { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5] },
      autoReply: config?.autoReply ?? { message: 'Estamos fora do horário.', enabled: true },
      greetingMessage: config?.greetingMessage ?? 'Olá! Como posso ajudar?',
      outsideHoursMessage: config?.outsideHoursMessage ?? 'Estamos fora do horário comercial.',
      transferMessage: config?.transferMessage ?? 'Encaminhando para um atendente.',
      departments: config?.departments ?? ['vendas', 'suporte'],
      tags: config?.tags ?? [],
    };
  }

  getConfig(): BusinessConfig {
    return { ...this.config };
  }

  async updateConfig(updates: Partial<BusinessConfig>): Promise<BusinessConfig> {
    Object.assign(this.config, updates);
    return this.getConfig();
  }

  isWithinHours(): boolean {
    const now = new Date();
    const day = now.getDay();
    if (!this.config.hours.days.includes(day)) return false;
    const [startH, startM] = this.config.hours.start.split(':').map(Number);
    const [endH, endM] = this.config.hours.end.split(':').map(Number);
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes >= startH * 60 + startM && minutes <= endH * 60 + endM;
  }

  getAutoReply(): string {
    return this.config.autoReply.message;
  }

  getGreeting(): string {
    return this.config.greetingMessage;
  }
}
