/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lighthouse Best Practices: emit source maps for large first-party JS
  productionBrowserSourceMaps: true,
  turbopack: {
    root: import.meta.dirname, // pins the root to this file's folder (frontend/), ignoring the stray lockfile
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;