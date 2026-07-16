import { describe, it, expect, beforeEach } from 'vitest';
import { SdkGenerator } from '../intelligence/SdkGenerator.js';
import type { ApiEndpoint } from '../interfaces.js';

describe('SdkGenerator', () => {
  let generator: SdkGenerator;
  let mockApi: ApiEndpoint;

  beforeEach(() => {
    generator = new SdkGenerator();
    mockApi = {
      id: 'test-api',
      name: 'Test API',
      description: 'A test API',
      baseUrl: 'https://api.test.com',
      documentation: 'https://docs.test.com',
      category: 'ai-ml',
      auth: 'apiKey',
      https: 'yes',
      cors: 'yes',
      priority: 'essential',
      status: 'active',
      tags: ['test'],
      alternatives: [],
      relatedApis: [],
      lastVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  it('should generate TypeScript SDK', () => {
    const sdk = generator.generate(mockApi, {
      language: 'typescript',
      apiId: mockApi.id,
      options: { includeTypes: true, includeTests: true, includeExamples: false },
    });

    expect(sdk.language).toBe('typescript');
    expect(sdk.files.length).toBeGreaterThan(0);
    expect(sdk.files.some(f => f.name === 'client.ts')).toBe(true);
    expect(sdk.files.some(f => f.name === 'types.ts')).toBe(true);
  });

  it('should generate Python SDK', () => {
    const sdk = generator.generate(mockApi, {
      language: 'python',
      apiId: mockApi.id,
      options: { includeTypes: false, includeTests: false, includeExamples: false },
    });

    expect(sdk.language).toBe('python');
    expect(sdk.files.length).toBeGreaterThan(0);
    expect(sdk.files.some(f => f.name === 'client.py')).toBe(true);
  });

  it('should generate Go SDK', () => {
    const sdk = generator.generate(mockApi, {
      language: 'go',
      apiId: mockApi.id,
      options: { includeTypes: false, includeTests: false, includeExamples: false },
    });

    expect(sdk.language).toBe('go');
    expect(sdk.files.length).toBeGreaterThan(0);
    expect(sdk.files.some(f => f.name === 'client.go')).toBe(true);
  });

  it('should generate Java SDK', () => {
    const sdk = generator.generate(mockApi, {
      language: 'java',
      apiId: mockApi.id,
      options: { includeTypes: false, includeTests: false, includeExamples: false },
    });

    expect(sdk.language).toBe('java');
    expect(sdk.files.length).toBeGreaterThan(0);
  });

  it('should generate C# SDK', () => {
    const sdk = generator.generate(mockApi, {
      language: 'csharp',
      apiId: mockApi.id,
      options: { includeTypes: false, includeTests: false, includeExamples: false },
    });

    expect(sdk.language).toBe('csharp');
    expect(sdk.files.length).toBeGreaterThan(0);
  });

  it('should include version and timestamp', () => {
    const sdk = generator.generate(mockApi, {
      language: 'typescript',
      apiId: mockApi.id,
      options: { includeTypes: false, includeTests: false, includeExamples: false },
    });

    expect(sdk.version).toBe('1.0.0');
    expect(sdk.generatedAt).toBeInstanceOf(Date);
  });
});
