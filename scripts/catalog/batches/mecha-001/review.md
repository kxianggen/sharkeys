# Review batch `mecha-001`

212 candidates for you · 152 complete · 60 need a value from you · 42 auto-approved (listed at the end; spot-check list in scripts/catalog/blind/) · 189 skipped (not parts, see skipped.json)

The first 58 were also read by the independent blind pass; where it disagreed with the importer, the disagreement is listed under the part. Neither side is assumed right: check the source page.

## How to review

1. Put the time in `reviewStartedAt` in `decisions.json` (any ISO time, e.g. `2026-11-28T10:00:00+08:00`).
2. For each part below, open the source link if anything looks off. In `decisions.json` set `decision` to `approve` or `reject`.
3. Fix a wrong or **unknown** value under `fixes`, e.g. `"mountSupport": ["gasket_mount"]` or `"beginnerFriendly": true`. A fix always wins.
4. Put the time in `reviewFinishedAt`, then run `npm run catalog:apply -- --batch mecha-001`.

⚠ marks a required value that is unknown, or a value under 0.7 confidence. Prices are the listed MYR price, excluding shipping (switches: per switch).

Allowed values: layouts `60 65 75 tkl full` · mounts `gasket_mount top_mount tray_mount o_ring_mount` · switch tech `mechanical optical hall_effect topre` · keycap profile `cherry oem xda moa sa low_profile topre` · stabilizer `plate_mount pcb_mount screw_in` · sizes `2u 6.25u 7u` · connection `wired wireless both` · sound `thocky creamy clacky silent neutral`.

## ⚠ needs values · [Clearance] JKDK Child Kits Numpad/Spacebar/Color/Novelties/Modifiers

- key: `mecha:merdeka-sale-jkdk-child-kits` · category: **keycap** · [source](https://mecha.com.my/products/merdeka-sale-jkdk-child-kits)
- **missing required:** layouts
- 🔍 blind pass: missing layouts
- note: variants range RM30–RM40; using the cheapest (Dark Matter - Numpad / Dark Matter - Numpad)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Clearance] JKDK Child Kits Numpad/Spacebar/Color/Novelties/Modifiers | 0.95 | structured | [Clearance] JKDK Child Kits Numpad/Spacebar/Color/Novelties/Modifiers |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. Child Kits only, not including |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): High-quality PBT Dye-Sub keycaps in Cherry profile. Child Kits only, not including |
| price | 30 | 0.85 | structured | Dark Matter - Numpad / Dark Matter - Numpad: RM30.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · Durock Shrimp Silent Tactile Switches

- key: `mecha:durock-shrimp-silent-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/durock-shrimp-silent-tactile-switches)
- becomes: `switch_jwk_durock_shrimp_silent_tactile_switches`
- 🔍 blind pass: brand: importer "jwk" vs blind "durock"
- fits a valid build, e.g. `switch_jwk_durock_shrimp_silent_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Durock Shrimp Silent Tactile Switches | 0.95 | structured | Durock Shrimp Silent Tactile Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM3.9 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Durock Shrimp Silent Tactile Switches Type: Switch Tags: Silent |
| pinCount | 5 | 0.90 | regex | from Nylon - PCB-mounted design (5 pins) - Bottom: 67g - Factory Lubricated |
| actuationForceG | **unknown** | – | default |  |
| price | 3.9 | 0.80 | structured | Default Title / Default Title: RM3.90 |
| soundProfile | silent | 0.90 | regex | Durock Shrimp Silent Tactile Switches |
| ⚠ description | Love that sharp, tactile bump of the Durock (JWK) popular T1 switches, but just need a sleeper keyboard for your office? | 0.50 | regex | Love that sharp, tactile bump of the Durock (JWK) popular T1 switches, but just need a sleeper keyboard for your office? |

## ✅ ready · SW X Haimu MP Tactile Switches

- key: `mecha:sw-x-haimu-mp-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/sw-x-haimu-mp-tactile-switches)
- becomes: `switch_swagkeys_sw_x_haimu_mp_tactile_switches`
- 🔍 blind pass: soundProfile: importer "clacky" vs blind "unknown"
- fits a valid build, e.g. `switch_swagkeys_sw_x_haimu_mp_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | SW X Haimu MP Tactile Switches | 0.95 | structured | SW X Haimu MP Tactile Switches |
| brand* | Swagkeys | 0.90 | structured | vendor: Swagkeys |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: SW X Haimu MP Tactile Switches Type: Switch Tags: Tactile |
| pinCount | 5 | 0.90 | regex | - Mounting Type : PCB Mount (5-pin) - Materials - Top : POM - |
| actuationForceG | **unknown** | – | default |  |
| price | 1.9 | 0.80 | structured | Default Title / Default Title: RM1.90 |
| soundProfile | clacky | 0.80 | ai | When you hit the floor, the metals come into contact with each other and make a clear sound. |
| ⚠ description | - Specifications - Type : Tactile - Mounting Type : PCB Mount (5-pin) - Materials - Top : POM - Bottom : POM with Metal bottom hole - Stem : UPE with Metal pole | 0.50 | regex | - Specifications - Type : Tactile - Mounting Type : PCB Mount (5-pin) - Materials - Top : POM - Bottom : POM with Metal bottom hole - Stem : UPE with Metal pole |

## ✅ ready · AKKO CS Jelly Black Linear Switches

- key: `mecha:akko-cs-jelly-black-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/akko-cs-jelly-black-linear-switches)
- becomes: `switch_akko_cs_jelly_black_linear_switches`
- 🔍 blind pass: actuationForceG: importer "unknown" vs blind "50"
- fits a valid build, e.g. `switch_akko_cs_jelly_black_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | AKKO CS Jelly Black Linear Switches | 0.95 | structured | AKKO CS Jelly Black Linear Switches |
| brand* | AKKO | 0.90 | structured | vendor: AKKO |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: AKKO CS Jelly Black Linear Switches Type: Switch Tags: Linear, |
| pinCount | 3 | 0.90 | regex | switches. - Plate mounted design (3 pins) - Pre-travel: 1.9mm - Total |
| actuationForceG | **unknown** | – | default |  |
| price | 2 | 0.80 | structured | Lubed / Lubed: RM2.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | AKKO Custom Series (CS) switches are made to obtain a satisfying typing feel with a distinct characteristic based on AKKO's user feedback. | 0.50 | regex | AKKO Custom Series (CS) switches are made to obtain a satisfying typing feel with a distinct characteristic based on AKKO's user feedback. |

## ✅ ready · Gopolar x Gateron Azure Dragon V2 Tactile Switches

- key: `mecha:gopolar-x-gateron-azure-dragon-v2-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/gopolar-x-gateron-azure-dragon-v2-tactile-switches)
- becomes: `switch_gateron_gopolar_x_gateron_azure_dragon_v2_tactile_switches`
- 🔍 blind pass: actuationForceG: importer "67" vs blind "63"
- fits a valid build, e.g. `switch_gateron_gopolar_x_gateron_azure_dragon_v2_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gopolar x Gateron Azure Dragon V2 Tactile Switches | 0.95 | structured | Gopolar x Gateron Azure Dragon V2 Tactile Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Gopolar x Gateron Azure Dragon V2 Tactile Switches Type: Switch Tags: Gateron, |
| pinCount | 5 | 0.90 | regex | resonance across your board - 5-pin PCB mount - compatible with Cherry |
| actuationForceG | 67 | 0.85 | regex | V2 Tactile Switches With a 63g activation force and a 67g bottom out force, Gopolar Azure |
| price | 2.5 | 0.80 | structured | Default Title / Default Title: RM2.50 |
| soundProfile | clacky | 0.80 | regex | Switch Tags: Gateron, sound_Medium Clack, Switch Type_Tactile Variants: |
| ⚠ description | Gopolar x Gateron Azure Dragon V2 Tactile Switches With a 63g activation force and a 67g bottom out force, Gopolar Azure Dragon V2 Switches offer a medium-stron | 0.50 | regex | Gopolar x Gateron Azure Dragon V2 Tactile Switches With a 63g activation force and a 67g bottom out force, Gopolar Azure Dragon V2 Switches offer a medium-stron |

## ✅ ready · Gateron G Pro 2.0 Red Linear Switches

- key: `mecha:gateron-g-pro-2-0-red-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-g-pro-2-0-red-linear-switches)
- becomes: `switch_gateron_g_pro_2_0_red_linear_switches`
- 🔍 blind pass: actuationForceG: importer "unknown" vs blind "45"
- 🔍 blind pass: soundProfile: importer "silent" vs blind "unknown"
- fits a valid build, e.g. `switch_gateron_g_pro_2_0_red_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron G Pro 2.0 Red Linear Switches | 0.95 | structured | Gateron G Pro 2.0 Red Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron G Pro 2.0 Red Linear Switches Type: Switch Tags: Switch |
| pinCount | 3 | 0.90 | regex | Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - |
| actuationForceG | **unknown** | – | default |  |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | silent | 0.80 | ai | Reduced Spring Noises |
| ⚠ description | Gateron G Pro 2.0 Red Linear Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - Total travel：4.0 mm Max. | 0.50 | regex | Gateron G Pro 2.0 Red Linear Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - Total travel：4.0 mm Max. |

## ✅ ready · Gateron G Pro 2.0 Yellow Linear Switches

- key: `mecha:copy-of-gateron-g-pro-2-0-yellow-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/copy-of-gateron-g-pro-2-0-yellow-linear-switches)
- becomes: `switch_gateron_g_pro_2_0_yellow_linear_switches`
- 🔍 blind pass: actuationForceG: importer "unknown" vs blind "50"
- 🔍 blind pass: soundProfile: importer "silent" vs blind "unknown"
- fits a valid build, e.g. `switch_gateron_g_pro_2_0_yellow_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron G Pro 2.0 Yellow Linear Switches | 0.95 | structured | Gateron G Pro 2.0 Yellow Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron G Pro 2.0 Yellow Linear Switches Type: Switch Tags: Switch |
| pinCount | 3 | 0.90 | regex | Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | silent | 0.80 | ai | Reduced Spring Noises |
| ⚠ description | Gateron G Pro 2.0 Yellow Linear Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - Total travel：4.0 mm Max. | 0.50 | regex | Gateron G Pro 2.0 Yellow Linear Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - Total travel：4.0 mm Max. |

## ✅ ready · AKKO CS Wine Red Linear Switch

- key: `mecha:akko-cs-wine-red-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/akko-cs-wine-red-linear-switch)
- becomes: `switch_akko_cs_wine_red_linear_switch`
- 🔍 blind pass: actuationForceG: importer "43" vs blind "unknown"
- fits a valid build, e.g. `switch_akko_cs_wine_red_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | AKKO CS Wine Red Linear Switch | 0.95 | structured | AKKO CS Wine Red Linear Switch |
| brand* | AKKO | 0.90 | structured | vendor: AKKO |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: AKKO CS Wine Red Linear Switch Type: Switch Tags: xmas2022 |
| pinCount | 3 | 0.90 | regex | Linear Switch - Type: Linear - 3-pins switch - Total Travel: 4.0 - |
| ⚠ actuationForceG | 43 | 0.55 | regex | Pre-Travel: 1.9 ± 0.3mm - End Force: 43gf ± 5gf |
| price | 1.2 | 0.80 | structured | Lubed / Lubed: RM1.20 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Akko CS Wine Red Linear Switch - Type: Linear - 3-pins switch - Total Travel: 4.0 - 0.5mm - Pre-Travel: 1.9 ± 0.3mm - End Force: 43gf ± 5gf | 0.50 | regex | Akko CS Wine Red Linear Switch - Type: Linear - 3-pins switch - Total Travel: 4.0 - 0.5mm - Pre-Travel: 1.9 ± 0.3mm - End Force: 43gf ± 5gf |

## ✅ ready · Gateron G Pro 2.0 Brown Tactile Switches

- key: `mecha:gateron-g-pro-2-0-brown-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-g-pro-2-0-brown-tactile-switches)
- becomes: `switch_gateron_g_pro_2_0_brown_tactile_switches`
- 🔍 blind pass: actuationForceG: importer "unknown" vs blind "55"
- fits a valid build, e.g. `switch_gateron_g_pro_2_0_brown_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron G Pro 2.0 Brown Tactile Switches | 0.95 | structured | Gateron G Pro 2.0 Brown Tactile Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron G Pro 2.0 Brown Tactile Switches Type: Switch Tags: xmas2022 |
| pinCount | 3 | 0.90 | regex | Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Gateron G Pro 2.0 Brown Tactile Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - Total travel：4.0 mm Max. | 0.50 | regex | Gateron G Pro 2.0 Brown Tactile Switches: - PCB mounted design (3 pins) - Pre-travel: 2.0 ±0.6 mm - Total travel：4.0 mm Max. |

## ✅ ready · BSUN x Monx MY Silent Linear Switch

- key: `mecha:bsun-x-monx-my-silent-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/bsun-x-monx-my-silent-linear-switch)
- becomes: `switch_tdx_studios_bsun_x_monx_my_silent_linear_switch`
- 🔍 blind pass: brand: importer "tdx studios" vs blind "bsun"
- fits a valid build, e.g. `switch_tdx_studios_bsun_x_monx_my_silent_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | BSUN x Monx MY Silent Linear Switch | 0.95 | structured | BSUN x Monx MY Silent Linear Switch |
| brand* | TDX Studios | 0.90 | structured | vendor: TDX Studios |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: BSUN x Monx MY Silent Linear Switch Type: Switch Tags: sound_Silent, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 43 | 0.85 | regex | Spring Bottom Out: 48g Spring Actuation: 43g |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | silent | 0.90 | structured | Tags: sound_Silent |
| ⚠ description | Inspired by Malaysian flag colors. | 0.50 | regex | Inspired by Malaysian flag colors. |

## ⚠ needs values · Pink Mist Cherry Profile Keycap Set

- key: `mecha:pink-mist-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/pink-mist-cherry-profile-keycap-set)
- **missing required:** layouts
- 🔍 blind pass: missing layouts

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Pink Mist Cherry Profile Keycap Set | 0.95 | structured | Pink Mist Cherry Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Pink Mist Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Pink Mist Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | For the pink lovers! This Pink Mist keycap set features the latest evolution in keycaps, introducing see-through crystal keycaps on top of a gradient theme, sho | 0.50 | regex | For the pink lovers! This Pink Mist keycap set features the latest evolution in keycaps, introducing see-through crystal keycaps on top of a gradient theme, sho |

## ⚠ needs values · AKKO MOD006 Aluminum DIY Barebones Kit

- key: `mecha:akko-mod006-diy-barebones-kit` · category: **kit** · [source](https://mecha.com.my/products/akko-mod006-diy-barebones-kit)
- **missing required:** beginnerFriendly, layouts, connection
- 🔍 blind pass: layouts: importer "unknown" vs blind "75"
- 🔍 blind pass: connection: importer "unknown" vs blind "both"
- 🔍 blind pass: stabilizerType: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly, layouts, connection
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | AKKO MOD006 Aluminum DIY Barebones Kit | 0.95 | structured | AKKO MOD006 Aluminum DIY Barebones Kit |
| brand* | AKKO | 0.90 | structured | vendor: AKKO |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | gasket_mount | 0.85 | regex | Aluminum and polycarbonate plates; – Gasket Mount: silion/poron gaskets; – Poron |
| switchTechnologySupport* | mechanical | 0.80 | regex | case foam are pre-cut against the hot-swappable sockets to reduce unnecessary |
| stabilizerTypeSupport* | screw_in | 0.70 | regex | the knob has been replaced by a screw-in customizable badge. The character |
| ⚠ connection* | **unknown** | – | default |  |
| hotswap* | true | 0.90 | regex | case foam are pre-cut against the hot-swappable sockets to reduce unnecessary |
| stabilizerType | screw_in | 0.85 | regex | the knob has been replaced by a screw-in customizable badge. The character |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | 300 | 0.95 | structured | Space Grey / Space Grey: RM300.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | MOD006 has the same specification as MOD007v2 but the knob has been replaced by a screw-in customizable badge. | 0.50 | regex | MOD006 has the same specification as MOD007v2 but the knob has been replaced by a screw-in customizable badge. |

## ⚠ needs values · Weikav Max 102 Aluminum 98% Barebones Keyboard Kit

- key: `mecha:weikav-max-102-98-barebones-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/weikav-max-102-98-barebones-keyboard-kit)
- **missing required:** layouts, stabilizerTypeSupport
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: missing layouts, stabilizerTypeSupport
- note: layout "98%" is not in the catalogue schema (60/65/75/tkl/full)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Weikav Max 102 Aluminum 98% Barebones Keyboard Kit | 0.95 | structured | Weikav Max 102 Aluminum 98% Barebones Keyboard Kit |
| brand* | Weikav | 0.90 | structured | vendor: Weikav |
| beginnerFriendly* | true | 0.80 | ai | Hotswap Sockets: Yes |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | gasket_mount | 0.85 | regex | for full-size keyboards. PCB-Gasket Structure The keyboard features a PCB-silicone |
| switchTechnologySupport* | mechanical | 0.80 | regex | 102 - Switch Stems: Cross - Hotswap Sockets: Yes - N-key Rollover |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | wireless, and Bluetooth. Switch The three-mode switch is located beneath the |
| hotswap* | true | 0.90 | regex | 102 - Switch Stems: Cross - Hotswap Sockets: Yes - N-key Rollover |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | fr4 | 0.80 | regex | Anodizing/ Electrophoresis - Plate: FR4 - Layers: Poron+IXPE+PET+EPDM+IXPE |
| price | 420 | 0.85 | structured | Black / Black: RM420.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Max102 is designed with a focus on structural refinement , functional engineering , and system integration . | 0.50 | regex | Max102 is designed with a focus on structural refinement , functional engineering , and system integration . |

## ⚠ needs values · Weikav Stars80 V3 Aluminum TKL Barebones Keyboard Kit

- key: `mecha:weikav-stars80-tkl-barebones-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/weikav-stars80-tkl-barebones-keyboard-kit)
- **missing required:** mountSupport
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: mountSupport: importer "unknown" vs blind "gasket_mount"
- 🔍 blind pass: stabilizerTypeSupport: importer "plate_mount" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "plate_mount" vs blind "unknown"
- 🔍 blind pass: soundProfile: importer "thocky" vs blind "unknown"
- 🔍 blind pass: missing mountSupport
- note: AI said mountSupport = ["gasket_mount","top_mount"] but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Weikav Stars80 V3 Aluminum TKL Barebones Keyboard Kit | 0.95 | structured | Weikav Stars80 V3 Aluminum TKL Barebones Keyboard Kit |
| brand* | Weikav | 0.90 | structured | vendor: Weikav |
| beginnerFriendly* | true | 0.80 | ai | Hotswap Sockets: Yes |
| layouts* | tkl | 0.90 | regex | Weikav Stars80 V3 Aluminum TKL Barebones Keyboard Kit |
| ⚠ mountSupport* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | Cross - Physical Layout: ANSI - Hotswap Sockets: Yes - N-key Rollover |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: Switch Mount Type: Plate |
| connection* | both | 0.75 | regex | an aluminum CNC cased TKL with wireless connectivity and acheiving thocky, |
| hotswap* | true | 0.90 | regex | Cross - Physical Layout: ANSI - Hotswap Sockets: Yes - N-key Rollover |
| stabilizerType | plate_mount | 0.85 | ai | Switch Mount Type: Plate |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | fr4 | 0.80 | regex | to the acoustic treatment and FR4 plate material. Specifications: General |
| price | 330 | 0.95 | structured | Silver / Silver: RM330.00 |
| soundProfile | thocky | 0.85 | ai | acheiving thocky, creamy sounds thanks to the acoustic treatment and FR4 plate material |
| ⚠ description | The Weikav Stars 80 is on its third iteration, offering fanstastic value for money while being an aluminum CNC cased TKL with wireless connectivity and acheivin | 0.50 | regex | The Weikav Stars 80 is on its third iteration, offering fanstastic value for money while being an aluminum CNC cased TKL with wireless connectivity and acheivin |

## ⚠ needs values · [Extras] QK65 Mk3 65% Custom Keyboard Kit

- key: `mecha:qk65-mk3-65-custom-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/qk65-mk3-65-custom-keyboard-kit)
- **missing required:** stabilizerTypeSupport
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: stabilizerSizes: importer "2u;6.25u;7u" vs blind "unknown"
- 🔍 blind pass: missing stabilizerTypeSupport
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] QK65 Mk3 65% Custom Keyboard Kit | 0.95 | structured | [Extras] QK65 Mk3 65% Custom Keyboard Kit |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| beginnerFriendly* | true | 0.85 | ai | 1.2mm 6.25U Tri-mode ANSI Flex-cut Hotswap PCB 1.6mm 6.25U Tri-mode ANSI Non-flex cut Hotswap PCB 1.6mm 7U Tri-mode ANSI Non-flex cut Hotswap PCB 1.6mm 7U Tri-m |
| layouts* | 65 | 0.90 | regex | [Extras] QK65 Mk3 65% Custom Keyboard Kit |
| mountSupport* | gasket_mount | 0.85 | regex | when you turn the knobs. PCB Gasket Mounting PCB gasket structure enables |
| switchTechnologySupport* | mechanical | 0.80 | regex | 1.2mm 6.25U Tri-mode ANSI Flex-cut Hotswap PCB 1.6mm 6.25U Tri-mode ANSI |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | screen functions. 1.2mm 6.25U Tri-mode ANSI Flex-cut Hotswap PCB 1.6mm |
| hotswap* | true | 0.90 | regex | 1.2mm 6.25U Tri-mode ANSI Flex-cut Hotswap PCB 1.6mm 6.25U Tri-mode ANSI |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | 2u, 6.25u, 7u | 0.80 | regex | advanced screen functions. 1.2mm 6.25U Tri-mode ANSI Flex-cut Hotswap |
| plateMaterial | **unknown** | – | default |  |
| price | 900 | 0.85 | structured | Console (Spray-coated Grey) / Console (Spray-coated Grey): RM900.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Note: These are in-stock extras and do not come with switches & keycaps. | 0.50 | regex | Note: These are in-stock extras and do not come with switches & keycaps. |

## ⚠ needs values · [Extras] Neo75 Wireless 75% Keyboard Kit

- key: `mecha:pre-order-extras-neo75-wireless-75-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/pre-order-extras-neo75-wireless-75-keyboard-kit)
- **missing required:** beginnerFriendly, mountSupport, switchTechnologySupport, hotswap
- 🔍 blind pass: mountSupport: importer "unknown" vs blind "gasket_mount;top_mount"
- 🔍 blind pass: missing beginnerFriendly, mountSupport, switchTechnologySupport, hotswap
- note: only cheap variants are in stock (RM95 vs RM700 listed): they look like add-ons, so the price is left for you
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick
- note: AI (["gasket_mount","top_mount"]) and plain code (["top_mount"]) disagree on mountSupport; left unknown for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] Neo75 Wireless 75% Keyboard Kit | 0.95 | structured | [Extras] Neo75 Wireless 75% Keyboard Kit |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | 75 | 0.90 | regex | [Extras] Neo75 Wireless 75% Keyboard Kit |
| ⚠ mountSupport* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| stabilizerTypeSupport* | pcb_mount | 0.80 | default | kit ships with pcb_mount stabilizers: 1 set of PCB clip-in NeoStab |
| connection* | both | 0.90 | regex | Variants: Black / Golden Weight / Tri-mode / Alu Plate / Black / Golden Weight |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | pcb_mount | 0.80 | ai | 1 set of PCB clip-in NeoStab |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | **unknown** | – | default |  |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Notice These are extras from our Q1 2026 Neo/QK Preorder ETA is not precise but expected to fulfil in April Only pre-determined, fixed configurations are availa | 0.50 | regex | Notice These are extras from our Q1 2026 Neo/QK Preorder ETA is not precise but expected to fulfil in April Only pre-determined, fixed configurations are availa |

## ✅ ready · HMX Snowfall Tactile Switch

- key: `mecha:hmx-snowfall-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/hmx-snowfall-tactile-switch)
- becomes: `switch_ktechs_hmx_snowfall_tactile_switch`
- 🔍 blind pass: brand: importer "ktechs" vs blind "hmx"
- fits a valid build, e.g. `switch_ktechs_hmx_snowfall_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | HMX Snowfall Tactile Switch | 0.95 | structured | HMX Snowfall Tactile Switch |
| brand* | ktechs | 0.90 | structured | vendor: ktechs |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: HMX Snowfall Tactile Switch Type: Switch Tags: sound_Clacky, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Designed by TR, the snowfall has recieved alot of postitive feedback from seasoned hobbyists, and happens to be one of the first few tactile switches made by HM | 0.50 | regex | Designed by TR, the snowfall has recieved alot of postitive feedback from seasoned hobbyists, and happens to be one of the first few tactile switches made by HM |

## ⚠ needs values · [Extras] Neo80 CU TKL Kit

- key: `mecha:extras-neo80-cu-tkl-kit` · category: **kit** · [source](https://mecha.com.my/products/extras-neo80-cu-tkl-kit)
- **missing required:** beginnerFriendly, switchTechnologySupport
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount" vs blind "unknown"
- 🔍 blind pass: hotswap: importer "false" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "pcb_mount" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "aluminum" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly, switchTechnologySupport
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] Neo80 CU TKL Kit | 0.95 | structured | [Extras] Neo80 CU TKL Kit |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | tkl | 0.90 | regex | [Extras] Neo80 CU TKL Kit |
| mountSupport* | gasket_mount, top_mount | 0.85 | regex | brand. Mounting Structure Poron Gasket Mount + Silicone Gasket Mount + Top |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| stabilizerTypeSupport* | pcb_mount | 0.80 | default | kit ships with pcb_mount stabilizers: 1 set of PCB clip-in NeoStab |
| connection* | both | 0.90 | regex | Bottom / Champagne Mirror Weight / Tri-mode / Alu Plate / Black WK / Copper |
| ⚠ hotswap* | false | 0.60 | regex | through the plate, choosing a solder PCB with a plateless configuration |
| stabilizerType | pcb_mount | 0.80 | ai | 1 set of PCB clip-in NeoStab |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | aluminum | 0.80 | regex | Champagne Mirror Weight / Tri-mode / Alu Plate / Black WK / Copper Bottom / Champagne |
| price | 1300 | 0.85 | structured | Black WK / Copper Bottom / Champagne Mirror Weight / Tri-mode / Alu Plate / Black WK / Copper Bottom / Champagne Mirror Weight / Tri-mode / Alu Plate: RM1300.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | These are extras unit, available in fixed configurations only. | 0.50 | regex | These are extras unit, available in fixed configurations only. |

## ⚠ needs values · [Extras] Neo65 Core Plus Keyboard Kit

- key: `mecha:extras-neo65-core-plus-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/extras-neo65-core-plus-keyboard-kit)
- **missing required:** hotswap
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: switchTechnologySupport: importer "mechanical" vs blind "unknown"
- 🔍 blind pass: missing hotswap
- note: only cheap variants are in stock (RM95 vs RM699 listed): they look like add-ons, so the price is left for you
- note: several options: the page offers more than one hotswap; left unknown for you to pick
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] Neo65 Core Plus Keyboard Kit | 0.95 | structured | [Extras] Neo65 Core Plus Keyboard Kit |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| beginnerFriendly* | true | 0.80 | ai | Enjoy effortless assembly with our innovative Lock-n-Pull Mechanism + Magnetic Connectors . The pogo-pin design allows you to remove the PCB in seconds without  |
| layouts* | 65 | 0.70 | regex | Neo65 Core Plus from Neo Studio: a 65% keyboard refined through their |
| mountSupport* | gasket_mount, o_ring_mount | 0.85 | regex | Upgraded Gasket - Support both PCB gasket mount and gummy O-ring mount - Our |
| switchTechnologySupport* | mechanical | 0.80 | regex | - Stand-offs included with the hotswap PCB - Free Gifts: ⚠️ Disclaimer: |
| stabilizerTypeSupport* | pcb_mount | 0.80 | default | kit ships with pcb_mount stabilizers: 1 set of PCB clip-in NeoStab |
| connection* | both | 0.90 | regex | Variants: Mont Blanc / Brass / Alu / Tri-mode / Mont Blanc / Brass / Alu / Tri-mode |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | pcb_mount | 0.85 | ai | 1 set of PCB clip-in NeoStab |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | **unknown** | – | default |  |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | This is a barebones kit, switches and keycaps are not included Introduction Introducing the Neo65 Core Plus from Neo Studio: a 65% keyboard refined through thei | 0.50 | regex | This is a barebones kit, switches and keycaps are not included Introduction Introducing the Neo65 Core Plus from Neo Studio: a 65% keyboard refined through thei |

## ⚠ needs values · HJS ALU75V2 75% Wireless Aluminum Barebones Kit

