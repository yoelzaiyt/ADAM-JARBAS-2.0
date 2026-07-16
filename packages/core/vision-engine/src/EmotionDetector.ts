// ─── Emotion Detector ────────────────────────────────────────────────────────
// Detect emotions from facial expressions

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  EmotionResult,
  EmotionScore,
} from './interfaces.js';

export class EmotionDetector {
  private emotions = [
    'happy', 'sad', 'angry', 'surprised', 'fearful',
    'disgusted', 'neutral', 'contempt',
  ];

  async detect(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<EmotionResult[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.emotions) return result.emotions;
    }

    return [];
  }

  async detectBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<EmotionResult[][]> {
    return Promise.all(requests.map(r => this.detect(r, provider)));
  }

  analyzeEmotions(emotions: EmotionScore[]): {
    dominant: string;
    isPositive: boolean;
    confidence: number;
  } {
    if (emotions.length === 0) {
      return {
        dominant: 'neutral',
        isPositive: true,
        confidence: 0.5,
      };
    }

    const sorted = [...emotions].sort((a, b) => b.score - a.score);
    const dominant = sorted[0];

    const positiveEmotions = ['happy', 'surprised'];
    const isPositive = positiveEmotions.includes(dominant.emotion);

    return {
      dominant: dominant.emotion,
      isPositive,
      confidence: dominant.score,
    };
  }

  getOverallMood(results: EmotionResult[]): {
    mood: string;
    score: number;
  } {
    if (results.length === 0) {
      return { mood: 'neutral', score: 0.5 };
    }

    const allEmotions: EmotionScore[] = [];
    for (const result of results) {
      allEmotions.push(...result.emotions);
    }

    const analysis = this.analyzeEmotions(allEmotions);
    return {
      mood: analysis.dominant,
      score: analysis.confidence,
    };
  }

  detectMicroExpressions(emotions: EmotionScore[]): EmotionScore[] {
    // Detect emotions with low scores (potentially suppressed)
    return emotions.filter(e => e.score > 0.1 && e.score < 0.3);
  }

  getSupportedEmotions(): string[] {
    return [...this.emotions];
  }

  validateEmotionScore(emotion: string, score: number): boolean {
    return this.emotions.includes(emotion) && score >= 0 && score <= 1;
  }
}
