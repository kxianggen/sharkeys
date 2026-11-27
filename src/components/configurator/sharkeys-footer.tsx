import Image from "next/image";

export function SharkeysFooter() {
  const links = ["About", "Privacy", "Terms"];

  return (
    <footer className="border-t border-white/60 bg-white/40 px-4 py-12 backdrop-blur sm:px-8 lg:px-6">
      <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 md:flex-row md:items-center">
        <div>
          <Image
            alt="Sharkeys"
            className="h-8 w-auto object-contain"
            height={32}
            src="/logo.png"
            width={111}
          />
          <p className="mt-3 text-sm text-primary/60">
            © 2024 sharkeys. build your sound.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 md:justify-end">
          {links.map((link) => (
            <a
              className="text-sm font-bold text-primary/70 transition hover:text-primary hover:underline focus:outline-none focus:ring-4 focus:ring-accent/20"
              href="#configurator"
              key={link}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
