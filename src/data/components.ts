import {
  keyboardComponentCatalogSchema,
  type KeyboardComponent,
} from "@/lib/types";

const rawKeyboardComponents = [
  // ---------------------------------------------------------------------------
  // KIT 1 — GMK67 (65%, plastic case, PC plate, 5-pin hotswap, tri-mode, RM180)
  // ---------------------------------------------------------------------------
  {
    id: "case_gmk67_65_plastic",
    category: "case",
    name: "GMK67 65% Plastic Case",
    brand: "Zuoya",
    description:
      "Budget 65% plastic gasket case from the GMK67 kit; tri-mode wireless and beginner-friendly.",
    beginnerFriendly: true,
    layouts: ["65"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "creamy",
    price: 100,
    priceCurrency: "MYR",
    metadata: {
      kitId: "gmk67",
      kitLock: true,
      // Builder's personal pick — a genuine recommendation from experience,
      // not a popularity/sales statistic.
      builderPick: true,
      builderPickKind: "budget",
      builderPickNote:
        "The budget/beginner pick — a friendly, affordable 65% to learn on, hot-swap and tri-mode out of the box.",
    },
  },
  {
    id: "pcb_gmk67_65_hotswap",
    category: "pcb",
    name: "GMK67 65% Tri-Mode Hotswap PCB",
    brand: "Zuoya",
    description:
      "65% tri-mode PCB from the GMK67 kit with 5-pin MX hot-swap and south-facing RGB.",
    beginnerFriendly: true,
    layouts: ["65"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["plate_mount"],
    connection: "both",
    hotswap: true,
    price: 60,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk67", kitLock: true },
  },
  {
    id: "plate_gmk67_65_pc",
    category: "plate",
    name: "GMK67 65% Polycarbonate Plate",
    brand: "Zuoya",
    description:
      "65% PC gasket plate from the GMK67 kit for a softer, creamier typing feel.",
    beginnerFriendly: true,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "creamy",
    price: 20,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk67", kitLock: true, plateMaterial: "polycarbonate" },
  },

  // ---------------------------------------------------------------------------
  // KIT 2 — Lucky65 V3 (65%, CNC aluminum, FR4 plate, 5-pin hotswap, tri-mode, RM320)
  // ---------------------------------------------------------------------------
  {
    id: "case_lucky65_v3_65_aluminum",
    category: "case",
    name: "Lucky65 V3 65% CNC Aluminum Case",
    brand: "Weikav",
    description:
      "65% CNC aluminum gasket case from the Lucky65 V3 kit for a dense, thocky build.",
    beginnerFriendly: true,
    layouts: ["65"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "thocky",
    price: 200,
    priceCurrency: "MYR",
    metadata: {
      kitId: "lucky65_v3",
      kitLock: true,
      // Builder's top personal pick — a genuine recommendation, not a stat.
      builderPick: true,
      builderPickKind: "top",
      builderPickNote:
        "My top pick — a standout aluminium 65% that feels dense and thocky well above its price. The one I'd personally recommend for a first premium build.",
    },
  },
  {
    id: "pcb_lucky65_v3_65_hotswap",
    category: "pcb",
    name: "Lucky65 V3 65% Tri-Mode Hotswap PCB",
    brand: "Weikav",
    description:
      "65% tri-mode PCB from the Lucky65 V3 kit with 5-pin MX hot-swap and screw-in PCB stabs.",
    beginnerFriendly: true,
    layouts: ["65"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["screw_in"],
    connection: "both",
    hotswap: true,
    price: 80,
    priceCurrency: "MYR",
    metadata: { kitId: "lucky65_v3", kitLock: true },
  },
  {
    id: "plate_lucky65_v3_65_fr4",
    category: "plate",
    name: "Lucky65 V3 65% FR4 Plate",
    brand: "Weikav",
    description:
      "65% FR4 gasket plate from the Lucky65 V3 kit for a balanced, thocky sound signature.",
    beginnerFriendly: true,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "thocky",
    price: 40,
    priceCurrency: "MYR",
    metadata: { kitId: "lucky65_v3", kitLock: true, plateMaterial: "fr4" },
  },

  // ---------------------------------------------------------------------------
  // KIT 3 — Zuoya GMK104 (full-size, ABS plastic, PC plate, 5-pin hotswap, tri-mode, RM290)
  // ---------------------------------------------------------------------------
  {
    id: "case_gmk104_full_abs",
    category: "case",
    name: "Zuoya GMK104 Full-Size ABS Case",
    brand: "Zuoya",
    description:
      "Full-size ABS plastic gasket case from the GMK104 kit; tri-mode, creamy office build.",
    beginnerFriendly: true,
    layouts: ["full"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "creamy",
    price: 150,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk104", kitLock: true },
  },
  {
    id: "pcb_gmk104_full_hotswap",
    category: "pcb",
    name: "Zuoya GMK104 Full-Size Tri-Mode Hotswap PCB",
    brand: "Zuoya",
    description:
      "Full-size tri-mode PCB from the GMK104 kit with 5-pin MX hot-swap and plate-mount stabs.",
    beginnerFriendly: true,
    layouts: ["full"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["plate_mount"],
    connection: "both",
    hotswap: true,
    price: 100,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk104", kitLock: true },
  },
  {
    id: "plate_gmk104_full_pc",
    category: "plate",
    name: "Zuoya GMK104 Full-Size Polycarbonate Plate",
    brand: "Zuoya",
    description:
      "Full-size PC gasket plate from the GMK104 kit for a softer, creamier typing feel.",
    beginnerFriendly: true,
    layouts: ["full"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "creamy",
    price: 40,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk104", kitLock: true, plateMaterial: "polycarbonate" },
  },

  // ---------------------------------------------------------------------------
  // KIT 4 — Leobog Hi75 (75%, CNC aluminum w/ knob, PC plate, 5-pin hotswap, wired, RM390)
  // ---------------------------------------------------------------------------
  {
    id: "case_leobog_hi75_75_aluminum",
    category: "case",
    name: "Leobog Hi75 75% CNC Aluminum Case",
    brand: "Leobog",
    description:
      "75% CNC aluminum gasket case with knob from the Hi75 kit; dense, thocky wired build.",
    beginnerFriendly: true,
    layouts: ["75"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "thocky",
    price: 250,
    priceCurrency: "MYR",
    metadata: { kitId: "leobog_hi75", kitLock: true },
  },
  {
    id: "pcb_leobog_hi75_75_hotswap",
    category: "pcb",
    name: "Leobog Hi75 75% Wired Hotswap PCB",
    brand: "Leobog",
    description:
      "75% wired PCB from the Hi75 kit with 5-pin MX hot-swap and plate-mount stabs.",
    beginnerFriendly: true,
    layouts: ["75"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["plate_mount"],
    connection: "wired",
    hotswap: true,
    price: 100,
    priceCurrency: "MYR",
    metadata: { kitId: "leobog_hi75", kitLock: true },
  },
  {
    id: "plate_leobog_hi75_75_pc",
    category: "plate",
    name: "Leobog Hi75 75% Polycarbonate Plate",
    brand: "Leobog",
    description:
      "75% PC gasket plate from the Hi75 kit for a softer, creamier aluminum build.",
    beginnerFriendly: true,
    layouts: ["75"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "creamy",
    price: 40,
    priceCurrency: "MYR",
    metadata: { kitId: "leobog_hi75", kitLock: true, plateMaterial: "polycarbonate" },
  },

  // ---------------------------------------------------------------------------
  // KIT 5 — Zuoya GMK61 (60%, plastic case, PC plate, 5-pin hotswap, tri-mode, RM220)
  // ---------------------------------------------------------------------------
  {
    id: "case_gmk61_60_abs",
    category: "case",
    name: "Zuoya GMK61 60% ABS Case",
    brand: "Zuoya",
    description:
      "Minimalist 60% ABS plastic gasket case from the GMK61 kit; tri-mode, creamy compact build.",
    beginnerFriendly: true,
    layouts: ["60"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "creamy",
    price: 120,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk61", kitLock: true },
  },
  {
    id: "pcb_gmk61_60_hotswap",
    category: "pcb",
    name: "Zuoya GMK61 60% Tri-Mode Hotswap PCB",
    brand: "Zuoya",
    description:
      "60% tri-mode PCB from the GMK61 kit with 5-pin MX hot-swap and plate-mount stabs.",
    beginnerFriendly: true,
    layouts: ["60"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["plate_mount"],
    connection: "both",
    hotswap: true,
    price: 70,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk61", kitLock: true },
  },
  {
    id: "plate_gmk61_60_pc",
    category: "plate",
    name: "Zuoya GMK61 60% Polycarbonate Plate",
    brand: "Zuoya",
    description:
      "60% PC gasket plate from the GMK61 kit for a softer, creamier compact feel.",
    beginnerFriendly: true,
    layouts: ["60"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "creamy",
    price: 30,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk61", kitLock: true, plateMaterial: "polycarbonate" },
  },

  // ---------------------------------------------------------------------------
  // KIT-INCLUDED STABILIZERS (5) — bundled in each barebone kit, priced at 0
  // ---------------------------------------------------------------------------
  {
    id: "stab_gmk67_plate_mount",
    category: "stabilizer",
    name: "GMK67 Kit Plate-Mounted Stabilizers",
    brand: "Zuoya",
    description:
      "Plate-mounted stabilizers included with the GMK67 65% kit.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["65"],
    supportedSizes: ["2u", "6.25u"],
    price: 0,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk67", kitLock: true },
  },
  {
    id: "stab_lucky65_v3_screw_in",
    category: "stabilizer",
    name: "Lucky65 V3 Kit Screw-In Stabilizers",
    brand: "Weikav",
    description:
      "Screw-in PCB stabilizers included with the Lucky65 V3 65% kit.",
    beginnerFriendly: true,
    stabilizerType: "screw_in",
    supportedLayouts: ["65"],
    supportedSizes: ["2u", "6.25u"],
    price: 0,
    priceCurrency: "MYR",
    metadata: { kitId: "lucky65_v3", kitLock: true },
  },
  {
    id: "stab_gmk104_plate_mount",
    category: "stabilizer",
    name: "Zuoya GMK104 Kit Plate-Mounted Stabilizers",
    brand: "Zuoya",
    description:
      "Plate-mounted stabilizers included with the Zuoya GMK104 full-size kit; covers the numpad.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["full"],
    supportedSizes: ["2u", "6.25u"],
    price: 0,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk104", kitLock: true },
  },
  {
    id: "stab_leobog_hi75_plate_mount",
    category: "stabilizer",
    name: "Leobog Hi75 Kit Plate-Mounted Stabilizers",
    brand: "Leobog",
    description:
      "Plate-mounted stabilizers included with the Leobog Hi75 75% kit.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["75"],
    supportedSizes: ["2u", "6.25u"],
    price: 0,
    priceCurrency: "MYR",
    metadata: { kitId: "leobog_hi75", kitLock: true },
  },
  {
    id: "stab_gmk61_plate_mount",
    category: "stabilizer",
    name: "Zuoya GMK61 Kit Plate-Mounted Stabilizers",
    brand: "Zuoya",
    description:
      "Plate-mounted stabilizers included with the Zuoya GMK61 60% kit.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["60"],
    supportedSizes: ["2u", "6.25u"],
    price: 0,
    priceCurrency: "MYR",
    metadata: { kitId: "gmk61", kitLock: true },
  },

  // ---------------------------------------------------------------------------
  // SWITCHES (9)
  // ---------------------------------------------------------------------------
  {
    id: "switch_gateron_milky_yellow_pro",
    category: "switch",
    name: "Gateron Milky Yellow Pro Linear Switch",
    brand: "Gateron",
    description:
      "Budget 5-pin linear switch, 50g; the go-to thocky workhorse for value builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 50,
    soundProfile: "thocky",
    price: 0.9,
    priceCurrency: "MYR",
  },
  {
    id: "switch_gateron_oil_king",
    category: "switch",
    name: "Gateron Oil King Linear Switch",
    brand: "Gateron",
    description:
      "Premium 5-pin linear switch, 55g; deep, smooth thock for enthusiast builds.",
    beginnerFriendly: false,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 55,
    soundProfile: "thocky",
    price: 2.5,
    priceCurrency: "MYR",
  },
  {
    id: "switch_outemu_silent_peach_v2",
    category: "switch",
    name: "Outemu Silent Peach V2 Linear Switch",
    brand: "Outemu",
    description:
      "Silent 5-pin linear switch, 40g; quiet office and shared-room typing.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 40,
    soundProfile: "silent",
    price: 0.8,
    priceCurrency: "MYR",
  },
  {
    id: "switch_gazzew_boba_u4t",
    category: "switch",
    name: "Gazzew Boba U4T Tactile Switch",
    brand: "Gazzew",
    description:
      "Heavy 5-pin tactile switch, 62g; sharp bump with a deep thocky bottom-out.",
    beginnerFriendly: false,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 62,
    soundProfile: "thocky",
    price: 2.8,
    priceCurrency: "MYR",
  },
  {
    id: "switch_kailh_box_white_v2",
    category: "switch",
    name: "Kailh Box White V2 Clicky Switch",
    brand: "Kailh",
    description:
      "Loud 5-pin clicky switch, 45g; crisp typewriter click bar.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 45,
    soundProfile: "clacky",
    price: 1.5,
    priceCurrency: "MYR",
  },

  // ---------------------------------------------------------------------------
  // KEYCAPS (5)
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // KIT 6 — Weikav Star 80 (TKL, CNC aluminum, FR4 plate, hotswap, RM385)
  // ---------------------------------------------------------------------------
  {
    id: "case_weikav_star80_tkl_aluminum",
    category: "case",
    name: "Weikav Star 80 CNC Aluminum TKL Case",
    brand: "Weikav",
    description:
      "TKL CNC aluminum case derived from the Star 80 kit for premium typing-focused builds.",
    beginnerFriendly: false,
    layouts: ["tkl"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "thocky",
    price: 180,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
    metadata: {
      kitId: "weikav_star80",
      kitLock: true,
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
      observedAt: "2026-05-17",
      sourceNote:
        "Derived from a vendor-listed keyboard kit for prototype compatibility testing.",
      sourceType: "kit_derived",
      sourceVendor: "KeebsProject",
      observedKitName: "Weikav Star 80",
      observedCurrency: "MYR",
      observedKitPrice: 395,
    },
  },
  {
    id: "pcb_weikav_star80_tkl_hotswap",
    category: "pcb",
    name: "Weikav Star 80 TKL QMK/VIA Hotswap PCB",
    brand: "Weikav",
    description:
      "TKL tri-mode QMK/VIA PCB from the Star 80 kit with MX mechanical hot-swap support.",
    beginnerFriendly: false,
    layouts: ["tkl"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["pcb_mount"],
    connection: "both",
    hotswap: true,
    price: 115,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
    metadata: {
      kitId: "weikav_star80",
      kitLock: true,
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
      observedAt: "2026-05-17",
      sourceNote:
        "Derived from a vendor-listed keyboard kit for prototype compatibility testing.",
      sourceType: "kit_derived",
      sourceVendor: "KeebsProject",
      observedKitName: "Weikav Star 80",
      observedCurrency: "MYR",
      observedKitPrice: 395,
    },
  },
  {
    id: "plate_weikav_star80_tkl_fr4",
    category: "plate",
    name: "Weikav Star 80 TKL FR4 Plate",
    brand: "Weikav",
    description:
      "TKL FR4 gasket plate from the Star 80 kit for thocky typing-focused builds.",
    beginnerFriendly: false,
    layouts: ["tkl"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "thocky",
    price: 55,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
    metadata: {
      plateMaterial: "fr4",
      kitId: "weikav_star80",
      kitLock: true,
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
      observedAt: "2026-05-17",
      sourceNote:
        "Derived from a vendor-listed keyboard kit for prototype compatibility testing.",
      sourceType: "kit_derived",
      sourceVendor: "KeebsProject",
      observedKitName: "Weikav Star 80",
      observedCurrency: "MYR",
      observedKitPrice: 395,
    },
  },
  {
    id: "stab_weikav_star80_pcb_mount",
    category: "stabilizer",
    name: "Weikav Star 80 PCB-Mounted Stabilizers",
    brand: "Weikav",
    description:
      "PCB-mounted stabilizers derived from the Weikav Star 80 TKL kit.",
    beginnerFriendly: false,
    stabilizerType: "pcb_mount",
    supportedLayouts: ["tkl"],
    supportedSizes: ["2u", "6.25u", "7u"],
    price: 35,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
    metadata: {
      kitId: "weikav_star80",
      kitLock: true,
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
      observedAt: "2026-05-17",
      sourceNote:
        "Derived from a vendor-listed keyboard kit for prototype compatibility testing.",
      sourceType: "kit_derived",
      sourceVendor: "KeebsProject",
      observedKitName: "Weikav Star 80",
      observedCurrency: "MYR",
      observedKitPrice: 395,
    },
  },

  // ---------------------------------------------------------------------------
  // Aftermarket stabilizers (vendor-listed, Malaysia)
  // ---------------------------------------------------------------------------
  {
    id: "stab_c3_equalz_v3_screw_in",
    category: "stabilizer",
    name: "C3 Equalz Screw-In Stabilizers V3",
    brand: "C3 Equalz",
    description:
      "Screw-in stabilizer kit with 6.25u and 7u wire support.",
    beginnerFriendly: false,
    stabilizerType: "screw_in",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u", "7u"],
    price: 69,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/c-equalz-screw-in-stabilizers-v3",
    metadata: {
      sourceUrl: "https://mkb.gg/products/c-equalz-screw-in-stabilizers-v3",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 69,
      observedCurrency: "MYR",
    },
  },
  {
    id: "stab_flcmmk_fulin_v3_plate_mount",
    category: "stabilizer",
    name: "FLCMMK Fulin V3 Plate-Mounted Stabilizers",
    brand: "FLCMMK",
    description:
      "Plate-mounted stabilizer kit with extra 2u stabilizers for larger layout coverage.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["60", "65", "75", "tkl", "full"],
    supportedSizes: ["2u", "6.25u"],
    price: 33,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/flcmmk-fulin-v3-plate-mounted-stabilizers",
    metadata: {
      sourceUrl: "https://mkb.gg/products/flcmmk-fulin-v3-plate-mounted-stabilizers",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 33,
      observedCurrency: "MYR",
    },
  },
  {
    id: "stab_owlab_v3_screw_in",
    category: "stabilizer",
    name: "Owlab V3 Screw-In Stabilizers",
    brand: "Owlab",
    description:
      "Premium screw-in stabilizer kit for 60%, 65%, 75%, and TKL builds.",
    beginnerFriendly: false,
    stabilizerType: "screw_in",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u"],
    price: 79,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/owlab-v3-screw-in-stabilizers",
    metadata: {
      sourceUrl: "https://mkb.gg/products/owlab-v3-screw-in-stabilizers",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 79,
      observedCurrency: "MYR",
    },
  },
  {
    id: "stab_sp_star_plate_mount",
    category: "stabilizer",
    name: "SP-Star Plate-Mounted Stabilizers",
    brand: "SP-Star",
    description:
      "Budget plate-mounted stabilizer set with 6.25u support.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u"],
    price: 23,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/sp-star-plate-mounted-stabilizers",
    metadata: {
      sourceUrl: "https://mkb.gg/products/sp-star-plate-mounted-stabilizers",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 23,
      observedCurrency: "MYR",
    },
  },
  {
    id: "stab_tx_ap_clip_in_pcb_mount",
    category: "stabilizer",
    name: "TX AP Clip-In PCB-Mount Stabilizers",
    brand: "TX",
    description:
      "TX AP PCB-mount stabilizer variant with 6.25u and 7u support for 1.6 mm PCBs.",
    beginnerFriendly: false,
    stabilizerType: "pcb_mount",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u", "7u"],
    price: 43,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/tx-stabilizers-set",
    metadata: {
      sourceUrl: "https://mkb.gg/products/tx-stabilizers-set",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 43,
      observedCurrency: "MYR",
      notes: ["For 1.6 mm PCBs; 1.2 mm PCBs need shims."],
    },
  },

  // ---------------------------------------------------------------------------
  // Additional switches (vendor-listed, Malaysia)
  // ---------------------------------------------------------------------------
  {
    id: "switch_mmd_princess_linear_v3",
    category: "switch",
    name: "MMD Princess Linear V3 Switch",
    brand: "MMD",
    description:
      "Budget smooth linear mechanical switch for creamy and clacky builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 53,
    soundProfile: "creamy",
    price: 0.94,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/mmd-princess",
    metadata: {
      sourceUrl: "https://mkb.gg/products/mmd-princess",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 0.94,
      observedCurrency: "MYR",
      priceUnit: "per switch",
      // Builder's personal switch pick — a genuine recommendation, not a stat.
      builderPick: true,
      builderPickKind: "switch",
      builderPickNote:
        "My switch pick — a smooth budget linear that punches far above its price; creamy and satisfying, and a great first switch.",
    },
  },
  {
    id: "switch_akko_lavender_purple_v3_pro",
    category: "switch",
    name: "Akko Lavender Purple V3 Pro Tactile Switch",
    brand: "Akko",
    description:
      "5-pin mechanical tactile switch for neutral typing builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 45,
    soundProfile: "neutral",
    price: 1.05,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/akko-lavender-purple-v3-pro",
    metadata: {
      sourceUrl: "https://mkb.gg/products/akko-lavender-purple-v3-pro",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 1.05,
      observedCurrency: "MYR",
      priceUnit: "per switch",
    },
  },
  {
    id: "switch_akko_penguin_silent",
    category: "switch",
    name: "Akko Penguin Silent Tactile Switch",
    brand: "Akko",
    description:
      "Silent 5-pin mechanical tactile switch for quiet office keyboards.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 43,
    soundProfile: "silent",
    price: 1.9,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-new-akko-penguin-silent-switch-5pin-tactile-switches-for-mechanical-keyboard-keebs-project",
    metadata: {
      sourceUrl: "https://www.keebsproject.com/product/ready-stock-new-akko-penguin-silent-switch-5pin-tactile-switches-for-mechanical-keyboard-keebs-project",
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "KeebsProject",
      observedPrice: 1.9,
      observedCurrency: "MYR",
      priceUnit: "per switch",
    },
  },

  // ---------------------------------------------------------------------------
  // Keycaps (vendor-listed, Malaysia; keycaps carry no sound profile)
  // ---------------------------------------------------------------------------
  {
    id: "keycap_unknown_pudding_oem_pbt",
    category: "keycap",
    name: "Pudding OEM PBT Keycaps",
    brand: "Unknown",
    description:
      "Budget shine-through OEM profile PBT keycaps for RGB-friendly beginner builds.",
    beginnerFriendly: true,
    keycapProfile: "oem",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 45,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/pudding",
    metadata: {
      sourceUrl: "https://mkb.gg/products/pudding",
      swatch: ["#232326", "#F2F3F5", "#C9CCD2"],
      // #232326 L14 near-black, #F2F3F5 L96 white, #C9CCD2 L81 light grey.
      colour: ["black", "white", "grey"],
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 45,
      observedCurrency: "MYR",
    },
  },
  {
    id: "keycap_unknown_retro_9009_cherry_pbt",
    category: "keycap",
    name: "Retro 9009 PBT Cherry Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile PBT keycap set with broad 60%, 65%, 75%, TKL, and full-size compatibility.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 119,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-gmk-icon-retro-9009-keycaps-pbt-cherry-profile-all-layouts-keebsproject",
    metadata: {
      sourceUrl: "https://www.keebsproject.com/product/ready-stock-gmk-icon-retro-9009-keycaps-pbt-cherry-profile-all-layouts-keebsproject",
      swatch: ["#DFD6C2", "#7C9082", "#C67E70"],
      // #DFD6C2 H41 S31 cream-beige, #7C9082 H138 muted sage, #C67E70 H10
      // dusty red. "pastel" is the one tag here not forced by the measured
      // values — a judgement that this muted retro palette answers a "pastel"
      // request. Recorded as such in report/evidence/uat-fixes.md.
      colour: ["beige", "green", "red", "pastel"],
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "KeebsProject",
      observedPrice: 119,
      observedCurrency: "MYR",
      notes: [
        "Listing uses GMK-style naming; implementation brand is Unknown until manufacturer/authenticity is verified.",
      ],
    },
  },
  {
    id: "keycap_unknown_seasonic_xda_pbt",
    category: "keycap",
    name: "Seasonic Sea Themed XDA PBT Keycaps",
    brand: "Unknown",
    description:
      "Sea-themed XDA profile PBT dye-sub keycaps for maritime-themed builds.",
    beginnerFriendly: true,
    keycapProfile: "xda",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 99,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-seasonic-sea-themed-keycap-set-xda-profile-pbt-dye-sub-blue-keycaps-keebs-project",
    metadata: {
      sourceUrl: "https://www.keebsproject.com/product/ready-stock-seasonic-sea-themed-keycap-set-xda-profile-pbt-dye-sub-blue-keycaps-keebs-project",
      swatch: ["#1F5F8B", "#7FB6D9", "#F0E9D8"],
      // #1F5F8B H204 deep blue, #7FB6D9 H203 light blue, #F0E9D8 H43 cream.
      colour: ["blue", "beige"],
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "KeebsProject",
      observedPrice: 99,
      observedCurrency: "MYR",
    },
  },
  {
    id: "keycap_unknown_illusion_sky_blue_cherry_pbt",
    category: "keycap",
    name: "Illusion Sky Blue Cherry PBT Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile double-shot PBT keycap set with broad layout support for clean productivity builds.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 119,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-gmk-illusion-sky-blue-cherry-profile-doubleshot-pbt-keycaps",
    metadata: {
      sourceUrl: "https://www.keebsproject.com/product/ready-stock-gmk-illusion-sky-blue-cherry-profile-doubleshot-pbt-keycaps",
      swatch: ["#9CC3E5", "#4E7699", "#F4F6F8"],
      // #9CC3E5 H208 sky blue, #4E7699 H208 mid blue, #F4F6F8 L97 white.
      colour: ["blue", "white"],
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "KeebsProject",
      observedPrice: 119,
      observedCurrency: "MYR",
      notes: [
        "Listing uses GMK-style naming; implementation brand is Unknown until manufacturer/authenticity is verified.",
      ],
    },
  },
  {
    id: "keycap_unknown_gradient_cherry_shinethrough",
    category: "keycap",
    name: "Gradient Cherry Shine-Through Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile shine-through gradient keycap set for RGB-oriented compact and TKL builds.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 139,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/mkb-gradient-keycap",
    metadata: {
      sourceUrl: "https://mkb.gg/products/mkb-gradient-keycap",
      swatch: ["#3D6BDD", "#7A5AE0", "#B36AE2"],
      // #3D6BDD H223 blue, #7A5AE0 H254 blue-violet, #B36AE2 H277 purple —
      // the catalog's genuine answer to the tester's "purple and blue themed".
      colour: ["blue", "purple"],
      observedAt: "2026-05-17",
      sourceType: "vendor_listed",
      sourceVendor: "MKB.MY",
      observedPrice: 139,
      observedCurrency: "MYR",
      notes: [
        "MKB listing appears house/private-label; implementation brand is Unknown until manufacturer is confirmed.",
      ],
    },
  },
  // ---------------------------------------------------------------------------
  // GH60 OPEN ECOSYSTEM (12) — the one 60% form factor where case, PCB and plate
  // genuinely interchange across brands. Unlike the kit records above, these are
  // NOT kitLock'd: the whole point is that they mix freely with each other.
  //
  // Provenance: these are modelled from the public GH60 standard and from
  // widely-sold universal GH60 parts, not from a single vendor listing. Prices
  // are estimates for prototype budget maths — every record is marked
  // `sourceType: "modelled_estimate"` so it can never be mistaken for an
  // observed vendor price the way the MKB/KeebsProject records can.
  // ---------------------------------------------------------------------------
  {
    id: "case_gh60_universal_aluminum",
    category: "case",
    name: "GH60 CNC Aluminum Case",
    brand: "Generic GH60",
    description:
      "60% aluminum case built to the GH60 screw pattern, so any GH60-compatible PCB and plate will drop in. Stiff and bright next to a gasket build.",
    beginnerFriendly: false,
    layouts: ["60"],
    caseMountSupport: ["tray_mount"],
    soundProfile: "clacky",
    price: 180,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      formFactor: "gh60",
      notes: [
        "GH60 is a community standard, not a product: the screw pattern is shared by Poker/Pok3r, DZ60, XD60/XD64, GK61/GK64 and YD60MQ-class PCBs.",
        "Tray mount is stiffer than the gasket kits in this catalog, which is why the sound profile is tagged clacky rather than thocky.",
      ],
    },
  },
  {
    id: "pcb_gh60_universal_mx_hotswap",
    category: "pcb",
    name: "GH60 MX Hotswap PCB",
    brand: "Generic GH60",
    description:
      "Wired 60% hot-swap PCB on the GH60 standard. Takes 5-pin MX and optical switches and supports PCB-mount, screw-in or plate-mount stabilizers.",
    beginnerFriendly: false,
    layouts: ["60"],
    switchTechnologySupport: ["mechanical", "optical"],
    pcbMountSupport: ["tray_mount"],
    stabilizerTypeSupport: ["pcb_mount", "screw_in", "plate_mount"],
    connection: "wired",
    hotswap: true,
    price: 130,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      formFactor: "gh60",
    },
  },
  {
    id: "pcb_gh60_hall_effect_magnetic",
    category: "pcb",
    name: "GH60 Hall-Effect Magnetic PCB",
    brand: "Generic GH60",
    description:
      "Analog magnetic 60% PCB with adjustable actuation and rapid trigger. Accepts magnetic switches only — standard MX mechanical switches will not work in it.",
    beginnerFriendly: false,
    layouts: ["60"],
    switchTechnologySupport: ["hall_effect"],
    pcbMountSupport: ["tray_mount"],
    stabilizerTypeSupport: ["pcb_mount", "screw_in"],
    connection: "wired",
    hotswap: true,
    price: 420,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      formFactor: "gh60",
      notes: [
        "Modelled on Wooting-60HE-class analog modules, which fit universal 60% tray-mount (GH60) cases but with real caveats.",
        "Caveats worth surfacing to a user: the v2 module needs its foam sandwich pad to sit correctly, the USB-C port is on the LEFT side rather than centred, and no more than 6 case standoffs should match the tray pattern.",
        "This PCB deliberately supports hall_effect only. Pairing it with any mechanical switch in this catalog is a genuine incompatibility, and the rule engine should say so.",
      ],
    },
  },
  {
    id: "switch_gateron_ks37b_magnetic_jade",
    category: "switch",
    name: "Gateron KS-37B Magnetic Jade Linear Switch",
    brand: "Gateron",
    description:
      "Magnetic linear switch for hall-effect PCBs. Actuation depth is set in software rather than by the switch, which is the point of going analog.",
    beginnerFriendly: false,
    switchTechnology: "hall_effect",
    pinCount: 2,
    actuationForceG: 30,
    soundProfile: "neutral",
    price: 3.2,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      specBasis: "approximate",
      notes: [
        "Price is PER SWITCH, matching every other switch record in this catalog. Magnetic switches sell in sets, so a set price must be divided by the piece count before it goes in here.",
        "Sound profile is tagged neutral on purpose. Magnetic switches are chosen for actuation behaviour, not acoustics, and claiming a thocky/creamy character here would not be defensible.",
        "Will not work in any of the MX hotswap PCBs in this catalog — magnetic switches need a hall-effect PCB.",
      ],
    },
  },
  {
    id: "switch_lekker_l60_magnetic",
    category: "switch",
    name: "Lekker L60 Magnetic Linear Switch",
    brand: "Wooting",
    description:
      "Linear magnetic switch designed for analog hall-effect boards, with a heavier bottom-out than the Gateron magnetic jade.",
    beginnerFriendly: false,
    switchTechnology: "hall_effect",
    pinCount: 2,
    actuationForceG: 45,
    soundProfile: "neutral",
    price: 4.5,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      specBasis: "approximate",
      notes: [
        "Price is PER SWITCH, consistent with the rest of the catalog.",
        "Force figure is approximate — verify against the manufacturer spec before quoting it.",
      ],
    },
  },
  {
    id: "plate_gh60_brass",
    category: "plate",
    name: "GH60 Brass Plate",
    brand: "Generic GH60",
    description:
      "Dense brass 60% plate. The stiffest and most resonant option here — firm typing feel and a bright, ringing high-frequency signature.",
    beginnerFriendly: false,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "clacky",
    price: 95,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "brass",
      formFactor: "gh60",
      notes: [
        "Plate cutouts are the standard 14mm MX opening, which is why mechanical, optical and magnetic switch housings all fit.",
      ],
    },
  },
  {
    id: "plate_gh60_steel",
    category: "plate",
    name: "GH60 Steel Plate",
    brand: "Generic GH60",
    description:
      "Stiff steel 60% plate. Sharper and more pronounced than FR4 or POM, with almost no flex.",
    beginnerFriendly: false,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "clacky",
    price: 60,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "steel",
      formFactor: "gh60",
    },
  },
  {
    id: "plate_gh60_aluminum",
    category: "plate",
    name: "GH60 Aluminum Plate",
    brand: "Generic GH60",
    description:
      "Aluminum 60% plate. High stiffness reflects energy back into the switch instead of absorbing it, giving a sharp, clacky transient.",
    beginnerFriendly: false,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "clacky",
    price: 55,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "aluminum",
      formFactor: "gh60",
    },
  },
  {
    id: "plate_gh60_carbon_fiber",
    category: "plate",
    name: "GH60 Carbon Fibre Plate",
    brand: "Generic GH60",
    description:
      "Carbon fibre 60% plate. Light but very stiff — noticeably clacky, with a drier character than brass.",
    beginnerFriendly: false,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "clacky",
    price: 85,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "carbon_fiber",
      formFactor: "gh60",
    },
  },
  {
    id: "plate_gh60_fr4",
    category: "plate",
    name: "GH60 FR4 Plate",
    brand: "Generic GH60",
    description:
      "FR4 60% plate. The neutral middle ground — more stiffness than POM or PC, but still a pleasant amount of flex.",
    beginnerFriendly: true,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "neutral",
    price: 35,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "fr4",
      formFactor: "gh60",
    },
  },
  {
    id: "plate_gh60_pom",
    category: "plate",
    name: "GH60 POM Plate",
    brand: "Generic GH60",
    description:
      "POM 60% plate. Soft typing feel and a deep, rounded sound — the thockiest of the universal plate materials.",
    beginnerFriendly: true,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "thocky",
    price: 45,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "pom",
      formFactor: "gh60",
    },
  },
  {
    id: "plate_gh60_polycarbonate",
    category: "plate",
    name: "GH60 Polycarbonate Plate",
    brand: "Generic GH60",
    description:
      "Polycarbonate 60% plate. Flexible and cushioned, muting the high frequencies a stiff plate would emphasise.",
    beginnerFriendly: true,
    layouts: ["60"],
    plateMountSupport: ["tray_mount"],
    switchTechnologySupport: ["mechanical", "optical", "hall_effect"],
    soundProfile: "thocky",
    price: 40,
    priceCurrency: "MYR",
    metadata: {
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "polycarbonate",
      formFactor: "gh60",
    },
  },

  // ---------------------------------------------------------------------------
  // 65% ALTERNATE PLATES (6) — swappable material options for the two 65% kits.
  //
  // These ARE kitLock'd, and that is deliberate: 65% has no GH60-style universal
  // standard, so a Lucky65 plate does not fit a GMK67 and vice versa. Locking
  // each plate to its kitId lets a user change material within their own kit
  // while the existing kit_structural_mismatch rule blocks cross-kit nonsense.
  // No new rule code is needed for either behaviour.
  // ---------------------------------------------------------------------------
  {
    id: "plate_lucky65_v3_65_brass",
    category: "plate",
    name: "Lucky65 V3 65% Brass Plate",
    brand: "Weikav",
    description:
      "Brass swap plate for the Lucky65 V3. Adds mass and brightens the board considerably against the stock FR4.",
    beginnerFriendly: false,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "clacky",
    price: 110,
    priceCurrency: "MYR",
    metadata: {
      kitId: "lucky65_v3",
      kitLock: true,
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "brass",
    },
  },
  {
    id: "plate_lucky65_v3_65_aluminum",
    category: "plate",
    name: "Lucky65 V3 65% Aluminum Plate",
    brand: "Weikav",
    description:
      "Aluminum swap plate for the Lucky65 V3. Firmer than the stock FR4 without going as bright as brass.",
    beginnerFriendly: false,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "neutral",
    price: 75,
    priceCurrency: "MYR",
    metadata: {
      kitId: "lucky65_v3",
      kitLock: true,
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "aluminum",
      notes: [
        "Tagged neutral rather than clacky: in a gasket mount the case absorbs much of the stiffness a tray mount would transmit.",
      ],
    },
  },
  {
    id: "plate_lucky65_v3_65_pom",
    category: "plate",
    name: "Lucky65 V3 65% POM Plate",
    brand: "Weikav",
    description:
      "POM swap plate for the Lucky65 V3. Softens the typing feel and deepens the board past the stock FR4.",
    beginnerFriendly: true,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "thocky",
    price: 65,
    priceCurrency: "MYR",
    metadata: {
      kitId: "lucky65_v3",
      kitLock: true,
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "pom",
    },
  },
  {
    id: "plate_gmk67_65_brass",
    category: "plate",
    name: "GMK67 65% Brass Plate",
    brand: "Zuoya",
    description:
      "Brass swap plate for the GMK67. Adds weight and brightness to an otherwise soft plastic-cased board.",
    beginnerFriendly: false,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "clacky",
    price: 95,
    priceCurrency: "MYR",
    metadata: {
      kitId: "gmk67",
      kitLock: true,
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "brass",
    },
  },
  {
    id: "plate_gmk67_65_aluminum",
    category: "plate",
    name: "GMK67 65% Aluminum Plate",
    brand: "Zuoya",
    description:
      "Aluminum swap plate for the GMK67 — a firmer, more defined alternative to the stock polycarbonate.",
    beginnerFriendly: false,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "neutral",
    price: 65,
    priceCurrency: "MYR",
    metadata: {
      kitId: "gmk67",
      kitLock: true,
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "aluminum",
    },
  },
  {
    id: "plate_gmk67_65_pom",
    category: "plate",
    name: "GMK67 65% POM Plate",
    brand: "Zuoya",
    description:
      "POM swap plate for the GMK67. Deeper and softer again than the stock PC plate.",
    beginnerFriendly: true,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "thocky",
    price: 55,
    priceCurrency: "MYR",
    metadata: {
      kitId: "gmk67",
      kitLock: true,
      sourceType: "modelled_estimate",
      priceBasis: "estimated",
      plateMaterial: "pom",
    },
  },
] satisfies KeyboardComponent[];

export const keyboardComponents =
  keyboardComponentCatalogSchema.parse(rawKeyboardComponents);

export function getComponentById(id: string) {
  return keyboardComponents.find((component) => component.id === id);
}