- key: `mecha:hjs-alu75v2-75-wireless-aluminum-barebones-kit` · category: **kit** · [source](https://mecha.com.my/products/hjs-alu75v2-75-wireless-aluminum-barebones-kit)
- **missing required:** beginnerFriendly, switchTechnologySupport, stabilizerTypeSupport, hotswap
- 🔍 blind pass: missing beginnerFriendly, switchTechnologySupport, stabilizerTypeSupport, hotswap
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | HJS ALU75V2 75% Wireless Aluminum Barebones Kit | 0.95 | structured | HJS ALU75V2 75% Wireless Aluminum Barebones Kit |
| brand* | HJS | 0.90 | structured | vendor: HJS |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | 75 | 0.90 | regex | HJS ALU75V2 75% Wireless Aluminum Barebones Kit |
| mountSupport* | gasket_mount | 0.85 | regex | (excluding knob) Weight: 2KG (unbuilt) Mounting: Gasket PCB: Flex cut Backlight: RGB Backlight, |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | Specifications: Plate: PC Connectivity: Tri-mode (Wired, Bluetooth and 2.4GHz dongle) |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | 209 | 0.95 | structured | Pink (FR4 Plate) / Pink (FR4 Plate): RM209.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | A simple, aluminum 75% that ticks all the boxes. | 0.50 | regex | A simple, aluminum 75% that ticks all the boxes. |

## ✅ ready · MMD Princess V4 Linear Switch

- key: `mecha:mmd-princess-v4-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/mmd-princess-v4-linear-switch)
- becomes: `switch_mengmoda_mmd_princess_v4_linear_switch`
- 🔍 blind pass: brand: importer "mengmoda" vs blind "mmd"
- fits a valid build, e.g. `switch_mengmoda_mmd_princess_v4_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch
- note: AI said soundProfile = "creamy" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | MMD Princess V4 Linear Switch | 0.95 | structured | MMD Princess V4 Linear Switch |
| brand* | MENGMODA | 0.90 | structured | vendor: MENGMODA |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: MMD Princess V4 Linear Switch Type: Switch Tags: sound_Creamy, |
| pinCount | 5 | 0.90 | regex | wrong. - PCB-mounted design (5 pins) - Factory Lubed - Top Housing: |
| actuationForceG | 45 | 0.85 | regex | Bottom Housing: PC - Stem: LY - Actuation Force: 45g - Bottom Force: 50g - Spring: |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | MMD's continues to bring value to the masses with an update to the Princess switches! | 0.50 | regex | MMD's continues to bring value to the masses with an update to the Princess switches! |

## ✅ ready · Gateron Low Profile 2.0 KS-33 RGB Switches

- key: `mecha:gateron-low-profile-2-0-ks-33-rgb-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-low-profile-2-0-ks-33-rgb-switches)
- becomes: `switch_gateron_low_profile_2_0_ks_33_rgb_switches`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: switchTechnology: importer "mechanical" vs blind "unknown"
- 🔍 blind pass: price: importer "1.7" vs blind "unknown"
- fits a valid build, e.g. `switch_gateron_low_profile_2_0_ks_33_rgb_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Low Profile 2.0 KS-33 RGB Switches | 0.95 | structured | Gateron Low Profile 2.0 KS-33 RGB Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.7 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | ai | The KS-33 low profile switch is applied for the keyboard fit GATERON low profile switch |
| pinCount | 3 | 0.90 | regex | Support: SMD • Pre-lubed: Yes • Pins：3-Pin |
| actuationForceG | **unknown** | – | default |  |
| price | 1.7 | 0.80 | structured | Red / Red: RM1.70 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Tip: The KS-33 low profile switch is applied for the keyboard fit GATERON low profile switch, not for other low profile switch replacement. | 0.50 | regex | Tip: The KS-33 low profile switch is applied for the keyboard fit GATERON low profile switch, not for other low profile switch replacement. |

## ⚠ needs values · [Extras In-Stock] QK Alice Duo Split Ergo Keyboard Kit

- key: `mecha:extras-qk-alice-duo` · category: **kit** · [source](https://mecha.com.my/products/extras-qk-alice-duo)
- **missing required:** beginnerFriendly, layouts, mountSupport, switchTechnologySupport, stabilizerTypeSupport, hotswap
- 🔍 blind pass: missing beginnerFriendly, layouts, mountSupport, switchTechnologySupport, stabilizerTypeSupport, hotswap
- note: every variant is sold out; price is the listed one
- note: layout "Alice" is not in the catalogue schema (60/65/75/tkl/full)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras In-Stock] QK Alice Duo Split Ergo Keyboard Kit | 0.95 | structured | [Extras In-Stock] QK Alice Duo Split Ergo Keyboard Kit |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| ⚠ mountSupport* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.75 | regex | appealing on your desk. True Wireless Freedom The split keyboard design |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | fr4 | 0.85 | ai | Variants: Silver / Wrist Rest / 1.6mm / FR4 / Silver / Wrist Rest / 1.6mm / FR4 |
| price | 1499 | 0.95 | structured | Silver / Wrist Rest / 1.6mm / FR4 / Silver / Wrist Rest / 1.6mm / FR4: RM1499.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Notice These are extras from our Q1 2026 Neo/QK Preorder ETA is not precise but expected to fulfil in April Only pre-determined, fixed configurations are availa | 0.50 | regex | Notice These are extras from our Q1 2026 Neo/QK Preorder ETA is not precise but expected to fulfil in April Only pre-determined, fixed configurations are availa |

## ✅ ready · Jetliner Linear Switch (50g)

- key: `mecha:jetliner-linear-switch-50g` · category: **switch** · [source](https://mecha.com.my/products/jetliner-linear-switch-50g)
- becomes: `switch_tdx_studios_jetliner_linear_switch_50g`
- 🔍 blind pass: soundProfile: importer "creamy" vs blind "unknown"
- fits a valid build, e.g. `switch_tdx_studios_jetliner_linear_switch_50g` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Jetliner Linear Switch (50g) | 0.95 | structured | Jetliner Linear Switch (50g) |
| brand* | TDX Studios | 0.90 | structured | vendor: TDX Studios |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Jetliner Linear Switch (50g) Type: Switch Tags: |
| pinCount | 5 | 0.90 | regex | - Factory: BSUN - Pin Type: 5-pin - Pre-travel: 1.8 ± 0.5mm (Early |
| ⚠ actuationForceG | 55 | 0.55 | regex | 25% Fiberglass - Spring: 22mm 55gf actuation - Lubrication: Factory |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | creamy | 0.85 | ai | Tags: sound_Creamy, sound_Deep, sound_Thocky |
| ⚠ description | Designed by Malaysia's very own TDX Studios to be a modern improvement upon the Milky Yellows. | 0.50 | regex | Designed by Malaysia's very own TDX Studios to be a modern improvement upon the Milky Yellows. |

## ✅ ready · Gateron Blue KS-9 Clicky Switches

- key: `mecha:gateron-blue-ks-9-clicky-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-blue-ks-9-clicky-switches)
- becomes: `switch_gateron_blue_ks_9_clicky_switches`
- 🔍 blind pass: soundProfile: importer "clacky" vs blind "unknown"
- fits a valid build, e.g. `switch_gateron_blue_ks_9_clicky_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Blue KS-9 Clicky Switches | 0.95 | structured | Gateron Blue KS-9 Clicky Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Blue KS-9 Clicky Switches Type: Switch Tags: Clicky, |
| pinCount | 3 | 0.90 | regex | Force: 60g - Spring: 15.4mm - 3-Pin Brand-New Oxidation-Resistant |
| actuationForceG | 60 | 0.85 | regex | Gateron. This clicky switch has an operating force of 60g and a 15.4mm spring. These switches |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | clacky | 0.85 | ai | This clicky switch |
| ⚠ description | Gateron KS-9 Blue Switch is a clicky switch made by popular Gateron. | 0.50 | regex | Gateron KS-9 Blue Switch is a clicky switch made by popular Gateron. |

## ⚠ needs values · [Extras] Neo60 Cu Custom Mechanical Keyboard Kit

- key: `mecha:extras-neo60-cu-custom-mechanical-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/extras-neo60-cu-custom-mechanical-keyboard-kit)
- **missing required:** layouts, stabilizerTypeSupport, hotswap
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: layouts: importer "unknown" vs blind "60"
- 🔍 blind pass: hotswap: importer "unknown" vs blind "true"
- 🔍 blind pass: missing layouts, stabilizerTypeSupport, hotswap
- note: every variant is sold out; price is the listed one
- note: several options: the page offers more than one hotswap; left unknown for you to pick
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] Neo60 Cu Custom Mechanical Keyboard Kit | 0.95 | structured | [Extras] Neo60 Cu Custom Mechanical Keyboard Kit |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| beginnerFriendly* | true | 0.80 | ai | Tri-mode Hotswap PCB - 1.6mm thick, non-flex cut - Support USB-C, Bluetooth, and 2.4GHz connection - Support both ANSI and ISO layout - NKRO - NO Per-key RGB -  |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | gasket_mount, top_mount | 0.85 | regex | Neo65 & 60 Cu supports both PCB gasket mount (carried over from the Neo65) |
| switchTechnologySupport* | mechanical | 0.80 | regex | Copper Weight / PP Plate / Tri-mode Hotswap / Black Anodized WK / Brass Bottom |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | Bottom / Copper Weight / PP Plate / Tri-mode Hotswap / Black Anodized WK / |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | 699 | 0.85 | structured | Black Anodized WK / Brass Bottom / Copper Weight / PP Plate / Tri-mode Hotswap / Black Anodized WK / Brass Bottom / Copper Weight / PP Plate / Tri-mode Hotswap: |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Click here for NEO60 Cu Build Guide and Resources Please note: - Spray-coated Nebula contains micro-glitter - Renders are for reference only. | 0.50 | regex | Click here for NEO60 Cu Build Guide and Resources Please note: - Spray-coated Nebula contains micro-glitter - Renders are for reference only. |

## ✅ ready · MMD Princess V4 Tactile

- key: `mecha:mmd-princess-v4-tactile` · category: **switch** · [source](https://mecha.com.my/products/mmd-princess-v4-tactile)
- becomes: `switch_mmd_princess_v4_tactile`
- 🔍 blind pass: soundProfile: importer "thocky" vs blind "unknown"
- fits a valid build, e.g. `switch_mmd_princess_v4_tactile` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | MMD Princess V4 Tactile | 0.95 | structured | MMD Princess V4 Tactile |
| brand* | MMD | 0.90 | structured | vendor: MMD |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: MMD Princess V4 Tactile Type: Switch Tags: sound_Clacky, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 53 | 0.85 | regex | Housing: PC Bottom Housing: PC Actuation Force: 53g Pre-travel: 2.0mm Total Travel: |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | thocky | 0.85 | regex | BSUN known for their low-pitched thocky plastic blends, slippery smoothness |
| ⚠ description | The MMD Princess V4 tactile switch is the newest iteration of the wildly popular MMD Princess series. | 0.50 | regex | The MMD Princess V4 tactile switch is the newest iteration of the wildly popular MMD Princess series. |

## ⚠ check flags · Zuoya GMK67 V2 65% Custom Mechanical Keyboard

- key: `mecha:zuoya-gmk67-65-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/zuoya-gmk67-65-custom-mechanical-keyboard)
- becomes: `case_zuoya_gmk67_v2_65_custom`, `pcb_zuoya_gmk67_v2_65_custom`, `plate_zuoya_gmk67_v2_65_custom`
- 🔍 blind pass: duplicate: possibly the same product as existing "case_gmk67_65_plastic" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "pcb_gmk67_65_hotswap" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "plate_gmk67_65_pc" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "plate_gmk67_65_brass" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "plate_gmk67_65_aluminum" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "plate_gmk67_65_pom" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "case_gmk67_65_plastic" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "pcb_gmk67_65_hotswap" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "plate_gmk67_65_pc" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "plate_gmk67_65_brass" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "plate_gmk67_65_aluminum" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "plate_gmk67_65_pom" (same brand and model code)
- fits a valid build, e.g. `case_zuoya_gmk67_v2_65_custom` + `pcb_zuoya_gmk67_v2_65_custom` + `plate_zuoya_gmk67_v2_65_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_flcmmk_fulin_v3_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Zuoya GMK67 V2 65% Custom Mechanical Keyboard | 0.95 | structured | Zuoya GMK67 V2 65% Custom Mechanical Keyboard |
| brand* | Zuoya | 0.90 | structured | vendor: Zuoya |
| beginnerFriendly* | true | 0.85 | ai | Featuring durable Kailh Hotswap Sockets and fully pre-assembled, you just need switches and keycaps to complete your board! |
| layouts* | 65 | 0.90 | regex | Zuoya GMK67 V2 65% Custom Mechanical Keyboard |
| mountSupport* | gasket_mount | 0.85 | regex | Foams and its incredibly flexible gasket mount, you're getting the best of both |
| switchTechnologySupport* | mechanical | 0.80 | regex | simple. Featuring durable Kailh Hotswap Sockets and fully pre-assembled, |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: Stabilisers: Plate-mounted |
| connection* | both | 0.90 | regex | C wire Additional features: - Tri-mode: Wired, Wireless 2.4 and Bluetooth |
| hotswap* | true | 0.90 | regex | simple. Featuring durable Kailh Hotswap Sockets and fully pre-assembled, |
| stabilizerType | plate_mount | 0.85 | ai | Stabilisers: Plate-mounted |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | Plastic - Total Keys: 66 pcs - Default plate: Polycarbonate - Foams included: Case, Plate |
| price | 249 | 0.85 | structured | Black / Black: RM249.00 |
| soundProfile | thocky | 0.85 | regex | complete your board! Tuned for Thock Sporting an all-inclusive configuration |
| ⚠ description | Get ready to experience the BEST way to type. | 0.50 | regex | Get ready to experience the BEST way to type. |

## ⚠ needs values · Zuoya GMK26 Wireless Custom Numpad

- key: `mecha:zuoya-gmk26-wireless-custom-numpad` · category: **kit** · [source](https://mecha.com.my/products/zuoya-gmk26-wireless-custom-numpad)
- **missing required:** layouts
- 🔍 blind pass: missing layouts
- note: layout "Numpad" is not in the catalogue schema (60/65/75/tkl/full)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Zuoya GMK26 Wireless Custom Numpad | 0.95 | structured | Zuoya GMK26 Wireless Custom Numpad |
| brand* | Zuoya | 0.90 | structured | vendor: Zuoya |
| beginnerFriendly* | true | 0.85 | ai | Featuring durable Kailh Hotswap Sockets, you can change the switches and keycaps if you want to! |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | gasket_mount | 0.85 | regex | Foams and its incredibly flexible gasket mount, you're getting the best of both |
| switchTechnologySupport* | mechanical | 0.80 | regex | simple. Featuring durable Kailh Hotswap Sockets, you can change the switches |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: Stabilisers: Plate-mounted |
| connection* | both | 0.90 | regex | C wire Additional features: - Tri-mode: Wired, Wireless 2.4 and Bluetooth |
| hotswap* | true | 0.90 | regex | simple. Featuring durable Kailh Hotswap Sockets, you can change the switches |
| stabilizerType | plate_mount | 0.85 | ai | Stabilisers: Plate-mounted |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | Plastic - Total Keys: 26 pcs - Default plate: Polycarbonate - Foams included: Case, Plate |
| price | 149 | 0.85 | structured | Black / Black: RM149.00 |
| soundProfile | thocky | 0.85 | regex | keycaps if you want to! Tuned for Thock Sporting an all-inclusive configuration |
| ⚠ description | GMK26 Zuoya's value-packed kit, now made in a number pad layout! | 0.50 | regex | GMK26 Zuoya's value-packed kit, now made in a number pad layout! |

## ✅ ready · MMD Princess V2 Linear Switch

- key: `mecha:mmd-princess-v2-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/mmd-princess-v2-linear-switch)
- becomes: `switch_mengmoda_mmd_princess_v2_linear_switch`
- 🔍 blind pass: brand: importer "mengmoda" vs blind "mmd"
- fits a valid build, e.g. `switch_mengmoda_mmd_princess_v2_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | MMD Princess V2 Linear Switch | 0.95 | structured | MMD Princess V2 Linear Switch |
| brand* | MENGMODA | 0.90 | structured | vendor: MENGMODA |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: MMD Princess V2 Linear Switch Type: Switch Tags: sound_Deep, |
| pinCount | 5 | 0.90 | regex | in 2025. - PCB-mounted design (5 pins) - PC Top Housing, POM+PTFE Stem, |
| actuationForceG | 45 | 0.85 | regex | POM+PTFE Stem, PA66 Bottom Housing - Actuation: 45g - Bottom: 53g - 20.4mm spring |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | thocky | 0.90 | structured | Tags: sound_Deep |
| ⚠ description | MMD's continues to bring value to the masses with an update to the Princess switches! | 0.50 | regex | MMD's continues to bring value to the masses with an update to the Princess switches! |

## ⚠ needs values · KBDFans Tiger Lite Gaming MX/HE Custom Mechanical Keyboard Kit

- key: `mecha:kbdfans-tiger-lite-gaming-mx-hall-effect-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/kbdfans-tiger-lite-gaming-mx-hall-effect-custom-mechanical-keyboard)
- **missing required:** beginnerFriendly, stabilizerTypeSupport, connection, hotswap
- 🔍 blind pass: switchTechnologySupport: importer "hall_effect" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly, stabilizerTypeSupport, connection, hotswap
- note: AI said mountSupport = ["gasket_mount"] but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | KBDFans Tiger Lite Gaming MX/HE Custom Mechanical Keyboard Kit | 0.95 | structured | KBDFans Tiger Lite Gaming MX/HE Custom Mechanical Keyboard Kit |
| brand* | KBDfans | 0.90 | structured | vendor: KBDfans |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | tkl | 0.70 | regex | screws) A low-cost, lightweight TKL layout board capable of handling |
| mountSupport* | gasket_mount | 0.75 | regex | (Venom HE compatible) Silicone Gasket Structure Dimensions - 7° Typing angle: |
| switchTechnologySupport* | hall_effect | 0.80 | regex | Type: Keyboards Tags: 80%, gaming, hall effect, hall effect board, he, kbdfans, |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| ⚠ connection* | **unknown** | – | default |  |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | fr4 | 0.80 | regex | and bottom (Can be customized) Plate - FR4 Plate (Venom HE compatible) Silicone |
| price | 429 | 0.85 | structured | Black / Mechanical (Nova87) / Black / Mechanical (Nova87): RM429.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Notice: If the option you want is out of stock we can swap the PCB version for you, please message us :) NOTES - This is the FULL KIT for Tiger Lite Gaming whic | 0.50 | regex | Notice: If the option you want is out of stock we can swap the PCB version for you, please message us :) NOTES - This is the FULL KIT for Tiger Lite Gaming whic |

## ⚠ needs values · Keychron Q2 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-q2-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-q2-max-qmk-via-wireless-custom-mechanical-keyboard)
- **missing required:** beginnerFriendly
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "unknown"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "polycarbonate" vs blind "unknown"
- 🔍 blind pass: price: importer "399" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly
- note: every variant is sold out; price is the listed one
- note: variants range RM399–RM799; using the cheapest (Shell White / Gateron Jupiter Red / Shell White / Gateron Jupiter Red)
- note: AI said mountSupport = ["gasket_mount"] but its quote is not in the product text; left unknown
- note: AI said beginnerFriendly = true but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Q2 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron Q2 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | 65 | 0.70 | regex | customized mechanical keyboard with a 65% layout and support for 2.4G wireless, |
| mountSupport* | gasket_mount | 0.75 | regex | foams, combined with the double-gasket design, enable you to experience unparalleled |
| switchTechnologySupport* | mechanical | 0.80 | regex | Connectivity_Wireless, final reductions, hotswap, Keyboard Color_Black, Keyboard |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | We’ve integrated the PCB-mounted screw-in stabilizers for a smoother typing |
| connection* | both | 0.90 | regex | Prebuilt_No, Prebuilt_Yes, spo-disabled, trimode, wireless Variants: Carbon Black |
| hotswap* | true | 0.90 | regex | Connectivity_Wireless, final reductions, hotswap, Keyboard Color_Black, Keyboard |
| stabilizerType | screw_in | 0.80 | regex | We’ve integrated the PCB-mounted screw-in stabilizers for a smoother typing |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.85 | ai | a flexible PC (Polycarbonate) plate |
| price | 399 | 0.85 | structured | Shell White / Gateron Jupiter Red / Shell White / Gateron Jupiter Red: RM399.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron Q2 Max Introducing the Keychron Q2 Max, a full metal QMK/VIA wireless customized mechanical keyboard with a 65% layout and support for 2.4G wireless, B | 0.50 | regex | Keychron Q2 Max Introducing the Keychron Q2 Max, a full metal QMK/VIA wireless customized mechanical keyboard with a 65% layout and support for 2.4G wireless, B |

## ✅ ready · Kailh BCP Linear Switch

- key: `mecha:kailh-bcp-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/kailh-bcp-linear-switch)
- becomes: `switch_kailh_bcp_linear_switch`
- 🔍 blind pass: soundProfile: importer "clacky" vs blind "unknown"
- fits a valid build, e.g. `switch_kailh_bcp_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Kailh BCP Linear Switch | 0.95 | structured | Kailh BCP Linear Switch |
| brand* | Kailh | 0.90 | structured | vendor: Kailh |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Kailh BCP Linear Switch Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | Material - POM Mounting pins - 5pins Sound test: |
| actuationForceG | 52 | 0.85 | regex | Specs Switch Type - Linear, Lubed Operating Force - 52g Bottom-out Force - 63.5g Spring |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | clacky | 0.85 | ai | Tags: sound_Clacky, sound_Creamy |
| ⚠ description | Kailh BCP Switch Specs Switch Type - Linear, Lubed Operating Force - 52g Bottom-out Force - 63.5g Spring Length - 20mm Spring Type - Single-stage Pre Travel - 1 | 0.50 | regex | Kailh BCP Switch Specs Switch Type - Linear, Lubed Operating Force - 52g Bottom-out Force - 63.5g Spring Length - 20mm Spring Type - Single-stage Pre Travel - 1 |

## ⚠ check flags · Zuoya GMK104 100%/Full Size Custom Mechanical Keyboard

- key: `mecha:zuoya-gmk104-100-full-size-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/zuoya-gmk104-100-full-size-custom-mechanical-keyboard)
- becomes: `case_zuoya_gmk104_100_full_size_custom`, `pcb_zuoya_gmk104_100_full_size_custom`, `plate_zuoya_gmk104_100_full_size_custom`
- 🔍 blind pass: duplicate: possibly the same product as existing "case_gmk104_full_abs" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "pcb_gmk104_full_hotswap" (same brand and model code)
- 🔍 blind pass: duplicate: possibly the same product as existing "plate_gmk104_full_pc" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "case_gmk104_full_abs" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "pcb_gmk104_full_hotswap" (same brand and model code)
- ⚠ duplicate: possibly the same product as existing "plate_gmk104_full_pc" (same brand and model code)
- fits a valid build, e.g. `case_zuoya_gmk104_100_full_size_custom` + `pcb_zuoya_gmk104_100_full_size_custom` + `plate_zuoya_gmk104_100_full_size_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_flcmmk_fulin_v3_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Zuoya GMK104 100%/Full Size Custom Mechanical Keyboard | 0.95 | structured | Zuoya GMK104 100%/Full Size Custom Mechanical Keyboard |
| brand* | Zuoya | 0.90 | structured | vendor: Zuoya |
| beginnerFriendly* | true | 0.85 | ai | Featuring durable Kailh Hotswap Sockets and fully pre-assembled, you just need switches and keycaps to complete your board! |
| layouts* | full | 0.90 | regex | Zuoya GMK104 100%/Full Size Custom Mechanical Keyboard |
| mountSupport* | gasket_mount | 0.85 | regex | Foams and its incredibly flexible gasket mount, you're getting the best of both |
| switchTechnologySupport* | mechanical | 0.80 | regex | simple. Featuring durable Kailh Hotswap Sockets and fully pre-assembled, |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: Stabilisers: Plate-mounted |
| connection* | both | 0.90 | regex | C wire Additional features: - Tri-mode: Wired, Wireless 2.4 and Bluetooth |
| hotswap* | true | 0.90 | regex | simple. Featuring durable Kailh Hotswap Sockets and fully pre-assembled, |
| stabilizerType | plate_mount | 0.85 | ai | Stabilisers: Plate-mounted |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | Plastic - Total Keys : 104 pcs - Default plate: Polycarbonate - Foams included: Case, Plate |
| price | 219 | 0.95 | structured | Black / Black: RM219.00 |
| soundProfile | thocky | 0.85 | regex | complete your board! Tuned for Thock Sporting an all-inclusive configuration |
| ⚠ description | Get ready to experience the BEST way to type. | 0.50 | regex | Get ready to experience the BEST way to type. |

## ✅ ready · HMX x YG Macchiato Linear Switch

- key: `mecha:hmx-x-yg-macchiato-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/hmx-x-yg-macchiato-linear-switch)
- becomes: `switch_hmx_x_yg_macchiato_linear_switch`
- 🔍 blind pass: pinCount: importer "5" vs blind "unknown"
- fits a valid build, e.g. `switch_hmx_x_yg_macchiato_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | HMX x YG Macchiato Linear Switch | 0.95 | structured | HMX x YG Macchiato Linear Switch |
| brand* | HMX | 0.90 | structured | vendor: HMX |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: HMX x YG Macchiato Linear Switch Tags: HMX, Linear, sound_Creamy, |
| pinCount | 5 | 0.90 | regex | Title HMX MACCHIATO LINEAR SWITCH 5pins Switch Type - Linear, Lubed Bottom-out |
| actuationForceG | **unknown** | – | default |  |
| price | 1.9 | 0.80 | structured | Default Title / Default Title: RM1.90 |
| soundProfile | creamy | 0.90 | structured | Tags: sound_Creamy |
| ⚠ description | HMX MACCHIATO LINEAR SWITCH 5pins Switch Type - Linear, Lubed Bottom-out Force - 50.0g Spring Length - 20mm Spring Type - Single-stage extended spring Pre Trave | 0.50 | regex | HMX MACCHIATO LINEAR SWITCH 5pins Switch Type - Linear, Lubed Bottom-out Force - 50.0g Spring Length - 20mm Spring Type - Single-stage extended spring Pre Trave |

## ✅ ready · Geon Lucifer HE Switch

