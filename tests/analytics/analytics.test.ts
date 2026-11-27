import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sanitizeAnalyticsProps, track } from "@/lib/analytics";

const KEY = "NEXT_PUBLIC_POSTHOG_KEY";

describe("sanitizeAnalyticsProps", () => {
  it("drops free text, even under an allowed key", () => {
    expect(
      sanitizeAnalyticsProps("refine_clicked", {
        chip: "make it quieter please, I work in an office",
      }),
    ).toEqual({});
  });

  it("drops keys that are not on the event's allowlist", () => {
    expect(
      sanitizeAnalyticsProps("request_sent", {
        entry: "search",
        message: "quiet 65% under rm500",
        email: "someone@example.com",
      }),
    ).toEqual({ entry: "search" });
  });

  it("keeps slug tokens, numbers and booleans", () => {
    expect(
      sanitizeAnalyticsProps("build_shown", {
        buildCount: 3,
        validCount: 3,
        layout: "65",
      }),
    ).toEqual({ buildCount: 3, validCount: 3, layout: "65" });
    expect(
      sanitizeAnalyticsProps("build_saved", { source: "manual", signedIn: true }),
    ).toEqual({ source: "manual", signedIn: true });
  });
});

describe("track", () => {
  const fetchMock = vi.fn(() => Promise.resolve(new Response("{}")));
  let previousKey: string | undefined;

  beforeEach(() => {
    previousKey = process.env[KEY];
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    if (previousKey === undefined) delete process.env[KEY];
    else process.env[KEY] = previousKey;
    fetchMock.mockClear();
    vi.unstubAllGlobals();
  });

  it("sends nothing when no PostHog key is configured", () => {
    delete process.env[KEY];
    track("landing_viewed");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends an anonymous event with only allowlisted props", () => {
    process.env[KEY] = "phc_test_key";
    track("request_sent", {
      entry: "search",
      // @ts-expect-error: not an allowed prop; must be dropped at runtime too
      message: "secret prompt text",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/i\/v0\/e\/$/);
    const body = JSON.parse(String(init.body));
    expect(body.event).toBe("request_sent");
    expect(body.properties.entry).toBe("search");
    expect(body.properties.$process_person_profile).toBe(false);
    expect(JSON.stringify(body)).not.toContain("secret prompt text");
  });
});
