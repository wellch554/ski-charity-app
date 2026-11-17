/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    // Only unit tests under src/. Playwright specs live in e2e/ and must not
    // be picked up by Vitest.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
