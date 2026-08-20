/**
 * Rasterises the logo SVGs to PNG deliverables, and builds the favicon set.
 *
 * The density trap: sharp rasterises SVG at 72 DPI by default, so a 24px
 * viewBox would render as a blurry 24px sprite no matter the resize target.
 * We compute density per output size so the vector is rasterised at or above
 * the final resolution before any scaling happens.
 */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const ROOT = path.resolve(import.meta.dirname, '..');
const LOGO = path.join(ROOT, 'public/assets/logo');
const PNG_OUT = path.join(LOGO, 'png');
const FAV_OUT = path.join(ROOT, 'public/assets/favicon');
const PUBLIC = path.join(ROOT, 'public');

const CREAM = '#F1EDE4';
const TEAL = '#1C5A64';

/** Rasterise an SVG buffer at `size`, with density high enough to stay crisp. */
async function raster(svg, size, { background, padRatio = 0 } = {}) {
  // viewBox is 24 units wide for the mark; density scales that to >= size px.
  const density = Math.min(2400, Math.ceil((size / 24) * 72 * 1.5));
  const inner = Math.round(size * (1 - padRatio * 2));

  let img = sharp(svg, { density }).resize(inner, inner, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  const pad = Math.round((size - inner) / 2);
  if (pad > 0 || background) {
    img = img.extend({
      top: pad,
      bottom: size - inner - pad,
      left: pad,
      right: size - inner - pad,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    });
  }
  if (background) img = img.flatten({ background });

  return img.png({ compressionLevel: 9 }).toBuffer();
}

/** Rasterise a non-square SVG (the wordmark lockups) to a target width. */
async function rasterWide(svgPath, width) {
  const svg = await readFile(svgPath);
  const meta = await sharp(svg).metadata();
  const density = Math.min(2400, Math.ceil((width / (meta.width || 24)) * 72 * 1.5));
  return sharp(svg, { density })
    .resize({ width, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const MARK_SIZES = [64, 128, 256, 512, 1024];
const WORDMARK_WIDTHS = [512, 1024, 2048];

async function run() {
  await mkdir(PNG_OUT, { recursive: true });
  await mkdir(FAV_OUT, { recursive: true });

  let count = 0;

  // --- mark PNGs, transparent ground, one per colour variant ---
  for (const variant of ['teal', 'ink', 'cream']) {
    const svg = await readFile(path.join(LOGO, `keel-mark-${variant}.svg`));
    for (const size of MARK_SIZES) {
      const buf = await raster(svg, size);
      await writeFile(path.join(PNG_OUT, `keel-mark-${variant}-${size}.png`), buf);
      count++;
    }
  }

  // --- wordmark PNGs ---
  for (const variant of ['teal', 'cream', 'ink'] ) {
    const file = variant === 'teal' ? 'keel-wordmark.svg' : `keel-wordmark-${variant}.svg`;
    for (const width of WORDMARK_WIDTHS) {
      const buf = await rasterWide(path.join(LOGO, file), width);
      await writeFile(path.join(PNG_OUT, `keel-wordmark-${variant}-${width}.png`), buf);
      count++;
    }
  }

  // --- favicons ---
  const markTeal = await readFile(path.join(LOGO, 'keel-mark-teal.svg'));
  const markCream = await readFile(path.join(LOGO, 'keel-mark-cream.svg'));

  // Browser tab icons: transparent, slight padding so the mark is not edge-to-edge.
  const icoBufs = [];
  for (const size of [16, 32, 48]) {
    const buf = await raster(markTeal, size, { padRatio: 0.08 });
    await writeFile(path.join(FAV_OUT, `favicon-${size}.png`), buf);
    icoBufs.push(buf);
    count++;
  }
  await writeFile(path.join(PUBLIC, 'favicon.ico'), await pngToIco(icoBufs));
  count++;

  // apple-touch-icon: iOS ignores alpha and would composite black. Solid cream.
  await writeFile(
    path.join(FAV_OUT, 'apple-touch-icon.png'),
    await raster(markTeal, 180, { background: CREAM, padRatio: 0.16 }),
  );
  count++;

  // PWA icons. The maskable variant carries a 20% safe zone so the mark
  // survives aggressive circular cropping on Android.
  await writeFile(path.join(FAV_OUT, 'icon-192.png'), await raster(markTeal, 192, { padRatio: 0.1 }));
  await writeFile(path.join(FAV_OUT, 'icon-512.png'), await raster(markTeal, 512, { padRatio: 0.1 }));
  await writeFile(
    path.join(FAV_OUT, 'icon-512-maskable.png'),
    await raster(markCream, 512, { background: TEAL, padRatio: 0.2 }),
  );
  count += 3;

  // Vector favicon + Safari pinned tab (monochrome, no fill attributes).
  await writeFile(
    path.join(FAV_OUT, 'favicon.svg'),
    (await readFile(path.join(LOGO, 'keel-mark-teal.svg'), 'utf8')),
  );
  await writeFile(
    path.join(FAV_OUT, 'safari-pinned-tab.svg'),
    (await readFile(path.join(LOGO, 'keel-mark-mono.svg'), 'utf8')).replace(/#000000/gi, 'black'),
  );
  count += 2;

  console.log(`build-pngs: wrote ${count} raster/vector assets`);
}

run().catch((err) => {
  console.error('build-pngs failed:', err.message);
  process.exit(1);
});
