import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatusTone = "sky" | "emerald" | "amber" | "rose";

type StatusCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: StatusTone;
};

const toneClasses: Record<StatusTone, string> = {
  sky: "text-sky-700 bg-sky-50 border-sky-100",
  emerald: "text-emerald-700 bg-emerald-50 border-emerald-100",
  amber: "text-amber-700 bg-amber-50 border-amber-100",
  rose: "text-rose-700 bg-rose-50 border-rose-100",
};

export function StatusCard({
  title,
  description,
  icon: Icon,
  tone,
}: StatusCardProps) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-lg border",
          toneClasses[tone],
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </article>
  );
}
