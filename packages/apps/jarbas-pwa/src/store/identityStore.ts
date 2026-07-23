import { create } from 'zustand';
import { generateRampFromHex, THEME_PRESETS, type ThemePreset } from '../utils/colorRamp';

interface IdentityState {
  assistantName: string;
  theme: ThemePreset;
  customColor: string;
  setAssistantName: (name: string) => void;
  setTheme: (theme: ThemePreset, customColor?: string) => void;
}

const IDENTITY_KEY = 'jarbas_identity';

interface StoredIdentity {
  assistantName: string;
  theme: ThemePreset;
  customColor: string;
}

const DEFAULTS: StoredIdentity = {
  assistantName: 'Jarbas',
  theme: 'athos-blue',
  customColor: '#6366f1',
};

function loadIdentity(): StoredIdentity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function saveIdentity(identity: StoredIdentity) {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch { /* quota exceeded */ }
}

export function applyThemeToDocument(theme: ThemePreset, customColor: string) {
  const ramp = theme === 'custom' ? generateRampFromHex(customColor) : THEME_PRESETS[theme];
  const root = document.documentElement;
  (Object.keys(ramp) as (keyof typeof ramp)[]).forEach(shade => {
    root.style.setProperty(`--jarbas-${shade}`, ramp[shade]);
  });
}

const initial = loadIdentity();
applyThemeToDocument(initial.theme, initial.customColor);

export const useIdentityStore = create<IdentityState>((set, get) => ({
  ...initial,

  setAssistantName: (name) => {
    const assistantName = name.trim() || 'Jarbas';
    set({ assistantName });
    saveIdentity({ ...get(), assistantName });
  },

  setTheme: (theme, customColor) => {
    const nextCustomColor = customColor ?? get().customColor;
    set({ theme, customColor: nextCustomColor });
    applyThemeToDocument(theme, nextCustomColor);
    saveIdentity({ assistantName: get().assistantName, theme, customColor: nextCustomColor });
  },
}));
