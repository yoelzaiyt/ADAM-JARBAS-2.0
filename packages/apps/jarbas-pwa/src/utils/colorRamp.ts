export type ColorRamp = Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950', string>;

const SHADE_LIGHTNESS: Record<keyof ColorRamp, number> = {
  '50': 0.96,
  '100': 0.93,
  '200': 0.85,
  '300': 0.74,
  '400': 0.60,
  '500': 0.47,
  '600': 0.39,
  '700': 0.32,
  '800': 0.27,
  '900': 0.22,
  '950': 0.15,
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/** Gera uma rampa de 11 tons (estilo Tailwind) a partir de uma cor hex base. */
export function generateRampFromHex(hex: string): ColorRamp {
  const [r, g, b] = hexToRgb(hex);
  const [h, s] = rgbToHsl(r, g, b);
  const saturation = Math.max(s, 0.35);

  const ramp = {} as ColorRamp;
  (Object.keys(SHADE_LIGHTNESS) as (keyof ColorRamp)[]).forEach(shade => {
    const [rr, gg, bb] = hslToRgb(h, saturation, SHADE_LIGHTNESS[shade]);
    ramp[shade] = `${rr} ${gg} ${bb}`;
  });
  return ramp;
}

export const THEME_PRESETS: Record<string, ColorRamp> = {
  'athos-blue': {
    '50': '238 242 255', '100': '224 231 255', '200': '199 210 254', '300': '165 180 252',
    '400': '129 140 248', '500': '99 102 241', '600': '79 70 229', '700': '67 56 202',
    '800': '55 48 163', '900': '49 46 129', '950': '30 27 75',
  },
  'athos-green': {
    '50': '236 253 245', '100': '209 250 229', '200': '167 243 208', '300': '110 231 183',
    '400': '52 211 153', '500': '16 185 129', '600': '5 150 105', '700': '4 120 87',
    '800': '6 95 70', '900': '6 78 59', '950': '2 44 34',
  },
  purple: {
    '50': '245 243 255', '100': '237 233 254', '200': '221 214 254', '300': '196 181 253',
    '400': '167 139 250', '500': '139 92 246', '600': '124 58 237', '700': '109 40 217',
    '800': '91 33 182', '900': '76 29 149', '950': '46 16 101',
  },
  orange: {
    '50': '255 247 237', '100': '255 237 213', '200': '254 215 170', '300': '253 186 116',
    '400': '251 146 60', '500': '249 115 22', '600': '234 88 12', '700': '194 65 12',
    '800': '154 52 18', '900': '124 45 18', '950': '67 20 7',
  },
};

export type ThemePreset = keyof typeof THEME_PRESETS | 'custom';
