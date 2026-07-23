import { randomUUID } from 'node:crypto';
import type {
  MediaManager as IMediaManager,
  MediaFile,
  MediaType,
} from './interfaces.js';

export class MediaManager implements IMediaManager {
  private files: Map<string, MediaFile> = new Map();

  async download(mediaUrl: string, type: MediaType): Promise<MediaFile> {
    const id = randomUUID();
    const file: MediaFile = {
      id, type, url: mediaUrl, mimeType: `${type}/${type === 'document' ? 'pdf' : type}`,
      sizeBytes: 1024, createdAt: new Date(),
    };
    this.files.set(id, file);
    return file;
  }

  async upload(file: Buffer, type: MediaType, filename?: string): Promise<MediaFile> {
    const id = randomUUID();
    const media: MediaFile = {
      id, type, url: `media/${id}`, mimeType: `${type}/${type}`,
      sizeBytes: file.length, filename, createdAt: new Date(),
    };
    this.files.set(id, media);
    return media;
  }

  getMedia(mediaId: string): MediaFile | null {
    return this.files.get(mediaId) ?? null;
  }

  async deleteMedia(mediaId: string): Promise<void> {
    this.files.delete(mediaId);
  }
}
