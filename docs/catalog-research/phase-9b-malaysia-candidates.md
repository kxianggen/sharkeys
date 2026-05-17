# Phase 9B Malaysia Catalog Research

## Research Scope

This document is a research-only shortlist for improving the sharkeys Malaysia-local component catalog. It was prepared from public product/category pages on MKB.MY (`https://mkb.gg/`) and KeebsProject (`https://www.keebsproject.com/`) on 2026-05-17.

No application catalog data, Supabase seed data, migrations, API code, or live Supabase records were changed in this phase.

Retailers are recorded only as source/provenance. The catalog `brand` should use the actual manufacturer or product brand where clear. If a product appears to be house-brand/private-label, this document marks the brand/manufacturer as needing verification rather than silently using the retailer as the manufacturer.

## Selection Principles

The goal is compatibility coverage, not copying every product from a storefront. Candidates were selected to give the rule engine a useful spread of layouts, materials, connection types, switch technologies, stabilizer types, keycap profiles, price tiers, and beginner/enthusiast options.

Important modeling cautions:

- Prices and stock counts are research snapshots only, not live inventory guarantees.
- Full keyboard kits can later be split into kit-derived catalog records for `case`, `pcb`, `plate`, and sometimes `stabilizer`.
- Specs not explicitly shown by the retailer are marked as `needs verification` or `inferred`.
- Sound profile is a prototype classification based on materials, switch description, or vendor wording. It should not be treated as measured audio.

## Recommended Shortlist Summary

| Category | Candidate count | Why included |
|---|---:|---|
| Barebones / keyboard kit anchors | 13 | Covers 65%, 75%, and TKL/80%; wired and tri-mode; plastic/budget and aluminum/premium; screw-in, plate-mount, and PCB-mounted stabilizer examples. |
| Switches | 15 | Covers linear, tactile, clicky, silent, budget, premium/smooth, creamy, thocky, clacky, silent, and neutral profiles. Mostly MX-style mechanical switches. |
| Keycap sets | 10 | Covers Cherry, OEM, MOA, XDA, PBT, shine-through/translucent options, and broad layout support where stated. |
| Stabilizer kits | 6 | Covers plate-mounted, screw-in, clip-in/PCB-mounted, 6.25u, 7u, and PCB-thickness caveats. |

## Barebones / Keyboard Kit Candidates

