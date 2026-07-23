import { describe, it, expect, beforeEach } from 'vitest';
import { MediaManager } from '../MediaManager.js';

describe('MediaManager', () => {
  let manager: MediaManager;

  beforeEach(() => {
    manager = new MediaManager();
  });

  it('downloads media', async () => {
    const file = await manager.download('https://example.com/img.jpg', 'image');
    expect(file.type).toBe('image');
    expect(file.url).toBe('https://example.com/img.jpg');
    expect(file.id).toBeDefined();
  });

  it('uploads media', async () => {
    const buf = Buffer.from('test data');
    const file = await manager.upload(buf, 'document', 'test.pdf');
    expect(file.sizeBytes).toBe(9);
    expect(file.filename).toBe('test.pdf');
  });

  it('getMedia returns file', async () => {
    const file = await manager.download('url', 'audio');
    expect(manager.getMedia(file.id)).toBeDefined();
    expect(manager.getMedia('bad')).toBeNull();
  });

  it('deleteMedia removes file', async () => {
    const file = await manager.download('url', 'video');
    await manager.deleteMedia(file.id);
    expect(manager.getMedia(file.id)).toBeNull();
  });
});
