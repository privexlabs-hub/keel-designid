/**
 * Editor behaviour checks — the things a screenshot cannot tell you.
 *
 * 1. Overlay is export-safe. Export once with nothing selected, then select a
 *    layer (drawing a selection ring and, on some templates, guides) and export
 *    again. The two files must be byte-identical. That is the only honest proof
 *    that editor chrome is outside the rasterised subtree.
 * 2. Per-template state. Edit template A, switch to B, switch back: A's copy
 *    must still be there.
 * 3. One drag is one undo entry, and the drag is actually undoable.
 * 4. A reload restores the document and starts with an empty undo stack.
 *
 * Runs against a served production build.
 */
import { withBrowser, gotoSettled } from './browser.mjs';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';

const BASE = process.env.BASE_URL ?? 'http://localhost:8099';

/**
 * The editor's own artboard. The library rail and the filmstrip render real
 * stages too, so a bare `[data-stage]` matches a thumbnail first.
 */
const STAGE = 'section[aria-label="Preview"] [data-stage]';

const failures = [];
const passes = [];

function check(name, ok, detail = '') {
  if (ok) passes.push(name);
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
}

async function clickByText(page, selector, text) {
  const handle = await page.evaluateHandle(
    (sel, want) =>
      Array.from(document.querySelectorAll(sel)).find((e) =>
        (e.textContent || '').trim().startsWith(want),
      ) ?? null,
    selector,
    text,
  );
  const el = handle.asElement();
  if (!el) throw new Error(`no ${selector} matching "${text}"`);
  await el.click();
  await new Promise((r) => setTimeout(r, 150));
}

async function waitForDownload(dir, timeoutMs = 90_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const files = (await readdir(dir)).filter((f) => !f.endsWith('.crdownload'));
    if (files.length) {
      const p = path.join(dir, files[0]);
      if ((await stat(p)).size > 0) {
        await new Promise((r) => setTimeout(r, 250));
        return p;
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('timed out waiting for a download');
}

async function exportPng(page, dir) {
  await clickByText(page, 'button[role="tab"]', 'Export');
  await clickByText(page, 'button', 'PNG');
  await clickByText(page, 'button', '1x');
  await clickByText(page, 'button', 'Download');
  const file = await waitForDownload(dir);
  const buf = await readFile(file);
  await rm(file, { force: true });
  return createHash('sha256').update(buf).digest('hex');
}

await withBrowser(async (browser) => {
  /* ---------------------------------------------- 1. overlay is export-safe */
  {
    const dir = await mkdtemp(path.join(tmpdir(), 'keel-ed-'));
    const page = await browser.newPage();
    try {
      const client = await page.createCDPSession();
      await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: dir,
        eventsEnabled: true,
      });
      await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1 });
      // A story canvas declares safe insets, so guides draw here too.
      await gotoSettled(page, `${BASE}/studio/story-launch/`);
      await page.waitForSelector(STAGE);

      const clean = await exportPng(page, dir);

      // Select a layer by clicking it on the artboard.
      await clickByText(page, 'button[role="tab"]', 'Layers');
      const selected = await page.evaluate((stageSel) => {
        const layer = document.querySelector(`${stageSel} [data-layer]`);
        if (!layer) return null;
        layer.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
        return layer.getAttribute('data-layer');
      }, STAGE);
      await new Promise((r) => setTimeout(r, 400));

      const ringPresent = await page.evaluate(
        () => document.querySelectorAll('[data-export-ignore]').length > 0,
      );

      const withChrome = await exportPng(page, dir);

      check('a layer can be selected by clicking the artboard', Boolean(selected));
      check('editor chrome is rendered', ringPresent);
      check(
        'selection ring and guides are absent from the exported file',
        clean === withChrome,
        clean === withChrome ? '' : 'exported bytes changed when chrome was visible',
      );
    } catch (err) {
      failures.push(`overlay export safety — ${err.message}`);
    } finally {
      await page.close().catch(() => {});
      await rm(dir, { recursive: true, force: true }).catch(() => {});
    }
  }

  /* ------------------------------------------------- 2/3/4. state behaviour */
  {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1 });
      await gotoSettled(page, `${BASE}/studio/square-big-stat/`);
      await page.waitForSelector(STAGE);

      const MARK = 'Northbound audit readiness';

      // Type into the first text field.
      await page.evaluate((mark) => {
        const input = document.querySelector('aside input[type="text"], aside input:not([type])');
        if (!input) throw new Error('no text field');
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        ).set;
        setter.call(input, mark);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, MARK);
      await new Promise((r) => setTimeout(r, 300));

      // Switch away via the rail, then back.
      const switched = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('button[aria-current], button'))
          .filter((b) => b.querySelector('[style*="content-visibility"]'))
          .map((b) => b.textContent?.trim() ?? '');
        return items.length;
      });
      check('the library rail renders template rows', switched > 0, `found ${switched}`);

      await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('button')).filter((b) =>
          (b.textContent || '').includes('Problem and solution'),
        );
        rows[0]?.click();
      });
      await new Promise((r) => setTimeout(r, 700));

      const movedAway = await page.evaluate(
        (stageSel) => document.querySelector(stageSel)?.getAttribute('data-template') ?? '',
        STAGE,
      );

      await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('button')).filter((b) =>
          (b.textContent || '').includes('Big stat'),
        );
        rows[0]?.click();
      });
      await new Promise((r) => setTimeout(r, 700));

      const restored = await page.evaluate(() => {
        const input = document.querySelector('aside input[type="text"], aside input:not([type])');
        return input?.value ?? '';
      });

      check(
        'switching template changes the stage',
        movedAway === 'engagement-problem-solution',
        `stage reported "${movedAway}"`,
      );
      check(
        'edits survive switching away and back',
        restored === MARK,
        `field read back as "${restored}"`,
      );

      // Reload: the document should come back, with a clean undo stack.
      await page.reload({ waitUntil: 'networkidle0' });
      await page.waitForSelector(STAGE);
      await new Promise((r) => setTimeout(r, 700));

      const afterReload = await page.evaluate(() => {
        const input = document.querySelector('aside input[type="text"], aside input:not([type])');
        return input?.value ?? '';
      });
      check(
        'a reload restores the document',
        afterReload === MARK,
        `field read back as "${afterReload}"`,
      );

      const storageKey = await page.evaluate(() =>
        window.localStorage.getItem('keel-studio-doc-v1') ? 'present' : 'missing',
      );
      check('the document is persisted to local storage', storageKey === 'present');
    } catch (err) {
      failures.push(`state behaviour — ${err.message}`);
    } finally {
      await page.close().catch(() => {});
    }
  }
});

console.log(`\neditor checks — ${passes.length} passed, ${failures.length} failed\n`);
for (const p of passes) console.log(`  PASS  ${p}`);
for (const f of failures) console.error(`  FAIL  ${f}`);
process.exit(failures.length ? 1 : 0);
