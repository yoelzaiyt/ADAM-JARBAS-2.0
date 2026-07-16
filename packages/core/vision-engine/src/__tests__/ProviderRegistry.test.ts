import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from '../ProviderRegistry.js';
import type { IVisionProvider, VisionCapability, VisionAnalysisRequest, VisionAnalysisResult, VisionProviderHealth } from '../interfaces.js';

class MockProvider implements IVisionProvider {
  readonly id: string;
  readonly name: string;
  readonly type = 'gpt-vision' as const;
  readonly capabilities: VisionCapability[] = ['image-analysis', 'ocr'];
  readonly isAvailable = true;
  readonly priority: number;

  constructor(id: string, priority: number) {
    this.id = id;
    this.name = `Provider ${id}`;
    this.priority = priority;
  }

  async analyzeImage(request: VisionAnalysisRequest): Promise<VisionAnalysisResult> {
    return {
      id: 'result-1',
      requestId: request.id,
      success: true,
      timestamp: new Date(),
      provider: this.id,
      latencyMs: 100,
    };
  }

  async analyzeBatch(requests: VisionAnalysisRequest[]): Promise<VisionAnalysisResult[]> {
    return requests.map(r => ({
      id: 'result-1',
      requestId: r.id,
      success: true,
      timestamp: new Date(),
      provider: this.id,
      latencyMs: 100,
    }));
  }

  async getHealth(): Promise<VisionProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 50,
      lastChecked: new Date(),
    };
  }
}

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = new ProviderRegistry();
  });

  it('creates ProviderRegistry', () => {
    expect(registry).toBeDefined();
  });

  it('registers provider', () => {
    const provider = new MockProvider('gpt', 1);
    registry.registerProvider(provider);
    expect(registry.getProvider('gpt')).toBe(provider);
  });

  it('unregisters provider', () => {
    const provider = new MockProvider('gpt', 1);
    registry.registerProvider(provider);
    expect(registry.unregisterProvider('gpt')).toBe(true);
    expect(registry.getProvider('gpt')).toBeUndefined();
  });

  it('lists providers', () => {
    const p1 = new MockProvider('gpt', 1);
    const p2 = new MockProvider('claude', 2);
    registry.registerProvider(p1);
    registry.registerProvider(p2);
    expect(registry.listProviders()).toHaveLength(2);
  });

  it('gets providers by capability', () => {
    const p1 = new MockProvider('gpt', 1);
    registry.registerProvider(p1);
    const providers = registry.getProvidersByCapability('image-analysis');
    expect(providers).toHaveLength(1);
  });

  it('selects provider', () => {
    const p1 = new MockProvider('gpt', 1);
    registry.registerProvider(p1);
    const selected = registry.selectProvider('image-analysis');
    expect(selected).toBeDefined();
  });

  it('sets default provider', () => {
    const p1 = new MockProvider('gpt', 1);
    registry.registerProvider(p1);
    registry.setDefaultProvider('gpt');
    expect(registry.getDefaultProvider()).toBe(p1);
  });

  it('throws on invalid default provider', () => {
    expect(() => registry.setDefaultProvider('invalid')).toThrow();
  });

  it('gets health', async () => {
    const p1 = new MockProvider('gpt', 1);
    registry.registerProvider(p1);
    const health = await registry.getHealth();
    expect(health).toHaveLength(1);
    expect(health[0].status).toBe('healthy');
  });
});
