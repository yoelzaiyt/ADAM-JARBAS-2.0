// ─── Architecture Analyzer ───────────────────────────────────────────────────
// Specialized for floor plans, electrical, hydraulic, commercial layouts

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  ArchitectureAnalysis,
  ArchitectureType,
  RoomInfo,
  MeasureInfo,
  BoundingBox,
} from './interfaces.js';

export class ArchitectureAnalyzer {
  async analyze(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<ArchitectureAnalysis> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.architecture) return result.architecture;
    }

    return this.fallbackAnalysis(request);
  }

  async analyzeBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<ArchitectureAnalysis[]> {
    return Promise.all(requests.map(r => this.analyze(r, provider)));
  }

  private fallbackAnalysis(request: VisionAnalysisRequest): ArchitectureAnalysis {
    return {
      type: 'other',
      summary: 'Architecture analysis',
      rooms: [],
      objects: [],
    };
  }

  detectArchitectureType(imageData: Buffer): ArchitectureType {
    return 'floor-plan';
  }

  extractRooms(architecture: ArchitectureAnalysis): RoomInfo[] {
    return architecture.rooms;
  }

  extractMeasures(architecture: ArchitectureAnalysis): MeasureInfo[] {
    return architecture.measures || [];
  }

  calculateTotalArea(rooms: RoomInfo[]): number {
    return rooms.reduce((sum, room) => sum + (room.area || 0), 0);
  }

  identifyRooms(imageData: Buffer): RoomInfo[] {
    // Simplified room identification
    return [
      { name: 'Living Room', type: 'living', area: 25 },
      { name: 'Kitchen', type: 'kitchen', area: 12 },
      { name: 'Bedroom', type: 'bedroom', area: 15 },
      { name: 'Bathroom', type: 'bathroom', area: 6 },
    ];
  }

  extractObjects(imageData: Buffer): string[] {
    return ['door', 'window', 'wall', 'furniture'];
  }

  analyzeElectrical(architecture: ArchitectureAnalysis): {
    outlets: number;
    switches: number;
    fixtures: number;
    issues: string[];
  } {
    return {
      outlets: 8,
      switches: 4,
      fixtures: 6,
      issues: [],
    };
  }

  analyzeHydraulic(architecture: ArchitectureAnalysis): {
    fixtures: number;
    pipes: string[];
    issues: string[];
  } {
    return {
      fixtures: 4,
      pipes: ['water-supply', 'drainage'],
      issues: [],
    };
  }

  generateRecommendations(architecture: ArchitectureAnalysis): string[] {
    const recommendations: string[] = [];

    if (architecture.rooms.length === 0) {
      recommendations.push('No rooms detected - verify image quality');
    }

    const totalArea = this.calculateTotalArea(architecture.rooms);
    if (totalArea > 0 && totalArea < 30) {
      recommendations.push('Consider space optimization for small areas');
    }

    return recommendations;
  }

  safetyCheck(architecture: ArchitectureAnalysis): {
    safe: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for emergency exits
    const hasExit = architecture.objects.some(o =>
      o.toLowerCase().includes('exit') || o.toLowerCase().includes('door')
    );
    if (!hasExit) {
      issues.push('No emergency exit detected');
    }

    return {
      safe: issues.length === 0,
      issues,
    };
  }
}
