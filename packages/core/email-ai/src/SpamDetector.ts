import type {
  SpamDetector as ISpamDetector,
  SpamCheckResult,
  EmailMessage,
  SpamLevel,
} from './interfaces.js';

export class SpamDetector implements ISpamDetector {
  private blockedSenders: Set<string> = new Set();
  private trustedSenders: Set<string> = new Set();

  async check(message: EmailMessage): Promise<SpamCheckResult> {
    const reasons: string[] = [];
    const indicators: string[] = [];
    let score = 0;

    if (this.blockedSenders.has(message.from.email)) {
      reasons.push('Blocked sender');
      score += 0.8;
    }

    if (this.trustedSenders.has(message.from.email)) {
      return { isSpam: false, level: 'nenhum', score: 0, reasons: ['Trusted sender'], indicators: [], confidence: 0.95 };
    }

    const text = `${message.subject} ${message.textBody}`.toLowerCase();
    const spamWords = ['grátis', 'ganhe', 'prêmio', 'clique aqui', 'oferta imperdível', 'ação urgente', 'verify sua conta'];
    for (const word of spamWords) {
      if (text.includes(word)) {
        reasons.push(`Spam keyword: ${word}`);
        score += 0.1;
        indicators.push(word);
      }
    }

    const links = (message.textBody.match(/https?:\/\/[^\s]+/g) ?? []);
    if (links.length > 5) {
      reasons.push('Excessive links');
      score += 0.2;
      indicators.push(`${links.length} links`);
    }

    if (message.attachments.length > 3) {
      reasons.push('Many attachments');
      score += 0.15;
    }

    const level: SpamLevel = score >= 0.7 ? 'critico' : score >= 0.5 ? 'alto' : score >= 0.3 ? 'medio' : score >= 0.1 ? 'baixo' : 'nenhum';

    return {
      isSpam: score >= 0.3,
      level,
      score: Math.min(score, 1),
      reasons,
      indicators,
      confidence: Math.min(0.5 + score * 0.5, 0.95),
    };
  }

  async markAsSpam(emailId: string): Promise<void> { /* persist */ }
  async markAsNotSpam(emailId: string): Promise<void> { /* persist */ }

  getBlockedSenders(): string[] { return Array.from(this.blockedSenders); }
  addBlockedSender(email: string): void { this.blockedSenders.add(email.toLowerCase()); }
  removeBlockedSender(email: string): void { this.blockedSenders.delete(email.toLowerCase()); }

  getTrustedSenders(): string[] { return Array.from(this.trustedSenders); }
  addTrustedSender(email: string): void { this.trustedSenders.add(email.toLowerCase()); }
  removeTrustedSender(email: string): void { this.trustedSenders.delete(email.toLowerCase()); }
}
