import {
  keyboardComponentCatalogSchema,
  type KeyboardComponent,
} from "@/lib/types";

const observedAt = "2026-05-17";

function kitDerivedMetadata({
  sourceVendor,
  sourceUrl,
  observedKitName,
  observedKitPrice,
  kitId,
  notes,
  officialSourceUrl,
}: {
  sourceVendor: string;
  sourceUrl: string;
  observedKitName: string;
  observedKitPrice?: number;
  kitId: string;
  notes?: string[];
  officialSourceUrl?: string;
}) {
  return {
    sourceType: "kit_derived",
    kitId,
    kitLock: true,
    sourceNote:
      "Derived from a vendor-listed keyboard kit for prototype compatibility testing.",
    sourceVendor,
    sourceUrl,
    officialSourceUrl,
    observedAt,
    observedKitName,
    observedKitPrice,
    observedCurrency: "MYR",
    notes,
  };
}

function vendorListedMetadata({
  sourceVendor,
  sourceUrl,
  observedPrice,
  priceUnit,
  notes,
}: {
  sourceVendor: string;
  sourceUrl: string;
  observedPrice?: number;
  priceUnit?: string;
  notes?: string[];
}) {
  return {
    sourceType: "vendor_listed",
    sourceVendor,
    sourceUrl,
    observedAt,
    observedPrice,
    observedCurrency: "MYR",
    priceUnit,
    notes,
  };
}

const keychronV2MaxMetadata = kitDerivedMetadata({
  sourceVendor: "MKB.MY",
  sourceUrl: "https://mkb.gg/products/keychron-v2-max",
  officialSourceUrl:
    "https://www.keychron.com/products/keychron-v2-max-qmk-via-wireless-custom-mechanical-keyboard",
  observedKitName: "Keychron V2 Max",
  observedKitPrice: 449,
  kitId: "keychron_v2_max",
  notes: [
    "MKB.MY listed assembled variants at research time; barebone variant should be rechecked before live seeding.",
    "Official Keychron page confirms gasket mount, PC plate, 3/5-pin hot-swap, and screw-in PCB stabilizers.",
  ],
});

const weikavStar80Metadata = kitDerivedMetadata({
  sourceVendor: "KeebsProject",
  sourceUrl:
    "https://www.keebsproject.com/product/ready-stock-star-80-wireless-tkl-87-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-keebs-project",
  observedKitName: "Weikav Star 80",
  observedKitPrice: 395,
  kitId: "weikav_star80",
});

const al75V2Metadata = kitDerivedMetadata({
  sourceVendor: "KeebsProject",
  sourceUrl:
    "https://www.keebsproject.com/product/ready-stock-al75-v2-wireless-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-gasket-customized",
  observedKitName: "AL75 V2",
  observedKitPrice: 339,
  kitId: "al75_v2",
  notes: [
    "Vendor page lists gasket mount, aluminum case, tri-mode connectivity, FR4/PC plate variants, and 3/5-pin hot-swap.",
    "Stabilizer type is not stated on the source page; screw-in compatibility should be manually verified before live catalog seeding.",
    "Manufacturer/brand is not verified from the source page; active catalog records use Unknown as the brand.",
  ],
});

const yunziiB87Metadata = kitDerivedMetadata({
  sourceVendor: "KeebsProject",
  sourceUrl:
    "https://www.keebsproject.com/product/ready-stock-yunzii-b87-80-viaqmk-full-kit-custom-mechanical-keyboard",
  observedKitName: "Yunzii B87",
  observedKitPrice: 319,
  kitId: "yunzii_b87",
  notes: [
    "Vendor page lists ABS frame, gasket structure, tri-mode connectivity, QMK/VIA, and 3/5-pin hot-swap.",
    "Plate material and stabilizer type need verification.",
  ],
});

const yunziiQl75Metadata = kitDerivedMetadata({
  sourceVendor: "KeebsProject",
  sourceUrl:
    "https://www.keebsproject.com/product/ready-stock-yunzii-ql75-75-typewriter-full-kit-custom-mechanical-keyboard",
  officialSourceUrl:
    "https://www.yunzii.com/en-ca/products/yunzii-ql75-vintage-retro-typewriter-qmk-via-mechanical-keyboard",
  observedKitName: "Yunzii QL75",
  observedKitPrice: 439,
  kitId: "yunzii_ql75",
  notes: [
    "Vendor and official pages list top mount, QMK/VIA, tri-mode connectivity, 75% layout, and 3/5-pin hot-swap.",
    "Case material, plate material, and stabilizer type need verification.",
  ],
});

