import type {
  PhishingAnalyzer as IPhishingAnalyzer,
  PhishingCheckResult,
  EmailMessage,
  PhishingRisk,
} from './interfaces.js';

export class PhishingAnalyzer implements IPhishingAnalyzer {
  private knownPhishingDomains: Set<string> = new Set([
    'phish.com', 'scam-site.com', 'malware-download.net',
  ]);

  async analyze(message: EmailMessage): Promise<PhishingCheckResult> {
    const indicators: string[] = [];
    const suspiciousLinks: string[] = [];
    const suspiciousAttachments: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    const text = `${message.subject} ${message.textBody}`.toLowerCase();

    const phishingKeywords = ['verificar sua conta', 'confirmar identidade', 'senha expirada', 'conta bloqueada', 'clique imediatamente'];
    for (const kw of phishingKeywords) {
      if (text.includes(kw)) {
        indicators.push(`Phishing keyword: ${kw}`);
        score += 0.2;
      }
    }

    const links = message.textBody.match(/https?:\/\/[^\s]+/g) ?? [];
    for (const link of links) {
      try {
        const url = new URL(link);
        if (this.knownPhishingDomains.has(url.hostname)) {
          suspiciousLinks.push(link);
          score += 0.4;
        }
        if (url.hostname.includes('bit.ly') || url.hostname.includes('tinyurl')) {
          suspiciousLinks.push(link);
          score += 0.1;
        }
      } catch { /* invalid URL */ }
    }

    const dangerousExts = ['.exe', '.scr', '.bat', '.cmd', '.js', '.vbs'];
    for (const att of message.attachments) {
      if (dangerousExts.some(ext => att.filename.toLowerCase().endsWith(ext))) {
        suspiciousAttachments.push(att.filename);
        score += 0.3;
      }
    }

    if (score > 0.3) recommendations.push('Do not click suspicious links');
    if (suspiciousAttachments.length > 0) recommendations.push('Do not open suspicious attachments');
    if (indicators.length > 2) recommendations.push('Report to IT security');

    const risk: PhishingRisk = score >= 0.7 ? 'critico' : score >= 0.4 ? 'provavel' : score >= 0.2 ? 'suspeita' : 'nenhum';

    return {
      risk,
      score: Math.min(score, 1),
      indicators,
      suspiciousLinks,
      suspiciousAttachments,
      recommendations,
      confidence: Math.min(0.5 + score * 0.5, 0.9),
    };
  }

  getKnownPhishingDomains(): string[] { return Array.from(this.knownPhishingDomains); }
  addPhishingDomain(domain: string): void { this.knownPhishingDomains.add(domain.toLowerCase()); }
  removePhishingDomain(domain: string): void { this.knownPhishingDomains.delete(domain.toLowerCase()); }
}
