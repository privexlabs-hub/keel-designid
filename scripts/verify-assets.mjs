/**
 * Fails the build loudly if any declared asset is missing, empty, or has
 * drifted from the brand definition. Runs as `prebuild`.
 */
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const errors = [];
const checked = [];

async function needFile(rel, { minBytes = 1, magic = null } = {}) {
  const abs = path.join(ROOT, rel);
  try {
    const s = await stat(abs);
    if (s.size < minBytes) {
      errors.push(`${rel} is only ${s.size} bytes (expected >= ${minBytes})`);
      return;
    }
    if (magic) {
      const fh = await readFile(abs);
      const head = fh.subarray(0, magic.length / 2).toString('hex');
      if (head !== magic) errors.push(`${rel} has wrong magic bytes (${head} != ${magic})`);
    }
    checked.push(rel);
  } catch {
    errors.push(`MISSING ${rel}`);
  }
}

const WOFF2_MAGIC = '774f4632';

const FONTS = [
  'newsreader-var-latin.woff2',
  'newsreader-var-latin-ext.woff2',
  'hanken-grotesk-var-latin.woff2',
  'hanken-grotesk-var-latin-ext.woff2',
  'jetbrains-mono-400-latin.woff2',
  'jetbrains-mono-400-latin-ext.woff2',
  'jetbrains-mono-500-latin.woff2',
  'jetbrains-mono-500-latin-ext.woff2',
];

const LOGOS = [
  'keel-mark.svg', 'keel-mark-teal.svg', 'keel-mark-ink.svg',
  'keel-mark-cream.svg', 'keel-mark-mono.svg',
  'keel-wordmark.svg', 'keel-wordmark-cream.svg', 'keel-wordmark-ink.svg',
  'keel-lockup-horizontal.svg', 'keel-lockup-stacked.svg',
];

const FAVICONS = [
  'favicon-16.png', 'favicon-32.png', 'favicon-48.png', 'favicon.svg',
  'apple-touch-icon.png', 'icon-192.png', 'icon-512.png',
  'icon-512-maskable.png', 'safari-pinned-tab.svg',
];

async function run() {
  for (const f of FONTS) await needFile(`public/assets/fonts/${f}`, { minBytes: 2000, magic: WOFF2_MAGIC });
  await needFile('public/assets/fonts/LICENSE-OFL.txt', { minBytes: 3000 });
  for (const f of LOGOS) await needFile(`public/assets/logo/${f}`, { minBytes: 100 });
  for (const f of FAVICONS) await needFile(`public/assets/favicon/${f}`, { minBytes: 100 });
  await needFile('public/favicon.ico', { minBytes: 100 });
  await needFile('public/site.webmanifest', { minBytes: 100 });
  await needFile('src/styles/fonts.css', { minBytes: 500 });
  await needFile('src/export/fonts.embedded.ts', { minBytes: 100_000 });

  // The OFL requires the licence to ship with the fonts.
  const ofl = await readFile(path.join(ROOT, 'public/assets/fonts/LICENSE-OFL.txt'), 'utf8').catch(() => '');
  for (const fam of ['Newsreader', 'Hanken Grotesk', 'JetBrains Mono']) {
    if (!ofl.includes(fam)) errors.push(`LICENSE-OFL.txt does not cover ${fam}`);
  }

  // Logo geometry must not drift between the runtime component and the
  // generated deliverables — they are separately authored.
  const logoTsx = await readFile(path.join(ROOT, 'src/brand/Logo.tsx'), 'utf8').catch(() => '');
  const buildLogos = await readFile(path.join(ROOT, 'scripts/build-logos.mjs'), 'utf8').catch(() => '');
  for (const [label, geom] of [['hull', 'M5 5 L12 19 L19 5'], ['waterline', 'M3.5 8.5 H20.5']]) {
    if (!logoTsx.includes(geom)) errors.push(`Logo.tsx lost the ${label} path (${geom})`);
    if (!buildLogos.includes(geom)) errors.push(`build-logos.mjs lost the ${label} path (${geom})`);
  }

  // The imported palette is the brand. Drift here is a silent rebrand.
  const tokensCss = await readFile(path.join(ROOT, 'src/styles/tokens.css'), 'utf8').catch(() => '');
  const tokensTs = await readFile(path.join(ROOT, 'src/brand/tokens.ts'), 'utf8').catch(() => '');
  const CANON = {
    '--canvas': '#F1EDE4', '--surface-1': '#FCFAF5', '--surface-2': '#ECE7DB',
    '--surface-3': '#E0DACB', '--fg-1': '#232A2C', '--fg-2': '#5C605E',
    '--fg-3': '#918C80', '--action': '#1C5A64', '--action-hover': '#18505A',
    '--action-press': '#143F47', '--brand': '#2F8C57', '--info': '#2C6FB0',
    '--warn': '#B0741F', '--danger': '#BB463B',
  };
  for (const [name, hex] of Object.entries(CANON)) {
    if (!new RegExp(`${name}\\s*:\\s*${hex}`, 'i').test(tokensCss)) {
      errors.push(`tokens.css: ${name} is not ${hex}`);
    }
    if (!tokensTs.includes(hex)) errors.push(`brand/tokens.ts is missing ${hex} (${name})`);
  }

  if (errors.length) {
    console.error(`\nverify-assets FAILED (${errors.length} problem${errors.length > 1 ? 's' : ''}):`);
    for (const e of errors) console.error('  ✗ ' + e);
    console.error('\nRun `npm run assets` to regenerate.\n');
    process.exit(1);
  }
  console.log(`verify-assets: ${checked.length} assets OK, palette and logo geometry match the source.`);
}

run();
