/**
 * Every canvas the catalog targets, at exact export dimensions.
 *
 * `ramp` is a viewing-distance factor, not a resolution factor. Two canvases
 * with the same pixel height can need very different ramps:
 *   - thumb1280 (1280x720) is consumed at ~360px wide in a YouTube grid, so its
 *     type must be roughly 1.35x the square-post ramp to survive the shrink.
 *   - linkedinCover1128 (1128x191) is displayed near 1:1 and is only 191px tall,
 *     so anything above ~0.3 overflows the band immediately.
 *   - podcast3000 (3000x3000) is the same composition as a square post at 2.78x
 *     the pixels, so its ramp is ~2.6 — slightly under-scaled, because artwork
 *     that large is also shown as a 55px tile in a podcast app.
 */
import type { CanvasId, CanvasSpec } from './types';

export const CANVASES: Record<CanvasId, CanvasSpec> = {
  square1080: {
    id: 'square1080', label: 'Square post', w: 1080, h: 1080,
    ramp: 1, pad: 88, note: 'Instagram / LinkedIn / Facebook feed',
  },
  portrait1350: {
    id: 'portrait1350', label: 'Portrait post', w: 1080, h: 1350,
    ramp: 1, pad: 96, note: 'Instagram 4:5 — the tallest feed crop',
  },
  story1920: {
    id: 'story1920', label: 'Story', w: 1080, h: 1920,
    ramp: 1.06, pad: 96,
    // Top: account chip + progress bars. Bottom: reply box and share row.
    safe: { top: 220, bottom: 280 },
    note: 'Instagram / Facebook / LinkedIn story, 9:16',
  },
  carousel1080: {
    id: 'carousel1080', label: 'Carousel slide', w: 1080, h: 1080,
    ramp: 1, pad: 88, note: '10-slide swipe deck',
  },
  landscape1920: {
    id: 'landscape1920', label: 'Landscape', w: 1920, h: 1080,
    ramp: 1.15, pad: 120, note: 'Web hero, in-deck slide, display ad',
  },
  thumb1280: {
    id: 'thumb1280', label: 'Video thumbnail', w: 1280, h: 720,
    ramp: 1.35, pad: 64, note: 'YouTube — read at ~360px wide',
  },
  og1200: {
    id: 'og1200', label: 'Open Graph card', w: 1200, h: 630,
    ramp: 0.86, pad: 72, note: 'og:image, link preview, X summary card',
  },
  emailHeader1200: {
    id: 'emailHeader1200', label: 'Email header', w: 1200, h: 600,
    ramp: 0.8, pad: 72, note: 'Retina 600px-wide email banner',
  },
  xheader1500: {
    id: 'xheader1500', label: 'X header', w: 1500, h: 500,
    ramp: 0.62, pad: 56,
    // The avatar overlaps the lower left; the right edge crops on narrow screens.
    safe: { left: 300, bottom: 90, right: 120 },
    note: 'X / Twitter profile header',
  },
  linkedinCover1128: {
    id: 'linkedinCover1128', label: 'LinkedIn cover', w: 1128, h: 191,
    ramp: 0.28, pad: 28,
    safe: { left: 200 },
    note: 'LinkedIn company page banner — very shallow',
  },
  fbCover1640: {
    id: 'fbCover1640', label: 'Facebook cover', w: 1640, h: 624,
    ramp: 0.72, pad: 64, safe: { bottom: 120, left: 180 },
    note: 'Facebook page cover; crops hard on mobile',
  },
  ytBanner2560: {
    id: 'ytBanner2560', label: 'YouTube banner', w: 2560, h: 1440,
    ramp: 1.6, pad: 200,
    // Only the centre 1546x423 is visible on every device.
    safe: { top: 508, bottom: 509, left: 507, right: 507 },
    note: 'YouTube channel art — safe centre is 1546x423',
  },
  podcast3000: {
    id: 'podcast3000', label: 'Podcast artwork', w: 3000, h: 3000,
    ramp: 2.6, pad: 240, note: 'Apple / Spotify cover art; also shown at 55px',
  },
  avatar400: {
    id: 'avatar400', label: 'Avatar', w: 400, h: 400,
    ramp: 0.42, pad: 40, mask: 'circle', note: 'Profile picture, circular crop',
  },
};

export const CANVAS_IDS = Object.keys(CANVASES) as CanvasId[];

export function canvasOf(id: CanvasId): CanvasSpec {
  return CANVASES[id];
}

/** Padding plus platform chrome, per edge, in design px. */
export function insets(canvas: CanvasSpec): { top: number; right: number; bottom: number; left: number } {
  const s = canvas.safe ?? {};
  return {
    top: canvas.pad + (s.top ?? 0),
    right: canvas.pad + (s.right ?? 0),
    bottom: canvas.pad + (s.bottom ?? 0),
    left: canvas.pad + (s.left ?? 0),
  };
}
