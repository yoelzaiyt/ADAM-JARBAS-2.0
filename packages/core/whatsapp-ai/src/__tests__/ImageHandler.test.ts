import { describe, it, expect, beforeEach } from 'vitest';
import { ImageHandler } from '../ImageHandler.js';

describe('ImageHandler', () => {
  let handler: ImageHandler;

  beforeEach(() => {
    handler = new ImageHandler();
  });

  it('processes image', async () => {
    const img = await handler.processImage('https://example.com/img.jpg', 'c1');
    expect(img.imageUrl).toBe('https://example.com/img.jpg');
    expect(img.contactId).toBe('c1');
  });

  it('sendImage creates message', async () => {
    const msg = await handler.sendImage('5511999', 'url', 'caption');
    expect(msg.type).toBe('image');
    expect(msg.caption).toBe('caption');
  });

  it('getImage returns null for nonexistent', () => {
    expect(handler.getImage('bad')).toBeNull();
  });
});