- key: `mecha:geon-lucifer-he-switch` · category: **switch** · [source](https://mecha.com.my/products/geon-lucifer-he-switch)
- becomes: `switch_geonworks_geon_lucifer_he_switch`
- 🔍 blind pass: pinCount: importer "unknown" vs blind "2"
- fits a valid build, e.g. `switch_geonworks_geon_lucifer_he_switch` + `case_gh60_universal_aluminum` + `pcb_gh60_hall_effect_magnetic` + `plate_gh60_brass` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon Lucifer HE Switch | 0.95 | structured | Geon Lucifer HE Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | false | 0.70 | rule | rule: Hall-effect switches are not beginner-friendly |
| switchTechnology* | hall_effect | 0.90 | regex | reductions, geon, geon works, geonworks, hall effect, he, Linear, switch, Switch Type_Hall |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | LUCIFER HE SWITCH 2pins Switch Type - Linear, Lubed Bottom-out Force - 45.0g Spring Length - 15.8mm Spring Type - Single-stage Pre Travel - 0.1 ~ 3.7mm (Analog) | 0.50 | regex | LUCIFER HE SWITCH 2pins Switch Type - Linear, Lubed Bottom-out Force - 45.0g Spring Length - 15.8mm Spring Type - Single-stage Pre Travel - 0.1 ~ 3.7mm (Analog) |

## ⚠ needs values · Hiexa V65 65% Mechanical Keyboard - Mirror PVD Weight

- key: `mecha:hiexa-v65` · category: **kit** · [source](https://mecha.com.my/products/hiexa-v65)
- **missing required:** mountSupport
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: mountSupport: importer "unknown" vs blind "gasket_mount;top_mount"
- 🔍 blind pass: stabilizerType: importer "pcb_mount" vs blind "unknown"
- 🔍 blind pass: missing mountSupport
- note: AI (["gasket_mount","top_mount"]) and plain code (["top_mount"]) disagree on mountSupport; left unknown for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Hiexa V65 65% Mechanical Keyboard - Mirror PVD Weight | 0.95 | structured | Hiexa V65 65% Mechanical Keyboard - Mirror PVD Weight |
| brand* | HIEXAKEYS | 0.90 | structured | vendor: HIEXAKEYS |
| beginnerFriendly* | true | 0.70 | ai | Tri-Mode Hotswap PCB - Supports Wired, Bluetooth 5.0, and 2.4G mode. 1.6MM Non-Flex, support QMK/VIA |
| layouts* | 65 | 0.90 | regex | Hiexa V65 65% Mechanical Keyboard - Mirror PVD |
| ⚠ mountSupport* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | liner connection. - Tri-Mode Hotswap PCB - Supports Wired, Bluetooth |
| stabilizerTypeSupport* | pcb_mount | 0.80 | default | kit ships with pcb_mount stabilizers: Support PCB stabilizers |
| connection* | both | 0.90 | regex | the inner liner connection. - Tri-Mode Hotswap PCB - Supports Wired, |
| hotswap* | true | 0.90 | regex | liner connection. - Tri-Mode Hotswap PCB - Supports Wired, Bluetooth |
| stabilizerType | pcb_mount | 0.80 | ai | Support PCB stabilizers |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | pom | 0.80 | regex | Steel PVD Weight - No Flex-Cut POM Plate - 1.6mm No Flex-Cut Tri-Mode |
| price | 549 | 0.95 | structured | Midnight Purple / Midnight Purple: RM549.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Access the PCB guide and firmware for Hiexa V65 here Features Hiexa V65 - Ball Catch Structure - We have adopted a suitable ball catch for the keyboard case, wh | 0.50 | regex | Access the PCB guide and firmware for Hiexa V65 here Features Hiexa V65 - Ball Catch Structure - We have adopted a suitable ball catch for the keyboard case, wh |

## ✅ ready · [Extras] QK80 MK2 Custom Mechanical Keyboard

- key: `mecha:pre-order-qk80mk2-barebones-kit-no-pcb-plate-copy` · category: **kit** · [source](https://mecha.com.my/products/pre-order-qk80mk2-barebones-kit-no-pcb-plate-copy)
- becomes: `case_qwertykeys_extras_qk80_mk2_custom`, `pcb_qwertykeys_extras_qk80_mk2_custom`, `plate_qwertykeys_extras_qk80_mk2_custom`, `stab_qwertykeys_extras_qk80_mk2_custom`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: layouts: importer "tkl" vs blind "unknown"
- 🔍 blind pass: mountSupport: importer "o_ring_mount" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "plate_mount" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "plate_mount" vs blind "unknown"
- 🔍 blind pass: stabilizerSizes: importer "2u;6.25u;7u" vs blind "unknown"
- 🔍 blind pass: price: importer "949" vs blind "unknown"
- fits a valid build, e.g. `case_qwertykeys_extras_qk80_mk2_custom` + `pcb_qwertykeys_extras_qk80_mk2_custom` + `plate_qwertykeys_extras_qk80_mk2_custom` + `stab_qwertykeys_extras_qk80_mk2_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] QK80 MK2 Custom Mechanical Keyboard | 0.95 | structured | [Extras] QK80 MK2 Custom Mechanical Keyboard |
| brand* | qwertykeys | 0.90 | structured | vendor: qwertykeys |
| beginnerFriendly* | true | 0.70 | ai | 3 Tri-Mode Hotswap PCB |
| layouts* | tkl | 0.70 | regex | to present our new generation TKL keyboard—the QK80 MK2. In this |
| mountSupport* | o_ring_mount | 0.85 | ai | NEW Leaf Spring Mounting System + Refined Acoustic Chamber |
| switchTechnologySupport* | mechanical | 0.80 | regex | desired typing sound - 3 Tri-Mode Hotswap PCB - Support USB-C, Bluetooth, |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: free lubed TypePlus Stabilizers installed |
| connection* | both | 0.90 | regex | Layout_80%, Prebuilt_No, qk, screen, trimode, wireless Variants: [Offer] Retro |
| hotswap* | true | 0.90 | regex | desired typing sound - 3 Tri-Mode Hotswap PCB - Support USB-C, Bluetooth, |
| stabilizerType | plate_mount | 0.80 | ai | free lubed TypePlus Stabilizers installed |
| stabilizerSizes | 2u, 6.25u, 7u | 0.80 | regex | and WKL cases - Support both 6.25u and 7u spacebars - Use QK's customized |
| plateMaterial | **unknown** | – | default |  |
| price | 949 | 0.85 | structured | Silver Anodized / WK/1.2mm RGB/FR4 / Silver Anodized / WK/1.2mm RGB/FR4: RM949.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Hello everyone! After a year of meticulous design, we are thrilled to present our new generation TKL keyboard—the QK80 MK2. | 0.50 | regex | Hello everyone! After a year of meticulous design, we are thrilled to present our new generation TKL keyboard—the QK80 MK2. |

## ⚠ needs values · Meletrix Zoom65 V3 SE Wireless Custom Mechanical Keyboard

- key: `mecha:zoom65-v3-special-edition` · category: **kit** · [source](https://mecha.com.my/products/zoom65-v3-special-edition)
- **missing required:** layouts, stabilizerTypeSupport
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: layouts: importer "unknown" vs blind "65"
- 🔍 blind pass: mountSupport: importer "gasket_mount;o_ring_mount;top_mount;tray_mount" vs blind "unknown"
- 🔍 blind pass: price: importer "859" vs blind "unknown"
- 🔍 blind pass: missing layouts, stabilizerTypeSupport
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Meletrix Zoom65 V3 SE Wireless Custom Mechanical Keyboard | 0.95 | structured | Meletrix Zoom65 V3 SE Wireless Custom Mechanical Keyboard |
| brand* | Meletrix | 0.90 | structured | vendor: Meletrix |
| beginnerFriendly* | true | 0.80 | ai | 1.2mm Tri-mode Flex Cut ANSI Hotswap RGB PCB (Support QMK/VIA) |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | gasket_mount, top_mount, tray_mount, o_ring_mount | 0.85 | ai | Accessories for 7 Mounting Systems |
| switchTechnologySupport* | mechanical | 0.80 | regex | - 1.2mm Tri-mode Flex Cut ANSI Hotswap RGB PCB (Support QMK/VIA) - Customized |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | Tail Light - PC Plate - 1.2mm Tri-mode Flex Cut ANSI Hotswap RGB PCB |
| hotswap* | true | 0.90 | regex | - 1.2mm Tri-mode Flex Cut ANSI Hotswap RGB PCB (Support QMK/VIA) - Customized |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | 859 | 0.95 | structured | Silver Special Panda Edition & WS Panda Keycaps / Silver Special Panda Edition & WS Panda Keycaps: RM859.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | The Zoom65 is back for a groundbreaking third version! | 0.50 | regex | The Zoom65 is back for a groundbreaking third version! |

## ✅ ready · Geon Raw HE Switch

- key: `mecha:geon-raw-he-switch` · category: **switch** · [source](https://mecha.com.my/products/geon-raw-he-switch)
- becomes: `switch_geonworks_geon_raw_he_switch`
- 🔍 blind pass: pinCount: importer "unknown" vs blind "2"
- fits a valid build, e.g. `switch_geonworks_geon_raw_he_switch` + `case_gh60_universal_aluminum` + `pcb_gh60_hall_effect_magnetic` + `plate_gh60_brass` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon Raw HE Switch | 0.95 | structured | Geon Raw HE Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | false | 0.70 | rule | rule: Hall-effect switches are not beginner-friendly |
| switchTechnology* | hall_effect | 0.90 | regex | Raw HE Switch Type: Switch Tags: hall effect, magnetic switch, sound_Deep, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 2 | 0.80 | structured | Default Title / Default Title: RM2.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | GEON RAW HE Linear Switch 2pins Switch Type – Linear, Lubed Initial Force – 3 6 .0g Bottom-out Force – 50.0g Spring Length - 15 .0mm Spring Type - Single-stage  | 0.50 | regex | GEON RAW HE Linear Switch 2pins Switch Type – Linear, Lubed Initial Force – 3 6 .0g Bottom-out Force – 50.0g Spring Length - 15 .0mm Spring Type - Single-stage  |

## ✅ ready · Geon Raptor HE Gaming Switch

- key: `mecha:geonworks-raptor-he-gaming-switch` · category: **switch** · [source](https://mecha.com.my/products/geonworks-raptor-he-gaming-switch)
- becomes: `switch_geonworks_geon_raptor_he_gaming_switch`
- 🔍 blind pass: pinCount: importer "5" vs blind "unknown"
- fits a valid build, e.g. `switch_geonworks_geon_raptor_he_gaming_switch` + `case_gh60_universal_aluminum` + `pcb_gh60_hall_effect_magnetic` + `plate_gh60_brass` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon Raptor HE Gaming Switch | 0.95 | structured | Geon Raptor HE Gaming Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | false | 0.70 | rule | rule: Hall-effect switches are not beginner-friendly |
| switchTechnology* | hall_effect | 0.90 | regex | Gaming Switch Type: Switch Tags: hall effect, raptor, sound_Clacky, Switch |
| pinCount | 5 | 0.90 | regex | VENOM HE PCB. RAPTOR HE Switch 5pins Switch Type - Linear, Hall Effect |
| actuationForceG | 42 | 0.85 | regex | Switch Type - Linear, Hall Effect Operating Force - 42.0g Bottom-out Force - 52.0g Spring |
| price | 1.6 | 0.80 | structured | Default Title / Default Title: RM1.60 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Not compatible with Cherry MX. | 0.50 | regex | Not compatible with Cherry MX. |

## ✅ ready · LCET Joker Tactile Switch

- key: `mecha:lcet-joker-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/lcet-joker-tactile-switch)
- becomes: `switch_lcet_joker_tactile_switch`
- 🔍 blind pass: actuationForceG: importer "unknown" vs blind "60"
- fits a valid build, e.g. `switch_lcet_joker_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | LCET Joker Tactile Switch | 0.95 | structured | LCET Joker Tactile Switch |
| brand* | LCET | 0.90 | structured | vendor: LCET |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: LCET Joker Tactile Switch Type: Switch Tags: final |
| pinCount | 5 | 0.90 | regex | Diffuser • Pre-lubed: Yes • Pins：5-Pin |
| actuationForceG | **unknown** | – | default |  |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | thocky | 0.90 | structured | Tags: sound_Deep |
| ⚠ description | • Type: Tactile • Operating Force：60+5gf • Bottom-Out Force：58g • Pre Travel：2.0+0.5mm • Total Travel：3.5mm • Stem: UPE • Top Housing: POM • Bottom Housing: POM | 0.50 | regex | • Type: Tactile • Operating Force：60+5gf • Bottom-Out Force：58g • Pre Travel：2.0+0.5mm • Total Travel：3.5mm • Stem: UPE • Top Housing: POM • Bottom Housing: POM |

## ✅ ready · EverFree Grayish Tactile Switch

- key: `mecha:ever-free-grayish-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/ever-free-grayish-tactile-switch)
- becomes: `switch_gateron_everfree_grayish_tactile_switch`
- 🔍 blind pass: brand: importer "gateron" vs blind "everfree"
- 🔍 blind pass: actuationForceG: importer "10" vs blind "59"
- fits a valid build, e.g. `switch_gateron_everfree_grayish_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | EverFree Grayish Tactile Switch | 0.95 | structured | EverFree Grayish Tactile Switch |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: EverFree Grayish Tactile Switch Type: Switch Tags: Gateron, |
| pinCount | 5 | 0.90 | regex | Support: SMD​ • Pre-lubed: Yes • Pins：5-Pin |
| ⚠ actuationForceG | 10 | 0.55 | regex | Heavy Tactile • Operating Force：59+10gf • Bottom-out force：55g • Pre Travel：2.0+0.5m |
| price | 1.2 | 0.80 | structured | Default Title / Default Title: RM1.20 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | • Type: Heavy Tactile • Operating Force：59+10gf • Bottom-out force：55g • Pre Travel：2.0+0.5mm • Total Travel：3.4mm Max • Stem: POM • Top Housing: PC • Bottom Ho | 0.50 | regex | • Type: Heavy Tactile • Operating Force：59+10gf • Bottom-out force：55g • Pre Travel：2.0+0.5mm • Total Travel：3.4mm Max • Stem: POM • Top Housing: PC • Bottom Ho |

## ✅ ready · Lemokey P1 Pro 75% QMK/VIA Custom Gaming Keyboard

- key: `mecha:lemokey-p1-qmk-via-custom-gaming-keyboard` · category: **kit** · [source](https://mecha.com.my/products/lemokey-p1-qmk-via-custom-gaming-keyboard)
- becomes: `case_lemokey_p1_pro_75_qmk_via_custom_gaming`, `pcb_lemokey_p1_pro_75_qmk_via_custom_gaming`, `plate_lemokey_p1_pro_75_qmk_via_custom_gaming`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "unknown"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "aluminum" vs blind "unknown"
- 🔍 blind pass: price: importer "549" vs blind "unknown"
- fits a valid build, e.g. `case_lemokey_p1_pro_75_qmk_via_custom_gaming` + `pcb_lemokey_p1_pro_75_qmk_via_custom_gaming` + `plate_lemokey_p1_pro_75_qmk_via_custom_gaming` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Lemokey P1 Pro 75% QMK/VIA Custom Gaming Keyboard | 0.95 | structured | Lemokey P1 Pro 75% QMK/VIA Custom Gaming Keyboard |
| brand* | Lemokey | 0.90 | structured | vendor: Lemokey |
| beginnerFriendly* | true | 0.85 | ai | The P1 features hot-swappable switch sockets, which allow you to customize your typing experience. With the hot-swappable feature, you can plug in or change eve |
| layouts* | 75 | 0.90 | regex | Lemokey P1 Pro 75% QMK/VIA Custom Gaming Keyboard |
| mountSupport* | gasket_mount | 0.85 | regex | Hz polling rate, knob design, gasket structure, upgraded acoustic foam, and Cherry |
| switchTechnologySupport* | mechanical | 0.80 | regex | Connectivity_Wireless, custom, hot-swappable, keyboard, Keyboard Color_Black, |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | typing and competitive gaming. SCREW-IN STABILIZER Smooth And Stable |
| connection* | both | 0.75 | regex | Type_Prebuilt, Layout_75%, Prebuilt_Yes, wireless Variants: Silver / Keychron Super |
| hotswap* | true | 0.90 | regex | Connectivity_Wireless, custom, hot-swappable, keyboard, Keyboard Color_Black, |
| stabilizerType | screw_in | 0.80 | regex | typing and competitive gaming. SCREW-IN STABILIZER Smooth And Stable |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | aluminum | 0.85 | ai | Crafted from 6063 aluminum and completed through more than 24 manufacturing stages, including CNC machined, polished, anodized, and sandblasted, the P1 is a sol |
| price | 549 | 0.85 | structured | Silver / Keychron Super Banana (Tactile) / Silver / Keychron Super Banana (Tactile): RM549.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | LEMOKEY P1 Meet the Lemokey P1, a 75% layout QMK custom gaming keyboard with a CNC machined aluminum body. | 0.50 | regex | LEMOKEY P1 Meet the Lemokey P1, a 75% layout QMK custom gaming keyboard with a CNC machined aluminum body. |

## ⚠ needs values · Keychron Q0 Max Custom Wireless Number Pad

- key: `mecha:keychron-q0-max-custom-number-pad` · category: **kit** · [source](https://mecha.com.my/products/keychron-q0-max-custom-number-pad)
- **missing required:** beginnerFriendly, layouts, switchTechnologySupport, stabilizerTypeSupport, hotswap
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: price: importer "459" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly, layouts, switchTechnologySupport, stabilizerTypeSupport, hotswap
- note: every variant is sold out; price is the listed one
- note: AI said mountSupport = ["gasket_mount"] but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Q0 Max Custom Wireless Number Pad | 0.95 | structured | Keychron Q0 Max Custom Wireless Number Pad |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | gasket_mount | 0.75 | regex | upgraded acoustic foams, double-gasket design, PBT keycaps, and more to elevate |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.75 | regex | Title: Keychron Q0 Max Custom Wireless Number Pad Type: Keyboards Tags: |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | 459 | 0.85 | structured | Black / Barebones / Black / Barebones: RM459.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron Q0 Max Introducing the Q0 Max, a full-metal custom number pad with a macro column and rotary encoder knob on the left side. | 0.50 | regex | Keychron Q0 Max Introducing the Q0 Max, a full-metal custom number pad with a macro column and rotary encoder knob on the left side. |

## ✅ ready · Invyr Holy Panda Tactile Switches

- key: `mecha:invyr-holy-panda-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/invyr-holy-panda-tactile-switches)
- becomes: `switch_invyr_holy_panda_tactile_switches`
- 🔍 blind pass: soundProfile: importer "clacky" vs blind "unknown"
- fits a valid build, e.g. `switch_invyr_holy_panda_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Invyr Holy Panda Tactile Switches | 0.95 | structured | Invyr Holy Panda Tactile Switches |
| brand* | Invyr | 0.90 | structured | vendor: Invyr |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Invyr Holy Panda Tactile Switches Type: Switch Tags: sound_Deep, |
| pinCount | 5 | 0.90 | regex | travel: 4mm Mount type: PCB (5-pin) Top housing material: Polycarbonate |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | clacky | 0.85 | regex | provide a satisfyingly bright "clack" with each keystroke. Their blend |
| ⚠ description | INVYR HOLY PANDA TACTILE SWITCH Description Seizing a unique opportunity, we've sourced the revered Holy Pandas at an exceptional price. | 0.50 | regex | INVYR HOLY PANDA TACTILE SWITCH Description Seizing a unique opportunity, we've sourced the revered Holy Pandas at an exceptional price. |

## ⚠ needs values · Keychron Q6 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-q6-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-q6-max-qmk-via-wireless-custom-mechanical-keyboard)
- **missing required:** beginnerFriendly
- 🔍 blind pass: layouts: importer "full" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "unknown"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "polycarbonate" vs blind "unknown"
- 🔍 blind pass: price: importer "869" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly
- note: every variant is sold out; price is the listed one
- note: AI said mountSupport = ["gasket_mount"] but its quote is not in the product text; left unknown
- note: AI said beginnerFriendly = true but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Q6 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron Q6 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | full | 0.70 | regex | customized mechanical keyboard with a 100% full-size layout and support for |
| mountSupport* | gasket_mount | 0.75 | regex | multi-layer acoustic foam and double-gasket design provides an incredibly satisfying |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keyboards Tags: Connectivity_Wireless, hotswap, Keyboard Color_Black, Keyboard |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | We’ve integrated the PCB-mounted screw-in stabilizers for a smoother typing |
| connection* | both | 0.90 | regex | keychron, Layout_96-100%, Prebuilt_No, trimode, wireless Variants: Carbon Black |
| hotswap* | true | 0.90 | regex | Keyboards Tags: Connectivity_Wireless, hotswap, Keyboard Color_Black, Keyboard |
| stabilizerType | screw_in | 0.80 | regex | We’ve integrated the PCB-mounted screw-in stabilizers for a smoother typing |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.85 | ai | flexible PC (Polycarbonate) plate |
| price | 869 | 0.85 | structured | Carbon Black / Barebone / Carbon Black / Barebone: RM869.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron Q6 Max Introducing the Keychron Q6 Max, a full-metal QMK/VIA wireless customized mechanical keyboard with a 100% full-size layout and support for 2.4 G | 0.50 | regex | Keychron Q6 Max Introducing the Keychron Q6 Max, a full-metal QMK/VIA wireless customized mechanical keyboard with a 100% full-size layout and support for 2.4 G |

## ✅ ready · Keychron Q3 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-q3-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-q3-max-qmk-via-wireless-custom-mechanical-keyboard)
- becomes: `case_keychron_q3_max_qmk_via_wireless_custom`, `pcb_keychron_q3_max_qmk_via_wireless_custom`, `plate_keychron_q3_max_qmk_via_wireless_custom`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "aluminum" vs blind "unknown"
- 🔍 blind pass: price: importer "599" vs blind "unknown"
- fits a valid build, e.g. `case_keychron_q3_max_qmk_via_wireless_custom` + `pcb_keychron_q3_max_qmk_via_wireless_custom` + `plate_keychron_q3_max_qmk_via_wireless_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one
- note: variants range RM599–RM929; using the cheapest (Carbon Black / Barebone / Carbon Black / Barebone)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Q3 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron Q3 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.85 | ai | Hot-Swappable sockets are mounted on the PCB, so you can install or change the switches without soldering. |
| layouts* | tkl | 0.70 | regex | Q3 Max Keyboard, featuring an 80% TKL layout, combines advanced |
| mountSupport* | gasket_mount | 0.85 | regex | MX mechanical switches. Double Gasket Design The Double Gasket Design is a |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keyboards Tags: Connectivity_Wireless, hotswap, Keyboard Color_Black, Keyboard |
| stabilizerTypeSupport* | screw_in | 0.70 | regex | softer backlight effect. All New Screw-in PCB Stabilizers The screw-in |
| connection* | both | 0.90 | regex | Layout_80%, Prebuilt_No, Prebuilt_Yes, trimode, wireless Variants: Carbon Black |
| hotswap* | true | 0.90 | regex | Keyboards Tags: Connectivity_Wireless, hotswap, Keyboard Color_Black, Keyboard |
| stabilizerType | screw_in | 0.85 | regex | softer backlight effect. All New Screw-in PCB Stabilizers The screw-in |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | aluminum | 0.85 | ai | The entire metal body is crafted with 6063 aluminum |
| price | 599 | 0.85 | structured | Carbon Black / Barebone / Carbon Black / Barebone: RM599.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron Q3 Max The Q3 Max Keyboard, featuring an 80% TKL layout, combines advanced 2.4G wireless, Bluetooth, and Type-C wired connectivity, enhances workspaces | 0.50 | regex | Keychron Q3 Max The Q3 Max Keyboard, featuring an 80% TKL layout, combines advanced 2.4G wireless, Bluetooth, and Type-C wired connectivity, enhances workspaces |

## ✅ ready · Keychron V3 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-v3-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-v3-max-qmk-via-wireless-custom-mechanical-keyboard)
- becomes: `case_keychron_v3_max_qmk_via_wireless_custom`, `pcb_keychron_v3_max_qmk_via_wireless_custom`, `plate_keychron_v3_max_qmk_via_wireless_custom`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "screw_in"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "polycarbonate" vs blind "unknown"
- 🔍 blind pass: price: importer "349" vs blind "unknown"
- 🔍 blind pass: soundProfile: importer "silent" vs blind "unknown"
- fits a valid build, e.g. `case_keychron_v3_max_qmk_via_wireless_custom` + `pcb_keychron_v3_max_qmk_via_wireless_custom` + `plate_keychron_v3_max_qmk_via_wireless_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron V3 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron V3 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.85 | ai | Hot-swappable The hot-swappable sockets are mounted on the PCB, so you can install or change the switches without soldering. |
| layouts* | tkl | 0.70 | regex | 5.1 connection. It has a classic TKL layout and offers a gasket mount |
| mountSupport* | gasket_mount | 0.85 | regex | classic TKL layout and offers a gasket mount design, sound-absorbing foam, |
| switchTechnologySupport* | mechanical | 0.80 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| connection* | both | 0.75 | regex | Title: Keychron V3 Max QMK/VIA Wireless Custom Mechanical Keyboard Type: |
| hotswap* | true | 0.90 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerType | screw_in | 0.80 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.85 | ai | By adopting a gasket mount design along with a PC (Polycarbonate) plate |
| price | 349 | 0.85 | structured | Carbon Black / Barebones / Carbon Black / Barebones: RM349.00 |
| soundProfile | silent | 0.80 | ai | delivering a softer and quieter typing experience |
| ⚠ description | Keychron V3 Max The V3 Max is a QMK custom mechanical keyboard with 2.4 GHz wireless and Bluetooth 5.1 connection. | 0.50 | regex | Keychron V3 Max The V3 Max is a QMK custom mechanical keyboard with 2.4 GHz wireless and Bluetooth 5.1 connection. |

## ✅ ready · Keychron V10 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-v10-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-v10-max-qmk-via-wireless-custom-mechanical-keyboard)
- becomes: `case_keychron_v10_max_qmk_via_wireless_custom`, `pcb_keychron_v10_max_qmk_via_wireless_custom`, `plate_keychron_v10_max_qmk_via_wireless_custom`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: layouts: importer "75" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "screw_in"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "polycarbonate" vs blind "unknown"
- fits a valid build, e.g. `case_keychron_v10_max_qmk_via_wireless_custom` + `pcb_keychron_v10_max_qmk_via_wireless_custom` + `plate_keychron_v10_max_qmk_via_wireless_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one
- note: AI said soundProfile = "silent" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron V10 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron V10 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.85 | ai | Hot-swappable sockets are mounted on the PCB, so you can install or change the switches without soldering. |
| layouts* | 75 | 0.70 | regex | Bluetooth 5.1 connectivity. With its 75% Alice layout, gasket mount construction, |
| mountSupport* | gasket_mount | 0.85 | regex | connectivity. With its 75% Alice layout, gasket mount construction, sound-absorbing |
| switchTechnologySupport* | mechanical | 0.80 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| connection* | both | 0.75 | regex | Title: Keychron V10 Max QMK/VIA Wireless Custom Mechanical Keyboard Type: |
| hotswap* | true | 0.90 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerType | screw_in | 0.80 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | Version) Body Material: ABS Plastic Plate Material: PC Polling Rate: 1000 Hz (2.4 GHz |
| price | 359 | 0.95 | structured | Carbon Black / Barebones / Carbon Black / Barebones: RM359.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron V10 Max The V10 Max is a premium, customizable mechanical keyboard that offers both 2.4 GHz wireless and Bluetooth 5.1 connectivity. | 0.50 | regex | Keychron V10 Max The V10 Max is a premium, customizable mechanical keyboard that offers both 2.4 GHz wireless and Bluetooth 5.1 connectivity. |

## ✅ ready · Keychron V1 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-v1-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-v1-max-qmk-via-wireless-custom-mechanical-keyboard)
- becomes: `case_keychron_v1_max_qmk_via_wireless_custom`, `pcb_keychron_v1_max_qmk_via_wireless_custom`, `plate_keychron_v1_max_qmk_via_wireless_custom`
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "screw_in"
- 🔍 blind pass: connection: importer "both" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "polycarbonate" vs blind "unknown"
- 🔍 blind pass: price: importer "349" vs blind "unknown"
- fits a valid build, e.g. `case_keychron_v1_max_qmk_via_wireless_custom` + `pcb_keychron_v1_max_qmk_via_wireless_custom` + `plate_keychron_v1_max_qmk_via_wireless_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_c3_equalz_v3_screw_in`
- note: every variant is sold out; price is the listed one
- note: AI said soundProfile = "silent" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron V1 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron V1 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.85 | ai | Hot-swappable The hot-swappable sockets are mounted on the PCB, so you can install or change the switches without soldering. |
| layouts* | 75 | 0.70 | regex | 5.1 connectivity. Its compact 75% layout, gasket mount design, sound |
| mountSupport* | gasket_mount | 0.85 | regex | connectivity. Its compact 75% layout, gasket mount design, sound absorbing foam, |
| switchTechnologySupport* | mechanical | 0.80 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| connection* | both | 0.75 | regex | Title: Keychron V1 Max QMK/VIA Wireless Custom Mechanical Keyboard Type: |
| hotswap* | true | 0.90 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerType | screw_in | 0.80 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.85 | ai | By adopting a gasket mount design along with a PC (Polycarbonate) plate |
| price | 349 | 0.85 | structured | Barebones / Carbon Black / Barebones / Carbon Black: RM349.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron V1 Max The V1 Max is a fully customizable mechanical keyboard, offering both 2.4 GHz wireless and Bluetooth 5.1 connectivity. | 0.50 | regex | Keychron V1 Max The V1 Max is a fully customizable mechanical keyboard, offering both 2.4 GHz wireless and Bluetooth 5.1 connectivity. |

## ⚠ needs values · Createkeebs Luminkey 80 Wireless Custom Mechanical Keyboard

- key: `mecha:createkeebs-luminkey-80-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/createkeebs-luminkey-80-custom-mechanical-keyboard)
- **missing required:** stabilizerTypeSupport
- 🔍 blind pass: beginnerFriendly: importer "true" vs blind "unknown"
- 🔍 blind pass: price: importer "799" vs blind "unknown"
- 🔍 blind pass: soundProfile: importer "clacky" vs blind "unknown"
- 🔍 blind pass: missing stabilizerTypeSupport

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Createkeebs Luminkey 80 Wireless Custom Mechanical Keyboard | 0.95 | structured | Createkeebs Luminkey 80 Wireless Custom Mechanical Keyboard |
| brand* | Createkeebs | 0.90 | structured | vendor: Createkeebs |
| beginnerFriendly* | true | 0.85 | ai | Hot-swappable |
| layouts* | tkl | 0.70 | regex | layout switch · Hot-swappable · 80% ISO/ANSI Layout · QMK/VIA support |
| mountSupport* | gasket_mount | 0.85 | regex | - Layout: 80% TKL ANSI/ISO - Mounting: Gasket Mount - Programming Support: |
| switchTechnologySupport* | mechanical | 0.80 | regex | wired) · WIN/MAC layout switch · Hot-swappable · 80% ISO/ANSI Layout · QMK/VIA |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | Layout_80%, Prebuilt_No, Prebuilt_Yes, trimode Variants: Fully Assembled + WOB |
| hotswap* | true | 0.90 | regex | wired) · WIN/MAC layout switch · Hot-swappable · 80% ISO/ANSI Layout · QMK/VIA |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | 1.6mm Hot-swap - Plate: 1.5mm PC Plate Material - Case: 6063 CNC Aluminum |
| price | 799 | 0.95 | structured | Fully Assembled + 9009 Keycaps (WK) / Anodized Black / Fully Assembled + 9009 Keycaps (WK) / Anodized Black: RM799.00 |
| soundProfile | clacky | 0.80 | ai | The gasket mount makes the typing softer, and brand-new Sylva switches make the sound crisp |
| ⚠ description | LUMINKEY80 Elevate Your Workspace, Simplify Your Style. | 0.50 | regex | LUMINKEY80 Elevate Your Workspace, Simplify Your Style. |

## ⚠ needs values · Keychron Q3 Pro QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-q3-pro-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-q3-pro-qmk-via-wireless-custom-mechanical-keyboard)
- **missing required:** beginnerFriendly
- 🔍 blind pass: stabilizerTypeSupport: importer "pcb_mount;screw_in" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "screw_in" vs blind "unknown"
- 🔍 blind pass: plateMaterial: importer "polycarbonate" vs blind "unknown"
- 🔍 blind pass: price: importer "599" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly
- note: every variant is sold out; price is the listed one
- note: AI said mountSupport = ["gasket_mount"] but its quote is not in the product text; left unknown
- note: AI said beginnerFriendly = true but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Q3 Pro QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron Q3 Pro QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | tkl | 0.70 | regex | Special Edition provides a unique TKL layout with upgraded designs on |
| mountSupport* | gasket_mount | 0.75 | regex | premium designs, including double-gasket design, PBT keycaps, screw-in stabs, |
| switchTechnologySupport* | mechanical | 0.80 | regex | Learn more about how to use VIA > Hot-Swappable Every detail matters for a personalized |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | double-gasket design, PBT keycaps, screw-in stabs, etc., it will deliver you |
| connection* | both | 0.75 | regex | Title: Keychron Q3 Pro QMK/VIA Wireless Custom Mechanical Keyboard Type: |
| hotswap* | true | 0.90 | regex | Learn more about how to use VIA > Hot-Swappable Every detail matters for a personalized |
| stabilizerType | screw_in | 0.80 | regex | double-gasket design, PBT keycaps, screw-in stabs, etc., it will deliver you |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.85 | ai | Experience the next level of key sounds and comfort with our gasket mount design together with a flexible PC (Polycarbonate) plate. |
| price | 599 | 0.85 | structured | Green / Barebones / Green / Barebones: RM599.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Keychron Q3 Pro SE Meet the Keychron Q3 Pro, a groundbreaking full metal QMK/VIA wireless custom mechanical keyboard. | 0.50 | regex | Keychron Q3 Pro SE Meet the Keychron Q3 Pro, a groundbreaking full metal QMK/VIA wireless custom mechanical keyboard. |

## ⚠ needs values · AM Compact Touch Split Backspace Edition by Angry Miao

- key: `mecha:copy-of-pre-order-angry-miao-am-compact-touch-am-65-less` · category: **kit** · [source](https://mecha.com.my/products/copy-of-pre-order-angry-miao-am-compact-touch-am-65-less)
- **missing required:** beginnerFriendly, layouts, stabilizerTypeSupport
- 🔍 blind pass: mountSupport: importer "o_ring_mount" vs blind "unknown"
- 🔍 blind pass: missing beginnerFriendly, layouts, stabilizerTypeSupport
- note: every variant is sold out; price is the listed one
- note: variants range RM999–RM2299; using the cheapest (Night Drive / Engraved / Night Drive / Engraved)
- note: layout "Split" is not in the catalogue schema (60/65/75/tkl/full)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | AM Compact Touch Split Backspace Edition by Angry Miao | 0.95 | structured | AM Compact Touch Split Backspace Edition by Angry Miao |
| brand* | Angry Miao | 0.90 | structured | vendor: Angry Miao |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | o_ring_mount | 0.85 | ai | Mounting method: Angry Miao Two-Stage Adjustable Leaf-Spring Mount |
| switchTechnologySupport* | mechanical | 0.80 | regex | individual board . PCB 1.2mm 4-layer hot-swap split backspace PCB with in-switch |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.75 | regex | USB Type-C (supports C to C) and Bluetooth 5.1 connectivity. Supports wireless |
| hotswap* | true | 0.90 | regex | individual board . PCB 1.2mm 4-layer hot-swap split backspace PCB with in-switch |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | pom | 0.80 | regex | combo), supports up to 7 layers. Plate POM plate compatible with split backspace. |
| price | 999 | 0.85 | structured | Night Drive / Engraved / Night Drive / Engraved: RM999.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | AM Compact Touch Split Backspace Edition by Angry Miao Reviews and builds Mike Wat: https://www.youtube.com/watch?v=TPEY2-o_uJ0 Lewis Toh: https://www.youtube.c | 0.50 | regex | AM Compact Touch Split Backspace Edition by Angry Miao Reviews and builds Mike Wat: https://www.youtube.com/watch?v=TPEY2-o_uJ0 Lewis Toh: https://www.youtube.c |

## ⚠ needs values · TX AP Clip-on PCB Mounted Stabilizers

- key: `mecha:tx-2023-almost-perfect-pcb-clip-on-stabilizers` · category: **stabilizer** · [source](https://mecha.com.my/products/tx-2023-almost-perfect-pcb-clip-on-stabilizers)
- **missing required:** layouts
- 🔍 blind pass: missing layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | TX AP Clip-on PCB Mounted Stabilizers | 0.95 | structured | TX AP Clip-on PCB Mounted Stabilizers |
| brand* | TX Keyboards | 0.90 | structured | vendor: TX Keyboards |
| beginnerFriendly* | false | 0.70 | rule | rule: pcb_mount stabilizers are not beginner-friendly |
| stabilizerType* | pcb_mount | 0.85 | regex | Title: TX AP Clip-on PCB Mounted Stabilizers Type: Stabilizers |
| ⚠ layouts* | **unknown** | – | default |  |
| stabilizerSizes* | 2u, 6.25u, 7u | 0.80 | regex | Stabilizers now come with both 6.25u and 7u spacebar wires with upgraded |
| price | 10 | 0.85 | structured | Normal 1.6mm / Black / Normal 1.6mm / Black: RM10.00 |
| ⚠ description | Taking in feedback from previous TX Stabilizer revisions, the latest iteration of TX Almost Perfect (AP) Stabilizers now come with both 6.25u and 7u spacebar wi | 0.50 | regex | Taking in feedback from previous TX Stabilizer revisions, the latest iteration of TX Almost Perfect (AP) Stabilizers now come with both 6.25u and 7u spacebar wi |

## ✅ ready · Zeta.Keyboards Hera R2 60% Barebones Mechanical Keyboard

- key: `mecha:zeta-keyboards-hera-r2-60-barebones-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/zeta-keyboards-hera-r2-60-barebones-mechanical-keyboard)
- becomes: `case_zeta_keyboards_zeta_keyboards_hera_r2_60`, `pcb_zeta_keyboards_zeta_keyboards_hera_r2_60`, `plate_zeta_keyboards_zeta_keyboards_hera_r2_60`
- 🔍 blind pass: mountSupport: importer "o_ring_mount" vs blind "unknown"
- 🔍 blind pass: stabilizerType: importer "pcb_mount" vs blind "unknown"
- fits a valid build, e.g. `case_zeta_keyboards_zeta_keyboards_hera_r2_60` + `pcb_zeta_keyboards_zeta_keyboards_hera_r2_60` + `plate_zeta_keyboards_zeta_keyboards_hera_r2_60` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_tx_ap_clip_in_pcb_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Zeta.Keyboards Hera R2 60% Barebones Mechanical Keyboard | 0.95 | structured | Zeta.Keyboards Hera R2 60% Barebones Mechanical Keyboard |
| brand* | Zeta Keyboards | 0.90 | structured | vendor: Zeta Keyboards |
| beginnerFriendly* | false | 0.85 | ai | Hera comes with a solder-only PCB |
| layouts* | 60 | 0.90 | regex | Zeta.Keyboards Hera R2 60% Barebones Mechanical Keyboard |
| mountSupport* | o_ring_mount | 0.85 | ai | unique typing experience from the gummy-worm mounting |
| switchTechnologySupport* | mechanical | 0.80 | regex | Compatibility Supports both PCB mounted (5-pin) and Plate mounted (3-pin) MX-style |
| stabilizerTypeSupport* | pcb_mount | 0.70 | regex | PCB and is only compatible with PCB Mounted Clip-in stabilizers. A-Stock |
| ⚠ connection* | wired | 0.60 | regex | Layout: ANSI Connectivity & Power Wired USB 2.0 Type-C Compatible System: |
| ⚠ hotswap* | false | 0.60 | regex | note that the Hera comes with a solder-only PCB and is only compatible with PCB |
| stabilizerType | pcb_mount | 0.85 | regex | PCB and is only compatible with PCB Mounted Clip-in stabilizers. A-Stock |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | fr4 | 0.85 | ai | 1x FR4 Half-Plate |
| price | 679 | 0.85 | structured | B-Stock / Black / B-Stock / Black: RM679.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Extra PCB / Plate Here Zeta.Keyboard's first board - the Hera, may be simple at first glance. | 0.50 | regex | Extra PCB / Plate Here Zeta.Keyboard's first board - the Hera, may be simple at first glance. |

## ⚠ needs values · Durock V3 Screw-in Transparent Gold PCB Mounted Stabilizers

