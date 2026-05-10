import {
  BrainCircuit,
  Database,
  Keyboard,
  Link2,
  ShieldCheck,
} from "lucide-react";

import { RecommendationDemo } from "@/components/recommendation-demo";

const foundations = [
  {
    label: "Grounded catalog",
    value: "Malaysia MYR seed data",
    icon: Database,
  },
  {
    label: "Validation gate",
    value: "Deterministic rule engine",
    icon: ShieldCheck,
  },
  {
    label: "Intent layer",
    value: "OpenAI or local fallback",
    icon: BrainCircuit,
  },
  {
    label: "Traceability",
    value: "Vendor/source links",
    icon: Link2,
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-zinc-950 text-white">
              <Keyboard className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-zinc-950">
                Sharkeys
              </h1>
              <p className="text-sm text-zinc-500">
                AI-assisted mechanical keyboard configurator
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {foundations.map((item) => (
              <div
                className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
                key={item.label}
              >
                <item.icon className="h-4 w-4 flex-none text-emerald-700" aria-hidden />
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-normal text-zinc-500">
                    {item.label}
                  </p>
                  <p className="text-xs font-semibold text-zinc-900">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <RecommendationDemo />
    </main>
  );
}
