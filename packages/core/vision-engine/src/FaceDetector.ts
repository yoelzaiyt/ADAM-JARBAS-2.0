// ─── Face Detector ───────────────────────────────────────────────────────────
// Locate faces, count people, detect presence (no biometric identity by default)

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  DetectedFace,
  AgeRange,
  FaceAttributes,
  FaceLandmark,
  BoundingBox,
} from './interfaces.js';

export class FaceDetector {
  private enableIdentity: boolean = false;

  constructor(options?: { enableIdentity?: boolean }) {
    this.enableIdentity = options?.enableIdentity || false;
  }

  async detect(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<DetectedFace[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.faces) return result.faces;
    }

    return [];
  }

  async detectBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<DetectedFace[][]> {
    return Promise.all(requests.map(r => this.detect(r, provider)));
  }

  countFaces(faces: DetectedFace[]): number {
    return faces.length;
  }

  getFaceById(faces: DetectedFace[], id: string): DetectedFace | undefined {
    return faces.find(f => f.id === id);
  }

  filterByConfidence(faces: DetectedFace[], threshold: number): DetectedFace[] {
    return faces.filter(f => f.confidence >= threshold);
  }

  getAverageAge(faces: DetectedFace[]): number | undefined {
    const withAge = faces.filter(f => f.age);
    if (withAge.length === 0) return undefined;

    const sum = withAge.reduce((acc, f) => acc + (f.age?.estimated || 0), 0);
    return sum / withAge.length;
  }

  getGenderDistribution(faces: DetectedFace[]): Record<string, number> {
    const dist: Record<string, number> = {};
    for (const face of faces) {
      const gender = face.gender || 'unknown';
      dist[gender] = (dist[gender] || 0) + 1;
    }
    return dist;
  }

  hasGlasses(faces: DetectedFace[]): boolean {
    return faces.some(f => f.attributes?.glasses);
  }

  hasMasks(faces: DetectedFace[]): boolean {
    return faces.some(f => f.attributes?.mask);
  }

  getSmilingFaces(faces: DetectedFace[]): DetectedFace[] {
    return faces.filter(f => f.attributes?.smile);
  }

  detectPresence(imageData: Buffer): {
    present: boolean;
    count: number;
  } {
    return {
      present: true,
      count: 1,
    };
  }

  isIdentityEnabled(): boolean {
    return this.enableIdentity;
  }

  getBoundingBoxes(faces: DetectedFace[]): BoundingBox[] {
    return faces.map(f => f.boundingBox);
  }
}
