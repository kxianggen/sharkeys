import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: ["./tests/setup.ts"],
    // v2 WS2: pin every existing test to the frozen 61-part catalogue so the
    // catalogue growing through the importer never breaks them.
    env: { SHARKEYS_CATALOG: "frozen" },
  },
});
