/**
 * A small WCAG 2.1 contrast calculator, used to measure the palette rather
 * than assert things about it.
 *
 * Several brand tokens are translucent (`--border`, `--action-weak`, the dark
 * colorway lines). A ratio for a translucent colour is only meaningful once it
 * has been composited over the ground it actually sits on, so `ratio()` does
 * that compositing before measuring.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const HEX3 = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const HEX6 = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const RGB_FN = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i;

/** Parse `#rgb`, `#rrggbb`, `rgb()` or `rgba()`. Throws on anything else. */
export function parseColor(input: string): Rgba {
  const value = input.trim();

  const short = HEX3.exec(value);
  if (short) {
    const [, r, g, b] = short;
    return { r: parseInt(r + r, 16), g: parseInt(g + g, 16), b: parseInt(b + b, 16), a: 1 };
  }

  const long = HEX6.exec(value);
  if (long) {
    return {
      r: parseInt(long[1], 16),
      g: parseInt(long[2], 16),
      b: parseInt(long[3], 16),
      a: 1,
    };
  }

  const fn = RGB_FN.exec(value);
  if (fn) {
    return {
      r: Number(fn[1]),
      g: Number(fn[2]),
      b: Number(fn[3]),
      a: fn[4] === undefined ? 1 : Number(fn[4]),
    };
  }

  throw new Error(`contrast: cannot parse colour "${input}"`);
}

/** Source-over compositing of `fg` onto an opaque `bg`. */
export function composite(fg: Rgba, bg: Rgba): Rgba {
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1,
  };
}

/**
 * Composite a translucent colour onto an opaque background and return the flat
 * result as an `rgb()` string — so a tinted ground can be both measured and
 * rendered as the single colour the eye actually receives.
 */
export function flatten(color: string, background: string): string {
  const bg = parseColor(background);
  if (bg.a < 1) throw new Error('flatten: background must be opaque');
  const c = composite(parseColor(color), bg);
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance. Assumes an opaque colour. */
export function luminance(c: Rgba): number {
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/**
 * Contrast ratio between a foreground and a background, 1–21.
 * A translucent foreground is composited onto the background first.
 */
export function ratio(foreground: string, background: string): number {
  const bg = parseColor(background);
  if (bg.a < 1) throw new Error('contrast: background must be opaque');
  const fg = composite(parseColor(foreground), bg);
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Two decimal places, the convention used when reporting WCAG ratios. */
export function formatRatio(value: number): string {
  return `${value.toFixed(2)}:1`;
}

export type TextSize = 'normal' | 'large';

/** WCAG 2.1 thresholds. "Large" is 18.66px bold or 24px regular and up. */
export const THRESHOLD = {
  normal: { AA: 4.5, AAA: 7 },
  large: { AA: 3, AAA: 4.5 },
  /** 1.4.11 non-text contrast: UI component boundaries and graphics. */
  nonText: { AA: 3 },
} as const;

export type Grade = 'AAA' | 'AA' | 'AA Large' | 'Fail';

export function grade(value: number, size: TextSize = 'normal'): Grade {
  if (value >= THRESHOLD[size].AAA) return 'AAA';
  if (value >= THRESHOLD[size].AA) return 'AA';
  if (value >= THRESHOLD.large.AA) return 'AA Large';
  return 'Fail';
}

export interface Pair {
  /** What the pair is for, in the reader's terms. */
  use: string;
  fgName: string;
  fg: string;
  bgName: string;
  bg: string;
  /** Non-text pairs are graded against 1.4.11 (3:1) rather than 1.4.3. */
  kind?: 'text' | 'large-text' | 'non-text';
  /** Written where a pair fails, to say where it may still be used. */
  note?: string;
}

export interface MeasuredPair extends Pair {
  value: number;
  formatted: string;
  grade: Grade;
  passes: boolean;
}

export function measure(pair: Pair): MeasuredPair {
  const value = ratio(pair.fg, pair.bg);
  const kind = pair.kind ?? 'text';
  const g = grade(value, kind === 'large-text' ? 'large' : 'normal');
  const passes =
    kind === 'non-text' ? value >= THRESHOLD.nonText.AA : g === 'AA' || g === 'AAA';
  return { ...pair, value, formatted: formatRatio(value), grade: g, passes };
}

export function measureAll(pairs: readonly Pair[]): MeasuredPair[] {
  return pairs.map(measure);
}
