/**
 * DOM-snapshot rasterisation.
 *
 * Uses modern-screenshot rather than html-to-image: it is the maintained
 * rewrite with the CSS-variable and color-mix handling fixed, it honours
 * explicit width/height/scale, and `domToBlob` avoids the giant base64
 * intermediate that exhausts memory on large canvases.
 *
 * A note on "context reuse": modern-screenshot's Context is bound to a
 * specific node, and every batch job mounts a different stage, so a context
 * cannot be shared across jobs. What IS worth caching is the embedded font
 * CSS — that is the expensive part (a ~350 KB base64 payload) and it is
 * resolved once per session in ./fonts and passed to each call.
 */

import { domToBlob } from 'modern-screenshot';
import { checkBrandFonts, embeddedFontCss, loadFaces, baselineFaces, type FaceRequest } from './fonts';
import { clampScale, type ScaleClamp } from './limits';
import { FORMATS, isRaster, type RasterFormat } from './formats';

let fontCssCache: string | null = null;

/**
 * Resolve and cache the embedded font CSS, and pre-load the baseline faces.
 * Call once before a batch so the first job does not pay for it.
 */
export async function warmExportContext(): Promise<void> {
  fontCssCache = await embeddedFontCss();
  await loadFaces(baselineFaces());
}

export function releaseExportContext(): void {
  fontCssCache = null;
}

export interface RasterOptions {
  /** Design width in px — ALWAYS passed explicitly. */
  width: number;
  /** Design height in px. */
  height: number;
  format: RasterFormat;
  /** Requested multiplier; clamped to the platform canvas budget. */
  scale?: number;
  /** JPEG/WebP quality, 0-1. */
  quality?: number;
  /** Solid backdrop; required for JPEG, which has no alpha. */
  background?: string | null;
  /** Faces this specific job needs, beyond the baseline. */
  faces?: FaceRequest[];
}

export interface RasterResult {
  blob: Blob;
  width: number;
  height: number;
  clamp: ScaleClamp;
}

/**
 * Rasterise a stage node.
 *
 * The node must be the un-transformed, exactly width x height stage. We pass
 * width/height explicitly and neutralise any inherited transform, because
 * getBoundingClientRect() inside a `transform: scale()` preview wrapper
 * returns SCALED pixels — letting the library infer would silently produce a
 * 337x337 image on a phone.
 */
export async function rasterize(
  node: HTMLElement,
  opts: RasterOptions,
): Promise<RasterResult> {
  const { width, height, format } = opts;
  const spec = FORMATS[format];
  if (!isRaster(format)) throw new Error(`${format} is not a raster format`);

  const clamp = clampScale(width, height, opts.scale ?? 1);

  await loadFaces([...baselineFaces(), ...(opts.faces ?? [])]);

  // JPEG has no alpha; without a backdrop it composites onto black.
  const background =
    opts.background ?? (spec.alpha ? null : getComputedStyle(node).backgroundColor || '#FFFFFF');

  const render = () =>
    domToBlob(node, {
      width,
      height,
      scale: clamp.scale,
      type: spec.mime,
      quality: opts.quality ?? (spec.lossy ? 0.92 : undefined),
      backgroundColor: background,
      font: fontCssCache ? { cssText: fontCssCache } : undefined,
      // Keep the library's own guard in step with our clamp.
      maximumCanvasSize: Math.max(clamp.width, clamp.height),
      // Belt and braces: the stage itself is never scaled, but a caller could
      // hand us a node inside a transformed wrapper.
      style: { transform: 'none', transformOrigin: 'top left' },
      filter: (n: Node) =>
        !(n instanceof Element && n.hasAttribute('data-export-ignore')),
    });

  let blob = await render();

  // If a face was not live at paint time we just rasterised a fallback.
  // Retry once — loadFaces above will have settled it by now.
  const check = checkBrandFonts();
  if (!check.ok) {
    await loadFaces([...baselineFaces(), ...(opts.faces ?? [])]);
    const recheck = checkBrandFonts();
    if (!recheck.ok) {
      throw new Error(
        `Brand fonts did not load (${recheck.inactive.join(', ')}). Refusing to export a fallback rendering.`,
      );
    }
    blob = await render();
  }

  return { blob, width: clamp.width, height: clamp.height, clamp };
}

/** Decode a blob's true pixel dimensions — used by the fidelity smoke test. */
export async function blobDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}
