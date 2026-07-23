// ─── Object Detection ────────────────────────────────────────────────────────
// Detect people, vehicles, computers, documents, furniture, products, etc.

import type {
  VisionAnalysisRequest,
  VisionAnalysisResult,
  DetectedObject,
  ObjectCategory,
  BoundingBox,
} from './interfaces.js';

export class ObjectDetection {
  private objectCategories: Record<string, ObjectCategory> = {
    person: 'person',
    people: 'person',
    man: 'person',
    woman: 'person',
    car: 'vehicle',
    truck: 'vehicle',
    bicycle: 'vehicle',
    motorcycle: 'vehicle',
    computer: 'computer',
    laptop: 'computer',
    monitor: 'computer',
    keyboard: 'computer',
    phone: 'mobile',
    smartphone: 'mobile',
    tablet: 'mobile',
    document: 'document',
    paper: 'document',
    book: 'document',
    desk: 'furniture',
    chair: 'furniture',
    table: 'furniture',
    sofa: 'furniture',
    bed: 'furniture',
    printer: 'equipment',
    scanner: 'equipment',
    projector: 'equipment',
    product: 'product',
    box: 'product',
  };

  async detect(
    request: VisionAnalysisRequest,
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<DetectedObject[]> {
    if (provider) {
      const result = await provider.analyzeImage(request);
      if (result.objects) return result.objects;
    }

    return this.fallbackDetection(request);
  }

  async detectBatch(
    requests: VisionAnalysisRequest[],
    provider?: { analyzeImage: (req: VisionAnalysisRequest) => Promise<VisionAnalysisResult> }
  ): Promise<DetectedObject[][]> {
    return Promise.all(requests.map(r => this.detect(r, provider)));
  }

  private fallbackDetection(request: VisionAnalysisRequest): DetectedObject[] {
    return [
      {
        id: 'obj-1',
        label: 'Unknown Object',
        category: 'other',
        confidence: 0.5,
        boundingBox: { x: 0, y: 0, width: 100, height: 100 },
      },
    ];
  }

  categorizeObject(label: string): ObjectCategory {
    const lowerLabel = label.toLowerCase();
    for (const [keyword, category] of Object.entries(this.objectCategories)) {
      if (lowerLabel.includes(keyword)) {
        return category;
      }
    }
    return 'other';
  }

  countByCategory(objects: DetectedObject[]): Record<ObjectCategory, number> {
    const counts: Record<string, number> = {};

    for (const obj of objects) {
      counts[obj.category] = (counts[obj.category] || 0) + 1;
    }

    return counts as Record<ObjectCategory, number>;
  }

  filterByConfidence(
    objects: DetectedObject[],
    threshold: number
  ): DetectedObject[] {
    return objects.filter(obj => obj.confidence >= threshold);
  }

  filterByCategory(
    objects: DetectedObject[],
    category: ObjectCategory
  ): DetectedObject[] {
    return objects.filter(obj => obj.category === category);
  }

  mergeOverlapping(
    objects: DetectedObject[],
    iouThreshold?: number
  ): DetectedObject[] {
    const threshold = iouThreshold || 0.5;
    const merged: DetectedObject[] = [];

    for (const obj of objects) {
      const overlapping = merged.find(m =>
        this.calculateIoU(m.boundingBox, obj.boundingBox) > threshold
      );

      if (!overlapping) {
        merged.push(obj);
      } else if (obj.confidence > overlapping.confidence) {
        const index = merged.indexOf(overlapping);
        merged[index] = obj;
      }
    }

    return merged;
  }

  private calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) return 0;

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return union > 0 ? intersection / union : 0;
  }

  getObjectsInRegion(
    objects: DetectedObject[],
    region: BoundingBox
  ): DetectedObject[] {
    return objects.filter(obj => {
      const center = {
        x: obj.boundingBox.x + obj.boundingBox.width / 2,
        y: obj.boundingBox.y + obj.boundingBox.height / 2,
      };
      return (
        center.x >= region.x &&
        center.x <= region.x + region.width &&
        center.y >= region.y &&
        center.y <= region.y + region.height
      );
    });
  }
}
