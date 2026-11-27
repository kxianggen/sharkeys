/**
 * Invented-parts check (v2 WS0). Done by CODE, never by the judge.
 *
 * Two levels, as HQ decided on 27 Nov:
 *  1. HARD FAIL: any component ID the app returned (build component IDs,
 *     related IDs) that is not in the catalogue. This is objective.
 *  2. POSSIBLE: the reply text names a brand or product that does not match
 *     the catalogue. Text is fuzzy, so these are only flags for a human to
 *     review by hand. They never count as failures on their own.
 *
 * Generic terms (switch families such as Cherry MX, materials such as PBT or
 * POM, mount styles) are allowlisted so they don't create noise.
 */

export type CatalogueEntry = { id: string; name: string; brand: string };

export type PossibleFlag = {
  term: string;
  reason: "brand_not_in_catalogue" | "model_not_in_catalogue";
  echoedFromUser: boolean;
};

export type InventedPartsResult = {
  unknownIds: string[];
  possible: PossibleFlag[];
};

/**
 * Real-world keyboard brands/products that are NOT in the catalogue. Seeing
 * one in a reply is worth a look (it may be a fair "we don't stock that").
 */
export const NON_CATALOGUE_BRANDS = [
  "keychron", "razer", "logitech", "corsair", "steelseries", "hyperx", "hhkb",
  "topre", "realforce", "ducky", "leopold", "varmilo", "glorious", "gmmk",
  "nuphy", "epomaker", "royal kludge", "aula", "feker", "monsgeek", "durock",
  "jwk", "novelkeys", "zeal", "zealios", "drop", "kbdfans", "tofu", "qk65",
  "mode", "rama", "mchose", "madlions", "drunkdeer", "apple magic keyboard",
  "holy panda", "banana split", "alpaca", "tangerine", "ktt", "hmx", "jwick",
  "kinesis", "moonlander", "zsa", "ergodox", "krytox", "tribosys",
] as const;

/**
 * Generic words that are fine to mention: switch families, materials, mount
 * styles, profiles, layout words. Matched case-insensitively as whole terms.
 */
export const GENERIC_ALLOWLIST = [
  "cherry mx", "mx-style", "mx style", "mx", "cherry profile", "oem profile",
  "xda", "sa profile", "pbt", "abs", "pom", "fr4", "polycarbonate", "pc",
  "brass", "steel", "aluminium", "aluminum", "carbon fibre", "carbon fiber",
  "gasket", "tray", "top mount", "screw-in", "plate-mounted", "pcb-mounted",
  "hall effect", "hall-effect", "magnetic", "linear", "tactile", "clicky",
  "hot-swap", "hotswap", "tri-mode", "bluetooth", "2.4ghz", "usb-c", "qmk",
  "via", "gh60", "tkl", "dye-sub", "doubleshot", "shine-through", "lube",
];

/** Words after a brand that don't name a model ("Akko switches"). */
const GENERIC_FOLLOWERS = new Set([
  "switch", "switches", "keycap", "keycaps", "case", "cases", "kit", "kits",
  "pcb", "plate", "plates", "stabilizer", "stabilizers", "stabs", "board",
  "boards", "keyboard", "keyboards", "linear", "linears", "tactile", "tactiles",
  "set", "sets", "is", "are", "has", "and", "or", "for", "from", "the", "a",
  "makes", "also", "parts", "one", "ones",
]);

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordRegex(term: string) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegex(term)}([^a-z0-9]|$)`, "i");
}

export function checkInventedParts(input: {
  catalogue: readonly CatalogueEntry[];
  returnedIds: readonly string[];
  replyText: string;
  userText?: string;
}): InventedPartsResult {
  const ids = new Set(input.catalogue.map((c) => c.id));
  const unknownIds = [...new Set(input.returnedIds.filter((id) => !ids.has(id)))];

  const text = input.replyText.toLowerCase();
  const user = (input.userText ?? "").toLowerCase();
  const possible: PossibleFlag[] = [];
  const seen = new Set<string>();

  const add = (term: string, reason: PossibleFlag["reason"]) => {
    if (seen.has(term)) return;
    if (GENERIC_ALLOWLIST.some((g) => g === term)) return;
    seen.add(term);
    possible.push({ term, reason, echoedFromUser: wordRegex(term).test(user) });
  };

  // 1. Known brands that are not in the catalogue at all.
  for (const brand of NON_CATALOGUE_BRANDS) {
    if (wordRegex(brand).test(text)) add(brand, "brand_not_in_catalogue");
  }

  // 2. A catalogue brand followed by a model word that no catalogue part of
  //    that brand has ("Gateron Yellow" when only "Gateron Milky Yellow Pro").
  const names = input.catalogue.map((c) => c.name.toLowerCase());
  const brands = [
    ...new Set(
      input.catalogue
        .map((c) => c.brand.toLowerCase())
        .filter((b) => b !== "unknown" && !b.startsWith("generic")),
    ),
  ];

  for (const brand of brands) {
    const re = new RegExp(
      `(^|[^a-z0-9])${escapeRegex(brand)}\\s+([a-z0-9][a-z0-9-]*)`,
      "gi",
    );
    for (const match of text.matchAll(re)) {
      const next = match[2].toLowerCase();
      if (GENERIC_FOLLOWERS.has(next)) continue;
      const phrase = `${brand} ${next}`;
      if (!names.some((n) => n.includes(phrase))) {
        add(phrase, "model_not_in_catalogue");
      }
    }
  }

  return { unknownIds, possible };
}
