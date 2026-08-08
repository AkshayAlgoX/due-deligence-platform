const nextConfig = {
  turbopack: {
  root: process.cwd(),
},

  /**
   * Proxy all /api/** requests to the Spring Boot backend.
   ...
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