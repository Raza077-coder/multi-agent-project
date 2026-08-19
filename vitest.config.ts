/**
 * Created by: qa-testing-agent
 * Role:       QA / Testing Engineer
 * Purpose:    Vitest config — resolves the `@/` path alias to `src/`.
 */
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
