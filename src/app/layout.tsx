import type { Metadata, Viewport } from 'next';
import './globals.css';

/**
 * Fonts are self-hosted via src/styles/fonts.css and deliberately NOT loaded
 * through next/font — the SVG and PDF renderers don't share the DOM's font
 * context and need stable, unhashed family names, and next/font's subsetting
 * drops glyphs the templates rely on. See README.
 */
export const metadata: Metadata = {
  title: {
    default: 'Keel Brand ID',
    template: '%s · Keel Brand ID',
  },
  description:
    'The Keel brand identity playbook, template studio, and management-system dashboard.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/assets/favicon/favicon.svg', type: 'image/svg+xml' },
      { url: '/assets/favicon/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/favicon/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/assets/favicon/apple-touch-icon.png', sizes: '180x180' }],
    other: [{ rel: 'mask-icon', url: '/assets/favicon/safari-pinned-tab.svg', color: '#1C5A64' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#1C5A64',
  width: 'device-width',
  initialScale: 1,
};

const PRELOAD = [
  '/assets/fonts/hanken-grotesk-var-latin.woff2',
  '/assets/fonts/newsreader-var-latin.woff2',
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {PRELOAD.map((href) => (
          <link key={href} rel="preload" as="font" type="font/woff2" href={href} crossOrigin="anonymous" />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