| ID | Product | Brand | Layout | Material | Connection | Mount | Stabilizer support | Hotswap / switch support | Price | Source URL | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K01 | Keychron V2 | Keychron | 65% | Plastic case, stainless steel plate | Wired Type-C | Tray-like / standard Keychron V-series mount, exact mount needs verification | Prelubed screw-in stabilizers | South-facing 5-pin hot-swap, MX mechanical | RM279 barebone; RM389 assembled variants shown | https://mkb.gg/products/keychron-v2 | High | Strong wired 65% baseline with QMK/VIA. |
| K02 | Keychron V2 Max | Keychron | 65%, 66 keys | ABS plastic, PC plate | Both: Type-C, 2.4 GHz, Bluetooth 5.1 | Gasket / acoustic mount needs verification from official specs | PCB-mounted screw-in stabilizers | South-facing hot-swap, likely 3/5-pin MX mechanical; assembled uses Gateron Jupiter | RM359 barebone; RM449-RM459 assembled variants shown | https://mkb.gg/products/keychron-v2-max | High | Strong beginner tri-mode 65% catalog anchor. |
| K03 | Join65 | Join / Kinfelab needs verification | 65% | CNC 6063 aluminum, FR4 plate, PVD stainless weight | Wired, inferred from daughterboard/QMK kit; wireless not listed | Plate gasket | Stabilizer type not listed; likely PCB-mount/screw-in support but needs verification | Hotswap PCB, 1.2 mm, QMK/VIA, MX mechanical | RM749 | https://mkb.gg/products/join65 | Medium | Premium enthusiast 65%; great for aluminum/gasket/QMK coverage. |
| K04 | Keychron Q1 V2 | Keychron | 75%, 81/82 keys | CNC aluminum body, stainless steel plate | Wired Type-C | Double gasket | Prelubed screw-in stabilizers | South-facing 5-pin hot-swap, MX mechanical; QMK/VIA | RM649 | https://mkb.gg/products/keychron-q1-v2 | High | Premium wired 75% reference with strong specs. |
| K05 | Monsgeek M1W | Monsgeek | 75% | CNC aluminum body, PC plate | Both: wired, Bluetooth, 2.4 GHz | Gasket | Prelubed stabilizers; exact type needs verification | South-facing 5-pin hot-swap, MX mechanical | RM349 shown | https://mkb.gg/products/monsgeek-m1 | High | Aluminum tri-mode 75%; strong value/premium bridge. |
| K06 | MMD75 | MMD | 75%, 82 keys | Plastic case likely, material not listed | Both: Bluetooth, 2.4 GHz, Type-C | Not listed | Prelubed stabilizers; type needs verification | 5-pin hot-swap, MX mechanical | RM249 | https://mkb.gg/products/mmd75 | Medium | Budget tri-mode 75%; mount/material need manual confirmation. |
| K07 | AL75 V2 | AL / manufacturer needs verification | 75%, 82 keys + knob | CNC anodized aluminum, FR4 plate; black variant PC plate | Both: USB-C, 2.4 GHz, Bluetooth | Gasket | Stabilizer support not listed; needs verification | Hot-swap 3/5-pin, south-facing RGB, MX mechanical | RM339 sale / RM409 regular | https://www.keebsproject.com/product/ready-stock-al75-v2-wireless-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-gasket-customized | Medium | Strong aluminum tri-mode 75%; brand/stabilizers need confirmation. |
| K08 | Weikav Star 80 | Weikav | TKL / 80%, 87 keys | Full CNC aluminum, FR4 plate | Both: USB-C, 2.4 GHz, Bluetooth 5.0 | PCB-mounted gasket structure | PCB-mounted stabilizers | Hot-swappable MX-style mechanical switches, QMK/VIA | RM395 sale / RM399 regular | https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project | High | Excellent TKL premium anchor; clear PCB-mounted stabilizer example. |
| K09 | Yunzii B87 | Yunzii | 80% / TKL, 87 keys | ABS frame, included MOA PBT keycaps | Both: Type-C, Bluetooth, 2.4 GHz | Gasket | Stabilizer support not listed; needs verification | Full-key hot-swap, 3/5-pin MX mechanical; QMK/VIA | RM319-RM399 | https://www.keebsproject.com/product/ready-stock-yunzii-b87-80-viaqmk-full-kit-custom-mechanical-keyboard | High | Beginner-friendly TKL/80% full kit with QMK/VIA and tri-mode. |
| K10 | Keychron V3 | Keychron | TKL | Plastic case, stainless steel plate | Wired Type-C | Tray-like / standard Keychron V-series mount, exact mount needs verification | Prelubed screw-in stabilizers | South-facing 5-pin hot-swap, MX mechanical; QMK/VIA | RM389 assembled variants shown; barebone variants listed but sold out at snapshot | https://mkb.gg/products/keychron-v3 | High | Wired TKL reference with QMK/VIA and screw-in stabilizers. |
| K11 | MKB White65 | MKB house/private-label; ODM needs verification | 65%, 68 keys | Plastic/polycarbonate-like budget shell inferred; PC plate shown in images/spec text | Both: Bluetooth, 2.4 GHz, Type-C | Silicone gasket | Plate-mounted stabilizers | 5-pin hot-swap, north-facing RGB, MX mechanical | RM149 | https://mkb.gg/products/mkb-white65 | Medium | Useful budget 65% and plate-mounted stabilizer example, but manufacturer identity needs verification. |
| K12 | Yunzii C68 MEOW | Yunzii | 65%, 68 keys | Silicone case, included MOA PBT keycaps | Both: Type-C, Bluetooth, 2.4 GHz | Not listed | Stabilizer support not listed; needs verification | Hot-swappable, MX mechanical; switch choice Milk Linear | RM439-RM499 | https://www.keebsproject.com/product/ready-stock-yunzii-c68-meow-65-silicon-full-kit-custom-mechanical-keyboard | Medium | Distinct silicone-case 65% full kit; useful for beginner/cute build variety. |
| K13 | Yunzii QL75 | Yunzii | 75%, 84 keys | Typewriter-style body; material not listed | Both: Type-C, Bluetooth 5.0, 2.4 GHz | Top mount | Stabilizer support not listed; needs verification | Full-key hot-swap, 3/5-pin MX mechanical; QMK/VIA | RM439-RM499 | https://www.keebsproject.com/product/ready-stock-yunzii-ql75-75-typewriter-full-kit-custom-mechanical-keyboard | Medium | Distinct top-mounted 75% with retro/typewriter design; good for layout and use-case variety. |

### Source Re-check / Availability Snapshot

Re-checked on 2026-05-17. Availability should still be treated as volatile and must be checked again before implementation or seeding.

