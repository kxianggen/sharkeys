"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

// Bound the longest edge and re-encode as JPEG so the base64 payload stays
// small (the API rejects images over ~4MB). Compression happens entirely in the
// browser — the original file bytes never leave the device.
const MAX_DIMENSION = 1024;
const OUTPUT_MIME = "image/jpeg";
const OUTPUT_QUALITY = 0.82;

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return canvas.toDataURL(OUTPUT_MIME, OUTPUT_QUALITY);
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
          className="h-28 w-28 rounded-2xl border border-[#c2c7cf] object-cover"
          height={112}
          src={value}
          unoptimized
          width={112}
        />
        <button
          aria-label="Remove image"
          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#093C5D] text-white shadow-sm transition hover:bg-[#00263e] disabled:opacity-60"
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
            ? "border-[#093C5D] bg-[#e8f7fb] text-[#093C5D]"
            : "border-[#c2c7cf] bg-white text-[#42474e] hover:border-[#093C5D] hover:text-[#093C5D]"
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
