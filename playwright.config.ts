import { defineConfig } from "@playwright/test";

/**
 * Minimal e2e config: nav-consistency smoke check + page screenshots.
 * Kept out of the vitest glob (tests/**) — e2e specs live in e2e/.
 *
 * PLAYWRIGHT_PORT (default 3000) lets a worktree test its own dev server:
 * with reuseExistingServer, a shared port could silently test another
 * checkout's code.
 */
const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL,
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
