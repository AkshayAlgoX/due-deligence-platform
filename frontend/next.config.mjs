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
  },

  async rewrites() {
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