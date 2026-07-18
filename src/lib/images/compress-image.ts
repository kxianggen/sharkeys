// Shared client-side image compression. Bounds the longest edge and re-encodes
// the pixels through a <canvas>, so the base64/blob payload that leaves the
// browser stays small. The original file bytes never leave the device.
//
// Defaults reproduce the original vision/inspiration-photo behaviour exactly
// (JPEG @ 0.82, longest edge 1024). Callers that need a different codec — e.g.
// community post images, which upload WebP — pass `mimeType`/`quality`.

export type CompressImageOptions = {
  maxDimension?: number;
  mimeType?: string;
  quality?: number;
};

const DEFAULT_MAX_DIMENSION = 1024;
const DEFAULT_MIME_TYPE = "image/jpeg";
const DEFAULT_QUALITY = 0.82;

async function drawScaledToCanvas(
  file: File,
  maxDimension: number,
): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  return canvas;
}

/**
 * Compresses an image file to a data URL. Defaults to JPEG @ 0.82 (the
 * vision-upload contract); pass `mimeType: "image/webp"` for community images.
 */
export async function compressImageToDataUrl(
  file: File,
  options: CompressImageOptions = {},
): Promise<string> {
  const {
    maxDimension = DEFAULT_MAX_DIMENSION,
    mimeType = DEFAULT_MIME_TYPE,
    quality = DEFAULT_QUALITY,
  } = options;

  const canvas = await drawScaledToCanvas(file, maxDimension);
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Approximate byte size of a `data:` URL's payload without decoding it — base64
 * carries 4 characters per 3 bytes. Used for a client-side size sanity check
 * before upload.
 */
export function estimateDataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) return 0;
  const base64 = dataUrl.slice(commaIndex + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}
