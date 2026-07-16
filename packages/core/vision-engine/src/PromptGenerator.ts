// ─── Prompt Generator ────────────────────────────────────────────────────────
// Generate prompts for vision analysis

import type {
  VisionPrompt,
  PromptTemplate,
  VisionAnalysisType,
} from './interfaces.js';

export class PromptGenerator {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    this.registerTemplate({
      id: 'describe',
      name: 'Image Description',
      description: 'Generate a detailed description of an image',
      systemPrompt: 'You are an AI assistant that analyzes images. Provide detailed, accurate descriptions.',
      userTemplate: 'Describe this image in detail. Include objects, colors, composition, and any text visible.',
      analysisTypes: ['describe'],
    });

    this.registerTemplate({
      id: 'ocr',
      name: 'Text Extraction',
      description: 'Extract all text from an image',
      systemPrompt: 'You are an OCR assistant. Extract all visible text accurately.',
      userTemplate: 'Extract all text from this image. Preserve the original formatting and structure.',
      analysisTypes: ['ocr'],
    });

    this.registerTemplate({
      id: 'objects',
      name: 'Object Detection',
      description: 'Identify and locate objects in an image',
      systemPrompt: 'You are an object detection assistant. Identify all objects and their locations.',
      userTemplate: 'List all objects visible in this image. For each object, provide its name, location, and confidence.',
      analysisTypes: ['objects'],
    });

    this.registerTemplate({
      id: 'faces',
      name: 'Face Analysis',
      description: 'Detect and analyze faces',
      systemPrompt: 'You are a face analysis assistant. Detect faces and analyze attributes.',
      userTemplate: 'Detect all faces in this image. For each face, describe visible attributes like glasses, expressions, etc.',
      analysisTypes: ['faces'],
    });

    this.registerTemplate({
      id: 'scene',
      name: 'Scene Understanding',
      description: 'Understand the overall scene context',
      systemPrompt: 'You are a scene understanding assistant. Analyze the context and setting.',
      userTemplate: 'Analyze this scene. What is happening? What is the setting? Are there any risks or notable elements?',
      analysisTypes: ['scene'],
    });

    this.registerTemplate({
      id: 'document',
      name: 'Document Analysis',
      description: 'Analyze document structure and content',
      systemPrompt: 'You are a document analysis assistant. Extract structure and key information.',
      userTemplate: 'Analyze this document. Identify the type, structure, key points, and any important entities.',
      analysisTypes: ['document'],
    });

    this.registerTemplate({
      id: 'diagram',
      name: 'Diagram Analysis',
      description: 'Interpret diagrams and generate documentation',
      systemPrompt: 'You are a diagram analysis assistant. Interpret the diagram and generate documentation.',
      userTemplate: 'Analyze this diagram. Identify all elements, connections, and generate documentation.',
      analysisTypes: ['diagram'],
    });

    this.registerTemplate({
      id: 'architecture',
      name: 'Architecture Analysis',
      description: 'Analyze architectural plans',
      systemPrompt: 'You are an architecture analysis assistant. Analyze floor plans and architectural drawings.',
      userTemplate: 'Analyze this architectural plan. Identify rooms, features, measurements, and provide recommendations.',
      analysisTypes: ['architecture'],
    });

    this.registerTemplate({
      id: 'screenshot',
      name: 'Screenshot Analysis',
      description: 'Analyze screenshots and UI',
      systemPrompt: 'You are a screenshot analysis assistant. Identify UI elements and provide insights.',
      userTemplate: 'Analyze this screenshot. Identify the platform, UI components, and any messages or errors.',
      analysisTypes: ['screenshot'],
    });

    this.registerTemplate({
      id: 'security',
      name: 'Security Analysis',
      description: 'Check for security issues and PII',
      systemPrompt: 'You are a security analysis assistant. Check for PII, content warnings, and security issues.',
      userTemplate: 'Analyze this image for security concerns. Check for PII, inappropriate content, or security risks.',
      analysisTypes: ['security'],
    });
  }

  registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByAnalysisType(type: VisionAnalysisType): PromptTemplate[] {
    return this.listTemplates().filter(t => t.analysisTypes.includes(type));
  }

  generatePrompt(
    templateId: string,
    imageData: string,
    context?: string
  ): VisionPrompt {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    let userPrompt = template.userTemplate;
    if (context) {
      userPrompt += `\n\nAdditional context: ${context}`;
    }

    return {
      system: template.systemPrompt,
      user: userPrompt,
      images: [{ data: imageData, mimeType: 'image/jpeg' }],
    };
  }

  generateCustomPrompt(
    systemPrompt: string,
    userPrompt: string,
    imageData: string
  ): VisionPrompt {
    return {
      system: systemPrompt,
      user: userPrompt,
      images: [{ data: imageData, mimeType: 'image/jpeg' }],
    };
  }

  combinePrompts(prompts: VisionPrompt[]): VisionPrompt {
    return {
      system: prompts.map(p => p.system).join('\n\n'),
      user: prompts.map(p => p.user).join('\n\n'),
      images: prompts.flatMap(p => p.images),
    };
  }
}
