/**
 * Canvas area limits.
 *
 * Safari enforces a hard canvas area cap (~16.7M px) and, past it, returns a
 * BLANK canvas rather than throwing. A 3000x3000 podcast cover at 3x is
 * 81M px — it would export as an empty image with no error anywhere.
 *
 * We feature-probe rather than sniff the user agent, then clamp the export
 * scale so the job degrades to a smaller multiplier instead of failing silently.
 */

/** Conservative caps in pixels of area. */
const SAFARI_MAX_AREA = 16_000_000;
const DEFAULT_MAX_AREA = 40_000_000;

let probed: number | null = null;

/**
 * Determine the usable canvas area by drawing at a large size and reading a
 * pixel back. A capped implementation yields a transparent/blank readback.
 */
export function maxCanvasArea(): number {
  if (probed !== null) return probed;
  if (typeof document === 'undefined') return DEFAULT_MAX_AREA;

  try {
    const side = 4096; // 16.7M px — right at the Safari ceiling
    const c = document.createElement('canvas');
    c.width = side;
    c.height = side;
    const ctx = c.getContext('2d');
    if (!ctx) return (probed = SAFARI_MAX_AREA);

    ctx.fillStyle = '#ff0000';
    ctx.fillRect(side - 2, side - 2, 2, 2);
    const data = ctx.getImageData(side - 1, side - 1, 1, 1).data;
    // If the far corner did not take the fill, the surface is capped below this.
    probed = data[0] === 255 ? DEFAULT_MAX_AREA : SAFARI_MAX_AREA;
  } catch {
    probed = SAFARI_MAX_AREA;
  }
  return probed;
}

export interface ScaleClamp {
  /** The scale actually usable. */
  scale: number;
  /** The scale that was asked for. */
  requested: number;
  /** True when we had to reduce it. */
  clamped: boolean;
  /** Final pixel dimensions at the clamped scale. */
  width: number;
  height: number;
  reason?: string;
}

/**
 * Clamp an export scale so w*h*scale^2 stays within the platform's canvas
 * budget. Never returns below 1 — a 1x export of even the largest canvas is
 * within every implementation's limit.
 */
export function clampScale(w: number, h: number, requested: number): ScaleClamp {
  const budget = maxCanvasArea();
  const area = w * h;
  let scale = requested;

  if (area * scale * scale > budget) {
    scale = Math.max(1, Math.floor(Math.sqrt(budget / area) * 100) / 100);
  }

  const clamped = scale < requested;
  return {
    scale,
    requested,
    clamped,
    width: Math.round(w * scale),
    height: Math.round(h * scale),
    reason: clamped
      ? `${w}x${h} at ${requested}x exceeds this browser's canvas limit; reduced to ${scale}x.`
      : undefined,
  };
}

/** Rough decoded-bytes estimate (RGBA) for a job, for the size warning. */
export function estimateBytes(w: number, h: number, scale: number): number {
  return Math.round(w * scale * h * scale * 4);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}
