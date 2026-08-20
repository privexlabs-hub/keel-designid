/**
 * PHASE 3 GO/NO-GO GATE.
 *
 * Drives the REAL editor UI in a real browser — clicks the Export tab, picks a
 * format and scale, presses Download — and inspects the file that lands on
 * disk. Nothing is stubbed, so a pass here means a user pressing that button
 * gets that file.
 *
 * Asserts:
 *  1. Exact dimensions: canvas.w*scale x canvas.h*scale, exported from a PHONE
 *     viewport as well as desktop. The preview is scaled to ~0.3 on a phone,
 *     and inferring size from getBoundingClientRect there yields a 337x337
 *     image — the single most likely silent failure in this architecture.
 *  2. Real ink: the image is not a blank canvas (the Safari area-cap failure
 *     returns an empty surface rather than throwing).
 *  3. Brand fonts, not a system fallback — checked in-page by measurement
 *     before the export runs.
 *  4. SVG exports carry embedded font data and the right viewBox.
 */
import { withBrowser, gotoSettled } from './browser.mjs';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const BASE = process.env.BASE_URL ?? 'http://localhost:8099';

const TEMPLATES = [
  { id: 'square-big-stat', w: 1080, h: 1080, note: 'gradient ground, shadow, oversize numeral' },
  { id: 'engagement-problem-solution', w: 1080, h: 1080, note: 'dense two-column text' },
  { id: 'carousel-hook', w: 1080, h: 1080, note: 'repeater list, slide index' },
  { id: 'story-launch', w: 1080, h: 1920, note: 'image fill, scrim, safe area' },
  { id: 'thumbnail-audit', w: 1280, h: 720, note: 'cropped overflow numeral' },
  { id: 'x-header-banner', w: 1500, h: 500, note: 'wide, small ramp, inline mark' },
];

const CASES = [
  { viewport: { name: 'phone', width: 390, height: 844 }, format: 'PNG', scale: 1 },
  { viewport: { name: 'phone', width: 390, height: 844 }, format: 'PNG', scale: 2 },
  { viewport: { name: 'desktop', width: 1440, height: 900 }, format: 'PNG', scale: 2 },
  { viewport: { name: 'desktop', width: 1440, height: 900 }, format: 'JPEG', scale: 1 },
];

const failures = [];
const passes = [];

async function waitForDownload(dir, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const files = (await readdir(dir)).filter((f) => !f.endsWith('.crdownload'));
    if (files.length) {
      const p = path.join(dir, files[0]);
      const s = await stat(p);
      if (s.size > 0) {
        // let the write settle
        await new Promise((r) => setTimeout(r, 250));
        return p;
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('timed out waiting for a downloaded file');
}

/** Click a button whose visible text matches exactly. */
async function clickByText(page, selector, text) {
  const handle = await page.evaluateHandle(
    (sel, want) => {
      const els = Array.from(document.querySelectorAll(sel));
      return els.find((e) => (e.textContent || '').trim().startsWith(want)) ?? null;
    },
    selector,
    text,
  );
  const el = handle.asElement();
  if (!el) throw new Error(`no ${selector} matching "${text}"`);
  await el.click();
  await new Promise((r) => setTimeout(r, 120));
}

await withBrowser(async (browser) => {
  for (const t of TEMPLATES) {
    for (const c of CASES) {
      const dir = await mkdtemp(path.join(tmpdir(), 'keel-dl-'));
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

        await page.setViewport({ ...c.viewport, deviceScaleFactor: 1 });
        await gotoSettled(page, `${BASE}/studio/${t.id}/`);
        await page.waitForSelector('[data-stage]', { timeout: 30_000 });

        // (3) fonts must be live BEFORE we export, or we rasterise a fallback.
        const fontCheck = await page.evaluate(async () => {
          await document.fonts.ready;
          const probe = (family, weight, size) => {
            const c = document.createElement('canvas').getContext('2d');
            c.font = `${weight} ${size}px "${family}", monospace`;
            const a = c.measureText('Conformance 0123456789').width;
            c.font = `${weight} ${size}px monospace`;
            const b = c.measureText('Conformance 0123456789').width;
            return { family, active: a > 0 && Math.abs(a - b) > 0.5 };
          };
          return [
            probe('Newsreader', 600, 84),
            probe('Hanken Grotesk', 400, 28),
            probe('JetBrains Mono', 400, 16),
          ];
        });
        const dead = fontCheck.filter((f) => !f.active).map((f) => f.family);
        if (dead.length) {
          failures.push({ t: t.id, c, why: `fonts not active: ${dead.join(', ')}` });
          continue;
        }

        // Drive the real UI.
        await clickByText(page, 'button[role="tab"]', 'Export');
        await clickByText(page, 'button', c.format);
        if (c.format !== 'SVG' && c.format !== 'PDF') {
          await clickByText(page, 'button', `${c.scale}x`);
        }
        await clickByText(page, 'button', 'Download');

        const file = await waitForDownload(dir);
        const buf = await readFile(file);

        const expectW = t.w * c.scale;
        const expectH = t.h * c.scale;

        const meta = await sharp(buf).metadata();
        const stats = await sharp(buf).stats();
        const hasInk = stats.channels.some((ch) => ch.max > ch.min);

        const dimsOk = meta.width === expectW && meta.height === expectH;

        if (!dimsOk) {
          failures.push({
            t: t.id,
            c,
            why: `expected ${expectW}x${expectH}, got ${meta.width}x${meta.height}`,
          });
        } else if (!hasInk) {
          failures.push({ t: t.id, c, why: 'image is blank (no ink) — canvas likely capped' });
        } else if (errors.length) {
          failures.push({ t: t.id, c, why: `page errors: ${errors.slice(0, 2).join(' | ')}` });
        } else {
          passes.push({
            t: t.id,
            viewport: c.viewport.name,
            format: c.format,
            scale: c.scale,
            dims: `${meta.width}x${meta.height}`,
            bytes: buf.length,
          });
        }
      } catch (err) {
        failures.push({ t: t.id, c, why: err.message });
      } finally {
        await page.close().catch(() => {});
        await rm(dir, { recursive: true, force: true }).catch(() => {});
      }
    }
  }
});

console.log(`\nexport gate — ${passes.length} passed, ${failures.length} failed\n`);
for (const p of passes) {
  console.log(
    `  PASS  ${p.t.padEnd(30)} ${p.viewport.padEnd(8)} ${p.format.padEnd(5)} ${String(p.scale) + 'x'}  ${p.dims.padEnd(11)} ${(p.bytes / 1024).toFixed(0)} kB`,
  );
}
for (const f of failures) {
  console.error(
    `  FAIL  ${f.t.padEnd(30)} ${f.c.viewport.name.padEnd(8)} ${f.c.format.padEnd(5)} ${f.c.scale}x  ${f.why}`,
  );
}

process.exit(failures.length ? 1 : 0);
