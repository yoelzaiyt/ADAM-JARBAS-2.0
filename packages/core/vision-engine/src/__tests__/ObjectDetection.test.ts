import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectDetection } from '../ObjectDetection.js';
import type { VisionAnalysisRequest, DetectedObject } from '../interfaces.js';

describe('ObjectDetection', () => {
  let detection: ObjectDetection;

  beforeEach(() => {
    detection = new ObjectDetection();
  });

  it('creates ObjectDetection', () => {
    expect(detection).toBeDefined();
  });

  it('detects objects', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'image', data: Buffer.from(''), format: 'jpeg' },
      analysisType: ['objects'],
    };
    const objects = await detection.detect(request);
    expect(objects).toBeDefined();
    expect(Array.isArray(objects)).toBe(true);
  });

  it('categorizes objects', () => {
    expect(detection.categorizeObject('person')).toBe('person');
    expect(detection.categorizeObject('car')).toBe('vehicle');
    expect(detection.categorizeObject('laptop')).toBe('computer');
    expect(detection.categorizeObject('phone')).toBe('mobile');
    expect(detection.categorizeObject('desk')).toBe('furniture');
    expect(detection.categorizeObject('unknown')).toBe('other');
  });

  it('counts by category', () => {
    const objects: DetectedObject[] = [
      { id: '1', label: 'Person', category: 'person', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 100, height: 200 } },
      { id: '2', label: 'Person', category: 'person', confidence: 0.85, boundingBox: { x: 200, y: 0, width: 100, height: 200 } },
      { id: '3', label: 'Car', category: 'vehicle', confidence: 0.95, boundingBox: { x: 0, y: 300, width: 300, height: 150 } },
    ];
    const counts = detection.countByCategory(objects);
    expect(counts['person']).toBe(2);
    expect(counts['vehicle']).toBe(1);
  });

  it('filters by confidence', () => {
    const objects: DetectedObject[] = [
      { id: '1', label: 'A', category: 'other', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 100, height: 100 } },
      { id: '2', label: 'B', category: 'other', confidence: 0.5, boundingBox: { x: 0, y: 0, width: 100, height: 100 } },
    ];
    const filtered = detection.filterByConfidence(objects, 0.7);
    expect(filtered).toHaveLength(1);
  });

  it('filters by category', () => {
    const objects: DetectedObject[] = [
      { id: '1', label: 'Person', category: 'person', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 100, height: 200 } },
      { id: '2', label: 'Car', category: 'vehicle', confidence: 0.95, boundingBox: { x: 0, y: 300, width: 300, height: 150 } },
    ];
    const filtered = detection.filterByCategory(objects, 'person');
    expect(filtered).toHaveLength(1);
  });

  it('merges overlapping', () => {
    const objects: DetectedObject[] = [
      { id: '1', label: 'A', category: 'other', confidence: 0.9, boundingBox: { x: 0, y: 0, width: 100, height: 100 } },
      { id: '2', label: 'B', category: 'other', confidence: 0.8, boundingBox: { x: 10, y: 10, width: 100, height: 100 } },
    ];
    const merged = detection.mergeOverlapping(objects);
    expect(merged).toHaveLength(1);
  });
});
