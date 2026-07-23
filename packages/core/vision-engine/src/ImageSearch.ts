// ─── Image Search ────────────────────────────────────────────────────────────
// Search images by text, tags, or visual similarity

import type {
  ImageSearchRequest,
  ImageSearchResult,
  ImageCategory,
} from './interfaces.js';

export class ImageSearch {
  private index: Map<string, ImageSearchResult> = new Map();

  constructor() {}

  async search(
    request: ImageSearchRequest,
    provider?: { analyzeImage: (req: unknown) => Promise<unknown> }
  ): Promise<ImageSearchResult[]> {
    const results: ImageSearchResult[] = [];

    for (const [, item] of Array.from(this.index.entries())) {
      let score = 0;

      if (request.query) {
        const queryLower = request.query.toLowerCase();
        if (item.description.toLowerCase().includes(queryLower)) {
          score += 0.5;
        }
        if (item.tags.some(t => t.toLowerCase().includes(queryLower))) {
          score += 0.3;
        }
      }

      if (request.tags) {
        const matchingTags = item.tags.filter(t =>
          request.tags!.some(rt => t.toLowerCase().includes(rt.toLowerCase()))
        );
        score += matchingTags.length * 0.1;
      }

      if (score > 0) {
        results.push({ ...item, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, request.limit || 10);
  }

  indexImage(image: ImageSearchResult): void {
    this.index.set(image.id, image);
  }

  removeImage(id: string): boolean {
    return this.index.delete(id);
  }

  getImage(id: string): ImageSearchResult | undefined {
    return this.index.get(id);
  }

  listImages(offset?: number, limit?: number): ImageSearchResult[] {
    const all = Array.from(this.index.values());
    const start = offset || 0;
    const end = limit ? start + limit : undefined;
    return all.slice(start, end);
  }

  count(): number {
    return this.index.size;
  }

  findByTags(tags: string[]): ImageSearchResult[] {
    return Array.from(this.index.values()).filter(item =>
      tags.some(tag => item.tags.includes(tag))
    );
  }

  findByCategory(category: ImageCategory): ImageSearchResult[] {
    return Array.from(this.index.values()).filter(item =>
      item.tags.includes(category)
    );
  }

  clear(): void {
    this.index.clear();
  }

  getStatistics(): {
    totalImages: number;
    tagsCount: Record<string, number>;
  } {
    const tagsCount: Record<string, number> = {};

    for (const item of Array.from(this.index.values())) {
      for (const tag of item.tags) {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      }
    }

    return {
      totalImages: this.index.size,
      tagsCount,
    };
  }
}
