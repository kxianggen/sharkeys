"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { compressImageToDataUrl } from "@/lib/images/compress-image";

// Compression happens entirely in the browser — the original file bytes never
// leave the device. Defaults (JPEG @ 0.82, longest edge 1024) keep the base64
// payload small enough for the vision API (~4MB cap).
async function fileToCompressedDataUrl(file: File): Promise<string> {
  return compressImageToDataUrl(file);
}

type ImageDropProps = {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
};

export function ImageDrop({ value, onChange, disabled }: ImageDropProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined | null) => {
      setError(null);
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      try {
        onChange(await fileToCompressedDataUrl(file));
      } catch {
        setError("Could not read that image. Try a different file.");
      }
    },
    [onChange],
  );

  if (value) {
    return (
      <div className="relative inline-block">
        <Image
          alt="Uploaded inspiration"
          className="h-28 w-28 rounded-2xl border border-border object-cover"
          height={112}
          src={value}
          unoptimized
          width={112}
        />
        <button
          aria-label="Remove image"
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
          disabled={disabled}
          onClick={() => onChange(null)}
          type="button"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        className={`flex h-28 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-sm font-bold transition ${
          dragOver
            ? "border-accent bg-accent-subtle text-primary"
            : "border-border bg-white text-secondary hover:border-accent hover:text-primary"
        } disabled:cursor-not-allowed disabled:opacity-60`}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragLeave={() => setDragOver(false)}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!disabled) void handleFile(e.dataTransfer.files?.[0]);
        }}
        type="button"
      >
        <ImagePlus className="h-6 w-6" aria-hidden />
        Drag an inspiration photo here, or click to upload
      </button>
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
