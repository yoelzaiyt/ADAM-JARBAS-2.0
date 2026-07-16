import { describe, it, expect, beforeEach } from 'vitest';
import { ImageSearch } from '../ImageSearch.js';
import type { ImageSearchResult } from '../interfaces.js';

describe('ImageSearch', () => {
  let search: ImageSearch;

  beforeEach(() => {
    search = new ImageSearch();
  });

  it('creates ImageSearch', () => {
    expect(search).toBeDefined();
  });

  it('indexes image', () => {
    const image: ImageSearchResult = {
      id: 'img-1',
      url: 'http://example.com/img1.jpg',
      description: 'A cat',
      score: 0,
      tags: ['cat', 'animal'],
    };
    search.indexImage(image);
    expect(search.count()).toBe(1);
  });

  it('searches images', async () => {
    search.indexImage({
      id: 'img-1',
      url: 'http://example.com/img1.jpg',
      description: 'A cat sitting',
      score: 0,
      tags: ['cat', 'animal'],
    });
    search.indexImage({
      id: 'img-2',
      url: 'http://example.com/img2.jpg',
      description: 'A dog running',
      score: 0,
      tags: ['dog', 'animal'],
    });

    const results = await search.search({ query: 'cat' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].description).toContain('cat');
  });

  it('finds by tags', () => {
    search.indexImage({
      id: 'img-1',
      url: 'http://example.com/img1.jpg',
      description: 'Cat',
      score: 0,
      tags: ['cat'],
    });
    const results = search.findByTags(['cat']);
    expect(results).toHaveLength(1);
  });

  it('removes image', () => {
    search.indexImage({
      id: 'img-1',
      url: 'http://example.com/img1.jpg',
      description: 'Test',
      score: 0,
      tags: [],
    });
    expect(search.removeImage('img-1')).toBe(true);
    expect(search.count()).toBe(0);
  });

  it('gets statistics', () => {
    search.indexImage({
      id: 'img-1',
      url: 'http://example.com/img1.jpg',
      description: 'Test',
      score: 0,
      tags: ['cat', 'animal'],
    });
    const stats = search.getStatistics();
    expect(stats.totalImages).toBe(1);
    expect(stats.tagsCount['cat']).toBe(1);
  });

  it('clears index', () => {
    search.indexImage({
      id: 'img-1',
      url: 'http://example.com/img1.jpg',
      description: 'Test',
      score: 0,
      tags: [],
    });
    search.clear();
    expect(search.count()).toBe(0);
  });
});
