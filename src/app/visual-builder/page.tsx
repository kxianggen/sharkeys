import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  CircleHelp,
  RotateCw,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

import { getComponentById, keyboardComponents } from "@/data";
import { validateBuildSelectionFromIds } from "@/lib/components";
import type {
  CaseComponent,
  ComponentCategory,
  CurrencyCode,
  KeyboardLayout,
  KeycapComponent,
  PcbComponent,
  PlateComponent,
  SoundProfile,
  StabilizerComponent,
  SwitchComponent,
} from "@/lib/types";

type ConfiguratorSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type ComponentSelection = {
  case: CaseComponent;
  keycap: KeycapComponent;
  pcb: PcbComponent;
  plate: PlateComponent;
  stabilizer: StabilizerComponent;
  switch: SwitchComponent;
};
type ComponentIdSelection = Record<ComponentCategory, string>;
type PriceEstimate = {
  amount: number;
  currency: CurrencyCode;
};

const componentCategories = [
  "case",
  "pcb",
  "plate",
  "switch",
  "keycap",
  "stabilizer",
] as const satisfies readonly ComponentCategory[];

const categoryLabels: Record<ComponentCategory, string> = {
  case: "Case",
  keycap: "Keycaps",
  pcb: "PCB",
  plate: "Plate",
  stabilizer: "Stabilizers",
  switch: "Switches",
};

const defaultComponentIds = {
  case: "case_keychron_v2_max_65_abs",
  keycap: "keycap_unknown_pudding_oem_pbt",
  pcb: "pcb_keychron_v2_max_65_hotswap",
  plate: "plate_keychron_v2_max_65_pc",
  stabilizer: "stab_keychron_v2_max_screw_in",
  switch: "switch_gateron_seasalt_smoothie",
} satisfies ComponentIdSelection;

