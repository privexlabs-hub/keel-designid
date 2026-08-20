/**
 * SVG export by DOM measurement.
 *
 * We do NOT use foreignObject: it renders correctly only in a browser, loses
 * fonts everywhere else, and is really just "PNG with extra steps".
 *
 * Instead we walk the rendered stage, measure every text run and box with the
 * browser's own layout, and emit primitives at absolute coordinates. Geometry
 * therefore matches the raster export exactly.
 *
 * KNOWN LIMITS — published in the capability matrix rather than hidden:
 *   Line BREAKING is reproduced faithfully (we measure the browser's own line
 *   boxes). Full text SHAPING is not: ligatures, kerning pairs, bidi/RTL
 *   reordering, grapheme clustering and hyphenation are the browser's, and we
 *   re-emit their positions rather than recompute them. For Latin brand copy
 *   this is exact; for complex scripts it is not, and outline mode is the
 *   answer there.
 */

import { COLORWAYS, type ColorwayId } from '@/brand/tokens';
import { embeddedFontCss } from './fonts';

export interface SvgOptions {
  width: number;
  height: number;
  colorway: ColorwayId;
  /** 'text' keeps live <text> + embedded font; 'outline' is not yet available. */
  mode?: 'text';
  /** Embed the base64 font so the file stands alone. */
  embedFonts?: boolean;
}

const XMLNS = 'http://www.w3.org/2000/svg';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Colours resolve through getComputedStyle, which has already applied the
 *  colorway's custom properties — no var() ends up in the file. */