- key: `mecha:everglide-v3-transparent-gold-plated-screw-in-stabilizers` · category: **stabilizer** · [source](https://mecha.com.my/products/everglide-v3-transparent-gold-plated-screw-in-stabilizers)
- **missing required:** layouts
- 🔍 blind pass: brand: importer "everglide" vs blind "durock"
- 🔍 blind pass: missing layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Durock V3 Screw-in Transparent Gold PCB Mounted Stabilizers | 0.95 | structured | Durock V3 Screw-in Transparent Gold PCB Mounted Stabilizers |
| brand* | Everglide | 0.90 | structured | vendor: Everglide |
| beginnerFriendly* | false | 0.70 | rule | rule: screw_in stabilizers are not beginner-friendly |
| stabilizerType* | screw_in | 0.80 | regex | Title: Durock V3 Screw-in Transparent Gold PCB Mounted Stabilizers |
| ⚠ layouts* | **unknown** | – | default |  |
| stabilizerSizes* | 2u, 6.25u, 7u | 0.80 | regex | Screw-in stabs - Contains: 5x 2U, 1x 6.25U, 1x 7U |
| price | 30 | 0.95 | structured | Default Title / Default Title: RM30.00 |
| ⚠ description | Durock V3 Screw-in Stabilizers SPEC - PC housing - PCB-mounted stabilizers - Stainless steel gold plated wires - Screw-in stabs - Contains: 5x 2U, 1x 6.25U, 1x  | 0.50 | regex | Durock V3 Screw-in Stabilizers SPEC - PC housing - PCB-mounted stabilizers - Stainless steel gold plated wires - Screw-in stabs - Contains: 5x 2U, 1x 6.25U, 1x  |

## ⚠ needs values · TX Rev.3 Stablizer Set

- key: `mecha:tx-stablizer-set` · category: **stabilizer** · [source](https://mecha.com.my/products/tx-stablizer-set)
- **missing required:** layouts
- 🔍 blind pass: missing layouts
- note: only cheap variants are in stock (RM19 vs RM49 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | TX Rev.3 Stablizer Set | 0.95 | structured | TX Rev.3 Stablizer Set |
| brand* | TX Keyboards | 0.90 | structured | vendor: TX Keyboards |
| beginnerFriendly* | false | 0.70 | rule | rule: pcb_mount stabilizers are not beginner-friendly |
| stabilizerType* | pcb_mount | 0.85 | ai | Tags: clearance, final reductions, Stabilizer Style_PCB Mount |
| ⚠ layouts* | **unknown** | – | default |  |
| stabilizerSizes* | 2u, 6.25u, 7u | 0.80 | regex | stabilizers Variants: 1.2T / Black / 6.25U (WK) / 1.2T / Black / 6.25U (WK) |
| price | **unknown** | – | default |  |
| ⚠ description | Description TX Stabilizers is designed by kin25 of TX keyboards with the goal of improving the design of Cherry clip-in stabilizers. | 0.50 | regex | Description TX Stabilizers is designed by kin25 of TX keyboards with the goal of improving the design of Cherry clip-in stabilizers. |

## ⚠ needs values · [Extras] GMK Finer Things R2

- key: `mecha:group-buy-gmk-finer-things-r2` · category: **keycap** · [source](https://mecha.com.my/products/group-buy-gmk-finer-things-r2)
- **missing required:** keycapProfile, switchTechnologySupport
- note: variants range RM129–RM479; using the cheapest (Novelties / Novelties)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] GMK Finer Things R2 | 0.95 | structured | [Extras] GMK Finer Things R2 |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| ⚠ keycapProfile* | **unknown** | – | default |  |
| ⚠ layouts* | full | 0.65 | regex | match the color of the end product 100%. |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| price | 129 | 0.85 | structured | Novelties / Novelties: RM129.00 |
| ⚠ description | GMK FINER THINGS R2 DISCLAIMER The images shown are renders of the product and are only used for illustration purposes. | 0.50 | regex | GMK FINER THINGS R2 DISCLAIMER The images shown are renders of the product and are only used for illustration purposes. |

## ⚠ needs values · Mecha X TUT: LOFI Keycaps

- key: `mecha:mecha-x-tut-lofi-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/mecha-x-tut-lofi-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha X TUT: LOFI Keycaps | 0.95 | structured | Mecha X TUT: LOFI Keycaps |
| brand* | Mecha | 0.85 | structured | Mecha X TUT: LOFI Keycaps |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Specifications: - Material: PBT - Profile: Cherry - Production Method: Dye-sublimation |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | Compatibility: Compatible with MX-style switches - Designer: Mecha |
| price | 249 | 0.95 | structured | Default Title / Default Title: RM249.00 |
| ⚠ description | MECHA X TUT: LOFI is a dark purple keycap set with different shades of pink and lilac: Inspired by all those late nights staying up. | 0.50 | regex | MECHA X TUT: LOFI is a dark purple keycap set with different shades of pink and lilac: Inspired by all those late nights staying up. |

## ✅ ready · Monx Gravity Tactile Switch

- key: `mecha:monx-gravity-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/monx-gravity-tactile-switch)
- becomes: `switch_tdx_studios_monx_gravity_tactile_switch`
- fits a valid build, e.g. `switch_tdx_studios_monx_gravity_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch
- note: AI ("creamy") and plain code ("thocky") disagree on soundProfile; left unknown for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Monx Gravity Tactile Switch | 0.95 | structured | Monx Gravity Tactile Switch |
| brand* | TDX Studios | 0.90 | structured | vendor: TDX Studios |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.70 | regex | Title: Monx Gravity Tactile Switch Type: Switch Tags: sound_Creamy, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 50 | 0.85 | regex | Spring Bottom Out: 65g Spring Actuation: 50g |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| ⚠ soundProfile | thocky | 0.60 | regex | feedback with a satisfying result on thock builds! Manufacturer: BSUN Materials |
| ⚠ description | The Gravity Tactiles are made with a unique semi-silent mold, combing a sharp, robust tactile feedback with a satisfying result on thock builds! | 0.50 | regex | The Gravity Tactiles are made with a unique semi-silent mold, combing a sharp, robust tactile feedback with a satisfying result on thock builds! |

## ⚠ needs values · [Extras] +84 TKL by Nuxros

- key: `mecha:extras-84-tkl-by-nuxros` · category: **kit** · [source](https://mecha.com.my/products/extras-84-tkl-by-nuxros)
- **missing required:** stabilizerTypeSupport, connection
- note: every variant is sold out; price is the listed one
- note: AI said mountSupport = ["top_mount","o_ring_mount"] but its quote is not in the product text; left unknown
- note: AI said plateMaterial = "aluminum" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] +84 TKL by Nuxros | 0.95 | structured | [Extras] +84 TKL by Nuxros |
| brand* | Nuxros | 0.90 | structured | vendor: Nuxros |
| beginnerFriendly* | true | 0.80 | ai | PCB: Hotswap/Solder Blackcore |
| layouts* | tkl | 0.90 | regex | [Extras] +84 TKL by Nuxros |
| mountSupport* | top_mount | 0.75 | regex | No Engraving - Mounting Style: Top Mount/PCB Snap - Weight: Stainless |
| switchTechnologySupport* | mechanical | 0.80 | regex | Layout_80% Variants: Red/Brass/WK/Hotswap / Red/Brass/WK/Hotswap \| Grey/Brass/WK/Hotsw |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| ⚠ connection* | **unknown** | – | default |  |
| hotswap* | true | 0.90 | regex | Layout_80% Variants: Red/Brass/WK/Hotswap / Red/Brass/WK/Hotswap \| Grey/Brass/WK/Hotsw |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | aluminum | 0.80 | regex | of your choice with the default alu plate and engraved logo. Introduction |
| price | 1099 | 0.85 | structured | Red/Brass/WK/Hotswap / Red/Brass/WK/Hotswap: RM1099.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | In-stock extras for +84 TKL All units are WK, Hotswap and comes with a Brass sandblasted weight in the case color of your choice with the default alu plate and  | 0.50 | regex | In-stock extras for +84 TKL All units are WK, Hotswap and comes with a Brass sandblasted weight in the case color of your choice with the default alu plate and  |

## ⚠ needs values · Transparent Keycap OEM Profile

- key: `mecha:transparent-keycap-oem-profile` · category: **keycap** · [source](https://mecha.com.my/products/transparent-keycap-oem-profile)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Transparent Keycap OEM Profile | 0.95 | structured | Transparent Keycap OEM Profile |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | oem | 0.80 | regex | Title: Transparent Keycap OEM Profile Variants: Default Title |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by oem profile (MX stem): Title: Transparent Keycap OEM Profile Variants: Default Title |
| price | 2 | 0.95 | structured | Default Title / Default Title: RM2.00 |
| description | **unknown** | – | default |  |

## ⚠ needs values · [In-Stock] GMK CYL Ramune

- key: `mecha:gb-gmk-cyl-ramune` · category: **keycap** · [source](https://mecha.com.my/products/gb-gmk-cyl-ramune)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one
- note: variants range RM79–RM499; using the cheapest (Novelties / Novelties)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] GMK CYL Ramune | 0.95 | structured | [In-Stock] GMK CYL Ramune |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Specifications: - Made in Germany by GMK - Cherry (CYL) profile (1-1-2-3-4-4) - |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | (1-1-2-3-4-4) - Compatible with MX switches - 1.5mm thick double-shot ABS |
| price | 79 | 0.85 | structured | Novelties / Novelties: RM79.00 |
| ⚠ description | Important, please read before purchasing. | 0.50 | regex | Important, please read before purchasing. |

## ✅ ready · BSUN Taichi V2 Linear Switch

- key: `mecha:bsun-taichi-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/bsun-taichi-linear-switch)
- becomes: `switch_bsun_taichi_v2_linear_switch`
- fits a valid build, e.g. `switch_bsun_taichi_v2_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | BSUN Taichi V2 Linear Switch | 0.95 | structured | BSUN Taichi V2 Linear Switch |
| brand* | Bsun | 0.90 | structured | vendor: Bsun |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.70 | regex | Title: BSUN Taichi V2 Linear Switch Type: Switch Tags: bsun, |
| pinCount | 5 | 0.90 | regex | travel: 3.6mm Mount type: PCB (5-pin) Top housing material: PC Bottom |
| actuationForceG | **unknown** | – | default |  |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | BSUN's back with another budget banger, ready to blow out the competition with a switch that delivers a premium typing experience, without the cost! | 0.50 | regex | BSUN's back with another budget banger, ready to blow out the competition with a switch that delivers a premium typing experience, without the cost! |

## ✅ ready · BSUN Taichi V1 Linear Switch

- key: `mecha:bsun-taichi-v1` · category: **switch** · [source](https://mecha.com.my/products/bsun-taichi-v1)
- becomes: `switch_bsun_taichi_v1_linear_switch`
- fits a valid build, e.g. `switch_bsun_taichi_v1_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | BSUN Taichi V1 Linear Switch | 0.95 | structured | BSUN Taichi V1 Linear Switch |
| brand* | Bsun | 0.90 | structured | vendor: Bsun |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.8 (≤ RM2) |
| switchTechnology* | mechanical | 0.70 | regex | Title: BSUN Taichi V1 Linear Switch Type: Switch Tags: bsun, |
| pinCount | 5 | 0.90 | regex | travel: 3.6mm Mount type: PCB (5-pin) Top housing material: PC Bottom |
| actuationForceG | **unknown** | – | default |  |
| price | 0.8 | 0.80 | structured | Default Title / Default Title: RM0.80 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | BSUN's back with another budget banger, ready to blow out the competition with a switch that delivers a premium typing experience, without the cost! | 0.50 | regex | BSUN's back with another budget banger, ready to blow out the competition with a switch that delivers a premium typing experience, without the cost! |

## ✅ ready · [Extras] GMK British Racing Green R2 (Simple Base Kit)

- key: `mecha:gb-gmk-british-racing-green-r2-simple-base` · category: **keycap** · [source](https://mecha.com.my/products/gb-gmk-british-racing-green-r2-simple-base)
- becomes: `keycap_gmk_extras_gmk_british_racing_green_r2_simple_base_kit`
- fits a valid build, e.g. `keycap_gmk_extras_gmk_british_racing_green_r2_simple_base_kit` + `case_gmk104_full_abs` + `pcb_gmk104_full_hotswap` + `plate_gmk104_full_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk104_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] GMK British Racing Green R2 (Simple Base Kit) | 0.95 | structured | [Extras] GMK British Racing Green R2 (Simple Base Kit) |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Specifications - Made in Germany by GMK - Cherry profile (1-1-2-3-4-4) - Compatible with |
| ⚠ layouts* | full | 0.65 | regex | match the color of the end product 100%. Specifications - Made in Germany |
| switchTechnologySupport* | mechanical | 0.80 | regex | (1-1-2-3-4-4) - Compatible with MX switches - 1.5mm thick Double-shot - Material: |
| price | 349 | 0.95 | structured | Simple Base Kit / Simple Base Kit: RM349.00 |
| ⚠ description | GMK British Racing Green R2 Simple Base DISCLAIMER The images shown are renders of the product and are only used for illustration purposes. | 0.50 | regex | GMK British Racing Green R2 Simple Base DISCLAIMER The images shown are renders of the product and are only used for illustration purposes. |

## ✅ ready · Kailh Polia Tactile Switches

- key: `mecha:kailh-polia-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/kailh-polia-tactile-switches)
- becomes: `switch_kailh_polia_tactile_switches`
- fits a valid build, e.g. `switch_kailh_polia_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Kailh Polia Tactile Switches | 0.95 | structured | Kailh Polia Tactile Switches |
| brand* | Kailh | 0.90 | structured | vendor: Kailh |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Kailh Polia Tactile Switches Type: Switch Tags: spo-default, |
| pinCount | 3 | 0.90 | regex | stem. - Plate mounted design (3 pins) - Pre-travel：1.9 mm - Total |
| actuationForceG | 60 | 0.85 | regex | travel：3.8 mm - Operating: 45g - Actuation: 60g - Bottom: 75g |
| price | 1.9 | 0.80 | structured | Default Title / Default Title: RM1.90 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Kailh Polia advanced tactile switch is a new design with a hefty actuation but smooth bump. | 0.50 | regex | Kailh Polia advanced tactile switch is a new design with a hefty actuation but smooth bump. |

## ✅ ready · JWICK Ice Jade Tactile Switches

- key: `mecha:jwick-ice-jade-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/jwick-ice-jade-tactile-switches)
- becomes: `switch_jwk_jwick_ice_jade_tactile_switches`
- fits a valid build, e.g. `switch_jwk_jwick_ice_jade_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWICK Ice Jade Tactile Switches | 0.95 | structured | JWICK Ice Jade Tactile Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWICK Ice Jade Tactile Switches Type: Switch Tags: Tactile |
| pinCount | 5 | 0.90 | regex | switches. - PCB mounted design (5 pins) - 62g long spring - Light factory |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | silent | 0.85 | ai | Resulting in a switch that is not only quiet, but still retains its press feel unlike typical silenced switches. |
| ⚠ description | JWICK introduces the Jade switches, but these are far from loud and clicky like the switches that they happen to share a name with. | 0.50 | regex | JWICK introduces the Jade switches, but these are far from loud and clicky like the switches that they happen to share a name with. |

## ✅ ready · Geonworks Raptor MX Gaming Linear Switch

- key: `mecha:geonworks-raptor-mx-gaming-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/geonworks-raptor-mx-gaming-linear-switch)
- becomes: `switch_geonworks_raptor_mx_gaming_linear_switch`
- fits a valid build, e.g. `switch_geonworks_raptor_mx_gaming_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geonworks Raptor MX Gaming Linear Switch | 0.95 | structured | Geonworks Raptor MX Gaming Linear Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Geonworks Raptor MX Gaming Linear Switch Type: Switch Tags: Linear |
| pinCount | 5 | 0.90 | regex | Default Title RAPTOR MX Switch 5pins Switch Type - Linear, Speed Operating |
| actuationForceG | 42 | 0.85 | regex | 5pins Switch Type - Linear, Speed Operating Force - 42.0g Bottom-out Force - 48.0g Spring |
| price | 2 | 0.80 | structured | Default Title / Default Title: RM2.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | RAPTOR MX Switch 5pins Switch Type - Linear, Speed Operating Force - 42.0g Bottom-out Force - 48.0g Spring Length - 20.0mm, NAS wire Spring Type - Single-Stage  | 0.50 | regex | RAPTOR MX Switch 5pins Switch Type - Linear, Speed Operating Force - 42.0g Bottom-out Force - 48.0g Spring Length - 20.0mm, NAS wire Spring Type - Single-Stage  |

## ✅ ready · Black on White Hiragana Cherry Profile Keycap Set

- key: `mecha:black-on-white-hiragana-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/black-on-white-hiragana-cherry-profile-keycap-set)
- becomes: `keycap_mecha_black_on_white_hiragana_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_black_on_white_hiragana_cherry_profile_keycap_set` + `case_gmk104_full_abs` + `pcb_gmk104_full_hotswap` + `plate_gmk104_full_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk104_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Black on White Hiragana Cherry Profile Keycap Set | 0.95 | structured | Black on White Hiragana Cherry Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Black on White Hiragana Cherry Profile Keycap Set Type: Keycaps Tags: |
| layouts* | full, tkl, 75, 60 | 0.80 | regex | Process: Dye-sub Compatiblity ANSI 100/80/75/60 supported 7U, Tsangan, HHKB not supported |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Black on White Hiragana Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Classic Black on White with Hiragana sublegends in Cherry Profile. | 0.50 | regex | Classic Black on White with Hiragana sublegends in Cherry Profile. |

## ✅ ready · Cupid MOA Profile Keycap Set

- key: `mecha:cupid-moa-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/cupid-moa-profile-keycap-set)
- becomes: `keycap_mecha_cupid_moa_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_cupid_moa_profile_keycap_set` + `case_gmk104_full_abs` + `pcb_gmk104_full_hotswap` + `plate_gmk104_full_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk104_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Cupid MOA Profile Keycap Set | 0.95 | structured | Cupid MOA Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | moa | 0.80 | regex | Title: Cupid MOA Profile Keycap Set Type: Keycaps |
| layouts* | full, tkl, 75, 60 | 0.80 | regex | Process: Dye-sub Compatiblity ANSI 100/80/75/60 supported 7U, Tsangan, HHKB not supported |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by moa profile (MX stem): Title: Cupid MOA Profile Keycap Set Type: Keycaps |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | Spread the love in a cutesy pale blush color pallete in a round, comfortable MOA profile! | 0.50 | regex | Spread the love in a cutesy pale blush color pallete in a round, comfortable MOA profile! |

## ✅ ready · Zuoya GMK68 65% Custom Mechanical Keyboard

- key: `mecha:zuoya-gmk68` · category: **kit** · [source](https://mecha.com.my/products/zuoya-gmk68)
- becomes: `case_zuoya_gmk68_65_custom`, `pcb_zuoya_gmk68_65_custom`, `plate_zuoya_gmk68_65_custom`
- fits a valid build, e.g. `case_zuoya_gmk68_65_custom` + `pcb_zuoya_gmk68_65_custom` + `plate_zuoya_gmk68_65_custom` + `switch_gateron_milky_yellow_pro` + `keycap_unknown_pudding_oem_pbt` + `stab_flcmmk_fulin_v3_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Zuoya GMK68 65% Custom Mechanical Keyboard | 0.95 | structured | Zuoya GMK68 65% Custom Mechanical Keyboard |
| brand* | Zuoya | 0.90 | structured | vendor: Zuoya |
| beginnerFriendly* | true | 0.85 | ai | Featuring durable Kailh Hotswap Sockets and fully pre-assembled, you just need switches and keycaps to complete your board! |
| layouts* | 65 | 0.90 | regex | Zuoya GMK68 65% Custom Mechanical Keyboard |
| mountSupport* | tray_mount | 0.75 | regex | your setup. Specs Mounting: Tray Mounted - Case material: ABS Plastic - |
| switchTechnologySupport* | mechanical | 0.80 | regex | simple. Featuring durable Kailh Hotswap Sockets and fully pre-assembled, |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: Stabilisers: Plate-mounted |
| connection* | both | 0.90 | regex | C wire Additional features: - Tri-mode: Wired, Wireless 2.4 and Bluetooth |
| hotswap* | true | 0.90 | regex | simple. Featuring durable Kailh Hotswap Sockets and fully pre-assembled, |
| stabilizerType | plate_mount | 0.85 | ai | Stabilisers: Plate-mounted |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | Plastic - Total Keys: 68 pcs - Default plate: Polycarbonate - Foams included: Case, Plate |
| price | 149 | 0.95 | structured | Black / Black: RM149.00 |
| ⚠ soundProfile | thocky | 0.60 | regex | complete your board! Tuned for Thock Sporting an all-inclusive configuration |
| ⚠ description | Get ready to experience the BEST way to type. | 0.50 | regex | Get ready to experience the BEST way to type. |

## ⚠ needs values · Leobog Hi75C Pro Aluminum 75% Barebones Keyboard Kit

- key: `mecha:leobog-hi75c-pro-75-barebones-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/leobog-hi75c-pro-75-barebones-keyboard-kit)
- **missing required:** stabilizerTypeSupport

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Leobog Hi75C Pro Aluminum 75% Barebones Keyboard Kit | 0.95 | structured | Leobog Hi75C Pro Aluminum 75% Barebones Keyboard Kit |
| brand* | Leobog | 0.90 | structured | vendor: Leobog |
| beginnerFriendly* | true | 0.85 | ai | Hot-Swappable Switches Enjoy full hot-swappable support across all keys. Compatible with 3-pin and 5-pin switches, you can easily experiment with different swit |
| layouts* | 75 | 0.90 | regex | Leobog Hi75C Pro Aluminum 75% Barebones Keyboard Kit |
| mountSupport* | gasket_mount | 0.85 | regex | engineered for competitive gaming. Gasket-Mounted Structure Designed with a soft |
| switchTechnologySupport* | mechanical | 0.80 | regex | without sacrificing performance. Hot-Swappable Switches Enjoy full hot-swappable |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.90 | regex | Black \| White / White Hi75C PRO – Tri-Mode Mechanical Keyboard The Hi75C |
| hotswap* | true | 0.90 | regex | without sacrificing performance. Hot-Swappable Switches Enjoy full hot-swappable |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | pp | 0.85 | ai | Default plate: Polypropylene (PP) |
| price | 169 | 0.85 | structured | Black / Black: RM169.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Hi75C PRO – Tri-Mode Mechanical Keyboard The Hi75C PRO builds upon its predecessor with significant upgrades in connectivity, functionality, and user experience | 0.50 | regex | Hi75C PRO – Tri-Mode Mechanical Keyboard The Hi75C PRO builds upon its predecessor with significant upgrades in connectivity, functionality, and user experience |

## ⚠ needs values · Leobog Hi8SE Aluminum 75% Wireless Aluminum (Barebones Kit)

- key: `mecha:leobog-hi8se-aluminum-75-wireless-aluminum-barebones-kit` · category: **kit** · [source](https://mecha.com.my/products/leobog-hi8se-aluminum-75-wireless-aluminum-barebones-kit)
- **missing required:** stabilizerTypeSupport

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Leobog Hi8SE Aluminum 75% Wireless Aluminum (Barebones Kit) | 0.95 | structured | Leobog Hi8SE Aluminum 75% Wireless Aluminum (Barebones Kit) |
| brand* | Leobog | 0.90 | structured | vendor: Leobog |
| beginnerFriendly* | true | 0.80 | ai | Hot swappable |
| layouts* | 75 | 0.90 | regex | Leobog Hi8SE Aluminum 75% Wireless Aluminum (Barebones Kit) |
| mountSupport* | tray_mount | 0.85 | ai | Flex Cut PC Plate & PCB |
| switchTechnologySupport* | mechanical | 0.80 | regex | decorative badge (for some variants) - Hot swappable, South Facing RGB, Flex Cut PC |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| connection* | both | 0.75 | regex | Title: Leobog Hi8SE Aluminum 75% Wireless Aluminum (Barebones Kit) Type: |
| hotswap* | true | 0.90 | regex | decorative badge (for some variants) - Hot swappable, South Facing RGB, Flex Cut PC |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | swappable, South Facing RGB, Flex Cut PC Plate & PCB - Padding: (5 layers) plate |
| price | 369 | 0.85 | structured | Black / Black: RM369.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Specifications - SE (Special Edition) version : refined finishing, new magnetic decorative badge - 75% Layout (80 keys + 1 knob) - CNC Anodized/e-Coated Aluminu | 0.50 | regex | Specifications - SE (Special Edition) version : refined finishing, new magnetic decorative badge - 75% Layout (80 keys + 1 knob) - CNC Anodized/e-Coated Aluminu |

## ⚠ needs values · Venom 60 HE Gaming Keyboard Kit

- key: `mecha:venom-60-he-gaming-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/venom-60-he-gaming-keyboard-kit)
- **missing required:** beginnerFriendly, layouts, connection, hotswap

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Venom 60 HE Gaming Keyboard Kit | 0.95 | structured | Venom 60 HE Gaming Keyboard Kit |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| mountSupport* | tray_mount | 0.80 | ai | Venom 60 HE FR4 Plate |
| switchTechnologySupport* | hall_effect | 0.80 | regex | Keyboards Tags: 60%, final reductions, hall effect, he, keyboard, Keyboard Type_Barebones |
| stabilizerTypeSupport* | plate_mount | 0.80 | default | kit ships with plate_mount stabilizers: Fourwrap Stabilizers |
| ⚠ connection* | **unknown** | – | default |  |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | plate_mount | 0.85 | ai | Fourwrap Stabilizers |
| stabilizerSizes | 2u, 6.25u | 0.80 | regex | Included: - Venom 60 HE PCB (6.25U) + C3 daughterboard and cable |
| plateMaterial | fr4 | 0.80 | regex | Trigger - Snap Tap (nullbinds) - FR4 Plate for a deep sound - Acoustic foam |
| price | 405 | 0.85 | structured | Blue ABS / Blue ABS: RM405.00 |
| soundProfile | creamy | 0.85 | ai | Acoustic foam treatment for that creamy thocky sound |
| ⚠ description | Built around the Geonworks Venom Hall Effect PCB , this DIY keyboard kit is designed for enthusiasts who want the same level of performance as some of the best  | 0.50 | regex | Built around the Geonworks Venom Hall Effect PCB , this DIY keyboard kit is designed for enthusiasts who want the same level of performance as some of the best  |

## ✅ ready · Coffee Cat XDA Keycap Set

- key: `mecha:coffee-cat-xda-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/coffee-cat-xda-keycap-set)
- becomes: `keycap_mecha_coffee_cat_xda_keycap_set`
- fits a valid build, e.g. `keycap_mecha_coffee_cat_xda_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Coffee Cat XDA Keycap Set | 0.95 | structured | Coffee Cat XDA Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | xda | 0.80 | regex | Title: Coffee Cat XDA Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | layouts:ANSI, ISO, 100%,TKL,75%,65%,60% (Not supported: 7u, split backspace, |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by xda profile (MX stem): Title: Coffee Cat XDA Keycap Set Type: Keycaps Tags: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Do you like coffee? Dapper up your keyboard with classy cream and coffee tones crafted in a flat, uniform XDA profile. | 0.50 | regex | Do you like coffee? Dapper up your keyboard with classy cream and coffee tones crafted in a flat, uniform XDA profile. |

## ⚠ needs values · Fourwrap V2 Stabilizers (PCB Mount)

- key: `mecha:sss-fourwrap-v2-stabilizers-screw-in-pcb-mount` · category: **stabilizer** · [source](https://mecha.com.my/products/sss-fourwrap-v2-stabilizers-screw-in-pcb-mount)
- **missing required:** layouts
- note: AI said stabilizerType = "pcb_mount" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Fourwrap V2 Stabilizers (PCB Mount) | 0.95 | structured | Fourwrap V2 Stabilizers (PCB Mount) |
| brand* | Morning | 0.90 | structured | vendor: Morning |
| beginnerFriendly* | false | 0.70 | rule | rule: screw_in stabilizers are not beginner-friendly |
| stabilizerType* | screw_in | 0.80 | regex | Type: Stabilizers Tags: pcb mount, screw-in, Stabilizer Style_PCB Mount, stabilizers, |
| ⚠ layouts* | **unknown** | – | default |  |
| stabilizerSizes* | 2u, 6.25u, 7u | 0.80 | regex | the box: - 4x 2U wires - 1x 6.25U wire - 1x 7u wire - 10x housings |
| price | 49 | 0.95 | structured | Default Title / Default Title: RM49.00 |
| ⚠ description | New stabilizers which are designed to be used unlubed with zero ticking. | 0.50 | regex | New stabilizers which are designed to be used unlubed with zero ticking. |

## ✅ ready · Island Retreat PBT Dye Sub XDA Profile Keycap Set

- key: `mecha:island-retreat-pbt-dye-sub-xda-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/island-retreat-pbt-dye-sub-xda-profile-keycap-set)
- becomes: `keycap_mecha_island_retreat_pbt_dye_sub_xda_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_island_retreat_pbt_dye_sub_xda_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Island Retreat PBT Dye Sub XDA Profile Keycap Set | 0.95 | structured | Island Retreat PBT Dye Sub XDA Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | xda | 0.80 | regex | Title: Island Retreat PBT Dye Sub XDA Profile Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65%, 7U Tsangan |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by xda profile (MX stem): Title: Island Retreat PBT Dye Sub XDA Profile Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Inspired by calm and relaxing vibes on a island vacation. | 0.50 | regex | Inspired by calm and relaxing vibes on a island vacation. |

## ✅ ready · Pastel Weather PBT Dye Sub XDA Profile Keycap Set

- key: `mecha:pastel-weather-pbt-dye-sub-xda-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/pastel-weather-pbt-dye-sub-xda-profile-keycap-set)
- becomes: `keycap_mecha_pastel_weather_pbt_dye_sub_xda_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_pastel_weather_pbt_dye_sub_xda_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Pastel Weather PBT Dye Sub XDA Profile Keycap Set | 0.95 | structured | Pastel Weather PBT Dye Sub XDA Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | xda | 0.80 | regex | Title: Pastel Weather PBT Dye Sub XDA Profile Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not Supported: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by xda profile (MX stem): Title: Pastel Weather PBT Dye Sub XDA Profile Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | A cutesy baby blue and baby pink set on a white base with cute custom weather novelty icons. | 0.50 | regex | A cutesy baby blue and baby pink set on a white base with cute custom weather novelty icons. |

## ✅ ready · Retro Beige ABS Double Shot Cherry Profile Keycap Set

- key: `mecha:retro-beige-abs-double-shot-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/retro-beige-abs-double-shot-cherry-profile-keycap-set)
- becomes: `keycap_mecha_retro_beige_abs_double_shot_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_retro_beige_abs_double_shot_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Retro Beige ABS Double Shot Cherry Profile Keycap Set | 0.95 | structured | Retro Beige ABS Double Shot Cherry Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Retro Beige ABS Double Shot Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65%, 7U Tsangan |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Retro Beige ABS Double Shot Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | Classic retro beige, now in ABS double-shot for that crisp and full sound. | 0.50 | regex | Classic retro beige, now in ABS double-shot for that crisp and full sound. |

## ✅ ready · Red Industrial Retro PBT Dye Sub Cherry Profile Keycap Set

- key: `mecha:red-industrial-retro-pbt-dye-sub-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/red-industrial-retro-pbt-dye-sub-cherry-profile-keycap-set)
- becomes: `keycap_mecha_red_industrial_retro_pbt_dye_sub_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_red_industrial_retro_pbt_dye_sub_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Red Industrial Retro PBT Dye Sub Cherry Profile Keycap Set | 0.95 | structured | Red Industrial Retro PBT Dye Sub Cherry Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Red Industrial Retro PBT Dye Sub Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65%, 7U Tsangan |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Red Industrial Retro PBT Dye Sub Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | This set uses the famous alert-row design, featuring a bold red stripe on the top row to heavily accent the board, with subtle red alphabets on a classic grey t | 0.50 | regex | This set uses the famous alert-row design, featuring a bold red stripe on the top row to heavily accent the board, with subtle red alphabets on a classic grey t |

## ✅ ready · Sea Salt Lemon Candy Cherry Profile PBT+PC Double Shot Jelly Keycap Set

- key: `mecha:sea-salt-lemon-candy-cherry-profile-pbt-pc-double-shot-jelly-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/sea-salt-lemon-candy-cherry-profile-pbt-pc-double-shot-jelly-keycap-set)
- becomes: `keycap_mecha_sea_salt_lemon_candy_cherry_profile_pbt_pc_double_shot_jelly`
- fits a valid build, e.g. `keycap_mecha_sea_salt_lemon_candy_cherry_profile_pbt_pc_double_shot_jelly` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Sea Salt Lemon Candy Cherry Profile PBT+PC Double Shot Jelly Keycap Set | 0.95 | structured | Sea Salt Lemon Candy Cherry Profile PBT+PC Double Shot Jelly Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Sea Salt Lemon Candy Cherry Profile PBT+PC Double Shot Jelly Keycap |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65%, 7U Tsangan |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Sea Salt Lemon Candy Cherry Profile PBT+PC Double Shot Jelly Keycap |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | This is a salt & lemon inspired keycap set, using a special PBT+PC double shot effect to create a soft, Jelly-like visual. | 0.50 | regex | This is a salt & lemon inspired keycap set, using a special PBT+PC double shot effect to create a soft, Jelly-like visual. |

## ✅ ready · Pixie Cherry Profile PBT Dye Sub Keycap Set

- key: `mecha:pixie-cherry-profile-pbt-dye-sub-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/pixie-cherry-profile-pbt-dye-sub-keycap-set)
- becomes: `keycap_mecha_pixie_cherry_profile_pbt_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_mecha_pixie_cherry_profile_pbt_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Pixie Cherry Profile PBT Dye Sub Keycap Set | 0.95 | structured | Pixie Cherry Profile PBT Dye Sub Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Pixie Cherry Profile PBT Dye Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65%, 7U Tsangan |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Pixie Cherry Profile PBT Dye Sub Keycap Set Type: Keycaps |
| price | 79 | 0.95 | structured | Default Title / Default Title: RM79.00 |
| ⚠ description | Add a gentle, magical touch to your keyboard with the Pixie keycap set! | 0.50 | regex | Add a gentle, magical touch to your keyboard with the Pixie keycap set! |

## ✅ ready · Kanagawa Shine Through Double Shot PBT Cherry Profile Keycap Set (White)

- key: `mecha:kanagawa-shine-through-double-shot-pbt-cherry-profile-keycap-set-white` · category: **keycap** · [source](https://mecha.com.my/products/kanagawa-shine-through-double-shot-pbt-cherry-profile-keycap-set-white)
- becomes: `keycap_mecha_kanagawa_shine_through_double_shot_pbt_cherry_profile_keycap`
- fits a valid build, e.g. `keycap_mecha_kanagawa_shine_through_double_shot_pbt_cherry_profile_keycap` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Kanagawa Shine Through Double Shot PBT Cherry Profile Keycap Set (White) | 0.95 | structured | Kanagawa Shine Through Double Shot PBT Cherry Profile Keycap Set (White) |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Shine Through Double Shot PBT Cherry Profile Keycap Set (White) Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Shine Through Double Shot PBT Cherry Profile Keycap Set (White) Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | *Highly Recommended for Wooting60, Mad60, Mad68 and similar Add a unique flare to your south-facing RGB keyboard! | 0.50 | regex | *Highly Recommended for Wooting60, Mad60, Mad68 and similar Add a unique flare to your south-facing RGB keyboard! |

## ✅ ready · Kanagawa Wave Shine Through Double Shot PBT Cherry Profile Keycap Set (Black)

- key: `mecha:kanagawa-wave-shine-through-double-shot-pbt-cherry-profile-keycap-set-black` · category: **keycap** · [source](https://mecha.com.my/products/kanagawa-wave-shine-through-double-shot-pbt-cherry-profile-keycap-set-black)
- becomes: `keycap_mecha_kanagawa_wave_shine_through_double_shot_pbt_cherry_profile_k`
- fits a valid build, e.g. `keycap_mecha_kanagawa_wave_shine_through_double_shot_pbt_cherry_profile_k` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Kanagawa Wave Shine Through Double Shot PBT Cherry Profile Keycap Set (Black) | 0.95 | structured | Kanagawa Wave Shine Through Double Shot PBT Cherry Profile Keycap Set (Black) |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Shine Through Double Shot PBT Cherry Profile Keycap Set (Black) Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Shine Through Double Shot PBT Cherry Profile Keycap Set (Black) Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | *Highly Recommended for Wooting60, Mad60, Mad68 and similar Add a unique flare to your south-facing RGB keyboard! | 0.50 | regex | *Highly Recommended for Wooting60, Mad60, Mad68 and similar Add a unique flare to your south-facing RGB keyboard! |

## ⚠ needs values · [Extras] GMK CYL MONO

- key: `mecha:group-buy-gmk-cyl-mono` · category: **keycap** · [source](https://mecha.com.my/products/group-buy-gmk-cyl-mono)
- **missing required:** layouts
- note: only cheap variants are in stock (RM49 vs RM380 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] GMK CYL MONO | 0.95 | structured | [Extras] GMK CYL MONO |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Specifications: - Made in Germany by GMK - Cherry (CYL) profile (1-1-2-3-4-4) - |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | (1-1-2-3-4-4) - Compatible with MX switches - 1.5mm thick double-shot ABS |
| price | **unknown** | – | default |  |
| ⚠ description | In-stock extras now available Specifications: - Made in Germany by GMK - Cherry (CYL) profile (1-1-2-3-4-4) - Compatible with MX switches - 1.5mm thick double-s | 0.50 | regex | In-stock extras now available Specifications: - Made in Germany by GMK - Cherry (CYL) profile (1-1-2-3-4-4) - Compatible with MX switches - 1.5mm thick double-s |

## ⚠ needs values · [Extras] Neo98 Wireless 98% Keyboard Kit

- key: `mecha:pre-order-extras-neo98-wireless-98-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/pre-order-extras-neo98-wireless-98-keyboard-kit)
- **missing required:** beginnerFriendly, layouts, mountSupport, switchTechnologySupport, hotswap
- note: only cheap variants are in stock (RM95 vs RM730 listed): they look like add-ons, so the price is left for you
- note: layout "98%" is not in the catalogue schema (60/65/75/tkl/full)
- note: several options: the page offers more than one plateMaterial; left unknown for you to pick
- note: AI (["gasket_mount","top_mount"]) and plain code (["top_mount"]) disagree on mountSupport; left unknown for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [Extras] Neo98 Wireless 98% Keyboard Kit | 0.95 | structured | [Extras] Neo98 Wireless 98% Keyboard Kit |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| ⚠ mountSupport* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| stabilizerTypeSupport* | pcb_mount | 0.80 | default | kit ships with pcb_mount stabilizers: 1 set of PCB clip-in NeoStab |
| connection* | both | 0.90 | regex | Variants: Black / Golden Weight / Tri-mode / Alu Plate / Black / Golden Weight |
| ⚠ hotswap* | **unknown** | – | default |  |
| stabilizerType | pcb_mount | 0.80 | ai | 1 set of PCB clip-in NeoStab |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | **unknown** | – | default |  |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Notice These are extras from our Q1 2026 Neo/QK Preorder ETA is not precise but expected to fulfil in April Only pre-determined, fixed configurations are availa | 0.50 | regex | Notice These are extras from our Q1 2026 Neo/QK Preorder ETA is not precise but expected to fulfil in April Only pre-determined, fixed configurations are availa |