const rawKeyboardComponents = [
  {
    id: "case_keychron_v2_max_65_abs",
    category: "case",
    name: "Keychron V2 Max 65% ABS Case",
    brand: "Keychron",
    description:
      "65% ABS case derived from the Malaysia-listed Keychron V2 Max for beginner-friendly wireless office and study builds.",
    beginnerFriendly: true,
    layouts: ["65"],
    caseMountSupport: ["gasket_mount"],
    price: 110,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/keychron-v2-max",
    metadata: keychronV2MaxMetadata,
  },
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
    metadata: weikavStar80Metadata,
  },
  {
    id: "case_al75_v2_aluminum",
    category: "case",
    name: "AL75 V2 CNC Aluminum 75% Case",
    brand: "Unknown",
    description:
      "75% CNC aluminum case from the AL75 V2 kit for compact aluminum wireless builds.",
    beginnerFriendly: true,
    layouts: ["75"],
    caseMountSupport: ["gasket_mount"],
    soundProfile: "clacky",
    price: 160,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-al75-v2-wireless-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-gasket-customized",
    metadata: al75V2Metadata,
  },
  {
    id: "case_yunzii_b87_abs_tkl",
    category: "case",
    name: "Yunzii B87 ABS TKL Case",
    brand: "Yunzii",
    description:
      "80% ABS case derived from the Yunzii B87 full kit for beginner-friendly TKL typing builds.",
    beginnerFriendly: true,
    layouts: ["tkl"],
    caseMountSupport: ["gasket_mount"],
    price: 85,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-yunzii-b87-80-viaqmk-full-kit-custom-mechanical-keyboard",
    metadata: yunziiB87Metadata,
  },
  {
    id: "case_yunzii_ql75_top_mount",
    category: "case",
    name: "Yunzii QL75 Typewriter 75% Case",
    brand: "Yunzii",
    description:
      "75% typewriter-style top-mounted case from the Yunzii QL75 for retro productivity builds.",
    beginnerFriendly: true,
    layouts: ["75"],
    caseMountSupport: ["top_mount"],
    price: 135,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-yunzii-ql75-75-typewriter-full-kit-custom-mechanical-keyboard",
    metadata: yunziiQl75Metadata,
  },
  {
    id: "pcb_keychron_v2_max_65_hotswap",
    category: "pcb",
    name: "Keychron V2 Max 65% Tri-Mode Hotswap PCB",
    brand: "Keychron",
    description:
      "65% QMK-capable tri-mode PCB from the V2 Max with south-facing RGB and 3/5-pin MX hot-swap support.",
    beginnerFriendly: true,
    layouts: ["65"],
    switchTechnologySupport: ["mechanical"],
    pcbMountSupport: ["gasket_mount"],
    stabilizerTypeSupport: ["screw_in"],
    connection: "both",
    hotswap: true,
    price: 125,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/keychron-v2-max",
    metadata: keychronV2MaxMetadata,
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
    metadata: weikavStar80Metadata,
  },
  {
    id: "plate_keychron_v2_max_65_pc",
    category: "plate",
    name: "Keychron V2 Max 65% Polycarbonate Plate",
    brand: "Keychron",
    description:
      "65% PC gasket plate from the Keychron V2 Max, useful for softer beginner-friendly creamy builds.",
    beginnerFriendly: true,
    layouts: ["65"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    price: 35,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/keychron-v2-max",
    metadata: keychronV2MaxMetadata,
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
    metadata: weikavStar80Metadata,
  },
  {
    id: "plate_al75_v2_fr4",
    category: "plate",
    name: "AL75 V2 75% FR4 Plate",
    brand: "Unknown",
    description:
      "75% FR4 gasket plate from the AL75 V2 kit for clacky aluminum builds.",
    beginnerFriendly: true,
    layouts: ["75"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    soundProfile: "clacky",
    price: 40,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-al75-v2-wireless-cnc-aluminum-case-hot-swap-rgb-gasket-mechanical-keyboard-kit-gasket-customized",
    metadata: al75V2Metadata,
  },
  {
    id: "plate_yunzii_b87_tkl_gasket",
    category: "plate",
    name: "Yunzii B87 TKL Gasket Plate",
    brand: "Yunzii",
    description:
      "TKL gasket plate from the Yunzii B87 full kit for typing builds; material needs verification.",
    beginnerFriendly: true,
    layouts: ["tkl"],
    plateMountSupport: ["gasket_mount"],
    switchTechnologySupport: ["mechanical"],
    price: 35,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-yunzii-b87-80-viaqmk-full-kit-custom-mechanical-keyboard",
    metadata: {
      ...yunziiB87Metadata,
      plateMaterial: "needs verification",
    },
  },
  {
    id: "plate_yunzii_ql75_top_mount",
    category: "plate",
    name: "Yunzii QL75 75% Top-Mount Plate",
    brand: "Yunzii",
    description:
      "75% top-mount plate from the Yunzii QL75; plate material needs verification before live catalog seeding.",
    beginnerFriendly: true,
    layouts: ["75"],
    plateMountSupport: ["top_mount"],
    switchTechnologySupport: ["mechanical"],
    price: 35,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-yunzii-ql75-75-typewriter-full-kit-custom-mechanical-keyboard",
    metadata: {
      ...yunziiQl75Metadata,
      plateMaterial: "needs verification",
    },
  },
  {
    id: "switch_gateron_milky_yellow_pro",
    category: "switch",
    name: "Gateron Milky Yellow Pro Linear Switch",
    brand: "Gateron",
    description:
      "Budget-friendly 5-pin mechanical linear switch from MKB.MY for creamy beginner builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 50,
    soundProfile: "creamy",
    price: 0.87,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/gateron-milky-yellow-pro",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/gateron-milky-yellow-pro",
      observedPrice: 0.87,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_gateron_oil_king",
    category: "switch",
    name: "Gateron Oil King Linear Switch",
    brand: "Gateron",
    description:
      "Premium 5-pin mechanical linear switch from MKB.MY for smoother thocky typing builds.",
    beginnerFriendly: false,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 55,
    soundProfile: "thocky",
    price: 2.9,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/gateron-oil-king",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/gateron-oil-king",
      observedPrice: 2.9,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_gateron_seasalt_smoothie",
    category: "switch",
    name: "Gateron Sea Salt Smoothie Linear Switch",
    brand: "Gateron",
    description:
      "Smooth mechanical linear switch listed by MKB.MY for creamy typing builds; detailed force specs need verification.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    soundProfile: "creamy",
    price: 1.5,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/collections/gateron",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/collections/gateron",
      observedPrice: 1.5,
      priceUnit: "per switch",
      notes: ["Exact actuation force needs product-page verification."],
    }),
  },
  {
    id: "switch_akko_cream_yellow_v3_pro",
    category: "switch",
    name: "Akko Cream Yellow V3 Pro Linear Switch",
    brand: "Akko",
    description:
      "Budget 5-pin mechanical linear switch for creamy or lightly clacky builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 50,
    soundProfile: "creamy",
    price: 1,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/akko-cream-yellow-v3-pro",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/akko-cream-yellow-v3-pro",
      observedPrice: 1,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_akko_lavender_purple_v3_pro",
    category: "switch",
    name: "Akko Lavender Purple V3 Pro Tactile Switch",
    brand: "Akko",
    description:
      "5-pin mechanical tactile switch from MKB.MY for neutral typing builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 45,
    soundProfile: "neutral",
    price: 1.05,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/akko-lavender-purple-v3-pro",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/akko-lavender-purple-v3-pro",
      observedPrice: 1.05,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_akko_penguin_silent",
    category: "switch",
    name: "Akko Penguin Silent Tactile Switch",
    brand: "Akko",
    description:
      "Silent 5-pin mechanical tactile switch from KeebsProject for quiet office keyboards.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 43,
    soundProfile: "silent",
    price: 1.9,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-new-akko-penguin-silent-switch-5pin-tactile-switches-for-mechanical-keyboard-keebs-project",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-new-akko-penguin-silent-switch-5pin-tactile-switches-for-mechanical-keyboard-keebs-project",
      observedPrice: 1.9,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_akko_creamy_cyan",
    category: "switch",
    name: "Akko Creamy Cyan Clicky Switch",
    brand: "Akko",
    description:
      "5-pin mechanical clicky switch from KeebsProject for clacky/clicky keyboard prompts.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 50,
    soundProfile: "clacky",
    price: 1.8,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-new-akko-creamy-cyan-switch-5-pin-clicky-switches-for-mechanical-keyboard-keebsproject",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-new-akko-creamy-cyan-switch-5-pin-clicky-switches-for-mechanical-keyboard-keebsproject",
      observedPrice: 1.8,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_mmd_holy_panda_v3",
    category: "switch",
    name: "MMD Holy Panda V3 Tactile Switch",
    brand: "MMD",
    description:
      "Budget tactile mechanical switch from MKB.MY for thocky typing builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 3,
    actuationForceG: 55,
    soundProfile: "thocky",
    price: 0.79,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/mmd-holy-panda",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/mmd-holy-panda",
      observedPrice: 0.79,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_mmd_princess_linear_v3",
    category: "switch",
    name: "MMD Princess Linear V3 Switch",
    brand: "MMD",
    description:
      "Budget smooth linear mechanical switch from MKB.MY for creamy and clacky builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 53,
    soundProfile: "creamy",
    price: 0.94,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/mmd-princess",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/mmd-princess",
      observedPrice: 0.94,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_ktt_kang_white_v4",
    category: "switch",
    name: "KTT Kang White V4 Linear Switch",
    brand: "KTT",
    description:
      "Budget 3-pin linear mechanical switch from KeebsProject for clacky or neutral builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 3,
    actuationForceG: 45,
    soundProfile: "clacky",
    price: 0.8,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-ktt-kang-white-v4-newest-linear-switch-3-pin-ready-stock-malaysia-for-mechanical-keyboard",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-ktt-kang-white-v4-newest-linear-switch-3-pin-ready-stock-malaysia-for-mechanical-keyboard",
      observedPrice: 0.8,
      priceUnit: "per switch",
    }),
  },
  {
    id: "switch_outemu_peach_silent_v2",
    category: "switch",
    name: "Outemu Peach Silent V2 Linear Switch",
    brand: "Outemu",
    description:
      "Silent 5-pin linear mechanical switch from KeebsProject for quiet office and shared-room builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    pinCount: 5,
    soundProfile: "silent",
    price: 1.5,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-outemu-peach-silent-v2-5pin-linear-switch-for-mechanical-keyboard",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-outemu-peach-silent-v2-5pin-linear-switch-for-mechanical-keyboard",
      observedPrice: 1.5,
      priceUnit: "per switch",
      notes: ["Actuation force needs verification."],
    }),
  },
  {
    id: "switch_outemu_ocean_blue_clicky",
    category: "switch",
    name: "Outemu Ocean Blue Clicky Switch",
    brand: "Outemu",
    description:
      "Budget clicky mechanical switch from KeebsProject for clacky starter builds.",
    beginnerFriendly: true,
    switchTechnology: "mechanical",
    soundProfile: "clacky",
    price: 1.2,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-outemu-ocean-blue-clicky-switches-switch-for-mechanical-or-gaming-keyboards-keebsproject",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-outemu-ocean-blue-clicky-switches-switch-for-mechanical-or-gaming-keyboards-keebsproject",
      observedPrice: 1.2,
      priceUnit: "per switch",
      notes: ["Pin count and force need verification."],
    }),
  },
  {
    id: "switch_everglide_wild_pansy_v2",
    category: "switch",
    name: "Everglide Wild Pansy V2 Tactile Switch",
    brand: "Everglide",
    description:
      "Premium 5-pin tactile mechanical switch from MKB.MY for smooth neutral typing builds.",
    beginnerFriendly: false,
    switchTechnology: "mechanical",
    pinCount: 5,
    actuationForceG: 40,
    soundProfile: "neutral",
    price: 2.1,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/everglide-wild-pansy",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/everglide-wild-pansy",
      observedPrice: 2.1,
      priceUnit: "per switch",
    }),
  },
  {
    id: "keycap_unknown_retro_9009_cherry_pbt",
    category: "keycap",
    name: "Retro 9009 PBT Cherry Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile PBT keycap set from KeebsProject with broad 60%, 65%, 75%, TKL, and full-size compatibility.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 119,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-gmk-icon-retro-9009-keycaps-pbt-cherry-profile-all-layouts-keebsproject",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-gmk-icon-retro-9009-keycaps-pbt-cherry-profile-all-layouts-keebsproject",
      observedPrice: 119,
      notes: [
        "Listing uses GMK-style naming; implementation brand is Unknown until manufacturer/authenticity is verified.",
      ],
    }),
  },
  {
    id: "keycap_unknown_illusion_sky_blue_cherry_pbt",
    category: "keycap",
    name: "Illusion Sky Blue Cherry PBT Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile double-shot PBT keycap set from KeebsProject with broad layout support for clean productivity builds.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 119,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-gmk-illusion-sky-blue-cherry-profile-doubleshot-pbt-keycaps",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-gmk-illusion-sky-blue-cherry-profile-doubleshot-pbt-keycaps",
      observedPrice: 119,
      notes: [
        "Listing uses GMK-style naming; implementation brand is Unknown until manufacturer/authenticity is verified.",
      ],
    }),
  },
  {
    id: "keycap_unknown_pudding_oem_pbt",
    category: "keycap",
    name: "Pudding OEM PBT Keycaps",
    brand: "Unknown",
    description:
      "Budget shine-through OEM profile PBT keycaps from MKB.MY for RGB-friendly beginner builds.",
    beginnerFriendly: true,
    keycapProfile: "oem",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 45,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/pudding",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/pudding",
      observedPrice: 45,
    }),
  },
  {
    id: "keycap_unknown_poker_pudding_oem_pbt_pc",
    category: "keycap",
    name: "Poker Pudding OEM PBT/PC Keycaps",
    brand: "Unknown",
    description:
      "OEM profile pudding keycap set from MKB.MY for translucent RGB-focused builds.",
    beginnerFriendly: true,
    keycapProfile: "oem",
    layoutSupport: ["60", "65", "75", "tkl"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 139,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/poker-pudding-keycap-set",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/poker-pudding-keycap-set",
      observedPrice: 139,
    }),
  },
  {
    id: "keycap_unknown_seasonic_xda_pbt",
    category: "keycap",
    name: "Seasonic Sea Themed XDA PBT Keycaps",
    brand: "Unknown",
    description:
      "Sea-themed XDA profile PBT dye-sub keycaps from KeebsProject for maritime-themed builds.",
    beginnerFriendly: true,
    keycapProfile: "xda",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 99,
    priceCurrency: "MYR",
    vendorUrl:
      "https://www.keebsproject.com/product/ready-stock-seasonic-sea-themed-keycap-set-xda-profile-pbt-dye-sub-blue-keycaps-keebs-project",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl:
        "https://www.keebsproject.com/product/ready-stock-seasonic-sea-themed-keycap-set-xda-profile-pbt-dye-sub-blue-keycaps-keebs-project",
      observedPrice: 99,
    }),
  },
  {
    id: "keycap_unknown_tarot_purple_moa",
    category: "keycap",
    name: "Tarot Purple MOA Keycaps",
    brand: "Unknown",
    description:
      "MOA profile keycap set from KeebsProject for playful full-kit and beginner builds; exact key count needs verification.",
    beginnerFriendly: true,
    keycapProfile: "moa",
    layoutSupport: ["60", "65", "75", "tkl"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 119,
    priceCurrency: "MYR",
    vendorUrl: "https://www.keebsproject.com/collection/keycaps",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl: "https://www.keebsproject.com/collection/keycaps",
      observedPrice: 119,
      notes: ["Exact product page, key count, and manufacturer need verification."],
    }),
  },
  {
    id: "keycap_unknown_gameboy_oem_pbt",
    category: "keycap",
    name: "Gameboy NGC Purple OEM PBT Keycaps",
    brand: "Unknown",
    description:
      "OEM profile PBT dye-sub keycaps from KeebsProject for retro-styled mechanical builds.",
    beginnerFriendly: true,
    keycapProfile: "oem",
    layoutSupport: ["60", "65", "75", "tkl"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 119,
    priceCurrency: "MYR",
    vendorUrl: "https://www.keebsproject.com/collection/keycaps",
    metadata: vendorListedMetadata({
      sourceVendor: "KeebsProject",
      sourceUrl: "https://www.keebsproject.com/collection/keycaps",
      observedPrice: 119,
      notes: ["Exact product page, key count, and manufacturer need verification."],
    }),
  },
  {
    id: "keycap_unknown_gradient_cherry_shinethrough",
    category: "keycap",
    name: "Gradient Cherry Shine-Through Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile shine-through gradient keycap set from MKB.MY for RGB-oriented compact and TKL builds.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl", "full"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 139,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/mkb-gradient-keycap",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/mkb-gradient-keycap",
      observedPrice: 139,
      notes: [
        "MKB listing appears house/private-label; implementation brand is Unknown until manufacturer is confirmed.",
      ],
    }),
  },
  {
    id: "keycap_unknown_standard_white_jp_cherry",
    category: "keycap",
    name: "Standard White JP Cherry Keycaps",
    brand: "Unknown",
    description:
      "Neutral white JP-style Cherry profile keycap candidate from MKB.MY for office and study builds; material needs verification.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 99,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/collections/keycaps",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/collections/keycaps",
      observedPrice: 99,
      notes: ["Material, exact key count, and manufacturer need verification."],
    }),
  },
  {
    id: "keycap_unknown_valkyrie_cherry_pbt",
    category: "keycap",
    name: "Valkyrie Cherry PBT Keycaps",
    brand: "Unknown",
    description:
      "Cherry profile PBT keycap set from MKB.MY for premium visual builds; manufacturer needs verification.",
    beginnerFriendly: true,
    keycapProfile: "cherry",
    layoutSupport: ["60", "65", "75", "tkl"],
    compatibleSwitchTechnologies: ["mechanical", "hall_effect"],
    price: 129,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/mkb-valkyrie",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/mkb-valkyrie",
      observedPrice: 129,
      notes: [
        "MKB listing appears house/private-label; implementation brand is Unknown until manufacturer is confirmed.",
      ],
    }),
  },
  {
    id: "stab_keychron_v2_max_screw_in",
    category: "stabilizer",
    name: "Keychron V2 Max Screw-In PCB Stabilizers",
    brand: "Keychron",
    description:
      "Screw-in PCB stabilizers derived from the Keychron V2 Max for 65% layouts.",
    beginnerFriendly: true,
    stabilizerType: "screw_in",
    supportedLayouts: ["65"],
    supportedSizes: ["2u", "6.25u"],
    price: 35,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/keychron-v2-max",
    metadata: keychronV2MaxMetadata,
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
    metadata: weikavStar80Metadata,
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
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/tx-stabilizers-set",
      observedPrice: 43,
      notes: ["For 1.6 mm PCBs; 1.2 mm PCBs need shims."],
    }),
  },
  {
    id: "stab_c3_equalz_v3_screw_in",
    category: "stabilizer",
    name: "C3 Equalz Screw-In Stabilizers V3",
    brand: "C3 Equalz",
    description:
      "Screw-in stabilizer kit from MKB.MY with 6.25u and 7u wire support.",
    beginnerFriendly: false,
    stabilizerType: "screw_in",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u", "7u"],
    price: 69,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/c-equalz-screw-in-stabilizers-v3",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/c-equalz-screw-in-stabilizers-v3",
      observedPrice: 69,
    }),
  },
  {
    id: "stab_owlab_v3_screw_in",
    category: "stabilizer",
    name: "Owlab V3 Screw-In Stabilizers",
    brand: "Owlab",
    description:
      "Premium screw-in stabilizer kit from MKB.MY for 60%, 65%, 75%, and TKL builds.",
    beginnerFriendly: false,
    stabilizerType: "screw_in",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u"],
    price: 79,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/owlab-v3-screw-in-stabilizers",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/owlab-v3-screw-in-stabilizers",
      observedPrice: 79,
    }),
  },
  {
    id: "stab_sp_star_plate_mount",
    category: "stabilizer",
    name: "SP-Star Plate-Mounted Stabilizers",
    brand: "SP-Star",
    description:
      "Budget plate-mounted stabilizer set from MKB.MY with 6.25u support.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["60", "65", "75", "tkl"],
    supportedSizes: ["2u", "6.25u"],
    price: 23,
    priceCurrency: "MYR",
    vendorUrl: "https://mkb.gg/products/sp-star-plate-mounted-stabilizers",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl: "https://mkb.gg/products/sp-star-plate-mounted-stabilizers",
      observedPrice: 23,
    }),
  },
  {
    id: "stab_flcmmk_fulin_v3_plate_mount",
    category: "stabilizer",
    name: "FLCMMK Fulin V3 Plate-Mounted Stabilizers",
    brand: "FLCMMK",
    description:
      "Plate-mounted stabilizer kit from MKB.MY with extra 2u stabilizers for larger layout coverage.",
    beginnerFriendly: true,
    stabilizerType: "plate_mount",
    supportedLayouts: ["60", "65", "75", "tkl", "full"],
    supportedSizes: ["2u", "6.25u"],
    price: 33,
    priceCurrency: "MYR",
    vendorUrl:
      "https://mkb.gg/products/flcmmk-fulin-v3-plate-mounted-stabilizers",
    metadata: vendorListedMetadata({
      sourceVendor: "MKB.MY",
      sourceUrl:
        "https://mkb.gg/products/flcmmk-fulin-v3-plate-mounted-stabilizers",
      observedPrice: 33,
    }),
  },
] satisfies KeyboardComponent[];

export const keyboardComponents =
  keyboardComponentCatalogSchema.parse(rawKeyboardComponents);

export function getComponentById(id: string) {
  return keyboardComponents.find((component) => component.id === id);
}
