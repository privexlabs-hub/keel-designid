/**
 * Typed mirror of the CSS token layer.
 *
 * Two consumers need literal values rather than `var()`:
 *  - the playbook, which generates its swatch tables from this
 *  - the SVG exporter, which cannot rely on getComputedStyle
 *
 * Keep in sync with src/styles/tokens.css and src/styles/colorways.css.
 * `npm run verify:tokens` asserts they agree.
 */

export const PALETTE = {
  canvas: '#F1EDE4',
  surface1: '#FCFAF5',
  surface2: '#ECE7DB',
  surface3: '#E0DACB',
  overlay: '#FFFFFF',
  scrim: 'rgba(38,33,24,0.34)',

  borderFaint: 'rgba(40,33,20,0.06)',
  border: 'rgba(40,33,20,0.13)',
  borderStrong: 'rgba(40,33,20,0.24)',
  focusRing: 'rgba(29,92,102,0.55)',

  fg1: '#232A2C',
  fg2: '#5C605E',
  fg3: '#918C80',

  action: '#1C5A64',
  actionHover: '#18505A',
  actionPress: '#143F47',
  actionFg: '#FCFAF5',
  actionWeak: 'rgba(28,90,100,0.10)',
  actionWeakBd: 'rgba(28,90,100,0.26)',

  brand: '#2F8C57',
  brandWeak: 'rgba(47,140,87,0.13)',
  brandWeakBd: 'rgba(47,140,87,0.28)',

  info: '#2C6FB0',
  infoWeak: 'rgba(44,111,176,0.12)',
  infoWeakBd: 'rgba(44,111,176,0.28)',

  warn: '#B0741F',
  warnWeak: 'rgba(176,116,31,0.14)',
  warnWeakBd: 'rgba(176,116,31,0.30)',

  danger: '#BB463B',
  dangerHover: '#A93B31',
  dangerWeak: 'rgba(187,70,59,0.12)',
  dangerWeakBd: 'rgba(187,70,59,0.30)',
} as const;

export const SHADOWS = {
  sm: '0 1px 2px rgba(38,33,24,0.06)',
  md: '0 6px 22px -10px rgba(38,33,24,0.20)',
  lg: '0 28px 64px -22px rgba(38,33,24,0.34)',
} as const;

export const EASING = {
  ease: 'cubic-bezier(0.22,0.61,0.36,1)',
  easeOut: 'cubic-bezier(0.16,1,0.3,1)',
} as const;

export const FONT_STACKS = {
  display: "'Newsreader', Georgia, 'Times New Roman', serif",
  ui: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

/** The three families as they are named in @font-face — no hashed aliases. */
export const FONT_FAMILIES = {
  display: 'Newsreader',
  ui: 'Hanken Grotesk',
  mono: 'JetBrains Mono',
} as const;

export type FontRole = keyof typeof FONT_FAMILIES;

export const COLORWAY_IDS = [
  'cream',
  'canvas',
  'ink',
  'teal',
  'radial',
  'mono',
  'inverted',
] as const;

export type ColorwayId = (typeof COLORWAY_IDS)[number];

export const SLOT_IDS = [
  'bg',
  'surface',
  'fg',
  'fgMuted',
  'accent',
  'accentFg',
  'line',
] as const;

export type SlotId = (typeof SLOT_IDS)[number];

export interface ColorwaySpec {
  id: ColorwayId;
  label: string;
  /** Resolved literals — what the SVG exporter stamps into the file. */
  slots: Record<SlotId, string>;
  /** Optional background image layer (radial campaign variant). */
  bgImage?: string;
  /** True when the ground is dark; drives logo variant + contrast checks. */
  dark: boolean;
}

const { surface1, surface2, canvas, fg1, fg2, action, actionFg, actionPress, actionHover, brand, border, borderStrong } =
  PALETTE;

/** Ink surface: fg-1 lifted for panel separation. */
const INK_SURFACE = '#2E3639';
/** Muted foreground on dark grounds; clears 4.5:1 against both dark surfaces. */
const DARK_MUTED = '#A9AFAC';
/** --action lightened to clear 4.5:1 on the ink ground. */
const INK_ACCENT = '#5FB3BF';
const DARK_LINE = 'rgba(252,250,245,0.16)';
const FLOOD_LINE = 'rgba(252,250,245,0.20)';
const FLOOD_MUTED = 'rgba(252,250,245,0.72)';

export const COLORWAYS: Record<ColorwayId, ColorwaySpec> = {
  cream: {
    id: 'cream',
    label: 'Cream',
    dark: false,
    slots: {
      bg: surface1, surface: surface2, fg: fg1, fgMuted: fg2,
      accent: action, accentFg: actionFg, line: border,
    },
  },
  canvas: {
    id: 'canvas',
    label: 'Canvas',
    dark: false,
    slots: {
      bg: canvas, surface: surface1, fg: fg1, fgMuted: fg2,
      accent: action, accentFg: actionFg, line: border,
    },
  },
  ink: {
    id: 'ink',
    label: 'Ink',
    dark: true,
    slots: {
      bg: fg1, surface: INK_SURFACE, fg: surface1, fgMuted: DARK_MUTED,
      accent: INK_ACCENT, accentFg: fg1, line: DARK_LINE,
    },
  },
  teal: {
    id: 'teal',
    label: 'Deep Teal',
    dark: true,
    slots: {
      bg: action, surface: actionPress, fg: actionFg, fgMuted: FLOOD_MUTED,
      accent: surface1, accentFg: action, line: FLOOD_LINE,
    },
  },
  radial: {
    id: 'radial',
    label: 'Radial',
    dark: true,
    bgImage: `radial-gradient(120% 90% at 30% 10%, ${actionHover} 0%, ${actionPress} 70%)`,
    slots: {
      bg: action, surface: actionPress, fg: actionFg, fgMuted: FLOOD_MUTED,
      accent: surface1, accentFg: action, line: FLOOD_LINE,
    },
  },
  mono: {
    id: 'mono',
    label: 'Monochrome',
    dark: false,
    slots: {
      bg: surface1, surface: surface2, fg: fg1, fgMuted: fg2,
      accent: fg1, accentFg: surface1, line: borderStrong,
    },
  },
  inverted: {
    id: 'inverted',
    label: 'Inverted',
    dark: true,
    slots: {
      bg: fg1, surface: INK_SURFACE, fg: actionFg, fgMuted: DARK_MUTED,
      accent: brand, accentFg: surface1, line: DARK_LINE,
    },
  },
};

/** Resolve a slot to a literal colour for a given colorway (SVG export path). */
export function slot(colorway: ColorwayId, id: SlotId): string {
  return COLORWAYS[colorway].slots[id];
}
