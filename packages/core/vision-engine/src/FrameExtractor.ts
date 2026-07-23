// ─── Frame Extractor ─────────────────────────────────────────────────────────
// Extract key frames, scene changes, and important moments from video

import type {
  FrameExtractionResult,
  ExtractedFrame,
  SceneChange,
} from './interfaces.js';

export class FrameExtractor {
  async extract(
    videoData: Buffer,
    options?: {
      interval?: number;
      keyFrameOnly?: boolean;
      quality?: 'low' | 'medium' | 'high';
      maxFrames?: number;
    }
  ): Promise<FrameExtractionResult> {
    const interval = options?.interval || 1;
    const maxFrames = options?.maxFrames || 100;

    // Simulated frame extraction
    const totalFrames = Math.min(100, maxFrames);
    const extractedFrames: ExtractedFrame[] = [];
    const keyFrames: number[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const timestamp = i * interval;
      const isKeyFrame = i % 10 === 0;

      extractedFrames.push({
        index: i,
        timestamp,
        image: `frame-${i}.jpg`,
        isKeyFrame,
        quality: options?.quality === 'high' ? 0.9 : options?.quality === 'low' ? 0.5 : 0.7,
      });

      if (isKeyFrame) {
        keyFrames.push(i);
      }
    }

    return {
      totalFrames,
      extractedFrames,
      keyFrames,
      scenes: [],
    };
  }

  async extractAtTimestamps(
    videoData: Buffer,
    timestamps: number[]
  ): Promise<ExtractedFrame[]> {
    return timestamps.map((timestamp, index) => ({
      index,
      timestamp,
      image: `frame-${timestamp}.jpg`,
      isKeyFrame: true,
      quality: 0.8,
    }));
  }

  async extractKeyFrames(
    videoData: Buffer,
    maxKeyFrames?: number
  ): Promise<ExtractedFrame[]> {
    const max = maxKeyFrames || 10;
    const frames: ExtractedFrame[] = [];

    for (let i = 0; i < max; i++) {
      frames.push({
        index: i * 10,
        timestamp: i * 10,
        image: `keyframe-${i}.jpg`,
        isKeyFrame: true,
        quality: 0.9,
      });
    }

    return frames;
  }

  calculateOptimalInterval(duration: number, targetFrames: number): number {
    return Math.max(1, Math.floor(duration / targetFrames));
  }

  detectKeyMoments(frames: ExtractedFrame[]): number[] {
    // Detect key moments based on quality
    return frames
      .filter(f => f.quality > 0.8)
      .map(f => f.timestamp);
  }
}