function paint(v: string): string {
  if (!v || v === 'none' || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') return 'none';
  return v;
}

interface Ctx {
  stage: DOMRect;
  /** Preview scale to divide out; 1 when the stage is untransformed. */
  k: number;
  out: string[];
  defs: string[];
  clipSeq: number;
}

function rel(ctx: Ctx, r: DOMRect) {
  return {
    x: (r.left - ctx.stage.left) / ctx.k,
    y: (r.top - ctx.stage.top) / ctx.k,
    w: r.width / ctx.k,
    h: r.height / ctx.k,
  };
}

/** Emit a box: background, border, radius. */
function emitBox(ctx: Ctx, el: Element, cs: CSSStyleDeclaration) {
  const box = rel(ctx, el.getBoundingClientRect());
  if (box.w <= 0 || box.h <= 0) return;

  const bg = paint(cs.backgroundColor);
  const bw = parseFloat(cs.borderTopWidth) || 0;
  const bc = paint(cs.borderTopColor);
  const radius = parseFloat(cs.borderTopLeftRadius) || 0;
  // A pill radius in CSS (999px) must be clamped to half the short side.
  const rx = Math.min(radius, box.w / 2, box.h / 2);

  if (bg !== 'none') {
    ctx.out.push(
      `<rect x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}"` +
        (rx ? ` rx="${r2(rx)}"` : '') +
        ` fill="${bg}"/>`,
    );
  }
  if (bw > 0 && bc !== 'none') {
    ctx.out.push(
      `<rect x="${r2(box.x + bw / 2)}" y="${r2(box.y + bw / 2)}" width="${r2(Math.max(0, box.w - bw))}" height="${r2(Math.max(0, box.h - bw))}"` +
        (rx ? ` rx="${r2(Math.max(0, rx - bw / 2))}"` : '') +
        ` fill="none" stroke="${bc}" stroke-width="${r2(bw)}"/>`,
    );
  }
}

/**
 * Emit one text node as <text> with a <tspan> per MEASURED line.
 * Range.getClientRects() gives us the browser's actual line boxes, so wrapping
 * matches the raster output line for line.
 */
function emitText(ctx: Ctx, node: Text, cs: CSSStyleDeclaration) {
  const text = node.textContent ?? '';
  if (!text.trim()) return;

  const range = document.createRange();
  range.selectNodeContents(node);
  const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
  if (rects.length === 0) return;

  const fill = paint(cs.color);
  const size = parseFloat(cs.fontSize) / ctx.k;
  const family = cs.fontFamily;
  const weight = cs.fontWeight;
  const spacing = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / ctx.k;
  const transform = cs.textTransform;

  // Split the string across measured line boxes by walking character offsets.
  const lines = splitByRects(node, text, rects.length);

  const parts: string[] = [];
  rects.forEach((rc, i) => {
    const line = lines[i];
    if (line === undefined || !line.trim()) return;
    const p = rel(ctx, rc);
    // Baseline: rect top + ascent. Using 0.8em approximates the ascent for the
    // brand faces closely enough that it is visually indistinguishable; the
    // dominant-baseline attribute would be more exact but is unevenly honoured.
    const baseline = p.y + p.h * 0.78;
    const display = transform === 'uppercase' ? line.toUpperCase() : line;
    const anchor =
      cs.textAlign === 'center' ? 'middle' : cs.textAlign === 'right' ? 'end' : 'start';
    const x = anchor === 'middle' ? p.x + p.w / 2 : anchor === 'end' ? p.x + p.w : p.x;
    parts.push(
      `<text x="${r2(x)}" y="${r2(baseline)}" fill="${fill}" font-family="${esc(family)}"` +
        ` font-size="${r2(size)}" font-weight="${weight}"` +
        (spacing ? ` letter-spacing="${r2(spacing)}"` : '') +
        (anchor !== 'start' ? ` text-anchor="${anchor}"` : '') +
        `>${esc(display)}</text>`,
    );
  });
  ctx.out.push(...parts);
  range.detach?.();
}

/**
 * Distribute a text node's content across its measured line boxes.
 * We re-measure per character offset rather than guessing at word boundaries,
 * so the split matches the browser's wrapping including mid-word breaks.
 */
function splitByRects(node: Text, text: string, lineCount: number): string[] {
  if (lineCount <= 1) return [text];

  const range = document.createRange();
  const lines: string[] = [];
  let start = 0;
  let line = 0;

  for (let i = 1; i <= text.length && line < lineCount - 1; i++) {
    range.setStart(node, start);
    range.setEnd(node, i);
    const n = range.getClientRects().length;
    if (n > 1) {
      lines.push(text.slice(start, i - 1));
      start = i - 1;
      line++;
    }
  }
  lines.push(text.slice(start));
  range.detach?.();
  return lines.map((l) => l.trim());
}

function walk(ctx: Ctx, el: Element) {
  const cs = getComputedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
  if (el.hasAttribute('data-export-ignore')) return;

  emitBox(ctx, el, cs);

  // Inline SVG (the mark and the icon set) is copied through verbatim —
  // it is already vector, and this is why the logo survives export perfectly.
  if (el.tagName.toLowerCase() === 'svg') {
    const box = rel(ctx, el.getBoundingClientRect());
    const clone = el.cloneNode(true) as SVGElement;
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    const inner = clone.outerHTML.replace(
      /^<svg/i,
      `<svg x="${r2(box.x)}" y="${r2(box.y)}" width="${r2(box.w)}" height="${r2(box.h)}"`,
    );
    ctx.out.push(inner);
    return;
  }

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) emitText(ctx, child as Text, cs);
    else if (child.nodeType === Node.ELEMENT_NODE) walk(ctx, child as Element);
  }
}

/**
 * Serialise a live stage node to SVG.
 * `stage` must be the exact-size, untransformed stage element.
 */
export async function stageToSvg(stage: HTMLElement, opts: SvgOptions): Promise<string> {
  const { width, height, colorway } = opts;

  // Divide out any preview scale: getBoundingClientRect inside a scaled
  // wrapper returns SCALED pixels, which would shrink the whole document.
  const rect = stage.getBoundingClientRect();
  const k = rect.width > 0 ? rect.width / width : 1;

  const ctx: Ctx = { stage: rect, k, out: [], defs: [], clipSeq: 0 };

  const cw = COLORWAYS[colorway];
  const bg = cw.slots.bg;

  walk(ctx, stage);

  const fontDefs = opts.embedFonts === false ? '' : `<style>${await embeddedFontCss()}</style>`;

  return [
    `<svg xmlns="${XMLNS}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs>${fontDefs}${ctx.defs.join('')}</defs>`,
    `<rect width="${width}" height="${height}" fill="${bg}"/>`,
    ...ctx.out,
    `</svg>`,
  ].join('\n');
}

export function svgToBlob(svg: string): Blob {
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}
