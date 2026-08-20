/**
 * Empirically verifies which characters the bundled fonts can actually render,
 * by reading the cmap out of the woff2 binaries. This is the evidence behind
 * scripts/lint-glyphs.mjs — the CSS unicode-range is a hint, the cmap is truth.
 */
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(import.meta.dirname, '..');
const FONT_DIR = path.join(ROOT, 'public/assets/fonts');

const PROBE = [
  ['→', 'U+2192 rightwards arrow'],
  ['←', 'U+2190 leftwards arrow'],
  ['↑', 'U+2191 upwards arrow'],
  ['↓', 'U+2193 downwards arrow'],
  ['✓', 'U+2713 check mark'],
  ['—', 'U+2014 em dash'],
  ['–', 'U+2013 en dash'],
  ['·', 'U+00B7 middle dot'],
  ['×', 'U+00D7 multiplication'],
  ['•', 'U+2022 bullet'],
  ['“', 'U+201C left double quote'],
  ['’', 'U+2019 right single quote'],
  ['−', 'U+2212 minus'],
  ['%', 'U+0025 percent'],
];

async function run() {
  let wawoff;
  try {
    wawoff = require('wawoff2');
  } catch {
    console.log('check-subsets: wawoff2 not installed; skipping (informational script).');
    return;
  }
  const opentype = require('opentype.js');
  const files = (await readdir(FONT_DIR)).filter((f) => f.endsWith('.woff2') && f.includes('latin.'));

  for (const f of files) {
    const woff2 = await readFile(path.join(FONT_DIR, f));
    const ttf = Buffer.from(await wawoff.decompress(woff2));
    const font = opentype.parse(
      ttf.buffer.slice(ttf.byteOffset, ttf.byteOffset + ttf.byteLength),
    );
    const missing = PROBE.filter(([ch]) => {
      const g = font.charToGlyph(ch);
      return !g || g.index === 0;
    });
    console.log(`\n${f}`);
    if (missing.length === 0) {
      console.log('  all probed characters present');
    } else {
      for (const [ch, name] of missing) console.log(`  MISSING ${ch}  ${name}`);
    }
  }
}

run().catch((e) => { console.error(e.message); process.exit(1); });
