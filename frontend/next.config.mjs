/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
    ],
  },

  turbopack: {
    root: import.meta.dirname,
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${
          process.env.API_PROXY_URL || "http://localhost:8080"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;