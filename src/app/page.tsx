import {
  BrainCircuit,
  Database,
  Keyboard,
  ShieldCheck,
  Waves,
} from "lucide-react";

import { StatusCard } from "@/components/status-card";
import { RecommendationDemo } from "@/components/recommendation-demo";

const architectureItems = [
  {
    title: "Intent extraction",
    description: "OpenAI wrapper prepared for future structured outputs.",
    icon: BrainCircuit,
    tone: "sky",
  },
  {
    title: "Component data",
    description: "Supabase clients prepared for grounded product records.",
    icon: Database,
    tone: "emerald",
  },
  {
    title: "Rule validation",
    description: "Compatibility checks stay deterministic in TypeScript.",
    icon: ShieldCheck,
    tone: "amber",
  },
  {
    title: "Sound comparison",
    description: "Reserved for switch and build audio workflows.",
    icon: Waves,
    tone: "rose",
  },
] as const;

const phaseItems = [
  "Structured intent extraction",
  "Seed-backed candidate search",
  "Rule-engine validation gate",
  "First usable recommendation demo",
] as const;

const keyRows = [
  ["Esc", "1", "2", "3", "4", "5"],
  ["Tab", "Q", "W", "E", "R"],
  ["Caps", "A", "S", "D", "F"],
  ["Shift", "Z", "X", "C"],
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid min-h-[64vh] w-full max-w-6xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700">
              <Keyboard className="h-4 w-4 text-emerald-700" aria-hidden />
              Phase 4 demo flow
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-normal text-zinc-950 sm:text-6xl">
                Sharkeys
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-700">
                AI-assisted custom mechanical keyboard configuration platform.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {phaseItems.map((item) => (
                <div
                  className="border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className="w-full rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            aria-label="Keyboard layout preview"
          >
            <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  Baseline build canvas
                </p>
                <p className="text-sm text-zinc-500">
                  Visual configurator placeholder
                </p>
              </div>
              <Keyboard className="h-5 w-5 text-zinc-500" aria-hidden />
            </div>
            <div className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
              {keyRows.map((row, rowIndex) => (
                <div
                  className="grid auto-cols-fr grid-flow-col gap-1.5"
                  key={row.join("-")}
                  style={{ paddingLeft: `${rowIndex * 0.65}rem` }}
                >
                  {row.map((keycap) => (
                    <span
                      className="flex h-9 min-w-0 items-center justify-center rounded-[4px] border border-zinc-600 bg-zinc-700 text-xs font-medium text-zinc-100 shadow-sm"
                      key={keycap}
                    >
                      {keycap}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <RecommendationDemo />

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-8 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
        {architectureItems.map((item) => (
          <StatusCard
            description={item.description}
            icon={item.icon}
            key={item.title}
            title={item.title}
            tone={item.tone}
          />
        ))}
      </section>
    </main>
  );
}
