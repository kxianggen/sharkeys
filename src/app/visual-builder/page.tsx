import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  CircleDot,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";

import { BuildPreview } from "@/components/build-preview";
import { getComponentById, keyboardComponents } from "@/data";
import { validateBuildSelectionFromIds } from "@/lib/components";
import type {
  CaseComponent,
  ComponentCategory,
  CompatibilityIssue,
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
    <main className="min-h-screen bg-[#f5faff] text-[#071e29]">
      <ConfiguratorNav />

      <section className="mx-auto grid w-full max-w-screen-2xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.45fr)_minmax(280px,0.9fr)] lg:px-10 xl:px-12">
        <BuildAssistantPanel components={components} />

        <div className="min-w-0 space-y-6">
          <section className="rounded-[28px] border border-[#c2c7cf] bg-[#fffffe] p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#c2c7cf] bg-[#f5faff] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#094067]">
                <CircleDot className="h-3.5 w-3.5 text-[#3DA9FC]" aria-hidden />
                Live Preview
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#5F6C7B]">
                Schematic preview
              </span>
            </div>
            <BuildPreview
              components={components}
              estimatedPrice={price?.amount ?? null}
              estimatedPriceCurrency={price?.currency ?? null}
              showDetails={false}
              title={`${formatLayout(layout)} visual build`}
              validation={validation}
            />
          </section>

          <AcousticProfileCard soundProfile={soundProfile} />
        </div>

        <aside className="min-w-0 space-y-6">
          <BuildConfigurationCard components={components} price={price} />
          <CompatibilityEngineCard
            components={components}
            layout={layout}
            validation={validation}
          />
        </aside>
      </section>

      <Link
        className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#c2c7cf] bg-[#094067] text-white shadow-lg transition hover:bg-[#002a47] focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/30"
        href="/configurator"
        aria-label="Go to configurator workspace"
      >
        <Bot className="h-5 w-5" aria-hidden />
      </Link>
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
    <nav className="border-b border-[#c2c7cf] bg-[#f8fbff]/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-screen-2xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-10 xl:px-12">
        <Link
          className="text-2xl font-bold tracking-[-0.01em] text-[#071e29] focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/20"
          href="/"
        >
          sharkeys
        </Link>

        <div className="order-3 flex w-full gap-6 overflow-x-auto text-sm font-semibold md:order-2 md:w-auto md:overflow-visible">
          {navLinks.map(([label, href], index) => (
            <Link
              className={`whitespace-nowrap border-b-2 py-2 transition ${
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

        <div className="order-2 flex items-center gap-3 md:order-3">
          <Link
            className="hidden text-sm font-semibold text-[#42474E] transition hover:text-[#094067] sm:inline"
            href="/configurator"
          >
            Sign In
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#3DA9FC] px-5 text-sm font-bold text-[#003e66] transition hover:bg-[#094067] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#3DA9FC]/30"
            href="/configurator"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function BuildAssistantPanel({ components }: { components: ComponentSelection }) {
  return (
    <section
      aria-label="Build Assistant"
      className="flex min-h-[34rem] flex-col rounded-[28px] border border-[#c2c7cf] bg-[#fffffe] p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D8EEFE] text-[#094067]">
          <Bot className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-[-0.01em] text-[#071e29]">
            Build Assistant
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5F6C7B]">
            Catalog grounded
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <AssistantBubble>
          This visual builder is using real sharkeys catalog parts. The selected
          build starts with {components.case.name} and{" "}
          <strong className="text-[#00639d]">{components.switch.name}</strong>.
        </AssistantBubble>
        <div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md border border-[#b9ddf7] bg-[#e8f6ff] px-4 py-3 text-sm leading-6 text-[#071e29]">
          Show me the current build and compatibility status.
        </div>
        <AssistantBubble>
          The preview is schematic. Compatibility remains grounded in the
          deterministic engine, not the visual drawing.
        </AssistantBubble>
      </div>

      <div className="mt-auto rounded-2xl border border-[#c2c7cf] bg-[#f5faff] p-4">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#5F6C7B]">
          Next handoff
        </p>
        <p className="mt-1 text-sm leading-6 text-[#42474E]">
          Recommendation-to-builder links can pass selected component IDs through
          URL parameters in this phase.
        </p>
      </div>
    </section>
  );
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-[#c2c7cf] bg-[#eef6ff] px-4 py-3 text-sm leading-6 text-[#42474E]">
      {children}
    </div>
  );
}

function AcousticProfileCard({ soundProfile }: { soundProfile: SoundProfile }) {
  const profile = getAcousticEstimate(soundProfile);

  return (
    <section className="rounded-[28px] border border-[#c2c7cf] bg-[#fffffe] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-[#00639d]" aria-hidden />
          <h2 className="text-lg font-bold text-[#071e29]">Acoustic Profile</h2>
        </div>
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#42474E]">
          Estimated: {soundProfile} / {profile.label}
        </span>
      </div>

      <div className="mt-6 space-y-5">
        <AcousticBar label="Pitch" value={profile.pitch} valueLabel={profile.pitchLabel} />
        <AcousticBar
          label="Volume"
          value={profile.volume}
          valueLabel={profile.volumeLabel}
        />
      </div>

      <p className="mt-5 rounded-2xl border border-[#c2c7cf] bg-[#f5faff] px-4 py-3 text-sm leading-6 text-[#42474E]">
        This is a schematic estimate from catalog sound-profile metadata, not a
        measured audio simulation.
      </p>
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
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[#42474E]">{label}</span>
        <span className="text-[#42474E]">{valueLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#eef2f6]">
        <span
          className="block h-full rounded-full bg-[#00639d]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function BuildConfigurationCard({
  components,
  price,
}: {
  components: ComponentSelection;
  price: PriceEstimate | null;
}) {
  return (
    <section className="rounded-[28px] border border-[#c2c7cf] bg-[#fffffe] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#c2c7cf]/70 pb-4">
        <h2 className="text-xl font-bold text-[#071e29]">Build Configuration</h2>
        <SlidersHorizontal className="h-5 w-5 text-[#00639d]" aria-hidden />
      </div>

      <dl className="mt-5 space-y-5">
        {componentCategories.map((category) => (
          <div key={category}>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#5F6C7B]">
              {categoryLabels[category]}
            </dt>
            <dd className="mt-1 text-sm font-semibold leading-5 text-[#071e29]">
              {components[category].name}
            </dd>
          </div>
        ))}
      </dl>

      {price ? (
        <p className="mt-5 rounded-2xl border border-[#c2c7cf] bg-[#f5faff] px-4 py-3 text-sm font-bold text-[#094067]">
          Estimated total: {formatMoney(price.amount, price.currency)}
        </p>
      ) : null}
    </section>
  );
}

function CompatibilityEngineCard({
  components,
  layout,
  validation,
}: {
  components: ComponentSelection;
  layout: KeyboardLayout;
  validation: ReturnType<typeof validateBuildSelectionFromIds>;
}) {
  const checks = buildCompatibilityChecks(components, layout, validation);

  return (
    <section className="rounded-[28px] border border-[#c2c7cf] bg-[#fffffe] p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-[#00639d]" aria-hidden />
        <h2 className="text-xl font-bold text-[#071e29]">
          Compatibility Engine
        </h2>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div
            className={`rounded-2xl border p-4 ${
              check.status === "valid"
                ? "border-[#c2c7cf] bg-[#eaf5ff]"
                : check.status === "warning"
                  ? "border-amber-200 bg-amber-50"
                  : "border-[#BA1A1A]/20 bg-[#fff5f5]"
            }`}
            key={check.title}
          >
            <div className="flex items-start gap-3">
              {check.status === "valid" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-[#2F8F46]" aria-hidden />
              ) : check.status === "warning" ? (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-amber-700" aria-hidden />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-[#BA1A1A]" aria-hidden />
              )}
              <div>
                <p className="font-bold text-[#071e29]">{check.title}</p>
                <p className="mt-1 text-sm leading-5 text-[#42474E]">
                  {check.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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

function buildCompatibilityChecks(
  components: ComponentSelection,
  layout: KeyboardLayout,
  validation: ReturnType<typeof validateBuildSelectionFromIds>,
) {
  return [
    {
      body: issueMessage(validation.issues, "layout") ??
        `${formatLayout(layout)} case, PCB, and plate share a layout path.`,
      status: issueStatus(validation.issues, "layout"),
      title: "Layout Match",
    },
    {
      body: issueMessage(validation.issues, "switch") ??
        `${components.switch.switchTechnology} switches are supported by the selected PCB and plate.`,
      status: issueStatus(validation.issues, "switch"),
      title: "Switch Compatibility",
    },
    {
      body: issueMessage(validation.issues, "keycap") ??
        `${components.keycap.name} covers the selected ${formatLayout(layout)} layout path.`,
      status: issueStatus(validation.issues, "keycap"),
      title: "Keycap Coverage",
    },
    {
      body: issueMessage(validation.issues, "kit_structural") ??
        buildKitLockMessage(components),
      status: issueStatus(validation.issues, "kit_structural"),
      title: "Kit-Lock Status",
    },
  ];
}

function issueMessage(
  issues: CompatibilityIssue[],
  codeNeedle: string,
) {
  return issues.find((issue) => issue.code.includes(codeNeedle))?.message;
}

function issueStatus(
  issues: CompatibilityIssue[],
  codeNeedle: string,
): "error" | "valid" | "warning" {
  const issue = issues.find((item) => item.code.includes(codeNeedle));

  if (!issue) {
    return "valid";
  }

  return issue.severity === "warning" ? "warning" : "error";
}

function buildKitLockMessage(components: ComponentSelection) {
  const structural = [
    components.case,
    components.pcb,
    components.plate,
    components.stabilizer,
  ];
  const kitLocked = structural.filter(
    (component) =>
      component.metadata?.kitLock === true ||
      component.metadata?.sourceType === "kit_derived",
  );

  if (kitLocked.length === 0) {
    return "No kit-lock constraints are attached to the selected structural parts.";
  }

  const kitIds = [
    ...new Set(
      kitLocked
        .map((component) => component.metadata?.kitId)
        .filter((kitId): kitId is string => typeof kitId === "string"),
    ),
  ];

  return kitIds.length === 1
    ? `Kit-derived structural parts share kitId ${kitIds[0]}.`
    : "Kit-derived structural parts must share one verified kitId.";
}
