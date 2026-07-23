import { useMemo } from 'react';

export type StarState =
  | 'idle' | 'listening' | 'thinking' | 'responding' | 'executing'
  | 'error' | 'alert' | 'success' | 'offline';

interface StarAvatarProps {
  state?: StarState;
  size?: number;
  className?: string;
}

const STATE_COLORS: Record<StarState, { core: string; glow: string }> = {
  idle: { core: 'rgb(var(--jarbas-400))', glow: 'rgb(var(--jarbas-600))' },
  listening: { core: 'rgb(var(--jarbas-300))', glow: 'rgb(var(--jarbas-500))' },
  thinking: { core: 'rgb(var(--jarbas-400))', glow: 'rgb(var(--jarbas-700))' },
  responding: { core: 'rgb(var(--jarbas-300))', glow: 'rgb(var(--jarbas-600))' },
  executing: { core: 'rgb(var(--jarbas-300))', glow: 'rgb(var(--jarbas-600))' },
  error: { core: 'rgb(252 211 122)', glow: 'rgb(217 119 6)' },
  alert: { core: 'rgb(252 165 165)', glow: 'rgb(220 38 38)' },
  success: { core: 'rgb(134 239 172)', glow: 'rgb(22 163 74)' },
  offline: { core: 'rgb(100 116 139)', glow: 'rgb(30 41 59)' },
};

const STATE_LABELS: Record<StarState, string> = {
  idle: 'Em espera',
  listening: 'Ouvindo',
  thinking: 'Pensando',
  responding: 'Respondendo',
  executing: 'Executando tarefa',
  error: 'Erro',
  alert: 'Alerta',
  success: 'Sucesso',
  offline: 'Offline',
};

const STAR_PATH = 'M12 1 L13.2 10.8 L23 12 L13.2 13.2 L12 23 L10.8 13.2 L1 12 L10.8 10.8 Z';

export function StarAvatar({ state = 'idle', size = 64, className = '' }: StarAvatarProps) {
  const { core, glow } = STATE_COLORS[state];

  const glowAnimation = useMemo(() => {
    if (state === 'responding') return 'animate-star-pulse';
    if (state === 'thinking' || state === 'offline') return '';
    return 'animate-star-breathe';
  }, [state]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={STATE_LABELS[state]}
      title={STATE_LABELS[state]}
    >
      <div
        className={`absolute inset-0 rounded-full ${glowAnimation}`}
        style={{
          background: `radial-gradient(circle at 35% 30%, ${core} 0%, ${glow} 55%, transparent 75%)`,
          filter: state === 'offline' ? 'saturate(0.4) brightness(0.7)' : undefined,
        }}
      />

      {state === 'listening' && [0, 0.6, 1.2].map(delay => (
        <div
          key={delay}
          className="absolute inset-0 rounded-full border-2 animate-star-ripple"
          style={{ borderColor: glow, animationDelay: `${delay}s` }}
        />
      ))}

      {state === 'thinking' && (
        <div className="absolute inset-0 animate-star-spin-slow">
          {[0, 90, 180, 270].map(angle => (
            <div
              key={angle}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: core,
                top: '50%',
                left: '50%',
                transform: `rotate(${angle}deg) translate(${size * 0.42}px) translate(-50%, -50%)`,
              }}
            />
          ))}
        </div>
      )}

      {state === 'executing' && (
        <div className="absolute inset-0 animate-star-beam-spin">
          {[0, 60, 120, 180, 240, 300].map(angle => (
            <div
              key={angle}
              className="absolute top-1/2 left-1/2 h-0.5 origin-left rounded-full"
              style={{
                width: size * 0.6,
                background: `linear-gradient(90deg, rgba(255,255,255,0.9), ${core}, transparent)`,
                transform: `rotate(${angle}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <svg
        viewBox="0 0 24 24"
        className={`relative w-[45%] h-[45%] ${state === 'responding' ? 'animate-star-pulse' : ''}`}
        style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
      >
        <path d={STAR_PATH} fill={core} />
      </svg>
    </div>
  );
}
