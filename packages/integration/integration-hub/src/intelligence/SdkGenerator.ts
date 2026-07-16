import type { SdkConfig, GeneratedSdk, SdkFile } from '../interfaces.js';
import type { ApiEndpoint } from '../interfaces.js';
import { createLogger } from '../Logger.js';

const log = createLogger({ module: 'SdkGenerator' });

export class SdkGenerator {
  generate(api: ApiEndpoint, config: SdkConfig): GeneratedSdk {
    log.info(`Generating SDK for ${api.name} in ${config.language}`);

    switch (config.language) {
      case 'typescript':
        return this.generateTypeScript(api, config);
      case 'python':
        return this.generatePython(api, config);
      case 'go':
        return this.generateGo(api, config);
      case 'java':
        return this.generateJava(api, config);
      case 'csharp':
        return this.generateCSharp(api, config);
      default:
        throw new Error(`Unsupported language: ${config.language}`);
    }
  }

  private generateTypeScript(api: ApiEndpoint, config: SdkConfig): GeneratedSdk {
    const files: SdkFile[] = [];

    files.push({
      name: 'client.ts',
      path: 'src/client.ts',
      content: this.generateTypeScriptClient(api),
    });

    if (config.options.includeTypes) {
      files.push({
        name: 'types.ts',
        path: 'src/types.ts',
        content: this.generateTypeScriptTypes(api),
      });
    }

    if (config.options.includeTests) {
      files.push({
        name: 'client.test.ts',
        path: 'src/__tests__/client.test.ts',
        content: this.generateTypeScriptTests(api),
      });
    }

    files.push({
      name: 'index.ts',
      path: 'src/index.ts',
      content: this.generateTypeScriptIndex(api),
    });

    return {
      language: 'typescript',
      apiId: api.id,
      files,
      generatedAt: new Date(),
      version: '1.0.0',
    };
  }

  private generateTypeScriptClient(api: ApiEndpoint): string {
    return `import type { ApiResponse } from './types.js';

export class ${this.getClassName(api.name)}Client {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: { baseUrl: string; apiKey: string }) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${this.apiKey}\`,
    };

    try {
      const response = await fetch(\`\${this.baseUrl}\${path}\`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json() as T;
      return {
        success: response.ok,
        data,
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        latency: Date.now() - startTime,
        cached: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        statusCode: 0,
        headers: {},
        latency: Date.now() - startTime,
        cached: false,
      };
    }
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path);
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body);
  }

  async put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }
}
`;
  }

  private generateTypeScriptTypes(api: ApiEndpoint): string {
    return `export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  headers: Record<string, string>;
  latency: number;
  cached: boolean;
}

export interface ${this.getClassName(api.name)}Config {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
}
`;
  }

  private generateTypeScriptTests(api: ApiEndpoint): string {
    return `import { describe, it, expect } from 'vitest';
import { ${this.getClassName(api.name)}Client } from '../client.js';

describe('${this.getClassName(api.name)}Client', () => {
  it('should create client with config', () => {
    const client = new ${this.getClassName(api.name)}Client({
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
    });
    expect(client).toBeDefined();
  });
});
`;
  }

  private generateTypeScriptIndex(api: ApiEndpoint): string {
    return `export { ${this.getClassName(api.name)}Client } from './client.js';
export type { ApiResponse, ${this.getClassName(api.name)}Config } from './types.js';
`;
  }

  private generatePython(api: ApiEndpoint, config: SdkConfig): GeneratedSdk {
    const files: SdkFile[] = [];

    files.push({
      name: 'client.py',
      path: `${this.getPythonModuleName(api.name)}/client.py`,
      content: this.generatePythonClient(api),
    });

    files.push({
      name: '__init__.py',
      path: `${this.getPythonModuleName(api.name)}/__init__.py`,
      content: `from .client import ${this.getClassName(api.name)}Client\n`,
    });

    return {
      language: 'python',
      apiId: api.id,
      files,
      generatedAt: new Date(),
      version: '1.0.0',
    };
  }

