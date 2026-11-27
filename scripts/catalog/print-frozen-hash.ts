/**
 * Prints the frozen catalogue's size and content hash, used to pin
 * tests/catalog/frozen-snapshot.test.ts.
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/catalog/print-frozen-hash.ts
 */
import { createHash } from "node:crypto";

import { catalogMode, frozenCatalog, fullCatalog } from "@/data";

const hash = createHash("sha256")
  .update(JSON.stringify(frozenCatalog))
  .digest("hex");

console.log(
  JSON.stringify({
    frozen: frozenCatalog.length,
    full: fullCatalog.length,
    mode: catalogMode,
    hash,
  }),
);
