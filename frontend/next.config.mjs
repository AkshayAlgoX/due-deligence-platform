/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://54.66.38.92/api/:path*',
      },
      {
        source: '/actuator/:path*',
        destination: 'http://54.66.38.92/actuator/:path*',
      },
    ];
  },
};

export default nextConfig;