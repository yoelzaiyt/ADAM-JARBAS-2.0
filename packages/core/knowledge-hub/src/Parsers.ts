import type { Parser, ParserResult, ParseInput, ParserType, TableData, ImageData } from './interfaces.js';

function toBuffer(input: ParseInput): Buffer {
  return typeof input.content === 'string' ? Buffer.from(input.content) : input.content;
}

function toString(input: ParseInput): string {
  return typeof input.content === 'string' ? input.content : toBuffer(input).toString('utf-8');
}

// ─── TxtParser ────────────────────────────────────────────────────────────────

export class TxtParser implements Parser {
  readonly supportedTypes: ParserType[] = ['txt'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const content = toString(input);
      return {
        content,
        metadata: {
          format: 'txt',
          charCount: content.length,
          lineCount: content.split(/\r?\n/).length,
        },
      };
    } catch (error) {
      return { content: '', metadata: { format: 'txt', error: String(error) } };
    }
  }
}

// ─── MarkdownParser ───────────────────────────────────────────────────────────

export class MarkdownParser implements Parser {
  readonly supportedTypes: ParserType[] = ['markdown'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const content = toString(input);
      const headers: string[] = [];
      for (const line of content.split(/\r?\n/)) {
        const match = line.match(/^(#{1,6})\s+(.+)/);
        if (match) headers.push(line);
      }
      return {
        content,
        metadata: { format: 'markdown', headers },
      };
    } catch (error) {
      return { content: '', metadata: { format: 'markdown', error: String(error) } };
    }
  }
}

// ─── HtmlParser ───────────────────────────────────────────────────────────────

export class HtmlParser implements Parser {
  readonly supportedTypes: ParserType[] = ['html'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const raw = toString(input);
      const titleMatch = raw.match(/<title[^>]*>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : undefined;
      const descMatch = raw.match(/<meta\s[^>]*name\s*=\s*["']description["'][^>]*content\s*=\s*["']([^"']*)["']/i);
      const description = descMatch ? descMatch[1].trim() : undefined;
      const content = raw
        .replace(/<style[^>]*>[^<]*<\/style>/gi, '')
        .replace(/<script[^>]*>[^<]*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n/g, '\n')
        .trim();
      return {
        content,
        metadata: { format: 'html', title, description },
      };
    } catch (error) {
      return { content: '', metadata: { format: 'html', error: String(error) } };
    }
  }
}

// ─── CsvParser ────────────────────────────────────────────────────────────────

export class CsvParser implements Parser {
  readonly supportedTypes: ParserType[] = ['csv'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const raw = toString(input).trim();
      const lines = raw.split(/\r?\n/);
      if (lines.length === 0) {
        return { content: '', metadata: { format: 'csv', rowCount: 0 } };
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const rows: string[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) rows.push(line.split(',').map(c => c.trim()));
      }
      const content = rows.map(r => r.join(' | ')).join('\n');
      const tables: TableData[] = [{ headers, rows }];
      return {
        content,
        metadata: { format: 'csv', headers, rowCount: rows.length },
        tables,
      };
    } catch (error) {
      return { content: '', metadata: { format: 'csv', error: String(error) } };
    }
  }
}

// ─── JsonParser ───────────────────────────────────────────────────────────────

export class JsonParser implements Parser {
  readonly supportedTypes: ParserType[] = ['json'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const raw = toString(input);
      const parsed = JSON.parse(raw);
      let content: string;
      let itemCount: number;
      if (Array.isArray(parsed)) {
        itemCount = parsed.length;
        content = parsed.map(item => JSON.stringify(item, null, 2)).join('\n');
      } else {
        itemCount = 1;
        content = JSON.stringify(parsed, null, 2);
      }
      return {
        content,
        metadata: { format: 'json', itemCount },
      };
    } catch (error) {
      return { content: '', metadata: { format: 'json', error: String(error) } };
    }
  }
}

// ─── XmlParser ────────────────────────────────────────────────────────────────

export class XmlParser implements Parser {
  readonly supportedTypes: ParserType[] = ['xml'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const raw = toString(input);
      const tagRegex = /<\/?([a-zA-Z0-9:_-]+)[^>]*>/g;
      const tags = new Set<string>();
      let match: RegExpExecArray | null;
      while ((match = tagRegex.exec(raw)) !== null) {
        tags.add(match[1]);
      }
      const content = raw
        .replace(/<[^>]+>/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      return {
        content,
        metadata: { format: 'xml', tagCount: tags.size, tags: Array.from(tags) },
      };
    } catch (error) {
      return { content: '', metadata: { format: 'xml', error: String(error) } };
    }
  }
}

// ─── PdfParser ────────────────────────────────────────────────────────────────

export class PdfParser implements Parser {
  readonly supportedTypes: ParserType[] = ['pdf'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const buf = toBuffer(input);
      const raw = buf.toString('latin1');
      const texts: string[] = [];
      const streamRegex = /stream\s(.+?)\s*endstream/gs;
      let m: RegExpExecArray | null;
      while ((m = streamRegex.exec(raw)) !== null) {
        texts.push(m[1].trim());
      }
      const content = texts.length > 0
        ? texts.join('\n').replace(/[^a-zA-Z0-9\s.,;:!?()\-]/g, ' ').replace(/\s+/g, ' ').trim()
        : '';
      return {
        content,
        metadata: {
          format: 'pdf',
          note: 'Basic extraction - full parsing requires pdf-lib',
          extractedStreams: texts.length,
        },
      };
    } catch (error) {
      return {
        content: '',
        metadata: { format: 'pdf', note: 'Basic extraction - full parsing requires pdf-lib', error: String(error) },
      };
    }
  }
}

// ─── DocxParser ───────────────────────────────────────────────────────────────

export class DocxParser implements Parser {
  readonly supportedTypes: ParserType[] = ['docx'];

