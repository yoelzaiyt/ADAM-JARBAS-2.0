import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useIdentityStore } from '../store/identityStore';
import { StarAvatar, type StarState } from '../components/StarAvatar';
import type { ThemePreset } from '../utils/colorRamp';

interface IdentityPageProps {
  onClose: () => void;
}

const THEME_OPTIONS: { id: ThemePreset; label: string; swatch: string }[] = [
  { id: 'athos-blue', label: 'ATHOS Blue', swatch: '#6366f1' },
  { id: 'athos-green', label: 'ATHOS Green', swatch: '#10b981' },
  { id: 'purple', label: 'Purple', swatch: '#8b5cf6' },
  { id: 'orange', label: 'Orange', swatch: '#f97316' },
  { id: 'custom', label: 'Personalizado', swatch: '' },
];

const PREVIEW_STATES: StarState[] = [
  'idle', 'listening', 'thinking', 'responding', 'executing', 'success', 'alert', 'error', 'offline',
];

export function IdentityPage({ onClose }: IdentityPageProps) {
  const { assistantName, theme, customColor, setAssistantName, setTheme } = useIdentityStore();
  const [name, setName] = useState(assistantName);
  const [previewState, setPreviewState] = useState<StarState>('idle');

  const handleNameBlur = () => {
    setAssistantName(name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950 flex flex-col safe-top safe-bottom">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-dark-700/50 shrink-0">
        <h1 className="text-lg font-bold flex-1">Identidade</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-6 pt-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <StarAvatar state={previewState} size={96} />
          <div className="flex flex-wrap justify-center gap-1.5">
            {PREVIEW_STATES.map(s => (
              <button
                key={s}
                onClick={() => setPreviewState(s)}
                className={`
                  px-2.5 py-1 rounded-full text-xs transition-all
                  ${previewState === s ? 'bg-jarbas-600 text-white' : 'bg-dark-800 text-dark-400 hover:text-white'}
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-2 block">
            Nome do assistente
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="Jarbas"
            className="input-field"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-2 block">
            Tema de cor
          </label>
          <div className="grid grid-cols-2 gap-2">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id, opt.id === 'custom' ? customColor : undefined)}
                className={`
                  flex items-center gap-2.5 p-3 rounded-xl border transition-all
                  ${theme === opt.id ? 'border-jarbas-500 bg-jarbas-600/10' : 'border-dark-700/50 hover:bg-dark-800'}
                `}
              >
                {opt.id === 'custom' ? (
                  <input
                    type="color"
                    value={customColor}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setTheme('custom', e.target.value)}
                    className="w-6 h-6 rounded-full overflow-hidden border-0 bg-transparent shrink-0 cursor-pointer"
                  />
                ) : (
                  <span
                    className="w-6 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: opt.swatch }}
                  />
                )}
                <span className="text-sm flex-1 text-left">{opt.label}</span>
                {theme === opt.id && <Check size={16} className="text-jarbas-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
