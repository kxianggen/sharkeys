/**
 * Minimal robots.txt parser (RFC 9309 subset): user-agent groups, Allow and
 * Disallow with `*` and `$` wildcards, longest match wins, Allow wins ties.
 * Crawl-delay is read too, so the fetcher can slow down further if asked.
 */

export type RobotsRules = {
  allow: string[];
  disallow: string[];
  crawlDelaySeconds?: number;
};

type Group = { agents: string[]; rules: RobotsRules };

export function parseRobots(text: string, userAgentToken: string): RobotsRules {
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: { allow: [], disallow: [] } };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }

    lastWasAgent = false;
    if (!current) continue;
    if (key === "allow" && value) current.rules.allow.push(value);
    if (key === "disallow" && value) current.rules.disallow.push(value);
    if (key === "crawl-delay") {
      const seconds = Number(value);
      if (Number.isFinite(seconds) && seconds >= 0) {
        current.rules.crawlDelaySeconds = seconds;
      }
    }
  }

  const token = userAgentToken.toLowerCase();
  const specific = groups.filter((group) =>
    group.agents.some((agent) => agent !== "*" && token.includes(agent)),
  );
  const chosen = specific.length > 0 ? specific : groups.filter((g) => g.agents.includes("*"));

  return chosen.reduce<RobotsRules>(
    (merged, group) => ({
      allow: [...merged.allow, ...group.rules.allow],
      disallow: [...merged.disallow, ...group.rules.disallow],
      crawlDelaySeconds: group.rules.crawlDelaySeconds ?? merged.crawlDelaySeconds,
    }),
    { allow: [], disallow: [] },
  );
}

function patternToRegExp(pattern: string) {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${body}${anchored ? "$" : ""}`);
}

/** Path plus query, e.g. "/products/foo.json?x=1". */
export function isPathAllowed(rules: RobotsRules, pathWithQuery: string) {
  let best: { length: number; allow: boolean } | null = null;

  const consider = (patterns: string[], allow: boolean) => {
    for (const pattern of patterns) {
      if (!patternToRegExp(pattern).test(pathWithQuery)) continue;
      const length = pattern.length;
      if (!best || length > best.length || (length === best.length && allow)) {
        best = { length, allow };
      }
    }
  };

  consider(rules.disallow, false);
  consider(rules.allow, true);

  return best === null ? true : (best as { allow: boolean }).allow;
}
