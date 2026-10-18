import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
};

// Picks up src/i18n/request.ts.
export default createNextIntlPlugin()(config);
