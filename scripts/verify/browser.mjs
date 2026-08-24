/**
 * Shared headless-browser harness.
 *
 * Uses the system Chrome via puppeteer-core (no second Chromium download) and
 * a throwaway profile so it never collides with a Chrome the user has open.
 */
import puppeteer from 'puppeteer-core';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export async function withBrowser(fn) {
  const userDataDir = await mkdtemp(path.join(tmpdir(), 'keel-verify-'));
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    userDataDir,
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1'],
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close().catch(() => {});
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Wait until webfonts have actually settled, so measurements are stable.
 *
 * `networkidle0` is the ideal signal but it is fragile: the studio loads
 * template chunks lazily as previews scroll into view, and on a busy machine
 * the idle window may never open. Falling back to `domcontentloaded` plus an
 * explicit font wait keeps the check honest — fonts settled is what the
 * measurements actually depend on — instead of failing the run on timing.
 */
export async function gotoSettled(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 45_000 });
  } catch {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await new Promise((r) => setTimeout(r, 1500));
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
