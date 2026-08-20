/** Capture screenshots at real emulated viewports. */
import { withBrowser, gotoSettled } from './browser.mjs';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:8099';
const OUT = '.verify';
await mkdir(OUT, { recursive: true });

const shots = JSON.parse(process.env.SHOTS ?? '[]');

await withBrowser(async (browser) => {
  const page = await browser.newPage();
  for (const s of shots) {
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1, isMobile: s.w < 500, hasTouch: s.w < 500 });
    await gotoSettled(page, BASE + s.route);
    await page.screenshot({ path: `${OUT}/${s.name}`, fullPage: !!s.full });
    console.log(`  ${s.name}  ${s.w}x${s.h}  ${s.route}`);
  }
});
