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

        const walk = (el) => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0 && r.right > vw + 1) {
            // Ignore anything inside a deliberate horizontal scroller.
            let p = el.parentElement;
            let scroller = false;
            while (p) {
              const st = getComputedStyle(p);
              if (st.overflowX === 'auto' || st.overflowX === 'scroll') { scroller = true; break; }
              p = p.parentElement;
            }
            if (!scroller) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: String(el.className || '').slice(0, 60),
                right: Math.round(r.right),
                width: Math.round(r.width),
              });
            }
          }
          for (const c of el.children) walk(c);
        };
        walk(document.body);

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
