import { z } from "zod";

export const componentCategorySchema = z.enum([
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
]);

export const keyboardLayoutSchema = z.enum(["60", "65", "75", "tkl", "full"]);

export const switchTechnologySchema = z.enum([
  "mechanical",
  "optical",
  "hall_effect",
  "topre",
]);

export const mountStyleSchema = z.enum([
  "tray_mount",
  "top_mount",
  "gasket_mount",
  "o_ring_mount",
]);

export const keycapProfileSchema = z.enum([
  "cherry",
  "oem",
  "xda",
  "sa",
  "low_profile",
  "topre",
]);

export const stabilizerTypeSchema = z.enum([
  "plate_mount",
  "pcb_mount",
  "screw_in",
]);

export const stabilizerSizeSchema = z.enum(["2u", "6.25u", "7u"]);

export const connectionSchema = z.enum(["wired", "wireless", "both"]);

export const currencyCodeSchema = z.enum(["MYR", "USD"]);

export const soundProfileSchema = z.enum([
  "thocky",
  "creamy",
  "clacky",
  "silent",
  "neutral",
]);

const optionalUrlSchema = z.string().url().optional();

const baseComponentSchema = z.object({
  id: z.string().min(1),
  category: componentCategorySchema,
  name: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().min(1).optional(),
  beginnerFriendly: z.boolean(),
  price: z.number().nonnegative().optional(),
  priceCurrency: currencyCodeSchema.optional(),
  vendorUrl: optionalUrlSchema,
  imageUrl: optionalUrlSchema,
  soundUrl: optionalUrlSchema,
  soundProfile: soundProfileSchema.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const caseComponentSchema = baseComponentSchema.extend({
  category: z.literal("case"),
  layouts: z.array(keyboardLayoutSchema).min(1),
  caseMountSupport: z.array(mountStyleSchema).min(1),
});

export const pcbComponentSchema = baseComponentSchema.extend({
  category: z.literal("pcb"),
  layouts: z.array(keyboardLayoutSchema).min(1),
  switchTechnologySupport: z.array(switchTechnologySchema).min(1),
  pcbMountSupport: z.array(mountStyleSchema).min(1),
  stabilizerTypeSupport: z.array(stabilizerTypeSchema).min(1),
  connection: connectionSchema,
  hotswap: z.boolean(),
});

export const plateComponentSchema = baseComponentSchema.extend({
  category: z.literal("plate"),
  layouts: z.array(keyboardLayoutSchema).min(1),
  plateMountSupport: z.array(mountStyleSchema).min(1),
  switchTechnologySupport: z.array(switchTechnologySchema).min(1),
});

export const switchComponentSchema = baseComponentSchema.extend({
  category: z.literal("switch"),
  switchTechnology: switchTechnologySchema,
  pinCount: z.number().int().positive().optional(),
  actuationForceG: z.number().positive().optional(),
});

export const keycapComponentSchema = baseComponentSchema.extend({
  category: z.literal("keycap"),
  keycapProfile: keycapProfileSchema,
  layoutSupport: z.array(keyboardLayoutSchema).min(1),
  compatibleSwitchTechnologies: z.array(switchTechnologySchema).min(1),
});

export const stabilizerComponentSchema = baseComponentSchema.extend({
  category: z.literal("stabilizer"),
  stabilizerType: stabilizerTypeSchema,
  supportedLayouts: z.array(keyboardLayoutSchema).min(1),
  supportedSizes: z.array(stabilizerSizeSchema).min(1),
});

export const keyboardComponentSchema = z.discriminatedUnion("category", [
  caseComponentSchema,
  pcbComponentSchema,
  plateComponentSchema,
  switchComponentSchema,
  keycapComponentSchema,
  stabilizerComponentSchema,
]);

export const componentIdSelectionSchema = z
  .object({
    case: z.string().min(1).optional(),
    pcb: z.string().min(1).optional(),
    plate: z.string().min(1).optional(),
    switch: z.string().min(1).optional(),
    keycap: z.string().min(1).optional(),
    stabilizer: z.string().min(1).optional(),
  })
  .strict();

export const buildPreferencesSchema = z
  .object({
    layout: keyboardLayoutSchema.optional(),
    soundProfile: soundProfileSchema.optional(),
    beginnerFriendly: z.boolean().optional(),
    maxPrice: z.number().nonnegative().optional(),
  })
  .strict();

export const keyboardBuildSelectionSchema = z
  .object({
    name: z.string().min(1).optional(),
    componentIds: componentIdSelectionSchema,
    preferences: buildPreferencesSchema.optional(),
  })
  .strict();

export const compatibilitySeveritySchema = z.enum(["error", "warning", "info"]);

export const compatibilityIssueSchema = z.object({
  code: z.string().min(1),
  severity: compatibilitySeveritySchema,
  message: z.string().min(1),
  affectedCategories: z.array(componentCategorySchema),
  affectedComponentIds: z.array(z.string()),
});

export const keyboardComponentCatalogSchema = z.array(keyboardComponentSchema);

export type ComponentCategory = z.infer<typeof componentCategorySchema>;
export type KeyboardLayout = z.infer<typeof keyboardLayoutSchema>;
export type SwitchTechnology = z.infer<typeof switchTechnologySchema>;
export type MountStyle = z.infer<typeof mountStyleSchema>;
export type KeycapProfile = z.infer<typeof keycapProfileSchema>;
export type StabilizerType = z.infer<typeof stabilizerTypeSchema>;
export type StabilizerSize = z.infer<typeof stabilizerSizeSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;
export type SoundProfile = z.infer<typeof soundProfileSchema>;

export type CaseComponent = z.infer<typeof caseComponentSchema>;
export type PcbComponent = z.infer<typeof pcbComponentSchema>;
export type PlateComponent = z.infer<typeof plateComponentSchema>;
export type SwitchComponent = z.infer<typeof switchComponentSchema>;
export type KeycapComponent = z.infer<typeof keycapComponentSchema>;
export type StabilizerComponent = z.infer<typeof stabilizerComponentSchema>;
export type KeyboardComponent = z.infer<typeof keyboardComponentSchema>;
export type ComponentIdSelection = z.infer<typeof componentIdSelectionSchema>;
export type BuildPreferences = z.infer<typeof buildPreferencesSchema>;
export type KeyboardBuildSelection = z.infer<typeof keyboardBuildSelectionSchema>;
export type CompatibilitySeverity = z.infer<typeof compatibilitySeveritySchema>;
export type CompatibilityIssue = z.infer<typeof compatibilityIssueSchema>;

export type SelectedKeyboardComponents = Partial<{
  case: CaseComponent;
  pcb: PcbComponent;
  plate: PlateComponent;
  switch: SwitchComponent;
  keycap: KeycapComponent;
  stabilizer: StabilizerComponent;
}>;

export type CompatibilityResult = {
  isValid: boolean;
  errors: CompatibilityIssue[];
  warnings: CompatibilityIssue[];
  issues: CompatibilityIssue[];
  explanations: string[];
  selectedComponents: SelectedKeyboardComponents;
};

export const requiredComponentCategories = [
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
] as const satisfies readonly ComponentCategory[];