  async parse(input: ParseInput): Promise<ParserResult> {
    try {
      const buf = toBuffer(input);
      const raw = buf.toString('latin1');
      const texts: string[] = [];
      const tagRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let m: RegExpExecArray | null;
      while ((m = tagRegex.exec(raw)) !== null) {
        texts.push(m[1]);
      }
      const content = texts.join(' ').replace(/\s+/g, ' ').trim();
      return {
        content,
        metadata: {
          format: 'docx',
          note: 'Basic extraction - full parsing requires mammoth',
          extractedParagraphs: texts.length,
        },
      };
    } catch (error) {
      return {
        content: '',
        metadata: { format: 'docx', note: 'Basic extraction - full parsing requires mammoth', error: String(error) },
      };
    }
  }
}

// ─── XlsxParser ───────────────────────────────────────────────────────────────

export class XlsxParser implements Parser {
  readonly supportedTypes: ParserType[] = ['xlsx'];

  async parse(input: ParseInput): Promise<ParserResult> {
    return {
      content: '',
      metadata: {
        format: 'xlsx',
        note: 'Basic extraction - full parsing requires xlsx library',
      },
    };
  }
}

// ─── PptxParser ───────────────────────────────────────────────────────────────

export class PptxParser implements Parser {
  readonly supportedTypes: ParserType[] = ['pptx'];

  async parse(input: ParseInput): Promise<ParserResult> {
    return {
      content: '',
      metadata: {
        format: 'pptx',
        note: 'Basic extraction - full parsing requires pptx library',
      },
    };
  }
}

// ─── Extension to type map ────────────────────────────────────────────────────

const extensionMap: Record<string, ParserType> = {
  '.txt': 'txt',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.html': 'html',
  '.htm': 'html',
  '.csv': 'csv',
  '.json': 'json',
  '.xml': 'xml',
  '.pdf': 'pdf',
  '.docx': 'docx',
  '.xlsx': 'xlsx',
  '.pptx': 'pptx',
};

function extensionToType(ext: string): ParserType | null {
  return extensionMap[ext.toLowerCase()] ?? null;
}

function filenameToType(filename: string): ParserType | null {
  const dot = filename.lastIndexOf('.');
  if (dot === -1) return null;
  return extensionToType(filename.slice(dot));
}

// ─── ParserFactory ────────────────────────────────────────────────────────────

export class ParserFactory {
  private parsers: Map<ParserType, Parser> = new Map();

  constructor() {
    this.parsers.set('txt', new TxtParser());
    this.parsers.set('markdown', new MarkdownParser());
    this.parsers.set('html', new HtmlParser());
    this.parsers.set('csv', new CsvParser());
    this.parsers.set('json', new JsonParser());
    this.parsers.set('xml', new XmlParser());
    this.parsers.set('pdf', new PdfParser());
    this.parsers.set('docx', new DocxParser());
    this.parsers.set('xlsx', new XlsxParser());
    this.parsers.set('pptx', new PptxParser());
  }

  getParser(type: ParserType): Parser | undefined {
    return this.parsers.get(type);
  }

  getParserByFilename(filename: string): Parser | undefined {
    const type = filenameToType(filename);
    return type ? this.parsers.get(type) : undefined;
  }

  getSupportedTypes(): ParserType[] {
    return Array.from(this.parsers.keys());
  }

  async parse(input: ParseInput, type: ParserType): Promise<ParserResult> {
    const parser = this.parsers.get(type);
    if (!parser) {
      return {
        content: '',
        metadata: { format: type, error: `No parser registered for type: ${type}` },
      };
    }
    return parser.parse(input);
  }
}
