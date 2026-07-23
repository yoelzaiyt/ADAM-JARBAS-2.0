import { describe, it, expect, beforeEach } from 'vitest';
import { VideoAnalyzer } from '../VideoAnalyzer.js';
import type { VisionAnalysisRequest, VideoFrame } from '../interfaces.js';

describe('VideoAnalyzer', () => {
  let analyzer: VideoAnalyzer;

  beforeEach(() => {
    analyzer = new VideoAnalyzer();
  });

  it('creates VideoAnalyzer', () => {
    expect(analyzer).toBeDefined();
  });

  it('analyzes video', async () => {
    const request: VisionAnalysisRequest = {
      id: 'req-1',
      source: { type: 'video', data: Buffer.from(''), format: 'mp4' },
      analysisType: ['describe'],
    };
    const result = await analyzer.analyze(request);
    expect(result).toBeDefined();
    expect(result.duration).toBeDefined();
  });

  it('extracts metadata', () => {
    const metadata = analyzer.extractMetadata(Buffer.from(''), 'mp4');
    expect(metadata).toBeDefined();
    expect(metadata.resolution).toBeDefined();
  });

  it('detects scene changes', () => {
    const frames: VideoFrame[] = [
      { timestamp: 0, image: 'frame0.jpg', objects: [], scene: undefined },
      { timestamp: 1, image: 'frame1.jpg', objects: [], scene: undefined },
      { timestamp: 10, image: 'frame10.jpg', objects: [], scene: undefined },
    ];
    const scenes = analyzer.detectSceneChanges(frames);
    expect(scenes).toBeDefined();
    expect(scenes.length).toBeGreaterThan(0);
  });

  it('summarizes video', () => {
    const analysis = {
      duration: 120,
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      format: 'mp4',
      frames: [],
      scenes: [],
      objects: [],
      people: [],
    };
    const summary = analyzer.summarizeVideo(analysis);
    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(0);
  });
});
