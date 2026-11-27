/**
 * Polite fetcher for vendor product pages (v2 WS2).
 *
 * House rules, all enforced here so no caller can forget them:
 *   - public pages only, and only where robots.txt allows it
 *   - an honest, identifying user agent
 *   - at least `minDelayMs` between requests to the same host (more if the
 *     site's robots.txt asks for a Crawl-delay)
 *   - back off on 429 / 503, honouring Retry-After, and give up after 3 tries
 *   - a disk cache, so re-running a step re-reads the cache instead of the site
 *   - never Shopee
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { isPathAllowed, parseRobots, type RobotsRules } from "./robots";

export const CATALOG_BOT_USER_AGENT =
  "SharkeysCatalogBot/1.0 (+https://github.com/kxianggen/sharkeys; student project; slow, cached)";

export const DEFAULT_MIN_DELAY_MS = 5_000;

export class RobotsDisallowedError extends Error {
  constructor(url: string) {
    super(`robots.txt disallows ${url}`);
    this.name = "RobotsDisallowedError";
  }
}

export class BlockedHostError extends Error {
  constructor(url: string) {
    super(`Refusing to fetch ${url}: this host is on the never-fetch list.`);
    this.name = "BlockedHostError";
  }
}

/** Hosts we never fetch from, whatever robots.txt says. */
const BLOCKED_HOST_PATTERN = /(^|\.)shopee\./i;

export type FetchResult = {
  url: string;
  status: number;
  body: string;
  fetchedAt: string;
  fromCache: boolean;
};

export type PoliteFetcherOptions = {
  userAgent?: string;
  minDelayMs?: number;
  maxAttempts?: number;
  /** Directory for the disk cache; omit to disable caching. */
  cacheDir?: string;
  /** Cached responses older than this are re-fetched. Default: forever. */
  maxCacheAgeMs?: number;
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  log?: (message: string) => void;
};

type CachedEntry = Omit<FetchResult, "fromCache">;

export function createPoliteFetcher(options: PoliteFetcherOptions = {}) {
  const userAgent = options.userAgent ?? CATALOG_BOT_USER_AGENT;
  const minDelayMs = options.minDelayMs ?? DEFAULT_MIN_DELAY_MS;
  const maxAttempts = options.maxAttempts ?? 3;
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep =
    options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const now = options.now ?? Date.now;
  const log = options.log ?? (() => {});

  const robotsByOrigin = new Map<string, RobotsRules>();
  const lastRequestAt = new Map<string, number>();
  let requestCount = 0;

  if (options.cacheDir && !existsSync(options.cacheDir)) {
    mkdirSync(options.cacheDir, { recursive: true });
  }

  function cachePath(url: string) {
    if (!options.cacheDir) return undefined;
    const key = createHash("sha1").update(url).digest("hex");
    return join(options.cacheDir, `${key}.json`);
  }

  function readCache(url: string): CachedEntry | undefined {
    const path = cachePath(url);
    if (!path || !existsSync(path)) return undefined;
    const entry = JSON.parse(readFileSync(path, "utf8")) as CachedEntry;
    const age = now() - Date.parse(entry.fetchedAt);
    if (options.maxCacheAgeMs !== undefined && age > options.maxCacheAgeMs) {
      return undefined;
    }
    return entry;
  }

  function writeCache(entry: CachedEntry) {
    const path = cachePath(entry.url);
    if (path) writeFileSync(path, JSON.stringify(entry));
  }

  async function waitForHost(origin: string) {
    const rules = robotsByOrigin.get(origin);
    const delay = Math.max(minDelayMs, (rules?.crawlDelaySeconds ?? 0) * 1000);
    const last = lastRequestAt.get(origin);
    if (last !== undefined) {
      const wait = last + delay - now();
      if (wait > 0) await sleep(wait);
    }
    lastRequestAt.set(origin, now());
  }

  async function rawGet(url: string): Promise<{ status: number; body: string }> {
    const origin = new URL(url).origin;
    for (let attempt = 1; ; attempt++) {
      await waitForHost(origin);
      requestCount++;
      const response = await fetchImpl(url, {
        headers: { "User-Agent": userAgent, Accept: "application/json, text/html;q=0.9" },
        redirect: "follow",
      });
      if ((response.status === 429 || response.status === 503) && attempt < maxAttempts) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 30_000 * 2 ** (attempt - 1);
        log(`  ${response.status} from ${origin}; waiting ${Math.round(backoffMs / 1000)} s`);
        await sleep(backoffMs);
        continue;
      }
      return { status: response.status, body: await response.text() };
    }
  }

  async function robotsFor(origin: string) {
    const cached = robotsByOrigin.get(origin);
    if (cached) return cached;
    const { status, body } = await rawGet(`${origin}/robots.txt`);
    // No robots.txt (4xx) means no restrictions; a 5xx means "assume
    // everything is disallowed" per RFC 9309.
    const rules: RobotsRules =
      status >= 500
        ? { allow: [], disallow: ["/"] }
        : status >= 400
          ? { allow: [], disallow: [] }
          : parseRobots(body, "SharkeysCatalogBot");
    robotsByOrigin.set(origin, rules);
    return rules;
  }

  async function get(url: string): Promise<FetchResult> {
    const parsed = new URL(url);
    if (BLOCKED_HOST_PATTERN.test(parsed.hostname)) throw new BlockedHostError(url);
    if (parsed.protocol !== "https:") throw new Error(`Only https URLs are fetched: ${url}`);

    const cached = readCache(url);
    if (cached) return { ...cached, fromCache: true };

    const rules = await robotsFor(parsed.origin);
    if (!isPathAllowed(rules, `${parsed.pathname}${parsed.search}`)) {
      throw new RobotsDisallowedError(url);
    }

    const { status, body } = await rawGet(url);
    const entry: CachedEntry = { url, status, body, fetchedAt: new Date(now()).toISOString() };
    // Cache successes and "gone" answers; never cache rate limits or errors.
    if (status === 200 || status === 404 || status === 410) writeCache(entry);
    return { ...entry, fromCache: false };
  }

  return {
    get,
    get requestCount() {
      return requestCount;
    },
  };
}

export type PoliteFetcher = ReturnType<typeof createPoliteFetcher>;
