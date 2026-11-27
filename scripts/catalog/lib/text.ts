/** HTML → clean text, plus helpers for finding verbatim snippets. */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  times: "×",
  deg: "°",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code =
        entity[1].toLowerCase() === "x"
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

/** Strips tags, scripts and styles; keeps block breaks as newlines. */
export function htmlToText(html: string) {
  const withoutCode = html
    .replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const withBreaks = withoutCode
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|table|ul|ol|section)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<t[dh][^>]*>/gi, " | ");
  const text = decodeEntities(withBreaks.replace(/<[^>]+>/g, " "));
  return normaliseWhitespace(text);
}

export function normaliseWhitespace(text: string) {
  return text
    .replace(/[ \t ]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter((line, index, lines) => line !== "" || lines[index - 1] !== "")
    .join("\n")
    .trim();
}

/** Lowercase, unify quotes/dashes, collapse whitespace: for loose snippet matching. */
export function looseNormalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when `snippet` really appears in `source` (whitespace/case/quote-insensitive). */
export function snippetAppearsIn(snippet: string, source: string) {
  const needle = looseNormalise(snippet);
  if (needle.length < 3) return false;
  return looseNormalise(source).includes(needle);
}

/** The match plus a little context, cut at word boundaries, verbatim from `text`. */
export function snippetAround(text: string, index: number, length: number, context = 30) {
  let start = Math.max(0, index - context);
  let end = Math.min(text.length, index + length + context);
  while (start > 0 && /\S/.test(text[start - 1]) && index - start < context + 15) start--;
  while (end < text.length && /\S/.test(text[end]) && end - (index + length) < context + 15) end++;
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/%/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60)
    .replace(/_+$/g, "");
}
