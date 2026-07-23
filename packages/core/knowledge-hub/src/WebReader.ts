import type { WebReader as IWebReader, WebReaderConfig, WebContent } from './interfaces.js';

export class WebReader implements IWebReader {
  async fetch(url: string, config?: WebReaderConfig): Promise<WebContent> {
    const title = extractTitleFromUrl(url);
    return {
      url,
      title,
      content: `Mock web page content fetched from ${url}. ` +
        `This is simulated content representing the text extracted from the HTML page body.`,
      markdown: `# ${title}\n\nMock markdown content extracted from ${url}.\n\n` +
        `This content has been converted from HTML to markdown format.`,
      links: [
        `${url}/about`,
        `${url}/contact`,
        `${url}/docs`,
      ],
      metadata: {
        contentType: 'text/html',
        statusCode: 200,
        size: 12_340,
        loadTimeMs: 245,
        userAgent: config?.userAgent ?? 'Mozilla/5.0 KnowledgeHub/1.0',
      },
      fetchedAt: new Date(),
    };
  }

  async crawl(startUrl: string, config?: WebReaderConfig): Promise<WebContent[]> {
    const mainPage = await this.fetch(startUrl, config);
    return [mainPage];
  }

  async getSitemap(url: string): Promise<string[]> {
    const parsed = new URL(url);
    const base = `${parsed.protocol}//${parsed.host}`;
    return [
      `${base}/`,
      `${base}/about`,
      `${base}/docs`,
      `${base}/docs/getting-started`,
      `${base}/docs/api`,
      `${base}/blog`,
      `${base}/contact`,
    ];
  }

  async extractContent(html: string): Promise<string> {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const slug = parsed.pathname.split('/').filter(Boolean).pop();
    if (slug) {
      return slug
        .replace(/[-_]/g, ' ')
        .replace(/\.\w+$/, '')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return parsed.host.replace(/^www\./, '').split('.')[0]
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return 'Web Page';
  }
}
