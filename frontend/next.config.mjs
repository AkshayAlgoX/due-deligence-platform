/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://duediligence-agent.duckdns.org/api/:path*',
      },
    ];
  },
};

export default nextConfig;
