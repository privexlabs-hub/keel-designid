/**
 * Responsive audit: finds real horizontal overflow at phone and tablet widths.
 *
 * A page whose body scrolls sideways on a phone is broken, and it is the one
 * failure that screenshots make look like a rendering artefact.
 */
import { withBrowser, gotoSettled } from './browser.mjs';

const BASE = process.env.BASE_URL ?? 'http://localhost:8099';

const ROUTES = [
  '/', '/dashboard/', '/dashboard/map/', '/dashboard/registers/risk/',
  '/dashboard/audits/', '/dashboard/actions/', '/dashboard/conformance/',
  '/playbook/', '/playbook/logo/', '/playbook/colour/', '/playbook/typography/',
  '/playbook/motion/', '/playbook/application/', '/playbook/downloads/',
  '/studio/', '/foundation/',
  // Editor routes. These were never covered before the library rail landed,
  // which is exactly the kind of screen that overflows on a phone.
  '/studio/square-big-stat/', '/studio/carousel-hook/', '/studio/x-header-banner/',
  '/studio/export/',
];

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'phone-sm', width: 320, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
];

const problems = [];

await withBrowser(async (browser) => {
  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });

    for (const route of ROUTES) {
      await gotoSettled(page, BASE + route);

      const result = await page.evaluate(() => {
        const docEl = document.documentElement;
        const vw = docEl.clientWidth;
        const offenders = [];

        // `inScroller` is carried DOWN the tree rather than rediscovered by
        // walking up from every element. The editor renders several full
        // template stages at once, and the ancestor-walk version made enough
        // getComputedStyle calls to hang the tab.
        const walk = (el, inScroller) => {
          const r = el.getBoundingClientRect();

          if (!inScroller && r.width > 0 && r.height > 0 && r.right > vw + 1) {
            offenders.push({
              tag: el.tagName.toLowerCase(),
              cls: String(el.className || '').slice(0, 60),
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
          }

          if (!el.children.length) return;

          // Only elements that can actually clip need their style resolved.
          let scroller = inScroller;
          if (!scroller && r.width > 0) {
            const ox = getComputedStyle(el).overflowX;
            scroller = ox === 'auto' || ox === 'scroll' || ox === 'hidden';
          }
          for (const c of el.children) walk(c, scroller);
        };
        walk(document.body, false);

        return {
          vw,
          scrollWidth: docEl.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          overflow: docEl.scrollWidth - vw,
          offenders: offenders.slice(0, 6),
          offenderCount: offenders.length,
        };
      });

      if (result.overflow > 1) {
        problems.push({ route, viewport: vp.name, ...result });
      }
    }
  }
});

if (problems.length === 0) {
  console.log(`responsive: no horizontal overflow across ${ROUTES.length} routes x ${VIEWPORTS.length} viewports.`);
  process.exit(0);
}

console.error(`\nresponsive FAILED — ${problems.length} route/viewport combination(s) scroll sideways:\n`);
for (const p of problems) {
  console.error(`  ${p.viewport.padEnd(9)} ${p.route}`);
  console.error(`    viewport ${p.vw}px, scrollWidth ${p.scrollWidth}px (overflow ${p.overflow}px), ${p.offenderCount} element(s)`);
  for (const o of p.offenders) {
    console.error(`      <${o.tag}> w=${o.width} right=${o.right}  ${o.cls}`);
  }
}
process.exit(1);
