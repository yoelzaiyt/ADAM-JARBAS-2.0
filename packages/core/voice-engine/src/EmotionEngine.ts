import type {
  EmotionEngine as IEmotionEngine,
  EmotionDetection,
  EmotionProfile,
  VoiceEmotion,
  AudioBuffer,
} from './interfaces.js';

const EMOTION_KEYWORDS: Record<VoiceEmotion, string[]> = {
  happy: ['happy', 'joy', 'great', 'glad', 'pleased', 'wonderful'],
  sad: ['sad', 'unhappy', 'depressed', 'down', 'melancholy', 'gloomy'],
  angry: ['angry', 'furious', 'mad', 'outraged', 'livid', 'irate'],
  anxious: ['worried', 'anxious', 'nervous', 'uneasy', 'stressed', 'tense'],
  doubtful: ['maybe', 'perhaps', 'not sure', 'unsure', 'uncertain', 'hesitant'],
  enthusiastic: ['amazing', 'exciting', 'wow', 'fantastic', 'incredible', 'brilliant'],
  tired: ['tired', 'exhausted', 'sleepy', 'drained', 'worn out', 'fatigued'],
  confident: ['confident', 'sure', 'absolutely', 'certain', 'definitely', 'positive'],
  neutral: [],
  urgent: ['urgent', 'hurry', 'quick', 'asap', 'immediately', 'now'],
  frustrated: ['frustrated', 'annoyed', 'irritated', 'bothered', 'agitated'],
  calm: ['calm', 'relaxed', 'peaceful', 'serene', 'tranquil', 'composed'],
};

const EMOTION_VALENCE: Record<VoiceEmotion, number> = {
  happy: 0.8,
  sad: -0.7,
  angry: -0.8,
  anxious: -0.5,
  doubtful: -0.1,
  enthusiastic: 0.9,
  tired: -0.3,
  confident: 0.6,
  neutral: 0.0,
  urgent: -0.2,
  frustrated: -0.6,
  calm: 0.4,
};

const EMOTION_AROUSAL: Record<VoiceEmotion, number> = {
  happy: 0.7,
  sad: 0.2,
  angry: 0.9,
  anxious: 0.7,
  doubtful: 0.3,
  enthusiastic: 0.9,
  tired: 0.1,
  confident: 0.6,
  neutral: 0.3,
  urgent: 0.8,
  frustrated: 0.7,
  calm: 0.2,
};

const EMOTION_DESCRIPTIONS: Record<VoiceEmotion, string> = {
  happy: 'Feliz / Alegre',
  sad: 'Triste',
  angry: 'Bravo / Irritado',
  anxious: 'Ansioso / Preocupado',
  doubtful: 'Duvidoso / Incerto',
  enthusiastic: 'Entusiasmado / Animado',
  tired: 'Cansado / Sonolento',
  confident: 'Confidente / Seguro',
  neutral: 'Neutro / Calmo',
  urgent: 'Urgente / Pressa',
  frustrated: 'Frustrado / Irritado',
  calm: 'Calmo / Sereno',
};

export class EmotionEngine implements IEmotionEngine {
  async detect(text: string, audio?: AudioBuffer): Promise<EmotionDetection[]> {
    const lower = text.toLowerCase();
    const results: EmotionDetection[] = [];

    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS) as [string, string[]][]) {
      if (emotion === 'neutral') continue;
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          results.push({
            emotion: emotion as VoiceEmotion,
            confidence: 0.7 + Math.random() * 0.3,
            valence: EMOTION_VALENCE[emotion as VoiceEmotion],
            arousal: EMOTION_AROUSAL[emotion as VoiceEmotion],
          });
          break;
        }
      }
    }

    if (results.length === 0) {
      results.push({
        emotion: 'neutral',
        confidence: 0.8,
        valence: 0.0,
        arousal: 0.3,
      });
    }

    return results;
  }

  async getProfile(text: string): Promise<EmotionProfile> {
    const detections = await this.detect(text);
    const dominant = detections.reduce((best, curr) =>
      curr.confidence > best.confidence ? curr : best,
    );
    const mood = this.getMoodString(dominant.emotion);
    const energy = dominant.arousal;

    return {
      dominant: dominant.emotion,
      emotions: detections,
      mood,
      energy,
    };
  }

  adaptResponse(text: string, emotion: VoiceEmotion): string {
    switch (emotion) {
      case 'sad':
        return `Entendo como você se sente. ${text}`;
      case 'angry':
        return `Compreendo sua frustração. ${text}`;
      case 'anxious':
        return `Não se preocupe, vou ajudar. ${text}`;
      case 'enthusiastic':
        return `Que ótimo! ${text}`;
      case 'confident':
        return `Com certeza! ${text}`;
      case 'tired':
        return `Sem pressa, quando estiver pronto. ${text}`;
      case 'doubtful':
        return `Vou esclarecer para você. ${text}`;
      default:
        return text;
    }
  }

  getEmotions(): VoiceEmotion[] {
    return Object.keys(EMOTION_KEYWORDS) as VoiceEmotion[];
  }

  getEmotionDescription(emotion: VoiceEmotion): string {
    return EMOTION_DESCRIPTIONS[emotion] ?? 'Desconhecido';
  }

  private getMoodString(emotion: VoiceEmotion): string {
    switch (emotion) {
      case 'happy': return 'feliz e positivo';
      case 'sad': return 'triste e para baixo';
      case 'angry': return 'irritado e agitado';
      case 'anxious': return 'preocupado e tenso';
      case 'doubtful': return 'hesitante e incerto';
      case 'enthusiastic': return 'animado e empolgado';
      case 'tired': return 'cansado e sem energia';
      case 'confident': return 'seguro e determinado';
      case 'urgent': return 'pressa e urgência';
      case 'frustrated': return 'frustrado e irritado';
      case 'calm': return 'calmo e sereno';
      default: return 'neutro';
    }
  }
}
