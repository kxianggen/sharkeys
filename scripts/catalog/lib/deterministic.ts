/**
 * Plain-code extraction (v2 WS2, subtask 2): everything that can be read
 * reliably without an AI model. Structured Shopify fields (title, price,
 * vendor, image) are high-confidence; regex readings of the description are
 * medium-confidence hints that the AI step may confirm or the reviewer fixes.
 *
 * Rule: if a pattern is not clearly present, the field stays "unknown".
 */
import {
  emptyFields,
  known,
  unknown,
  type Candidate,
  type CandidateCategory,
  type CandidateFields,
  type Field,
} from "./fields";
import type { ShopifyProduct, ShopifyVariant } from "./shopify";
import { shopifyProductUrl } from "./shopify";
import { htmlToText, snippetAround } from "./text";

export type VendorContext = {
  vendorId: string;
  /** Store name(s) that Shopify puts in `vendor` when the real brand is unknown. */
  storeNames: string[];
  baseUrl: string;
};

/** Brands we recognise in titles when the Shopify `vendor` is the store itself. */
export const KNOWN_BRANDS = [
  "Akko", "Aula", "Ajazz", "C3 Equalz", "CannonKeys", "Cherry", "Domikey", "Durock",
  "ePBT", "Epomaker", "Everglide", "Feker", "FL Esports", "FLCMMK", "Gateron", "Gazzew",
  "GMK", "Glorious", "Haimu", "HMX", "Jerrzi", "JWK", "Kailh", "KBDfans", "Keychron",
  "KTT", "Leobog", "Leopold", "Lofree", "Mchose", "Meletrix", "MMD", "Mode", "MonsGeek",
  "NicePBT", "NuPhy", "Outemu", "Owlab", "PBTfans", "Qwertykeys", "Rainy", "Royal Kludge",
  "Tecsee", "TTC", "Varmilo", "Wobkey", "Womier", "Weikav", "Wuque", "Zuoya", "Akko",
  "Bsun", "Huano", "Kiiboom", "Kinetic Labs", "Swagkeys", "Wuque Studio", "Zeal", "Zoom",
  "K.TECHS", "FBB",
] as const;

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

/** Titles that are accessories, not parts the configurator can use. */
const NON_PART_PATTERN =
  /\b(desk ?mat|mouse ?pad|cable|wrist ?rest|lube|lubricant|puller|opener|tester|sticker|films?|springs?|keychain|artisans?|foam|bag|pouch|cover|gift ?card|brush|tools?|mouse|headset|coiled|aviator|switch ?pack sampler|o-?rings?|service|wires?|single key ?cap)\b/i;

/** Ready-built keyboards (switches and keycaps included) are not kits. */
const PREBUILT_PATTERN = /\b(pre-?built|fully assembled|assembled keyboard|with switches|w\/ ?switches)\b/i;

/**
 * The store's own product type, when it is explicit, beats title guessing.
 * `null` = not a build part. Unlisted types fall through to the title rules.
 */
const PRODUCT_TYPE_MAP: [RegExp, CandidateCategory | null][] = [
  [/^artisan/i, null],
  [/^(service|tools?|desk ?mat|accessor(y|ies)|wireless mouse|mouse|iem|palm rest|wrist rest|mouse skate|add-?ons?|spring|case foam|switch films?|lubricant|lube|top frame|cable|gift)/i, null],
  [/^key ?caps?$/i, "keycap"],
  [/^switch(es)?$/i, "switch"],
  [/^stabili[sz]ers?$/i, "stabilizer"],
  [/^(he )?pcb$/i, "pcb"],
  [/^plates?$/i, "plate"],
  [/^cases?$/i, "case"],
  [/^(keyboards?|keyboard kits?|kits?|barebones?)$/i, "kit"],
];