## ⚠ needs values · JKDK Retro Chocolate Cherry Profile Keycaps

- key: `mecha:jkdk-retro-chocolate-cherry-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-retro-chocolate-cherry-profile-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Retro Chocolate Cherry Profile Keycaps | 0.95 | structured | JKDK Retro Chocolate Cherry Profile Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Retro Chocolate Cherry Profile Keycaps Type: Keycaps Tags: Keycap |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Retro Chocolate Cherry Profile Keycaps Type: Keycaps Tags: Keycap |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Give your keyboard a warm, cozy upgrade with the JKDK Retro Chocolate Keycap Set. | 0.50 | regex | Give your keyboard a warm, cozy upgrade with the JKDK Retro Chocolate Keycap Set. |

## ✅ ready · Sakura Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:sakura-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/sakura-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_sakura_shine_through_cherry_profile_pbt_keycaps_side_printed`
- fits a valid build, e.g. `keycap_mecha_sakura_shine_through_cherry_profile_pbt_keycaps_side_printed` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Sakura Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | Sakura Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Sakura Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Sakura Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 79 | 0.95 | structured | Default Title / Default Title: RM79.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ✅ ready · Blue Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:blue-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/blue-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_blue_gradient_shine_through_cherry_profile_pbt_keycaps_side`
- fits a valid build, e.g. `keycap_mecha_blue_gradient_shine_through_cherry_profile_pbt_keycaps_side` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Blue Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | Blue Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Blue Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Blue Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ✅ ready · Green Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:green-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/green-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_green_gradient_shine_through_cherry_profile_pbt_keycaps_side`
- fits a valid build, e.g. `keycap_mecha_green_gradient_shine_through_cherry_profile_pbt_keycaps_side` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Green Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | Green Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Green Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Green Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ✅ ready · White Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:white-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/white-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_white_shine_through_cherry_profile_pbt_keycaps_side_printed`
- fits a valid build, e.g. `keycap_mecha_white_shine_through_cherry_profile_pbt_keycaps_side_printed` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | White Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | White Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: White Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: White Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ✅ ready · Pink Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:pink-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/pink-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_pink_gradient_shine_through_cherry_profile_pbt_keycaps_side`
- fits a valid build, e.g. `keycap_mecha_pink_gradient_shine_through_cherry_profile_pbt_keycaps_side` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Pink Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | Pink Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Pink Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Pink Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ✅ ready · Gray Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:gray-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/gray-gradient-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_gray_gradient_shine_through_cherry_profile_pbt_keycaps_side`
- fits a valid build, e.g. `keycap_mecha_gray_gradient_shine_through_cherry_profile_pbt_keycaps_side` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gray Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | Gray Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Gray Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Gray Gradient Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ✅ ready · JKDK Supernova Cherry Profile Hi-Gloss Keycap Set

- key: `mecha:jkdk-supernova-cherry-profile-hi-gloss-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-supernova-cherry-profile-hi-gloss-keycap-set)
- becomes: `keycap_jkdk_supernova_cherry_profile_hi_gloss_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_supernova_cherry_profile_hi_gloss_keycap_set` + `case_gmk61_60_abs` + `pcb_gmk61_60_hotswap` + `plate_gmk61_60_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk61_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Supernova Cherry Profile Hi-Gloss Keycap Set | 0.95 | structured | JKDK Supernova Cherry Profile Hi-Gloss Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Supernova Cherry Profile Hi-Gloss Keycap Set Type: Keycaps |
| ⚠ layouts* | 60 | 0.65 | regex | finishing Compatibility: ANSI 100-60%, WKL and stepped caps |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Supernova Cherry Profile Hi-Gloss Keycap Set Type: Keycaps |
| price | 79 | 0.95 | structured | Default Title / Default Title: RM79.00 |
| ⚠ description | SU-SU-SU-SUPERNOVA! Add some heat to your keyboard with the Supernova keycap set, sporting intense heat graphics in an eye-catching hi-gloss finishing. | 0.50 | regex | SU-SU-SU-SUPERNOVA! Add some heat to your keyboard with the Supernova keycap set, sporting intense heat graphics in an eye-catching hi-gloss finishing. |

## ⚠ needs values · Blue Mist Cherry Profile Keycap set

- key: `mecha:blue-mist-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/blue-mist-cherry-profile-keycap-set)
- **missing required:** layouts

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Blue Mist Cherry Profile Keycap set | 0.95 | structured | Blue Mist Cherry Profile Keycap set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Blue Mist Cherry Profile Keycap set Type: Keycaps Tags: |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Blue Mist Cherry Profile Keycap set Type: Keycaps Tags: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | For the blue lovers! This Blue Mist keycap set features the latest evolution in keycaps, introducing see-through crystal keycaps on top of a gradient theme, sho | 0.50 | regex | For the blue lovers! This Blue Mist keycap set features the latest evolution in keycaps, introducing see-through crystal keycaps on top of a gradient theme, sho |

## ⚠ needs values · Stealth Black on Grey Cherry Profile Keycap Set

- key: `mecha:stealth-black-on-grey-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/stealth-black-on-grey-cherry-profile-keycap-set)
- **missing required:** layouts

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Stealth Black on Grey Cherry Profile Keycap Set | 0.95 | structured | Stealth Black on Grey Cherry Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Stealth Black on Grey Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Stealth Black on Grey Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Shhhhh 🥷 Fits most layouts, contact us if unsure. | 0.50 | regex | Shhhhh 🥷 Fits most layouts, contact us if unsure. |

## ✅ ready · JKDK Pink & Blue on White PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-pink-blue-on-white-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-pink-blue-on-white-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_pink_blue_on_white_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_pink_blue_on_white_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: variants range RM49–RM399; using the cheapest (Numpad / Numpad)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Pink & Blue on White PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Pink & Blue on White PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | JKDK Pink & Blue on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): JKDK Pink & Blue on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 49 | 0.85 | structured | Numpad / Numpad: RM49.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ⚠ needs values · [In-Stock] GMK Evil Dolch The Split

- key: `mecha:gmk-evil-dolch-the-split` · category: **keycap** · [source](https://mecha.com.my/products/gmk-evil-dolch-the-split)
- **missing required:** keycapProfile, switchTechnologySupport
- note: every variant is sold out; price is the listed one
- note: variants range RM79–RM499; using the cheapest (Novelties / Novelties)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] GMK Evil Dolch The Split | 0.95 | structured | [In-Stock] GMK Evil Dolch The Split |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| ⚠ keycapProfile* | **unknown** | – | default |  |
| ⚠ layouts* | 60, 65, 75, tkl | 0.65 | regex | 75%, 81 keys - 65%, 67 keys - 60%, 61 keys - HHKB, 62 keys - Numpad, |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| price | 79 | 0.85 | structured | Novelties / Novelties: RM79.00 |
| ⚠ description | GMK Evil Dolch - The Split by GEON, S3LQ Specifications - Alpha Keycap Color - GMK N9 (Dark Grey) - Alpha Legend Color - GMK WS1 (White) - Modifier Keycap Color | 0.50 | regex | GMK Evil Dolch - The Split by GEON, S3LQ Specifications - Alpha Keycap Color - GMK N9 (Dark Grey) - Alpha Legend Color - GMK WS1 (White) - Modifier Keycap Color |

## ✅ ready · Keychron Grey Double-shot OSA Profile Keycap Set

- key: `mecha:keychron-grey-double-shot-osa-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/keychron-grey-double-shot-osa-profile-keycap-set)
- becomes: `keycap_keychron_grey_double_shot_osa_profile_keycap_set`
- fits a valid build, e.g. `keycap_keychron_grey_double_shot_osa_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: layouts inferred from a large key count; check the set covers each layout

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Grey Double-shot OSA Profile Keycap Set | 0.95 | structured | Keychron Grey Double-shot OSA Profile Keycap Set |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | oem | 0.80 | regex | come in OSA profile (similar to OEM height and Spherical Angled looks |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.55 | regex | Size And Height For Each Keycap (141 Keys) Note: before you purchase the |
| switchTechnologySupport* | mechanical | 0.80 | regex | Compatible with all normal profile MX style switches, these full set |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Double Shot PBT Keycap with OSA Profile Compatible with all normal profile MX style switches, these full set keycaps come in OSA profile (similar to OEM height  | 0.50 | regex | Double Shot PBT Keycap with OSA Profile Compatible with all normal profile MX style switches, these full set keycaps come in OSA profile (similar to OEM height  |

## ✅ ready · Keychron Blue & White Double-shot OSA Profile Keycap Set

- key: `mecha:keychron-blue-white-double-shot-osa-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/keychron-blue-white-double-shot-osa-profile-keycap-set)
- becomes: `keycap_keychron_blue_white_double_shot_osa_profile_keycap_set`
- fits a valid build, e.g. `keycap_keychron_blue_white_double_shot_osa_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: layouts inferred from a large key count; check the set covers each layout

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron Blue & White Double-shot OSA Profile Keycap Set | 0.95 | structured | Keychron Blue & White Double-shot OSA Profile Keycap Set |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | oem | 0.80 | regex | come in OSA profile (similar to OEM height and Spherical Angled looks |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.55 | regex | Size And Height For Each Keycap (141 Keys) Note: before you purchase the |
| switchTechnologySupport* | mechanical | 0.80 | regex | Compatible with all normal profile MX style switches, these full set |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Double Shot PBT Keycap with OSA Profile Compatible with all normal profile MX style switches, these full set keycaps come in OSA profile (similar to OEM height  | 0.50 | regex | Double Shot PBT Keycap with OSA Profile Compatible with all normal profile MX style switches, these full set keycaps come in OSA profile (similar to OEM height  |

## ✅ ready · FBB Play Station Keycap Set

- key: `mecha:fbb-play-station-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-play-station-keycap-set)
- becomes: `keycap_fbb_play_station_keycap_set`
- fits a valid build, e.g. `keycap_fbb_play_station_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Play Station Keycap Set | 0.95 | structured | FBB Play Station Keycap Set |
| brand* | FBB | 0.80 | regex | FBB Play Station Keycap Set |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. Inspired by the game consoles |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | (35 Novelties) - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · Mecha Topography V2 Side Printed RGB Shine Through Cherry Profile Keycaps

- key: `mecha:topography-v2-side-printed-rgb-shine-through-cherry-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/topography-v2-side-printed-rgb-shine-through-cherry-profile-keycaps)
- becomes: `keycap_mecha_topography_v2_side_printed_rgb_shine_through_cherry_profile`
- fits a valid build, e.g. `keycap_mecha_topography_v2_side_printed_rgb_shine_through_cherry_profile` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Topography V2 Side Printed RGB Shine Through Cherry Profile Keycaps | 0.95 | structured | Mecha Topography V2 Side Printed RGB Shine Through Cherry Profile Keycaps |
| brand* | Mecha | 0.85 | structured | Mecha Topography V2 Side Printed RGB Shine Through Cherry Profile Keycaps |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Side Printed RGB Shine Through Cherry Profile Keycaps Type: Keycaps Tags: final |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not include: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Side Printed RGB Shine Through Cherry Profile Keycaps Type: Keycaps Tags: final |
| price | 49 | 0.95 | structured | Default Title / Default Title: RM49.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Transparent Shine-Through - РВТ Process: Double-Shot - Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not incl | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Transparent Shine-Through - РВТ Process: Double-Shot - Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not incl |

## ⚠ needs values · JKDK Valentines Cherry Profile Keycaps

- key: `mecha:jkdk-valentines-cherry-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-valentines-cherry-profile-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Valentines Cherry Profile Keycaps | 0.95 | structured | JKDK Valentines Cherry Profile Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Valentines Cherry Profile Keycaps Type: Keycaps Tags: Keycap |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Valentines Cherry Profile Keycaps Type: Keycaps Tags: Keycap |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | Add a touch of sweetness to your keyboard with these JKDK Valentines Cherry Profile Keycaps. | 0.50 | regex | Add a touch of sweetness to your keyboard with these JKDK Valentines Cherry Profile Keycaps. |

## ⚠ needs values · Mecha Siamese Cat MAO Profile Keycaps

- key: `mecha:cat-themed-mao-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/cat-themed-mao-profile-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Siamese Cat MAO Profile Keycaps | 0.95 | structured | Mecha Siamese Cat MAO Profile Keycaps |
| brand* | Mecha | 0.85 | structured | Mecha Siamese Cat MAO Profile Keycaps |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | moa | 0.85 | ai | Title: Mecha Siamese Cat MAO Profile Keycaps |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by moa profile (MX stem): Title: Mecha Siamese Cat MAO Profile Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Add a playful touch to your keyboard with these adorable cat-themed MAO profile keycaps. | 0.50 | regex | Add a playful touch to your keyboard with these adorable cat-themed MAO profile keycaps. |

## ⚠ needs values · Mecha Black on White Hiragana MDA Profile Keycaps

- key: `mecha:black-on-white-hiragana-mda-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/black-on-white-hiragana-mda-profile-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one
- note: keycap profile "MDA" is not in the catalogue schema

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Black on White Hiragana MDA Profile Keycaps | 0.95 | structured | Mecha Black on White Hiragana MDA Profile Keycaps |
| brand* | Mecha | 0.85 | structured | Mecha Black on White Hiragana MDA Profile Keycaps |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | moa | 0.85 | ai | Crafted in a uniform MDA profile |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by moa profile (MX stem): Crafted in a uniform MDA profile |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | These Black on White Hiragana keycaps feature a timeless black font set against a clean white base, enhanced with subtle hiragana sublegends for style. | 0.50 | regex | These Black on White Hiragana keycaps feature a timeless black font set against a clean white base, enhanced with subtle hiragana sublegends for style. |

## ✅ ready · THIS IS PLASTIC XDA Profile Keycap Set

- key: `mecha:this-is-plastic-xda-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/this-is-plastic-xda-profile-keycap-set)
- becomes: `keycap_mecha_this_is_plastic_xda_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_this_is_plastic_xda_profile_keycap_set` + `case_weikav_star80_tkl_aluminum` + `pcb_weikav_star80_tkl_hotswap` + `plate_weikav_star80_tkl_fr4` + `switch_gateron_milky_yellow_pro` + `stab_weikav_star80_pcb_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | THIS IS PLASTIC XDA Profile Keycap Set | 0.95 | structured | THIS IS PLASTIC XDA Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | xda | 0.80 | regex | Title: THIS IS PLASTIC XDA Profile Keycap Set Type: Keycaps |
| ⚠ layouts* | tkl | 0.65 | regex | function seamlessly. Fits up to TKL. Numpad not included Material: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by xda profile (MX stem): Title: THIS IS PLASTIC XDA Profile Keycap Set Type: Keycaps |
| price | 129 | 0.95 | structured | Default Title / Default Title: RM129.00 |
| ⚠ description | The THIS IS PLASTIC XDA Profile Keycap Set offers a sleek, modern industrialist aesthetic designed for enthusiasts seeking both style and functionality. | 0.50 | regex | The THIS IS PLASTIC XDA Profile Keycap Set offers a sleek, modern industrialist aesthetic designed for enthusiasts seeking both style and functionality. |

## ⚠ needs values · Mecha Chiikawa Themed MAO Profile Keycap Set

- key: `mecha:chiikawa-themed-mao-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/chiikawa-themed-mao-profile-keycap-set)
- **missing required:** layouts

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Chiikawa Themed MAO Profile Keycap Set | 0.95 | structured | Mecha Chiikawa Themed MAO Profile Keycap Set |
| brand* | Mecha | 0.85 | structured | Mecha Chiikawa Themed MAO Profile Keycap Set |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | moa | 0.85 | ai | Mecha Chiikawa Themed MAO Profile Keycap Set |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by moa profile (MX stem): Mecha Chiikawa Themed MAO Profile Keycap Set |
| price | 169 | 0.95 | structured | Default Title / Default Title: RM169.00 |
| ⚠ description | OO OOWAWA OOWAA Add a touch of adorable charm to your keyboard with the Chiikawa Themed MAO Profile Keycap Set. | 0.50 | regex | OO OOWAWA OOWAA Add a touch of adorable charm to your keyboard with the Chiikawa Themed MAO Profile Keycap Set. |

## ✅ ready · Mecha Weathering Black on White Cherry Profile Dye-Sub PBT Keycap Set

- key: `mecha:weathering-black-on-white-cherry-profile-dye-sub-pbt-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/weathering-black-on-white-cherry-profile-dye-sub-pbt-keycap-set)
- becomes: `keycap_mecha_weathering_black_on_white_cherry_profile_dye_sub_pbt_keycap`
- fits a valid build, e.g. `keycap_mecha_weathering_black_on_white_cherry_profile_dye_sub_pbt_keycap` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Weathering Black on White Cherry Profile Dye-Sub PBT Keycap Set | 0.95 | structured | Mecha Weathering Black on White Cherry Profile Dye-Sub PBT Keycap Set |
| brand* | Mecha | 0.85 | structured | Mecha Weathering Black on White Cherry Profile Dye-Sub PBT Keycap Set |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Mecha Weathering Black on White Cherry Profile Dye-Sub PBT Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Mecha Weathering Black on White Cherry Profile Dye-Sub PBT Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · Mecha Matcha XDA Profile Keycap Set

- key: `mecha:matcha-xda-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/matcha-xda-keycaps)
- becomes: `keycap_mecha_matcha_xda_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_matcha_xda_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Matcha XDA Profile Keycap Set | 0.95 | structured | Mecha Matcha XDA Profile Keycap Set |
| brand* | Mecha | 0.85 | structured | Mecha Matcha XDA Profile Keycap Set |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | xda | 0.80 | regex | Title: Mecha Matcha XDA Profile Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by xda profile (MX stem): Title: Mecha Matcha XDA Profile Keycap Set Type: Keycaps |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in XDA profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in XDA profile. |

## ✅ ready · Mecha Retro Beige Cherry Profile PBT Keycaps

- key: `mecha:9009-cherry-profile-pbt-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/9009-cherry-profile-pbt-keycaps)
- becomes: `keycap_mecha_retro_beige_cherry_profile_pbt_keycaps`
- fits a valid build, e.g. `keycap_mecha_retro_beige_cherry_profile_pbt_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Retro Beige Cherry Profile PBT Keycaps | 0.95 | structured | Mecha Retro Beige Cherry Profile PBT Keycaps |
| brand* | Mecha | 0.85 | structured | Mecha Retro Beige Cherry Profile PBT Keycaps |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Mecha Retro Beige Cherry Profile PBT Keycaps Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice (7U Tsangan not supported) |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 145 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ⚠ needs values · AKKO Bun Wonderland MOG Profile Keycap Set

- key: `mecha:akko-bun-wonderland-mog-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/akko-bun-wonderland-mog-profile-keycap-set)
- **missing required:** keycapProfile, layouts, switchTechnologySupport

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | AKKO Bun Wonderland MOG Profile Keycap Set | 0.95 | structured | AKKO Bun Wonderland MOG Profile Keycap Set |
| brand* | AKKO | 0.90 | structured | vendor: AKKO |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| ⚠ keycapProfile* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Featuring the distinctive MOG profile, these keycaps provide a comfortable, mushroom-shaped sculpted feel that enhances typing precision. | 0.50 | regex | Featuring the distinctive MOG profile, these keycaps provide a comfortable, mushroom-shaped sculpted feel that enhances typing precision. |

## ⚠ needs values · Mecha Capybara MAO Profile Keycap Set

- key: `mecha:capybara-mao-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/capybara-mao-profile-keycap-set)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Mecha Capybara MAO Profile Keycap Set | 0.95 | structured | Mecha Capybara MAO Profile Keycap Set |
| brand* | Mecha | 0.85 | structured | Mecha Capybara MAO Profile Keycap Set |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | moa | 0.85 | ai | Crafted in the MAO profile |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | experience and are compatible with most MX mechanical keyboard layouts. Made |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | Doll-up your mechanical keyboard with the Capybara MAO Profile Keycap Set, featuring a cute capybara-themed design. | 0.50 | regex | Doll-up your mechanical keyboard with the Capybara MAO Profile Keycap Set, featuring a cute capybara-themed design. |

## ✅ ready · Black on White (BOW) PBT Doubleshot Cherry Profile Keycaps

- key: `mecha:black-on-white-bow-pbt-doubleshot-cherry-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/black-on-white-bow-pbt-doubleshot-cherry-profile-keycaps)
- becomes: `keycap_mecha_black_on_white_bow_pbt_doubleshot_cherry_profile_keycaps`
- fits a valid build, e.g. `keycap_mecha_black_on_white_bow_pbt_doubleshot_cherry_profile_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Black on White (BOW) PBT Doubleshot Cherry Profile Keycaps | 0.95 | structured | Black on White (BOW) PBT Doubleshot Cherry Profile Keycaps |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | on White (BOW) PBT Doubleshot Cherry Profile Keycaps Type: Keycaps Tags: Keycap |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): on White (BOW) PBT Doubleshot Cherry Profile Keycaps Type: Keycaps Tags: Keycap |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | Classic Black font on White base keycaps, made with doubleshot processed PBT in Cherry Profile. | 0.50 | regex | Classic Black font on White base keycaps, made with doubleshot processed PBT in Cherry Profile. |

## ✅ ready · Transparent Shine Through OEM Profile PC Keycaps

- key: `mecha:shine-through-oem-profile-pc-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/shine-through-oem-profile-pc-keycaps)
- becomes: `keycap_mecha_transparent_shine_through_oem_profile_pc_keycaps`
- fits a valid build, e.g. `keycap_mecha_transparent_shine_through_oem_profile_pc_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Transparent Shine Through OEM Profile PC Keycaps | 0.95 | structured | Transparent Shine Through OEM Profile PC Keycaps |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | oem | 0.80 | regex | Title: Transparent Shine Through OEM Profile PC Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not include: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by oem profile (MX stem): Title: Transparent Shine Through OEM Profile PC Keycaps Type: Keycaps |
| price | 79 | 0.85 | structured | Clear / Clear: RM79.00 |
| ⚠ description | SPECS - Profile: OEM - Light transmission: Transparent Shine-Through - РВТ Process: UV Print - Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not include: 7 | 0.50 | regex | SPECS - Profile: OEM - Light transmission: Transparent Shine-Through - РВТ Process: UV Print - Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not include: 7 |

## ✅ ready · FBB Closure PBT Cherry Profile Keycap Set

- key: `mecha:fbb-closure-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-closure-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_closure_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_closure_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Closure PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Closure PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Closure PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | (35 Novelties) - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB After The Rain R2 PBT Cherry Profile Keycap Set

- key: `mecha:fbb-after-the-rain-r2-pbt-cherry-profile-keycap-set-copy` · category: **keycap** · [source](https://mecha.com.my/products/fbb-after-the-rain-r2-pbt-cherry-profile-keycap-set-copy)
- becomes: `keycap_fbb_after_the_rain_r2_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_after_the_rain_r2_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB After The Rain R2 PBT Cherry Profile Keycap Set | 0.95 | structured | FBB After The Rain R2 PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB After The Rain R2 PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 146 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Long Jing PBT Cherry Profile Keycap Set

- key: `mecha:fbb-longjing-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-longjing-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_long_jing_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_long_jing_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Long Jing PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Long Jing PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Long Jing PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | (35 Novelties) - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 109 | 0.95 | structured | Default Title / Default Title: RM109.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Magic Mimi PBT Cherry Profile Keycap Set

- key: `mecha:fbb-magic-mimi-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-magic-mimi-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_magic_mimi_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_magic_mimi_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Magic Mimi PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Magic Mimi PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Magic Mimi PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | keys: 158 Keys - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Holiday PBT Cherry Profile Keycap Set

- key: `mecha:fbb-holiday-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-holiday-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_holiday_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_holiday_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Holiday PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Holiday PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Holiday PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 147 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Swordsman PBT Cherry Profile Keycap Set

- key: `mecha:fbb-swordsman-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-swordsman-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_swordsman_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_swordsman_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Swordsman PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Swordsman PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Swordsman PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | (35 Novelties) - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · LeleLabs Crystal Clear ABS Keycaps

- key: `mecha:lelelabs-crystal-clear-abs-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/lelelabs-crystal-clear-abs-keycaps)
- becomes: `keycap_lelelab_lelelabs_crystal_clear_abs_keycaps`
- fits a valid build, e.g. `keycap_lelelab_lelelabs_crystal_clear_abs_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | LeleLabs Crystal Clear ABS Keycaps | 0.95 | structured | LeleLabs Crystal Clear ABS Keycaps |
| brand* | LeleLab | 0.90 | structured | vendor: LeleLab |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | UV printed versions! Clear ABS Cherry Profile Sorting tray + custom outer box |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Tsangan Layout |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): UV printed versions! Clear ABS Cherry Profile Sorting tray + custom outer box |
| price | 149 | 0.85 | structured | Clear Purple / Clear Purple: RM149.00 |
| ⚠ description | Brought to you once again by LeleLab, the Crystal Color Clear ABS keycaps are back with more vivid colors and both blank and UV printed versions! | 0.50 | regex | Brought to you once again by LeleLab, the Crystal Color Clear ABS keycaps are back with more vivid colors and both blank and UV printed versions! |

## ⚠ needs values · Milkyway Alhambra Double-Shot PBT Cherry Profile Keycap Set

- key: `mecha:milkyway-alhambra-double-shot-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/milkyway-alhambra-double-shot-pbt-cherry-profile-keycap-set)
- **missing required:** layouts
- note: variants range RM49–RM299; using the cheapest (Deskmat / Deskmat)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Milkyway Alhambra Double-Shot PBT Cherry Profile Keycap Set | 0.95 | structured | Milkyway Alhambra Double-Shot PBT Cherry Profile Keycap Set |
| brand* | MilkyWay | 0.90 | structured | vendor: MilkyWay |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Milkyway Alhambra Double-Shot PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Milkyway Alhambra Double-Shot PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 49 | 0.85 | structured | Deskmat / Deskmat: RM49.00 |
| ⚠ description | Milkyway Alhambra Designed by Keepo, Alhambra is back for R2 but now in PBT! | 0.50 | regex | Milkyway Alhambra Designed by Keepo, Alhambra is back for R2 but now in PBT! |

## ⛔ blocked · Akko Penguin Silent Tactile Switch

- key: `mecha:akko-penguin-silent-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/akko-penguin-silent-tactile-switch)
- becomes: `switch_akko_penguin_silent_tactile_switch`
- ⛔ duplicate: same brand and name as existing "switch_akko_penguin_silent"
- fits a valid build, e.g. `switch_akko_penguin_silent_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Akko Penguin Silent Tactile Switch | 0.95 | structured | Akko Penguin Silent Tactile Switch |
| brand* | AKKO | 0.90 | structured | vendor: AKKO |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Akko Penguin Silent Tactile Switch Type: Switch Tags: sound_Silent, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | silent | 0.90 | structured | Tags: sound_Silent |
| ⚠ description | Type: Tactile Total Travel: 3.3mm Pre-Travel: 2.0 ± 0.5mm Bottom Out Weight: 65g Spring length: 19.5mm | 0.50 | regex | Type: Tactile Total Travel: 3.3mm Pre-Travel: 2.0 ± 0.5mm Bottom Out Weight: 65g Spring length: 19.5mm |

