import bundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  // COOP header keeps the Google sign-in popup working (allows popups from
  // cross-origin windows instead of blocking them).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },

  async rewrites() {
    // When deployed (Vercel) or pointed at a direct API URL, api.js uses the
    // backend base URL directly — no proxy needed. Locally, proxy to Spring.
    if (process.env.VERCEL || process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/actuator/:path*',
        destination: 'http://localhost:8080/actuator/:path*',
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