  private generatePythonClient(api: ApiEndpoint): string {
    return `import requests
from typing import Any, Optional

class ${this.getClassName(api.name)}Client:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        })

    def get(self, path: str) -> dict[str, Any]:
        response = self.session.get(f'{self.base_url}{path}')
        response.raise_for_status()
        return response.json()

    def post(self, path: str, data: Optional[dict] = None) -> dict[str, Any]:
        response = self.session.post(f'{self.base_url}{path}', json=data)
        response.raise_for_status()
        return response.json()

    def put(self, path: str, data: Optional[dict] = None) -> dict[str, Any]:
        response = self.session.put(f'{self.base_url}{path}', json=data)
        response.raise_for_status()
        return response.json()

    def delete(self, path: str) -> dict[str, Any]:
        response = self.session.delete(f'{self.base_url}{path}')
        response.raise_for_status()
        return response.json()
`;
  }

  private generateGo(api: ApiEndpoint, config: SdkConfig): GeneratedSdk {
    const files: SdkFile[] = [];
    const moduleName = this.getGoModuleName(api.name);

    files.push({
      name: 'client.go',
      path: `${moduleName}/client.go`,
      content: this.generateGoClient(api),
    });

    return {
      language: 'go',
      apiId: api.id,
      files,
      generatedAt: new Date(),
      version: '1.0.0',
    };
  }

  private generateGoClient(api: ApiEndpoint): string {
    return `package ${this.getGoModuleName(api.name)}

import (
\t"fmt"
\t"io"
\t"net/http"
)

type Client struct {
\tBaseURL    string
\tAPIKey     string
\tHTTPClient *http.Client
}

func NewClient(baseURL, apiKey string) *Client {
\treturn &Client{
\t\tBaseURL:    baseURL,
\t\tAPIKey:     apiKey,
\t\tHTTPClient: &http.Client{},
\t}
}

func (c *Client) DoRequest(method, path string, body io.Reader) (*http.Response, error) {
\treq, err := http.NewRequest(method, c.BaseURL+path, body)
\tif err != nil {
\t\treturn nil, fmt.Errorf("creating request: %w", err)
\t}
\treq.Header.Set("Authorization", "Bearer "+c.APIKey)
\treq.Header.Set("Content-Type", "application/json")
\treturn c.HTTPClient.Do(req)
}
`;
  }

  private generateJava(api: ApiEndpoint, config: SdkConfig): GeneratedSdk {
    const files: SdkFile[] = [];
    const className = this.getClassName(api.name);

    files.push({
      name: `${className}Client.java`,
      path: `src/main/java/com/jarbas/${className.toLowerCase()}/${className}Client.java`,
      content: this.generateJavaClient(api),
    });

    return {
      language: 'java',
      apiId: api.id,
      files,
      generatedAt: new Date(),
      version: '1.0.0',
    };
  }

  private generateJavaClient(api: ApiEndpoint): string {
    const className = this.getClassName(api.name);
    return `package com.jarbas.${className.toLowerCase()};

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ${className}Client {
    private final String baseUrl;
    private final String apiKey;
    private final HttpClient httpClient;

    public ${className}Client(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newHttpClient();
    }

    public String get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(java.net.URI.create(baseUrl + path))
            .header("Authorization", "Bearer " + apiKey)
            .GET()
            .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
`;
  }

  private generateCSharp(api: ApiEndpoint, config: SdkConfig): GeneratedSdk {
    const files: SdkFile[] = [];
    const className = this.getClassName(api.name);

    files.push({
      name: `${className}Client.cs`,
      path: `${className}Client.cs`,
      content: this.generateCSharpClient(api),
    });

    return {
      language: 'csharp',
      apiId: api.id,
      files,
      generatedAt: new Date(),
      version: '1.0.0',
    };
  }

  private generateCSharpClient(api: ApiEndpoint): string {
    const className = this.getClassName(api.name);
    return `using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Jarbas.${className}
{
    public class ${className}Client
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public ${className}Client(string baseUrl, string apiKey)
        {
            _baseUrl = baseUrl;
            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
        }

        public async Task<string> GetAsync(string path)
        {
            var response = await _httpClient.GetAsync($"{_baseUrl}{path}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
    }
}
`;
  }

  private getClassName(apiName: string): string {
    return apiName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private getPythonModuleName(apiName: string): string {
    return apiName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  private getGoModuleName(apiName: string): string {
    return apiName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/^[0-9]/, '_$&');
  }
}
