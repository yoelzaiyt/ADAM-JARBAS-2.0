import { describe, it, expect, beforeEach } from 'vitest';
import { FaceDetector } from '../FaceDetector.js';
import type { VisionAnalysisRequest, DetectedFace } from '../interfaces.js';

describe('FaceDetector', () => {
  let detector: FaceDetector;

  beforeEach(() => {
    detector = new FaceDetector();
  });

  it('creates FaceDetector', () => {
    expect(detector).toBeDefined();
  });

  it('detects faces', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['faces'],
    };
    const faces = await detector.detect(request);
    expect(faces).toBeDefined();
    expect(Array.isArray(faces)).toBe(true);
  });

  it('counts faces', () => {
    const faces: DetectedFace[] = [
      { id: '1', boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9 },
      { id: '2', boundingBox: { x: 200, y: 0, width: 100, height: 100 }, confidence: 0.85 },
    ];
    expect(detector.countFaces(faces)).toBe(2);
  });

  it('filters by confidence', () => {
    const faces: DetectedFace[] = [
      { id: '1', boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9 },
      { id: '2', boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.5 },
    ];
    const filtered = detector.filterByConfidence(faces, 0.7);
    expect(filtered).toHaveLength(1);
  });

  it('gets average age', () => {
    const faces: DetectedFace[] = [
      { id: '1', boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, age: { min: 25, max: 35, estimated: 30 } },
      { id: '2', boundingBox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.85, age: { min: 35, max: 45, estimated: 40 } },
    ];
    const avg = detector.getAverageAge(faces);
    expect(avg).toBe(35);
  });

  it('detects presence', () => {
    const result = detector.detectPresence(Buffer.from(''));
    expect(result.present).toBe(true);
  });

  it('checks identity disabled by default', () => {
    expect(detector.isIdentityEnabled()).toBe(false);
  });

  it('can enable identity', () => {
    const customDetector = new FaceDetector({ enableIdentity: true });
    expect(customDetector.isIdentityEnabled()).toBe(true);
  });
});
