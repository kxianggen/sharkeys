import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { formatEstimatedTotal } from "@/components/configurator/build-helpers";
import { loadSharedBuild, sharedBuildFits } from "@/lib/recommendations/shared-build";

/**
 * Link preview for a shared build: the card WhatsApp, Instagram and others
 * show when the link is pasted. Generated per build from today's catalogue.
 * (Kit photos are .webp, which next/og cannot draw, so the card is text,
 * the logo and the keycap colours.)
 */
export const alt = "A keyboard build on sharkeys";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function keycapSwatch(metadata: Record<string, unknown> | undefined) {
  const value = metadata?.swatch;

  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? (value as string[]).slice(0, 4)
    : [];
}

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const build = await loadSharedBuild((await params).code);
  const logo = await readFile(path.join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const title = build?.kitName ?? "Keyboard build";
  const lines = build
    ? [build.parts.switch?.name, build.parts.keycap?.name].filter(
        (line): line is string => Boolean(line),
      )
    : ["This link is not a sharkeys build."];
  const price = build?.price != null ? formatEstimatedTotal(build.price, "MYR") : null;
  const fits = build ? sharedBuildFits(build) : false;
  const swatch = keycapSwatch(build?.parts.keycap?.metadata);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(160deg, #ffffff 0%, #ffffff 45%, #dbe7f7 100%)",
          color: "#111827",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
          <img alt="" height={52} src={logoSrc} width={180} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 26,
              background: fits ? "#e7f0fb" : "#fde8e8",
              color: fits ? "#1f3b63" : "#b42318",
            }}
          >
            {/* Drawn, not typed: the bundled Geist font has no ✓ glyph. */}
            {fits ? (
              <svg fill="none" height="26" viewBox="0 0 24 24" width="26">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="#1f3b63"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
              </svg>
            ) : null}
            {fits ? "Every part checked to fit" : "Needs a part swap"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#6b7280" }}>Shared keyboard build</div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 8 }}>
            {title}
          </div>
          {lines.map((line) => (
            <div key={line} style={{ fontSize: 36, color: "#374151", marginTop: 14 }}>
              {line}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {swatch.map((colour, index) => (
              <div
                key={`${colour}-${index}`}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  background: colour,
                  border: "2px solid rgba(17,24,39,0.15)",
                }}
              />
            ))}
          </div>
          {price ? (
            <div style={{ fontSize: 56, fontWeight: 700 }}>{price}</div>
          ) : null}
        </div>
      </div>
    ),
    size,
  );
}
