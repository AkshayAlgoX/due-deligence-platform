/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker: standalone output keeps the production image tiny (server.js + assets only)
  output: "standalone",
  // Lighthouse Best Practices: emit source maps for large first-party JS
  productionBrowserSourceMaps: true,
  turbopack: {
    root: import.meta.dirname, // pins the root to this file's folder (frontend/), ignoring the stray lockfile
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // Local dev defaults to localhost:8080; Docker builds pass API_PROXY_URL=http://backend:8080
        // (baked in at build time — see Dockerfile.frontend ARG)
        destination: `${process.env.API_PROXY_URL || "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;