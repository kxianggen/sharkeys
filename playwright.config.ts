import { defineConfig } from "@playwright/test";

/**
 * Minimal e2e config: nav-consistency smoke check + page screenshots.
 * Kept out of the vitest glob (tests/**) — e2e specs live in e2e/.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3000",
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
