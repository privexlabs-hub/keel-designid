/**
 * Font readiness for the export pipeline.
 *
 * Why this exists: `document.fonts.ready` resolves without loading faces that
 * no currently-rendered node uses. In batch export the stage mounts after any
 * such check, so a naive `await document.fonts.ready` lets a job rasterise
 * with a fallback face. The result is a handful of silently-wrong images out
 * of 130 — the worst kind of bug, because nothing throws.
 *
 * So: load the concrete faces a job needs, then verify by measurement.
 */

import { FONT_FAMILIES, type FontRole } from '@/brand/tokens';

/** A concrete face to load, expressed the way document.fonts.load() wants. */
export interface FaceRequest {
  family: string;
  weight: number;
  /** px — only affects the load() shorthand, not which file is fetched. */
  size: number;
}

export function faceSpec({ family, weight, size }: FaceRequest): string {
  return `${weight} ${size}px "${family}"`;
}

/** The faces every export needs at minimum. */
export function baselineFaces(): FaceRequest[] {
  return [
    { family: FONT_FAMILIES.display, weight: 600, size: 84 },
    { family: FONT_FAMILIES.display, weight: 500, size: 40 },
    { family: FONT_FAMILIES.ui, weight: 400, size: 28 },
    { family: FONT_FAMILIES.ui, weight: 600, size: 28 },
    { family: FONT_FAMILIES.mono, weight: 400, size: 16 },
    { family: FONT_FAMILIES.mono, weight: 500, size: 16 },
  ];
}

export function faceFor(role: FontRole, weight: number, size: number): FaceRequest {
  return { family: FONT_FAMILIES[role], weight, size };
}

/**
 * Load the given faces and wait for the font set to settle.
 * Individual failures are tolerated — the width check below is the real gate.
 */
export async function loadFaces(faces: FaceRequest[]): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  await Promise.all(
    faces.map((f) => document.fonts.load(faceSpec(f)).catch(() => undefined)),
  );
  await document.fonts.ready;
}

/** Measure a probe string in a family, via canvas — no layout, no reflow. */
function measure(family: string, weight: number, size: number, text: string): number {
  const canvas = measure.canvas ?? (measure.canvas = document.createElement('canvas'));
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = `${weight} ${size}px "${family}", monospace`;
  return ctx.measureText(text).width;
}
measure.canvas = undefined as HTMLCanvasElement | undefined;

const PROBE = 'Conformance 0123456789';

/**
 * Verify a family is actually rendering, by comparing its measured width
 * against a deliberately-wrong fallback stack. If the two agree the webfont
 * did not load and we are about to rasterise the fallback.
 */
export function isFamilyActive(family: string, weight = 400, size = 48): boolean {
  if (typeof document === 'undefined') return true;
  const withFont = measure(family, weight, size, PROBE);
  const canvas = measure.canvas!;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${weight} ${size}px monospace`;
  const fallback = ctx.measureText(PROBE).width;
  if (withFont === 0) return false;
  // A real face virtually never matches monospace metrics exactly.
  return Math.abs(withFont - fallback) > 0.5;
}

export interface FontCheck {
  ok: boolean;
  inactive: string[];
}

/** Check every brand family is live. Callers should retry once, then fail the job. */
export function checkBrandFonts(): FontCheck {
  const inactive = Object.values(FONT_FAMILIES).filter((f) => !isFamilyActive(f));
  return { ok: inactive.length === 0, inactive };
}

/**
 * The embedded (base64) @font-face CSS, loaded lazily so its ~350 KB payload
 * never reaches the app bundle. Cached after first use.
 */
let embeddedCss: string | null = null;
export async function embeddedFontCss(): Promise<string> {
  if (embeddedCss !== null) return embeddedCss;
  const mod = await import('./fonts.embedded');
  embeddedCss = mod.EMBEDDED_FONT_CSS;
  return embeddedCss;
}
