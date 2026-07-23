import type { LanguageEngine as ILanguageEngine, LanguageDetection, LanguageProfile, Language } from './interfaces.js';

const LANGUAGE_WORDS: Record<Language, string[]> = {
  pt: ['o', 'a', 'de', 'que', 'em', 'um', 'uma'],
  en: ['the', 'is', 'are', 'was', 'have', 'has', 'been'],
  es: ['el', 'la', 'los', 'las', 'que', 'en', 'por'],
  fr: ['le', 'la', 'les', 'des', 'que', 'dans', 'pour'],
  it: ['il', 'la', 'che', 'di', 'in', 'per', 'con'],
  de: ['der', 'die', 'das', 'und', 'ist', 'ein', 'eine'],
  ja: [],
};

const LANGUAGE_PROFILES: Record<Language, LanguageProfile> = {
  pt: { language: 'pt', nativeName: 'Português', englishName: 'Portuguese', code: 'pt', scripts: ['Latin'], direction: 'ltr' },
  en: { language: 'en', nativeName: 'English', englishName: 'English', code: 'en', scripts: ['Latin'], direction: 'ltr' },
  es: { language: 'es', nativeName: 'Español', englishName: 'Spanish', code: 'es', scripts: ['Latin'], direction: 'ltr' },
  fr: { language: 'fr', nativeName: 'Français', englishName: 'French', code: 'fr', scripts: ['Latin'], direction: 'ltr' },
  it: { language: 'it', nativeName: 'Italiano', englishName: 'Italian', code: 'it', scripts: ['Latin'], direction: 'ltr' },
  de: { language: 'de', nativeName: 'Deutsch', englishName: 'German', code: 'de', scripts: ['Latin'], direction: 'ltr' },
  ja: { language: 'ja', nativeName: '日本語', englishName: 'Japanese', code: 'ja', scripts: ['Hiragana', 'Katakana', 'Kanji'], direction: 'ltr' },
};

const LANGUAGE_NAMES: Record<Language, Record<Language, string>> = {
  pt: { pt: 'Português', en: 'Portuguese', es: 'Portugués', fr: 'Portugais', it: 'Portoghese', de: 'Portugiesisch', ja: 'ポルトガル語' },
  en: { pt: 'Inglês', en: 'English', es: 'Inglés', fr: 'Anglais', it: 'Inglese', de: 'Englisch', ja: '英語' },
  es: { pt: 'Espanhol', en: 'Spanish', es: 'Español', fr: 'Espagnol', it: 'Spagnolo', de: 'Spanisch', ja: 'スペイン語' },
  fr: { pt: 'Francês', en: 'French', es: 'Francés', fr: 'Français', it: 'Francese', de: 'Französisch', ja: 'フランス語' },
  it: { pt: 'Italiano', en: 'Italian', es: 'Italiano', fr: 'Italien', it: 'Italiano', de: 'Italienisch', ja: 'イタリア語' },
  de: { pt: 'Alemão', en: 'German', es: 'Alemán', fr: 'Allemand', it: 'Tedesco', de: 'Deutsch', ja: 'ドイツ語' },
  ja: { pt: 'Japonês', en: 'Japanese', es: 'Japonés', fr: 'Japonais', it: 'Giapponese', de: 'Japanisch', ja: '日本語' },
};

export class LanguageEngine implements ILanguageEngine {
  constructor() {}

  async detect(text: string): Promise<LanguageDetection[]> {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    const total = words.length || 1;
    const results: LanguageDetection[] = [];

    for (const lang of Object.keys(LANGUAGE_WORDS) as Language[]) {
      if (lang === 'ja') {
        const hiragana = /[\u3040-\u309F]/.test(text);
        const katakana = /[\u30A0-\u30FF]/.test(text);
        if (hiragana || katakana) {
          results.push({ language: 'ja', confidence: 0.95 });
        }
        continue;
      }
      const matches = words.filter((w) => LANGUAGE_WORDS[lang].includes(w)).length;
      if (matches > 0) {
        results.push({ language: lang, confidence: Math.min(1, matches / total * 2) });
      }
    }

    if (results.length === 0) {
      results.push({ language: 'en', confidence: 0.3 });
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  }

  getProfile(language: Language): LanguageProfile {
    return { ...LANGUAGE_PROFILES[language] };
  }

  getSupportedLanguages(): Language[] {
    return Object.keys(LANGUAGE_PROFILES) as Language[];
  }

  isSupported(language: Language): boolean {
    return language in LANGUAGE_PROFILES;
  }

  getLanguageName(code: Language, inLanguage?: Language): string {
    const target = inLanguage ?? code;
    return LANGUAGE_NAMES[code]?.[target] ?? code;
  }
}