## ✅ ready · Black Shine Through Cherry Profile PBT Keycaps [Side Printed]

- key: `mecha:gradient-shine-through-cherry-profile-pbt-keycaps-side-printed` · category: **keycap** · [source](https://mecha.com.my/products/gradient-shine-through-cherry-profile-pbt-keycaps-side-printed)
- becomes: `keycap_mecha_black_shine_through_cherry_profile_pbt_keycaps_side_printed`
- fits a valid build, e.g. `keycap_mecha_black_shine_through_cherry_profile_pbt_keycaps_side_printed` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Black Shine Through Cherry Profile PBT Keycaps [Side Printed] | 0.95 | structured | Black Shine Through Cherry Profile PBT Keycaps [Side Printed] |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: Black Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Not included: |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: Black Shine Through Cherry Profile PBT Keycaps [Side Printed] Type: |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  | 0.50 | regex | SPECS - Profile: Cherry - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sublimation - Compatibility: ANSI  |

## ⚠ check flags · Keychron V6 Max QMK/VIA Wireless Custom Mechanical Keyboard

- key: `mecha:keychron-v6-max-qmk-via-wireless-custom-mechanical-keyboard` · category: **kit** · [source](https://mecha.com.my/products/keychron-v6-max-qmk-via-wireless-custom-mechanical-keyboard)
- becomes: `case_keychron_v6_max_qmk_via_wireless_custom`, `pcb_keychron_v6_max_qmk_via_wireless_custom`, `plate_keychron_v6_max_qmk_via_wireless_custom`
- ⚠ buildable: the rule engine found no valid build with this part and the current catalogue
- note: every variant is sold out; price is the listed one
- note: variants range RM359–RM459; using the cheapest (Carbon Black / Barebones / Carbon Black / Barebones)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron V6 Max QMK/VIA Wireless Custom Mechanical Keyboard | 0.95 | structured | Keychron V6 Max QMK/VIA Wireless Custom Mechanical Keyboard |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.85 | ai | Hot-swappable sockets are mounted on the PCB, so you can install or change the switches without soldering |
| layouts* | full | 0.70 | regex | Bluetooth 5.1 connection. It has a full-size 100% layout and offers a gasket |
| mountSupport* | gasket_mount | 0.85 | regex | full-size 100% layout and offers a gasket mount design, sound-absorbing foam, |
| switchTechnologySupport* | mechanical | 0.80 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerTypeSupport* | screw_in, pcb_mount | 0.70 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| connection* | both | 0.75 | regex | Title: Keychron V6 Max QMK/VIA Wireless Custom Mechanical Keyboard Type: |
| hotswap* | true | 0.90 | regex | Learn more about how to use VIA > Hot-swappable The hot-swappable sockets are |
| stabilizerType | screw_in | 0.80 | regex | Panda switches on the market. Screw-In PCB Stabilizers Even small part |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | polycarbonate | 0.80 | regex | Version) Body Material: ABS Plastic Plate Material: PC Polling Rate: 1000 Hz (2.4 GHz |
| price | 359 | 0.85 | structured | Carbon Black / Barebones / Carbon Black / Barebones: RM359.00 |
| soundProfile | silent | 0.85 | ai | delivering a softer and quieter typing experience |
| ⚠ description | Keychron V6 Max The V6 Max is a QMK custom mechanical keyboard with 2.4 GHz wireless and Bluetooth 5.1 connection. | 0.50 | regex | Keychron V6 Max The V6 Max is a QMK custom mechanical keyboard with 2.4 GHz wireless and Bluetooth 5.1 connection. |

## ✅ ready · JKDK Regenerate R2 PBT Cherry Profile Dye-Sub Keycaps

- key: `mecha:jkdk-regenerate-r2-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-regenerate-r2-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_regenerate_r2_pbt_cherry_profile_dye_sub_keycaps`
- fits a valid build, e.g. `keycap_jkdk_regenerate_r2_pbt_cherry_profile_dye_sub_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Regenerate R2 PBT Cherry Profile Dye-Sub Keycaps | 0.95 | structured | JKDK Regenerate R2 PBT Cherry Profile Dye-Sub Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Regenerate R2 PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Regenerate R2 PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| price | 349 | 0.95 | structured | Default Title / Default Title: RM349.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK x KM Cat PBT Cherry Profile Dye-Sub Keycaps

- key: `mecha:jkdk-x-km-cat-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-x-km-cat-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_x_km_cat_pbt_cherry_profile_dye_sub_keycaps`
- fits a valid build, e.g. `keycap_jkdk_x_km_cat_pbt_cherry_profile_dye_sub_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK x KM Cat PBT Cherry Profile Dye-Sub Keycaps | 0.95 | structured | JKDK x KM Cat PBT Cherry Profile Dye-Sub Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK x KM Cat PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK x KM Cat PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| price | 259 | 0.95 | structured | Default Title / Default Title: RM259.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Retro PBT Cherry Profile Dye-Sub Keycaps

- key: `mecha:jkdk-retro-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-retro-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_retro_pbt_cherry_profile_dye_sub_keycaps`
- fits a valid build, e.g. `keycap_jkdk_retro_pbt_cherry_profile_dye_sub_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Retro PBT Cherry Profile Dye-Sub Keycaps | 0.95 | structured | JKDK Retro PBT Cherry Profile Dye-Sub Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Retro PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Retro PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| price | 229 | 0.95 | structured | Default Title / Default Title: RM229.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Crayon PBT Cherry Profile Dye-Sub Keycaps

- key: `mecha:jkdk-drift-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-drift-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_crayon_pbt_cherry_profile_dye_sub_keycaps`
- fits a valid build, e.g. `keycap_jkdk_crayon_pbt_cherry_profile_dye_sub_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Crayon PBT Cherry Profile Dye-Sub Keycaps | 0.95 | structured | JKDK Crayon PBT Cherry Profile Dye-Sub Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Crayon PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Crayon PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Joker PBT Cherry Profile Dye-Sub Keycaps

- key: `mecha:jkdk-joker-pbt-cherry-profile-dye-sub-keycap` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-joker-pbt-cherry-profile-dye-sub-keycap)
- becomes: `keycap_jkdk_joker_pbt_cherry_profile_dye_sub_keycaps`
- fits a valid build, e.g. `keycap_jkdk_joker_pbt_cherry_profile_dye_sub_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Joker PBT Cherry Profile Dye-Sub Keycaps | 0.95 | structured | JKDK Joker PBT Cherry Profile Dye-Sub Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Joker PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Joker PBT Cherry Profile Dye-Sub Keycaps Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ⚠ needs values · [In-Stock] GMK Blot Double-Shot ABS Keycaps

- key: `mecha:gmk-blot` · category: **keycap** · [source](https://mecha.com.my/products/gmk-blot)
- **missing required:** layouts
- note: only cheap variants are in stock (RM249 vs RM749 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] GMK Blot Double-Shot ABS Keycaps | 0.95 | structured | [In-Stock] GMK Blot Double-Shot ABS Keycaps |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Keycaps Type: Keycaps Tags: abs, cherry, final reductions, geonworks, |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Keycaps Type: Keycaps Tags: abs, cherry, final reductions, geonworks, |
| price | **unknown** | – | default |  |
| ⚠ description | Inspired by Viking rituals of northern Europe and designed by the Eloquent Team in Spain. | 0.50 | regex | Inspired by Viking rituals of northern Europe and designed by the Eloquent Team in Spain. |

## ⚠ needs values · [In-Stock] Keykobo Instant Double-shot ABS Cherry Profile Keycap Set

- key: `mecha:gb-keykobo-instant-double-shot-abs-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/gb-keykobo-instant-double-shot-abs-cherry-profile-keycap-set)
- **missing required:** layouts
- note: only cheap variants are in stock (RM65 vs RM285 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] Keykobo Instant Double-shot ABS Cherry Profile Keycap Set | 0.95 | structured | [In-Stock] Keykobo Instant Double-shot ABS Cherry Profile Keycap Set |
| brand* | Keykobo | 0.90 | structured | vendor: Keykobo |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Keykobo Instant Double-shot ABS Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Keykobo Instant Double-shot ABS Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | **unknown** | – | default |  |
| ⚠ description | KeyKobo Instant Designed by Zetina, Keykobo Instant is a set inspired by the love for instant photography! | 0.50 | regex | KeyKobo Instant Designed by Zetina, Keykobo Instant is a set inspired by the love for instant photography! |

## ⚠ needs values · Eden R2 (60%) Keyboard Kit

- key: `mecha:eden-r2-60-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/eden-r2-60-keyboard-kit)
- **missing required:** stabilizerTypeSupport
- note: AI said mountSupport = ["top_mount","tray_mount"] but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Eden R2 (60%) Keyboard Kit | 0.95 | structured | Eden R2 (60%) Keyboard Kit |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| beginnerFriendly* | true | 0.80 | ai | 4. Hotswap PCB x 1 |
| layouts* | 60 | 0.90 | regex | Eden R2 (60%) Keyboard Kit |
| mountSupport* | top_mount | 0.75 | regex | Feet x 2 8. M2 x 8 Screws for top mount x 8 9. Screwdriver x1 10. Torx-T6 |
| switchTechnologySupport* | mechanical | 0.80 | regex | x 1 3. Aluminium Plate x 1 4. Hotswap PCB x 1 5. 50A Tadpoles x 8 6. |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| ⚠ connection* | wired | 0.60 | regex | PCB x 1 5. 50A Tadpoles x 8 6. USB-C Daughter Board w/ Cablex 1 7. |
| hotswap* | true | 0.90 | regex | x 1 3. Aluminium Plate x 1 4. Hotswap PCB x 1 5. 50A Tadpoles x 8 6. |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | aluminum | 0.80 | regex | Eden x 1 2. Carrying Case x 1 3. Aluminium Plate x 1 4. Hotswap PCB x 1 5. 50A |
| price | 1249 | 0.85 | structured | E-Coated White w/ Blue Patina / WK / E-Coated White w/ Blue Patina / WK: RM1249.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Eden Designed by kai.kbd Inspired by the ” garden city ” of Singapore. | 0.50 | regex | Eden Designed by kai.kbd Inspired by the ” garden city ” of Singapore. |

## ✅ ready · White on Black (WOB) Doubleshot PBT Cherry Profile Keycap Set

- key: `mecha:jkdk-white-on-black-wob-pbt-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-white-on-black-wob-pbt-keycap-set)
- becomes: `keycap_mecha_white_on_black_wob_doubleshot_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_mecha_white_on_black_wob_doubleshot_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | White on Black (WOB) Doubleshot PBT Cherry Profile Keycap Set | 0.95 | structured | White on Black (WOB) Doubleshot PBT Cherry Profile Keycap Set |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha Malaysia |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | on Black (WOB) Doubleshot PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% and alice |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): on Black (WOB) Doubleshot PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | A simple and high quality set, sporting the timeless white font on black base look in Cherry profile. | 0.50 | regex | A simple and high quality set, sporting the timeless white font on black base look in Cherry profile. |

## ⚠ needs values · TYPEPLUS x YIKB Stabilizer (Screw-In) PCB Mount

- key: `mecha:typeplus-x-yikb-stabilizer-screw-in-pcb-mount` · category: **stabilizer** · [source](https://mecha.com.my/products/typeplus-x-yikb-stabilizer-screw-in-pcb-mount)
- **missing required:** layouts

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | TYPEPLUS x YIKB Stabilizer (Screw-In) PCB Mount | 0.95 | structured | TYPEPLUS x YIKB Stabilizer (Screw-In) PCB Mount |
| brand* | TypePlus | 0.90 | structured | vendor: TypePlus |
| beginnerFriendly* | false | 0.70 | rule | rule: screw_in stabilizers are not beginner-friendly |
| stabilizerType* | screw_in | 0.80 | regex | Title: TYPEPLUS x YIKB Stabilizer (Screw-In) PCB Mount Type: Stabilizers Tags: |
| ⚠ layouts* | **unknown** | – | default |  |
| stabilizerSizes* | 2u, 6.25u, 7u | 0.80 | regex | 5 right) - 4x 2U wires - 1x 6.25U wire - 1x 7U wire - Clear Polycarbonate |
| price | 69 | 0.95 | structured | Default Title / Default Title: RM69.00 |
| ⚠ description | The Typeplus x YiKB stabilizer features a patented structure that sets it apart from anything else available. | 0.50 | regex | The Typeplus x YiKB stabilizer features a patented structure that sets it apart from anything else available. |

## ⚠ needs values · THUMB KEY X DOMIKEY DEICIDE Dye-Sub Cherry Profile Keycaps

- key: `mecha:gb-thumb-key-x-domikey-deicide-dye-sub-cherry-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/gb-thumb-key-x-domikey-deicide-dye-sub-cherry-profile-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one
- note: variants range RM149–RM479; using the cheapest (Deicide Deskmat / Deicide Deskmat)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | THUMB KEY X DOMIKEY DEICIDE Dye-Sub Cherry Profile Keycaps | 0.95 | structured | THUMB KEY X DOMIKEY DEICIDE Dye-Sub Cherry Profile Keycaps |
| brand* | Domikey | 0.90 | structured | vendor: Domikey |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | KEY X DOMIKEY DEICIDE Dye-Sub Cherry Profile Keycaps Type: Keycaps Tags: artisan, |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): KEY X DOMIKEY DEICIDE Dye-Sub Cherry Profile Keycaps Type: Keycaps Tags: artisan, |
| price | 149 | 0.85 | structured | Deicide Deskmat / Deicide Deskmat: RM149.00 |
| ⚠ description | THUMB KEY X DOMIKEY DEICIDE KEYCAPS Thumb Key is a new Chinese designer. | 0.50 | regex | THUMB KEY X DOMIKEY DEICIDE KEYCAPS Thumb Key is a new Chinese designer. |

## ⚠ needs values · [In-Stock] Keykobo Machinist ABS Keycaps Doubleshot Cherry Profile

- key: `mecha:keykobo-machinist-abs-keycaps-doubleshot-cherry-profile` · category: **keycap** · [source](https://mecha.com.my/products/keykobo-machinist-abs-keycaps-doubleshot-cherry-profile)
- **missing required:** layouts
- note: only cheap variants are in stock (RM69 vs RM349 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] Keykobo Machinist ABS Keycaps Doubleshot Cherry Profile | 0.95 | structured | [In-Stock] Keykobo Machinist ABS Keycaps Doubleshot Cherry Profile |
| brand* | Keykobo | 0.90 | structured | vendor: Keykobo |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Machinist ABS Keycaps Doubleshot Cherry Profile Type: Keycaps Tags: abs, double |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Machinist ABS Keycaps Doubleshot Cherry Profile Type: Keycaps Tags: abs, double |
| price | **unknown** | – | default |  |
| ⚠ description | Keykobo Machinist Keycaps are minimalistic keycaps with varying shades of gray for modifiers and alphas. | 0.50 | regex | Keykobo Machinist Keycaps are minimalistic keycaps with varying shades of gray for modifiers and alphas. |

## ✅ ready · FBB T52 PBT Cherry Profile Keycap Set

- key: `mecha:fbb-t52-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-t52-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_t52_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_t52_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB T52 PBT Cherry Profile Keycap Set | 0.95 | structured | FBB T52 PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB T52 PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 152 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 159 | 0.95 | structured | Cold White / Cold White: RM159.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Retro Purple PBT Cherry Profile Keycap Set

- key: `mecha:fbb-retro-purple-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-retro-purple-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_retro_purple_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_retro_purple_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Retro Purple PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Retro Purple PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Retro Purple PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 162 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 219 | 0.95 | structured | Default Title / Default Title: RM219.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Ramen PBT Cherry Profile Keycap Set

- key: `mecha:fbb-ramen-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-ramen-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_ramen_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_ramen_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Ramen PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Ramen PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Ramen PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | (34 novelties) - Compatibility: Cherry MX switches and MX-style switches Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Goodnight Cherry Profile Keycaps

- key: `mecha:fbb-goodnight-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/fbb-goodnight-keycaps)
- becomes: `keycap_fbb_goodnight_cherry_profile_keycaps`
- fits a valid build, e.g. `keycap_fbb_goodnight_cherry_profile_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Goodnight Cherry Profile Keycaps | 0.95 | structured | FBB Goodnight Cherry Profile Keycaps |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Goodnight Cherry Profile Keycaps Type: Keycaps Tags: deep |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 174 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 149 | 0.95 | structured | Standard / Standard: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Zimo PBT Cherry Profile Keycap Set

- key: `mecha:fbb-zimo-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-zimo-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_zimo_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_zimo_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Zimo PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Zimo PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Zimo PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 154 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Wushuang PBT Cherry Profile Keycap Set

- key: `mecha:fbb-wushuang-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-wushuang-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_wushuang_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_wushuang_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Wushuang PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Wushuang PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Wushuang PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 151 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 299 | 0.95 | structured | Default Title / Default Title: RM299.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB Biker Girl PBT Cherry Profile Keycap Set

- key: `mecha:fbb-biker-girl-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-biker-girl-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_biker_girl_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_biker_girl_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB Biker Girl PBT Cherry Profile Keycap Set | 0.95 | structured | FBB Biker Girl PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB Biker Girl PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 144 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.95 | structured | Default Title / Default Title: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB SFC 1990 PBT Cherry Profile Keycap Set

- key: `mecha:fbb-sfc1990-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-sfc1990-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_sfc_1990_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_sfc_1990_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB SFC 1990 PBT Cherry Profile Keycap Set | 0.95 | structured | FBB SFC 1990 PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB SFC 1990 PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | (35 Novelties) - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 199 | 0.85 | structured | Latin / Latin: RM199.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · FBB SFC 1990 Dark PBT Cherry Profile Keycap Set

- key: `mecha:fbb-sfc1990-dark-pbt-cherry-profile-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/fbb-sfc1990-dark-pbt-cherry-profile-keycap-set)
- becomes: `keycap_fbb_sfc_1990_dark_pbt_cherry_profile_keycap_set`
- fits a valid build, e.g. `keycap_fbb_sfc_1990_dark_pbt_cherry_profile_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | FBB SFC 1990 Dark PBT Cherry Profile Keycap Set | 0.95 | structured | FBB SFC 1990 Dark PBT Cherry Profile Keycap Set |
| brand* | FBB | 0.90 | structured | vendor: FBB |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: FBB SFC 1990 Dark PBT Cherry Profile Keycap Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% Alice |
| switchTechnologySupport* | mechanical | 0.80 | regex | Keycap keys: 165 - Compatibility: Cherry MX switches and MX-style clones Compatibility |
| price | 219 | 0.95 | structured | Default Title / Default Title: RM219.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ⚠ needs values · [In-Stock] PBTFans Emma

- key: `mecha:pbtfans-emma` · category: **keycap** · [source](https://mecha.com.my/products/pbtfans-emma)
- **missing required:** layouts
- note: only cheap variants are in stock (RM79 vs RM200 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] PBTFans Emma | 0.95 | structured | [In-Stock] PBTFans Emma |
| brand* | PBTfans | 0.90 | structured | vendor: PBTfans |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Material: ABS material - Profile: Cherry profile - Production Method: Double shot |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | no keyboard - Compatibility: Cherry MX switches and MX-style clones - Designer: |
| price | **unknown** | – | default |  |
| ⚠ description | The design of PBTfans Emma revolves around an imaginary luxury emerald boutique named Emma, where the most unique and spectacular pieces are crafted. | 0.50 | regex | The design of PBTfans Emma revolves around an imaginary luxury emerald boutique named Emma, where the most unique and spectacular pieces are crafted. |

## ⚠ check flags · [In-Stock] GMK Abyssal Keycaps

- key: `mecha:gb-gmk-abyssal-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/gb-gmk-abyssal-keycaps)
- becomes: `keycap_gmk_in_stock_gmk_abyssal_keycaps`
- ⚠ sanity: no price
- fits a valid build, e.g. `keycap_gmk_in_stock_gmk_abyssal_keycaps` + `case_gmk104_full_abs` + `pcb_gmk104_full_hotswap` + `plate_gmk104_full_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk104_plate_mount`
- note: only cheap variants are in stock (RM229 vs RM699 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] GMK Abyssal Keycaps | 0.95 | structured | [In-Stock] GMK Abyssal Keycaps |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | - Material: Double-shot ABS - Cherry Profile 1-1-2-3-4-4 - Designed by Xanira |
| ⚠ layouts* | full | 0.65 | regex | led to rumors that she is not 100% human as is also explained in |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): - Material: Double-shot ABS - Cherry Profile 1-1-2-3-4-4 - Designed by Xanira |
| price | **unknown** | – | default |  |
| ⚠ description | GMK Abyssal GMK Abyssal is a keycap set designed and revolving around Arknights Character; Skadi. | 0.50 | regex | GMK Abyssal GMK Abyssal is a keycap set designed and revolving around Arknights Character; Skadi. |

## ⚠ needs values · Shenpo Matcha Sakura Dye-Sub PBT Cherry Profile Keycaps

- key: `mecha:shenpo-matcha-sakura-dye-sub-pbt-cherry-profile-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/shenpo-matcha-sakura-dye-sub-pbt-cherry-profile-keycaps)
- **missing required:** layouts
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Shenpo Matcha Sakura Dye-Sub PBT Cherry Profile Keycaps | 0.95 | structured | Shenpo Matcha Sakura Dye-Sub PBT Cherry Profile Keycaps |
| brand* | Shenpo | 0.90 | structured | vendor: Shenpo |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Shenpo Matcha Sakura Dye-Sub PBT Cherry Profile Keycaps Type: Keycaps Tags: cherry, |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Shenpo Matcha Sakura Dye-Sub PBT Cherry Profile Keycaps Type: Keycaps Tags: cherry, |
| price | 63 | 0.95 | structured | Default Title / Default Title: RM63.00 |
| ⚠ description | Thick, high-quality PBT beige sets. | 0.50 | regex | Thick, high-quality PBT beige sets. |

## ✅ ready · Photographer Dye Sublimation PBT Cherry Keycaps Set

- key: `mecha:photographer-dye-sublimation-pbt-cherry-keycaps-set` · category: **keycap** · [source](https://mecha.com.my/products/photographer-dye-sublimation-pbt-cherry-keycaps-set)
- becomes: `keycap_lazy_cat_photographer_dye_sublimation_pbt_cherry_keycaps_set`
- fits a valid build, e.g. `keycap_lazy_cat_photographer_dye_sublimation_pbt_cherry_keycaps_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: layouts inferred from a large key count; check the set covers each layout

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Photographer Dye Sublimation PBT Cherry Keycaps Set | 0.95 | structured | Photographer Dye Sublimation PBT Cherry Keycaps Set |
| brand* | Lazy Cat | 0.90 | structured | vendor: Lazy Cat |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Photographer Dye Sublimation PBT Cherry Keycaps Set Type: Keycaps Tags: |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.55 | regex | Thickness: 1.7mm - Quantity: 166 keys |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Photographer Dye Sublimation PBT Cherry Keycaps Set Type: Keycaps Tags: |
| price | 179 | 0.95 | structured | Default Title / Default Title: RM179.00 |
| ⚠ description | Capture your keyboard's personality with the Photographer keycap set, developed by Lazy Cat Studio. | 0.50 | regex | Capture your keyboard's personality with the Photographer keycap set, developed by Lazy Cat Studio. |

## ✅ ready · [In-Stock] GMK Black Snail

- key: `mecha:gmk-black-snail` · category: **keycap** · [source](https://mecha.com.my/products/gmk-black-snail)
- becomes: `keycap_gmk_in_stock_gmk_black_snail`
- fits a valid build, e.g. `keycap_gmk_in_stock_gmk_black_snail` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] GMK Black Snail | 0.95 | structured | [In-Stock] GMK Black Snail |
| brand* | GMK | 0.90 | structured | vendor: GMK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | abs, beige, black, Black Snail, cherry, deep discount, geonworks, GMK, |
| ⚠ layouts* | 65 | 0.65 | regex | Shine-Through keys) - Alpha - 68 keys (bi-color Alpha+Numrow, Tap+L-Shift |
| switchTechnologySupport* | mechanical | 0.80 | regex | (1-1-2-3-4-4) - Compatible with MX-style switches - 1.5mm thick double-shot |
| price | 219 | 0.95 | structured | L9 Modifiers / L9 Modifiers: RM219.00 |
| ⚠ description | Designed by Geonworks from South Korea, GMK Black Snail is a set that is designed to fit in all sorts of color schemes, much like a simple White and black set. | 0.50 | regex | Designed by Geonworks from South Korea, GMK Black Snail is a set that is designed to fit in all sorts of color schemes, much like a simple White and black set. |

## ✅ ready · JKDK Shine Through OEM Profile PBT Keycaps

- key: `mecha:jkdk-side-printed-oem-profile-pbt-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-side-printed-oem-profile-pbt-keycaps)
- becomes: `keycap_jkdk_shine_through_oem_profile_pbt_keycaps`
- fits a valid build, e.g. `keycap_jkdk_shine_through_oem_profile_pbt_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: variants range RM159–RM199; using the cheapest (Black [Side Printed] / Black [Side Printed])

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Shine Through OEM Profile PBT Keycaps | 0.95 | structured | JKDK Shine Through OEM Profile PBT Keycaps |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | oem | 0.80 | regex | Title: JKDK Shine Through OEM Profile PBT Keycaps Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | Compatibility: ANSI 100%, 80%, 60% 96%, 75%, 65% - Top Printed Version |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by oem profile (MX stem): Title: JKDK Shine Through OEM Profile PBT Keycaps Type: Keycaps |
| price | 159 | 0.85 | structured | Black [Side Printed] / Black [Side Printed]: RM159.00 |
| ⚠ description | SPECS - Number of Keys: 134 keys - Profile: OEM height - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sub | 0.50 | regex | SPECS - Number of Keys: 134 keys - Profile: OEM height - Light transmission: Shine Through Keycaps (suitable for South-Facing PCB) - РВТ Process: five-sided sub |

## ✅ ready · JKDK Red on White PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-red-on-white-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-red-on-white-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_red_on_white_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_red_on_white_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Red on White PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Red on White PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Red on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Red on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Green on White PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-green-on-white-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-green-on-white-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_green_on_white_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_green_on_white_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Green on White PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Green on White PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Green on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Green on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · Bsun Hillstone Tactile Switch

- key: `mecha:bsun-hillstone-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/bsun-hillstone-tactile-switch)
- becomes: `switch_bsun_hillstone_tactile_switch`
- fits a valid build, e.g. `switch_bsun_hillstone_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Bsun Hillstone Tactile Switch | 0.95 | structured | Bsun Hillstone Tactile Switch |
| brand* | Bsun | 0.90 | structured | vendor: Bsun |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.6 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Bsun Hillstone Tactile Switch Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | - Mixed Nylon top housing - 5pin PCB mounted switch - 3.2mm travel |
| actuationForceG | **unknown** | – | default |  |
| price | 1.6 | 0.80 | structured | Default Title / Default Title: RM1.60 |
| soundProfile | creamy | 0.90 | structured | Tags: sound_Creamy |
| ⚠ description | SPEC - Heavy tactile switch - 56g spring about 16mm long - POM long pole stem - Mixed Nylon top housing - 5pin PCB mounted switch - 3.2mm travel distance - Fact | 0.50 | regex | SPEC - Heavy tactile switch - 56g spring about 16mm long - POM long pole stem - Mixed Nylon top housing - 5pin PCB mounted switch - 3.2mm travel distance - Fact |

## ✅ ready · Prevail Nebula V2 Linear Switches

- key: `mecha:prevail-nebula-v2-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/prevail-nebula-v2-linear-switches)
- becomes: `switch_jwk_prevail_nebula_v2_linear_switches`
- fits a valid build, e.g. `switch_jwk_prevail_nebula_v2_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Prevail Nebula V2 Linear Switches | 0.95 | structured | Prevail Nebula V2 Linear Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.7 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Prevail Nebula V2 Linear Switches Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | Linear - Mounting Type: PCB Mount (5-pin) - Top Housing: Nylon - Bottom: |
| actuationForceG | **unknown** | – | default |  |
| price | 1.7 | 0.80 | structured | Default Title / Default Title: RM1.70 |
| soundProfile | thocky | 0.90 | structured | Tags: sound_Deep |
| ⚠ description | Making a dazzling comeback, The Nebula V2 Switch by Control on Caps makes a return to the enthusiast keyboard community. | 0.50 | regex | Making a dazzling comeback, The Nebula V2 Switch by Control on Caps makes a return to the enthusiast keyboard community. |

## ⚠ needs values · [In-Stock] Keykobo Violet Alert ABS Keycaps Doubleshot Cherry Profile

- key: `mecha:keykobo-violet-alert-abs-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/keykobo-violet-alert-abs-keycaps)
- **missing required:** layouts
- note: only cheap variants are in stock (RM99 vs RM499 listed): they look like add-ons, so the price is left for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | [In-Stock] Keykobo Violet Alert ABS Keycaps Doubleshot Cherry Profile | 0.95 | structured | [In-Stock] Keykobo Violet Alert ABS Keycaps Doubleshot Cherry Profile |
| brand* | Keykobo | 0.90 | structured | vendor: Keykobo |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Violet Alert ABS Keycaps Doubleshot Cherry Profile Type: Keycaps Tags: abs, double |
| ⚠ layouts* | **unknown** | – | default |  |
| switchTechnologySupport* | mechanical | 0.80 | regex | plastic - Double-shot legends - MX switch compatible (includes Cherry MX, |
| price | **unknown** | – | default |  |
| ⚠ description | Keykobo Violet Alert keycaps feature a minimal colorway with a classy red number row & accents, with beige modifiers and cream alphas finished with burgundy leg | 0.50 | regex | Keykobo Violet Alert keycaps feature a minimal colorway with a classy red number row & accents, with beige modifiers and cream alphas finished with burgundy leg |

## ✅ ready · SWK Catmint Linear Switches

- key: `mecha:swk-catmint-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/swk-catmint-linear-switches)
- becomes: `switch_swagkeys_swk_catmint_linear_switches`
- fits a valid build, e.g. `switch_swagkeys_swk_catmint_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | SWK Catmint Linear Switches | 0.95 | structured | SWK Catmint Linear Switches |
| brand* | Swagkeys | 0.90 | structured | vendor: Swagkeys |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: SWK Catmint Linear Switches Type: Switch Tags: sound_Creamy, |
| pinCount | 5 | 0.90 | regex | - Mounting Type : PCB Mount (5-pin) - Materials - Top : Nylon |
| actuationForceG | **unknown** | – | default |  |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | creamy | 0.90 | structured | Tags: sound_Creamy |
| ⚠ description | - Specifications - Type : Linear - Mounting Type : PCB Mount (5-pin) - Materials - Top : Nylon - Bottom : Nylon - Stem : Pok - Spring - Length : 20mm - Bottom O | 0.50 | regex | - Specifications - Type : Linear - Mounting Type : PCB Mount (5-pin) - Materials - Top : Nylon - Bottom : Nylon - Stem : Pok - Spring - Length : 20mm - Bottom O |

## ✅ ready · Gateron Jupiter Banana Tactile Switches

- key: `mecha:gateron-jupiter-switch` · category: **switch** · [source](https://mecha.com.my/products/gateron-jupiter-switch)
- becomes: `switch_gateron_jupiter_banana_tactile_switches`
- fits a valid build, e.g. `switch_gateron_jupiter_banana_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch
- note: AI said switchTechnology = "mechanical" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Jupiter Banana Tactile Switches | 0.95 | structured | Gateron Jupiter Banana Tactile Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.70 | regex | Title: Gateron Jupiter Banana Tactile Switches Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | better backlight effect. Stable 5 Pins The "Double-Core" robust 5 pins |
| actuationForceG | 45 | 0.85 | regex | Red Switch \| Type \| Linear \| Operation Force \| 45±15 gf \| Pre-Travel \| 2.0±0.6 mm \| |
| price | 1 | 0.80 | structured | Banana / Banana: RM1.00 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | We’re extending the gaming experience, Keychron has teamed up with Gateron to introduce our exclusive Jupiter Switch to the market. | 0.50 | regex | We’re extending the gaming experience, Keychron has teamed up with Gateron to introduce our exclusive Jupiter Switch to the market. |

