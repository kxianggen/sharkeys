"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { migrateLocalSavedBuildsAction } from "@/app/my-builds/actions";
import {
  LEGACY_SAVED_BUILDS_KEY,
  readLegacySavedBuilds,
} from "@/lib/saved-builds/legacy-local-storage";

/**
 * One-time localStorage → account migration. Rendered only for signed-in
 * users on /my-builds: if the legacy key exists, its builds are re-validated
 * and inserted server-side, the key is cleared so this never repeats, and the
 * fresh server list is pulled in via router.refresh(). Invalid or incompatible
 * legacy builds are skipped server-side, never failing the whole run. On a
 * migration error the key is left in place so the next visit retries.
 */
export function LocalBuildsMigrator() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const candidates = readLegacySavedBuilds();
    if (candidates === null) return; // no legacy key — nothing to do

    void (async () => {
      try {
        const result =
          candidates.length > 0
            ? await migrateLocalSavedBuildsAction(candidates)
            : { migrated: 0, skipped: 0 };

        window.localStorage.removeItem(LEGACY_SAVED_BUILDS_KEY);

        if (result.migrated > 0) {
          setNotice(
            `Restored ${result.migrated} saved ${
              result.migrated === 1 ? "build" : "builds"
            } from this browser${
              result.skipped > 0
                ? ` (${result.skipped} skipped as incompatible)`
                : ""
            }.`,
          );
          router.refresh();
        }
      } catch {
        // Leave the key so a later visit can retry the migration.
      }
    })();
  }, [router]);

  if (!notice) return null;

  return (
    <p
      className="mt-4 rounded-2xl border border-border bg-accent-subtle px-4 py-3 text-sm text-primary"
      data-testid="local-builds-migration-notice"
    >
      {notice}
    </p>
  );
}
