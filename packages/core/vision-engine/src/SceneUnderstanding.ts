// ─── Scene Understanding ─────────────────────────────────────────────────────
// Answer questions about what's happening, context, risks, relevant objects

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  SceneDescription,
  SceneSetting,
} from './interfaces.js';

export class SceneUnderstanding {
  async analyze(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<SceneDescription> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.scene) return result.scene;
    }

    return this.fallbackAnalysis(request);
  }

  async analyzeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<SceneDescription[]> {
    return Promise.all(requests.map(r => this.analyze(r, provider)));
  }

  private fallbackAnalysis(request: VisionAnalysisRequest): SceneDescription {
    return {
      summary: 'Scene analysis',
      detailed: 'Unable to analyze scene in detail',
      context: 'Unknown context',
      setting: 'unknown',
      peopleCount: 0,
      relevantObjects: [],
      potentialRisks: [],
      confidence: 0.5,
    };
  }

  async answerQuestion(
    scene: SceneDescription,
    question: string
  ): Promise<{ answer: string; confidence: number; uncertain: boolean }> {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('what') && lowerQuestion.includes('happening')) {
      return {
        answer: scene.activity || scene.summary,
        confidence: scene.confidence,
        uncertain: scene.confidence < 0.7,
      };
    }

    if (lowerQuestion.includes('how many') && lowerQuestion.includes('people')) {
      return {
        answer: `${scene.peopleCount} people detected`,
        confidence: 0.8,
        uncertain: false,
      };
    }

    if (lowerQuestion.includes('context')) {
      return {
        answer: scene.context,
        confidence: scene.confidence,
        uncertain: scene.confidence < 0.6,
      };
    }

    if (lowerQuestion.includes('risk') || lowerQuestion.includes('danger')) {
      return {
        answer: scene.potentialRisks.length > 0
          ? `Potential risks: ${scene.potentialRisks.join(', ')}`
          : 'No apparent risks detected',
        confidence: 0.7,
        uncertain: false,
      };
    }

    if (lowerQuestion.includes('object')) {
      return {
        answer: scene.relevantObjects.length > 0
          ? `Relevant objects: ${scene.relevantObjects.join(', ')}`
          : 'No specific objects identified',
        confidence: 0.7,
        uncertain: false,
      };
    }

    return {
      answer: 'I can analyze the scene but need a more specific question.',
      confidence: 0.5,
      uncertain: true,
    };
  }

  detectSetting(imageData: Buffer): SceneSetting {
    return 'indoor';
  }

  countPeople(scene: SceneDescription): number {
    return scene.peopleCount;
  }

  identifyRisks(scene: SceneDescription): string[] {
    return scene.potentialRisks;
  }

  summarizeScene(scene: SceneDescription): string {
    const parts: string[] = [];

    parts.push(`Setting: ${scene.setting}`);
    parts.push(`People: ${scene.peopleCount}`);
    parts.push(`Activity: ${scene.activity || 'Unknown'}`);
    parts.push(`Time: ${scene.timeOfDay || 'Unknown'}`);

    if (scene.relevantObjects.length > 0) {
      parts.push(`Objects: ${scene.relevantObjects.join(', ')}`);
    }

    if (scene.potentialRisks.length > 0) {
      parts.push(`Risks: ${scene.potentialRisks.join(', ')}`);
    }

    return parts.join('\n');
  }
}
