"use client";

import { useState } from "react";

import type { KitOption } from "@/lib/components/kits";

export type PartOption = { id: string; name: string; brand: string };

type BuildPickerProps = {
  kitOptions: KitOption[];
  switchOptions: PartOption[];
  keycapOptions: PartOption[];
  disabled?: boolean;
  // Optional pre-fill (e.g. from a saved build): kit + free choices.
  initialKitId?: string;
  initialSwitchId?: string;
  initialKeycapId?: string;
  initialStabilizerId?: string;
};

const selectClass =
  "h-11 rounded-xl border border-border bg-white px-3 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-secondary";

/**
 * Community build picker with kit-locking. A single kit selection sets the
 * case, PCB, and plate together (shown read-only — never three free dropdowns,
 * which allowed impossible cross-kit builds). Switch and keycap stay free
 * choices; the stabilizer list is filtered to the chosen kit (its included
 * stabilizer + compatible aftermarket). The whole section is optional — with
 * no kit chosen the post publishes buildless.
 */
export function BuildPicker({
  kitOptions,
  switchOptions,
  keycapOptions,
  disabled,
  initialKitId = "",
  initialSwitchId = "",
  initialKeycapId = "",
  initialStabilizerId = "",
}: BuildPickerProps) {
  const initialKit =
    kitOptions.find((kit) => kit.kitId === initialKitId) ?? null;

  const [kitId, setKitId] = useState(initialKit ? initialKitId : "");
  const [switchId, setSwitchId] = useState(initialSwitchId);
  const [keycapId, setKeycapId] = useState(initialKeycapId);
  const [stabilizerId, setStabilizerId] = useState(
    initialStabilizerId || initialKit?.includedStabilizerId || "",
  );

  const kit = kitOptions.find((option) => option.kitId === kitId) ?? null;
  const hasKit = Boolean(kit);

  function handleKitChange(nextKitId: string) {
    setKitId(nextKitId);
    const nextKit =
      kitOptions.find((option) => option.kitId === nextKitId) ?? null;
    // Default the stabilizer to the one included in the kit's box.
    setStabilizerId(nextKit?.includedStabilizerId ?? "");
  }

  // The stabilizer select only lists this kit's compatible options, so an
  // invalid pick isn't reachable; this guards the edge (and server validation
  // is the ultimate backstop).
  const stabilizerCompatible =
    !hasKit ||
    !stabilizerId ||
    (kit?.stabilizerOptions.some((option) => option.id === stabilizerId) ??
      false);

  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-secondary p-4">
      <legend className="px-1 text-sm font-bold text-primary">
        Attach a build{" "}
        <span className="font-medium text-secondary">(optional)</span>
      </legend>
      <p className="-mt-1 text-xs text-secondary">
        Post on its own, or attach a build. Choose a kit — its case, PCB, and
        plate come together as one.
      </p>

      <label className="flex flex-col gap-1 text-sm font-bold text-primary">
        Kit
        <select
          className={selectClass}
          disabled={disabled}
          onChange={(event) => handleKitChange(event.target.value)}
          value={kitId}
        >
          <option value="">No build — post without a kit</option>
          {kitOptions.map((option) => (
            <option key={option.kitId} value={option.kitId}>
              {option.kitName}
            </option>
          ))}
        </select>
      </label>

      {kit ? (
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">
            Included with this kit
          </p>
          <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {[
              { label: "Case", part: kit.case },
              { label: "PCB", part: kit.pcb },
              { label: "Plate", part: kit.plate },
            ].map(({ label, part }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-secondary">{label}</dt>
                <dd className="text-sm font-medium text-primary">
                  {part ? part.name : "—"}
                </dd>
              </div>
            ))}
          </dl>
          {/* Kit-locked structural parts travel with the case — submitted as
              hidden fields, never independently editable. */}
          <input name="case" type="hidden" value={kit.case.id} />
          {kit.pcb ? <input name="pcb" type="hidden" value={kit.pcb.id} /> : null}
          {kit.plate ? (
            <input name="plate" type="hidden" value={kit.plate.id} />
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-bold text-primary">
          Switches
          <select
            className={selectClass}
            disabled={disabled || !hasKit}
            name="switch"
            onChange={(event) => setSwitchId(event.target.value)}
            required={hasKit}
            value={hasKit ? switchId : ""}
          >
            <option disabled value="">
              {hasKit ? "Select switches…" : "Choose a kit first"}
            </option>
            {switchOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.brand} — {option.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold text-primary">
          Keycaps
          <select
            className={selectClass}
            disabled={disabled || !hasKit}
            name="keycap"
            onChange={(event) => setKeycapId(event.target.value)}
            required={hasKit}
            value={hasKit ? keycapId : ""}
          >
            <option disabled value="">
              {hasKit ? "Select keycaps…" : "Choose a kit first"}
            </option>
            {keycapOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.brand} — {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-bold text-primary">
        Stabilizers
        <select
          className={selectClass}
          disabled={disabled || !hasKit}
          name="stabilizer"
          onChange={(event) => setStabilizerId(event.target.value)}
          required={hasKit}
          value={hasKit ? stabilizerId : ""}
        >
          <option disabled value="">
            {hasKit ? "Select stabilizers…" : "Choose a kit first"}
          </option>
          {(kit?.stabilizerOptions ?? []).map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
              {option.included ? " (included)" : ""}
            </option>
          ))}
        </select>
      </label>

      {!stabilizerCompatible ? (
        <p className="text-sm font-medium text-red-700">
          This kit doesn’t support that stabilizer. Pick one of the listed
          options.
        </p>
      ) : null}
    </fieldset>
  );
}
