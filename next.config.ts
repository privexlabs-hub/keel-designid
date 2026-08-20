import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fully static: no server code, no middleware, no server actions.
  // Every route (including all ~130 studio templates) is enumerated at build.
  output: 'export',

  // Emits /route/index.html rather than /route.html. Most static hosts resolve
  // directory indexes but not extensionless files, so this is the safer default.
  // Confirmed against the deploy target by serving out/ and testing deep links.
  trailingSlash: true,

  // No server, so no image optimisation endpoint.
  images: { unoptimized: true },

  reactStrictMode: true,
};

export default nextConfig;