export function detectCategory(
  title: string,
  productType: string,
  tags: string[],
): Field<CandidateCategory> & { skipReason?: string } {
  const haystack = `${title} | ${productType} | ${tags.join(", ")}`;
  const titleOnly = title;

  const type = productType.trim();
  if (type) {
    const mapped = PRODUCT_TYPE_MAP.find(([pattern]) => pattern.test(type));
    if (mapped) {
      const [, category] = mapped;
      if (category === null) return { ...unknown<CandidateCategory>(), skipReason: `store type "${type}" is not a build part` };
      if (category === "kit" && PREBUILT_PATTERN.test(titleOnly)) {
        return { ...unknown<CandidateCategory>(), skipReason: "pre-built keyboard, not a kit" };
      }
      if (!NON_PART_PATTERN.test(titleOnly)) return known(category, 0.95, "structured", `Type: ${type}`);
    }
  }

  if (NON_PART_PATTERN.test(titleOnly)) {
    return { ...unknown<CandidateCategory>(), skipReason: "accessory, not a build part" };
  }
  if (PREBUILT_PATTERN.test(titleOnly)) {
    return { ...unknown<CandidateCategory>(), skipReason: "pre-built keyboard, not a kit" };
  }

  const rules: [CandidateCategory, RegExp][] = [
    ["keycap", /\bkey ?caps?\b/i],
    ["stabilizer", /\b(stabili[sz]ers?|stabs?)\b/i],
    ["switch", /\bswitch(es)?\b/i],
    ["kit", /\b(kit|barebones?)\b/i],
    ["plate", /\bplate\b/i],
    ["pcb", /\bpcb\b/i],
    ["case", /\bcase\b/i],
  ];

  for (const [category, pattern] of rules) {
    const match = pattern.exec(titleOnly);
    if (match) return known(category, 0.9, "structured", titleOnly);
  }
  for (const [category, pattern] of rules) {
    const match = pattern.exec(haystack);
    if (match) {
      return known(category, 0.7, "structured", snippetAround(haystack, match.index, match[0].length));
    }
  }
  return { ...unknown<CandidateCategory>(), skipReason: "no part category found" };
}

// ---------------------------------------------------------------------------
// Name, brand, description, image
// ---------------------------------------------------------------------------

export function cleanTitle(title: string) {
  return title
    .replace(/[【\[(][^】\])]*(ready ?stock|pre-?order|in ?stock|group ?buy|gb|sale|new|instock|restock)[^】\])]*[】\])]/gi, " ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s\-–|:]+|[\s\-–|:]+$/g, "")
    .trim();
}