| Candidate | Re-check status | Implementation implication |
|---|---|---|
| Keychron V2 | Mixed/variant-specific. MKB page labels the product as sold out, with most variants sold out; one barebone-looking variant text appears without an explicit sold-out suffix, so availability is ambiguous. | Good spec reference, but do not implement as currently available until the exact SKU can be confirmed. |
| Keychron V2 Max | Assembled Jupiter Red/Banana variants appear orderable, but barebone variant is marked sold out. | Can be implemented as a full-kit/kit-derived candidate only if using assembled SKU assumptions; barebone-specific modeling needs confirmation. |
| Join65 | MKB page marks all listed variants sold out. | Reference-only / hold for later. Good premium 65% modeling example but not a first implementation product. |
| Keychron Q1 V2 | MKB page marks all listed variants sold out. | Reference-only / hold for later unless another Malaysia-accessible listing is found. |
| Monsgeek M1W | MKB page marks all listed color variants sold out. | Reference-only / hold for later despite strong specs. |
| MMD75 | MKB page marks white and black variants sold out. | Hold until stock returns or another source is verified. |
| AL75 V2 | KeebsProject page shows available units and clear layout/material/connection/plate specs. Stabilizer type remains unclear. | Implementation-ready if stabilizer is modeled as `needs verification` or omitted from kit-derived stabilizer records. |
| Weikav Star 80 | KeebsProject page shows available units and clear aluminum, FR4, QMK/VIA, PCB-mounted stabilizer, and tri-mode specs. | Implementation-ready now. Strongest TKL anchor. |
| Yunzii B87 | KeebsProject page shows available units and clear layout, ABS frame, gasket, tri-mode, QMK/VIA, hot-swap, and keycap specs. Stabilizer type remains unclear. | Implementation-ready now if stabilizer type is marked unknown. |
| Keychron V3 | MKB page marks all listed variants sold out. | Reference-only / hold for later. Good wired TKL spec reference. |
| MKB White65 | MKB page marks default title sold out, but specs are unusually clear for plate-mounted stabilizers and PC plate. Manufacturer/house-brand status needs a decision. | Hold for later or use only as reference for plate-mount stabilizer path. |
| Yunzii C68 MEOW | KeebsProject page shows available units and clear 65%, silicone, tri-mode, hot-swap, MOA/PBT specs. Stabilizer type and mount are unclear. | Implementation-ready as a beginner/full-kit 65% if stabilizer/mount unknowns are explicitly modeled. |
| Yunzii QL75 | KeebsProject page shows available units and clear 75%, top mount, tri-mode, QMK/VIA, hot-swap specs. Stabilizer type and case material remain unclear. | Implementation-ready as a 75% top-mount full-kit if stabilizer/case material unknowns are explicitly modeled. |

### Keyboard Kit Modeling Notes

- K01 Keychron V2:
  - Model case: 65% plastic/V-series case, wired.
  - Model PCB: 65%, wired Type-C, south-facing RGB, QMK/VIA, 5-pin hot-swap.
  - Model plate: 65% stainless steel.
  - Model stabilizer: screw-in, prelubed, likely 6.25u spacebar; exact sizes need verification.
  - Uncertain specs: mount style terminology.

- K02 Keychron V2 Max:
  - Model case: 65% ABS plastic, tri-mode, 4000 mAh battery.
  - Model PCB: 65%, Type-C/2.4 GHz/Bluetooth, south-facing RGB, hot-swap.
  - Model plate: PC.
  - Model stabilizer: PCB-mounted screw-in.
  - Uncertain specs: barebone stabilizer included yes likely, but verify exact kit contents.

- K03 Join65:
  - Model case: 65% CNC 6063 aluminum with weight.
  - Model PCB: 65%, 1.2 mm hot-swap PCB, QMK/VIA, daughterboard.
  - Model plate: FR4.
  - Model stabilizer: not included/listed; mark required and needs verification.
  - Uncertain specs: stabilizer type, exact layout variants, wired-only assumption.

- K04 Keychron Q1 V2:
  - Model case: 75% CNC aluminum, wired.
  - Model PCB: 75%, QMK/VIA, south-facing 5-pin hot-swap.
  - Model plate: stainless steel.
  - Model stabilizer: screw-in, prelubed.
  - Uncertain specs: knob/no-knob SKU selection.

- K05 Monsgeek M1W:
  - Model case: 75% CNC aluminum, tri-mode, 6000 mAh battery.
  - Model PCB: 75%, south-facing 5-pin hot-swap, Monsgeek software.
  - Model plate: PC.
  - Model stabilizer: prelubed; exact plate/PCB/screw-in type needs verification.
  - Uncertain specs: stabilizer type and VIA support.

- K06 MMD75:
  - Model case: 75% budget tri-mode kit.
  - Model PCB: 75%, 5-pin hot-swap, Bluetooth/2.4 GHz/Type-C.
  - Model plate: not listed; needs verification.
  - Model stabilizer: prelubed; type needs verification.
  - Uncertain specs: case material, plate material, mount, stabilizer type.

- K07 AL75 V2:
  - Model case: 75% CNC aluminum, tri-mode, gasket.
  - Model PCB: 75%, flex-cut, hot-swap 3/5-pin.
  - Model plate: FR4 generally, PC for black variant.
  - Model stabilizer: required/unknown until verified.
  - Uncertain specs: actual manufacturer/brand, stabilizer type.

