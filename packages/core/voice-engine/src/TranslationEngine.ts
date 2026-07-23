import type { TranslationEngine as ITranslationEngine, TranslationConfig, TranslationResult, Language, LanguagePair } from './interfaces.js';

const ALL_LANGUAGES: Language[] = ['pt', 'en', 'es', 'fr', 'it', 'de', 'ja'];

export class TranslationEngine implements ITranslationEngine {
  constructor() {}

  async translate(text: string, config: TranslationConfig): Promise<TranslationResult> {
    return {
      translated: `[translated to ${config.targetLanguage}] ${text}`,
      source: text,
      sourceLanguage: config.sourceLanguage,
      targetLanguage: config.targetLanguage,
      confidence: 0.85,
      latencyMs: 10,
    };
  }

  async translateBatch(texts: string[], config: TranslationConfig): Promise<TranslationResult[]> {
    return texts.map((text) => ({
      translated: `[translated to ${config.targetLanguage}] ${text}`,
      source: text,
      sourceLanguage: config.sourceLanguage,
      targetLanguage: config.targetLanguage,
      confidence: 0.85,
      latencyMs: 10,
    }));
  }

  getSupportedPairs(): LanguagePair[] {
    const pairs: LanguagePair[] = [];
    for (const source of ALL_LANGUAGES) {
      for (const target of ALL_LANGUAGES) {
        if (source !== target) {
          pairs.push({ source, target });
        }
      }
    }
    return pairs;
  }
}
