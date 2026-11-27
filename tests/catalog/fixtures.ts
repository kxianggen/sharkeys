/**
 * Hand-written Shopify product JSON in the shape `/products.json` returns.
 * Invented products (not copied from any vendor) so the tests run offline.
 */
import type { ShopifyProduct } from "../../scripts/catalog/lib/shopify";

export const vendorContext = {
  vendorId: "testshop",
  storeNames: ["TestShop"],
  baseUrl: "https://shop.example",
};

function product(overrides: Partial<ShopifyProduct> & { title: string; handle: string }): ShopifyProduct {
  return {
    id: 1,
    body_html: "",
    vendor: "TestShop",
    product_type: "",
    tags: [],
    variants: [],
    images: [],
    ...overrides,
  };
}

export const switchProduct = product({
  title: "[Ready Stock] Gateron Test Yellow Linear Switches",
  handle: "gateron-test-yellow",
  product_type: "Switches",
  body_html:
    "<p>A smooth linear switch.</p><ul><li>Type: Linear</li><li>Pins: 5-pin</li><li>Operating Force: 50gf</li><li>Total travel: 4.0mm</li></ul>",
  variants: [
    { id: 11, title: "10 pcs", price: 12, available: true },
    { id: 12, title: "35 pcs", price: 38.5, available: true },
    { id: 13, title: "70 pcs", price: 70, available: false },
  ],
  images: [{ src: "https://cdn.example/yellow.jpg" }],
});

export const switchNoPackSize = product({
  title: "Akko Test Silent Switch",
  handle: "akko-test-silent",
  variants: [{ id: 21, title: "Default Title", price: 30, available: true }],
});

export const kitProduct = product({
  title: "Weikav Test65 65% Aluminium Keyboard Kit",
  handle: "weikav-test65",
  vendor: "Weikav",
  body_html:
    "<p>CNC aluminium 65% barebones kit.</p><p>Gasket mount structure with PC plate.</p><p>Tri-mode: Bluetooth 5.0, 2.4G and wired USB-C.</p><p>South-facing RGB, 5-pin hot-swap PCB.</p><p>Includes plate-mounted stabilizers (2u and 6.25u).</p>",
  variants: [
    { id: 31, title: "Black", price: 300, available: true },
    { id: 32, title: "White", price: 300, available: true },
  ],
});

export const keycapProduct = product({
  title: "TestCaps Purple Cherry Profile PBT Keycaps",
  handle: "testcaps-purple",
  vendor: "TestCaps",
  body_html:
    "<p>Dye-sub PBT, Cherry profile, 142 keys.</p><p>Compatible with MX switches on 60%, 65%, 75%, TKL and full-size boards.</p>",
  variants: [{ id: 41, title: "Default Title", price: 129, available: true }],
});

export const deskMat = product({
  title: "Galaxy Desk Mat 900x400",
  handle: "galaxy-deskmat",
  variants: [{ id: 51, title: "Default Title", price: 49, available: true }],
});

export const unsupportedLayoutKit = product({
  title: "Example98 98% Keyboard Kit",
  handle: "example98",
  vendor: "Example",
  body_html: "<p>Gasket mount, hot-swap, tri-mode.</p>",
  variants: [{ id: 61, title: "Default Title", price: 250, available: true }],
});
