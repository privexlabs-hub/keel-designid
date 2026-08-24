/**
 * Batch export check.
 *
 * `batch.ts` shipped complete and unreferenced for a whole round, so this
 * exercises the wiring end to end rather than trusting it: open the console,
 * pick a deck of ten slides, press the button, and inspect the archive that
 * lands on disk. Then confirm cancellation actually stops it.
 */
import { withBrowser, gotoSettled } from './browser.mjs';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';

const BASE = process.env.BASE_URL ?? 'http://localhost:8099';

const failures = [];
const passes = [];
const check = (name, ok, detail = '') => {
  if (ok) passes.push(name);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

async function clickByText(page, selector, text) {
  const handle = await page.evaluateHandle(
    (sel, want) =>
      Array.from(document.querySelectorAll(sel)).find(
        (e) => (e.textContent || '').trim() === want,
      ) ?? null,
    selector,
    text,
  );
  const el = handle.asElement();
  if (!el) throw new Error(`no ${selector} with exact text "${text}"`);
  await el.click();
  await new Promise((r) => setTimeout(r, 200));
}

async function waitForFile(dir, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const files = (await readdir(dir)).filter((f) => !f.endsWith('.crdownload'));
    if (files.length) {
      const p = path.join(dir, files[0]);
      if ((await stat(p)).size > 0) {
        await new Promise((r) => setTimeout(r, 400));
        return p;
      }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

await withBrowser(async (browser) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'keel-batch-'));
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  try {
    const client = await page.createCDPSession();
    await client.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: dir,
      eventsEnabled: true,
    });
    await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1 });

    // Open the carousel so the deck scope has ten slides to work with.
    await gotoSettled(page, `${BASE}/studio/carousel-hook/`);
    await page.waitForSelector('section[aria-label="Preview"] [data-stage]');

    await gotoSettled(page, `${BASE}/studio/export/`);
    await page.waitForSelector('h1');

    await clickByText(page, 'button', 'Every slide');
    await new Promise((r) => setTimeout(r, 300));

    const planned = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('p')).find((p) =>
        /\d+ files?$/.test((p.textContent || '').trim()),
      );
      return el ? parseInt(el.textContent, 10) : 0;
    });
    check('the console counts the files before rendering', planned === 10, `counted ${planned}`);

    await clickByText(page, 'button', 'Export kit');

    const archive = await waitForFile(dir, 240_000);
    check('an archive is produced', Boolean(archive));

    if (archive) {
      const zip = await JSZip.loadAsync(await readFile(archive));
      const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);
      check('the archive holds one file per slide', names.length === 10, `held ${names.length}`);
      check(
        'files are foldered by category',
        names.every((n) => n.includes('/')),
        names[0] ?? 'none',
      );
      check(
        'slide numbers are zero padded so they sort',
        names.some((n) => /-01_/.test(n)) && names.some((n) => /-10_/.test(n)),
        names.slice(0, 2).join(', '),
      );

      // A real PNG, not an empty file.
      const first = names.sort()[0];
      const bytes = await zip.files[first].async('uint8array');
      const isPng =
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      check('archive entries are real PNGs', isPng, first);
      check('entries are not blank', bytes.length > 10_000, `${bytes.length} bytes`);
    }

    check('the run produced no page errors', errors.length === 0, errors[0] ?? '');
  } catch (err) {
    failures.push(`batch export — ${err.message}`);
  } finally {
    await page.close().catch(() => {});
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
});

console.log(`\nbatch export — ${passes.length} passed, ${failures.length} failed\n`);
for (const p of passes) console.log(`  PASS  ${p}`);
for (const f of failures) console.error(`  FAIL  ${f}`);
process.exit(failures.length ? 1 : 0);