- K08 Weikav Star 80:
  - Model case: TKL CNC aluminum, tri-mode.
  - Model PCB: TKL, QMK/VIA, MX hot-swap, Bluetooth/2.4 GHz/USB-C.
  - Model plate: FR4.
  - Model stabilizer: PCB-mounted.
  - Uncertain specs: exact stabilizer sizes.

- K09 Yunzii B87:
  - Model case: TKL/80% ABS full kit.
  - Model PCB: TKL, QMK/VIA, tri-mode, 3/5-pin hot-swap.
  - Model plate: not listed; needs verification.
  - Model stabilizer: included in full keyboard but type not listed.
  - Uncertain specs: plate material and stabilizer type.

- K10 Keychron V3:
  - Model case: TKL plastic/V-series case, wired.
  - Model PCB: TKL, QMK/VIA, 5-pin hot-swap, south-facing RGB.
  - Model plate: stainless steel.
  - Model stabilizer: screw-in, prelubed.
  - Uncertain specs: mount terminology and barebone availability.

- K11 MKB White65:
  - Model case: 65% budget plastic/polycarbonate-like case, tri-mode.
  - Model PCB: 65%, 5-pin hot-swap, north-facing RGB, non-flex-cut.
  - Model plate: PC.
  - Model stabilizer: plate-mounted.
  - Uncertain specs: actual ODM/manufacturer; use only if acceptable as private-label after verification.

- K12 Yunzii C68 MEOW:
  - Model case: 65% silicone case, tri-mode.
  - Model PCB: 65%, hot-swap, south-facing RGB, Type-C/Bluetooth/2.4 GHz.
  - Model plate: not listed; needs verification.
  - Model stabilizer: included in full keyboard but type not listed.
  - Uncertain specs: mount structure, plate material, stabilizer type.

- K13 Yunzii QL75:
  - Model case: 75% typewriter-style case with knobs/toggle, tri-mode.
  - Model PCB: 75%, QMK/VIA, hot-swap 3/5-pin, Type-C/Bluetooth/2.4 GHz.
  - Model plate: not listed; needs verification.
  - Model stabilizer: included in full keyboard but type not listed.
  - Uncertain specs: case material, plate material, stabilizer type.

## Switch Candidates

| Product | Brand | Type | Pins | Force | Sound profile | Price | Source URL | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Gateron Milky Yellow Pro | Gateron | Linear | 5-pin | 50g actuation | creamy / neutral | RM0.87 stock; RM1.86 hand-lubed | https://mkb.gg/products/gateron-milky-yellow-pro | High | Budget all-rounder, factory pre-lubed, MX stem. |
| Gateron Oil King | Gateron | Linear | 5-pin | 55g actuation | thocky / premium smooth | RM2.90 each; bundle listing also exists | https://mkb.gg/products/gateron-oil-king | High | Premium smooth linear; nylon housing/POM stem. |
| Gateron Seasalt Smoothie | Gateron | Linear | needs verification | needs verification | creamy / smooth | RM1.50 shown in MKB Gateron collection | https://mkb.gg/collections/gateron | Medium | Good smooth/creamy coverage; exact specs need product-page verification. |
| Akko Cream Yellow V3 Pro | Akko | Linear | 5-pin | 50+/-10gf operating | creamy / clacky | RM1.00 MKB; RM1.30-RM2.50 KeebsProject | https://mkb.gg/products/akko-cream-yellow-v3-pro | High | Budget linear, clear specs. |
| Akko Lavender Purple V3 Pro | Akko | Tactile | 5-pin | 45+/-10gf operating | neutral / tactile | RM1.05 | https://mkb.gg/products/akko-lavender-purple-v3-pro | High | Tactile coverage with clear specs. |
| Akko Penguin Silent | Akko | Silent tactile | 5-pin | 43gf operating, 58gf tactile, 60gf max bottom | silent | RM1.90-RM2.60 | https://www.keebsproject.com/product/ready-stock-new-akko-penguin-silent-switch-5pin-tactile-switches-for-mechanical-keyboard-keebs-project | High | Strong office/silent candidate. |
| Akko Fairy | Akko | Silent linear, inferred from Akko naming | likely 5-pin, needs verification | needs verification | silent | RM1.70 shown in MKB Akko collection | https://mkb.gg/collections/akko | Low | Keep as future candidate until exact specs are verified. |
| Akko Creamy Cyan | Akko | Clicky | needs verification | 50+/-7gf operating; 65+/-7gf tactile | clacky / clicky | RM1.80 | https://www.keebsproject.com/product/ready-stock-new-akko-creamy-cyan-switch-5-pin-clicky-switches-for-mechanical-keyboard-keebsproject | High | Useful clicky candidate from KeebsProject. |
| MMD Holy Panda V3 | MMD | Tactile | 3-pin | 55+/-5g actuation, 62+/-5g bottom-out | thocky | RM0.79 stock | https://mkb.gg/products/mmd-holy-panda | High | Budget tactile/thocky coverage; 3-pin plate-mount wording on page. |
| MMD Princess Linear V3 | MMD | Linear | 5-pin | 53g actuation, 60g bottom-out | creamy / clacky | RM0.94 | https://mkb.gg/products/mmd-princess | High | Budget linear with clear specs. |
| KTT Kang White V4 | KTT | Linear | 3-pin | 45g actuation, 55g bottom-out | clacky / neutral | RM0.80-RM2.50 | https://www.keebsproject.com/product/ready-stock-ktt-kang-white-v4-newest-linear-switch-3-pin-ready-stock-malaysia-for-mechanical-keyboard | High | Budget linear; clear 3-pin compatibility case. |
| KTT Moon Laurel | KTT | Linear | needs verification | needs verification | thocky / creamy | RM2.10-RM3.60 from KeebsProject switch collection | https://www.keebsproject.com/collection/switches | Medium | Strong sound-profile candidate; product page/specs need verification. |
| Outemu Peach Silent V2 | Outemu | Silent linear | 5-pin | needs verification | silent | RM1.50-RM3.10 | https://www.keebsproject.com/product/ready-stock-outemu-peach-silent-v2-5pin-linear-switch-for-mechanical-keyboard | Medium | Good quiet-office candidate; page confirms materials and 5-pin but not force in captured text. |
| Outemu Ocean Blue | Outemu | Clicky | needs verification | needs verification | clacky / clicky | RM1.20 | https://www.keebsproject.com/product/ready-stock-outemu-ocean-blue-clicky-switches-switch-for-mechanical-or-gaming-keyboards-keebsproject | Medium | Budget clicky candidate; exact specs need verification. |
| Everglide Wild Pansy V2 | Everglide | Tactile | 5-pin | 40+/-5gf actuation, 48+/-5gf bottom-out | neutral / tactile | RM2.10 | https://mkb.gg/products/everglide-wild-pansy | High | Premium tactile with clear specs. |

