import type {
  SentimentAnalysis as ISentimentAnalysis,
  SentimentResult,
  MeetingSentiment,
  TranscriptionSegment,
  SentimentLabel,
} from './interfaces.js';

const SENTIMENT_KEYWORDS: Record<SentimentLabel, string[]> = {
  entusiasmo: ['incrível', 'fantástico', 'amazing', 'wonderful', 'excelente', 'show'],
  concordancia: ['concordo', 'sim', 'certo', 'exatamente', 'isso', 'com certeza'],
  discordancia: ['discordo', 'não', 'mas', 'porém', 'entretanto', 'contudo'],
  urgencia: ['urgente', 'rápido', 'agora', 'imediato', 'hurry', 'asap'],
  neutro: [],
};

export class SentimentAnalysis implements ISentimentAnalysis {
  async analyze(segments: TranscriptionSegment[]): Promise<MeetingSentiment> {
    const results: SentimentResult[] = [];
    for (const segment of segments) {
      results.push(await this.analyzeSegment(segment));
    }

    const labelCounts = new Map<SentimentLabel, number>();
    for (const r of results) {
      labelCounts.set(r.label, (labelCounts.get(r.label) ?? 0) + 1);
    }

    let overall: SentimentLabel = 'neutro';
    let maxCount = 0;
    for (const [label, count] of labelCounts) {
      if (count > maxCount) { maxCount = count; overall = label; }
    }

    const score = results.length > 0 ? results.reduce((s, r) => s + r.confidence, 0) / results.length : 0;

    return { overall, score, results, climate: this.getClimate(overall) };
  }

  async analyzeSegment(segment: TranscriptionSegment): Promise<SentimentResult> {
    const lower = segment.text.toLowerCase();
    for (const [label, keywords] of Object.entries(SENTIMENT_KEYWORDS) as [SentimentLabel, string[]][]) {
      if (label === 'neutro') continue;
      if (keywords.some(k => lower.includes(k))) {
        return { label, confidence: 0.7 + Math.random() * 0.3, context: segment.text, speakerId: segment.speakerId, startMs: segment.startMs };
      }
    }
    return { label: 'neutro', confidence: 0.8, context: segment.text, speakerId: segment.speakerId, startMs: segment.startMs };
  }

  async getSentimentBySpeaker(segments: TranscriptionSegment[], speakerId: string): Promise<SentimentResult[]> {
    const speakerSegments = segments.filter(s => s.speakerId === speakerId);
    return Promise.all(speakerSegments.map(s => this.analyzeSegment(s)));
  }

  private getClimate(label: SentimentLabel): string {
    switch (label) {
      case 'entusiasmo': return 'Reunião com clima positivo e entusiasmado';
      case 'concordancia': return 'Reunião com clima de concordância e harmonia';
      case 'discordancia': return 'Reunião com divergências e debates';
      case 'urgencia': return 'Reunião com senso de urgência';
      default: return 'Reunião com clima neutro e profissional';
    }
  }
}
