"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import {
  compressImageToDataUrl,
  estimateDataUrlBytes,
} from "@/lib/images/compress-image";

// Community post images upload as WebP. Kept comfortably under the 2MB bucket
// limit as defence-in-depth — a 1024px WebP is normally well under this.
const OUTPUT_MIME = "image/webp";
const OUTPUT_QUALITY = 0.8;
const MAX_UPLOAD_BYTES = 1_500_000;

type BuildImageUploadProps = {
  // Field name for the hidden input carrying the compressed WebP data URL into
  // the form submission. The server action reads this and uploads to Storage.
  name: string;
  disabled?: boolean;
};

export function BuildImageUpload({ name, disabled }: BuildImageUploadProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | undefined | null) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      const compressed = await compressImageToDataUrl(file, {
        mimeType: OUTPUT_MIME,
        quality: OUTPUT_QUALITY,
      });

      if (estimateDataUrlBytes(compressed) > MAX_UPLOAD_BYTES) {
        setError("That image is too large even after compression. Try another.");
        return;
      }

      setDataUrl(compressed);
    } catch {
      setError("Could not read that image. Try a different file.");
    }
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-bold text-primary">
        Add a photo of your build{" "}
        <span className="font-medium text-secondary">(optional)</span>
      </span>

      {dataUrl ? (
        <div className="relative inline-block w-fit">
          <Image
            alt="Your build photo"
            className="h-32 w-32 rounded-2xl border border-border object-cover"
            height={128}
            src={dataUrl}
            unoptimized
            width={128}
          />
          <button
            aria-label="Remove photo"
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
            disabled={disabled}
            onClick={() => {
              setDataUrl(null);
              setError(null);
            }}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          className={`flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 text-sm font-bold transition ${
            dragOver
              ? "border-accent bg-accent-subtle text-primary"
              : "border-border bg-white text-secondary hover:border-accent hover:text-primary"
          } disabled:cursor-not-allowed disabled:opacity-60`}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragLeave={() => setDragOver(false)}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            if (!disabled) void handleFile(event.dataTransfer.files?.[0]);
          }}
          type="button"
        >
          <ImagePlus className="h-6 w-6" aria-hidden />
          Drag a photo here, or click to upload
        </button>
      )}

      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />

      {/* Carries the compressed WebP into the form submission (empty when no
          photo is chosen, so the post falls back to the kit hero image). */}
      <input name={name} type="hidden" value={dataUrl ?? ""} />

      <p className="text-xs text-secondary">
        No photo? Your post uses the kit’s hero image.
      </p>

      {error ? (
        <p className="mt-1 text-sm font-medium text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
