/** Shopify public product JSON (`/products.json`, `/products/<handle>.json`). */
import { z } from "zod";

const shopifyVariantSchema = z.object({
  id: z.number(),
  title: z.string().default(""),
  price: z.union([z.string(), z.number()]).transform((value) => Number(value)),
  available: z.boolean().optional(),
  option1: z.string().nullable().optional(),
  option2: z.string().nullable().optional(),
  option3: z.string().nullable().optional(),
});

export const shopifyProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  handle: z.string(),
  body_html: z.string().nullable().default(""),
  vendor: z.string().default(""),
  product_type: z.string().default(""),
  // products.json gives an array; /products/<handle>.json gives a comma string.
  tags: z
    .union([z.array(z.string()), z.string()])
    .default([])
    .transform((tags) =>
      Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
    ),
  variants: z.array(shopifyVariantSchema).default([]),
  images: z.array(z.object({ src: z.string() })).default([]),
  updated_at: z.string().optional(),
});

export type ShopifyProduct = z.infer<typeof shopifyProductSchema>;
export type ShopifyVariant = z.infer<typeof shopifyVariantSchema>;

export function parseShopifyProductList(body: string): ShopifyProduct[] {
  const json = JSON.parse(body) as { products?: unknown[] };
  return (json.products ?? []).flatMap((product) => {
    const parsed = shopifyProductSchema.safeParse(product);
    return parsed.success ? [parsed.data] : [];
  });
}

export function parseShopifyProduct(body: string): ShopifyProduct {
  const json = JSON.parse(body) as { product?: unknown };
  return shopifyProductSchema.parse(json.product);
}

export function shopifyProductUrl(baseUrl: string, handle: string) {
  return `${baseUrl.replace(/\/$/, "")}/products/${handle}`;
}

export function shopifyProductJsonUrl(baseUrl: string, handle: string) {
  return `${shopifyProductUrl(baseUrl, handle)}.json`;
}

export function shopifyListUrl(baseUrl: string, collection: string | undefined, page: number) {
  const base = baseUrl.replace(/\/$/, "");
  const path = collection ? `/collections/${collection}/products.json` : "/products.json";
  return `${base}${path}?limit=250&page=${page}`;
}

/** "/products/foo" or "/products/foo.json" → "foo". */
export function handleFromProductUrl(url: string) {
  const match = /\/products\/([^/?#]+?)(?:\.json)?(?:[?#].*)?$/.exec(new URL(url).pathname);
  return match?.[1];
}
