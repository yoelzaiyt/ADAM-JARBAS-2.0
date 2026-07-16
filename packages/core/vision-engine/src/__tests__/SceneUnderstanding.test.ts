import { describe, it, expect, beforeEach } from 'vitest';
import { SceneUnderstanding } from '../SceneUnderstanding.js';
import type { VisionAnalysisRequest, SceneDescription } from '../interfaces.js';

describe('SceneUnderstanding', () => {
  let understanding: SceneUnderstanding;

  beforeEach(() => {
    understanding = new SceneUnderstanding();
  });

  it('creates SceneUnderstanding', () => {
    expect(understanding).toBeDefined();
  });

  it('analyzes scene', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['scene'],
    };
    const result = await understanding.analyze(request);
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  it('answers what is happening', async () => {
    const scene: SceneDescription = {
      summary: 'People working',
      detailed: 'Office scene',
      context: 'Work environment',
      setting: 'indoor',
      activity: 'Working',
      peopleCount: 3,
      relevantObjects: ['desks', 'computers'],
      potentialRisks: [],
      confidence: 0.8,
    };
    const answer = await understanding.answerQuestion(scene, 'What is happening?');
    expect(answer.answer).toBeDefined();
    expect(answer.confidence).toBeGreaterThan(0);
  });

  it('answers how many people', async () => {
    const scene: SceneDescription = {
      summary: 'Office',
      detailed: 'Test',
      context: 'Work',
      setting: 'indoor',
      peopleCount: 5,
      relevantObjects: [],
      potentialRisks: [],
      confidence: 0.8,
    };
    const answer = await understanding.answerQuestion(scene, 'How many people are there?');
    expect(answer.answer).toContain('5');
  });

  it('answers about risks', async () => {
    const scene: SceneDescription = {
      summary: 'Construction',
      detailed: 'Test',
      context: 'Work',
      setting: 'outdoor',
      peopleCount: 2,
      relevantObjects: [],
      potentialRisks: ['Heavy machinery', 'High altitude'],
      confidence: 0.8,
    };
    const answer = await understanding.answerQuestion(scene, 'Are there any risks?');
    expect(answer.answer).toContain('risks');
  });

  it('summarizes scene', () => {
    const scene: SceneDescription = {
      summary: 'Office',
      detailed: 'Test',
      context: 'Work',
      setting: 'indoor',
      peopleCount: 3,
      relevantObjects: ['computers'],
      potentialRisks: [],
      confidence: 0.8,
    };
    const summary = understanding.summarizeScene(scene);
    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(0);
  });
});
