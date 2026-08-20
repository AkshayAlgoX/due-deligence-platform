/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://duediligence-agent.duckdns.org/api/:path*',
      },
      {
        source: '/actuator/:path*',
        destination: 'https://duediligence-agent.duckdns.org/actuator/:path*',
      },
    ];
  },
};

export default nextConfig;
