import { AlertCircle, CheckCircle2, Keyboard, ShieldCheck } from "lucide-react";

import type {
  ComponentCategory,
  CompatibilityResult,
  CurrencyCode,
  KeyboardComponent,
} from "@/lib/types";

export type BuildPreviewComponents = Partial<
  Record<ComponentCategory, KeyboardComponent>
>;

type BuildPreviewProps = {
  compact?: boolean;
  components?: BuildPreviewComponents | null;
  estimatedPrice?: number | null;
  estimatedPriceCurrency?: CurrencyCode | null;
  showDetails?: boolean;
  title?: string;
  validation?: CompatibilityResult | null;
};

type PreviewLayout = "65" | "tkl" | "compact";
type KeySpec = {
  label: string;
  tone?: "accent" | "modifier";
  unit?: number;
};

const requiredPreviewCategories: ComponentCategory[] = [
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
];

export function BuildPreview({
  compact = false,
  components,
  estimatedPrice,
  estimatedPriceCurrency,
  showDetails = true,
  title = "Build preview",
  validation,
}: BuildPreviewProps) {
  const selectedComponents = components ?? {};
  const hasAnyComponent = requiredPreviewCategories.some(
    (category) => selectedComponents[category],
  );

  if (!hasAnyComponent) {
    return (
      <section
        aria-label="2D build preview"
        className="overflow-hidden rounded-3xl border border-dashed border-[#c2c7cf] bg-[#fffffe] p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-[#D8EEFE] text-[#094067]">
            <Keyboard className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[#071e29]">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-[#42474E]">
              Build preview appears after a recommendation or manual selection.
            </p>
          </div>
        </div>
        <KeyboardSchematic
          caseTone="neutral"
          compact={compact}
          keycapTone="ghost"
          layout="compact"
          soundTone="neutral"
        />
      </section>
    );
  }

  const layout = resolvePreviewLayout(selectedComponents);
  const layoutLabel = formatLayoutLabel(layout.layout);
  const soundProfile = selectedComponents.switch?.soundProfile;
  const validationLabel = getValidationLabel(selectedComponents, validation);
  const caseTone = inferCaseTone(selectedComponents.case);
  const keycapTone = inferKeycapTone(selectedComponents.keycap);
  const soundTone = getSoundTone(soundProfile);
  const detailRows = [
    ["Layout", layoutLabel],
    ["Case", selectedComponents.case?.name ?? "Not selected"],
    ["Switch", selectedComponents.switch?.name ?? "Not selected"],
    ["Keycaps", selectedComponents.keycap?.name ?? "Not selected"],
    ["Sound profile", soundProfile ?? "Not specified"],
    ["Validation", validationLabel],
  ];
  const priceLabel =
    estimatedPrice !== null &&
    estimatedPrice !== undefined &&
    estimatedPriceCurrency
      ? formatMoney(estimatedPrice, estimatedPriceCurrency)
      : null;

  if (priceLabel) {
    detailRows.push(["Estimated price", priceLabel]);
  }

  return (
    <section
      aria-label="2D build preview"
      className={`overflow-hidden rounded-3xl border border-[#c2c7cf] bg-[#fffffe] shadow-sm ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F6C7B]">
            Visual build preview
          </p>
          <h2 className="mt-1 text-base font-bold text-[#071e29]">{title}</h2>
        </div>
        <ValidationBadge label={validationLabel} />
      </div>

      <KeyboardSchematic
        caseTone={caseTone}
        compact={compact}
        keycapTone={keycapTone}
        layout={layout.layout}
        soundTone={soundTone}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c2c7cf] bg-[#f5faff] px-2.5 py-1 text-[11px] font-bold text-[#094067]">
          <Keyboard className="h-3.5 w-3.5" aria-hidden />
          {layoutLabel}
        </span>
        {layout.approximate ? (
          <span className="rounded-full border border-[#c2c7cf] bg-[#fffffe] px-2.5 py-1 text-[11px] font-bold text-[#5F6C7B]">
            Preview approximate
          </span>
        ) : null}
        {soundProfile ? (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${soundBadgeClass(soundTone)}`}>
            {soundProfile} sound
          </span>
        ) : null}
      </div>

      {showDetails ? (
        <dl
          className={`mt-4 grid gap-3 ${
            compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"
          }`}
        >
          {detailRows.map(([label, value]) => (
            <div className="min-w-0" key={label}>
              <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5F6C7B]">
                {label}
              </dt>
              <dd className="mt-1 truncate text-sm font-semibold text-[#071e29]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function KeyboardSchematic({
  caseTone,
  compact,
  keycapTone,
  layout,
  soundTone,
}: {
  caseTone: "aluminum" | "neutral" | "plastic";
  compact: boolean;
  keycapTone: "blue" | "dark" | "ghost" | "light" | "neutral" | "warm";
  layout: PreviewLayout;
  soundTone: "bright" | "deep" | "muted" | "neutral" | "warm";
}) {
  const rows = getPreviewRows(layout);

  return (
    <div
      aria-hidden
      className={`mt-4 rounded-[24px] border p-3 ${caseFrameClass(caseTone)} ${
        compact ? "sm:p-3" : "sm:p-4"
      }`}
    >
      <div className={`rounded-[18px] border px-2 py-3 ${plateClass(soundTone)}`}>
        <div className="space-y-1.5">
          {rows.map((row, rowIndex) => (
            <div className="flex min-w-0 gap-1.5" key={`${layout}-${rowIndex}`}>
              {row.map((key, keyIndex) => (
                <span
                  className={`flex min-w-0 items-center justify-center rounded-md border px-1 text-center font-bold leading-none shadow-sm ${
                    compact ? "h-6 text-[8px]" : "h-7 text-[9px] sm:h-8 sm:text-[10px]"
                  } ${keycapClass(keycapTone, key.tone)}`}
                  key={`${rowIndex}-${keyIndex}-${key.label}`}
                  style={{
                    flexBasis: 0,
                    flexGrow: key.unit ?? 1,
                  }}
                >
                  <span className="truncate">{key.label}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ValidationBadge({ label }: { label: string }) {
  const isValidated = label.startsWith("Validated");
  const isIncomplete = label === "Needs complete selection";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
        isValidated
          ? "border-[#2F8F46]/30 bg-[#e8f6ed] text-[#2F8F46]"
          : isIncomplete
            ? "border-[#c2c7cf] bg-[#f5faff] text-[#5F6C7B]"
            : "border-[#BA1A1A]/20 bg-[#fff5f5] text-[#BA1A1A]"
      }`}
    >
      {isValidated ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : isIncomplete ? (
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}

function resolvePreviewLayout(components: BuildPreviewComponents): {
  approximate: boolean;
  layout: PreviewLayout;
} {
  const layout =
    components.case?.category === "case"
      ? components.case.layouts[0]
      : components.pcb?.category === "pcb"
        ? components.pcb.layouts[0]
        : components.plate?.category === "plate"
          ? components.plate.layouts[0]
          : undefined;

  if (layout === "65" || layout === "tkl") {
    return { approximate: false, layout };
  }

  return { approximate: layout !== undefined, layout: "compact" };
}

function getPreviewRows(layout: PreviewLayout): KeySpec[][] {
  if (layout === "tkl") {
    return [
      keys(["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "Prt", "Del"]),
      keys(["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Home"]),
      keys(["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Enter"]),
      keys(["Shift", "Z", "X", "C", "V", "B", "N", "M", "Up", "Shift"]),
      [
        key("Ctrl", 1, "modifier"),
        key("Win", 1, "modifier"),
        key("Alt", 1, "modifier"),
        key("Space", 4.8, "accent"),
        key("Alt", 1, "modifier"),
        key("Fn", 1, "modifier"),
        key("Left", 1),
        key("Down", 1),
        key("Right", 1),
      ],
    ];
  }

  if (layout === "65") {
    return [
      keys(["Esc", "1", "2", "3", "4", "5", "6", "7", "8", "Bksp"]),
      keys(["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "Del"]),
      keys(["Caps", "A", "S", "D", "F", "G", "H", "J", "Enter"]),
      keys(["Shift", "Z", "X", "C", "V", "B", "N", "Up", "Shift"]),
      [
        key("Ctrl", 1, "modifier"),
        key("Alt", 1, "modifier"),
        key("Space", 4, "accent"),
        key("Fn", 1, "modifier"),
        key("Left", 1),
        key("Down", 1),
        key("Right", 1),
      ],
    ];
  }

  return [
    keys(["Esc", "1", "2", "3", "4", "5", "6", "Bksp"]),
    keys(["Tab", "Q", "W", "E", "R", "T", "Y"]),
    keys(["Caps", "A", "S", "D", "F", "G", "Enter"]),
    keys(["Shift", "Z", "X", "C", "V", "B"]),
    [key("Ctrl", 1, "modifier"), key("Alt", 1, "modifier"), key("Space", 3.5, "accent"), key("Fn", 1, "modifier")],
  ];
}

function keys(labels: string[]) {
  return labels.map((label) =>
    key(
      label,
      label === "Space" ? 4 : ["Shift", "Caps", "Tab", "Enter", "Bksp"].includes(label) ? 1.35 : 1,
      ["Shift", "Caps", "Tab", "Ctrl", "Alt", "Fn", "Win"].includes(label)
        ? "modifier"
        : label === "Space"
          ? "accent"
          : undefined,
    ),
  );
}

function key(label: string, unit = 1, tone?: KeySpec["tone"]): KeySpec {
  return { label, tone, unit };
}

function formatLayoutLabel(layout: PreviewLayout) {
  if (layout === "65") {
    return "65% layout";
  }

  if (layout === "tkl") {
    return "TKL layout";
  }

  return "Compact layout";
}

function getValidationLabel(
  components: BuildPreviewComponents,
  validation: CompatibilityResult | null | undefined,
) {
  const selectedCount = requiredPreviewCategories.filter(
    (category) => components[category],
  ).length;

  if (selectedCount > 0 && selectedCount < requiredPreviewCategories.length) {
    return "Needs complete selection";
  }

  if (!validation) {
    return "Needs validation";
  }

  if (!validation.isValid) {
    return "Needs validation";
  }

  return validation.warnings.length > 0
    ? "Validated with warnings"
    : "Validated";
}

function inferCaseTone(component: KeyboardComponent | undefined) {
  const text = component ? componentText(component) : "";

  if (/\baluminum|aluminium|cnc\b/i.test(text)) {
    return "aluminum";
  }

  if (/\babs|plastic|polycarbonate|pc\b/i.test(text)) {
    return "plastic";
  }

  return "neutral";
}

function inferKeycapTone(component: KeyboardComponent | undefined) {
  const text = component ? componentText(component) : "";

  if (/\bblack|dark|charcoal|graphite\b/i.test(text)) {
    return "dark";
  }

  if (/\bblue|navy|cyan|aqua\b/i.test(text)) {
    return "blue";
  }

  if (/\bpink|purple|violet|lilac|rose\b/i.test(text)) {
    return "warm";
  }

  if (/\bwhite|light|cream|beige|pudding\b/i.test(text)) {
    return "light";
  }

  return "neutral";
}

function getSoundTone(soundProfile: KeyboardComponent["soundProfile"]) {
  switch (soundProfile) {
    case "silent":
      return "muted";
    case "creamy":
      return "warm";
    case "thocky":
      return "deep";
    case "clacky":
      return "bright";
    case "neutral":
    case undefined:
      return "neutral";
  }
}

function componentText(component: KeyboardComponent) {
  return [
    component.name,
    component.description,
    component.brand,
    Object.values(component.metadata ?? {})
      .filter((value) => typeof value === "string")
      .join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function caseFrameClass(tone: "aluminum" | "neutral" | "plastic") {
  switch (tone) {
    case "aluminum":
      return "border-[#9fb3c5] bg-[#c8d8e6]";
    case "plastic":
      return "border-[#c2d9ea] bg-[#D8EEFE]";
    case "neutral":
      return "border-[#c2c7cf] bg-[#e9f5ff]";
  }
}

function plateClass(tone: "bright" | "deep" | "muted" | "neutral" | "warm") {
  switch (tone) {
    case "bright":
      return "border-[#3DA9FC]/50 bg-[#eff8ff]";
    case "deep":
      return "border-[#094067]/25 bg-[#dfeefa]";
    case "muted":
      return "border-[#b7c6d1] bg-[#eef5f8]";
    case "warm":
      return "border-[#e2c8aa] bg-[#fff7ed]";
    case "neutral":
      return "border-[#c2c7cf] bg-[#f5faff]";
  }
}

function keycapClass(
  keycapTone: "blue" | "dark" | "ghost" | "light" | "neutral" | "warm",
  keyTone: KeySpec["tone"],
) {
  if (keycapTone === "ghost") {
    return "border-[#c2c7cf]/50 bg-[#fffffe]/50 text-[#5F6C7B]/50";
  }

  if (keyTone === "accent") {
    return "border-[#3DA9FC]/60 bg-[#D8EEFE] text-[#094067]";
  }

  if (keyTone === "modifier") {
    return "border-[#c2c7cf] bg-[#f5faff] text-[#42474E]";
  }

  switch (keycapTone) {
    case "blue":
      return "border-[#9ed2f7] bg-[#e4f4ff] text-[#094067]";
    case "dark":
      return "border-[#3e4b56] bg-[#071E29] text-[#FFFFFE]";
    case "light":
      return "border-[#d7dde4] bg-[#FFFFFE] text-[#42474E]";
    case "warm":
      return "border-[#e8c7df] bg-[#fff1fb] text-[#5c2d52]";
    case "neutral":
      return "border-[#c2c7cf] bg-[#FFFFFE] text-[#42474E]";
  }
}

function soundBadgeClass(tone: "bright" | "deep" | "muted" | "neutral" | "warm") {
  switch (tone) {
    case "bright":
      return "border border-[#3DA9FC]/50 bg-[#e8f6ff] text-[#094067]";
    case "deep":
      return "border border-[#094067]/30 bg-[#e5eef5] text-[#094067]";
    case "muted":
      return "border border-[#b8c9d4] bg-[#f1f6f8] text-[#5F6C7B]";
    case "warm":
      return "border border-[#e2c8aa] bg-[#fff7ed] text-[#7b4a1f]";
    case "neutral":
      return "border border-[#c2c7cf] bg-[#f5faff] text-[#5F6C7B]";
  }
}

function formatMoney(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-MY", {
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(amount);
}
