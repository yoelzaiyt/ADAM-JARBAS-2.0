import type {
  MeetingAnalyticsEngine as IMeetingAnalyticsEngine,
  MeetingAnalytics,
  ParticipantStats,
  TopicStats,
  TranscriptionSegment,
  ExtractedEntity,
  Decision,
  GeneratedTask,
} from './interfaces.js';

export class MeetingAnalyticsEngine implements IMeetingAnalyticsEngine {
  calculate(
    segments: TranscriptionSegment[],
    entities: ExtractedEntity[],
    decisions: Decision[],
    tasks: GeneratedTask[],
  ): MeetingAnalytics {
    const participantStats = this.getParticipantStats(segments);
    const topicStats = this.getTopicStats(entities);
    const totalDurationMs = segments.length > 0 ? segments[segments.length - 1]!.endMs - segments[0]!.startMs : 0;

    return {
      totalDurationMs,
      participantStats,
      topicStats,
      totalTasks: tasks.length,
      totalDecisions: decisions.length,
      totalTopics: topicStats.length,
      participationBalance: this.calculateBalance(participantStats),
    };
  }

  getParticipantStats(segments: TranscriptionSegment[]): ParticipantStats[] {
    const statsMap = new Map<string, ParticipantStats>();

    for (const seg of segments) {
      let stats = statsMap.get(seg.speakerId);
      if (!stats) {
        stats = { speakerId: seg.speakerId, speakingTimeMs: 0, interventionCount: 0, averageConfidence: 0 };
        statsMap.set(seg.speakerId, stats);
      }
      stats.speakingTimeMs += seg.endMs - seg.startMs;
      stats.interventionCount++;
      stats.averageConfidence = (stats.averageConfidence * (stats.interventionCount - 1) + seg.confidence) / stats.interventionCount;
    }

    return Array.from(statsMap.values());
  }

  getTopicStats(entities: ExtractedEntity[]): TopicStats[] {
    const topicsMap = new Map<string, TopicStats>();

    for (const entity of entities) {
      let stats = topicsMap.get(entity.type);
      if (!stats) {
        stats = { topic: entity.type, durationMs: 0, mentions: 0 };
        topicsMap.set(entity.type, stats);
      }
      stats.mentions++;
    }

    return Array.from(topicsMap.values());
  }

  private calculateBalance(stats: ParticipantStats[]): number {
    if (stats.length <= 1) return 1;
    const maxTime = Math.max(...stats.map(s => s.speakingTimeMs));
    const minTime = Math.min(...stats.map(s => s.speakingTimeMs));
    return maxTime > 0 ? minTime / maxTime : 0;
  }
}
