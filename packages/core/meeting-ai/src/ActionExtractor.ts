import type {
  ActionExtractor as IActionExtractor,
  ExtractedEntity,
  ExtractedEntityType,
  TranscriptionSegment,
} from './interfaces.js';

const ENTITY_PATTERNS: Record<ExtractedEntityType, RegExp[]> = {
  decisao: [/decid[oi]/i, /acord[oa]/i, /defini[uv]/i],
  pendencia: [/pend[ea]/i, /falt[ao]/i, /precis[ao]/i, /tarefa/i],
  ideia: [/ideia/i, /sugest[ao]/i, /propost[ao]/i, /podemo/i],
  problema: [/problema/i, /dificuldade/i, /erro/i, /falhou/i],
  risco: [/risco/i, /perigo/i, /cuidado/i, /atencao/i],
  cliente: [/cliente/i, /empresa/i, /cnpj/i],
  empresa: [/empresa/i, /companhia/i, /startup/i],
  data: [/\d{1,2}\/\d{1,2}\/\d{2,4}/, /\d{4}-\d{2}-\d{2}/],
  valor: [/R\$\s*[\d.,]+/i, /\$\s*[\d.,]+/i, /valor/i],
  prazo: [/prazo/i, /at[eé]\s+\d/i, /deadline/i, /at[eé]\s+semana/i],
};

export class ActionExtractor implements IActionExtractor {
  private entitiesByMeeting: Map<string, ExtractedEntity[]> = new Map();

  async extract(segments: TranscriptionSegment[]): Promise<ExtractedEntity[]> {
    const results: ExtractedEntity[] = [];
    const meetingId = segments[0]?.speakerId ?? 'unknown';

    for (const segment of segments) {
      for (const [type, patterns] of Object.entries(ENTITY_PATTERNS) as [ExtractedEntityType, RegExp[]][]) {
        for (const pattern of patterns) {
          if (pattern.test(segment.text)) {
            results.push({
              type,
              value: segment.text.substring(0, 100),
              context: segment.text,
              confidence: 0.7 + Math.random() * 0.3,
              speakerId: segment.speakerId,
              startMs: segment.startMs,
            });
            break;
          }
        }
      }
    }

    return results;
  }

  getByType(entities: ExtractedEntity[], type: ExtractedEntityType): ExtractedEntity[] {
    return entities.filter(e => e.type === type);
  }

  getEntitiesByMeeting(meetingId: string): ExtractedEntity[] {
    return this.entitiesByMeeting.get(meetingId) ?? [];
  }
}
