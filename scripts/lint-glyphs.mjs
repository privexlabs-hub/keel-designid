/**
 * Guards against characters the bundled font subsets cannot render.
 *
 * Verified against the actual font cmaps (not just the declared CSS
 * unicode-range, which over-promises): the bundled subsets have no arrows
 * (U+2190-2193) and no check mark (U+2713). A missing glyph does not throw — the
 * browser silently substitutes from a system font, which then rasterises into
 * exports as a mismatched shape. Use the ChevronRight / arrow / check ICONS
 * instead. Verified by scripts/check-subsets.mjs.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');

/** char -> suggested replacement */
const BANNED = {
  '→': 'the `chevronRight` icon (or "->" is still wrong; use the icon)',
  '←': 'a mirrored `chevronRight` icon',
  '✓': 'the `clipCheck` / `shield` icon',
  '✔': 'the `clipCheck` / `shield` icon',
  '➜': 'the `chevronRight` icon',
  '↑': 'the `arrowUp` icon',
  '↓': 'the `arrowDown` icon',
};

/**
 * HTML/JSX entities that RESOLVE to a banned glyph. These are easy to reach for
 * and just as broken — the browser renders the same missing character.
 */
const BANNED_ENTITIES = {
  '&rarr;': 'the `chevronRight` icon',
  '&larr;': 'a mirrored `chevronRight` icon',
  '&uarr;': 'the `arrowUp` icon',
  '&darr;': 'the `arrowDown` icon',
  '&check;': 'the `clipCheck` icon',
  '&#8594;': 'the `chevronRight` icon',
  '&#8592;': 'a mirrored `chevronRight` icon',
  '&#8593;': 'the `arrowUp` icon',
  '&#8595;': 'the `arrowDown` icon',
  '&#10003;': 'the `clipCheck` icon',
  '\\u2192': 'the `chevronRight` icon',
  '\\u2190': 'a mirrored `chevronRight` icon',
  '\\u2191': 'the `arrowUp` icon',
  '\\u2193': 'the `arrowDown` icon',
  '\\u2713': 'the `clipCheck` icon',
};

const EXT = new Set(['.ts', '.tsx', '.css', '.mdx', '.md', '.json']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      yield* walk(p);
    } else if (EXT.has(path.extname(entry.name))) {
      yield p;
    }
  }
}

const hits = [];

for await (const file of walk(SRC)) {
  // The lint rule and its own docs necessarily name the characters.
  if (path.basename(file) === 'icons.tsx') continue;
  const text = await readFile(file, 'utf8');
  text.split('\n').forEach((line, i) => {
    for (const [ch, fix] of Object.entries(BANNED)) {
      if (line.includes(ch)) {
        hits.push(`${path.relative(ROOT, file)}:${i + 1}  ${JSON.stringify(ch)} — use ${fix}`);
      }
    }
    for (const [entity, fix] of Object.entries(BANNED_ENTITIES)) {
      if (line.toLowerCase().includes(entity.toLowerCase())) {
        hits.push(`${path.relative(ROOT, file)}:${i + 1}  ${entity} — use ${fix}`);
      }
    }
  });
}

if (hits.length) {
  console.error(`\nlint-glyphs FAILED — ${hits.length} unrenderable character(s):`);
  hits.forEach((h) => console.error('  ✗ ' + h));
  console.error('\nThese glyphs are absent from the bundled font subsets and will\nsilently fall back to a system font in exported images.\n');
  process.exit(1);
}
console.log('lint-glyphs: no unrenderable characters.');
