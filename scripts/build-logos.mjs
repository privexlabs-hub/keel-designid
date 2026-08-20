/**
 * Generates the downloadable logo SVG deliverables from the single geometry
 * definition. Runtime rendering uses src/brand/Logo.tsx; these files exist so
 * the playbook has something to hand people.
 *
 * The wordmark lockups convert "Keel" to OUTLINES via opentype.js so the files
 * render identically without Newsreader installed.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { optimize } from 'svgo';
import opentype from 'opentype.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public/assets/logo');

// Kept in sync with src/brand/Logo.tsx — asserted by verify-assets.mjs.
const HULL = 'M5 5 L12 19 L19 5';
const WATERLINE = 'M3.5 8.5 H20.5';
const SW = 1.9;

const COLORS = {
  teal: '#1C5A64',
  ink: '#232A2C',
  cream: '#FCFAF5',
  mono: '#000000',
};

function markSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="${HULL}" stroke="${color}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${WATERLINE}" stroke="${color}" stroke-width="${SW}" stroke-linecap="round"/>
</svg>`;
}

/** currentColor variant — the source of truth for embedding. */
function markSvgCurrent() {
  return markSvg('currentColor');
}

async function loadDisplayFont() {
  // opentype.js cannot parse woff2, so the wordmark outlines come from the
  // upstream TTF. Fetched on demand and not committed to the runtime bundle.
  const url =
    'https://github.com/google/fonts/raw/main/ofl/newsreader/Newsreader%5Bopsz%2Cwght%5D.ttf';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch Newsreader TTF: HTTP ${res.status}`);
  return opentype.parse(await res.arrayBuffer());
}

function lockupSvg({ font, color, stacked }) {
  const fontSize = 21;
  const markSize = 24;
  const gap = stacked ? 8 : 11;

  // getPath positions glyphs on a baseline; Newsreader cap-height lands the
  // wordmark optically centred against the 24px mark at y = 17.
  const wordPath = font.getPath('Keel', 0, 0, fontSize);
  wordPath.unitsPerEm = font.unitsPerEm;
  const bbox = wordPath.getBoundingBox();
  const wordW = bbox.x2 - bbox.x1;
  const wordH = bbox.y2 - bbox.y1;

  const width = stacked ? Math.max(markSize, wordW) : markSize + gap + wordW;
  const height = stacked ? markSize + gap + wordH : markSize;

  const markX = stacked ? (width - markSize) / 2 : 0;
  const wordX = stacked ? (width - wordW) / 2 - bbox.x1 : markSize + gap - bbox.x1;
  const wordY = stacked ? markSize + gap - bbox.y1 : (markSize - wordH) / 2 - bbox.y1;

  const d = font.getPath('Keel', wordX, wordY, fontSize).toPathData(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}" fill="none">
  <g transform="translate(${round(markX)} 0)">
    <path d="${HULL}" stroke="${color}" stroke-width="${SW}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${WATERLINE}" stroke="${color}" stroke-width="${SW}" stroke-linecap="round"/>
  </g>
  <path d="${d}" fill="${color}"/>
</svg>`;
}

const round = (n) => Math.round(n * 100) / 100;

function opt(svg) {
  return optimize(svg, {
    multipass: true,
    // svgo v4: removeViewBox is no longer part of preset-default, so it is
    // simply not enabled. Listing it here would warn.
    plugins: ['preset-default'],
  }).data;
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const written = [];

  const write = async (name, svg) => {
    await writeFile(path.join(OUT, name), opt(svg), 'utf8');
    written.push(name);
  };

  await write('keel-mark.svg', markSvgCurrent());
  for (const [name, hex] of Object.entries(COLORS)) {
    await write(`keel-mark-${name}.svg`, markSvg(hex));
  }

  const font = await loadDisplayFont();
  await write('keel-wordmark.svg', lockupSvg({ font, color: COLORS.teal, stacked: false }));
  await write('keel-wordmark-cream.svg', lockupSvg({ font, color: COLORS.cream, stacked: false }));
  await write('keel-wordmark-ink.svg', lockupSvg({ font, color: COLORS.ink, stacked: false }));
  await write('keel-lockup-horizontal.svg', lockupSvg({ font, color: COLORS.teal, stacked: false }));
  await write('keel-lockup-stacked.svg', lockupSvg({ font, color: COLORS.teal, stacked: true }));

  console.log(`build-logos: wrote ${written.length} files`);
  written.forEach((w) => console.log('  ' + w));
}

run().catch((err) => {
  console.error('build-logos failed:', err.message);
  process.exit(1);
});
