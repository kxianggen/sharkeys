import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  BlockedHostError,
  createPoliteFetcher,
  RobotsDisallowedError,
} from "../../scripts/catalog/lib/fetch";
import { isPathAllowed, parseRobots } from "../../scripts/catalog/lib/robots";

const ROBOTS = `User-agent: *
Disallow: /cart
Disallow: /checkout
Allow: /products/
Disallow: /*?*sort_by
Crawl-delay: 2

User-agent: BadBot
Disallow: /`;

describe("robots.txt", () => {
  const rules = parseRobots(ROBOTS, "SharkeysCatalogBot");

  it("allows product pages and blocks carts", () => {
    expect(isPathAllowed(rules, "/products/foo.json")).toBe(true);
    expect(isPathAllowed(rules, "/cart")).toBe(false);
    expect(isPathAllowed(rules, "/checkout/123")).toBe(false);
    expect(isPathAllowed(rules, "/collections/all?sort_by=price")).toBe(false);
    expect(isPathAllowed(rules, "/collections/all")).toBe(true);
    expect(rules.crawlDelaySeconds).toBe(2);
  });

  it("uses a group that names the bot over the * group", () => {
    const bad = parseRobots(ROBOTS, "BadBot/1.0");
    expect(isPathAllowed(bad, "/products/foo")).toBe(false);
  });
});

type Call = { url: string; at: number; userAgent: string };

function fakeNetwork(routes: Record<string, { status: number; body?: string; headers?: Record<string, string> }[]>) {
  let clock = 0;
  const calls: Call[] = [];
  const fetchImpl = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, at: clock, userAgent: String((init?.headers as Record<string, string>)["User-Agent"]) });
    const queue = routes[url] ?? [{ status: 404, body: "" }];
    const next = queue.length > 1 ? queue.shift()! : queue[0];
    return new Response(next.body ?? "", { status: next.status, headers: next.headers });
  }) as typeof fetch;
  return {
    calls,
    fetchImpl,
    now: () => clock,
    sleep: async (ms: number) => {
      clock += ms;
    },
  };
}

describe("polite fetcher", () => {
  const robots = { status: 200, body: "User-agent: *\nDisallow: /cart\n" };

  it("identifies itself and waits between requests to one host", async () => {
    const net = fakeNetwork({
      "https://shop.example/robots.txt": [robots],
      "https://shop.example/products/a.json": [{ status: 200, body: "{}" }],
      "https://shop.example/products/b.json": [{ status: 200, body: "{}" }],
    });
    const fetcher = createPoliteFetcher({ ...net, minDelayMs: 5_000 });
    await fetcher.get("https://shop.example/products/a.json");
    await fetcher.get("https://shop.example/products/b.json");
    expect(net.calls.map((c) => c.at)).toEqual([0, 5_000, 10_000]);
    expect(net.calls.every((c) => c.userAgent.startsWith("SharkeysCatalogBot/"))).toBe(true);
  });

  it("refuses what robots.txt disallows, without requesting it", async () => {
    const net = fakeNetwork({ "https://shop.example/robots.txt": [robots] });
    const fetcher = createPoliteFetcher({ ...net, minDelayMs: 0 });
    await expect(fetcher.get("https://shop.example/cart")).rejects.toBeInstanceOf(RobotsDisallowedError);
    expect(net.calls.map((c) => c.url)).toEqual(["https://shop.example/robots.txt"]);
  });

  it("never fetches Shopee", async () => {
    const net = fakeNetwork({});
    const fetcher = createPoliteFetcher({ ...net, minDelayMs: 0 });
    await expect(fetcher.get("https://shopee.com.my/some-product")).rejects.toBeInstanceOf(BlockedHostError);
    expect(net.calls).toHaveLength(0);
  });

  it("backs off on 429 using Retry-After, then succeeds", async () => {
    const net = fakeNetwork({
      "https://shop.example/robots.txt": [robots],
      "https://shop.example/products/a.json": [
        { status: 429, headers: { "retry-after": "60" } },
        { status: 200, body: "ok" },
      ],
    });
    const fetcher = createPoliteFetcher({ ...net, minDelayMs: 1_000 });
    const result = await fetcher.get("https://shop.example/products/a.json");
    expect(result.status).toBe(200);
    expect(net.calls[2].at - net.calls[1].at).toBeGreaterThanOrEqual(60_000);
  });

  it("gives up after three tries", async () => {
    const net = fakeNetwork({
      "https://shop.example/robots.txt": [robots],
      "https://shop.example/products/a.json": [{ status: 429 }],
    });
    const fetcher = createPoliteFetcher({ ...net, minDelayMs: 0 });
    const result = await fetcher.get("https://shop.example/products/a.json");
    expect(result.status).toBe(429);
    expect(net.calls.filter((c) => c.url.endsWith("a.json"))).toHaveLength(3);
  });

  it("serves repeats from the disk cache", async () => {
    const cacheDir = mkdtempSync(join(tmpdir(), "sharkeys-fetch-"));
    const net = fakeNetwork({
      "https://shop.example/robots.txt": [robots],
      "https://shop.example/products/a.json": [{ status: 200, body: "first" }],
    });
    await createPoliteFetcher({ ...net, minDelayMs: 0, cacheDir }).get("https://shop.example/products/a.json");
    const again = await createPoliteFetcher({ ...net, minDelayMs: 0, cacheDir }).get("https://shop.example/products/a.json");
    expect(again).toMatchObject({ fromCache: true, body: "first" });
    expect(net.calls.filter((c) => c.url.endsWith("a.json"))).toHaveLength(1);
  });
});