export function detectBrand(product: ShopifyProduct, context: VendorContext): Field<string> {
  const vendor = product.vendor.trim();
  const isStore =
    !vendor || context.storeNames.some((store) => store.toLowerCase() === vendor.toLowerCase());
  if (!isStore) return known(vendor, 0.9, "structured", `vendor: ${vendor}`);

  const title = product.title;
  const sorted = [...new Set(KNOWN_BRANDS)].sort((a, b) => b.length - a.length);
  for (const brand of sorted) {
    // "Cherry Profile" / "OEM height" name a keycap shape, not the brand
    // (golden-20 bug: six keycap sets got brand "Cherry").
    const pattern = new RegExp(`(^|[^A-Za-z0-9])${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9])(?!\\s*(profile|height))`, "i");
    if (pattern.test(title)) return known(brand, 0.8, "regex", title);
  }

  // The shop's own line ("Mecha Capybara …", "Mecha X TUT …").
  const shopName = context.storeNames[0];
  if (shopName && new RegExp(`^${shopName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(title.trim())) {
    return known(shopName, 0.85, "structured", title);
  }
  // Fall back to the store's vendor field (HQ: brand from title or vendor
  // data). Low confidence: it may be a house/unbranded item, or a brand the
  // shop did not enter, so the reviewer sees it flagged.
  if (vendor) return known(shopName ?? vendor, 0.6, "structured", `vendor: ${vendor}`);
  return unknown();
}

function firstSentence(text: string, max = 220): Field<string> {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length < 20) return unknown();
  const sentence = /^(.{20,}?[.!?])(\s|$)/.exec(flat)?.[1] ?? flat;
  const cut = sentence.length > max ? `${sentence.slice(0, max).replace(/\s+\S*$/, "")}…` : sentence;
  return known(cut, 0.5, "regex", cut);
}

// ---------------------------------------------------------------------------
// Price (MYR, listed, excl. shipping)
// ---------------------------------------------------------------------------

/** A listed switch price at or under this, with no pack size, is a single switch. */
export const PER_SWITCH_MAX_MYR = 15;

/** "10 pcs", "x35", "35 switches", "Pack of 70", "70pcs/pack" → pack size. */
export function parsePackSize(text: string): number | undefined {
  const patterns = [
    /(\d{1,3})\s*(?:pcs|pieces|pc|switches|units)\b/i,
    /\bx\s?(\d{1,3})\b/i,
    /\bpack of\s*(\d{1,3})\b/i,
    /\b(\d{1,3})\s*x\b/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const size = Number(match[1]);
      if (size >= 1 && size <= 200) return size;
    }
  }
  if (/\b(per|single|1)\s*(switch|piece|pc)\b/i.test(text)) return 1;
  return undefined;
}

function variantText(variant: ShopifyVariant) {
  return [variant.title, variant.option1, variant.option2, variant.option3].filter(Boolean).join(" / ");
}

export function detectPrice(
  product: ShopifyProduct,
  category: CandidateCategory | "unknown",
): { price: Field<number>; packSize?: number; notes: string[] } {
  const notes: string[] = [];
  const priced = product.variants.filter((v) => Number.isFinite(v.price) && v.price > 0);
  if (priced.length === 0) return { price: unknown(), notes: ["no priced variant"] };

  const available = priced.filter((v) => v.available !== false);
  const pool = available.length > 0 ? available : priced;
  if (available.length === 0) notes.push("every variant is sold out; price is the listed one");

  if (category === "switch") {
    const perSwitch = pool.flatMap((variant) => {
      const size = parsePackSize(variantText(variant)) ?? parsePackSize(product.title);
      return size ? [{ variant, size, unit: variant.price / size }] : [];
    });
    if (perSwitch.length === 0) {
      // Some shops sell switches one at a time: no pack size, and every
      // variant costs what a single switch costs.
      if (pool.every((v) => v.price <= PER_SWITCH_MAX_MYR)) {
        const cheapest = [...pool].sort((a, b) => a.price - b.price)[0];
        notes.push("no pack size and the price is in the per-switch range: read as sold per switch");
        return {
          price: known(cheapest.price, 0.8, "structured", `${variantText(cheapest) || "price"}: RM${cheapest.price.toFixed(2)}`),
          packSize: 1,
          notes,
        };
      }
      notes.push("switch price is per pack but the pack size could not be read: fill in per-switch price");
      return { price: unknown(), notes };
    }
    // Per-switch price at the biggest available pack, matching how the
    // existing catalogue lists switches (RM per switch).
    const best = perSwitch.sort((a, b) => b.size - a.size)[0];
    const unit = Math.round(best.unit * 100) / 100;
    return {
      price: known(unit, 0.85, "structured", `${variantText(best.variant) || product.title}: RM${best.variant.price.toFixed(2)} / ${best.size}`),
      packSize: best.size,
      notes,
    };
  }

  // When the main versions are sold out and only much cheaper variants are
  // left, those are add-ons (a 2U stab pack, a spare plate), not the product
  // (golden-20 bug). Leave the price unknown rather than list the add-on.
  const listedMax = Math.max(...priced.map((v) => v.price));
  if (available.length > 0 && available.length < priced.length && Math.max(...available.map((v) => v.price)) < listedMax * 0.4) {
    notes.push(`only cheap variants are in stock (RM${Math.max(...available.map((v) => v.price))} vs RM${listedMax} listed): they look like add-ons, so the price is left for you`);
    return { price: unknown(), notes };
  }

  const cheapest = [...pool].sort((a, b) => a.price - b.price)[0];
  if (pool.length > 1) {
    const max = Math.max(...pool.map((v) => v.price));
    if (max > cheapest.price * 1.25) {
      notes.push(`variants range RM${cheapest.price}–RM${max}; using the cheapest (${variantText(cheapest) || "default"})`);
    }
  }
  return {
    price: known(cheapest.price, pool.length === 1 ? 0.95 : 0.85, "structured", `${variantText(cheapest) || "price"}: RM${cheapest.price.toFixed(2)}`),
    notes,
  };
}

// ---------------------------------------------------------------------------
// Regex readings of the description
// ---------------------------------------------------------------------------

type Hit = { index: number; length: number };

function find(text: string, pattern: RegExp): Hit | undefined {
  const match = pattern.exec(text);
  return match ? { index: match.index, length: match[0].length } : undefined;
}

function snip(text: string, hit: Hit) {
  return snippetAround(text, hit.index, hit.length);
}

const LAYOUT_PATTERNS: [string, RegExp][] = [
  ["60", /\b60\s?%|\b61[ -]?keys?\b/i],
  ["65", /\b65\s?%|\b6[678][ -]?keys?\b/i],
  ["75", /\b75\s?%|\b8[1-4][ -]?keys?\b/i],
  ["tkl", /\btkl\b|tenkeyless|\b80\s?%|\b87[ -]?keys?\b/i],
  ["full", /full[- ]?size|\b100\s?%|\b10[48][ -]?keys?\b/i],
];

const UNSUPPORTED_LAYOUT_PATTERN = /\b(?:40|96|98|99)\s?%|\b(?:1800|alice|split|numpad|macro ?pad)\b/i;

export function detectLayouts(
  title: string,
  text: string,
  category: CandidateCategory | "unknown",
): { field: Field<string[]>; notes: string[] } {
  const notes: string[] = [];
  const unsupported = find(title, UNSUPPORTED_LAYOUT_PATTERN);
  if (unsupported && category !== "keycap" && category !== "stabilizer" && category !== "switch") {
    notes.push(`layout "${title.slice(unsupported.index, unsupported.index + unsupported.length)}" is not in the catalogue schema (60/65/75/tkl/full)`);
    return { field: unknown(), notes };
  }

  // Board parts: one layout, read from the title first.
  if (category === "case" || category === "pcb" || category === "plate" || category === "kit") {
    for (const [layout, pattern] of LAYOUT_PATTERNS) {
      const hit = find(title, pattern);
      if (hit) return { field: known([layout], 0.9, "regex", snip(title, hit)), notes };
    }
    const found = LAYOUT_PATTERNS.flatMap(([layout, pattern]) => {
      const hit = find(text, pattern);
      return hit ? [{ layout, hit }] : [];
    });
    if (found.length === 1) {
      return { field: known([found[0].layout], 0.7, "regex", snip(text, found[0].hit)), notes };
    }
    if (found.length > 1) notes.push("description mentions several layouts; layout left unknown");
    return { field: unknown(), notes };
  }

  // "ANSI 100/80/75/60 supported" (golden-20 miss): a slash list of sizes.
  const sizeList = /\b((?:\d{2,3}%?\s*\/\s*)+\d{2,3}%?)\s*(?:%\s*)?(?:layouts?\s*)?(?:supported|compatible)/i.exec(text);
  if (category === "keycap" && sizeList) {
    const map: Record<string, string> = { "60": "60", "65": "65", "75": "75", "80": "tkl", "87": "tkl", "100": "full", "104": "full" };
    const layouts = [...new Set(sizeList[1].split("/").map((s) => map[s.replace("%", "").trim()]).filter(Boolean))];
    if (layouts.length > 0) {
      return { field: known(layouts, 0.8, "regex", snip(text, { index: sizeList.index, length: sizeList[0].length })), notes };
    }
  }

  // Keycaps and stabilisers support several layouts.
  const found = LAYOUT_PATTERNS.flatMap(([layout, pattern]) => {
    const hit = find(`${title}\n${text}`, pattern);
    return hit ? [{ layout, hit }] : [];
  });
  if (found.length > 0) {
    const source = `${title}\n${text}`;
    return {
      field: known(found.map((f) => f.layout), 0.65, "regex", snip(source, found[0].hit)),
      notes,
    };
  }
  if (category === "keycap") {
    const keyCount = find(`${title}\n${text}`, /\b(1[2-9]\d|2\d\d)\s*keys\b/i);
    if (keyCount) {
      const source = `${title}\n${text}`;
      notes.push("layouts inferred from a large key count; check the set covers each layout");
      return { field: known(["60", "65", "75", "tkl", "full"], 0.55, "regex", snip(source, keyCount)), notes };
    }
  }
  return { field: unknown(), notes };
}

function detectMounts(text: string): Field<string[]> {
  const mounts: [string, RegExp][] = [
    // "gasket" alone is often a material ("Poron gasket for top mount"), so
    // require it to be named as the mounting style.
    ["gasket_mount", /\bgasket[- ]?(mount(ed|ing)?|structure|design)\b|\bmount(ing)?(\s*(style|type))?\s*[:\-]\s*gasket\b/i],
    ["top_mount", /\btop[- ]?mount(ed)?\b/i],
    ["tray_mount", /\btray[- ]?mount(ed)?\b/i],
    ["o_ring_mount", /\bo[- ]?ring[- ]?mount(ed)?\b/i],
  ];
  const hits = mounts.flatMap(([mount, pattern]) => {
    const hit = find(text, pattern);
    return hit ? [{ mount, hit }] : [];
  });
  if (hits.length === 0) return unknown();
  return known(hits.map((h) => h.mount), 0.75, "regex", snip(text, hits[0].hit));
}

/**
 * Hall-effect evidence. "magnetic" alone is NOT enough: kit pages mention
 * "magnetic pogo pins" and "magnetic connectors" (golden-20 false positive).
 * "HE" counts only in capitals, as a word.
 */
function findHallEffect(text: string, isSwitch: boolean): Hit | undefined {
  return (
    find(text, /\bhall[- ]?effect\b|\bmagnetic[- ](switch(es)?|axis|shaft|jade|linear|tactile)\b/i) ??
    find(text, /\bHE\b/) ??
    (isSwitch ? find(text, /\bmagnetic\b/i) : undefined)
  );
}

function detectSwitchTechnology(text: string, category: CandidateCategory | "unknown"): Field<string> {
  const he = findHallEffect(text, category === "switch");
  if (he) return known("hall_effect", 0.9, "regex", snip(text, he));
  const optical = find(text, /\boptical\b/i);
  if (optical) return known("optical", 0.85, "regex", snip(text, optical));
  if (category === "switch") {
    const mx = find(text, /\b(linear|tactile|clicky)\b/i);
    if (mx) return known("mechanical", 0.7, "regex", snip(text, mx));
  }
  return unknown();
}

function detectSwitchSupport(text: string): Field<string[]> {
  const he = findHallEffect(text, false);
  if (he) return known(["hall_effect"], 0.8, "regex", snip(text, he));
  const mx = find(text, /\b(hot[- ]?swap(pable)?|mx[- ]?(style|compatible|switch(es)?)|[35][- ]?pin)\b/i);
  if (mx) return known(["mechanical"], 0.8, "regex", snip(text, mx));
  return unknown();
}

function detectPins(text: string): Field<number> {
  const hit = /\b([35])[ -]?pins?\b/i.exec(text);
  if (!hit) return unknown();
  return known(Number(hit[1]), 0.9, "regex", snip(text, { index: hit.index, length: hit[0].length }));
}

function detectForce(text: string): Field<number> {
  // "Operation Force\n| 40±10 gf" (spec tables span lines) and "Actuation: 45g".
  // The number must not follow "±" (golden-20 bug: "40±10 gf" was read as 10).
  const labelled =
    /(?:(?:actuation|operating|operation|initial|activation)\s*force|\bactuation)[^0-9±]{0,25}(\d{2,3}(?:\.\d+)?)\s*(?:±\s*\d+(?:\.\d+)?\s*)?(?:g|gf)\b/i.exec(text);
  if (labelled) {
    return known(Number(labelled[1]), 0.85, "regex", snip(text, { index: labelled.index, length: labelled[0].length }));
  }
  const bare = /(?<![±\d.]\s?)\b(\d{2,3}(?:\.\d+)?)\s*gf\b/i.exec(text);
  if (bare) {
    return known(Number(bare[1]), 0.55, "regex", snip(text, { index: bare.index, length: bare[0].length }));
  }
  return unknown();
}

function detectHotswap(text: string): { field: Field<boolean>; several: boolean } {
  const hot = find(text, /\bhot[- ]?swap(pable)?\b/i);
  const solderPcb = find(text, /\bsolder(ed)?[- ]?(only[- ]?)?pcbs?\b/i);
  // HQ rule: hot-swap AND solder PCBs on offer = several options = unknown.
  if (hot && solderPcb) return { field: unknown(), several: true };
  if (hot) return { field: known(true, 0.9, "regex", snip(text, hot)), several: false };
  const solder = solderPcb ?? find(text, /\bsolder(ed)?[- ]?only\b/i);
  if (solder) return { field: known(false, 0.6, "regex", snip(text, solder)), several: false };
  return { field: unknown(), several: false };
}

/** Note that marks a field the page offers several options for; the AI may not fill it. */
export const severalOptionsNote = (field: string) =>
  `several options: the page offers more than one ${field}; left unknown for you to pick`;

function detectConnection(text: string): Field<string> {
  const triMode = find(text, /\b(tri[- ]?mode|three[- ]?mode|3[- ]?mode)\b/i);
  if (triMode) return known("both", 0.9, "regex", snip(text, triMode));
  const wireless = find(text, /\b(bluetooth|2\.4\s?g(hz)?|wireless|bt5)\b/i);
  const wired = find(text, /\b(wired|usb[- ]?c|type[- ]?c)\b/i);
  if (wireless && wired) return known("both", 0.75, "regex", snip(text, wireless));
  if (wireless) return known("wireless", 0.6, "regex", snip(text, wireless));
  if (wired) return known("wired", 0.6, "regex", snip(text, wired));
  return unknown();
}

function detectKeycapProfile(text: string): { field: Field<string>; notes: string[] } {
  const profiles: [string, RegExp][] = [
    ["low_profile", /\blow[- ]?profile\b/i],
    ["xda", /\bxda\b/i],
    ["moa", /\bmoa\b/i],
    ["sa", /\bsa\s+(profile|height|keycaps?)\b/i],
    ["oem", /\boem\b/i],
    ["cherry", /\bcherry\s*(profile|height)?\b/i],
  ];
  const unsupported = /\b(asa|kat|kam|mda|xvx|kca|mt3|dsa|mtnu|osa|csa|ksa|dcs)\b/i.exec(text);
  for (const [profile, pattern] of profiles) {
    const hit = find(text, pattern);
    if (hit) return { field: known(profile, 0.8, "regex", snip(text, hit)), notes: [] };
  }
  if (unsupported) {
    return {
      field: unknown(),
      notes: [`keycap profile "${unsupported[0]}" is not in the catalogue schema`],
    };
  }
  return { field: unknown(), notes: [] };
}

function detectStabilizer(text: string): { type: Field<string>; support: Field<string[]>; sizes: Field<string[]>; several: boolean } {
  const types: [string, RegExp][] = [
    ["screw_in", /\bscrew[- ]?in\b/i],
    ["plate_mount", /\bplate[- ]?mount(ed)?\s*stab/i],
    ["pcb_mount", /\b(pcb[- ]?mount(ed)?|snap[- ]?in)\b/i],
  ];
  const hits = types.flatMap(([type, pattern]) => {
    const hit = find(text, pattern);
    return hit ? [{ type, hit }] : [];
  });
  // "Screw-in PCB mount" is one product: screw-in is the specific kind of
  // PCB-mount stabiliser, so screw_in wins when only those two are named.
  const screwIn = hits.find((h) => h.type === "screw_in");
  const onlyScrewAndPcb = hits.length === 2 && screwIn && hits.some((h) => h.type === "pcb_mount");
  const type: Field<string> =
    hits.length === 1
      ? known(hits[0].type, 0.85, "regex", snip(text, hits[0].hit))
      : onlyScrewAndPcb
        ? known("screw_in", 0.8, "regex", snip(text, screwIn.hit))
        : unknown();
  const support: Field<string[]> =
    hits.length > 0 ? known(hits.map((h) => h.type), 0.7, "regex", snip(text, hits[0].hit)) : unknown();

  const sizeHit = find(text, /\b6\.25\s?u\b/i);
  const sevenHit = find(text, /\b7\s?u\b/i);
  const sizes: Field<string[]> = sizeHit
    ? known(["2u", "6.25u", ...(sevenHit ? ["7u"] : [])], 0.8, "regex", snip(text, sizeHit))
    : unknown();
  return { type, support, sizes, several: hits.length > 1 && !onlyScrewAndPcb };
}

const PLATE_MATERIALS: [string, string][] = [
  ["polycarbonate", "pc|polycarbonate"],
  ["fr4", "fr-?4"],
  ["pom", "pom"],
  ["aluminum", "alumin(?:i)?um|alu"],
  ["brass", "brass"],
  ["carbon_fiber", "carbon[- ]?fib(?:er|re)"],
  ["pp", "pp"],
];

/**
 * For a plate's own title any material word counts. For a kit the material
 * must sit next to the word "plate" ("PC plate", "Plate: FR4"), because kit
 * pages also list the CASE material ("Case: Aluminum/Clear PC").
 */
function detectPlateMaterial(text: string, isPlateTitle: boolean): { field: Field<string>; several: boolean } {
  const found: { material: string; hit: Hit }[] = [];
  for (const [material, words] of PLATE_MATERIALS) {
    const pattern = isPlateTitle
      ? new RegExp(`\\b(${words})\\b`, "i")
      : new RegExp(`\\b(${words})\\s+plates?\\b|\\bplates?(\\s*material)?\\s*[:\\-]?\\s*(${words})\\b|\\b(default|stock)\\s+plate\\s*[:\\-]?\\s*(${words})\\b`, "i");
    const hit = find(text, pattern);
    if (hit) found.push({ material, hit });
  }
  // "Aluminum and polycarbonate plates", "PC/FR4 plate": several in one phrase.
  if (!isPlateTitle) {
    for (const phrase of text.matchAll(/([A-Za-z0-9 ,/&-]{3,40})\s+plates?\b/gi)) {
      for (const [material, words] of PLATE_MATERIALS) {
        if (!found.some((f) => f.material === material) && new RegExp(`\\b(${words})\\b`, "i").test(phrase[1])) {
          found.push({ material, hit: { index: phrase.index ?? 0, length: phrase[0].length } });
        }
      }
    }
  }
  if (found.length === 0) return { field: unknown(), several: false };
  // HQ rule: when the page offers several options, leave it unknown.
  if (found.length > 1 && !isPlateTitle) return { field: unknown(), several: true };
  return { field: known(found[0].material, isPlateTitle ? 0.85 : 0.8, "regex", snip(text, found[0].hit)), several: false };
}

/** Store tags like "sound_Creamy" are structured data: trust them over prose. */
function detectSoundTag(tags: string[]): Field<string> | undefined {
  const allowed = new Set(["thocky", "creamy", "clacky", "silent", "neutral"]);
  const found = tags
    .map((tag) => /^sound[_: -]+(\w+)$/i.exec(tag.trim())?.[1]?.toLowerCase())
    .map((s) => (s === "thock" ? "thocky" : s === "clack" ? "clacky" : s === "cream" ? "creamy" : s))
    .filter((s): s is string => !!s && allowed.has(s));
  const unique = [...new Set(found)];
  if (unique.length !== 1) return undefined;
  const tag = tags.find((t) => /^sound/i.test(t))!;
  return known(unique[0], 0.9, "structured", `Tags: ${tag}`);
}

function detectSound(text: string, title: string): Field<string> {
  const silent = find(title, /\bsilent\b/i);
  if (silent) return known("silent", 0.9, "regex", snip(title, silent));
  const sounds: [string, RegExp][] = [
    ["thocky", /\bthock(y)?\b/i],
    ["creamy", /\bcream(y)?\b/i],
    ["clacky", /\bclack(y)?\b/i],
  ];
  const hits = sounds.flatMap(([sound, pattern]) => {
    const hit = find(text, pattern);
    return hit ? [{ sound, hit }] : [];
  });
  if (hits.length === 1) return known(hits[0].sound, 0.6, "regex", snip(text, hits[0].hit));
  return unknown();
}

// ---------------------------------------------------------------------------
// Beginner-friendly rule (agreed by Jayson, 2026-11-28)
// ---------------------------------------------------------------------------

/** Switches at or under this per-switch price count as beginner-friendly. */
export const BEGINNER_SWITCH_MAX_MYR = 2;
export const BEGINNER_RULE_CONFIDENCE = 0.7;

/**
 * Product pages for small parts almost never say whether they suit a
 * beginner, so these follow Jayson's rule, which matches every hand-typed
 * switch, keycap and aftermarket stabiliser in the frozen catalogue:
 *   keycaps: yes · stabilisers: plate-mount yes, screw-in / PCB-mount no ·
 *   switches: Hall-effect no, otherwise yes up to RM2.00 per switch.
 * Kits are not covered: they are read from the page (AI) or by the reviewer.
 * Returns undefined when the rule cannot decide (e.g. unknown price).
 */
export function beginnerRule(category: CandidateCategory, fields: CandidateFields): Field<boolean> | undefined {
  const rule = (value: boolean, why: string) => known(value, BEGINNER_RULE_CONFIDENCE, "rule", why);
  if (category === "keycap") return rule(true, "rule: keycaps are beginner-friendly");
  if (category === "stabilizer") {
    const type = fields.stabilizerType.value;
    if (type === "plate_mount") return rule(true, "rule: plate-mount stabilizers are beginner-friendly");
    if (type === "screw_in" || type === "pcb_mount") return rule(false, `rule: ${type} stabilizers are not beginner-friendly`);
    return undefined;
  }
  if (category === "switch") {
    if (fields.switchTechnology.value === "hall_effect") return rule(false, "rule: Hall-effect switches are not beginner-friendly");
    if (fields.switchTechnology.value !== "mechanical") return undefined;
    const price = fields.price.value;
    if (typeof price !== "number") return undefined;
    return price <= BEGINNER_SWITCH_MAX_MYR
      ? rule(true, `rule: mechanical switch at RM${price} (≤ RM${BEGINNER_SWITCH_MAX_MYR})`)
      : rule(false, `rule: mechanical switch at RM${price} (> RM${BEGINNER_SWITCH_MAX_MYR})`);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Whole product → candidate
// ---------------------------------------------------------------------------

const KIT_EVIDENCE_PATTERN = /\b(barebones?|bare ?bone|kit|diy|without switch(es)?|no switch(es)?|switchless)\b/i;

export type MappedProduct =
  | { kind: "candidate"; candidate: Candidate }
  | { kind: "skipped"; key: string; title: string; sourceUrl: string; reason: string };

export function mapShopifyProduct(product: ShopifyProduct, context: VendorContext): MappedProduct {
  const key = `${context.vendorId}:${product.handle}`;
  const sourceUrl = shopifyProductUrl(context.baseUrl, product.handle);
  const category = detectCategory(product.title, product.product_type, product.tags);
  if (category.value === "unknown") {
    return { kind: "skipped", key, title: product.title, sourceUrl, reason: category.skipReason ?? "unknown category" };
  }

  const title = cleanTitle(product.title);
  const body = htmlToText(product.body_html ?? "");
  const variantNames = [...new Set(product.variants.map(variantText).filter((v) => v && v !== "Default Title"))];
  // What the AI and the reviewer read: title, type, tags, variants and description.
  const sourceText = [
    `Title: ${product.title}`,
    product.product_type ? `Type: ${product.product_type}` : "",
    product.tags.length ? `Tags: ${product.tags.join(", ")}` : "",
    variantNames.length ? `Variants: ${variantNames.slice(0, 20).join(" | ")}` : "",
    body,
  ]
    .filter(Boolean)
    .join("\n");

  const cat = category.value;

  // A "keyboard" is only a kit when the page says so; otherwise it may be a
  // pre-built board whose price includes switches and keycaps.
  if (cat === "kit" && !KIT_EVIDENCE_PATTERN.test(sourceText)) {
    return { kind: "skipped", key, title: product.title, sourceUrl, reason: "keyboard not described as barebones/kit (may be pre-built)" };
  }
  const notes: string[] = [];
  const fields: CandidateFields = emptyFields();

  fields.name = known(title, 0.95, "structured", product.title);
  fields.brand = detectBrand(product, context);
  fields.description = firstSentence(body);
  if (product.images[0]) {
    fields.imageUrl = known(product.images[0].src, 0.95, "structured", "first product image");
  }

  const price = detectPrice(product, cat);
  fields.price = price.price;
  notes.push(...price.notes);

  const layouts = detectLayouts(product.title, body, cat);
  fields.layouts = layouts.field;
  notes.push(...layouts.notes);

  const text = sourceText;
  if (cat === "case" || cat === "pcb" || cat === "plate" || cat === "kit") {
    fields.mountSupport = detectMounts(text);
  }
  if (cat === "pcb" || cat === "plate" || cat === "kit") {
    fields.switchTechnologySupport = detectSwitchSupport(text);
  }
  if (cat === "pcb" || cat === "kit") {
    const hotswap = detectHotswap(text);
    fields.hotswap = hotswap.field;
    if (hotswap.several) notes.push(severalOptionsNote("hotswap"));
    fields.connection = detectConnection(text);
  }
  if (cat === "switch") {
    fields.switchTechnology = detectSwitchTechnology(text, cat);
    fields.pinCount = detectPins(text);
    fields.actuationForceG = detectForce(text);
  }
  if (cat === "keycap") {
    const profile = detectKeycapProfile(text);
    fields.keycapProfile = profile.field;
    notes.push(...profile.notes);
    // Keycaps are MX-stem unless the text says otherwise.
    const stem = find(text, /\b(mx|cherry mx)[- ]?(stem|compatible|switch(es)?)?\b/i);
    if (stem) fields.switchTechnologySupport = known(["mechanical"], 0.8, "regex", snip(text, stem));
    // Otherwise "profile implies MX stem" is applied in deriveFields (review.ts),
    // so the importer and the blind pass get the same rule.
  }
  if (cat === "stabilizer" || cat === "pcb" || cat === "kit") {
    const stab = detectStabilizer(text);
    if (stab.several) notes.push(severalOptionsNote("stabilizerType"));
    if (cat === "stabilizer") {
      fields.stabilizerType = stab.type;
      fields.stabilizerSizes = stab.sizes;
    } else {
      fields.stabilizerTypeSupport = stab.support;
      if (cat === "kit") {
        fields.stabilizerType = stab.type;
        fields.stabilizerSizes = stab.sizes;
      }
    }
  }
  if (cat === "plate" || cat === "kit") {
    const plate = cat === "plate" ? detectPlateMaterial(product.title, true) : detectPlateMaterial(text, false);
    fields.plateMaterial = plate.field;
    if (plate.several) notes.push(severalOptionsNote("plateMaterial"));
  }
  if (cat !== "pcb" && cat !== "stabilizer") {
    fields.soundProfile = detectSoundTag(product.tags) ?? detectSound(text, product.title);
  }

  return {
    kind: "candidate",
    candidate: {
      key,
      vendorId: context.vendorId,
      sourceUrl,
      sourceText,
      category: { value: cat, confidence: category.confidence, source: category.source, snippet: category.snippet },
      fields,
      packSize: price.packSize,
      notes,
    },
  };
}
