import { describe, it, expect, beforeEach } from 'vitest';
import { FrameExtractor } from '../FrameExtractor.js';

describe('FrameExtractor', () => {
  let extractor: FrameExtractor;

  beforeEach(() => {
    extractor = new FrameExtractor();
  });

  it('creates FrameExtractor', () => {
    expect(extractor).toBeDefined();
  });

  it('extracts frames', async () => {
    const result = await extractor.extract(Buffer.from(''), {
      interval: 1,
      maxFrames: 10,
    });
    expect(result).toBeDefined();
    expect(result.totalFrames).toBeDefined();
    expect(result.extractedFrames).toBeDefined();
  });

  it('extracts at timestamps', async () => {
    const frames = await extractor.extractAtTimestamps(Buffer.from(''), [0, 5, 10]);
    expect(frames).toHaveLength(3);
    expect(frames[0].timestamp).toBe(0);
    expect(frames[1].timestamp).toBe(5);
    expect(frames[2].timestamp).toBe(10);
  });

  it('extracts key frames', async () => {
    const frames = await extractor.extractKeyFrames(Buffer.from(''), 5);
    expect(frames).toHaveLength(5);
    expect(frames.every(f => f.isKeyFrame)).toBe(true);
  });

  it('calculates optimal interval', () => {
    const interval = extractor.calculateOptimalInterval(100, 10);
    expect(interval).toBe(10);
  });

  it('detects key moments', () => {
    const frames = [
      { index: 0, timestamp: 0, image: 'f0.jpg', isKeyFrame: true, quality: 0.9 },
      { index: 1, timestamp: 1, image: 'f1.jpg', isKeyFrame: false, quality: 0.5 },
      { index: 2, timestamp: 2, image: 'f2.jpg', isKeyFrame: true, quality: 0.95 },
    ];
    const moments = extractor.detectKeyMoments(frames);
    expect(moments).toHaveLength(2);
  });
});
