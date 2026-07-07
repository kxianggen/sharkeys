// Three ~10px circles showing a keycap set's stored palette. Hairline border
// ring keeps light colours visible on white; the hex values are catalog data.
export function SwatchDots({ colors }: { colors: string[] }) {
  return (
    <span
      aria-hidden
      className="flex flex-none items-center gap-1"
      data-testid="keycap-swatch"
    >
      {colors.slice(0, 3).map((color, index) => (
        <span
          className="h-2.5 w-2.5 rounded-full border-[0.5px] border-border"
          key={`${color}-${index}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}