### Future / Unsupported Switch Candidates

| Product | Brand | Technology | Why not primary yet | Source URL |
|---|---|---|---|---|
| Gateron Magnetic Jade Pro | Gateron | hall_effect | MKB carries it, but the current shortlist does not include a hall-effect-compatible board, so including it would create invalid recommendations without a matching PCB. | https://mkb.gg/collections/gateron |

## Keycap Candidates

Implementation rule for keycaps:

- Do not use retailer/shop names as the product brand.
- Do not use `GMK`, `GMK ICON`, or other premium brand names as the catalog brand unless authenticity/manufacturer is verified from the product page or another reliable manufacturer source.
- If the manufacturer is unclear, use `Unknown` as the implementation brand/manufacturer and store `MKB.MY` or `KeebsProject` only as retailer/source metadata.
- Product names can preserve the visible listing name for traceability, but the catalog brand field should not imply authenticity that was not verified.

| Product | Brand | Profile | Material | Key count | Layout coverage | Price | Source URL | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|---|
| MKB Valkyrie | MKB house/private-label; designer/manufacturer needs verification | Cherry | PBT double-shot | 125 | Broad mechanical layouts shown visually; exact coverage needs verification | RM129 sale / RM189 regular | https://mkb.gg/products/mkb-valkyrie | Medium | Good Cherry/PBT set, but manufacturer should be verified before catalog brand use. |
| MKB Gradient Keycap - Polar Day / Mystic / Blackberry | MKB house/private-label; manufacturer needs verification | Cherry | PBT dye-sub shine-through or PBT double-shot shine-through depending variant | 133 / 140 / 137 | Broad coverage likely; exact layouts need verification | RM139 | https://mkb.gg/products/mkb-gradient-keycap | Medium | Useful shine-through Cherry option. |
| Pudding | Manufacturer unknown | OEM | PBT double-shot | 117 | Likely full/TKL/75/65/60 coverage, needs verification | RM45 | https://mkb.gg/products/pudding | Medium | Budget shine-through/translucent option. |
| Poker Pudding | Manufacturer unknown | OEM | PBT + PC dye-sub | 122 | Likely broad coverage, needs verification | RM139 sale / RM159 regular | https://mkb.gg/products/poker-pudding-keycap-set | Medium | Higher visual variety pudding set. |
| MKB Standard White (JP) | MKB house/private-label; manufacturer needs verification | Cherry, inferred from listing title | Material not captured in search snippet; needs verification | needs verification | likely broad coverage | RM99 shown in MKB keycap collection | https://mkb.gg/collections/keycaps | Low | Good neutral/office JP set candidate; exact product page/specs needed. |
| GMK ICON Retro 9009 PBT | Manufacturer unknown; “GMK ICON” naming needs verification | Cherry | PBT | 140+ | Listed compatibility: 61/64/68/75/84/87/96/980/104/108 | RM119 | https://www.keebsproject.com/product/ready-stock-gmk-icon-retro-9009-keycaps-pbt-cherry-profile-all-layouts-keebsproject | High | Strong broad-layout Cherry set from KeebsProject. |
| GMK Illusion Sky Blue | Manufacturer unknown; “GMK” naming needs verification | Cherry | Double-shot PBT | 173 | Supports 60%, TKL, 75%, 96%, full-sized | RM119 | https://www.keebsproject.com/product/ready-stock-gmk-illusion-sky-blue-cherry-profile-doubleshot-pbt-keycaps | High | Broad coverage, clean colorway. |
| Tarot Purple | Manufacturer unknown | MOA | Dye-sub, material likely PBT but needs verification | Full set, exact count needs verification | MX mechanical full set; exact layout coverage needs verification | RM119 | https://www.keebsproject.com/collection/keycaps | Medium | MOA profile coverage; exact product page/specs should be opened before implementation. |
| Seasonic Sea Themed | Manufacturer unknown | XDA | PBT dye-sub | needs verification | broad coverage needs verification | RM99 | https://www.keebsproject.com/product/ready-stock-seasonic-sea-themed-keycap-set-xda-profile-pbt-dye-sub-blue-keycaps-keebs-project | Medium | XDA profile coverage, blue maritime styling fits sharkeys theme. |
| Gameboy NGC Purple | Manufacturer unknown | OEM | PBT dye-sub | full set, exact count needs verification | likely broad MX layout coverage | RM119 | https://www.keebsproject.com/collection/keycaps | Medium | Useful OEM non-shine-through alternative; exact page should be verified. |

