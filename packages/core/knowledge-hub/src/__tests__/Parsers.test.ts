import { describe, it, expect } from 'vitest';
import {
  ParserFactory,
  TxtParser,
  MarkdownParser,
  HtmlParser,
  CsvParser,
  JsonParser,
  XmlParser,
} from '../Parsers.js';

describe('ParserFactory', () => {
  it('should create all 10 parsers', () => {
    const factory = new ParserFactory();
    const types = factory.getSupportedTypes();
    expect(types).toHaveLength(10);
    expect(types).toContain('txt');
    expect(types).toContain('markdown');
    expect(types).toContain('html');
    expect(types).toContain('csv');
    expect(types).toContain('json');
    expect(types).toContain('xml');
    expect(types).toContain('pdf');
    expect(types).toContain('docx');
    expect(types).toContain('xlsx');
    expect(types).toContain('pptx');
  });

  it('should map extensions to parsers via getParserByFilename', () => {
    const factory = new ParserFactory();
    expect(factory.getParserByFilename('test.txt')).toBeDefined();
    expect(factory.getParserByFilename('test.md')).toBeDefined();
    expect(factory.getParserByFilename('test.markdown')).toBeDefined();
    expect(factory.getParserByFilename('test.html')).toBeDefined();
    expect(factory.getParserByFilename('test.htm')).toBeDefined();
    expect(factory.getParserByFilename('test.csv')).toBeDefined();
    expect(factory.getParserByFilename('test.json')).toBeDefined();
    expect(factory.getParserByFilename('test.xml')).toBeDefined();
    expect(factory.getParserByFilename('test.pdf')).toBeDefined();
    expect(factory.getParserByFilename('test.docx')).toBeDefined();
    expect(factory.getParserByFilename('test.xlsx')).toBeDefined();
    expect(factory.getParserByFilename('test.pptx')).toBeDefined();
  });

  it('should return undefined for unknown extension', () => {
    const factory = new ParserFactory();
    expect(factory.getParserByFilename('test.xyz')).toBeUndefined();
    expect(factory.getParserByFilename('noext')).toBeUndefined();
  });
});

describe('TxtParser', () => {
  it('should parse plain text', async () => {
    const parser = new TxtParser();
    const result = await parser.parse({ content: 'hello world' });
    expect(result.content).toBe('hello world');
    expect(result.metadata.format).toBe('txt');
    expect(result.metadata.charCount).toBe(11);
    expect(result.metadata.lineCount).toBe(1);
  });

  it('should handle errors gracefully', async () => {
    const parser = new TxtParser();
    const badInput = { content: null as unknown as string };
    const result = await parser.parse(badInput);
    expect(result.metadata.format).toBe('txt');
  });
});

describe('MarkdownParser', () => {
  it('should extract headers', async () => {
    const parser = new MarkdownParser();
    const result = await parser.parse({
      content: '# Title\nsome text\n## Subtitle\nmore text\n### Section',
    });
    expect(result.metadata.headers).toEqual(['# Title', '## Subtitle', '### Section']);
    expect(result.metadata.format).toBe('markdown');
  });

  it('should handle errors gracefully', async () => {
    const parser = new MarkdownParser();
    const badInput = { content: null as unknown as string };
    const result = await parser.parse(badInput);
    expect(result.metadata.format).toBe('markdown');
  });
});

describe('HtmlParser', () => {
  it('should strip tags and extract title', async () => {
    const parser = new HtmlParser();
    const result = await parser.parse({
      content:
        '<html><head><title>My Page</title></head><body><p>Hello <b>world</b></p></body></html>',
    });
    expect(result.metadata.title).toBe('My Page');
    expect(result.content).toContain('Hello world');
    expect(result.content).not.toContain('<');
    expect(result.metadata.format).toBe('html');
  });

  it('should handle errors gracefully', async () => {
    const parser = new HtmlParser();
    const badInput = { content: null as unknown as string };
    const result = await parser.parse(badInput);
    expect(result.metadata.format).toBe('html');
  });
});

describe('CsvParser', () => {
  it('should extract tables', async () => {
    const parser = new CsvParser();
    const result = await parser.parse({
      content: 'name,age\nAlice,30\nBob,25',
    });
    expect(result.tables).toHaveLength(1);
    expect(result.tables![0].headers).toEqual(['name', 'age']);
    expect(result.tables![0].rows).toEqual([['Alice', '30'], ['Bob', '25']]);
    expect(result.metadata.rowCount).toBe(2);
    expect(result.metadata.format).toBe('csv');
  });

  it('should handle errors gracefully', async () => {
    const parser = new CsvParser();
    const badInput = { content: null as unknown as string };
    const result = await parser.parse(badInput);
    expect(result.metadata.format).toBe('csv');
  });
});

describe('JsonParser', () => {
  it('should parse JSON object', async () => {
    const parser = new JsonParser();
    const result = await parser.parse({
      content: '{"key": "value"}',
    });
    expect(result.content).toContain('key');
    expect(result.metadata.itemCount).toBe(1);
    expect(result.metadata.format).toBe('json');
  });

  it('should parse JSON array', async () => {
    const parser = new JsonParser();
    const result = await parser.parse({
      content: '[1, 2, 3]',
    });
    expect(result.metadata.itemCount).toBe(3);
  });

  it('should handle errors gracefully', async () => {
    const parser = new JsonParser();
    const result = await parser.parse({ content: 'not json' });
    expect(result.metadata.format).toBe('json');
    expect(result.metadata.error).toBeDefined();
  });
});

describe('XmlParser', () => {
  it('should extract tags', async () => {
    const parser = new XmlParser();
    const result = await parser.parse({
      content: '<root><item>hello</item><item>world</item></root>',
    });
    expect(result.metadata.tags).toContain('root');
    expect(result.metadata.tags).toContain('item');
    expect(result.metadata.tagCount).toBeGreaterThanOrEqual(2);
    expect(result.content).toContain('hello');
    expect(result.content).not.toContain('<');
    expect(result.metadata.format).toBe('xml');
  });

  it('should handle errors gracefully', async () => {
    const parser = new XmlParser();
    const badInput = { content: null as unknown as string };
    const result = await parser.parse(badInput);
    expect(result.metadata.format).toBe('xml');
  });
});
