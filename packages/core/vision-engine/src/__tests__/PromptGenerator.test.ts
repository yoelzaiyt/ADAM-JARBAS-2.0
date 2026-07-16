import { describe, it, expect, beforeEach } from 'vitest';
import { PromptGenerator } from '../PromptGenerator.js';

describe('PromptGenerator', () => {
  let generator: PromptGenerator;

  beforeEach(() => {
    generator = new PromptGenerator();
  });

  it('creates PromptGenerator', () => {
    expect(generator).toBeDefined();
  });

  it('registers template', () => {
    generator.registerTemplate({
      id: 'custom',
      name: 'Custom',
      description: 'Custom template',
      systemPrompt: 'You are a custom assistant.',
      userTemplate: 'Analyze this.',
      analysisTypes: ['describe'],
    });
    expect(generator.getTemplate('custom')).toBeDefined();
  });

  it('lists templates', () => {
    const templates = generator.listTemplates();
    expect(templates.length).toBeGreaterThan(0);
  });

  it('gets templates by analysis type', () => {
    const templates = generator.getTemplatesByAnalysisType('ocr');
    expect(templates.length).toBeGreaterThan(0);
  });

  it('generates prompt', () => {
    const prompt = generator.generatePrompt('describe', 'base64image');
    expect(prompt.system).toBeDefined();
    expect(prompt.user).toBeDefined();
    expect(prompt.images).toHaveLength(1);
  });

  it('generates custom prompt', () => {
    const prompt = generator.generateCustomPrompt(
      'System prompt',
      'User prompt',
      'image'
    );
    expect(prompt.system).toBe('System prompt');
    expect(prompt.user).toBe('User prompt');
  });

  it('throws for invalid template', () => {
    expect(() => generator.generatePrompt('invalid', 'image')).toThrow();
  });
});