## Stabilizer Candidates

| Product | Brand | Type | Sizes | PCB thickness notes | Price | Source URL | Confidence | Notes |
|---|---|---|---|---|---|---|---|---|
| TX Stabilizers Set | TX | Clip-in, screw-in, and plate-mount variants depending SKU | WK: 4x 2u + 6.25u; WK/WKL includes 6.25u and 7u; 2U kit available | Compatible with 1.6 mm PCB only; shims required for 1.2 mm PCB | From RM43 in tools collection; RM75 page price shown | https://mkb.gg/products/tx-stabilizers-set | High | Best all-round stabilizer modeling candidate because variants expose multiple types. |
| Owlab V3 Screw-In Stabilizers | Owlab | Screw-in | 4x 2u + 1x 6.25u | PCB thickness not listed | RM79 | https://mkb.gg/products/owlab-v3-screw-in-stabilizers | High | Premium screw-in 6.25u kit. |
| C³ Equalz Screw-In Stabilizers V3 | C³ Equalz | Screw-in | 4x 2u + 1x 6.25u + 1x 7u bar | PCB thickness not listed | RM69 | https://mkb.gg/products/c-equalz-screw-in-stabilizers-v3 | High | Strong 6.25u + 7u support. |
| Everglide V3 Screw-In Stabilizers | Everglide | Screw-in | 4x 2u + 1x 6.25u | Page says improved compatibility with more PCBs; exact thickness not listed | RM63 | https://mkb.gg/products/everglide-v3-screw-in-stabilizers | High | Good alternate screw-in kit. |
| SP-Star Plate Mounted Stabilizers | SP-Star | Plate-mounted | 4x 2u + 1x 6.25u | PCB thickness not applicable for plate mount | RM23 | https://mkb.gg/products/sp-star-plate-mounted-stabilizers | High | Budget plate-mounted stabilizer candidate. |
| FLCMMK Fulin V3 Plate Mounted Stabilizers | FLCMMK | Plate-mounted | 7x 2u + 1x 6.25u | PCB thickness not applicable for plate mount | RM33 | https://mkb.gg/products/flcmmk-fulin-v3-plate-mounted-stabilizers | High | More complete plate-mount kit; good for larger layouts. |

## Compatibility Coverage Check