export default async function VisualBuilderPage({
  searchParams,
}: {
  searchParams?: ConfiguratorSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const componentIds = resolveComponentIds(params);
  const components = resolveComponents(componentIds);
  const validation = validateBuildSelectionFromIds(
    {
      componentIds,
      preferences: {
        layout: components.case.layouts[0],
        soundProfile: components.switch.soundProfile,
      },
    },
    keyboardComponents,
  );
  const price = estimatePrice(components);
  const layout = resolveLayout(components);
  const soundProfile = components.switch.soundProfile ?? "neutral";

  return (
    <main className="min-h-screen bg-[#f9f9fc] text-[#071e29]">
      <ConfiguratorNav />

      <section className="grid min-h-[calc(100vh-68px)] lg:grid-cols-[272px_minmax(0,1fr)_360px] lg:items-start">
        <BuildAssistantRail components={components} price={price} />

        <div className="min-w-0 border-x border-[#eef0f3] bg-[radial-gradient(circle_at_1px_1px,rgba(9,60,93,0.13)_1px,transparent_0)] [background-size:24px_24px] lg:sticky lg:top-[68px] lg:h-[calc(100vh-68px)]">
          <div className="mx-auto flex min-h-full max-w-4xl flex-col px-5 py-9 sm:px-8 lg:justify-center">
            <PreviewToolbar />

            <section
              aria-label="Live preview placeholder"
              className="mx-auto mt-32 flex min-h-[20rem] w-full max-w-3xl items-center justify-center rounded-[28px] bg-white shadow-[0_10px_24px_rgba(9,60,93,0.08)] sm:min-h-[22rem]"
            >
              <KeyboardPlaceholder />
            </section>

            <div className="mx-auto mt-24 grid w-full max-w-2xl gap-5 md:grid-cols-[1.05fr_0.95fr]">
              <BuildStatusCard layout={layout} validation={validation} />
              <AcousticProfileCard soundProfile={soundProfile} />
            </div>
          </div>
        </div>

        <BuildSummaryPanel components={components} price={price} />
      </section>
    </main>
  );
}

function ConfiguratorNav() {
  const navLinks = [
    ["Configurator", "/configurator"],
    ["Browse", "/browse"],
    ["Community Gallery", "/community-gallery"],
    ["My Builds", "/my-builds"],
  ] as const;

  return (
    <nav className="border-b border-[#eef0f3] bg-[#f9f9fc]/95 backdrop-blur">
      <div className="flex min-h-[68px] w-full flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-7 lg:px-8">
        <Link
          className="text-xl font-black tracking-[-0.01em] text-[#071e29] focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/20"
          href="/"
        >
          sharkeys
        </Link>

        <div className="order-3 flex w-full gap-7 overflow-x-auto text-sm font-bold md:order-2 md:w-auto md:overflow-visible">
          {navLinks.map(([label, href], index) => (
            <Link
              className={`whitespace-nowrap border-b-2 py-1.5 transition ${
                index === 0
                  ? "border-[#00639d] text-[#00639d]"
                  : "border-transparent text-[#42474E] hover:text-[#094067]"
              }`}
              href={href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="order-2 flex items-center md:order-3">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#094067] px-7 text-sm font-bold text-[#9fc3df] transition hover:bg-[#002a47] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/30"
            href="/configurator"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function BuildAssistantRail({
  components,
  price,
}: {
  components: ComponentSelection;
  price: PriceEstimate | null;
}) {
  const menuItems = [
    {
      icon: Bot,
      label: "AI Assistant",
      state: "active",
    },
    {
      icon: Wrench,
      label: "Custom Studio",
      state: "future",
    },
    {
      icon: CheckCircle2,
      label: "Compatibility",
      state: "future",
    },
    {
      icon: SlidersHorizontal,
      label: "Specs",
      state: "future",
    },
    {
      icon: CircleHelp,
      label: "Help",
      state: "future",
    },
  ] as const;

  return (
    <aside className="flex min-h-full flex-col border-b border-[#eef0f3] bg-[#f0f1f4] px-4 py-7 lg:border-b-0">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#9bd5fb] text-[#094067]">
          <Bot className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-black lowercase leading-6 text-[#071e29]">
            keybot
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#42474E]">
            AI keyboard expert
          </p>
        </div>
      </div>

      <nav aria-label="Builder modes" className="mt-14 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.state === "active";

          return (
            <button
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-bold transition ${
                active
                  ? "bg-[#9bd5fb] text-[#094067]"
                  : "text-[#42474E] hover:bg-white/70"
              }`}
              disabled={!active}
              key={item.label}
              type="button"
            >
              <Icon className="h-5 w-5" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-[#e1e4e8] pt-5">
        <AssistantBubble>
          This build matches your {components.switch.soundProfile ?? "selected"}{" "}
          preference
          {price ? ` and ${formatMoney(price.amount, price.currency)} estimate` : ""}
          . Ask me anything about these parts!
        </AssistantBubble>

        <div className="mt-4 flex flex-wrap gap-2">
          {price ? (
            <span className="rounded bg-white px-2.5 py-1 text-[11px] text-[#42474E] shadow-sm">
              Budget: {formatMoney(price.amount, price.currency)}
            </span>
          ) : null}
          <span className="rounded bg-white px-2.5 py-1 text-[11px] text-[#42474E] shadow-sm">
            Profile: {formatProfileLabel(components.switch.soundProfile ?? "neutral")}
          </span>
        </div>
      </div>

      <div className="mt-auto hidden lg:block" aria-hidden />
    </aside>
  );
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg bg-white px-4 py-4 text-sm leading-6 text-[#071e29] shadow-sm">
      {children}
    </div>
  );
}

function PreviewToolbar() {
  return (
    <div className="mx-auto flex w-full max-w-xs justify-center gap-4">
      {[
        {
          icon: Search,
          label: "Zoom in preview",
        },
        {
          icon: Search,
          label: "Zoom out preview",
        },
        {
          icon: RotateCw,
          label: "Reset preview",
        },
      ].map((item, index) => {
        const Icon = item.icon;

        return (
          <button
            aria-label={item.label}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#071e29] shadow-sm transition hover:text-[#00639d] focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/20"
            key={item.label}
            type="button"
          >
            <Icon
              className={`h-4 w-4 ${index === 1 ? "scale-90" : ""}`}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

function KeyboardPlaceholder() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-[min(35rem,72vw)] items-center justify-center rounded-xl border border-dashed border-[#c2c7cf] bg-[#eeedf2]">
        <div className="flex items-center gap-2">
          <span className="h-9 w-9 rounded-lg bg-[#e2e2e7]" />
          <span className="h-9 w-9 rounded-lg bg-[#e2e2e7]" />
          <span className="h-9 w-9 rounded-lg bg-[#e2e2e7]" />
          <span className="h-9 w-36 rounded-lg bg-[#e2e2e7]" />
        </div>
      </div>
      <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-[#a8adb4]">
        Preview placeholder
      </p>
    </div>
  );
}

function BuildStatusCard({
  layout,
  validation,
}: {
  layout: KeyboardLayout;
  validation: ReturnType<typeof validateBuildSelectionFromIds>;
}) {
  const isCompatible = validation.isValid;
  const issue = validation.issues[0];

  return (
    <section className="rounded-lg border border-[#e6e8ec] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <span
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${
            isCompatible
              ? "bg-[#9bd5fb] text-[#094067]"
              : "bg-[#ffdad6] text-[#ba1a1a]"
          }`}
        >
          {isCompatible ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <AlertCircle className="h-5 w-5" aria-hidden />
          )}
        </span>
        <div>
          <h2 className="text-base font-black text-[#071e29]">
            {isCompatible ? "Fully Compatible" : "Needs Attention"}
          </h2>
          {isCompatible ? (
            <div className="mt-2 flex flex-wrap gap-4 text-xs font-medium text-[#00639d]">
              <span>✓ {formatLayout(layout)} layout match</span>
              <span>✓ Switch support</span>
            </div>
          ) : (
            <p className="mt-1 text-xs leading-5 text-[#42474E]">
              {issue?.message ?? "Review the selected parts before completing this build."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function AcousticProfileCard({ soundProfile }: { soundProfile: SoundProfile }) {
  const profile = getAcousticEstimate(soundProfile);

  return (
    <section className="rounded-lg border border-[#e6e8ec] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-1">
        <h2 className="text-base font-black text-[#071e29]">Acoustic Profile</h2>
        <span className="text-xs text-[#42474E]">Schematic estimate</span>
      </div>

      <div className="mt-5 space-y-3">
        <AcousticBar label="Pitch" value={profile.pitch} valueLabel={profile.pitchLabel} />
        <AcousticBar label="Vol" value={profile.volume} valueLabel={profile.volumeLabel} />
      </div>
    </section>
  );
}

function AcousticBar({
  label,
  value,
  valueLabel,
}: {
  label: string;
  value: number;
  valueLabel: string;
}) {
  return (
    <div>
      <div className="mb-2 grid grid-cols-[3rem_minmax(0,1fr)_4rem] items-center gap-3 text-sm">
        <span className="text-xs text-[#42474E]">{label}</span>
        <div className="h-2 overflow-hidden rounded-full bg-[#e8eaee]">
          <span
            className="block h-full rounded-full bg-[#9bd5fb]"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs font-bold text-[#071e29]">{valueLabel}</span>
      </div>
    </div>
  );
}

function BuildSummaryPanel({
  components,
  price,
}: {
  components: ComponentSelection;
  price: PriceEstimate | null;
}) {
  return (
    <aside className="flex min-h-[calc(100vh-68px)] flex-col bg-[#f9f9fc] px-5 pb-40 pt-8 lg:pb-44">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-[#071e29]">Build Summary</h2>
        <span className="text-sm font-medium text-[#071e29]">6 Parts</span>
      </div>

      <dl className="mt-7 space-y-2.5">
        {componentCategories.map((category) => (
          <div
            aria-label={`${categoryLabels[category]}: ${components[category].name}`}
            className="group rounded-lg bg-white px-4 py-2.5 shadow-[0_2px_8px_rgba(9,60,93,0.06)] outline-none transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(9,60,93,0.1)] focus-visible:ring-4 focus-visible:ring-[#3DA9FC]/20"
            key={category}
            tabIndex={0}
          >
            <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#42474E]">
              {categoryLabels[category]}
            </dt>
            <dd className="mt-1 truncate text-sm font-black leading-5 text-[#071e29]">
              {formatSummaryPartName(components[category])}
            </dd>
            <dd className="grid max-h-0 overflow-hidden opacity-0 transition-[max-height,opacity,margin-top] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:mt-3 group-hover:max-h-28 group-hover:opacity-100 group-focus-visible:mt-3 group-focus-visible:max-h-28 group-focus-visible:opacity-100">
              <div className="border-t border-[#e4e7eb] pt-3">
                <p className="text-xs font-bold text-[#00639d]">
                  Selection Details
                </p>
                <p className="mt-1 text-xs leading-5 text-[#42474E]">
                  {getPartSelectionDetail(components[category])}
                </p>
                <p className="mt-1 truncate text-[11px] text-[#5F6C7B]">
                  {components[category].name}
                </p>
              </div>
            </dd>
          </div>
        ))}
      </dl>

      <div className="pt-8">
        {price ? (
          <div className="mb-7 flex items-center justify-between gap-4 text-[#071e29]">
            <span className="text-base">Estimated Total</span>
            <span className="text-2xl font-black">
              {formatMoney(price.amount, price.currency)}
            </span>
          </div>
        ) : null}
        <div className="border-t border-[#e4e7eb] pt-5">
          <Link
            className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-[#094067] px-5 text-base font-black text-[#9fc3df] transition hover:bg-[#002a47] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/30"
            href="/my-builds"
          >
            Complete Build
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function getPartSelectionDetail(component: ComponentSelection[ComponentCategory]) {
  switch (component.category) {
    case "case":
      return `${component.layouts.map(formatLayout).join(", ")} layout support · ${component.caseMountSupport.map(formatToken).join(", ")} mount`;
    case "pcb":
      return `${component.hotswap ? "Hotswap" : "Solder"} PCB · ${formatToken(component.connection)} connection`;
    case "plate":
      return `${component.layouts.map(formatLayout).join(", ")} plate · ${component.switchTechnologySupport.map(formatToken).join(", ")} switch support`;
    case "switch":
      return `${formatToken(component.switchTechnology)} switch · ${formatProfileLabel(component.soundProfile ?? "neutral")} sound profile`;
    case "keycap":
      return `${formatToken(component.keycapProfile)} profile · ${component.layoutSupport.map(formatLayout).join(", ")} layout coverage`;
    case "stabilizer":
      return `${formatToken(component.stabilizerType)} stabilizers · ${component.supportedLayouts.map(formatLayout).join(", ")} layout support`;
  }
}

function formatSummaryPartName(component: ComponentSelection[ComponentCategory]) {
  return component.name
    .replace(/\s+(ABS|CNC Aluminum|Aluminum|Polycarbonate|PC)\s+Case$/i, "")
    .replace(/\s+(Hotswap|Hot-swap)\s+PCB$/i, " Hotswap")
    .replace(/\s+(FR4|PC|Polycarbonate|Aluminum)\s+Plate$/i, " $1")
    .replace(/\s+(Linear|Tactile|Clicky|Silent)\s+Switch$/i, "")
    .replace(/\s+(PBT|ABS)?\s*(Cherry|OEM|XDA|MOA|SA)?\s*Keycaps$/i, "")
    .replace(/\s+(Screw-In|PCB Mount|Plate Mount|PCB)\s+Stabilizers$/i, " Stabs")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveComponentIds(
  params: Record<string, string | string[] | undefined>,
): ComponentIdSelection {
  return Object.fromEntries(
    componentCategories.map((category) => {
      const requested = getParamValue(params[category]);
      const component = requested ? getComponentById(requested) : undefined;

      return [
        category,
        component?.category === category ? component.id : defaultComponentIds[category],
      ];
    }),
  ) as ComponentIdSelection;
}

function resolveComponents(componentIds: ComponentIdSelection): ComponentSelection {
  const caseComponent = getComponentById(componentIds.case);
  const keycap = getComponentById(componentIds.keycap);
  const pcb = getComponentById(componentIds.pcb);
  const plate = getComponentById(componentIds.plate);
  const stabilizer = getComponentById(componentIds.stabilizer);
  const switchComponent = getComponentById(componentIds.switch);

  if (!caseComponent || caseComponent.category !== "case") {
    throw new Error("Default case component is missing from the catalog.");
  }
  if (!keycap || keycap.category !== "keycap") {
    throw new Error("Default keycap component is missing from the catalog.");
  }
  if (!pcb || pcb.category !== "pcb") {
    throw new Error("Default pcb component is missing from the catalog.");
  }
  if (!plate || plate.category !== "plate") {
    throw new Error("Default plate component is missing from the catalog.");
  }
  if (!stabilizer || stabilizer.category !== "stabilizer") {
    throw new Error("Default stabilizer component is missing from the catalog.");
  }
  if (!switchComponent || switchComponent.category !== "switch") {
    throw new Error("Default switch component is missing from the catalog.");
  }

  return {
    case: caseComponent,
    keycap,
    pcb,
    plate,
    stabilizer,
    switch: switchComponent,
  };
}

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveLayout(components: ComponentSelection) {
  return components.case.layouts[0];
}

function estimatePrice(components: ComponentSelection): PriceEstimate | null {
  const prices = componentCategories
    .map((category) => {
      const component = components[category];

      if (component.price === undefined || component.priceCurrency === undefined) {
        return null;
      }

      return {
        amount: category === "switch" ? component.price * 70 : component.price,
        currency: component.priceCurrency,
      };
    })
    .filter((price): price is PriceEstimate => price !== null);
  const [firstPrice] = prices;

  if (
    !firstPrice ||
    prices.length !== componentCategories.length ||
    prices.some((price) => price.currency !== firstPrice.currency)
  ) {
    return null;
  }

  return {
    amount: Number(
      prices.reduce((total, price) => total + price.amount, 0).toFixed(2),
    ),
    currency: firstPrice.currency,
  };
}

function formatMoney(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat("en-MY", {
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(amount);
}

function formatLayout(layout: KeyboardLayout) {
  return layout === "tkl" ? "TKL" : `${layout}%`;
}

function formatProfileLabel(soundProfile: SoundProfile) {
  return soundProfile
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatToken(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getAcousticEstimate(soundProfile: SoundProfile) {
  switch (soundProfile) {
    case "silent":
      return {
        label: "muted",
        pitch: 28,
        pitchLabel: "Low",
        volume: 24,
        volumeLabel: "Low",
      };
    case "creamy":
      return {
        label: "soft",
        pitch: 42,
        pitchLabel: "Low-mid",
        volume: 52,
        volumeLabel: "Medium",
      };
    case "thocky":
      return {
        label: "deep",
        pitch: 32,
        pitchLabel: "Low",
        volume: 58,
        volumeLabel: "Medium",
      };
    case "clacky":
      return {
        label: "bright",
        pitch: 76,
        pitchLabel: "High",
        volume: 68,
        volumeLabel: "Medium-high",
      };
    case "neutral":
      return {
        label: "balanced",
        pitch: 50,
        pitchLabel: "Medium",
        volume: 50,
        volumeLabel: "Medium",
      };
  }
}
