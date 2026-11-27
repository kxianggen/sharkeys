"use client";

import { useState } from "react";

import { intentToPrompt } from "@/components/configurator/build-helpers";
import type { ApiErrorResponse } from "@/components/configurator/types";
import type { AiIntentApiResponse } from "@/lib/ai";
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/api/rate-limit";

// Phase 5: turn an uploaded inspiration photo (fused with any typed text) into
// a prompt the user can edit, then run through the normal recommendation flow.
export function usePhotoIntent({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (message: string) => void;
}) {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionNote, setVisionNote] = useState<string | null>(null);

  async function handleImageChange(dataUrl: string | null) {
    setImageDataUrl(dataUrl);
    setVisionNote(null);
    if (!dataUrl) return;

    setVisionLoading(true);
    try {
      const response = await fetch("/api/ai/vision-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          message: message.trim() || undefined,
        }),
      });

      if (isRateLimited(response)) {
        setVisionNote(RATE_LIMIT_MESSAGE);
        return;
      }

      const body = (await response.json()) as
        | AiIntentApiResponse
        | ApiErrorResponse;

      if (!response.ok || !body.success) {
        throw new Error(
          body.success ? "Image request failed." : body.error.message,
        );
      }

      setMessage(intentToPrompt(body.data.intent));
      setVisionNote(
        body.data.source === "openai"
          ? "Filled from your image — edit the prompt or press Start."
          : "OpenAI key is not configured, so the image could not be read. Type your request instead.",
      );
    } catch (caughtError) {
      setVisionNote(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not read the image.",
      );
    } finally {
      setVisionLoading(false);
    }
  }

  return { handleImageChange, imageDataUrl, visionLoading, visionNote };
}
