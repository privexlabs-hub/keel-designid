/**
 * The download index.
 *
 * Generated from the contents of `public/assets/` — every entry below was read
 * off disk, so a link here is a file that exists. If an asset is regenerated
 * (`npm run assets`) and this list drifts, `npm run verify:assets` is the
 * check that catches it.
 */

export interface AssetFile {
  /** Path as served, relative to the site root. */
  path: string;
  /** Human label. */
  name: string;
  bytes: number;
  size: string;
}

export interface AssetGroup {
  label: string;
  /** What this group is for, and when to reach for it. */
  note: string;
  files: AssetFile[];
}

export const ASSET_GROUPS: readonly AssetGroup[] = [
  {
    label: "Logo \u2014 SVG",
    note: "Vector masters. Use these anywhere the medium is vector \u2014 web, print, embroidery digitising, video. `keel-mark.svg` inherits `currentColor`; the suffixed files carry a baked fill.",
    files: [
      { path: "/assets/logo/keel-lockup-horizontal.svg", name: "keel-lockup-horizontal.svg", bytes: 1360, size: "1.3 kB" },
      { path: "/assets/logo/keel-lockup-stacked.svg", name: "keel-lockup-stacked.svg", bytes: 1383, size: "1.4 kB" },
      { path: "/assets/logo/keel-mark-cream.svg", name: "keel-mark-cream.svg", bytes: 292, size: "292 B" },
      { path: "/assets/logo/keel-mark-ink.svg", name: "keel-mark-ink.svg", bytes: 292, size: "292 B" },
      { path: "/assets/logo/keel-mark-mono.svg", name: "keel-mark-mono.svg", bytes: 286, size: "286 B" },
      { path: "/assets/logo/keel-mark-teal.svg", name: "keel-mark-teal.svg", bytes: 292, size: "292 B" },
      { path: "/assets/logo/keel-mark.svg", name: "keel-mark.svg", bytes: 302, size: "302 B" },
      { path: "/assets/logo/keel-wordmark-cream.svg", name: "keel-wordmark-cream.svg", bytes: 1360, size: "1.3 kB" },
      { path: "/assets/logo/keel-wordmark-ink.svg", name: "keel-wordmark-ink.svg", bytes: 1360, size: "1.3 kB" },
      { path: "/assets/logo/keel-wordmark.svg", name: "keel-wordmark.svg", bytes: 1360, size: "1.3 kB" },
    ],
  },
  {
    label: "Logo \u2014 PNG",
    note: "Raster fallbacks at fixed pixel sizes, for slide decks, marketplace listings and anywhere SVG is refused. Pick the size at or above the rendered size \u2014 never scale one up.",
    files: [
      { path: "/assets/logo/png/keel-mark-cream-1024.png", name: "keel-mark-cream-1024.png", bytes: 11973, size: "11.7 kB" },
      { path: "/assets/logo/png/keel-mark-cream-128.png", name: "keel-mark-cream-128.png", bytes: 901, size: "901 B" },
      { path: "/assets/logo/png/keel-mark-cream-256.png", name: "keel-mark-cream-256.png", bytes: 1831, size: "1.8 kB" },
      { path: "/assets/logo/png/keel-mark-cream-512.png", name: "keel-mark-cream-512.png", bytes: 4513, size: "4.4 kB" },
      { path: "/assets/logo/png/keel-mark-cream-64.png", name: "keel-mark-cream-64.png", bytes: 591, size: "591 B" },
      { path: "/assets/logo/png/keel-mark-ink-1024.png", name: "keel-mark-ink-1024.png", bytes: 11937, size: "11.7 kB" },
      { path: "/assets/logo/png/keel-mark-ink-128.png", name: "keel-mark-ink-128.png", bytes: 907, size: "907 B" },
      { path: "/assets/logo/png/keel-mark-ink-256.png", name: "keel-mark-ink-256.png", bytes: 1848, size: "1.8 kB" },
      { path: "/assets/logo/png/keel-mark-ink-512.png", name: "keel-mark-ink-512.png", bytes: 4518, size: "4.4 kB" },
      { path: "/assets/logo/png/keel-mark-ink-64.png", name: "keel-mark-ink-64.png", bytes: 595, size: "595 B" },
      { path: "/assets/logo/png/keel-mark-teal-1024.png", name: "keel-mark-teal-1024.png", bytes: 12126, size: "11.8 kB" },
      { path: "/assets/logo/png/keel-mark-teal-128.png", name: "keel-mark-teal-128.png", bytes: 918, size: "918 B" },
      { path: "/assets/logo/png/keel-mark-teal-256.png", name: "keel-mark-teal-256.png", bytes: 1878, size: "1.8 kB" },
      { path: "/assets/logo/png/keel-mark-teal-512.png", name: "keel-mark-teal-512.png", bytes: 4566, size: "4.5 kB" },
      { path: "/assets/logo/png/keel-mark-teal-64.png", name: "keel-mark-teal-64.png", bytes: 610, size: "610 B" },
      { path: "/assets/logo/png/keel-wordmark-cream-1024.png", name: "keel-wordmark-cream-1024.png", bytes: 14353, size: "14.0 kB" },
      { path: "/assets/logo/png/keel-wordmark-cream-2048.png", name: "keel-wordmark-cream-2048.png", bytes: 33750, size: "33.0 kB" },
      { path: "/assets/logo/png/keel-wordmark-cream-512.png", name: "keel-wordmark-cream-512.png", bytes: 6521, size: "6.4 kB" },
      { path: "/assets/logo/png/keel-wordmark-ink-1024.png", name: "keel-wordmark-ink-1024.png", bytes: 14757, size: "14.4 kB" },
      { path: "/assets/logo/png/keel-wordmark-ink-2048.png", name: "keel-wordmark-ink-2048.png", bytes: 34080, size: "33.3 kB" },
      { path: "/assets/logo/png/keel-wordmark-ink-512.png", name: "keel-wordmark-ink-512.png", bytes: 6664, size: "6.5 kB" },
      { path: "/assets/logo/png/keel-wordmark-teal-1024.png", name: "keel-wordmark-teal-1024.png", bytes: 14901, size: "14.6 kB" },
      { path: "/assets/logo/png/keel-wordmark-teal-2048.png", name: "keel-wordmark-teal-2048.png", bytes: 34684, size: "33.9 kB" },
      { path: "/assets/logo/png/keel-wordmark-teal-512.png", name: "keel-wordmark-teal-512.png", bytes: 6738, size: "6.6 kB" },
    ],
  },
  {
    label: "Favicons and app icons",
    note: "Wired into the site head and `site.webmanifest`. The maskable icon carries the safe-area padding Android applies its own mask to.",
    files: [
      { path: "/assets/favicon/apple-touch-icon.png", name: "apple-touch-icon.png", bytes: 1330, size: "1.3 kB" },
      { path: "/assets/favicon/favicon-16.png", name: "favicon-16.png", bytes: 237, size: "237 B" },
      { path: "/assets/favicon/favicon-32.png", name: "favicon-32.png", bytes: 374, size: "374 B" },
      { path: "/assets/favicon/favicon-48.png", name: "favicon-48.png", bytes: 461, size: "461 B" },
      { path: "/assets/favicon/favicon.svg", name: "favicon.svg", bytes: 292, size: "292 B" },
      { path: "/assets/favicon/icon-192.png", name: "icon-192.png", bytes: 1211, size: "1.2 kB" },
      { path: "/assets/favicon/icon-512-maskable.png", name: "icon-512-maskable.png", bytes: 3421, size: "3.3 kB" },
      { path: "/assets/favicon/icon-512.png", name: "icon-512.png", bytes: 3765, size: "3.7 kB" },
      { path: "/assets/favicon/safari-pinned-tab.svg", name: "safari-pinned-tab.svg", bytes: 286, size: "286 B" },
    ],
  },
  {
    label: "Fonts",
    note: "The self-hosted WOFF2 subsets the product ships. Latin and Latin-Extended are separate files with matching `unicode-range` declarations. All three families are under the SIL Open Font Licence \u2014 ship `LICENSE-OFL.txt` with any redistribution.",
    files: [
      { path: "/assets/fonts/LICENSE-OFL.txt", name: "LICENSE-OFL.txt", bytes: 13866, size: "13.5 kB" },
      { path: "/assets/fonts/hanken-grotesk-var-latin-ext.woff2", name: "hanken-grotesk-var-latin-ext.woff2", bytes: 19572, size: "19.1 kB" },
      { path: "/assets/fonts/hanken-grotesk-var-latin.woff2", name: "hanken-grotesk-var-latin.woff2", bytes: 34664, size: "33.9 kB" },
      { path: "/assets/fonts/jetbrains-mono-400-latin-ext.woff2", name: "jetbrains-mono-400-latin-ext.woff2", bytes: 11596, size: "11.3 kB" },
      { path: "/assets/fonts/jetbrains-mono-400-latin.woff2", name: "jetbrains-mono-400-latin.woff2", bytes: 31340, size: "30.6 kB" },
      { path: "/assets/fonts/jetbrains-mono-500-latin-ext.woff2", name: "jetbrains-mono-500-latin-ext.woff2", bytes: 11596, size: "11.3 kB" },
      { path: "/assets/fonts/jetbrains-mono-500-latin.woff2", name: "jetbrains-mono-500-latin.woff2", bytes: 31340, size: "30.6 kB" },
      { path: "/assets/fonts/newsreader-var-latin-ext.woff2", name: "newsreader-var-latin-ext.woff2", bytes: 86628, size: "84.6 kB" },
      { path: "/assets/fonts/newsreader-var-latin.woff2", name: "newsreader-var-latin.woff2", bytes: 131848, size: "128.8 kB" },
    ],
  },
];

export const ASSET_COUNT = ASSET_GROUPS.reduce((n, g) => n + g.files.length, 0);