- 65%: Covered by Keychron V2, Keychron V2 Max, Join65, Yunzii C68, and MKB White65/private-label candidate.
- 75%: Covered by Keychron Q1 V2, Monsgeek M1W, MMD75, AL75 V2, and Yunzii QL75.
- TKL / 80%: Covered by Weikav Star 80, Yunzii B87, and Keychron V3 as a reference candidate.
- Wired: Covered by Keychron V2, Keychron Q1 V2, Keychron V3, and likely Join65 as reference candidates; a currently stocked wired-only kit still needs confirmation before implementation.
- Tri-mode / wireless: Covered by Keychron V2 Max, Monsgeek M1W, MMD75, AL75 V2, Weikav Star 80, Yunzii B87, Yunzii C68, and Yunzii QL75.
- Plastic / budget: Covered by Keychron V2/V2 Max, MMD75, Yunzii B87, Yunzii C68, and MKB White65/private-label candidate.
- Aluminum / premium: Covered by Join65, Keychron Q1 V2, Monsgeek M1W, AL75 V2, and Weikav Star 80.
- Plate-mount stabilizers: Covered by MKB White65/private-label candidate and standalone SP-Star/FLCMMK/Everglide plate-mounted stabilizers.
- Screw-in stabilizers: Covered by Keychron V2, V2 Max, Q1 V2, V3, and standalone Owlab/C³ Equalz/TX/Everglide screw-in kits.
- PCB-mounted stabilizers: Covered by Weikav Star 80 and TX clip-in/PCB-mount-style variants.
- Linear switches: Covered by Gateron Milky Yellow Pro, Gateron Oil King, Akko Cream Yellow V3 Pro, MMD Princess Linear V3, KTT Kang White V4, Outemu Peach Silent V2, and others.
- Tactile switches: Covered by Akko Lavender Purple V3 Pro, Akko Penguin, MMD Holy Panda V3, and Everglide Wild Pansy V2.
- Clicky switches: Covered by Akko Creamy Cyan and Outemu Ocean Blue.
- Silent switches: Covered by Akko Penguin, Akko Fairy candidate, Outemu Peach Silent V2, and KTT Orange Silent if later verified.
- Cherry keycaps: Covered by MKB Valkyrie/private-label, MKB Gradient/private-label, GMK ICON Retro 9009, GMK Illusion, GMK Apollo/Arctic alternatives.
- OEM keycaps: Covered by Pudding, Poker Pudding, Gameboy NGC Purple.
- MOA keycaps: Covered by Tarot Purple and many Yunzii full-kit caps.
- XDA keycaps: Covered by Seasonic Sea Themed.
- ASA keycaps: Not clearly found in the researched candidate set; keep as a future search target.

## Risks / Needs Verification

- Several MKB-branded products may be house-brand/private-label. Do not use `MKB.MY` as catalog brand unless the product is genuinely marketed as an MKB product and the project accepts house-brand entries. Otherwise record manufacturer as `unknown` and retailer as source.
- Some KeebsProject product titles include generic or clone-style naming such as `GMK` in the product name. Treat manufacturer/brand as unknown unless verified.
- Some kit pages do not specify stabilizer type. This matters for deterministic compatibility and must be confirmed before turning those kits into rule-engine records.
- Some kit pages do not specify plate material or mount structure. Mark as unknown rather than inferring.
- Prices and availability are visible research snapshots. They should not be treated as live stock.
- Sound profile labels are best-effort metadata only; no audio measurements were performed.
- Hall-effect switches should remain unsupported until a compatible hall-effect board/PCB is added.

## Recommended Initial Catalog Set

Implementation readiness note:

- Convert only products whose source page still provides enough stock/spec evidence at implementation time.
- If a product is sold out but has excellent specs, keep it as a reference candidate rather than a user-facing catalog item.
- Do not force the first implementation set to hit every variety target if doing so requires stale or unavailable products. It is better to ship fewer honest records than to seed products with skipped availability/spec checks.

### Keyboard Kits - Implementation-ready now

These are the strongest candidates to convert first because the re-checked pages show available units and enough modelable specs:

1. Weikav Star 80 - TKL/80%, aluminum, tri-mode, FR4 plate, QMK/VIA, PCB-mounted stabilizers. Strongest kit-derived candidate.
2. Yunzii B87 - TKL/80%, ABS, tri-mode, gasket, QMK/VIA, 3/5-pin hot-swap, beginner-friendly full kit. Stabilizer type still unknown.
3. AL75 V2 - 75%, aluminum, tri-mode, gasket, FR4/PC plate variants, 3/5-pin hot-swap. Stabilizer type still unknown.
4. Yunzii QL75 - 75%, top mount, tri-mode, QMK/VIA, 3/5-pin hot-swap. Case material and stabilizer type still unknown.
5. Yunzii C68 MEOW - 65%, silicone, tri-mode, hot-swap, MOA/PBT full kit. Mount and stabilizer type still unknown.

This ready-now group keeps 65%, 75%, and TKL coverage; plastic/silicone and aluminum coverage; tri-mode coverage; beginner-friendly and enthusiast-style options; and one clear PCB-mounted stabilizer kit through Weikav Star 80.

### Keyboard Kits - Needs stock/spec confirmation

These are useful if stock or missing specs are confirmed before coding:

1. Keychron V2 Max - assembled variants appear available, but barebone is marked sold out. Convert only if modeling as an assembled/full-kit-derived source or if barebone stock returns.
2. Keychron V2 - strong wired 65% reference, but current availability is mixed/ambiguous and barebone availability must be confirmed.
3. MKB White65 - clear plate-mounted stabilizer path and budget 65% specs, but page is sold out and manufacturer/house-brand treatment must be decided.
4. MMD75 - useful budget 75% tri-mode option, but the re-checked MKB page marks variants sold out and stabilizer type/plate material remain uncertain.

