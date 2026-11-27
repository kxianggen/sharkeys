/**
 * Usage analytics (v2 WS0): a tiny, privacy-first PostHog sender.
 *
 * Why not the posthog-js SDK: we need 8 named events and one funnel. The SDK
 * brings autocapture, session recording and cookies that we would only have
 * to switch off again. One fetch to PostHog's capture endpoint does the job,
 * and nothing can be captured by accident.
 *
 * Privacy rules (enforced in code, tested in tests/analytics/analytics.test.ts):
 *  - Never message text or personal data. Every event has a fixed allowlist of
 *    property keys; string values must be short slug-like tokens
 *    (e.g. "65", "search"), so free text cannot get through.
 *  - No cookies. The anonymous id is random, per browser tab (sessionStorage),
 *    and PostHog is told not to build person profiles.
 *  - Does nothing unless NEXT_PUBLIC_POSTHOG_KEY is set, so local dev, tests
 *    and CI never send anything.
 */

export type AnalyticsEventProps = {
  landing_viewed: Record<string, never>;
  request_sent: { entry: "search" | "chat" | "photo" | "kit" };
  build_shown: { buildCount: number; layout?: string; validCount?: number };
  build_saved: { source: "recommendation" | "manual"; signedIn: boolean };
  build_shared: { channel?: "link" | "native" };
  build_cloned: Record<string, never>;
  sound_played: { switchId?: string };
  refine_clicked: { chip?: string };
};

export type AnalyticsEvent = keyof AnalyticsEventProps;

const allowedKeys: { [E in AnalyticsEvent]: readonly string[] } = {
  landing_viewed: [],
  request_sent: ["entry"],
  build_shown: ["buildCount", "layout", "validCount"],
  build_saved: ["source", "signedIn"],
  build_shared: ["channel"],
  build_cloned: [],
  sound_played: ["switchId"],
  refine_clicked: ["chip"],
};

// Slug-like tokens only: lowercase letters, digits, _ - % and at most 48 chars.
// A catalogue id ("switch_gateron_oil_king") passes; a sentence never does.
const SAFE_STRING = /^[a-z0-9_%-]{1,48}$/;

/**
 * Keeps only allowlisted keys with safe values. Exported for tests. Anything
 * else is dropped silently: analytics must never break the app.
 */
export function sanitizeAnalyticsProps(
  event: AnalyticsEvent,
  props: Record<string, unknown> = {},
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};

  for (const key of allowedKeys[event]) {
    const value = props[key];

    if (typeof value === "boolean") {
      clean[key] = value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      clean[key] = value;
    } else if (typeof value === "string" && SAFE_STRING.test(value)) {
      clean[key] = value;
    }
  }

  return clean;
}

const SESSION_KEY = "sharkeys_anon_session";

function anonymousSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode): fall back to a per-page id.
    return crypto.randomUUID();
  }
}

export function isAnalyticsEnabled(): boolean {
  return typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function track<E extends AnalyticsEvent>(
  event: E,
  ...[props]: AnalyticsEventProps[E] extends Record<string, never>
    ? []
    : [AnalyticsEventProps[E]]
): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (typeof window === "undefined" || !key) return;

  const host = (
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"
  ).replace(/\/$/, "");

  const body = {
    api_key: key,
    event,
    distinct_id: anonymousSessionId(),
    timestamp: new Date().toISOString(),
    properties: {
      ...sanitizeAnalyticsProps(event, props as Record<string, unknown>),
      // Anonymous events only: no person profiles, no IP-based geo.
      $process_person_profile: false,
      $ip: null,
      // Page path only, never the query string (it could hold a prompt).
      $pathname: window.location.pathname,
    },
  };

  try {
    void fetch(`${host}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Never let analytics break the page.
  }
}
