import { randomUUID } from 'node:crypto';
import type {
  ImageHandler as IImageHandler,
  ProcessedImage,
  GatewayMessage,
} from './interfaces.js';

export class ImageHandler implements IImageHandler {
  private images: Map<string, ProcessedImage> = new Map();

  async processImage(imageUrl: string, contactId: string): Promise<ProcessedImage> {
    const id = randomUUID();
    const img: ProcessedImage = {
      id, contactId, imageUrl, processedAt: new Date(),
    };
    this.images.set(id, img);
    return img;
  }

  async sendImage(to: string, imageUrl: string, caption?: string): Promise<GatewayMessage> {
    return {
      id: randomUUID(), from: 'system', to, type: 'image',
      direction: 'outbound', mediaUrl: imageUrl, caption,
      timestamp: new Date(), status: 'pending',
      provider: 'meta', metadata: {},
    };
  }

  getImage(imageId: string): ProcessedImage | null {
    return this.images.get(imageId) ?? null;
  }
}
