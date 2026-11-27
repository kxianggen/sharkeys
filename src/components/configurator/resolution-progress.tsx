// Height of one section's step cell on the vertical progress track.
export const progressStepPx = 30;

// Apple-style resolution progress: ONE continuous vertical track. The filled
// portion is a single solid ink bar with rounded caps whose height maps to
// resolved/total sections — not per-section dot+connector pairs, so there are
// no seams. Pending sections read as faint dots sitting on the remaining
// length of the same axis; the fill grows over them as sections resolve
// (kit-locked sections with the case, free choices on selection). Purely
// visual — it never gates saving beyond the completeness rule and never
// alters the resolved build.
export function ResolutionProgress({
  sections,
}: {
  sections: Array<{ id: string; title: string; resolved: boolean }>;
}) {
  const resolvedCount = sections.filter((section) => section.resolved).length;

  if (sections.length <= 1) {
    return null;
  }

  const trackHeight = sections.length * progressStepPx;
  const filledHeight = Math.round(
    (resolvedCount / sections.length) * trackHeight,
  );

  return (
    <div
      aria-label="Build sections complete"
      aria-valuemax={sections.length}
      aria-valuemin={0}
      aria-valuenow={resolvedCount}
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-7"
      data-testid="review-progress"
      role="progressbar"
    >
      <div className="relative w-1.5" style={{ height: trackHeight }}>
        {/* Pending steps: faint dots on the track axis. Dots inside the filled
            region fade out so the fill reads as one unbroken bar. */}
        {sections.map((section, sectionIndex) => (
          <span
            className={`absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border transition-opacity duration-300 ${
              sectionIndex < resolvedCount ? "opacity-0" : "opacity-100"
            }`}
            key={section.id}
            style={{ top: (sectionIndex + 0.5) * progressStepPx }}
            title={section.title}
          />
        ))}

        {/* The single filled segment: one solid bar, rounded caps. */}
        <span
          className="absolute inset-x-0 top-0 rounded-full bg-primary transition-all duration-500"
          style={{ height: filledHeight }}
        />
      </div>
      <span className="sr-only">
        {resolvedCount} of {sections.length} complete
      </span>
    </div>
  );
}
