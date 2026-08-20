/**
 * ONE type ramp, in design px, defined for a 1080x1080 square post and scaled
 * per canvas by `CanvasSpec.ramp`.
 *
 * The alternative — a ramp per canvas, or per-canvas block variants — was
 * rejected: 130 templates times 14 canvases is not authorable. A template says
 * `ctx.t.h1` and gets a size that is already correct for the canvas it is being
 * rendered on, because the only thing that varies is a single multiplier.
 *
 * Sizes are rounded to whole px. Sub-pixel type sizes rasterise inconsistently
 * between the DOM snapshot and the SVG measurement pass.
 */
import type { CanvasSpec, TypeRamp } from './types';

/** Base ramp at ramp = 1 (the 1080x1080 square post). */
export const BASE_RAMP: TypeRamp = {
  display: 132,
  h1: 96,
  h2: 68,
  h3: 50,
  subhead: 40,
  lead: 34,
  body: 28,
  small: 22,
  micro: 18,
  eyebrow: 20,
  stat: 220,
  statSmall: 96,
  quote: 56,
  unit: 24,
};

const KEYS = Object.keys(BASE_RAMP) as (keyof TypeRamp)[];

/** Scale the base ramp for a canvas. Pure; safe to call per render. */
export function rampFor(canvas: Pick<CanvasSpec, 'ramp'>): TypeRamp {
  const out = {} as TypeRamp;
  for (const k of KEYS) out[k] = Math.round(BASE_RAMP[k] * canvas.ramp);
  return out;
}

/** Line heights are ratios, not px, so they need no scaling. */
export const LEADING = {
  tight: 1.02,
  display: 1.06,
  heading: 1.12,
  subhead: 1.22,
  body: 1.42,
  loose: 1.55,
} as const;

export const TRACKING = {
  display: -0.02,
  heading: -0.015,
  body: 0,
  eyebrow: 0.14,
  caps: 0.09,
} as const;