### Keyboard Kits - Reference-only / hold for later

These are good modeling examples but should not be converted into the first live catalog unless a currently available Malaysia-accessible source is found:

1. Join65 - premium 65% aluminum plate-gasket reference; MKB marks all variants sold out.
2. Keychron Q1 V2 - premium wired 75% reference; MKB marks all variants sold out.
3. Monsgeek M1W - aluminum tri-mode 75% reference; MKB marks all variants sold out.
4. Keychron V3 - wired TKL reference; MKB marks all variants sold out.

Important coverage caveat: the current implementation-ready kit set does not include a clearly in-stock wired-only kit. If wired-only coverage is required in Phase 9B.2, first find/verify a live-stock wired Keychron V-series/Q-series listing or another Malaysia-accessible wired kit rather than using sold-out MKB records as available products.

### Switches, around 10

1. Gateron Milky Yellow Pro - budget creamy linear.
2. Gateron Oil King - premium smooth/thocky linear.
3. Akko Cream Yellow V3 Pro - budget creamy linear.
4. Akko Lavender Purple V3 Pro - tactile.
5. Akko Penguin - silent tactile.
6. Akko Creamy Cyan - clicky.
7. MMD Holy Panda V3 - budget thocky tactile.
8. MMD Princess Linear V3 - budget smooth linear.
9. KTT Kang White V4 - budget 3-pin linear.
10. Outemu Peach Silent V2 - silent linear.

### Keycap sets, around 6

1. Retro 9009 PBT listed as `GMK ICON Retro 9009 PBT` - implement brand/manufacturer as `Unknown` unless authenticity is verified; Cherry, 140+, broad layouts.
2. Illusion Sky Blue listed with `GMK` wording - implement brand/manufacturer as `Unknown` unless authenticity is verified; Cherry, 173 keys, broad layouts.
3. MKB Gradient - implement brand/manufacturer as `Unknown` or approved house-brand only after verification; Cherry shine-through.
4. Pudding - OEM PBT double-shot, budget shine-through; brand/manufacturer unknown.
5. Seasonic Sea Themed - XDA PBT dye-sub, brand-theme friendly.
6. Tarot Purple - MOA full set, verify exact key count/layout support.

### Stabilizer kits, around 5

1. TX Stabilizers Set - flexible variants, 6.25u/7u and PCB thickness notes.
2. C³ Equalz Screw-In Stabilizers V3 - screw-in, 6.25u and 7u support.
3. Owlab V3 Screw-In Stabilizers - premium screw-in 6.25u.
4. SP-Star Plate Mounted Stabilizers - budget plate-mount 6.25u.
5. FLCMMK Fulin V3 Plate Mounted Stabilizers - larger plate-mount kit.

## Phase 9B.2 Implementation Recommendation

Convert first:

- Keyboard kits: Weikav Star 80, Yunzii B87, AL75 V2, Yunzii QL75, Yunzii C68 MEOW.
- Switches: Gateron Milky Yellow Pro, Gateron Oil King, Akko Cream Yellow V3 Pro, Akko Lavender Purple V3 Pro, Akko Penguin, Akko Creamy Cyan, MMD Holy Panda V3, MMD Princess Linear V3, KTT Kang White V4, Outemu Peach Silent V2.
- Keycaps: Retro 9009 PBT as `Unknown` manufacturer, Illusion Sky Blue as `Unknown` manufacturer, Pudding as `Unknown`, Seasonic Sea Themed as `Unknown`, Tarot Purple as `Unknown`, and MKB Gradient only if house-brand treatment is approved.
- Stabilizers: TX Stabilizers Set, C³ Equalz Screw-In Stabilizers V3, Owlab V3 Screw-In Stabilizers, SP-Star Plate Mounted Stabilizers, FLCMMK Fulin V3 Plate Mounted Stabilizers.

Hold before coding:

- Keychron V2, V2 Max barebone, Q1 V2, V3, Monsgeek M1W, MMD75, Join65, and MKB White65 until stock/SKU status is confirmed.
- Any keycap set using `GMK` or other premium naming until manufacturer/authenticity is clarified.
- Hall-effect switches until a compatible hall-effect PCB/keyboard is added.

Specs to check before coding:

- Stabilizer type for AL75 V2, Yunzii B87, Yunzii C68, and Yunzii QL75.
- Plate material for Yunzii B87, Yunzii C68, and Yunzii QL75.
- Case material for Yunzii QL75.
- Whether Yunzii C68 and QL75 should be modeled as complete keyboards only or split into kit-derived case/PCB/plate records.
- Whether MKB White65 can be treated as an actual MKB house-brand catalog entry if it returns to stock, or should remain manufacturer `Unknown`.
- Whether the first implementation needs a currently stocked wired-only kit; if yes, source that before coding rather than relying on sold-out references.