## ⚠ needs values · Eden R1 (60%) Keyboard Kit

- key: `mecha:eden-60-keyboard-kit` · category: **kit** · [source](https://mecha.com.my/products/eden-60-keyboard-kit)
- **missing required:** beginnerFriendly, mountSupport, switchTechnologySupport, stabilizerTypeSupport
- note: only cheap variants are in stock (RM799 vs RM1999 listed): they look like add-ons, so the price is left for you
- note: AI (["tray_mount","o_ring_mount","top_mount"]) and plain code (["top_mount"]) disagree on mountSupport; left unknown for you

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Eden R1 (60%) Keyboard Kit | 0.95 | structured | Eden R1 (60%) Keyboard Kit |
| ⚠ brand* | Mecha | 0.60 | structured | vendor: Mecha |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| layouts* | 60 | 0.90 | regex | Eden R1 (60%) Keyboard Kit |
| ⚠ mountSupport* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| ⚠ stabilizerTypeSupport* | **unknown** | – | default |  |
| ⚠ connection* | wired | 0.60 | regex | O-Ring x 1 6. EZMate Cable x 1 7. USB-C Daughter Board x 1 8. Geon Rubber |
| ⚠ hotswap* | false | 0.60 | regex | x 1 2. Mecha Carrying Case 3. Soldered PCB x 1 4. 50A Tadpoles x 8 5. Gummy |
| stabilizerType | **unknown** | – | default |  |
| stabilizerSizes | **unknown** | – | default |  |
| plateMaterial | **unknown** | – | default |  |
| price | **unknown** | – | default |  |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Eden The Eden is the first project by our design studio, Kai. | 0.50 | regex | Eden The Eden is the first project by our design studio, Kai. |

## ✅ ready · Gateron G Pro 3.0 Switches

- key: `mecha:gateron-g-pro-3-0-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-g-pro-3-0-switches)
- becomes: `switch_gateron_g_pro_3_0_switches`
- fits a valid build, e.g. `switch_gateron_g_pro_3_0_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron G Pro 3.0 Switches | 0.95 | structured | Gateron G Pro 3.0 Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | ai | Stem \| POM, MX stem |
| pinCount | 3 | 0.90 | regex | Spring \| Spring steel \| Pins \| 3-Pins \| Lubrication \| Yes \| SMD LED |
| actuationForceG | **unknown** | – | default |  |
| price | 1 | 0.80 | structured | Yellow / Yellow: RM1.00 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Gateron G Pro Version 3 New Upgrades and Feel The new G Pro 3.0 retains its predecessor, the G Pro 2.0’s factory pre-lubed feature, and features a transparent u | 0.50 | regex | Gateron G Pro Version 3 New Upgrades and Feel The new G Pro 3.0 retains its predecessor, the G Pro 2.0’s factory pre-lubed feature, and features a transparent u |

## ✅ ready · Gateron KS-3 Milky Yellow Pro Linear Switch

- key: `mecha:gateron-ks-3-milky-yellow-pro-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/gateron-ks-3-milky-yellow-pro-linear-switch)
- becomes: `switch_gateron_ks_3_milky_yellow_pro_linear_switch`
- fits a valid build, e.g. `switch_gateron_ks_3_milky_yellow_pro_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron KS-3 Milky Yellow Pro Linear Switch | 0.95 | structured | Gateron KS-3 Milky Yellow Pro Linear Switch |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.8 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Gateron KS-3 Milky Yellow Pro Linear Switch Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | Spring \| Spring steel \| Pins \| 5-Pin switch \| Lubrication \| Yes \| |
| actuationForceG | 45 | 0.85 | regex | Milky Red Pro \| Type \| Linear \| Operation Force \| 45±15 gf \| Pre-Travel \| 2.0±0.6 mm \| |
| price | 0.8 | 0.80 | structured | Default Title / Default Title: RM0.80 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Retooled Mold The Gateron Milky Pro Switches are popular with the community and switch enthusiasts. | 0.50 | regex | Retooled Mold The Gateron Milky Pro Switches are popular with the community and switch enthusiasts. |

## ✅ ready · Gateron Luciola Linear Switch (Glows in the dark)

- key: `mecha:gateron-luciola-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/gateron-luciola-linear-switch)
- becomes: `switch_gateron_luciola_linear_switch_glows_in_the_dark`
- fits a valid build, e.g. `switch_gateron_luciola_linear_switch_glows_in_the_dark` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Luciola Linear Switch (Glows in the dark) | 0.95 | structured | Gateron Luciola Linear Switch (Glows in the dark) |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Luciola Linear Switch (Glows in the dark) Type: |
| pinCount | 5 | 0.90 | regex | three-ply metal reinforced pins and a 5-Pin base layout. Two-Stage Black |
| actuationForceG | 55 | 0.85 | regex | Luciola Switch \| Type \| Linear \| Operation Force \| 55±15 gf \| Pre-Travel \| 2.0±0.5 mm \| |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | thocky | 0.90 | structured | Tags: sound_Deep |
| ⚠ description | Glow In The Dark Simulating Fireflies The Gateron Luciola Switch is a linear switch with a proprietary ink material and molds the same way as the Ink V2. | 0.50 | regex | Glow In The Dark Simulating Fireflies The Gateron Luciola Switch is a linear switch with a proprietary ink material and molds the same way as the Ink V2. |

## ✅ ready · Bsun Pine Tactile Switch

- key: `mecha:bsun-pine-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/bsun-pine-tactile-switch)
- becomes: `switch_bsun_pine_tactile_switch`
- fits a valid build, e.g. `switch_bsun_pine_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Bsun Pine Tactile Switch | 0.95 | structured | Bsun Pine Tactile Switch |
| brand* | Bsun | 0.90 | structured | vendor: Bsun |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Bsun Pine Tactile Switch Type: Switch Tags: sound_Creamy, |
| pinCount | 5 | 0.90 | regex | Travel - 3.8mm Mounting pins - 5 pins Manufactured by Bsun |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Default Title / Default Title: RM1.50 |
| soundProfile | creamy | 0.90 | structured | Tags: sound_Creamy |
| ⚠ description | Bsun Pine Tactile Switch Switch Type – Tactile, Factory Lubed Bottom-out Force – 60.0g Spring Length - 21 .0mm Spring Type - Single-stage Pre Travel - 2.0mm Top | 0.50 | regex | Bsun Pine Tactile Switch Switch Type – Tactile, Factory Lubed Bottom-out Force – 60.0g Spring Length - 21 .0mm Spring Type - Single-stage Pre Travel - 2.0mm Top |

## ✅ ready · JKDK Studio Colors Hiragana Cherry PBT Keycaps

- key: `mecha:jkdk-studio-colors-hiragana-cherry-pbt-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-studio-colors-hiragana-cherry-pbt-keycaps)
- becomes: `keycap_cherry_jkdk_studio_colors_hiragana_cherry_pbt_keycaps`
- fits a valid build, e.g. `keycap_cherry_jkdk_studio_colors_hiragana_cherry_pbt_keycaps` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: variants range RM99–RM279; using the cheapest (Teal Hiragana / Teal Hiragana)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Studio Colors Hiragana Cherry PBT Keycaps | 0.95 | structured | JKDK Studio Colors Hiragana Cherry PBT Keycaps |
| brand* | Cherry | 0.80 | regex | JKDK Studio Colors Hiragana Cherry PBT Keycaps |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Studio Colors Hiragana Cherry PBT Keycaps Tags: final reductions |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Studio Colors Hiragana Cherry PBT Keycaps Tags: final reductions |
| price | 99 | 0.85 | structured | Teal Hiragana / Teal Hiragana: RM99.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · KFA Pink Robin Linear Switches

- key: `mecha:kfa-pink-robin-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/kfa-pink-robin-linear-switches)
- becomes: `switch_keebs_for_all_kfa_pink_robin_linear_switches`
- fits a valid build, e.g. `switch_keebs_for_all_kfa_pink_robin_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | KFA Pink Robin Linear Switches | 0.95 | structured | KFA Pink Robin Linear Switches |
| brand* | Keebs For All | 0.90 | structured | vendor: Keebs For All |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: KFA Pink Robin Linear Switches Type: Switch Tags: final |
| pinCount | 5 | 0.90 | regex | 20mm long gold-plated spring - 5 pin MX - Designed by KFA - Manufactured |
| actuationForceG | **unknown** | – | default |  |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Aflion x KeebsForAll Pink Robin Switches The Pink Robin is an upcoming linear switch designed by KeebsForAll, manufactured by Aflion. | 0.50 | regex | Aflion x KeebsForAll Pink Robin Switches The Pink Robin is an upcoming linear switch designed by KeebsForAll, manufactured by Aflion. |

## ⚠ needs values · TX Plate Mount Stabilizers

- key: `mecha:tx-plate-mount-stabilizers` · category: **stabilizer** · [source](https://mecha.com.my/products/tx-plate-mount-stabilizers)
- **missing required:** beginnerFriendly, stabilizerType, layouts
- note: every variant is sold out; price is the listed one
- note: variants range RM39–RM49; using the cheapest (Long-Pole / Long-Pole)
- note: several options: the page offers more than one stabilizerType; left unknown for you to pick

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | TX Plate Mount Stabilizers | 0.95 | structured | TX Plate Mount Stabilizers |
| brand* | TX Keyboards | 0.90 | structured | vendor: TX Keyboards |
| ⚠ beginnerFriendly* | **unknown** | – | default |  |
| ⚠ stabilizerType* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| stabilizerSizes* | 2u, 6.25u | 0.80 | regex | TPU and POM - Housing: POM - 6.25U Set - 4 2U Stabilizers - 1 6.25U |
| price | 39 | 0.85 | structured | Long-Pole / Long-Pole: RM39.00 |
| ⚠ description | TX Plate Mount Stabilizers are the latest plate-mounted stabilizers in the industry. | 0.50 | regex | TX Plate Mount Stabilizers are the latest plate-mounted stabilizers in the industry. |

## ✅ ready · Cherry MX Black Clear Top "Nixie" Linear Switch

- key: `mecha:cherry-mx-black-clear-top-nixie-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/cherry-mx-black-clear-top-nixie-linear-switch)
- becomes: `switch_cherry_mx_black_clear_top_nixie_linear_switch`
- fits a valid build, e.g. `switch_cherry_mx_black_clear_top_nixie_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch
- note: AI said switchTechnology = "mechanical" but its quote is not in the product text; left unknown

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Cherry MX Black Clear Top "Nixie" Linear Switch | 0.95 | structured | Cherry MX Black Clear Top "Nixie" Linear Switch |
| brand* | Cherry MX | 0.90 | structured | vendor: Cherry MX |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.3 (> RM2) |
| switchTechnology* | mechanical | 0.70 | regex | Cherry MX Black Clear Top "Nixie" Linear Switch Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | Black Clear Top "Nixie" Switch 5pins : MX1A-61NW Switch Type – Linear, |
| actuationForceG | 63.5 | 0.85 | regex | pins in the PCB Specifications Operating Force – 63.5g Bottom Out Force - 80g Pre Travel |
| price | 2.3 | 0.80 | structured | Default Title / Default Title: RM2.30 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Cherry MX Black Clear Top "Nixie" Switch 5pins : MX1A-61NW Switch Type – Linear, Fixation pins in the PCB Specifications Operating Force – 63.5g Bottom Out Forc | 0.50 | regex | Cherry MX Black Clear Top "Nixie" Switch 5pins : MX1A-61NW Switch Type – Linear, Fixation pins in the PCB Specifications Operating Force – 63.5g Bottom Out Forc |

## ✅ ready · Gateron Raw Linear Switch

- key: `mecha:gateron-raw-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/gateron-raw-linear-switch)
- becomes: `switch_gateron_raw_linear_switch`
- fits a valid build, e.g. `switch_gateron_raw_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Raw Linear Switch | 0.95 | structured | Gateron Raw Linear Switch |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.2 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Raw Linear Switch Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | here) Gateron RAW Linear Switch 5pins Switch Type – Linear, Lubed at |
| actuationForceG | **unknown** | – | default |  |
| price | 2.2 | 0.80 | structured | Default Title / Default Title: RM2.20 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | The Raw Series switches are a collaboration between Geonworks and several switch manufacturers . | 0.50 | regex | The Raw Series switches are a collaboration between Geonworks and several switch manufacturers . |

## ✅ ready · Cherry MX Ergo Clear Tactile Switches

- key: `mecha:cherry-mx-ergo-clear-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/cherry-mx-ergo-clear-tactile-switches)
- becomes: `switch_cherry_mx_ergo_clear_tactile_switches`
- fits a valid build, e.g. `switch_cherry_mx_ergo_clear_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Cherry MX Ergo Clear Tactile Switches | 0.95 | structured | Cherry MX Ergo Clear Tactile Switches |
| brand* | Cherry MX | 0.90 | structured | vendor: Cherry MX |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Cherry MX Ergo Clear Tactile Switches Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | Title Cherry MX Ergo Clear Switch 5pins : MX1A-H1NW Switch Type – Tactile, |
| actuationForceG | 55 | 0.85 | regex | pins in the PCB Specifications Operating Force – 55g Pre Travel - 2.0mm Travel - 4.0mm |
| price | 2.5 | 0.80 | structured | Default Title / Default Title: RM2.50 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Cherry MX Ergo Clear Switch 5pins : MX1A-H1NW Switch Type – Tactile, Fixation pins in the PCB Specifications Operating Force – 55g Pre Travel - 2.0mm Travel - 4 | 0.50 | regex | Cherry MX Ergo Clear Switch 5pins : MX1A-H1NW Switch Type – Tactile, Fixation pins in the PCB Specifications Operating Force – 55g Pre Travel - 2.0mm Travel - 4 |

## ✅ ready · Geonworks Slider / Switch Stems (100pcs)

- key: `mecha:geonworks-slider-switch-stems-100pcs` · category: **switch** · [source](https://mecha.com.my/products/geonworks-slider-switch-stems-100pcs)
- becomes: `switch_geonworks_slider_switch_stems_100pcs`
- fits a valid build, e.g. `switch_geonworks_slider_switch_stems_100pcs` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geonworks Slider / Switch Stems (100pcs) | 0.95 | structured | Geonworks Slider / Switch Stems (100pcs) |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.19 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | stems, switches Variants: Cloud (Linear 13.55mm) / Cloud (Linear 13.55mm) |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 0.19 | 0.85 | structured | Lavender (Tactile 13.55mm) / Lavender (Tactile 13.55mm): RM19.00 / 100 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Geon Switch Slider Quantity - 100+5~10 Can be used with cherry switches. | 0.50 | regex | Geon Switch Slider Quantity - 100+5~10 Can be used with cherry switches. |

## ✅ ready · Cherry MX Black Hyperglide Linear Switches

- key: `mecha:cherry-mx-black-hyperglide-linear-switches-1` · category: **switch** · [source](https://mecha.com.my/products/cherry-mx-black-hyperglide-linear-switches-1)
- becomes: `switch_cherry_mx_black_hyperglide_linear_switches`
- fits a valid build, e.g. `switch_cherry_mx_black_hyperglide_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Cherry MX Black Hyperglide Linear Switches | 0.95 | structured | Cherry MX Black Hyperglide Linear Switches |
| brand* | Cherry MX | 0.90 | structured | vendor: Cherry MX |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.3 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Cherry MX Black Hyperglide Linear Switches Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | mm total travel - PCB mount - 5 pin - MX stem |
| actuationForceG | **unknown** | – | default |  |
| price | 1.3 | 0.80 | structured | Default Title / Default Title: RM1.30 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Cherry MX Black Specs - Linear - Hyperglide - 60 cN operating force - 2.0 mm pre-travel - 4.0 mm total travel - PCB mount - 5 pin - MX stem | 0.50 | regex | Cherry MX Black Specs - Linear - Hyperglide - 60 cN operating force - 2.0 mm pre-travel - 4.0 mm total travel - PCB mount - 5 pin - MX stem |

## ✅ ready · Gateron Baby Raccoon Linear Switches

- key: `mecha:gateron-baby-racoon-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-baby-racoon-linear-switches)
- becomes: `switch_gateron_baby_raccoon_linear_switches`
- fits a valid build, e.g. `switch_gateron_baby_raccoon_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Baby Raccoon Linear Switches | 0.95 | structured | Gateron Baby Raccoon Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Baby Raccoon Linear Switches Type: Switch Tags: sound_Clacky, |
| pinCount | 5 | 0.90 | regex | \| 20 mm gold-plated \| Pins \| 5-Pin switch \| Lubrication \| Lubed |
| actuationForceG | 55 | 0.85 | regex | Raccoon Switch \| Type \| Linear \| Operation Force \| 55±8 gf \| Pre-Travel \| 2.0±0.5 mm \| |
| price | 2.5 | 0.80 | structured | Default Title / Default Title: RM2.50 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Shorten Total Travel And Early Bottom-out The Gateron Baby Raccoon Switch is a linear switch that features a 0.64mm stem, which is longer than conventional swit | 0.50 | regex | Shorten Total Travel And Early Bottom-out The Gateron Baby Raccoon Switch is a linear switch that features a 0.64mm stem, which is longer than conventional swit |

## ✅ ready · Geon x Haimu RAW Linear Switch

- key: `mecha:geon-x-haimu-raw-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/geon-x-haimu-raw-linear-switch)
- becomes: `switch_geonworks_geon_x_haimu_raw_linear_switch`
- fits a valid build, e.g. `switch_geonworks_geon_x_haimu_raw_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon x Haimu RAW Linear Switch | 0.95 | structured | Geon x Haimu RAW Linear Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Geon x Haimu RAW Linear Switch Type: Switch Tags: sound_Creamy, |
| pinCount | 5 | 0.90 | regex | (You are here) Haimu RAW Switch 5pins Switch Type – Linear, Unlubed |
| actuationForceG | **unknown** | – | default |  |
| price | 1.2 | 0.80 | structured | Default Title / Default Title: RM1.20 |
| soundProfile | creamy | 0.90 | structured | Tags: sound_Creamy |
| ⚠ description | The Raw Series switches are a collaboration between Geonworks and several switch manufacturers. | 0.50 | regex | The Raw Series switches are a collaboration between Geonworks and several switch manufacturers. |

## ✅ ready · JWICK Ultimate Black Linear Switches

- key: `mecha:jwick-ultimate-black-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/jwick-ultimate-black-linear-switches)
- becomes: `switch_jwk_jwick_ultimate_black_linear_switches`
- fits a valid build, e.g. `switch_jwk_jwick_ultimate_black_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWICK Ultimate Black Linear Switches | 0.95 | structured | JWICK Ultimate Black Linear Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.8 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWICK Ultimate Black Linear Switches Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | from POM. - PCB mounted design (5 pins) - 63.5g progressive spring |
| actuationForceG | **unknown** | – | default |  |
| price | 0.8 | 0.80 | structured | Default Title / Default Title: RM0.80 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | It's like the original JWICK Blacks, but U L T I M A T E. | 0.50 | regex | It's like the original JWICK Blacks, but U L T I M A T E. |

## ✅ ready · JWICK Pink Jade Linear Switches

- key: `mecha:jwick-pink-jade-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/jwick-pink-jade-linear-switches)
- becomes: `switch_jwk_jwick_pink_jade_linear_switches`
- fits a valid build, e.g. `switch_jwk_jwick_pink_jade_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWICK Pink Jade Linear Switches | 0.95 | structured | JWICK Pink Jade Linear Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWICK Pink Jade Linear Switches Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | switches. - PCB mounted design (5 pins) - 62g long spring - Light factory |
| actuationForceG | **unknown** | – | default |  |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | JWICK introduces the Jade switches, but these are far from loud and clicky like the switches that they happen to share a name with. | 0.50 | regex | JWICK introduces the Jade switches, but these are far from loud and clicky like the switches that they happen to share a name with. |

## ✅ ready · JWK Lotus Linear Switch

- key: `mecha:jwk-lotus-switch` · category: **switch** · [source](https://mecha.com.my/products/jwk-lotus-switch)
- becomes: `switch_jwk_lotus_linear_switch`
- fits a valid build, e.g. `switch_jwk_lotus_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWK Lotus Linear Switch | 0.95 | structured | JWK Lotus Linear Switch |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWK Lotus Linear Switch Type: Switch Tags: clearance, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 48 | 0.85 | regex | - Pretravel: 2.0 ± 0.6 mm - Operating force: 48±20gf. - Total travel force: 55 ± 20 |
| price | 1 | 0.80 | structured | Default Title / Default Title: RM1.00 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | Specifications: - Manufacturer: JWK - Switch type: Linear - Color:289C black/243c light pink - Spring: Stainless steel (gold-plated） - Stem: Pom - Housing Mater | 0.50 | regex | Specifications: - Manufacturer: JWK - Switch type: Linear - Color:289C black/243c light pink - Spring: Stainless steel (gold-plated） - Stem: Pom - Housing Mater |

## ✅ ready · JWK SOTC Linear Switches

- key: `mecha:jwk-sotc-switch` · category: **switch** · [source](https://mecha.com.my/products/jwk-sotc-switch)
- becomes: `switch_jwk_sotc_linear_switches`
- fits a valid build, e.g. `switch_jwk_sotc_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWK SOTC Linear Switches | 0.95 | structured | JWK SOTC Linear Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM3.9 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWK SOTC Linear Switches Type: Switch Tags: sound_Deep, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 48 | 0.85 | regex | - Pretravel: 2.0 ± 0.6 mm - Operating force: 48±20gf - Total travel force: 55 ± 20 |
| price | 3.9 | 0.80 | structured | Default Title / Default Title: RM3.90 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | CreateKeebs SOTC Switches is a well-balanced linear switch with its LY stems on full POM housing. | 0.50 | regex | CreateKeebs SOTC Switches is a well-balanced linear switch with its LY stems on full POM housing. |

## ✅ ready · K.TECHS S1 Linear Switches

- key: `mecha:k-techs-s1-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/k-techs-s1-linear-switches)
- becomes: `switch_k_techs_s1_linear_switches`
- fits a valid build, e.g. `switch_k_techs_s1_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | K.TECHS S1 Linear Switches | 0.95 | structured | K.TECHS S1 Linear Switches |
| brand* | K.TECHS | 0.80 | regex | K.TECHS S1 Linear Switches |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: K.TECHS S1 Linear Switches Variants: Default Title |
| pinCount | 5 | 0.90 | regex | TECSEE! - PCB mounted design (5 pins) - 63.5g double-stage spring |
| actuationForceG | **unknown** | – | default |  |
| price | 2.5 | 0.80 | structured | Default Title / Default Title: RM2.50 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | The K.TECHS' S1 is a culmination of all of the modern advances in features for switches in 2022. | 0.50 | regex | The K.TECHS' S1 is a culmination of all of the modern advances in features for switches in 2022. |

## ✅ ready · K.TECHS S2 v2 Lubricated Tactile Switches

- key: `mecha:k-techs-s2-v2-lubricated-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/k-techs-s2-v2-lubricated-tactile-switches)
- becomes: `switch_k_techs_s2_v2_lubricated_tactile_switches`
- fits a valid build, e.g. `switch_k_techs_s2_v2_lubricated_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | K.TECHS S2 v2 Lubricated Tactile Switches | 0.95 | structured | K.TECHS S2 v2 Lubricated Tactile Switches |
| brand* | K.TECHS | 0.80 | regex | K.TECHS S2 v2 Lubricated Tactile Switches |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM3.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: K.TECHS S2 v2 Lubricated Tactile Switches Type: Switch Tags: sound_Deep, |
| pinCount | 5 | 0.90 | regex | TECSEE. - PCB mounted design (5 pins) - 63.5g double-stage spring |
| actuationForceG | **unknown** | – | default |  |
| price | 3.5 | 0.80 | structured | Default Title / Default Title: RM3.50 |
| soundProfile | clacky | 0.70 | ai | Tags: sound_Deep, sound_Poppy |
| ⚠ description | The K.TECHS' S2 is a unique combination of innovations that brings you a satisfyingly prominent and sharp tactile bump that is 100% sure to satisfy. | 0.50 | regex | The K.TECHS' S2 is a unique combination of innovations that brings you a satisfyingly prominent and sharp tactile bump that is 100% sure to satisfy. |

## ✅ ready · Gateron Baby Kangaroo Tactile Switches

- key: `mecha:gateron-baby-kangaroo-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-baby-kangaroo-tactile-switches)
- becomes: `switch_gateron_baby_kangaroo_tactile_switches`
- fits a valid build, e.g. `switch_gateron_baby_kangaroo_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Baby Kangaroo Tactile Switches | 0.95 | structured | Gateron Baby Kangaroo Tactile Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Baby Kangaroo Tactile Switches Type: Switch Tags: Switch |
| pinCount | 5 | 0.90 | regex | - Operating Force: 59 ±8g - 5-Pin, PCB Mount - Lightly Lubed |
| actuationForceG | 59 | 0.85 | regex | ±0.5mm - Total Travel: 3.4mm - Operating Force: 59 ±8g - 5-Pin, PCB Mount - Lightly |
| price | 1.2 | 0.80 | structured | Default Title / Default Title: RM1.20 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Gateron Baby Kangaroo Switches provides a crisp tactile feel with tactility falling between a medium-strong bump. | 0.50 | regex | Gateron Baby Kangaroo Switches provides a crisp tactile feel with tactility falling between a medium-strong bump. |

## ✅ ready · Joininkeys Jade Rabbit Linear Switches

- key: `mecha:joininkeys-jade-rabbit-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/joininkeys-jade-rabbit-linear-switches)
- becomes: `switch_joininkeys_jade_rabbit_linear_switches`
- fits a valid build, e.g. `switch_joininkeys_jade_rabbit_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Joininkeys Jade Rabbit Linear Switches | 0.95 | structured | Joininkeys Jade Rabbit Linear Switches |
| brand* | Joininkeys | 0.90 | structured | vendor: Joininkeys |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.6 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Joininkeys Jade Rabbit Linear Switches Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | material. - PCB-mounted design (5 pins) - 60g, 18mm long, double-staged, |
| actuationForceG | **unknown** | – | default |  |
| price | 1.6 | 0.80 | structured | Default Title / Default Title: RM1.60 |
| soundProfile | clacky | 0.70 | ai | sound of a long pole bottom out |
| ⚠ description | Joininkeys welcomes the year of the rabbit with their latest entry into the switch market! | 0.50 | regex | Joininkeys welcomes the year of the rabbit with their latest entry into the switch market! |

## ✅ ready · Keygeek Raw Linear Switch

- key: `mecha:keygeek-raw-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/keygeek-raw-linear-switch)
- becomes: `switch_geonworks_keygeek_raw_linear_switch`
- fits a valid build, e.g. `switch_geonworks_keygeek_raw_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keygeek Raw Linear Switch | 0.95 | structured | Keygeek Raw Linear Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Keygeek Raw Linear Switch Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | recommended. Keygeek RAW Switch 5pins Switch Type – Linear, Unlubed |
| actuationForceG | **unknown** | – | default |  |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | clacky | 0.80 | ai | Flat Pole is Louder than a Round pole |
| ⚠ description | The Raw Series switches are a collaboration between Geonworks and several switch manufacturers. | 0.50 | regex | The Raw Series switches are a collaboration between Geonworks and several switch manufacturers. |

## ✅ ready · Geon x Haimu White Tactile Switch

- key: `mecha:geon-x-haimu-white-tactile-switch` · category: **switch** · [source](https://mecha.com.my/products/geon-x-haimu-white-tactile-switch)
- becomes: `switch_geonworks_geon_x_haimu_white_tactile_switch`
- fits a valid build, e.g. `switch_geonworks_geon_x_haimu_white_tactile_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon x Haimu White Tactile Switch | 0.95 | structured | Geon x Haimu White Tactile Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.8 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Geon x Haimu White Tactile Switch Type: Switch Tags: sound_Clacky, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 1.8 | 0.80 | structured | Default Title / Default Title: RM1.80 |
| soundProfile | clacky | 0.85 | ai | Tags: sound_Clacky, sound_Creamy |
| ⚠ description | World-renowned Korean keyboard designer Geonworks has collaborated with Haimu to offer a high-end typing feel for enthusiasts with all sorts of preference throu | 0.50 | regex | World-renowned Korean keyboard designer Geonworks has collaborated with Haimu to offer a high-end typing feel for enthusiasts with all sorts of preference throu |

## ✅ ready · Geon x Haimu Red Silent Linear Switch

- key: `mecha:geon-x-haimu-red-silent-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/geon-x-haimu-red-silent-linear-switch)
- becomes: `switch_geonworks_geon_x_haimu_red_silent_linear_switch`
- fits a valid build, e.g. `switch_geonworks_geon_x_haimu_red_silent_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon x Haimu Red Silent Linear Switch | 0.95 | structured | Geon x Haimu Red Silent Linear Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Geon x Haimu Red Silent Linear Switch Type: Switch Tags: Silent |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 1.9 | 0.80 | structured | Default Title / Default Title: RM1.90 |
| soundProfile | silent | 0.90 | structured | Tags: sound_Silent |
| ⚠ description | World-renowned Korean keyboard designer Geonworks has collaborated with Haimu to offer a high-end typing feel for enthusiasts with all sorts of preference throu | 0.50 | regex | World-renowned Korean keyboard designer Geonworks has collaborated with Haimu to offer a high-end typing feel for enthusiasts with all sorts of preference throu |

## ✅ ready · Geon x Haimu Black Linear Switch

