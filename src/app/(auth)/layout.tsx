import Link from "next/link";
import { Keyboard } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-secondary px-4 py-12 text-primary">
      <Link
        className="mb-8 flex items-center gap-3 text-primary"
        href="/"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-subtle">
          <Keyboard className="h-5 w-5" aria-hidden />
        </span>
        <span className="text-base font-black tracking-[-0.01em]">
          sharkeys.
        </span>
      </Link>

      <div className="w-full max-w-sm rounded-[28px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur">
        {children}
      </div>
    </main>
  );
}
