import type { Connector, ConnectorConfig, ConnectorContent, ConnectorItem, ConnectorType } from './interfaces.js';

// ─── GitHub Connector ────────────────────────────────────────────────────────

export class GitHubConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl && !config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const owner = (options?.owner as string) || 'jarbas-ai';
    const repo = (options?.repo as string) || 'knowledge-hub';
    const items: ConnectorItem[] = [
      {
        id: 'gh-file-1',
        title: 'README.md',
        content: '# Knowledge Hub\n\nRepository documentation for the knowledge-hub module.',
        url: `https://github.com/${owner}/${repo}/blob/main/README.md`,
        mimeType: 'text/markdown',
        metadata: { path: 'README.md', branch: 'main', size: 1234, language: 'Markdown' },
      },
      {
        id: 'gh-file-2',
        title: 'index.ts',
        content: 'export { KnowledgeHub } from "./src";',
        url: `https://github.com/${owner}/${repo}/blob/main/src/index.ts`,
        mimeType: 'text/typescript',
        metadata: { path: 'src/index.ts', branch: 'main', size: 856, language: 'TypeScript' },
      },
      {
        id: 'gh-issue-1',
        title: 'feat: add connector support',
        content: 'Implement connector engine with support for GitHub, GitLab, and Bitbucket.',
        url: `https://github.com/${owner}/${repo}/issues/42`,
        metadata: { number: 42, state: 'open', labels: ['enhancement'], author: 'dev' },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-file.md',
      content: 'Mock file content from GitHub.',
      url: `https://github.com/jarbas-ai/knowledge-hub/blob/main/${itemId}`,
      mimeType: 'text/markdown',
      metadata: { path: itemId, branch: 'main' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'github';
  }
}

// ─── GitLab Connector ────────────────────────────────────────────────────────

export class GitLabConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl && !config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const project = (options?.project as string) || 'jarbas/knowledge-hub';
    const items: ConnectorItem[] = [
      {
        id: 'gl-file-1',
        title: 'README.md',
        content: '# Knowledge Hub\n\nGitLab project documentation.',
        url: `https://gitlab.com/${project}/-/blob/main/README.md`,
        mimeType: 'text/markdown',
        metadata: { path: 'README.md', branch: 'main', size: 1100, language: 'Markdown' },
      },
      {
        id: 'gl-file-2',
        title: 'pipeline.yml',
        content: 'stages:\n  - build\n  - test\n  - deploy',
        url: `https://gitlab.com/${project}/-/blob/main/.gitlab-ci.yml`,
        mimeType: 'text/yaml',
        metadata: { path: '.gitlab-ci.yml', branch: 'main', size: 340, language: 'YAML' },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-gl-file.md',
      content: 'Mock file content from GitLab.',
      url: `https://gitlab.com/jarbas/knowledge-hub/-/blob/main/${itemId}`,
      mimeType: 'text/markdown',
      metadata: { path: itemId, branch: 'main' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'gitlab';
  }
}

// ─── Bitbucket Connector ─────────────────────────────────────────────────────

export class BitbucketConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl && !config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const workspace = (options?.workspace as string) || 'jarbas';
    const items: ConnectorItem[] = [
      {
        id: 'bb-file-1',
        title: 'README.md',
        content: '# Knowledge Hub\n\nBitbucket project documentation.',
        url: `https://bitbucket.org/${workspace}/knowledge-hub/src/main/README.md`,
        mimeType: 'text/markdown',
        metadata: { path: 'README.md', branch: 'main', size: 1050, language: 'Markdown' },
      },
      {
        id: 'bb-file-2',
        title: 'Dockerfile',
        content: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install',
        url: `https://bitbucket.org/${workspace}/knowledge-hub/src/main/Dockerfile`,
        mimeType: 'text/plain',
        metadata: { path: 'Dockerfile', branch: 'main', size: 200, language: 'Dockerfile' },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-bb-file.md',
      content: 'Mock file content from Bitbucket.',
      url: `https://bitbucket.org/jarbas/knowledge-hub/src/main/${itemId}`,
      mimeType: 'text/markdown',
      metadata: { path: itemId, branch: 'main' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'bitbucket';
  }
}

// ─── Google Drive Connector ──────────────────────────────────────────────────

export class GoogleDriveConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const folder = (options?.folderId as string) || 'root';
    const items: ConnectorItem[] = [
      {
        id: 'gdrive-1',
        title: 'Project Proposal.docx',
        content: 'Project proposal for the Knowledge Hub initiative.',
        url: `https://drive.google.com/file/d/gdrive-1/view`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        metadata: { folderId: folder, owner: 'user@example.com', modifiedAt: '2025-12-01T10:00:00Z', size: 45000 },
      },
      {
        id: 'gdrive-2',
        title: 'Architecture Diagram.png',
        content: 'System architecture diagram for the knowledge hub.',
        url: `https://drive.google.com/file/d/gdrive-2/view`,
        mimeType: 'image/png',
        metadata: { folderId: folder, owner: 'user@example.com', modifiedAt: '2025-11-15T08:30:00Z', size: 230000 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-gdrive-file.docx',
      content: 'Mock content from Google Drive.',
      url: `https://drive.google.com/file/d/${itemId}/view`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      metadata: { folderId: 'root', owner: 'user@example.com' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'google-drive';
  }
}

// ─── OneDrive Connector ──────────────────────────────────────────────────────

export class OneDriveConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const items: ConnectorItem[] = [
      {
        id: 'od-1',
        title: 'Meeting Notes.docx',
        content: 'Sprint planning meeting notes for Q4.',
        url: 'https://onedrive.live.com/od-1',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        metadata: { driveId: 'drive-abc', owner: 'user@contoso.com', modifiedAt: '2025-10-20T14:00:00Z', size: 12000 },
      },
      {
        id: 'od-2',
        title: 'Budget 2026.xlsx',
        content: 'Annual budget spreadsheet for 2026.',
        url: 'https://onedrive.live.com/od-2',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        metadata: { driveId: 'drive-abc', owner: 'user@contoso.com', modifiedAt: '2025-09-05T09:15:00Z', size: 34000 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-od-file.docx',
      content: 'Mock content from OneDrive.',
      url: `https://onedrive.live.com/${itemId}`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      metadata: { driveId: 'drive-abc', owner: 'user@contoso.com' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'onedrive';
  }
}

// ─── Dropbox Connector ───────────────────────────────────────────────────────

export class DropboxConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const items: ConnectorItem[] = [
      {
        id: 'db-1',
        title: 'design-spec.pdf',
        content: 'Design specification document for the new module.',
        url: 'https://www.dropbox.com/home/db-1',
        mimeType: 'application/pdf',
        metadata: { path: '/design-spec.pdf', modifiedAt: '2025-08-12T16:45:00Z', size: 890000 },
      },
      {
        id: 'db-2',
        title: 'api-reference.md',
        content: '# API Reference\n\nEndpoints and usage examples.',
        url: 'https://www.dropbox.com/home/db-2',
        mimeType: 'text/markdown',
        metadata: { path: '/docs/api-reference.md', modifiedAt: '2025-07-30T11:20:00Z', size: 5600 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-db-file.pdf',
      content: 'Mock content from Dropbox.',
      url: `https://www.dropbox.com/home/${itemId}`,
      mimeType: 'application/pdf',
      metadata: { path: `/${itemId}` },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'dropbox';
  }
}

// ─── Nextcloud Connector ─────────────────────────────────────────────────────

export class NextcloudConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl && !config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const items: ConnectorItem[] = [
      {
        id: 'nc-1',
        title: 'team-handbook.pdf',
        content: 'Team onboarding handbook and procedures.',
        url: 'https://cloud.example.com/nc-1',
        mimeType: 'application/pdf',
        metadata: { path: '/Documents/team-handbook.pdf', owner: 'admin', modifiedAt: '2025-06-18T09:00:00Z', size: 1200000 },
      },
      {
        id: 'nc-2',
        title: 'project-roadmap.md',
        content: '# Project Roadmap\n\nQ1-Q4 milestones and deliverables.',
        url: 'https://cloud.example.com/nc-2',
        mimeType: 'text/markdown',
        metadata: { path: '/Wiki/project-roadmap.md', owner: 'pm', modifiedAt: '2025-05-10T13:30:00Z', size: 4200 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-nc-file.md',
      content: 'Mock content from Nextcloud.',
      url: `https://cloud.example.com/${itemId}`,
      mimeType: 'text/markdown',
      metadata: { path: `/${itemId}` },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'nextcloud';
  }
}

// ─── SharePoint Connector ────────────────────────────────────────────────────

export class SharePointConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const site = (options?.site as string) || 'contoso.sharepoint.com';
    const items: ConnectorItem[] = [
      {
        id: 'sp-1',
        title: 'Policy Document.docx',
        content: 'Corporate policy document for remote work.',
        url: `https://${site}/sites/hr/Shared Documents/Policy Document.docx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        metadata: { siteUrl: site, library: 'Shared Documents', modifiedAt: '2025-04-22T10:10:00Z', size: 67000 },
      },
      {
        id: 'sp-2',
        title: 'Training Slides.pptx',
        content: 'New employee training presentation.',
        url: `https://${site}/sites/training/Shared Documents/Training Slides.pptx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        metadata: { siteUrl: site, library: 'Shared Documents', modifiedAt: '2025-03-15T15:40:00Z', size: 3400000 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'mock-sp-file.docx',
      content: 'Mock content from SharePoint.',
      url: `https://contoso.sharepoint.com/sites/hr/Shared Documents/${itemId}`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      metadata: { siteUrl: 'contoso.sharepoint.com', library: 'Shared Documents' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'sharepoint';
  }
}

// ─── Obsidian Connector ──────────────────────────────────────────────────────

export class ObsidianConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const vault = (options?.vault as string) || 'knowledge-vault';
    const items: ConnectorItem[] = [
      {
        id: 'obs-1',
        title: 'Daily Note - 2025-12-01.md',
        content: '# 2025-12-01\n\n## Tasks\n- Review connector implementations\n- Update documentation\n\n## Notes\nMock daily note from Obsidian vault.',
        url: `obsidian://vault/${vault}/Daily Note - 2025-12-01.md`,
        mimeType: 'text/markdown',
        metadata: { vault, tags: ['daily', 'journal'], backlinks: 2, createdAt: '2025-12-01T08:00:00Z' },
      },
      {
        id: 'obs-2',
        title: 'Architecture Decision Record.md',
        content: '# ADR-001: Use Vector Store\n\n## Status\nAccepted\n\n## Context\nNeed persistent vector storage for knowledge retrieval.',
        url: `obsidian://vault/${vault}/Architecture Decision Record.md`,
        mimeType: 'text/markdown',
        metadata: { vault, tags: ['adr', 'architecture'], backlinks: 5, createdAt: '2025-11-20T14:00:00Z' },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: `${itemId}.md`,
      content: 'Mock content from Obsidian vault.',
      url: `obsidian://vault/knowledge-vault/${itemId}.md`,
      mimeType: 'text/markdown',
      metadata: { vault: 'knowledge-vault', tags: [] },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'obsidian';
  }
}

// ─── Notion Connector ────────────────────────────────────────────────────────

export class NotionConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const databaseId = (options?.databaseId as string) || 'mock-db-id';
    const items: ConnectorItem[] = [
      {
        id: 'notion-1',
        title: 'Product Requirements',
        content: '## Product Requirements\n\n### Feature: Knowledge Hub Connectors\n- Support 13+ connector types\n- Mock implementations for testing',
        url: `https://notion.so/${databaseId.replace(/-/g, '')}`,
        mimeType: 'text/markdown',
        metadata: { databaseId, type: 'page', createdAt: '2025-10-01T09:00:00Z', lastEditedBy: 'user' },
      },
      {
        id: 'notion-2',
        title: 'Sprint Retrospective',
        content: '## What went well\n- Connector engine design completed\n\n## What to improve\n- Add more mock data variety',
        url: `https://notion.so/notion-2`,
        mimeType: 'text/markdown',
        metadata: { databaseId, type: 'page', createdAt: '2025-09-28T16:30:00Z', lastEditedBy: 'team' },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'Mock Notion Page',
      content: 'Mock content from Notion.',
      url: `https://notion.so/${itemId}`,
      mimeType: 'text/markdown',
      metadata: { databaseId: 'mock-db-id', type: 'page' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'notion';
  }
}

// ─── Confluence Connector ────────────────────────────────────────────────────

export class ConfluenceConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl && !config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const space = (options?.space as string) || 'DEV';
    const items: ConnectorItem[] = [
      {
        id: 'conf-1',
        title: 'Getting Started Guide',
        content: '# Getting Started\n\nWelcome to the developer wiki.\n\n## Setup\n1. Clone the repository\n2. Install dependencies\n3. Run the dev server',
        url: `https://wiki.example.com/pages/viewpage.action?pageId=conf-1`,
        mimeType: 'text/markdown',
        metadata: { spaceKey: space, type: 'page', version: 3, author: 'admin', lastModified: '2025-11-05T12:00:00Z' },
      },
      {
        id: 'conf-2',
        title: 'API Documentation',
        content: '# API Documentation\n\n## Authentication\nUse Bearer tokens.\n\n## Endpoints\n- GET /api/v1/documents\n- POST /api/v1/search',
        url: `https://wiki.example.com/pages/viewpage.action?pageId=conf-2`,
        mimeType: 'text/markdown',
        metadata: { spaceKey: space, type: 'page', version: 7, author: 'dev', lastModified: '2025-10-28T09:45:00Z' },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'Mock Confluence Page',
      content: 'Mock content from Confluence.',
      url: `https://wiki.example.com/pages/viewpage.action?pageId=${itemId}`,
      mimeType: 'text/markdown',
      metadata: { spaceKey: 'DEV', type: 'page' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'confluence';
  }
}

// ─── YouTube Connector ───────────────────────────────────────────────────────

export class YouTubeConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.apiKey) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const channel = (options?.channelId as string) || 'UC-mDDqTyYGo1gGn1uLqyPg';
    const items: ConnectorItem[] = [
      {
        id: 'yt-1',
        title: 'Building RAG Pipelines with NVIDIA',
        content: 'Transcript: In this video we explore how to build retrieval augmented generation pipelines using NVIDIA tools and frameworks...',
        url: 'https://www.youtube.com/watch?v=mock1',
        mimeType: 'text/plain',
        metadata: { videoId: 'mock1', channel, duration: '24:35', publishedAt: '2025-11-10T18:00:00Z', viewCount: 15420 },
      },
      {
        id: 'yt-2',
        title: 'Jetson Orin Deployment Guide',
        content: 'Transcript: Today we are deploying AI models on the Jetson Orin platform. We will cover setup, optimization, and benchmarking...',
        url: 'https://www.youtube.com/watch?v=mock2',
        mimeType: 'text/plain',
        metadata: { videoId: 'mock2', channel, duration: '18:22', publishedAt: '2025-10-05T14:30:00Z', viewCount: 8930 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'Mock YouTube Video',
      content: 'Mock transcript from YouTube.',
      url: `https://www.youtube.com/watch?v=${itemId}`,
      mimeType: 'text/plain',
      metadata: { videoId: itemId, channel: 'UC-mDDqTyYGo1gGn1uLqyPg' },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'youtube';
  }
}

// ─── Web Connector ───────────────────────────────────────────────────────────

export class WebConnector implements Connector {
  private connected = false;

  async connect(config: ConnectorConfig): Promise<boolean> {
    if (!config.baseUrl) return false;
    this.connected = true;
    return true;
  }

  async fetch(options?: Record<string, unknown>): Promise<ConnectorContent> {
    const url = (options?.url as string) || 'https://example.com';
    const items: ConnectorItem[] = [
      {
        id: `web-${Buffer.from(url).toString('base64').slice(0, 12)}`,
        title: extractTitle(url),
        content: `Mock web content fetched from ${url}. This page contains informational content that has been extracted and cleaned.`,
        url,
        mimeType: 'text/html',
        metadata: { fetchedAt: new Date().toISOString(), statusCode: 200, contentType: 'text/html', size: 8400 },
      },
    ];
    return { items, totalItems: items.length, hasMore: false };
  }

  async getContent(itemId: string): Promise<ConnectorItem> {
    return {
      id: itemId,
      title: 'Mock Web Page',
      content: 'Mock content fetched from the web.',
      url: 'https://example.com',
      mimeType: 'text/html',
      metadata: { fetchedAt: new Date().toISOString() },
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getType(): ConnectorType {
    return 'web';
  }
}

// ─── Connector Manager ───────────────────────────────────────────────────────

export class ConnectorManager {
  private connectors: Map<ConnectorType, Connector> = new Map();

  constructor() {
    this.connectors.set('github', new GitHubConnector());
    this.connectors.set('gitlab', new GitLabConnector());
    this.connectors.set('bitbucket', new BitbucketConnector());
    this.connectors.set('google-drive', new GoogleDriveConnector());
    this.connectors.set('onedrive', new OneDriveConnector());
    this.connectors.set('dropbox', new DropboxConnector());
    this.connectors.set('nextcloud', new NextcloudConnector());
    this.connectors.set('sharepoint', new SharePointConnector());
    this.connectors.set('obsidian', new ObsidianConnector());
    this.connectors.set('notion', new NotionConnector());
    this.connectors.set('confluence', new ConfluenceConnector());
    this.connectors.set('youtube', new YouTubeConnector());
    this.connectors.set('web', new WebConnector());
  }

  getConnector(type: ConnectorType): Connector {
    const connector = this.connectors.get(type);
    if (!connector) {
      throw new Error(`Unsupported connector type: ${type}`);
    }
    return connector;
  }

  getSupportedTypes(): ConnectorType[] {
    return Array.from(this.connectors.keys());
  }

  async connect(type: ConnectorType, config: ConnectorConfig): Promise<boolean> {
    const connector = this.getConnector(type);
    return connector.connect(config);
  }

  async fetch(
    type: ConnectorType,
    options?: Record<string, unknown>,
  ): Promise<ConnectorContent> {
    const connector = this.getConnector(type);
    return connector.fetch(options);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractTitle(url: string): string {
  try {
    const parsed = new URL(url);
    const slug = parsed.pathname.split('/').filter(Boolean).pop() || 'homepage';
    return slug
      .replace(/[-_]/g, ' ')
      .replace(/\.\w+$/, '')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return 'Web Page';
  }
}