- key: `mecha:geon-x-haimu-black-linear-switch` · category: **switch** · [source](https://mecha.com.my/products/geon-x-haimu-black-linear-switch)
- becomes: `switch_geonworks_geon_x_haimu_black_linear_switch`
- fits a valid build, e.g. `switch_geonworks_geon_x_haimu_black_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Geon x Haimu Black Linear Switch | 0.95 | structured | Geon x Haimu Black Linear Switch |
| brand* | GEONWORKS | 0.90 | structured | vendor: GEONWORKS |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Geon x Haimu Black Linear Switch Type: Switch Tags: clearance, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | **unknown** | – | default |  |
| price | 0.9 | 0.80 | structured | Default Title / Default Title: RM0.90 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | World-renowned Korean keyboard designer Geonworks has collaborated with Haimu to offer a high-end typing feel for enthusiasts with all sorts of preference throu | 0.50 | regex | World-renowned Korean keyboard designer Geonworks has collaborated with Haimu to offer a high-end typing feel for enthusiasts with all sorts of preference throu |

## ✅ ready · Keychron OEM Dye-Sub PBT Keycap Set - Ocean Full Set

- key: `mecha:keychron-oem-dye-sub-pbt-keycap-set-ocean` · category: **keycap** · [source](https://mecha.com.my/products/keychron-oem-dye-sub-pbt-keycap-set-ocean)
- becomes: `keycap_keychron_oem_dye_sub_pbt_keycap_set_ocean_full_set`
- fits a valid build, e.g. `keycap_keychron_oem_dye_sub_pbt_keycap_set_ocean_full_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Keychron OEM Dye-Sub PBT Keycap Set - Ocean Full Set | 0.95 | structured | Keychron OEM Dye-Sub PBT Keycap Set - Ocean Full Set |
| brand* | Keychron | 0.90 | structured | vendor: Keychron |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | oem | 0.80 | regex | Title: Keychron OEM Dye-Sub PBT Keycap Set - Ocean |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | K12, C1, and C2 (80%, 100%, and 60% layout keyboards) Version C (Full |
| switchTechnologySupport* | mechanical | 0.80 | regex | And it's fully compatible with MX mechanical switches. Specs Material: |
| price | 99 | 0.95 | structured | Default Title / Default Title: RM99.00 |
| ⚠ description | Premium PBT. Five-Sided Dye-Sub. | 0.50 | regex | Premium PBT. Five-Sided Dye-Sub. |

## ✅ ready · Emogogo Hybrid Black

- key: `mecha:emogogo-hybrid-black` · category: **switch** · [source](https://mecha.com.my/products/emogogo-hybrid-black)
- becomes: `switch_jwk_emogogo_hybrid_black`
- fits a valid build, e.g. `switch_jwk_emogogo_hybrid_black` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Emogogo Hybrid Black | 0.95 | structured | Emogogo Hybrid Black |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | ai | traditional 4mm full travel black switch |
| pinCount | 5 | 0.90 | regex | JWK's POM. - PCB mounted design (5 pins) - 16mm 60g long spring - 4mm |
| actuationForceG | **unknown** | – | default |  |
| price | 2 | 0.80 | structured | Default Title / Default Title: RM2.00 |
| soundProfile | clacky | 0.80 | ai | Cherry-like nylon top out sound and bottom housing is made from a new H1 material |
| ⚠ description | Known for making the buttery smooth switches that don't need hand lubing with an exciting long pole pop sound to it, Emogogo is back with their take on a tradit | 0.50 | regex | Known for making the buttery smooth switches that don't need hand lubing with an exciting long pole pop sound to it, Emogogo is back with their take on a tradit |

## ✅ ready · Moondrop Lunalight Linear Switch

- key: `mecha:moondrop-lunalight-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/moondrop-lunalight-linear-switches)
- becomes: `switch_moondrop_lunalight_linear_switch`
- fits a valid build, e.g. `switch_moondrop_lunalight_linear_switch` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Moondrop Lunalight Linear Switch | 0.95 | structured | Moondrop Lunalight Linear Switch |
| brand* | Moondrop | 0.90 | structured | vendor: Moondrop |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Moondrop Lunalight Linear Switch Type: Switch Tags: clearance, |
| pinCount | **unknown** | – | default |  |
| ⚠ actuationForceG | 40 | 0.55 | regex | Material: POM - Initial Pressure: 40 gf - Bottoming Pressure: 60 gf |
| price | 2 | 0.80 | structured | Default Title / Default Title: RM2.00 |
| soundProfile | clacky | 0.80 | ai | sound_Clacky |
| ⚠ description | Lunalight - Moondrop & G-Square - Switch type: Linear - Material: Nylon - Stem Material: POM - Initial Pressure: 40 gf - Bottoming Pressure: 60 gf - Spring mate | 0.50 | regex | Lunalight - Moondrop & G-Square - Switch type: Linear - Material: Nylon - Stem Material: POM - Initial Pressure: 40 gf - Bottoming Pressure: 60 gf - Spring mate |

## ✅ ready · JKDK Dark Matter PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-dark-matter-pbt-cherry-profile-dye-sub-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-dark-matter-pbt-cherry-profile-dye-sub-keycap-set)
- becomes: `keycap_jkdk_dark_matter_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_dark_matter_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one
- note: variants range RM49–RM349; using the cheapest (Numpad / Numpad)

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Dark Matter PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Dark Matter PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Dark Matter PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Dark Matter PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 49 | 0.85 | structured | Numpad / Numpad: RM49.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Bamboo Forest PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-bamboo-forest-pbt-cherry-profile-dye-sub-keycap-set` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-bamboo-forest-pbt-cherry-profile-dye-sub-keycap-set)
- becomes: `keycap_jkdk_bamboo_forest_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_bamboo_forest_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Bamboo Forest PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Bamboo Forest PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Bamboo Forest PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Bamboo Forest PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · Dangkeebs Strawberry Milk Ice Linear Switches

- key: `mecha:dangkeebs-strawberry-milk-ice-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/dangkeebs-strawberry-milk-ice-linear-switches)
- becomes: `switch_tecsee_dangkeebs_strawberry_milk_ice_linear_switches`
- fits a valid build, e.g. `switch_tecsee_dangkeebs_strawberry_milk_ice_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Dangkeebs Strawberry Milk Ice Linear Switches | 0.95 | structured | Dangkeebs Strawberry Milk Ice Linear Switches |
| brand* | TECSEE | 0.90 | structured | vendor: TECSEE |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM3.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Dangkeebs Strawberry Milk Ice Linear Switches Type: Switch Tags: Switch |
| pinCount | 5 | 0.90 | regex | actuation / 67g bottom out - 5 pin (PCB Mount) - UNLUBED from factory |
| actuationForceG | 67 | 0.85 | regex | spring - 3.5mm travel - 55g actuation / 67g bottom out - 5 pin (PCB Mount) |
| price | 3.5 | 0.80 | structured | 1 / 1: RM3.50 |
| soundProfile | thocky | 0.85 | regex | suggests, these switches contain 100% thock. Specifications: - Linear - |
| ⚠ description | Collectible milk bottle packaging available for orders with 110 switches Strawberry Milk Ice are the sequel to our beloved Strawberry Milk Switches. | 0.50 | regex | Collectible milk bottle packaging available for orders with 110 switches Strawberry Milk Ice are the sequel to our beloved Strawberry Milk Switches. |

## ✅ ready · Gateron G Pro 2.0 Silver Linear Switches

- key: `mecha:gateron-g-pro-2-0-silver-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-g-pro-2-0-silver-linear-switches)
- becomes: `switch_gateron_g_pro_2_0_silver_linear_switches`
- fits a valid build, e.g. `switch_gateron_g_pro_2_0_silver_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron G Pro 2.0 Silver Linear Switches | 0.95 | structured | Gateron G Pro 2.0 Silver Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.5 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron G Pro 2.0 Silver Linear Switches Tags: xmas2022 Variants: |
| pinCount | 3 | 0.90 | regex | Switches: - PCB mounted design (3 pins) - Pre-travel: 1.2 ±0.3 mm - |
| actuationForceG | **unknown** | – | default |  |
| price | 1.5 | 0.80 | structured | Single-Stage Spring / Single-Stage Spring: RM1.50 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Gateron G Pro 2.0 Silver Linear Switches: - PCB mounted design (3 pins) - Pre-travel: 1.2 ±0.3 mm - Total travel：3.4 +0.0/-0.4 mm - Operating: 45 ±15 gf - Botto | 0.50 | regex | Gateron G Pro 2.0 Silver Linear Switches: - PCB mounted design (3 pins) - Pre-travel: 1.2 ±0.3 mm - Total travel：3.4 +0.0/-0.4 mm - Operating: 45 ±15 gf - Botto |

## ✅ ready · JKDK White on Black Hiragana PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-white-on-black-hiragana-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-white-on-black-hiragana-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_white_on_black_hiragana_pbt_cherry_profile_dye_sub_keycap_se`
- fits a valid build, e.g. `keycap_jkdk_white_on_black_hiragana_pbt_cherry_profile_dye_sub_keycap_se` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK White on Black Hiragana PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK White on Black Hiragana PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | JKDK White on Black Hiragana PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): JKDK White on Black Hiragana PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 219 | 0.85 | structured | Orange / Orange: RM219.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Black on White PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-black-on-white-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-black-on-white-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_black_on_white_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_black_on_white_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Black on White PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Black on White PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Black on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Black on White PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Pink Dessert PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-pink-dessert-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-pink-dessert-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_pink_dessert_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_pink_dessert_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Pink Dessert PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Pink Dessert PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Pink Dessert PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Pink Dessert PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JKDK Hydrogen PBT Cherry Profile Dye-Sub Keycap Set

- key: `mecha:jkdk-hydrogen-pbt-cherry-profile-dye-sub-keycaps` · category: **keycap** · [source](https://mecha.com.my/products/jkdk-hydrogen-pbt-cherry-profile-dye-sub-keycaps)
- becomes: `keycap_jkdk_hydrogen_pbt_cherry_profile_dye_sub_keycap_set`
- fits a valid build, e.g. `keycap_jkdk_hydrogen_pbt_cherry_profile_dye_sub_keycap_set` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`
- note: every variant is sold out; price is the listed one

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JKDK Hydrogen PBT Cherry Profile Dye-Sub Keycap Set | 0.95 | structured | JKDK Hydrogen PBT Cherry Profile Dye-Sub Keycap Set |
| brand* | JKDK | 0.90 | structured | vendor: JKDK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | cherry | 0.80 | regex | Title: JKDK Hydrogen PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| ⚠ layouts* | 60, 65, 75, tkl, full | 0.65 | regex | 100% 96% Tenkeyless (TKL) 75% 65% 60% |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by cherry profile (MX stem): Title: JKDK Hydrogen PBT Cherry Profile Dye-Sub Keycap Set Type: Keycaps |
| price | 149 | 0.95 | structured | Default Title / Default Title: RM149.00 |
| ⚠ description | High-quality PBT Dye-Sub keycaps in Cherry profile. | 0.50 | regex | High-quality PBT Dye-Sub keycaps in Cherry profile. |

## ✅ ready · JTK Polycarbonate Keycap Storage Trays

- key: `mecha:jtk-polycarbonate-keycap-storage-trays` · category: **keycap** · [source](https://mecha.com.my/products/jtk-polycarbonate-keycap-storage-trays)
- becomes: `keycap_jtk_polycarbonate_keycap_storage_trays`
- fits a valid build, e.g. `keycap_jtk_polycarbonate_keycap_storage_trays` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `switch_gateron_milky_yellow_pro` + `stab_gmk67_plate_mount`

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JTK Polycarbonate Keycap Storage Trays | 0.95 | structured | JTK Polycarbonate Keycap Storage Trays |
| brand* | JTK | 0.90 | structured | vendor: JTK |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| keycapProfile* | xda | 0.80 | regex | Compatible with Cherry, OEM, DCS, DSA, XDA and SA Row 3 only - Dimensions: |
| ⚠ layouts* | 65 | 0.65 | regex | individually - Designed for one 65% keycap set - Compatible with |
| switchTechnologySupport* | mechanical | 0.70 | default | implied by xda profile (MX stem): Compatible with Cherry, OEM, DCS, DSA, XDA and SA Row 3 only - Dimensions: |
| price | 99.9 | 0.95 | structured | Max / Smokey Black / Max / Smokey Black: RM99.90 |
| ⚠ description | If you’re like us, you have a lot of keycaps in your rotation. | 0.50 | regex | If you’re like us, you have a lot of keycaps in your rotation. |

## ✅ ready · Drop Invyr Holy Panda Tactile Switches

- key: `mecha:drop-invyr-housing-holy-panda-tactile-switches` · category: **switch** · [source](https://mecha.com.my/products/drop-invyr-housing-holy-panda-tactile-switches)
- becomes: `switch_drop_invyr_holy_panda_tactile_switches`
- fits a valid build, e.g. `switch_drop_invyr_holy_panda_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Drop Invyr Holy Panda Tactile Switches | 0.95 | structured | Drop Invyr Holy Panda Tactile Switches |
| brand* | Drop | 0.90 | structured | vendor: Drop |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM5.9 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Drop Invyr Holy Panda Tactile Switches Type: Switch Tags: sound_Deep, |
| pinCount | 3 | 0.90 | regex | - 67g spring - Plate mount (3pin) - Unlubed from the factory |
| actuationForceG | **unknown** | – | default |  |
| price | 5.9 | 0.80 | structured | Default Title / Default Title: RM5.90 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Drop Holy Pandas are made with stems from Halo Clears or Halo Trues, with the housing found on Invyr Panda switches, Holy Panda switches combine the best of two | 0.50 | regex | Drop Holy Pandas are made with stems from Halo Clears or Halo Trues, with the housing found on Invyr Panda switches, Holy Panda switches combine the best of two |

## ✅ ready · Gateron Ink Black V2 Linear Switches

- key: `mecha:gateron-ink-black-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-ink-black-linear-switches)
- becomes: `switch_gateron_ink_black_v2_linear_switches`
- fits a valid build, e.g. `switch_gateron_ink_black_v2_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Ink Black V2 Linear Switches | 0.95 | structured | Gateron Ink Black V2 Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.9 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Ink Black V2 Linear Switches Type: Switch Tags: clearance, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 67 | 0.85 | regex | : Linear \| 4.0mm travel \| 50g Actuation \| 67g Bottom Ink Yellow : Linear \| 4.0mm |
| price | 2.9 | 0.80 | structured | Default Title / Default Title: RM2.90 |
| soundProfile | thocky | 0.85 | ai | Gateron Ink switches are smoother and "thoccier" when compared to regular Gateron switches. |
| ⚠ description | Gateron Ink switches are smoother and "thoccier" when compared to regular Gateron switches. | 0.50 | regex | Gateron Ink switches are smoother and "thoccier" when compared to regular Gateron switches. |

## ✅ ready · Gateron Cap Gold Linear Switches

- key: `mecha:gateron-cap-gold-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-cap-gold-linear-switches)
- becomes: `switch_gateron_cap_gold_linear_switches`
- fits a valid build, e.g. `switch_gateron_cap_gold_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Cap Gold Linear Switches | 0.95 | structured | Gateron Cap Gold Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.9 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Cap Gold Linear Switches Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | all-yellow housing. PCB mount (5-pin). Cap Yellow : Linear \| 4.0mm |
| actuationForceG | **unknown** | – | default |  |
| price | 1.9 | 0.80 | structured | Single / Single: RM1.90 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | Gateron Cap switches feature a new ground-up design with new molding and tighter tolerances to reduce wobble. | 0.50 | regex | Gateron Cap switches feature a new ground-up design with new molding and tighter tolerances to reduce wobble. |

## ⚠ check flags · Everglide Panda Plate-Mounted (Clip-In) Stabilizers

- key: `mecha:everglide-panda-plate-mounted-clip-in-stabilizers` · category: **stabilizer** · [source](https://mecha.com.my/products/everglide-panda-plate-mounted-clip-in-stabilizers)
- becomes: `stab_everglide_panda_plate_mounted_clip_in_stabilizers`
- ⚠ buildable: the rule engine found no valid build with this part and the current catalogue

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Everglide Panda Plate-Mounted (Clip-In) Stabilizers | 0.95 | structured | Everglide Panda Plate-Mounted (Clip-In) Stabilizers |
| brand* | Everglide | 0.90 | structured | vendor: Everglide |
| beginnerFriendly* | true | 0.70 | rule | rule: plate-mount stabilizers are beginner-friendly |
| stabilizerType* | plate_mount | 0.85 | regex | Tiffany Blue / Tiffany Blue Smooth plate-mounted stabilizers by Everglide that comes |
| ⚠ layouts* | tkl | 0.65 | regex | Comes disassembled and unlubed. 80% kit comes with: 1x 6.25U wire |
| stabilizerSizes* | 2u, 6.25u | 0.80 | regex | unlubed. 80% kit comes with: 1x 6.25U wire 4x 2U wires 10x stabilizer |
| price | 18.9 | 0.85 | structured | Clear / Clear: RM18.90 |
| ⚠ description | Smooth plate-mounted stabilizers by Everglide that comes with gold-plated wires. | 0.50 | regex | Smooth plate-mounted stabilizers by Everglide that comes with gold-plated wires. |

## ⚠ needs values · Glorious GPBT Premium Keycaps in Olive

- key: `mecha:glorious-gpbt-premium-keycaps-in-olive` · category: **keycap** · [source](https://mecha.com.my/products/glorious-gpbt-premium-keycaps-in-olive)
- **missing required:** keycapProfile, layouts, switchTechnologySupport

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Glorious GPBT Premium Keycaps in Olive | 0.95 | structured | Glorious GPBT Premium Keycaps in Olive |
| brand* | Glorious PC Gaming Race | 0.90 | structured | vendor: Glorious PC Gaming Race |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| ⚠ keycapProfile* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| price | 89 | 0.95 | structured | Default Title / Default Title: RM89.00 |
| ⚠ description | Adorn your switches with aesthetically-pleasing keycaps that will compliment any build. | 0.50 | regex | Adorn your switches with aesthetically-pleasing keycaps that will compliment any build. |

## ⚠ needs values · Glorious GPBT Premium Keycaps in Pastel

- key: `mecha:glorious-gpbt-premium-keycaps-in-pastel` · category: **keycap** · [source](https://mecha.com.my/products/glorious-gpbt-premium-keycaps-in-pastel)
- **missing required:** keycapProfile, layouts, switchTechnologySupport

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Glorious GPBT Premium Keycaps in Pastel | 0.95 | structured | Glorious GPBT Premium Keycaps in Pastel |
| brand* | Glorious PC Gaming Race | 0.90 | structured | vendor: Glorious PC Gaming Race |
| beginnerFriendly* | true | 0.70 | rule | rule: keycaps are beginner-friendly |
| ⚠ keycapProfile* | **unknown** | – | default |  |
| ⚠ layouts* | **unknown** | – | default |  |
| ⚠ switchTechnologySupport* | **unknown** | – | default |  |
| price | 89 | 0.95 | structured | Default Title / Default Title: RM89.00 |
| ⚠ description | Adorn your switches with aesthetically-pleasing keycaps that will compliment any build. | 0.50 | regex | Adorn your switches with aesthetically-pleasing keycaps that will compliment any build. |

## ✅ ready · Kailh x Novelkeys Box Cream Linear Switches

- key: `mecha:kailh-x-novelkeys-box-cream-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/kailh-x-novelkeys-box-cream-linear-switches)
- becomes: `switch_novelkeys_kailh_x_novelkeys_box_cream_linear_switches`
- fits a valid build, e.g. `switch_novelkeys_kailh_x_novelkeys_box_cream_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Kailh x Novelkeys Box Cream Linear Switches | 0.95 | structured | Kailh x Novelkeys Box Cream Linear Switches |
| brand* | Novelkeys | 0.90 | structured | vendor: Novelkeys |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM3.5 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Kailh x Novelkeys Box Cream Linear Switches Type: Switch Tags: Kailh, |
| pinCount | **unknown** | – | default |  |
| actuationForceG | 55 | 0.85 | regex | 2mm Actuation & 4mm Bottom 45g Actuation & 55g Bottom |
| price | 3.5 | 0.80 | structured | Default Title / Default Title: RM3.50 |
| ⚠ soundProfile | creamy | 0.60 | regex | Title: Kailh x Novelkeys Box Cream Linear Switches Type: Switch Tags: |
| ⚠ description | Kailh x NovelKeys Box Cream switches are a brand new revision of the popular Cream linear switches. | 0.50 | regex | Kailh x NovelKeys Box Cream switches are a brand new revision of the popular Cream linear switches. |

## ✅ ready · JWICK Black Linear Lubricated Switches

- key: `mecha:jwick-black-lubricated-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/jwick-black-lubricated-linear-switches)
- becomes: `switch_jwk_jwick_black_linear_lubricated_switches`
- fits a valid build, e.g. `switch_jwk_jwick_black_linear_lubricated_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWICK Black Linear Lubricated Switches | 0.95 | structured | JWICK Black Linear Lubricated Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM0.8 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWICK Black Linear Lubricated Switches Type: Switch |
| pinCount | 5 | 0.90 | regex | POM stem. - PCB mounted design (5 pins) - Pre-travel: 2.0mm - Total |
| actuationForceG | **unknown** | – | default |  |
| price | 0.8 | 0.80 | structured | 63.5g / 63.5g: RM0.80 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | JWICK switches are the newest switches from manufacturer JWK, bringing you all that smoothness and quality - at a wallet-friendly price point! | 0.50 | regex | JWICK switches are the newest switches from manufacturer JWK, bringing you all that smoothness and quality - at a wallet-friendly price point! |

## ✅ ready · TECSEE Ice Candy Linear Switches

- key: `mecha:tecsee-ice-candy-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/tecsee-ice-candy-linear-switches)
- becomes: `switch_tecsee_ice_candy_linear_switches`
- fits a valid build, e.g. `switch_tecsee_ice_candy_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | TECSEE Ice Candy Linear Switches | 0.95 | structured | TECSEE Ice Candy Linear Switches |
| brand* | TECSEE | 0.90 | structured | vendor: TECSEE |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: TECSEE Ice Candy Linear Switches Type: Switch Tags: clearance, |
| pinCount | 5 | 0.90 | regex | Polycarbonate - PCB mounted design (5 pins) - Bottom: 63.5g - Total Travel: |
| actuationForceG | **unknown** | – | default |  |
| price | 1 | 0.80 | structured | UHMWPE / UHMWPE: RM1.00 |
| soundProfile | **unknown** | – | default |  |
| ⚠ description | With a fully transparent housing, the TECSEE Ice Candy switch is made for the RGB fans out there who want their boards to shine with every color of the rainbow. | 0.50 | regex | With a fully transparent housing, the TECSEE Ice Candy switch is made for the RGB fans out there who want their boards to shine with every color of the rainbow. |

## ✅ ready · JWICK Red Linear Lubricated Switches

- key: `mecha:jwick-red-linear-lubricated-switches` · category: **switch** · [source](https://mecha.com.my/products/jwick-red-linear-lubricated-switches)
- becomes: `switch_jwk_jwick_red_linear_lubricated_switches`
- fits a valid build, e.g. `switch_jwk_jwick_red_linear_lubricated_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | JWICK Red Linear Lubricated Switches | 0.95 | structured | JWICK Red Linear Lubricated Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1.2 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: JWICK Red Linear Lubricated Switches Type: Switch |
| pinCount | 5 | 0.90 | regex | POM stem. - PCB mounted design (5 pins) - Pre-travel: 2.0mm - Total |
| actuationForceG | **unknown** | – | default |  |
| price | 1.2 | 0.80 | structured | Default Title / Default Title: RM1.20 |
| soundProfile | clacky | 0.90 | structured | Tags: sound_Clacky |
| ⚠ description | JWICK switches are the newest switches from manufacturer JWK, bringing you all that smoothness and quality - at a wallet-friendly price point! | 0.50 | regex | JWICK switches are the newest switches from manufacturer JWK, bringing you all that smoothness and quality - at a wallet-friendly price point! |

## ✅ ready · Emogogo Linear/Tactile Switches

- key: `mecha:emogogo-cream-01-linear-switches` · category: **switch** · [source](https://mecha.com.my/products/emogogo-cream-01-linear-switches)
- becomes: `switch_jwk_emogogo_linear_tactile_switches`
- fits a valid build, e.g. `switch_jwk_emogogo_linear_tactile_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Emogogo Linear/Tactile Switches | 0.95 | structured | Emogogo Linear/Tactile Switches |
| brand* | JWK | 0.90 | structured | vendor: JWK |
| beginnerFriendly* | true | 0.70 | rule | rule: mechanical switch at RM1 (≤ RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Emogogo Linear/Tactile Switches Type: Switch |
| pinCount | 5 | 0.90 | regex | blend. - PCB mounted design (5 pins) - 62g gold-plated progressive |
| actuationForceG | **unknown** | – | default |  |
| price | 1 | 0.80 | structured | Grey 01 (Tactile) / Grey 01 (Tactile): RM1.00 |
| soundProfile | creamy | 0.90 | structured | Tags: sound_Creamy |
| ⚠ description | Unlike what the name suggests, this is not a full POM switch! | 0.50 | regex | Unlike what the name suggests, this is not a full POM switch! |

## ✅ ready · Gateron Oil King Lubricated Linear Switches

- key: `mecha:gateron-oil-king-linear-lubricated-switches` · category: **switch** · [source](https://mecha.com.my/products/gateron-oil-king-linear-lubricated-switches)
- becomes: `switch_gateron_oil_king_lubricated_linear_switches`
- fits a valid build, e.g. `switch_gateron_oil_king_lubricated_linear_switches` + `case_gmk67_65_plastic` + `pcb_gmk67_65_hotswap` + `plate_gmk67_65_pc` + `keycap_unknown_pudding_oem_pbt` + `stab_gmk67_plate_mount`
- note: no pack size and the price is in the per-switch range: read as sold per switch

| field | value | confidence | from | source text |
|---|---|---|---|---|
| name* | Gateron Oil King Lubricated Linear Switches | 0.95 | structured | Gateron Oil King Lubricated Linear Switches |
| brand* | Gateron | 0.90 | structured | vendor: Gateron |
| beginnerFriendly* | false | 0.70 | rule | rule: mechanical switch at RM2.9 (> RM2) |
| switchTechnology* | mechanical | 0.85 | regex | Title: Gateron Oil King Lubricated Linear Switches Type: Switch Tags: sound_Deep, |
| pinCount | 5 | 0.90 | regex | from POM. - PCB-mounted design (5 pins) - Actuation: 55g - Bottom: |
| actuationForceG | 55 | 0.85 | regex | PCB-mounted design (5 pins) - Actuation: 55g - Bottom: 65g - 20mm spring |
| price | 2.9 | 0.80 | structured | Default Title / Default Title: RM2.90 |
| soundProfile | thocky | 0.90 | structured | Tags: sound_Deep |
| ⚠ description | Gateron is back with their smoothest switch affectionately named the Oil Kings. | 0.50 | regex | Gateron is back with their smoothest switch affectionately named the Oil Kings. |

## Auto-approved (HQ rule)

The independent blind pass agreed with the importer on every field, every page quote was verified, and the rule engine found a valid build. To undo one, set its `decision` back to `pending` in decisions.json.

- Frosted Red on Black Cherry Profile Keycap Set → `keycap_mecha_frosted_red_on_black_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/red-on-black-frosted-cherry-profile-keycap-set)
- Green and White Cherry Profile Keycap Set → `keycap_mecha_green_and_white_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/green-and-white-cherry-profile-keycap-set)
- Two Tone Grey Cherry Profile Keycap Set → `keycap_mecha_two_tone_grey_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/two-tone-grey-cherry-profile-keycap-set)
- Burgundy & Gold Cherry Profile Keycap Set → `keycap_mecha_burgundy_gold_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/burgundy-gold-cherry-profile-keycap-set)
- Parametric Pearlescent Metallic Cherry Profile Keycap Set → `keycap_mecha_parametric_pearlescent_metallic_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/parametric-pearlescent-metallic-cherry-profile-keycap-set)
- Frosted Sakura Blossom Cherry Profile Keycap Set → `keycap_mecha_frosted_sakura_blossom_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/sakura-blossom-forsted-cherry-profile-keycap-set)
- Sakura Blossom Pearlescent Metallic Cherry Profile Keycap Set → `keycap_mecha_sakura_blossom_pearlescent_metallic_cherry_profile_keycap_se` · [source](https://mecha.com.my/products/sakura-blossom-pearlescent-metallic-cherry-profile-keycap-set)
- Frosted Purple Cherry Profile Keycap Set → `keycap_mecha_frosted_purple_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/frosted-purple-cherry-profile-keycap-set)
- Frosted Pink Cherry Profile Keycap Set → `keycap_mecha_frosted_pink_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/frosted-pink-cherry-profile-keycap-set)
- Frosted Grey Cherry Profile Keycap Set → `keycap_mecha_frosted_grey_cherry_profile_keycap_set` · [source](https://mecha.com.my/products/frosted-grey-cherry-profile-keycap-set)
- Frosted Blue Cherry Profile Keycaps → `keycap_mecha_frosted_blue_cherry_profile_keycaps` · [source](https://mecha.com.my/products/frosted-blue-cherry-profile-keycaps)
- Kailh Deep Sea Silent Linear Lubricated Switches → `switch_kailh_deep_sea_silent_linear_lubricated_switches` · [source](https://mecha.com.my/products/kailh-deep-sea-silent-linear-lubricated-switches)
- Kailh Deep Sea Silent Pro Box Whale Tactile Switch → `switch_kailh_deep_sea_silent_pro_box_whale_tactile_switch` · [source](https://mecha.com.my/products/kailh-deep-sea-silent-pro-box-whale-linear-switch)
- HMX Hanami Dango V2 Lubricated Linear Switches → `switch_hmx_hanami_dango_v2_lubricated_linear_switches` · [source](https://mecha.com.my/products/hmx-hanami-dango-v2-lubricated-linear-switches)
- AKKO POM Brown Tactile Switch → `switch_akko_pom_brown_tactile_switch` · [source](https://mecha.com.my/products/akko-pom-brown-tactile-switch)
- AKKO CS Crystal Wine Red Linear Switch → `switch_akko_cs_crystal_wine_red_linear_switch` · [source](https://mecha.com.my/products/akko-cs-crystal-wine-red-linear-switch-1)
- JWICK T1 Tactile Lubricated Switches → `switch_jwk_jwick_t1_tactile_lubricated_switches` · [source](https://mecha.com.my/products/jwick-t1-lubricated-tactile-switches)
- Keygeek Y3 Linear Switch → `switch_keygeek_y3_linear_switch` · [source](https://mecha.com.my/products/keygeek-y3-linear-switch)
- Keychron K Pro Silent Red Linear Switch → `switch_keychron_k_pro_silent_red_linear_switch` · [source](https://mecha.com.my/products/keychron-k-pro-silent-red-linear-switch)
- Keychron K Pro Banana Tactile Switch → `switch_keychron_k_pro_banana_tactile_switch` · [source](https://mecha.com.my/products/keychron-k-pro-banana-tactile-switch)
- Keychron K Pro Silver Linear Switch → `switch_keychron_k_pro_silver_linear_switch` · [source](https://mecha.com.my/products/keychron-k-pro-silver-linear-switch)
- Keychron K Pro Yellow Linear Switch → `switch_keychron_k_pro_yellow_linear_switch` · [source](https://mecha.com.my/products/keychron-k-pro-yellow-linear-switch)
- Keychron K Pro Brown Tactile Switch → `switch_keychron_k_pro_brown_tactile_switch` · [source](https://mecha.com.my/products/keychron-k-pro-brown-tactile-switch)
- Keychron K Pro Red Linear Switch → `switch_keychron_k_pro_red_linear_switch` · [source](https://mecha.com.my/products/keychron-k-pro-red-linear-switch)
- Keygeek Y2 Linear Switch → `switch_keygeek_y2_linear_switch` · [source](https://mecha.com.my/products/keygeek-y2-linear-switch)
- MMD Princess V5 Ultra Thock Tactile Switch → `switch_mmd_princess_v5_ultra_thock_tactile_switch` · [source](https://mecha.com.my/products/mmd-princess-v5-ultra-thock-tactile-switch)
- WS Yellow Linear Switch → `switch_wuque_studios_ws_yellow_linear_switch` · [source](https://mecha.com.my/products/ws-yellow-linear-switch)
- WS Heavy Tactile → `switch_wuque_studios_ws_heavy_tactile` · [source](https://mecha.com.my/products/ws-heavy-tactile)
- BSUN Strawberry Cheesecake R2 Tactile Switch → `switch_bsun_strawberry_cheesecake_r2_tactile_switch` · [source](https://mecha.com.my/products/bsun-strawberry-cheesecake-r2-tactile-switch)
- Cherry MX2A-GUNW Unlubed Brown → `switch_cherry_mx_cherry_mx2a_gunw_unlubed_brown` · [source](https://mecha.com.my/products/cherry-mx2a-gunw-unlubed-brown)
- Cherry MX2A-1C6W Unlubed Black Linear Switch → `switch_cherry_mx_cherry_mx2a_1c6w_unlubed_black_linear_switch` · [source](https://mecha.com.my/products/cherry-mx2a-1c6w-unlubed-black)
- Owlab Ti HE Switch → `switch_owlab_ti_he_switch` · [source](https://mecha.com.my/products/owlab-ti-he-switch)
- Outemu Silent Peach V3 Silent Linear Switch → `switch_outemu_silent_peach_v3_silent_linear_switch` · [source](https://mecha.com.my/products/outemu-silent-peach-v3)
- Gateron Magnetic Jade Pro HE Switch → `switch_gateron_magnetic_jade_pro_he_switch` · [source](https://mecha.com.my/products/gateron-magnetic-jade-pro-switch)
- HMX Azure Linear Switch → `switch_hmx_azure_linear_switch` · [source](https://mecha.com.my/products/hmx-azure-switch)
- Zuoya GMK87 80%/TKL Custom Mechanical Keyboard → `case_zuoya_gmk87_80_tkl_custom`, `pcb_zuoya_gmk87_80_tkl_custom`, `plate_zuoya_gmk87_80_tkl_custom` · [source](https://mecha.com.my/products/zuoya-gmk87-80-tkl-custom-mechanical-keyboard-copy)
- Zuoya GMK81 75% Custom Mechanical Keyboard → `case_zuoya_gmk81_75_custom`, `pcb_zuoya_gmk81_75_custom`, `plate_zuoya_gmk81_75_custom` · [source](https://mecha.com.my/products/zuoya-gmk81-75-custom-mechanical-keyboard)
- Geon Raw ZERO Linear Switch → `switch_geonworks_geon_raw_zero_linear_switch` · [source](https://mecha.com.my/products/geon-raw-zero-linear-switch)
- BSUN Strawberry Cheesecake Tactile Switch → `switch_bsun_strawberry_cheesecake_tactile_switch` · [source](https://mecha.com.my/products/bsun-strawberry-cheesecake-tactile-switch)
- HMX Gravel Linear Switch → `switch_hmx_gravel_linear_switch` · [source](https://mecha.com.my/products/hmx-gravel-linear-switch)
- Cherry MX2A Purple Tactile Switch → `switch_cherry_mx_cherry_mx2a_purple_tactile_switch` · [source](https://mecha.com.my/products/cherry-mx2a-purple-tactile-switch)
- Gateron Smoothie Linear Switch → `switch_gateron_smoothie_linear_switch` · [source](https://mecha.com.my/products/gateron-smoothie-linear-switch)

