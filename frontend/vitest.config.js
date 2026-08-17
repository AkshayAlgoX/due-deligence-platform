// vitest.config.js — frontend test runner config
import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: "jsx",
    include: /\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    globals: true,
    css: false,
    include: ["src/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}"],
    exclude: [...configDefaults.exclude, "src/__tests__/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [...configDefaults.exclude, "src/test/", "**/*.config.js", ".next/", "src/__tests__/e2e/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
