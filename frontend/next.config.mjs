/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Proxy all /api/** requests to the Spring Boot backend.
   * This runs server-side in Next.js, so the browser never makes a
   * cross-origin request → no CORS errors, no backend changes needed.
   *
   * Backend: http://localhost:8080
   * Frontend: http://localhost:3000
   *
   * Example: fetch('/api/auth/register') → proxied to http://localhost:8080/api/auth/register
   */
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
